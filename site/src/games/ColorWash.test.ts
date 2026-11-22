import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PATTERN_COLORS } from '../data/pattern-maker';
import { playProps } from '../i18n/play';
import ColorWash from './ColorWash';

const props = playProps('en', 'color-wash');
const render = () => renderToStaticMarkup(createElement(ColorWash, props));
const t = props.ui.colorWash;
const source = readFileSync(new URL('./ColorWash.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles/games.css', import.meta.url), 'utf8');

describe('ColorWash', () => {
  it('starts with the guidance, the color and size choices, the current choice, the page and Done for now', () => {
    const html = render();

    // The page's style policy blocks style attributes, so nothing here may rely on one.
    expect(html).not.toContain(' style=');
    expect(html).toContain(t.guidance);
    expect(html.indexOf('cw__controls')).toBeLessThan(html.indexOf('cw__now'));
    expect(html.indexOf('cw__now')).toBeLessThan(html.indexOf('cw__canvas'));
    expect(html).toContain('Done for now');
    expect(html).toContain(t.fresh);
  });

  it('offers the four palette colors and the two wide brushes as native radio buttons in fieldsets', () => {
    const html = render();
    const controls = html.slice(html.indexOf('cw__controls'), html.indexOf('cw__now'));

    expect(controls.match(/<fieldset/g)).toHaveLength(2);
    expect(controls.match(/type="radio"/g)).toHaveLength(PATTERN_COLORS.length + 2);
    for (const color of PATTERN_COLORS) {
      expect(controls).toContain(`<span class="cw__name">${t.colors[color.index]}</span>`);
      expect(controls).toContain(`data-shape="${color.shape}"`);
    }
    expect(controls).toContain('<span class="cw__name">Wide</span>');
    expect(controls).toContain('<span class="cw__name">Very wide</span>');
    expect(controls).toContain('data-size="veryWide"');
  });

  it('says in the current-choice line which color and size the next wash uses, and whether the brush is down', () => {
    const html = render();
    const now = html.slice(html.indexOf('cw__now'), html.indexOf('cw__board'));

    expect(now).toContain('Wash color: Green.');
    expect(now).toContain('Wide.');
    expect(now).toContain(t.brushUp);
    expect(now).toContain('data-tone="2"');
  });

  it('draws the page as a labelled image that can take focus, with the keys explained and no end-point wording', () => {
    const html = render();
    const canvas = html.match(/<canvas[^>]*>/)?.[0] ?? '';

    expect(canvas).toContain('role="img"');
    expect(canvas).toContain('tabindex="0"');
    expect(canvas).toContain(`aria-label="${t.canvasLabel}"`);
    expect(canvas).toMatch(/aria-describedby="[^"]+"/);
    expect(html).toContain(t.keys);
  });

  it('never hides the canvas or any focusable element inside an aria-hidden container', () => {
    const html = render();
    const before = html.slice(0, html.indexOf('<canvas'));
    const board = before.lastIndexOf('class="cw__board"');
    expect(board).toBeGreaterThan(-1);
    // Every aria-hidden in front of the canvas is a closed decoration (a swatch or shape), not a wrapper.
    expect(before.lastIndexOf('aria-hidden="true"')).toBeLessThan(board);
    expect(html.slice(html.indexOf('cw__board'), html.indexOf('<canvas'))).not.toContain('aria-hidden');
  });

  it('has no Put it back at the start, and no print or save, since the page has no paper version', () => {
    const html = render();

    expect(html).not.toContain(t.putBack);
    expect(html).not.toContain('Print');
    expect(html).not.toContain('Save picture');
    expect(source).not.toMatch(/window\.print|toBlob|createObjectURL/);
  });

  it('never suggests an end point: no finished, complete, score, count, timer or praise in the strings or on screen', () => {
    const text = JSON.stringify(t) + render();

    expect(text).not.toMatch(/finish|complete|score|timer|clock|count|winner|well done|great|good|better|best|try again|remember|correct|wrong|goal|level|streak|moves?:/i);
    expect(t.freshMessage).toBe('A fresh page.');
    expect(t.restored).toBe('The page is back.');
  });

  it('keeps the page on a canvas, with no clock, no timeout, no animation and no storage in the source', () => {
    expect(source).not.toMatch(/setTimeout|setInterval|requestAnimationFrame|Date\.now|performance\.now|confetti/);
    expect(source).not.toMatch(/localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest|navigator\.sendBeacon|document\.cookie/);
    expect(source).not.toMatch(/#[0-9a-fA-F]{6}\b|rgb\(/);
  });

  it('starts every change from the latest page, so quick taps and key presses both land', () => {
    expect(source).toContain('const latest = useRef(page)');
    expect(source).not.toMatch(/(putBrushDown|moveBrushTo|liftBrush|stepBrush|toggleBrush|chooseColor|chooseSize|freshPage|putBack)\(page[,)]/);
  });

  it('answers the keyboard brush with Brush down and Brush up, and ignores other keys', () => {
    expect(source).toContain('ui.colorWash.brushDown');
    expect(source).toContain('ui.colorWash.brushUp');
    expect(source).toMatch(/e\.key === ' ' \|\| e\.key === 'Spacebar'/);
    expect(t.brushDown).toBe('Brush down');
    expect(t.brushUp).toBe('Brush up');
  });

  it('uses the English text until a locale has a reviewed translation', () => {
    expect(playProps('xx', 'color-wash').ui.colorWash.guidance).toBe(t.guidance);
  });
});

describe('the stylesheet', () => {
  it('chooses each color by data-tone, with the hex values in the shared palette', () => {
    for (const color of PATTERN_COLORS) {
      const rule = css.match(new RegExp(`\\.cw \\[data-tone='${color.index}'\\] \\{([^}]*)\\}`));
      expect(rule, `a rule for color ${color.index}`).not.toBeNull();
      expect(rule?.[1]).toContain(`--cw-fill: ${color.hex.toLowerCase()};`);
      expect(rule?.[1]).toContain(`--cw-ink: ${color.ink.toLowerCase()};`);
    }
  });

  it('allows touch-action none on the canvas only', () => {
    const rule = css.match(/\.cw__canvas \{([^}]*)\}/);
    expect(rule?.[1]).toContain('touch-action: none;');
    const block = css.slice(css.indexOf('.cw {'), css.indexOf('/* Seasonal puzzle pack'));
    expect(block.match(/touch-action: none/g)).toHaveLength(1);
  });
});
