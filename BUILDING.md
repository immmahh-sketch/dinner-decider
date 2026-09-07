# Building the IPA and sideloading with Signulous

The default path builds an **unsigned `.ipa` on GitHub Actions** — a hosted
macOS runner runs `expo prebuild` + `xcodebuild` with code signing turned off.
No Apple account, no Mac. Signulous re-signs it with its own certificate.

## Build it

1. GitHub → the repo → **Actions** tab → **Build unsigned iOS IPA** → **Run workflow**
   (`main`/`master`). Or push a tag: `git tag build-1 && git push origin build-1`.
2. ~15–25 min on a `macos-15` runner.
3. When it's green, the `.ipa` is in two places:
   - **Releases** → tag **`ipa`** → asset `DinnerDecider-unsigned.ipa`
     (direct download — best for Safari on the iPhone)
   - the run's **Artifacts** → `DinnerDecider-unsigned-ipa` (a zip containing the `.ipa`)

The workflow is `.github/workflows/ios-unsigned-ipa.yml`. It's **manual only** —
GitHub bills macOS minutes at 10×, so a private repo on the free plan gets
roughly 10–20 of these a month. Making the repo public removes that limit.

## Get it onto the phone → Signulous

- On the iPhone, open the **Releases → `ipa`** asset link in Safari (you'll need
  to be signed in to GitHub for a private repo) → **Download** → it lands in Files.
- Or download it on the PC, drop it in `dist-share/` next to this repo, and open
  `http://192.168.0.198:8000/` on the iPhone while that server runs.

Then in Signulous: **Sign Your Own App** → upload `DinnerDecider-unsigned.ipa` →
it re-signs and gives you an install link. Open that in Safari and install.

## After the first install: update over the air, no rebuild

```bash
npx eas-cli update --branch preview --message "new dishes / copy / screens"
```

The binary is pinned to the **`preview`** channel and
`runtimeVersion` = the app `version` (`1.0.0`). Any JS / screen / question /
dish-data change ships over the air on next launch. See `OTA.md`.

You need a new `.ipa` (re-run the workflow) only for **native** changes: adding a
native module, bumping the Expo SDK, or changing `app.json` native config
(icons, permissions, bundle id, the updates URL, **or the app `version`** — that
moves the runtimeVersion and cuts old installs off from new OTA updates).

## Alternatives (need an Apple identity, done interactively by you)

- **Free Apple ID:** `npx eas-cli device:create` then
  `npx eas-cli build -p ios --profile device` → a dev-signed device `.ipa`.
- **Apple Developer Program ($99):** `npx eas-cli build -p ios --profile preview`
  → an ad-hoc `.ipa`, EAS manages the cert/profile.

Both still go through Signulous the same way. EAS project is already linked
(`@immmahh/dinner-decider`).

## If the GitHub build fails

- **Scheme not found / wrong** — check the "Resolve workspace + scheme" step log
  and, if needed, hard-code the scheme in the workflow's `xcodebuild` step.
- **CocoaPods errors** — usually a transient repo issue; re-run the job.
- **Hermes / bundle phase errors** — check the "Archive" step log; it runs the
  Metro bundle + Hermes compile, same as any RN release build.
