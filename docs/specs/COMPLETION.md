# Spec completion tracker

Started 2026-11-15 for the goal "read MISSION, VISION and docs/specs and complete all specs, tracking progress". Branch `specs/complete-all-specs`. This file is the single place that says how much of each spec is done and what stops the rest. It does not replace `release-status.json` (release evidence), `WORKBOARD.md` (handoffs) or `global/s1-status.md` (S1 detail); it points to them. Implemented, tested, merged, device-verified and published remain separate states.

## Why "complete all specs" cannot be closed by building alone

- The specs are three layers: [product](product.md) (8 stories), [senior-first](senior-first/README.md) (40 `GM-` features) and [global](global/README.md) (533 indexed items).
- [Roadmap](global/18-roadmap.md) §1 says S2 "is the menu the S2 gate filters, not a commitment to build all of it", and that a phase opens only when its evidence gate passes. S2 to S4 (407 + 75 + 11 items) are gated on S1 evidence that software cannot produce.
- AGENTS.md forbids deferred work without approval: family sync, recordings, payments, deck exchange, accounts, new telemetry, community features.

## Tally, 2026-11-15

### Global index (`global/id-index.tsv`, 533 items)

| Phase | exists | partial | new | unclassified | total |
| --- | --- | --- | --- | --- | --- |
| S1 | 12 | 28 | 0 | 0 | 40 |
| S2 | 42 | 101 | 228 | 36 | 407 |
| S3 | 1 | 5 | 51 | 18 | 75 |
| S4 | 0 | 0 | 11 | 0 | 11 |

### Senior-first (`release-status.json` › `senior_first_features`, 40 items)

14 implemented_unverified, 19 partial, 4 not_started, 3 deferred. None verified.

## What blocks each group

| Group | Items | Blocker | Who |
| --- | --- | --- | --- |
| S1 `partial` (28) | see [s1-status.md](global/s1-status.md) | Code and content are built; each waits on usability sessions, a search baseline, named reviewers, rights review, counsel on GA4/GTM, or a maintainer decision | Maintainer, recruits, reviewers |
| S1 gate | S2 opens only when it passes | 8–15 usability sessions and a Search Console/Keyword Planner baseline | Maintainer |
| `GM-017`, `GM-039`, `GM-040` | not started or procedure only | Physical VoiceOver/TalkBack/switch matrix; human comparative pilot | Devices and participants |
| `GM-010`, `GM-011` | not started | R2: built only if the pilot chooses them; capability and privacy review | Pilot result |
| `GM-021`, `GM-022`, `GM-035` | deferred | R3, explicitly not authorized | Maintainer approval |
| `GM-005`, `GM-012`–`GM-016`, `GM-018`, `GM-023`, `GM-027`–`GM-033`, `GM-036`, `GM-037` | partial | Automated evidence exists; device, screen-reader, upgrade or native-reviewer evidence does not | Devices, reviewers |
| S2 `new` (228), S3 (75), S4 (11) | gated | Gate not open (roadmap §3); several need accounts, community, payments or telemetry that need explicit approval | Gate plus maintainer |
| 36 S2 and 18 S3 items with status `?` | unclassified | Status was never set by the writers; classify before any can be planned | Next session can do this |

## Work this session

- Read MISSION, VISION, product, senior-first status, global README, S1 status and roadmap.
- Counted the real state (tables above) so the next reader does not have to.
- Nothing is built or marked passed by this file.

## Next executable actions (no person needed)

1. Give the 54 `?` items a status. Finding (2026-11-15): they are not features. 52 are CNT content areas and rules in the pillar files 08, 09 and 10 (GROW, CARE, CALM), plus CNT-711, APP-032 (read-aloud, needs approval for GM-011) and L10N-029 (a participant test). The pillar files carry priority and phase but no status column, so the index parser reads `?`. Their real status is card coverage per area (for example CNT-1011 coloring: 0 of 2 cards in the pillar table), so set it from a count of existing cards by tag, not by guesswork.
2. Re-run the full validation contract from AGENTS.md on `main` and record the tested commit and results here.
3. Pull forward S2 items the roadmap marks as already hardening live pages (see [s2-hardening-status.md](global/s2-hardening-status.md)).

## Needs the maintainer

Run the usability protocol, name credentialed reviewers, complete the Search Console baseline, decide GA4/GTM wording, approve any deferred item. Until then the S1 gate stays open and the goal as worded cannot honestly be called complete.
