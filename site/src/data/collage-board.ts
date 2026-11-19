/**
 * Collage board (GAME-033): two people place cut-outs on one shared board, taking turns. The words (the names of
 * the people, the marks, labels and messages) are text, so they live in `ui.collageBoard` in
 * `src/i18n/play/en.json`. The pictures are ids from the shared library (`src/data/pictures.ts`), so the cut-outs
 * are the same drawings as the other games.
 */

/** The first or the second person, by place in `ui.collageBoard.people`. */
export type Person = 0 | 1;

export const PEOPLE: readonly Person[] = [0, 1];

/** Each person's pieces carry their own shape, so the two are told apart without color: a circle, then a square. */
export const PERSON_SHAPE: Readonly<Record<Person, 'circle' | 'square'>> = { 0: 'circle', 1: 'square' };

/** The board has twelve places: four across and three down (three across and four down on a narrow screen). */
export const PLACES = 12;

/** Each tray set is eight calm, everyday pictures. A second set is offered with "Another set of pictures". */
export const TRAY_SETS: readonly (readonly string[])[] = [
  ['teacup', 'kettle', 'bread', 'apple', 'sunflower', 'house', 'cat', 'umbrella'],
  ['teapot', 'watering-can', 'tulip', 'rose', 'sun', 'tree', 'fish', 'lamp'],
];
