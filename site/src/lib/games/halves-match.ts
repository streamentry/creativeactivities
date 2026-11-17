import { HALVES_PICTURES } from '../../data/halves-match';
import { PICTURE_BY_ID } from '../../data/pictures';
import { shuffle, type Rng } from './random';

/**
 * Halves match (GAME-021): the left halves of two or three pictures are in one
 * column and their right halves, in another order, in the other. Tap one half and
 * then the half that fits it. A pair that fits is joined into a whole picture; a
 * pair that does not simply separates again. Nothing is counted, timed or lost.
 *
 * Two or three pictures only, always from different categories (kitchen, garden,
 * animals, fruit, home, travel), so no right half can be argued to go with the
 * wrong left half by what the picture is.
 */

/** Pictures a person can choose; two is the simplest. */
export const HALVES_COUNTS = [2, 3] as const;

/** Halves match on paper: three pictures, so there is room to draw a line from each left half to its right half. */
export const HALVES_PRINT_COUNT = 3;

export type HalvesSide = 'left' | 'right';

export interface HalvesRound {
  /** Picture ids top to bottom: the left halves, in this order. */
  pictures: string[];
  /**
   * Picture ids top to bottom: the right halves as first shown. No right half
   * starts in the row of its own left half, so the answer is never lined up.
   */
  rightOrder: string[];
}

/** The category of a library picture, or undefined for an unknown id. */
export function halvesCategory(id: string): string | undefined {
  return PICTURE_BY_ID.get(id)?.category;
}

/** [ids] in a new order where no id keeps its place. One id has no such order, so it is returned as it is. */
export function derange(ids: readonly string[], rng: Rng): string[] {
  if (ids.length < 2) return [...ids];
  for (let tries = 0; tries < 50; tries++) {
    const order = shuffle(ids, rng);
    if (order.every((id, i) => id !== ids[i])) return order;
  }
  // A rotation by one never keeps an id in its place.
  return [...ids.slice(1), ids[0] as string];
}

/**
 * [count] pictures from [pool], each from a different category, none of them in
 * [previous] while another choice is open, so "Another set" is new pictures.
 */
export function pickHalves(
  count: number,
  rng: Rng,
  previous: readonly string[] = [],
  pool: readonly string[] = HALVES_PICTURES,
  categoryOf: (id: string) => string | undefined = halvesCategory,
): string[] {
  const fresh = pool.filter((id) => !previous.includes(id));
  for (const candidates of [fresh, pool]) {
    const picked: string[] = [];
    const used = new Set<string | undefined>();
    for (const id of shuffle(candidates, rng)) {
      if (picked.length >= count) break;
      const category = categoryOf(id);
      if (used.has(category)) continue;
      used.add(category);
      picked.push(id);
    }
    if (picked.length >= count) return picked;
  }
  throw new Error(`Halves match needs ${count} pictures from different categories.`);
}

/** Up to [n] more pictures for a board that already has [have], each from a category not yet on it. */
function pickMore(have: readonly string[], n: number, rng: Rng, pool: readonly string[]): string[] {
  const used = new Set(have.map(halvesCategory));
  const added: string[] = [];
  for (const id of shuffle(pool.filter((p) => !have.includes(p)), rng)) {
    if (added.length >= n) break;
    const category = halvesCategory(id);
    if (used.has(category)) continue;
    used.add(category);
    added.push(id);
  }
  return added;
}

/** A round of [count] pictures (2 or 3). [previous] pictures are left out, so a new set is new. */
export function createHalvesRound(count: number, rng: Rng, previous: readonly string[] = [], pool: readonly string[] = HALVES_PICTURES): HalvesRound {
  const pictures = pickHalves(count, rng, previous, pool);
  return { pictures, rightOrder: derange(pictures, rng) };
}

/** The selected half, if one is waiting for its other half. */
export interface HalvesSelection {
  side: HalvesSide;
  id: string;
}

export interface HalvesState {
  round: HalvesRound;
  /** Picture ids top to bottom: the right halves as they are now. A joined one sits in its own row. */
  right: string[];
  /** Pictures whose two halves are joined, in the order they were joined. */
  joined: string[];
  /** True once "Show me" was used; every picture is whole and nothing is lost. */
  shown: boolean;
  selected: HalvesSelection | null;
}

