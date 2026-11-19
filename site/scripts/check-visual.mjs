#!/usr/bin/env node
// Visual regression at standard widths (PLAT-037). A review aid: it shows what changed on the key templates, and the
// pull request reviewer decides whether a change is acceptable. It never fails a build on a pixel difference.
//
// Workflow (run `pnpm build` before each shoot, on the commit you are checking):
//   1. git checkout <base commit>  && pnpm build && pnpm check:visual shoot --out <scratch>/before
//   2. git checkout <change>       && pnpm build && pnpm check:visual shoot --out <scratch>/after
//   3. pnpm check:visual compare --before <scratch>/before --after <scratch>/after --out <scratch>/report
//   Open <scratch>/report/report.md; changed pages have a diff image in <scratch>/report/diff/.
// Determinism: run shoot twice on the same build and compare; the report should list 0 changed.
//
// shoot:   serves dist/ (or --base=<url>) and writes full-page PNGs named <width>-<scheme>-<slug>.png for 320, 768, 1024
//          and 1440 CSS px, in light and dark, plus print media (light only) for two pages. Pages with random deals have
//          their board masked. Fonts come from the site's own files, and Chromium runs with font hinting off.
// compare: decodes each PNG pair in Chromium (canvas getImageData, so no image library is needed) and compares every
//          RGBA value exactly. Writes <out>/report.md and <out>/diff/<name>.png for each changed file. Exits 0.
//
// Usage: node scripts/check-visual.mjs shoot --out <dir> [--base=<url>]
//        node scripts/check-visual.mjs compare --before <dir> --after <dir> --out <dir>
// First-time browser install: pnpm exec playwright install chromium

import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const WIDTHS = [320, 768, 1024, 1440];
const SCHEMES = ['light', 'dark'];
const VIEWPORT_HEIGHT = 900;
// Fixed clock: Date.now() and new Date() return this instant, so date-based copy is the same on every run. Timers still run.
const FIXED_NOW = '2026-05-01T12:00:00Z';
const TIMEZONE = 'UTC';
const CHROMIUM_ARGS = ['--font-render-hinting=none', '--disable-lcd-text', '--force-color-profile=srgb', '--hide-scrollbars'];
const FINDER_FILTER = 'input[name="time"]:not([value="any"])';
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon' };

/** Standard pages. `mask` lists selectors whose contents are random per load (a shuffled deal) and are hidden in the shot. */
const PAGES = [
  { path: '/', slug: 'home' },
  { path: '/activity/', slug: 'activity-finder' },
  { path: '/activity/fold-a-paper-boat/', slug: 'activity-fold-a-paper-boat' },
  { path: '/activity/fold-a-paper-boat/large-print/', slug: 'activity-fold-a-paper-boat-large-print' },
  { path: '/crafts/', slug: 'crafts' },
  { path: '/dementia-activities/', slug: 'dementia-activities' },
  { path: '/activities/ideas/', slug: 'activities-ideas' },
  { path: '/games/', slug: 'games' },
  // Picture pairs deals a random set of pictures each time the page loads.
  { path: '/games/picture-pairs/', slug: 'games-picture-pairs', mask: ['.board'] },
  // Collage board: its board is masked in case a deal is random; the tray is static text and pictures.
  { path: '/games/collage-board/', slug: 'games-collage-board', mask: ['.cb__board'] },
  { path: '/accessibility/', slug: 'accessibility' },
  { path: '/for-professionals/', slug: 'for-professionals' },
];
/** Print media is checked on the card and a game (print CSS differs from screen CSS on both). Light only. */
const PRINT_PAGES = PAGES.filter((p) => ['/activity/fold-a-paper-boat/', '/games/collage-board/'].includes(p.path));

const FREEZE_CSS = `
*, *::before, *::after {
  animation: none !important;
  animation-delay: 0s !important;
  transition: none !important;
  scroll-behavior: auto !important;
  caret-color: transparent !important;
}`;

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

/** Scrolls the page top to bottom so lazy images load, returns to the top, and waits until every image is complete. */
async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const frame = () => new Promise((done) => requestAnimationFrame(() => done()));
    const step = window.innerHeight;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await frame();
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await frame();
    window.scrollTo(0, 0);
    await frame();
  });
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() => [...document.images].every((img) => img.complete), null, { timeout: 15000 });
}

async function openPage(context, base, entry) {
  const page = await context.newPage();
  const response = await page.goto(`${base}${entry.path}`, { waitUntil: 'networkidle' });
  if (!response || !response.ok()) throw new Error(`${entry.path} answered ${response ? response.status() : 'no response'}`);
  await page.addStyleTag({ content: FREEZE_CSS });
  // Client-rendered boards appear after their island hydrates; wait for them so the mask has something to hide.
  for (const selector of entry.mask ?? []) await page.waitForSelector(selector, { state: 'attached', timeout: 15000 });
  await settle(page);
  return page;
}

