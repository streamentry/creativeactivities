#!/usr/bin/env node
// Accessibility gate (TSA-001, WEB-036): one page of every template, at 390 and 1440 px.
//   1. axe-core at WCAG 2.2 AA (tags wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa).
//   2. Keyboard pass: Tab through the page. Every stop must show a visible focus change,
//      must not sit under a fixed or sticky header (2.4.11), and focus must not stick on one element.
//   3. Reflow and text size (WCAG 1.4.10, 1.4.4): each template at 320 px (reflow), 390 px, 640 px
//      (the layout at 200% zoom on a 1280 px window), 1440 px, and 1440 px with the root text at 200%.
//      No horizontal page scroll, no content past the edge outside its own scroll box, no clipped text.
//   4. Motion (WCAG 2.2.2, 2.3.1): with reduced motion on, no looping animation is still running.
//   5. Games (WCAG 2.1.1, WEB-054): every game page has a keyboard-reachable Rest control. Rest hides
//      the play area, keeps its state, and Carry on brings it back with focus restored.
//   6. Feedback route (TSA-007): the accessibility statement has a mailto link.
// First-time browser install:  pnpm exec playwright install chromium
// Exits 1 on any violation. A scan alone does not make a page "accessible" (DESIGN §6): the manual
// checklist and assistive-technology sessions are recorded separately.

