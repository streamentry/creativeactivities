#!/usr/bin/env node
// Cross-browser flow check. Runs the same small set of user flows in Playwright Chromium, Firefox and WebKit.
// WebKit is the engine Safari uses, but it is Playwright's own WebKit build, not Safari. A pass here does not
// replace a check in Safari on an Apple device, and the output never calls WebKit "Safari".
// Flows: read-aloud, short steps, reading and colour settings, colour scheme, photo pairs, scrapbook,
// print sheets of the games, and no horizontal scroll at 320 px. Each flow runs in a fresh context.
// Exits 1 on any failure, including a browser that does not launch (its column fails; it is not skipped).
// Usage: node scripts/check-browsers.mjs            (serves dist/ on a free local port; run `pnpm build` first)
//        node scripts/check-browsers.mjs --base=http://127.0.0.1:4345
// First-time browser install: pnpm exec playwright install chromium firefox webkit

import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const ENGINES = [
  ['chromium', chromium],
  ['firefox', firefox],
  ['webkit', webkit],
];
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon' };
const PHONE = { width: 390, height: 844 };
const TIMEOUT_MS = 15000;
const LAUNCH_MS = 60000;
/** A tiny valid 64 by 48 JPEG, made once with `sips` and embedded so the check needs no image file or npm package. */
const TEST_JPEG = Buffer.from('/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAQKADAAQAAAABAAAAMAAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/8AAEQgAMABAAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMAAgICAgICAwICAwUDAwMFBgUFBQUGCAYGBgYGCAoICAgICAgKCgoKCgoKCgwMDAwMDA4ODg4ODw8PDw8PDw8PD//bAEMBAgICBAQEBwQEBxALCQsQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEP/dAAQABP/aAAwDAQACEQMRAD8A/Eu00TodtenWmif7NdxaaJ220200Tp8tfseMz7/Vvr7X2v8A27bl/wDAr35vK1jweG+JvbW1tY4i00Tp8tenWmidPlruLTROny0200Tp8tfKYzPv9W+vtfa/9u25f/Ar35vK1j+gOG+JvbW1tY4e00Tp8ten2midPlrt7TROny0lponT5a+Txmff6t9fa+1/7dty/wDgV783lsf0Bw3xN7a2trHD2midttenWmidDtruLTROny0200Tttr5TGZ9/q319r7X/ALdty/8AgV783lsf0Bw3xN7a2trH/9D4HtNE6fLXp1pon+zXcWmidttNtNE6HbWGMz7/AFb6+19r/wBu25f/AAK9+by2P5b4a4m9tbW1jiLTROny16daaJ0+Wu4tNE6fLTbTROny18njM+/1b6+19r/27bl/8Cvfm8tj+gOGuJvbW1tY4e00Tp8tenWmidPlruLTROny0200Tp8tfK4zPv8AVvr7X2v/AG7bl/8AAr35vK1j+gOGuJvbW1tY4i00T/Zr0600Tp8tdxaaJ0+Wm2midttfJ4zPv9W+vtfa/wDbtuX/AMCvfm8rWP6A4a4m9tbW1j//0eDtNE6fLXp1ponbbXcWmidttNtNE6fLX4djM+/1b6+19r/27bl/8Cvfm8rWP81eG+JvbW1tY4e00Tp8ten2midPlrt7TRP9mktNE6fLXymMz7/Vvr7X2v8A27bl/wDAr35vK1j+gOG+JvbW1tY4e00Tp8tenWmidPlruLTROny0200Tp8tfJ4zPv9W+vtfa/wDbtuX/AMCvfm8tj+gOG+JvbW1tY4i00Tp8tenWmidPlrt7TROny0lpon+zXymMz7/Vvr7X2v8A27bl/wDAr35vLY/oDhvib21tbWP/2Q==', 'base64');

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

async function newContext(browser, options = {}) {
  const context = await browser.newContext({ viewport: PHONE, ...options });
  context.setDefaultTimeout(TIMEOUT_MS);
  return context;
}

/** Waits until every client:* island has hydrated (Astro removes its ssr attribute on hydration). */
async function waitForHydration(page) {
  await page.waitForFunction(() => !document.querySelector('astro-island[ssr]'), null, { timeout: TIMEOUT_MS });
}

async function open(page, base, path) {
  await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
}

