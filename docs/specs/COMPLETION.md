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
| S2 | 64 | 141 | 202 | 407 |
| S3 | 1 | 12 | 62 | 75 |
| S4 | 0 | 0 | 11 | 11 |
| **All** | **77** | **181** | **275** | **533** |

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

### Batch 4 (2026-11-15)

| Change | Items | Evidence |
| --- | --- | --- |
| Reader notice: a card past its 12-month review says "Due for a check since …" and asks readers to read the safety notes with care; the date is never refreshed without a review | WEB-076 (both acceptance lines now built; still needs an owner), TSA-036 | `overdueSince` test; a build with one card backdated showed the notice on that card only (reverted) |
| Large-print card at `/activity/<slug>/large-print/` for every listed card: same words, steps 24 px on screen and 18 pt on paper, token ink on paper, grayscale pictures, 2-inch QR code; linked from each card and pack page; `noindex`, not in the sitemap | WEB-018 → partial (needs the three large-print readers the spec asks for) | Browser: steps 24 px, `noindex, follow`, no overflow; `check-site` caught a missing `<h1>`, fixed |

Checks after batch 4: vitest 2,844 pass; `tsc` clean; `astro build` 16,516 pages; `check-site` 0 errors; `check-budget` 0 over; `check-print` 53 of 53. Not run: `check:a11y` on the new large-print template.

### Batch 5 (2026-11-15)

| Change | Items | Evidence |
| --- | --- | --- |
| `/activity/weekly-program/`: a one-page weekly program for care homes, day centres and clubs. Staff pick a group card for each weekday (default: five different activity types); each day shows the group version and a one-to-one version; the materials line scales with the group size entered (one set per pair plus a spare). Header says it is an activity program, not a care plan. Fields are week, room and group size only; nothing typed is sent or saved. Linked from the finder | WEB-045 → partial (staff feedback route and the pack builder WEB-017 / group mode WEB-046 it depends on are not built) | `weekly-program.test.ts` (7 tests, including a field check for name, diagnosis and care-need fields); browser: swapping Monday's card and entering 9 people update the sheet; Playwright PDF: 1 page on A4 and on Letter |
| CSP header: the new page's inline module script changed Astro's site-wide hash list; `_headers` updated (one stale hash replaced), found by `check-site` | TSA-041 upkeep | `check-site` 0 errors; `security-headers.test.ts` passes |

Checks after batch 5: vitest 68 files, 2,851 pass; `tsc` clean; `astro build` 16,517 pages; `check-site` 0 errors; `check-budget` 0 over; `check:a11y` 0 failing of 104 page checks (16 templates, now including large print and the weekly program).

CI fix: the Website workflow failed on `b725286` because the finder's Tab walk passed the a11y script's 120-stop safety cap (more cards and hubs, no trap). The cap is now 240, with a comment. Adding the two new templates to the a11y check then caught real defects on the weekly page (a date field read as a focus trap, select overflow at 320 px), both fixed.

### Batch 6 (2026-11-15)

| Change | Items | Evidence |
| --- | --- | --- |
| "One idea right now" on the finder: one card at a time from the cards that fit the current choices, "Another idea" up to five, then a plain end line; resets when choices change; hidden without JavaScript | WEB-007 → partial (no user test yet) | `one-idea.test.ts` (4 tests) |
| `/seasonal-activities/` hub: ten cards across the year, written for any tradition, no candles; FAQ covers people who do not celebrate and dates that are hard | SEO-036 → partial (the per-season `/seasons/<season>/` layer and cultural review are not done) | `hubs.test.ts` H1/H3, claims lint |
| Notification policy enforced by a test: no notification permission or push API anywhere in site code, no "you missed" or streak wording in English content | WEB-070 → exists | `notification-policy.test.ts` (4 tests, with pattern self-checks) |
| `/glossary/`: 38 craft and setup words from the cards, one plain sentence each, with a translator note in the data; linked from the finder | CNT-012 → partial (spec asks for about 60 terms, chosen by usage) | `glossary.test.ts`: every term appears in a card, one sentence, alphabetical, no clinical words |
| Materials drawings for the 15 new cards, drawn in the house kit by a subagent (`activity-materials-c.ts`), with alt text, captions and provenance entries; site-only, not exported to the app | WEB-012 stays partial (result drawings for the 15 cards not drawn; three of the new pictures read weakly at 120 px) | Provenance test; all 15 rendered and looked at |
| `check-print` counted the weekly program as a card; it now checks only real cards | WEB-014 upkeep | 53 of 53 cards print as one two-sided sheet |

Checks after batch 6: vitest 71 files, 2,928 pass; `astro build` 16,519 pages; `check-site` 0 errors; `check-budget` 0 over; `check-print` 53 of 53. Not re-run: `check:a11y` (the system disk filled during this batch; 2.3 GB free afterwards).

### Batch 7 (2026-11-15)

