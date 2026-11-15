# S1 status: what is built, and what only people can finish

Updated 2026-11-15 on branch `s1/integration`. Read with the [roadmap](18-roadmap.md) §2 (the 40 S1 items) and [id-index.tsv](id-index.tsv).

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
| Maintainer | Process photos or illustrations with rights records for the 38 cards (one done) | WEB-012 |
| Maintainer + counsel | GTM/GA4 cookies vs DESIGN's no-tracker rule and TSA-018's no-identifier line; GTM auto-events that carry full URLs | TSA-018, TSA-012, PLAT-024 |
| Maintainer | Correction response targets; withdraw-drill; safety-label legal wording | TSA-035, TSA-045, WEB-022 |
| Maintainer | URL contract decision; per-locale crisis list owner; 12 pt print target | SEO-003, WEB-061, WEB-014 |
| Native reviewers | Claims check for translated locales (the claims test covers English only) | TSA-028 |

## Known issues found while building (not S1 items)

- The `activities-for-seniors` and `bedside-activities` hubs share 8 of 14 cards, against hub rule H1.
- No card has a large-grip variation, so the arthritis cluster has no card support yet.
- On phones the six-link header is ~265 px tall; the Start button sits just below the first screen. Changing that means changing the always-visible navigation, a design decision.
- `privacy.astro` names GA4 while the loader is now GTM.
- `CONTENT_GUIDE.md` still describes the old `reviewer` field.
