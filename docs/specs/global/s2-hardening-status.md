# S2 hardening: built early, without opening S2

Updated 2026-11-15 on branch `s2h/integration`. Read with the [roadmap](18-roadmap.md) and [s1-status.md](s1-status.md).

**What this is.** The S2 gate (8+ usability sessions, about three months of Search Console data) cannot be passed faster by spending more ([roadmap](18-roadmap.md) §3). These items are labelled S2 but only **harden what is already live**: trust, safety, accessibility, privacy, security, print and the finder. None adds a content programme, audience, hub, game or language, and none decides a question that belongs to the maintainer. Their Phase labels are unchanged. Five Haiku subagents built them in separate worktrees; the lead integrated and verified them together.

## Built

| Batch | Items | Evidence |
|---|---|---|
| Print and card scope | WEB-015, WEB-016, WEB-027, WEB-023, TSA-026, TSA-025 | Card changelog seeded only from git (`changes:` on all 38 cards); scope line and stop line on cards and print (`site/src/lib/scope.ts`); footer scope note checked on every page |
| Accessibility | WEB-037, TSA-003, TSA-004, TSA-005, TSA-006, TSA-007, WEB-054, WEB-075, TSA-009 | `pnpm check:a11y` now covers 320, 390, 640 (200% zoom), 1440 and 200% text on every template, plus "Rest for now" on all 12 games; runs in CI (`.github/workflows/site.yaml`) |
| Privacy and security | TSA-011, TSA-041, TSA-042, TSA-043, WEB-029, TSA-016, TSA-046, TSA-048 | [data-inventory.md](data-inventory.md) with a test that fails on any unlisted key, cookie, event or origin; script-src without `'unsafe-inline'` (hash list checked against every page); `/your-data/` lets a visitor see and delete what this browser keeps; retention and breach drafts in `docs/legal/` |
| Claims and safety | TSA-029, TSA-030, TSA-032, TSA-023, TSA-024, TSA-027, TSA-031, TSA-037, WEB-058, TSA-047 | Claims lint now also covers game UI, the app's English strings and store copy (no store text changed); food-as-material and supervision rules as card tests; crisis route on cards that invite disclosure; report-a-problem and safety routes |
| Finder and cards | WEB-005, WEB-004, WEB-013, WEB-008, WEB-038 | Finder state in the URL (never search text); lower-effort option; variation chips; related cards by function; nine templates checked with JavaScript off |

## Fixed while integrating

- **CSP check bug.** `check-site.mjs` compared style hashes with the script allowlist, which had led to style hashes being copied into `script-src`. It now compares script-src only; `_headers` lists exactly the 11 site-wide script hashes. Verified by serving the build with the real `_headers` and loading 11 key pages: 0 CSP violations.
- **CSS budget (WEB-074).** Combining the batches put 11,460 guide pages over the 15 kB microsite CSS budget. Fixed by scoping, not by moving the line: card-list styles split into `activity-cards.css` (guides and game pages load only that); the print layout moved to `public/styles/activity-print.css`, loaded with `media="print"` at the end of the activity and pack pages so it no longer blocks the screen render (the budget counts render-blocking CSS only); component-only rules moved into their components. Result: 0 of 15,733 pages over.
- **Print.** The crisis note and changelog pushed six cards to a third page; on paper the crisis note is compact (same words and numbers) and the changelog list is web-only (the version line stays, WEB-016). 38/38 cards print as one sheet, two sides, at 12 pt.
- **Inventory.** Four outbound links added by the claims batch (AATA, ATCB, BAAT, HCPC registers) listed in the data inventory.
- **CI memory.** `check-site` and `check-budget` read every built page and need a larger Node heap; set for the CI build job and the npm scripts. The budget check now runs in CI too.
- **App copy not shipped.** A reworded app line (`habitsMoveBody`) was reverted: it changed English only, without translations or regenerated localizations, and the original passes the claims check. Suggestion for the maintainer: "linked with lower dementia risk across large groups of people" instead of "and helps health in other ways".

Integration checks: vitest 2,533 tests pass; `tsc` clean; `astro build` 15,733 pages; `check-site` 0 errors; `check-budget` 0 over; `check-print` 38/38; `check:a11y` 0 failing of 94 page checks; cspell clean.

## Still needs people or decisions

- GTM/GA4: decided 2026-11-15, it now loads only after a visitor allows it ([analytics-consent.md](analytics-consent.md)). Still open: GA4 and Tag Manager console settings (maintainer) and whether health and child-reachable pages should skip it even after a yes (TSA-018).
- Counsel review of the retention and breach drafts (TSA-016, TSA-046); owners and a tabletop exercise.
- Reviewer sign-off on edible materials, evidence ratings and scope wording (TSA-024, TSA-031, TSA-026); per-locale crisis lists (TSA-027).
- A monitored safety address and response standard (TSA-047, WEB-058); accessibility feedback owner (TSA-007).
- Manual screen-reader passes, a flash analysis for games and real printer tests (TSA-003–006, WEB-015).
- `pnpm audit --prod` reports two advisories in astro 7.4.0; upgrade not attempted (TSA-043).
