# Spec completion tracker

Started 2026-11-15 for the maintainer goal "work until all docs/specs are completed". Branch `specs/complete-all-specs`. This file says how much of each spec is done and what stops the rest. It does not replace `release-status.json` (release evidence), `WORKBOARD.md` (handoffs), `global/s1-status.md` or `global/s2-hardening-status.md`; it points to them. Implemented, tested, merged, device-verified and published remain separate states.

## Ground rules for "complete"

- The specs are three layers: [product](product.md) (8 stories), [senior-first](senior-first/README.md) (40 `GM-` features) and [global](global/README.md) (533 indexed items).
- An item is **exists** when it is built and needs nobody else; **partial** when it is built or started but waits on a person, a device, a reviewer or a maintainer decision; **new** when nothing exists yet.
- Items that need accounts, payments, community features, new telemetry, cloud sync or recordings stay unbuilt until the maintainer approves them in writing (AGENTS.md). Building them without approval would break the specs, not complete them.
- Nothing here claims usability, credentialed review, device or screen-reader evidence that has not happened.

## Tally

### Global index (`global/id-index.tsv`, 533 items)

| Phase | exists | partial | new | total |
| --- | --- | --- | --- | --- |
| S1 | 12 | 28 | 0 | 40 |
| S2 | 62 | 122 | 223 | 407 |
| S3 | 1 | 12 | 62 | 75 |
| S4 | 0 | 0 | 11 | 11 |
| **All** | **75** | **162** | **296** | **533** |

At the start of 2026-11-15: 55 exists, 134 partial, 290 new, 54 unclassified (`?`).

### Senior-first (`release-status.json` › `senior_first_features`, 40 items)

14 implemented_unverified, 19 partial, 4 not_started, 3 deferred. None verified (needs devices and people).

## Progress log

### Batch 1 (2026-11-15, commit `6ca93a0`)

| Change | Items | Evidence |
| --- | --- | --- |
| Classified the 54 `?` items. They are content areas and rules in the pillar files 07–10 (no status column there), plus APP-032 and L10N-029. Status from site coverage: 41 partial (cards or guides exist), 13 new (pretend play, kids' music and movement, early literacy, science-ish making, travel and waiting room, choose-your-level, school programme, child-facing gate, faith and culture, creative routines, beads, read-aloud, participant-language test) | 54 items | `global/id-index.tsv` |
| Synced the index with `s2-hardening-status.md`: 27 items built in the hardening rounds were still `new` or `partial` | 27 items | same file; IDs in the commit diff |
| 8 new activity cards, the first CARE batch the pillar spec schedules (09 §9, "8 in the first batch"): `wrap-a-small-gift`, `sort-a-box-of-postcards` (CNT-901), `print-with-sponge-shapes`, `make-a-tissue-paper-window-picture` (CNT-902), `draw-a-comic-strip-together` (CNT-905), `draw-with-oil-pastels-on-dark-paper` (CNT-908), `hold-a-sing-along-at-home` (CNT-910), `draw-a-map-of-a-favorite-place` (CNT-911, crisis route on) | CNT-901, 902, 905, 908, 910, 911 stay partial: S3 targets are higher and no card is reviewed | Drafted by subagents, reviewed and edited; pass the safety-flag, food, supervision, claims, variation and retired-link tests |
| `/easy-grip-crafts/` hub: ten cards, each shown with its easier-to-grip version; the FAQ says plainly it is not treatment. `noindex` and out of the sitemap until an occupational or hand therapist reviews the versions (SEO-017 acceptance) | SEO-017 → partial | `site/src/content/hubs/easy-grip-crafts.md`; hub H1/H3 tests |

Checks (site, Node 24.11.1): vitest 66 files, 2,749 pass; `astro build` 16,454 pages; `check-site` 0 errors (597 warnings, none on new pages); `check-budget` 0 over; `check-print` 46 of 46 cards print as one two-sided sheet on A4 and Letter. Repo: 113 Python tests and `release_metadata.py --check` pass. **Not run here:** cspell (CI only), `check:a11y`, Flutter checks (no Flutter SDK 3.47.7 on this machine).

Not done for batch 1: drawings for the eight new cards (WEB-012; the 38 older cards have two each), a hands-on test of the new steps, translations (English-first), reviewer sign-off.

## What blocks the rest

| Group | Blocker | Who |
| --- | --- | --- |
| S1 `partial` (28) and the S1 gate | 8–15 usability sessions, Search Console and Keyword Planner baseline, named credentialed reviewers, rights review, GA4/GTM console settings ([s1-status.md](global/s1-status.md)) | Maintainer, recruits, reviewers |
| Senior-first `GM-017`, `GM-039`, `GM-040` and every `partial` | Physical VoiceOver/TalkBack/switch matrix, upgrade from store builds, human comparative pilot | Devices and participants |
| `GM-010`, `GM-011` (APP-032) | R2: only if the pilot chooses them; read-aloud needs its approval | Pilot, maintainer |
| `GM-021`, `GM-022`, `GM-035` | R3, explicitly not authorized | Maintainer |
| Accounts, payments, community, sync, email digest and telemetry items in S2–S4 (COM-, paid BIZ-, WEB-071, SEO-026, PLAT-027 and others) | Written approval and a privacy decision | Maintainer |
| GROW child-facing items (CNT-8xx, S3) | Child-facing gate CNT-890 and TSA-018 to TSA-021 decisions | Maintainer, counsel |
| S4 languages | Native reviewers per language | Reviewers |

## Next batches (buildable without a person)

1. CALM first four new cards (CNT-1010, 1012, 1015, 1018), seated movement (CNT-927) and a faith-and-culture card written as a choice of traditions (CNT-926).
2. Music hub (SEO-037) and reminiscence hub (SEO-016), held from search until reviewed where the spec asks for review.
3. Drawings for the new cards (WEB-012), following the picture kit in `site/src/data/picture-art/`.
4. Web features that need no data or approval: large-print editions (WEB-018), share a card (WEB-050), care-home weekly sheet (WEB-045), due-for-review queue (WEB-076, PLAT-012), a seasonal hub written as a choice of festivals (SEO-036).
