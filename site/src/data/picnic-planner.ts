/**
 * Picnic planner (GAME-043): choose food and things-to-do pictures for an outing, then play a matching round with
 * the chosen pictures. The words (the summary, the messages and the labels) live in `ui.picnicPlanner` in
 * `src/i18n/play/en.json`. The pictures are ids from the shared library, so they are the same drawings as the other
 * games. English only: each `phrase` is an English summary phrase.
 *
 * Only everyday, widely shared items. Nothing here says what to eat, what is healthy, or what suits a diet, and
 * nothing depends on religion, alcohol or meat.
 */

/** Which tray a picture is offered in. */
export type PicnicGroup = 'food' | 'outing';

/** A picture the picnic basket offers, with the English phrase used in the summary line. */
export interface PicnicItem {
  /** Picture id from the shared library (`src/data/pictures.ts` or `src/data/picture-art/*`). */
  id: string;
  group: PicnicGroup;
  /**
   * The phrase in the summary: food in the plural ("apples"), things to do with an article ("a kite"), so
   * "Our picnic: bread, cheese, apples and a kite." reads as an English sentence.
   */
  phrase: string;
}

/** Food pictures, in tray order. */
export const PICNIC_FOOD: readonly PicnicItem[] = [
  { id: 'bread', group: 'food', phrase: 'bread' },
  { id: 'cheese', group: 'food', phrase: 'cheese' },
  { id: 'apple', group: 'food', phrase: 'apples' },
  { id: 'strawberry', group: 'food', phrase: 'strawberries' },
  { id: 'grapes', group: 'food', phrase: 'grapes' },
  { id: 'banana', group: 'food', phrase: 'bananas' },
  { id: 'cherries', group: 'food', phrase: 'cherries' },
  { id: 'watermelon', group: 'food', phrase: 'watermelon' },
  { id: 'pear', group: 'food', phrase: 'pears' },
  { id: 'orange', group: 'food', phrase: 'oranges' },
  { id: 'boiled-egg', group: 'food', phrase: 'boiled eggs' },
];

/** Things to do on an outing, offered after the food in the tray. */
export const PICNIC_OUTINGS: readonly PicnicItem[] = [
  { id: 'kite', group: 'outing', phrase: 'a kite' },
  { id: 'straw-hat', group: 'outing', phrase: 'a sun hat' },
  { id: 'umbrella', group: 'outing', phrase: 'an umbrella' },
  { id: 'bicycle', group: 'outing', phrase: 'a bicycle' },
  { id: 'sailboat', group: 'outing', phrase: 'a sailboat' },
  { id: 'books', group: 'outing', phrase: 'a pile of books' },
];

/** Everything the trays offer, in tray order. */
export const PICNIC_ITEMS: readonly PicnicItem[] = [...PICNIC_FOOD, ...PICNIC_OUTINGS];
