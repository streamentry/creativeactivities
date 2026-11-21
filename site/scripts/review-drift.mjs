#!/usr/bin/env node
// Reports activity cards whose content changed since their review (PLAT-005).
// Usage: pnpm review:drift [--root <folder>] [--strict]
//   --root    a folder with the same src/content layout; defaults to this site.
//   --strict  exit 1 when a reviewed card's content has changed since review. Older records (no hash) do not fail it.
// Without --strict the report always exits 0.
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { formatDriftReport, reviewDriftReport } from './review-drift-lib.mjs';

const { values } = parseArgs({
  options: { root: { type: 'string' }, strict: { type: 'boolean', default: false } },
  strict: true,
});
const report = await reviewDriftReport({ root: values.root ? resolve(values.root) : undefined });
console.log(formatDriftReport(report));
const changed = report.entries.some((entry) => entry.state === 'changed');
process.exitCode = values.strict && changed ? 1 : 0;
