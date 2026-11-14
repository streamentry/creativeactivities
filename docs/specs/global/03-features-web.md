# 03. Website features

This file is the complete catalog of website features the global spec needs, as `WEB-###` items. Each item says why it matters (tied to MISSION, VISION, DESIGN or a research note), what it does, how we will know it works, and what it depends on. It states each item's status against the baseline in [README](README.md#where-we-are-today-baseline-checked-2026-11-14-on-main-at-dab0f10). Where a feature belongs to the app, it is in [app features](04-features-app.md); games are in [games](05-games.md); community features are in [community](11-community-ugc.md).

**Read with:** [01 positioning](01-positioning-and-audiences.md) · [02 information architecture](02-information-architecture.md) · [04 app features](04-features-app.md) · [05 games](05-games.md) · [14 trust, safety, accessibility and privacy](14-trust-safety-accessibility-privacy.md) · [15 platform and data](15-platform-data-architecture.md) · [17 metrics](17-metrics-and-evidence.md) · [18 roadmap](18-roadmap.md)

---

## How to read this file

- **Priority:** `P0` must exist to be credible; `P1` is needed to lead; `P2` strengthens the lead; `P3` only if evidence supports it ([writer brief](_WRITER_BRIEF.md)).
- **Phase:** `S1` small excellent library (now); `S2` prove repeat usefulness; `S3` expand by adjacency; `S4` global scale ([VISION](../../../VISION.md) gates).
- **Status:** `exists` (in today's baseline and checked), `partial` (some of it exists; the rest is listed in the item), `new`. Where a baseline statement could not be confirmed in the code, the item says "verify".
- **Format:** P0 and P1 items use the full item template. P2 and P3 items are in tables.

### Baseline check (2026-11-14)

What the site already does, from the README and a check of `site/`:

- Finder with three visible filters, optional fit filters, "Any" choices, why-it-fits text, and saved activities on the device. Hubs: four. Packs: two fixed packs. Cards: 38, English only, with a stop note, variations, safety list, HowTo data and a print card with a QR code.
- No step images in the 38 card files. No service worker, so offline support is limited to the web app manifest.
- Google Analytics 4 is loaded on pages through a site-wide component. The Content Security Policy in `public/_headers` allows only the site and Google's analytics endpoints. The photo pairs game loads no analytics and uses a stricter policy.
- No share control and no dark theme were found in the site code.
- Bylines say "not yet reviewed by an outside expert".
- 88 English guides; 189 locale codes of machine-translated guides, unreviewed, most held from the search index.
- Games: 12, including a photo pairs game that keeps family photos on the device.

Items below that depend on these facts say so.

---

## A. Finding and fit

### WEB-001 · Activity finder

Priority P0 · Phase S1 · Status exists · Pillars: all

Why: Finding an activity that fits is step one of the product promise ([MISSION](../../../MISSION.md), "The product promise"). DESIGN limits the first view to three filters ([DESIGN §3](../../../DESIGN.md)).

What: `/activity/` shows time, materials and type first. Optional fit filters cover setting, group, mess, energy, senses, communication and help level. Every filter has "Any". Each result explains why it fits. The baseline has these choices; this item keeps them and sets the rules.

Acceptance:
- The first view shows three filters; fit filters open on request.
- "Any" is the default on every filter. "I don't know" is added wherever a filter's meaning is not obvious.
- No question asks about a diagnosis, a condition or a birth date.
- Each result shows its why-it-fits line and its stop note.
- The finder passes the keyboard and screen-reader checks in [WEB-075](#web-075--accessibility-tests-in-ci).

Depends on: [WEB-004](#web-004--why-it-fits-and-a-lower-effort-option), [WEB-075](#web-075--accessibility-tests-in-ci); facet values in [02 §4](02-information-architecture.md#4-facet-taxonomy).

Risks / not doing: More visible filters slow a tired visitor down. Do not add a match score or a health question.

### WEB-002 · Describe your situation

Priority P1 · Phase S2 · Status new · Pillars: all

Why: Visitors describe situations, not categories: "my dad likes music but tires quickly" ([VISION, ten-year vision](../../../VISION.md)). Demand is in specific queries, not head terms ([R5 §3, §6](research/05-search-scale-trust.md)).

What: One text box on `/activity/` reads a short description and turns it into editable facet chips. "Tires quickly" becomes low energy and seated; "likes music" becomes the music type. The first version uses a reviewed synonym list, not a language model. Chips can be removed, and the results update without a page reload.

Acceptance:
- At least 30 test situations from [01 §3](01-positioning-and-audiences.md#3-situations) each map to a sensible set of chips, checked by an editor.
- Chips are visible, removable and reachable by keyboard; focus stays in the box.
- The text is not sent to a server or stored. A note beside the box says so.
- With no mapping, the page shows the three visible filters, not an error.

Depends on: [WEB-001](#web-001--activity-finder), [WEB-005](#web-005--finder-state-in-the-url).

Risks / not doing: A phrase must never imply a condition ("forgetful" is not a diagnosis input). Map to situations and fit only.

### WEB-003 · Site search with care and family language

Priority P1 · Phase S2 · Status new · Pillars: all

Why: Search is a main way in, and people use varied words for the same need, such as "grandma", "nan", "memory care" and "elderly" ([R5 §3](research/05-search-scale-trust.md)).

What: One search box on every page, searching cards, hubs, guides and games. Results list cards first, then hubs, then guides. An editor-owned synonym list links related care and family terms.

Acceptance:
- The synonym list has at least 30 reviewed pairs at launch (proposal).
- Every query returns a card or hub, or says plainly that nothing matched and offers the finder.
- Search terms are not stored with any identifier. Aggregate counts exclude any health term.
- The search box is labeled, keyboard-operable and works without JavaScript for a basic query (verify).

Depends on: [WEB-002](#web-002--describe-your-situation), [WEB-059](#web-059--intent-hub-template).

Risks / not doing: Search results go through the same claim rules as the pages. No search suggestions that name a treatment.

### WEB-004 · Why it fits, and a lower-effort option

Priority P1 · Phase S2 · Status partial · Pillars: all

Why: DESIGN asks that results explain why they fit and offer a lower-effort alternative, "not a mysterious match score" ([DESIGN §3](../../../DESIGN.md)).

What: The why-it-fits line exists in the baseline. The lower-effort option is new: beside each result set, one card with fewer materials or less energy, never the same card as the top result.

Acceptance:
- Each result lists its matching choices in plain words, for example "can start in under 10 minutes; works seated".
- No numeric score or percentage appears.
- The lower-effort card is always a different card from the top result.
- In usability sessions, five of five participants can say why a card was offered.

Depends on: [WEB-001](#web-001--activity-finder), [WEB-008](#web-008--related-cards-by-function).

Risks / not doing: Do not use "AI match". Do not rank by revenue.

### WEB-005 · Finder state in the URL

Priority P1 · Phase S2 · Status new · Pillars: all

Why: Visitors share a plan with a relative, a care team or a class ([MISSION, "Share the moment"](../../../MISSION.md)). A shareable link makes the finder useful to more than one person.

What: Filter choices appear in the query string, for example `?time=10&setting=seated`. Reloading or sharing restores them. Combinations of three or more fit filters are `noindex`, and their canonical URL is `/activity/`.

Acceptance:
- Only facet values appear in the URL. No free text, no personal data.
- Reloading restores the same results.
- The canonical and robots rules are checked in the build.
- The back button returns to the previous filter state.

Depends on: [WEB-001](#web-001--activity-finder); URL rules in [02 §3](02-information-architecture.md#3-url-scheme).

Risks / not doing: Long filter URLs can create near-duplicate pages. The `noindex` rule prevents that.

### WEB-006 · "What I have" mode

Priority P1 · Phase S2 · Status new · Pillars: MAKE, CARE, GROW

Why: MISSION asks for activities started "with everyday materials" ([MISSION](../../../MISSION.md), "The problem"). A stash-style view reduces buying pressure ([R1 §5](research/01-craft-diy-platforms.md)).

What: A checklist of common household items, such as paper, pencils, cups, photos and yarn scraps. Results show cards that need only the items ticked. Named substitutions are shown beside each card.

Acceptance:
- The checklist uses the controlled materials tags in [02 §4.1](02-information-architecture.md#41-core-facets).
- A result never needs an item the visitor did not tick, except a named substitution shown on the card.
- Reviewers confirm that a set of typical household items reaches at least 20 cards (proposal).
- Each checkbox has a label. The list is kept on the device only, and can be cleared.

Depends on: [WEB-002](#web-002--describe-your-situation); materials tags in [02](02-information-architecture.md).

Risks / not doing: A weak substitution can mislead. Substitution notes are written, not implied.

### WEB-007 · One idea right now

Priority P2 · Phase S2 · Status new · Pillars: all

| Feature | Notes |
|---|---|
| One idea right now | A single card with an "another one" control, drawn from a fixed set chosen by fit. Never an endless feed, and the control stops after a short run. Serves "I have five minutes" (MISSION: "startable, not scrollable"). |

### WEB-008 · Related cards by function

Priority P1 · Phase S2 · Status partial · Pillars: all

Why: VISION asks that related activities are chosen by "functional similarity, not arbitrary keywords" ([VISION, "Each activity page should answer the entire task"](../../../VISION.md)). Cards have a `related` field in the baseline.

What: The related list is computed at build time from shared facets (setting, energy, materials class, group) and a short functional tag. Each card shows three or four related cards.

Acceptance:
- Every card's related list is reviewed once before S1 exit.
- No two related cards share only a keyword.
- A related link crosses pillars only when the function matches.

Depends on: [02 §7](02-information-architecture.md#7-one-activity-in-many-places-without-cloning).

Risks / not doing: Auto-generated related lists can look random. Review them.

### WEB-009 · Pillar tiles and pillar hubs

Priority P1 · Phase S2 · Status new · Pillars: all

Why: MISSION names the situations, and the six pillars organize them ([README](README.md#pillars)). Visitors who do not know what they want need a way in besides search.

What: Tiles on `/activity/` and the home page link to pillar hubs: `/make/`, `/calm/`, `/together/` and `/for-older-adults/`. `/kids-and-families/` waits for S2 content. Hubs follow the template in [WEB-059](#web-059--intent-hub-template).

Acceptance:
- Each pillar hub links to at least six cards and to its intent hubs.
- No pillar hub repeats an intent hub's list.
- Each pillar hub has its own opening, selection rule and "not for" line.

Depends on: [WEB-059](#web-059--intent-hub-template); [02 §5](02-information-architecture.md#5-navigation-by-pillar).

Risks / not doing: Pillar hubs can become thin lists. The rules above prevent that.

### WEB-010 · Facet browse pages

| Priority | Phase | Status | Pillars | Notes |
|---|---|---|---|---|
| P1 | S2 | new | all | Browse by materials, time or setting, but only for facet pages that pass the hub rules in [02 §6](02-information-architecture.md#6-hub-rules). Other facet views are filters on the finder. Facet pages are canonical to the matching hub. |

---

## B. Activity pages and printing

### WEB-011 · At-a-glance block with Start, Print and Save

Priority P0 · Phase S1 · Status partial · Pillars: all

Why: "An activity, ready in one glance" is the signature experience ([DESIGN §1](../../../DESIGN.md)). MISSION asks that a person can start in roughly a minute ([MISSION, "The product promise"](../../../MISSION.md)).

What: The top of each card shows the name, a one-sentence purpose, the time, the materials, mess, setting, cost and help level, followed by Start, Print and Save. The baseline has the facts and a "Start activity" link to the steps. Print and Save on the card need checking (verify).

Acceptance:
- All glance facts are visible without scrolling on a 375 px wide screen.
- Start moves focus to step 1, not only the scroll position (baseline behavior, keep it).
- Print and Save work by keyboard, with labels.
- Body text is at least 18 px on the page (DESIGN §2).

Depends on: [WEB-014](#web-014--one-page-printable-card), [WEB-028](#web-028--saved-collections-on-the-device).

Risks / not doing: More than three buttons dilutes the first action. Keep these three.

### WEB-012 · Step photos or illustrations

Priority P0 · Phase S1 · Status new · Pillars: all

Why: VISION asks for "original activity media" and "photographed or illustrated steps" ([VISION, "Moat we can actually build"](../../../VISION.md)). DESIGN says photos should never be the only form of instruction ([DESIGN §2](../../../DESIGN.md)). None of the 38 card files references an image.

What: Each card gets an original photo or tactile illustration for its materials and for its key steps, with a caption and alt text that carries the instruction. Step text stays alongside every image. Images have explicit dimensions and are compressed.

Acceptance:
- Each card has an image showing the materials and a partly or fully finished result.
- Every step with an image has alt text and a caption that say what matters in that step.
- The step text is complete without the image.
- Each image has a rights-log entry ([WEB-073](#web-073--image-consent-and-rights-log)) and passes the size budget ([WEB-074](#web-074--performance-budget)).
- No identifiable person, and no child, appears without the consent rules in WEB-073.

Depends on: [WEB-073](#web-073--image-consent-and-rights-log), [WEB-074](#web-074--performance-budget). Cost: 20 pages are the VISION Stage 1 target, so every S1 card needs this.

Risks / not doing: Stock photos are not enough; they must show the actual process. Generated images are not used as step evidence.

### WEB-013 · Variation chips with an in-page switch

Priority P1 · Phase S2 · Status partial · Pillars: all

Why: One idea, many adaptations, is a core differentiator ([MISSION, "What makes us different"](../../../MISSION.md)). Variations exist as text in the baseline; switching between them is new.

What: Variations appear as chips above the variations section. Choosing one shows it without a reload and updates the URL fragment. All variations stay in the HTML, so printing and screen readers see them.

Acceptance:
- Chips are real links that work without JavaScript.
- Focus stays on the chosen variation.
- Each variation changes at least one step, not only a sentence.
- Printing shows all variations unless one is selected.

Depends on: [WEB-014](#web-014--one-page-printable-card); variation kinds in [02 §4.2](02-information-architecture.md#42-fit-facets).

Risks / not doing: Hiding variations behind a switch can hide them from search and from print. Keep them in the HTML.

### WEB-014 · One-page printable card

Priority P0 · Phase S1 · Status partial · Pillars: all

Why: The Activity Card is "the memorable feature" and a potential distribution channel ([DESIGN §8](../../../DESIGN.md), [VISION](../../../VISION.md)). Printables are the way to reach people without a screen ([R1 §3.7](research/01-craft-diy-platforms.md)).

What: One page per activity, with the title and image, what you need and what to do, the easier side ("make it easier or different"), the note "It's okay to stop or change it", a source line and a short URL or QR code. The baseline has a print card with a QR code. Checking the easier side and stop note on the print is needed (verify).

Acceptance:
- Fits on one A4 sheet and one US Letter sheet at 100% scale.
- Body text is at least 12 pt in print (proposal), and the stop note is never cut.
- Works in black and white.
- Shows the card version and date ([WEB-016](#web-016--versioned-prints)).

Depends on: [WEB-015](#web-015--no-ink-no-url-print-version), [WEB-016](#web-016--versioned-prints), [WEB-012](#web-012--step-photos-or-illustrations).

Risks / not doing: Long cards are cut at the wrong place. Cut the photo first, never the stop note or the safety flags.

### WEB-015 · No-ink, no-URL print version

Priority P0 · Phase S2 · Status partial · Pillars: all

Why: DESIGN requires that the print page works with no internet, no color ink and no URL access ([DESIGN §4B](../../../DESIGN.md)). Print styles exist in the baseline; their results on real devices are not recorded.

What: `@media print` removes navigation, banners and decoration, keeps the materials and steps in large type, and prints the same content as the web page. Printing works from a phone's print dialog.

Acceptance:
- Printed card is legible in black and white on one inkjet and one laser printer (device list kept with the test record).
- No navigation, banner or cookie notice prints.
- Print content matches the web content exactly. No print-only claims.
- The card works with no URL or QR code.

Depends on: [WEB-014](#web-014--one-page-printable-card).

Risks / not doing: No print-only rewrite of claims. Print is a rendering of the same card.

### WEB-016 · Versioned prints

Priority P0 · Phase S2 · Status new · Pillars: all

Why: Printed copies cannot be updated, so each one must be dated and versioned ([R5 §4](research/05-search-scale-trust.md)). The risk of feature churn is named in [R1 §7](research/01-craft-diy-platforms.md): printed outputs must stay stable.

What: Every printed card and pack shows its version, its last-checked date and its canonical URL. A change to materials, steps or safety creates a new version. If a safety change affects a printed version, the web page says that printed copies may be out of date.

Acceptance:
- The footer of each print shows version, date and URL.
- The version matches the web card's version.
- Each version has a changelog entry ([WEB-027](#web-027--card-changelog)).
- A safety change publishes a notice on the card page.

Depends on: [WEB-027](#web-027--card-changelog), [WEB-057](#web-057--byline-and-reviewer-block).

Risks / not doing: Users may not notice a version. The notice on the web page is the backstop.

### WEB-017 · Printable pack builder

Priority P1 · Phase S2 · Status new · Pillars: all

Why: VISION Stage 2 tests "one sharable printable pack" ([VISION, Stage 2](../../../VISION.md)). Printable collections are a gap in free offers ([R2 §6](research/02-parenting-kids-platforms.md)). The baseline has two fixed packs.

What: A visitor picks five to eight cards, sees a supply list and a checklist, and prints one set of pages. No account. The builder output is a pack page with its own key and version.

Acceptance:
- The page count is shown before printing.
- The supply list combines materials and removes duplicates.
- A card can be added only with its chosen variation.
- The pack states "for personal, noncommercial use" (VISION's print and share permission).

Depends on: [WEB-014](#web-014--one-page-printable-card), [WEB-016](#web-016--versioned-prints).

Risks / not doing: Bulk copying for resale. The noncommercial line and the free-core rule cover it. No watermark on a family's own print.

### WEB-018 · Large-print editions

Priority P1 · Phase S2 · Status new · Pillars: CARE, MAKE

Why: Low vision is one of the situations we must serve ([01, row 12](01-positioning-and-audiences.md#3-situations)), and DESIGN asks for large type and strong contrast ([DESIGN §6](../../../DESIGN.md); [MISSION, "Accessible by default"](../../../MISSION.md)).

What: A large-print layout for each card, with steps in at least 18 pt and a larger QR code. Offered as a button on the card and on pack pages.

Acceptance:
- Step text is at least 18 pt (proposal) and high-contrast.
- Tested with at least three people who read large print in their daily lives.
- The content is the same as the standard print.
- Works in black and white.

Depends on: [WEB-014](#web-014--one-page-printable-card), [WEB-015](#web-015--no-ink-no-url-print-version).

Risks / not doing: A second content version to maintain. The layout changes; the words do not.

### WEB-019 · Picture-led card

Priority P1 · Phase S2 · Status new · Pillars: CARE, GROW, TOGETHER

Why: Free, plain-language, picture-led cards for families with limited literacy or on basic phones are rare ([R2 §6, gap 5](research/02-parenting-kids-platforms.md)). Situations 13 and 24 in [01](01-positioning-and-audiences.md#3-situations) need them.

What: A version of a card where each step is one picture with a short label of no more than six words (proposal). Pictures come from the rights log.

Acceptance:
- One action per picture.
- Tested with at least five participants who prefer picture-led steps.
- No identifiable person in a picture without consent ([WEB-073](#web-073--image-consent-and-rights-log)).
- The picture-led card shares the canonical key of its standard card.

Depends on: [WEB-012](#web-012--step-photos-or-illustrations), [WEB-073](#web-073--image-consent-and-rights-log), translated labels in [13](13-localization.md).

Risks / not doing: Pictures can carry cultural assumptions. Test them with people from different backgrounds ([MISSION, "Cultural openness"](../../../MISSION.md)).

### WEB-020 · Read-aloud

Priority P1 · Phase S2 · Status new · Pillars: all

Why: Reading aloud helps people with low vision, low literacy and tired eyes, and it supports shared reading in a group ([MISSION, "Accessible by default"](../../../MISSION.md)).

What: A "Listen" control on the card and on each step, using the browser's built-in speech. Play, pause and speed controls. Off by default. No audio files to download and no autoplay.

Acceptance:
- Works in Chrome, Firefox and Safari (the minimum cross-browser set in the web testing rules).
- Controls are keyboard reachable and labeled.
- Stops when the visitor leaves the page.
- The page states that the device's voice may send audio to its operating system provider, because that depends on the device (verify per platform).

Depends on: [WEB-036](#web-036--keyboard-focus-and-screen-reader-on-every-template).

Risks / not doing: No third-party speech service. A cloud voice would change the privacy position.

### WEB-021 · Short demo video per activity

| Priority | Phase | Status | Pillars | Notes |
|---|---|---|---|---|
| P2 | S3 | new | all | One short captioned demonstration per card, at most. Captions and a transcript are required, and nothing autoplays. Within the size budget ([WEB-074](#web-074--performance-budget)). Video supports the written steps and never replaces them ([R1 §3.6](research/01-craft-diy-platforms.md)). |

### WEB-022 · Structured safety flags

Priority P0 · Phase S1 · Status partial · Pillars: all

Why: Safety labeling is a non-negotiable: scissors, heat, choking risks, skin contact, allergens and supervision ([MISSION, "Safety"](../../../MISSION.md)). Small-parts labels need a default ([R2 §4](research/02-parenting-kids-platforms.md)). The baseline has a safety list in text, not structured flags.

What: The flags in [02 §4.3](02-information-architecture.md#43-safety-flags) appear as labeled items above the steps. "Not for under 3" appears in the glance block if the card has small parts. The flags are filterable.

Acceptance:
- Every card has a safety section, and the flags field is filled in. A blank field fails the editorial check.
- A card with small parts shows "Not for under 3" in the glance block.
- Legal wording for labels is reviewed under [14](14-trust-safety-accessibility-privacy.md) before S1 exit.
- Flags are tested with the filters in [WEB-001](#web-001--activity-finder).

Depends on: [02 §4.3](02-information-architecture.md#43-safety-flags), [14](14-trust-safety-accessibility-privacy.md).

Risks / not doing: A flag is not a guarantee. Supervision text stays on the card.

### WEB-023 · Scope line on every page

Priority P0 · Phase S2 · Status partial · Pillars: all

Why: "We describe activities as creative, recreational, supportive, or engaging" ([MISSION, "Evidence and humility"](../../../MISSION.md)). R3 recommends the same sentence on every activity page: "This is a creative activity, not therapy or medical advice" ([R3 §3.1](research/03-art-therapy-wellbeing.md)). The baseline has a medical disclaimer page; the per-page line is new.

What: The line appears on every card, hub, pack, game and guide. It sits in the glance block or the footer.

Acceptance:
- An automated check confirms the line on 100% of card, hub, pack and game pages.
- An automated check finds no banned claim term (list kept with [14](14-trust-safety-accessibility-privacy.md)) on any indexable page.
- Reviewed-scope pages add the reviewer's scope note ([WEB-057](#web-057--byline-and-reviewer-block)).

Depends on: [WEB-057](#web-057--byline-and-reviewer-block), [14](14-trust-safety-accessibility-privacy.md).

Risks / not doing: A line on every page does not excuse a claim in the body. Both checks are needed.

### WEB-024 · "It's fine to stop" and "not today"

Priority P0 · Phase S1 · Status exists · Pillars: all

Why: "Adapt or stop without pressure" is a product promise ([MISSION](../../../MISSION.md)). DESIGN asks for a graceful exit ([DESIGN §4B](../../../DESIGN.md)).

What: Each card has a stop note (exists in the baseline) written for the participant. The card also offers "Try again another day" at the end of the steps, in print and on the web.

Acceptance:
- The stop note is written for the participant, not only the helper.
- No card says "complete", "finish" or "you should" about a participant.
- "Not today" appears at the end of the steps and in the print footer.
- Usability sessions check that the stop note is noticed.

Depends on: none.

Risks / not doing: Stop notes can become a formula. Write each one for its activity.

---

## C. Proof, feedback and saved things

### WEB-025 · "We tried this"

Priority P0 · Phase S1 · Status new · Pillars: all

Why: The north-star proxy is "activity starts that users voluntarily confirm" ([VISION, metrics](../../../VISION.md)), and the definition of #1 counts confirmed starts first ([README](README.md#definition-of-1-how-we-will-know)).

What: One tap on a card records "We tried this". The site keeps an anonymous count per card and an optional one-line note. The note carries a warning not to add health details. No account and no email. A count is shown to visitors only after a minimum (proposal: 20) and then rounded.

Acceptance:
- One event carries the card key and the choice only. Free text leaves the device only when the visitor taps send.
- Repeated taps from one device are limited, without storing an identifier.
- The count is shown only after the minimum, rounded, and labeled as a count.
- The event meets the privacy rules in [WEB-068](#web-068--privacy-minimal-analytics).

Depends on: [WEB-068](#web-068--privacy-minimal-analytics), [WEB-058](#web-058--report-a-problem).

Risks / not doing: Counts can be gamed or can look like pressure. The count is a proxy for usefulness, not an outcome, and it is never shown as a target to reach ([VISION caveat](../../../VISION.md)).

### WEB-026 · "This didn't fit"

Priority P0 · Phase S1 · Status new · Pillars: all

Why: VISION names "helpful and not-fit feedback" as a usefulness measure ([VISION, Stage 1](../../../VISION.md)). Reasons such as "too messy" or "not an option for this person" tell us what to adapt ([R1 §3, "Pins… feedback"](research/01-craft-diy-platforms.md)).

What: A "This didn't fit" control with reasons: too messy, too hard, needs things we don't have, not interested, too loud or busy, hard to read or use on my device, and other. Each reason sends the card key and the reason to the editors' queue. The visitor sees a useful next step: a variation or another card.

Acceptance:
- Reasons are in the reader's language and plain.
- The "other" text is screened for health details and personal data before it is stored. Anything flagged is discarded.
- No account. The event holds the card key, the reason and nothing else.
- Each reason routes to a visible next step.

Depends on: [WEB-027](#web-027--card-changelog), [WEB-058](#web-058--report-a-problem).

Risks / not doing: Free text is where personal information arrives. The screening rule is required, not optional.

### WEB-027 · Card changelog

Priority P1 · Phase S2 · Status new · Pillars: all

Why: "Documented editorial process" and visible update dates build trust ([VISION, metrics](../../../VISION.md); [R5 §5.6](research/05-search-scale-trust.md)).

What: Each card shows a short "What changed" list with dates when materials, steps or safety change. Cosmetic edits are not listed. The list is generated from the editorial log.

Acceptance:
- Each entry has a date and a plain reason.
- Safety-related changes are labeled.
- The list is generated, not typed by hand on the page.

Depends on: [WEB-016](#web-016--versioned-prints), [WEB-057](#web-057--byline-and-reviewer-block).

Risks / not doing: A long history clutters the card. Show the last three changes and link to the full log.

### WEB-028 · Saved collections on the device

Priority P1 · Phase S2 · Status partial · Pillars: all

Why: Keeping what worked is a jobs-to-be-done ([01 §4, job 8](01-positioning-and-audiences.md#4-jobs-to-be-done)). The baseline saves activities on the device; named collections and export are new. The "collections over streaks" rule is from [R4 §3.3](research/04-games-engagement.md).

What: Named collections, such as "Sunday with Dad". Add and remove cards. Export to a file and import on another device. No account and no tracking.

Acceptance:
- Collections are stored in one local key. Clearing removes them all.
- The export file holds card keys and collection names only.
- The import validates the file and rejects anything else.
- Storage failures are caught, and the page still works.

Depends on: [WEB-029](#web-029--data-control-on-the-device).

Risks / not doing: Collection names can contain personal information. The screen warns about this.

### WEB-029 · Data control on the device

Priority P0 · Phase S2 · Status new · Pillars: all

Why: "Provide deletion controls where personal data exists" ([MISSION, "Privacy"](../../../MISSION.md)). Local collections, feedback drafts and display settings are personal data on the device.

What: One panel shows what the site keeps on this device, in plain words, and offers export and delete for each item and for all of them at once, with a confirmation.

Acceptance:
- Every locally stored item is listed.
- Delete-all removes everything in one action after a confirmation.
- Export gives a readable file.
- The panel works without JavaScript for the list, and says what is stored.

Depends on: [WEB-028](#web-028--saved-collections-on-the-device), and WEB-030 (table row in section C) if sync is ever added.

Risks / not doing: Server-side personal data does not exist in S1 by design. If that changes, WEB-030 applies.

| Feature | Priority | Phase | Status | Pillars | Notes |
|---|---|---|---|---|---|
| WEB-030 Account-optional sync | P2 | S3 | new | all | Optional sign-in by email link, only if a visitor wants collections on several devices. Syncs collections only. No child accounts. Deleting an account deletes its data. Nothing requires an account. Data rules in [14](14-trust-safety-accessibility-privacy.md). |

---

## D. Paths, plans and calendar

### WEB-031 · Weekly plan, printable

Priority P1 · Phase S2 · Status partial · Pillars: GROW, CARE, MAKE

Why: A free printable weekly plan with three to five activities is a low-commitment start ([R2 §3.4](research/02-parenting-kids-platforms.md)). The baseline has a five-activity pack, not a weekly plan format.

What: A path or pack prints as one page with three to five cards and one line per day. Days are optional. No day is marked "missed".

Acceptance:
- Prints on one page.
- A blank week prints cleanly.
- No streak or "missed" text appears on the plan.

Depends on: [WEB-017](#web-017--printable-pack-builder), [WEB-032](#web-032--paths).

Risks / not doing: Weekly plans can feel like homework. Keep the page short and the days optional.

### WEB-032 · Paths

Priority P1 · Phase S2 · Status new · Pillars: all

Why: "One daily item with no punishment for missing a day" works in puzzles ([R4 §3.1](research/04-games-engagement.md)). VISION Stage 2 asks for repeat usefulness without push pressure ([VISION, Stage 2](../../../VISION.md)).

What: A path is a four-week sequence of cards, with a start point and a skip button. Progress shows "tried" counts, and those counts never go down. A missed week costs nothing. Paths can be printed ([WEB-031](#web-031--weekly-plan-printable)).

Acceptance:
- No "you missed" text. Skipping is one tap.
- Path progress is stored on the device and can be cleared.
- Each path states its purpose and who it is not for.
- Before S2 exit, at least one CARE path and one TOGETHER path are published (proposal).

Depends on: [WEB-028](#web-028--saved-collections-on-the-device), [WEB-059](#web-059--intent-hub-template).

Risks / not doing: Paths can become streaks in disguise. The "counts never go down" rule is a test, not a style.

### WEB-033 · Seasonal hubs and a "this season" calendar

| Priority | Phase | Status | Pillars | Notes |
|---|---|---|---|---|
| P2 | S2 | new | all | `/seasons/<season>/` for spring, summer, autumn and winter. The season follows the visitor's chosen hemisphere, or their locale if they have not chosen. Season is not holiday: no holiday is assumed ([MISSION, "Cultural openness"](../../../MISSION.md)). Each hub is updated in place every year ([02 H8](02-information-architecture.md#6-hub-rules)). |

### WEB-034 · Occasion hubs

Priority P1 · Phase S2 · Status new · Pillars: all

Why: Occasions capture time-bound searches and real situations: a visit, a rainy day, bed rest, a short break, a gift ([01 rows 1, 4, 16, 28](01-positioning-and-audiences.md#3-situations); [R5 §6](research/05-search-scale-trust.md)).

What: Occasion hubs at `/occasions/<slug>/` for visit, rainy day, bed rest, short break, gift and celebration of any tradition. The gift hub lists cards suited to giving and offers a printable gift card. It names no products.

Acceptance:
- Each occasion hub passes H1 to H4 in [02 §6](02-information-architecture.md#6-hub-rules).
- The gift hub links to no store and sells nothing.
- Holiday language is neutral; a card that names one holiday has an "adapt to your tradition" note.
- Each hub has a stop note on its cards.

Depends on: [WEB-059](#web-059--intent-hub-template).

Risks / not doing: "Gift" can pull in shopping intent. The page answers the gift question with an activity, not a purchase.

---

## E. Access and performance

### WEB-035 · Large text, high contrast and reduced motion

Priority P0 · Phase S1 · Status exists · Pillars: all

Why: DESIGN requires scalable type, contrast and reduced motion ([DESIGN §2, §6](../../../DESIGN.md)).

What: Site-wide settings for larger text, higher contrast and reduced motion, saved on the device and following the operating system where it says so. The baseline lists all three.

Acceptance:
- Reduced motion is honored in CSS and in any script-driven motion.
- The settings persist and fall back to defaults if storage fails.
- Text stays readable at 200% zoom ([WEB-037](#web-037--zoom-and-small-screen-reflow)).
- No autoplay anywhere.

Depends on: none.

Risks / not doing: A setting nobody finds does not help. Put it in the header or the footer on every page.

### WEB-036 · Keyboard, focus and screen reader on every template

Priority P0 · Phase S1 · Status partial · Pillars: all

Why: "Build and test with people who use assistive technologies" ([MISSION, "Accessibility"](../../../MISSION.md)). WCAG 2.2 AA is the minimum ([brief](_WRITER_BRIEF.md)). The baseline runs axe on key pages only.

What: Extend keyboard, focus and screen-reader checks to every template: card, hub, pack, game, finder, guide and printables.

Acceptance:
- Zero axe violations at WCAG 2.2 AA on every template in CI.
- Visible focus on every interactive element.
- Logical reading order, labeled form fields and headings in order.
- Touch targets are at least 48 px, per the spec's hard accessibility rule. DESIGN §2 says 44 px for primary interactions; the stricter number applies.
- Tested with at least two screen readers before S1 exit.

Depends on: [WEB-075](#web-075--accessibility-tests-in-ci).

Risks / not doing: Automated checks are necessary but not sufficient ([DESIGN §6](../../../DESIGN.md)). Human tests with assistive-technology users are required.

### WEB-037 · Zoom and small-screen reflow

Priority P0 · Phase S2 · Status partial · Pillars: all

Why: DESIGN asks for 200% zoom and reflow at 320 CSS px without horizontal scrolling for ordinary content ([DESIGN §6](../../../DESIGN.md)).

What: Each template is tested at 320 CSS px and at 200% zoom. Wide images scroll inside their own container.

Acceptance:
- No horizontal page scroll on ordinary content at 320 px.
- No text clipped in cards, the finder, hubs or the header.
- Tested on every template.

Depends on: [WEB-036](#web-036--keyboard-focus-and-screen-reader-on-every-template).

Risks / not doing: Tables and step images can overflow. Fix them in the template, not one page at a time.

### WEB-038 · Works without JavaScript, within a page budget

Priority P0 · Phase S2 · Status partial · Pillars: all

Why: "Progressive enhancement: HTML content and critical navigation work before JavaScript" ([DESIGN §7](../../../DESIGN.md)). Low-speed connections are a named underserved condition ([VISION, "Ten-year vision"](../../../VISION.md)).

What: The card, hub, pack and guide read fully without JavaScript. The finder, chips and read-aloud enhance the page. Each template stays within the Microsite budget in the web performance rules (JavaScript under 80 kB gzipped; CSS under 15 kB), or documents an exception.

Acceptance:
- Each template shows its core content with JavaScript disabled.
- The card template meets the Microsite budget, or the exception is written down with a reason.
- Printing works without JavaScript.

Depends on: [WEB-074](#web-074--performance-budget).

Risks / not doing: The finder needs JavaScript for its best behavior. Its basic list still works without it (verify).

### WEB-039 · Plain-language mode

Priority P1 · Phase S2 · Status new · Pillars: CARE, GROW

Why: DESIGN asks for comprehension with people who prefer short language, with "one action per step" ([DESIGN §6](../../../DESIGN.md)).

What: A switch that shows shorter sentences, one action per line and larger spacing. Safety text is never removed.

Acceptance:
- Every card has a plain-language version, or the switch falls back to the standard text.
- Safety text is identical in both versions.
- Tested with at least five people who prefer short language.

Depends on: [06 content library](06-content-library.md) for the editorial work.

Risks / not doing: Shortening text can remove a safety step. The safety check runs on both versions.

### WEB-040 · Offline reading

Priority P1 · Phase S2 · Status new · Pillars: all

Why: "Offline human connection is the product" ([MISSION](../../../MISSION.md)), and low bandwidth is a named requirement. Quiet offline play is a pattern worth copying ([R4 §3.5](research/04-games-engagement.md)). The baseline has a web app manifest and no service worker.

What: A service worker caches the cards, packs and hubs a visitor has opened, plus the finder, so they work offline. It caches public content only and is versioned with the content.

Acceptance:
- After one visit, a card and its print view load with the network off.
- The cache clears when the site version changes.
- No personal data and no family photos are cached (the photo game keeps its own local storage).
- Storage limits are handled without breaking the page.

Depends on: [WEB-041](#web-041--installable-web-app), [WEB-074](#web-074--performance-budget).

Risks / not doing: A stale cached safety change. The version rule in WEB-016 covers prints; the cache rule covers the web.

### WEB-041 · Installable web app

| Priority | Phase | Status | Pillars | Notes |
|---|---|---|---|---|
| P3 | S3 | partial | all | The web app manifest exists. Add install support after WEB-040, with icons from the brand set in [DESIGN §2](../../../DESIGN.md). Installing is optional; nothing requires it. |

### WEB-042 · Display options: dark theme and reading settings

| Priority | Phase | Status | Pillars | Notes |
|---|---|---|---|---|
| P2 | S2 | new | all | A dark theme that follows the system setting, and line-length and spacing options. No dark theme was found in the styles checked. Both themes need contrast checks against the token pairings in [DESIGN §2](../../../DESIGN.md). Dark mode is a choice, not the default. |

### WEB-043 · Right-to-left and long-text layouts

Priority P1 · Phase S3 · Status partial · Pillars: all

Why: Right-to-left reading and long words (German, Finnish) are common in launched languages ([13](13-localization.md)). The baseline lists RTL support.

What: RTL and long-text layouts for the card, hub, finder and pack, tested on the screen widths in the web testing rules: 320, 375, 768, 1024, 1440 and 1920.

Acceptance:
- Visual checks in both directions on each template at each width.
- Long-word text does not overflow buttons or print pages.
- Printed RTL cards are tested.

Depends on: [WEB-075](#web-075--accessibility-tests-in-ci), [13](13-localization.md).

Risks / not doing: Translation review is a separate gate in [13](13-localization.md).

---

## F. Partners, groups and sharing

### WEB-044 · Partner page with permission rules

Priority P1 · Phase S2 · Status partial · Pillars: CARE, GROW, TOGETHER

Why: Libraries and care settings are trusted local channels, but logos and endorsements need written permission ([R5 §4](research/05-search-scale-trust.md)). VISION asks for partnerships "without implying clinical endorsement" ([VISION, distribution](../../../VISION.md)). The baseline has a for-organizations page.

What: `/for-organizations/` explains how partners can use cards (print, share, adapt), what we provide (printable packs, facilitator notes, an update notice when a card changes) and what we do not do (no endorsement, no clinical claims). A library kit is listed here as a poster, handout and QR code. Partner type pages wait until they have content ([02 §2](02-information-architecture.md#2-global-sitemap)).

Acceptance:
- No partner logo appears without written permission on file.
- No testimonial appears without written consent.
- A contact route is published.
- No paid placement or featured-partner slot exists without a disclosure ([02 H9](02-information-architecture.md#6-hub-rules)).

Depends on: [WEB-045](#web-045--care-home-weekly-program-sheet), [WEB-046](#web-046--group-mode-for-facilitators).

Risks / not doing: A partner can imply endorsement by listing us. The page states the terms.

### WEB-045 · Care-home weekly program sheet

Priority P1 · Phase S2 · Status new · Pillars: CARE, TOGETHER

Why: Activity directors plan every week and need adaptable ideas and printable sheets ([R5 §4](research/05-search-scale-trust.md); [01, rows 6 and 22](01-positioning-and-audiences.md#3-situations)). Group play is the closest product to what care homes buy today ([R4 §2](research/04-games-engagement.md)), but it is hardware.

What: A printable weekly program with date, room, group size and, for each card, a group version and a one-to-one version. Large print. A header line says it is not a care plan. Materials scale with the group size entered.

Acceptance:
- Prints as one page per week.
- The sheet has no fields for names, diagnoses or care needs. A field check confirms this.
- Each card on the sheet has a group version and a one-to-one version.
- Staff feedback uses the "This didn't fit" route ([WEB-026](#web-026--this-didnt-fit)).

Depends on: [WEB-017](#web-017--printable-pack-builder), [WEB-046](#web-046--group-mode-for-facilitators).

Risks / not doing: A care home may treat the sheet as a care plan. The header line and the staff guidance say it is not one ([R5 §4](research/05-search-scale-trust.md)).

### WEB-046 · Group mode for facilitators

Priority P1 · Phase S2 · Status new · Pillars: CARE, GROW, TOGETHER

Why: Group activity is a common setting ([01, row 6](01-positioning-and-audiences.md#3-situations)). Shared control of one screen is the proven co-play pattern ([R4 §5](research/04-games-engagement.md)).

What: A full-screen view for one facilitator and a group. One step per screen, large type, and the facilitator moves on. No timer is shown to participants. Materials scale to the group size. Works offline ([WEB-040](#web-040--offline-reading)).

Acceptance:
- No timer or score is visible to participants.
- The facilitator can pause at any step.
- Works on a tablet in portrait and landscape.
- Needs no login.

Depends on: [WEB-040](#web-040--offline-reading).

Risks / not doing: A facilitator timer can become pressure. It is off by default and never shown to participants.

### WEB-047 · Educator pages

| Priority | Phase | Status | Pillars | Notes |
|---|---|---|---|---|
| P2 | S3 | new | GROW | Whole-class cards for early-years and classroom use, with supervision and group size. Curriculum-neutral. No child accounts, no tracking, no ads ([WEB-072](#web-072--child-facing-pages-rule)). Reviewed by an early-years educator. |

### WEB-048 · Referrer handout for health and social professionals

| Priority | Phase | Status | Pillars | Notes |
|---|---|---|---|---|
| P2 | S3 | new | CARE, CALM | A printable handout for occupational therapists, speech and language therapists, social prescribers and similar referrers ([01](01-positioning-and-audiences.md#2-audiences)). It states the scope line, what the activity is not, and the signs to stop. Reviewed by a credentialed reviewer. Uses no "prescription", "treatment" or "outcome" language ([R3 §7](research/03-art-therapy-wellbeing.md)). |

### WEB-049 · Organization accounts

| Priority | Phase | Status | Pillars | Notes |
|---|---|---|---|---|
| P3 | S4 | new | all | Saved programs for a care home, school or library. Only after WEB-045 and WEB-046 show partner demand. No clinical or resident records. Needs data-processing terms ([14](14-trust-safety-accessibility-privacy.md)). |

### WEB-050 · Share a card

Priority P1 · Phase S2 · Status new · Pillars: all

Why: "Useful sharing" is a distribution route: one caregiver sends an activity card to siblings, teachers or support groups ([VISION, distribution](../../../VISION.md)). "Share the moment" is a product promise ([MISSION](../../../MISSION.md)). No share control was found in the site code.

What: A share button that opens the device's share sheet, with a copy-link fallback. The share text is the card title and purpose. A generic share image per card, with no faces and no children. No tracking pixels and no social login.

Acceptance:
- Works in iOS, Android and desktop browsers. The copy-link fallback works everywhere.
- The shared link is the canonical card URL with no personal data.
- The share image has alt text and carries no identifiable person.
- No third-party script loads for sharing ([WEB-069](#web-069--no-ads-no-third-party-embeds-and-a-cookie-rule)).

Depends on: [WEB-069](#web-069--no-ads-no-third-party-embeds-and-a-cookie-rule).

Risks / not doing: Share counts are not a growth target. No "invite a friend" incentive.

---

## G. Games

### WEB-051 · Games filters

Priority P1 · Phase S2 · Status partial · Pillars: PLAY

Why: Games should match the setting and the company: solo or together, phone or tablet, offline ([R4 §4](research/04-games-engagement.md)). The baseline has a games index with 12 games.

What: Filters for solo or together, device, offline-ready and group size. Each game shows its "How to play" and an adaptation note.

Acceptance:
- Filter combinations beyond one filter are `noindex`.
- No ad, upsell or "premium" tag.
- Every game's tags are reviewed.
- Keyboard operable.

Depends on: [05 games](05-games.md) for the game catalog.

Risks / not doing: Too many filters on a small library. Show filters only when a game set is large enough to need them.

### WEB-052 · Printable partner on each game page

Priority P1 · Phase S2 · Status new · Pillars: PLAY, GROW, CARE

Why: "Printable plus digital pairs for the same game" is an open gap ([R4 §6](research/04-games-engagement.md)). Printable counterparts are in the game concepts ([R4 §8](research/04-games-engagement.md)).

What: Each game with a printable partner links to the partner card, which follows the same card rules ([WEB-014](#web-014--one-page-printable-card) to [WEB-016](#web-016--versioned-prints)). The game page says which rules are the same.

Acceptance:
- Each of the 12 existing games has a printable partner or a written reason why not.
- The rules text is the same on both.
- The printed partner has a version and date.

Depends on: [WEB-014](#web-014--one-page-printable-card), [05 games](05-games.md).

Risks / not doing: A printable partner that is a worse game. Write the rules once and check both.

### WEB-053 · Difficulty without scores

Priority P1 · Phase S2 · Status new · Pillars: CARE, PLAY

Why: Frustration-free difficulty works for people with dementia and for everyone else ([R4 §3.4](research/04-games-engagement.md)). Blame-the-player difficulty is a named risk ([R4 §7](research/04-games-engagement.md)).

What: Difficulty is set by piece count, grid size and hint timing. A hint appears after a pause, not after a miss. No score is on the screen. "Keep going" is the default. Changing difficulty keeps the place.

Acceptance:
- No failure count, timer or score is shown to participants.
- A hint appears after an idle pause (proposal: 20 seconds).
- Tested with at least five adults, including older adults and one person with low vision (proposal).
- Changing difficulty keeps the place.

Depends on: [05 games](05-games.md).

Risks / not doing: Hints can do the work for the person. Hints are optional and can be switched off.

### WEB-054 · Stop and rest on every game

Priority P0 · Phase S2 · Status new · Pillars: all

Why: "Adapt or stop without pressure" applies to games too ([MISSION](../../../MISSION.md)). A rest button that saves place is in the game concepts ([R4 §8, concept 22](research/04-games-engagement.md)).

What: Every game has a Rest control that saves the place on the device and goes to a calm screen. Resuming takes one tap. No game-over screen.

Acceptance:
- Rest saves the place for every game.
- Switching tabs or losing focus does not lose state.
- The Rest control is labeled and keyboard reachable.
- It works offline.
- No modal appears.

Depends on: [WEB-040](#web-040--offline-reading) for offline play.

Risks / not doing: A rest feature that asks the visitor to "save your score" is not rest. No scores are saved for display.

### WEB-055 · Family photos stay on the device

Priority P0 · Phase S1 · Status exists · Pillars: CARE, GROW, TOGETHER

Why: No sale or sharing of sensitive participant data ([DESIGN §9](../../../DESIGN.md)); privacy by design ([MISSION, "Privacy"](../../../MISSION.md)). The baseline photo pairs game keeps family photos on the device, and its page uses a stricter policy that blocks all other destinations ([`site/public/_headers`](../../../site/public/_headers)).

What: Photo games use photos stored only on the device. Nothing is uploaded. A short note says where photos are kept and how to delete them.

Acceptance:
- The photo pages' policy blocks all destinations other than the site.
- Deleting a photo removes it from the device.
- No photo of a child is requested.
- Tested: no network request carries a photo.

Depends on: [WEB-029](#web-029--data-control-on-the-device).

Risks / not doing: Photo sync or cloud backup is out of scope for the website. Any future sync needs its own privacy review.

---

## H. Search, trust and discovery

### WEB-056 · Structured data that matches visible content

Priority P0 · Phase S1 · Status exists · Pillars: all

Why: Structured data is valid only when it matches visible content ([VISION, GEO](../../../VISION.md)). The baseline has HowTo, FAQPage, ItemList and BreadcrumbList.

What: Keep the four types where the visible page matches them. Do not add rating or review data until real reviews are shown under the rules in [WEB-057](#web-057--byline-and-reviewer-block) and [11](11-community-ugc.md).

Acceptance:
- A structured-data validator reports zero errors on a sample of each template.
- HowTo steps match the visible steps. FAQ items match visible FAQs.
- No aggregate rating appears without a documented rating system.
- Checked in CI.

Depends on: [WEB-075](#web-075--accessibility-tests-in-ci).

Risks / not doing: Schema drift when a card changes. The check in CI catches it.

### WEB-057 · Byline and reviewer block

Priority P0 · Phase S1 · Status partial · Pillars: all

Why: "Named authors and reviewers on every page" is part of the definition of #1 ([README](README.md#definition-of-1-how-we-will-know)). "Visible review dates beat claims of expertise" ([R5 §2.2](research/05-search-scale-trust.md); [DESIGN §4B](../../../DESIGN.md)). The baseline byline reads "Creative Activities editorial team" and says the card is not yet reviewed by an outside expert.

What: Each card shows the author role, the reviewer role, the reviewer's credential and scope (only when given), the last-checked date and the review status. A "reviewed-scope" label appears only when the review is documented.

Acceptance:
- No reviewer name or credential appears without written permission on file.
- The "not yet reviewed by an outside expert" line shows when that is true.
- The date matches the card's frontmatter.
- A scope note lists what the reviewer checked and what is out of scope.

Depends on: [02 §4.4](02-information-architecture.md#44-editorial-status-not-a-visitor-filter), [WEB-076](#web-076--due-for-review-queue).

Risks / not doing: Showing a credential we do not hold. Never show one.

### WEB-058 · Report a problem

Priority P0 · Phase S2 · Status new · Pillars: all

Why: Provenance and correction are part of the trust layer ([MISSION, "Provenance"](../../../MISSION.md); [DESIGN §4B](../../../DESIGN.md) correction link). A reporting path is expected for user content ([R5 §5.5](research/05-search-scale-trust.md)).

What: A "Report a problem" link on every page. It offers categories: safety, accessibility, wrong step, other. A published response standard says how and when reports are handled.

Acceptance:
- The link is on every template.
- A report holds the page key, the category and the text the visitor writes. No account or name is required.
- Safety reports are triaged the same working day (proposal). The standard is published on the editorial policy page.
- Reports are kept for a set period, stated in [14](14-trust-safety-accessibility-privacy.md).

Depends on: [14](14-trust-safety-accessibility-privacy.md).

Risks / not doing: A report box that collects health stories. The form warns against health details.

### WEB-059 · Intent hub template

Priority P0 · Phase S2 · Status partial · Pillars: all

Why: "One carefully differentiated hub per search intent" ([VISION, search architecture](../../../VISION.md); [DESIGN §4A](../../../DESIGN.md)). The baseline has four hubs.

What: Every hub follows the template: a task-precise heading, an opening answer, a written selection rule, cards listed by key, fit and safety notes, short FAQs, a byline and a date, and an app link only when the app's workflow is distinct. The hub rules are in [02 §6](02-information-architecture.md#6-hub-rules).

Acceptance:
- Every hub passes H1 to H4 in [02 §6](02-information-architecture.md#6-hub-rules).
- Hub text is unique; an automated check flags reused paragraphs.
- Each hub has a "not for" line.
- Passes the checks in [WEB-075](#web-075--accessibility-tests-in-ci).

Depends on: [02 §6](02-information-architecture.md#6-hub-rules), [WEB-075](#web-075--accessibility-tests-in-ci).

Risks / not doing: Hub sprawl. The rules and the publish threshold do the work.

### WEB-060 · Art-therapy boundary page

Priority P0 · Phase S1 · Status new · Pillars: CALM, CARE

Why: "Art therapy is a professional practice, not a marketing synonym for crafts" ([MISSION, "Evidence and humility"](../../../MISSION.md)). Visitors search for art therapy ([R3 §4.1](research/03-art-therapy-wellbeing.md)), and the profession has protected titles that vary by place ([R3 §2](research/03-art-therapy-wellbeing.md)).

What: `/art-therapy-and-creative-activities/` explains that art therapy is a regulated profession in several countries, that credentials vary by place, what our activities are (creative, recreational and supportive), and where to find a qualified art therapist. It links to professional bodies only after the links are checked on the publish date.

Acceptance:
- Reviewed by a registered art therapist (ATR or ATR-BC, or HCPC-registered in the UK) before publish ([R3 §7](research/03-art-therapy-wellbeing.md)).
- Uses "art therapy" only to describe the profession, never for our activities.
- Protected-title wording checked against the BAAT and HCPC pages ([R3 §2](research/03-art-therapy-wellbeing.md)).
- Contains no treatment or outcome claim.

Depends on: [WEB-057](#web-057--byline-and-reviewer-block), [WEB-061](#web-061--crisis-safe-route), reviewer named in [README](README.md#open-questions).

Risks / not doing: Writing the boundary page as a sales page for our activities. It explains a profession and points elsewhere.

### WEB-061 · Crisis-safe route

Priority P0 · Phase S1 · Status new · Pillars: CALM, CARE

Why: "Any activity that invites personal disclosure… should carry a visible, plain-language crisis route. Do not wait for a keyword match" ([R3 §4.4](research/03-art-therapy-wellbeing.md)). No creative-activity site reviewed in R3 shows one on its activity pages.

What: A plain-language note on any card or page that invites journaling about feelings, grief or loss. It lists local routes by the visitor's region (for example Samaritans on 116 123 in the UK and Ireland, and the local emergency number). Routes are checked against official pages before publishing.

Acceptance:
- Routes are verified on the publish date.
- The note is visible without scrolling on the card.
- No disclosure is stored. No risk score and no diagnosis is made.
- The list of routes is kept per locale in [13](13-localization.md).

Depends on: [13](13-localization.md), [WEB-057](#web-057--byline-and-reviewer-block).

Risks / not doing: Routes go out of date. Recheck them on each review cycle.

### WEB-062 · Translation status and no-index for unreviewed copies

Priority P0 · Phase S1 · Status partial · Pillars: all

Why: 189 locale codes of machine-translated guides exist and are unreviewed, and most are held from the search index ([README](README.md#where-we-are-today-baseline-checked-2026-11-14-on-main-at-dab0f10)). "Translations reviewed for usability" is a MISSION requirement ([MISSION, "Accessible by default"](../../../MISSION.md)). Unreviewed mirrors are a penalized pattern ([R5 §2.3–§2.4](research/05-search-scale-trust.md)).

What: Every translated page shows "machine-translated, not yet reviewed" or the review date. Unreviewed copies are excluded from the index. The language menu links only to reviewed copies, or to English with a notice in the target language. Whether the label and the exclusion are in place is to be verified.

Acceptance:
- No unreviewed copy appears in any sitemap (automated check).
- The notice text is in its own language and is accessible.
- `hreflang` links only reviewed pairs.

Depends on: [13](13-localization.md), [02 §8](02-information-architecture.md#8-canonical-keys-and-locale-mapping).

Risks / not doing: Hiding all translated copies would lose real readers. Show the reviewed ones and label the rest.

### WEB-063 · Sitemaps, IndexNow and llms.txt

Priority P1 · Phase S2 · Status exists · Pillars: all

Why: Discovery and AI reading depend on clean sitemaps and stable canonical URLs ([VISION, GEO](../../../VISION.md)). The baseline has sitemaps, IndexNow and llms.txt.

What: Keep them. Add cards and hubs when they pass rules, include only indexable URLs and reviewed locales, and keep llms.txt consistent with the claim rules.

Acceptance:
- Sitemaps list only indexable URLs: no filter combinations and no unreviewed locales.
- llms.txt describes the pillars and the scope line in the same words as the site.
- IndexNow is sent when a card or hub is published.

Depends on: [WEB-062](#web-062--translation-status-and-no-index-for-unreviewed-copies).

Risks / not doing: llms.txt is not a ranking lever. It describes the site accurately.

### WEB-064 · Answer-first summaries

Priority P1 · Phase S2 · Status partial · Pillars: all

Why: Citations matter more than rank in AI answers, and self-contained pages are cited more ([R5 §2.5](research/05-search-scale-trust.md); [VISION, GEO](../../../VISION.md)). The baseline has a summary on cards and a lede on hubs.

What: Each card and hub opens with a two-sentence answer block: what it is, who it suits and what it needs. It reads correctly on its own when quoted.

Acceptance:
- Under 60 words.
- Stands alone when read without the page.
- Uses only words allowed by the claim rules ([WEB-023](#web-023--scope-line-on-every-page)).
- Matches the visible text (checked with [WEB-056](#web-056--structured-data-that-matches-visible-content)).

Depends on: [WEB-059](#web-059--intent-hub-template).

Risks / not doing: Writing for AI rather than people. The test is whether a tired visitor would find it useful.

### WEB-065 · Printables index

Priority P1 · Phase S2 · Status partial · Pillars: all

Why: DESIGN lists "Printables" as a top-level section ([DESIGN §3](../../../DESIGN.md)); printable templates are first-class content ([R1 §3.7](research/01-craft-diy-platforms.md)). The baseline has packs, pictures and a handout, with no index page.

What: `/printables/` lists packs, cards by pillar, picture sheets and the handout. Each item shows its version and date and any print notes.

Acceptance:
- Every printable shows version and date.
- No printable requires an account.
- The index is navigation only and does not repeat a hub's list.

Depends on: [WEB-016](#web-016--versioned-prints), [WEB-017](#web-017--printable-pack-builder).

Risks / not doing: A catalog of printables that nobody prints. Track prints in the metrics ([17](17-metrics-and-evidence.md)).

### WEB-066 · AI assistant

| Priority | Phase | Status | Pillars | Notes |
|---|---|---|---|---|
| P3 | S4 | new | all | Scoped to the library: it finds and explains cards, cites each card it uses, and links to it. It refuses health, diagnosis and treatment questions and points to professionals. It stores no personal data. It is opt-in and visibly labeled. It is evaluated against a fixed test set before launch. It is not a general chatbot ([MISSION, "What we are not"](../../../MISSION.md)). Model and hosting choices are in [15](15-platform-data-architecture.md). |

### WEB-067 · Today quick answers

| Priority | Phase | Status | Pillars | Notes |
|---|---|---|---|---|
| P2 | S2 | exists | CARE, CALM | The "What is hardest today?" tool in the baseline gives quick answers and local notes. Keep it. Check its copy against the claim rules, and keep it free of stored answers. |

---

## I. Privacy, notifications and quality

### WEB-068 · Privacy-minimal analytics

Priority P0 · Phase S2 · Status partial · Pillars: all

Why: "Collect the minimum data necessary" ([MISSION, "Privacy"](../../../MISSION.md)); "avoid third-party trackers… keep anonymized analytics minimal and consent-aware" ([DESIGN §7](../../../DESIGN.md)). The baseline loads Google Analytics 4 site-wide except on the photo game. That conflicts with DESIGN and needs a decision.

What: Define the events the north-star needs: card view, print, save, "We tried this", "This didn't fit", share and finder use. Choose one of two routes and record the choice in [15](15-platform-data-architecture.md) and [17](17-metrics-and-evidence.md): (a) keep GA4 but restrict it to these events, with consent where required; or (b) a privacy-first, cookieless count.

Acceptance:
- Event payloads hold the card key, the event type and the count only. No health terms, no free text, no child data.
- Consent is requested only where the law requires it.
- The photo game stays excluded.
- The decision is recorded with its reason.

Depends on: [15](15-platform-data-architecture.md), [17](17-metrics-and-evidence.md).

Risks / not doing: Losing the measure. The north-star depends on this item, so the decision is needed before S1 exit.

### WEB-069 · No ads, no third-party embeds, and a cookie rule

Priority P0 · Phase S2 · Status partial · Pillars: all

Why: "No ads masquerading as activity instructions" and no "pop-up before the first activity" ([DESIGN §7](../../../DESIGN.md); [DESIGN §9](../../../DESIGN.md)). Ad-supported family surfaces are a named risk ([R2 §7](research/02-parenting-kids-platforms.md)). The baseline's header allows only the site and Google's analytics endpoints.

What: No ads and no third-party embeds (video players, chat widgets, social pixels) on card, hub, pack, game and guide pages. The Content Security Policy keeps enforcing this, with the analytics exception resolved by [WEB-068](#web-068--privacy-minimal-analytics). A cookie banner appears only if non-essential cookies exist. Declining is as easy as accepting, and declining is the default.

Acceptance:
- Automated test: no third-party script or frame on card and game pages.
- Content Security Policy enforced on all templates.
- No pop-up or interstitial before the first activity.
- A cookie banner, if shown, has equal "accept" and "decline" controls.

Depends on: [WEB-068](#web-068--privacy-minimal-analytics).

Risks / not doing: Future video or chat widgets. Each one needs a separate review against this item.

### WEB-070 · Notification policy

Priority P0 · Phase S2 · Status new · Pillars: all

Why: "No guilt-driven notifications" and "no manufactured urgency" ([MISSION](../../../MISSION.md)); "without push-notification pressure" ([VISION, Stage 2](../../../VISION.md)); streak shame and guilt messages are unsuitable for carers ([R2 §7](research/02-parenting-kids-platforms.md)).

What: The website sends no push notifications and asks for no browser notification permission. Any reminder is set by the visitor, off by default, and written in neutral language. The app's reminders are covered in [04](04-features-app.md).

Acceptance:
- No notification permission request on any page.
- No "you missed" or count-based message anywhere.
- Reminder copy passes the no-shame review.

Depends on: none.

Risks / not doing: A reminder feature that starts a streak by default. Off by default is a rule, not a setting.

### WEB-071 · Email digest, opt-in only

Priority P1 · Phase S2 · Status new · Pillars: all

Why: "Free weekly plan by email" is a low-commitment entry point ([R2 §3.4](research/02-parenting-kids-platforms.md)). "Opt-in newsletter organized by situation… one activity per email" ([R5 §4](research/05-search-scale-trust.md)). Email is the only channel we own ([R5 §4](research/05-search-scale-trust.md)).

What: An optional email with a weekly plan or new cards by situation. Double opt-in. One-click unsubscribe. No birth dates and no tracking pixels.

Acceptance:
- The sign-up page says what will be sent and how often.
- Unsubscribe works in one click without a login.
- The list is stored separately from any other personal data, and the retention period is stated in [14](14-trust-safety-accessibility-privacy.md).
- No streak, urgency or guilt language. Each email has a plain text version.

Depends on: [WEB-031](#web-031--weekly-plan-printable), [14](14-trust-safety-accessibility-privacy.md).

Risks / not doing: Email is personal data. Keep the list small and the data minimal.

### WEB-072 · Child-facing pages rule

Priority P0 · Phase S2 · Status new · Pillars: GROW

Why: "Children: COPPA / UK Age Appropriate Design Code by default; no child accounts, no child-facing data collection, no public child images" ([brief](_WRITER_BRIEF.md)). The amended COPPA rule and the UK children's code both apply to online services ([R5 §5.1](research/05-search-scale-trust.md); [R2 §7](research/02-parenting-kids-platforms.md)).

What: Before any child-directed page or card ships, these rules apply: no accounts, no ads or third-party embeds, no collection of child data, no child images without a written release, and high privacy by default. A child-directed page is labeled as such. A privacy review is recorded before launch.

Acceptance:
- Child-directed pages pass the checks in [WEB-069](#web-069--no-ads-no-third-party-embeds-and-a-cookie-rule).
- No form on a child page collects a child's data.
- Any share feature on a child page is adult-initiated and carries no child identifiers.
- A privacy review record exists before the first child page goes live.

Depends on: [14](14-trust-safety-accessibility-privacy.md), [WEB-068](#web-068--privacy-minimal-analytics).

Risks / not doing: Legal advice is required. This item states the product rule, not a legal opinion.

### WEB-073 · Image consent and rights log

Priority P0 · Phase S2 · Status new · Pillars: all

Why: Uploads and photos of older adults and children create consent and rights issues, and no child's face may be published without a parental release ([R5 §5.5](research/05-search-scale-trust.md)). "Original media and licenses we control" is a moat ([VISION](../../../VISION.md)).

What: Every image has a record: source, author or photographer, license or release, consent for any identifiable adult (or a legal representative where the person cannot consent), and a flag if a child appears. Records are kept outside the public site.

Acceptance:
- Every image on a card page has a log entry before publication.
- No public child images. Any exception needs a written release and a privacy review ([MISSION, "Children"](../../../MISSION.md) brief rule).
- A person with dementia in an image is covered by consent from a legal representative, where applicable.
- The log is checked at publish time.

Depends on: none.

Risks / not doing: Stock images without a release for people. Use only images without identifiable people, or with a release.

### WEB-074 · Performance budget

Priority P0 · Phase S1 · Status partial · Pillars: all

Why: Core Web Vitals targets are LCP ≤ 2.5 s, INP ≤ 200 ms and CLS ≤ 0.1 at the 75th percentile ([DESIGN §7](../../../DESIGN.md); the web performance rules). Low-speed connections are a named requirement.

What: LCP, INP and CLS are measured for the card, hub and finder on mobile and desktop. JavaScript and CSS budgets apply per template. Images have explicit dimensions and modern formats with fallbacks. Fonts are limited, and only the critical weight is preloaded.

Acceptance:
- A Lighthouse or equivalent check runs in CI for each template.
- No layout shift from images or fonts.
- Field data is reviewed after launch against the targets.
- Images have explicit dimensions and fallbacks.

Depends on: [WEB-038](#web-038--works-without-javascript-within-a-page-budget).

Risks / not doing: Lab scores are not field data. Both are needed.

### WEB-075 · Accessibility tests in CI

Priority P0 · Phase S2 · Status partial · Pillars: all

Why: The baseline runs axe on key pages. DESIGN asks that every token pairing is validated for contrast, and the web testing rules add keyboard, reduced-motion and visual checks at each breakpoint ([DESIGN §2](../../../DESIGN.md)).

What: Add axe to every template in CI. Add keyboard-path and reduced-motion tests. Check contrast for every token pairing. Add visual regression at 320, 768, 1024 and 1440 for the card and the finder.

Acceptance:
- CI fails on any new axe violation.
- A contrast table covers every token pairing and is checked on change.
- Visual screenshots are compared at the four widths, and in both themes if WEB-042 ships.
- Manual assistive-technology checks are logged for each release.

Depends on: [WEB-036](#web-036--keyboard-focus-and-screen-reader-on-every-template), [WEB-037](#web-037--zoom-and-small-screen-reflow).

Risks / not doing: Tests that pass on empty templates. Run them on real content.

### WEB-076 · Due-for-review queue

Priority P1 · Phase S2 · Status new · Pillars: all

Why: "Updates overdue" is a quality metric ([VISION, metrics](../../../VISION.md)); "due-review" is a status in [02 §4.4](02-information-architecture.md#44-editorial-status-not-a-visitor-filter).

What: An internal list of cards, hubs and guides past their review date, sorted with safety-flagged cards first. Each public card shows its last-checked date and status.

Acceptance:
- The queue is generated from frontmatter dates.
- A card past its review date shows its date and status.
- Safety-flagged cards appear first.
- The queue is internal and not published.

Depends on: [WEB-057](#web-057--byline-and-reviewer-block).

Risks / not doing: A queue nobody works. Assign an owner before S2.

---

## Counts

| Priority | S1 | S2 | S3 | S4 | Total |
|---|---|---|---|---|---|
| P0 | 31 | 1 | 0 | 0 | 32 |
| P1 | 5 | 26 | 1 | 0 | 32 |
| P2 | 1 | 5 | 5 | 0 | 11 |
| P3 | 0 | 0 | 0 | 1 | 1 |
| **Total** | **37** | **32** | **6** | **1** | **76** |

Status against the baseline: 7 `exists`, 26 `partial`, 43 `new`. The `exists` items are the finder, the stop note, large text and contrast settings, the on-device photo game, the structured data, the sitemaps and IndexNow, and the Today tool. The `partial` items are mostly features where the baseline has a piece (for example the print card or the axe checks) and the rest is listed in the item.

---

## Open questions

1. **Analytics route.** WEB-068 needs a decision between restricted GA4 and a cookieless count. Which one, and who signs off the trade-off?
2. **Step images.** WEB-012 needs photographs or illustrations for every S1 card. Who produces them, and what is the budget?
3. **Print URL and easier side.** Confirm the baseline print card's URL, and whether its easier side and stop note are printed (WEB-014).
4. **Crisis routes by region.** WEB-061 needs a route list per locale, checked against official pages. Who keeps it current?
5. **Child-facing scope.** WEB-072 applies before S2 child content. Does privacy counsel review the rule before S2 starts?
6. **AI assistant.** WEB-066 is P2 and S3. Does the evidence of search and use support building it at all?
7. **Count-display threshold.** WEB-025 uses a proposed minimum of 20 before showing a count. Test with the first cards.
