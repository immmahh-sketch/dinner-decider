# Building the IPA and sideloading with Signulous

Already done for you: EAS project `@immmahh/dinner-decider`
(`50d4ca4e-d7a9-416f-ad37-192110bd393d`), EAS Update configured, `eas` CLI
logged in as `immmahh`.

## The one thing that still needs you: an Apple identity

**EAS cannot produce any iOS `.ipa` — signed or unsigned — without an
Apple-issued provisioning profile.** That profile is tied to an Apple account,
and creating it means signing in to Apple with your Apple ID **password + 2FA**,
which only you can do. There is no fully credential-free path (the
`unsigned-ipa` profile's build is blocked by the EAS CLI before it can run —
see the bottom of this file).

You have two ways in. Signulous re-signs whatever you give it with its own
long-lived certificate, so a short-lived signature from either route is fine.

### Route A — free Apple ID (no $99)

A free Apple ID has a "Personal Team" that can issue **development**
provisioning profiles for registered devices.

```bash
# 1. register your iPhone with EAS (opens a page / QR to install a UDID profile)
eas device:create

# 2. build a development-signed device .ipa (interactive: it asks for your Apple ID)
eas build --platform ios --profile device
```

At the Apple prompt, sign in with your normal Apple ID. EAS creates the
Personal-Team development cert + profile automatically. Output is a real
`.ipa`, valid ~7 days on its own — irrelevant once Signulous re-signs it.

Limitation: the device must be registered before the build, and each rebuild
must include that device.

### Route B — Apple Developer Program ($99/yr)

Everything gets easier. After adding the account to EAS once:

```bash
eas build --platform ios --profile preview
```

`preview` is `distribution: internal` (ad-hoc). EAS manages the cert + profile.
No device pre-registration hassle, no 7-day limit even before Signulous.

## Then: get it onto the phone

The CLI prints a build URL and, when done, a link to the `.ipa`
(`expo.dev` → project → Builds → the artifact). To pull it onto the iPhone:

- open the build's `.ipa` link directly in Safari on the iPhone → **Download** →
  it lands in Files, **or**
- drop the file into the `dist-share/` folder next to this repo and open
  `http://192.168.0.198:8000/` on the iPhone (while that server is running).

Then in Signulous: **Sign Your Own App** → upload the `.ipa` → it re-signs with
your Signulous certificate and gives you an install link. Open that in Safari and
install.

## After the first install: OTA, no rebuild

```bash
eas update --branch preview --message "..."
```

JS / screens / questions / dish data all update over the air. See `OTA.md`.
Only native changes (new native lib, SDK bump, `app.json` native config) need a
fresh `.ipa` from Route A or B.

## Bumping the version

- `app.json` → `expo.version` + `expo.ios.buildNumber`, or use the `production`
  profile (`autoIncrement: true`).

---

## Appendix: why the `unsigned-ipa` profile doesn't run

`.eas/build/unsigned-ipa.yml` is a valid custom build workflow that archives with
`CODE_SIGNING_ALLOWED=NO` and repackages the `.app` into an `.ipa` — no Apple
account needed **at build time**. But `eas build` resolves iOS credentials
*before* dispatching the job, and in non-interactive mode fails with
"couldn't find any credentials suitable for internal distribution";
`credentialsSource: local` then demands a real `credentials.json` +
`.mobileprovision` (Apple-signed, can't be fabricated). If Expo ever adds a
"no credentials" flag for custom iOS builds, this profile is ready to use.
