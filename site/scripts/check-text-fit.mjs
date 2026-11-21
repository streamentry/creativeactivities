#!/usr/bin/env node
// Long-text and right-to-left fit check (WEB-043, PLAT-039). One translated guide, one translated activity page and one
// translated hub (section index) in three languages: Arabic (right to left), German (long compound words) and the built
// language with the longest translated guide strings (Zulu, see LONGEST below). Each page is checked at 320, 640 and
// 1440 px, at the normal text size and at 200% root text (as check:a11y does for zoom and text size).
//   1. No sideways page scroll, and no visible element runs past either edge of the viewport outside its own scroll box.
//   2. A fixture with a 60-character unbroken word, a heading and a button is added to the main content: it must stay
//      inside the viewport, the paragraph and heading must wrap onto more than one line, and the page must not scroll
//      sideways. The fixture is removed again afterwards.
//   3. Right-to-left pages must report dir="rtl" on the <html> element, so the RTL check is not run on a left-to-right page.
// Usage: node scripts/check-text-fit.mjs              (serves dist/ on a free local port; run `pnpm build` first)
//        node scripts/check-text-fit.mjs --base=http://127.0.0.1:4321
// Exits 1 on any failure. First-time browser install: pnpm exec playwright install chromium

import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const SITE_DIR = fileURLToPath(new URL('../', import.meta.url));
const DIST = join(SITE_DIR, 'dist');
const WIDTHS = [320, 640, 1440];
const TEXT_SCALES = [null, '200%'];
const CONCURRENCY = 4;
/** Sixty characters with no break opportunity: wider than a 320 px phone line at any text size. */
export const FIXTURE_WORD = 'Ab'.repeat(30);
/** The language whose translated guide strings are longest among the built languages (title, seoTitle and description, averaged per guide, 2026-11-21): zu 284 characters, yi 280, uz 278. */
const LONGEST = 'zu';

/** Each page is one template in one language. `rtl` pages must report dir="rtl". */
export const PAGES = [
  { label: 'ar guide', path: '/ar/caregiving/after-dementia-diagnosis/', rtl: true },
  { label: 'ar activity', path: '/ar/activities/daily-routine/', rtl: true },
  { label: 'ar hub', path: '/ar/activities/', rtl: true },
  { label: 'de guide', path: '/de/caregiving/after-dementia-diagnosis/' },
  { label: 'de activity', path: '/de/activities/daily-routine/' },
  { label: 'de hub', path: '/de/activities/' },
  { label: `${LONGEST} guide`, path: `/${LONGEST}/caregiving/after-dementia-diagnosis/` },
  { label: `${LONGEST} activity`, path: `/${LONGEST}/activities/daily-routine/` },
  { label: `${LONGEST} hub`, path: `/${LONGEST}/activities/` },
  // The English activity card is the printed template; its own text is English, so it is the baseline for the same checks.
  { label: 'en activity card', path: '/activity/arrange-flowers-together/' },
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
};

/** A static server for dist/ with clean URLs and the real 404 page for unknown paths (as check:a11y serves it). */
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

/**
 * Runs in the page: elements that run past the left or right edge of the viewport, and that no scroll box takes.
 * Both edges are checked because a right-to-left page can overflow on the left.
 */
const edgeCheck = () => {
  const vw = document.documentElement.clientWidth;
  const insideScrollBox = (el) => {
    for (let c = el.parentElement; c && c !== document.documentElement; c = c.parentElement) {
      if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(c).overflowX)) return true;
    }
    return false;
  };
  const label = (el) => (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 40) || el.tagName;
  const past = new Set();
  for (const el of document.body.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none') continue;
    const overRight = r.right > vw + 1 && r.left < vw;
    const overLeft = r.left < -1 && r.right > 0;
    if ((overRight || overLeft) && !insideScrollBox(el)) past.add(label(el));
  }
  return {
    sideways: document.documentElement.scrollWidth > vw + 1,
    past: [...past],
    dir: document.documentElement.dir,
  };
};

/**
 * Adds the fixture to the main content and measures it. A line is a distinct top edge of the text (a word that wraps
 * gives two). The word wraps when it is wider than its box, so the check asks for two lines only then: a word that fits
 * on one line is not broken, and that is not a failure.
 */
