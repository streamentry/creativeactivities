import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DEFAULT_WALL_SIZE, WALL_SIZES, WALL_GRIDS, WALL_PICTURE_IDS, wallSections } from '../data/coloring-wall';
import { playProps } from '../i18n/play';
import { fill } from '../i18n/play/format';
import { PAUSE_LINE } from '../lib/scope';
import ColoringWall from './ColoringWall';

const props = playProps('en', 'coloring-wall');
const render = () => renderToStaticMarkup(createElement(ColoringWall, props));
const t = props.ui.coloringWall;
const source = readFileSync(new URL('./ColoringWall.tsx', import.meta.url), 'utf8');

/** The preview description for a picture name and a size, as the component builds it. */
function previewFor(size: (typeof WALL_SIZES)[number], picture = 'Flower in a pot') {
  const { columns, rows } = WALL_GRIDS[size];
  const n = wallSections(size).length;
  const last = wallSections(size).at(-1)!.label;
  return fill(t.previewLabel, { picture, n, across: columns, down: rows, last }, 'en');
}

/** The part of the markup that is the printed sheet (hidden on screen, aria-hidden). */
function sheetOf(html: string): string {
  const start = html.indexOf('class="sheet cw-sheet"');
  return start === -1 ? '' : html.slice(start);
}

describe('ColoringWall (GAME-052)', () => {
  it('offers each picture and each size as a native radio button, in labelled groups', () => {
    const html = render();
    expect(html.match(/type="radio"/g)).toHaveLength(WALL_PICTURE_IDS.length + WALL_SIZES.length);
    expect(html.match(/<fieldset class="cw__choices">/g)).toHaveLength(2);
    for (const id of WALL_PICTURE_IDS) expect(html).toContain(`value="${id}"`);
    for (const s of WALL_SIZES) expect(html).toContain(`>${t.sizes[s]}</span>`);
  });

  it('describes the default picture and size on the preview, for a screen reader', () => {
    const html = render();
    expect(previewFor(DEFAULT_WALL_SIZE)).toBe('The flower in a pot split into 6 pages, 3 across and 2 down. Each page has a label in its corner.');
    expect(html).toContain(`role="img" aria-label="${previewFor(DEFAULT_WALL_SIZE)}"`);
  });

  it('changes the preview description when the size changes: each size has its own words', () => {
    expect(source).toMatch(/onChange=\{\(\) => setSize\(s\)\}/);
    expect(source).toMatch(/checked=\{size === s\}/);
    const descriptions = WALL_SIZES.map((s) => previewFor(s));
    expect(new Set(descriptions).size).toBe(WALL_SIZES.length);
    expect(descriptions[0]).toContain('4 pages, 2 across and 2 down');
    expect(descriptions[2]).toContain('9 pages, 3 across and 3 down');
  });

  it('changes the preview when the picture changes: each choice sets the chosen picture', () => {
    expect(source).toMatch(/onChange=\{\(\) => setPictureId\(p\.id\)\}/);
    expect(source).toMatch(/checked=\{pictureId === p\.id\}/);
  });

  it('prints one first page of steps and one page for each section of the chosen size', () => {
    const sheet = sheetOf(render());
    expect(sheet.match(/class="cw-howto"/g)).toHaveLength(1);
    expect(sheet.match(/class="cw-page"/g)).toHaveLength(wallSections(DEFAULT_WALL_SIZE).length);
    for (const s of wallSections(DEFAULT_WALL_SIZE)) expect(sheet).toContain(`data-section="${s.label}"`);
    expect(sheet).toContain(t.wallHeading);
  });

  it('keeps the print sheet to at most 10 pages: the first page and the 9 sections of the largest wall', () => {
    expect(1 + Math.max(...WALL_SIZES.map((s) => wallSections(s).length))).toBeLessThanOrEqual(10);
  });

  it('lists five numbered steps, including tape on the back and no scissors', () => {
    const html = render();
    expect(html.match(/<ol class="cw__steps">.*?<\/ol>/s)?.[0].match(/<li>/g)).toHaveLength(5);
    expect(t.steps.join(' ')).toMatch(/tape on the back/);
    expect(t.steps.join(' ')).toMatch(/do not need to match/);
    expect(t.steps.join(' ')).not.toMatch(/scissors|cut out|trim/i);
  });

  it('keeps the printed sheet free of anything a person can focus', () => {
    const sheet = sheetOf(render());
    expect(sheet).not.toBe('');
    expect(sheet).not.toMatch(/<button|<input|<a |<select|tabindex/);
    expect(sheet).toContain('aria-hidden="true"');
  });

  it('shows the guidance, the print button, the pause line and the Rest control', () => {
    const html = render();
    expect(html).toContain(t.guidance);
    expect(html).toContain(t.print);
    expect(html).toContain(PAUSE_LINE);
    expect(html).toContain('data-rest');
    expect(source).toContain('window.print()');
  });

  it('prints the picture from the Coloring game, and keeps nothing', () => {
    expect(source).not.toMatch(/localStorage|sessionStorage|fetch\(|setInterval|setTimeout|Date\.now|performance\.now|requestAnimationFrame/);
  });

  it('shows no score, timer, streak, count, winner or competitive wording', () => {
    const plain = render().replace(/<[^>]+>/g, ' ');
    expect(plain).not.toMatch(/\b(score|timer|streak|miss|misses|missed|winner|wins?|lose|loses|losing|points?|best|beat|remember|recall|wrong|right|better|finished|try again|ranked|judged)\b/i);
  });

  it('uses the English words in another language until one is reviewed', () => {
    expect(playProps('xx', 'coloring-wall').ui.coloringWall.print).toBe('Print the wall');
  });
});
