# Facet report, 2026-11-19

WEB-010 asks which browse facets may become pages. This report applies the hub rules in [02 §6](02-information-architecture.md#6-hub-rules) to facets built from card fields only. It adds no pages, routes or sitemap entries. The code is `site/src/lib/facets.ts`, the test is `site/src/lib/facets.test.ts`, and the table comes from `site/scripts/facet-report.mjs`.

## Rules used

- **H1, "One hub per intent":** if two hubs share more than half their cards, merge them. Here the test applies to facets: a facet with more than half of its cards in an existing hub routes to that hub, and a facet with more than half of its cards in another facet routes to that facet. Exactly half is not an overlap.
- **H3, "Publish threshold (proposal)":** at least eight cards meet the rule, and at least three of those differ in setting, group size or adaptation.

## Definitions

- **Live cards:** every card file, minus any with a `withdrawn` block (53 today, none withdrawn).
- **Settings:** one facet per value in `settings` (tabletop, seated, bedside, standing, outdoors).
- **Group size:** one facet per value in `groups`.
- **Time bands:** these overlap on purpose. "Short to start" means `activityMinutes[0]` is 15 or less. "About 30 minutes" means the range includes 30. "45 minutes or more" means `activityMinutes[1]` is 45 or more.
- **Setup bands:** "none" means `prepMinutes` is 0. "5 minutes or less" means `prepMinutes` is 5 or less.
- **Mess and cost:** `mess` is `none` or `low`, and `cost` is `free` or `low`. `none` and `free` are included so that "low" means "not more than low".
- **"No special materials":** not defined. The schema has no field for it, and `materials` is free text, so a facet would need guessing.
- **"Differ" (H3):** a card's profile is its sorted `settings` set, its sorted `groups` set, and `energy/supervision`. The variation kinds are left out because almost every card lists the same ones, so they cannot tell cards apart. A facet differs when its cards show at least three distinct profiles.
- **Verdicts, first match wins:** `filter-only` when H3 fails. `route-to-hub` when more than half of the cards are in one hub. `too-broad` when the facet holds more than half of all live cards (a page would be the catalog again; a too-broad facet is never a routing target). `route-to-facet` when more than half of the cards are in another facet. Otherwise `candidate`, which may become a page only with the search and usability evidence H11 asks for. `route-to-facet` and `too-broad` extend H1, which speaks only of hubs.

## Results

Hubs read: 14, of which 7 are held from search. All 14 count for H1.

Live cards: 53. Hubs read: 14 (7 held from search).
H3 uses MIN_CARDS = 8 and MIN_DIFFERENT = 3; H1 uses OVERLAP_LIMIT = 0.5 (strictly more than).

| Facet | Rule | Cards | H3 pass | Largest hub overlap | Verdict |
|---|---|---:|---|---|---|
| Setting: tabletop | `settings` includes `tabletop`. | 50 | yes (50 cards, 14 profiles) | /bedside-activities/ 28% | too-broad |
| Setting: seated | `settings` includes `seated`. | 53 | yes (53 cards, 17 profiles) | /bedside-activities/ 30% | too-broad |
| Setting: bedside | `settings` includes `bedside`. | 28 | yes (28 cards, 6 profiles) | /bedside-activities/ 57% | route-to-hub to /bedside-activities/ |
| Setting: standing | `settings` includes `standing`. | 1 | no (1 cards, 1 profiles) | /activities-for-seniors/ 100% | filter-only |
| Setting: outdoors | `settings` includes `outdoors`. | 5 | no (5 cards, 2 profiles) | /activities-for-seniors/ 80% | filter-only |
| Group: one-to-one | `groups` includes `one-to-one`. | 52 | yes (52 cards, 16 profiles) | /bedside-activities/ 31% | too-broad |
| Group: small-group | `groups` includes `small-group`. | 50 | yes (50 cards, 14 profiles) | /bedside-activities/ 28% | too-broad |
| Group: intergenerational | `groups` includes `intergenerational`. | 46 | yes (46 cards, 10 profiles) | /bedside-activities/ 30% | too-broad |
| Time: short to start | The shortest estimate, `activityMinutes[0]`, is 15 minutes or less. | 46 | yes (46 cards, 14 profiles) | /bedside-activities/ 33% | too-broad |
| Time: about 30 minutes | The estimate range includes 30: min is 30 or less and max is 30 or more. | 48 | yes (48 cards, 15 profiles) | /bedside-activities/ 29% | too-broad |
| Time: 45 minutes or more | The longest estimate, `activityMinutes[1]`, is 45 minutes or more. | 6 | no (6 cards, 6 profiles) | /occasions/gift/ 50% | filter-only |
| Setup: none | `prepMinutes` is 0. | 2 | no (2 cards, 2 profiles) | /activities-for-seniors/ 50% | filter-only |
| Setup: 5 minutes or less | `prepMinutes` is 5 or less. | 26 | yes (26 cards, 11 profiles) | /bedside-activities/ 42% | candidate |
| Mess: low | `mess` is `none` or `low`. | 44 | yes (44 cards, 14 profiles) | /bedside-activities/ 36% | too-broad |
| Cost: low | `cost` is `free` or `low`. | 53 | yes (53 cards, 17 profiles) | /bedside-activities/ 30% | too-broad |

Largest facet overlap (share of the facet cards that the other facet also holds):

| Facet | Largest facet overlap |
|---|---|
| Setting: tabletop | prep:little 46% |
| Setting: seated | prep:little 49% |
| Setting: bedside | prep:little 64% |
| Setting: standing | prep:none 100% |
| Setting: outdoors | prep:little 20% |
| Group: one-to-one | prep:little 50% |
| Group: small-group | prep:little 46% |
| Group: intergenerational | prep:little 46% |
| Time: short to start | prep:little 57% |
| Time: about 30 minutes | prep:little 44% |
| Time: 45 minutes or more | setting:standing 0% |
| Setup: none | prep:little 100% |
| Setup: 5 minutes or less | prep:none 8% |
| Mess: low | prep:little 59% |
| Cost: low | prep:little 49% |

## Reading the results

- **One candidate: "Setup: 5 minutes or less"** (26 of 53 cards, 11 profiles, at most 42% in any hub). It passes H1 and H3 and narrows the catalog to about half. Under H11 it becomes a page only with search and usability evidence; this report alone does not make it one.
- **Bedside routes to its hub:** 57% of the bedside facet's cards are already in `/bedside-activities/`, the case H1 was written for.
- **Ten facets are too broad:** each holds more than half of the 53 live cards (seated and low cost hold all 53), so a page would be the catalog again. They stay as filters on the finder.
- **Four facets fail H3:** standing and outdoors (too few cards), 45 minutes or more (6 cards) and setup none (2 cards).
- With 53 cards, most facets cannot narrow anything. Run the report again as cards are added; `too-broad` turns into a real verdict only then.
- The numbers are a starting proposal; H3 must be checked against Search Console once connected.
