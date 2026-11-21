#!/usr/bin/env node
// Duplicate and near-duplicate audit of dist/ (SEO-015). Reads the built
// indexable pages, compares titles, H1s and descriptions exactly, and body
// text by shingle similarity within each language. Writes a full report.
//
// Does not fail the build by default. The threshold is provisional until an
// editor has reviewed a sample of flagged pairs (see docs/specs/global/duplicate-audit.md).
// --strict exits 1 when anything is flagged (near-duplicates need an editor, so it is not in CI).
// --exact exits 1 only on exact duplicate titles, H1s or descriptions; CI runs this (SEO-006, SEO-015).
//
// Usage:
//   node --max-old-space-size=6144 scripts/check-duplicates.mjs
//   node --max-old-space-size=6144 scripts/check-duplicates.mjs --threshold=0.6 --strict
//   ... --report=/path/to/report.txt
//   node --max-old-space-size=6144 scripts/check-duplicates.mjs --patterns
// --patterns (SEO-006) exits 1 when two indexable pages of the same language and
// page type share a title pattern, H1 pattern and subject (see src/lib/title-patterns.ts).
// It skips the near-duplicate scan.
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { exactDuplicates, findNearDuplicates } from '../src/lib/similarity.ts';
import { breadcrumbCurrent, pageTypeOf, patternCollisions } from '../src/lib/title-patterns.ts';

const DIST = new URL('../dist/', import.meta.url).pathname;
const CONTENT = new URL('../src/content/', import.meta.url).pathname;
const SITE = 'https://creativeactivities.org';
const DEFAULT_REPORT = join(tmpdir(), 'creative-activities', 'duplicates-report.txt');
/** Proposed, not chosen. Pairs are reported from 0.3 so the sample review can compare cut-offs. */
const PROPOSED_THRESHOLD = 0.5;
const SCAN_FLOOR = 0.3;
const SAMPLE_PER_BAND = 10;

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    return [k, v];
  }),
);
const threshold = Number(args.threshold ?? PROPOSED_THRESHOLD);
const strict = args.strict === 'true';
const exactOnly = args.exact === 'true';
const patternsOnly = args.patterns === 'true';
const reportPath = args.report ?? DEFAULT_REPORT;
if (!(threshold > SCAN_FLOOR && threshold <= 1)) {
  console.error(`--threshold must be above ${SCAN_FLOOR} and at most 1`);
  process.exit(2);
}

const decode = (s) =>
  s
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

