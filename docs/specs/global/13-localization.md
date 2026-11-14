# 13. Localization (L10N-###)

This file sets the rules for taking creative activities into other languages and cultures: what exists today, the order and gates for launching languages, how native review works, how culture and local safety information are handled, and what must never be published by machine alone. It extends [language markets](../../plan/language-markets.md), the [native review guide](../../engineering/native-review.md) and the [web SEO strategy](../../strategy/web-seo.md) section on focus markets. It does not repeat their tables. Where they disagree, the disagreement is in Open questions.

**Read with:** [README](README.md) · [search, GEO and distribution](12-search-geo-distribution.md) · [trust, safety, accessibility, privacy](14-trust-safety-accessibility-privacy.md) · [roadmap](18-roadmap.md) · [metrics](17-metrics-and-evidence.md) · [app features](04-features-app.md) · [content library](06-content-library.md) · [GROW](08-pillar-parenting-kids.md) · [CARE](09-pillar-older-adults-dementia.md) · [CALM](10-pillar-creative-wellbeing.md) · [platform and data](15-platform-data-architecture.md) · [DESIGN.md](../../../DESIGN.md)

## Why this matters

"Translated" is not "localized." A machine-made page can read fluently and still say the wrong thing about a material, a safety step, an emergency number or dementia. The plan already says so: the translated website stays out of search until native review, and all translations are currently machine-made and unreviewed [plan README, state 2026-11-01]. [R5 §2.3] reaches the same conclusion from the peer-site evidence. This file turns that into rules.

## Current state (2026-11-14)

| Surface | State | Source |
| --- | --- | --- |
| App text | 320 messages in `app_en.arb`; hardcoded literals (estimate: 300 to 400, about 2,400 words) still in `lib/` | [language markets §2](../../plan/language-markets.md); [native review](../../engineering/native-review.md) |
| App build 1.6.0 | Submitted with 20 languages on 2026-10-31; awaiting review, nothing approved | [plan README](../../plan/README.md) |
| Website | Live in 20 languages; translations held out of search and sitemaps until reviewed | [plan README](../../plan/README.md) |
| Activity cards | 38, English only | [README baseline](README.md) |
| Guides | 88 English. Machine-translated to 189 locale codes (baseline) and "40 guides in 19 languages" (plan). Counts differ; see L10N-001 | [README](README.md); [plan README](../../plan/README.md) |
| Review sign-off | No language signed off yet | [native review](../../engineering/native-review.md) |
| Store listings | Drafts. Apple: 50 localizations available; Google Play: 86 language entries | [language markets §2](../../plan/language-markets.md) |

## Items

### L10N-001 · Current-state inventory and count reconciliation
Priority P0 · Phase S2 · Status partial · Pillars: all

Why: Three sources give different counts for the same translations. Planning on the wrong count makes the review budget wrong [README baseline; plan README; native review].

What: Build one dated table from the release status file and the site's i18n files: per language, per surface (app, store, website UI, games, guides, activity cards), and the review state of each.

Acceptance:
- One source of truth, updated on each release.
- The baseline and plan counts are either reconciled or each labeled with what it counts.
- Each row has a reviewer field, empty until review.

Depends on: none.
Risks / not doing: Do not report a language as "translated" in public copy if its guides are not.

### L10N-002 · Launch order and evidence gates
Priority P0 · Phase S2 · Status partial · Pillars: all

Why: Languages cost review time, and the program has said that global coverage is earned language by language [VISION; roadmap]. An order without gates is a list of hopes.

What: The operative order is the review order in the [native review guide](../../engineering/native-review.md): Spanish, Vietnamese, Japanese, Traditional Chinese, German, French, Korean, Simplified Chinese, Portuguese (Brazil), Italian, Arabic, Russian, then Polish, Dutch, Turkish, Indonesian, Thai, Ukrainian, Hindi, then the top-50 expansion. Each language moves forward only when its gate passes.