export function startHalves(round: HalvesRound): HalvesState {
  return { round, right: [...round.rightOrder], joined: [], shown: false, selected: null };
}

export type HalvesTapResult =
  /** A half is chosen (or the choice moves to another half on the same side). */
  | 'select'
  /** The chosen half is tapped again, so it is put down. */
  | 'deselect'
  /** The two halves belong to one picture. */
  | 'fit'
  /** The two halves do not belong together; they separate again. */
  | 'apart'
  /** A half that is already joined, or any tap after "Show me". */
  | 'ignore';

export function isHalfJoined(state: HalvesState, id: string): boolean {
  return state.joined.includes(id);
}

/** What a tap on the [side] half of picture [id] means, without changing anything. */
export function halvesTapResult(state: HalvesState, side: HalvesSide, id: string): HalvesTapResult {
  if (state.shown || isHalfJoined(state, id)) return 'ignore';
  const { selected } = state;
  if (!selected || selected.side === side) return selected && selected.id === id ? 'deselect' : 'select';
  return selected.id === id ? 'fit' : 'apart';
}

/**
 * A new state after a tap. A fitting pair is joined: the right half moves to the
 * row of its left half, and the half that was there takes the place it left. Any
 * other pair is put down again, and nothing else changes.
 */
export function tapHalf(state: HalvesState, side: HalvesSide, id: string): HalvesState {
  switch (halvesTapResult(state, side, id)) {
    case 'ignore':
      return state;
    case 'select':
      return { ...state, selected: { side, id } };
    case 'deselect':
    case 'apart':
      return { ...state, selected: null };
    case 'fit': {
      const row = state.round.pictures.indexOf(id);
      const from = state.right.indexOf(id);
      const right = [...state.right];
      right[from] = right[row] as string;
      right[row] = id;
      return { ...state, right, joined: [...state.joined, id], selected: null };
    }
  }
}

/** Joins every picture. Nothing is counted against anyone. */
export function showHalves(state: HalvesState): HalvesState {
  return { ...state, right: [...state.round.pictures], joined: [...state.round.pictures], shown: true, selected: null };
}

export function isHalvesDone(state: HalvesState): boolean {
  return state.round.pictures.every((id) => state.joined.includes(id));
}

/** The pictures still to join, top to bottom. */
export function loosePictures(state: HalvesState): string[] {
  return state.round.pictures.filter((id) => !state.joined.includes(id));
}

/**
 * WEB-053: the state after a count change, keeping the pictures already joined.
 * Going down takes away pictures not yet joined first (a joined one is the last
 * to go); going up adds new pictures from other categories at the bottom. The
 * halves still to join are placed so that none sits beside its own other half
 * unless it is the only one left.
 */
export function resizeHalvesState(state: HalvesState, count: number, rng: Rng, pool: readonly string[] = HALVES_PICTURES): HalvesState {
  const { pictures } = state.round;
  let kept = [...pictures];
  if (kept.length > count) {
    const unjoined = shuffle(kept.filter((id) => !state.joined.includes(id)), rng);
    const drop = new Set(unjoined.slice(0, kept.length - count));
    for (const id of state.joined.slice().reverse()) {
      if (drop.size >= kept.length - count) break;
      drop.add(id);
    }
    kept = kept.filter((id) => !drop.has(id));
  } else if (kept.length < count) {
    kept = [...kept, ...pickMore(kept, count - kept.length, rng, pool)];
  }

  const joined = state.joined.filter((id) => kept.includes(id));
  const loose = kept.filter((id) => !joined.includes(id));
  const order = derange(loose, rng);
  const right = kept.map((id) => (joined.includes(id) ? id : (order[loose.indexOf(id)] as string)));
  const selected = state.selected && kept.includes(state.selected.id) && !joined.includes(state.selected.id) ? state.selected : null;
  return { round: { pictures: kept, rightOrder: right }, right, joined, shown: state.shown && joined.length === kept.length, selected };
}
