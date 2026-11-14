# 06 · Content library

This file defines every content type the website and app publish: what each one contains, what it must meet before it goes live, who reviews it, and how big the library should be at each phase. The canonical activity card is the core. Every other type serves the same moment: a hub for a situation, a pack for a printer, a path for a week, a video for someone who prefers to watch. Pillar-specific programs (crafts, kids, older adults, wellbeing) live in [07](07-pillar-crafting.md), [08](08-pillar-parenting-kids.md), [09](09-pillar-older-adults-dementia.md) and [10](10-pillar-creative-wellbeing.md). Nothing here licenses volume for its own sake. VISION rules out "misleading page proliferation" and the R1 notes record how templated scale hurt wikiHow and Etsy.

**Read with:** [README](README.md) · [_WRITER_BRIEF](_WRITER_BRIEF.md) · [07](07-pillar-crafting.md) · [08](08-pillar-parenting-kids.md) · [09](09-pillar-older-adults-dementia.md) · [10](10-pillar-creative-wellbeing.md) · [13 localization](13-localization.md) · [14 trust, safety, accessibility, privacy](14-trust-safety-accessibility-privacy.md) · [17 metrics](17-metrics-and-evidence.md) · [18 roadmap](18-roadmap.md) · [R1 craft platforms](research/01-craft-diy-platforms.md) · [R2 parenting](research/02-parenting-kids-platforms.md) · [R5 search and trust](research/05-search-scale-trust.md)

## 1. Baseline (checked 2026-11-14)

Counts come from the [README baseline](README.md#where-we-are-today-baseline-checked-2026-11-14-on-main-at-dab0f10). They are not a re-count. CNT-040 re-verifies them.

| Type | Today | Where it lives |
|---|---|---|
| Activity cards | 38, English | `site/src/content/activity-cards/*.md` |
| Search hubs | 4, English | `site/src/content/hubs/` |
| Printable packs | 2, English | site packs |
| Guides | 88, English (activities 37, caregiving 41, brain health 10) | `site/src/content/guides/` |
| Guide translations | 189 locale codes, machine-translated, unreviewed; most held from the search index | `guides-i18n/` |
| Printables and handouts | Pictures to print, handout, picture bingo printable | site tools and games |
| Coloring pages | Available through the coloring game; count not checked | games |
| FAQ | Site FAQ plus two to four questions per hub | site |
| Per-step photos, video, audio read-aloud, glossary, paths, seasonal calendar, educator or care programs | None in the baseline | — |

The cards' byline says they are "not yet reviewed by an outside expert". That is honest and stays until a named person has actually reviewed a card (the schema's `reviewer` field is `null` until then).

## 2. Content types

Rules that apply to every type:

- **Startable.** A visitor can tell within one screen what to do, what it needs and how to stop (MISSION: "startable, not scrollable").
- **Adaptable.** Every type that asks someone to do something says how to make it easier, seated, low-vision, less messy or one-handed, or links to where that lives.
- **Sourced.** Any factual claim has a source with publisher, URL and access date. Unsourced claims are either removed or labelled as editorial judgment.
- **Honest scope.** No treatment, healing or diagnostic language (VISION guardrails; [14](14-trust-safety-accessibility-privacy.md)). "Relaxing", "enjoyable", "sensory-friendly" and "it is fine to stop" are the register.
- **No dark patterns.** No streaks, guilt messages, pop-ups before first use, or ads inside content.

### CNT-001 · Activity card (canonical)