import { createServer } from 'node:http';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const SITE_DIR = fileURLToPath(new URL('../', import.meta.url));
const DIST = join(SITE_DIR, 'dist');
const AXE_SOURCE = join(SITE_DIR, 'node_modules/axe-core/axe.min.js');
/** Each template is checked at every variant. `textScale` sets the root font size, as a text-size setting does. */
const VARIANTS = [
  { label: '320 reflow', width: 320 },
  { label: '390', width: 390 },
  { label: '640 (200% zoom)', width: 640 },
  // Tablets (WEB-046): portrait and landscape.
  { label: 'tablet portrait', width: 768, height: 1024 },
  { label: 'tablet landscape', width: 1024, height: 768 },
  { label: '1440', width: 1440 },
  { label: '1440 text 200%', width: 1440, textScale: '200%' },
  // The dark theme (WEB-042): the device prefers dark, so the page renders its dark tokens.
  { label: '390 dark', width: 390, colorScheme: 'dark' },
];
/** Games are checked at phone and zoomed widths, with the Rest flow, which needs a real interaction. */
const GAME_VARIANTS = [{ label: '390', width: 390 }, { label: '640 (200% zoom)', width: 640 }];
const CONCURRENCY = 4;
/** A safety cap on the Tab walk, not an accessibility limit: the finder lists every card and hub, so it grows with the library. */
const MAX_STOPS = 240;
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** One page per template. The 404 entry requests a missing path, so the real 404 page is what gets checked. */
const TEMPLATES = [
  { name: 'home', path: '/' },
  { name: 'finder', path: '/activity/' },
  { name: 'activity-card', path: '/activity/arrange-flowers-together/' },
  // The group view (WEB-046) open on a card: its own screen, with the page behind it out of reach.
  { name: 'group-view', path: '/activity/arrange-flowers-together/', open: '[data-group-stage]' },
  { name: 'hub', path: '/activities-for-seniors/' },
  { name: 'occasion-hub', path: '/occasions/gift/' },
  { name: 'pack', path: '/activity/packs/five-quiet-bedside-activities/' },
  { name: 'large-print', path: '/activity/wrap-a-small-gift/large-print/' },
  { name: 'weekly-program', path: '/activity/weekly-program/' },
  { name: 'care-settings', path: '/for-organizations/care-settings/' },
  { name: 'printables', path: '/printables/' },
  { name: 'guide', path: '/caregiving/after-dementia-diagnosis/' },
  { name: 'section-index', path: '/caregiving/' },
  { name: 'game', path: '/games/picture-pairs/' },
  { name: 'today', path: '/today/' },
  { name: 'what-i-have', path: '/what-i-have/' },
  // The pack builder twice: empty, and with a pack chosen so the printable cover and its supply checklist are on the page.
  { name: 'pack-builder', path: '/activity/pack/' },
  { name: 'pack-chosen', path: '/activity/pack/?cards=arrange-flowers-together,decorate-a-keepsake-box,wrap-a-small-gift', ready: '.pack-cover--built' },
  // The paths: the list, and one path once its script has read the device (the weeks, the skip buttons and the counts).
  { name: 'paths', path: '/paths/' },
  { name: 'path', path: '/paths/quiet-weeks-at-the-table/', ready: '.path-plan[data-ready]' },
  // The other path with a place kept on the device: a start at week 2, weeks 1 and 4 skipped, two activities tried.
  {
    name: 'path-state',
    path: '/paths/making-across-generations/',
    ready: '.path-plan[data-ready]',
    storage: {
      'ca-paths-v1': JSON.stringify({ 'making-across-generations': { start: 1, skipped: [0, 3] } }),
      'ca-tried-activities-v1': JSON.stringify(['fold-a-paper-boat', 'write-a-letter-together']),
    },
  },
  { name: 'search', path: '/search/' },
  { name: 'seasons', path: '/seasons/' },
  { name: 'season', path: '/seasons/winter/' },
  { name: 'prose-legal', path: '/about/' },
  { name: 'accessibility', path: '/accessibility/', feedback: true },
  { name: '404', path: '/this-page-does-not-exist/', status: 404 },
  { name: 'translated', path: '/de/' },
  { name: 'rtl', path: '/ar/', dir: 'rtl' },
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

/** A tiny static server for dist/ with clean URLs and the real 404 page for unknown paths. */
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

/** Runs in the page: what has focus, whether its focus ring changed, and whether a header covers it. */
const focusStop = async () => {
  // Transitions and animations (the skip link slides in) must finish before the ring is compared.
  // Infinite animations never finish, so wait at most 500 ms.
  const settle = () =>
    Promise.race([
      Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))),
      new Promise((done) => setTimeout(done, 500)),
    ]);
  await settle();
  const el = document.activeElement;
  if (!el || el === document.body || el === document.documentElement) return null;
  const props = [
    'outline-style', 'outline-width', 'outline-color', 'outline-offset', 'box-shadow',
    'border-top-color', 'border-top-style', 'border-top-width', 'background-color', 'color', 'text-decoration-line',
  ];
  const snap = (node) => {
    const s = getComputedStyle(node);
    return props.map((p) => s.getPropertyValue(p)).join('|');
  };
  // The ring may sit on the element, its label (visually hidden radios and checkboxes), a following chip,
  // or a card a few levels up (":focus-within" styling).
  const owner = el.closest('label') ?? el;
  const ancestors = [];
  for (let c = el.parentElement, i = 0; c && c !== document.body && i < 4; c = c.parentElement, i++) ancestors.push(c);
  const nodes = [...new Set([el, owner, el.nextElementSibling, ...ancestors].filter(Boolean))];
  const focused = nodes.map(snap);
  el.blur();
  await settle();
  const blurred = nodes.map(snap);
  el.focus();
  await settle();
  const r = el.getBoundingClientRect();
  const inView = r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  // Sample the centre of every line box (an inline link wrapped over two lines has a gap in its bounding box).
  // Covered means an unrelated element sits on every visible line; ancestors (the paragraph around a link) do not count.
  const boxes = [...el.getClientRects()].filter((b) => b.width > 0 && b.height > 0 && b.bottom > 0 && b.top < innerHeight && b.right > 0 && b.left < innerWidth);
  const isCovered = (x, y) => {
    const top = document.elementFromPoint(x, y);
    return !!top && !owner.contains(top) && !el.contains(top) && !top.contains(owner);
  };
  // A shape's box centre can fall outside the shape (or on a region drawn above it), so an SVG shape is
  // tested at points along its outline. Any visible outline point means the focus ring can be seen.
  let points = boxes.map((b) => [b.left + b.width / 2, b.top + b.height / 2]);
  if (el instanceof SVGGeometryElement) {
    const ctm = el.getScreenCTM();
    const length = el.getTotalLength();
    points = ctm && length > 0
      ? [0, 0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9].map((f) => el.getPointAtLength(length * f).matrixTransform(ctm))
          .map((p) => [p.x, p.y])
          .filter(([x, y]) => x >= 0 && y >= 0 && x <= innerWidth && y <= innerHeight)
      : [];
  }
  const obscured = points.length > 0 && points.every(([x, y]) => isCovered(x, y));
  const path = [];
  for (let c = el; c && c !== document.body; c = c.parentElement) path.unshift(`${c.tagName}${[...c.parentElement.children].indexOf(c)}`);
  const label = el.getAttribute('aria-label') || el.textContent || el.value || el.tagName;
  return {
    path: path.join('>'),
    name: label.trim().replace(/\s+/g, ' ').slice(0, 40),
    rest: el.hasAttribute('data-rest'),
    visible: focused.some((snapshot, i) => snapshot !== blurred[i]),
    inView,
    obscured,
  };
};

