/**
 * Color-vision checks shared by the tests of every game that draws with a small
 * palette (Color by number, Pattern maker). Nothing in the pages imports this.
 *
 * A color is turned from sRGB hex into linear light, put through the Machado,
 * Oliveira and Fernandes (2009) matrices for full-strength protanopia,
 * deuteranopia and tritanopia, then into CIELAB so a distance follows what an
 * eye sees. The distance is the CIE76 one: the straight distance in that space.
 */

export type Rgb = readonly [number, number, number];
export type Matrix = readonly (readonly [number, number, number])[];

const channel = (hex: string, at: number) => parseInt(hex.slice(at, at + 2), 16) / 255;
const linear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

/** Linear-light red, green and blue of a `#rrggbb` color. */
export const rgbOf = (hex: string): [number, number, number] => [linear(channel(hex, 1)), linear(channel(hex, 3)), linear(channel(hex, 5))];

const NORMAL: Matrix = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

/** Normal color vision, then the three kinds of color-vision difference a palette is checked for. */
export const VISION: Readonly<Record<'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia', Matrix>> = {
  normal: NORMAL,
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritanopia: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
};

/** How a color looks through `matrix`, as linear light. */
export const seen = (hex: string, matrix: Matrix): [number, number, number] => {
  const [r, g, b] = rgbOf(hex);
  const out = matrix.map((row) => Math.min(1, Math.max(0, row[0] * r + row[1] * g + row[2] * b)));
  return [out[0] as number, out[1] as number, out[2] as number];
};

/** Linear light to CIELAB (D65). */
export const lab = ([r, g, b]: readonly [number, number, number]): [number, number, number] => {
  const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
};

/** The straight distance between two colors in CIELAB. */
export const distance = (a: readonly number[], b: readonly number[]): number => Math.hypot((a[0] as number) - (b[0] as number), (a[1] as number) - (b[1] as number), (a[2] as number) - (b[2] as number));

/** The smallest distance between any two of `hexes` as seen through `matrix`. */
export function closestPair(hexes: readonly string[], matrix: Matrix): { distance: number; a: number; b: number } {
  const labs = hexes.map((hex) => lab(seen(hex, matrix)));
  let best = { distance: Infinity, a: 0, b: 0 };
  for (let a = 0; a < labs.length; a++) {
    for (let b = a + 1; b < labs.length; b++) {
      const d = distance(labs[a] as number[], labs[b] as number[]);
      if (d < best.distance) best = { distance: d, a, b };
    }
  }
  return best;
}

/** Relative luminance of a `#rrggbb` color. */
export const luminance = (hex: string): number => {
  const [r, g, b] = rgbOf(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG contrast ratio of two `#rrggbb` colors. */
export const contrast = (a: string, b: string): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
};
