import { PATTERN_COLORS, colorAt, type PatternColor, type PatternColorInfo } from './pattern-maker';

/**
 * Build together (GAME-048): two people fill one shared grid, one piece each in
 * turn. Each person has one of four colors, chosen at the start, and each color
 * has a written name and a shape. Words (names of the people and the colors,
 * labels, messages) are text, so they live in `ui.buildTogether` in
 * `src/i18n/play/en.json`.
 *
 * The four colors are the ones Pattern maker and Color by number use, taken from
 * `pattern-maker.ts` rather than copied, so the three games cannot drift apart.
 * They were chosen and tested to stay apart for red-green and blue-yellow
 * color-vision differences and in grayscale, and each has its own shape beside
 * it, so color is never the only signal.
 */

/** The first or the second person, by place in `ui.buildTogether.people`. */
export type Person = 0 | 1;

export const PEOPLE: readonly Person[] = [0, 1];

/** A shared grid is this many squares across and down. */
export type BoardSize = 3 | 4;

export const BOARD_SIZES: readonly BoardSize[] = [3, 4];

/** The grid people start with. */
export const DEFAULT_BOARD_SIZE: BoardSize = 4;

/** The colors the first and the second person start with: Orange and Purple, far apart in lightness and in hue. */
export const DEFAULT_COLORS: readonly [PatternColor, PatternColor] = [1, 3];

export type { PatternColor, PatternColorInfo };

/** The four colors a person can choose from, in the order of `ui.buildTogether.colors`. */
export const BUILD_COLORS: readonly PatternColorInfo[] = PATTERN_COLORS;

/** The color for a palette position. */
export const buildColorAt = colorAt;