/** The text of each standard step on the card, without its on-screen Listen button. */
function stepTexts(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('ol.activity-steps:not(.activity-steps--plain) > li')].map((li) => {
      const copy = li.cloneNode(true);
      for (const control of copy.querySelectorAll('button, astro-island')) control.remove();
      return copy.textContent.replace(/\s+/g, ' ').trim();
    }),
  );
}

// 1. Read aloud. Speech is stubbed so nothing is played; the stub records each utterance's text.
async function readAloud(browser, base) {
  const context = await newContext(browser);
  try {
    const page = await context.newPage();
    await page.addInitScript(() => {
      const synth = window.speechSynthesis;
      window.__hasSpeech = Boolean(synth) && typeof synth.speak === 'function';
      if (!window.__hasSpeech) return;
      window.__spoken = [];
      // On the prototype: in WebKit an assignment to the instance was lost before the first click.
      const target = window.SpeechSynthesis?.prototype ?? synth;
      target.speak = function speakStub(utterance) {
        window.__spoken.push(utterance.text);
      };
    });
    await open(page, base, '/activity/fold-a-paper-boat/');
    await waitForHydration(page);
    const listen = page.getByRole('button', { name: 'Listen to the steps' });
    if (!(await page.evaluate(() => window.__hasSpeech))) {
      if ((await listen.count()) !== 0) throw new Error('the listen controls are shown without speech');
      return { detail: 'no speech: controls hidden (by design)' };
    }
    await listen.waitFor();
    const title = (await page.locator('h1').first().textContent()).replace(/\s+/g, ' ').trim();
    const steps = await stepTexts(page);
    const pageText = await page.evaluate(() => document.body.textContent.replace(/\s+/g, ' '));
    await listen.click();
    await page.waitForFunction(() => window.__spoken.length > 0);
    const spoken = await page.evaluate(() => window.__spoken);
    if (spoken[0] !== title) throw new Error(`first text is "${spoken[0]}", not the title "${title}"`);
    const firstStep = spoken.indexOf(steps[0]);
    if (firstStep < 2) throw new Error(`step 1 is at position ${firstStep}, with no safety text before it`);
    for (const line of spoken.slice(1, firstStep)) {
      if (steps.includes(line)) throw new Error('a step was read before step 1');
      if (!pageText.includes(line)) throw new Error(`"${line.slice(0, 40)}" is read but is not on the page`);
    }
    if (spoken[firstStep + 1] !== steps[1]) throw new Error('step 2 does not follow step 1');
    return {};
  } finally {
    await context.close();
  }
}

// 2. Short steps: the switch swaps the two step lists, and the choice survives a reload.
async function shortSteps(browser, base) {
  const context = await newContext(browser);
  try {
    const page = await context.newPage();
    await open(page, base, '/activity/arrange-flowers-together/');
    await waitForHydration(page);
    const toggle = page.getByRole('button', { name: 'Short steps' });
    const standard = page.locator('ol.activity-steps:not(.activity-steps--plain)');
    const plain = page.locator('ol.activity-steps.activity-steps--plain');
    await toggle.waitFor();
    if (!(await standard.isVisible()) || !(await plain.isHidden())) throw new Error('standard steps are not the ones shown at first');
    await toggle.click();
    if (!(await standard.isHidden()) || !(await plain.isVisible())) throw new Error('short steps did not replace the standard steps');
    if ((await toggle.getAttribute('aria-pressed')) !== 'true') throw new Error('the switch does not show that short steps are on');
    await page.reload({ waitUntil: 'networkidle' });
    await waitForHydration(page);
    await toggle.waitFor();
    if (!(await plain.isVisible()) || !(await standard.isHidden())) throw new Error('short steps were not kept after a reload');
    if ((await toggle.getAttribute('aria-pressed')) !== 'true') throw new Error('the switch forgot short steps after a reload');
    return {};
  } finally {
    await context.close();
  }
}