async function snap(page, entry, file) {
  await page.screenshot({
    path: file,
    fullPage: true,
    animations: 'disabled',
    caret: 'hide',
    mask: (entry.mask ?? []).map((selector) => page.locator(selector)),
  });
}

async function shoot(out, base, browser) {
  mkdirSync(out, { recursive: true });
  let count = 0;
  for (const width of WIDTHS) {
    for (const scheme of SCHEMES) {
      const context = await browser.newContext({
        viewport: { width, height: VIEWPORT_HEIGHT },
        deviceScaleFactor: 1,
        colorScheme: scheme,
        reducedMotion: 'reduce',
        bypassCSP: true,
        timezoneId: TIMEZONE,
      });
      await context.clock.setFixedTime(new Date(FIXED_NOW));
      try {
        for (const entry of PAGES) {
          const page = await openPage(context, base, entry);
          await snap(page, entry, join(out, `${width}-${scheme}-${entry.slug}.png`));
          count += 1;
          if (entry.path === '/activity/') {
            // The finder with one filter chosen: the shortest time.
            const radio = page.locator(FINDER_FILTER).first();
            const value = await radio.getAttribute('value');
            await radio.check({ force: true });
            await settle(page);
            await snap(page, entry, join(out, `${width}-${scheme}-activity-finder-time-${value}.png`));
            count += 1;
          }
          await page.close();
        }
        if (scheme === 'light') {
          for (const entry of PRINT_PAGES) {
            const page = await openPage(context, base, entry);
            await page.emulateMedia({ media: 'print' });
            await settle(page);
            await snap(page, entry, join(out, `${width}-print-${entry.slug}.png`));
            count += 1;
            await page.close();
          }
        }
      } finally {
        await context.close();
      }
    }
  }
  return count;
}

/** Runs in the browser. Decodes both PNGs on canvas and compares every RGBA value exactly. */
function comparePixels({ before, after }) {
  const decode = (src) =>
    new Promise((ok, fail) => {
      const img = new Image();
      img.onload = () => ok(img);
      img.onerror = () => fail(new Error('a PNG could not be decoded'));
      img.src = src;
    });
  const pixelsOf = (img) => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(img, 0, 0);
    return context.getImageData(0, 0, canvas.width, canvas.height).data;
  };
  return Promise.all([decode(before), decode(after)]).then(([a, b]) => {
    const size = (img) => [img.naturalWidth, img.naturalHeight];
    if (a.naturalWidth !== b.naturalWidth || a.naturalHeight !== b.naturalHeight) {
      return { sizeChanged: true, before: size(a), after: size(b) };
    }
    const [width, height] = size(a);
    const pa = pixelsOf(a);
    const pb = pixelsOf(b);
    const out = new Uint8ClampedArray(pb.length);
    let changed = 0;
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -1;
    let y1 = -1;
    for (let p = 0; p < width * height; p += 1) {
      const i = p * 4;
      const differs = pa[i] !== pb[i] || pa[i + 1] !== pb[i + 1] || pa[i + 2] !== pb[i + 2] || pa[i + 3] !== pb[i + 3];
      if (differs) {
        changed += 1;
        const x = p % width;
        const y = Math.floor(p / width);
        x0 = Math.min(x0, x);
        y0 = Math.min(y0, y);
        x1 = Math.max(x1, x);
        y1 = Math.max(y1, y);
        out[i] = 255;
        out[i + 1] = 0;
        out[i + 2] = 0;
        out[i + 3] = 255;
      } else {
        // Unchanged pixels: the after-image in grey at about a quarter strength, so the red marks read against it.
        const grey = (pb[i] * 299 + pb[i + 1] * 587 + pb[i + 2] * 114) / 1000;
        const faded = 255 - (255 - grey) * 0.25;
        out[i] = faded;
        out[i + 1] = faded;
        out[i + 2] = faded;
        out[i + 3] = 255;
      }
    }
    let diff = null;
    if (changed > 0) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').putImageData(new ImageData(out, width, height), 0, 0);
      diff = canvas.toDataURL('image/png');
    }
    return { sizeChanged: false, width, height, changed, bbox: changed ? [x0, y0, x1, y1] : null, diff };
  });
}

function listPngs(dir) {
  return readdirSync(dir).filter((name) => name.endsWith('.png')).sort();
}