const addFixture = (word) => {
  const main = document.querySelector('main') ?? document.body;
  const box = document.createElement('div');
  box.setAttribute('data-text-fit-fixture', '');
  box.innerHTML = `<h2 class="text-fit-fixture__heading">${word}</h2><p class="text-fit-fixture__text">${word}</p><p><a class="btn" href="#main">${word}</a></p>`;
  main.append(box);
  const vw = document.documentElement.clientWidth;
  const lineCount = (el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    return new Set([...range.getClientRects()].filter((r) => r.height > 0).map((r) => Math.round(r.top))).size;
  };
  /** The width the word would take on one line, measured with wrapping switched off. */
  const naturalWidth = (el) => {
    const probe = document.createElement('span');
    probe.style.whiteSpace = 'nowrap';
    probe.textContent = word;
    el.append(probe);
    const width = probe.getBoundingClientRect().width;
    probe.remove();
    return width;
  };
  const measure = (el) => {
    const r = el.getBoundingClientRect();
    return {
      fits: r.left >= -1 && r.right <= vw + 1,
      // Text wider than its own box, which a wrap would have prevented.
      overflowsBox: el.scrollWidth > el.clientWidth + 1,
      lines: lineCount(el),
      mustWrap: naturalWidth(el) > el.clientWidth,
    };
  };
  const heading = box.querySelector('.text-fit-fixture__heading');
  const paragraph = box.querySelector('.text-fit-fixture__text');
  const button = box.querySelector('a.btn');
  return {
    heading: measure(heading),
    paragraph: measure(paragraph),
    button: { ...measure(button), overflowsBox: button.scrollWidth > button.clientWidth + 1 },
    sideways: document.documentElement.scrollWidth > vw + 1,
  };
};

const removeFixture = () => document.querySelector('[data-text-fit-fixture]')?.remove();

/** One page at one width and text size. Returns the printed line and the problems found. */
async function checkVariant(browser, base, page_, width, textScale) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce', bypassCSP: true });
  const page = await context.newPage();
  const name = `${page_.label} ${width}px${textScale ? ` text ${textScale}` : ''}`;
  try {
    const response = await page.goto(base + page_.path, { waitUntil: 'networkidle', timeout: 90000 });
    await page.evaluate(() => document.fonts.ready);
    if (textScale) await page.addStyleTag({ content: `html { font-size: ${textScale} !important; }` });
    const notes = [];
    if (response.status() !== 200) notes.push(`HTTP ${response.status()}`);
    const before = await page.evaluate(edgeCheck);
    if (page_.rtl && before.dir !== 'rtl') notes.push(`dir="${before.dir}", expected "rtl"`);
    if (before.sideways) notes.push('horizontal page scroll');
    if (before.past.length) notes.push(`content past the edge: ${before.past.slice(0, 5).join(', ')}`);
    const fixture = await page.evaluate(addFixture, FIXTURE_WORD);
    const parts = { heading: fixture.heading, paragraph: fixture.paragraph, button: fixture.button };
    for (const [name, part] of Object.entries(parts)) {
      if (!part.fits) notes.push(`fixture ${name} past the edge`);
      if (part.overflowsBox) notes.push(`fixture ${name} text overflows its box`);
      if (part.mustWrap && part.lines < 2) notes.push(`fixture ${name} did not wrap (${part.lines} line)`);
    }
    if (fixture.sideways) notes.push('horizontal page scroll with the fixture');
    const after = await page.evaluate(edgeCheck);
    if (after.past.length) notes.push(`fixture: content past the edge: ${after.past.slice(0, 5).join(', ')}`);
    await page.evaluate(removeFixture);
    return { name, notes };
  } catch (error) {
    return { name, notes: [`ERROR ${error.message.split('\n')[0]}`] };
  } finally {
    await context.close();
  }
}

/** Runs `fn` over `items` with at most `limit` in flight. Results keep the input order. */
async function pool(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await fn(items[i]);
      }
    }),
  );
  return results;
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
  const started = Date.now();

  const jobs = [];
  for (const page_ of PAGES) for (const width of WIDTHS) for (const textScale of TEXT_SCALES) jobs.push({ page_, width, textScale });
  const browser = await chromium.launch();
  let results;
  try {
    results = await pool(jobs, CONCURRENCY, ({ page_, width, textScale }) => checkVariant(browser, base, page_, width, textScale));
  } finally {
    await browser.close();
    server?.close();
  }

  let failing = 0;
  for (const r of results) {
    if (r.notes.length) failing += 1;
    console.log(`${r.name.padEnd(34)} ${r.notes.length ? 'FAIL' : 'ok'}`);
    for (const note of r.notes) console.log(`    - ${note}`);
  }
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  console.log(`\nChecked ${PAGES.length} pages at ${WIDTHS.length} widths with and without 200% text: ${failing} failing variant(s) of ${jobs.length}. ${seconds} s.`);
  process.exit(failing ? 1 : 0);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
