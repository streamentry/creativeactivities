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
  } finally {
    await browser.close();
    server?.close();
  }
  console.log(`\nChecked ${slugs.length} activity cards on A4 and US Letter: ${failures.length} not one two-sided sheet.`);
  process.exit(failures.length ? 1 : 0);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
