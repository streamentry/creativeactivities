import { PATTERN_COLORS, type PatternColor } from '../../data/pattern-maker';

/**
 * Color wash (GAME-038). A soft brush paints across one page. There is no end
 * point: nothing here finishes, scores, counts, times, ranks or judges the page,
 * and no function reports that a page is "done". Every function returns a new
 * value.
 *
 * The page is kept as plain data (washes of points in fixed page units), so it
 * can be redrawn at any size and "Put it back" restores a fresh page exactly. A
 * wash keeps the color and brush size it was painted with, so changing either
 * only affects washes started afterwards. Pointer and keyboard input both use the
 * same functions here.
 */

/** Only the two wide brushes: a large brush is easier to steer with a tremor. */
export type BrushSize = 'wide' | 'veryWide';

export const BRUSH_SIZES: readonly BrushSize[] = ['wide', 'veryWide'];

/** The width of each brush, in the page's own units. */
export const BRUSH_WIDTH: Readonly<Record<BrushSize, number>> = { wide: 64, veryWide: 128 };

/** The page is 4 by 3 in these units. Washes are stored in them, so the same page draws at any size. */
export const PAGE_WIDTH = 800;
export const PAGE_HEIGHT = 600;

/** How far the brush ring moves with one press of an arrow key, in the same units. */
export const BRUSH_STEP = 16;

/** How strong one wash is. Overlapping washes build up, as watercolor does. */
export const WASH_OPACITY = 0.55;

export const DEFAULT_COLOR: PatternColor = 2;
export const DEFAULT_BRUSH: BrushSize = 'wide';

export interface Point {
  x: number;
  y: number;
}

/** One stroke of the brush, with its color and width fixed when it was started. A wash with one point is a dab. */
export interface Wash {
  color: PatternColor;
  width: number;
  points: readonly Point[];
}

export interface Brush extends Point {
  /** True while the brush is down: pointer drags or arrow keys add to the wash being painted. */
  down: boolean;
}

export interface WashPage {
  /** Every wash on the page, oldest first. */
  washes: readonly Wash[];
  /** The color the next wash will use. */
  color: PatternColor;
  /** The size the next wash will use. */
  size: BrushSize;
  /** Where the brush ring is. */
  brush: Brush;
  /** The washes that A fresh page cleared, so Put it back can bring them back; null when there is nothing to put back. */
  undo: readonly Wash[] | null;
}

export function newPage(): WashPage {
  return {
    washes: [],
    color: DEFAULT_COLOR,
    size: DEFAULT_BRUSH,
    brush: { x: PAGE_WIDTH / 2, y: PAGE_HEIGHT / 2, down: false },
    undo: null,
  };
}

const isFinitePoint = (p: Point): boolean => Number.isFinite(p.x) && Number.isFinite(p.y);

/** A point moved onto the page, so a pointer past the edge still lands on it. */
export function clampPoint(p: Point): Point {
  return {
    x: Math.min(PAGE_WIDTH, Math.max(0, p.x)),
    y: Math.min(PAGE_HEIGHT, Math.max(0, p.y)),
  };
}

/** Whether a number is one of the four wash colors. */
export const isColor = (color: number): color is PatternColor => PATTERN_COLORS.some((c) => c.index === color);

/** Whether a value is one of the two brush sizes. */
export const isBrushSize = (size: string): size is BrushSize => (BRUSH_SIZES as readonly string[]).includes(size);

/** The brush width in page units for a size. */
export const widthOf = (size: BrushSize): number => BRUSH_WIDTH[size];

/**
 * Choose the color for the next wash. The brush is lifted first, so a wash never
 * changes color partway. Choosing the color already set changes nothing.
 */
export function chooseColor(page: WashPage, color: PatternColor): { page: WashPage; changed: boolean } {
  if (!isColor(color) || page.color === color) return { page, changed: false };
  return { page: { ...liftBrush(page), color }, changed: true };
}

/** Choose the brush size for the next wash. The brush is lifted first, as for a color. */
export function chooseSize(page: WashPage, size: BrushSize): { page: WashPage; changed: boolean } {
  if (!isBrushSize(size) || page.size === size) return { page, changed: false };
  return { page: { ...liftBrush(page), size }, changed: true };
}

/**
 * Put the brush down at a point (or where it is, with no point) and start a wash
 * in the chosen color and size. Putting the brush down while it is already down
 * moves it and keeps painting the same wash.
 */
export function putBrushDown(page: WashPage, at?: Point): WashPage {
  if (page.brush.down) return moveBrushTo(page, at ?? page.brush);
  const start = at && isFinitePoint(at) ? clampPoint(at) : clampPoint(page.brush);
  const wash: Wash = { color: page.color, width: widthOf(page.size), points: [start] };
  return { ...page, washes: [...page.washes, wash], undo: null, brush: { ...start, down: true } };
}

/** Lift the brush. The wash stays as it was painted. */
export function liftBrush(page: WashPage): WashPage {
  if (!page.brush.down) return page;
  return { ...page, brush: { ...page.brush, down: false } };
}

/**
 * Move the brush to a point. While it is down, the point is added to the wash
 * being painted (the last one). A point the same as the last one adds nothing.
 */
export function moveBrushTo(page: WashPage, at: Point): WashPage {
  if (!isFinitePoint(at)) return page;
  const p = clampPoint(at);
  if (!page.brush.down) return { ...page, brush: { ...p, down: false } };
  const last = page.washes[page.washes.length - 1];
  if (!last) return { ...page, brush: { ...p, down: true } };
  const previous = last.points[last.points.length - 1];
  const same = previous !== undefined && previous.x === p.x && previous.y === p.y;
  const washes = same ? page.washes : [...page.washes.slice(0, -1), { ...last, points: [...last.points, p] }];
  return { ...page, washes, brush: { ...p, down: true } };
}

/** Move the brush ring one step in a direction (-1, 0, or 1 on each axis), kept on the page. */
export function stepBrush(page: WashPage, dx: -1 | 0 | 1, dy: -1 | 0 | 1): WashPage {
  return moveBrushTo(page, { x: page.brush.x + dx * BRUSH_STEP, y: page.brush.y + dy * BRUSH_STEP });
}

/** Brush down when it is up, brush up when it is down. Returns whether the brush is now down. */
export function toggleBrush(page: WashPage): { page: WashPage; down: boolean } {
  const next = page.brush.down ? liftBrush(page) : putBrushDown(page);
  return { page: next, down: next.brush.down };
}

/**
 * A fresh page: the washes are cleared and the brush is lifted. The color and size
 * stay as chosen. The washes are kept for one step, so Put it back can bring them
 * back. Clearing an empty page keeps whatever Put it back held before.
 */
export function freshPage(page: WashPage): WashPage {
  const base = liftBrush(page);
  return { ...base, washes: [], undo: base.washes.length > 0 ? base.washes : page.undo };
}

/** Put back the washes that A fresh page cleared. Nothing happens when there is nothing to put back. */
export function putBack(page: WashPage): { page: WashPage; restored: boolean } {
  if (page.undo === null) return { page, restored: false };
  return { page: { ...liftBrush(page), washes: page.undo, undo: null }, restored: true };
}

/** Whether Put it back has something to bring back. */
export const canPutBack = (page: WashPage): boolean => page.undo !== null;
