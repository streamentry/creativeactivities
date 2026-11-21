#!/usr/bin/env node
// Group mode in a real browser (WEB-046: one step per screen, the person leading moves on, nothing counts down).
// For every activity card in dist/activity/<slug>/ it opens the view and walks the whole of it in Chromium: the start
// screen with the card's summary, materials and note, each step in order with the step's own words, the last screen
// with the card's stop note, focus staying on the button that was pressed, what a screen reader is told, Previous, Done
// for now, the keys (a held key moves once; a press on a blank part keeps them working), Pause and Carry on, Tab, print,
// Escape, and opening again. Picture captions inside a step are not read as the step. Then, for the three most
// demanding cards, it opens the view at eight screen sizes and again at 200% text, and checks that nothing runs off the
// screen, every button can be brought wholly on screen and is large enough, the type is large, and there is room for a
// line to read. Last, it checks that no card page is wider than a 320 px screen, since the button added a row to the
// head. The page's own content security policy is enforced (unlike the accessibility check), so a style or script the
// page would refuse fails here.
// Not covered: Firefox and Safari, a real tablet, TV or presenter's clicker, and a screen reader.
// Usage: node scripts/check-group-stage.mjs            (serves dist/ on a free local port; run `pnpm build` first)
//        node scripts/check-group-stage.mjs --base=http://127.0.0.1:4345
// First-time browser install: pnpm exec playwright install chromium

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { serveDist } from './serve-dist.mjs';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const CONCURRENCY = 4;
/** A tablet held sideways; the walk-through runs here. */
const TABLET = { width: 1180, height: 820 };
/** The walk-through also runs on a tablet held upright and sideways (WEB-046: portrait and landscape). */
const TABLET_PORTRAIT = { width: 768, height: 1024 };
const TABLET_LANDSCAPE = { width: 1024, height: 768 };
const WALK_SIZES = [
  { label: 'tablet 1180x820', viewport: TABLET },
  { label: 'tablet portrait', viewport: TABLET_PORTRAIT },
  { label: 'tablet landscape', viewport: TABLET_LANDSCAPE },
];
/** The reflow size (320 wide at 400% zoom), a small phone, a phone either way, tablets either way, a laptop and a large screen. */
const SIZES = [
  { width: 320, height: 256 },
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 667, height: 375 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  TABLET,
  { width: 1440, height: 900 },
];
/** 200% text is checked on screens at least this tall: on a shorter one it is two things at once that nobody asks for. */
const TALL_ENOUGH_FOR_BIG_TEXT = 568;
const MIN_TARGET = 48;
const MIN_STEP_TYPE_PX = 32;
const MIN_ANY_TYPE_PX = 24;
/** A line of the large type, as a multiple of its size. */
const LINE = 1.3;
const PRIMARY = 'dialog.group-stage [data-primary]';
const visibleButton = (text) => `dialog.group-stage button:not([hidden]):has-text("${text}")`;

/** What the card page says, read from the page itself so the view is checked against it, not against a copy. */
const readFacts = (page) =>
  page.evaluate(() => {
    const squash = (s) => (s ?? '').replace(/\s+/g, ' ').trim();
    const own = (li) => squash([...li.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent).join(' '));
    return {
      name: squash(document.querySelector('[data-stage="title"]')?.textContent),
      summary: squash(document.querySelector('[data-stage="summary"]')?.textContent),
      steps: [...document.querySelectorAll('[data-stage="steps"] > li')].map(own),
      materials: [...document.querySelectorAll('[data-stage="materials"] > li')].map((li) => squash(li.textContent)),
      stop: squash(document.querySelector('[data-stage="stop"]')?.textContent),
      // The note about pausing or stopping is the paragraph after the stop note on the page.
      pause: squash(document.querySelector('.activity-stop p:not([data-stage])')?.textContent),
    };
  });

