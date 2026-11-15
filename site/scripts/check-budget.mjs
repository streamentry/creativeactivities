#!/usr/bin/env node
// Performance budget for dist/ (WEB-074). For every built HTML page, adds up the JavaScript and CSS
// it loads at first paint (linked files, inline blocks, Astro island component and renderer files)
// and compares the gzipped totals with the budgets in rules/web/performance.md:
//   landing (home pages)                 JS 150 kB, CSS 30 kB
//   app pages (finder, games, today)     JS 300 kB, CSS 50 kB
//   microsites (cards, hubs, guides, ...) JS  80 kB, CSS 15 kB
// Images are reported but not budgeted: the rules and DESIGN §7 give no image number yet.
// Exits 1 if any page is over a JS or CSS budget, and prints the heaviest pages either way.
// Usage: node scripts/check-budget.mjs [--top=10]   (run after `pnpm build`)

import { existsSync, readFileSync, statSync, readdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const KB = 1000;
const BUDGET = {
  landing: { js: 150 * KB, css: 30 * KB },
  app: { js: 300 * KB, css: 50 * KB },
  microsite: { js: 80 * KB, css: 15 * KB },
};
const TOP = Number(process.argv.find((a) => a.startsWith('--top='))?.slice(6) ?? 10);

/** Page type from its path under dist/ (locale prefixes such as `de/` are allowed). */
export function classify(relPath) {
  if (/^(?:[a-z]{2,3}(?:-[a-z]{2,4})?\/)?index\.html$/.test(relPath)) return 'landing';
  if (/^(?:[a-z-]{2,7}\/)?(?:activity\/index\.html$|games\/|today\/)/.test(relPath)) return 'app';
  return 'microsite';
}

const LINK_RE = /<(?:script|link|astro-island)\b[^>]*?\b(?:src|href|component-url|renderer-url)="([^"]+\.(?:js|css))"[^>]*>/g;
const INLINE_RE = /<(style|script)\b([^>]*)>([\s\S]*?)<\/\1>/g;

/** Gzipped size of one file, cached so shared chunks are read once. */
function fileGz(cache, absPath) {
  if (!cache.has(absPath)) cache.set(absPath, gzipSync(readFileSync(absPath), { level: 9 }).length);
  return cache.get(absPath);
}

/** Weights of one HTML page: critical JS and CSS (gzipped bytes) and image bytes, with the heaviest files. */
export function pageWeight(html, relPath, cache) {
  const weight = { js: 0, css: 0, img: 0, imgs: [] };
  const seen = new Set();
  for (const [tag, url] of html.matchAll(LINK_RE)) {
    // Print-only stylesheets do not block the screen render, so they are not critical CSS.
    if (/\bmedia="print"/.test(tag)) continue;
    const abs = join(DIST, url.split('?')[0]);
    if (seen.has(abs) || !existsSync(abs)) continue;
    seen.add(abs);
    weight[url.endsWith('.css') ? 'css' : 'js'] += fileGz(cache, abs);
  }
  for (const [, tag, attrs, body] of html.matchAll(INLINE_RE)) {
    if (/application\/ld\+json|type="importmap"/.test(attrs) || !body.trim()) continue;
    const size = gzipSync(body, { level: 9 }).length;
    weight[tag === 'style' ? 'css' : 'js'] += size;
  }
  for (const [, url] of html.matchAll(/<img\b[^>]*?\bsrc="(\/[^"]+)"/g)) {
    const abs = join(DIST, url.split('?')[0]);
    if (!existsSync(abs) || seen.has(abs)) continue;
    seen.add(abs);
    const bytes = statSync(abs).size;
    weight.img += bytes;
    weight.imgs.push({ url, bytes });
  }
  weight.imgs.sort((a, b) => b.bytes - a.bytes);
  return { path: relPath, type: classify(relPath), ...weight };
}

/** Every index.html under dist/, as paths relative to dist/. */
function htmlPages(dir = DIST, out = []) {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) htmlPages(abs, out);
    else if (name === 'index.html' || name === '404.html') out.push(relative(DIST, abs).split(sep).join('/'));
  }
  return out;
}

/** Budget violations for one page weight, as readable strings. */
export function overBudget(page) {
  const budget = BUDGET[page.type];
  const problems = [];
  if (page.js > budget.js) problems.push(`JS ${kb(page.js)} kB > ${kb(budget.js)} kB`);
  if (page.css > budget.css) problems.push(`CSS ${kb(page.css)} kB > ${kb(budget.css)} kB`);
  return problems;
}

const kb = (bytes) => (bytes / KB).toFixed(1);

function main() {
  if (!existsSync(join(DIST, 'index.html'))) {
    console.error('dist/ is missing. Run `pnpm build` first.');
    process.exit(1);
  }
  const cache = new Map();
  const pages = htmlPages().map((rel) => pageWeight(readFileSync(join(DIST, rel), 'utf8'), rel, cache));
  const failing = pages.map((p) => ({ page: p, problems: overBudget(p) })).filter((r) => r.problems.length);

  for (const type of Object.keys(BUDGET)) {
    const group = pages.filter((p) => p.type === type);
    const bad = failing.filter((f) => f.page.type === type).length;
    const worst = group.reduce((m, p) => Math.max(m, p.js), 0);
    console.log(`${type.padEnd(10)} ${String(group.length).padStart(6)} pages  budget JS ${BUDGET[type].js / KB} kB, CSS ${BUDGET[type].css / KB} kB  over budget: ${bad}  largest JS ${kb(worst)} kB`);
  }
  console.log(`\nHeaviest pages by critical JS (gzipped), top ${TOP}:`);
  const heaviest = [...pages].sort((a, b) => b.js + b.css - (a.js + a.css)).slice(0, TOP);
  for (const p of heaviest) {
    console.log(`  ${p.path.padEnd(48)} ${p.type.padEnd(10)} JS ${kb(p.js).padStart(7)} kB  CSS ${kb(p.css).padStart(6)} kB  images ${kb(p.img).padStart(7)} kB (not budgeted)`);
  }
  if (failing.length) {
    console.log(`\nOver budget: ${failing.length} page(s). First 20:`);
    for (const f of failing.slice(0, 20)) console.log(`  ${f.page.path}: ${f.problems.join('; ')}`);
  }
  console.log(`\nChecked ${pages.length} pages: ${failing.length} over budget.`);
  process.exit(failing.length ? 1 : 0);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
