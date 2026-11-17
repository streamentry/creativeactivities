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

  // sRGB to linear light, then the Machado, Oliveira and Fernandes (2009) matrices for full-strength
  // protanopia, deuteranopia and tritanopia, then CIELAB so distances follow what an eye sees.
  const channel = (hex: string, at: number) => parseInt(hex.slice(at, at + 2), 16) / 255;
  const linear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const rgbOf = (hex: string): [number, number, number] => [linear(channel(hex, 1)), linear(channel(hex, 3)), linear(channel(hex, 5))];
  type Matrix = readonly (readonly [number, number, number])[];
  const NORMAL: Matrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const VISION: Record<string, Matrix> = {
    normal: NORMAL,
    protanopia: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
    deuteranopia: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
    tritanopia: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.3039]],
  };
  const seen = (hex: string, m: Matrix): [number, number, number] => {
    const [r, g, b] = rgbOf(hex);
    const out = m.map((row) => Math.min(1, Math.max(0, row[0] * r + row[1] * g + row[2] * b)));
    return [out[0] as number, out[1] as number, out[2] as number];
  };
  const lab = ([r, g, b]: [number, number, number]): [number, number, number] => {
    const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
    const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
    const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
    return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
  };
  const distance = (a: [number, number, number], b: [number, number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const luminance = (hex: string) => {
    const [r, g, b] = rgbOf(hex);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a: string, b: string) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
    return (hi + 0.05) / (lo + 0.05);
  };

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
