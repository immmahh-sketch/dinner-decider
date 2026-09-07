# Building the IPA and sideloading with Signulous

You are on Windows with no Mac, and Signulous re-signs the app with its own
certificate — so the goal is an **unsigned `.ipa`** from EAS Build (Expo's cloud
build service, which runs on macOS for you).

## 0. One-time setup

```bash
npm i -g eas-cli
eas login                 # your existing Expo account
eas init                  # links this repo to an EAS project, writes the projectId into app.json
eas update:configure      # writes the real updates.url for OTA (see OTA.md)
```

Commit the `app.json` changes those two commands make (real `projectId` + `updates.url`).

## 1. Kick off the unsigned build

```bash
eas build --platform ios --profile unsigned-ipa
```

This uses `eas.json` → `unsigned-ipa`, which points at the custom workflow in
`.eas/build/unsigned-ipa.yml`. That workflow runs `expo prebuild`, archives with
`CODE_SIGNING_ALLOWED=NO`, repackages the `.app` into `DinnerDecider-unsigned.ipa`
and uploads it as the build artifact.

- If EAS asks about iOS credentials, choose **"skip"** / do not set any — the
  workflow does not use them.
- If the `xcodebuild` archive step fails on the scheme name, open the build logs,
  find the real scheme (look for `-scheme` candidates), and edit `SCHEME=` at the
  top of the two `command:` blocks in `.eas/build/unsigned-ipa.yml`, then re-run.

When it finishes, download the `.ipa` from the build page (`expo.dev` → your
project → Builds), or with `eas build:list` / the link the CLI prints.

## 2. Re-sign and install with Signulous

1. Sign in to your Signulous account.
2. Use **"Sign Your Own App"** / upload IPA, and upload `DinnerDecider-unsigned.ipa`.
3. Signulous re-signs it with your Signulous certificate and gives you an install
   link / adds it to your Signulous app catalogue.
4. On the iPhone, open that link in Safari and install. Because Signulous manages
   the provisioning profile, no 7-day re-sign dance is needed.

## Fallbacks if the unsigned build won't cooperate

- **Free Apple ID**: `eas build -p ios --profile development` can produce a
  simulator build only (no device). Not useful for Signulous.
- **Apple Developer Program ($99/yr)**: then `eas build -p ios --profile preview`
  with `distribution: internal` produces a normal ad-hoc signed `.ipa` that
  Signulous can still re-sign, and the build "just works" with no custom workflow.
- **`eas build --local`**: only on macOS.

## Bumping the version for a new build

- `app.json` → `expo.version` (marketing string) and `expo.ios.buildNumber`.
- Or use the `production` profile which has `autoIncrement: true`.

## What still needs real values before a public release

- `app.json` → `ios.bundleIdentifier` is `com.dinnerdecider.app` — change if you
  want your own.
- App icon / splash: replace the files in `assets/` (they are the Expo defaults).
- See `MONETISATION.md` for AdMob IDs and the checkout link.