/** Runs in the page after the animations settle: layout that overflows the viewport or clips text. */
const layoutCheck = () => {
  const vw = document.documentElement.clientWidth;
  const insideScrollBox = (el) => {
    for (let c = el.parentElement; c && c !== document.documentElement; c = c.parentElement) {
      if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(c).overflowX)) return true;
    }
    return false;
  };
  const label = (el) => (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 40) || el.tagName;
  const overflow = new Set();
  const clipped = new Set();
  for (const el of document.body.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none') continue;
    // Starts on screen and runs past the right edge, and no scroll box around it takes the overflow.
    if (r.left < vw && r.right > vw + 1 && !insideScrollBox(el)) overflow.add(label(el));
    // Own text cut off by overflow: hidden or clipped box, text larger than the box, no deliberate ellipsis.
    const clips = /(hidden|clip)/.test(s.overflowX) || /(hidden|clip)/.test(s.overflowY);
    const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (clips && ownText && el.clientWidth > 2 && el.clientHeight > 2 && s.textOverflow !== 'ellipsis' && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)) {
      clipped.add(label(el));
    }
  }
  const scrollWide = document.documentElement.scrollWidth > vw + 1;
  return { scrollWide, overflow: [...overflow], clipped: [...clipped] };
};

/** Runs in the page: looping animations still running after the reduced-motion settle. */
const loopingMotion = async () => {
  await Promise.race([
    Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))),
    new Promise((done) => setTimeout(done, 500)),
  ]);
  return document
    .getAnimations()
    .filter((a) => a.playState === 'running' && a.effect && a.effect.getComputedTiming().iterations === Infinity)
    .map((a) => a.animationName || 'animation');
};

async function layoutProblems(page) {
  const found = await page.evaluate(layoutCheck);
  const problems = [];
  if (found.scrollWide) problems.push('horizontal page scroll');
  if (found.overflow.length) problems.push(`content past the edge: ${found.overflow.slice(0, 5).join(', ')}`);
  if (found.clipped.length) problems.push(`text clipped: ${found.clipped.slice(0, 5).join(', ')}`);
  return problems;
}

async function motionProblems(page) {
  const running = await page.evaluate(loopingMotion);
  return running.length ? [`looping animation under reduced motion: ${[...new Set(running)].slice(0, 5).join(', ')}`] : [];
}

/**
 * Game Rest flow: tap a tile if there is one, rest, carry on. The play area must hide during rest,
 * keep its state, and focus must go to Carry on and back to Rest.
 */
async function restProblems(page) {
  const problems = [];
  const snapshot = () =>
    page.locator('.game__board').evaluate((board) =>
      [...board.querySelectorAll('[data-state], [aria-pressed]')]
        .map((e) => `${e.tagName}|${e.getAttribute('data-state')}|${e.getAttribute('aria-pressed')}`)
        .join(';'),
    );
  const first = page.locator('.game__board button').first();
  if (await first.count()) await first.click({ timeout: 5000 }).catch(() => {});
  const before = await snapshot();
  await page.click('[data-rest]', { timeout: 5000 });
  const rest = page.locator('.game__rest');
  try {
    await rest.waitFor({ state: 'visible', timeout: 5000 });
  } catch {
    return ['Rest did not show the resting screen'];
  }
  if (await page.locator('.game__board').isVisible()) problems.push('play area still visible while resting');
  if (!(await page.evaluate(() => !!document.activeElement?.closest('.game__rest')))) problems.push('focus did not move to Carry on');
  await page.click('.game__rest-actions .btn--primary', { timeout: 5000 });
  await page.locator('.game__board').waitFor({ state: 'visible', timeout: 5000 });
  if (await rest.count()) problems.push('resting screen still shown after Carry on');
  const after = await snapshot();
  if (before !== after) problems.push(`place changed across Rest: "${before}" then "${after}"`);
  if (!(await page.evaluate(() => document.activeElement?.hasAttribute('data-rest')))) problems.push('focus did not return to Rest');
  return problems;
}

