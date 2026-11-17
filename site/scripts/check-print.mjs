#!/usr/bin/env node
// Two-sided print check (WEB-014, WEB-011). For every activity card in dist/activity/<slug>/, prints the page
// to PDF on A4 and on US Letter with the browser's print media and browser defaults (no background colour,
// as a printer prints it), counts the sheets, and checks that the site header and navigation are hidden.
// DESIGN.md §8: the Activity Card is one sheet with two sides: what you need and
// what to do on the front, make it easier / different on the back. Fails if any
// card is not exactly two pages (one sheet, printed both sides) in both sizes.
// Usage: node scripts/check-print.mjs            (serves dist/ on a free local port; run `pnpm build` first)
//        node scripts/check-print.mjs --base=http://127.0.0.1:4345
// First-time browser install: pnpm exec playwright install chromium

import { createServer } from 'node:http';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const FORMATS = ['A4', 'Letter'];
const SIDES = 2;
// The pack builder (WEB-017) tells people how long a pack prints: at most this many pages for the cover and its supply
// list, and for each card. The same numbers are in src/lib/pack.ts; pack.test.ts fails if they differ.
const COVER_PAGES = 2;
const CARD_PAGES = 2;
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon' };

function serveDist(dir) {
  const root = resolve(dir);
  return createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = resolve(join(root, urlPath.endsWith('/') ? `${urlPath}index.html` : urlPath));
    let status = 200;
    if (!file.startsWith(root + sep) || !existsSync(file) || statSync(file).isDirectory()) {
      file = join(root, '404.html');
      status = 404;
    }
    res.writeHead(status, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
    res.end(readFileSync(file));
  });
}

/** Sheets in a PDF: each page object is /Type /Page (not /Pages). */
export function sheetCount(pdf) {
  return (pdf.toString('latin1').match(/\/Type\s*\/Page(?!s)/g) ?? []).length;
}

