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

- `runtimeVersion` policy is **`appVersion`** — the runtime version is the app
  `version` in `app.json` (`1.0.0`). An OTA update is only delivered to a build
  with the same runtime version, so **bumping `version` cuts existing installs
  off** until they install a new `.ipa`.
- The channel is baked into the binary via
  `app.json` → `updates.requestHeaders["expo-channel-name"] = "preview"` (the
  GitHub Actions build has no EAS step to set it, so it's set in config).
  `eas.json` profiles also set `channel` for EAS-built binaries.
- Channel **`preview`** ↔ branch **`preview`**.

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
- changing native `app.json` config (icons, permissions, bundle id, `updates.url`)
- bumping the app `version` (moves the runtimeVersion)

In those cases, re-run the **Build unsigned iOS IPA** workflow (see `BUILDING.md`).

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
