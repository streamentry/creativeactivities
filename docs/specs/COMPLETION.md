# Spec completion tracker

Started 2026-11-15 for the maintainer goal "work until all docs/specs are completed". Branch `specs/complete-all-specs`. This file says how much of each spec is done and what stops the rest. It does not replace `release-status.json` (release evidence), `WORKBOARD.md` (handoffs), `global/s1-status.md` or `global/s2-hardening-status.md`; it points to them. Implemented, tested, merged, device-verified and published remain separate states.

## Ground rules for "complete"

- The specs are three layers: [product](product.md) (8 stories), [senior-first](senior-first/README.md) (40 `GM-` features) and [global](global/README.md) (533 indexed items).
- An item is **exists** when it is built and needs nobody else; **partial** when it is built or started but waits on a person, a device, a reviewer or a maintainer decision; **new** when nothing exists yet.
- Items that need accounts, payments, community features, new telemetry, cloud sync or recordings stay unbuilt until the maintainer approves them in writing (AGENTS.md). Building them without approval would break the specs, not complete them.
- Nothing here claims usability, credentialed review, device or screen-reader evidence that has not happened.

## Tally

### Global index (`global/id-index.tsv`, 533 items)

Generated from the index. Do not edit the table by hand: change a status in `global/id-index.tsv`, then run `python3 scripts/spec_tally.py --write`. The same command resolves a merge conflict in it, and `tests/test_spec_tally.py` fails when the table and the index disagree.

| Phase | exists | partial | new | total |
| --- | --- | --- | --- | --- |
| S1 | 12 | 28 | 0 | 40 |
| S2 | 64 | 196 | 147 | 407 |
| S3 | 1 | 12 | 62 | 75 |
| S4 | 0 | 0 | 11 | 11 |
| **All** | **77** | **236** | **220** | **533** |

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
| Classified two items from evidence already in the repo, with no new code: dated bylines on every page type, a change log, withdrawal notices, redirect on retire, a corrections page and a review queue; and the provenance register with CI checks | CNT-034, CNT-031 → partial (48-hour correction process, app assets, named art reviewer) | spot-checked dates in the built card, hub and guide pages |
| Classified five more items from evidence in the repo, each with an Evidence line that also says what is missing: the claims lint (CNT-1001), no-pressure and no-accounts guards (CNT-1002), ad-free site (TSA-019, now with an automated check, below), child-image tests (TSA-021) and the provenance register (PLAT-003) | CNT-1001, CNT-1002, TSA-019, TSA-021, PLAT-003 → partial | docs only; claims lint scope confirmed in `claims.ts`; CSP read from `_headers` |
| Ad and third-party check added to `check-site`: a page fails the build if it names a known ad network or loads any resource from a host other than this site and Google Tag Manager. Proved by injecting a disallowed script and an ad image into a built page (4 errors), then restoring it (0) | TSA-019 (stays partial: TSA-011 inventory, app, analytics-on-child-pages decision) | `check:site` 0 errors on 16,521 pages |

### Batch 9 (2026-11-16)

| Change | Items | Evidence |
| --- | --- | --- |
| Season pages: `/seasons/` with a northern, southern or "not four seasons" choice (a language-setting guess until chosen, kept only in the open page) and four pages, one per season, each with its own opening, selection rule, "not for" line, stop note and swap. Season-only cards never repeat across pages; six any-season cards follow on each. The four season pages are `noindex` and out of the sitemap until evidence shows they answer a different question than the seasonal hub; the seasonal hub links to `/seasons/` | WEB-033 → partial (calendar view, remembering the choice, search or usability evidence, outside review) | vitest 3,014 pass (21 new in `seasons.test.ts` and `data/seasons.test.ts`); `tsc` clean for the new files; build 16,526 pages; `check-site` 0 errors; `check-budget` 0 over; browser: November guess is autumn, choosing southern shows spring, nothing in localStorage |

### Batch 10 (2026-11-16)

| Change | Items | Evidence |
| --- | --- | --- |
| Changing the picture count keeps the place in Find the same, Shadow match, Odd one out, Four together and Picture pairs: the target, theme, odd picture, found pictures or matched pairs stay, and only extras are added or taken away. In Picture pairs, switching between showing and hidden pictures no longer restarts the board. A new `resize.ts` holds the logic. Picture puzzle, Picture bingo, Word search and Sort together still restart | WEB-053 stays partial (those four games, five-adult testing) | vitest 3,046 pass (16 resize, 5 pairs-carry, 11 keep-place; keep-place fails against the old code); `tsc` clean for the game files; build 16,526 pages; `check-site` 0 errors; `check-budget` 0 over; `check:a11y` 0 failing of 108; browser: pairs kept a matched pair from 4 to 8 to 4 tiles and a finished board reopened on growing, Four together kept two found pictures from 8 to 4 to 8, Find the same and Odd one out kept their pictures, no console errors |

### Batch 11 (2026-11-16)

