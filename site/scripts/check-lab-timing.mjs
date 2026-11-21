#!/usr/bin/env node
// Lab timing report (PLAT-036, SEO-028). Run after `pnpm build`.
//
// For one representative page per template, at four widths, Chromium loads the page from a local server of dist/
// with the CPU throttled 4x and a slow network (Lighthouse "slow 4G": 150 ms round trip, 1.6 Mbps down, 750 kbps up,
// cache off, service workers blocked). Each load records:
//   LCP  largest-contentful-paint, the last entry
//   CLS  layout-shift entries without recent input, in Core Web Vitals session windows
//   TBT  long tasks after First Contentful Paint, the part beyond 50 ms (a lab stand-in for INP)
// The page is read 1.5 s after its load event, so late shifts and images have time to land.
// Each page and width runs RUNS times, and the table shows the median of each metric.
//
// Targets (lab-timing-lib.mjs): LCP <= 2500 ms, CLS <= 0.1, TBT <= 200 ms. Report only by default.
//   node scripts/check-lab-timing.mjs            report, exit 0
//   node scripts/check-lab-timing.mjs --strict   exit 1 if any median misses a target or is not measured
//   node scripts/check-lab-timing.mjs --runs=1   fewer runs, for a quick look (default 3)
// Not part of CI. Needs the Chromium that Playwright installs (`pnpm exec playwright install chromium`).

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { serveDist } from './serve-dist.mjs';
import {
  clsFromShifts,
  compareToTargets,
  formatValue,
  hasMiss,
  missesOf,
  summarizeRuns,
  TARGETS,
  tbtFromLongTasks,
} from './lab-timing-lib.mjs';

const SITE_DIR = fileURLToPath(new URL('../', import.meta.url));
const DIST = join(SITE_DIR, 'dist');

/** Viewport sizes. Height only matters for the first screen the browser paints. */
const WIDTHS = [
  { width: 320, height: 640 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
];

/** Lighthouse "slow 4G" profile, in bytes per second for the throughput fields. */
const NETWORK = {
  offline: false,
  latency: 150,
  downloadThroughput: (1.6 * 1000 * 1000) / 8,
  uploadThroughput: (750 * 1000) / 8,
};
const CPU_RATE = 4;
const SETTLE_MS = 1500;
const LOAD_TIMEOUT_MS = 120_000;

/** One representative page per template. Paths are relative to dist/ and must have an index.html. */
const TEMPLATES = [
  { name: 'home', path: '/' },
  { name: 'activity card', path: '/activity/arrange-flowers-together/' },
  { name: 'hub', path: '/activities-for-seniors/' },
  { name: 'guide', path: '/caregiving/after-dementia-diagnosis/' },
  { name: 'finder', path: '/activity/' },
  { name: 'game', path: '/games/picture-pairs/' },
  { name: 'games index', path: '/games/' },
  { name: 'translated guide', path: '/de/caregiving/after-dementia-diagnosis/' },
];

const argValue = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const STRICT = process.argv.includes('--strict');
const RUNS = Math.max(1, Number(argValue('runs') ?? 3));

/**
 * Runs in the page before any script. Records the entries the metrics need, so nothing is missed while the page
 * loads. `buffered: true` also picks up entries from before the observer was created.
 */
const OBSERVE = () => {
  const lab = (window.__lab = { lcp: null, fcp: null, shifts: [], longTasks: [] });
  const observe = (type, onEntry) => {
    try {
      new PerformanceObserver((list) => list.getEntries().forEach(onEntry)).observe({ type, buffered: true });
    } catch {
      // Unsupported entry type in this browser: the metric stays null and is reported as n/a.
    }
  };
  observe('largest-contentful-paint', (e) => {
    lab.lcp = e.startTime;
  });
  observe('paint', (e) => {
    if (e.name === 'first-contentful-paint') lab.fcp = e.startTime;
  });
  observe('layout-shift', (e) => lab.shifts.push({ startTime: e.startTime, value: e.value, hadRecentInput: e.hadRecentInput }));
  observe('longtask', (e) => lab.longTasks.push({ startTime: e.startTime, duration: e.duration }));
};

/** One cold, throttled load of one page at one width. Returns the raw numbers for the metrics. */
async function measureOnce(browser, base, template, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    serviceWorkers: 'block',
  });
  try {
    const page = await context.newPage();
    await page.addInitScript(OBSERVE);
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    await cdp.send('Network.emulateNetworkConditions', NETWORK);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU_RATE });

    const response = await page.goto(base + template.path, { waitUntil: 'load', timeout: LOAD_TIMEOUT_MS });
    if (!response || response.status() !== 200) {
      throw new Error(`${template.path} answered ${response?.status() ?? 'no response'}`);
    }
    await page.waitForTimeout(SETTLE_MS);
    const lab = await page.evaluate(() => window.__lab);
    return {
      lcp: lab.lcp,
      cls: clsFromShifts(lab.shifts),
      tbt: tbtFromLongTasks(lab.longTasks, lab.fcp),
    };
  } finally {
    await context.close();
  }
}

