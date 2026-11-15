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
| S2 | 63 | 128 | 216 | 407 |
| S3 | 1 | 12 | 62 | 75 |
| S4 | 0 | 0 | 11 | 11 |
| **All** | **76** | **168** | **289** | **533** |

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

### Batch 2 (2026-11-15, commit `89237e8`)

| Change | Items | Evidence |
| --- | --- | --- |
| Seven cards: `draw-a-slow-line-pattern` (CNT-1010), `make-a-torn-paper-landscape` (CNT-1012), `match-colors-to-a-tune` (CNT-1014), `make-leaf-rubbings` (CNT-1015), `make-a-friendship-bracelet` (CNT-1018, "a quiet hour of making", no stress-relief claim), `move-to-music-in-a-chair` (CNT-927, says plainly it is not exercise), `make-a-festival-decoration` (CNT-926, the family chooses the tradition, no candles) | CALM S1 targets met (one new card each for 1010, 1012, 1015, 1018); all stay partial until a CALM reviewer signs off | Same test set as batch 1 |
| `/music-activities/` hub: eight cards, each doing something with the music; FAQ separates it from music therapy | SEO-037 → exists | Indexable; passes H1 overlap and H3 |

### Batch 3 (2026-11-15, commit `f0af9db`)

| Change | Items | Evidence |
| --- | --- | --- |
| `/reminiscence-activities/` hub: ten cards, no quiz wording, crisis route on the seven cards that invite talk; `noindex` until a dementia specialist reviews it (CNT-903) | SEO-016 → partial | `hubs.test.ts`; claims lint caught "Not therapy." in the description, changed to "Not treatment." |
| Share a card already existed; it now passes the card summary as share text, as the spec asks | WEB-050 → partial (iOS and Android share sheets untested) | Built page carries `data-share-text` |
| `pnpm review:queue`: internal list of cards, hubs and guides past a 12-month review (TSA-036 proposal), safety-flagged cards first, never built into the site | WEB-076, TSA-036 → partial (interval not yet set by the maintainer; public overdue notice not built; no owner) | `src/lib/review-queue.test.ts` (8 tests); today 0 of 177 pages overdue |

Checks after batch 3: vitest 67 files, 2,843 pass; `tsc` clean; `astro build` 16,463 pages; `check-site` 0 errors; `check-budget` 0 over; `check-print` 53 of 53. Browser check of the built site (served locally): music hub indexable, reminiscence hub `noindex, follow`, no horizontal overflow at 375 px on a new card. CI on PR #59 after batch 1: 7 checks passed, 1 pending.

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

1. Public overdue-review notice on cards (finishes WEB-076's second acceptance line).
2. Drawings for the new cards (WEB-012), following the picture kit in `site/src/data/picture-art/`.
3. Web features that need no data or approval: large-print editions (WEB-018), care-home weekly sheet (WEB-045), a seasonal hub written as a choice of festivals (SEO-036), one idea right now (WEB-007).
