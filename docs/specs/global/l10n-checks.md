# Localization checks (L10N-006, L10N-008)

Updated 2026-11-15 on branch `s2h2/l10n`. Read with [13-localization.md](13-localization.md) (the rules and items) and the [S2 hardening status](s2-hardening-status.md).

Two automated checks run in the normal vitest suite (`pnpm test` in `site/`). Neither changes content. Both report what they find; a person decides what to fix.

## How to run

```sh
cd site
pnpm exec vitest run src/lib/translation-structure src/lib/yaml-subset src/lib/brand-name   # both checks, about 15 s
pnpm test                                                                                    # the whole suite, which includes both
```

To re-record the structure baseline after a reviewed fix (the test writes the file and stops; run it again to confirm):

```sh
TRANSLATION_BASELINE_WRITE=1 pnpm exec vitest run src/lib/translation-structure.content.test.ts
```

## Check 1: translated documents keep the English structure (L10N-006)

| File | What it is |
| --- | --- |
| `site/src/lib/translation-structure.ts` | Pure functions: `compareDocuments` (guides), `compareActivityCards` (cards), `markdownStructure`, `normalizeDigits`. |
| `site/src/lib/translation-structure.test.ts` | Unit tests with fixtures, one per rule. |
| `site/src/lib/translation-structure.content.test.ts` | Runs over every file in `src/content/guides-i18n/` against `src/content/guides/`, and over `src/content/activity-cards-i18n/` if that folder exists. |
| `site/src/lib/translation-structure.baseline.json` | Known mismatches, by file. |
| `site/src/lib/yaml-subset.ts` | A small frontmatter reader (no new dependency). It was checked against the full `yaml` package on all 11,498 English and translated frontmatter blocks: identical output. Anything outside its subset throws. |

### What is compared

Guides:

- **Frontmatter keys.** Every English key must be present, and no extra key, except `translatedFrom` on translations (the schema requires it there).
- **Same value:** `section`, `order`, `health`, `crisisRoute`, `relatedGames`, `related`.
- **Same count:** `keyPoints`, `faq`. **Same URLs in the same order:** `sources`.
- **Body:** headings by level in order (fenced code skipped); list blocks by type and item count in order; number of links (images not counted).
- **Numbers:** the digit runs in the title, description, summary, key points, FAQ and body, compared as a multiset (order is ignored, since translators move numbers within a sentence). Thousands separators read as one number (`8,000`, `8.000`, `8 000` and `8000` are equal). Digits from any Unicode script count (Arabic-Indic, full-width, Devanagari). URLs, phone-number shapes, and the emergency numbers 911, 112, 999, 119 and 988 are ignored: they are locale facts, owned by [L10N-009](13-localization.md) and checked against each country's official source.

Activity cards (when `activity-cards-i18n/` exists):

- Number of steps; the image step numbers in order; variation kinds (a missing kind fails; a changed order fails); safety flags in order; supervision level; number of safety lines.

### Failure policy

- A **new** mismatch fails: a mismatch in a file not in the baseline, or a mismatch not recorded for that file. A recorded mismatch passes, and is counted in the output.
- A **translated activity card** has no baseline. Any mismatch fails. A translated card that drops a variation fails the test (verified with a temporary fixture that was then removed).
- Why not fail today: 2,536 translated guides already differ from their English source, so failing would stop the suite on content that is not ours to change in this batch. The baseline keeps the known set visible and blocks any new drift.

### Baseline counts (2026-11-15)

| | Count |
| --- | --- |
| Translated guide files (189 locales) | 11,373 |
| Files with no structural mismatch | 8,836 |
| Files with at least one recorded mismatch | 2,537 (2,536 translations and 1 orphan) |
| Recorded mismatch entries | 4,220 |

Entries by field (one entry per file per field):

| Field | Entries | What it usually means |
| --- | --- | --- |
| `crisisRoute` | 593 | **Safety. See below.** The English guide sets `crisisRoute: true`; the translation has no key, so the crisis-safe route is not shown. |
| `digits` | 1,670 | Numbers differ: a dropped year, a changed count or a converted date. Helpline numbers are excluded (above). Needs a reviewer. |
| `links` | 749 | The translation has a different number of links. |
| `sources` | 362 | Source URLs differ or are missing. |
| `frontmatter.keys` | 619 | Keys missing or extra (mostly `crisisRoute`). |
| `related` | 180 | The `related` list differs from English. |
| `lists` | 46 | A list has a different number of items or type. |
| `source` | 1 | Orphan: `guides-i18n/ie/activities/.tmp-sensory.md` has no English guide. It is a leftover temporary file in the content tree. See below. |
| `headings` | 0 | Every heading level and order matches. |

Activity cards: 0 translated (folder not present). The card check is ready and tested, and is skipped until the folder exists.

### What needs a human

