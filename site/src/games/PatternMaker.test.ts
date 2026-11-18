import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PATTERN_COLORS } from '../data/pattern-maker';
import { playProps } from '../i18n/play';
import PatternMaker from './PatternMaker';

const props = playProps('en', 'pattern-maker');
const render = () => renderToStaticMarkup(createElement(PatternMaker, props));
const t = props.ui.patternMaker;

describe('PatternMaker', () => {
  it('starts with the guidance, the colors, a 3 by 3 tile, your pattern, and Rest', () => {
    const html = render();

    // The page's style policy blocks style attributes, so nothing here may rely on one.
    expect(html).not.toContain(' style=');
    expect(html).toContain('Tap a square to change its color. Your pattern grows beside it. Nothing you make is saved or sent.');
    expect(html.indexOf('pm__key')).toBeLessThan(html.indexOf('pm__tile'));
    expect(html.indexOf('pm__tile')).toBeLessThan(html.indexOf('pm__pattern'));
    expect(html).toContain('data-size="3"');
    expect(html).toContain('Rest for now');
    expect(html).toContain('Done for now');
  });

  it('says in the guidance line that nothing is saved or sent, and uses no storage or network', () => {
    const source = readFileSync(new URL('./PatternMaker.tsx', import.meta.url), 'utf8');

    expect(t.guidance).toMatch(/Nothing you make is saved or sent\./);
    expect(source).not.toMatch(/localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest|navigator\.sendBeacon|document\.cookie/);
  });

  it('offers 3 by 3 and 4 by 4, with 3 by 3 chosen', () => {
    const html = render();

    for (const label of ['3 by 3', '4 by 4']) expect(html).toContain(label);
    expect(html).toMatch(/<input[^>]*checked=""[^>]*value="3"/);
    expect(html).toContain('Tile size');
  });

  it('shows each of the four colors in the key with its written name and a shape', () => {
    const html = render();
    const key = html.slice(html.indexOf('pm__key'), html.indexOf('pm__stage'));

    expect(key.match(/<li/g)).toHaveLength(4);
    PATTERN_COLORS.forEach((color) => {
      expect(key).toContain(`<span>${t.colors[color.index]}</span>`);
      expect(key).toContain(`data-shape="${color.shape}"`);
    });
    expect(t.colors).toHaveLength(4);
    expect(new Set(t.colors).size).toBe(4);
  });

  it('draws one native button for each of the 9 squares, each naming its row, column and color', () => {
    const html = render();
    const tile = html.slice(html.indexOf('pm__tile'), html.indexOf('pm__pattern'));
    const squares = tile.match(/<button[^>]*class="pm__square"[^>]*>/g) ?? [];

    expect(squares).toHaveLength(9);
    for (const tag of squares) {
      expect(tag).toMatch(/type="button"/);
      expect(tag).toMatch(/aria-label="Row \d, column \d, (Yellow|Orange|Green|Purple)"/);
      expect(tag).toMatch(/data-tone="[0-3]"/);
    }
    expect(tile).toContain('aria-label="Row 2, column 2, Green"');
    // Each square carries the shape of the color it holds (the starter tile uses yellow, orange and green).
    for (const shape of ['circle', 'square', 'triangle']) expect(tile).toContain(`data-shape="${shape}"`);
    expect(tile.match(/class="cbn__shape"/g)).toHaveLength(9);
  });

  it('puts the tile in its own labelled, focusable region so a wide tile scrolls inside it', () => {
    expect(render()).toMatch(/<div class="pm__region" role="region" aria-label="Your tile, 3 by 3\. It scrolls sideways if the screen is narrow\." tabindex="0">/);
  });

  it('shows your pattern as the tile repeated 3 across and 3 down: 81 squares for a 3 by 3 tile', () => {
    const html = render();
    const pattern = html.slice(html.indexOf('pm__pattern'));

    expect(pattern).toContain('role="img"');
    expect(pattern).toContain('aria-label="Your pattern: your tile repeated 3 across and 3 down."');
    expect(pattern.match(/class="pm__mini"/g)).toHaveLength(81);
    expect(pattern).toContain('data-tile-left="yes"');
    expect(pattern).toContain('data-tile-top="yes"');
  });

  it('has Surprise me and Print my pattern, Start again from the frame, and no Put it back until something can be put back', () => {
    const html = render();

    for (const label of ['Surprise me', 'Print my pattern', 'Start again']) expect(html).toContain(label);
    expect(html).not.toContain('Put it back');
  });

  it('prints one page: a print-only sheet with the pattern and the four colors by name, hidden from the screen reader', () => {
    const html = render();
    const sheet = html.slice(html.indexOf('class="sheet pm-sheet"'));

    expect(sheet).toContain('aria-hidden="true"');
    expect(sheet).toContain('<h2>My pattern</h2>');
    expect(sheet.match(/class="pm-sheet__square"/g)).toHaveLength(81);
    for (const name of t.colors) expect(sheet).toContain(name);
    expect(readFileSync(new URL('./PatternMaker.tsx', import.meta.url), 'utf8')).toContain('window.print()');
  });

  it('says nothing negative: no score, timer, count, miss or failure wording anywhere on the page or in its strings', () => {
    const text = JSON.stringify(t) + render();

    expect(text).not.toMatch(/score|timer|clock|streak|moves|miss|wrong|incorrect|fail|mistake|try again|remember|name the|correct|recall/i);
  });

  it('uses the English text until a locale has a reviewed translation', () => {
    expect(playProps('es', 'pattern-maker').ui.patternMaker.surprise).toBe('Surprise me');
  });

  it('starts every tap from the latest game, so two quick taps both land', () => {
    const source = readFileSync(new URL('./PatternMaker.tsx', import.meta.url), 'utf8');

    expect(source).toContain('const latest = useRef(game)');
    for (const call of ['cycleSquare(before', 'clearTile(latest.current', 'surprise(latest.current', 'putBack(latest.current', 'chooseSize(latest.current']) expect(source).toContain(call);
    expect(source).not.toMatch(/(cycleSquare|clearTile|surprise|putBack|chooseSize)\(game[,)]/);
  });

  it('waits for no timer and counts nothing: the source sets no timeout and keeps no counter', () => {
    const source = readFileSync(new URL('./PatternMaker.tsx', import.meta.url), 'utf8');

    expect(source).not.toMatch(/setTimeout|setInterval|requestAnimationFrame|Date\.now|confetti/);
    expect(source).not.toMatch(/attempts|misses|taps\b|count\b/);
  });
});
