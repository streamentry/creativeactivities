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
- **Verdicts, first match wins:** `filter-only` when H3 fails. `route-to-hub` when more than half of the cards are in one hub. `route-to-facet` when more than half are in another facet. Otherwise `page`. The `route-to-facet` verdict is an extension: the brief requires a facet to overlap no facet by more than half, but does not say what happens when it does.

## Results

Hubs read: 14, of which 7 are held from search. All 14 count for H1.

Live cards: 53. H3 uses MIN_CARDS = 8 and MIN_DIFFERENT = 3. H1 uses OVERLAP_LIMIT = 0.5, meaning strictly more than.

| Facet | Rule | Cards | H3 pass | Largest hub overlap | Verdict |
|---|---|---:|---|---|---|
| Setting: tabletop | `settings` includes `tabletop`. | 50 | yes (50 cards, 14 profiles) | /bedside-activities/ 28% | route-to-facet to setting:seated |
| Setting: seated | `settings` includes `seated`. | 53 | yes (53 cards, 17 profiles) | /bedside-activities/ 30% | route-to-facet to cost:low |
| Setting: bedside | `settings` includes `bedside`. | 28 | yes (28 cards, 6 profiles) | /bedside-activities/ 57% | route-to-hub to /bedside-activities/ |
| Setting: standing | `settings` includes `standing`. | 1 | no (1 cards, 1 profiles) | /activities-for-seniors/ 100% | filter-only |
| Setting: outdoors | `settings` includes `outdoors`. | 5 | no (5 cards, 2 profiles) | /activities-for-seniors/ 80% | filter-only |
| Group: one-to-one | `groups` includes `one-to-one`. | 52 | yes (52 cards, 16 profiles) | /bedside-activities/ 31% | route-to-facet to setting:seated |
| Group: small-group | `groups` includes `small-group`. | 50 | yes (50 cards, 14 profiles) | /bedside-activities/ 28% | route-to-facet to setting:seated |
| Group: intergenerational | `groups` includes `intergenerational`. | 46 | yes (46 cards, 10 profiles) | /bedside-activities/ 30% | route-to-facet to setting:seated |
| Time: short to start | The shortest estimate, `activityMinutes[0]`, is 15 minutes or less. | 46 | yes (46 cards, 14 profiles) | /bedside-activities/ 33% | route-to-facet to setting:seated |
| Time: about 30 minutes | The estimate range includes 30: min is 30 or less and max is 30 or more. | 48 | yes (48 cards, 15 profiles) | /bedside-activities/ 29% | route-to-facet to setting:seated |
| Time: 45 minutes or more | The longest estimate, `activityMinutes[1]`, is 45 minutes or more. | 6 | no (6 cards, 6 profiles) | /occasions/gift/ 50% | filter-only |
| Setup: none | `prepMinutes` is 0. | 2 | no (2 cards, 2 profiles) | /activities-for-seniors/ 50% | filter-only |
| Setup: 5 minutes or less | `prepMinutes` is 5 or less. | 26 | yes (26 cards, 11 profiles) | /bedside-activities/ 42% | route-to-facet to setting:seated |
| Mess: low | `mess` is `none` or `low`. | 44 | yes (44 cards, 14 profiles) | /bedside-activities/ 36% | route-to-facet to setting:seated |
| Cost: low | `cost` is `free` or `low`. | 53 | yes (53 cards, 17 profiles) | /bedside-activities/ 30% | route-to-facet to setting:seated |

Largest facet overlap (share of the facet's cards that the other facet also holds):

| Facet | Largest facet overlap |
|---|---|
| Setting: tabletop | setting:seated 100% |
| Setting: seated | cost:low 100% |
| Setting: bedside | setting:seated 100% |
| Setting: standing | setting:tabletop 100% |
| Setting: outdoors | setting:tabletop 100% |
| Group: one-to-one | setting:seated 100% |
| Group: small-group | setting:seated 100% |
| Group: intergenerational | setting:seated 100% |
| Time: short to start | setting:seated 100% |
| Time: about 30 minutes | setting:seated 100% |
| Time: 45 minutes or more | setting:tabletop 100% |
| Setup: none | setting:tabletop 100% |
| Setup: 5 minutes or less | setting:seated 100% |
| Mess: low | setting:seated 100% |
| Cost: low | setting:seated 100% |

## Reading the results

- No facet is a `page` under these rules. Ten facets route to `setting:seated` or `cost:low`, and both match every live card (53 of 53). That route says the facet is too broad to browse, not that it duplicates one page.
- `route-to-hub` applies only to `setting:bedside` (57% in `/bedside-activities/`), the case the hub rules were written for.
- Four facets fail H3: standing and outdoors (too few cards), 45 minutes or more (6 cards), and setup none (2 cards).
- The numbers are a starting proposal; H3 must be checked against Search Console once connected.
