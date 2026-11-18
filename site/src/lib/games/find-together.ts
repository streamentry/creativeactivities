import { createPairs, type PairTile } from './pairs';
import { sample, type Rng } from './random';

/**
 * Find together (GAME-047). Two people share one screen and take turns. On a turn,
 * the person whose turn it is turns over two cards to look for a pair.
 *
 * - A matching pair is found together, and the turn passes at once. Each turn is two
 *   cards, so the turn passes after every completed turn, match or not.
 * - Two cards that do not match stay face up until the person presses "Turn them
 *   back". Then the turn passes. There is no timer: nothing turns back by itself.
 * - Either person may pass at any time. Pass turns back any card still face up and
 *   passes the turn.
 * - The tally only counts up: the pairs found together. There are no misses, tries
 *   or per-person counts, and nothing here scores, times or declares a winner.
 *
 * Every function returns a new value and never changes the state it is given.
 */

/** The first or the second person, by place in `ui.findTogether.people`. */
export type Person = 0 | 1;

/** A board has this many cards: three, four or six pairs. */
export type CardCount = 6 | 8 | 12;

export const CARD_COUNTS: readonly CardCount[] = [6, 8, 12];

/** The board people start with: three pairs. */
export const DEFAULT_CARD_COUNT: CardCount = 6;

export interface FindState {
  /** The cards in their places. Each picture is on exactly two cards. */
  tiles: readonly PairTile[];
  /** Whose turn it is. */
  turn: Person;
  /**
   * The unmatched cards turned up in this turn: none, one, or two that differ and wait
   * for "Turn them back". Matched cards are never listed here.
   */
  turned: readonly number[];
}

export type FindOutcome =
  /** The first card of a turn is face up. */
  | 'turned'
  /** A pair is found together, and the turn passes. */
  | 'matched'
  /** Two cards differ: they stay face up until Turn them back. */
  | 'different'
  /** A tap while two cards wait for Turn them back: nothing changes. */
  | 'waiting'
  /** A matched card, or a card already face up this turn: nothing changes. */
  | 'ignored'
  /** Every pair is found: nothing changes. */
  | 'finished'
  /** Turn them back: the two cards go face down and the turn passes. */
  | 'turnedBack'
  /** Pass: any card face up goes back down and the turn passes. */
  | 'passed';

export interface FindResult {
  state: FindState;
  outcome: FindOutcome;
}

/** How a card looks: a matched pair, the two cards waiting, the first card, a face-down card, or a shown picture. */
export type CardVisual = 'resting' | 'selected' | 'mismatch' | 'matched' | 'hidden';

export const otherPerson = (person: Person): Person => (person === 0 ? 1 : 0);

/**
 * A new board of `cards` cards, drawn from `pictureIds`, each picture on exactly two
 * cards and shuffled. The first person takes the first turn.
 */
export function deal(cards: CardCount, pictureIds: readonly string[], rng: Rng): FindState {
  const values = sample(pictureIds, cards / 2, rng);
  return { tiles: createPairs(values, rng).tiles, turn: 0, turned: [] };
}

/** Two cards differ and wait for Turn them back. */
export const isWaiting = (state: FindState): boolean => state.turned.length === 2;

/** Every pair is found. */
export const isFinished = (state: FindState): boolean => state.tiles.length > 0 && state.tiles.every((t) => t.matched);

/** The tally: pairs found together. It only ever goes up. */
export const pairsFound = (state: FindState): number => state.tiles.filter((t) => t.matched).length / 2;

/** One tap on a card. A matched card or a card already face up this turn is ignored. */
export function turnCard(state: FindState, index: number): FindResult {
  if (isFinished(state)) return { state, outcome: 'finished' };
  if (isWaiting(state)) return { state, outcome: 'waiting' };
  const tile = state.tiles[index];
  if (!tile || tile.matched || state.turned.includes(index)) return { state, outcome: 'ignored' };

  const first = state.turned[0];
  if (first === undefined) return { state: { ...state, turned: [index] }, outcome: 'turned' };

  if (state.tiles[first]?.value === tile.value) {
    const tiles = state.tiles.map((t, i) => (i === index || i === first ? { ...t, matched: true } : t));
    return { state: { tiles, turn: otherPerson(state.turn), turned: [] }, outcome: 'matched' };
  }
  return { state: { ...state, turned: [first, index] }, outcome: 'different' };
}

/** Turn them back: only while two different cards wait. The turn passes. */
export function turnBack(state: FindState): FindResult {
  if (!isWaiting(state)) return { state, outcome: 'ignored' };
  return { state: { ...state, turn: otherPerson(state.turn), turned: [] }, outcome: 'turnedBack' };
}

/** Pass, at any time before every pair is found. Cards still face up go back down. */
export function pass(state: FindState): FindResult {
  if (isFinished(state)) return { state, outcome: 'finished' };
  return { state: { ...state, turn: otherPerson(state.turn), turned: [] }, outcome: 'passed' };
}

/**
 * How one card looks. `showing` is the "Play with pictures showing" choice: every
 * card that is not matched or turned still shows its picture when it is on.
 */
export function cardVisual(state: FindState, index: number, showing: boolean): CardVisual {
  const tile = state.tiles[index];
  if (!tile) return 'hidden';
  if (tile.matched) return 'matched';
  if (state.turned.includes(index)) return isWaiting(state) ? 'mismatch' : 'selected';
  return showing ? 'resting' : 'hidden';
}

/** A card shows its picture, rather than its back, in this visual state. */
export const isFaceUp = (visual: CardVisual): boolean => visual !== 'hidden';