1. **Crisis route missing in 593 translated pages (safety, P0).** Four English guides set `crisisRoute: true`: `reminiscence` (189 locales lack the key), `caregiver-self-care` (189), `reminiscence-questions` (140) and `after-dementia-diagnosis` (75). Their translations do not carry the flag, so the crisis-safe route (WEB-061, TSA-027) is not shown there. Fixing this changes content (adding the key to the translations), so it was not done here. The fix is a one-line frontmatter change per file, after a reviewer confirms the local crisis route (L10N-009).
2. **Translated digits and links (1,670 and 749 entries).** Each one needs a reviewer to say whether the change is a locale conversion or an error.
3. **Orphan `guides-i18n/ie/activities/.tmp-sensory.md`.** It is tracked since the original import, has a dot prefix, and has no English guide. Decide whether to delete it. It was left in place.
4. **Missing translations of activity cards (L10N-011).** Nothing in `activity-cards-i18n/` yet, so the card check runs on no data.

## Check 2: no old brand name in launched content (L10N-008)

| File | What it is |
| --- | --- |
| `site/src/lib/brand-name.ts` | Pattern, scope and allowlist. |
| `site/src/lib/brand-name.test.ts` | Unit tests for the pattern, and the scan with the allowlist. |

- **Pattern.** "Golden Moments" in any case, with whitespace, a hyphen or `%20` between the words, across a line break, and in reverse order (a translation may reverse it). The domain `dementiaactivities.games`, with or without `www`. Ordinary words such as "goldenrod" or "golden hour" do not match.
- **Scope.** `site/src/` (content, UI dictionaries including the games' strings, pages, components, lib), `site/public/`, `lib/l10n/arb/` (the app's ARB strings), `metadata/` (store metadata), `docs/store-description/`, and the redirect Workers and `site/wrangler.jsonc`. It does not scan strategy, plan, release or changelog documents, nor Dart code, nor image pixels.
- **Allowlist.** Each entry has an exact hit count, a kind and a reason. Kinds: `record` (a history note), `redirect` (Worker or config for the old domain), `store-url` (the App Store link path), and `native-review` (translated copy that needs a native reviewer, left unedited). A new hit in an allowlisted file still fails.

### Hits and what was done

| Where | Hits | Kind | Action |
| --- | --- | --- | --- |
| `site/src/pages/{app-privacy,privacy-choices,safety,support,terms}.astro`: mailto subject lines | 7 | English source, user-facing | **Fixed**: `Golden%20Moments` changed to `Creative%20Activities`. |
| `docs/store-description/*.md` (17 files) | 17 | record | None: each says the old name was used before the 2026-11-13 rename. |
| `site/redirect-www/*`, `site/redirect-www-creative/wrangler.jsonc`, `site/wrangler.jsonc` | 5 | redirect | None: needed while the old domain redirects or serves a site. |
| `site/src/lib/site.ts` (App Store link path `dementia-games-golden-moments/id6749312459`) | 1 | store-url | None: Apple resolves the link by app ID. |
| `site/src/content/guides-i18n/{an,co,cu,ee,es,fi,fr,id,it,jv,ms,nl,tw,uk}/activities/...` | 14 | native-review | None. Each summary shows the old name split across a line break. A translated product name needs a native reviewer. |
| `site/src/i18n/ui/ff.json` (Fula default image alt text) | 1 | native-review | None. Reversed order: "Moments Golden". |

ARB files, store metadata under `metadata/`, and the games' UI strings had no hits.

### What needs a human

1. **Native reviewer for the 15 translated hits** (14 guide summaries, `ff.json`). Replace the old name with the translated product name or the English name, as the reviewer decides.
2. **Is `dementiaactivities.games` still a live, separate site?** `site/wrangler.jsonc` says the older "dementia-activities-games" site "keeps dementiaactivities.games", and `site/redirect-www-creative/wrangler.jsonc` says it "is a separate product". The brief treats it as the old domain. Decide whether it redirects to creativeactivities.org or stays separate, and fix the comments to match.
3. **App Store link slug.** `site/src/lib/site.ts` keeps the old slug. The app's listing name in `metadata/app-store.en-US.json` is "Creative Activities Together". Confirm the live listing name in App Store Connect. The link keeps working by app ID either way.
4. **Outside launched scope, not edited:** `docs/strategy/web-seo.md`, `docs/strategy/link-building.md`, `docs/strategy/us-aso.md`, `docs/strategy/category-leader.md`, `docs/strategy/keyword-research.csv`, `docs/plan/*`, `docs/legal/app-review-gates.md`, `docs/release/*`, `assets/screenshots/en-US/` (including the image prompts and the relabel record), `idea.md`, `WORKBOARD.md`, `README.md`, `AGENTS.md` and `TEST_SUMMARY.md` (root). Strategy drafts can be updated; sent outreach stays as sent. The screenshot images may still show the old label in pixels; the relabel script handled the frames listed in its manifest, but no text check covers image pixels.
5. **App internals.** `lib/shared/native/gm_native.dart` and some Dart tests use the channel name `golden_moments/native`. It is an internal identifier, not copy. Renaming it is an engineering choice, not part of this check.

## Evidence

- `pnpm exec vitest run` in `site/`: 61 files, 2,584 tests pass, 1 skipped (the activity-card check, skipped until `activity-cards-i18n/` exists). Run on 2026-11-15 after the changes above.
- `pnpm exec tsc --noEmit -p .` clean after `astro sync`.
