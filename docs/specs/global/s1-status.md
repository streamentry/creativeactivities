# S1 status: what is built, and what only people can finish

Updated 2026-11-15 (round 2) on branch `s1/integration`. Read with the [roadmap](18-roadmap.md) §2 (the 40 S1 items) and [id-index.tsv](id-index.tsv).

**Summary.** All 40 S1 items now have code, content or a ready-to-run protocol: 12 `exists`, 28 `partial`, 0 `new`. Every `partial` item is waiting on a person, an account or a maintainer decision, not on more building. S2 cannot start until the S1 gate passes ([roadmap](18-roadmap.md) §3), and that gate needs real usability sessions and a search baseline, which software cannot produce.

## Built in this round (verified together on the integration branch)

| Area | Items | Evidence |
|---|---|---|
| Claims and trust | TSA-028, WEB-060, WEB-061, TSA-035 | `site/src/lib/claims.test.ts` fails on banned claim wording in English content; `/art-therapy-and-creative-activities/`, `CrisisRoute.astro` (988, Samaritans 116 123, checked 2026-11-15), `/corrections/` |
| Activity data | WEB-022, TSA-034, TSA-045, WEB-012 | `safetyFlags` on all 38 cards with tests against each card's text; structured `review` record; `withdrawn` hides a card everywhere (fixture tests); step/result image schema with alt and provenance |
| Feedback and events | WEB-025, WEB-026, PLAT-024, TSA-012 | `ActivityFeedback.astro`; `track()` allowlist (`EVENT_DICTIONARY`) and [events.md](events.md), kept in step by a test; events now reach the GTM container the maintainer chose on 2026-11-13 (previously silently dropped) |
| Hubs | SEO-009, SEO-010, SEO-001, SEO-003 | `/seated-activities/` (indexed, 8 cards), `/dementia-activities/` (10 cards, `noindex` until a credentialed reviewer is named), [cluster-map.md](cluster-map.md), [url-contract.md](url-contract.md) |
| Quality gates | TSA-001, WEB-036, WEB-074, WEB-014, WEB-011 | `pnpm check:a11y` (axe WCAG 2.2 AA + keyboard, 13 templates, 390/1440 px, 0 failures), `pnpm check:budget` (0 of 15,732 pages over), `pnpm check:print` (38 of 38 cards print as one two-sided sheet on A4 and Letter at 11.5 pt) |
| Protocols | MET-029, TSA-002, SEO-002, SEO-004, TSA-018, TSA-038 | [usability protocol](../../research/s1-usability-protocol.md), [AT checklist](../../research/at-testing-checklist.md), [search runbook](../../research/search-baseline-runbook.md), [query list](../../research/s1-query-list.csv), image provenance test over 199 site images |
| Phone layout | WEB-011 (DESIGN §1) | Facts strip now inside the first screen at 375–390 px (was ~950 px down); Start button at ~900 px (was ~1,380 px) |

Integration checks: vitest 2,345 tests pass; `tsc` clean; `astro build` 15,732 pages; `check-site` 0 errors (598 translated-title warnings, unchanged); budget, print and a11y checks pass.

## What only people can finish

| Who | What | Unblocks |
|---|---|---|
| Maintainer + recruits | Run 8–15 usability sessions with the protocol, including screen-reader, magnification and switch users | MET-029, TSA-002, the S1 gate |
| Maintainer | Google Keyword Planner US-English export and Search Console + Bing verification, per the runbook | SEO-002, SEO-004, the S1 gate, SEO-009's H3 threshold |
| Maintainer | Name credentialed reviewers (art therapist, OT, dementia specialist) with written permission | TSA-034 records, WEB-060 review, SEO-009 indexing |
| Maintainer | Rights review of the 76 drawings, optional per-step images or real process photos, redraws of the three weakest (hand massage, towel stack, torn-paper flower), and one table style for the materials drawings | WEB-012 |
| Maintainer + counsel | GTM/GA4 cookies vs DESIGN's no-tracker rule and TSA-018's no-identifier line; GTM auto-events that carry full URLs | TSA-018, TSA-012, PLAT-024 |
| Maintainer | Correction response targets; withdraw-drill; safety-label legal wording | TSA-035, TSA-045, WEB-022 |
| Maintainer | URL contract decision; per-locale crisis list owner; 12 pt print target | SEO-003, WEB-061, WEB-014 |
| Native reviewers | Claims check for translated locales (the claims test covers English only) | TSA-028 |

## Round 2 (2026-11-15)

| Item | Change | Evidence |
|---|---|---|
| WEB-012 | Two original drawings on every one of the 38 cards (was 1 in total): the result, and "What you need" (`kind: materials`) | `activity-results-*.ts`, `activity-materials-*.ts`, provenance register 274 entries; app library 120 pictures (results only; materials scenes stay out of games and the app) |
| WEB-014, WEB-016 | Print at 12 pt, one sheet two sides for all 38, version and address line on the back; the drawing floats beside the steps | `pnpm check:print` 38/38 |
| TSA-012, PLAT-024 | `activity_view`, `activity_save`, `activity_share`, `app_cta_click` added to the allowlist and wired | `track.test.ts`, [events.md](events.md) |
| Hub rule H1 | `activities-for-seniors` re-curated (outdoor, standing, group); no two hubs share more than the H1 limit | `hubs.test.ts` pairwise check |
| Docs | Content guide documents `review` and `safetyFlags`; privacy page names Google Tag Manager | `site/CONTENT_GUIDE.md`, `site/src/pages/privacy.astro` |

## Known issues found while building (not S1 items)

- Fixed (partly): 30 of 38 cards now have a `large-grip` variation, "Easier to grip" (2026-11-15). The text is unreviewed and needs a reviewer. Left as they are: six cards already at the six-variation cap (`arrange-flowers-together`, `decorate-a-keepsake-box`, `draw-to-music`, `make-a-texture-board`, `press-leaves-and-flowers`, `tear-paper-mosaic`), and two cards where gripping plays no part (`give-a-hand-massage`, `fold-towels-together`).
- On phones the six-link header is ~265 px tall; the Start button sits just below the first screen. Changing that means changing the always-visible navigation, a design decision.
