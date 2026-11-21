#!/usr/bin/env node
// Post-build check for dist/: JSON-LD on English pages must match the visible page (SEO-013, SEO-042,
// SEO-043, SEO-047). Checks HowTo steps, FAQ questions and answers, ItemList links, and required or empty
// fields. Prints a summary and every mismatch; exits 1 on any mismatch. Not part of CI.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { LOCALES } from '../src/i18n/locales.ts';
import { checkStructuredData } from '../src/lib/structured-data-check.ts';

const DIST = new URL('../dist/', import.meta.url).pathname;
const SITE = 'https://creativeactivities.org/';
/** Top-level folders that hold a translated language; English pages live outside them. */
const LANGUAGE_FOLDERS = new Set(LOCALES.map((l) => l.prefix).filter(Boolean));

if (!existsSync(DIST)) {
  console.error(`check-structured-data: ${DIST} does not exist; run the build first.`);
  process.exit(1);
}

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return name.endsWith('.html') ? [path] : [];
  });
}

const rel = (file) => relative(DIST, file).split(sep).join('/');
const isEnglish = (file) => !LANGUAGE_FOLDERS.has(rel(file).split('/')[0]);
/** The page's own address: `index.html` maps to its folder URL. */
const pageUrl = (file) => {
  const path = rel(file).replace(/index\.html$/, '');
  return new URL(path, SITE).href;
};

const pages = htmlFiles(DIST).filter(isEnglish).sort();
const typeCounts = new Map();
const mismatches = [];
let checked = 0;

for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const report = checkStructuredData(html, pageUrl(file));
  if (report === undefined) continue;
  checked += 1;
  for (const type of report.types) typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
  for (const problem of report.problems) mismatches.push(`${rel(file)}: ${problem}`);
}

console.log(`English pages scanned: ${pages.length}; pages with JSON-LD: ${checked}`);
console.log('Pages per top-level JSON-LD type:');
for (const [type, count] of [...typeCounts.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${type}: ${count}`);
}
if (mismatches.length > 0) {
  console.log(`\n${mismatches.length} mismatch(es):`);
  for (const line of mismatches) console.log(`  ${line}`);
  process.exit(1);
}
console.log('\nAll structured data matches the visible page.');
