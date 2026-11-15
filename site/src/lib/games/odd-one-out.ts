import { sample, shuffle, type Rng } from './random';
import { TOGETHER_THEMES, type TogetherTheme } from './together';

/**
 * Odd one out (GAME-018): in a set of three or four pictures, all but one
 * share a theme; tap the one that does not belong.
 *
 * It reuses Four together's hand-picked themes, where every picture belongs
 * to exactly one theme and pictures a reader could place in two are left out,
 * so the odd picture always comes from a different theme than the others and
 * there is only ever one fair answer.
 */

/** Picture counts a person can choose; three is the simplest. */
export const ODD_COUNTS = [3, 4] as const;

export interface OddRound {
  /** The theme the other pictures share. */
  theme: string;
  /** The picture that does not belong, always from another theme. */
  odd: string;
  /** Every picture on the board, in shuffled order. */
  pictures: string[];
}

/** How many pictures share the theme: all but the odd one, two or three. */
export function sharedSize(count: number): number {
  return Math.min(3, Math.max(2, count - 1));
}

/**
 * A round of [count] pictures (3 or 4). The previous round's theme and odd
 * picture are not used again straight away, so the same set never repeats.
 */
export function createOddRound(
  count: number,
  rng: Rng,
  previous?: Pick<OddRound, 'theme' | 'odd'>,
  themes: readonly TogetherTheme[] = TOGETHER_THEMES,
): OddRound {
  if (themes.length < 2) throw new Error('Odd one out needs at least two themes.');
  const size = sharedSize(count);
  const fits = themes.filter((t) => t.pictures.length >= size);
  const fresh = fits.filter((t) => t.id !== previous?.theme);
  const theme = sample(fresh.length > 0 ? fresh : fits, 1, rng)[0] as TogetherTheme;
  const shared = sample(theme.pictures, size, rng);
  const elsewhere = themes.filter((t) => t.id !== theme.id).flatMap((t) => t.pictures);
  const notLast = elsewhere.filter((id) => id !== previous?.odd);
  const odd = sample(notLast.length > 0 ? notLast : elsewhere, 1, rng)[0] as string;
  return { theme: theme.id, odd, pictures: shuffle([...shared, odd], rng) };
}

export interface OddState {
  round: OddRound;
  /** True once the odd picture was tapped or shown. */
  found: boolean;
  /** True once "Show me" was used; nothing is counted against anyone. */
  shown: boolean;
}

export function startOdd(round: OddRound): OddState {
  return { round, found: false, shown: false };
}

export type OddTapResult = 'odd' | 'belongs' | 'already';

/** What a tap on [id] means, without changing anything. */
export function oddTapResult(state: OddState, id: string): OddTapResult {
  if (state.found) return 'already';
  return id === state.round.odd ? 'odd' : 'belongs';
}

/** A new state after tapping [id]: the odd picture is found; any other tap changes nothing. */
export function tapOdd(state: OddState, id: string): OddState {
  if (oddTapResult(state, id) !== 'odd') return state;
  return { ...state, found: true };
}

/** Reveals the odd picture. No penalty, nothing recorded. */
export function showOdd(state: OddState): OddState {
  return { ...state, found: true, shown: true };
}