| Change | Items | Evidence |
| --- | --- | --- |
| Stale-translation notice: a translated guide made from an older English page shows an "out of date" notice with a link to the current English page (a stronger line on health guides), found from the `translatedFrom` and `updated` dates; `pnpm translations:queue` lists stale translations with protected guides first; `check-site` fails if a stale page lacks the notice or a current one shows it. Today 362 translations (182 languages) are behind two retired English guides and are reported separately, with no notice; none of a live guide is stale | L10N-021 → partial (re-review SLA, segment-level states, hiding a stale protected page) | vitest 3,066 pass (20 new); `tsc` clean for the new files; build 16,526 pages; `check-site` 0 errors; proven by moving two live guides' dates forward (75 translations of the health guide showed the notice, check passed) and restoring them; viewed in the browser |
| Hreflang reciprocity check in `check-site`: each page lists itself, no repeated code, every alternate is a built page that links back, `x-default` is in the set. First run failed 10,541 pages, a real defect from the guide retirement (`x-default` and the retired section's alternates pointed at redirecting English addresses); fixed in the layout and the section view | SEO-031 → partial (reviewed-language gate, content-identifier mapping, partial-translation rule) | `check-site` 0 errors on 16,526 pages; removing one back-link from a built page produced the expected error, then restored |
| Claims lint extended to each card picture's alt text and caption (a condition-led description fails) and to badge phrases such as "clinically reviewed" and "therapist-approved"; new slug test fails on any address that names therapy, healing or cure or pairs art or music with a condition, except the explainers and one legacy address (`activities/therapeutic-art-activities-for-adults`, kept for inbound links) | CNT-1000 → partial (benefit sentences traced to the register and signed off by a reviewer; rename of the legacy address with a redirect) | vitest 3,082 pass (5 slug tests, 6 claims tests, 3 schema tests and 2 byline tests new; 4 of the new claims tests fail against the old lint); build 16,526 pages; `check-site` 0 errors; `check-budget` 0 over; `tsc` clean for the changed files |
| Review record now holds the reviewer's role (nine roles) and the register or board that holds the credential (required except for lived experience); a shown review prints the body in the byline and says it does not make the activity therapy | CNT-1004 → partial (no reviewer named, so no card has a record; no marker for a declined page) | schema, byline and claims tests; a trial record on one card showed the byline and section in the built page, then was removed |
| Classified two dementia and CALM table rows from the repo: the retired dementia guides now lead to the hub and the kept ideas list (none reviewed), and the "Therapeutic" guide was retitled as relaxing activities (the address keeps its old slug); fixed the garbled titles of the CNT-901 to 911 rows in the index | CNT-907, CNT-909 → partial (specialist, OT and lived-experience review; CALM reviewer) | docs only; titles read from the guide front matter |
| Parenting boundaries: the claims lint now fails on "builds, develops, boosts, improves, teaches ... a named skill" and on "skill-building" unless negated, questioned, quoted, warned about or cited as research; `check-site` fails any autoplaying video or audio element or frame. No current copy needed changing | TSA-022 → partial ("playful practice" wording is not checked; child-development reviewer not named) | vitest 3,091 pass; claims tests 61 (4 new fail against the old lint); injecting an autoplay video into a built page made `check-site` fail, then restored |

### Batch 12 (2026-11-16)

| Change | Items | Evidence |
| --- | --- | --- |
| "What I have" page at `/what-i-have/`: tick everyday items (61, in seven groups) and see the cards whose every need is met, with cards one thing short listed apart and each card's own substitutions beside it. A reviewed record of what each of the 53 cards needs, tied to each card's materials list by a two-way test; the ticked list stays in the browser, is listed in the data inventory and on `/your-data/`, and can be cleared. The finder links to it. Also added the new season pages and this page to the accessibility check | WEB-006 → partial (reviewer check of the items and records; materials class facet; other languages) | vitest 3,228 pass (170 materials, 17 matching and storage); `tsc` clean for the new files; build 16,527 pages; `check-site` 0 errors; `check-budget` 0 over; `check:a11y` 0 failing of 123 (it first failed: the card link filled its cell and the "If something is missing" toggle sat under the next heading; fixed); 21 cards ready for the editors' 23-item stash; tried in the browser at desktop and 375 px: ticking, reload keeps the list, clearing empties it |
| Occasion hubs at `/occasions/visit/`, `/occasions/rainy-day/`, `/occasions/short-break/` and `/occasions/gift/`: ten cards each by a written rule, own opening, stop note and "not for" line. Tests check each hub against its own rule, that none names a festival, that the gift hub has no store link or product, and the overlap limit with every other hub. A card that broke the visit rule was swapped. Bed rest and celebrations are served by the bedside and seasonal hubs, since separate hubs would share most of their cards (H1). All four are held from search (H11) and linked from the home page and the finder | WEB-034 → partial (printable gift card; search and usability evidence; outside review) | vitest 3,315 pass (hub tests 195); build 16,531 pages; `check-site` 0 errors; `check-budget` 0 over; `check:a11y` 0 failing of 128; `check:duplicates` 0 exact duplicates; home page shows the four new situations |
| The tally table above is now generated from the index by `scripts/spec_tally.py`, with a test that fails when they differ and a `--write` that fixes a merge conflict in it. Until now the counts were typed by hand | tracker only | `tests/test_spec_tally.py` 8 tests; 121 Python tests pass |

### Batch 13 (2026-11-16)

| Change | Items | Evidence |
| --- | --- | --- |
| Site search at `/search/` with a "Search" link in every page header: activities, situations, games and live guides, matched by word with a light stem and 37 synonym groups ("nan", "granny", "grandma"; "care home", "nursing home"). Every word must match, otherwise closest matches or "nothing matched" with a link to the finder. The question never leaves the browser: no storage, no request but the index, no analytics event, and it stays out of the address (all tested by scanning the code). The index is built with the site (110 KB, 34 KB gzipped) and `check-site` fails if it lists a page that was not built | WEB-003, PLAT-022 → partial (a box on every page; an editor's review of the synonyms; no-JavaScript search; screen-reader test; other languages; sharding and "indexed pairs only") | vitest 3,351 pass (36 search tests, 14 of them over the real pages); `tsc` clean for the new files; build 16,532 pages; `check-site` 0 errors; `check-budget` 0 over; `check:a11y` 0 failing of 133; `check:duplicates` 0 exact duplicates; tried in the browser: "nan", "rainy day", "painting", a made-up word and a part-match, address unchanged and nothing stored; the nav link shows on a translated page |

### Batch 14 (2026-11-16)

| Change | Items | Evidence |
| --- | --- | --- |
| `pnpm metrics:content` reads the repository and reports, each with its count and date: pages with a current, stale or no review record (health-adjacent apart from the rest), pages past a 12-month review, translation coverage and staleness per language, and source coverage on health-adjacent pages (a health flag or a crisis route, as the translation queue counts them; hubs held from search are not indexed pages). Today: 0 of 23 health-adjacent pages and 0 of 78 other pages reviewed, 0 of 101 overdue (and none can be before 2027-10-26, so that says nothing yet), 189 languages with 5 to 6 of 41 live guides each and 0 stale, 362 of the 10,352 translations behind retired guides, which stay published, stale, a native-reviewed count that is a fixed 0 because no record exists, and 0 of 23 with a dated source (14 with any source; a card has no field for one). A second Claude agent reviewed the diff and its findings are fixed | MET-010, MET-011, MET-012, MET-015 → partial (content-hash staleness, owners, weekly run, native-review records, dated sources) | vitest 3,428 pass (28 in `content-metrics.test.ts`, covering a reviewer named without a record,  dates with a time, future and unreadable dates, crisis routes, hubs held from search, stale translations behind retired guides, and the per-language rows); `tsc` clean |
| The print check (`pnpm check:print`: every activity card is one two-sided sheet on A4 and US Letter, navigation hidden) now runs in the website workflow, and it fails when it finds no cards instead of passing by checking nothing. It passes locally for all 53 cards in 34 seconds. Classified two items from existing evidence: the print and translation tests and the staleness queue | PLAT-039, PLAT-012 → partial (print checks beyond cards; owners and a weekly run) | `check:print` 0 of 53 cards failing; the CI step is proven by this pull request's own run |
| The year as twelve months on `/seasons/`, for the northern or southern half, with this month marked and each month linking to its season; a test that each season's own cards include a seated and a large-grip version | CNT-013 → partial (six-weeks-ahead publishing; holidays from many traditions with cultural review; editor review); WEB-033 stays partial | vitest 3,420 pass (calendar and seated and large-grip tests); tried in the browser for north, south and "not four seasons" |
| Classified two items from existing evidence: print version and dated change log per card (PLAT-007), and hubs showing a card's variation by kind without copying text (PLAT-002) | PLAT-007, PLAT-002 → partial (version numbers, diff-made entries, variation IDs and review records) | docs only; read from `ActivityView.astro`, `activity-changes.test.ts` and the hub schema |

### Batch 15 (2026-11-16)

| Change | Items | Evidence |
| --- | --- | --- |
| "Describe your situation" on the finder: a few words become removable choices (kind, time, materials, where, who, energy, mess, what they enjoy, talking, help), read from a list of words and phrases, with a number of minutes put in the finder's bands, a child's age read as a child, and a word turned around by "not", "dislikes" or "difficulty" left out, inside its clause and for phrases as well as words. Nothing typed is sent, stored or put in the address, the browser's spell-check is off in the box and in the site search, and the note beside the box says the chosen filters appear in the address as any filter does. A choice made by hand is not overruled, going back clears the box, and a word naming a condition or a limit gives nothing. A second Claude agent reviewed the diff and its findings are fixed | WEB-002 → partial (an editor's check of the 41 situations and the mapping; other languages; needs the finder has no question for) | vitest 3,501 pass, 1 skipped as before (90 in `situation.test.ts`: 41 situations from 01 §3, 27 condition words, negation inside clauses and for phrases, ordinary words, ages, overrides; 15 in `no-posts.test.ts`); `tsc` clean; build 16,532 pages; `check:a11y` 0 failing of 133; tried in the browser: chips, removal with focus kept in the box, gibberish, clearing, address holds only the choices |
| `check-site` fails the build if a form, or a button in one, sets where or how it sends (with or without spaces around the equals sign) or a script or frame loads a captcha service, and a test fails if the site's code sends a POST, PUT, PATCH, DELETE or beacon. Today: 55 forms, none posts, no captcha | TSA-044 → partial (the controls for a posting form, which does not exist yet) | `check-site` result below; injecting a form with an action into a built page made it fail, then restored |

### Batch 16 (2026-11-16)

| Change | Items | Evidence |
| --- | --- | --- |
| Printable pack builder at `/activity/pack/`: tick up to eight cards, choose one version for the pack, and print a cover with a combined supply list ("Main supplies", with what it assumes), then the cards. The pack lives in the address, not on a server or in storage, and the page says that a visitor who allowed visit counts shares that address like any other. A card is in a pack only with the chosen version: a box that cannot be ticked is dimmed, stays reachable and says why; a link that names cards that are gone or lack the version opens a shorter pack and says so. The page count is shown before printing as "up to N pages". The cover carries a pack key, a version, the address and the noncommercial line. Every card printed in a pack, fixed or built, now ends with its own version date, and `check-site` fails a built pack page when one has none. It counts as an app page for the page weight budget (first-paint styles 14.9 kB gzipped). Linked from the finder; `noindex`. A second Claude agent reviewed the diff before this was recorded, and its findings are fixed. The cover says only that a person may pause or stop whenever they want to, matching the site's pause note | WEB-017 → partial (one version for the whole pack; the page count is an upper bound; no PDF; no static pack page per key; supply lists not reviewed by a person; one language; no real-printer, screen-reader, Firefox or Safari test); WEB-016 stays partial (the printed pack footer is now checked; still no version number or last-checked date) | vitest 3,432 pass, 1 skipped as before (3 in `budget-classes.test.ts` for which page weight budget a page gets; 33 in `pack.test.ts`: the link, the version rule, the notes, a seeded 600-trial check that the supply list is met exactly when every card is, the page limits equal the print check's, no storage or request in the island, and a cover that claims nothing the cards do not each say); `tsc` clean; build 16,533 pages; `check-site` 0 errors; `check-budget` 0 over; `check:print` 0 failing: all 53 cards through the builder on A4 and Letter at one page of cover and two of card, the longest supply list the page itself can make (35 lines, eight cards) at 18 pages on both sizes, which is the stated limit, and three cards named out of order printing in that order in the bedside version; `check:a11y` 0 failing of 143 (the page empty and with a pack chosen); tried in the browser: ticking, a version one card lacks, the full-pack note and a refused tick, a link with an unknown card, saved activities with an unknown slug, clear, the copy fallback, and 375 px |

