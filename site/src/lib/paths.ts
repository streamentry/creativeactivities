/**
 * WEB-032: four-week paths. A path is four weeks of activities with a place to start and a way to skip a week.
 *
 * What the page remembers is only where a person chose to start and which weeks they set aside, kept on this
 * device. "Tried" counts are read from the tried list the activity pages already keep; nothing in this module
 * can change that list, so a path can never lower a count. Nothing here tells a person they are late, behind
 * or out of a run: a skipped week is a choice, and it is one tap to undo.
 */

/** The one localStorage key for every path's place. Clearing it clears them all. */
export const PATHS_STORAGE_KEY = 'ca-paths-v1';
export const WEEKS_PER_PATH = 4;

const PATH_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface PathProgress {
  /** The week (0 to 3) the person chose to start at. */
  readonly start: number;
  /** Weeks (0 to 3) set aside, in order, each once. */
  readonly skipped: readonly number[];
}

/** Where each path stands, by path id. A path with nothing chosen has no entry. */
export type PathsState = Readonly<Record<string, PathProgress>>;

export const FRESH: PathProgress = { start: 0, skipped: [] };

type ReadStorage = Pick<Storage, 'getItem'>;
type WriteStorage = Pick<Storage, 'setItem' | 'removeItem'>;

const isWeek = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < WEEKS_PER_PATH;

/** One path's place from stored data: a start in range and each skipped week once, in order. Anything else is fresh. */
function readProgress(value: unknown): PathProgress {
  if (typeof value !== 'object' || value === null) return FRESH;
  const { start, skipped } = value as { start?: unknown; skipped?: unknown };
  const weeks = Array.isArray(skipped) ? [...new Set(skipped.filter(isWeek))].sort((a, b) => a - b) : [];
  return { start: isWeek(start) ? start : 0, skipped: weeks };
}

const isFresh = (progress: PathProgress): boolean => progress.start === 0 && progress.skipped.length === 0;

/** The places stored for paths that exist. Anything malformed reads as nothing chosen. */
export function parsePaths(raw: string | null, known: ReadonlySet<string>): PathsState {
  if (!raw) return {};
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== 'object' || data === null || Array.isArray(data)) return {};
    const state: Record<string, PathProgress> = {};
    for (const [id, value] of Object.entries(data)) {
      if (!PATH_ID.test(id) || !known.has(id)) continue;
      const progress = readProgress(value);
      if (!isFresh(progress)) state[id] = progress;
    }
    return state;
  } catch {
    return {};
  }
}

/** Private windows and blocked site data throw on access; treat both as nothing chosen. */
export function loadPaths(storage: ReadStorage | undefined, known: ReadonlySet<string>): PathsState {
  try {
    return parsePaths(storage?.getItem(PATHS_STORAGE_KEY) ?? null, known);
  } catch {
    return {};
  }
}

