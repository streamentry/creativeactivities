# Intent owners (SEO-008)

**Status:** working table, 2026-11-21. Built from [cluster-map.md](cluster-map.md) (ranks 1 to 15), the titles and selection rules of the hubs in `site/src/content/hubs/`, and the keyword-to-page map in `docs/strategy/web-seo.md` where it touches a hub. Each row is one search intent with one owner. Where a source leaves the owner open, the owner is `maintainer decision`. Nothing here moves a page or changes a status line; a change to an owner is an edit to this table.

**Test:** `tests/test_intent_owners.py` checks that every hub has exactly one owner row, or is listed under a hub heading below, that every owner path exists, and that held hubs match their `indexable: false` flag.

## Rules

- One owner per intent. A second page for the same intent is a variation and must link to the owner.
- Home owns the brand and the broad games intent. Hubs own task intents. Activity pages (`/activity/<slug>/`) own their own activity name, and game pages (`/games/<slug>/`) own their own game name. Those per-page names are not listed row by row here. Guides own "how do I" questions that have no single activity.
- A held hub (`indexable: false`) does not compete in search, but it still needs a row or a place under the hub headings below, so that a later decision to index it has a stated owner.
- "Must link" lists the pages that point to the owner instead of competing with it. It is the minimum set; add more when a page starts to target the same intent.

## Intent table

