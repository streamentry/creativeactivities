/**
 * Quiet shapes puzzle (GAME-060). A picture outline is built from a few simple pieces (triangles, a square,
 * a parallelogram, a rectangle). Each piece is one shape type, and the outline is divided into spaces, one per
 * piece, each with a fixed place and turn. Tap a piece, then tap a space of the same shape type: the piece
 * snaps in and the space decides how it is turned, so nobody has to drag or rotate anything.
 *
 * Nothing here scores, times, counts moves or judges a wrong try. A piece of another shape is simply refused.
 * Every function returns a new value; the component keeps the latest one. Words (names, labels, messages) are
 * text and live in `ui.quietShapes` in `src/i18n/play/en.json`.
 */

/** The shape types a piece and a space can have. A piece fits only a space of its own type. */
export const SHAPE_TYPES = ['large-triangle', 'small-triangle', 'square', 'parallelogram', 'rectangle'] as const;
export type ShapeType = (typeof SHAPE_TYPES)[number];

/** How far a space is turned, clockwise on screen. */
export type Turn = 0 | 90 | 180 | 270;
export const TURNS: readonly Turn[] = [0, 90, 180, 270];

/** A point: in cells when it describes a shape, in viewBox units when it describes a picture. */
export type Pt = readonly [number, number];

/** One cell of the board, in viewBox units. Every shape is a whole number of cells, so the pieces line up exactly. */
export const CELL = 20;

/** Space around the picture inside its viewBox, for the outline stroke and a focus ring. */
export const PAD = 12;

/** Printed size of one viewBox unit (mm). The outline and the pieces on the print sheet both use it, so they match. */
export const PRINT_MM_PER_UNIT = 0.6;

/** Each shape's outline in cells, turned about its own top-left corner, before any turn. */
const SHAPES: Record<ShapeType, { w: number; h: number; points: readonly Pt[] }> = {
  'large-triangle': { w: 2, h: 2, points: [[0, 0], [2, 0], [0, 2]] },
  'small-triangle': { w: 1, h: 1, points: [[0, 0], [1, 0], [0, 1]] },
  square: { w: 1, h: 1, points: [[0, 0], [1, 0], [1, 1], [0, 1]] },
  parallelogram: { w: 2, h: 1, points: [[0, 0], [1, 0], [2, 1], [1, 1]] },
  rectangle: { w: 2, h: 1, points: [[0, 0], [2, 0], [2, 1], [0, 1]] },
};

/** The width and height of a shape once turned: a quarter turn swaps them. */
export function shapeSize(type: ShapeType, turn: Turn): { w: number; h: number } {
  const { w, h } = SHAPES[type];
  return turn === 90 || turn === 270 ? { w: h, h: w } : { w, h };
}

/** The corners of a shape turned clockwise, in cells, with its top-left corner back at 0, 0. */
export function turnedPoints(type: ShapeType, turn: Turn): Pt[] {
  const { w, h, points } = SHAPES[type];
  return points.map(([x, y]): Pt => {
    if (turn === 90) return [h - y, x];
    if (turn === 180) return [w - x, h - y];
    if (turn === 270) return [y, w - x];
    return [x, y];
  });
}

/** One space of a picture: its shape, how it is turned, and the cell of its top-left corner on the board. */
export interface Space {
  type: ShapeType;
  turn: Turn;
  col: number;
  row: number;
}

/** A picture. Piece `i` is the piece for space `i`, and it has the same shape type as that space. */
export interface Puzzle {
  /** The name of the picture, used as the key for its name in `ui.quietShapes.pictures`. */
  id: 'house' | 'boat' | 'tree' | 'fish' | 'cat' | 'rocket';
  spaces: readonly Space[];
}

const s = (type: ShapeType, turn: Turn, col: number, row: number): Space => ({ type, turn, col, row });