Gates, taken from the plan and roadmap:
- **Reviewed:** a named native reviewer has signed off the Tier 1 surfaces (app, store, picture packs) and the website hub and games (L10N-003).
- **Earned search:** a reviewed language's pages go into sitemaps and `hreflang` (L10N-020). Search data decides whether it keeps its place in the queue.
- **Spend check:** the plan's day-30 rule: at least 20% of first-time downloads come from outside the US, or from Spanish or Vietnamese in the US. Below 10% in a language, stop review spending after Spanish and Vietnamese [plan README, day 30 row].

Acceptance:
- A gate table with the current status of each language, updated monthly.
- No new language enters review without a reviewer named.
- No review budget is committed beyond the day-30 gate without a maintainer decision.

Depends on: L10N-001, L10N-003, [roadmap](18-roadmap.md).
Risks / not doing: The web SEO strategy's focus list differs from this order (Open questions). Do not run both lists in parallel.

### L10N-003 · Native review workflow
Priority P0 · Phase S2 · Status partial · Pillars: all

Why: A wrong tone, a medical promise or a wrong emergency number does more harm than an awkward sentence [native review, "Why review matters"].

What: The native review guide is the standard. Tier 1 is the app, store listing and picture-pack text, reviewed first. Tier 2 is the website interface, games and guides, starting with the eight most visited guides. The seven-point checklist applies to every surface: dignity and tone; no claims; numbers and sources; emergency numbers and local services; quiz answers; phone menu names; local swaps.

Acceptance:
- A sign-off record per language and surface, with reviewer name, date and version reviewed.
- The language is marked reviewed in the one place the site reads it (`REVIEWED_LANGUAGES`, `site/src/i18n/locales.ts`). The app reads its own status file. The two must agree.
- Any change after review reopens the affected segments.
- At 200% text size, each Tier 1 screen is checked for clipping.

Depends on: L10N-004, L10N-005.
Risks / not doing: Do not sign off a language on a partial read. Do not treat a reviewer's silence as approval.

### L10N-004 · Reviewer recruitment and credentials
Priority P0 · Phase S2 · Status new · Pillars: all

Why: The current reviewers are not named. The reviewer is the guarantee of quality, and no credential may be claimed that is not verified [DESIGN §5; R3 §7].

What: Recruit one named native reviewer per launched language, paid at a stated rate. Each reviewer states their scope (for example, everyday language, or medical terms). For health-adjacent text, a second reviewer with a relevant background checks dementia terms and any care instructions. Credentials are shown only with written permission and a verified record.

Acceptance:
- A reviewer register: name or pseudonym (with consent), language, region, scope, date, and whether a second check applies.
- No reviewer credential shown on any page without a record.
- Reviewer cost is in the budget (L10N-024).

Depends on: [TSA file](14-trust-safety-accessibility-privacy.md) (reviewer and credential display).
Risks / not doing: Do not use a translation vendor's word for a clinical review.

### L10N-005 · Content that is never published by machine alone
Priority P0 · Phase S2 · Status new · Pillars: all

Why: A mistranslated instruction about materials or safety is a real harm [R5 §2.3]. Health and crisis content is the highest risk [MISSION, non-negotiables].

What: Machine translation is a draft only, for every content type. Content in these classes is published only after a human reviewer has signed the specific segment:
- Safety labels, supervision lines, allergen and ingestion notes, choking and heat warnings.
- Health, dementia and care-setting wording, including stage terms.
- Crisis and emergency routes.
- Claims about benefit, and anything in store copy that describes what the app does.
- Any instruction that a person follows with their hands or body.

Acceptance:
- Each translated segment carries a status: `machine`, `reviewed`, `stale`.
- Segments in the protected classes cannot be published with `machine` status. A build check fails if one is.
- The check is tested with a deliberately unreviewed safety segment.

Depends on: L10N-003, L10N-021.
Risks / not doing: Do not hide machine text from a reader who has no other version. Show the English, marked, or show nothing for that segment.

### L10N-006 · Structure survives translation
Priority P0 · Phase S2 · Status new · Pillars: all

Why: Losing an adaptation in translation is the most likely quality defect [R5 §2.3]. The adaptation is the product [DESIGN §5].