// 3. Reading and colour settings. The site has Dark, Larger text and Higher contrast; it has no "Shorter lines"
// or "More space" control, so those are not checked here (see the notes at the end of the run).
async function readingSettings(browser, base) {
  const context = await newContext(browser);
  try {
    const page = await context.newPage();
    // Recorded at DOMContentLoaded, before the page's own scripts can change anything the reader sees.
    await page.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        window.__atLoad = {
          theme: document.documentElement.dataset.theme ?? null,
          textSize: document.documentElement.dataset.textSize ?? null,
          contrast: document.documentElement.dataset.contrast ?? null,
        };
      });
    });
    await open(page, base, '/accessibility/');
    await waitForHydration(page);
    await page.getByRole('group', { name: 'Colors' }).getByRole('button', { name: 'Dark' }).click();
    await page.getByRole('button', { name: 'Larger text' }).click();
    await page.getByRole('button', { name: 'Higher contrast' }).click();
    const now = await page.evaluate(() => ({
      theme: document.documentElement.dataset.theme ?? null,
      textSize: document.documentElement.dataset.textSize ?? null,
      contrast: document.documentElement.dataset.contrast ?? null,
    }));
    if (now.theme !== 'dark' || now.textSize !== 'large' || now.contrast !== 'high') {
      throw new Error(`after the buttons: data-theme=${now.theme} data-text-size=${now.textSize} data-contrast=${now.contrast}`);
    }
    await open(page, base, '/activities/ideas/');
    const atLoad = await page.evaluate(() => window.__atLoad);
    if (atLoad?.theme !== 'dark') throw new Error(`data-theme was "${atLoad?.theme}" when the page loaded, not "dark"`);
    if (atLoad.textSize !== 'large' || atLoad.contrast !== 'high') {
      throw new Error(`the page loaded without the text size or contrast (text size ${atLoad?.textSize}, contrast ${atLoad?.contrast})`);
    }
    return {};
  } finally {
    await context.close();
  }
}

// 4. Colour scheme with no stored choice: the page follows the device setting.
const linear = (c) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const relativeLuminance = ([r, g, b]) => 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);

async function colorScheme(browser, base) {
  const measure = async (colorScheme) => {
    const context = await newContext(browser, { colorScheme });
    try {
      const page = await context.newPage();
      await open(page, base, '/');
      // The background as a canvas paints it, so any colour syntax the browser reports is read the same way.
      return await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        for (const el of [document.body, document.documentElement]) {
          ctx.clearRect(0, 0, 1, 1);
          ctx.fillStyle = getComputedStyle(el).backgroundColor;
          ctx.fillRect(0, 0, 1, 1);
          const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
          if (a > 0) return [r, g, b];
        }
        return null;
      });
    } finally {
      await context.close();
    }
  };
  const dark = await measure('dark');
  const light = await measure('light');
  if (!dark || !light) throw new Error('could not read the page background');
  const darkL = relativeLuminance(dark);
  const lightL = relativeLuminance(light);
  if (darkL >= 0.2) throw new Error(`the dark device setting gives a background of luminance ${darkL.toFixed(3)} (needs below 0.2)`);
  if (lightL <= 0.5) throw new Error(`the light device setting gives a background of luminance ${lightL.toFixed(3)} (needs above 0.5)`);
}

// 5. Photo pairs: two photos make cards with pictures, and no request leaves the test host.
async function photoPairs(browser, base) {
  const context = await newContext(browser);
  try {
    const page = await context.newPage();
    const host = new URL(base).host;
    const outside = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.protocol === 'blob:' || url.protocol === 'data:') return;
      if (url.host !== host) outside.push(request.url());
    });
    await open(page, base, '/games/photo-pairs/');
    await waitForHydration(page);
    await page.locator('input[type="file"]').first().setInputFiles([
      { name: 'test-photo-1.jpg', mimeType: 'image/jpeg', buffer: TEST_JPEG },
      { name: 'test-photo-2.jpg', mimeType: 'image/jpeg', buffer: TEST_JPEG },
    ]);
    await page.locator('.board img').first().waitFor();
    const pictures = await page.locator('.board img').count();
    // Two photos, each on two cards to match.
    if (pictures !== 4) throw new Error(`${pictures} picture cards appeared, not 4`);
    if (outside.length) throw new Error(`requests left the test host: ${outside.slice(0, 2).join(', ')}`);
    return {};
  } finally {
    await context.close();
  }
}

// 6. Scrapbook: two photos make a two-page book, and Next page turns to page 2.
async function scrapbook(browser, base) {
  const context = await newContext(browser);
  try {
    const page = await context.newPage();
    await open(page, base, '/games/scrapbook/');
    await waitForHydration(page);
    await page.locator('input[type="file"]').first().setInputFiles([
      { name: 'test-photo-1.jpg', mimeType: 'image/jpeg', buffer: TEST_JPEG },
      { name: 'test-photo-2.jpg', mimeType: 'image/jpeg', buffer: TEST_JPEG },
    ]);
    const pageOf = page.locator('.scrapbook__pageof');
    await pageOf.getByText('Page 1 of 2').waitFor();
    await page.getByRole('button', { name: 'Next page' }).click();
    await pageOf.getByText('Page 2 of 2').waitFor();
    return {};
  } finally {
    await context.close();
  }
}