async function compare(beforeDir, afterDir, out, browser) {
  const before = listPngs(beforeDir);
  const after = listPngs(afterDir);
  const names = [...new Set([...before, ...after])].sort();
  const onlyBefore = names.filter((n) => before.includes(n) && !after.includes(n));
  const onlyAfter = names.filter((n) => after.includes(n) && !before.includes(n));
  const both = names.filter((n) => before.includes(n) && after.includes(n));
  const unchanged = [];
  const changed = [];
  const sizeChanged = [];
  mkdirSync(join(out, 'diff'), { recursive: true });
  const page = await browser.newPage();
  for (const name of both) {
    const toUrl = (dir) => `data:image/png;base64,${readFileSync(join(dir, name)).toString('base64')}`;
    const result = await page.evaluate(comparePixels, { before: toUrl(beforeDir), after: toUrl(afterDir) });
    if (result.sizeChanged) {
      sizeChanged.push({ name, before: result.before, after: result.after });
    } else if (result.changed === 0) {
      unchanged.push(name);
    } else {
      const { changed: pixels, bbox, diff, width, height } = result;
      writeFileSync(join(out, 'diff', name), Buffer.from(diff.split(',')[1], 'base64'));
      changed.push({ name, pixels, bbox, total: width * height, width, height });
    }
  }
  await page.close();
  const box = (b) => `${b[0]},${b[1]} to ${b[2]},${b[3]} (${b[2] - b[0] + 1} x ${b[3] - b[1] + 1})`;
  const lines = [
    '# Visual compare',
    '',
    `Before: \`${beforeDir}\`  `,
    `After: \`${afterDir}\``,
    '',
    `Summary: ${unchanged.length} unchanged, ${changed.length} changed, ${sizeChanged.length} size changed, ${onlyBefore.length} only before, ${onlyAfter.length} only after.`,
    '',
    'Pixels are compared exactly (every red, green, blue and alpha value). Coordinates are CSS pixels at 1x from the top left of the full page.',
    '',
    '## Changed',
    '',
    changed.length ? '| File | Changed pixels | Share of image | Bounding box | Diff |' : 'None.',
    ...(changed.length ? ['| --- | --- | --- | --- | --- |'] : []),
    ...changed.map((c) => `| ${c.name} | ${c.pixels} | ${((100 * c.pixels) / c.total).toFixed(2)}% | ${box(c.bbox)} | [diff](diff/${c.name}) |`),
    '',
    '## Size changed',
    '',
    sizeChanged.length ? '| File | Before | After |' : 'None.',
    ...(sizeChanged.length ? ['| --- | --- | --- |'] : []),
    ...sizeChanged.map((s) => `| ${s.name} | ${s.before.join(' x ')} | ${s.after.join(' x ')} |`),
    '',
    '## Only before',
    '',
    onlyBefore.length ? onlyBefore.map((n) => `- ${n}`).join('\n') : 'None.',
    '',
    '## Only after',
    '',
    onlyAfter.length ? onlyAfter.map((n) => `- ${n}`).join('\n') : 'None.',
    '',
    '## Unchanged',
    '',
    unchanged.length ? unchanged.map((n) => `- ${n}`).join('\n') : 'None.',
    '',
  ];
  writeFileSync(join(out, 'report.md'), lines.join('\n'));
  console.log(`Visual compare: ${unchanged.length} unchanged, ${changed.length} changed, ${sizeChanged.length} size changed`);
  console.log(`Only before: ${onlyBefore.length}, only after: ${onlyAfter.length}. Report: ${join(out, 'report.md')}`);
  for (const c of changed) console.log(`  changed ${c.name}: ${c.pixels} pixels, ${box(c.bbox)}`);
}

function flag(args, name) {
  const i = args.findIndex((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (i === -1) return undefined;
  return args[i].includes('=') ? args[i].slice(args[i].indexOf('=') + 1) : args[i + 1];
}

async function main() {
  const [mode, ...args] = process.argv.slice(2);
  if (mode !== 'shoot' && mode !== 'compare') {
    console.error('Usage: check-visual.mjs shoot --out <dir> [--base=<url>]\n       check-visual.mjs compare --before <dir> --after <dir> --out <dir>');
    process.exit(2);
  }
  const browser = await chromium.launch({ args: CHROMIUM_ARGS });
  try {
    if (mode === 'compare') {
      const before = flag(args, 'before');
      const after = flag(args, 'after');
      const out = flag(args, 'out');
      if (!before || !after || !out) throw new Error('compare needs --before, --after and --out');
      for (const dir of [before, after]) if (!existsSync(dir)) throw new Error(`${dir} does not exist; run shoot first`);
      await compare(resolve(before), resolve(after), resolve(out), browser);
      return;
    }
    const out = flag(args, 'out');
    if (!out) throw new Error('shoot needs --out <dir>');
    const given = flag(args, 'base');
    if (!given && !existsSync(join(DIST, 'index.html'))) throw new Error('dist/ is missing. Run `pnpm build` first.');
    const server = given ? null : serveDist(DIST);
    if (server) await new Promise((done) => server.listen(0, '127.0.0.1', done));
    const base = given ?? `http://127.0.0.1:${server.address().port}`;
    const started = Date.now();
    try {
      const count = await shoot(resolve(out), base, browser);
      console.log(`Shot ${count} screenshots into ${resolve(out)} in ${((Date.now() - started) / 1000).toFixed(1)} s.`);
    } finally {
      server?.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
