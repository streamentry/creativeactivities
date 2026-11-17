/**
 * Color by number (GAME-031): the four colors, the three grid sizes and the
 * pictures that can be painted. Words (color names, picture names) are text,
 * so they live in `ui.colorByNumber` in `src/i18n/play/en.json`.
 *
 * The four colors are Okabe-Ito style hues picked to stay apart for the common
 * color-vision differences (red-green and blue-yellow) and in grayscale, and
 * every color also has a number, a written name and a shape, so color is never
 * the only signal. `color-by-number.test.ts` simulates protanopia, deuteranopia
 * and tritanopia and fails if any two colors come closer than `MIN_CVD_DISTANCE`.
 * Each fill also has a text color (`ink`) that the number is drawn in, checked
 * for a 4.5:1 contrast.
 */

export type ColorNumber = 1 | 2 | 3 | 4;

/** A cell holds 0 while it is empty, or the number of the color it was filled with. */
export type CellValue = 0 | ColorNumber;

export type GridSize = 4 | 6 | 8;

/** The grid a person starts with. */
export const DEFAULT_GRID_SIZE: GridSize = 4;

export const GRID_SIZES: readonly GridSize[] = [4, 6, 8];

export interface NumberColor {
  number: ColorNumber;
  /** Key of the name in `ui.colorByNumber.colors` (the array is in the same order as `NUMBER_COLORS`). */
  id: 'yellow' | 'orange' | 'green' | 'purple';
  /** The fill, as sRGB hex. */
  hex: string;
  /** The color the cell's number is drawn in on this fill. */
  ink: string;
  /** The shape drawn with the color beside the number, so the color is also known by shape. */
  shape: 'circle' | 'square' | 'triangle' | 'diamond';
}

export const NUMBER_COLORS: readonly NumberColor[] = [
  { number: 1, id: 'yellow', hex: '#F7E98E', ink: '#16231D', shape: 'circle' },
  { number: 2, id: 'orange', hex: '#E69F00', ink: '#16231D', shape: 'square' },
  { number: 3, id: 'green', hex: '#009E73', ink: '#16231D', shape: 'triangle' },
  { number: 4, id: 'purple', hex: '#7B3F98', ink: '#FFFFFF', shape: 'diamond' },
];

/** No two of the four colors may look closer than this to anyone, in CIELAB distance (CIE76). */
export const MIN_CVD_DISTANCE = 30;

/** The smallest contrast between a number and its fill. */
export const MIN_INK_CONTRAST = 4.5;

export interface Motif {
  /** Key of the name in `ui.colorByNumber.motifs`. */
  id: string;
  /** Rows top to bottom, each a color number 1 to 4; every cell has a color, the background included. */
  rows: readonly (readonly ColorNumber[])[];
}

/**
 * Two simple pictures for each size, read as one picture when every cell has
 * the color of its number. 1 is yellow (the sky or background), 2 orange,
 * 3 green, 4 purple.
 */
export const MOTIFS: Readonly<Record<GridSize, readonly [Motif, Motif]>> = {
  4: [
    {
      id: 'house',
      rows: [
        [1, 4, 4, 1],
        [4, 4, 4, 4],
        [2, 3, 3, 2],
        [2, 3, 3, 2],
      ],
    },
    {
      id: 'flower',
      rows: [
        [1, 4, 4, 1],
        [4, 2, 2, 4],
        [1, 4, 4, 1],
        [1, 3, 3, 1],
      ],
    },
  ],
  6: [
    {
      id: 'heart',
      rows: [
        [1, 2, 1, 1, 2, 1],
        [2, 2, 2, 2, 2, 2],
        [2, 2, 2, 2, 2, 2],
        [1, 2, 2, 2, 2, 1],
        [1, 1, 2, 2, 1, 1],
        [3, 3, 3, 3, 3, 3],
      ],
    },
    {
      id: 'tree',
      rows: [
        [1, 1, 3, 3, 1, 1],
        [1, 3, 3, 3, 3, 1],
        [3, 4, 3, 3, 4, 3],
        [1, 3, 3, 3, 3, 1],
        [1, 1, 2, 2, 1, 1],
        [1, 1, 2, 2, 1, 1],
      ],
    },
  ],
  8: [
    {
      id: 'boat',
      rows: [
        [1, 1, 1, 4, 1, 1, 1, 1],
        [1, 1, 2, 4, 3, 1, 1, 1],
        [1, 2, 2, 4, 3, 3, 1, 1],
        [2, 2, 2, 4, 3, 3, 3, 1],
        [1, 1, 1, 4, 1, 1, 1, 1],
        [4, 4, 4, 4, 4, 4, 4, 4],
        [1, 4, 4, 4, 4, 4, 4, 1],
        [1, 1, 4, 4, 4, 4, 1, 1],
      ],
    },
    {
      id: 'pot-plant',
      rows: [
        [1, 1, 4, 4, 4, 4, 1, 1],
        [1, 1, 4, 2, 2, 4, 1, 1],
        [1, 1, 4, 2, 2, 4, 1, 1],
        [1, 1, 4, 4, 4, 4, 1, 1],
        [1, 1, 1, 3, 3, 1, 1, 1],
        [1, 3, 3, 3, 3, 3, 3, 1],
        [1, 2, 2, 2, 2, 2, 2, 1],
        [1, 1, 2, 2, 2, 2, 1, 1],
      ],
    },
  ],
};

/** The color for a number. */
export function colorOf(n: ColorNumber): NumberColor {
  return NUMBER_COLORS[n - 1] as NumberColor;
}
