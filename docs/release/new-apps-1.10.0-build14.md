# Creative Activities Together: new store apps, 1.10.0 build 14 (testing only)

**State (2026-11-13):** apps created and build 14 uploaded to both stores for internal
testing. Nothing is submitted for public review. Store listings, screenshots, privacy
and content-rating forms are not done. Read both stores back before saying more.

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

## Open items

- Store listings, screenshots, privacy and data-safety answers, content ratings.
- Add Play internal testers and roll out the draft.
- Payment method for the Apple membership renewal is not on file.
- Public submission needs explicit approval.