/** Tab through the page; every stop must show focus. Games must reach their Rest control this way. */
async function keyboardPass(page, { game = false } = {}) {
  const stops = [];
  let reachedEnd = false;
  for (let i = 0; i < MAX_STOPS; i++) {
    await page.keyboard.press('Tab');
    const stop = await page.evaluate(focusStop);
    if (!stop) {
      reachedEnd = true;
      break;
    }
    stops.push(stop);
  }
  const problems = [];
  const invisible = stops.filter((s) => !s.visible || !s.inView);
  if (invisible.length) problems.push(`no visible focus: ${[...new Set(invisible.map((s) => `${s.name} (${s.inView ? 'ring' : 'off-screen'})`))].slice(0, 5).join(', ')}`);
  const hidden = stops.filter((s) => s.obscured);
  if (hidden.length) problems.push(`focus obscured: ${[...new Set(hidden.map((s) => s.name))].slice(0, 5).join(', ')}`);
  // Focus stuck on one element for three presses in a row is a trap.
  let run = 1;
  for (let i = 1; i < stops.length && run < 3; i++) run = stops[i].path === stops[i - 1].path ? run + 1 : 1;
  if (run >= 3) problems.push(`focus trap on ${stops.at(-1).name}`);
  if (!reachedEnd && stops.length >= MAX_STOPS) problems.push(`stopped after ${MAX_STOPS} stops, end not reached`);
  if (stops.length === 0) problems.push('no focusable element');
  if (game && !stops.some((s) => s.rest)) problems.push('no keyboard-reachable Rest control');
  return { count: stops.length, problems };
}

async function axeCheck(page) {
  await page.addScriptTag({ content: readFileSync(AXE_SOURCE, 'utf8') });
  return page.evaluate(async (tags) => {
    const result = await window.axe.run(document, { runOnly: { type: 'tag', values: tags } });
    return result.violations.map((v) => ({ id: v.id, impact: v.impact ?? 'unknown', nodes: v.nodes.length, target: v.nodes[0]?.target.join(' ') ?? '' }));
  }, AXE_TAGS);
}

/** Game pages: every folder in dist/games that has a page. */
function gamePaths() {
  const dir = join(DIST, 'games');
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(dir, d.name, 'index.html')))
    .map((d) => `/games/${d.name}/`)
    .sort();
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

