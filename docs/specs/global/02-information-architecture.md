# 02. Information architecture

This file sets the global structure of creativeactivities.org: the URL scheme, the facet taxonomy that every activity is tagged with, the navigation for each pillar, the rules for search hubs that stop them turning into thin duplicates, and how one activity can appear in many places without being copied. It extends the baseline site in `site/` and keeps every existing URL working. It does not set content volumes; those are in [06](06-content-library.md) and the gates are in [18](18-roadmap.md).

**Read with:** [03 website features](03-features-web.md) · [01 positioning](01-positioning-and-audiences.md) · [06 content library](06-content-library.md) · [12 search and distribution](12-search-geo-distribution.md) · [13 localization](13-localization.md) · [15 platform and data](15-platform-data-architecture.md) · [R5 §6](research/05-search-scale-trust.md)

---

## 1. Principles

1. **One canonical page per startable thing.** An activity has one URL. Variations, hubs, packs, paths and partner lists point to it. They never hold a copy of its steps.
2. **Facets, not folders.** Activities are classified by facets (time, materials, setting and so on), not by category trees. A hub is a saved question over facets plus a human-written selection rule.
3. **Intent decides the page, not the label.** A hub exists for a task a person actually has. "Senior" and "dementia" are context, not separate hubs unless the selection really differs ([R5 §6](research/05-search-scale-trust.md)).
4. **Stable URLs.** Published paths do not change without a redirect. Printed cards carry a version and the URL, so a printed copy still leads somewhere sensible.
5. **Locale by review.** A translated copy is indexed only when a reviewer has passed it. Unreviewed copies may still sit at a URL today (the baseline has 189 machine-translated guide locales), but they are labeled, kept out of the index and excluded from sitemaps ([WEB-062](03-features-web.md#web-062--translation-status-and-no-index-for-unreviewed-copies); [13](13-localization.md)).
6. **No health data in the structure.** No URL, facet or tag records a diagnosis. Hub slugs may name a situation people search for, but never a treatment or outcome.

---

## 2. Global sitemap

The tree below is the target shape at S4. Items marked *(new)* do not exist in the baseline. Items marked *(exists)* are in today's site.

```text
/                                        Home: "What would you like to do together?" (exists)
/activity/                               Find an activity: finder and browse by pillar (exists; state in URL is new)
/activity/<slug>/                        Canonical activity page (exists, 38 cards)
/activity/<slug>/card/                   One-page printable card (exists as print view; URL to confirm)
/activity/packs/<id>/                    Printable pack (exists, 2 packs)
/activity/packs/build/                   Pack builder, noindex (new)
/paths/<slug>/                           Multi-week path and weekly plan (new)
/make/                                   MAKE pillar hub (new)
/games/                                  PLAY pillar hub (exists)
/games/<slug>/                           Game page (exists, 12 games)
/calm/                                   CALM pillar hub (new)
/together/                               TOGETHER pillar hub (new)
/for-older-adults/                       CARE pillar hub (new; top navigation)
/kids-and-families/                      GROW pillar hub (new; only once content is substantial)
/<intent-hub>/                           Intent hubs, e.g. /activities-for-seniors/ (4 exist; see §6)
/seasons/<season>/                       Seasonal hubs (new)
/occasions/<slug>/                       Occasion hubs, e.g. a visit or a rainy day (new)
/printables/                             Printables index: packs, cards, picture sheets (new)
/<section>/<slug>/                       Guides: /activities/, /caregiving/, /brain-health/ (exists, 88 English)
/art-therapy-and-creative-activities/    What art therapy is, and what our activities are not (new)
/for-organizations/                      Partners (exists)
/for-organizations/<partner-type>/       Care homes, libraries, schools, clinics (new, when content exists)
/today/  /handout/  /pictures/           Tools (exist)
/faq/  /about/  /editorial-policy/  /safety/  /accessibility/  /medical-disclaimer/  /privacy/  /terms/  /app/   (exist)
/<lang>/<same path>/                     Translated copies, only where reviewed (guides and some pages exist; cards do not)
```

Scale is set by content decisions in [06](06-content-library.md) and by the evidence gates in [18](18-roadmap.md). This file sets no page-count targets. It sets two ratios: every activity has exactly one canonical URL, and hubs are a small minority of the URL space.

---

## 3. URL scheme

| Page type | Pattern | Example | Status | Indexed |
|---|---|---|---|---|
| Finder | `/activity/` | `/activity/` | exists | yes |
| Finder state | `/activity/?time=10&setting=seated` | filter links | new | no for combinations; canonical to `/activity/` |
| Activity | `/activity/<slug>/` | `/activity/draw-to-music/` | exists | yes |
| Variation | `/activity/<slug>/#<variation>` | `#bedside` | new (anchor only) | no separate entry |
| Printable card | `/activity/<slug>/card/` | `/activity/draw-to-music/card/` | to confirm | canonical to the activity page |
| Pack | `/activity/packs/<id>/` | `/activity/packs/five-activities-for-a-week/` | exists | yes |
| Pack builder | `/activity/packs/build/` | | new | no |
| Path | `/paths/<slug>/` | `/paths/four-weeks-of-quiet-making/` | new | yes, when it passes §6 |
| Pillar hub | `/<pillar>/` | `/together/` | new | yes |
| Intent hub | `/<intent-slug>/` | `/bedside-activities/` | exists (4) | yes, when it passes §6 |
| Season hub | `/seasons/<season>/` | `/seasons/winter/` | new | yes |
| Occasion hub | `/occasions/<slug>/` | `/occasions/rainy-day/` | new | yes, when it passes §6 |
| Printables index | `/printables/` | | new | yes |
| Guide | `/<section>/<slug>/` | `/activities/music/` | exists (88 English) | yes |
| Game | `/games/<slug>/` | `/games/picture-pairs/` | exists (12) | yes |
| Partner type | `/for-organizations/<type>/` | `/for-organizations/care-homes/` | new | yes, when content exists |
| Boundary explainer | `/art-therapy-and-creative-activities/` | | new | yes |
| Locale copy | `/<lang>/<path>/` | `/es/activity/...` | only where reviewed | yes, with hreflang to reviewed pairs only |
| Site search | `/search/?q=` | | new | no |

### URL rules

- **Slugs** are lowercase ASCII with hyphens in English. Translated slugs are allowed in locale copies but are mapped to the English **canonical key** (see §8).
- **No dates or years in slugs.** A seasonal hub is reused every year and updated in place ([R5 §4](research/05-search-scale-trust.md)).
- **No treatment words in slugs.** "Therapy", "treatment", "therapeutic", "healing" and "cure" are not allowed in any path, because they describe claims we do not make ([MISSION](../../../MISSION.md) and [R3 §7](research/03-art-therapy-wellbeing.md)). A condition named as the search intent (for example "dementia") is allowed on a hub only when the page is non-clinical.
- **Trailing slashes** follow the baseline: every directory-style URL ends in `/`.
- **Retired slugs** get a permanent redirect to the nearest broader page, never a 404 for a published card. A card that is withdrawn for safety reasons keeps its URL and shows a notice.
- **Query strings** carry only filter and search state. They never carry personal data ([14](14-trust-safety-accessibility-privacy.md)).
- **Naming.** Guides live under `/activities/` and cards under `/activity/`. The near-identical names are easy to confuse; see open question 2.

---

## 4. Facet taxonomy

Each activity card carries these facets in its frontmatter. The baseline card schema already has `type`, `prepMinutes`, `activityMinutes`, `cost`, `mess`, `energy`, `supervision`, `settings`, `groups`, `senses`, `materials` and variation kinds; the table marks what is new. Visitors see the three finder filters first (time, materials, type). The other facets appear only as optional fit filters, in line with [DESIGN](../../../DESIGN.md) §3.

**Rule for every facet:** the default value is "any", and "I don't know" is always an allowed choice. No facet asks for a diagnosis, a condition, or a birth date.

### 4.1 Core facets

| Facet | Allowed values | Visible to visitors | Source |
|---|---|---|---|
| **Pillar** | `make`, `grow`, `care`, `calm`, `play`; `together` is a lens and is stored as a group or remote flag, not a pillar | yes, as browse tiles | new (pillar tag) |
| **Type** | `art`, `craft`, `nature`, `music`, `sensory`, `conversation`; games are a separate content type | yes (finder filter) | exists |
| **Time: start** (`prepMinutes`) | under 5 min · 5–10 min · 11–20 min · over 20 min | yes (finder filter) | exists (numbers); bands are new |
| **Time: activity** (`activityMinutes`) | under 10 · 10–20 · 20–30 · 30–60 · over 60 min | yes (finder filter) | exists (ranges); bands are new |
| **Stop at any point** | yes / no. "Yes" means the card names a natural stopping point at each step | yes, shown on card | new |
| **Materials: class** | `nothing-needed` · `things-at-home` · `simple-purchase` (one shop, low cost) · `specialist` (training or a special shop) | yes (finder filter) | new (class); free text exists |
| **Materials: tags** | controlled list, for example `paper`, `pencil`, `glue-stick`, `photos`, `crayons`, `music-device`, `cloth`, `dried-pasta`. A tag can be marked "substitute: yes" | yes, as chips | new |
| **Cost** (`cost`) | `free` (nothing to buy) · `low` · `some`. Money bands are set per market in one table, not in English prices | yes (fit filter) | exists |
| **Mess** (`mess`) | `none` · `low` · `medium`. No "high" cards are published | yes (fit filter) | exists |
| **Energy** (`energy`) | `low` (mostly sitting still) · `medium` (some moving about) · `high` (active play, outdoors, children only) | yes (fit filter) | exists (low, medium); `high` new |

### 4.2 Fit facets

| Facet | Allowed values | Visible to visitors | Source |
|---|---|---|---|
| **Setting** (`settings`) | `tabletop` · `seated` (a chair with a table) · `bedside` (in bed or an armchair, on a lap tray) · `standing` · `outdoors` · `remote` (works on a video call) | yes (fit filter) | exists (five values); `remote` new |
| **Group size** | `solo` · `one-to-one` · `small-group` (2–6) · `large-group` (7 or more) | yes (fit filter) | exists (one-to-one, small-group); `solo`, `large-group` new |
| **Group composition** (`groups` intergenerational) | `mixed-age` flag: yes or no | yes (fit filter) | exists as `intergenerational` value; now a flag |
| **Age band** | `adult` · `ages-0-2-with-adult` · `ages-3-5` · `ages-6-8` · `ages-9-12` · `ages-13-17` · `all-ages`. Used as a suggestion for child cards. Adult cards never assume a capability from age | yes, for child bands only | new |
| **Senses used** (`senses`) | `sight` · `touch` · `smell` · `hearing` · `movement`. `taste` is not in the vocabulary, to keep ingestion out of activities | yes (fit filter) | exists |
| **Sensory load** | `low` · `medium` · `high`. Describes how much input the activity gives, separate from which senses it uses | yes (fit filter: "calmer") | new |
| **Communication** | `talk-optional` · `without-words` (the card works with no speech) · `reading-not-needed` · `picture-led` (steps work from pictures alone) | yes (fit filter: "without words") | exists (without-words); others new |
| **Supervision** (`supervision`) | `independent` · `nearby` (someone close, not hands-on) · `hands-on` · `adult-steps` (some steps need an adult; the card says which) | yes (fit filter) | exists (nearby, hands-on); two new |
| **Skill** | `no-skill` (default) · `some-practice` (helpful, never required). No card claims to build a skill | yes (fit filter) | new |
| **Season** | `spring` · `summer` · `autumn` · `winter` · `any` | yes (seasonal hub) | new |
| **Occasion** | `visit` · `birthday` · `rainy-day` · `school-holiday` · `bed-rest` · `short-break` (five minutes or less) · `gift` · `celebration-any-tradition` | yes (occasion hubs) | new |
| **Culture** | `universal` (default) · `adapt-to-tradition` (the card has a note) · `market-specific` (shown only in that market) | yes, as a note | new |
| **Adaptations** (`variationKinds`) | `easier` · `less-sensory` · `seated` · `bedside` · `more-collaborative` · `for-a-group` · `with-children` · `low-vision` · `nonverbal` (exist); `large-grip` · `one-handed` · `remote` · `large-print` · `describe-aloud` (new) | yes, as variation chips | exists (nine); five new |

### 4.3 Safety flags

Safety flags are not preferences. They are shown on the card whether or not a visitor filters for them, and the filter "no small parts" exists for anyone choosing for a young child.

| Flag | Shown as | Filter |
|---|---|---|
| `small-parts` | "Not for under 3: small parts" | yes |
| `sharp-tool` | "Adult needed for sharp tools" | yes |
| `heat` | "Adult needed for heat" | yes |
| `adhesive` | "Check for glue or tape sensitivity" | yes |
| `skin-contact` | "Check for skin sensitivity to paint or materials" | yes |
| `allergen` | "Check for food or plant allergies" | no |
| `ingestion` | "Keep away from mouths" | no |
| `water` | "Spills and wet floors" | no |
| `fall-risk` | "Check the chair and space before standing" | no |

The age rule for `small-parts` follows [R2 §4]: flag small items, state supervision, and mark "not for under 3" where materials are small. This is a product-safety default, not a legal label. Legal wording needs its own review ([14](14-trust-safety-accessibility-privacy.md)).

### 4.4 Editorial status (not a visitor filter)

| Status | Meaning | Indexed |
|---|---|---|
| `draft` | Written, not checked | no |
| `reviewed` | Checked by the editorial team, with a date | yes |
| `reviewed-scope` | Also reviewed by a named credentialed reviewer, with scope written on the card (used for dementia, grief and mental-health pages) | yes |
| `translated-reviewed` | A locale copy passed native review | yes, in that locale |
| `due-review` | Past its review date | yes, with a visible date, until updated |

The scope line `Creative activity, not therapy or medical advice` is on every card ([R3 §3](research/03-art-therapy-wellbeing.md)).

---

## 5. Navigation by pillar

The top navigation keeps the five items from [DESIGN](../../../DESIGN.md) §3. Pillars are reached from the finder and from the pillar hubs, not from extra top-level items.

| Pillar | Entry point | Hub | What the hub links to | Phase |
|---|---|---|---|---|
| **MAKE** | "Make" tile on `/activity/`; top nav "Find an activity" | `/make/` | Craft cards, the arts-and-crafts intent hub, packs for makers, the paths on making | S1 (cards exist; hub is new) |
| **PLAY** | "Play" tile; top nav "Find an activity" | `/games/` | Games, printable game partners, activity cards with a turn-taking note | S1 (exists) |
| **CALM** | "Calm" tile | `/calm/` | Calm cards, the art-therapy boundary page, the crisis route where a card invites disclosure ([03](03-features-web.md)) | S1 hub, with reviewer for any grief or mental-health page |
| **CARE** | "For older adults & care" in top nav | `/for-older-adults/` | Intent hubs (seniors, arts and crafts, bedside, dementia at home once reviewed), caregiving guides, the care-home path | S1 |
| **GROW** | "For kids & families" in top nav, only once substantial | `/kids-and-families/` | Child cards with the co-play role, sensory-low cards, school and family packs | S2, after the children's data design is in place ([14](14-trust-safety-accessibility-privacy.md)) |
| **TOGETHER** (lens) | "Together" tile | `/together/` | Grandparent–grandchild hub, group and large-group cards, remote cards, `/for-organizations/` | S1 for cards; hub S2 |

**Navigation rules**

- **Two clicks** from the home page to any activity card. The finder and the pillar hubs are the two routes.
- **No mega menu on mobile.** The five top items fit in a simple list. Pillar tiles sit in the page body.
- **Breadcrumbs** on every hub, card and guide (exists, `BreadcrumbList`).
- **Search** is available on every page, and it returns cards first, then hubs, then guides ([03](03-features-web.md)).
- **Pillar hubs are navigation, not search targets.** They may rank for pillar terms, but they must not repeat an intent hub's list ([§6](#6-hub-rules)).
- **A card always shows** its pillar, its hub links and its "related" list, so a visitor who lands on a card can move sideways without going home.

---

## 6. Hub rules

Hubs are where search and understanding meet. The baseline has four hubs and the VISION names six candidates. These rules stop the hub set growing into near-duplicates, which VISION and DESIGN name as an anti-pattern: "25 hubs that are the same list with 'senior' swapped for 'dementia' or 'child'" ([DESIGN](../../../DESIGN.md) §4A).

**H1. One hub per intent.** A hub is a distinct task plus a situation, where the set of cards that fit would be meaningfully different. Test: if two hubs share more than half their cards, merge them.

**H2. No noun swaps.** "Activities for seniors", "activities for dementia" and "activities for elderly" are one intent unless their selection rules differ. Write the difference, or do not create the second page.

**H3. Publish threshold (proposal).** A hub is indexable when it has at least eight cards that meet its rule, and at least three of those differ in setting, group size or adaptation. Below that, the page is `noindex` and linked from its parent. The numbers are a starting proposal; they must be checked against Search Console once connected ([17](17-metrics-and-evidence.md)).

**H4. Original opening, written selection rule, and "not for" line.** Every hub has its own answer in the first paragraph, a sentence that explains why these cards were chosen, and a line saying who it is not for. A paragraph reused across hubs is not allowed. An automated check should flag hubs that share more than about 30% of their sentences (proposal).

**H5. Hubs list cards by key.** A hub stores the card keys it lists, plus its rule. It never copies card text. A change to a card updates every hub that lists it.

**H6. Broad head terms wait.** "Rainy day activities", "easy crafts for adults" and "crafts for kids at home" have high demand and very high competition ([R5 §6, rows 13–15](research/05-search-scale-trust.md)). They become hubs only with a situation or adaptation angle. Until then, they link to a pillar hub.

**H7. Care-service head terms route, they do not rank.** "Activities for seniors" and "dementia" mix in care-service searches the site does not serve ([R5 §3.1, §6](research/05-search-scale-trust.md)). Such hubs list sub-hubs and cards with a clear route to each intent.

**H8. Seasons and occasions are reused.** One season hub per season and one occasion hub per occasion, updated every year. No year-stamped pages.

**H9. Selection is never paid.** Cards are chosen by fit. No sponsored placement, no featured-partner slot without a disclosure, and no order set by revenue ([16](16-business-model.md)).

**H10. Hubs retire.** A hub below the H3 threshold for two review cycles merges into its parent, and its URL redirects. The trigger is measured, not guessed.

**H11. Count by phase (proposal).** S1 keeps the three intent hubs that pass H1 to H4 (VISION Stage 1). Before S1 exit, run the H1 overlap test on the four current hubs; `activities-for-seniors` and `arts-and-crafts-for-seniors` are the likeliest to overlap. S2 adds hubs only with search and usability evidence. S3 and S4 add hubs per language only after that language's review, and only when each hub passes H1 to H10.

### Current hubs against the rules

| Hub | Status | Action |
|---|---|---|
| `/activities-for-seniors/` | exists | Run the H1 overlap test with the arts hub |
| `/arts-and-crafts-for-seniors/` | exists | Keep if it differs by adaptation; otherwise merge |
| `/bedside-activities/` | exists | Keep; the bedside selection rule is distinct |
| `/grandparent-grandchild-activities/` | exists | Keep; the intergenerational rule is distinct |
| `/dementia-activities/` | planned in VISION | Create only after the reviewer and H3 threshold pass ([09](09-pillar-older-adults-dementia.md)) |
| `/sensory-friendly-activities/` | planned in VISION | Only after validation; wording must avoid "for autistic children" as a headline ([08](08-pillar-parenting-kids.md)) |

---

## 7. One activity in many places, without cloning

The same activity can serve a seated hub, a bedside pack, a grandparent path, a care-home program and a remote call. These mechanisms keep one record:

1. **The card is the only record.** Facets, adaptations, steps, safety flags, related cards and guide links live in one file ([15](15-platform-data-architecture.md)).
2. **Hubs and packs select by key or by facet query.** A hub's frontmatter lists keys or a facet query. A pack lists keys in print order (exists in `site/src/data/packs.ts`).
3. **Variations are sections, not pages.** A card holds its variations. Hubs and chips link to `#seated`, `#bedside`, `#nonverbal`. A variation gets its own URL only when all three hold, and this is a proposal to test: its steps differ in more than half their lines; a hub needs it to answer a distinct query; and a reviewer has signed off that version.
4. **Printable cards are generated from the card.** The printed copy and the web page cannot drift. Each print carries the card's version and date ([03](03-features-web.md), "versioned prints").
5. **Related cards are chosen by function.** The "related" list is computed from shared facets (same setting, same materials class, same energy) and from a short functional tag, not from keywords. This matches VISION's "functional similarity" rule.
6. **Guides and cards link both ways.** Build-time indexing lists each guide's cards and each card's guides. Neither side is typed twice.
7. **Translations inherit facets.** A locale copy has the same key and facets, so a reviewed translation can change words without changing the structure.

---

## 8. Canonical keys and locale mapping

Each card, hub, path, pack and game has a **canonical key**. For cards today, the key is the English slug. The key never changes, even when a translated slug differs.

- A locale manifest maps each key to its locale slug and review status.
- `hreflang` links only pairs where both pages are reviewed. Where a translation is missing, the links fall back to English with a clear notice. The existing middleware already sends internal links to English when a translation is missing ([`site/src/middleware.ts`](../../../site/src/middleware.ts)).
- Cards are English-only today. The first localized cards follow the review gates in [13](13-localization.md). Until then, the `/<lang>/activity/` path does not exist; it is not a redirect to English.

---

## 9. Open questions

1. **Brain-health section name.** The guide section `/brain-health/` (10 English guides) implies a cognitive outcome. [R4 §5](research/04-games-engagement.md) rejects that kind of wording. Options: rename to a non-outcome term in a redirect-safe move, or keep and rewrite each guide's opening. Decide before the next guide batch.
2. **Naming of guides and cards.** `/activities/` (guides) and `/activity/` (cards) differ by one letter. Option: move guides to `/guides/<section>/<slug>/` with 301s. The cost is a large redirect set; the gain is clarity for visitors and for AI citations.
3. **Print URL.** The baseline has a print card with a QR code. Confirm its URL and whether it is a separate route or a print stylesheet on the card page, then fix the rule in §3.
4. **Variation threshold.** The "more than half the lines differ" rule in §7 is a proposal. Test it on the first five cards with real variations before using it.
5. **Hub threshold numbers.** The eight-card and three-difference thresholds in H3 are proposals with no source. They should be set from the first Search Console and usability data.
6. **Does `/for-older-adults/` replace `/activities-for-seniors/` in the top navigation, or sit above it?** Test with the usability sessions in [17](17-metrics-and-evidence.md).
7. **Time bands.** The bands in §4.1 are a starting point. They should match the finder choices the baseline already shows, once those are checked against the shipped code.