### Batch 17 (2026-11-17)

| Change | Items | Evidence |
| --- | --- | --- |
| Four-week paths at `/paths/`: a care path ("Four Quiet Weeks at the Table", for a caregiver and an older adult) and a together path ("Four Weeks of Making Across the Generations", for a child and an older relative). Each states its purpose, who it is not for, why its activities were chosen and a stop note; each week offers two activities. A visitor starts at any week, skips any week in one tap and brings it back in one tap; the page points at the first week from the start that is not skipped. It shows how many of the path's activities are tried, read from the tried list the activity pages keep and never written by the path. The only thing kept is the start and the skipped weeks, in one local key listed in the data inventory and on `/your-data/`. Each week has a time line worked out from its cards, and the path ends with a line that says it is finished, that stopping is fine and that it can be started again from any week. A path prints on two pages in 12 pt with the buttons and counts left off, a box to tick and the address by each activity, a blank line for what the two of them did, the scope and pause lines and a version line. The pages count as app pages for the page weight budget (first-paint styles 14.6 kB gzipped) and their print-only styles are in the file linked for print. The pages are `noindex`, out of the sitemap, linked from the finder | WEB-032 and CNT-006 → partial (no person has checked that the activities suit the people each path names; no session with caregivers or families; no path for other audiences or from a situation; no links from the hubs or Today; one language; saved collections and the weekly plan it depends on are partial) | vitest 3,485 pass, 1 skipped as before (37 in `lib/paths.test.ts`: refused and shared storage, 8 seeded 400-step runs showing that no path action touches the tried list and no count goes down, and a scan of the island for storage, requests, style attributes and words that make a path a streak or a debt; 15 in `data/paths.test.ts` checking the paths against the card files and the claims lint; the new store in the `your-data` tests); `tsc` clean; build 16,536 pages; `check-site` 0 errors (including a new rule that every path carries the scope and pause lines); `check-budget` 0 over; `check:print` 0 failing, both paths on 2 pages on A4 and Letter with the summary, counts and buttons off the paper and the addresses and version on it; `check:a11y` 0 failing of 158 (the list, one path as a new visitor sees it and the other with a place kept, at 320 to 1440 px and 200% text); a second Claude agent reviewed the diff and its findings are fixed; tried in the browser: start, skip, bring back, forget, tried marks arriving from another tab, 375 px |

