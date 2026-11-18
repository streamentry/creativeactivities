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

Priority P1 · Phase S2 · Status partial · Pillars: all

Evidence (2026-11-16): the finder has a box above its filters where a few words become removable choices (`site/src/lib/situation.ts`, `site/src/tools/DescribeSituation.tsx`). "My father likes music but tires quickly" gives the music kind, seated and low energy. The first version reads a list of words and phrases, not a language model. A number of minutes is put in the finder's time bands, a child's age means a child is taking part, and a word turned around by "not", "dislikes", "difficulty" or "hard of" is left out ("she does not like music" and "difficulty walking" give nothing). A negation stays inside its clause, so "no mess, quick" keeps "quick", and it covers phrases as well as words ("she is not in bed, she is in the garden" gives the garden and not the bedside). Ordinary words are not rules by themselves: "short term memory loss", "some sort of music", "hard of hearing" and "loves loud music" give nothing the person did not ask for. The chips use the finder's own words and can be removed with the keyboard, focus stays in the box, and the results and the address change once after a pause in typing. The words are not sent, stored or put in the address (tested by scanning the code), the browser's spell-check is off in the box so an enhanced spell-check cannot send them, and a note beside the box says so. It also says that the choices read from the words are put in the filters and so appear in the address, as any filter picked by hand does. A choice made by hand after the box set it is not overruled while the words say the same thing about it, going back in the browser clears the box, and removing a chip is about the words that made it. A word that names a condition, a diagnosis or a feeling that points to one gives nothing (tested with 27 such words and over the whole rule list). With no known word the box says it could not turn the words into choices and points to the filters below. 41 test situations taken from 01 §3 each give the expected choices, and the cases an independent review found (negated phrases, contractions, clauses, ordinary words, ages) are tests (`site/src/lib/situation.test.ts`). The finder still passes the accessibility check at 320 to 1440 px and 200% text. Not done: an editor's check of the situations and of what each word maps to (one author wrote both); words and phrases in other languages (the box is English only); a mapping for needs the finder has no question for (grip, vision, one hand).

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

Priority P1 · Phase S2 · Status partial · Pillars: all

Evidence (2026-11-16): `/search/` searches activity cards, situations (hubs), games and the live English guides, and a "Search" link sits in the header of every page (it opens the English page from other languages). Results list activities first, then situations, games and guides. A question must match every word; if no page does, the closest matches are shown and say so; if nothing matches, the page says so and links to the activity finder. Words are matched with a light stem, so "painting", "paints" and "watercolor" meet, and with an editor-owned list of 37 synonym groups (`site/src/data/search-synonyms.ts`: "nan", "granny" and "grandma" are one word; "care home" and "nursing home" are one phrase). `site/src/lib/search.test.ts` checks the list has 30 or more groups, that no word sits in two groups, that no group maps an everyday word to a condition, diagnosis or treatment, and that ten sample questions find the right page in the real content. The question stays in the browser: no storage, no request except the index on this site, no analytics event, and it is kept out of the address so page-view reports cannot see it (all tested by scanning the search code). The box is labeled and keyboard-operable and the page passes the accessibility check at 320 to 1440 px and 200% text. Not done: a search box on every page (there is a link, not a box); an editor's review of the synonym groups (one author wrote them); a basic query without JavaScript (the page offers the finder and the "what I have" page instead); a screen-reader test of the results; other languages; the rule that every query returns a card or hub (a query that matches only guides shows guides).

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

Evidence: `site/src/lib/lower-effort.test.ts`: `lowerEffortPick` (never the top card, never heavier on any dimension, strictly lighter on one) and `lowerEffortReasons`; rendered in `ActivityFinderView.astro` (`#finder-lower`) and updated on every choice. Remaining: usability sessions (five of five participants can say why a card was offered) need people.

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

Priority P1 · Phase S2 · Status exists · Pillars: all

Evidence: `site/src/lib/finder-state.test.ts` (serialize/parse round trip, only facet values, no search text, noindex from three fit filters); finder script in `site/src/views/ActivityFinderView.astro` restores choices from the query, uses `history.pushState` per change and `popstate` for Back, and sets robots noindex for three or more fit filters; `site/scripts/check-site.mjs` checks the `/activity/` canonical, that it is indexable, and that the bundled finder script carries the noindex rule. Checked in a browser (2026-11-15): reload restores results, Back returns to the previous choice, search words never reach the URL.

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

Priority P1 · Phase S2 · Status partial · Pillars: MAKE, CARE, GROW

