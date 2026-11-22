import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { playProps } from '../i18n/play';
import { SAFETY_FLAG_LABELS } from '../lib/activities';
import QuietShapes from './QuietShapes';

const props = playProps('en', 'quiet-shapes');
const render = () => renderToStaticMarkup(createElement(QuietShapes, props));
const t = props.ui.quietShapes;
const source = readFileSync(new URL('./QuietShapes.tsx', import.meta.url), 'utf8');

describe('QuietShapes', () => {
  it('starts with the guidance, the picture line, the outline, the pieces and Rest', () => {
    const html = render();

    expect(html).toContain(t.guidance);
    expect(html).toContain('This one is a house.');
    expect(html).toContain('class="qs__outline"');
    expect(html).toContain('class="qs__tray"');
    expect(html).toContain('Rest for now');
    expect(html).toContain('Done for now');
    expect(html).toContain('Start again');
  });

  it('draws one native button for each space, each named by its number and shape and empty at the start', () => {
    const html = render();
    const spaces = html.match(/<button[^>]*class="qs__hit[^"]*"[^>]*>/g) ?? [];

    expect(spaces).toHaveLength(6);
    for (const tag of spaces) {
      expect(tag).toMatch(/type="button"/);
      expect(tag).toMatch(/data-state="empty"/);
      expect(tag).toMatch(/aria-label="Space \d, a (large triangle|small triangle|square|parallelogram|rectangle), empty"/);
    }
    expect(html).toContain('aria-label="Space 1, a large triangle, empty"');
  });

  it('never hides the space buttons from a screen reader inside an aria-hidden outline', () => {
    const html = render();
    const outline = html.slice(html.indexOf('class="qs__outline"'), html.indexOf('class="qs__tray"'));
    const art = outline.match(/<svg[^>]*class="qs__art"[^>]*>/)?.[0] ?? '';

    expect(art).not.toBe('');
    expect(art).not.toContain('aria-hidden');
    expect(outline).toMatch(/<button[^>]*class="qs__hit/);
  });

  it('lists the pieces in the tray as native buttons, each with its written name and none chosen', () => {
    const html = render();
    const pieces = html.match(/<button[^>]*class="qs__piece"[^>]*>/g) ?? [];

    expect(pieces).toHaveLength(6);
    for (const tag of pieces) expect(tag).toMatch(/aria-pressed="false"/);
    expect(html).toContain('Large triangle');
    expect(html).toContain('Rectangle');
    expect(html).not.toContain('qs__chosen');
  });

  it('shows the hint lines on at the start, as a labelled checkbox that is checked', () => {
    const html = render();

    expect(html).toMatch(/<input type="checkbox"[^>]*checked=""/);
    expect(html).toContain(t.hints);
    expect(html.match(/class="qs__hint"/g)).toHaveLength(6);
  });

  it('offers Put it back only after Start again, which is not there at the start', () => {
    expect(render()).not.toContain(t.putBack);
    expect(t.putBack).toBe('Put it back');
  });

  it('offers Another shape and Print this shape from the start', () => {
    const html = render();

    expect(html).toContain(t.another);
    expect(html).toContain(t.print);
  });

  it('prints one page: the outline with its hint lines, the pieces at the same scale, and the cutting and safety lines', () => {
    const html = render();
    const sheet = html.slice(html.indexOf('class="sheet qs-sheet"'));

    expect(sheet).toContain('aria-hidden="true"');
    expect(sheet).toContain('<h2>Quiet shapes</h2>');
    expect(sheet).toContain('qs-sheet__line');
    expect(sheet.match(/class="qs-sheet__piece"/g)).toHaveLength(6);
    expect(sheet).toContain('Color the pieces, or cut them out to fit the outline. An adult can do the cutting.');
    expect(sheet).toContain(SAFETY_FLAG_LABELS['sharp-tool']);
    expect(source).toContain('window.print()');
  });

  it('prints the outline and each piece at one scale: the same millimetres per unit for both', () => {
    const html = render();
    const sheet = html.slice(html.indexOf('class="sheet qs-sheet"'));
    // The house outline is 4 cells wide with a margin of 24 units, so 104 units at 0.6 mm per unit.
    expect(sheet).toMatch(/class="qs-sheet__outline" width="62\.40mm"/);
    // A large triangle piece is 2 cells square: 40 units, 24.00 mm.
    expect(sheet).toMatch(/class="qs-sheet__piece" width="24\.00mm" height="24\.00mm"/);
    // A rectangle piece is 2 cells by 1: 40 by 20 units, 24.00 by 12.00 mm.
    expect(sheet).toMatch(/class="qs-sheet__piece" width="24\.00mm" height="12\.00mm"/);
  });

  it('says in the guidance that nothing is saved or sent', () => {
    expect(t.guidance).toMatch(/Nothing you make is saved or sent\./);
  });

  it('uses no storage, network or clock, and no counter', () => {
    expect(source).not.toMatch(/localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest|navigator\.sendBeacon|document\.cookie/);
    expect(source).not.toMatch(/setTimeout|setInterval|requestAnimationFrame|Date\.now|performance\.now|confetti/);
    expect(source).not.toMatch(/\b(score|moves?|mistakes?|attempts?|streak|countdown)\b/i);
  });

  it('has no pressure, failure or competition words in any of its English strings', () => {
    const text = JSON.stringify(t);
    expect(text).not.toMatch(/score|timer|clock|streak|moves|miss|wrong|incorrect|fail|mistake|try again|remember|correct|recall/i);
    expect(text).not.toMatch(/\b(win|wins|winner|won|lose|lost|loser|left|remaining|count|points?|best|better|faster|slow|hurry)\b/i);
    expect(text).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u);
  });

  it('gives the piece-of-another-shape line in calm words, not blame', () => {
    expect(t.different).toBe('That piece is a different shape from this space. Try another space.');
  });

  it('says the picture is complete in one calm line, with the picture name', () => {
    expect(t.complete).toBe('The {picture} is complete.');
    expect(t.pictures.boat).toBe('boat');
  });

  it('uses the English text until a locale has a reviewed translation', () => {
    expect(playProps('xx', 'quiet-shapes').ui.quietShapes.pieces.square).toBe('Square');
  });

  it('starts every tap from the latest game, so quick taps all land', () => {
    expect(source).toContain('const latest = useRef(game)');
    expect(source).toMatch(/choosePiece\(latest\.current/);
    expect(source).toMatch(/tapSpace\(latest\.current/);
    expect(source).toMatch(/startAgain\(latest\.current\)/);
  });

  it('keeps no inline style attributes, so the page style policy is met', () => {
    expect(render()).not.toContain(' style=');
  });
});
