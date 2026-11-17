/**
 * Color match (GAME-020): which pictures in the shared library are plainly one
 * color. The library has no color field, so this table is chosen by hand, by
 * eye, from each picture's drawing (`picture-art/*.ts`).
 *
 * A picture is listed only when the main object in it is that color. Pictures
 * that are several colors (a kite, a bee, a watermelon, a house), or whose main
 * color could be argued (amber lamp and honey jar, tan bread, pink cupcake,
 * purple grapes, a white hen with a red comb), are left out. Each picture is
 * under one color only. `color-match.test.ts` checks every entry against the
 * picture's own SVG fills, so a redrawn picture cannot quietly change color.
 *
 * Color names are text, so they live in `ui.colorMatch.names` in
 * `src/i18n/play/en.json`, keyed by these ids.
 */
export type MatchColorId = 'red' | 'orange' | 'yellow' | 'green' | 'blue';

export interface MatchColor {
  id: MatchColorId;
  /** Picture ids from `pictures.ts`, at least five. */
  pictures: readonly string[];
}

export const MATCH_COLORS: readonly MatchColor[] = [
  {
    id: 'red',
    pictures: ['apple', 'strawberry', 'cherries', 'armchair', 'telephone', 'bus', 'ladybird', 'mushroom', 'teacup', 'tractor'],
  },
  { id: 'orange', pictures: ['orange', 'cat', 'fish', 'butterfly', 'autumn-leaf'] },
  { id: 'yellow', pictures: ['banana', 'lemon', 'sun', 'moon', 'cheese', 'duck', 'sunflower'] },
  { id: 'green', pictures: ['pear', 'frog', 'cactus', 'wheelbarrow', 'watering-can', 'tree', 'train'] },
  { id: 'blue', pictures: ['kettle', 'umbrella', 'teapot', 'car', 'ball-of-wool'] },
];

/** The color a picture is listed under, or undefined when it is not in the table. */
export function colorOfPicture(id: string, table: readonly MatchColor[] = MATCH_COLORS): MatchColorId | undefined {
  return table.find((c) => c.pictures.includes(id))?.id;
}
