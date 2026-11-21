import { sample, shuffle, type Rng } from './random';

/**
 * Word and picture pairs (GAME-023): a few pictures, and the same pictures
 * again as written English words in another order. A person taps a word and
 * then its picture, or a picture and then its word. A matched pair stays
 * together. Nothing here counts tries, times or ends anything.
 *
 * Only pictures whose plain English name reads one way are used, so a word
 * never points at the wrong picture: "Red tulip" not "Rose", "Mantel clock" not
 * "Glasses". `word-picture.test.ts` checks the pool against the English names.
 */

/** Pairs a person can choose; four is the start. */
export const WORD_PICTURE_COUNTS = [4, 6] as const;

/** Pairs on the paper version (one page). */
export const WORD_PRINT_COUNT = 6;

/** Pictures with one plain English name each (see the note above). */
export const WORD_PICTURE_POOL: readonly string[] = [
  'teacup',
  'kettle',
  'teapot',
  'toaster',
  'cupcake',
  'pear',
  'banana',
  'lemon',
  'cherries',
  'pineapple',
  'strawberry',
  'sunflower',
  'tulip',
  'daisies',
  'mushroom',
  'acorn',
  'umbrella',
  'sailboat',
  'bicycle',
  'train',
  'bus',
  'tractor',
  'kite',
  'duck',
  'sheep',
  'owl',
  'frog',
  'snail',
  'butterfly',
  'cat',
  'dog',
  'clock',
  'candle',
  'telephone',
  'suitcase',
  'snowflake',
  'rainbow',
  'lighthouse',
  'armchair',
  'house',
  'wheelbarrow',
];

export interface WordRound {
  /** The pictures on the board, in the order shown. Each id is a picture in the library. */
  pictures: string[];
  /** The same picture ids as their words, in another order: the word for a picture is its id. */
  words: string[];
}

/**
 * Another order for the same pictures, never the same order as `pictures`
 * when there are two or more. Used for the words column and the paper sheet.
 */
export function wordOrderFor(pictures: readonly string[], rng: Rng): string[] {
  if (pictures.length < 2) return [...pictures];
  for (let attempt = 0; attempt < 10; attempt++) {
    const order = shuffle(pictures, rng);
    if (order.some((id, i) => id !== pictures[i])) return order;
  }
  return [...pictures.slice(1), pictures[0] as string];
}

/**
 * A round of [count] different pictures. When there are enough other pictures,
 * none from the [previous] round is shown again, so New pictures always looks new.
 */
export function createWordRound(count: number, rng: Rng, previous?: WordRound, pool: readonly string[] = WORD_PICTURE_POOL): WordRound {
  const size = Math.max(2, Math.min(count, pool.length));
  const used = new Set(previous?.pictures ?? []);
  const fresh = pool.filter((id) => !used.has(id));
  const pictures =
    fresh.length >= size
      ? sample(fresh, size, rng)
      : [...sample(fresh, fresh.length, rng), ...sample(pool.filter((id) => used.has(id)), size - fresh.length, rng)];
  return { pictures, words: wordOrderFor(pictures, rng) };
}

/** Which kind of tile was tapped. */
export type WordSide = 'picture' | 'word';

export interface WordChoice {
  side: WordSide;
  id: string;
}

export interface WordState {
  round: WordRound;
  /** Picture ids whose word has been tapped with them. */
  matched: string[];
  /** The one tile waiting for its partner, if any. */
  selected: WordChoice | null;
  /** The matches before the last Start again, kept for one step only. Cleared by the next match. */
  before: string[] | null;
}

/**
 * What a tap does: `ignore` (already matched), `select` (first tile, or a
 * different tile on the same side), `deselect` (the same tile again), `match`
 * (the right partner) or `miss` (the wrong partner, which quietly clears).
 */
export type WordTapResult = 'ignore' | 'select' | 'deselect' | 'match' | 'miss';

export function startWordPairs(round: WordRound): WordState {
  return { round, matched: [], selected: null, before: null };
}

export function isWordMatched(state: WordState, id: string): boolean {
  return state.matched.includes(id);
}

export function wordTapResult(state: WordState, side: WordSide, id: string): WordTapResult {
  if (isWordMatched(state, id)) return 'ignore';
  if (!state.selected) return 'select';
  if (state.selected.side === side) return state.selected.id === id ? 'deselect' : 'select';
  return state.selected.id === id ? 'match' : 'miss';
}

export function tapWord(state: WordState, side: WordSide, id: string): WordState {
  switch (wordTapResult(state, side, id)) {
    case 'ignore':
      return state;
    case 'select':
      return { ...state, selected: { side, id } };
    case 'deselect':
    case 'miss':
      return { ...state, selected: null };
    case 'match':
      return { ...state, matched: [...state.matched, id], selected: null, before: null };
  }
}

export function isWordPairsDone(state: WordState): boolean {
  return state.round.pictures.length > 0 && state.matched.length === state.round.pictures.length;
}

/**
 * Start again: every pair comes apart. The matches are kept for one "Put it
 * back". With nothing matched there is nothing to undo, so only a selection clears.
 */
export function startWordsAgain(state: WordState): WordState {
  if (state.matched.length === 0) return { ...state, selected: null };
  return { ...state, matched: [], selected: null, before: [...state.matched] };
}

/** Put back the matches from before the last Start again. One step only. */
export function putWordsBack(state: WordState): WordState {
  if (!state.before) return state;
  return { ...state, matched: state.before, selected: null, before: null };
}