/** One page at one width. Returns the printed line and the problems found. */
async function checkPage(browser, base, { label, path, status = 200, dir: wantDir, feedback = false, game = false, ready, storage, open, width, height = 900, textScale, colorScheme }) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce', bypassCSP: true, colorScheme });
  // A page that behaves differently once the device holds something is checked in that state.
  if (storage) {
    await context.addInitScript((entries) => {
      for (const [key, value] of Object.entries(entries)) {
        try {
          localStorage.setItem(key, value);
        } catch {
          // A browser that refuses storage is the page's other state, checked by the first template.
        }
      }
    }, storage);
  }
  const page = await context.newPage();
  try {
    const response = await page.goto(base + path, { waitUntil: 'networkidle', timeout: 90000 });
    await page.evaluate(() => document.fonts.ready);
    // A page whose content appears once its script has run names what to wait for.
    if (ready) await page.waitForSelector(ready, { timeout: 10000 });
    if (textScale) await page.addStyleTag({ content: `html { font-size: ${textScale} !important; }` });
    if (open) {
      // A state to check: press this control and wait for what it opens, as a person would.
      await page.waitForSelector(`${open}:not([hidden])`, { timeout: 10000 });
      await page.click(open);
      await page.waitForSelector('dialog[open]', { timeout: 10000 });
      // The Tab walk starts at the top of what opened, not on the control that was pressed (focus there is already
      // on the last button, so the first Tab would leave the page). Focus on the dialog itself is that starting point.
      await page.evaluate(() => document.querySelector('dialog[open]')?.focus());
    }
    const notes = [];
    if (response.status() !== status) notes.push(`HTTP ${response.status()}, expected ${status}`);
    const dir = await page.evaluate(() => document.documentElement.dir);
    if (wantDir && dir !== wantDir) notes.push(`dir="${dir}", expected "${wantDir}"`);
    const violations = await axeCheck(page);
    if (violations.length) notes.push(`axe ${violations.length} rule(s): ${violations.map((v) => `${v.impact}:${v.id}(${v.nodes}) ${v.target}`).join('; ')}`);
    const keys = await keyboardPass(page, { game });
    notes.push(...keys.problems);
    notes.push(...(await layoutProblems(page)));
    notes.push(...(await motionProblems(page)));
    if (feedback) {
      const mailto = await page.evaluate(() => document.querySelector('a[href^="mailto:"]')?.getAttribute('href') ?? '');
      if (!mailto) notes.push('no mailto feedback link on the accessibility statement');
    }
    if (game) notes.push(...(await restProblems(page)));
    const head = `${label.padEnd(14)} ${String(width).padStart(4)}px${height === 900 ? '' : ` x ${height}px`}${textScale ? ' text 200%' : ''}${colorScheme === 'dark' ? ' dark' : ''}`;
    return { head, notes, axe: violations.length, stops: keys.count };
  } catch (error) {
    return { head: `${label.padEnd(14)} ${String(width).padStart(4)}px${colorScheme === 'dark' ? ' dark' : ''}`, notes: [`ERROR ${error.message.split('\n')[0]}`], axe: 0, stops: 0 };
  } finally {
    await context.close();
  }
}

async function main() {
  if (!existsSync(join(DIST, 'index.html'))) {
    console.error('dist/ is missing. Run `pnpm build` first.');
    process.exit(1);
  }
  const given = process.argv.find((a) => a.startsWith('--base='))?.slice('--base='.length);
  // --port=N serves dist/ on that port (the site's own server, so its 404 page is what gets checked).
  const port = Number(process.argv.find((a) => a.startsWith('--port='))?.slice('--port='.length) ?? 0);
  const server = given ? null : serveDist(DIST);
  if (server) await new Promise((done) => server.listen(port, '127.0.0.1', done));
  const base = given ?? `http://127.0.0.1:${server.address().port}`;

  let jobs = [];
  for (const t of TEMPLATES) for (const v of VARIANTS) jobs.push({ ...t, ...v, label: t.name, game: false });
  const games = gamePaths();
  for (const path of games) {
    const name = path.split('/')[2];
    for (const v of GAME_VARIANTS) jobs.push({ name, label: `game:${name}`, path, ...v, game: true });
  }

  // --only=name keeps one template (or game:name) while a fix is tried; CI runs them all.
  const only = process.argv.find((a) => a.startsWith('--only='))?.slice('--only='.length);
  if (only) jobs = jobs.filter((j) => j.label === only);
  const browser = await chromium.launch();
  let results;
  try {
    results = await pool(jobs, CONCURRENCY, (job) => checkPage(browser, base, job));
  } finally {
    await browser.close();
    server?.close();
  }

  let failing = 0;
  results.forEach((r, i) => {
    const ok = r.notes.length === 0;
    if (!ok) failing++;
    console.log(`${r.head}  axe ${r.axe}  stops ${r.stops}  ${ok ? 'ok' : 'FAIL'}`);
    for (const note of r.notes) console.log(`    - ${note}`);
  });
  console.log(`\nChecked ${TEMPLATES.length} templates at ${VARIANTS.length} variants and ${games.length} games at ${GAME_VARIANTS.length} widths: ${failing} failing page(s) of ${jobs.length}.`);
  if (games.length === 0) console.log('warning: no game pages found under dist/games');
  process.exit(failing ? 1 : 0);
}

await main();
