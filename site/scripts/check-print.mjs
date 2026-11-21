#!/usr/bin/env node
// Two-sided print check (WEB-014, WEB-011). For every activity card in dist/activity/<slug>/, prints the page
// to PDF on A4 and on US Letter with the browser's print media and browser defaults (no background colour,
// as a printer prints it), counts the sheets, and checks that the site header and navigation are hidden.
// DESIGN.md §8: the Activity Card is one sheet with two sides: what you need and
// what to do on the front, make it easier / different on the back. Fails if any
// card is not exactly two pages (one sheet, printed both sides) in both sizes.
// Usage: node scripts/check-print.mjs            (serves dist/ on a free local port; run `pnpm build` first)
//        node scripts/check-print.mjs --base=http://127.0.0.1:4345
//        node scripts/check-print.mjs --record=<file.json>   (also writes the pass rate per template, MET-020)
// Not run in CI. The record is written per release by hand and is not committed unless the release needs it.
// First-time browser install: pnpm exec playwright install chromium

import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
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
// Print templates (PLAT-039, MET-020): every template with a paper version prints within the pages it declares, on A4 and on
// US Letter, and its steps are as large as the standard says. The limits are what each template printed on when they were
// last read (2026-11-17), so a layout that grows fails here and has to be looked at.
/** Step text in print, in points: WEB-014 asks 12 for a card and a pack, WEB-018 asks 18 for large print (both proposals). */
export const STEP_PT = { card: 12, pack: 12, largePrint: 18 };
const LARGE_PRINT_PAGES = 5;
/** A cover and two pages for each of five cards. */
const FIXED_PACK_PAGES = 12;
/** The weekly programme (WEB-045) prints as one page per week: one sheet, on both paper sizes. */
const WEEKLY_PROGRAM_PAGES = 1;
/** A weekly plan (WEB-031) prints one sheet per path week and one blank week; each sheet is one page, so the total is the sheet count. */
const PATH_WEEKLY_PLAN_SHEETS = 5;
/** The referrer handout (WEB-048) is one sheet: one page on each paper size. */
const PROFESSIONALS_HANDOUT_PAGES = 1;
/** CNT-014 (adult variant): the care-settings page has three staff summaries, a family note and a permission template. */
const CARE_SHEETS = 5;
/**
 * A game's paper version is one page (WEB-052), except the sets of cards to cut out. Bingo cards are drawn at random each time
 * the page loads, so its set runs from 8 to 9 pages and the limit leaves one more.
 */
// Scrapbook: one photo a page, so the limit is the most photos a book takes (12). The check opens the default
// state, which has no photos and prints one page; the 12 is the page ceiling for a full book.
export const GAME_SHEET_PAGES = { 'conversation-cards': 6, 'picture-bingo': 10, 'coloring-wall': 10, scrapbook: 12 };
// A four-week path (WEB-032) prints on at most this many pages (two pages are one sheet printed on both sides), with its
// buttons and counts left off the paper and its addresses and version line on it.
const PATH_PAGES = 2;
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

/** The smallest printed size, in points, of the steps on a page, or null when it shows none. */
async function stepSize(page) {
  return page.evaluate(() => {
    const sizes = [...document.querySelectorAll('.activity-steps li')]
      .filter((el) => getComputedStyle(el).display !== 'none' && el.offsetParent !== null)
      .map((el) => parseFloat(getComputedStyle(el).fontSize) * 0.75);
    return sizes.length ? Math.min(...sizes) : null;
  });
}

/** The text of each step on a page, as printed: the words that must not change between the standard and the large-print edition. */
async function stepTexts(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('.activity-steps li')]
      .filter((el) => getComputedStyle(el).display !== 'none' && el.offsetParent !== null)
      // Compare the words that print: on-screen controls in a step (the Listen button, WEB-020) are left out.
      .map((el) => {
        const copy = el.cloneNode(true);
        for (const control of copy.querySelectorAll('.no-print, button, astro-island')) control.remove();
        return copy.textContent.replace(/\s+/g, ' ').trim();
      }),
  );
}

/** Pages a page prints on, on each paper size. */
async function printedPages(page) {
  const counts = {};
  for (const format of FORMATS) counts[format] = sheetCount(await page.pdf({ format, printBackground: false }));
  return counts;
}

