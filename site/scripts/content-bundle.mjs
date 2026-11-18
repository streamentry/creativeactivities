#!/usr/bin/env node
// Builds the content bundle (PLAT-035) from the activity cards and writes
// content-bundle/content-bundle.v1.json. Node 24 strips the TypeScript types on import.
// Usage: node scripts/content-bundle.mjs [--generated YYYY-MM-DD] [--check]
//   --generated  the date stamped in the bundle; defaults to the newest `updated` on the cards,
//                so a rebuild with no card changes writes the same bytes.
//   --check      write nothing; exit 1 if the committed file is out of date.
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildContentBundle, formatBundle } from '../src/lib/content-bundle.ts';
import { splitFrontmatter } from '../src/lib/yaml-subset.ts';

const here = dirname(fileURLToPath(import.meta.url));
export const CARDS_DIR = resolve(here, '../src/content/activity-cards');
export const BUNDLE_PATH = resolve(here, '../content-bundle/content-bundle.v1.json');

/** Reads every activity card in a folder: the id is the file name without `.md`, as Astro's glob loader uses. */
export function readCards(dir = CARDS_DIR) {
  return readdirSync(dir)
    .filter((file) => file.endsWith('.md'))
    .sort()
    .map((file) => {
      const { frontmatter } = splitFrontmatter(readFileSync(resolve(dir, file), 'utf8'));
      return { id: file.slice(0, -3), data: frontmatter };
    });
}

/** The newest `updated` date across the cards, as the default generated date. */
export function newestUpdate(cards) {
  return cards.map((c) => String(c.data.updated)).sort().at(-1);
}

/** Builds the bundle from a folder of cards. Pass `generated` to pin the date. */
export function buildBundleFromDir(dir = CARDS_DIR, generated) {
  const cards = readCards(dir);
  return buildContentBundle(cards, { generated: generated ?? newestUpdate(cards) });
}

function argValue(args, name) {
  const at = args.indexOf(name);
  return at >= 0 ? args[at + 1] : undefined;
}

function main(args) {
  const bundle = buildBundleFromDir(CARDS_DIR, argValue(args, '--generated'));
  const text = formatBundle(bundle);
  if (args.includes('--check')) {
    const current = existsSync(BUNDLE_PATH) ? readFileSync(BUNDLE_PATH, 'utf8') : '';
    if (current !== text) {
      console.error('content-bundle: the committed bundle is out of date. Run `pnpm run content:bundle`.');
      process.exit(1);
    }
    console.log(`content-bundle: up to date, ${bundle.activities.length} activities.`);
    return;
  }
  mkdirSync(dirname(BUNDLE_PATH), { recursive: true });
  writeFileSync(BUNDLE_PATH, text);
  console.log(`Wrote ${bundle.activities.length} activities to ${BUNDLE_PATH} (${Buffer.byteLength(text)} bytes).`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2));
}