What: A structural check compares every translated activity with its English source: the same number of steps, variations, safety flags, supervision level, materials and accessibility adaptations, in the same order. Translators translate the words and the structure stays fixed.

Acceptance:
- Automated diff passes for every reviewed activity.
- A translated activity with a missing variation fails the build.
- Units and numbers match the English after locale conversion (L10N-014).

Depends on: [DESIGN.md §5](../../../DESIGN.md) data model, L10N-010.
Risks / not doing: Do not let translators rewrite adaptations to "sound more natural" without a reviewer's sign-off.

### L10N-007 · Dementia terminology glossary per locale
Priority P0 · Phase S2 · Status new · Pillars: CARE, all

Why: The word for dementia is stigmatized in several languages, and a title that uses the wrong one loses trust and search. Each locale's public term is a decision, not a translation [language markets §1; native review, "Naming"].

What: A glossary per launched language with the public term for dementia and for "Alzheimer's", the term used in search, and the term avoided. Examples from the research: Japanese 認知症 (not 痴呆 or ボケ); Taiwan 失智症; Korean 치매 is stigmatized, so do not title with it; Simplified Chinese colloquial 老年痴呆 is stigmatizing; French public copy avoids *démence*; Turkish *bunama* is stigmatized; Arabic public copy uses الزهايمر; Spanish searchers type *alzhéimer*.

Acceptance:
- Glossary with reviewer, date and reason for each term.
- Titles and headings use the glossary term; body text may explain the clinical term once.
- The name check (L10N-008) uses the glossary.

Depends on: L10N-003.
Risks / not doing: Do not use "patients" in copy. Use "people living with dementia" or the local equivalent [web SEO §6, CONTENT_GUIDE].

### L10N-008 · Brand-name propagation check
Priority P0 · Phase S2 · Status new · Pillars: all

Why: The product was renamed from Golden Moments on 2026-11-13. Old copy still exists in the web SEO strategy, link-building drafts and possibly translations [web SEO; link building note; language markets §5].

What: Search every launched locale's strings, guides, store metadata and games for the old name and the old domain. Replace with the current name, without changing sent outreach messages, which stay as sent.

Acceptance:
- Zero hits for the old name in launched locales, in ARB, JSON, guides and metadata.
- Sent emails are kept as a record, not edited.
- Search for `dementiaactivities.games` text in copy returns only redirect and record references.

Depends on: L10N-001.
Risks / not doing: Do not rename a translated product name without a reviewer. Naming is a native decision [native review].

### L10N-009 · Local safety and crisis information
Priority P0 · Phase S2 · Status new · Pillars: CALM, CARE, GROW

Why: A wrong emergency or crisis number is the most serious possible translation error. Local emergency numbers vary, and the English "911" is not valid everywhere [native review, check 4; R3 §4.4].

What: For each launched locale, a table of the crisis and emergency routes used by any page that invites disclosure or describes an emergency. Each route is taken from the official source for that country and dated. Where a country has no verified number, the text says "your local emergency number" and links to the official source.

Acceptance:
- Every number has an official source URL and a checked-on date.
- No number from a secondary source is published. R3 flags several routes as needing verification, including the US 988 line.
- Reviewed per language. Each route is tested on a phone set to that locale.

Depends on: L10N-003, [TSA](14-trust-safety-accessibility-privacy.md) crisis routes.
Risks / not doing: Do not list numbers in this file. The table lives with the locale files.

### L10N-010 · Translation memory, term base and ARB extraction
Priority P0 · Phase S2 · Status partial · Pillars: all

Why: Hardcoded text cannot be translated or reviewed in a consistent way. The extraction to ARB comes before translation [language markets §2].

What: Move all hardcoded app strings into ARB (estimate: 300 to 400 literals). Keep one term base (activity names, materials, safety phrases, dementia terms from L10N-007) and a translation memory of approved segments. Approved segments are reused; reviewed text is never overwritten without a review.

Acceptance:
- No new hardcoded user-facing string in `lib/`. A lint check enforces it.
- Term base and memory versioned in the repo or the translation tool.
- Approved segments carry the reviewer's ID.

