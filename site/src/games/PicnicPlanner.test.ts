import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PICNIC_FOOD, PICNIC_ITEMS, PICNIC_OUTINGS } from '../data/picnic-planner';
import { GAMES } from '../data/games';
import { PICTURE_BY_ID } from '../data/pictures';
import { playProps } from '../i18n/play';
import { SLOTS } from '../lib/games/picnic-planner';
import PicnicPlanner from './PicnicPlanner';

const props = playProps('en', 'picnic-planner');
const render = () => renderToStaticMarkup(createElement(PicnicPlanner, props));
const t = props.ui.picnicPlanner;
const source = readFileSync(new URL('./PicnicPlanner.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles/games.css', import.meta.url), 'utf8');

/** Words the picnic copy must never use: diet, health and clinical framing, and points. */
const BANNED = /\b(healthy|health|diet|dietary|nutrition|nutritious|care plan|score|scores|scored|points?|calories?)\b/i;

describe('PicnicPlanner', () => {
  it('starts with the guidance, an empty basket, the trays, the notice and the planning buttons', () => {
    const html = render();

    expect(html).toContain(t.guidance);
    expect(html).toContain(t.summaryNone);
    // React escapes the apostrophe in "Let's" in static markup.
    expect(html).toContain(t.play.replace(/'/g, '&#x27;'));
    expect(html).toContain(t.print);
    expect(html).toContain('Rest for now');
    expect(html).toContain('Done for now');
    expect(html).toContain('Start again');
    expect(html.indexOf('class="picnic__basket"')).toBeLessThan(html.indexOf('class="picnic__tray-section"'));
  });

  it('draws six basket slots, all empty at the start', () => {
    const html = render();
    const slots = html.match(/<li class="picnic__slot picnic__slot--empty">/g) ?? [];

    expect(slots).toHaveLength(SLOTS);
    expect(html).not.toContain('class="picnic__slot"');
  });

  it('lists every food and things-to-do picture as a native button, none in the basket at the start', () => {
    const html = render();
    const picks = html.match(/<button[^>]*class="picnic__pick"[^>]*>/g) ?? [];

    expect(picks).toHaveLength(PICNIC_ITEMS.length);
    for (const tag of picks) expect(tag).toMatch(/type="button"/);
    for (const item of PICNIC_ITEMS) expect(html).toContain(props.pictureNames[item.id] ?? '∅');
    expect(html).not.toContain('picnic__in');
  });

  it('shows every tray picture by a library id that exists', () => {
    for (const item of PICNIC_ITEMS) expect(PICTURE_BY_ID.has(item.id), item.id).toBe(true);
    expect(PICNIC_FOOD.length + PICNIC_OUTINGS.length).toBe(PICNIC_ITEMS.length);
  });

  it('gives every picture an explicit width and height', () => {
    const html = render();
    const images = html.match(/<img[^>]*>/g) ?? [];

    expect(images.length).toBeGreaterThanOrEqual(PICNIC_ITEMS.length);
    for (const tag of images) {
      expect(tag, tag).toMatch(/ width="\d+"/);
      expect(tag, tag).toMatch(/ height="\d+"/);
    }
  });

  it('never puts a focusable element inside an aria-hidden container', () => {
    const html = render();
    // Shared components (Icon, GameFrame) may mark decorative icons; no interactive element may be hidden.
    expect(html.match(/<(button|a|input|select|textarea)[^>]*aria-hidden/g)).toBeNull();
    const own = html.slice(html.indexOf('class="picnic__basket"'), html.indexOf('class="picnic__notice"'));
    expect(own).not.toContain('aria-hidden');
    expect(source).not.toContain('aria-hidden');
  });

  it('prints the checklist outside the game frame, with six blank lines when nothing is chosen', () => {
    const html = render();
    const sheetAt = html.indexOf('class="sheet picnic-sheet"');
    expect(sheetAt).toBeGreaterThan(-1);
    const sheet = html.slice(sheetAt);

    expect(html.slice(0, sheetAt)).toContain('class="picnic__basket"');
    expect(sheet).toContain(`<h2>${t.sheetTitle}</h2>`);
    expect(sheet).toContain(t.sheetToPack);
    expect(sheet.match(/class="picnic-sheet__row picnic-sheet__row--blank"/g)).toHaveLength(SLOTS);
    expect(sheet.match(/class="picnic-sheet__box"/g)).toHaveLength(SLOTS);
    expect(sheet).toContain(t.notice);
    expect(sheet).not.toMatch(/<(button|input|select|textarea|a )/);
  });

  it('hides the checklist on screen only, with an @media screen rule, and shows it in print', () => {
    const screen = css.match(/@media screen \{\s*\.picnic-sheet \{\s*display: none;\s*\}\s*\}/);
    expect(screen).not.toBeNull();
    const outside = css.replace(/@media screen \{\s*\.picnic-sheet \{\s*display: none;\s*\}\s*\}/, '');
    expect(outside).not.toMatch(/\.picnic-sheet \{[^}]*display: none/);
    expect(css).toMatch(/@media print \{[\s\S]*?\.picnic-sheet \{\s*display: block;/);
  });

  it('keeps the print sheet beside the frame, not inside the game frame', () => {
    expect(source).toMatch(/<\/GameFrame>\s*\{\/\*[\s\S]*?\*\/\}\s*<section className="sheet picnic-sheet">/);
  });

  it('prints the guidance line that the paper version reads from ui.picnicPlanner.guidance', () => {
    expect(source).toContain('ui.picnicPlanner.guidance');
    expect(source).toContain('window.print()');
  });

  it('uses no storage, network, clock or counter', () => {
    expect(source).not.toMatch(/localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest|navigator\.sendBeacon|document\.cookie/);
    expect(source).not.toMatch(/setTimeout|setInterval|requestAnimationFrame|Date\.now|performance\.now/);
    expect(source).not.toMatch(/\b(score|moves?|mistakes?|attempts?|streak|countdown)\b/i);
  });

  it('has no pressure, praise or health words in any English string or in the game listing', () => {
    const text = JSON.stringify(t);
    expect(text).not.toMatch(BANNED);
    expect(text).not.toMatch(/\b(win|wins|winner|won|lose|lost|miss|misses|wrong|incorrect|fail|mistake|try again|well done|great|lovely|beautiful|correct)\b/i);
    expect(text).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u);

    const game = GAMES.find((g) => g.slug === 'picnic-planner');
    expect(game).toBeDefined();
    const copy = JSON.stringify({ intro: game?.intro, howTo: game?.howTo, tips: game?.tips, description: game?.description, short: game?.short });
    expect(copy).not.toMatch(/\b(healthy|health|diet|dietary|nutrition|nutritious|care plan|calories?)\b/i);
  });

  it('uses the English text until a locale has a reviewed translation', () => {
    expect(playProps('xx', 'picnic-planner').ui.picnicPlanner.summary).toBe('Our picnic: {list}.');
  });

  it('starts every tap from the latest basket, so quick taps all land', () => {
    expect(source).toContain('const latest = useRef(picnic)');
    expect(source).toMatch(/addToBasket\(latest\.current, id\)/);
    expect(source).toMatch(/takeOut\(latest\.current, id\)/);
  });

  it('keeps no inline style attributes, so the page style policy is met', () => {
    expect(render()).not.toContain(' style=');
  });
});
