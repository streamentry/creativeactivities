import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PLACES, TRAY_SETS } from '../data/collage-board';
import { PICTURE_BY_ID } from '../data/pictures';
import { playProps } from '../i18n/play';
import { SAFETY_FLAG_LABELS } from '../lib/activities';
import { PAUSE_LINE } from '../lib/scope';
import CollageBoard from './CollageBoard';

const props = playProps('en', 'collage-board');
const render = () => renderToStaticMarkup(createElement(CollageBoard, props));
const t = props.ui.collageBoard;
const source = readFileSync(new URL('./CollageBoard.tsx', import.meta.url), 'utf8');

describe('CollageBoard', () => {
  it('starts with the guidance, whose turn it is, the board, the tray and Rest', () => {
    const html = render();

    expect(html).toContain(t.guidance);
    expect(html).toContain('Your turn, first person.');
    expect(html).toContain('class="cb__board"');
    expect(html).toContain('class="cb__tray"');
    expect(html).toContain('Rest for now');
    expect(html).toContain('Done for now');
    expect(html).toContain('Start again');
    expect(html.indexOf('cb__turn')).toBeLessThan(html.indexOf('cb__board'));
  });

  it('draws one native button for each of the twelve places, each empty at the start with its number', () => {
    const html = render();
    const places = html.match(/<button[^>]*class="cb__place"[^>]*>/g) ?? [];

    expect(places).toHaveLength(PLACES);
    for (const tag of places) {
      expect(tag).toMatch(/type="button"/);
      expect(tag).toMatch(/data-state="empty"/);
      expect(tag).toMatch(/aria-label="Place \d+, empty"/);
    }
    expect(html).toContain('aria-label="Place 1, empty"');
    expect(html).toContain('aria-label="Place 12, empty"');
  });

  it('lists the eight cut-outs of the first set as native buttons, each with its written name and none chosen', () => {
    const html = render();
    const cutouts = html.match(/<button[^>]*class="cb__cutout"[^>]*>/g) ?? [];

    expect(cutouts).toHaveLength(8);
    for (const tag of cutouts) expect(tag).toMatch(/aria-pressed="false"/);
    for (const id of TRAY_SETS[0] ?? []) expect(html).toContain(props.pictureNames[id] ?? '∅');
    expect(html).not.toContain('cb__chosen');
  });

  it('never puts a focusable element inside an aria-hidden container', () => {
    const html = render();
    const beforeSheet = html.slice(0, html.indexOf('class="sheet cb-sheet"'));
    // Decorative markers and icons may be hidden; a containing block or list may not.
    expect(beforeSheet.match(/<(div|section|ul|li|fieldset|p|h2)[^>]*aria-hidden/g)).toBeNull();
    const art = beforeSheet.match(/<svg[^>]*class="[^"]*"[^>]*>/g) ?? [];
    for (const tag of art) expect(tag).not.toMatch(/focusable="true"/);
  });

  it('gives every picture an explicit width and height', () => {
    const html = render();
    const images = html.match(/<img[^>]*>/g) ?? [];

    expect(images.length).toBeGreaterThanOrEqual(8);
    for (const tag of images) {
      expect(tag, tag).toMatch(/ width="\d+"/);
      expect(tag, tag).toMatch(/ height="\d+"/);
    }
  });

  it('shows every tray picture by a library id that exists, in both sets', () => {
    for (const set of TRAY_SETS) {
      expect(set).toHaveLength(8);
      for (const id of set) expect(PICTURE_BY_ID.has(id), id).toBe(true);
    }
  });

  it('prints one page: the twelve boxes, the cutting line, the eight pictures and the safety and pause lines', () => {
    const html = render();
    const sheet = html.slice(html.indexOf('class="sheet cb-sheet"'));

    expect(sheet).toContain('aria-hidden="true"');
    expect(sheet).toContain('<h2>Collage board</h2>');
    expect(sheet.match(/class="cb-sheet__box"/g)).toHaveLength(PLACES);
    expect(sheet.match(/<li><img/g)).toHaveLength(8);
    expect(sheet).toContain('Cut out the pictures and take turns placing them on the board. An adult can do the cutting.');
    expect(sheet).toContain(SAFETY_FLAG_LABELS['sharp-tool']);
    expect(sheet).toContain(PAUSE_LINE);
    expect(sheet).not.toMatch(/<(button|input|select|textarea|a )/);
    expect(source).toContain('window.print()');
  });

  it('offers Pass, Another set of pictures and Print the board from the start, but no take back and no put back yet', () => {
    const html = render();

    for (const label of ['Pass', 'Another set of pictures', 'Print the board']) expect(html).toContain(label);
    expect(html).not.toContain(t.takeBack);
    expect(html).not.toContain(t.putBack);
  });

  it('says in the guidance that nothing is saved or sent', () => {
    expect(t.guidance).toMatch(/Nothing you make is saved or sent\./);
  });

  it('uses no storage, network or clock, and no counter', () => {
    expect(source).not.toMatch(/localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest|navigator\.sendBeacon|document\.cookie/);
    expect(source).not.toMatch(/setTimeout|setInterval|requestAnimationFrame|Date\.now|performance\.now/);
    expect(source).not.toMatch(/\b(score|moves?|mistakes?|attempts?|streak|countdown)\b/i);
  });

  it('has no pressure, failure, competition or completion words in any of its English strings', () => {
    const text = JSON.stringify(t);
    expect(text).not.toMatch(/score|timer|clock|streak|moves|miss|wrong|incorrect|fail|mistake|try again|remember|correct|recall/i);
    expect(text).not.toMatch(/\b(win|wins|winner|won|lose|lost|loser|left|remaining|count|points?|best|better|faster|slow|hurry|complete|completed|built)\b/i);
    expect(text).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u);
  });

  it('starts every tap from the latest game, so quick taps all land', () => {
    expect(source).toContain('const latest = useRef(game)');
    expect(source).toMatch(/chooseCutout\(latest\.current/);
    expect(source).toMatch(/placeAt\(before, index\)/);
    expect(source).toMatch(/startAgain\(latest\.current\)/);
  });

  it('keeps no inline style attributes, so the page style policy is met', () => {
    expect(render()).not.toContain(' style=');
  });

  it('uses the English text until a locale has a reviewed translation', () => {
    expect(playProps('es', 'collage-board').ui.collageBoard.people[0]).toBe('First person');
  });
});
