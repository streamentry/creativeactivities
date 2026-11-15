import { sample, shuffle, type Rng } from './random';

/**
 * Four together (GAME-022): some pictures in a set share a theme; find them.
 *
 * Themes are curated, not taken from picture categories, because a category
 * such as "home" holds things a reader could place elsewhere (an umbrella, a
 * sun hat). Every picture belongs to exactly one theme, and pictures that a
 * reader could argue into two themes (a bee, a tractor, a balloon, a vase of
 * flowers) are left out entirely. Each theme is one any reader would accept
 * without one culture's knowledge.
 */
export interface TogetherTheme {
  /** Key for the theme's name in `content.fourTogether.themes`. */
  id: string;
  /** Picture ids from the shared library, at least four. */
  pictures: readonly string[];
}

export const TOGETHER_THEMES: readonly TogetherTheme[] = [
  {
    id: 'fruit',
    pictures: ['apple', 'pear', 'strawberry', 'banana', 'lemon', 'cherries', 'orange', 'grapes', 'watermelon', 'pineapple', 'peach'],
  },
  { id: 'animals', pictures: ['dog', 'cat', 'rabbit', 'duck', 'hen', 'sheep', 'owl', 'frog', 'fish', 'bird'] },
  { id: 'travel', pictures: ['car', 'bicycle', 'bus', 'train', 'airplane', 'sailboat', 'rowing-boat'] },
  { id: 'flowers', pictures: ['sunflower', 'tulip', 'rose', 'daisies'] },
  { id: 'hot-drinks', pictures: ['teacup', 'kettle', 'teapot', 'milk-jug'] },
  { id: 'weather', pictures: ['sun', 'rain-cloud', 'snowflake', 'rainbow'] },
  { id: 'baked', pictures: ['bread', 'cake', 'apple-pie', 'cupcake'] },
];

/** Picture counts a person can choose; fewer pictures is simpler. */
export const TOGETHER_COUNTS = [4, 6, 8] as const;

export interface TogetherRound {
  /** The theme the group shares. */
  theme: string;
  /** The pictures that go together. */
  group: string[];
  /** Every picture on the board, group and others, in shuffled order. */
  pictures: string[];
}

/** How many pictures make the group: three among four, otherwise four. */
export function groupSize(count: number): number {
  return count <= 4 ? 3 : 4;
}

/**
 * A round of [count] pictures. The group comes from one theme; every other
 * picture comes from a different theme, one per theme, so no second group can
 * form by accident. The previous theme is not used again straight away.
 */
export function createTogetherRound(
  count: number,
  rng: Rng,
  previousTheme?: string,
  themes: readonly TogetherTheme[] = TOGETHER_THEMES,
): TogetherRound {
  const size = groupSize(count);
  const others = Math.max(1, Math.min(count - size, themes.length - 1));
  const candidates = themes.filter((t) => t.id !== previousTheme && t.pictures.length >= size);
  const theme = sample(candidates.length > 0 ? candidates : themes, 1, rng)[0] as TogetherTheme;
  const group = sample(theme.pictures, size, rng);
  const fillers = sample(
    themes.filter((t) => t.id !== theme.id),
    others,
    rng,
  ).map((t) => sample(t.pictures, 1, rng)[0] as string);
  return { theme: theme.id, group, pictures: shuffle([...group, ...fillers], rng) };
}

export interface TogetherState {
  round: TogetherRound;
  /** Group pictures found so far, in the order they were tapped. */
  found: string[];
  /** True once "Show the group" was used; the group is shown, nothing is lost. */
  shown: boolean;
}

export function startTogether(round: TogetherRound): TogetherState {
  return { round, found: [], shown: false };
}

export type TapResult = 'found' | 'elsewhere' | 'already';

/** What a tap on [id] means, without changing anything. */
export function tapResult(state: TogetherState, id: string): TapResult {
  if (state.shown || state.found.includes(id)) return 'already';
  return state.round.group.includes(id) ? 'found' : 'elsewhere';
}

/** A new state after tapping [id]: a group picture is kept, any other changes nothing. */
export function tapTogether(state: TogetherState, id: string): TogetherState {
  if (tapResult(state, id) !== 'found') return state;
  return { ...state, found: [...state.found, id] };
}

/** Shows the whole group. Nothing is counted against anyone. */
export function showGroup(state: TogetherState): TogetherState {
  return { ...state, shown: true, found: [...state.round.group] };
}

export function isTogether(state: TogetherState): boolean {
  return state.round.group.every((id) => state.found.includes(id));
}
