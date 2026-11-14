# App features (APP-)

This file specifies what the Creative Activities app (Flutter, `lib/`) should do that the website cannot: offline activity cards, printing, plans kept on the device, helper and care-setting use, and gentle play with the user's own photos. The app is a bridge, not a second destination. Every item that opens an activity also offers the website guide or a printable card, and the website must stay complete without the app. Items that would keep people inside the app, or that add a feed, streak, account or reminder pressure, are out of scope.

Status and existing behavior come from the [senior-first feature catalog](../senior-first/feature-catalog.json) and [baseline](../senior-first/baseline.md). Items that touch current product limits are marked **approval** and are not scheduled until the maintainer approves them in [product](../product.md) terms. Specifying an item does not approve it.

**Read with:** [README](README.md) · [games](05-games.md) · [website features](03-features-web.md) · [product contract](../product.md) · [senior-first activities](../senior-first/activities.md) · [DESIGN](../../../DESIGN.md) sections 6, 8 and 9 · [MISSION](../../../MISSION.md) · [VISION](../../../VISION.md)

## Phase and priority conventions

- **Phase**: the catalog's `R0` maps to `S1` (harden the existing promise), `R1` and `R2` map to `S2` (prove repeat use, run experiments), and `R3` maps to `S3` (deferred, needs approval). `S4` is reserved for items that need a separate product decision.
- **Priority**: `P0` must ship for the app to be credible. `P1` is needed to lead. Full item blocks are given for `P0` and `P1` items.
- **Approval**: the item cannot be built until the maintainer approves it. Current product limits include no AI processing, no custom backend, no account service, no cloud sync, no album watcher, no remote family roles, no clinical monitoring, and no payments (see [product](../product.md), "Boundaries and expansion").

## Build on: existing and proposed GM features

| GM ID | Feature | Catalog state | Used by |
|---|---|---|---|
| GM-006 | Visible-picture matching | source_present | APP-018, APP-034; [games](05-games.md) GAME-013 |
| GM-007 | Optional hidden-picture matching | source_present | APP-018; GAME-014 |
| GM-008 | Shared picture viewing and optional prompts | partial | APP-006, APP-008 |
| GM-018 | Bounded selected-photo import | source_present | APP-017; GAME-058 |
| GM-019, GM-020 | Photo descriptions; favorites and hiding | proposed | APP-004, APP-017 |
| GM-023 | Fully included offline catalog | source_present | APP-001, APP-026 |
| GM-025 | Content rights and clarity register | proposed | APP-001, APP-031 |
| GM-002, GM-004 | Easy exit; safe session resume | partial, proposed | APP-006, APP-022 |
| GM-003 | Remembered comfort preferences | proposed | APP-003, APP-022 |
| GM-011 | Optional read-aloud of visible text | proposed, approval | APP-032 |
| GM-012 to GM-017 | Readable type, forgiving input, screen reader, contrast, layouts, system coexistence | partial | APP-018, APP-022, APP-028 |
| GM-027, GM-028, GM-030, GM-031 | Deletion, network boundary, recovery, offline help | partial | APP-004, APP-019, APP-014 |
| GM-029 | Measured startup and memory budgets | proposed | APP-001 |
| GM-034 | Voluntary feedback | proposed | APP-004 |
| GM-037 | Same-device companion setup | proposed | APP-006 |
| GM-038 | Optional neutral local reminders | deferred; maintainer approved opt-in, iOS first, on 2026-10-30 | APP-012 |
| GM-009, GM-010 | Tap-to-place puzzle; simple sorting | proposed experiments | APP-034; GAME-016, GAME-017 |
| GM-021, GM-022 | Multiple albums; portable photo-pack exchange | deferred, approval | APP-016 (not used) |
| GM-036 | Localization infrastructure | proposed, approved for extraction | APP-025 |
| GM-039 | Comparative usability and preference pilot | proposed | APP-034 |

## Items

### APP-014 · App-to-website handoff: every activity links to its full guide

Priority P0 · Phase S2 · Status new · Pillars: all

