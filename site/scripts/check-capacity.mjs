#!/usr/bin/env node
// Hosting capacity check (PLAT-015): counts what dist/ holds and compares it with the limits Workers Static Assets
// documents, then projects ten times the pages. Warns at 80% of the file limit and fails at 98% (or on a file over 25 MiB),
// so a release that could not deploy is found by the build and not by the deploy.
// The repository does not say which Cloudflare plan the account is on, so the Free limit is assumed.
// Usage: node scripts/check-capacity.mjs [--plan=paid]     (run after `pnpm build`)
// The numbers and the options for what to do next are in docs/engineering/hosting-capacity.md.

import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assess, describe, summarize } from './capacity-lib.mjs';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));

/** Every file under a folder, as `{ path, bytes }` with paths relative to it and "/" separators. */
export function listFiles(root) {
  const entries = [];
  const walk = (dir) => {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, item.name);
      if (item.isDirectory()) walk(full);
      else if (item.isFile()) entries.push({ path: relative(root, full).split(sep).join('/'), bytes: statSync(full).size });
    }
  };
  walk(root);
  return entries;
}

function main() {
  if (!existsSync(join(DIST, 'index.html'))) {
    console.error('dist/ is missing. Run `pnpm build` first.');
    process.exit(1);
  }
  const plan = process.argv.includes('--plan=paid') ? 'paid' : 'free';
  const summary = summarize(listFiles(DIST));
  const result = assess(summary, { plan });
  for (const line of describe(summary, result)) console.log(line);
  const verdict = { ok: 'ok', warn: 'WARNING: the file count is close to the limit; decide the next step (docs/engineering/hosting-capacity.md).', fail: 'FAIL: this build may not deploy.' }[result.level];
  console.log(verdict);
  process.exit(result.level === 'fail' ? 1 : 0);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
