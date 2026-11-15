#!/usr/bin/env node
// Accessibility gate (TSA-001, WEB-036): one page of every template, at 390 and 1440 px.
//   1. axe-core at WCAG 2.2 AA (tags wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa).
//   2. Keyboard pass: Tab through the page. Every stop must show a visible focus change,
//      must not sit under a fixed or sticky header (2.4.11), and focus must not stick on one element.
// Usage (after `pnpm build`):  node scripts/a11y-check.mjs            serves dist/ on a free port
//                              node scripts/a11y-check.mjs --base=http://127.0.0.1:4345
// First-time browser install:  pnpm exec playwright install chromium
// Exits 1 on any violation. A scan alone does not make a page "accessible" (DESIGN §6): the manual
// checklist and assistive-technology sessions are recorded separately.

import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const SITE_DIR = fileURLToPath(new URL('../', import.meta.url));
const DIST = join(SITE_DIR, 'dist');
const AXE_SOURCE = join(SITE_DIR, 'node_modules/axe-core/axe.min.js');
const WIDTHS = [390, 1440];
const MAX_STOPS = 120;
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** One page per template. The 404 entry requests a missing path, so the real 404 page is what gets checked. */
const TEMPLATES = [
  { name: 'home', path: '/' },
  { name: 'finder', path: '/activity/' },
  { name: 'activity-card', path: '/activity/arrange-flowers-together/' },
  { name: 'hub', path: '/activities-for-seniors/' },
  { name: 'pack', path: '/activity/packs/five-quiet-bedside-activities/' },
  { name: 'guide', path: '/caregiving/after-dementia-diagnosis/' },
  { name: 'section-index', path: '/caregiving/' },
  { name: 'game', path: '/games/picture-pairs/' },
  { name: 'today', path: '/today/' },
  { name: 'prose-legal', path: '/about/' },
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
  const covered = boxes.filter((b) => {
    const top = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
    return !!top && !owner.contains(top) && !el.contains(top) && !top.contains(owner);
  });
  const obscured = boxes.length > 0 && covered.length === boxes.length;
  const path = [];
  for (let c = el; c && c !== document.body; c = c.parentElement) path.unshift(`${c.tagName}${[...c.parentElement.children].indexOf(c)}`);
  const label = el.getAttribute('aria-label') || el.textContent || el.value || el.tagName;
  return {
    path: path.join('>'),
    name: label.trim().replace(/\s+/g, ' ').slice(0, 40),
    visible: focused.some((snapshot, i) => snapshot !== blurred[i]),
    inView,
    obscured,
  };
};

async function keyboardPass(page) {
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
  return { count: stops.length, problems };
}

async function axeCheck(page) {
  await page.addScriptTag({ content: readFileSync(AXE_SOURCE, 'utf8') });
  return page.evaluate(async (tags) => {
    const result = await window.axe.run(document, { runOnly: { type: 'tag', values: tags } });
    return result.violations.map((v) => ({ id: v.id, impact: v.impact ?? 'unknown', nodes: v.nodes.length, target: v.nodes[0]?.target.join(' ') ?? '' }));
  }, AXE_TAGS);
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

  const browser = await chromium.launch();
  const failures = [];
  try {
    for (const t of TEMPLATES) {
      for (const width of WIDTHS) {
        const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce', bypassCSP: true });
        const page = await context.newPage();
        const label = `${t.name.padEnd(14)} ${String(width).padStart(4)}px`;
        try {
          const response = await page.goto(base + t.path, { waitUntil: 'networkidle', timeout: 90000 });
          await page.evaluate(() => document.fonts.ready);
          const want = t.status ?? 200;
          const dir = await page.evaluate(() => document.documentElement.dir);
          const notes = [];
          if (response.status() !== want) notes.push(`HTTP ${response.status()}, expected ${want}`);
          if (t.dir && dir !== t.dir) notes.push(`dir="${dir}", expected "${t.dir}"`);
          const violations = await axeCheck(page);
          const serious = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
          if (violations.length) notes.push(`axe ${violations.length} rule(s): ${violations.map((v) => `${v.impact}:${v.id}(${v.nodes}) ${v.target}`).join('; ')}`);
          const keys = await keyboardPass(page);
          notes.push(...keys.problems);
          console.log(`${label}  axe ${violations.length}  stops ${keys.count}  ${notes.length ? 'FAIL' : 'ok'}`);
          for (const note of notes) console.log(`    - ${note}`);
          if (notes.length) failures.push({ page: t.name, width, serious: serious.length, notes });
        } catch (error) {
          console.log(`${label}  ERROR ${error.message.split('\n')[0]}`);
          failures.push({ page: t.name, width, notes: [error.message] });
        } finally {
          await context.close();
        }
      }
    }
  } finally {
    await browser.close();
    server?.close();
  }
  console.log(`\nChecked ${TEMPLATES.length} templates at ${WIDTHS.join(' and ')} px: ${failures.length} failing page(s).`);
  process.exit(failures.length ? 1 : 0);
}

await main();
