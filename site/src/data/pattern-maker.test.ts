import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { NUMBER_COLORS } from './color-by-number';
import {
  DEFAULT_TILE_SIZE,
  MIN_CVD_DISTANCE,
  MIN_INK_CONTRAST,
  PATTERN_COLORS,
  REPEATS,
  STARTERS,
  TILE_SIZES,
  colorAt,
} from './pattern-maker';
import { VISION, closestPair, contrast, distance, lab, rgbOf, seen, type Matrix } from '../lib/color-vision';

describe('the tiles', () => {
  it('offers a 3 by 3 and a 4 by 4 tile, 3 by 3 first and by default', () => {
    expect(TILE_SIZES).toEqual([3, 4]);
    expect(DEFAULT_TILE_SIZE).toBe(3);
    expect(REPEATS).toBe(3);
  });

  for (const size of TILE_SIZES) {
    it(`has a ${size} by ${size} starter of palette colors, with more than one color`, () => {
      const rows = STARTERS[size];

      expect(rows).toHaveLength(size);
      for (const row of rows) {
        expect(row).toHaveLength(size);
        for (const cell of row) expect([0, 1, 2, 3]).toContain(cell);
      }
      expect(new Set(rows.flat()).size).toBeGreaterThan(1);
    });
  }
});

describe('the stylesheet', () => {
  const css = readFileSync(new URL('../styles/games.css', import.meta.url), 'utf8');

  it('draws each color and its shape ink with the hex values in the data file', () => {
    for (const color of PATTERN_COLORS) {
      const rule = css.match(new RegExp(`\\.pm \\[data-tone='${color.index}'\\],\\s*\\.pm-sheet \\[data-tone='${color.index}'\\] \\{([^}]*)\\}`));
      expect(rule, `a rule for color ${color.index}`).not.toBeNull();
      expect(rule?.[1]).toContain(`--pm-fill: ${color.hex.toLowerCase()};`);
      expect(rule?.[1]).toContain(`--pm-ink: ${color.ink.toLowerCase()};`);
    }
  });

  it('sets the column count for each tile size, on the tile, in your pattern and on paper', () => {
    for (const size of TILE_SIZES) {
      expect(css).toMatch(new RegExp(`\\.pm__tile\\[data-size='${size}'\\] \\{[^}]*--pm-n: ${size};`));
      expect(css).toContain(`.pm__pattern[data-size='${size}']`);
      expect(css).toContain(`.pm-sheet__grid[data-size='${size}']`);
      expect(css).toMatch(new RegExp(`\\.pm-sheet__grid\\[data-size='${size}'\\] \\{\\s*--pm-across: ${size * REPEATS};`));
    }
  });

  it('keeps every square at least 56px, and scrolls the tile rather than shrinking it', () => {
    expect(css).toMatch(/\.pm__tile \{[^}]*--pm-floor: 56px;/);
    expect(css).toMatch(/--pm-cell: max\(var\(--pm-floor\),/);
    expect(css).toMatch(/\.pm__region \{[^}]*overflow-x: auto;/);
  });

  it('keeps the squares in the pattern from animating anything but a shadow, and uses no pixel font sizes', () => {
    const block = css.slice(css.indexOf('.pm [data-tone'), css.indexOf('/* Story chain'));

    expect(block).not.toMatch(/transition: (width|height|margin|padding)/);
    expect(block).not.toMatch(/font-size: \d+px/);
  });

  it('adapts to high contrast and to forced colors', () => {
    expect(css).toMatch(/prefers-contrast: more\) \{\s*\.pm__square \{\s*border: 3px solid #000000;/);
    expect(css).toMatch(/forced-colors: active\) \{\s*\.pm__square:hover,/);
  });
});

describe('the four colors', () => {
  it('are the four colors of Color by number, so the two games cannot drift apart', () => {
    expect(PATTERN_COLORS.map((c) => c.hex)).toEqual(NUMBER_COLORS.map((c) => c.hex));
    expect(PATTERN_COLORS.map((c) => c.shape)).toEqual(NUMBER_COLORS.map((c) => c.shape));
    expect(PATTERN_COLORS.map((c) => c.index)).toEqual([0, 1, 2, 3]);
    expect(colorAt(2).id).toBe('green');
  });

  it('each have a different name key, shape and fill', () => {
    expect(new Set(PATTERN_COLORS.map((c) => c.id)).size).toBe(4);
    expect(new Set(PATTERN_COLORS.map((c) => c.shape)).size).toBe(4);
    expect(new Set(PATTERN_COLORS.map((c) => c.hex)).size).toBe(4);
  });

  for (const [vision, matrix] of Object.entries(VISION)) {
    it(`stay apart for ${vision} vision (every pair at least ${MIN_CVD_DISTANCE} apart in CIELAB)`, () => {
      const hexes = PATTERN_COLORS.map((c) => c.hex);
      const closest = closestPair(hexes, matrix);

      expect(closest.distance, `${PATTERN_COLORS[closest.a]?.id} and ${PATTERN_COLORS[closest.b]?.id}`).toBeGreaterThanOrEqual(MIN_CVD_DISTANCE);
    });
  }

  it('differ in lightness too, so a gray photocopy still tells each color from a lighter or darker one', () => {
    const lightness = PATTERN_COLORS.map((c) => lab(rgbOf(c.hex))[0]).sort((a, b) => a - b);
    for (let i = 1; i < lightness.length; i++) expect((lightness[i] as number) - (lightness[i - 1] as number)).toBeGreaterThanOrEqual(10);
  });

  it(`draw each shape in a color that reads on its fill (at least ${MIN_INK_CONTRAST}:1)`, () => {
    for (const c of PATTERN_COLORS) expect(contrast(c.hex, c.ink), c.id).toBeGreaterThanOrEqual(MIN_INK_CONTRAST);
  });

  it('the checker itself notices colors that are too close', () => {
    const closest = closestPair(['#C8473A', '#4E8A3E'], VISION.deuteranopia as Matrix);
    const apart = distance(lab(seen('#C8473A', VISION.deuteranopia as Matrix)), lab(seen('#4E8A3E', VISION.deuteranopia as Matrix)));

    expect(closest.distance).toBe(apart);
    expect(closest.distance).toBeLessThan(MIN_CVD_DISTANCE);
  });
});
