import { PATTERN_COLORS, type PatternColor } from '../../data/pattern-maker';

/**
 * Drawing duet (GAME-032). Two people share one canvas and take turns to draw
 * freehand lines, each with a color of their own. Nothing here scores, counts
 * turns, times, ranks or judges a drawing: the picture is whatever the two people
 * make, and there is no right one. Every function returns a new value.
 *
 * The picture is kept as plain data (strokes of points in fixed canvas units), so
 * it can be redrawn at any size and "Take back" can remove a line exactly. The
 * pen is either up (moving without drawing) or down (drawing). Pointer, keyboard
 * and switch input all use the same functions here.
 */

/** The first or the second person, by place in `ui.drawingDuet.people`. */
export type Person = 0 | 1;

export const PEOPLE: readonly Person[] = [0, 1];

/** The other person. */
export const otherPerson = (person: Person): Person => (person === 0 ? 1 : 0);

/** The drawing is 4 by 3 in these units. Strokes are stored in them, so the same picture draws at any size. */
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

/** The width of every line, in the same units. */
export const LINE_WIDTH = 10;

/** How far the pen dot moves with one press of an arrow key, in the same units. */
export const PEN_STEP = 12;

export interface Point {
  x: number;
  y: number;
}

/** One line drawn by one person in one color. A line with one point is a dot. */
export interface Stroke {
  person: Person;
  color: PatternColor;
  width: number;
  points: readonly Point[];
}

export interface Pen extends Point {
  /** True while the pen is drawing: pointer moves or arrow keys add to the current line. */
  down: boolean;
}

export interface DuetGame {
  /** Every line on the sheet, oldest first. */
  strokes: readonly Stroke[];
  /** Whose turn it is. */
  turn: Person;
  /** The color of the first and of the second person. */
  colors: readonly [PatternColor, PatternColor];
  /** Where the pen dot is. */
  pen: Pen;
  /** The lines that Start again cleared, so Put it back can bring them back; null when there is nothing to put back. */
  undo: readonly Stroke[] | null;
}

/** The first person's color is orange and the second person's purple: far apart in lightness and hue. */
export const DEFAULT_COLORS: readonly [PatternColor, PatternColor] = [1, 3];

export function newGame(): DuetGame {
  return {
    strokes: [],
    turn: 0,
    colors: DEFAULT_COLORS,
    pen: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, down: false },
    undo: null,
  };
}

const isFinitePoint = (p: Point): boolean => Number.isFinite(p.x) && Number.isFinite(p.y);

/** A point moved inside the drawing, so a pointer outside the canvas still lands on its edge. */
export function clampPoint(p: Point): Point {
  return {
    x: Math.min(CANVAS_WIDTH, Math.max(0, p.x)),
    y: Math.min(CANVAS_HEIGHT, Math.max(0, p.y)),
  };
}

/** The color a person has chosen. */
export const colorOf = (game: DuetGame, person: Person): PatternColor => game.colors[person];

/** How many lines are on the sheet. */
export const lineCount = (game: DuetGame): number => game.strokes.length;

/** Whether a number is one of the four colors. */
export const isColor = (color: number): color is PatternColor => PATTERN_COLORS.some((c) => c.index === color);

/**
 * A person takes one of the four colors. Choosing the color a person already has
 * changes nothing. Lines already drawn keep the color they were drawn in.
 */
export function chooseColor(game: DuetGame, person: Person, color: PatternColor): { game: DuetGame; changed: boolean } {
  if (!isColor(color) || game.colors[person] === color) return { game, changed: false };
  const colors: [PatternColor, PatternColor] = person === 0 ? [color, game.colors[1]] : [game.colors[0], color];
  return { game: { ...game, colors }, changed: true };
}

/**
 * Put the pen down at a point (or where it is, with no point) and start a line in
 * the color of the person whose turn it is. Putting the pen down while it is
 * already down moves it and keeps drawing the same line.
 */
