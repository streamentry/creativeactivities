import { describe, expect, it } from 'vitest';
import { PATTERN_COLORS } from '../../data/pattern-maker';
import {
  DEFAULT_COLOR,
  BRUSH_STEP,
  BRUSH_WIDTH,
  PAGE_HEIGHT,
  PAGE_WIDTH,
  canPutBack,
  chooseColor,
  chooseSize,
  clampPoint,
  freshPage,
  liftBrush,
  moveBrushTo,
  newPage,
  putBack,
  putBrushDown,
  stepBrush,
  toggleBrush,
  type WashPage,
} from './color-wash';

/** Paint one wash from one point to another, with the brush down and then up. */
function dragWash(page: WashPage, from: { x: number; y: number }, to: { x: number; y: number }): WashPage {
  return liftBrush(moveBrushTo(putBrushDown(page, from), to));
}

describe('the page, colors and brushes', () => {
  it('starts with an empty page, the green wash (strong enough to see on a pale page), the wide brush and the brush up in the middle', () => {
    const page = newPage();
    expect(page.washes).toEqual([]);
    expect(page.color).toBe(2);
    expect(page.size).toBe('wide');
    expect(page.brush).toEqual({ x: PAGE_WIDTH / 2, y: PAGE_HEIGHT / 2, down: false });
    expect(canPutBack(page)).toBe(false);
  });

  it('offers only the wide and very wide brushes, and the very wide one is wider', () => {
    expect(Object.keys(BRUSH_WIDTH).sort()).toEqual(['veryWide', 'wide']);
    expect(BRUSH_WIDTH.veryWide).toBeGreaterThan(BRUSH_WIDTH.wide);
    expect(BRUSH_WIDTH.wide).toBeGreaterThanOrEqual(64);
  });

  it('uses the four palette colors only, with the same indexes as Pattern maker', () => {
    expect(PATTERN_COLORS).toHaveLength(4);
    for (const color of PATTERN_COLORS) {
      const { page, changed } = chooseColor(newPage(), color.index);
      expect(changed || color.index === DEFAULT_COLOR).toBe(true);
      expect(page.color).toBe(color.index);
    }
    expect(chooseColor(newPage(), 9 as never).changed).toBe(false);
  });

  it('changing the color or size changes nothing already painted and lifts the brush first', () => {
    const painting = putBrushDown(newPage(), { x: 100, y: 100 });
    const { page: recolored, changed } = chooseColor(painting, 3);
    expect(changed).toBe(true);
    expect(recolored.brush.down).toBe(false);
    expect(recolored.washes).toBe(painting.washes);

    const sized = chooseSize(painting, 'veryWide');
    expect(sized.changed).toBe(true);
    expect(sized.page.brush.down).toBe(false);
    expect(chooseSize(newPage(), 'wide').changed).toBe(false);
    expect(chooseSize(newPage(), 'huge' as never).changed).toBe(false);
  });
});

describe('painting', () => {
  it('a drag makes one wash in the chosen color and width, as data', () => {
    let page = chooseColor(chooseSize(newPage(), 'veryWide').page, 3).page;
    page = dragWash(page, { x: 10, y: 10 }, { x: 200, y: 50 });
    expect(page.washes).toHaveLength(1);
    expect(page.washes[0]).toEqual({
      color: 3,
      width: BRUSH_WIDTH.veryWide,
      points: [
        { x: 10, y: 10 },
        { x: 200, y: 50 },
      ],
    });
  });

  it('a wash keeps its own color after the color is changed', () => {
    let page = dragWash(newPage(), { x: 10, y: 10 }, { x: 20, y: 20 });
    page = chooseColor(page, 1).page;
    page = dragWash(page, { x: 300, y: 300 }, { x: 320, y: 320 });
    expect(page.washes.map((w) => w.color)).toEqual([2, 1]);
  });

  it('moving with the brush up adds no points, and a repeated point adds nothing', () => {
    let page = moveBrushTo(newPage(), { x: 50, y: 50 });
    expect(page.washes).toEqual([]);
    page = putBrushDown(page, { x: 50, y: 50 });
    page = moveBrushTo(page, { x: 50, y: 50 });
    expect(page.washes[0]?.points).toHaveLength(1);
  });

  it('a press without a move is a dab with one point', () => {
    const page = liftBrush(putBrushDown(newPage(), { x: 400, y: 300 }));
    expect(page.washes).toHaveLength(1);
    expect(page.washes[0]?.points).toEqual([{ x: 400, y: 300 }]);
  });

  it('clamps points to the page, so a pointer past the edge still lands on it', () => {
    expect(clampPoint({ x: -5, y: 900 })).toEqual({ x: 0, y: PAGE_HEIGHT });
    const page = dragWash(newPage(), { x: -40, y: 10 }, { x: PAGE_WIDTH + 40, y: 10 });
    expect(page.washes[0]?.points.every((p) => p.x >= 0 && p.x <= PAGE_WIDTH)).toBe(true);
  });

  it('ignores points that are not numbers', () => {
    const page = putBrushDown(newPage(), { x: 10, y: 10 });
    expect(moveBrushTo(page, { x: Number.NaN, y: 5 })).toBe(page);
    expect(putBrushDown(newPage(), { x: Number.POSITIVE_INFINITY, y: 0 }).washes[0]?.points[0]).toEqual({
      x: PAGE_WIDTH / 2,
      y: PAGE_HEIGHT / 2,
    });
  });
});