/** Whether the places were kept; false means the browser refused. An empty state removes the key. */
export function savePaths(storage: WriteStorage | undefined, state: PathsState): boolean {
  if (!storage) return false;
  try {
    if (Object.keys(state).length === 0) storage.removeItem(PATHS_STORAGE_KEY);
    else storage.setItem(PATHS_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function progressOf(state: PathsState, id: string): PathProgress {
  return state[id] ?? FRESH;
}

/** What a person can do on a path. None of them reads or changes the tried list. */
export type PathAction =
  | { readonly type: 'start'; readonly path: string; readonly week: number }
  | { readonly type: 'skip'; readonly path: string; readonly week: number }
  | { readonly type: 'unskip'; readonly path: string; readonly week: number }
  | { readonly type: 'forget'; readonly path: string };

/** The new state for an action; the old state is left as it was. A week out of range changes nothing. */
export function applyAction(state: PathsState, action: PathAction): PathsState {
  const current = progressOf(state, action.path);
  let next: PathProgress;
  switch (action.type) {
    case 'start':
      if (!isWeek(action.week)) return state;
      // Starting somewhere means meaning to do that week, so it is no longer set aside.
      next = { start: action.week, skipped: current.skipped.filter((w) => w !== action.week) };
      break;
    case 'skip':
      if (!isWeek(action.week)) return state;
      next = { start: current.start, skipped: [...new Set([...current.skipped, action.week])].sort((a, b) => a - b) };
      break;
    case 'unskip':
      if (!isWeek(action.week)) return state;
      next = { start: current.start, skipped: current.skipped.filter((w) => w !== action.week) };
      break;
    case 'forget':
      next = FRESH;
      break;
  }
  const { [action.path]: _gone, ...rest } = state;
  return isFresh(next) ? rest : { ...rest, [action.path]: next };
}

/**
 * One action against this device. The places already kept are the base, so a second tab on another path is never
 * overwritten; but when the last save was refused the page's own places are the base, or each tap would start again
 * from nothing and the earlier ones would be lost. `kept` says whether this save was accepted.
 */
export function commitAction(
  storage: (ReadStorage & WriteStorage) | undefined,
  known: ReadonlySet<string>,
  onPage: PathsState,
  lastSaveKept: boolean,
  action: PathAction,
): { readonly state: PathsState; readonly kept: boolean } {
  const base = lastSaveKept ? loadPaths(storage, known) : onPage;
  const state = applyAction(base, action);
  return { state, kept: savePaths(storage, state) };
}

/** The first week from the start that is not set aside, or null when every week from there is. */
export function nextWeek(progress: PathProgress): number | null {
  for (let week = progress.start; week < WEEKS_PER_PATH; week += 1) {
    if (!progress.skipped.includes(week)) return week;
  }
  return null;
}

/** The shortest and the longest time a week's activities take: the least of the lows and the most of the highs, in minutes. */
export function weekMinutes(ranges: readonly (readonly [number, number])[]): readonly [number, number] {
  if (ranges.length === 0) return [0, 0];
  return [Math.min(...ranges.map(([low]) => low)), Math.max(...ranges.map(([, high]) => high))];
}

export interface TriedCounts {
  /** Distinct activities on the path that are on the tried list. */
  readonly tried: number;
  /** Distinct activities on the path. */
  readonly of: number;
  readonly byWeek: readonly { readonly tried: number; readonly of: number }[];
}

/** How many of a path's activities are on the tried list. The list is only read. */
export function triedCounts(weeks: readonly (readonly string[])[], tried: ReadonlySet<string>): TriedCounts {
  const all = new Set(weeks.flat());
  return {
    tried: [...all].filter((slug) => tried.has(slug)).length,
    of: all.size,
    byWeek: weeks.map((slugs) => ({ tried: slugs.filter((slug) => tried.has(slug)).length, of: slugs.length })),
  };
}

/**
 * Words that would make a path a streak, a schedule or a debt. No sentence on a path page may use them: tests scan
 * the paths' words, the sentences below and the source of the island and the pages for them.
 */
export const PRESSURE_WORDS =
  /\b(?:missed|miss(?:ing)? (?:a|the|your) (?:day|week)|behind|overdue|late|catch(?:ing)? up|streaks?|lapsed?|failed|failure|in a row|keep it up|don'?t break|on track|off track|deadline|hurry|hurry up|countdown)\b/i;

/** Every sentence the page says about a person's place. None of them counts days or says a person has fallen behind. */
export const PATH_TEXT = {
  heading: 'Your four weeks',
  howItWorks: 'Start at any week. Skip any week with one tap and bring it back when you like. There is no schedule to keep.',
  startHere: 'Start here',
  yourStart: 'Your start',
  skip: 'Skip this week',
  bringBack: 'Bring this week back',
  skipped: 'Skipped. Nothing is lost: bring it back whenever you like.',
  triedMark: 'Tried',
  nothingWaiting: 'Nothing is waiting from your start. Pick any week to try.',
  print: 'Print this path',
  whatWeDid: 'What we did:',
  theEnd: 'That is the end of this path. Stopping here is fine, and you can start again from any week.',
  eachTakes: (range: string): string => `Each takes ${range}.`,
  takes: (range: string): string => `Takes ${range}.`,
  forget: 'Forget my place on this path',
  forgotten: 'Done. This page no longer remembers where you started or what you skipped.',
  notKept: 'This browser did not allow saving, so your place is kept only until you leave this page.',
  triedFrom: 'Counts come from the activities you marked as tried on this device.',
  nextPill: 'Next',
  startSet: (week: number): string => `Your start is now week ${week}.`,
  startSetBack: (week: number): string => `Your start is now week ${week}, and it is back in your plan.`,
  alreadyStart: (week: number): string => `Week ${week} is already your start.`,
  nothingToForget: 'This page has no place saved for this path.',
  weekSkipped: (week: number): string => `Week ${week} skipped. You can bring it back at any time.`,
  weekBack: (week: number): string => `Week ${week} is back.`,
  next: (week: number, title: string): string => `Next: week ${week}, ${title}.`,
  goTo: (week: number): string => `Go to week ${week}`,
  triedOf: (tried: number, of: number): string => `${tried} of ${of} tried`,
  weekHeading: (week: number, title: string): string => `Week ${week}: ${title}`,
} as const;
