# Creative Activities Together: new store apps, 1.10.0 build 14

**State (2026-11-13):** Android 1.10.0 (14) is sent to Google for production review
(maintainer approval: "submit for review"). iOS is not submitted: App Privacy and
territory availability are still unset because the App Store Connect web sign-in
failed in the agent browser.

## Identity

- iOS bundle `com.mindfulness.creativeactivities` (underscores are not allowed on Apple),
  App Store Connect app id `6834212782`, team `UHZE77G3Z7` in the project file.
- Android package `com.mindfulness.creative_activities` (flavor `production`).
- Built from commit `3e74a73` on `main`. The old Golden Moments listings are unchanged.

## iOS

- Archived with a manual App Store profile created through the App Store Connect API
  (all distribution certificates), exported, uploaded with `altool`. Build 14 is `VALID`.
- TestFlight: group "Internal" (`599d1660-edf2-4c97-994a-d9be013b96d1`), tester is the
  Account Holder, status Invited.

## Android

- `build/app/outputs/bundle/productionRelease/app-production-release.aab`, version code 14,
  signed with the existing upload key (Play App Signing).
- Uploaded through the Android Publisher API; rolled out on the internal track, and the
  same build is in the production release sent for review (below).

## Store listings (2026-11-13, through the APIs, read back)

- **App Store:** version renamed 1.0 to 1.10.0, build 14 attached, release type
  MANUAL, copyright `Hong Le 2026 - All rights reserved`. 46 localizations from
  `metadata/app-store.en-US.json` and `metadata/i18n/*.json` (name, subtitle,
  keywords, promotional text, description, marketing/support/privacy URLs).
  Categories Health & Fitness and Lifestyle, content rights "no third-party
  content", price free (USA base). Review notes and contact copied from Golden
  Moments 1.10.0 with the name changed. Six iPhone 6.9" and six iPad 13"
  screenshots on en-US, all `COMPLETE`.
- **Age rating:** started from the Golden Moments answers (17+), then set
  `advertising` and `unrestrictedWebAccess` to false: `pubspec.yaml` has no ad SDK, and
  `url_launcher` only opens fixed help and privacy pages in the external browser. The
  rating is now 4+.
- **Google Play:** 43 listings from the same files, contact website and email,
  512 px icon (the shipped app icon), new feature graphic
  (`scripts/compose_feature_graphic.py`) and six phone screenshots. The internal
  track uses the account's "testers" email list (as Golden Moments does), and release
  1.10.0 (14) is `completed`.
- **Screenshots:** the "Golden Moments" label above each headline is now "Creative
  Activities" (`scripts/relabel_store_frames.py`). Frame 4 still shows "Picture 1 of
  2", which 1.10.0 no longer displays.

## Google Play declarations and production review (2026-11-13, console, read back)

- Privacy policy `https://dementiaactivities.games/app-privacy/`; no ads; no restricted
  access; advertising ID not used (the production bundle manifest has no `AD_ID`);
  not a government app; no financial features.
- Target audience 18 and over. Data safety: no data collected or shared.
- Store settings: App, Health & Fitness (as Golden Moments). In that category Play
  requires a health feature, so the health declaration is "Other": "None. Recreational
  crafts and photo games ... No health tracking, diagnosis, treatment or medical
  features." Golden Moments declares "Stress management"; that was not copied because
  it implies a health purpose.
- Content rating (IARC, all other app types, contact `web@dementiaactivities.games`):
  online content Yes (downloadable picture library), every other answer No. Result:
  ESRB Everyone, PEGI 3, USK all ages, IARC 3+.
- Production release 1.10.0 (14), Golden Moments' 43 release notes, 178 countries /
  regions (same count as Golden Moments). Sent with "Submit 53 changes for review";
  quick checks were running at the time of writing.

## Android build 16 with creativeactivities.org links (2026-11-14, API, read back)

- Built from `main` efdb6d9 (1.10.0+16, #36 links) plus #38, which removes the stale
  `res/values/ic_launcher_background.xml`; without it `bundleProductionRelease` fails with
  "Duplicate resources" against the new logo's `colors.xml`.
- AAB signed with the registered upload certificate (SHA-256 `B5:3D:…:F7:2F`),
  versionCode 16, `com.mindfulness.creative_activities`; the compiled Dart code has 28
  `creativeactivities.org` and 0 `dementiaactivities.games` strings. AAB SHA-256
  `33b339dadaf47fcd613cc503d4fba968bc26148e4b156736d397b2ee0f6d90b3`.
- Play edit committed (`14706048092173215954`): production release 1.10.0 (16), status
  `completed`, the same 43 release notes as 1.10.0 (14); contact website
  `https://creativeactivities.org/`, email `web@creativeactivities.org`. The 43 listings
  had no old-domain text. Committing sends the changes for review; the Publishing
  overview was not checked in the browser.
- iOS build 16 (same tree) is handled separately, with the App Store URLs already
  switched.

## Open items

- App Store: App Privacy ("Data Not Collected"), territory availability (the v2
  availability API rejected the territory list; set it in the web UI), then submit
  version 1.10.0. Slovenian (`sl`) is mapped in `scripts/store_locales.py` but is not a
  valid App Store locale.
- Screenshot frame 4 still shows "Picture 1 of 2", which 1.10.0 no longer displays.
- The app icon is still the gold "G".
- Payment method for the Apple membership renewal is not on file.