describe('the keyboard brush', () => {
  it('moves the ring one step at a time, and stays on the page', () => {
    let page = stepBrush(newPage(), 1, 0);
    expect(page.brush.x).toBe(PAGE_WIDTH / 2 + BRUSH_STEP);
    expect(page.brush.y).toBe(PAGE_HEIGHT / 2);
    for (let i = 0; i < 200; i++) page = stepBrush(page, 1, 1);
    expect(page.brush.x).toBe(PAGE_WIDTH);
    expect(page.brush.y).toBe(PAGE_HEIGHT);
    for (let i = 0; i < 200; i++) page = stepBrush(page, -1, -1);
    expect(page.brush.x).toBe(0);
    expect(page.brush.y).toBe(0);
  });

  it('paints while the brush is down and leaves nothing while it is up', () => {
    let page = toggleBrush(newPage()).page;
    expect(page.brush.down).toBe(true);
    page = stepBrush(page, 1, 0);
    page = stepBrush(page, 0, 1);
    expect(page.washes[0]?.points).toHaveLength(3);
    const up = toggleBrush(page);
    expect(up.down).toBe(false);
    const before = up.page.washes;
    const moved = stepBrush(up.page, 1, 1);
    expect(moved.washes).toBe(before);
  });

  it('toggles the brush down and up, and reports which', () => {
    const down = toggleBrush(newPage());
    expect(down.down).toBe(true);
    expect(toggleBrush(down.page).down).toBe(false);
  });
});

describe('a fresh page and putting it back', () => {
  it('clears the washes, lifts the brush, keeps the color and size, and leaves one step to put back', () => {
    let page = chooseSize(chooseColor(newPage(), 2).page, 'veryWide').page;
    page = dragWash(page, { x: 10, y: 10 }, { x: 90, y: 90 });
    const cleared = freshPage(putBrushDown(page, { x: 5, y: 5 }));
    expect(cleared.washes).toEqual([]);
    expect(cleared.brush.down).toBe(false);
    expect(cleared.color).toBe(2);
    expect(cleared.size).toBe('veryWide');
    expect(canPutBack(cleared)).toBe(true);
  });

  it('puts back exactly the washes that were cleared, once', () => {
    const page = dragWash(newPage(), { x: 10, y: 10 }, { x: 90, y: 90 });
    const restored = putBack(freshPage(page));
    expect(restored.restored).toBe(true);
    expect(restored.page.washes).toEqual(page.washes);
    expect(canPutBack(restored.page)).toBe(false);
    expect(putBack(restored.page).restored).toBe(false);
  });

  it('clearing an empty page keeps what Put it back held before', () => {
    const page = dragWash(newPage(), { x: 10, y: 10 }, { x: 90, y: 90 });
    const once = freshPage(page);
    const twice = freshPage(once);
    expect(canPutBack(twice)).toBe(true);
    expect(putBack(twice).page.washes).toEqual(page.washes);
  });

  it('nothing to put back on a new page', () => {
    expect(putBack(newPage()).restored).toBe(false);
  });
});