Depends on: [platform and data](15-platform-data-architecture.md).
Risks / not doing: Do not outsource the term base to a machine tool without review.

### L10N-011 · Activity cards localized before guides
Priority P0 · Phase S2 · Status new · Pillars: all

Why: The activity card is the unit of "We tried this" and the printable card is the distribution asset [R5 §4; metrics]. The guides are supporting reading. Today all 38 cards are English only [README baseline].

What: For each language in the launch order, translate the top eight activity cards first (those linked from its hubs), then the rest. The card includes its adaptations, safety line, stop note and print version.

Acceptance:
- A translated card passes L10N-006 and L10N-005.
- Its print version fits A4 and US Letter (L10N-014).
- The hub links in that language point only to reviewed cards.

Depends on: L10N-006, L10N-003.
Risks / not doing: Do not translate the finder interface before the cards it finds.

---

### L10N-012 · Cultural adaptation register
Priority P1 · Phase S2 · Status new · Pillars: all

Why: "Global" does not mean one culture. Some content travels badly: a flower is a funeral flower in some countries, a military row is sensitive in others, and a religious song category depends on the reader [native review, "Known points"; SEO.md §8.2].

What: For each locale, a register of every swap made from the English source: what was replaced, why, and who approved it. The first register already lists known points, for example the Italian picture-pack flower, the Japanese men's guide military row, the Traditional Chinese music list with Buddhist chants, the Vietnamese genre, and the German formal and informal forms.

Acceptance:
- Register per launched locale, reviewed with the locale sign-off.
- Each known point from the native review guide is decided (keep, change, or remove) and recorded.
- Swaps never remove a safety flag.

Depends on: L10N-003.
Risks / not doing: Do not replace a US example with a stereotype of another culture.

### L10N-013 · Holidays, faith and food defaults
Priority P1 · Phase S2 · Status new · Pillars: all

Why: Holiday crafts are a top-ranked cluster in English [R5 §6 rank 6], but a holiday default for every reader would exclude many. Faith imagery, food and fasting practices affect what is appropriate [MISSION, "Cultural openness"].

What: Each locale sets default holiday, faith and food assumptions: which seasonal content it shows, whether religious symbols are used, and which foods are offered as materials. Default is secular and seasonal (for example, winter or harvest activities) unless the reviewer says a holiday fits the locale.

Acceptance:
- Holiday calendar per locale, owned by its reviewer.
- No religious symbol used by default; choice is offered where it is part of an activity.
- Food materials use a locale-appropriate list and keep the allergen and swallowing notes from the English source (see [TSA](14-trust-safety-accessibility-privacy.md)).

Depends on: L10N-012, [SEO-036](12-search-geo-distribution.md).
Risks / not doing: Do not assume Christmas, Lunar New Year, Ramadan or any other event applies to all readers.

### L10N-014 · Units, paper sizes and printing
Priority P1 · Phase S2 · Status new · Pillars: all

Why: Printables are a core distribution asset [R5 §4]. Paper size differs by country (A4 widely, US Letter in the US and Canada), and so do units.

What: Each printable and activity card is laid out in the locale's paper size and units. Measurements are converted once by a rule (for example, centimeters and degrees Celsius outside the US). Fonts for each script print correctly.

Acceptance:
- Print tested on A4 and US Letter for each launched locale with a diacritic- or script-heavy title.
- Units match the reader's locale. Conversions are checked by a reviewer.
- No printable reads "inches" beside a metric quantity or the reverse.

Depends on: L10N-017, [SEO-022](12-search-geo-distribution.md).
Risks / not doing: Do not print a version number without a date.

### L10N-015 · Family structures and forms of address
Priority P1 · Phase S2 · Status new · Pillars: all

Why: Many households are multigenerational, and terms such as "grandmother," "parent" or "spouse" vary by culture [MISSION, "Cultural openness"]. Forms of address (formal or informal) differ by language.

What: Use role words that fit many families: "the older person," "your family member," "the person you care for," and per-locale equivalents. Each locale chooses its form of address with a reviewer. Lines spoken by a family member use the same form throughout.

