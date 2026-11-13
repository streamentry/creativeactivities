# Creative Activities Together: new store apps, 1.10.0 build 14 (testing only)

**State (2026-11-13):** build 14 is in TestFlight and rolled out on the Play internal
track. Both store listings are filled in. Nothing is submitted for public review. The
privacy, data-safety, content-rating and other policy declarations are not done.

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
- Uploaded through the Android Publisher API; a draft release exists on the internal track.
  It has not been rolled out.

## Store listings (2026-11-13, through the APIs, read back)

- **App Store:** version renamed 1.0 to 1.10.0, build 14 attached, release type
  MANUAL, copyright `Hong Le 2026 - All rights reserved`. 46 localizations from
  `metadata/app-store.en-US.json` and `metadata/i18n/*.json` (name, subtitle,
  keywords, promotional text, description, marketing/support/privacy URLs).
  Categories Health & Fitness and Lifestyle, content rights "no third-party
  content", price free (USA base). Review notes and contact copied from Golden
  Moments 1.10.0 with the name changed. Six iPhone 6.9" and six iPad 13"
  screenshots on en-US, all `COMPLETE`.
- **Age rating:** answers copied from Golden Moments, giving 17+. Those answers say
  `advertising: true` and `unrestrictedWebAccess: true`. The app has no ad SDK, so
  the advertising answer looks stale and should be confirmed.
- **Google Play:** 43 listings from the same files, contact website and email,
  512 px icon (the shipped app icon), new feature graphic
  (`scripts/compose_feature_graphic.py`) and six phone screenshots. The internal
  track uses the account's "testers" email list (as Golden Moments does), and release
  1.10.0 (14) is `completed`.
- **Screenshots:** the "Golden Moments" label above each headline is now "Creative
  Activities" (`scripts/relabel_store_frames.py`). Frame 4 still shows "Picture 1 of
  2", which 1.10.0 no longer displays.

## Open items

- App Store: App Privacy answers, territory availability (the v2 availability API
  rejected the territory list; set it in the web UI). Slovenian (`sl`) is mapped in
  `scripts/store_locales.py` but is not a valid App Store locale.
- Google Play: the 10 App content declarations (privacy policy, ads, sign-in, content
  rating, target audience, data safety, advertising ID, government, financial, health)
  and store settings (category, contact details in the console).
- The app icon is still the gold "G".
- Payment method for the Apple membership renewal is not on file.
- Public submission needs explicit approval.