/** What the open view looks like right now; null when it is not open. Each button is scrolled into view before it is measured. */
const snapshot = (page) =>
  page.evaluate(() => {
    const d = document.querySelector('dialog.group-stage');
    if (!d || !d.open) return null;
    const body = d.querySelector('.group-stage__body');
    const bar = d.querySelector('.group-stage__bar');
    const live = d.querySelector('[role="status"]');
    const cs = getComputedStyle(d);
    const rect = d.getBoundingClientRect();
    const bodyStyle = getComputedStyle(body);
    const buttons = [...d.querySelectorAll('button')]
      .filter((b) => !b.hidden)
      .map((b) => {
        b.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        const q = b.getBoundingClientRect();
        return { text: b.textContent.trim(), disabled: b.disabled, primary: b.classList.contains('btn--primary'), left: q.left, right: q.right, top: q.top, bottom: q.bottom, width: q.width, height: q.height };
      });
    const sizes = [...d.querySelectorAll('.group-stage__label, .group-stage__title, .group-stage__summary, .group-stage__subhead, .group-stage__list li, .group-stage__text, .group-stage__note')].map((e) => parseFloat(getComputedStyle(e).fontSize));
    const big = d.querySelector('.group-stage__text, .group-stage__title');
    const at = document.activeElement;
    return {
      vw: innerWidth,
      vh: innerHeight,
      width: rect.width,
      height: rect.height,
      position: cs.position,
      display: cs.display,
      name: d.getAttribute('aria-label') ?? '',
      hint: document.getElementById(d.getAttribute('aria-describedby') ?? '')?.textContent ?? '',
      label: d.querySelector('.group-stage__label')?.textContent ?? '',
      text: (body.innerText ?? '').replace(/\s+/g, ' ').trim(),
      spoken: (live?.textContent ?? '').replace(/\s+/g, ' ').trim(),
      buttons,
      shown: buttons.map((b) => b.text).join('|'),
      primaryCount: buttons.filter((b) => b.primary).length,
      primaryText: buttons.find((b) => b.primary)?.text ?? '',
      activeText: at?.textContent?.trim() ?? '',
      activeIs: at === d ? 'view' : at && d.contains(at) ? 'inside' : 'outside',
      overflowX: d.scrollWidth > d.clientWidth + 1 || body.scrollWidth > body.clientWidth + 1,
      scrolls: body.scrollHeight > body.clientHeight + 1,
      bodyTabIndex: body.tabIndex,
      room: body.clientHeight - parseFloat(bodyStyle.paddingTop) - parseFloat(bodyStyle.paddingBottom),
      barHeight: bar.getBoundingClientRect().height,
      bigPx: big ? parseFloat(getComputedStyle(big).fontSize) : 0,
      minPx: sizes.length ? Math.min(...sizes) : 0,
    };
  });

/** A page with the page's own errors, console errors and any request to another address collected. */
async function openCard(browser, base, slug, viewport) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const noted = [];
  const origin = new URL(base).origin;
  page.on('pageerror', (error) => noted.push(`page error: ${error.message.split('\n')[0]}`));
  page.on('console', (message) => {
    if (message.type() === 'error') noted.push(`console error: ${message.text().split('\n')[0].slice(0, 160)}`);
  });
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.protocol.startsWith('http') && url.origin !== origin) noted.push(`request to another address: ${url.origin}`);
  });
  await page.goto(`${base}/activity/${slug}/`, { waitUntil: 'networkidle', timeout: 90000 });
  return { context, page, noted };
}

async function openView(page) {
  await page.waitForSelector('[data-group-stage]:not([hidden])', { timeout: 10000 });
  await page.click('[data-group-stage]');
  await page.waitForSelector('dialog.group-stage[open] .group-stage__slide', { timeout: 10000 });
}

/**
 * Opens the view without scrolling the page to its button. On a screen as short as 320 by 256 the page's own scroll
 * padding is taller than the screen, so no browser can scroll the button into view (an existing site-wide limit, not
 * the view's); the fit checks are about the view, so they press the button by script there.
 */
async function openViewByScript(page) {
  await page.waitForSelector('[data-group-stage]:not([hidden])', { timeout: 10000 });
  await page.evaluate(() => document.querySelector('[data-group-stage]').click());
  await page.waitForSelector('dialog.group-stage[open] .group-stage__slide', { timeout: 10000 });
}