Acceptance:
- No copy assumes a household has one parent or one kind of family.
- Form of address is consistent within a locale (for example, the German formal or informal choice that the native review guide flags).
- Reviewer signs the choice.

Depends on: L10N-012.
Risks / not doing: Do not use a term that labels the older person as a patient, in any language.

### L10N-016 · Right-to-left layout
Priority P1 · Phase S2 · Status partial · Pillars: all

Why: Arabic is eleventh in the launch order and needs a full layout check. Hebrew is not in the launch list [native review; language markets §3].

What: Mirror layout with `Directionality`. Replace directional `EdgeInsets` and alignment with their start and end variants. Use a taller line height for Arabic and never letter-space it. Arrow direction in link labels follows the reading direction.

Acceptance:
- Arabic app and web screens reviewed at 200% text in an RTL layout.
- No hardcoded left or right on text blocks.
- Address form (the masculine singular used throughout) is confirmed by the reviewer.

Depends on: L10N-003, L10N-017.
Risks / not doing: Do not run Arabic before the Arabic reviewer is signed. RTL is not a translation job.

### L10N-017 · Scripts and font coverage
Priority P1 · Phase S2 · Status partial · Pillars: all

Why: Fonts do not cover every launched script, and the fallback is silent. The app's headline font is a Latin subset [language markets §3].

What: Record coverage per font. Roboto covers Vietnamese, Cyrillic, Greek, Polish and Turkish letters. It does not cover Arabic, Hebrew, CJK, Hangul or Devanagari. The Fraunces subset does not cover Vietnamese, Polish, Turkish or Cyrillic. CJK and Arabic fall back to system fonts on mobile. The web build needs Noto fallbacks, which are unverified.

Acceptance:
- Font coverage test per launched locale, on device and on web.
- Web fallback fonts (Noto or equivalent) added and tested; their size counted in the performance budget ([SEO-028](12-search-geo-distribution.md)).
- Turkish casing test for dotted and dotless i (no `toUpperCase()` on İ and ı).

Depends on: [performance and platform](15-platform-data-architecture.md).
Risks / not doing: Do not ship a web font subset that drops a launched language's letters.

### L10N-018 · Text length and 200% layout per language
Priority P1 · Phase S2 · Status new · Pillars: all

Why: German and Korean labels run about 30% longer than English [language markets §3]. Layouts break at 200% zoom in ways that English hides.

What: Each reviewed locale is tested at 200% text, 320px width and the longest labels. Buttons, tabs, the finder and the print card are checked.

Acceptance:
- No clipped text, no overlapping controls, no horizontal page scroll at 320px.
- Each Tier 1 screen has a screenshot per reviewed language, kept with the sign-off record.
- Targets stay at 48px in every locale.

Depends on: L10N-003, [DESIGN §6](../../../DESIGN.md).
Risks / not doing: Do not shorten a translation to fit a button. Change the layout.

### L10N-019 · Store localization mechanics
Priority P1 · Phase S2 · Status partial · Pillars: all

Why: Each storefront has its own list of languages and its own search fields. Google Play machine-translates some listings unless a translation is supplied [language markets §2].

What: Apple: each storefront has a default language and additional languages whose keywords are searchable there. Use the additional languages for diaspora audiences (for example, Spanish (Mexico) and Vietnamese in the US store). Google Play: machine-translated listings show for ten languages, and a supplied translation replaces them. Each binary declares its languages in Xcode.

Acceptance:
- Storefront plan: default and additional languages per market, with the reason.
- Store copy for each launched storefront is reviewed (L10N-005 applies to claims).
- Binary and app language lists match.

Depends on: L10N-003, [SEO-033](12-search-geo-distribution.md).
Risks / not doing: Do not use the keyword field to make claims about the app.

### L10N-020 · Indexing and hreflang only for reviewed locales
Priority P1 · Phase S2 · Status partial · Pillars: all

Why: Indexed, unreviewed translations look like machine-made content at scale [web SEO §6]. The plan keeps them out of search until review [plan README].