/** The builder with nothing chosen, once its script has run. */
async function openBuilder(context, base) {
  const page = await context.newPage();
  await page.goto(`${base}/activity/pack/`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.pack-picker input[type="checkbox"]', { timeout: 15000 });
  return page;
}

/** The builder with a pack in the address; waits for the cover that appears once the script has read it. */
async function openPack(context, base, query) {
  const page = await context.newPage();
  await page.goto(`${base}/activity/pack/${query}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.pack-cover--built', { timeout: 15000 });
  await page.emulateMedia({ media: 'print' });
  return page;
}

/** Sheets the whole page prints on, and the cover alone (the cards hidden), on each paper size. */
async function packSheets(page) {
  const counts = {};
  for (const format of FORMATS) {
    const whole = sheetCount(await page.pdf({ format, printBackground: false }));
    await page.evaluate(() => { document.getElementById('pack-cards').hidden = true; });
    const cover = sheetCount(await page.pdf({ format, printBackground: false }));
    await page.evaluate(() => { document.getElementById('pack-cards').hidden = false; });
    counts[format] = { whole, cover };
  }
  return counts;
}

/** Ticks, eight times, the card that makes the supply list longest; returns the address that holds that pack and the list length. */
async function longestSupplyList(context, base) {
  const page = await openBuilder(context, base);
  const result = await page.evaluate(async () => {
    const boxes = [...document.querySelectorAll('.pack-picker input[type="checkbox"]')];
    const lines = () => [...document.querySelectorAll('.pack-checklist li')].filter((li) => !li.textContent.startsWith('No main supplies')).length;
    const tick = async (box) => {
      box.click();
      await new Promise((done) => setTimeout(done, 0));
    };
    for (let step = 0; step < 8; step += 1) {
      let best = null;
      let bestLines = -1;
      for (const box of boxes) {
        if (box.checked) continue;
        await tick(box);
        const length = lines();
        if (length > bestLines) {
          best = box;
          bestLines = length;
        }
        await tick(box);
      }
      await tick(best);
    }
    await new Promise((done) => setTimeout(done, 100));
    return { query: location.search, lines: lines() };
  });
  await page.close();
  return result;
}

async function main() {
  if (!existsSync(join(DIST, 'index.html'))) {
    console.error('dist/ is missing. Run `pnpm build` first.');
    process.exit(1);
  }
  const given = process.argv.find((a) => a.startsWith('--base='))?.slice('--base='.length);
  const server = given ? null : serveDist(DIST);
  if (server) await new Promise((done) => server.listen(0, '127.0.0.1', done));
  const base = given ?? `http://127.0.0.1:${server.address().port}`;
  // Cards only: other pages under /activity/ (the finder's packs, the weekly program) are not activity cards.
  const cardIds = new Set(readdirSync(new URL('../src/content/activity-cards/', import.meta.url)).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)));
  const slugs = readdirSync(join(DIST, 'activity')).filter((name) => cardIds.has(name) && existsSync(join(DIST, 'activity', name, 'index.html')));
  // A build with no cards would pass by checking nothing.
  if (slugs.length === 0) {
    console.error('No activity card pages found under dist/activity. Run `pnpm build` first.');
    server?.close();
    process.exit(1);
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({ bypassCSP: true });
  const failures = [];
  let packChecked = 0;
  try {
    for (const slug of slugs) {
      const page = await context.newPage();
      await page.goto(`${base}/activity/${slug}/`, { waitUntil: 'networkidle' });
      await page.emulateMedia({ media: 'print' });
      const hidden = await page.evaluate(() => {
        const header = document.querySelector('.site-header');
        return !!header && getComputedStyle(header).display === 'none';
      });
      const counts = {};
      for (const format of FORMATS) {
        counts[format] = sheetCount(await page.pdf({ format, printBackground: false }));
      }
      const ok = hidden && FORMATS.every((f) => counts[f] === SIDES);
      if (!ok) failures.push({ slug, counts, hidden });
      console.log(`${slug.padEnd(42)} A4 ${counts.A4}  Letter ${counts.Letter}  navigation hidden ${hidden ? 'yes' : 'NO'}  ${ok ? 'ok' : 'FAIL'}`);
      await page.close();
    }

    // The pack builder: a cover and one card must fit the limits the page states, so "up to N pages" is true.
    const packFailures = [];
    for (const slug of slugs) {
      const page = await openPack(context, base, `?cards=${slug}`);
      const shown = await page.evaluate(() => !!document.querySelector('.pack-cover--built') && document.querySelectorAll('[data-pack-card]:not([hidden])').length === 1);
      const counts = await packSheets(page);
      for (const format of FORMATS) counts[format].card = counts[format].whole - counts[format].cover;
      const ok = shown && FORMATS.every((f) => counts[f].cover <= COVER_PAGES && counts[f].card <= CARD_PAGES);
      if (!ok) packFailures.push({ slug, counts, shown });
      console.log(`pack: ${slug.padEnd(42)} cover A4 ${counts.A4.cover} Letter ${counts.Letter.cover}  card A4 ${counts.A4.card} Letter ${counts.Letter.card}  ${ok ? 'ok' : 'FAIL'}`);
      await page.close();
    }

    // The cover grows with the supply list, so the worst case is the pack whose list is longest. The page makes the list,
    // so ask the page: starting from nothing, eight times, tick the card that makes the list longest.
    const search = await longestSupplyList(context, base);
    {
      const page = await openPack(context, base, search.query);
      const shownCards = await page.evaluate(() => document.querySelectorAll('[data-pack-card]:not([hidden])').length);
      const counts = await packSheets(page);
      const limit = COVER_PAGES + CARD_PAGES * 8;
      const ok = shownCards === 8 && FORMATS.every((f) => counts[f].cover <= COVER_PAGES && counts[f].whole <= limit);
      if (!ok) packFailures.push({ slug: 'the longest supply list', counts, shownCards });
      console.log(`pack: the longest supply list found, ${search.lines} lines for 8 cards: cover A4 ${counts.A4.cover} Letter ${counts.Letter.cover}, whole pack A4 ${counts.A4.whole} Letter ${counts.Letter.whole} (limit ${limit})  ${ok ? 'ok' : 'FAIL'}`);
      await page.close();
    }

    // The version and the order: three cards that all have the "bedside" version, named out of the page's alphabetical
    // order, must show in that order, each with only that version.
    {
      const probe = await openBuilder(context, base);
      const bedside = await probe.evaluate(() => [...document.querySelectorAll('[data-pack-card]')].filter((c) => c.querySelector('[data-variation="bedside"]')).map((c) => c.dataset.packCard));
      await probe.close();
      const three = bedside.slice(0, 3).reverse();
      const page = await openPack(context, base, `?cards=${three.join(',')}&variation=bedside`);
      const seen = await page.evaluate(() => [...document.querySelectorAll('[data-pack-card]:not([hidden])')].map((c) => ({ id: c.dataset.packCard, versions: [...c.querySelectorAll('[data-variation]:not([hidden])')].map((v) => v.dataset.variation) })));
      const ok = three.length === 3 && seen.map((c) => c.id).join() === three.join() && seen.every((c) => c.versions.join() === 'bedside');
      if (!ok) packFailures.push({ slug: 'bedside order', three, seen });
      console.log(`pack: three cards in the order named, all in the bedside version: ${seen.map((c) => `${c.id} [${c.versions.join(',')}]`).join(' ')}  ${ok ? 'ok' : 'FAIL'}`);
      await page.close();
    }
    failures.push(...packFailures);
    packChecked = slugs.length + 2;
  } finally {
    await browser.close();
    server?.close();
  }
  console.log(`\nChecked ${slugs.length} activity cards on A4 and US Letter: ${failures.length} not one two-sided sheet or over the pack builder's page limits (${packChecked} pack builds checked).`);
  process.exit(failures.length ? 1 : 0);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
