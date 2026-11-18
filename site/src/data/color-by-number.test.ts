import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  GRID_SIZES,
  MIN_CVD_DISTANCE,
  MIN_INK_CONTRAST,
  MOTIFS,
  NUMBER_COLORS,
  colorOf,
  type GridSize,
} from './color-by-number';
import { VISION, contrast, distance, lab, rgbOf, seen, type Matrix } from '../lib/color-vision';

describe('the pictures', () => {
  it('offers the three grid sizes, 4 by 4 first', () => {
    expect(GRID_SIZES).toEqual([4, 6, 8]);
    expect(Object.keys(MOTIFS).map(Number).sort()).toEqual([4, 6, 8]);
  });

  for (const size of GRID_SIZES) {
    describe(`${size} by ${size}`, () => {
      it('has two pictures with different ids', () => {
        expect(MOTIFS[size]).toHaveLength(2);
        expect(new Set(MOTIFS[size].map((m) => m.id)).size).toBe(2);
      });

      for (const motif of MOTIFS[size]) {
        it(`${motif.id} is a ${size} by ${size} square of the colors 1 to 4 only`, () => {
          expect(motif.rows).toHaveLength(size);
          for (const row of motif.rows) {
            expect(row).toHaveLength(size);
            for (const cell of row) expect([1, 2, 3, 4]).toContain(cell);
          }
        });

        it(`${motif.id} uses at least three colors, so the picture is worth painting`, () => {
          expect(new Set(motif.rows.flat()).size).toBeGreaterThanOrEqual(3);
        });
      }

      it('the two pictures are different', () => {
        const [a, b] = MOTIFS[size];
        expect(JSON.stringify(a.rows)).not.toBe(JSON.stringify(b.rows));
      });
    });
  }

  it('has picture ids that are unique across every size', () => {
    const ids = (GRID_SIZES as readonly GridSize[]).flatMap((s) => MOTIFS[s].map((m) => m.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('the stylesheet', () => {
  const css = readFileSync(new URL('../styles/games.css', import.meta.url), 'utf8');

  it('draws each fill and number ink with the hex values in the data file', () => {
    for (const color of NUMBER_COLORS) {
      const rule = css.match(new RegExp(`\\.cbn \\[data-fill='${color.number}'\\],\\s*\\.sheet-paper \\[data-fill='${color.number}'\\] \\{([^}]*)\\}`));
      expect(rule, `a rule for color ${color.number}`).not.toBeNull();
      expect(rule?.[1]).toContain(`--cbn-fill: ${color.hex.toLowerCase()};`);
      expect(rule?.[1]).toContain(`--cbn-ink: ${color.ink.toLowerCase()};`);
    }
  });

  it('sets the column count for every grid size on the screen and on paper', () => {
    for (const size of GRID_SIZES) {
      expect(css).toContain(`.cbn__grid[data-size='${size}']`);
      expect(css).toContain(`.sheet-paper__grid[data-size='${size}']`);
      expect(css).toMatch(new RegExp(`\\[data-size='${size}'\\] \\{\\s*--cbn-n: ${size};`));
    }
  });

  it('keeps every cell at least 48px, and 56px on the 4 by 4 grid', () => {
    expect(css).toMatch(/\.cbn__grid \{[^}]*--cbn-floor: 48px;/);
    expect(css).toMatch(/\.cbn__grid\[data-size='4'\] \{[^}]*--cbn-floor: 56px;/);
    expect(css).toMatch(/--cbn-cell: max\(var\(--cbn-floor\),/);
  });
});

describe('the four colors', () => {
  it('are numbered 1 to 4 in order, each with a different name key and shape', () => {
    expect(NUMBER_COLORS.map((c) => c.number)).toEqual([1, 2, 3, 4]);
    expect(new Set(NUMBER_COLORS.map((c) => c.id)).size).toBe(4);
    expect(new Set(NUMBER_COLORS.map((c) => c.shape)).size).toBe(4);
    expect(new Set(NUMBER_COLORS.map((c) => c.hex)).size).toBe(4);
    expect(colorOf(3).id).toBe('green');
  });

  for (const [vision, matrix] of Object.entries(VISION)) {
    it(`stay apart for ${vision} vision (every pair at least ${MIN_CVD_DISTANCE} apart in CIELAB)`, () => {
      const labs = NUMBER_COLORS.map((c) => lab(seen(c.hex, matrix)));
      for (let i = 0; i < labs.length; i++) {
        for (let j = i + 1; j < labs.length; j++) {
          expect(distance(labs[i] as [number, number, number], labs[j] as [number, number, number]), `${NUMBER_COLORS[i]?.id} and ${NUMBER_COLORS[j]?.id}`).toBeGreaterThanOrEqual(MIN_CVD_DISTANCE);
        }
      }
    });
  }

  it('differ in lightness too, so a gray photocopy still tells each color from a lighter or darker one', () => {
    const lightness = NUMBER_COLORS.map((c) => lab(rgbOf(c.hex))[0]).sort((a, b) => a - b);
    for (let i = 1; i < lightness.length; i++) expect((lightness[i] as number) - (lightness[i - 1] as number)).toBeGreaterThanOrEqual(10);
  });

  it(`draw the number in a color that reads on each fill (at least ${MIN_INK_CONTRAST}:1)`, () => {
    for (const c of NUMBER_COLORS) expect(contrast(c.hex, c.ink), c.id).toBeGreaterThanOrEqual(MIN_INK_CONTRAST);
  });

  it('the checker itself notices colors that are too close', () => {
    const red = lab(seen('#C8473A', VISION.deuteranopia as Matrix));
    const green = lab(seen('#4E8A3E', VISION.deuteranopia as Matrix));
    expect(distance(red, green)).toBeLessThan(MIN_CVD_DISTANCE);
  });
});