/** Opens the view and checks the whole of it on one card at tablet size. Returns the problems found. */
async function walkThrough(browser, base, slug, viewport = TABLET) {
  const { context, page, noted } = await openCard(browser, base, slug, viewport);
  const problems = [];
  const expect = (ok, message) => {
    if (!ok) problems.push(message);
  };
  const hasDone = (s) => s.buttons.some((b) => b.text === 'Done for now');
  const labelAfter = async (key) => {
    await page.keyboard.press(key);
    return (await snapshot(page))?.label;
  };
  try {
    const facts = await readFacts(page);
    const n = facts.steps.length;
    if (!facts.name || !facts.summary || n === 0 || !facts.stop || !facts.pause || facts.materials.length === 0) return ['the page has no card text marked for the view'];
    await openView(page);
    let s = await snapshot(page);

    // The view itself: styled, full screen, named, described, and its start screen complete.
    expect(s.display === 'flex' && s.position === 'fixed', `the styles did not apply (display ${s.display}, position ${s.position})`);
    expect(Math.abs(s.width - s.vw) <= 1 && Math.abs(s.height - s.vh) <= 1, `not full screen (${s.width} by ${s.height} in ${s.vw} by ${s.vh})`);
    expect(s.name === facts.name, `the view is named "${s.name}", not "${facts.name}"`);
    expect(/right arrow/i.test(s.hint) && /left arrow/i.test(s.hint), 'the view is not described to a screen reader');
    expect(s.label === 'Before you start', `start label is "${s.label}"`);
    expect(s.text.includes(facts.name), 'the start screen does not show the card name');
    expect(s.text.includes(facts.summary), 'the start screen does not show the summary');
    for (const material of facts.materials) expect(s.text.includes(material), `material missing from the start screen: ${material.slice(0, 40)}`);
    expect(s.text.includes(facts.pause), 'the start screen does not show the note about pausing');
    expect(s.spoken.includes(facts.name) && s.spoken.includes(facts.summary) && s.spoken.includes(facts.pause) && facts.materials.every((m) => s.spoken.includes(m)), 'the start screen is not read out in full');
    expect(s.activeText === 'Next', `focus starts on "${s.activeText}", not Next`);
    expect(s.primaryCount === 1, `${s.primaryCount} filled buttons on the start screen`);
    expect(s.buttons.find((b) => b.text === 'Previous')?.disabled === true, 'Previous is not disabled on the first screen');
    expect(hasDone(s), 'no Done for now on the start screen');

    // Each step, with the Next button: the card's words, the number, read out, focus staying on Next.
    for (let i = 1; i <= n; i++) {
      await page.click(PRIMARY);
      s = await snapshot(page);
      expect(s.label === `Step ${i} of ${n}`, `screen ${i + 1} is labelled "${s.label}", expected "Step ${i} of ${n}"`);
      expect(s.text.includes(facts.steps[i - 1]), `step ${i} does not show the card's words`);
      expect(s.spoken === `Step ${i} of ${n}. ${facts.steps[i - 1]}`, `step ${i} is read out as "${s.spoken.slice(0, 60)}"`);
      expect(s.activeText === 'Next', `focus is on "${s.activeText}" after step ${i}, not Next`);
      expect(s.primaryText === 'Next' && hasDone(s), `step ${i} shows "${s.shown}"`);
    }

    // The last screen: the card's own stop note, and Done for now as the one filled button.
    await page.click(PRIMARY);
    s = await snapshot(page);
    expect(s.text.includes(facts.stop) && s.spoken.includes(facts.stop), "the last screen does not show and read out the card's stop note");
    expect(s.primaryText === 'Done for now' && s.primaryCount === 1, `the last screen has "${s.primaryText}" as the filled button`);
    expect(s.shown === 'Previous|Pause|Done for now', `last screen buttons: ${s.shown}`);
    expect(s.activeText === 'Done for now', `focus is on "${s.activeText}" on the last screen`);

    // Previous keeps focus on Previous; at the first screen it switches off and focus moves to the filled button.
    await page.click(visibleButton('Previous'));
    s = await snapshot(page);
    expect(s.label === `Step ${n} of ${n}` && s.activeText === 'Previous', `Previous went to "${s.label}" with focus on "${s.activeText}"`);
    for (let i = 0; i < n; i++) await page.click(visibleButton('Previous'));
    s = await snapshot(page);
    expect(s.label === 'Before you start', `Previous did not return to the start (${s.label})`);
    expect(s.activeText === 'Next' && s.buttons.find((b) => b.text === 'Previous')?.disabled === true, `at the start focus is on "${s.activeText}"`);
    for (let i = 0; i < n; i++) await page.click(PRIMARY);

    // Keys: Left and Page Up go back, Right and Page Down go on; a held key moves once.
    expect((await labelAfter('ArrowLeft')) === (n > 1 ? `Step ${n - 1} of ${n}` : 'Before you start'), 'Left arrow did not go back one screen');
    expect((await labelAfter('PageDown')) === `Step ${n} of ${n}`, 'Page Down did not go on one screen');
    expect((await labelAfter('ArrowRight')) === 'After the steps', 'Right arrow did not go on to the last screen');
    expect((await labelAfter('PageUp')) === `Step ${n} of ${n}`, 'Page Up did not go back from the last screen');
    await page.keyboard.down('ArrowLeft');
    await page.keyboard.down('ArrowLeft');
    await page.keyboard.down('ArrowLeft');
    await page.keyboard.up('ArrowLeft');
    expect((await snapshot(page)).label === (n > 1 ? `Step ${n - 1} of ${n}` : 'Before you start'), 'a held key moved more than one screen');
    await page.keyboard.press('ArrowRight');

    // A press on a blank part of the view keeps focus in it, and the keys still work.
    await page.mouse.click(6, 6);
    s = await snapshot(page);
    expect(s.activeIs !== 'outside', 'a press on a blank part of the view took focus out of it');
    expect((await labelAfter('ArrowRight')) === 'After the steps', 'the keys stopped working after a press on a blank part of the view');
    await page.keyboard.press('ArrowLeft');

    // Pause hides the step; keys do nothing while paused; Carry on returns to the same step; Done for now stays.
    await page.click(visibleButton('Pause'));
    s = await snapshot(page);
    expect(!s.text.includes(facts.steps[n - 1]) && s.text.includes('Paused'), 'the step is still shown while paused');
    expect(s.shown === 'Done for now|Carry on', `paused buttons: ${s.shown}`);
    expect(s.activeText === 'Carry on', `focus is on "${s.activeText}" while paused, not Carry on`);
    expect(s.spoken.includes('Paused'), 'the pause is not read out');
    await page.keyboard.press('ArrowRight');
    expect((await snapshot(page)).text.includes('Paused'), 'a key moved on while paused');
    await page.click(PRIMARY);
    s = await snapshot(page);
    expect(s.label === `Step ${n} of ${n}` && s.activeText === 'Next', `Carry on returned to "${s.label}" with focus on "${s.activeText}"`);
    expect(s.spoken.includes(facts.steps[n - 1]), 'Carry on did not read the step out again');

    // The page behind is out of reach: Tab visits every enabled button in the view and nothing on the page behind it.
    // After the last button the browser may move on to its own controls (then nothing in the page has focus); that is
    // the way out, not a trap.
    const reached = new Set();
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const stop = await page.evaluate(() => {
        const a = document.activeElement;
        const d = document.querySelector('dialog.group-stage');
        if (!a || a === document.body || a === document.documentElement) return { where: 'browser', text: '' };
        return { where: d.contains(a) ? 'view' : 'page behind', text: a.textContent.trim() };
      });
      if (stop.where === 'page behind') {
        problems.push('Tab reached the page behind the view');
        break;
      }
      if (stop.where === 'view') reached.add(stop.text);
    }
    for (const b of (await snapshot(page)).buttons.filter((x) => !x.disabled)) expect(reached.has(b.text), `Tab did not reach "${b.text}"`);

    // Printing the page does not print the view.
    await page.emulateMedia({ media: 'print' });
    const printed = await page.evaluate(() => getComputedStyle(document.querySelector('dialog.group-stage')).display);
    expect(printed === 'none', `the view would print (display ${printed})`);
    await page.emulateMedia({ media: 'screen' });

    // Done for now (the plain button, not the filled one) ends the view and puts the person back on the button.
    const ended = async (how) => {
      try {
        await page.waitForSelector('dialog.group-stage', { state: 'detached', timeout: 5000 });
      } catch {
        problems.push(`${how} did not close the view`);
        return;
      }
      const back = await page.evaluate(() => ({ onButton: !!document.activeElement?.hasAttribute('data-group-stage'), locked: document.documentElement.classList.contains('group-stage-open') }));
      expect(back.onButton, `focus did not return to the button after ${how}`);
      expect(!back.locked, `the page is still locked from scrolling after ${how}`);
    };
    await page.click(visibleButton('Done for now'));
    await ended('Done for now');

    // Opening again starts from the beginning; Escape ends it the same way.
    await openView(page);
    s = await snapshot(page);
    expect(s.label === 'Before you start' && s.activeText === 'Next', `reopened on "${s.label}" with focus on "${s.activeText}"`);
    await page.keyboard.press('Escape');
    await ended('Escape');
    problems.push(...[...new Set(noted)]);
  } catch (error) {
    problems.push(`ERROR ${String(error.message).split('\n')[0]}`);
  } finally {
    await context.close();
  }
  return problems;
}