export function penDown(game: DuetGame, at?: Point): DuetGame {
  if (game.pen.down) return moveTo(game, at ?? game.pen);
  const start = at && isFinitePoint(at) ? clampPoint(at) : clampPoint(game.pen);
  const stroke: Stroke = { person: game.turn, color: game.colors[game.turn], width: LINE_WIDTH, points: [start] };
  return { ...game, strokes: [...game.strokes, stroke], undo: null, pen: { ...start, down: true } };
}

/** Lift the pen. The line stays as it was drawn. */
export function penUp(game: DuetGame): DuetGame {
  if (!game.pen.down) return game;
  return { ...game, pen: { ...game.pen, down: false } };
}

/**
 * Move the pen to a point. While it is down, the point is added to the line being
 * drawn (the last line). A point the same as the last one adds nothing.
 */
export function moveTo(game: DuetGame, at: Point): DuetGame {
  if (!isFinitePoint(at)) return game;
  const p = clampPoint(at);
  if (!game.pen.down) return { ...game, pen: { ...p, down: false } };
  const last = game.strokes[game.strokes.length - 1];
  if (!last) return { ...game, pen: { ...p, down: true } };
  const previous = last.points[last.points.length - 1];
  const same = previous !== undefined && previous.x === p.x && previous.y === p.y;
  const strokes = same ? game.strokes : [...game.strokes.slice(0, -1), { ...last, points: [...last.points, p] }];
  return { ...game, strokes, pen: { ...p, down: true } };
}

/** Move the pen dot one step in a direction (-1, 0, or 1 on each axis), clamped to the drawing. */
export function movePen(game: DuetGame, dx: -1 | 0 | 1, dy: -1 | 0 | 1): DuetGame {
  return moveTo(game, { x: game.pen.x + dx * PEN_STEP, y: game.pen.y + dy * PEN_STEP });
}

/** Pen down when it is up, pen up when it is down. Returns whether the pen is now down. */
export function togglePen(game: DuetGame): { game: DuetGame; down: boolean } {
  const next = game.pen.down ? penUp(game) : penDown(game);
  return { game: next, down: next.pen.down };
}

/** The person whose turn it is passes the pen, and the other person has the turn. Either person may pass at any time. Any line being drawn is finished first. */
export function passPen(game: DuetGame): DuetGame {
  return { ...penUp(game), turn: otherPerson(game.turn) };
}

/** Whether a person has any line on the sheet to take back. */
export const hasLineBy = (game: DuetGame, person: Person): boolean => game.strokes.some((s) => s.person === person);

/**
 * Take back the last line of the person whose turn it is. Another person's lines
 * are not touched, and the turn does not move. Returns the line taken back, or
 * null when this person has none.
 */
export function takeBackLine(game: DuetGame): { game: DuetGame; removed: Stroke | null } {
  const base = penUp(game);
  let index = -1;
  for (let i = base.strokes.length - 1; i >= 0; i--) {
    if (base.strokes[i]?.person === base.turn) {
      index = i;
      break;
    }
  }
  if (index === -1) return { game: base, removed: null };
  const removed = base.strokes[index] as Stroke;
  const strokes = base.strokes.filter((_, i) => i !== index);
  return { game: { ...base, strokes, undo: null }, removed };
}

/**
 * Start again: the sheet is cleared and the first person has the turn. The lines
 * are kept for one step, so Put it back can bring them back. Clearing an empty
 * sheet keeps whatever Put it back held before.
 */
export function clearSheet(game: DuetGame): DuetGame {
  const base = penUp(game);
  return { ...base, strokes: [], turn: 0, undo: base.strokes.length > 0 ? base.strokes : game.undo };
}

/** Put back the lines that Start again cleared. Nothing happens when there is nothing to put back. */
export function putBack(game: DuetGame): { game: DuetGame; restored: boolean } {
  if (game.undo === null) return { game, restored: false };
  return { game: { ...penUp(game), strokes: game.undo, undo: null }, restored: true };
}

/** Whether Put it back has something to bring back. */
export const canPutBack = (game: DuetGame): boolean => game.undo !== null;