/** The games that have a paper version, from the table in src/data/game-print.ts: `{ slug, kind }` for kind page or island. */
/** How many `.sheet` elements are shown with some height when the page is printed (call after emulating print). */
async function visibleSheets(page) {
  return page.evaluate(() => [...document.querySelectorAll('.sheet')].filter((e) => getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().height > 100).length);
}

/**
 * The per-release record of the print pass rate (MET-020): a template passes when all its pages pass. Pure: the caller
 * passes the date, the commit and the counts, so the same counts always give the same record.
 * @param {{ date: string, commit: string, cards: number, templates: Map<string, { ok: number, total: number }> }} run
 */
export function printRecord({ date, commit, cards, templates }) {
  const types = [...templates];
  const passing = types.filter(([, row]) => row.ok === row.total).length;
  return {
    schema: 'creative-activities/print-record',
    version: 1,
    date,
    commit,
    cards,
    templates: Object.fromEntries(types.map(([type, row]) => [type, { passed: row.ok, checked: row.total }])),
    templatesPassing: passing,
    templateTypes: types.length,
    passRate: types.length ? Math.round((100 * passing) / types.length) : 0,
  };
}

/** The commit being checked, or `unknown` outside a git checkout. */
function currentCommit() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: fileURLToPath(new URL('..', import.meta.url)), encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

