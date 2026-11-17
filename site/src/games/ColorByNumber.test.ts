import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { NUMBER_COLORS } from '../data/color-by-number';
import { playProps } from '../i18n/play';
import { chooseColor, newGame, paintCell, boardOf } from '../lib/games/color-by-number';
import ColorByNumber, { Cell } from './ColorByNumber';

const props = playProps('en', 'color-by-number');
const render = () => renderToStaticMarkup(createElement(ColorByNumber, props));
const names = (n: number) => (n === 0 ? props.ui.colorByNumber.empty : (props.ui.colorByNumber.colors[n - 1] ?? ''));
const cell = (index: number, value: 0 | 1 | 2 | 3 | 4) => {
  const game = value === 0 ? newGame() : paintCell(chooseColor(newGame(), value), index).game;
  return renderToStaticMarkup(createElement(Cell, { index, size: 4, board: boardOf(game), cell: value, text: props, colorName: names, onTap: () => undefined }));
};

describe('ColorByNumber', () => {
  it('starts with the guidance, the key above a 4 by 4 grid, and Rest', () => {
    const html = render();

    // The page's style policy blocks style attributes, so nothing here may rely on one.
    expect(html).not.toContain(' style=');
    expect(html).toContain('Choose a color from the key, then fill a square with it. Any color is fine.');
    expect(html.indexOf('cbn__key')).toBeLessThan(html.indexOf('cbn__grid'));
    expect(html).toContain('data-size="4"');
    expect(html).toContain('Rest for now');
    expect(html).toContain('Done for now');
  });

  it('offers 4 by 4, 6 by 6 and 8 by 8, with 4 by 4 chosen', () => {
    const html = render();

    for (const label of ['4 by 4', '6 by 6', '8 by 8']) expect(html).toContain(label);
    expect(html).toMatch(/<input[^>]*checked=""[^>]*value="4"/);
    expect(html).toContain('Grid size');
  });

  it('shows each of the four colors in the key with its number, its written name and a shape', () => {
    const html = render();
    const key = html.slice(html.indexOf('cbn__key'), html.indexOf('cbn__region'));

    expect(key.match(/<button/g)).toHaveLength(4);
    for (const color of NUMBER_COLORS) {
      expect(key).toContain(`>${color.number}</span><span class="cbn__key-name">${names(color.number)}</span>`);
      expect(key).toContain(`data-shape="${color.shape}"`);
    }
    expect(key).toContain('aria-pressed="true"');
    expect(key.match(/aria-pressed="true"/g)).toHaveLength(1);
  });

  it('draws one native button for each of the 16 cells, each empty, with its number and place as its name', () => {
    const html = render();
    const grid = html.slice(html.indexOf('cbn__grid'), html.indexOf('</section>'));
    const cells = grid.match(/<button[^>]*class="cbn__cell"[^>]*>/g) ?? [];

    expect(cells).toHaveLength(16);
    for (const tag of cells) expect(tag).toMatch(/type="button"/);
    expect(grid).toContain('aria-label="Number 4, row 1, column 2, empty"');
    expect(grid).toContain('row 4, column 4, empty');
    expect(grid).not.toContain('data-fill=');
  });

  it('puts the grid in its own labelled, focusable region so a wide grid scrolls inside it', () => {
    const html = render();

    expect(html).toMatch(/<div class="cbn__region" role="region" aria-label="Picture grid, 4 by 4\. It scrolls sideways if the screen is narrow\." tabindex="0">/);
  });

  it('has Fill with the numbers, Clear and Another picture', () => {
    const html = render();

    for (const label of ['Fill with the numbers', 'Clear', 'Another picture']) expect(html).toContain(`>${label}</button>`);
  });

  it('names a filled cell by its number, its place and its color, and marks it with a shape as well as the fill', () => {
    const html = cell(5, 3);

    expect(html).toContain('aria-label="Number 4, row 2, column 2, Green"');
    expect(html).toContain('data-fill="3"');
    expect(html).not.toContain('style=');
    expect(html).toContain('data-shape="triangle"');
    expect(cell(5, 0)).not.toContain('cbn__shape');
    expect(cell(5, 0)).not.toContain('data-fill');
  });

  it('says nothing negative: no score, timer, count, miss or failure wording anywhere on the page or in its strings', () => {
    const text = JSON.stringify(props.ui.colorByNumber) + render();

    expect(text).not.toMatch(/score|timer|clock|streak|moves|miss|wrong|incorrect|fail|mistake|try again|remember|name the|correct/i);
  });

  it('uses the English text until a locale has a reviewed translation', () => {
    expect(playProps('es', 'color-by-number').ui.colorByNumber.next).toBe('Another picture');
  });

  it('starts every tap from the latest game, so two quick taps both land', () => {
    const source = readFileSync(new URL('./ColorByNumber.tsx', import.meta.url), 'utf8');

    expect(source).toContain('const latest = useRef(game)');
    for (const call of ['chooseColor(latest.current', 'paintCell(before', 'fillWithNumbers(latest.current', 'clearBoard(latest.current', 'anotherPicture(latest.current', 'chooseSize(latest.current']) expect(source).toContain(call);
    expect(source).toContain('const before = latest.current');
    expect(source).not.toMatch(/(paintCell|chooseColor|fillWithNumbers|clearBoard|anotherPicture|chooseSize)\(game[,)]/);
  });

  it('waits for no timer and counts nothing: the source sets no timeout and keeps no counter', () => {
    const source = readFileSync(new URL('./ColorByNumber.tsx', import.meta.url), 'utf8');

    expect(source).not.toMatch(/setTimeout|setInterval|requestAnimationFrame|Date\.now|confetti/);
    expect(source).not.toMatch(/filledCount|attempts|misses/);
  });
});