What: Reviewed locales enter sitemaps and `hreflang`. Unreviewed locales are excluded or `noindex`. Three months after verification, any language with no indexed pages or no impressions is set to `noindex` [web SEO §6].

Acceptance:
- The sitemap test passes for reviewed locales only.
- The indexing state of each locale is in the gate table (L10N-002).
- Conflicts with the 2026-11-01 decision for the top-50 languages are resolved (L10N-033).

Depends on: [SEO-030](12-search-geo-distribution.md), [SEO-031](12-search-geo-distribution.md), L10N-002.
Risks / not doing: Do not use indexation to test whether a language would rank.

### L10N-021 · Stale translations after English changes
Priority P1 · Phase S2 · Status new · Pillars: all

Why: An English fix that does not reach the translation keeps the error in place. A translated safety line that no longer matches the English is a harm.

What: When an English segment changes, every translation of it is marked `stale`. Stale protected segments (L10N-005) are hidden or flagged until re-reviewed. Stale non-protected segments may show with a note.

Acceptance:
- Stale state is set automatically on English edits.
- A re-review queue, ordered by protected class first.
- Re-review SLA set in the roadmap and tracked.

Depends on: L10N-005, [platform](15-platform-data-architecture.md).
Risks / not doing: Do not silently show a stale safety segment.

### L10N-022 · Mainland China exclusion
Priority P1 · Phase S2 · Status partial · Pillars: all

Why: Apple lists the ICP filing and game registration requirements, and an ICP filing needs a Chinese entity or agent [language markets §2].

What: No mainland storefront. Simplified Chinese serves overseas storefronts and the diaspora only. This decision is recorded and revisited only if a Chinese entity exists.

Acceptance:
- Decision recorded in the storefront plan.
- No mainland-only URL or redirect.

Depends on: L10N-019.
Risks / not doing: Do not name the mainland availability as a future feature.

### L10N-023 · Accessibility in each language
Priority P1 · Phase S2 · Status partial · Pillars: all

Why: Assistive technology reads the page in the language it is declared in. A wrong language attribute breaks screen readers and text-to-speech [DESIGN §6].

What: Every page declares its language and direction. Local names of foods, places and materials are checked for pronunciation with the reviewer. The picture-pack captions that are read aloud are reviewed for the locale's voices.

Acceptance:
- `lang` and `dir` set on every page, checked in tests.
- Screen-reader test in each Tier 1 language by a user of that language, where feasible.
- Spoken captions reviewed.

Depends on: [TSA](14-trust-safety-accessibility-privacy.md) accessibility items.
Risks / not doing: Do not claim accessibility for a language that has not been screen-reader tested. Say what was tested.

### L10N-024 · Review budget and cost estimate
Priority P1 · Phase S2 · Status partial · Pillars: all

Why: Review is the binding cost. The plan states a review budget must not exceed two languages before the day-30 gate [plan README].

What: Budget per language covers reviewer time (about one working day for short surfaces, a few days for the guides, about 75,000 words for 40 guides [native review]), and QA. Human translation per word is in the range $0.08 to $0.14 in 2026 for the launch languages, and linguistic QA is $32 to $48 an hour [language markets §2, Alconost]. An order-of-magnitude estimate: about $2,700 for 3,000 words in nine languages before QA and screenshots. This is an estimate, not a quote.

Acceptance:
- Budget table per language, marked as estimate or quote.
- Spend is held to the gate in L10N-002.
- Reviewer fees are paid, and the payment is recorded.

Depends on: L10N-002.
Risks / not doing: Do not spend on languages past the gate without a maintainer decision.

### L10N-025 · Defect tracking and quality metrics
Priority P1 · Phase S2 · Status new · Pillars: all

Why: Quality needs a number, or the review process is only a feeling [metrics file].

What: Every reviewer finding is logged with a severity (safety, claim, factual, meaning, style) and a location. Track the count of open safety and claim defects per language. Report the rate of defects found after a translation is marked reviewed.

Acceptance:
- Defect log shared by reviewers and the maintainer.
- Any open safety or claim defect blocks the language's next release.
- Metric definitions in [metrics](17-metrics-and-evidence.md).

