import { SEASON_IDS, type SeasonId } from '../lib/seasons';
import { SEASON_PAGE_BY_ID } from './seasons';

/**
 * GAME-040: the seasonal puzzle pack. The person chooses a season (never a date or place). Each season has
 * three small paper puzzles, all drawn from the shared picture library (`src/i18n/play/en.json` → `pictures`):
 *
 * 1. Match the pairs: two rows of the same four pictures, in different orders.
 * 2. Which one is different: a row of four pictures, three the same and one different.
 * 3. Color it in: one picture, drawn large.
 *
 * The pictures are chosen by hand: seven different pictures per season. Nothing here times, scores,
 * ranks or saves anything, and no answer is shown on screen.
 */

export const PACK_SEASONS: readonly SeasonId[] = SEASON_IDS;

/** The bottom row of Match the pairs, as positions in the top row. None stays in its own place. */
const RIGHT_ORDER = [2, 0, 3, 1] as const;

interface SeasonChoice {
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

const CHOICES: Readonly<Record<SeasonId, SeasonChoice>> = {
  spring: {
    pairs: ['tulip', 'butterfly', 'bird', 'ladybird'],
    same: 'watering-can',
    odd: 'seedling-in-pot',
    oddAt: 1,
    color: 'rainbow',
  },
  summer: {
    pairs: ['sunflower', 'strawberry', 'peach', 'straw-hat'],
    same: 'sailboat',
    odd: 'balloon',
    oddAt: 3,
    color: 'bicycle',
  },
  autumn: {
    pairs: ['acorn', 'autumn-leaf', 'mushroom', 'rabbit'],
    same: 'apple',
    odd: 'umbrella',
    oddAt: 0,
    color: 'owl',
  },
  winter: {
    pairs: ['snowflake', 'kettle', 'moon', 'books'],
    same: 'window-with-birds',
    odd: 'sunrise',
    oddAt: 2,
    color: 'ball-of-wool',
  },
};

export interface SeasonPack {
  readonly season: SeasonId;
  /** When the season usually runs, the same words as the season page (`src/data/seasons.ts`). */
  readonly months: string;
  /** Match the pairs: the top row, then the bottom row in another order. */
  readonly pairsLeft: readonly string[];
  readonly pairsRight: readonly string[];
  /** Which one is different: four pictures in a row. */
  readonly differentRow: readonly string[];
  /** The picture to color in. */
  readonly color: string;
}

/** The three puzzles for a season. */
export function seasonPack(season: SeasonId): SeasonPack {
  const choice = CHOICES[season];
  const row = choice.pairs.map(() => choice.same).map((id, i) => (i === choice.oddAt ? choice.odd : id));
  return {
    season,
    months: SEASON_PAGE_BY_ID[season].months,
    pairsLeft: choice.pairs,
    pairsRight: RIGHT_ORDER.map((i) => choice.pairs[i]),
    differentRow: row,
    color: choice.color,
  };
}

/** Every distinct picture id a season's pack uses. */
export function packPictures(pack: SeasonPack): string[] {
  return [...new Set([...pack.pairsLeft, ...pack.differentRow, pack.color])];
}
