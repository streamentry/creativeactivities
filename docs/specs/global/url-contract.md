# URL contract (SEO-003)

**Status: proposal pending maintainer decision.** No URL is moved, renamed or redirected by this document. It records one scheme and lists where the other documents disagree, so that the decision can be made once. Open decision 4 in [18 roadmap](18-roadmap.md) stays open until the maintainer accepts or changes this.

**Date:** 2026-11-15. **Scope:** English site on `https://creativeactivities.org`. Translations follow `/<lang>/<same path>/` ([02 §3](02-information-architecture.md), [§8](02-information-architecture.md)).

## Proposed scheme

Keep the shipped patterns. 38 activity cards, 4 intent hubs and 88 guides are already built and indexed or linkable, so renaming them costs more than it gains (SEO-003 recommendation).

| Page type | Pattern | Example | Owner | Status | Indexed |
|---|---|---|---|---|---|
| Home | `/` | `/` | site | exists | yes |
| Finder | `/activity/` | `/activity/` | finder | exists | yes |
| Finder state | `/activity/?time=…` | | finder | exists | no; canonical to `/activity/` |
| Activity card | `/activity/<slug>/` | `/activity/draw-to-music/` | card | exists (38) | yes |
| Printable card | `/activity/<slug>/card/` | | card | to confirm | no; canonical to the card |
| Pack | `/activity/packs/<id>/` | `/activity/packs/five-quiet-bedside-activities/` | packs | exists (2) | yes |
| Intent hub | `/<hub-slug>/` | `/bedside-activities/`, `/seated-activities/`, `/dementia-activities/` | hubs | exists (4), plus 2 new | yes, unless held (H3) |
| Pillar hub | `/<pillar>/` | `/together/`, `/for-older-adults/` | pillar | new | yes |
| Season hub | `/seasons/<season>/` | `/seasons/winter/` | seasons | new (SEO-036) | yes |
| Guide | `/<section>/<slug>/` | `/activities/music/`, `/caregiving/how-to-play-together/` | guides | exists (88) | yes |
| Game | `/games/<slug>/` | `/games/picture-pairs/` | games | exists (12) | yes |
| Partner type | `/for-organizations/<type>/` | `/for-organizations/care-homes/` | partners | new | yes, when content exists |
| Site search | `/search/?q=` | | site | new | no |

### Rules

- **Hub slugs** name a situation people search for, in plain words, with no year, no treatment word (therapy, treatment, therapeutic, healing, cure) and no audience word unless the selection differs ([02 H2](02-information-architecture.md)). A condition may name a non-clinical hub, as `/dementia-activities/` does.
- **Renames** get a 301 to the nearest equivalent, with no chains. No redirect is needed by this document because nothing is renamed.
- **Canonical:** a print view, filter state or variation never competes with its canonical page. A variation is an anchor on the card (`#seated`), not a URL ([02 §7](02-information-architecture.md)).
- **Sitemap** lists only indexable canonical URLs. A `noindex` hub is removed from the sitemap, as `dementia-activities` is now.

## Where the documents disagree

| Document | What it proposes | Conflicts with | What would change in that document |
|---|---|---|---|
| [SEO.md §4.1](../../../SEO.md) | Root hubs `/activities-for-seniors/`, `/dementia-activities/`, `/bedside-activities/`, `/printables/`, `/about/`, `/editorial-policy/`, `/accessibility/` | Matches shipped hubs and pages. Differs on the rest (below). | Keep the matching paths. Replace `/senior-art-activities/` with `/arts-and-crafts-for-seniors/` (shipped). Replace `/seated-activities-for-seniors/` with `/seated-activities/` (H2: audience word dropped). Replace `/activities/memory-collage/` with `/activity/make-a-memory-collage/`. Replace `/activities/familiar-songs-collage/` with an `/activity/<slug>/` path when that card exists. `/safety-and-scope/` becomes `/safety/` (shipped). `/corrections/` becomes `/support/` (shipped report-a-mistake route), unless the maintainer wants a separate corrections page. |
| [web SEO strategy](../../strategy/web-seo.md) | Guides at `/activities/alzheimers/`, `/activities/ideas/`, `/activities/early-stage/`, `/activities/middle-stage/`, `/activities/late-stage/`, `/games/` | `/activities/alzheimers/` is already a shipped guide, but its keyword row targets a hub intent that SEO-008 gives to `/dementia-activities/`. Stage-named guides conflict with the no-stage-sorting rule ([09 CARE rule 2](09-pillar-older-adults-dementia.md)). | Decide one owner for "alzheimers activities" and "activities for dementia": the held hub or the guide. Keep stage guide paths only if their titles are reviewed; no new stage-named paths. The keyword-to-page table must name one owner per row (SEO-008). |
| [02 information architecture §3 and §9](02-information-architecture.md) | Cards `/activity/<slug>/`, guides `/<section>/<slug>/`, intent hubs `/<intent-slug>/`, pillar hubs, season and occasion hubs | Matches this scheme. Open questions 1 and 2 would change paths: `/brain-health/` section name (a cognitive-outcome implication) and `/activities/` (guides) versus `/activity/` (cards). | Decide open question 2 before any guide move. The proposal here keeps guides at `/activities/`; the 301 cost of moving 88 guides is large. Decide open question 1 (`/brain-health/`) before the next guide batch. |
| [VISION.md](../../../VISION.md) "Search architecture" | `/dementia-activities/`, `/activities-for-seniors/` | Matches. | None. |
| [DESIGN.md](../../../DESIGN.md) and [site README](../../../site/README.md) | Activity pages at `/activity/<slug>/`, hubs at `/<id>/` | Matches. | None. |
| [12 search spec](12-search-geo-distribution.md) SEO-009, SEO-010 | Dementia hub "at the slug chosen in SEO-003"; seated hub has no slug | Waits on this decision. | Record `/dementia-activities/` and `/seated-activities/` once accepted. Both are built now, per this proposal. |
| [web SEO strategy](../../strategy/web-seo.md) and SEO-005 | Old domain `dementiaactivities.games` and the GitHub Pages host | Old paths are not inventoried in this repo. | Map every ever-indexed old URL before cutover (SEO-005). Not decided here. |

## Decisions the maintainer must make

1. Accept the shipped patterns as the contract, or choose root-hub `/activities-...` style instead (the SEO.md option). This proposal recommends the shipped patterns.
2. Guides: keep `/activities/`, or move guides to `/guides/<section>/` with 301s (IA open question 2).
3. `/brain-health/`: keep and rewrite, or rename with a redirect (IA open question 1).
4. Dementia owner: the held hub at `/dementia-activities/`, or the guide `/activities/alzheimers/` (see the web SEO row).
5. Corrections: `/support/` or a new `/corrections/`.