Depends on: L10N-003, [metrics](17-metrics-and-evidence.md).
Risks / not doing: Do not publish defect counts as a quality badge.

---

## Table items

| ID | Item | Priority · Phase · Status | What and acceptance | Depends on |
| --- | --- | --- | --- | --- |
| L10N-026 | Local search phrases as hypotheses | P1 · S2 · partial | Use the local phrase lists in [language markets §5](../../plan/language-markets.md) to seed reviews and titles. Acceptance: a phrase is used only after its market's Search Console data is read ([SEO-032](12-search-geo-distribution.md)). | SEO-032 |
| L10N-027 | Imagery and people across cultures | P2 · S2 · new | Show a range of families, clothing, homes and ages. Acceptance: no local stereotype; each image's rights and consent are logged ([TSA](14-trust-safety-accessibility-privacy.md)). | L10N-012 |
| L10N-028 | Community translation with reviewers | P2 · S3 · new | Volunteer translation through a review step, as in the Khan Academy model [R5 §2.2]. Acceptance: non-protected content only; volunteers credited only with permission; reviewer sign-off required. | L10N-003, L10N-005 |
| L10N-029 | Participant-language test (GM-041) | P2 · S3 · hypothesis | Test whether families who speak Spanish or Vietnamese prefer their first language for the activity. Acceptance: runs only after the test in [app features](04-features-app.md); evidence is mixed, so treat the result as a hypothesis. | L10N-002 |
| L10N-030 | Languages beyond the reviewed list | P3 · S4 · new | Any language outside the launch order enters only at S4, with its own search and review gates. Acceptance: a language entering requires L10N-002 gates and a named reviewer. | L10N-002 |
| L10N-031 | Word games and sayings per language | P2 · S3 · partial | "Finish the saying" is left out for languages without 30 genuine sayings. Word search is left out where no word search exists (for example, Burmese and Yoruba, per the native review guide). Acceptance: each game's language list matches the content that exists. | [GAME file](05-games.md) |
| L10N-032 | Quiz and activity local swaps | P2 · S2 · partial | US-only quiz questions are replaced with local ones. Acceptance: each answer checked by the reviewer; wrong options clearly wrong (native review check 5). | L10N-012 |
| L10N-033 | Index decision for the top-50 expansion | P0 · S2 · new | The 2026-11-01 decision indexes the top-50 expansion languages, and the review guide says the weakest seven (Hausa, Amharic, Burmese, Pashto, Sindhi, Somali, Oromo) should be reviewed first. This conflicts with L10N-020. Acceptance: a maintainer decision recorded; until then those languages are `noindex`, or the decision cites the evidence. | L10N-020, maintainer |

---

## Open questions

1. **Count conflict.** Baseline: 88 guides in 189 locale codes. Plan and review guide: 40 guides in 19 languages, with an expansion to about 50 languages on 2026-11-01. Which is the count of record? (L10N-001)
2. **Launch order conflict.** The native review guide starts with Spanish, Vietnamese, Japanese, Traditional Chinese. The web SEO strategy's focus list is Japanese, Spanish (ES, MX, LatAm), Portuguese (BR), Italian, with Polish as a quick win and Korean and Traditional Chinese on hold. The language markets research order is English, Japanese, Traditional Chinese, German, Spanish. One order must be chosen. (L10N-002)
3. **Indexing of the expansion languages.** The 2026-11-01 maintainer decision indexes languages that the plan keeps out of search until review. Which rule wins? (L10N-033)
4. **Reviewers.** No reviewer is named for any language. Who are they, and who approves their scope? (L10N-004)
5. **Crisis routes.** R3 flags several crisis routes as needing verification before publication. Who checks each locale's route against its official source? (L10N-009)
6. **Machine text in the product.** Build 1.6.0 ships 20 machine-made languages (maintainer decision, 2026-10-31), and the website shows translated pages to readers. That conflicts with L10N-005 for any protected segment (safety, health, crisis, claims) that is still unreviewed. Decide which segments are hidden or flagged before 1.6.0 is approved, or record the risk and its owner.
