# Duplicate audit and thin-page check

Covers SEO-015 (duplicate and near-duplicate audit) and SEO-007 (no thin or programmatic pages), both in [12-search-geo-distribution.md](12-search-geo-distribution.md). Run on 2026-11-15 against a fresh build of branch `s2h2/dup`.

**Status: partial.** The check exists and has run once. The threshold is not chosen: it awaits editor sample review. Every flagged pair needs a human decision. Nothing has been rewritten, merged or deleted, and the check is not in CI.

## Summary

| Question | Result |
|---|---|
| Indexable pages compared | 15,731 of 15,732 built pages (1 `noindex`: `/dementia-activities/`, the held hub with `indexHold`; 0 non-canonical) |
| Exact duplicate titles | 0 groups |
| Exact duplicate descriptions | 0 groups |
| Exact duplicate H1s | 1 group: `/` and `/activity/` (English) both H1 "What would you like to do together" |
| Near-duplicate body pairs at proposed threshold 0.5 | 11, all `/games/` pages in six languages |
| Pairs at scan floor 0.3 | 3,470: 3,436 games pages, 26 caregiving pages (Burmese), 6 English activity pages, 2 brain-health pages |
| Activity cards missing a SEO-007 field | 38 of 38, and the only missing field is the named author (see the thin-page section) |

## Method (SEO-015)

Script: `site/scripts/check-duplicates.mjs`, run with `pnpm run check:duplicates` (`node --max-old-space-size=6144`). Logic: `site/src/lib/similarity.ts`, tested in `site/src/lib/similarity.test.ts`.

1. **Pages.** Every `dist/**/index.html`. Pages with `<meta name="robots">` containing `noindex` are excluded, and so are pages whose `rel=canonical` is another URL.
2. **Fields.** Title, first H1, meta description, and the text inside `<main>`, with scripts, styles and SVG removed and tags stripped.
3. **Normalisation.** NFKD, lowercase, punctuation reduced to spaces, NFC. Han, Kana, Thai, Lao, Khmer and Myanmar characters count as one word each, because those scripts have no spaces. This is a character n-gram approximation, not word segmentation.
4. **Exact duplicates.** Normalised values are compared within the same `<html lang>` only.
5. **Near duplicates.** 5-word shingles, hashed with 32-bit FNV-1a. MinHash with 120 hash functions. LSH banding (at the 0.3 scan floor: 60 bands of 2 rows, about 99.7% recall at Jaccard 0.3). Candidate pairs are confirmed with exact Jaccard similarity on the shingle sets. Pages in different languages are never compared.
6. **Floor and threshold.** Pairs are scanned from 0.3 so that the sample review can compare cut-offs. The **proposed** threshold is 0.5. It is provisional and is not a decision.
7. **Skips.** A page with fewer than 30 shingles (about 35 words) is skipped and counted. None were skipped in this build.

Run time on this build: scan about 21 s, whole script about 41 s, on 15,731 pages. Build: `astro build` took 2 min 52 s for 15,733 pages. The build needs `NODE_OPTIONS=--max-old-space-size=6144`: with Node's default heap it ran out of memory.

Limitation: body text inside `<main>` includes shared template blocks on each page (the game "About" and tips blocks, for example). Shared blocks raise similarity between pages of the same template. The method does not yet remove boilerplate, so this affects the counts. See the decisions section.

## Results (SEO-015)

### (a) Exact duplicates

- Titles: no duplicate groups. Title templates do not repeat in this build.
- Descriptions: no duplicate groups.
- H1: `What would you like to do together` appears on `/` and `/activity/` (English). The acceptance criterion says a title template may repeat only where the subject differs, so this needs a decision: rewrite one, or mark it as a deliberate variation.

### (b) Near-duplicate bodies, by language and page type

Flagged at 0.5 (11 pairs): all in the games family. `my` 4, `ii` 3, `th` 1, `km` 1, `lo` 1, `ja` 1. Page type: games 11.

Pairs at 0.3 and above (3,470), by page type: games 3,436, caregiving 26 (all `my`), activity 6 (all `en-US`), brain-health 2 (all `my`).

Pairs at 0.3 and above, by language (top ten): `my` 70, `ii` 43, `th` 40, `km` 37, `lo` 35, `en-US` 33, `fr` 32, `sw` 31, `ur` 30, `ja` 29. The full per-language list is in the report.

Band counts: 0.3 and above 3,470; 0.5 and above 11; 0.7 and above 0; 0.9 and above 0. No pair in this build is above 0.6.

### Example pairs for editor review

Five flagged at 0.5 and above, then five from the 0.3 to 0.5 band:

| Similarity | Language | Pair |
|---|---|---|
| 0.593 | my | `/my/games/find-the-same/` and `/my/games/shadow-match/` |
| 0.568 | th | `/th/games/find-the-same/` and `/th/games/shadow-match/` |
| 0.520 | ii | `/ii/games/picture-puzzle/` and `/ii/games/sort-together/` |
| 0.519 | ja | `/ja/games/find-the-same/` and `/ja/games/shadow-match/` |
| 0.512 | my | `/my/games/coloring/` and `/my/games/picture-puzzle/` |
| 0.491 | bo | `/bo/games/find-the-same/` and `/bo/games/shadow-match/` |
| 0.396 | hu | `/hu/games/sort-together/` and `/hu/games/word-search/` |
| 0.382 | he | `/he/games/find-the-same/` and `/he/games/finish-the-saying/` |
| 0.342 | my | `/my/caregiving/oral-care-with-dementia/` and `/my/caregiving/toileting-and-incontinence-with-dementia/` |
| 0.316 | tn | `/tn/games/sort-together/` and `/tn/games/word-search/` |