| Change | Items | Evidence |
| --- | --- | --- |
| Game "Four together" at `/games/four-together/` (built by a subagent, reviewed): pick 4, 6 or 8 pictures from the shared library; three or four share a theme from seven hand-picked groups any reader would accept; a mismatch gently stays unselected ("goes with something else"); a hint names the theme after 20 seconds without progress; "Show the group" with no penalty; Rest from the shared frame. No score, timer or mistake count. English only (`FOUR_TOGETHER_REVIEWED`), because the spec requires per-language category review before launch | GAME-022 → partial (trademark check on the name, native category review, and the spec's "two or three of four" variant: this build uses 3 of 4 or 4 of 6/8) | vitest 2,935 pass; `tsc` clean; build 16,520 pages; `check-site` 0 errors; `check-budget` 0 over; `check:a11y` 0 failing of 106 (13 games) |

| Game "Odd one out" at `/games/odd-one-out/` (subagent, reviewed): sets of 3 or 4 from the Four together groups, the odd one always from another group; tapping a picture that belongs says it goes with the others; hint after 20 seconds; "Show me" with no penalty; English only (`ODD_ONE_OUT_REVIEWED`) | GAME-018 → partial (print twin, native category review) | vitest 2,941 pass; `tsc` clean; build 16,521 pages; `check-site` 0 errors; `check-budget` 0 over; `check:a11y` 0 failing of 108 (14 games) |

Fixed after review: Rest now pauses the hint wait in both games (`GameFrame` `onRestingChange`); a browser check rested 21 seconds and no hint showed on return. Still open: a found odd picture is read as "Matched", the shared tile's word.

### Batch 8 (2026-11-16)

| Change | Items | Evidence |
| --- | --- | --- |
| Printable partner audit of all 14 games (subagent, reviewed): 11 have a one-page paper version (7 new sheets: Picture pairs, Find the same, Shadow match, Four together, Odd one out, Sort together, Picture puzzle; 4 existing: Word search, Coloring, Conversation cards, Picture bingo, now with rules and version line). 3 have a written reason: Finish the saying (all endings would show at once), Photo pairs (own photos never leave the device), Calm breathing (the on-screen pace is the activity). Game pages gain a "Play on paper" section; rules text reads from the same key as the game. English only; other languages fall back | WEB-052 → partial (native review of translated sheets; print on real printers) | vitest 2,947 pass; `tsc` clean; build 16,521 pages; `check-site` 0 errors; `check-budget` 0 over; `check:a11y` 0 failing of 108; Playwright A4/Letter: new sheets 1 page each |
| Daily shared card as "Today's card" in Picture pairs (English only): four pairs from a date seed, same for everyone; day picker with 30 days; result line with a copy button that sends nothing; no account, storage or reminder | GAME-061 → partial (app result card, print calendar, content calendar, other languages) | vitest 2,953 pass; `tsc` clean; build 16,521 pages; `check-site` 0 errors; `check-budget` 0 over; `check:a11y` 0 failing of 108; browser: card shows 4 pairs, 30 days, finishing shows the result line |
| Redrew the three weak materials drawings (color-tune, chair-music, torn-landscape): squares and strips now rest on the table, scarf drapes over the seat; names and card alt text updated to match | CNT-926, WEB-012 stay partial (reviewer sign-off on art) | vitest 2,953 pass; `tsc` clean; build 16,521 pages; `check-site` 0 errors; `check-budget` 0 over; viewed each drawing at 360 px |
| Glossary grown from 38 to 59 terms (garland, craft glue, crease, twine, saucer, tracing paper and others), each from a word that appears in a card, with a one-sentence meaning and translator note | CNT-012 stays partial (translations and reviewer sign-off) | vitest 2,974 pass; `tsc` clean; build 16,521 pages; `check-site` 0 errors; `check-budget` 0 over; `check:a11y` 0 failing of 108 |
| Finished-result drawings for the 15 new cards (gift, postcards, sponge prints, tissue window, comic strip, oil pastels, song sheet, map, line pattern, torn landscape, color row, leaf rubbings, bracelet, scarf swirl, paper star); each card now shows the result first, then the materials. Served on the website only, outside the game, print and app libraries, so names in the app languages are not needed yet; provenance logged as unreviewed | WEB-012 stays partial (reviewer sign-off; app adoption would need names in all app languages) | vitest 2,974 pass; `tsc` clean; build 16,521 pages; `check-site` 0 errors; `check-budget` 0 over; all 15 viewed at 150 px |
| Guard tests for the image rights log and child pages: every card picture has a log entry, no card shows a person or child, and no page can be marked child-directed without a privacy review record, a form or a script | WEB-072, WEB-073 → partial (privacy review record, named art reviewer, legal advice) | vitest `child-image-rules.test.ts` 7 pass |
| Library inventory from the content files: `library-inventory.csv` (178 English pages: 53 cards, 10 hubs, 115 guides, against a baseline of 38, 4 and 88), a regeneration script, a drift test and six overlap candidates. Reviewer, tested date and AI-assisted read `none` or `not recorded`; nothing is inferred | CNT-040 → partial (source data for those columns; editor decision on overlaps) | vitest 2,986 pass; `tsc` clean |
| No-pressure guard for all 14 games: no score, timer, streak, move-count or failure wording in English strings, no repeating clock, hints only after 20 seconds idle (two games have hints) | WEB-053 → partial (keep the place when the count changes, test with five adults) | vitest `no-pressure.test.ts` 6 pass |
| "Hints" choice (hint after a pause, or no hints) added to Four together and Odd one out; turning hints off stops the wait and hides a showing hint | WEB-053 (switch-off requirement met) | vitest 2,993 pass; `tsc` clean; build 16,521 pages; `check-site` 0 errors; `check-budget` 0 over; `check:a11y` 0 failing of 108; browser: chip shown and selectable, no hint text |

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

1. Glossary to about 60 terms as cards grow (CNT-012); redraw three weak materials pictures (color-tune, chair-music, torn-landscape).
2. Games from 05 that need no data (for example GAME-022 Four together, GAME-029 Singing sheets, GAME-059 Spot the difference), each with the site's game rules: no score, no timer, Rest always visible.
3. Result drawings for the new cards (shared with the app; needs names in all app languages).
