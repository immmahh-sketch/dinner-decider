# Over-the-air (OTA) updates

The app ships with **`expo-updates`** wired up, so after the first install you can
push new JavaScript, screens, questions and dish data to the phone **without
rebuilding the IPA or re-signing with Signulous**. Only changes to native code
(adding a native library, bumping the Expo SDK) need a fresh build.

## One-time setup (needs your Expo login)

```bash
eas login
eas init                 # creates the EAS project, writes the real projectId into app.json
eas update:configure     # writes the real updates.url (https://u.expo.dev/<projectId>)
```

`app.json` currently has placeholders:

```jsonc
"updates": { "url": "https://u.expo.dev/00000000-0000-0000-0000-000000000000" },
"extra": { "eas": { "projectId": "00000000-0000-0000-0000-000000000000" } }
```

`eas init` + `eas update:configure` replace both with your real values. Commit that change.

## How versions line up

- `runtimeVersion` policy is **`fingerprint`** — EAS hashes the native side of the
  app. An OTA update is only delivered to a build whose fingerprint matches.
- Build profiles map to update branches by **channel** (`eas.json`):
  - `unsigned-ipa` / `preview` build  → channel **`preview`** → branch **`preview`**
  - `production` build                → channel **`production`** → branch **`production`**

So the IPA you sideload from the `unsigned-ipa` profile listens on the `preview` branch.

## Publishing an update

After changing JS / data:

```bash
eas update --branch preview --message "New dishes + copy tweaks"
```

That's it. On the phone:

- `expo-updates` checks on every cold start (`checkAutomatically: "ON_LOAD"`),
  downloads in the background, and applies the update **on the next launch**.
- The app also eagerly fetches on start (`prefetchUpdate()` in `app/_layout.tsx`).
- **Settings → App updates** has a manual "Check for updates" button and, once an
  update is downloaded, a "Restart to update" button (`src/lib/updates.ts`).

## When you DO need a new IPA

- adding/removing a native module (e.g. turning on `react-native-google-mobile-ads`)
- upgrading the Expo SDK
- changing anything in `app.json` that affects native config (icons, permissions,
  bundle id, the `updates.url` itself)

In those cases the fingerprint changes, old installs stop receiving `preview`
updates until they install the new build, and you run
`eas build --platform ios --profile unsigned-ipa` again (see `BUILDING.md`).

## Rolling back a bad update

```bash
eas update:rollback --branch preview
# or republish a known-good commit:
git checkout <good-sha> -- . && eas update --branch preview --message "rollback"
```

## Testing updates before you have the IPA

OTA does not run in Expo Go (`Updates.isEnabled` is false there — the Settings
card says so). To test the update flow you need the installed build. Until then,
`npx expo start` + Expo Go is fine for iterating on everything else.
