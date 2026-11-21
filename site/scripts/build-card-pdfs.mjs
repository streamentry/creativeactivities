#!/usr/bin/env node
// Printable activity cards as PDF (PLAT-019, CNT-007). For every activity card in dist/activity/<slug>/, renders the page
// with the print stylesheet (the same rendering check:print checks) to one PDF on A4 and one on US Letter, tagged, with
// an outline. Each PDF is one two-sided sheet: two pages.
//
// The PDFs are NOT part of the site. They are written to an output folder outside dist/ (default site/.pdf-out/,
// git-ignored), are not copied into dist/, not linked from any page and not served. Publishing them needs the hosting
// decision: the site is near the host's 20,000-file limit (docs/engineering/hosting-capacity.md).
//
// Usage: node scripts/build-card-pdfs.mjs                      (run `pnpm build` first; `pnpm pdf:cards`)
//        node scripts/build-card-pdfs.mjs --out=<folder>       (default: site/.pdf-out, must be outside dist/)
//        node scripts/build-card-pdfs.mjs --base=http://127.0.0.1:4345
// Not run in CI. Exits 1 if a PDF is over the size budget or is not two pages.

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { serveDist } from './serve-dist.mjs';
import {
  CARD_PDF_BUDGET_BYTES,
  CARD_PDF_BUDGET_KB,
  CARD_PDF_SHEETS,
  PAPER,
  cardPdfName,
  isInsideFolder,
  overBudget,
  pdfFlags,
  pdfPages,
  sizeTable,
} from './card-pdf-lib.mjs';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const CARDS_DIR = new URL('../src/content/activity-cards/', import.meta.url);
const DEFAULT_OUT = fileURLToPath(new URL('../.pdf-out/', import.meta.url));

function argValue(name) {
  return process.argv.find((a) => a.startsWith(`${name}=`))?.slice(name.length + 1);
}

/** The card slugs that have a built page, in alphabetical order (the same set check-print.mjs checks). */
function builtCardSlugs() {
  const cardIds = readdirSync(CARDS_DIR).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3));
  return cardIds.filter((slug) => existsSync(join(DIST, 'activity', slug, 'index.html'))).sort();
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function printTable(rows) {
  console.log('\nSize (KB)        count    min    median    max');
  for (const row of rows) {
    if (!row.table) continue;
    const t = row.table;
    console.log(`${row.label.padEnd(16)} ${String(t.count).padStart(5)} ${t.minKB.toFixed(1).padStart(6)} ${t.medianKB.toFixed(1).padStart(9)} ${t.maxKB.toFixed(1).padStart(7)}`);
  }
}

async function main() {
  const started = Date.now();
  if (!existsSync(join(DIST, 'index.html'))) fail('dist/ is missing. Run `pnpm build` first.');

  const out = resolve(argValue('--out') ?? DEFAULT_OUT);
  if (isInsideFolder(out, resolve(DIST))) fail(`--out must be outside dist/ (got ${out}). The PDFs are not published.`);

  const slugs = builtCardSlugs();
  if (slugs.length === 0) fail('No activity card pages found under dist/activity. Run `pnpm build` first.');

  const given = argValue('--base');
  const server = given ? null : serveDist(DIST);
  if (server) await new Promise((done) => server.listen(0, '127.0.0.1', done));
  const base = given ?? `http://127.0.0.1:${server.address().port}`;

  mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const failures = [];
  const files = [];
  try {
    const context = await browser.newContext({ bypassCSP: true });
    for (const slug of slugs) {
      const page = await context.newPage();
      await page.goto(`${base}/activity/${slug}/`, { waitUntil: 'networkidle' });
      await page.emulateMedia({ media: 'print' });
      for (const { format } of PAPER) {
        const name = cardPdfName(slug, format);
        // Same options as check-print (no backgrounds, as a printer prints it), plus tags and bookmarks.
        const pdf = await page.pdf({ format, printBackground: false, tagged: true, outline: true });
        writeFileSync(join(out, name), pdf);
        const sheets = pdfPages(pdf);
        const flags = pdfFlags(pdf);
        files.push({ name, format, slug, bytes: pdf.length, sheets, ...flags });
        if (sheets !== CARD_PDF_SHEETS) failures.push(`${name}: ${sheets} pages, expected ${CARD_PDF_SHEETS} (one two-sided sheet)`);
      }
      await page.close();
      console.log(`${slug.padEnd(42)} A4 and Letter written`);
    }
  } finally {
    await browser.close();
    server?.close();
  }

  const over = overBudget(files);
  for (const f of over) failures.push(`${f.name}: ${f.kb} KB is over the ${CARD_PDF_BUDGET_KB} KB budget`);

  const rows = [
    { label: 'A4', table: sizeTable(files.filter((f) => f.format === 'A4')) },
    { label: 'Letter', table: sizeTable(files.filter((f) => f.format === 'Letter')) },
    { label: 'All', table: sizeTable(files) },
  ];
  printTable(rows);

  const tagged = files.filter((f) => f.tagged).length;
  const outlined = files.filter((f) => f.outline).length;
  const titled = files.filter((f) => f.titled).length;
  console.log(`\nPDFs: ${files.length} (${slugs.length} cards x ${PAPER.length} sizes) in ${out}`);
  console.log(`Tagged: ${tagged} of ${files.length}. With an outline: ${outlined} of ${files.length}. With a title: ${titled} of ${files.length}.`);
  console.log(`Budget: ${CARD_PDF_BUDGET_KB} KB per PDF (${CARD_PDF_BUDGET_BYTES} bytes). PLAT-019 names no number; this is the working budget.`);
  console.log(`Runtime: ${((Date.now() - started) / 1000).toFixed(1)} s`);

  if (failures.length) {
    console.error(`\n${failures.length} problem(s):\n${failures.map((f) => `  - ${f}`).join('\n')}`);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
