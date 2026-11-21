#!/usr/bin/env node
// SEO-014 orphan check over the built English pages in dist/. Reports every indexable English page that no
// other page links to, and each generic anchor text ("read more", "click here", "learn more") that repeats on a
// page. Exits 1 only with --strict; it is not wired into CI.
//
// Usage (after `astro build`):
//   node scripts/check-orphans.mjs
//   node scripts/check-orphans.mjs --strict
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { findOrphans, isEnglishPage, isIndexable, pageLinks, repeatedGenericAnchors } from '../src/lib/orphans.ts';

const DIST = new URL('../dist/', import.meta.url).pathname;
const strict = process.argv.includes('--strict');

/** Every index.html under dist/, as absolute paths. */
function listPages(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) listPages(full, out);
    else if (name === 'index.html') out.push(full);
  }
  return out;
}

/** `/activity/x/` for `dist/activity/x/index.html`. */
const pathOf = (file) => {
  const rel = file.slice(DIST.length - 1).replace(/index\.html$/, '');
  return rel.startsWith('/') ? rel : `/${rel}`;
};

let files;
try {
  files = listPages(DIST);
} catch {
  console.error('dist/ is missing. Run `astro build` first.');
  process.exit(2);
}

const pages = [];
const outgoing = new Map();
const anchorsByPage = new Map();
for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const path = pathOf(file);
  const { links, anchors } = pageLinks(html, path);
  pages.push({ path, english: isEnglishPage(html), indexable: isIndexable(html) });
  outgoing.set(path, links);
  anchorsByPage.set(path, anchors);
}

const englishIndexable = pages.filter((p) => p.english && p.indexable);
const orphans = findOrphans(pages, outgoing);
const repeated = englishIndexable
  .map((p) => ({ path: p.path, repeats: repeatedGenericAnchors(anchorsByPage.get(p.path) ?? []) }))
  .filter((r) => r.repeats.length > 0);

console.log(`Pages in dist: ${files.length}. Indexable English pages: ${englishIndexable.length}.`);
console.log(`Orphans (no other page links to them): ${orphans.length}`);
for (const path of orphans) console.log(`  ${path}`);
console.log(`Pages repeating a generic anchor: ${repeated.length}`);
for (const { path, repeats } of repeated) {
  for (const { text, count } of repeats) console.log(`  ${path}  "${text}" x${count}`);
}

const failed = orphans.length > 0 || repeated.length > 0;
if (failed && strict) {
  console.error('check:orphans --strict failed.');
  process.exit(1);
}
if (failed) console.log('Not strict: exit 0. Use --strict to fail on these.');
