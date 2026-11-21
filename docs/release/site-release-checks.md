# Site release checks

Checklist for the Astro site in `site/`. Run from `site/` after `pnpm run build`. Each recorded run writes a dated JSON file that is kept with the release, not committed unless the release needs it.

## Records

| Check | Command | Record | Source |
| --- | --- | --- | --- |
| Print pass rate per template (MET-020) | `pnpm run check:print -- --record=<file>` | print record: date, commit, cards, pages passed per template | `site/scripts/check-print.mjs` |
| Accessibility per template and page (TSA-001, MET-016) | `pnpm run check:a11y -- --record=<file>` | accessibility record: date, commit, pages checked, violations per template and page | `site/scripts/a11y-check.mjs`, `site/scripts/a11y-record-lib.mjs` |

The accessibility record states that automated checks are necessary but not sufficient. A clean record is not a claim that a page is accessible. The manual checklist and the assistive-technology sessions (TSA-002) are recorded separately.

## Accessibility record format

`--record=<file>` writes:

- `date`, `commit` (from `git rev-parse HEAD`, or `null` outside a git checkout)
- `pagesChecked`, `pagesPassed`
- `templates`: per template, pages checked and passed, axe violation nodes, serious or critical nodes, and keyboard, layout or motion problems
- `violationsByImpact`
- `pages`: per page and variant, each axe rule with its impact and node count, and each non-axe problem
- `note`: the necessary-but-not-sufficient sentence

The command exits 1 on any failing page, with or without `--record`. The record is written first, so a failing run still leaves a file.

## Steps

1. `pnpm run build` in `site/`.
2. `pnpm run check:a11y -- --record=<dated file>` and keep the printout with the record.
3. `pnpm run check:print -- --record=<dated file>`.
4. Attach both files to the release note or the workboard entry. Do not describe a page as accessible on the strength of the scan alone.
