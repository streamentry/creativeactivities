/**
 * Garden planner (GAME-041): choose plants from pictures and lay them out in twelve beds. The words (the summary,
 * the messages and the labels) are text, so they live in `ui.gardenPlanner` in `src/i18n/play/en.json`. The pictures
 * are ids from the shared library, so they are the same drawings as the other games. English only: the plural
 * names below are English words, used only in the summary line.
 *
 * This is a picture plan to talk about. Nothing here says when, where or how to plant anything.
 */

/** Twelve beds: four across and three down (three across and four down on a narrow screen). */
export const BEDS = 12;

/** A picture the tray offers, with the English singular and plural names used in the summary line. */
export interface GardenItem {
  /** Picture id from the shared library (`src/data/pictures.ts` or `src/data/picture-art/*`). */
  id: string;
  one: string;
  many: string;
}

/** The plant pictures, in tray order. */
export const PLANTS: readonly GardenItem[] = [
  { id: 'tulip', one: 'tulip', many: 'tulips' },
  { id: 'sunflower', one: 'sunflower', many: 'sunflowers' },
  { id: 'rose', one: 'rose', many: 'roses' },
  { id: 'daisies', one: 'daisy', many: 'daisies' },
  { id: 'potted-plant', one: 'potted plant', many: 'potted plants' },
  { id: 'seedling-in-pot', one: 'seedling pot', many: 'seedling pots' },
  { id: 'tree', one: 'tree', many: 'trees' },
  { id: 'cactus', one: 'cactus', many: 'cacti' },
  { id: 'strawberry', one: 'strawberry', many: 'strawberries' },
];

/** Garden things that are not plants, offered after the plants in the tray. */
export const GARDEN_EXTRAS: readonly GardenItem[] = [
  { id: 'watering-can', one: 'watering can', many: 'watering cans' },
  { id: 'birdhouse', one: 'birdhouse', many: 'birdhouses' },
];

/** Everything the tray offers, in tray order. */
export const GARDEN_ITEMS: readonly GardenItem[] = [...PLANTS, ...GARDEN_EXTRAS];