Evidence (2026-11-16): `/what-i-have/` lists 61 everyday items in seven groups, each with its own checkbox label (`site/src/data/materials.ts`). Ticking items shows the cards whose every need is met, and a card that is one thing short is listed apart with the missing choice named. `site/src/data/card-needs.ts` records, for all 53 cards, which groups of items each needs (a group is met by any one of its items, as in "a glue stick or double-sided tape") and which extras are optional. `site/src/data/materials.test.ts` reads every line of every card's materials list both ways: a line that names an item must be recorded, a recorded item must be named in the card, and a line that names nothing must be one of the few not asked about (furniture, tap water, comfort extras). `site/src/lib/what-i-have.test.ts` checks that no card is shown ready when it needs something that was not ticked. The card's own substitutions show beside each result under "If something is missing". The ticked list stays in this browser (`ca-what-i-have-v1`, listed in the data inventory and on `/your-data/`) and the page has a "Clear my list" button. With the editors' picture of a plain household stash (23 items: paper, pens, crayons, scissors, glue stick, tape, bowls, cups, towels, photos, a music player and the like) 21 cards are ready, above the proposed 20. Checked: build 16,527 pages, `check-site` 0 errors, `check:a11y` 0 failing of 123 (the page passes at 320 to 1440 px and 200% text). Not done: a reviewer's check of the 61 items and of each card's record (one author classified them, so a wrong match is possible; the page tells people to read the card's own list); the materials class facet (nothing needed, things at home, simple purchase, specialist) and a "substitute: yes" mark on an item; other languages; the link from [WEB-002](#web-002--describe-your-situation).

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

Evidence: `site/src/lib/related.test.ts` and `site/src/lib/related.ts`: hand-picked `related` first, then the best functional matches (type, setting, senses, energy, group, material class) to three, never a keyword-only match; used in `ActivityView.astro`. Remaining: the one-time human review of each card's related list before S1 exit.

Why: VISION asks that related activities are chosen by "functional similarity, not arbitrary keywords" ([VISION, "Each activity page should answer the entire task"](../../../VISION.md)). Cards have a `related` field in the baseline.

What: The related list is computed at build time from shared facets (setting, energy, materials class, group) and a short functional tag. Each card shows three or four related cards.

Acceptance:
- Every card's related list is reviewed once before S1 exit.
- No two related cards share only a keyword.
- A related link crosses pillars only when the function matches.

Depends on: [02 §7](02-information-architecture.md#7-one-activity-in-many-places-without-cloning).

Risks / not doing: Auto-generated related lists can look random. Review them.

### WEB-009 · Pillar tiles and pillar hubs

Priority P1 · Phase S2 · Status exists · Pillars: all

Why: MISSION names the situations, and the six pillars organize them ([README](README.md#pillars)). Visitors who do not know what they want need a way in besides search.

What: Tiles on `/activity/` and the home page link to pillar hubs. They are the live section pages `/crafts/`, `/together/`, `/creative-calm/` and `/caregiving/` (older adults and dementia care); the spec's earlier paths `/make/`, `/calm/` and `/for-older-adults/` were never built and are not needed (decided 2026-11-19 to keep live URLs). `/kids/` stays a section, not a pillar, until the child-facing gate and SEO-041 are decided; its home tile is kept. Hubs follow the template in [WEB-059](#web-059--intent-hub-template).

Evidence (2026-11-19): `site/src/data/pillars.ts` holds each pillar's opening, selection rule, not-for line, card rule and intent hubs; `SectionView.astro` shows them above the guide list in English only (translated pages unchanged); `pillars.test.ts` checks six or more real cards, the overlap rule against every hub list, banned words and hub links. Browser at 390 px: `/caregiving/` shows six cards and three hub links, no sideways scroll; `/de/caregiving/` unchanged.

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

Evidence: the activity page has Start (moves focus to step 1), Print and Save as labelled buttons. Body text is 20 px. Gap: at 375 px the glance facts start about 950 px down because the mobile site header is 301 px tall; a compact mobile header is a site-wide decision.

Why: "An activity, ready in one glance" is the signature experience ([DESIGN §1](../../../DESIGN.md)). MISSION asks that a person can start in roughly a minute ([MISSION, "The product promise"](../../../MISSION.md)).

What: The top of each card shows the name, a one-sentence purpose, the time, the materials, mess, setting, cost and help level, followed by Start, Print and Save. The baseline has the facts and a "Start activity" link to the steps. Print and Save on the card need checking (verify).

Acceptance:
- All glance facts are visible without scrolling on a 375 px wide screen.
- Start moves focus to step 1, not only the scroll position (baseline behavior, keep it).
- Print and Save work by keyboard, with labels.
- Body text is at least 18 px on the page (DESIGN §2).

Depends on: [WEB-014](#web-014--one-sheet-two-sided-printable-card), [WEB-028](#web-028--saved-collections-on-the-device).

Risks / not doing: More than three buttons dilutes the first action. Keep these three.

### WEB-012 · Step photos or illustrations

Priority P0 · Phase S1 · Status partial · Pillars: all

Evidence: every one of the 38 cards has two original drawings in the house kit: the finished result (`activity-results-a.ts`, `activity-results-b.ts`, plus `vase-of-flowers` in `home.ts`) and "What you need" with `kind: materials` (`activity-materials-a.ts`, `activity-materials-b.ts`). Acceptance bullet 1 (materials and result) holds for all 38. Each image has specific alt text, a caption and a provenance entry (`docs/specs/asset-provenance.json`, 274 site images, checked by `asset-provenance.test.ts`); schema rules in `activity-schema.ts` (`kind: materials` never with a step). Materials drawings are served at `/pictures/<id>.svg` but kept out of `PICTURES`, so the games, the printable gallery and the app library do not get busy multi-object scenes. In print the result drawing floats beside the steps and the materials drawing is omitted (the list covers it), so cards stay one two-sided sheet at 12 pt. Per-step images are optional (DESIGN §4B: "optional image"); none yet. Still open: rights review of the drawings (all `unreviewed`), real process photos if wanted, and redraws of the weakest (hand massage, towel stack, torn-paper flower).

Why: VISION asks for "original activity media" and "photographed or illustrated steps" ([VISION, "Moat we can actually build"](../../../VISION.md)). DESIGN says photos should never be the only form of instruction ([DESIGN §2](../../../DESIGN.md)). Before 2026-11-15 none of the 38 card files referenced an image.

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

Evidence: Chips in `site/src/views/ActivityView.astro` are real links (`#<kind>`) with `aria-current`; JS marks and focuses the chosen version without reload (`site/src/styles/studio-activity.css`); all versions stay in the HTML and print. Checked in a browser with JS on and off (2026-11-15). Remaining: each variation must change at least one step (content review across the 38 cards).

Why: One idea, many adaptations, is a core differentiator ([MISSION, "What makes us different"](../../../MISSION.md)). Variations exist as text in the baseline; switching between them is new.

What: Variations appear as chips above the variations section. Choosing one shows it without a reload and updates the URL fragment. All variations stay in the HTML, so printing and screen readers see them.

Acceptance:
- Chips are real links that work without JavaScript.
- Focus stays on the chosen variation.
- Each variation changes at least one step, not only a sentence.
- Printing shows all variations unless one is selected.

Depends on: [WEB-014](#web-014--one-sheet-two-sided-printable-card); variation kinds in [02 §4.2](02-information-architecture.md#42-fit-facets).

Risks / not doing: Hiding variations behind a switch can hide them from search and from print. Keep them in the HTML.

### WEB-014 · One-sheet, two-sided printable card

Priority P0 · Phase S1 · Status partial · Pillars: all

Evidence: `site/scripts/check-print.mjs` (`pnpm check:print`): all 38 activity cards print as exactly two pages (one sheet, both sides) on A4 and US Letter, front = what you need and what to do, back = make it easier or different and safety, navigation hidden, no background color needed. Body text now 12 pt (headings 14 pt, title 22 pt) in `site/src/styles/activities.css`; the back carries a print-only line `Version <updated date> · creativeactivities.org/activity/<slug>/` (WEB-016). Result of the 2026-11-15 run: 38 of 38 pass on A4 and Letter at 12 pt. Remaining: a printed copy checked on paper by a person (black and white, older reader) and the stop note check on the real sheet.

Why: The Activity Card is "the memorable feature" and a potential distribution channel ([DESIGN §8](../../../DESIGN.md), [VISION](../../../VISION.md)). Printables are the way to reach people without a screen ([R1 §3.7](research/01-craft-diy-platforms.md)).

What: One sheet per activity, two sides as DESIGN §8 describes ("What you need" and "what to do" on one side, "Make it easier / make it different" on the other), with the title and image, what you need and what to do, the easier side ("make it easier or different"), the note "It's okay to stop or change it", a source line and a short URL or QR code. The baseline has a print card with a QR code. Checking the easier side and stop note on the print is needed (verify).

Acceptance:
- Fits on one A4 sheet and one US Letter sheet at 100% scale, printed on both sides (exactly two pages); the back starts with "Make it easier or different".
- Body text is at least 12 pt in print (proposal), and the stop note is never cut.
- Works in black and white.
- Shows the card version and date ([WEB-016](#web-016--versioned-prints)).

Depends on: [WEB-015](#web-015--no-ink-no-url-print-version), [WEB-016](#web-016--versioned-prints), [WEB-012](#web-012--step-photos-or-illustrations).

Risks / not doing: Long cards are cut at the wrong place. Cut the photo first, never the stop note or the safety flags.

### WEB-015 · No-ink, no-URL print version

Priority P0 · Phase S2 · Status partial · Pillars: all

Evidence: print styles hide the header, footer, breadcrumbs and navigation (`site/src/styles/components.css`, `site/src/styles/activities.css`). The card prints on one A4 and one US Letter sheet, two sides, at 12 pt (`site/scripts/check-print.mjs`, 38 of 38 on 2026-11-15). The card does not depend on the QR code or the URL. Not done: no test yet on one inkjet and one laser printer or from a phone's print dialog (a person must run it; record the device list with the result). Print hides the "At a glance" panel and the About text, so print is not yet identical to the web page.

Why: DESIGN requires that the print page works with no internet, no color ink and no URL access ([DESIGN §4B](../../../DESIGN.md)). Print styles exist in the baseline; their results on real devices are not recorded.

What: `@media print` removes navigation, banners and decoration, keeps the materials and steps in large type, and prints the same content as the web page. Printing works from a phone's print dialog.

Acceptance:
- Printed card is legible in black and white on one inkjet and one laser printer (device list kept with the test record).
- No navigation, banner or cookie notice prints.
- Print content matches the web content exactly. No print-only claims.
- The card works with no URL or QR code.

Depends on: [WEB-014](#web-014--one-sheet-two-sided-printable-card).

Risks / not doing: No print-only rewrite of claims. Print is a rendering of the same card.

### WEB-016 · Versioned prints

Priority P0 · Phase S2 · Status partial · Pillars: all
Evidence: the print-only footer line `Version <date> · creativeactivities.org/activity/<slug>/` (`site/src/views/ActivityView.astro`, class `print-version`). The web page shows the same version date under "What changed" (`site/src/components/ActivityChanges.astro`). Each change is dated, safety changes are labelled, and the web page says that a printed copy made before a safety change may not show it. Tests: `site/src/lib/activity-changes.test.ts`. A card printed in a pack, fixed or built with the pack builder, ends with `Version <date>` (the card's own date) and its address (`site/src/components/ActivityPrintCard.astro`), and `check-site` fails a built pack page when a printed card shows no version date. Not done: the version is the card's date, not a version number; there is no separate last-checked date; a printed pack's cover has no version of the cards it holds, only the builder's layout date.

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

Priority P1 · Phase S2 · Status partial · Pillars: all

Evidence (2026-11-16): `/activity/pack/` lets a visitor tick up to eight of the 53 cards and choose one version for the whole pack, then prints a cover and the cards. The page keeps nothing and sends nothing itself: the pack is only in the address (`?cards=…&variation=…`, activity names and a version), so a link opens the same pack, and the page says that a visitor who has allowed visit counts shares that address with the analytics tool like any other page address. Names in a hand-made or old link are trimmed and checked, and anything left out (a card that is gone, one without the chosen version, more than eight) is said in a message and never dropped silently (`site/src/lib/pack.ts`, `pack.test.ts`). A card is in a pack only with the chosen version: its box is dimmed but still reachable by keyboard and says why (no such version, or the pack is full) in the row, in a note and in a status message, and changing the version takes out the cards that lack it and says how many. The cover lists the cards and "Main supplies", built from `card-needs.ts`: groups are merged, a group that a narrower group already covers is dropped, and extras no card needs are shown apart as "Nice to have". The list holds only items on the 61-item list, so the cover says what it assumes (a table or tray, a chair, tap water, a place to wash hands) and that each card lists everything else it needs. A seeded test over 600 random packs and shelves shows that someone who has one item from every group on the list can make every card in the pack and nobody else can, and the list is never longer than the cards listed one by one. The page count is shown before printing as "up to N pages". `scripts/check-print.mjs` prints every card through the builder on A4 and Letter and fails when a cover is over two pages or a card is over two, searches with the page itself for the pack with the longest supply list (35 lines for eight cards), which prints on 18 pages on both sizes, exactly the stated limit, and checks that three cards named out of order print in that order, each in the bedside version. A unit test keeps the limits in that script equal to the ones the page states. The printed cover carries a six-character pack key, the builder's layout date as its version, the address, and "Free to print and share for personal and noncommercial use", and every card in the pack ends with its own version date. The page is `noindex` and linked from the finder; it can also start from the activities saved on this device, which it reads and does not change. It counts as an app page for the page weight budget, as the finder does, because it carries all the cards as well as its pickers; its first-paint styles are 14.9 kB gzipped, and the print-only styles are in the file linked for print. The version choices are 48 px chips, and the accessibility gate (`check:a11y`) covers the page empty and with a pack chosen. Not done: one version per card (the version is for the whole pack); an exact page count (it is an upper bound, and a printer's settings can change it); a PDF (PLAT-019); a static pack page per key with a reviewer's sign-off; a version number and a last-checked date on each card (each printed card shows its own date, but [WEB-016](#web-016--versioned-prints) is partial, and the cover shows only the builder's layout date); a reviewer's check of the supply lists and of the lines the list leaves to each card, such as chairs and blankets (one author classified the needs, as for [WEB-006](#web-006--what-i-have-mode)); materials scaled to a group ([WEB-046](#web-046--group-mode-for-facilitators)); other languages; a test with a screen reader, in Firefox or Safari, or on real printers.

Why: VISION Stage 2 tests "one sharable printable pack" ([VISION, Stage 2](../../../VISION.md)). Printable collections are a gap in free offers ([R2 §6](research/02-parenting-kids-platforms.md)). The baseline has two fixed packs.

What: A visitor picks five to eight cards, sees a supply list and a checklist, and prints one set of pages. No account. The builder output is a pack page with its own key and version.

Acceptance:
- The page count is shown before printing.
- The supply list combines materials and removes duplicates.
- A card can be added only with its chosen variation.
- The pack states "for personal, noncommercial use" (VISION's print and share permission).

Depends on: [WEB-014](#web-014--one-sheet-two-sided-printable-card), [WEB-016](#web-016--versioned-prints).

Risks / not doing: Bulk copying for resale. The noncommercial line and the free-core rule cover it. No watermark on a family's own print.

### WEB-018 · Large-print editions

Priority P1 · Phase S2 · Status partial · Pillars: CARE, MAKE

Evidence (2026-11-17): every one of the 53 cards has a large-print edition at `/activity/<slug>/large-print/` (`site/src/views/LargePrintView.astro`, `large-print.css`), linked from the card and from the fixed packs, with a larger QR code, and not indexed. `pnpm check:print` prints all 53 on A4 and US Letter and fails the run unless the step text prints at 18 pt or more, each edition fits in 5 pages, and its steps are word for word the standard card's. Not done: the test with at least three people who read large print in their daily lives; a check in black and white beyond printing without backgrounds, which is how a browser prints; and a link from the pack builder.

Why: Low vision is one of the situations we must serve ([01, row 12](01-positioning-and-audiences.md#3-situations)), and DESIGN asks for large type and strong contrast ([DESIGN §6](../../../DESIGN.md); [MISSION, "Accessible by default"](../../../MISSION.md)).

What: A large-print layout for each card, with steps in at least 18 pt and a larger QR code. Offered as a button on the card and on pack pages.

Acceptance:
- Step text is at least 18 pt (proposal) and high-contrast.
- Tested with at least three people who read large print in their daily lives.
- The content is the same as the standard print.
- Works in black and white.

Depends on: [WEB-014](#web-014--one-sheet-two-sided-printable-card), [WEB-015](#web-015--no-ink-no-url-print-version).

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

Priority P1 · Phase S2 · Status partial · Pillars: all

Why: Reading aloud helps people with low vision, low literacy and tired eyes, and it supports shared reading in a group ([MISSION, "Accessible by default"](../../../MISSION.md)).

What: A "Listen" control on the card and on each step, using the browser's built-in speech. Play, pause and speed controls. Off by default. No audio files to download and no autoplay.

Acceptance:
- Works in Chrome, Firefox and Safari (the minimum cross-browser set in the web testing rules).
- Controls are keyboard reachable and labeled.
- Stops when the visitor leaves the page.
- The page states that the device's voice may send audio to its operating system provider, because that depends on the device (verify per platform).

Depends on: [WEB-036](#web-036--keyboard-focus-and-screen-reader-on-every-template).

Risks / not doing: No third-party speech service. A cloud voice would change the privacy position.

Evidence (2026-11-19): "Listen to the steps" and a Listen button on each step of every activity card (`site/src/components/CardListen.tsx`, `site/src/lib/listen-card.ts`), with Pause, Resume, Stop and a Normal or Slower speed; nothing speaks until pressed; it reads the title, then every safety flag and note, then the steps; it stops on `pagehide` and when the tab is hidden; the controls appear only where the browser has speech and are hidden in print; the note "Uses your device's own voice. Some devices send the text to their maker to speak it." is under the control. Checked in Chromium at 390 px (180 voices). Gaps: Firefox and Safari not tried; whether a given device sends text to its maker is stated generally, not verified per platform; English cards only.

### WEB-021 · Short demo video per activity

| Priority | Phase | Status | Pillars | Notes |
|---|---|---|---|---|
| P2 | S3 | new | all | One short captioned demonstration per card, at most. Captions and a transcript are required, and nothing autoplays. Within the size budget ([WEB-074](#web-074--performance-budget)). Video supports the written steps and never replaces them ([R1 §3.6](research/01-craft-diy-platforms.md)). |

### WEB-022 · Structured safety flags

Priority P0 · Phase S1 · Status partial · Pillars: all

Evidence: `safetyFlags` enum on every card (38 tagged; `none` for cards with no listed hazard). Text-labelled chips in the Safety section and on the print card; "Not for under 3: small parts" in the header. Finder checkboxes "Leave out activities that need" for the five filterable flags (`activities.ts`; tests in `activities.test.ts` and `activity-cards.test.ts`). Open: legal wording of the labels still needs review under 14 before S1 exit.

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

Evidence: the approved footer note (`footer.note` in `site/src/i18n/ui/en.json`, "for enjoyment ... not medical advice") is on every English page. `site/scripts/check-site.mjs` fails the build if an English page lacks it (15,732 pages, 0 errors on 2026-11-15). Cards also carry the card scope line (TSA-026). Not done: translated pages are not checked by the script; the reviewer's scope note for reviewed pages does not exist yet.

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

Priority P0 · Phase S1 · Status partial · Pillars: all
Evidence: `site/src/components/ActivityFeedback.astro`, `site/src/lib/activity-feedback.ts` (+ tests), event `activity_started_confirmed` in `site/src/lib/track.ts`. Not built: the visitor note (no free text was shipped), the public count after the minimum (needs an aggregate endpoint, see PLAT-027 and a maintainer decision).

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

Priority P0 · Phase S1 · Status partial · Pillars: all
Evidence: `site/src/components/ActivityFeedback.astro` (fixed reasons, next step per reason), event `activity_not_a_fit` in `site/src/lib/track.ts`, tests in `site/src/lib/activity-feedback.test.ts` and `site/src/lib/track.test.ts`. Not built: routing to the editors' queue (no backend; the event goes only to the analytics path, a maintainer decision), and the "other" text box (deliberately left out: no free text).

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

Priority P1 · Phase S2 · Status partial · Pillars: all

Evidence: `changes:` on all 38 cards in `site/src/content/activity-cards/`, seeded only from git history (2026-11-15, commit 888b4cf: labelled safety flags and drawings of the result and materials). The two-sided print layout (commit e0852b8, 2026-11-14) is not listed because it is not a materials, steps or safety change. `changeSchema` is in `site/src/lib/activity-schema.ts`; `recentChanges` in `site/src/lib/activity-changes.ts` shows the newest three. Not done: no link to a full log page (none exists yet); the log is written by hand in each card file, not generated from git.

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

Priority P0 · Phase S2 · Status exists · Pillars: all

Evidence: `/your-data/` page (`site/src/pages/your-data.astro`) with per-item and all-at-once download and delete, a confirmation step and a role=status message. Logic and tests: `site/src/lib/your-data.ts` and `site/src/lib/your-data.test.ts`. The list is server-rendered; the buttons need JavaScript.

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

Priority P1 · Phase S2 · Status partial · Pillars: all

Evidence (2026-11-17): `/paths/` lists two four-week paths, each with its own page: `/paths/quiet-weeks-at-the-table/` (care: a caregiver and an older adult, including someone living with memory loss) and `/paths/making-across-generations/` (together: a child and an older relative). Each states its purpose and who it is not for, why its activities were chosen, and a stop note, and each week offers two activities (`site/src/data/paths.ts`). Every sentence about the activities is limited to what the card files say: tests check that each care activity can be done sitting down, needs little energy and costs little or nothing, that each together activity has a version for children, takes 45 minutes or less and costs little or nothing, and that a path is dated no earlier than the newest card it lists. A visitor can start at any week, skip any week with one tap and bring it back with one tap. The page points at the first week from the start that is not skipped, and says nothing is waiting when every week from there is. Progress shows how many of the path's activities are tried, for the path and for each week, read from the tried list the activity pages keep; the page never writes that list. `site/src/lib/paths.test.ts` runs eight seeded random sequences of 400 steps over everything a person can do on a path together with marking activities tried, and checks that every path action leaves the tried list exactly as it was and that no count ever goes down. A path's actions take only the paths state, so they cannot reach the tried list. A scan of the words of the paths, the page's sentences and the source of the island and the pages fails on the words that would make a path a streak, a schedule or a debt (missed, behind, overdue, late, catch up, streak and the like), and the claims lint runs over the copy. The only thing the page keeps is the start and the skipped weeks, as week numbers in one local key, `ca-paths-v1`, which is in the data inventory and on `/your-data/` and is cleared there or with "Forget my place on this path"; nothing is sent and the page has no text field. If the browser refuses to save, the page keeps each tap for the visit and says so, and a second tab on another path is never overwritten. A path prints on two pages (one sheet, both sides) on A4 and on Letter, in 12 pt, with the buttons and counts left off the paper and a box to tick, the address, the scope line, the pause note and a version line on it, and `check:print` fails a path over two pages, one with the summary, counts or buttons still on the paper, or one without its addresses and version. The pages count as app pages for the page weight budget (first-paint styles 14.6 kB gzipped), and their print-only styles are in the file linked for print. The pages are `noindex`, left out of the sitemap, linked from the finder and in the accessibility gate, which checks the list, one path as a new visitor sees it and the other with a place kept on the device (a start, skipped weeks and tried marks). Without JavaScript the plan reads and prints as a list, and the buttons and counts that would do nothing are left out. Not done: a person checking that the activities suit the people each path names (one author chose them); any session with caregivers or families; paths for other audiences and a way to pick a path from a situation ([WEB-002](#web-002--describe-your-situation)); links from the hubs and the Today page; other languages; evidence that a path is wanted, which keeps the pages out of search; saved collections, which the spec lists as a dependency ([WEB-028](#web-028--saved-collections-on-the-device) is partial); and a weekly plan that includes a path ([WEB-031](#web-031--weekly-plan-printable) is partial).

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

Evidence: `/seasons/` asks which half of the world the visitor lives in (northern, southern, or "not four seasons"), guesses from the language setting until they choose and says it is a guess, and links to the season for the current month. `/seasons/spring/`, `/summer/`, `/autumn/` and `/winter/` each have an opening, a written selection rule, a "not for" line, a stop note and a swap for the wrong weather, and show three or four cards found only on that page plus six that suit any season indoors. `site/src/lib/seasons.test.ts` and `site/src/data/seasons.test.ts` check the month-to-season table for both halves, the locale guess, that the season-only cards never repeat across pages (02 H1), that no festival or year is named, that the descriptions fit, and the claims lint. The choice is kept only until the page is closed, so nothing new is stored. The four season pages are `noindex` and not in the sitemap: they share the any-time list, and there is no evidence yet that they answer a different question than the seasonal hub (02 H3, H10). `/seasons/` also shows the year as twelve months, each linking to its season for the chosen half, with the current month marked (`seasonCalendar` in `site/src/lib/seasons.ts`, tested for both halves). Remaining: remembering the choice (that would need an entry in the data inventory), search or usability evidence before indexing, a place for each season's cards beyond the 14 now assigned, and review by someone outside the team.

| Priority | Phase | Status | Pillars | Notes |
|---|---|---|---|---|
| P2 | S2 | partial | all | `/seasons/<season>/` for spring, summer, autumn and winter. The season follows the visitor's chosen hemisphere, or their locale if they have not chosen. Season is not holiday: no holiday is assumed ([MISSION, "Cultural openness"](../../../MISSION.md)). Each hub is updated in place every year ([02 H8](02-information-architecture.md#6-hub-rules)). |

### WEB-034 · Occasion hubs

Priority P1 · Phase S2 · Status partial · Pillars: all

Evidence (2026-11-16): four occasion hubs are built at `/occasions/visit/`, `/occasions/rainy-day/`, `/occasions/short-break/` and `/occasions/gift/` (`site/src/content/hubs/occasions/`). Each lists ten cards chosen by a written rule, and has its own opening, a stop note and a "not for" line. `site/src/lib/hubs.test.ts` checks each hub against its own rule (the visit hub lists only seated or bedside cards that take five minutes or less to set up; the short break hub only cards with five minutes or less of setup and a first go of ten or less; the rainy day hub only table activities for more than one person), checks that none names a festival, and checks the overlap limit with every other hub (H1). Writing the tests found one card that did not fit the visit rule and it was swapped. The gift hub has no link to a store, no product name and no price wording (tested). Bed rest and celebrations are not separate hubs: each would share more than half its cards with the bedside hub and the seasonal hub (H1), so those two hubs serve them. All four hubs are held from search (`indexable: false`) because 02 H11 allows new hubs in this phase only with search and usability evidence, and none exists yet; they are linked from the home page and the finder, and pass the accessibility check. Not done: the printable gift card; search or usability evidence; outside review of the wording.

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

Evidence: `pnpm check:a11y` (zero axe violations, visible focus, no focus trap, no focus under the sticky header, on every template). Testing with two screen readers before S1 exit is still open and needs a person.

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

Priority P0 · Phase S2 · Status exists · Pillars: all

Evidence: site/scripts/a11y-check.mjs runs every template at 320, 390, 640 (200% zoom), 1440 and 1440 with text at 200%, and fails on horizontal page scroll, content past the edge or clipped text (CI step "Accessibility checks" in .github/workflows/site.yaml).

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

Evidence: Checked with `javaScriptEnabled: false` on nine templates (home, finder, card, pack, hub, guide, game, today, prose; 2026-11-15): content renders, the finder lists all 38 cards, card variations and print work; the Print, Save and Share buttons start hidden and appear only with JS (`activities.css`, `ActivityView.astro`, `PackView.astro`). Budget: `pnpm check:budget` 0 over (microsite largest JS 3.0 kB). Remaining: the finder's filtering needs JS by design, and a human print check.

Why: "Progressive enhancement: HTML content and critical navigation work before JavaScript" ([DESIGN §7](../../../DESIGN.md)). Low-speed connections are a named underserved condition ([VISION, "Ten-year vision"](../../../VISION.md)).

What: The card, hub, pack and guide read fully without JavaScript. The finder, chips and read-aloud enhance the page. Each template stays within the Microsite budget in the web performance rules (JavaScript under 80 kB gzipped; CSS under 15 kB), or documents an exception.

Acceptance:
- Each template shows its core content with JavaScript disabled.
- The card template meets the Microsite budget, or the exception is written down with a reason.
- Printing works without JavaScript.

Depends on: [WEB-074](#web-074--performance-budget).

Risks / not doing: The finder needs JavaScript for its best behavior. Its basic list still works without it (verify).

### WEB-039 · Plain-language mode

Priority P1 · Phase S2 · Status partial · Pillars: CARE, GROW

Why: DESIGN asks for comprehension with people who prefer short language, with "one action per step" ([DESIGN §6](../../../DESIGN.md)).

What: A switch that shows shorter sentences, one action per line and larger spacing. Safety text is never removed.

Acceptance:
- Every card has a plain-language version, or the switch falls back to the standard text.
- Safety text is identical in both versions.
- Tested with at least five people who prefer short language.

Depends on: [06 content library](06-content-library.md) for the editorial work.

Risks / not doing: Shortening text can remove a safety step. The safety check runs on both versions.

Evidence (2026-11-19): an optional `plainSteps` list on a card (`site/src/lib/activity-schema.ts`), checked by `site/src/lib/plain-steps.ts`: at most 14 words and one action per step; every safety keyword in a standard step (adult, scissors, cut, hot, water, glue, near and others) appears in a plain step too; a plain step may use a safety word or name a material only if the card already does. The Safety section is shared, not rewritten. A "Short steps" switch (`site/src/components/PlainToggle.tsx`) swaps the steps list and remembers the choice on the device (`ca-plain-steps`, listed on the Your data page). Eight cards have plain steps; the other 45 show no switch and keep the standard text. Browser at 390 px: on Arrange flowers together, 8 steps become 11, "Let the helper do the cutting." is its own step, the choice survives a reload. Gaps: 45 cards have no plain steps yet; not tested with five people who prefer short language; read-aloud still reads the standard steps in Short steps mode.

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

Priority P1 · Phase S2 · Status partial · Pillars: CARE, GROW, TOGETHER

Evidence (2026-11-17): every activity card has a "Show steps to a group" button, shown only where the browser can open a dialog; without it the card is as it was. It opens a full-screen view built from the text already on the page, so nothing is sent or stored. The first screen is the card's name, summary, what you need and the note about pausing or stopping; then one screen for each step in the card's own words, in large type; then a last screen with the card's own note that it is fine to stop. The person leading moves on with Next, Previous, the left and right arrow keys, or Page Down and Page Up (the keys a slide clicker usually sends; none was tried). A held key moves once, and Page Down scrolls a long step before it moves on. Pause hides the step behind a plain screen until Carry on; Done for now is on every screen; Escape also ends the view and returns to the button. The buttons keep focus when the screen changes, so Enter can be pressed again for the next step, and a screen reader is told each new screen (the start screen in full, with its materials). A screen too tall for the room scrolls, and is then a stop in the Tab order so the keyboard can scroll it. There is no clock, no score, no sound and no autoplay; the view adds no number except the step count ("Step 2 of 6"), and the card's own words are shown as written. The code and the styles load only when the button is pressed (`site/src/lib/group-stage.ts`, `group-stage-dom.ts`, `site/public/styles/group-stage.css`), so a card page carries nothing for it. `pnpm check:group` opens the view in Chromium, with the page's own content security policy enforced, on all 53 cards and walks every screen, focus, what is read out, Previous, Done for now, the keys, Pause, Tab, print, Escape and opening again; for the three most demanding cards it checks eight screen sizes, from 320 by 256 to 1440 wide and including a tablet and a phone held either way, at normal text and (on screens at least 568 px tall) 200% text: nothing runs off the screen, every button can be brought wholly on screen and is at least 48 px, step text and titles are at least 32 px and all other type at least 24 px, and there is room for a line to read (the buttons never take more than 45% of the screen). It also checks that no card page is wider than a 320 px screen, and that a picture caption inside a step is not read as the step. It fails when the styles are missing or the button bar has no limit (each shown by planting the fault). Adding the button made the 320 px card page 1 px wider than the accessibility check allows, because the tilted sheet behind the card head reaches further out as the head grows; the sheet is now tilted less on phones. Gap: not tried in Firefox or Safari, on a real tablet, TV or cast screen, with a slide clicker or with a screen reader; materials do not scale to the group size (a card's list gives no per-person amounts); it does not work offline until WEB-040 is built; there is no facilitator timer, deliberately; the view is English, like the card pages. A press on a blank part of the view could in principle leave focus on the page and silence the keys; Chromium moves focus to the view by itself, so that was not reproducible there, and the view takes focus and listens on the page to be safe.

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

Priority P1 · Phase S2 · Status partial · Pillars: PLAY, GROW, CARE

Evidence (2026-11-15): all 14 games are audited in `site/src/data/game-print.ts`: 11 print (4 from the game's own sheet, 7 from a fixed build-time sheet in `site/src/lib/games/print-sheet.ts`, one page on A4 and US Letter), 3 give a written reason (photo pairs, calm breathing, finish the saying); the printed rules line is the game's own guidance string and each printable carries `Version <date>` (tests: `site/src/data/game-print.test.ts`). Not done: paper check by a person, native review of the new print strings (English fallback elsewhere), and a paper version for finish the saying.

Why: "Printable plus digital pairs for the same game" is an open gap ([R4 §6](research/04-games-engagement.md)). Printable counterparts are in the game concepts ([R4 §8](research/04-games-engagement.md)).

What: Each game with a printable partner links to the partner card, which follows the same card rules ([WEB-014](#web-014--one-sheet-two-sided-printable-card) to [WEB-016](#web-016--versioned-prints)). The game page says which rules are the same.

Acceptance:
- Each of the 14 existing games has a printable partner or a written reason why not.
- The rules text is the same on both.
- The printed partner has a version and date.

Depends on: [WEB-014](#web-014--one-sheet-two-sided-printable-card), [05 games](05-games.md).

Risks / not doing: A printable partner that is a worse game. Write the rules once and check both.

### WEB-053 · Difficulty without scores

Priority P1 · Phase S2 · Status partial · Pillars: CARE, PLAY

Evidence: difficulty is a choice of tile or picture count, never a level. `site/src/games/no-pressure.test.ts` fails the build if an English game string carries score, timer, streak, move-count or failure wording, if any game uses a repeating clock (read-aloud pacing excepted), or if a hint starts sooner than 20 seconds idle; only Four together and Odd one out have a hint. Hints can be switched off in both games (a "Hints" choice, English only), which also hides one already showing; `no-pressure.test.ts` checks the switch stops the wait. Changing the count now keeps the place in five games: Find the same and Shadow match keep the target and the pictures on the board; Odd one out keeps the theme, the odd picture and whether it was found; Four together keeps the theme and the pictures already found; Picture pairs keeps the pictures and the pairs already matched, and switching between showing and hidden pictures no longer restarts the board. `site/src/lib/games/resize.test.ts` (60 seeds across every count pair), `pairs-carry.test.ts` and `site/src/games/keep-place.test.ts` (fails if a game rebuilds its round when the count changes) cover this. Remaining: Picture puzzle (a different piece count cannot carry the arrangement), Picture bingo (squares and cards), Word search (size and theme) and Sort together (theme) still start a new board when their choice changes; no testing with five adults.

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

Priority P0 · Phase S2 · Status partial · Pillars: all

Evidence: Rest for now on every game through site/src/games/shared/GameFrame.tsx (checked for all 12 games by a11y-check.mjs: keyboard reachable, play area hidden and kept, Carry on restores it, no modal). Not done: the place is kept only while the page is open; it is not saved on the device between visits, so the Rest saving requirement is partly met.

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

Priority P0 · Phase S2 · Status partial · Pillars: all
Evidence: Footer.astro "Report a problem" on every page (check-site.mjs); site/src/pages/corrections.astro. Response standard not yet published (maintainer decision).

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

Priority P0 · Phase S1 · Status partial · Pillars: CALM, CARE

Evidence: `site/src/pages/art-therapy-and-creative-activities.astro` (built, linked from footer and from the two CALM explainer guides; claims lint covers it). Open: the page is marked "not yet reviewed by a registered art therapist"; the reviewer, the BAAT/HCPC link checks on the publish date, and the reviewer's named credential are still needed.

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

Priority P0 · Phase S1 · Status partial · Pillars: CALM, CARE

Evidence: `site/src/components/CrisisRoute.astro`, shown on Today, the boundary page and nine guides with `crisisRoute: true` (frontmatter, `content.config.ts`). US 988 and UK/Ireland Samaritans 116 123 were checked on 2026-11-15 against 988lifeline.org and samaritans.org. Open: the per-locale route list (L10N-009 owner) for each later language.

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

Evidence: decision recorded 2026-11-15, route (a): GA4 through Tag Manager, loaded only after "Allow", consent mode with ad storage denied, Tag Manager's automatic listeners blocklisted ([analytics-consent.md](analytics-consent.md)). Not done: the GA4 and Tag Manager console settings listed there (maintainer); counsel's check of the wording.

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

Evidence: the only non-essential cookies are Google Analytics', set only after "Allow" in a bar in the page flow (no pop-up, no dialog) where "No thanks" comes first and both buttons are the same size ([analytics-consent.md](analytics-consent.md)).

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

Priority P0 · Phase S2 · Status partial · Pillars: GROW

Evidence: the site has no child-directed page, no accounts, no ads and no third-party embeds. `site/src/lib/child-image-rules.test.ts` fails the build if any page declares `childDirected: true` without a privacy review record at `docs/privacy/child-pages-review.md`, or if such a page contains a form, input, script or iframe. Remaining: the privacy review record and legal advice before the first child page, and the visible label for a child-directed page.

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

Priority P0 · Phase S2 · Status partial · Pillars: all

Evidence: `docs/specs/asset-provenance.json` logs every served picture, illustration and social card (`asset-provenance.test.ts`). `child-image-rules.test.ts` checks that every picture on a card page has a log entry and that no card picture shows a person or a child. All entries are `unreviewed`. Remaining: a named reviewer for each entry, consent records for any future photo of a person, and keeping the log outside the public site once photos are used.

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

Evidence: `site/scripts/check-budget.mjs` (`pnpm check:budget`, also in `pnpm verify`): 0 of 15,728 built pages are over the budgets in `rules/web/performance.md`. The 404 page loaded a 2.6 MB script and now loads the locale codes only. Image budget, Lighthouse in CI and field data are still open.

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

Evidence: axe at WCAG 2.2 AA on every template and game at five variants, keyboard pass, reduced-motion loop check, in CI (site/scripts/a11y-check.mjs). Not done: a token contrast table and visual screenshot comparison at 320, 768, 1024 and 1440.

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

1. **Analytics route.** Decided 2026-11-15 by the maintainer: restricted GA4 with consent first ([analytics-consent.md](analytics-consent.md)).
2. **Step images.** WEB-012 needs photographs or illustrations for every S1 card. Who produces them, and what is the budget?
3. **Print URL and easier side.** Confirm the baseline print card's URL, and whether its easier side and stop note are printed (WEB-014).
4. **Crisis routes by region.** WEB-061 needs a route list per locale, checked against official pages. Who keeps it current?
5. **Child-facing scope.** WEB-072 applies before S2 child content. Does privacy counsel review the rule before S2 starts?
6. **AI assistant.** WEB-066 is P2 and S3. Does the evidence of search and use support building it at all?
7. **Count-display threshold.** WEB-025 uses a proposed minimum of 20 before showing a count. Test with the first cards.