function printTemplate(template, rows) {
  console.log(`\n== ${template.name} (${template.path}) ==`);
  console.log('width  LCP ms   CLS     TBT ms   result');
  for (const row of rows) {
    const { median, comparison } = row;
    const misses = missesOf(comparison);
    const cols = [
      String(row.width).padEnd(6),
      formatValue('lcp', median.lcp).padStart(7),
      formatValue('cls', median.cls).padStart(7),
      formatValue('tbt', median.tbt).padStart(8),
    ];
    console.log(`${cols.join('  ')}   ${misses.length ? `MISS ${misses.join(', ')}` : 'ok'}`);
  }
}

async function main() {
  if (!existsSync(join(DIST, 'index.html'))) {
    console.error('dist/ is missing. Run `pnpm build` first.');
    process.exit(1);
  }
  const missing = TEMPLATES.filter((t) => !existsSync(join(DIST, t.path, 'index.html')));
  if (missing.length) {
    console.error(`Template page(s) not in dist/: ${missing.map((t) => t.path).join(', ')}`);
    process.exit(1);
  }

  const server = serveDist(DIST);
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  const base = `http://127.0.0.1:${server.address().port}`;
  const started = Date.now();

  const browser = await chromium.launch();
  const report = [];
  let loads = 0;
  try {
    for (const template of TEMPLATES) {
      const rows = [];
      for (const viewport of WIDTHS) {
        const runs = [];
        for (let i = 0; i < RUNS; i += 1) {
          runs.push(await measureOnce(browser, base, template, viewport));
          loads += 1;
        }
        const median = summarizeRuns(runs);
        rows.push({ width: viewport.width, runs, median, comparison: compareToTargets(median, TARGETS) });
      }
      report.push({ template, rows });
    }
  } finally {
    await browser.close();
    server.close();
  }

  for (const entry of report) printTemplate(entry.template, entry.rows);

  const misses = report.flatMap((entry) => entry.rows.filter((row) => hasMiss(row.comparison)).map((row) => ({ entry, row })));
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  console.log(`\nTargets: LCP <= ${TARGETS.lcp} ms, CLS <= ${TARGETS.cls}, TBT <= ${TARGETS.tbt} ms (median of ${RUNS} runs).`);
  console.log(`Method: Chromium, CPU ${CPU_RATE}x, slow 4G (150 ms, 1.6 Mbps down, 750 kbps up), cache off, ${loads} cold loads.`);
  console.log(`Templates: ${TEMPLATES.length} at ${WIDTHS.length} widths. ${misses.length} template/width pair(s) miss a target. ${seconds} s.`);
  for (const { entry, row } of misses) {
    console.log(`  ${entry.template.name} at ${row.width}: ${missesOf(row.comparison).join(', ')}`);
  }
  process.exit(STRICT && misses.length ? 1 : 0);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