### Batch 18 (2026-11-17)

| Change | Items | Evidence |
| --- | --- | --- |
| A hosting capacity check and a written record. The build holds 17,254 files (16,532 pages, 16,504 of the files in 189 language folders), which is 86% of the 20,000-file limit Cloudflare documents for Workers Static Assets on the Free plan (100,000 on Paid, 25 MiB per file). That leaves 2,746 files, about 12 page types (counted to the point where the check fails, 98%) that exist in every language, and ten times the pages would be about 166,000 files, over the Paid limit. `pnpm check:capacity` prints this for any build, warns from 80% of the limit, fails from 98% or on an oversize file, and runs in the website workflow after the page weight budget. The numbers, the limits, the options (record the plan, shard, render the long tail on demand, choose which page types exist in every language) and what was not measured are in `docs/engineering/hosting-capacity.md` | PLAT-015 → partial (no synthetic site at ten times the pages, built and deployed, so upload size, deploy time and cache behavior are not measured; the decision is the maintainer's; the account's plan is not recorded in the repository) | vitest 3,406 pass, 1 skipped as before (10 in `capacity.test.ts`: the counts, language folders, the warn and fail thresholds on both plans, an oversize file, the page types left in the headroom, the ten-times projection, and the limits with their source and date); `tsc` clean; `pnpm check:capacity` on the real build: 17,254 files, 86.3% of the Free limit, passes with a warning; build 16,532 pages; `check-site` 0 errors; `check-budget` 0 over; limits read from Cloudflare's documentation on 2026-11-17 |

### Batch 19 (2026-11-17)

