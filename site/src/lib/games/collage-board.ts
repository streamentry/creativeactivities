import { PLACES, TRAY_SETS, type Person } from '../../data/collage-board';

/**
 * Collage board (GAME-033). Two people take turns: one taps a cut-out in the tray, then taps an empty place, and
 * the cut-out is placed there and the turn passes. A cut-out can be used any number of times. Either person may
 * pass. One step (a piece or a pass) can be taken back, and "Put it back" undoes a start again. A full board is
 * not a goal: nothing here scores, counts, times or ends the game. Every function returns a new value.
 */

/** A cut-out on a place, and whose turn put it there. */
export interface Placed {
  picture: string;
  person: Person;
}

/** What happened on the board, kept only so it can be taken back. */
export type Step = { kind: 'place'; place: number; person: Person } | { kind: 'pass'; person: Person };

/** The board itself: the places, whose turn it is, and the steps that led here, oldest first. */
export interface Board {
  cells: readonly (Placed | null)[];
  turn: Person;
  steps: readonly Step[];
}

export interface CollageGame extends Board {
  /** Which tray set is showing, an index into `TRAY_SETS`. */
  set: number;
  /** The picture id of the cut-out chosen in the tray, or null. */
  chosen: string | null;
  /** The board before the last "Start again", so "Put it back" can restore it; null when there is nothing to put back. */
  before: Board | null;
}

const emptyBoard = (): Board => ({ cells: new Array<Placed | null>(PLACES).fill(null), turn: 0, steps: [] });

export function newGame(): CollageGame {
  return { ...emptyBoard(), set: 0, chosen: null, before: null };
}

/** The cut-outs in the tray now. */
export const trayOf = (game: CollageGame): readonly string[] => TRAY_SETS[game.set] ?? [];

/** Whose turn it is. */
export const turnOf = (game: CollageGame): Person => game.turn;

/** The other person. */
export const otherPerson = (person: Person): Person => (person === 0 ? 1 : 0);

/** Every place has a cut-out. */
export const isFull = (game: CollageGame): boolean => game.cells.every((c) => c !== null);

/** The step that Take back would undo, or null when there is none. */
export function lastStep(game: CollageGame): Step | null {
  return game.steps.length > 0 ? (game.steps[game.steps.length - 1] as Step) : null;
}

export type Choice = 'chosen' | 'unchosen' | 'outside';

/** Choose a cut-out in the tray. Tapping the chosen one again puts the choice down. A picture not in the tray is refused. */
export function chooseCutout(game: CollageGame, picture: string): { game: CollageGame; outcome: Choice } {
  if (!trayOf(game).includes(picture)) return { game, outcome: 'outside' };
  if (game.chosen === picture) return { game: { ...game, chosen: null }, outcome: 'unchosen' };
  return { game: { ...game, chosen: picture }, outcome: 'chosen' };
}

export type Placing = 'placed' | 'needCutout' | 'filled' | 'outside';

/**
 * The person whose turn it is puts the chosen cut-out in an empty place, and the turn goes to the other person.
 * A place that already has a cut-out changes nothing, and so does a tap with no cut-out chosen.
 */
export function placeAt(game: CollageGame, index: number): { game: CollageGame; outcome: Placing } {
  if (!Number.isInteger(index) || index < 0 || index >= PLACES) return { game, outcome: 'outside' };
  if (game.cells[index] !== null) return { game, outcome: 'filled' };
  if (game.chosen === null) return { game, outcome: 'needCutout' };
  const person = game.turn;
  const picture = game.chosen;
  const cells = game.cells.map((c, i) => (i === index ? { picture, person } : c));
  const steps = [...game.steps, { kind: 'place' as const, place: index, person }];
  return { game: { ...game, cells, turn: otherPerson(person), steps, chosen: null, before: null }, outcome: 'placed' };
}

/** The person whose turn it is passes, and the turn goes to the other person. Passing is always allowed. */
export function pass(game: CollageGame): CollageGame {
  const person = game.turn;
  return { ...game, turn: otherPerson(person), steps: [...game.steps, { kind: 'pass', person }], chosen: null, before: null };
}

/** Undo the last step: a cut-out comes off its place, or a pass is undone. The turn goes back to the person who took it. */
export function takeBack(game: CollageGame): { game: CollageGame; step: Step | null } {
  const step = lastStep(game);
  if (!step) return { game, step: null };
  const cells = step.kind === 'place' ? game.cells.map((c, i) => (i === step.place ? null : c)) : game.cells;
  return { game: { ...game, cells, turn: step.person, steps: game.steps.slice(0, -1), before: null }, step };
}

/** An empty board, the first person to go. The tray set stays as it is. An empty board is left as it is. */
export function startAgain(game: CollageGame): CollageGame {
  if (game.steps.length === 0 && game.turn === 0 && game.cells.every((c) => c === null)) return game;
  const { cells, turn, steps } = game;
  return { ...game, ...emptyBoard(), chosen: null, before: { cells, turn, steps } };
}

/** Put back the board that the last Start again cleared. Nothing to put back leaves the game as it is. */
export function putBack(game: CollageGame): CollageGame {
  const { before } = game;
  if (!before) return game;
  return { ...game, cells: before.cells, turn: before.turn, steps: before.steps, before: null };
}

/** The other tray set. The board stays as it is, so pieces already placed keep their pictures. */
export function nextSet(game: CollageGame): CollageGame {
  return { ...game, set: (game.set + 1) % TRAY_SETS.length, chosen: null };
}