/** A picture and caption inside a step belong to the picture: the view shows the step's words and not the caption. */
async function captionCheck(browser, base, slug) {
  const { context, page } = await openCard(browser, base, slug, TABLET);
  const problems = [];
  try {
    const facts = await readFacts(page);
    await page.evaluate(() => {
      const li = document.querySelector('[data-stage="steps"] > li');
      const figure = document.createElement('figure');
      const caption = document.createElement('figcaption');
      caption.textContent = 'INJECTED CAPTION TEXT';
      figure.append(caption);
      li.append(figure);
    });
    await openView(page);
    await page.click(PRIMARY);
    const s = await snapshot(page);
    if (!s.text.includes(facts.steps[0])) problems.push('with a picture caption in the step, the step text is not shown');
    if (/INJECTED CAPTION/.test(s.text) || /INJECTED CAPTION/.test(s.spoken)) problems.push('a picture caption was read as part of the step');
  } catch (error) {
    problems.push(`ERROR ${String(error.message).split('\n')[0]}`);
  } finally {
    await context.close();
  }
  return problems;
}

/** One card at one screen size and text size: the start, the longest step and the last screen, each checked for fit. */
async function fit(browser, base, slug, size, bigText) {
  const { context, page, noted } = await openCard(browser, base, slug, size);
  const problems = [];
  const where = `${slug} ${size.width}x${size.height}${bigText ? ' text 200%' : ''}`;
  try {
    if (bigText) await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    const facts = await readFacts(page);
    const longest = facts.steps.reduce((best, step, i) => (step.length > facts.steps[best].length ? i : best), 0) + 1;
    await openViewByScript(page);
    const check = async (screen) => {
      const s = await snapshot(page);
      const note = (text) => problems.push(`${where}, ${screen}: ${text}`);
      if (s.overflowX) note('runs off the side of the screen');
      for (const b of s.buttons) {
        if (b.left < -0.5 || b.top < -0.5 || b.right > s.vw + 0.5 || b.bottom > s.vh + 0.5) note(`button "${b.text}" cannot be brought wholly on the screen`);
        if (b.width < MIN_TARGET || b.height < MIN_TARGET) note(`button "${b.text}" is ${Math.round(b.width)} by ${Math.round(b.height)}, under ${MIN_TARGET}`);
      }
      if (s.primaryCount !== 1) note(`${s.primaryCount} filled buttons`);
      // A screen that scrolls must be a stop in the Tab order (or a keyboard cannot scroll it), and one that does not must not be.
      if (s.scrolls && s.bodyTabIndex !== 0) note('the screen scrolls but the keyboard cannot reach it');
      if (!s.scrolls && s.bodyTabIndex === 0) note('the screen does not scroll but is a Tab stop');
      if (s.bigPx < MIN_STEP_TYPE_PX) note(`step and title type is ${s.bigPx}px, under ${MIN_STEP_TYPE_PX}`);
      if (s.minPx < MIN_ANY_TYPE_PX) note(`some type is ${s.minPx}px, under ${MIN_ANY_TYPE_PX}`);
      if (s.room < LINE * s.bigPx) note(`the buttons leave ${Math.round(s.room)}px to read in, under one line of ${Math.round(LINE * s.bigPx)}px`);
      if (s.barHeight > 0.45 * s.vh + 1) note(`the buttons take ${Math.round(s.barHeight)}px of ${s.vh}px`);
    };
    await check('start');
    for (let i = 1; i <= facts.steps.length + 1; i++) {
      await page.click(PRIMARY);
      if (i === longest) await check(`step ${i}, the longest`);
      if (i === facts.steps.length + 1) await check('last screen');
    }
    problems.push(...[...new Set(noted)].map((m) => `${where}: ${m}`));
  } catch (error) {
    problems.push(`${where}: ERROR ${String(error.message).split('\n')[0]}`);
  } finally {
    await context.close();
  }
  return problems;
}