/** Six pictures. Each is made of 4 to 6 spaces that fit together exactly, with no gaps and no overlaps. */
export const PUZZLES: readonly Puzzle[] = [
  {
    id: 'house',
    spaces: [
      s('large-triangle', 180, 3, 1),
      s('large-triangle', 270, 5, 1),
      s('rectangle', 0, 3, 3),
      s('rectangle', 0, 5, 3),
      s('rectangle', 0, 3, 4),
      s('rectangle', 0, 5, 4),
    ],
  },
  {
    id: 'boat',
    spaces: [
      s('rectangle', 0, 1, 5),
      s('rectangle', 0, 3, 5),
      s('large-triangle', 270, 1, 3),
      s('large-triangle', 180, 3, 3),
      s('small-triangle', 0, 1, 2),
    ],
  },
  {
    id: 'tree',
    spaces: [
      s('large-triangle', 180, 3, 1),
      s('large-triangle', 270, 5, 1),
      s('rectangle', 0, 4, 3),
      s('rectangle', 0, 4, 4),
    ],
  },
  {
    id: 'fish',
    spaces: [
      s('rectangle', 0, 1, 2),
      s('rectangle', 0, 3, 2),
      s('rectangle', 0, 1, 3),
      s('rectangle', 0, 3, 3),
      s('large-triangle', 270, 5, 2),
      s('small-triangle', 270, 2, 1),
    ],
  },
  {
    id: 'cat',
    spaces: [
      s('rectangle', 0, 2, 3),
      s('small-triangle', 270, 2, 2),
      s('small-triangle', 180, 3, 2),
      s('rectangle', 0, 2, 4),
      s('square', 0, 4, 4),
    ],
  },
  {
    id: 'rocket',
    spaces: [
      s('rectangle', 90, 3, 2),
      s('small-triangle', 180, 3, 1),
      s('small-triangle', 270, 2, 3),
      s('small-triangle', 180, 4, 3),
    ],
  },
];

/** The corners of a space in viewBox units. */
export function spacePoints(space: Space): Pt[] {
  return turnedPoints(space.type, space.turn).map(([x, y]): Pt => [(space.col + x) * CELL, (space.row + y) * CELL]);
}

/** The box a space sits in, in viewBox units: its top-left corner and its width and height. */
export function spaceBox(space: Space): { x: number; y: number; w: number; h: number } {
  const { w, h } = shapeSize(space.type, space.turn);
  return { x: space.col * CELL, y: space.row * CELL, w: w * CELL, h: h * CELL };
}

/** The corners of a space inside its own box, in viewBox units from the box's top-left (for drawing the focus ring). */
export function localPoints(space: Space): Pt[] {
  return turnedPoints(space.type, space.turn).map(([x, y]): Pt => [x * CELL, y * CELL]);
}

/** The picture's viewBox: the outline plus a little room all round. */
export function viewBoxOf(puzzle: Puzzle): { x: number; y: number; w: number; h: number } {
  const points = puzzle.spaces.flatMap(spacePoints);
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const x = Math.min(...xs) - PAD;
  const y = Math.min(...ys) - PAD;
  return { x, y, w: Math.max(...xs) + PAD - x, h: Math.max(...ys) + PAD - y };
}

/**
 * The CSS `clip-path` of a space's button, as percentages of its box, so a click lands only inside the shape.
 * games.css holds one class per shape and turn; the test checks that those classes match this function.
 */
export function clipPath(type: ShapeType, turn: Turn): string {
  const { w, h } = shapeSize(type, turn);
  const corners = turnedPoints(type, turn).map(([x, y]) => `${(x / w) * 100}% ${(y / h) * 100}%`);
  return `polygon(${corners.join(', ')})`;
}

/** The CSS class of a space's button, which carries its clip-path. */
export const clipClass = (type: ShapeType, turn: Turn): string => `qs-clip-${type}-${turn}`;

const EPS = 1e-9;

function extent(poly: readonly Pt[], nx: number, ny: number): { min: number; max: number } {
  const dots = poly.map(([x, y]) => x * nx + y * ny);
  return { min: Math.min(...dots), max: Math.max(...dots) };
}

/** Whether two convex polygons overlap by more than an edge (separating axis test). Touching edges do not count. */
export function polygonsOverlap(a: readonly Pt[], b: readonly Pt[]): boolean {
  for (const poly of [a, b]) {
    for (let i = 0; i < poly.length; i++) {
      const [x1, y1] = poly[i] as Pt;
      const [x2, y2] = poly[(i + 1) % poly.length] as Pt;
      const nx = -(y2 - y1);
      const ny = x2 - x1;
      const pa = extent(a, nx, ny);
      const pb = extent(b, nx, ny);
      if (pa.max <= pb.min + EPS || pb.max <= pa.min + EPS) return false;
    }
  }
  return true;
}

/** The state of one picture being made: which piece is in which space, and which piece is chosen. */
export interface QuietGame {
  /** Index into `PUZZLES`. */
  puzzle: number;
  /** For each space, the piece placed in it (a piece index), or null. */
  placed: readonly (number | null)[];
  /** The piece chosen in the tray, or null. */
  chosen: number | null;
  /** Whether the hint lines (the space borders) are drawn inside the outline. */
  hints: boolean;
  /** The placed spaces from before Start again, so one step of Put it back can restore them. */
  before: readonly (number | null)[] | null;
}

