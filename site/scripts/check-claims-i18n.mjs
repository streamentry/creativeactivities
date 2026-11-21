#!/usr/bin/env node
// TSA-028: draft claims check for translated guides. Report only: it prints every
// hit of the unreviewed term list in src/data/claims-i18n.json, per language, and
// exits 0. `--strict` exits 1 when any hit exists (for later, once a reviewer signs
// the terms). A malformed data file exits 1 in both modes.
// Usage: node scripts/check-claims-i18n.mjs [--strict]
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findTermHits, validateClaimTerms } from '../src/lib/claims-i18n.ts';

const here = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(here, '../src/data/claims-i18n.json');
const GUIDES = resolve(here, '../src/content/guides-i18n');

function walkMarkdown(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkMarkdown(path));
    else if (entry.name.endsWith('.md')) out.push(path);
  }
  return out.sort();
}

function scanLanguage(data, lang, explainers) {
  const root = join(GUIDES, lang);
  if (!existsSync(root)) return { lang, files: 0, hits: [] };
  const files = walkMarkdown(root);
  const hits = [];
  for (const file of files) {
    const rel = relative(root, file).split('\\').join('/');
    const text = readFileSync(file, 'utf8');
    for (const hit of findTermHits(text, lang, data.entries)) {
      hits.push({ ...hit, file: `${lang}/${rel}`, explainer: explainers.has(rel) });
    }
  }
  return { lang, files: files.length, hits };
}

function cellCounts(data) {
  let filled = 0;
  let empty = 0;
  for (const entry of data.entries) {
    for (const lang of data.languages) {
      if (entry.terms[lang]?.forms.length) filled++;
      else empty++;
    }
  }
  return { filled, empty };
}

const strict = process.argv.includes('--strict');
const data = JSON.parse(readFileSync(DATA_PATH, 'utf8'));
const problems = validateClaimTerms(data);
if (problems.length) {
  console.error('check-claims-i18n: the data file is malformed:');
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

const explainers = new Set(data.explainerFiles);
const results = data.languages.map((lang) => scanLanguage(data, lang, explainers));
const { filled, empty } = cellCounts(data);

console.log('Draft, unreviewed: a native reviewer confirms every term (TSA-028).');
console.log(`Terms: ${data.entries.length} entries x ${data.languages.length} languages; cells with a repository basis: ${filled}; empty cells: ${empty}.`);
console.log('');

for (const { lang, files, hits } of results) {
  const withHits = new Set(hits.map((h) => h.file)).size;
  const inExplainers = hits.filter((h) => h.explainer).length;
  console.log(`== ${lang}: ${hits.length} hits in ${withHits} of ${files} files (${inExplainers} in explainer pages)`);
  for (const h of hits) {
    const tag = h.explainer ? ' [explainer]' : '';
    console.log(`  ${h.file}:${h.line}  ${h.id}  "${h.matched}"${tag}`);
  }
  console.log('');
}

const total = results.reduce((n, r) => n + r.hits.length, 0);
console.log('Summary');
for (const { lang, files, hits } of results) {
  console.log(`  ${lang.padEnd(6)} files ${String(files).padStart(3)}  hits ${String(hits.length).padStart(5)}`);
}
console.log(`  total hits: ${total}${strict ? ' (--strict)' : ' (report only, exit 0)'}`);

if (strict && total > 0) process.exit(1);
