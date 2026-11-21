#!/usr/bin/env node
// Card version check (PLAT-007). Compares the activity cards on disk with the same cards at a base git
// ref (default origin/main) and fails when a content change (steps, materials, safety, stopNote or
// variations) does not raise the card's version and add a changes entry, or when the version moves
// with no content change. The rule is in src/lib/card-versions.ts.
// Usage: node scripts/check-card-versions.mjs [--base <ref>]
// Reads the base files with `git show <ref>:<path>`; the current side is the working tree.
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { checkCardVersions } from '../src/lib/card-versions.ts';
import { splitFrontmatter } from '../src/lib/yaml-subset.ts';

const here = dirname(fileURLToPath(import.meta.url));
const SITE = resolve(here, '..');
export const CARDS = 'src/content/activity-cards';

function git(args) {
  return execFileSync('git', args, { cwd: SITE, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
}

/** Reads the cards at a git ref. Paths are relative to the site folder, the git working directory, so no repository prefix is needed. */
export function readBaseCards(ref) {
  // ls-tree and `<ref>:./path` both resolve paths from the working directory (the site folder).
  const files = git(['ls-tree', '--name-only', ref, '--', `${CARDS}/`])
    .split('\n')
    .filter((path) => path.endsWith('.md'));
  const cards = new Map();
  for (const path of files) {
    const id = path.slice(CARDS.length + 1, -3);
    cards.set(id, splitFrontmatter(git(['show', `${ref}:./${path}`])).frontmatter);
  }
  return cards;
}

/** Reads the cards in the working tree, keyed by card id. */
export function readCurrentCards() {
  const dir = resolve(SITE, CARDS);
  const cards = new Map();
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.md')).sort()) {
    cards.set(file.slice(0, -3), splitFrontmatter(readFileSync(resolve(dir, file), 'utf8')).frontmatter);
  }
  return cards;
}

function argValue(args, name, fallback) {
  const at = args.indexOf(name);
  return at >= 0 ? args[at + 1] : fallback;
}

function main(args) {
  const ref = argValue(args, '--base', 'origin/main');
  try {
    git(['rev-parse', '--verify', '--quiet', `${ref}^{commit}`]);
  } catch {
    console.error(`check-card-versions: base ref ${ref} is not available. Fetch it, or pass --base <ref>.`);
    process.exit(2);
  }
  const report = checkCardVersions(readBaseCards(ref), readCurrentCards());
  for (const problem of report.problems) console.error(`${problem.id}: ${problem.message}`);
  const summary = `check-card-versions against ${ref}: ${contentSummary(report)}`;
  if (report.problems.length > 0) {
    console.error(`${summary}. ${report.problems.length} problem(s).`);
    process.exit(1);
  }
  console.log(`${summary}. OK.`);
}

function contentSummary(report) {
  return `${report.contentChanges} card(s) with content changes, ${report.bumps} with a version bump, ${report.added.length} added, ${report.removed.length} removed`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2));
}