export function gamesWithPaper() {
  const source = readFileSync(new URL('../src/data/game-print.ts', import.meta.url), 'utf8');
  return [...source.matchAll(/^\s*'?([a-z-]+)'?:\s*\{\s*kind:\s*'(page|island|none)'/gm)].filter((m) => m[2] !== 'none').map((m) => ({ slug: m[1], kind: m[2] }));
}

/**
 * CNT-014: each printable sheet on the care-settings page is one page on each paper size. The check shows one sheet at a
 * time, hiding the page heading, the lead text, the plans and the other sheets, and counts the pages of that sheet alone.
 */
async function careSheets(context, base, failures, record) {
  const page = await context.newPage();
  await page.goto(`${base}/for-organizations/care-settings/`, { waitUntil: 'networkidle' });
  await page.emulateMedia({ media: 'print' });
  const total = await page.locator('[data-care-sheet]').count();
  if (total !== CARE_SHEETS) {
    failures.push({ slug: 'care settings sheets', total, expected: CARE_SHEETS });
    record('care-settings sheet', false);
    console.log(`care-settings: ${total} sheets, expected ${CARE_SHEETS}  FAIL`);
  }
  for (let index = 0; index < total; index += 1) {
    await page.evaluate((keep) => {
      const root = document.querySelector('.care-settings');
      const target = root.querySelectorAll('[data-care-sheet]')[keep];
      document.querySelector('.page-head')?.setAttribute('data-print-skip', '');
      for (const el of root.querySelectorAll('*')) {
        const related = el === target || target.contains(el) || el.contains(target);
        el.toggleAttribute('data-print-skip', !related);
      }
      if (!document.getElementById('care-only-sheet')) {
        const style = document.createElement('style');
        style.id = 'care-only-sheet';
        style.textContent = '[data-print-skip] { display: none !important; }';
        document.head.append(style);
      }
    }, index);
    const shown = await page.evaluate(() => {
      const target = document.querySelectorAll('[data-care-sheet]:not([data-print-skip])');
      return target.length === 1 && target[0].getBoundingClientRect().height > 100;
    });
    const counts = {};
    for (const format of FORMATS) counts[format] = sheetCount(await page.pdf({ format, printBackground: false }));
    const ok = shown && FORMATS.every((f) => counts[f] === CARE_SHEET_PAGES);
    if (!ok) failures.push({ slug: `care settings sheet ${index + 1}`, counts, shown });
    record('care-settings sheet', ok);
    console.log(`care-settings sheet ${index + 1}: A4 ${counts.A4}  Letter ${counts.Letter}  ${ok ? 'ok' : 'FAIL'}`);
  }
  await page.close();
}
const CARE_SHEET_PAGES = 1;

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
  let pathsChecked = 0;
  // The pass rate per template type (MET-020): how many pages of each type passed, of how many were checked.
  const templates = new Map();
  /** The steps each card prints, to compare with its large-print edition: the layout changes and the words do not (WEB-018). */
  const cardSteps = new Map();
  const record = (type, ok) => {
    const row = templates.get(type) ?? { ok: 0, total: 0 };
    row.total += 1;
    if (ok) row.ok += 1;
    templates.set(type, row);
  };
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
      const stepPt = await stepSize(page);
      cardSteps.set(slug, await stepTexts(page));
      const ok = hidden && FORMATS.every((f) => counts[f] === SIDES) && stepPt !== null && stepPt >= STEP_PT.card;
      if (!ok) failures.push({ slug, counts, hidden, stepPt });
      record('card', ok);
      console.log(`${slug.padEnd(42)} A4 ${counts.A4}  Letter ${counts.Letter}  navigation hidden ${hidden ? 'yes' : 'NO'}  steps ${stepPt?.toFixed(0) ?? 'none'} pt  ${ok ? 'ok' : 'FAIL'}`);
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
      record('pack builder', ok);
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
      record('pack builder', ok);
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
      record('pack builder', ok);
      console.log(`pack: three cards in the order named, all in the bedside version: ${seen.map((c) => `${c.id} [${c.versions.join(',')}]`).join(' ')}  ${ok ? 'ok' : 'FAIL'}`);
      await page.close();
    }
    failures.push(...packFailures);
    packChecked = slugs.length + 2;

    // The paths: each prints on two pages at most, with the start and skip buttons and the counts left off the paper.
    const pathIds = existsSync(join(DIST, 'paths'))
      ? readdirSync(join(DIST, 'paths')).filter((name) => existsSync(join(DIST, 'paths', name, 'index.html')))
      : [];
    for (const id of pathIds) {
      const page = await context.newPage();
      await page.goto(`${base}/paths/${id}/`, { waitUntil: 'networkidle' });
      await page.waitForSelector('.path-plan[data-ready]', { timeout: 15000 });
      await page.emulateMedia({ media: 'print' });
      // Global print CSS hides every .btn, so look at what the path itself marks: the parts with no-print (the summary,
      // the counts, the button rows) must be off the paper, and the parts with print-only (addresses, version) on it.
      const paper = await page.evaluate(() => {
        const off = [...document.querySelectorAll('.path-plan .no-print')];
        const on = [...document.querySelectorAll('.path-page .print-only')];
        return {
          offTotal: off.length,
          offShown: off.filter((el) => getComputedStyle(el).display !== 'none').length,
          onTotal: on.length,
          onHidden: on.filter((el) => getComputedStyle(el).display === 'none').length,
        };
      });
      const counts = {};
      for (const format of FORMATS) counts[format] = sheetCount(await page.pdf({ format, printBackground: false }));
      const ok = paper.offTotal > 0 && paper.offShown === 0 && paper.onTotal > 0 && paper.onHidden === 0 && FORMATS.every((f) => counts[f] <= PATH_PAGES);
      if (!ok) failures.push({ slug: `paths/${id}`, counts, paper });
      record('path', ok);
      console.log(`path: ${id.padEnd(40)} A4 ${counts.A4}  Letter ${counts.Letter}  left off the paper ${paper.offTotal - paper.offShown}/${paper.offTotal}  on the paper ${paper.onTotal - paper.onHidden}/${paper.onTotal}  ${ok ? 'ok' : 'FAIL'}`);
      // The weekly plan (WEB-031): the sheets print only when the page asks for them, one page each, on both paper sizes.
      await page.evaluate(() => { document.body.dataset.printPlan = 'true'; });
      const sheets = await page.evaluate(() => document.querySelectorAll('.weekly-plan').length);
      const planCounts = {};
      for (const format of FORMATS) {
        // The page clears the attribute on afterprint, which Chromium fires after each PDF, so set it again each time.
        await page.evaluate(() => { document.body.dataset.printPlan = 'true'; });
        planCounts[format] = sheetCount(await page.pdf({ format, printBackground: false }));
      }
      const planOk = sheets === PATH_WEEKLY_PLAN_SHEETS && FORMATS.every((f) => planCounts[f] === PATH_WEEKLY_PLAN_SHEETS);
      if (!planOk) failures.push({ slug: `weekly plan: ${id}`, sheets, planCounts });
      record('weekly plan', planOk);
      console.log(`weekly plan: ${id.padEnd(37)} sheets ${sheets}  A4 ${planCounts.A4}  Letter ${planCounts.Letter}  ${planOk ? 'ok' : 'FAIL'}`);
      await page.close();
      pathsChecked += 1;
    }

    // The other templates with a paper version: large print, the fixed packs, the weekly program and the games.
    const check = async (type, label, url, maxPages, minStepPt, sameStepsAs = null) => {
      const page = await context.newPage();
      await page.goto(`${base}${url}`, { waitUntil: 'networkidle' });
      await page.emulateMedia({ media: 'print' });
      const counts = await printedPages(page);
      const stepPt = minStepPt ? await stepSize(page) : null;
      const sameWords = !sameStepsAs || JSON.stringify(await stepTexts(page)) === JSON.stringify(sameStepsAs);
      // A blank page still counts as one page, so a game sheet must also show a printed `.sheet` with content.
      const sheetShown = type !== 'game sheet' || (await visibleSheets(page)) > 0;
      const ok = FORMATS.every((f) => counts[f] >= 1 && counts[f] <= maxPages) && (!minStepPt || (stepPt !== null && stepPt >= minStepPt)) && sameWords && sheetShown;
      if (!ok) failures.push({ slug: `${type}: ${label}`, counts, maxPages, stepPt, sameWords, sheetShown });
      record(type, ok);
      console.log(`${type}: ${label.padEnd(36)} A4 ${counts.A4}  Letter ${counts.Letter}  limit ${maxPages}${minStepPt ? `  steps ${stepPt?.toFixed(0) ?? 'none'} pt (at least ${minStepPt})` : ''}${sameStepsAs ? `  same words as the card ${sameWords ? 'yes' : 'NO'}` : ''}${sheetShown ? '' : '  sheet hidden in print'}  ${ok ? 'ok' : 'FAIL'}`);
      await page.close();
    };
    for (const slug of slugs) {
      if (existsSync(join(DIST, 'activity', slug, 'large-print', 'index.html'))) {
        await check('large-print card', slug, `/activity/${slug}/large-print/`, LARGE_PRINT_PAGES, STEP_PT.largePrint, cardSteps.get(slug));
      } else {
        // Every card has a large-print edition; a missing one is a failure, not a smaller total.
        record('large-print card', false);
        failures.push({ slug, missing: 'large-print page' });
        console.log(`large-print card: ${slug.padEnd(36)} no page was built  FAIL`);
      }
    }
    const packDir = join(DIST, 'activity', 'packs');
    for (const id of existsSync(packDir) ? readdirSync(packDir) : []) {
      if (existsSync(join(packDir, id, 'index.html'))) await check('pack', id, `/activity/packs/${id}/`, FIXED_PACK_PAGES, STEP_PT.pack);
    }
    await check('weekly program', 'the weekly program', '/activity/weekly-program/', WEEKLY_PROGRAM_PAGES, null);
    await check('professionals handout', 'for health and social care', '/for-professionals/', PROFESSIONALS_HANDOUT_PAGES, null);
    await careSheets(context, base, failures, record);
    for (const { slug, kind } of gamesWithPaper()) {
      await check('game sheet', `${slug} (${kind})`, `/games/${slug}/`, GAME_SHEET_PAGES[slug] ?? 1, null);
    }
  } finally {
    await browser.close();
    server?.close();
  }
  const types = [...templates];
  const passing = types.filter(([, row]) => row.ok === row.total).length;
  console.log(`\nPrint templates: ${passing} of ${types.length} pass (${types.length ? Math.round((100 * passing) / types.length) : 0}%): ${types.map(([type, row]) => `${type} ${row.ok}/${row.total}`).join(', ')}.`);
  console.log(`Checked ${slugs.length} activity cards on A4 and US Letter: ${failures.length} not one two-sided sheet or over a page limit (${packChecked} pack builds and ${pathsChecked} paths checked).`);
  const recordPath = process.argv.find((a) => a.startsWith('--record='))?.slice('--record='.length);
  if (recordPath !== undefined) {
    if (!recordPath) {
      console.error('--record needs a file name, for example --record=print-record.json');
      process.exit(1);
    }
    const record = printRecord({ date: new Date().toISOString().slice(0, 10), commit: currentCommit(), cards: slugs.length, templates });
    writeFileSync(resolve(recordPath), `${JSON.stringify(record, null, 2)}\n`);
    console.log(`Wrote the print record to ${resolve(recordPath)}: ${record.templatesPassing} of ${record.templateTypes} templates pass (${record.passRate}%).`);
  }
  process.exit(failures.length ? 1 : 0);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
