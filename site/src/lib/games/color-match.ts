import { MATCH_COLORS, colorOfPicture, type MatchColor, type MatchColorId } from '../../data/color-match';
import { sample, shuffle, type Rng } from './random';

/**
 * Color match (GAME-020): a color is shown with its name, and the player taps
 * every picture that is that color. A tap on any other picture is only
 * answered with its own color ("The pear is green."); nothing is counted,
 * timed or lost.
 *
 * Every picture on the board comes from the hand-curated table in
 * `src/data/color-match.ts`, so each one has a known color: the ones to find
 * are the target color, and every other picture is one of a different color.
 */

/** Picture counts a person can choose; four is the simplest. */
export const COLOR_COUNTS = [4, 6] as const;

/** How many pictures are the target color: half the board, so two of four and three of six. */
export function matchSize(count: number): number {
  return Math.max(2, Math.floor(count / 2));
}

export interface ColorRound {
  /** The color to find. */
  color: MatchColorId;
  /** The pictures of that color on the board. */
  matches: string[];
  /** Every picture on the board, matches and others, in shuffled order. */
  pictures: string[];
}

/** [n] pictures from colors other than [color], one per color before any color is used twice. */
function pickOthers(table: readonly MatchColor[], color: MatchColorId, n: number, rng: Rng, taken: readonly string[] = []): string[] {
  const colors = shuffle(table.filter((c) => c.id !== color), rng);
  const out: string[] = [];
  for (let pass = 0; out.length < n && pass < 3; pass++) {
    for (const c of colors) {
      if (out.length >= n) break;
      const open = c.pictures.filter((id) => !out.includes(id) && !taken.includes(id));
      if (open.length > 0) out.push(sample(open, 1, rng)[0] as string);
    }
  }
  return out;
}

/** A round of [count] pictures for a chosen [target] color: its matches, and others of different colors. */
export function colorRoundFor(target: MatchColor, count: number, rng: Rng, table: readonly MatchColor[] = MATCH_COLORS): ColorRound {
  const size = matchSize(count);
  const matches = sample(target.pictures, size, rng);
  const others = pickOthers(table, target.id, Math.max(1, count - size), rng);
  return { color: target.id, matches, pictures: shuffle([...matches, ...others], rng) };
}

/**
 * A round of [count] pictures (4 or 6). The previous round's color is not used
 * again straight away, so "Another color" always is one.
 */
export function createColorRound(count: number, rng: Rng, previous?: MatchColorId, table: readonly MatchColor[] = MATCH_COLORS): ColorRound {
  const size = matchSize(count);
  const fits = table.filter((c) => c.pictures.length >= size);
  if (fits.length === 0 || table.length < 2) throw new Error('Color match needs at least two colors with enough pictures.');
  const fresh = fits.filter((c) => c.id !== previous);
  const target = sample(fresh.length > 0 ? fresh : fits, 1, rng)[0] as MatchColor;
  return colorRoundFor(target, count, rng, table);
}

export interface ColorState {
  round: ColorRound;
  /** Matching pictures found so far, in the order they were tapped. */
  found: string[];
  /** True once "Show them" was used; the matches are shown and nothing is lost. */
  shown: boolean;
}

export function startColors(round: ColorRound): ColorState {
  return { round, found: [], shown: false };
}

export type ColorTapResult = 'found' | 'other' | 'already';

/** What a tap on [id] means, without changing anything. */
export function colorTapResult(state: ColorState, id: string): ColorTapResult {
  if (!state.round.matches.includes(id)) return 'other';
  return state.shown || state.found.includes(id) ? 'already' : 'found';
}

/** A new state after tapping [id]: a matching picture is kept, any other changes nothing. */
export function tapColor(state: ColorState, id: string): ColorState {
  if (colorTapResult(state, id) !== 'found') return state;
  return { ...state, found: [...state.found, id] };
}

/** Shows every matching picture. Nothing is counted against anyone. */
export function showColors(state: ColorState): ColorState {
  return { ...state, shown: true, found: [...state.round.matches] };
}

export function isColorDone(state: ColorState): boolean {
  return state.round.matches.every((id) => state.found.includes(id));
}

/** The color of a picture on the board, from the table. */
export function pictureColor(id: string, table: readonly MatchColor[] = MATCH_COLORS): MatchColorId | undefined {
  return colorOfPicture(id, table);
}

/**
 * WEB-053: the state after a count change. The color, and the pictures already
 * on the board, stay; a match is added or taken away when the number to find
 * changes (a found one is the last to go), and the others are added or taken
 * away to fit. New pictures go in at random places among the old ones.
 */
export function resizeColorState(state: ColorState, count: number, rng: Rng, table: readonly MatchColor[] = MATCH_COLORS): ColorState {
  const { round } = state;
  const color = table.find((c) => c.id === round.color);
  const wantMatches = matchSize(count);
  const wantOthers = Math.max(1, count - wantMatches);
  let matches = [...round.matches];
  let others = round.pictures.filter((id) => !round.matches.includes(id));

  if (matches.length > wantMatches) {
    const loose = matches.filter((id) => !state.found.includes(id));
    const keep = new Set([...state.found, ...shuffle(loose, rng)].slice(0, wantMatches));
    matches = matches.filter((id) => keep.has(id));
  } else if (matches.length < wantMatches) {
    const unused = (color?.pictures ?? []).filter((id) => !matches.includes(id));
    matches = [...matches, ...sample(unused, wantMatches - matches.length, rng)];
  }

  if (others.length > wantOthers) others = sample(others, wantOthers, rng);
  else if (others.length < wantOthers) {
    others = [...others, ...pickOthers(table, round.color, wantOthers - others.length, rng, others)];
  }

  const keptOrder = round.pictures.filter((id) => matches.includes(id) || others.includes(id));
  const added = shuffle([...matches, ...others].filter((id) => !keptOrder.includes(id)), rng);
  const pictures = [...keptOrder];
  for (const id of added) pictures.splice(Math.floor(rng() * (pictures.length + 1)), 0, id);

  const found = state.shown ? [...matches] : state.found.filter((id) => matches.includes(id));
  return { round: { color: round.color, matches, pictures }, found, shown: state.shown };
}
