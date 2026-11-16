import { picturesIn } from '../../data/pictures';
import { createOddRound } from './odd-one-out';
import { createRng, sample, shuffle, type Rng } from './random';
import { SHADOW_IDS, createShadowRound } from './shadow';
import { createSort } from './sorting';
import { createTogetherRound } from './together';

/**
 * WEB-052: the fixed paper versions GameView renders at build time for games
 * whose island has no print sheet. Each comes from the same generators and
 * picture library as the game, with a fixed seed, so a page always prints the
 * same sheet and a test can check it. One page on A4 and on US Letter.
 */

/** Change the seed only together with the sheet's `version` in `src/data/game-print.ts`. */
export const PRINT_SEED = 20261115;

/** Four together on paper: sets of four pictures, three of which go together. */
export const TOGETHER_PRINT_COUNT = 4;

/** The sorting theme on paper; its basket names are `content.sorting.themes[...]`. */
export const SORT_PRINT_THEME = 'kitchen-garden';

/** The picture on the paper puzzle; a puzzle picture in the game too. */
export const PUZZLE_PRINT_PICTURE = 'sailboat';

export interface PrintRow {
  /** The picture to look at first (Find the same, Shadow match), if any. */
  target?: string;
  /** The pictures to choose from, in order. */
  choices: string[];
}

export type PrintSheet =
  /** Picture cards to cut out (Picture pairs: each picture twice). */
  | { layout: 'cards'; pictures: string[] }
  /** Rows of pictures, one choice per row. `shadow` darkens each row's target. */
  | { layout: 'rows'; rows: PrintRow[]; shadow: boolean }
  /** Cards to cut out and two baskets to sort them into. */
  | { layout: 'sort'; pictures: string[]; theme: string }
  /** One picture with dashed cut lines into `size` x `size` pieces, and a small guide. */
  | { layout: 'puzzle'; picture: string; size: 2 };

const ROWS = 4;

function rowsOf(make: (rng: Rng, previous: PrintRow | undefined) => PrintRow): PrintRow[] {
  const rng = createRng(PRINT_SEED);
  const rows: PrintRow[] = [];
  for (let i = 0; i < ROWS; i++) rows.push(make(rng, rows[i - 1]));
  return rows;
}

function choiceRows(): PrintRow[] {
  return rowsOf((rng, previous) => {
    const round = createShadowRound(3, rng, previous?.target);
    return { target: round.target, choices: round.options };
  });
}

/** The paper version for `slug`, or null when the page does not render one. */
export function printSheet(slug: string): PrintSheet | null {
  const rng = createRng(PRINT_SEED);
  switch (slug) {
    case 'picture-pairs': {
      const six = sample(SHADOW_IDS, 6, rng);
      return { layout: 'cards', pictures: shuffle([...six, ...six], rng) };
    }
    case 'find-the-same':
      return { layout: 'rows', rows: choiceRows(), shadow: false };
    case 'shadow-match':
      return { layout: 'rows', rows: choiceRows(), shadow: true };
    case 'four-together': {
      let theme: string | undefined;
      return {
        layout: 'rows',
        shadow: false,
        rows: rowsOf((r) => {
          const round = createTogetherRound(TOGETHER_PRINT_COUNT, r, theme);
          theme = round.theme;
          return { choices: round.pictures };
        }),
      };
    }
    case 'odd-one-out': {
      let last: { theme: string; odd: string } | undefined;
      return {
        layout: 'rows',
        shadow: false,
        rows: rowsOf((r) => {
          const round = createOddRound(4, r, last);
          last = round;
          return { choices: round.pictures };
        }),
      };
    }
    case 'sort-together': {
      const ids = (category: 'kitchen' | 'garden') => picturesIn(category).map((p) => p.id);
      const state = createSort(ids('kitchen'), ids('garden'), 4, rng);
      return { layout: 'sort', pictures: state.items.map((i) => i.id), theme: SORT_PRINT_THEME };
    }
    case 'picture-puzzle':
      return { layout: 'puzzle', picture: PUZZLE_PRINT_PICTURE, size: 2 };
    default:
      return null;
  }
}

/** Every picture id a sheet uses, for tests and asset checks. */
export function sheetPictures(sheet: PrintSheet): string[] {
  switch (sheet.layout) {
    case 'cards':
    case 'sort':
      return sheet.pictures;
    case 'rows':
      return sheet.rows.flatMap((r) => (r.target ? [r.target, ...r.choices] : r.choices));
    case 'puzzle':
      return [sheet.picture];
  }
}
