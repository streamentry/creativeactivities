import { MATCH_COLORS } from '../../data/color-match';
import { MOTIFS, type ColorNumber, type GridSize } from '../../data/color-by-number';
import { picturesIn } from '../../data/pictures';
import { colorRoundFor } from './color-match';
import { HALVES_PRINT_COUNT, createHalvesRound } from './halves-match';
import { createOddRound } from './odd-one-out';
import { DICE_POOL } from './story-dice';
import { createRng, sample, shuffle, type Rng } from './random';
import { SHADOW_IDS, createShadowRound } from './shadow';
import { createSort } from './sorting';
import { buildChain } from './story-chain';
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

/** Color by number on paper: a 6 by 6 grid has squares large enough for a pencil, and it fits one page with the key. */
export const GRID_PRINT_SIZE: GridSize = 6;

/** The picture on the paper puzzle; a puzzle picture in the game too. */
export const PUZZLE_PRINT_PICTURE = 'sailboat';

export interface PrintRow {
  /** The picture to look at first (Find the same, Shadow match), if any. */
  target?: string;
  /** The pictures to choose from, in order. */
  choices: string[];
  /** The color to find in this row (Color match): a key of `ui.colorMatch.names`. */
  color?: string;
}

export type PrintSheet =
  /** Picture cards to cut out (Picture pairs: each picture twice). */
  | { layout: 'cards'; pictures: string[] }
  /** Rows of pictures, one choice per row. `shadow` darkens each row's target. */
  | { layout: 'rows'; rows: PrintRow[]; shadow: boolean; dice?: boolean }
  /** Cards to cut out and two baskets to sort them into. */
  | { layout: 'sort'; pictures: string[]; theme: string }
  /** One picture with dashed cut lines into `size` x `size` pieces, and a small guide. */
  | { layout: 'puzzle'; picture: string; size: 2 }
  /** Eight different pictures in a chain, read left to right (Story chain). */
  | { layout: 'chain'; pictures: string[] }
  /** Halves match: the left halves top to bottom, and the right halves in another order, to join with a line. */
  | { layout: 'halves'; pictures: string[]; rightOrder: string[] }
  /** Color by number: the numbers of one picture, row by row, to color with pencils from the key of four colors. */
  | { layout: 'grid'; size: GridSize; picture: string; rows: ColorNumber[][] };

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
    case 'color-match': {
      // Four rows, each a different color, with two pictures of it among four. No picture is used
      // twice on the sheet, so a picture is never a match in one row and an "other" in another.
      const rows: PrintRow[] = [];
      const used = new Set<string>();
      for (const color of shuffle(MATCH_COLORS, rng).slice(0, ROWS)) {
        const open = MATCH_COLORS.map((c) => ({ ...c, pictures: c.pictures.filter((id) => !used.has(id)) }));
        const round = colorRoundFor(open.find((c) => c.id === color.id) as (typeof open)[number], 4, rng, open);
        for (const id of round.pictures) used.add(id);
        rows.push({ color: round.color, choices: round.pictures });
      }
      return { layout: 'rows', rows, shadow: false };
    }
    case 'halves-match': {
      // Three pictures from three different categories; no right half is level with its own left half.
      const round = createHalvesRound(HALVES_PRINT_COUNT, rng);
      return { layout: 'halves', pictures: round.pictures, rightOrder: round.rightOrder };
    }
    case 'color-by-number': {
      const motif = MOTIFS[GRID_PRINT_SIZE][0];
      return { layout: 'grid', size: GRID_PRINT_SIZE, picture: motif.id, rows: motif.rows.map((row) => [...row]) };
    }
    case 'story-chain':
      return { layout: 'chain', pictures: [...buildChain(rng).pictures] };
    case 'story-dice': {
      // Four rows of four dice, no picture twice, so the paper set is sixteen different pictures.
      const rows: PrintRow[] = [];
      const pool = shuffle(DICE_POOL, rng);
      for (let i = 0; i < ROWS; i++) rows.push({ choices: pool.slice(i * 4, i * 4 + 4) });
      return { layout: 'rows', rows, shadow: false, dice: true };
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
    case 'chain':
      return sheet.pictures;
    case 'halves':
      return sheet.pictures;
    case 'grid':
      return [];
    case 'rows':
      return sheet.rows.flatMap((r) => (r.target ? [r.target, ...r.choices] : r.choices));
    case 'puzzle':
      return [sheet.picture];
  }
}
