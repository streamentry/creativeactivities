import { BOARD_SIZES, DEFAULT_BOARD_SIZE, DEFAULT_COLORS, BUILD_COLORS, type BoardSize, type PatternColor, type Person } from '../../data/build-together';

/**
 * Build together (GAME-048). Two people fill one shared grid, taking turns to put
 * a piece in an empty place. It is cooperative: nobody wins, nobody loses, and
 * nothing here scores, counts, times or checks anyone. The only ending is the
 * grid being full, which is "built together". Every function returns a new value.
 *
 * Either person may pass. One step at a time can be taken back, whether it was a
 * piece or a pass, so an accidental tap is never a loss. Each grid size keeps its
 * own board, so choosing another size and coming back keeps the work.
 */

/** Who put the piece there, or nobody yet. */
export type Cell = Person | null;

/** One thing that happened on a board, kept only so it can be taken back. */
export type Step = { kind: 'place'; index: number; person: Person } | { kind: 'pass'; person: Person };

export interface Board {
  /** The places, row by row. */
  cells: readonly Cell[];
  /** Whose turn it is. */
  turn: Person;
  /** What has happened, oldest first; the last step is the one that can be taken back. */
  steps: readonly Step[];
}

export interface BuildGame {
  size: BoardSize;
  /** The color of the first and of the second person; always two different colors. */
  colors: readonly [PatternColor, PatternColor];
  boards: Readonly<Record<BoardSize, Board>>;
}

const blankBoard = (size: BoardSize): Board => ({ cells: new Array<Cell>(size * size).fill(null), turn: 0, steps: [] });

export function newGame(): BuildGame {
  return {
    size: DEFAULT_BOARD_SIZE,
    colors: DEFAULT_COLORS,
    boards: { 3: blankBoard(3), 4: blankBoard(4) },
  };
}

/** The board being built. */
export const boardOf = (game: BuildGame): Board => game.boards[game.size];

/** Whose turn it is. */
export const turnOf = (game: BuildGame): Person => boardOf(game).turn;

/** The other person. */
export const otherPerson = (person: Person): Person => (person === 0 ? 1 : 0);

/** The color a person has chosen. */
export const colorOf = (game: BuildGame, person: Person): PatternColor => game.colors[person];

function withBoard(game: BuildGame, board: Board): BuildGame {
  return { ...game, boards: { ...game.boards, [game.size]: board } };
}

/** Where a place is, counting from 1, as people say it ("row 2, column 3"). */
export function placeOf(size: BoardSize, index: number): { row: number; column: number } {
  return { row: Math.floor(index / size) + 1, column: (index % size) + 1 };
}

/** The grid is full: the picture is built together. */
export const isBuilt = (game: BuildGame): boolean => boardOf(game).cells.every((c) => c !== null);

/** Nothing has been placed on the board yet. */
export const isEmpty = (game: BuildGame): boolean => boardOf(game).cells.every((c) => c === null);

export function chooseSize(game: BuildGame, size: BoardSize): BuildGame {
  return BOARD_SIZES.includes(size) && size !== game.size ? { ...game, size } : game;
}

export type ColorChange = 'changed' | 'same' | 'taken' | 'outside';

/**
 * A person takes a color. The two people never hold the same color, so a color the
 * other person has is refused (the screen shows it as in use). Choosing the color a
 * person already has changes nothing. Pieces already placed take the new color.
 */
export function chooseColor(game: BuildGame, person: Person, color: PatternColor): { game: BuildGame; outcome: ColorChange } {
  if (!BUILD_COLORS.some((c) => c.index === color)) return { game, outcome: 'outside' };
  if (game.colors[person] === color) return { game, outcome: 'same' };
  if (game.colors[otherPerson(person)] === color) return { game, outcome: 'taken' };
  const colors: [PatternColor, PatternColor] = person === 0 ? [color, game.colors[1]] : [game.colors[0], color];
  return { game: { ...game, colors }, outcome: 'changed' };
}

export type Placing = 'placed' | 'built' | 'taken' | 'outside' | 'finished';

/** Whether the person whose turn it is can put a piece in this place: it must be in the grid and empty. */
export function canPlace(game: BuildGame, index: number): boolean {
  const { cells } = boardOf(game);
  return Number.isInteger(index) && index >= 0 && index < cells.length && cells[index] === null;
}

/**
 * The person whose turn it is puts a piece in an empty place, and the turn goes to
 * the other person. A place that already has a piece, or is outside the grid, changes
 * nothing. `built` says this piece filled the last place.
 */
export function place(game: BuildGame, index: number): { game: BuildGame; outcome: Placing } {
  const board = boardOf(game);
  if (!Number.isInteger(index) || index < 0 || index >= board.cells.length) return { game, outcome: 'outside' };
  if (isBuilt(game)) return { game, outcome: 'finished' };
  if (board.cells[index] !== null) return { game, outcome: 'taken' };
  const person = board.turn;
  const next: Board = {
    cells: board.cells.map((c, i) => (i === index ? person : c)),
    turn: otherPerson(person),
    steps: [...board.steps, { kind: 'place', index, person }],
  };
  const after = withBoard(game, next);
  return { game: after, outcome: isBuilt(after) ? 'built' : 'placed' };
}

/** Whether the person whose turn it is can pass: any time before the grid is full. */
export const canPass = (game: BuildGame): boolean => !isBuilt(game);

/** The person whose turn it is passes, and the turn goes to the other person. A full grid has no turns to pass. */
export function pass(game: BuildGame): BuildGame {
  if (!canPass(game)) return game;
  const board = boardOf(game);
  return withBoard(game, { ...board, turn: otherPerson(board.turn), steps: [...board.steps, { kind: 'pass', person: board.turn }] });
}

/** The step that Take back would undo, or null when there is none. */
export function lastStep(game: BuildGame): Step | null {
  const { steps } = boardOf(game);
  return steps.length > 0 ? (steps[steps.length - 1] as Step) : null;
}

export const canTakeBack = (game: BuildGame): boolean => lastStep(game) !== null;

/** Undo the last step: a piece comes off its place, or a pass is undone. The turn goes back to the person who took it. */
export function takeBack(game: BuildGame): { game: BuildGame; step: Step | null } {
  const step = lastStep(game);
  if (!step) return { game, step: null };
  const board = boardOf(game);
  const cells = step.kind === 'place' ? board.cells.map((c, i) => (i === step.index ? null : c)) : board.cells;
  return { game: withBoard(game, { cells, turn: step.person, steps: board.steps.slice(0, -1) }), step };
}

/** An empty grid of the same size, the first person to go. The colors stay as chosen. A grid that is already empty stays as it is. */
export function startAgain(game: BuildGame): BuildGame {
  const board = boardOf(game);
  return board.steps.length === 0 && board.turn === 0 && isEmpty(game) ? game : withBoard(game, blankBoard(game.size));
}