// 7. Print: the game's printed sheet is shown on paper, with some height.
async function gamePrint(browser, base) {
  const games = ['collage-board', 'quiet-shapes', 'scrapbook'];
  const context = await newContext(browser);
  try {
    const failed = [];
    for (const slug of games) {
      const page = await context.newPage();
      await open(page, base, `/games/${slug}/`);
      await page.emulateMedia({ media: 'print' });
      const shown = await page.evaluate(
        () => [...document.querySelectorAll('.sheet')].filter((e) => getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().height > 100).length,
      );
      if (shown === 0) failed.push(slug);
      await page.close();
    }
    if (failed.length) throw new Error(`no printed sheet with height over 100 px on: ${failed.join(', ')}`);
    return {};
  } finally {
    await context.close();
  }
}

// 8. Reflow: at 320 px the page is no wider than the screen.
async function noOverflow(browser, base) {
  const paths = ['/', '/activity/fold-a-paper-boat/', '/games/garden-planner/', '/accessibility/'];
  const context = await newContext(browser, { viewport: { width: 320, height: 844 } });
  try {
    const wide = [];
    for (const path of paths) {
      const page = await context.newPage();
      await open(page, base, path);
      const width = await page.evaluate(() => document.documentElement.scrollWidth);
      if (width > 320) wide.push(`${path} (${width} px)`);
      await page.close();
    }
    if (wide.length) throw new Error(`scrolls sideways: ${wide.join(', ')}`);
    return {};
  } finally {
    await context.close();
  }
}

const FLOWS = [
  ['read-aloud', readAloud],
  ['short-steps', shortSteps],
  ['reading-settings', readingSettings],
  ['color-scheme', colorScheme],
  ['photo-pairs', photoPairs],
  ['scrapbook', scrapbook],
  ['game-print', gamePrint],
  ['no-overflow', noOverflow],
];

function cell(result) {
  if (result.status === 'ok') return result.detail ? `ok (${result.detail})` : 'ok';
  return `FAIL: ${result.reason}`;
}

async function runFlow(browser, base, run) {
  try {
    const out = (await run(browser, base)) ?? {};
    return { status: 'ok', detail: out.detail };
  } catch (error) {
    return { status: 'fail', reason: String(error.message ?? error).split('\n')[0] };
  }
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

  // A browser that cannot launch fails every flow in its column: a missing engine is not a pass.
  const browsers = new Map();
  const launchErrors = new Map();
  const notes = [];
  let failures = 0;
  let oks = 0;
  try {
    for (const [name, engine] of ENGINES) {
      try {
        browsers.set(name, await engine.launch({ timeout: LAUNCH_MS }));
      } catch (error) {
        launchErrors.set(name, `browser did not launch: ${String(error.message).split('\n')[0]}`);
      }
    }
    for (const [flow, run] of FLOWS) {
      const results = {};
      for (const [name] of ENGINES) {
        const browser = browsers.get(name);
        results[name] = browser ? await runFlow(browser, base, run) : { status: 'fail', reason: launchErrors.get(name) };
      }
      const cells = ENGINES.map(([name]) => `${name} ${cell(results[name])}`);
      console.log(`${flow.padEnd(17)} ${cells.join('  ')}`);
      for (const result of Object.values(results)) {
        if (result.status === 'fail') failures += 1;
        else oks += 1;
      }
    }
  } finally {
    for (const browser of browsers.values()) await browser.close();
    server?.close();
  }

  notes.push(
    'The site has no "Shorter lines" or "More space" control, so the reading-settings flow checks Dark, Larger text and Higher contrast only.',
    'The two test photos are the same 64 by 48 JPEG, sent under two names.',
    'WebKit is Playwright WebKit, not Safari. Safari on an Apple device is still to be checked by hand.',
  );
  console.log('\nNotes:');
  for (const note of notes) console.log(`  ${note}`);
  const total = FLOWS.length * ENGINES.length;
  console.log(`\nSummary: ${total} flow runs (${FLOWS.length} flows in ${ENGINES.length} browsers): ${oks} ok, ${failures} failed.`);
  process.exit(failures ? 1 : 0);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