/** A card page is no wider than a 320 px screen: the button added a row to the head, and a tilted sheet behind it grows with the head. */
async function narrowPage(browser, base, slug) {
  const context = await browser.newContext({ viewport: { width: 320, height: 900 }, reducedMotion: 'reduce' });
  try {
    const page = await context.newPage();
    await page.goto(`${base}/activity/${slug}/`, { waitUntil: 'networkidle', timeout: 90000 });
    const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    return wide > 0 ? [`the page is ${wide}px wider than a 320px screen`] : [];
  } catch (error) {
    return [`ERROR ${String(error.message).split('\n')[0]}`];
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

/** The cards that stress the layout most, read from their pages: most steps, longest step, most materials. */
async function demanding(browser, base, slugs) {
  const context = await browser.newContext({ viewport: TABLET });
  const page = await context.newPage();
  const stats = [];
  try {
    for (const slug of slugs) {
      await page.goto(`${base}/activity/${slug}/`, { waitUntil: 'domcontentloaded' });
      const f = await readFacts(page);
      stats.push({ slug, steps: f.steps.length, longest: Math.max(...f.steps.map((s) => s.length)), materials: f.materials.length });
    }
  } finally {
    await context.close();
  }
  const top = (key) => [...stats].sort((a, b) => b[key] - a[key] || a.slug.localeCompare(b.slug))[0].slug;
  return [...new Set([top('steps'), top('longest'), top('materials')])];
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

  // Every card on disk must have a built page. A withdrawn card is not for use, so it has no view.
  const cardIds = readdirSync(new URL('../src/content/activity-cards/', import.meta.url)).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)).sort();
  const missing = cardIds.filter((id) => !existsSync(join(DIST, 'activity', id, 'index.html')));
  if (missing.length > 0) {
    console.error(`No built page for ${missing.length} card(s): ${missing.slice(0, 5).join(', ')}. Run \`pnpm build\` first.`);
    process.exit(1);
  }
  const slugs = cardIds.filter((id) => !readFileSync(join(DIST, 'activity', id, 'index.html'), 'utf8').includes('activity-withdrawn'));
  if (slugs.length === 0) {
    console.error('No activity cards to check.');
    process.exit(1);
  }

  const browser = await chromium.launch();
  let walked;
  let captions;
  let narrow;
  let sample;
  let fitResults;
  let jobs;
  try {
    const walkJobs = slugs.flatMap((slug) => WALK_SIZES.map((size) => ({ slug, size })));
    walked = await pool(walkJobs, CONCURRENCY, async ({ slug, size }) => ({
      slug,
      size: size.label,
      problems: await walkThrough(browser, base, slug, size.viewport),
    }));
    captions = await captionCheck(browser, base, slugs[0]);
    narrow = await pool(slugs, CONCURRENCY, async (slug) => ({ slug, problems: await narrowPage(browser, base, slug) }));
    sample = await demanding(browser, base, slugs);
    jobs = sample.flatMap((slug) => SIZES.flatMap((size) => [false, true].filter((bigText) => !bigText || size.height >= TALL_ENOUGH_FOR_BIG_TEXT).map((bigText) => ({ slug, size, bigText }))));
    fitResults = await pool(jobs, CONCURRENCY, (job) => fit(browser, base, job.slug, job.size, job.bigText));
  } finally {
    await browser.close();
    server?.close();
  }

  for (const { slug, size, problems } of walked) {
    console.log(`${slug.padEnd(42)} ${size.padEnd(18)} ${problems.length === 0 ? 'ok' : 'FAIL'}`);
    for (const p of problems) console.log(`  ${p}`);
  }
  for (const p of captions) console.log(`  FAIL caption check: ${p}`);
  for (const { slug, problems } of narrow) for (const p of problems) console.log(`  FAIL ${slug} at 320px: ${p}`);
  for (const p of fitResults.flat()) console.log(`  FAIL ${p}`);
  const walkFailed = walked.filter((w) => w.problems.length > 0).length;
  const walkTotal = walked.length;
  const narrowFailed = narrow.filter((w) => w.problems.length > 0).length;
  const fitFailed = fitResults.filter((r) => r.length > 0).length;
  console.log(`Fit checked on ${sample.join(', ')} at ${SIZES.length} screen sizes, at normal text and (on screens at least ${TALL_ENOUGH_FOR_BIG_TEXT}px tall) 200% text.`);
  console.log(
    `\nGroup view: ${walkTotal - walkFailed} of ${walkTotal} walk-throughs pass (${slugs.length} cards at ${WALK_SIZES.length} tablet sizes); ${jobs.length - fitFailed} of ${jobs.length} fit checks pass; ` +
      `${slugs.length - narrowFailed} of ${slugs.length} card pages fit a 320px screen; picture captions ${captions.length === 0 ? 'are left out of the steps' : 'FAIL'}.`,
  );
  process.exit(walkFailed > 0 || fitFailed > 0 || narrowFailed > 0 || captions.length > 0 ? 1 : 0);
}

await main();
