/**
 * WEB-053: changing the picture count keeps the place. When a person picks a
 * different number of pictures mid-round, the round they are in is resized
 * instead of replaced: the same target, theme, odd picture or pictures stay on
 * the board, and only the extras are added or taken away. Nothing a person has
 * already found or matched is lost.
 */
import { sample, shuffle, type Rng } from './random';
import { sharedSize, createOddRound, type OddRound, type OddState } from './odd-one-out';
import { groupSize, type TogetherRound, type TogetherState, type TogetherTheme } from './together';

/** Puts each new item at a random place in an existing order, leaving the old items in order. */
function insertAtRandom<T>(order: readonly T[], additions: readonly T[], rng: Rng): T[] {
  const out = [...order];
  for (const item of additions) out.splice(Math.floor(rng() * (out.length + 1)), 0, item);
  return out;
}

/** Drops random items that are not in [keep] until [length] remain, keeping the order of the rest. */
function dropRandom<T>(order: readonly T[], length: number, keep: (item: T) => boolean, rng: Rng): T[] {
  const out = [...order];
  while (out.length > length) {
    const removable = out.map((item, i) => (keep(item) ? -1 : i)).filter((i) => i >= 0);
    if (removable.length === 0) break;
    out.splice(removable[Math.floor(rng() * removable.length)] as number, 1);
  }
  return out;
}

/**
 * [values] resized to [count] pictures: the first [count] stay, or new ones
 * from [pool] are added after them. Used for pairs, where the pictures on the
 * board are the set, in the order they were chosen.
 */
export function resizeValues(values: readonly string[], count: number, pool: readonly string[], rng: Rng): string[] {
  if (count <= values.length) return values.slice(0, count);
  const fresh = sample(pool.filter((id) => !values.includes(id)), count - values.length, rng);
  return [...values, ...fresh];
}

/**
 * The options of a "find the one" round resized to [count], keeping the
 * [target] and as many of the pictures on the board as fit. New pictures are
 * placed at random among the old ones. The result never has fewer than two
 * options, matching the round builders.
 */
export function resizePicks(
  options: readonly string[],
  target: string,
  count: number,
  pool: readonly string[],
  rng: Rng,
): string[] {
  const wanted = Math.max(2, count);
  if (options.length > wanted) return dropRandom(options, wanted, (id) => id === target, rng);
  if (options.length === wanted) return [...options];
  const fresh = sample(pool.filter((id) => !options.includes(id)), wanted - options.length, rng);
  return insertAtRandom(options, fresh, rng);
}

/**
 * An Odd one out round resized to [count] pictures. The theme and the odd
 * picture stay; one picture that belongs is added or taken away. If the theme
 * has no more pictures to add, a fresh round is made instead.
 */
export function resizeOdd(round: OddRound, count: number, rng: Rng, themes: readonly TogetherTheme[]): OddRound {
  const size = sharedSize(count);
  const theme = themes.find((t) => t.id === round.theme);
  const shared = round.pictures.filter((id) => id !== round.odd);
  if (shared.length === size) return round;
  if (shared.length > size) {
    const pictures = dropRandom(round.pictures, size + 1, (id) => id === round.odd, rng);
    return { ...round, pictures };
  }
  const unused = (theme?.pictures ?? []).filter((id) => !shared.includes(id));
  if (!theme || unused.length < size - shared.length) return createOddRound(count, rng, undefined, themes);
  const added = sample(unused, size - shared.length, rng);
  return { ...round, pictures: insertAtRandom(round.pictures, added, rng) };
}

/**
 * A Four together round resized to [count] pictures. The theme and the group
 * stay as they are, a group picture is added or removed when the group size
 * changes (three among four, otherwise four), and the other pictures, one per
 * other theme, are added or taken away to fit.
 */
export function resizeTogether(
  round: TogetherRound,
  count: number,
  rng: Rng,
  themes: readonly TogetherTheme[],
  found: readonly string[] = [],
): TogetherRound {
  const theme = themes.find((t) => t.id === round.theme);
  const wantGroup = groupSize(count);
  const wantOthers = Math.max(1, Math.min(count - wantGroup, themes.length - 1));
  let group = [...round.group];
  let fillers = round.pictures.filter((id) => !round.group.includes(id));

  // A picture already found is the last to go when the group gets smaller.
  if (group.length > wantGroup) group = dropRandom(group, wantGroup, (id) => found.includes(id), rng);
  else if (group.length < wantGroup) {
    const unused = (theme?.pictures ?? []).filter((id) => !group.includes(id));
    group = [...group, ...sample(unused, wantGroup - group.length, rng)];
  }

  if (fillers.length > wantOthers) fillers = dropRandom(fillers, wantOthers, () => false, rng);
  else if (fillers.length < wantOthers) {
    const used = new Set(themes.filter((t) => t.pictures.some((id) => fillers.includes(id))).map((t) => t.id));
    const open = themes.filter((t) => t.id !== round.theme && !used.has(t.id));
    const added = sample(open, wantOthers - fillers.length, rng).map((t) => sample(t.pictures, 1, rng)[0] as string);
    fillers = [...fillers, ...added];
  }

  // Keep the order of the pictures already on the board; new ones go in at random.
  const kept = round.pictures.filter((id) => group.includes(id) || fillers.includes(id));
  const news = [...group, ...fillers].filter((id) => !kept.includes(id));
  return { theme: round.theme, group, pictures: insertAtRandom(kept, shuffle(news, rng), rng) };
}

/** The state after a count change: what was found stays found where the picture is still in the group. */
export function resizeTogetherState(state: TogetherState, count: number, rng: Rng, themes: readonly TogetherTheme[]): TogetherState {
  const round = resizeTogether(state.round, count, rng, themes, state.found);
  const found = state.shown ? [...round.group] : state.found.filter((id) => round.group.includes(id));
  return { round, found, shown: state.shown };
}

/** The state after a count change: the odd picture, and whether it was found, stay. */
export function resizeOddState(state: OddState, count: number, rng: Rng, themes: readonly TogetherTheme[]): OddState {
  const round = resizeOdd(state.round, count, rng, themes);
  // A fresh round (the theme ran out of pictures) starts unfound; otherwise progress stays.
  return round.odd === state.round.odd ? { ...state, round } : { round, found: false, shown: false };
}
