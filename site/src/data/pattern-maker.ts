import { NUMBER_COLORS, type NumberColor } from './color-by-number';

/**
 * Pattern maker (GAME-034): the four colors a square can hold, the two tile
 * sizes and the starting tiles. Words (color names, labels) are text, so they
 * live in `ui.patternMaker` in `src/i18n/play/en.json`.
 *
 * The four colors are the ones Color by number already uses: they were chosen
 * and tested to stay apart for red-green and blue-yellow color-vision
 * differences and in grayscale, and each has its own shape beside it, so color
 * is never the only signal. They are taken from that file, not copied, so the
 * two games cannot drift apart. The first color is the lightest and is what an
 * empty tile is made of.
 */

/** A square holds the position of its color in `PATTERN_COLORS`, 0 to 3. */
export type PatternColor = 0 | 1 | 2 | 3;

export type TileSize = 3 | 4;

export const TILE_SIZES: readonly TileSize[] = [3, 4];

/** The tile a person starts with. */
export const DEFAULT_TILE_SIZE: TileSize = 3;

/** How many times the tile is repeated across and down in "your pattern". */
export const REPEATS = 3;

export interface PatternColorInfo {
  /** Position in the palette, also the index of its name in `ui.patternMaker.colors`. */
  index: PatternColor;
  /** Key shared with Color by number's colors. */
  id: NumberColor['id'];
  /** The fill, as sRGB hex. */
  hex: string;
  /** The color a shape is drawn in on this fill. */
  ink: string;
  /** The shape drawn in a square of this color. */
  shape: NumberColor['shape'];
}

export const PATTERN_COLORS: readonly PatternColorInfo[] = NUMBER_COLORS.map((c, i) => ({
  index: i as PatternColor,
  id: c.id,
  hex: c.hex,
  ink: c.ink,
  shape: c.shape,
}));

/** No two of the four colors may look closer than this to anyone (CIE76 distance), as in Color by number. */
export const MIN_CVD_DISTANCE = 30;

/** The smallest contrast between a shape and its fill. */
export const MIN_INK_CONTRAST = 4.5;

/** The color for a palette position. */
export function colorAt(n: PatternColor): PatternColorInfo {
  return PATTERN_COLORS[n] as PatternColorInfo;
}

/**
 * A small tile to begin with, so "your pattern" already shows the idea. Rows
 * top to bottom. Start again clears it to the first color.
 */
export const STARTERS: Readonly<Record<TileSize, readonly (readonly PatternColor[])[]>> = {
  3: [
    [0, 1, 0],
    [1, 2, 1],
    [0, 1, 0],
  ],
  4: [
    [2, 0, 0, 2],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [2, 0, 0, 2],
  ],
};