| Intent | Owner | Status | Must link to the owner (not compete) | Source |
| --- | --- | --- | --- | --- |
| Creative Activities as a brand, and dementia games or the broad games intent | `/` | live | `/games/` points to `/` for the broad games intent | SEO-008; web-seo keyword map ("dementia games") |
| Free dementia or Alzheimer's games online | `/games/` | live | game pages link to `/games/` for free play | web-seo keyword map |
| Seated activities for seniors | `/seated-activities/` | live (hub) | `/bedside-activities/` links here for sitting use | cluster-map rank 1 |
| Bedside activities for older adults, in bed or a chair | `/bedside-activities/` | live (hub) | `/seated-activities/` links here for bed use | cluster-map rank 1 |
| Outdoor, standing or group activities for older adults | `/activities-for-seniors/` | live (hub) | `/together/outdoor-and-garden-activities/` links here | hub title and selection rules |
| Broad "activities for seniors" head term | maintainer decision | open; the hub above is narrower | the decided owner, once chosen | not ranked in cluster-map |
| Easy art and arts and crafts for seniors | `/arts-and-crafts-for-seniors/` | live (hub) | `/crafts/easy-crafts-for-adults/` and `/activities/art-supplies-for-older-adults/` link here | cluster-map rank 8; hub title |
| Grandparent and grandchild activities | `/grandparent-grandchild-activities/` | live (hub) | none | cluster-map rank 5 |
| Seasonal and festival crafts for any tradition | `/seasonal-activities/` | live (hub) | `/activities/holidays/` links here | hub title and selection rules |
| Christmas and holiday crafts for seniors | maintainer decision | hold (SEO-036, S2) | `/activities/holidays/` (interim guide) | cluster-map rank 6 |
| Easy crafts for arthritis or limited dexterity | maintainer decision | hold (SEO-017, S2); the held hub `/easy-grip-crafts/` is a candidate | `/crafts/crafts-for-limited-dexterity/` | cluster-map rank 2; hub `easy-grip-crafts` |
| Dementia activities at home, including Alzheimer's activities | maintainer decision | hold; candidates are `/` (web-seo keyword map and SEO-008) and the held hub `/dementia-activities/` (cluster-map rank 7, SEO-009); guides `/activities/alzheimers/` and `/activities/ideas/` also match the query | `/caregiving/how-to-play-together/` | cluster-map rank 7; SEO-008; web-seo keyword map |
| Reminiscence activities, non-clinical | maintainer decision | hold (SEO-016); the held hub `/reminiscence-activities/` is a candidate | interim guide `/activities/reminiscence/` | cluster-map rank 3 |
| Storytelling and life-story activities | maintainer decision | hold (SEO-038) | interim guide `/activities/reminiscence/`; guide `/activities/life-story-book/`; card `start-a-family-recipe-book` | cluster-map rank 11 |
| Music activities for seniors | maintainer decision | hold for a hub (SEO-037); the hub `/music-activities/` is live | interim guide `/activities/music/` | cluster-map rank 10 |
| Relaxing art activities for adults | `/activities/drawing-and-painting-to-relax/` | hold on wording (SEO-039) | `/activities/therapeutic-art-activities-for-adults/` has the same intent; its path rename is a CNT-909 decision | cluster-map rank 9 |
| Printable activities for older adults | maintainer decision | two packs exist; index held (SEO-022); the `/printables/` index page also exists | guide `/activities/printable/`; packs listed in `src/data/packs.ts` | cluster-map rank 4 |
| Quiet and rainy-day activities at home | `/activity/` | finder; no page of its own (H6) | `/occasions/rainy-day/` (held occasion hub) | cluster-map rank 13 |
| Easy crafts for adults | `/activity/` | finder; no page of its own (H6) | guide `/crafts/easy-crafts-for-adults/` | cluster-map rank 14 |
| Crafts for kids at home | `/activity/` | finder; gated behind children's privacy work | kids section pages | cluster-map rank 15 |
| Low-mess sensory activities for children | maintainer decision | hold (SEO-040, gated by GROW and children's privacy work) | guide `/activities/sensory/` only as a candidate | cluster-map rank 12 |
| Handmade gift activities to make together | maintainer decision | held occasion hub `/occasions/gift/` (H11); interim finder `/activity/` | none | hub `occasions/gift` |
| Five-minute activities for a short break | maintainer decision | held occasion hub `/occasions/short-break/` (H11); interim finder `/activity/` | none | hub `occasions/short-break` |
| Activities for a visit to someone at home or in care | maintainer decision | held occasion hub `/occasions/visit/` (H11); interim finder `/activity/` | guide `/together/visiting-someone-in-care/` | hub `occasions/visit` |
| How to play together with someone living with dementia | `/caregiving/how-to-play-together/` | live (guide) | the dementia, seated, bedside and music hubs link here | hub guide lists |
| Art supplies for older adults | `/activities/art-supplies-for-older-adults/` | live (guide) | `/arts-and-crafts-for-seniors/` links here | hub guide lists |
| Memory games for seniors | `/activities/memory-games/` | live (guide) | none | web-seo keyword map |

## Hubs that do not own a row

### Held from search

These hubs have `indexable: false` in their frontmatter. Each is held until the reviewer or evidence named in its `indexHold` is in place.

- `/dementia-activities/`
- `/easy-grip-crafts/`
- `/reminiscence-activities/`
- `/occasions/gift/`
- `/occasions/rainy-day/`
- `/occasions/short-break/`
- `/occasions/visit/`

### Awaiting a maintainer decision

These hubs are live (indexable by default) but no source gives them a clear owner. They have no row until the maintainer chooses.

- `/music-activities/`: cluster-map rank 10 says the intent is held for a hub (SEO-037) and names the guide `/activities/music/` as interim. The hub file is live.

## Discrepancies found while building the table

- `/music-activities/` is live, while cluster-map rank 10 says a hub for this intent is held.
- `/printables/` exists as a page, while cluster-map rank 4 says the index is held (SEO-022).
- web-seo keyword map gives "printable dementia activities" to `/activities/printable/`, while cluster-map rank 4 leaves the printable owner open. The row above follows cluster-map.
- cluster-map rank 8 says the arts hub is owned by SEO-017, while the same rank names `/arts-and-crafts-for-seniors/` as the canonical URL. The row above uses the canonical URL.

## Not covered

Intents that appear in neither cluster-map, the hub titles and rules, nor the keyword map are not listed. Add a row before a page starts to target one.
