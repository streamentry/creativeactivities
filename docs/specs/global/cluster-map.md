# Cluster map (SEO-001)

**Status:** working map, 2026-11-15. Built from the R5 ranking in [research/05 §6](research/05-search-scale-trust.md). Every rank is a judgment, not a measurement. No cluster moves up the order until SEO-002 data exists for it. Owner pages below are the only canonical targets for that cluster's intent; a second page for the same intent is a variation, not a rival ([02 §6 H1](02-information-architecture.md)).

**Evidence key:** *judgment* (R5 ranking only) · *US export* (none yet; SEO-002) · *SERP audit* (none yet) · *Search Console* (not connected).

## Ranks 1 to 12: one owner each, or a held decision

| Rank | Cluster | Canonical URL (owner) | Status | Intent | Cards that serve it | Evidence | Last checked |
|---|---|---|---|---|---|---|---|
| 1 | Seated activities for seniors | `/seated-activities/` (SEO-010) | exists (S1) | Adapt, Do | 8: tear-paper-mosaic, make-a-family-tree-of-hands, make-a-paper-chain-garland, press-leaves-and-flowers, print-with-leaves, fold-towels-together, plant-seeds-in-a-pot, paint-a-garden-stone | judgment | 2026-11-15 |
| 1 | Bedside activities for elderly | `/bedside-activities/` (exists) | exists | Adapt, Do | 16 (see the hub's `activities`) | judgment | 2026-11-15 |
| 2 | Easy crafts with arthritis or limited dexterity | none yet; SEO-017 | **hold** (S2) | Adapt | Adaptations sit in card variations. No card has a large-grip variation; the schema has no such kind. | judgment | 2026-11-15 |
| 3 | Reminiscence activities (non-clinical) | none yet; SEO-016 | **hold** (S2) | Find, Do | Interim: guide `/activities/reminiscence/`; cards such as make-a-personal-songbook and look-through-a-photo-album | judgment | 2026-11-15 |
| 4 | Printable activities for older adults | `/activity/packs/five-quiet-bedside-activities/` and `/activity/packs/five-activities-for-a-week/`; guide `/activities/printable/`; `/printables/` index is SEO-022 | exists (2 packs); index held | Share | Pack contents from `src/data/packs.ts` | judgment | 2026-11-15 |
| 5 | Grandparent and grandchild activities | `/grandparent-grandchild-activities/` | exists | Find, Share | 14 (see hub) | judgment | 2026-11-15 |
| 6 | Christmas and holiday crafts for seniors | none yet; seasonal hub `/seasons/winter/` under SEO-036 | **hold** (S2) | Find, Do | Interim: guide `/activities/holidays/`. Must cover seasons and festivals with a choice, not one holiday. | judgment | 2026-11-15 |
| 7 | Dementia activities at home | `/dementia-activities/` (SEO-009) | exists, **held noindex** | Find, Adapt | 10 (see hub). Guides: `/caregiving/how-to-play-together/` and others | judgment | 2026-11-15 |
| 8 | Easy art activities for seniors | `/arts-and-crafts-for-seniors/` (exists; owned by SEO-017 per the rank table in [12](12-search-geo-distribution.md)) | exists | Find, Do | 12 (see hub) | judgment | 2026-11-15 |
| 9 | Relaxing art activities for adults | guide `/activities/drawing-and-painting-to-relax/` | **hold on wording** (SEO-039, S2) | Find | Guide only. The second guide `/activities/therapeutic-art-activities-for-adults/` is titled "Relaxing…" but its path still says "therapeutic". Path rename is a CNT-909 decision; no new page until CALM review. | judgment | 2026-11-15 |
| 10 | Music activities for seniors | guide `/activities/music/` | **hold** for a hub (SEO-037, S2) | Find, Do | Interim: guide only; cards make-a-playlist-together and make-a-personal-songbook | judgment | 2026-11-15 |
| 11 | Storytelling and life-story activities | none yet; SEO-038 | **hold** (S2) | Find, Share | Interim: guide `/activities/reminiscence/` (shared with rank 3, to split when SEO-038 is decided); card start-a-family-recipe-book | judgment | 2026-11-15 |
| 12 | Low-mess sensory activities for children | none | **hold** (S2 or later; SEO-040, gated by GROW and children's privacy work) | Find, Do | None until the children's privacy and COPPA-safe design gate is met | judgment | 2026-11-15 |

## Ranks 13 to 15: no dedicated page

These rank as broad head terms with very high competition ([02 H6](02-information-architecture.md), [12 SEO-041](12-search-geo-distribution.md)). They have no page of their own. They are linked only from a hub, which for now is the finder at `/activity/`.

| Rank | Cluster | Route | Reason no page |
|---|---|---|---|
| 13 | Quiet and rainy-day activities at home | finder `/activity/`; a future occasion hub only with a situation angle | Broad head term; H6 |
| 14 | Easy crafts for adults | finder `/activity/` | Wins only with an adaptation or situation angle (R5); none yet |
| 15 | Crafts for kids at home | finder `/activity/` | Lowest opening; gated behind children's privacy work |

## What this map does not decide

- It does not rank clusters by demand. SEO-002 must supply US-English volumes first.
- It does not create pages. Holds stay holds until the named item is built.
- Hub overlap: `activities-for-seniors` shares 8 of its 14 cards with `bedside-activities` (more than half of the smaller hub). This breaks H1 for the existing pair. It is flagged for the H11 review before S1 exit and is not changed here.