/** What a tap did, for the calm message. `same` and `outside` change nothing. */
export type Outcome =
  | 'chosen'
  | 'unchosen'
  | 'placed'
  | 'complete'
  | 'different'
  | 'needPiece'
  | 'filled'
  | 'tookBack'
  | 'cleared'
  | 'restored'
  | 'next'
  | 'same'
  | 'outside';

export interface Result {
  game: QuietGame;
  outcome: Outcome;
}

export function newGame(puzzle = 0): QuietGame {
  const spaces = PUZZLES[puzzle]?.spaces ?? [];
  return { puzzle, placed: spaces.map(() => null), chosen: null, hints: true, before: null };
}

export const puzzleOf = (game: QuietGame): Puzzle => PUZZLES[game.puzzle] as Puzzle;

/** The pieces not yet placed in the outline, in order. */
export function tray(game: QuietGame): number[] {
  const inOutline = new Set(game.placed.filter((p): p is number => p !== null));
  return puzzleOf(game)
    .spaces.map((_, i) => i)
    .filter((i) => !inOutline.has(i));
}

/** Whether every space has its piece. */
export const isComplete = (game: QuietGame): boolean => game.placed.every((p) => p !== null);

const isPiece = (game: QuietGame, piece: number): boolean => Number.isInteger(piece) && piece >= 0 && piece < puzzleOf(game).spaces.length;
const isSpace = (game: QuietGame, space: number): boolean => Number.isInteger(space) && space >= 0 && space < game.placed.length;

/** Tap a piece in the tray: choose it, or un-choose it if it was chosen. A piece in the outline is not in the tray. */
export function choosePiece(game: QuietGame, piece: number): Result {
  if (!isPiece(game, piece) || game.placed.includes(piece)) return { game, outcome: 'outside' };
  if (game.chosen === piece) return { game: { ...game, chosen: null }, outcome: 'unchosen' };
  return { game: { ...game, chosen: piece }, outcome: 'chosen' };
}

/**
 * Tap a space in the outline. An empty space takes the chosen piece if the shape types match; otherwise nothing
 * is placed. A space with a piece gives its piece back to the tray when no piece is chosen.
 */
export function tapSpace(game: QuietGame, space: number): Result {
  if (!isSpace(game, space)) return { game, outcome: 'outside' };
  const current = game.placed[space];
  if (current !== null && game.chosen === null) {
    const placed = game.placed.map((p, i) => (i === space ? null : p));
    return { game: { ...game, placed, before: null }, outcome: 'tookBack' };
  }
  if (current !== null) return { game, outcome: 'filled' };
  if (game.chosen === null) return { game, outcome: 'needPiece' };
  const spaces = puzzleOf(game).spaces;
  if ((spaces[game.chosen] as Space).type !== (spaces[space] as Space).type) return { game, outcome: 'different' };
  const chosen = game.chosen;
  const placed = game.placed.map((p, i) => (i === space ? chosen : p));
  const next: QuietGame = { ...game, placed, chosen: null, before: null };
  return { game: next, outcome: isComplete(next) ? 'complete' : 'placed' };
}

/** Start again: every piece goes back to the tray. One step of Put it back remembers the outline as it was. */
export function startAgain(game: QuietGame): Result {
  if (game.placed.every((p) => p === null) && game.chosen === null) return { game, outcome: 'same' };
  return { game: { ...game, placed: game.placed.map(() => null), chosen: null, before: game.placed }, outcome: 'cleared' };
}

/** Put it back: the outline returns to how it was before Start again. Only one step is kept. */
export function putBack(game: QuietGame): Result {
  if (game.before === null) return { game, outcome: 'same' };
  return { game: { ...game, placed: game.before, chosen: null, before: null }, outcome: 'restored' };
}

/** Another shape: the next picture, empty, with the same hint setting. */
export function nextPuzzle(game: QuietGame): Result {
  return { game: { ...newGame((game.puzzle + 1) % PUZZLES.length), hints: game.hints }, outcome: 'next' };
}

/** Show or hide the hint lines. Nothing else changes. */
export function setHints(game: QuietGame, hints: boolean): QuietGame {
  return game.hints === hints ? game : { ...game, hints };
}