| Change | Items | Evidence |
| --- | --- | --- |
| A plain-language report for editors. `pnpm review:plain` reads every card's steps and every hub's sentences and lists what an editor may want to look at: long steps, steps of more than one sentence and long hub sentences, with the mean reading grade as a prompt and not a score target. The spec's rule, that no step joins two actions with "and then", is now a test, and (the literal words only: about 33 steps chain actions with ", then" and are not caught) a second test stops any step from passing 60 words. Today: 413 steps in 53 cards, none breaks the rule, 5 steps have 25 words or more, 40 have more than one sentence, and 8 hub sentences have 30 words or more | TSA-008 → partial (the editor's checklist on every activity and hub is a person's work; the long steps and sentences listed have not been looked at; English only) | vitest 3,413 pass, 1 skipped as before (17 in `plain-language.test.ts`: words, sentences, syllables and the reading grade, the rule and its idiom, reading a card and a hub, and the real cards and hubs); `tsc` clean; `pnpm review:plain` on the real content runs with 0 steps breaking the rule |

### Batch 20 (2026-11-17)

| Change | Items | Evidence |
| --- | --- | --- |
| The "no pressure" rule is measured. A test scans 243 files of the site's code and 68 files of its English copy for urgency phrases, guilt and run-counting phrases, a stopwatch, a countdown, a score table, a move count, lives, confetti, requests to interrupt (notifications, push, vibration, an icon badge) and emoji used as praise, and finds none (urgency, guilt and emoji praise are checked in the English copy as well as the code; stopwatch, countdown, score and interruption in the code only; the game strings, middleware and styles are not scanned). Every timer in the interface is listed with the reason it is not pressure, and a new one fails the test until it is listed. A planted violation of each kind fails the test | MET-035 → partial (no monthly report with counts; no place to complain about pressure and no same-week review; a clean scan does not show the experience is gentle) | vitest 3,405 pass, 1 skipped as before (9 in `guardrails.test.ts`, shown to fail on a planted urgency phrase, run-counting phrase, confetti, timer and escaped emoji); `tsc` clean; the test also passes with the paths library and the describe box (two waits after typing stops, listed) from the open PRs added |

### Batch 21 (2026-11-17)

| Change | Items | Evidence |
| --- | --- | --- |
| The print check now covers every template with a paper version and prints the pass rate. It prints the activity cards, their large-print editions, the fixed packs, the weekly program, each game's paper version, the pack builder and the paths on A4 and US Letter. Each must fit the pages it declares, a card's steps must print at 12 pt or more and a large-print edition's at 18 pt or more, and a large-print edition's steps must be word for word the card's. Today 7 of 7 template types pass (100%) | MET-020 → partial; WEB-018 evidence recorded (its section still said "new" while the index said "partial") (no black-and-white printer check; the rate is in the workflow log and not in a record for each release; no test with people who read large print) | vitest 3,488 pass, 1 skipped as before (3 in `print-templates.test.ts`: the game list equals the data, the page table has no stale entry, the type sizes); `tsc` clean; `pnpm check:print` on a full build: card 53/53, pack builder 55/55, path 2/2, large-print card 53/53, fixed pack 2/2, weekly program 1/1, game sheet 11/11 |

### Batch 22 (2026-11-17)

| Change | Items | Evidence |
| --- | --- | --- |
| Group mode for facilitators: every activity card has a "Show steps to a group" button that opens a full-screen view built from the text already on the page. A start screen shows the name, summary, what you need and the note about pausing or stopping; then one screen for each step, in the card's own words in large type; then a last screen with the card's own note that it is fine to stop. The person leading moves on with Next, Previous, the left and right arrow keys, or Page Down and Page Up; Pause hides the step until Carry on; Done for now is on every screen. The buttons keep focus, each new screen is read out, and the buttons never take more than 45% of the screen. No clock, score, sound or autoplay, no number but the step count, nothing stored or sent, and the code and styles load only when the button is pressed. An independent review found a focus and keys risk, a crowded button bar on small screens, a check that could pass while broken, and several claims that went further than the evidence; all are fixed or stated. Adding the button made the 320 px page 1 px wider than the accessibility check allows, because the tilted sheet behind the card head grows with the head; the sheet is now tilted less on phones | WEB-046 → partial (materials do not scale to the group size; offline needs WEB-040; not tried in Firefox or Safari, on a real tablet, TV, cast screen or clicker, or with a screen reader; English only) | vitest 3,420 pass (24 in `group-stage.test.ts`); `tsc` clean; build 16,532 pages; `check-site` 0 errors; `check-budget` 0 over; `check-print` 53 cards; new `pnpm check:group`, also a CI step, in Chromium with the page's security policy enforced: 53 of 53 cards pass the walkthrough, 42 of 42 fit checks pass (three demanding cards, eight screen sizes from 320 by 256, normal and 200% text), 53 of 53 card pages fit a 320 px screen, and it fails with the styles missing or the button bar uncapped; `check:a11y` 0 failing of 138 (the open view is a new template) |

### Batch 23 (2026-11-17)