- **Priority P0 · Phase S1 · Status exists (38)** · Pillars: all (pillar tag to be added; see anatomy).
- **Why:** the card is the unit of the product: "one readable page or printable card" (VISION, product promise 3). The schema is in `site/src/content.config.ts`; the data model is in DESIGN §8.
- **Anatomy, in page order:** name; one-sentence summary (30–140 characters); `enjoy` (who might enjoy it, in interests not diagnoses, 40–220 characters); glance facts (type, prep minutes, activity minutes, cost, mess, energy, supervision, settings, groups, senses); materials (1–10, plus substitutions); steps (3–9, one action each, each 220 characters or fewer); variations (2–6); safety (1–6); stop note (what to do when it is not working); related guides and activities; byline (author, reviewer or "not yet reviewed", published and updated dates); sources.
- **Required metadata (schema, today):** `name`, `description` (110–165 characters), `summary`, `type`, `prepMinutes`, `activityMinutes`, `cost`, `mess`, `energy`, `supervision`, `settings`, `groups`, `materials`, `senses`, `steps`, `variations`, `safety`, `stopNote`, `published`, `updated`, `author`.
- **Proposed additions (to log in [15](15-platform-data-architecture.md)):** `pillars` (one or more of MAKE, GROW, CARE, CALM, PLAY); `ages` (needed before any GROW card, see [08](08-pillar-parenting-kids.md)); `testedWith` (date, setting and participant *type*, never a name or health detail); `aiAssisted` (boolean, see CNT-032); `printPages`; and `reviewedBy` with `reviewedAt`, set only for a named, credentialed person who has reviewed the card.
- **Known schema gaps:** `senses` has no `taste` (intentional for now: no edible activity in the core library without a food-safety review); `energy` has no `high` (needed for some GROW cards); `mess` has no `high` (acceptable); and the variation list lacks kinds the pillars need (see CNT-002).
- **Quality bar:** tested by a team member from the first to the last step, timing recorded; materials list checked against what was actually used; substitutions tested; the print view makes sense on its own; reading level plain (one action per step); alt text on every image; the stop note is calm and specific.
- **Review:** author writes; a team member tests; accessibility and safety checks per CNT-030. An outside expert reviews a card that touches health, dementia, children or therapy-adjacent language (see triggers in CNT-030).
- **Formats:** web page; one-page print card (A4 and US Letter, black-and-white readable); structured data that matches what is visible.
- **Acceptance:**
  - A new card validates against the schema before build.
  - The print card fits one page and reads at arm's length in grayscale.
  - The reviewer field is `null` unless a person has reviewed the card.
  - No step requires a tool or material not in the materials list.

### CNT-002 · Variation

