import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { BEDS, GARDEN_ITEMS } from '../data/garden-planner';
import { GAMES } from '../data/games';
import { PICTURE_BY_ID } from '../data/pictures';
import { playProps } from '../i18n/play';
import { PAUSE_LINE } from '../lib/scope';
import GardenPlanner from './GardenPlanner';

const props = playProps('en', 'garden-planner');
const render = () => renderToStaticMarkup(createElement(GardenPlanner, props));
const t = props.ui.gardenPlanner;
const source = readFileSync(new URL('./GardenPlanner.tsx', import.meta.url), 'utf8');

/** Words that would turn a picture plan into gardening advice (sun, water, timing, spacing, safety). */
const ADVICE = /\b(sun|sunny|shade|shady|sow|sowing|harvest|edible|eat|poison|poisonous|toxic|spacing|prune|water daily|plant in|full sun|part shade)\b/i;

describe('GardenPlanner', () => {
  it('starts with the guidance, the twelve beds, the summary, the tray and Rest', () => {
    const html = render();

    expect(html).toContain(t.guidance);
    expect(html).toContain('class="gp__beds"');
    expect(html).toContain(t.summaryNone);
    expect(html).toContain('Rest for now');
    expect(html).toContain('Done for now');
    expect(html).toContain('Start again');
    expect(html.indexOf('class="gp__beds"')).toBeLessThan(html.indexOf('class="gp__summary"'));
  });

  it('draws one native button for each of the twelve beds, each empty with its number', () => {
    const html = render();
    const beds = html.match(/<button[^>]*class="gp__bed"[^>]*>/g) ?? [];

    expect(beds).toHaveLength(BEDS);
    for (const tag of beds) {
      expect(tag).toMatch(/type="button"/);
      expect(tag).toMatch(/data-state="empty"/);
      expect(tag).toMatch(/aria-label="Bed \d+, empty"/);
    }
    expect(html).toContain('aria-label="Bed 5, empty"');
  });

  it('lists every plant and garden extra as a native button, none chosen at the start', () => {
    const html = render();
    const picks = html.match(/<button[^>]*class="gp__pick"[^>]*>/g) ?? [];

    expect(picks).toHaveLength(GARDEN_ITEMS.length);
    for (const tag of picks) expect(tag).toMatch(/aria-pressed="false"/);
    for (const item of GARDEN_ITEMS) expect(html).toContain(props.pictureNames[item.id] ?? '∅');
    expect(html).not.toContain('gp__chosen');
  });

  it('never puts a focusable element inside an aria-hidden container', () => {
    const html = render();
    const beforeSheet = html.slice(0, html.indexOf('class="sheet gp-sheet"'));
    expect(beforeSheet.match(/<(div|section|ul|li|fieldset|p|h2)[^>]*aria-hidden/g)).toBeNull();
    const sheet = html.slice(html.indexOf('class="sheet gp-sheet"'));
    expect(sheet).not.toMatch(/<(button|input|select|textarea|a )/);
  });

  it('gives every picture an explicit width and height', () => {
    const html = render();
    const images = html.match(/<img[^>]*>/g) ?? [];

    expect(images.length).toBeGreaterThanOrEqual(GARDEN_ITEMS.length);
    for (const tag of images) {
      expect(tag, tag).toMatch(/ width="\d+"/);
      expect(tag, tag).toMatch(/ height="\d+"/);
    }
  });

  it('shows every tray picture by a library id that exists', () => {
    for (const item of GARDEN_ITEMS) expect(PICTURE_BY_ID.has(item.id), item.id).toBe(true);
  });

  it('prints one page: the title, the beds with blank boxes, the summary, notes lines and the pause line', () => {
    const html = render();
    const sheet = html.slice(html.indexOf('class="sheet gp-sheet"'));

    expect(sheet).toContain('aria-hidden="true"');
    expect(sheet).toContain('<h2>Our garden plan</h2>');
    expect(sheet.match(/class="gp-sheet__bed"/g)).toHaveLength(BEDS);
    expect(sheet.match(/class="gp-sheet__line"/g)).toHaveLength(5);
    expect(sheet).toContain(t.sheetNotes);
    expect(sheet).toContain(t.notice);
    expect(sheet).toContain(PAUSE_LINE);
    expect(source).toContain('window.print()');
  });

  it('shows the summary in words with the chosen pictures counted, and the print sheet uses the same line', () => {
    const html = render();
    expect(html).toContain(t.summaryHeading);
    expect(html.match(/gp-sheet__summary">([^<]*)</)?.[1]).toBe(t.summaryNone);
  });

  it('offers Print the plan from the start, but no put back yet', () => {
    const html = render();

    expect(html).toContain(t.print);
    expect(html).not.toContain(t.putBack);
  });

  it('uses no storage, network or clock, and no counter', () => {
    expect(source).not.toMatch(/localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest|navigator\.sendBeacon|document\.cookie/);
    expect(source).not.toMatch(/setTimeout|setInterval|requestAnimationFrame|Date\.now|performance\.now/);
    expect(source).not.toMatch(/\b(score|moves?|mistakes?|attempts?|streak|countdown)\b/i);
  });

  it('has no pressure, completion or praise words in any of its English strings', () => {
    const text = JSON.stringify(t);
    expect(text).not.toMatch(/score|timer|clock|streak|moves|miss|wrong|incorrect|fail|mistake|try again|remember|correct|recall/i);
    expect(text).not.toMatch(/\b(win|wins|winner|won|lose|lost|loser|left|remaining|count|points?|best|better|faster|slow|hurry|complete|completed|finished|well done|great|lovely|beautiful)\b/i);
    expect(text).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u);
  });

  it('has no advice words in any English string or in the game listing, only the picture-plan line', () => {
    const strings = JSON.stringify(t);
    expect(strings).not.toMatch(ADVICE);
    for (const item of GARDEN_ITEMS) expect(item.one + ' ' + item.many, item.id).not.toMatch(ADVICE);
    const game = GAMES.find((g) => g.slug === 'garden-planner');
    expect(game).toBeDefined();
    expect(JSON.stringify(game)).not.toMatch(ADVICE);
    expect(t.notice).toBe('This is a picture plan to talk about, not planting advice.');
  });

  it('starts every tap from the latest garden, so quick taps all land', () => {
    expect(source).toContain('const latest = useRef(garden)');
    expect(source).toMatch(/choosePicture\(latest\.current/);
    expect(source).toMatch(/tapBed\(before, index\)/);
    expect(source).toMatch(/startAgain\(latest\.current\)/);
  });

  it('keeps no inline style attributes, so the page style policy is met', () => {
    expect(render()).not.toContain(' style=');
  });

  it('uses the English text until a locale has a reviewed translation', () => {
    expect(playProps('es', 'garden-planner').ui.gardenPlanner.summary).toBe('Your plan has {list}.');
  });
});