| Change | Items | Evidence |
| --- | --- | --- |
| An image check on every built page (`pnpm check:images`, also a CI step): each image has an alt attribute (empty for decoration), width and height in the page, and a picture file no more than twice as wide as it is shown. It found 8,209 pictures on the Conversation cards print sheet with no size; they now have one, and the printed size was measured in a browser before and after and did not change. The 100 illustrations sent at three times their shown width are allowed by a listed exception, which is a decision to revisit rather than a finding of fine | PLAT-017 → partial (no AVIF, WebP or JPEG derivatives at several widths, no cache by content hash, no step photographs yet) | vitest 3,413 pass (12 in `image-check.test.ts`); `tsc` clean; build 16,532 pages; `check:images` passes on 100,023 images; `check-site` 0 errors; `check-budget` 0 over; `check-print` 53 cards; `check:a11y` 0 failing of 133 |
| A units test fails if a card or a hub uses US customary and metric measures together (numeric forms only; the English guides are not covered) (shown to fail on a planted "8 inches (20 cm)"); today the cards use US customary only. Classified from existing evidence: the German and Arabic home pages are checked at 320 px, 200% zoom and 200% text for scroll, overflow and clipped text | L10N-014 → partial (no conversion to the reader's units, no print test per locale); L10N-018 → partial (two of 189 languages, home page only, no longest-label test, no screenshot per language) | vitest (5 in `units.test.ts`); the accessibility check's `translated` and `rtl` templates pass at all five variants |

### Batch 24 (2026-11-17)

| Change | Items | Evidence |
| --- | --- | --- |
| Conversation cards gains a "Big picture, for a group" choice, off at the start: one picture and its prompt large enough to share across a room (picture up to 55% of the screen height, prompt in 38 to 68 px type, one column or side by side on a wide screen held sideways, the full width of the page), with "Anyone may pass." under the prompt once a prompt is showing. Next card and Previous card are still pressed by the person leading; nothing moves by itself. The deck, its open prompts and its printed set were already there | GAME-051, GAME-050 → partial (not tried on a TV, cast screen or real tablet; no rules text for passing a card round a circle; label and pass line in English only, other languages show English; no automated check opens the big mode) | vitest 3,397 pass (the game's own test checks the choice is offered and off at the start; turning it on is not tested automatically); `tsc` clean; looked at in a browser at 1280 by 720, 768 by 1024 and 390 by 844, no sideways scroll; `check:a11y` runs the default mode |

### Batch 26 (2026-11-17)

| Change | Items | Evidence |
| --- | --- | --- |
| Game "Story dice" at `/games/story-dice/` (English only, built by a subagent and checked by me): the player chooses 3 or 4 picture dice from the shared library, Roll again is one tap, Pass says passing is fine and changes nothing, changing the count keeps the dice shown, and a one-page print sheet shows sixteen different pictures. No score, timer or failure wording; Rest comes from the shared frame; no one is asked to name or recall a picture | GAME-025 → partial (not tried with a group or on a real device; the text and picture mix not reviewed by a person; English only, other languages show English) | vitest 3,717 pass; `tsc` clean; build 16,537 pages; `check:site` 0 errors; `check:budget` 0 over; `check:print` 12 of 12 game sheets, one page on A4 and Letter; `check:a11y` 0 failing of 165; files in `dist` 17,273 (86.4% of the Free limit) |

### Batch 27 (2026-11-17)

| Change | Items | Evidence |
| --- | --- | --- |
| Game "Story chain" at `/games/story-chain/` (English only, built by a subagent and checked by me): a row that starts with one picture and grows by one picture at a time up to eight, while people take turns saying a sentence aloud (nothing typed or recorded); Add a picture, Take the last one off and Start a new chain, an "Anyone may pass" note, a one-page print sheet. No score, timer, streak or count; Rest from the shared frame | GAME-046 → partial (not tried with a group or on a real device; text not reviewed by a person; English only) | vitest 3,719 pass; `tsc` clean; build 16,537 pages; `check:site` 0 errors; `check:budget` 0 over; `check:print` 12 of 12 game sheets; `check:capacity` 17,272 files (86.4%); `check:a11y` 0 failing of 165 (agent's run) |

### Batch 28 (2026-11-17)

| Change | Items | Evidence |
| --- | --- | --- |
| Sort together gains a "Larger targets" choice, off at the start (built by a subagent, checked by me): exactly two bins at least 40% of the board wide, pictures at least 96 px, at least 16 px between targets, and the strongest contrast the design tokens allow; toggling it keeps the round and says so in a live message. Measured in Chromium at 320 px: bins 46% wide, 24 px apart, board pictures 132 px, no sideways scroll | GAME-019 → partial (not tried with real tremor, low vision or a real device; not checked in Safari, Firefox or forced-colors mode; label in English only, other languages show English) | vitest 3,747 pass; `tsc` clean; build 16,538 pages; `check:site` 0 errors; `check:budget` 0 over; `check:print` 7 of 7; `check:a11y` 0 failing of 167 (agent's run) |

### Batch 29 (2026-11-17)

| Change | Items | Evidence |
| --- | --- | --- |
| Game "Color match" at `/games/color-match/` (English only, built by a subagent, checked by me): a large swatch with the color's name written beside it, and 4 or 6 pictures to tap that are that color; a tap on another picture names it ("The pear is green.") and waits; Show them and Another color; Rest from the shared frame; no score, timer, miss count or failure wording. A hand-curated table of 34 pictures in five colors (red 10, orange 5, yellow 7, green 7, blue 5), each checked by a test against the dominant fill color in its own SVG | GAME-020 → partial (not tried with children or low-vision players; the dominant color is an estimate from shape boxes, not a renderer; no purple; English only, other languages show English) | vitest 3,813 pass; `tsc` clean; build 16,539 pages; `check:site` 0 errors; `check:budget` 0 over; `check:print` 14 of 14 game sheets; `check:capacity` 17,279 files (86.4%); `check:a11y` 0 failing of 169 (agent's run) |

### Batch 30 (2026-11-17)

| Change | Items | Evidence |
| --- | --- | --- |
| Game "Halves match" at `/games/halves-match/` (English only, built by a subagent, checked by me): the left halves of two or three pictures beside their right halves in another order; tap a half, then the half that fits it; a pair that fits joins into the whole picture with a border and a check mark, and one that does not simply separates with a gentle message; Show me and Another set; Rest from the shared frame; no score, timer, miss count or failure wording. Twenty pictures chosen from a contact sheet of their halves, never two of one category in a round; every half is a native button named for its picture, with the left column first in tab order | GAME-021 → partial (not tried with children or low-vision players; two pictures in a round can share a background tint that may hint at the answer; the last pair is trivial; the paper sheet reuses the on-screen wording; English only) | vitest 3,851 pass (35 new); `tsc` clean; build 16,540 pages; `check:site` 0 errors; `check:budget` 0 over; `check:print` 7 of 7, one page on A4 and Letter; `check:capacity` 17,282 files (86.4%); `check:a11y` 0 failing of 171 (agent's run) |

### Batch 31 (2026-11-18)

| Change | Items | Evidence |
| --- | --- | --- |
| Game "Color by number" at `/games/color-by-number/` (English only, built by a subagent, checked by me): a grid of large numbered cells (4 by 4, 6 by 6 or 8 by 8), a key of four colors each with its number, its written name and its own small shape, and a tap fills a cell with the chosen color; there is no wrong color, a gentle message when every cell has its numbered color, Fill with the numbers, Clear and Another picture; arrow keys move between cells; Rest from the shared frame; no score, timer, miss count or failure wording; a one-page print sheet to color with pencils. A test simulates three kinds of color-vision difference and requires every pair of the four colors to stay at least 30 apart (closest about 32, yellow and orange) | GAME-031 → partial (nobody with color-vision differences, a tremor or a bedside setup has tried it; Clear has no undo; the 6 by 6 and 8 by 8 grids scroll sideways at 320 px; names not reviewed by a person; English only) | vitest 3,915 pass; `tsc` clean; build 16,541 pages; `check:site` 0 errors; `check:budget` 0 over; `check:print` one page on A4 and Letter; `check:capacity` exits 0; `check:a11y` 0 failing of 173 (agent's run) |

### Batch 32 (2026-11-18)

| Change | Items | Evidence |
| --- | --- | --- |
| Game "Pattern maker" at `/games/pattern-maker/` (English only, built by a subagent, checked by me): the player edits one small tile (3 by 3 or 4 by 4) by tapping squares through four colors, each with a written name and a shape, and sees it repeated in a 3 by 3 block; Print my pattern gives one page; Start again with a one-step Put it back, and Surprise me; arrow keys move between squares; Rest from the shared frame; nothing is saved or sent; no score, timer or failure wording. Two small refactors share the arrow-key and color-vision helpers with Color by number | GAME-034 → partial (nobody with color-vision differences has tried it; the color names are not reviewed by a person; the paper copy reuses the on-screen wording; English only) | vitest 3,971 pass (55 new); `tsc` clean; build 16,542 pages; `check:site` 0 errors; `check:budget` 0 over; `check:images` passes; `check:print` one page on A4 and Letter; `check:capacity` exits 0; `check:a11y` 0 failing of 175 (agent's run) |

### Batch 33 (2026-11-18)

| Change | Items | Evidence |
| --- | --- | --- |
| Game "Build together" at `/games/build-together/` (English only, built by a subagent, checked by me): two people build one pattern on a shared grid (4 by 4 or 3 by 3), each with their own named color and shape, taking turns to place a piece; either may pass; Take back the last piece; no winner, count, score or timer, and a gentle message when the grid is built together; arrow keys move between squares; Rest from the shared frame; nothing saved or sent; a one-page print sheet | GAME-048 → partial (not tried with real pairs or with anyone with color-vision differences; Start again cannot be taken back; strings and color names not reviewed by a person; English only) | vitest 4,033 pass (61 new); `tsc` clean; build 16,543 pages; `check:site` 0 errors; `check:budget` 0 over; `check:images` passes; `check:print` game sheets 18 of 18; `check:capacity` 17,293 files (86.5%); `check:a11y` 0 failing of 177 (agent's run) |

### Batch 34 (2026-11-18)

| Change | Items | Evidence |
| --- | --- | --- |
| Game page "Seated toss tally" at `/games/seated-toss/` (English only, built by a subagent, checked by me): two people at a table toss a small bag into a large target and keep the tally on paper. The page opens with a safety block that is always shown (small parts, mouths, an adult within reach, the pause line) built from the site's own safety labels, a short how-to, and a one-page print sheet with a three-ring target whose rings are named in words and a plain tally table with no total row; no on-screen scoring, timer, miss count or winner wording | GAME-049 → partial (the safety wording and the ring order have had no reviewer; nobody has tried it with a real bag; English only) | vitest 4,049 pass; `tsc` clean; build 16,544 pages; `check:site` 0 errors; `check:budget` 0 over; `check:images` passes; `check:print` game sheets 19 of 19, one page on A4 and Letter; `check:capacity` 17,297 files (86.5%); `check:a11y` 0 failing of 179 (agent's run) |

### Batch 35 (2026-11-18)

Three games, each built by a Haiku subagent in its own worktree, then reviewed, corrected and integrated by the PM agent. All three are English only and print or play with no score, timer, winner or count of misses.

| Change | Items | Evidence |
| --- | --- | --- |
| Game "Drawing duet" at `/games/drawing-duet/`: one canvas, two people, each with one of the four Color by number colors named in words and shapes (orange and purple to start); a banner always shows whose turn it is and the pen color by name; draw with a finger, mouse or pen, or with the arrow keys and Space; Pass the pen, Take back my last line (only the current person's own line), Start again with a one-step Put it back, Save picture (a PNG made on the device, nothing sent) and a one-page paper version with the rules on the sheet | GAME-032 → partial (not tried with real pairs, children or with a tremor; a person may still choose yellow, which is faint as a line; keyboard drawing not tried with a screen reader or switch; English only) | Browser at 390 px: a drag drew an orange line, Pass gave the turn to the second person in purple, Take back left the first person's line in place |
| Game page "Decorate a card together" at `/games/decorate-a-card/`: five occasions (no religious or health occasions), a preview, five steps and a one-page sheet that folds in half, with the occasion words in an outline frame on the front and message lines and From on the back; the rules for two print on the sheet; crayons, pencils or pens only | GAME-035 → partial (not tried by real pairs or in a care setting; occasion names not reviewed; English only) | Review fixes: the agent's copy said the message goes "inside", which a one-sided sheet cannot do once folded, now "the back"; a "safe to use at a table" claim removed; the preview scrolled sideways at 390 px (`check:a11y`), fixed by letting the grid and the fieldset shrink |
| Game "Find together" at `/games/find-together/`: 6, 8 or 12 Picture pairs cards, pictures showing to start (as Picture pairs does) or face down; turns of two cards; two different cards stay face up until "Turn them back"; Pass at any time; one shared tally "Pairs found together" that only counts up | GAME-047 → partial (not tried with real pairs or a carer and a child; English only) | Review fixes: the agent started face down, changed to pictures showing (AGENTS.md visible-picture play); `check:images` found the card pictures had no width or height, added |

Checks on the integrated branch: vitest 129 files, 4,162 pass (1 skipped); `tsc` clean; build 16,547 pages; `check:site` 0 errors; `check:budget` 0 over; `check:images` passes; `check:print` game sheets 21 of 21, both new sheets one page on A4 and Letter; `check:capacity` 86.5%; `check:a11y` 0 failing of 185 (25 games at two widths); Python 121 tests and `release_metadata.py --check` pass. Share images for the three games made with `make-images.py` and checked by eye (one subtitle shortened so it is not cut off).

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

## Decisions only the maintainer can make

Each of these blocks work that no one else can unblock. The last column is a suggestion to make the decision quicker. None is decided, and nothing in the repository acts on it.

| Decision | Unblocks | Options | Suggested |
| --- | --- | --- | --- |
| Hosting plan | Any page type that exists in every language (each adds about 189 files); PLAT-015 | Stay on the Cloudflare Free plan (20,000 files per version; about 17,300 in use, 86%) or move to Paid (100,000) | Move to Paid before adding another all-language page type; until then add new page types for English only |
| Indexing the weakest seven expansion languages: Hausa, Amharic, Burmese, Pashto, Sindhi, Somali, Oromo (L10N-033) | L10N-020, L10N-033 | Index them now, as the 2026-11-01 decision says, or keep them `noindex` until a native reviewer has checked each | Keep `noindex` until reviewed; the review guide already puts these seven first |
| Google console settings (the five steps in [analytics-consent.md](global/analytics-consent.md)) | TSA-014, MET-037 | Do the five steps (enhanced measurement off, Google signals off, 2-month retention, container triggers removed, a check in a clean browser profile) or leave them | Do all five; they match DESIGN.md |
| Crawlers for AI products (SEO-035) | SEO-035, SEO-019 | Allow all (today, including GPTBot); allow search crawlers (Googlebot, Bingbot, OAI-SearchBot) and disallow training crawlers; disallow all | Allow search crawlers, decide training separately, never block Googlebot or Bingbot; `robots.txt` is a request, not access control |
| AI-assistance disclosure and the `aiAssisted` flag (CNT-032) | CNT-032, CNT-030 | Adopt the written rule and the one-line disclosure, with the wording confirmed by counsel, or not | Adopt, with counsel confirming the wording before it ships |
| A first-party "We tried this" counter (PLAT-027) | PLAT-027, MET-001, MET-002, MET-003 | None (Google Analytics with consent only), or a cookieless endpoint that stores daily counts per activity and language with small cells hidden (proposed minimum 10) | Approve it in principle: Google Analytics cannot see an activity done away from the screen, and the north star is confirmed starts |
| A service worker for offline reading (WEB-040, PLAT-034) | WEB-040, PLAT-034 | Keep `worker-src 'none'` in the security headers (no offline reading on the web) or allow a reviewed service worker for the site's own address | Allow it after a privacy review; care homes with poor Wi-Fi are the case for it |
| Units on cards (L10N-014) | L10N-014 | Keep US customary only, or convert once by a rule for each locale, checked by a reviewer | Keep US customary until a reviewer for metric units is named |

## Next batches (buildable without a person)

1. Glossary to about 60 terms as cards grow (CNT-012); redraw three weak materials pictures (color-tune, chair-music, torn-landscape).
2. Games from 05 that need no data or license, each with the site's game rules (no score, no timer, Rest always visible): next GAME-040 Seasonal puzzle pack and GAME-060 Quiet shapes puzzle, then GAME-038 Color wash and GAME-033 Collage board. GAME-029 Singing sheets waits on a lyrics license review and GAME-059 Spot the difference on commissioned art.
3. Result drawings for the new cards (shared with the app; needs names in all app languages).