- **Priority P0 · Phase S1 · Status exists** (nine kinds in use across the 38 cards).
- **Why:** adaptation is the main differentiator against Pinterest, Instructables and wikiHow, which assume the maker can sit, grip and see ([R1 §6](research/01-craft-diy-platforms.md#6-gaps-no-one-serves-well-our-openings)).
- **What:** a variation says how to change one activity for one need. Kinds today: `easier`, `less-sensory`, `seated`, `bedside`, `more-collaborative`, `for-a-group`, `with-children`, `low-vision`, `nonverbal`.
- **Proposed new kinds:** `low-dexterity` (larger grips, pre-cut, adhesive instead of glue bottle), `one-handed`, `less-mess`, `for-younger-children` (under-3s need a separate safety line), `for-older-children`, `for-a-tired-adult` (for the adult, not the participant). Each new kind needs its own safety check if it changes materials.
- **Rule:** variations live inside their card. A variation gets its own page only when a search cluster asks for it in those words and the page links back to the canonical card. R5 cluster 2 ("easy crafts for seniors with arthritis") is the first case.
- **Quality bar:** the variation changes something real (materials, position, step count or who does what). "Make it simpler" with no change fails.

### CNT-003 · Search hub

- **Priority P0 · Phase S1 · Status exists (4)**.
- **Why:** one hub per intent (VISION, search architecture). A hub is how a visitor who searches a situation finds the right cards.
- **Anatomy (schema):** title, description (110–165 characters), eyebrow, lede (80–420 characters), `choosing` (3–6 reasons these suit the situation), `activities` (6–16 card slugs, best fit first), optional `variation`, FAQ (2–6), up to 6 guides, up to 4 related hubs, byline and sources.
- **Quality bar:** the hub explains how the list was chosen; it never copies steps from its cards; each card in the list is one a person on the team has tested; no two hubs target the same intent.
- **Count rule:** S1 keeps 3 to 4 hubs (VISION stage 1 asked for three). Add a hub only after a search gap is measured ([R5 §3](research/05-search-scale-trust.md#3-search-demand-clusters)). DESIGN records 25 near-duplicate hubs as an anti-pattern.
- **Review:** editor and the reviewer of each linked card's pillar. Expert review for any CARE or CALM hub.

### CNT-004 · Guide

- **Priority P1 · Phase S2 · Status exists (88 English; machine-translated copies unreviewed)**.
- **Why:** long-form answers to "how do I", "what is", and caregiver questions, linked to cards. Guides carry the explanation a card cannot.
- **Anatomy (schema):** title (max 80), description, section (`activities`, `caregiving`, `brain-health`), summary (80–420 characters), key points (3–6), FAQ (2–6), at least one source, related games and related pages, `health` flag.
- **Quality bar:** every guide with a health flag has a named reviewer (schema gap: no `reviewer` field on guides; proposed). Any factual claim is sourced. A guide that repeats another guide is merged, not kept.
- **Gate before growth:** the 88 guides go through the inventory in CNT-040 first. Machine-translated guides stay out of the search index until a reviewer has signed off that language (see [13](13-localization.md)).
- **Count rule:** no net new English guides in S1. In S2, new guides only against a measured question with no good answer in the library.

### CNT-005 · Printable pack

- **Priority P1 · Phase S2 · Status exists (2)**.
- **Why:** a collection for one situation ("five quiet bedside crafts") that prints and shares. VISION stage 2 asks for one sharable pack to be tested.
- **Anatomy:** one or two pages; five activities, each with materials, a single-line stop note and one adaptation; a supply checklist; the non-clinical scope line ("These are recreational activities, not therapy"); a link to each full card. No account, no email gate.
- **Quality bar:** every activity in the pack is a canonical card, so the pack never drifts from the source. Prints in grayscale. Works offline.
- **Measurement:** prints and shares per pack, and start proxy from its cards ([17](17-metrics-and-evidence.md)).

### CNT-006 · Path (weekly plan or multi-week sequence)

- **Priority P1 · Phase S2 · Status new**.
- **Why:** a free one-page weekly plan with three to five activities is a low-commitment entry point that needs no account ([R2 §3, pattern 4](research/02-parenting-kids-platforms.md#3-feature-patterns-worth-adopting)).
- **Anatomy:** a title for the situation; one line on time per day; a row per day or per activity; links to the cards; a blank row for "what we did"; a closing line that says the path is finished and that stopping is fine.
- **Rules:** no streaks, no "you missed a day" message, no email sign-up needed, and no paid unlock for the first week. A path ends.
- **Count rule:** two paths in S2 (one for older adults, one intergenerational); more only if the S2 test shows completion without pressure.

### CNT-007 · Printable template

- **Priority P1 · Phase S2 · Status partial** (handout and picture printables exist; the set below is not complete).
- **Types:** blank activity card; "what I have" checklist (the stash pattern, [R1 §5](research/01-craft-diy-platforms.md#5-games-and-interactive-patterns)); memory prompt sheet; blank weekly plan; keepsake or thank-you card; educator and family note (see CNT-014).
- **Formats:** A4 and US Letter; grayscale-safe; body text at least 14 pt; large-print at 18 pt or more; no full-bleed backgrounds; tagged PDF with alt text on every image; QR code optional and never the only route to the instruction.
- **Quality bar:** printed on a basic inkjet in grayscale and read at arm's length. A print test is recorded for each template.

### CNT-008 · Coloring page

- **Priority P2 · Phase S2 · Status partial** (coloring game exists).
- **Why:** a calm, no-skill option with low setup. Good for bedside, group and intergenerational use.
- **Quality bar:** thick outlines (at least 2 pt), few shapes, no fine detail, big and simple variants both provided, plain background, original or public-domain artwork only (CNT-031). Each page names its setting and group and links to a card that uses it.

### CNT-009 · Step photos and illustrations

- **Priority P1 · Phase S2 · Status new** (cards are text-only steps today).
- **Why:** photos and drawings help people who follow pictures, and DESIGN requires actual materials and steps to be shown. A photo is never the only instruction.
- **Rules:** one image per step where the step is hard to read from text alone; alt text describes the action ("Press the button down with your thumb"), not the scene; the same style across a set; hands and objects over faces; diverse people without staging.
- **Technical:** AVIF or WebP with JPEG fallback; explicit width and height; lazy-loaded below the fold; never more than twice the rendered size.
- **Not allowed:** AI-generated images of steps, people, children or care settings (CNT-032). Stock images of people are not used for dementia or child content.

### CNT-010 · Short video

- **Priority P2 · Phase S2 (pilot of six) · Status new**.
- **Why:** a watch-along works for people who prefer to follow ([R1 §3, pattern 6](research/01-craft-diy-platforms.md#3-feature-patterns-worth-adopting)).
- **Format:** 30 to 90 seconds, one activity, adaptations shown on screen, the stop moment shown, captions on by default, transcript on the page. Vertical short form for the activity; long-form only for dementia-care demonstrations with a reviewer ([R5 §4](research/05-search-scale-trust.md#4-distribution-beyond-search)).
- **Labelling:** every child-facing video is labelled made-for-kids as YouTube requires ([R5 §5.1](research/05-search-scale-trust.md#51-childrens-privacy)). Faces of people with dementia need consent from the person or their legal representative. No child's face without a written parental release.
- **Gate:** the pilot runs only where a card has a measured start rate. Scale only if video viewers start the activity at a rate close to the card's.

### CNT-011 · Audio read-aloud

- **Priority P2 · Phase S2 (pilot of ten) · Status new**.
- **Why:** helps low-vision and reading-difficult users and people who listen while doing ([TSA accessibility](14-trust-safety-accessibility-privacy.md)).
- **Rules:** same text as the page; one audio clip per step; human narration preferred; synthetic voice allowed only with a clear label; play, pause and speed controls; no autoplay; transcript available.

### CNT-012 · Glossary

- **Priority P1 · Phase S2 · Status new**.
- **Why:** "glue dot", "cardstock", "tenting" and "sticky tack" are the words that stop people. A glossary keeps cards short.
- **Format:** plain word, one-sentence meaning, a picture where it helps, and a note for translators (see [13](13-localization.md)).
- **Count:** about 60 terms at S1, chosen from words that appear in the cards. More only when usage data shows a term failing.

### CNT-013 · Seasonal calendar and collections

- **Priority P2 · Phase S2 · Status new**.
- **Why:** time-bound search and planning. R5 cluster 6 (holiday crafts for seniors, seated and low-dexterity) is the first case.
- **Rules:** published at least six weeks before the season it serves; each collection has seated and low-dexterity versions; holidays from many traditions are included with cultural review (see [07](07-pillar-crafting.md) for the seasonal category and [13](13-localization.md)); after the season, the page stays at its URL and points to the evergreen hub.

### CNT-014 · Educator and care-setting program

- **Priority P2 · Phase S2 (one pilot) · Status new**.
- **Why:** schools, libraries and care homes are the partners who can make the product routine ([R5 §4](research/05-search-scale-trust.md#4-distribution-beyond-search)).
- **Bundle:** a weekly path (CNT-006); group variations; a session plan at 10, 20 or 30 minutes; a one-page staff summary with setup and clean-up time; a family note to take home (no child data collected); a consent or permission template for the organization to use with its own people.
- **Variants:** early-years and classroom (owned by [08](08-pillar-parenting-kids.md)); care-home and day-center (owned by [09](09-pillar-older-adults-dementia.md)).
- **Partner wording:** a partner can be named as using us only with written agreement. We never imply clinical endorsement (VISION, partnerships).

### CNT-015 · FAQ

- **Priority P1 · Phase S2 · Status exists** (site FAQ and hub FAQs).
- **Rules:** 2 to 6 questions per hub; each answer three sentences or fewer; questions real people ask (search, support, feedback); FAQ structured data only where the FAQ is visible on the page; factual answers sourced. "Is this therapy?" always gets the non-therapy statement.

## 3. Editorial pipeline

Every card, guide and pack passes these stages in order. The stage that found a problem is recorded in the page's change log, which is visible to editors.

| Stage | Who | What happens | Gate to continue |
|---|---|---|---|
| 1. Research | Writer | Search query and top ten results recorded; sources listed; gaps noted | Each factual claim sourced, or marked as editorial judgment |
| 2. Draft | Writer (AI may draft; see §5) | Written to the schema; one action per step; variations with real changes | Schema validates at build |
| 3. Hands-on test | A team member, ideally with one real attempt by a person in the target situation | Does the activity, times it, tests every substitution, prints the card, records `testedWith` | Test completed; time and materials match the page |
| 4. Accessibility check | Editor with a checklist | Keyboard, screen reader on the page, 200% zoom, contrast, 48 px targets, reduced motion, print view, plain-language read | No open critical defect ([14](14-trust-safety-accessibility-privacy.md)) |
| 5. Safety check | Editor trained in safety, pillar safety lists | Materials, choking, supervision, allergens, sharp and hot items, water, plants, ticks, sun, heavy lifting | Every hazard in the materials has a safety line |
| 6. Expert review where needed | Named credentialed reviewer | Triggers below | Reviewer named and dated on the page, or the page says "not yet reviewed by an outside expert" |
| 7. Publish | Editor | Byline, dates, sources, print view, structured data matching visible content | Build passes; links checked |
| 8. Update | Owner of the card | Scheduled review, correction or safety change | See cadence below |

**Expert review triggers** (any one):

- any health, dementia-specific or physical-condition claim, including arthritis, mobility limits or fall risk: occupational therapist, physiotherapist or dementia specialist;
- any child-directed content: early-years educator, and counsel where COPPA or the UK Children's Code is in question ([08](08-pillar-parenting-kids.md));
- any therapy-adjacent wording: credentialed art therapist ([10](10-pillar-creative-wellbeing.md));
- any translation touching safety wording: a reviewer in that language ([13](13-localization.md)).

**Update and correction cadence (targets, to confirm in S1):**

- Cards and guides: scheduled review every 12 months, or sooner on a reader report.
- Safety issues: the page is corrected or unpublished within 48 hours of confirmation, and the change is logged.
- Seasonal calendar: reviewed six weeks before each season.
- Reader corrections: acknowledged, checked by an editor, and shown in a public correction note on the page where material.
- Retirement: the URL stays and redirects to the closest live card or hub. Printed sheets carry stable URLs, so retirement must never break a printed card.

**Capacity rule:** do not publish more canonical cards than the team can re-test every 12 months. S1 measures that capacity. The metric "cost per verified useful activity" in VISION is the check.

## 4. Media rights and provenance

Every asset (photo, illustration, video, audio, template graphic) has a metadata record: source, creator, license, release or consent reference, date of capture or download, alt text and approver.

| Asset source | Allowed | Conditions |
|---|---|---|
| Our own photos, team members as models | Yes | Written model release on file; no child's face without parental release |
| Commissioned illustration | Yes | Written license to us; credited in the record |
| Public domain or CC0 | Yes | Source and license recorded; check the license each time; not for people in care or child content unless reviewed |
| Stock photos | Limited | Not for people in dementia or child content; license checked for web and print |
| User-submitted photos (community) | Not in the core library | Only with explicit consent and a moderation step ([11](11-community-ugc.md)) |
| AI-generated images | Not for steps, people, children, care settings or medical content | Abstract decoration only, labelled, and approved by an editor (CNT-032) |

**Consent rules:**

- Dementia: consent from the person pictured, or from their legal representative where the person cannot consent. Document the basis.
- Children: no identifiable child's face or name in any public asset without a written parental release. Prefer hands, objects and backs of heads.
- Care settings: no residents or staff identifiable in photos without written consent from each person or representative.

## 5. AI-assistance policy (CNT-032)

- **Priority P0 · Phase S1 · Status new.**
- **AI may:** outline a card; draft a first version of steps from a card a human has already tested; suggest variations for a human to test; draft alt text, glossary entries and FAQ answers; draft translations (translation review is still required); summarize a source for a writer to check.
- **AI may not:** invent statistics, studies or citations; name a reviewer or write a "reviewed by" line; publish steps for an activity no human has tested; generate images of people, children, steps or care settings; make health, therapy or treatment claims; skip any stage in §3.
- **Accountability:** a named editor is responsible for every published page, whatever drafted it.
- **Disclosure:** where AI materially drafted a page, the page says so in one line, for example "Drafted with AI assistance; tested and checked by our team on [date]". Exact wording to be confirmed by counsel. The `aiAssisted` flag records it.
- **Originality:** each card is written from our own test, not from another site's steps. R1 records that AI-generated pins are rising on Pinterest and that trust erodes with them ([R1 §7](research/01-craft-diy-platforms.md#7-anti-patterns-and-risks-to-avoid)).

## 6. Target library sizes by phase

These are **targets, not commitments**. Counts are English originals unless stated. Translated counts are governed by [13](13-localization.md) and are per language. A phase moves on its evidence gate in [VISION](../../../VISION.md#product-stages-with-evidence-gates) and [18](18-roadmap.md), never on a count. A phase can end with fewer items if pages do not earn their place.

- **S1 (now): small excellent library.** VISION stage 1: quality and usability first.
- **S2: prove repeat usefulness.** VISION stage 2: add only what search and feedback justify.
- **S3: expand by adjacency.** VISION stage 3: new audiences only after their own evidence.
- **S4: global scale.** Per launched language and cluster, after each has its own evidence.

**Canonical activity cards, cumulative, by pillar (English, tested):**

| Pillar | S1 | S2 | S3 | S4 |
|---|---|---|---|---|
| MAKE ([07](07-pillar-crafting.md)) | 38 (existing; pillar tags to be added) | 58 | 90 | 150 |
| PLAY (non-game activities; games in [05](05-games.md)) | 0 | 10 | 20 | 40 |
| CARE ([09](09-pillar-older-adults-dementia.md)) | Set in 09 | Set in 09 | Set in 09 | Set in 09 |
| GROW ([08](08-pillar-parenting-kids.md)) | 0 (kids gated to S3; intergenerational adult-facing pages only in S2) | 0 | 30 | 80 |
| CALM ([10](10-pillar-creative-wellbeing.md)) | Set in 10 | Set in 10 | Set in 10 | Set in 10 |
| TOGETHER (lens) | Tagged across pillars; not counted separately | Same | Same | Same |

**Other types, cumulative:**

| Type | S1 | S2 | S3 | S4 |
|---|---|---|---|---|
| Search hubs (CNT-003) | 3–4 | 8 | 12 | 20 |
| Guides, English (CNT-004) | 88 audited; no net growth | Merge near-duplicates; new only on measured gaps | Same rule | Per language |
| Printable packs (CNT-005) | 2 | 3 | 6 | 12 |
| Paths (CNT-006) | 0 | 2 | 6 | 15 |
| Printable templates (CNT-007) | Set from inventory; complete the core set | +3 | +5 | Per language |
| Coloring pages (CNT-008) | Set from inventory | +10 | +20 | Per language |
| Short videos (CNT-010) | 0 | 6 (pilot) | 20 | 50 |
| Audio read-aloud (CNT-011) | 0 | 10 (pilot) | 40 | Per language |
| Glossary (CNT-012) | About 60 terms | Usage-led | Usage-led | Per language |
| Seasonal collections (CNT-013) | 1 calendar | 4 per year | 6 per year | 12 per year |
| Educator and care programs (CNT-014) | 0 | 1 pilot | 2 (early years included) | Partner network |

Pause or stop a segment when the VISION stage 2 criteria apply: queries are informational with no interactive need, search already satisfies the task, adaptation cannot be validated, or pages are near-duplicates.

## 7. Items

### CNT-030 · Editorial pipeline

- **Priority P0 · Phase S2 · Status new.**
- **Why:** the first thing that makes the library trusted is that every page has passed the same steps ([R5 §5.5 and §5.6](research/05-search-scale-trust.md#56-trust-and-transparency-checklist-for-every-page)).
- **What:** the eight stages in §3, with a checklist per stage stored with the page.
- **Acceptance:**
  - A page cannot publish with a missing stage record.
  - Expert review status is visible on every page that needs it.
  - Dates shown are the real published and updated dates.
- **Not doing:** a second review tier for every page. One expert review gate is enough.

### CNT-031 · Media rights and provenance

- **Priority P0 · Phase S2 · Status new.**
- **What:** the asset record and rules in §4.
- **Acceptance:** an asset with no record cannot be committed to the site or app; photos of people have a release reference; no child's face is in any public asset without a parental release.

### CNT-032 · AI-assistance policy

- **Priority P0 · Phase S2 · Status new.**
- **What:** §5, adopted as a written rule for every writer and reviewer, with the disclosure wording confirmed by counsel.
- **Acceptance:** the `aiAssisted` flag is set on every page that used AI; no AI-generated person or child image is in the library.

### CNT-033 · Target library sizes

- **Priority P1 · Phase S2 · Status new.**
- **What:** §6, re-set at the end of S1 from usability and capacity data, not from market size.
- **Acceptance:** each size change in the roadmap cites the evidence that prompted it.

### CNT-034 · Update, correction and retirement

- **Priority P1 · Phase S2 · Status new.**
- **What:** the cadence and rules in §3, including the public correction note and redirect-on-retire.
- **Acceptance:** every page shows its last review date; every safety correction is logged within 48 hours of confirmation (target).

### CNT-040 · Library inventory

- **Priority P0 · Phase S2 · Status new.**
- **Why:** the baseline counts are from the README and have not been verified page by page. The 88 guides include machine-translated copies. We cannot plan S2 without knowing what exists.
- **What:** a single inventory with one row per page: type, pillar, language, status, tested date, reviewer (or none), sources present (yes or no), safety check date, last updated, print view (yes or no), AI-assisted (yes or no).
- **Acceptance:** the inventory replaces the baseline counts in §1 and §6; near-duplicate guides and hubs are listed for merge.

## Open questions

- Who are the first named reviewers: an occupational therapist, an early-years educator, a dementia specialist, and a credentialed art therapist? (See [README](README.md#open-questions).)
- Are the proposed schema additions (`pillars`, `ages`, `testedWith`, `aiAssisted`, reviewer on guides, new variation kinds) acceptable to the platform owner? See [15](15-platform-data-architecture.md).
- Is a visible "tested by our team" label a separate tier from "reviewed by an outside expert"?
- Counsel to confirm the AI-disclosure wording and whether any GROW page would be treated as child-directed.
- The S2 to S4 counts are judgment. They need recalibrating from S1 usability and capacity data.
- The count of printable templates and coloring pages is not verified.