const plain = (html) =>
  decode(
    html
      .replace(/<(script|style|svg|noscript|template)\b[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();

/** Every index.html under dist/, as absolute paths. */
function listPages(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) listPages(full, out);
    else if (name === 'index.html') out.push(full);
  }
  return out;
}

const pathOf = (file) => {
  const rel = file.slice(DIST.length - 1).replace(/index\.html$/, '');
  return rel.startsWith('/') ? rel : `/${rel}`;
};

/** Page type: the first path segment after the language prefix (`home` for the root). */
function pageType(path, lang) {
  const segments = path.split('/').filter(Boolean);
  if (lang !== 'en' && segments.length && segments[0] === lang.toLowerCase()) segments.shift();
  if (segments.length === 0) return 'home';
  return segments.length > 1 ? segments[0] : 'page';
}

/**
 * Title and H1 pattern check (SEO-006). Writes a report and returns the exit
 * code: 1 when any two indexable pages of one language and page type share a
 * title pattern, H1 pattern and subject; 0 otherwise.
 */
function runPatternCheck(pages, stats) {
  const dirs = (dir) => readdirSync(join(CONTENT, dir), { withFileTypes: true });
  const ctx = {
    guideSections: new Set(dirs('guides').filter((d) => d.isDirectory()).map((d) => d.name)),
    hubSlugs: new Set(dirs('hubs').filter((d) => d.name.endsWith('.md')).map((d) => d.name.slice(0, -3))),
  };
  const entries = pages.map((p) => ({
    id: p.path,
    lang: p.lang,
    type: pageTypeOf(p.path, p.lang, ctx),
    title: p.title,
    h1: p.h1,
    subject: p.subject,
  }));
  const skipped = entries.filter((e) => !e.title.trim() || !e.h1.trim()).length;
  const groups = patternCollisions(entries);
  const typeCounts = new Map();
  for (const e of entries) typeCounts.set(e.type, (typeCounts.get(e.type) ?? 0) + 1);
  const groupedPages = groups.reduce((n, g) => n + g.ids.length, 0);

  const reportFile = args.report ?? join(dirname(DEFAULT_REPORT), 'title-pattern-report.txt');
  const lines = [
    'Title and H1 pattern check (SEO-006)',
    `Generated: ${new Date().toISOString()}`,
    `Build: ${DIST}`,
    'Rule: two indexable pages of the same language and page type fail when their title and H1, with the page subject',
    '  (the current breadcrumb) replaced by a placeholder and whitespace and case normalised, are identical AND the subject is identical.',
    'Site suffix " | Creative Activities" is removed from titles first. Pages without a title or H1 are skipped.',
    '',
    `Indexable pages compared: ${entries.length - skipped} (skipped without title or H1: ${skipped}; of ${stats.total} files in dist)`,
    'Pages by type: ' + [...typeCounts.entries()].sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t} ${n}`).join(', '),
    `Collision groups: ${groups.length} (${groupedPages} pages)`,
    '',
  ];
  for (const g of groups) {
    lines.push(`[${g.lang}/${g.type}] x${g.ids.length}  subject "${g.subject}"`);
    lines.push(`    title pattern: ${g.titlePattern}`);
    lines.push(`    H1 pattern:    ${g.h1Pattern}`);
    for (const id of g.ids) lines.push(`    ${id}`);
  }
  mkdirSync(dirname(reportFile), { recursive: true });
  writeFileSync(reportFile, lines.join('\n') + '\n');

  console.log(`Title and H1 pattern check: ${entries.length - skipped} indexable pages; ${groups.length} collision groups (${groupedPages} pages).`);
  console.log(`Pages by type: ${[...typeCounts.entries()].map(([t, n]) => `${t} ${n}`).join(', ')}`);
  for (const g of groups.slice(0, 20)) {
    console.log(`  [${g.lang}/${g.type}] "${g.subject}" x${g.ids.length}: ${g.ids.join(' , ')}`);
  }
  console.log(`Full report: ${reportFile}`);
  if (groups.length > 0) {
    console.error(`--patterns: ${groups.length} collision groups need a fix (same type, title pattern, H1 pattern and subject).`);
    return 1;
  }
  return 0;
}

const started = performance.now();
const files = listPages(DIST);
const stats = { total: files.length, noindex: 0, nonCanonical: 0, indexable: 0, noTitle: 0 };
const pages = [];

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const path = pathOf(file);
  const robots = html.match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? '';
  if (/noindex/i.test(robots)) {
    stats.noindex++;
    continue;
  }
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const ownUrl = `${SITE}${path}`;
  if (canonical && canonical.replace(/\/$/, '') !== ownUrl.replace(/\/$/, '')) {
    stats.nonCanonical++;
    continue;
  }
  const lang = html.match(/<html[^>]*\blang="([^"]+)"/)?.[1] ?? 'und';
  const title = decode(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '').trim();
  const h1 = plain(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '');
  const description = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '').trim();
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? '';
  const body = plain(main);
  const crumb = breadcrumbCurrent(html);
  if (!title) stats.noTitle++;
  stats.indexable++;
  pages.push({
    path,
    lang,
    type: pageType(path, lang),
    title,
    h1,
    description,
    body,
    subject: crumb === undefined ? undefined : decode(crumb),
  });
}

if (patternsOnly) {
  const code = runPatternCheck(pages, stats);
  process.exit(code);
}

const byLang = new Map();
for (const p of pages) byLang.set(p.lang, (byLang.get(p.lang) ?? 0) + 1);

const exact = {
  title: exactDuplicates(pages.map((p) => ({ id: p.path, group: p.lang, value: p.title }))),
  h1: exactDuplicates(pages.map((p) => ({ id: p.path, group: p.lang, value: p.h1 }))),
  description: exactDuplicates(pages.map((p) => ({ id: p.path, group: p.lang, value: p.description }))),
};

const scanStart = performance.now();
const { pairs: scanned, stats: simStats } = findNearDuplicates(
  pages.map((p) => ({ id: p.path, group: p.lang, text: p.body })),
  { threshold: SCAN_FLOOR },
);
const scanMs = Math.round(performance.now() - scanStart);
const flagged = scanned.filter((p) => p.similarity >= threshold);
const pageByPath = new Map(pages.map((p) => [p.path, p]));
const typeOf = (path) => pageByPath.get(path)?.type ?? '?';

const countBy = (list, key) => {
  const m = new Map();
  for (const item of list) m.set(key(item), (m.get(key(item)) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};

const bands = [0.5, 0.7, 0.9].map((t) => ({ t, n: scanned.filter((p) => p.similarity >= t).length }));

const exactCount = exact.title.length + exact.h1.length + exact.description.length;
const lines = [];
const out = (s = '') => lines.push(s);

out('Duplicate and near-duplicate report (SEO-015)');
out(`Generated: ${new Date().toISOString()}`);
out(`Build: ${DIST}`);
out(`Method: normalised text (NFKD, lowercase, punctuation to spaces); body = text inside <main>; 5-word shingles; MinHash 120 hashes; LSH banding; exact Jaccard on candidate pairs. Compared only within the same html lang.`);
out(`Proposed threshold: ${threshold} (provisional; awaits editor sample review, see duplicate-audit.md). Pairs are scanned from ${SCAN_FLOOR}.`);
out(`Run time: scan ${scanMs} ms; total ${Math.round(performance.now() - started)} ms`);
out('');
out('Pages');
out(`  in dist: ${stats.total}`);
out(`  noindex (excluded): ${stats.noindex}`);
out(`  non-canonical (excluded): ${stats.nonCanonical}`);
out(`  indexable and compared: ${stats.indexable}`);
out(`  missing <title>: ${stats.noTitle}`);
out(`  skipped for too little body text: ${simStats.skipped}`);
out('  by language: ' + [...byLang.entries()].sort((a, b) => b[1] - a[1]).map(([l, n]) => `${l} ${n}`).join(', '));
out('');
out('(a) Exact duplicates (same value within a language)');
for (const field of ['title', 'h1', 'description']) {
  out(`  ${field}: ${exact[field].length} groups, ${exact[field].reduce((n, g) => n + g.ids.length, 0)} pages`);
}
out('');
for (const field of ['title', 'h1', 'description']) {
  out(`--- ${field} groups ---`);
  for (const g of exact[field]) {
    out(`[${g.group}] x${g.ids.length}  "${g.value}"`);
    for (const id of g.ids) out(`    ${id}`);
  }
  out('');
}
out('(b) Near-duplicate body pairs');
out(`  pairs at or above ${SCAN_FLOOR}: ${scanned.length}`);
out('  at or above ' + SCAN_FLOOR + ' by language: ' + countBy(scanned, (p) => p.group).map(([l, n]) => `${l} ${n}`).join(', '));
out('  at or above ' + SCAN_FLOOR + ' by page type: ' + countBy(scanned, (p) => `${p.group}/${typeOf(p.a)}`).map(([l, n]) => `${l} ${n}`).join(', '));
out('  at or above ' + SCAN_FLOOR + ' by page type alone: ' + countBy(scanned, (p) => typeOf(p.a)).map(([l, n]) => `${l} ${n}`).join(', '));
for (const b of bands) out(`  pairs at or above ${b.t}: ${b.n}`);
out(`  flagged at proposed threshold ${threshold}: ${flagged.length}`);
out(`  candidate pairs checked: ${simStats.candidates}`);
out('');
out('  flagged by language: ' + countBy(flagged, (p) => p.group).map(([l, n]) => `${l} ${n}`).join(', '));
out('  flagged by page type: ' + countBy(flagged, (p) => `${p.group}/${typeOf(p.a)}`).map(([l, n]) => `${l} ${n}`).join(', '));
out('');
out(`Flagged pairs at ${threshold} (highest first). Each needs a decision: rewrite, merge, or mark as a deliberate variation.`);
for (const p of flagged) {
  out(`  ${p.similarity.toFixed(3)}  [${p.group}]  ${p.a}  <->  ${p.b}`);
  out(`      titles: "${pageByPath.get(p.a)?.title}" | "${pageByPath.get(p.b)?.title}"`);
}
out('');
out(`Sample pairs for editor review (${SAMPLE_PER_BAND} per band, evenly spread across the scanned range)`);
const sampleBands = [[0.3, 0.5], [0.5, 0.7], [0.7, 0.9], [0.9, 1.01]];
for (const [lo, hi] of sampleBands) {
  const inBand = scanned.filter((p) => p.similarity >= lo && p.similarity < hi);
  out(`  band ${lo}-${Math.min(hi, 1)}: ${inBand.length} pairs`);
  const step = Math.max(1, Math.floor(inBand.length / SAMPLE_PER_BAND));
  for (let i = 0; i < inBand.length && i / step < SAMPLE_PER_BAND; i += step) {
    const p = inBand[i];
    out(`    ${p.similarity.toFixed(3)}  [${p.group}]  ${p.a}  <->  ${p.b}`);
  }
}

const report = lines.join('\n') + '\n';
mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, report);

// Summary to the console.
console.log(`Pages: ${stats.total} in dist; ${stats.indexable} indexable and compared (${stats.noindex} noindex, ${stats.nonCanonical} non-canonical excluded).`);
console.log(`Exact duplicates: titles ${exact.title.length} groups, H1s ${exact.h1.length}, descriptions ${exact.description.length}.`);
console.log(`Near-duplicate body pairs: ${flagged.length} at threshold ${threshold} (${scanned.length} at ${SCAN_FLOOR}+). Scan ${scanMs} ms.`);
console.log(`Full report: ${reportPath}`);
if (!existsSync(reportPath)) console.error(`warning: report was not written to ${reportPath}`);

if (exactOnly && exactCount > 0) {
  console.error(`--exact: ${exactCount} exact duplicate groups (titles, H1s or descriptions) need a fix.`);
  process.exit(1);
}
if (strict && (exactCount > 0 || flagged.length > 0)) {
  console.error(`--strict: ${exactCount} exact duplicate groups and ${flagged.length} flagged pairs need a decision.`);
  process.exit(1);
}
