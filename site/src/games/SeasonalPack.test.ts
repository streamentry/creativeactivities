import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { playProps } from '../i18n/play';
import { DEFAULT_MONTH, PACK_MONTHS, monthPack } from '../data/seasonal-pack';
import { printSheet, sheetPictures } from '../lib/games/print-sheet';
import SeasonalPack from './SeasonalPack';

const props = playProps('en', 'seasonal-pack');
const render = () => renderToStaticMarkup(createElement(SeasonalPack, props));
const t = props.ui.seasonalPack;
const source = readFileSync(new URL('./SeasonalPack.tsx', import.meta.url), 'utf8');

describe('SeasonalPack', () => {
  it('offers the twelve months as native radio buttons in a fieldset', () => {
    const html = render();
    expect(html).toContain('<fieldset');
    expect((html.match(/type="radio"/g) ?? []).length).toBe(12);
    for (const m of PACK_MONTHS) expect(html).toContain(t.months[m]);
    expect(html).toContain(t.monthLegend);
  });

  it('shows a visible rest-day choice', () => {
    const html = render();
    expect(html).toContain('type="checkbox"');
    expect(html).toContain(t.restDay);
  });

  it('shows the three puzzles, each with a text description for screen readers', () => {
    const html = render();
    for (const puzzle of [t.puzzles.pairs, t.puzzles.different, t.puzzles.color]) {
      expect(html).toContain(puzzle.title);
      expect(html).toContain(puzzle.describe);
      expect(html).toContain(puzzle.how);
    }
    // React escapes the apostrophe in the button label.
    expect(html).toContain(t.print.replace(/'/g, '&#x27;'));
  });

  it('gives every image an explicit width, height and name', () => {
    const images = render().match(/<img\b[^>]*>/g) ?? [];
    expect(images.length).toBeGreaterThan(0);
    for (const img of images) {
      expect(img, img).toMatch(/\swidth="\d+"/);
      expect(img, img).toMatch(/\sheight="\d+"/);
      expect(img, img).toMatch(/\salt="[^"]+"/);
    }
  });

  it('starts on the default month and shows that month\'s pictures', () => {
    const html = render();
    for (const id of monthPack(DEFAULT_MONTH).pairsLeft) expect(html).toContain(`/pictures/${id}.svg`);
  });

  it('never shows an answer, a score or right and wrong feedback', () => {
    const html = render();
    expect(html).not.toMatch(/\b(wrong|correct|score|timer|winner|streak|countdown)\b/i);
    expect(source).not.toMatch(/\b(setTimeout|setInterval|localStorage|sessionStorage)\b/);
  });

  it('reads its guidance from the shared rules key, so the paper prints the same line', () => {
    expect(source).toContain('ui.seasonalPack.guidance');
    expect(t.guidance).toBe(props.ui.seasonalPack.guidance);
  });

  it('prints one page with a fixed sheet for each month, and only the chosen month prints', () => {
    const sheet = printSheet('seasonal-pack');
    if (sheet?.layout !== 'seasonal') throw new Error('seasonal sheet');
    expect(sheet.months.map((p) => p.month)).toEqual([...PACK_MONTHS]);
    expect(sheet.defaultMonth).toBe(DEFAULT_MONTH);
    expect(sheetPictures(sheet).length).toBeGreaterThan(0);
    expect(printSheet('seasonal-pack')).toEqual(sheet);
  });

  it('prints the one-line footer the PM asked for', () => {
    expect(t.printFooter).toBe('Do one, two or all three. Stop whenever you like.');
  });
});
