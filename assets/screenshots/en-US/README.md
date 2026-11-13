# Store screenshots: 1.4.0

Six separate iPhone JPEGs at 1320 by 2868 pixels, six iPad JPEGs at 2064 by 2752 pixels, and six Google Play phone JPEGs at 1440 by 2560 pixels (9:16). The native PNG captures and the native-picker proof are kept in `originals/`. `manifest.json` records SHA-256 hashes, the source commit and the capture environment. These marketing files are not declared in the app bundle.

## Brand label

On 2026-11-13 the small label above each headline changed from "Golden Moments" to "Creative Activities" with `scripts/relabel_store_frames.py --font <Roboto-Medium.ttf>`. Only the label changed. Frame 4's "Picture 1 of 2" is correct: 1.10.0 drops the count only for the included drawings, and family photos keep it.

## Current captures

The iPhone and iPad captures were retaken on 2026-11-13 from `a53cc0e`, the 1.10.0 source with the Creative Activities palette (ink, canvas, sage, sun) and Atkinson Hyperlegible Next type. The Google Play frames in `android/` were retaken the same day from the same source on a Pixel 7 emulator (Android 16). Both iOS sets were taken on the iPhone 17 Pro Max and iPad Pro 13-inch (M5) simulators running iOS 26.5, with `scripts/capture_store_screens.sh`. The iPad status bar shows the capture date next to 9:41. That script runs `integration_test/store_screens_test.dart`, which drives the real app to each frame and pauses while the screen is saved.

- **Status bar:** cleared, then set to 9:41 with `xcrun simctl status_bar`. Clearing first matters: a stale override once left a charging battery and "no service" dots.
- **Debug banner:** hidden for capture only; a release build never shows it.
- **Demo photos:** the two photos went through the app's own normalize-and-store import steps. `originals/iphone/native-picker.png` (from `fce00d7`) and `originals/ipad/native-picker.png` (build 6) show the same demo photos chosen in the real system picker.
- **Before using a frame:** check each one for a passing system state. One iPhone capture caught the Dynamic Island, so that set was taken again.

## Composition

`scripts/compose_store_screens.py` places each unchanged capture inside the approved build 6 frame: the generated paper backdrop, headline, supporting text and device bezel. The capture is clipped to the bezel's rounded screen. The frame geometry was checked by re-composing the build 6 captures, which reproduced the published frames to within JPEG noise. Built-in image generation created only the backdrop and two demo photos; see `PROMPTS.md`. No private photos or identifiable people are used.

## Google Play frames

`android/` holds the six Google Play phone frames, with the same headlines and supporting text as the App Store set. They were captured on a Pixel 7 emulator (Android 16) with `scripts/capture_play_screens.sh`, which runs the same `integration_test/store_screens_test.dart` and saves each screen with `adb exec-out screencap`. The status bar is set to 9:41 with System UI demo mode.

`scripts/compose_play_screens.py --fonts <dir>` builds each frame from the generated paper backdrop, Roboto type (the app no longer ships it; Flutter's `bin/cache/artifacts/material_fonts` has it) and a plain dark bezel, then places the unchanged capture inside it. The App Store frames are 2.17:1, longer than Google Play's 2:1 limit, and show an iPhone, so they are not reused for Play. The native captures are in `originals/android/`.

These frames show the 1.10.0 source. Android 1.10.0 (14) was sent for Play production review on 2026-11-13 with the previous frames; replacing them in the listing is a separate, approved upload.

## What each frame shows

1. The four-tile starter.
2. Matching with the two imported demo photos.
3. A found pair, with no timer or score.
4. Looking at a demo photo together.
5. The comfort sheet with its equal-width 4/6/8/12 choices.
6. The included picture library: sharp covers mounted like album prints, with tile counts and Play on each pack.

All 12 were visually inspected after composition, including the bezel corners. The car pack now shows a car on its cover and is named *Cars and Trucks* (it was *Classic Cars* with a light-bulb cover).

## Limits

Native capture is simulator evidence. It does not establish physical-device accessibility, previous-release data migration, airplane-mode behavior, caregiver comprehension or redistribution rights for inherited app artwork. Those gates remain open, and public release is manual. Before submission, recapture from the final signed build if the UI has changed since `fce00d7`.