Why: The app must send people back to real activities. A link to the full guide and printable card keeps the website useful on its own ([MISSION](../../../MISSION.md), "get people off the app"; [VISION](../../../VISION.md), "app bridges").

What: Each activity in the app has one "Full guide and printable card" action. It opens the canonical HTTPS page in the system browser. When offline, it shows the URL and a QR code rendered on device.

Acceptance:
- The action opens the system browser, never an in-app web view that could collect data.
- The launched URL carries no tracking parameters, device IDs or saved content.
- Offline, the screen shows the URL and QR code without a spinner loop.
- The website page for the same activity works with no app installed.
- Reachable by VoiceOver and TalkBack; target size meets 48 units.

Depends on: GM-028, GM-031, APP-001.

Risks / not doing: No interstitial asking people to install the app on web pages. No install banner on activity pages. See [DESIGN](../../../DESIGN.md) section 9.

### APP-018 · Screen-reader-first activity reading

Priority P0 · Phase S2 · Status partial · Pillars: all

Why: Accessibility defects damage trust, and the product promise is accessible by default ([MISSION](../../../MISSION.md), "accessible by default"; [R5 §5.4] on WCAG 2.2 AA).

What: Cards and picture games expose a logical reading order: title, time, materials, then steps one at a time with Previous and Next controls, then variations. Pictures carry card-specific alt text. Hidden tiles expose no names, captions or identifiers ([GM-007](../senior-first/activities.md)).

Acceptance:
- VoiceOver and TalkBack complete a full card (open, read steps, exit) with no unlabeled controls. Results are recorded per OS and device.
- Hidden matching tiles reveal no identifiers through any accessibility tree.
- Focus returns to the triggering control after leaving a screen.
- At 200% system text size, no step text is clipped.
- Widget tests alone do not close this item.

Depends on: GM-012, GM-014, GM-016, APP-001.

Risks / not doing: Device testing is the gate. Do not claim screen-reader support for a configuration that has not been tested.

### APP-019 · First run asks for nothing

Priority P0 · Phase S2 · Status new · Pillars: all

Why: A person caring for someone should reach an activity within a minute without a setup step, and the product forbids pop-ups before the first activity ([DESIGN](../../../DESIGN.md) section 9; [product](../product.md), "Existing core promises" G1).

What: First launch opens a playable picture activity or today's card. There is no sign-in, notification prompt, photo-library prompt, rating prompt or account step. A permission is requested only when the user taps the feature that needs it, and "not now" keeps every included activity working.

Acceptance:
- On a clean install, zero OS permission prompts appear before the first activity starts.
- No store rating prompt appears until at least one activity has been finished and the user opens the rating control.
- Each permission request names the feature that needs it and has a working "not now" path.
- Denying every permission leaves all included activities playable offline.

Depends on: GM-001, GM-023, GM-027.

Risks / not doing: Reminders stay opt-in (APP-012) and are never requested at launch. Photo import uses the system picker only ([personal photos](../senior-first/personal-photos.md)).

### APP-001 · Offline activity cards (bundled subset)

Priority P1 · Phase S2 · Status new · Pillars: MAKE, CARE, GROW, CALM

Why: The activity card is the product's unit ([DESIGN](../../../DESIGN.md) section 8). Offline cards are the clearest reason for the app to exist beside the website ([VISION](../../../VISION.md), "app bridges"; [R2 §5] on the printable card as the offline path).

What: Bundle a fixed set of the 38 English activity cards: text, steps, variations, safety, stop note and materials. Include images only where rights are cleared (GM-025). Each card shows its content version and reviewer status. Other languages are not bundled until reviewed (APP-025).

Acceptance:
- Every bundled card opens in airplane mode, with text identical to the website at the same content version.
- A build check fails if app and website content hashes differ for a shipped card.
- Measured content size fits the GM-029 budget on the lowest supported device.
- Every card with materials has a safety line and a stop note.

Depends on: GM-023, GM-025, GM-029.

Risks / not doing: Duplicated content drifts. Use one content source for both app and site. Do not bundle unreviewed translations.

### APP-002 · Print an activity card or pack from the app

Priority P1 · Phase S2 · Status new · Pillars: MAKE, CARE, GROW

