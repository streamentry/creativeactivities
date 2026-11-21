/**
 * GAME-040: the monthly puzzle pack. The person chooses a month. The page starts on the current month of the
 * person's device (`monthForDate`), and the choice can be changed. Each month has three small paper puzzles, all
 * drawn from the shared picture library (`src/i18n/play/en.json` → `pictures` and the picture library):
 *
 * 1. Match the pairs: two rows of the same four pictures, in different orders.
 * 2. Which one is different: a row of four pictures, three the same and one different.
 * 3. Color it in: one picture, drawn large.
 *
 * The pictures are chosen by hand: seven different pictures per month, everyday things and activities rather
 * than festivals or foods of one culture. Where a month's pictures assume the northern half of the world (planting,
 * leaves, birds at a feeder), its comment says so. The southern-half and other-culture checks are still open
 * (docs/specs GAME-040 row). Nothing here times, scores, ranks or saves anything, and no answer is shown on screen.
 */

/** Month numbers from 0 (January) to 11 (December), as `Date#getMonth` counts them. */
export const PACK_MONTHS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
export type MonthId = (typeof PACK_MONTHS)[number];

/** The month the page shows before the device's month is read, and in the printed sheet. */
export const DEFAULT_MONTH: MonthId = 0;

/** The month a device date falls in, by the device's own calendar. */
export function monthForDate(today: Date): MonthId {
  return today.getMonth() as MonthId;
}

/** The bottom row of Match the pairs, as positions in the top row. None stays in its own place. */
const RIGHT_ORDER = [2, 0, 3, 1] as const;

interface MonthChoice {
  /** Four pictures for Match the pairs, in the top-row order. */
  readonly pairs: readonly [string, string, string, string];
  /** The picture that appears three times in Which one is different. */
  readonly same: string;
  /** The one picture that differs. */
  readonly odd: string;
  /** Where the different picture sits in the row (0 to 3). */
  readonly oddAt: number;
  /** The picture to color in. */
  readonly color: string;
}

/**
 * One entry per month, in order. Each comment names the month's loose theme; the pictures are everyday things
 * unless the comment says otherwise.
 */
const CHOICES: Readonly<Record<MonthId, MonthChoice>> = {
  // January: warm drinks and quiet days indoors.
  0: {
    pairs: ['teacup', 'kettle', 'books', 'bread'],
    same: 'lamp',
    odd: 'cactus',
    oddAt: 2,
    color: 'clock',
  },
  // February: letters, cards and photographs to send.
  1: {
    pairs: ['letter-and-envelope', 'open-greeting-card', 'photo-postcard-with-stamp', 'open-photo-album'],
    same: 'telephone',
    odd: 'radio',
    oddAt: 1,
    color: 'house',
  },
  // March: seeds and pots. Planting in March assumes the northern spring, so this month reads northern.
  2: {
    pairs: ['seedling-in-pot', 'painted-plant-pot', 'potted-plant', 'daisies'],
    same: 'butterfly',
    odd: 'bird',
    oddAt: 0,
    color: 'watering-can',
  },
  // April: painting and bright small things.
  3: {
    pairs: ['painted-garden-stone', 'shared-painted-canvas', 'ladybird', 'rose'],
    same: 'balloon',
    odd: 'kite',
    oddAt: 3,
    color: 'sailboat',
  },
  // May: fruit on the table and a bicycle ride.
  4: {
    pairs: ['cherries', 'lemon', 'grapes', 'cupcake'],
    same: 'duck',
    odd: 'snail',
    oddAt: 1,
    color: 'bicycle',
  },
  // June: fruit from the shop and animals on a farm.
  5: {
    pairs: ['watermelon', 'pineapple', 'banana', 'orange'],
    same: 'fish',
    odd: 'sheep',
    oddAt: 2,
    color: 'lighthouse',
  },
  // July: getting about, on water and on land.
  6: {
    pairs: ['rowing-boat', 'sailboat', 'bicycle', 'train'],
    same: 'car',
    odd: 'tractor',
    oddAt: 3,
    color: 'paper-boat-afloat',
  },
  // August: fruit and pets at home.
  7: {
    pairs: ['peach', 'grapes', 'orange', 'cherries'],
    same: 'cat',
    odd: 'dog',
    oddAt: 0,
    color: 'vase-of-flowers',
  },
  // September: apples and things for a new routine. Apple picking is a northern autumn image, though apples
  // are sold all year, so the apple is kept.
  8: {
    pairs: ['apple', 'pear', 'milk-jug', 'cheese'],
    same: 'key',
    odd: 'suitcase',
    oddAt: 2,
    color: 'armchair',
  },
  // October: leaves, acorns and mushrooms. Reads as the northern autumn; a southern October has none of these.
  9: {
    pairs: ['autumn-leaf', 'acorn', 'mushroom', 'rabbit'],
    same: 'apple',
    odd: 'umbrella',
    oddAt: 1,
    color: 'owl',
  },
  // November: wool, buttons and things to make with the hands.
  10: {
    pairs: ['ball-of-wool', 'yarn-ball-with-thread', 'hen', 'woven-paper-mat'],
    same: 'lamp',
    odd: 'teapot',
    oddAt: 0,
    color: 'tree',
  },
  // December: a room with a window. Birds at a window and a pine-cone feeder read as the northern winter.
  11: {
    pairs: ['moon', 'window-with-birds', 'teapot', 'pine-cone-bird-feeder'],
    same: 'armchair',
    odd: 'frying-pan',
    oddAt: 3,
    color: 'house',
  },
};

export interface MonthPack {
  readonly month: MonthId;
  /** Match the pairs: the top row, then the bottom row in another order. */
  readonly pairsLeft: readonly string[];
  readonly pairsRight: readonly string[];
  /** Which one is different: four pictures in a row. */
  readonly differentRow: readonly string[];
  /** The picture to color in. */
  readonly color: string;
}

/** The three puzzles for a month. */
export function monthPack(month: MonthId): MonthPack {
  const choice = CHOICES[month];
  const row = choice.pairs.map(() => choice.same).map((id, i) => (i === choice.oddAt ? choice.odd : id));
  return {
    month,
    pairsLeft: choice.pairs,
    pairsRight: RIGHT_ORDER.map((i) => choice.pairs[i]),
    differentRow: row,
    color: choice.color,
  };
}

/** Every distinct picture id a month's pack uses. */
export function packPictures(pack: MonthPack): string[] {
  return [...new Set([...pack.pairsLeft, ...pack.differentRow, pack.color])];
}