Reading of the sample, not yet a finding: in the games pairs, the two pages share the same explanatory blocks around a short, different game. An editor should read the page text in the browser, because the score alone cannot show whether the instructions were copied or are the same by design.

The full list at 0.3 and above is in the report (`/Volumes/SANDISK-Data/ca-shots/dup/duplicates-report.txt`, sections "Flagged pairs" and "Sample pairs"). The report file lives outside the repo, so rerun the check to regenerate it.

## Decisions needed (human)

1. **Threshold.** The proposed 0.5 is provisional. An editor reviews a sample of about 30 pairs across the bands (the report lists 10 per band), then sets the threshold and records it here. Until then the check reports and does not block.
2. **Each flagged pair:** rewrite (add content, not synonyms), merge, or mark as a deliberate variation. The 11 pairs at 0.5 are all games pages; the 3,459 pairs between 0.3 and 0.5 need a policy first, because many of them are template-driven.
3. **Shared template text.** Decide whether the method should remove blocks that repeat across many pages of one language (boilerplate) before scoring. That changes the counts a lot, so decide it before the threshold.
4. **H1 `What would you like to do together`** on `/` and `/activity/`: rewrite one, or mark as a deliberate variation.
5. **Release gate.** The spec says the report blocks release until each pair has a decision. `--strict` exits 1 when anything is flagged, so it can be used as the gate once the threshold is set. It is not wired into CI and should not be until then.

Do not optimise for passing the check. A rewrite must add content, not synonyms.

## Thin-page check (SEO-007)

Bar, from the spec: a named author, a materials list, a time estimate, at least one real adaptation, a safety line and a stop note. The check is `missingBarFields` in `site/src/lib/similarity.ts`. A team byline counts as no named author, and a blank value counts as missing.

Applied to the 38 cards in `site/src/content/activity-cards/`, using each card's frontmatter:

| Field | Cards missing it | Shortest or lowest value |
|---|---|---|
| Named author | **38 of 38** | Every card's `author` is "Creative Activities editorial team" |
| Materials list | 0 | 2 items minimum |
| Time estimate | 0 | every card has `activityMinutes` |
| At least one adaptation | 0 | 3 variations minimum |
| Safety line | 0 | 3 lines minimum |
| Stop note | 0 | 111 characters minimum |

Cards missing the named author (all 38; no card is missing any other field): arrange-flowers-together, decorate-a-keepsake-box, decorate-a-plant-pot, draw-repeating-patterns, draw-to-music, fold-a-paper-boat, fold-towels-together, give-a-hand-massage, look-through-a-photo-album, make-a-button-picture, make-a-color-collage, make-a-family-tree-of-hands, make-a-greeting-card, make-a-lavender-sachet, make-a-memory-collage, make-a-paper-chain-garland, make-a-personal-songbook, make-a-photo-postcard, make-a-pine-cone-bird-feeder, make-a-playlist-together, make-a-sealed-shaker, make-a-texture-board, paint-a-garden-stone, paint-a-shared-picture, paint-with-watercolors, plant-seeds-in-a-pot, press-leaves-and-flowers, print-with-leaves, shape-a-pinch-pot, sketch-what-is-on-the-table, sort-buttons-by-color, start-a-family-recipe-book, tap-a-rhythm-together, tear-paper-mosaic, watch-birds-from-a-window, weave-paper-strips, wind-a-ball-of-yarn, write-a-letter-together.

**Decision needed.** The SEO-007 bar asks for a named author. The editorial policy (TSA-034) says no credentialed reviewer is named yet, and the byline is the team by design. The maintainer must decide one of: name a person as author on each card; accept the team byline as meeting the bar; or hold the cards as `noindex` until a named author is set. This check does not change any content.

**Test.** The brief asked for a corpus test that every card meets the bar only if all 38 already do. They do not, so no corpus test was added. The unit tests for `missingBarFields` are in `similarity.test.ts`.

To reproduce the per-card result: read each card's frontmatter (`author`, `materials`, `activityMinutes`, `variations`, `safety`, `stopNote`) and pass the values to `missingBarFields`. The reader was a one-off and is not committed.

## Reproduce

```
cd site
NODE_OPTIONS=--max-old-space-size=6144 pnpm exec astro build
pnpm run check:duplicates              # report only
pnpm run check:duplicates -- --strict  # exits 1 when anything is flagged
```

Run the script through `pnpm run`, which uses the pinned Node runtime. The script imports `similarity.ts` with Node's built-in type stripping. Node 22.14 (the default in some shells) fails with `ERR_UNKNOWN_FILE_EXTENSION`. The engines field asks for 22.22 or later.

## Open

- Editor sample review and threshold choice (above).
- Boilerplate policy for shared template blocks (above).
- Named-author decision for the 38 cards (above).
- Character n-grams stand in for word segmentation in Han, Kana, Thai, Lao, Khmer and Myanmar. A segmenter would give better word shingles there.
- Not in CI. Add to a release check only after the threshold is recorded in this file.