Why: Print-first delivery is the strongest distinction from other apps ([R3 §3 #3]). The app should print as well as the website does.

What: Each card and each pack has a Print action that uses the system print dialog. The layout matches the website printable template ([DESIGN](../../../DESIGN.md) section 4, template C). The QR code encodes only the canonical URL. No cloud print or upload.

Acceptance:
- Print preview works offline. Printing is verified on at least one AirPrint and one Mopria printer; anything not verified is labeled as such.
- Output at 100% scale is black text on white with no required background fill.
- The QR code decodes to the canonical URL with no parameters.
- Print data passes only through the operating-system print pipeline.

Depends on: APP-001, APP-014.

Risks / not doing: No printer accounts or print-service integrations.

### APP-003 · Personal activity plan on the device

Priority P1 · Phase S2 · Status new · Pillars: all, TOGETHER

Why: A free weekly plan of three to five activities is a proven low-commitment entry point ([R2 §3 #4]). The core job is "one visit, twenty minutes" ([MISSION](../../../MISSION.md), problem statement).

What: A person saves a plan of three to five activities with a title such as "Sunday with Dad". Plans are stored on the device, have no dates or reminders by default, can be edited or deleted, and print on one page (APP-002). Plans do not require an account and record no health information.

Acceptance:
- Create, edit and delete take no more than three taps from home. Deletion survives a restart.
- A plan holds at most five activities. Items are activity IDs; the only free text is the title and an optional note.
- A plan prints on one page with activity names and materials.
- No reminders, streaks or "missed plan" messages.

Depends on: APP-001, APP-002, GM-003, GM-027.

Risks / not doing: Do not build a calendar. A plan is a short list.

### APP-004 · On-device "We tried this" list

Priority P1 · Phase S2 · Status new · Pillars: all

Why: Confirmed starts are the north-star proxy, and the person, not the app, records them ([README](README.md), "Definition of #1"; [R4 §3 #3] on collections over streaks).

What: A person marks an activity "We tried this", can add a favorite or a "Not for us" note, and sees a calm count such as "12 activities tried, 3 favorites". Entries never reset, expire or show a missed day. The list stays on the device and can be cleared with the data-deletion control (GM-027). Nothing is uploaded.

Acceptance:
- Marking and unmarking take one tap, and the list can be edited from one screen.
- No streak, daily goal, comparison or notification exists anywhere in this feature.
- "Delete all" and app uninstall remove the list. Restart keeps it.
- Count wording uses locale plural rules before any language other than English ships.

Depends on: GM-027, GM-020, GM-034.

Risks / not doing: The number must never become a target people feel they miss. See the game rules in [games](05-games.md#game-design-rules).

### APP-005 · Offline finder with the website filters

Priority P1 · Phase S2 · Status new · Pillars: all

Why: "Fit the moment, not the demographic" is the product's second difference ([MISSION](../../../MISSION.md), "What makes us different").

What: The finder offers the same filters as the website: time, materials, sitting or standing, senses and calmer, without words, help level, one-to-one or group, and mess. It runs entirely on the device. It has no diagnosis, age or stage field. Results say why each one fits, and zero results offers a "widen the search" action instead of a dead end.

Acceptance:
- For the same filter set, results match the website finder, checked with a shared fixture.
- The finder works in airplane mode and makes no network call.
- No diagnosis, condition, age or stage input appears anywhere in the flow.
- Every result lists the filters it matched.

Depends on: APP-001, GM-024.

Risks / not doing: Do not add an opaque "match score" ([DESIGN](../../../DESIGN.md) section 3).

### APP-006 · Helper mode on one device

Priority P1 · Phase S2 · Status new · Pillars: CARE, GROW, TOGETHER

Why: Most sessions are one adult with one person on one device. The helper needs step-by-step guidance without the screen pulling attention from the person ([R3 §3 #5] on "do it alongside someone").

What: Helper mode is a same-device view for the helper: steps and suggested words in large type, a Next step control, and a Pause control. The participant's view shows only the activity or picture, with no helper controls. Turning helper mode off takes one tap and never resets a session or a board.

Acceptance:
- Switching helper mode does not reset the session or the board.
- The participant view contains no helper-only controls or notes in the accessibility tree.
- No second device, remote role, logging or data export is involved.
- Works one-handed, and with VoiceOver and TalkBack.

Depends on: APP-018, GM-002, GM-004, GM-037.

Risks / not doing: Not a monitoring dashboard. Product limits exclude remote family roles ([product](../product.md)).

### APP-013 · Website-to-app link for offline use

Priority P1 · Phase S2 · Status new · Pillars: all

Why: The app earns its place where offline value exists. The website should offer it quietly, never in its way ([VISION](../../../VISION.md), "a website must remain useful on its own").

What: On an activity page whose card is bundled in the app, a secondary link "Use offline in the app" appears beside the print action. It opens the store listing, or the installed app through a universal link. It is never a modal, banner or scroll interruption.

Acceptance:
- The link sits beside the print action, meets the 48-unit target, and is absent from the reading flow.
- The page passes the same accessibility checks with the link present or absent.
- Any campaign parameter is the store-attribution token approved in GM-032, and nothing else.
- Pages without a bundled card show no link.

Depends on: APP-001, GM-032.

Risks / not doing: No detection of installed apps and no prompt to install.

### APP-011 · Home-screen quick actions

Priority P1 · Phase S2 · Status new · Pillars: all

Why: Returning to a favorite activity is the repeat job, done without notification pressure ([VISION](../../../VISION.md), Stage 2 "without push-notification pressure").

What: Long-pressing the app icon offers up to three static actions: "Start a picture game", "Look together" and "Today's activity". Each opens its screen directly, offline.

Acceptance:
- Each action reaches its screen within two taps of launch, on a cold start.
- The icon shows no badge, count or dynamic content.
- Actions survive an update.
- If the target content is missing, the action opens the home screen without an error message.

Depends on: GM-001.

Risks / not doing: No dynamic shortcuts that show progress or missed days.

### APP-020 · Share an activity as text and a link

Priority P1 · Phase S2 · Status new · Pillars: all

Why: Useful sharing is a main distribution route ([VISION](../../../VISION.md), "distribution"). File sharing is deferred (GM-022), so this item shares text only.

What: The system share sheet can send an activity's title, short description, materials and canonical link as plain text. No images, files or identifiers are attached.

Acceptance:
- Only plain text and the canonical HTTPS link are shared.
- Share text includes plan or family names only when the person typed them.
- Sharing works offline, with no preview fetch.
- Cancelling is neutral, with no message.

Depends on: APP-001, GM-022 (not used).

Risks / not doing: No file or photo sharing without a separate approval.

### APP-025 · Language status and picker

Priority P1 · Phase S3 · Status partial · Pillars: all

Why: Machine-made app text exists for many languages but has not been reviewed ([WORKBOARD](../../../WORKBOARD.md), localization entries). People need to know what has been checked before they choose a language.

What: The language picker lists each language with its status: reviewed, or machine-made and not yet reviewed. English is always available. Activity cards appear in a language only where reviewed (APP-001). GM-036 covers extraction and does not establish any language claim.

Acceptance:
- Every picker entry shows its status label.
- Switching language keeps plans, the tried list and favorites.
- Right-to-left layout is verified on device before any RTL claim.
- The store listing names only languages whose review status allows it ([distribution](../senior-first/distribution.md), GM-036).

Depends on: GM-036, APP-001.

Risks / not doing: Do not use a machine translation to imply a reviewed language.

### APP-026 · Content changes only through app releases

Priority P1 · Phase S2 · Status partial · Pillars: all

Why: Hidden content changes and background fetches undermine trust and the no-backend boundary ([product](../product.md), "Boundaries and expansion").

What: Activity and picture content ship inside the app build. The app does not fetch content in the background. Each release states its content version, and the version appears in Settings.

Acceptance:
- A network trace from a fresh install and a week of normal use shows no content requests.
- The content version appears in Settings and the release notes.
- A release that changes content also updates the website version stamp.

Depends on: GM-023, GM-028.

Risks / not doing: No remote configuration service.

### APP-029 · Facilitator page for each card

Priority P1 · Phase S2 · Status new · Pillars: TOGETHER, CARE, GROW

Why: Care staff, teachers and group leaders need materials, safety and group variations in one place. "Every material list needs a safety line" ([R2 §7]).

What: Each card has a facilitator view: materials checklist, safety labels (scissors, small parts, heat, skin contact, allergens), a supervision line, group variations and stop signals. It reads well on a phone, a tablet and in print.

Acceptance:
- Every card with materials has a safety line. A card without one fails the content check.
- Group variations appear when the card has them.
- Stop-signal wording has a named reviewer before release. Pending review is shown on the card.

Depends on: APP-001, APP-002.

Risks / not doing: Not a training course and not clinical guidance.

### APP-030 · "I have this" materials checklist

Priority P1 · Phase S2 · Status new · Pillars: MAKE, GROW

Why: The promise is an activity that fits "what you have" ([MISSION](../../../MISSION.md), supporting promise).

What: On an activity, each material can be ticked "I have this" or "Need to get". Ticks are remembered on the device for that activity. When all items are ticked, the card says "You have everything you need". No shopping links and no product links.

Acceptance:
- Ticks survive a restart and are cleared by data deletion.
- The feature contains no product or affiliate links.
- Works with VoiceOver, TalkBack and one switch. Targets meet 48 units.

Depends on: APP-001.

Risks / not doing: Do not recommend purchases.

### APP-031 · Picture-only card view

Priority P1 · Phase S2 · Status new · Pillars: CARE, GROW, CALM

Why: Non-readers and people with low literacy need picture-led cards ([R2 §6 #5]).

What: A display option shows each activity as picture steps with short labels. Text stays available to screen readers. Icons are original or rights-cleared and carry alt text.

Acceptance:
- Every step has a picture and a short label. No step is icon-only for assistive technology.
- Turning the option on does not change the content version.
- Tested in usability sessions with non-readers before release ([validation](../senior-first/validation.md)).

Depends on: APP-001, GM-025.

Risks / not doing: Do not claim literacy support until tested.

### APP-034 · Experiment gates

Priority P1 · Phase S2 · Status new · Pillars: all

Why: Experimental modes must not reach people before a pilot selects them ([activities](../senior-first/activities.md), GM-009 and GM-010 "before promotion").

What: Each experimental mode (tap-to-place puzzle, sorting, read-aloud, reminders) is compiled in but off by default, behind a setting the maintainer controls. Each gate and its decision are recorded in the release record.

Acceptance:
- The default build shows no experimental entry point.
- Experiment flags are listed in one file and in the release record.
- A disabled experiment creates no storage keys and runs no background work.

Depends on: GM-039.

Risks / not doing: A flag is not a decision. Promotion needs the pilot evidence.

## Other items (P2 and P3)

| ID | Feature | Priority · Phase · Status | What it is, and its boundary | Approval and dependencies |
|---|---|---|---|---|
| APP-007 | Care-setting kiosk | P2 · S3 · new | Operating-system single-app mode (Guided Access, Assistive Access) holds the app on one activity. Exit is always available through the operating system. No caregiver PIN gate and no logging. | Approval (new use case). GM-017, GM-002 |
| APP-008 | Large-screen group session | P2 · S3 · new | Mirroring to a TV or large tablet by the operating system (AirPlay, Chromecast or screen mirroring). Group prompt cards, manual advance, no autoplay, no scores, no turn timers. Prompts off by default. | Approval. GM-008. Feeds GAME-051 |
| APP-009 | Apple Watch glance | P3 · S3 · new | Shows today's activity name and a Start action. No health sensors, no personal data on the face, no notifications. | Approval (native watch scope). APP-011 |
| APP-010 | Home-screen widget | P2 · S2 · new | Shows today's activity title and opens it. Local data only; changes only when the person changes it. No counts, no streaks. | APP-001 |
| APP-012 | Gentle reminders | P2 · S3 · partial | Opt-in per plan, off by default, neutral wording ("A picture game is ready when you are"), no streaks, iOS first. The maintainer approved opt-in reminders on 2026-10-30 ([GM-038](../senior-first/navigation.md)), but the catalog still defers the feature to R3. Baseline notes habits and reminders code already in `lib/`; reconcile before release. | Approval recorded. GM-003, GM-028 |
| APP-015 | Optional account sync for website saves | P3 · S4 · new | Sign in to sync saved activities between the website and the app. | Not approved. Conflicts with the current product contract (no account service, no cloud sync). Needs a product change, privacy review and deletion controls. |
| APP-016 | No-account device transfer | P2 · S3 · new | Move plans and the tried list to another device by QR code or a local file. Nothing is stored on a server. The code expires. | Approval (file exchange; GM-022 deferred). APP-003, APP-004 |
| APP-017 | Household profiles without health data | P2 · S3 · new | A nickname, favorites and plans for each person in the household. No age, diagnosis or condition field. No child accounts. | Approval. GM-020, GM-027 |
| APP-021 | Memory card image | P2 · S2 · new | Renders "We tried this: four pairs with Grandad" on the device, for the person to save or share. No photos unless added; no identifiers. Spoiler-free by design ([R4 §3 #2]). | APP-020 |
| APP-022 | Bedside mode | P2 · S2 · new | One large activity, a low-brightness theme, no sound by default, large controls within one-hand reach. | GM-015, GM-016 |
| APP-023 | Optional haptics | P2 · S2 · new | Off by default. Never the only feedback for any action. | GM-015 |
| APP-024 | Dark theme after contrast check | P3 · S2 · partial | Ship only after contrast and photo-viewing checks ([baseline](../senior-first/baseline.md), R0 integration). | None |
| APP-027 | Adult-set child mode | P3 · S3 · new | An adult chooses activities for children. No child accounts, no child sign-in, no child data. | Approval. UK Children's Code and COPPA review first ([R5 §5.1]). Children are a later audience ([VISION](../../../VISION.md), Stage 3). |
| APP-028 | One-switch and keyboard play | P2 · S2 · new | Every picture game can be played with one switch or an external keyboard ([R4 §8 #32]). | GM-013, GM-017 |
| APP-032 | Read-aloud for cards | P2 · S3 · proposed | User-started playback with an on-device voice and an always-visible Stop. | Approval (GM-011). No voice recording, no microphone |
| APP-033 | Printable "what we did" log | P3 · S3 · new | A one-page summary of tried activities, printed by the person for a family book. | APP-004, APP-002 |
| APP-035 | Opt-in aggregate counts | P3 · S3 · new | If ever approved, anonymous counts of "We tried this" as the north-star input. No identifiers, no health context. | Approval. No custom telemetry is approved today ([validation](../senior-first/validation.md)); see [metrics](17-metrics-and-evidence.md) |

## Explicitly out of scope

- Any feed, autoplay, streak counter, guilt notification or badge.
- Any AI processing of family photos, such as face detection, naming or classification ([personal photos](../senior-first/personal-photos.md)).
- Any cognitive score, stage input, or activity "for dementia" selection based on diagnosis.
- Any in-app advertising, paywall on an included activity, or purchase prompt.
- Background sync of photos, album watching, or device-wide photo scanning.

## Open questions

- **Reminders.** GM-038 has maintainer approval for opt-in iOS reminders, but the catalog defers it and the baseline lists reminders as present. Which one is the release state?
- **Account sync (APP-015).** The brief asks for it, but the product contract excludes accounts and cloud sync. Is the maintainer prepared to change that contract, or should APP-016 be the only sync path?
- **Stop-signal reviewer (APP-029).** Who is the named reviewer for stop-signal wording, and does any card need a clinical reviewer?
- **Store and kiosk claims.** Care-setting kiosk (APP-007) and casting (APP-008) need device evidence before any claim of support.
- **Legacy timed matching.** [WORKBOARD](../../../WORKBOARD.md) records timed mismatch and hint dismissal still in the legacy game code. That must go before any "no pressure" claim covers every app game (GAME-014, GAME-015).
- **Child mode timing.** Is APP-027 deferred until the children's audience passes its evidence gate in [VISION](../../../VISION.md), or should a review start now?
