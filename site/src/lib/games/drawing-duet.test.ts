import { describe, expect, it } from 'vitest';
import { PATTERN_COLORS } from '../../data/pattern-maker';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DEFAULT_COLORS,
  LINE_WIDTH,
  PEN_STEP,
  PEOPLE,
  canPutBack,
  chooseColor,
  clampPoint,
  clearSheet,
  colorOf,
  hasLineBy,
  isColor,
  lineCount,
  moveTo,
  movePen,
  newGame,
  otherPerson,
  passPen,
  penDown,
  penUp,
  putBack,
  takeBackLine,
  togglePen,
  type DuetGame,
} from './drawing-duet';

/** Draw one line of two points as the given person, by passing the pen to them first. */
function lineBy(game: DuetGame, person: 0 | 1, from: { x: number; y: number }, to: { x: number; y: number }): DuetGame {
  let g = game;
  while (g.turn !== person) g = passPen(g);
  g = penDown(g, from);
  g = moveTo(g, to);
  return penUp(g);
}

describe('the people and colors', () => {
  it('has two people, and the other person is always the one who is not taking the turn', () => {
    expect(PEOPLE).toEqual([0, 1]);
    expect(otherPerson(0)).toBe(1);
    expect(otherPerson(1)).toBe(0);
  });

  it('starts with two different colors from the palette shared with Pattern maker', () => {
    const g = newGame();
    expect(g.colors).toEqual(DEFAULT_COLORS);
    expect(DEFAULT_COLORS[0]).not.toBe(DEFAULT_COLORS[1]);
    for (const c of DEFAULT_COLORS) expect(PATTERN_COLORS.some((p) => p.index === c)).toBe(true);
    expect(colorOf(g, 0)).toBe(DEFAULT_COLORS[0]);
    expect(colorOf(g, 1)).toBe(DEFAULT_COLORS[1]);
  });

  it('accepts only the four palette colors', () => {
    expect(isColor(0)).toBe(true);
    expect(isColor(3)).toBe(true);
    expect(isColor(4)).toBe(false);
    expect(isColor(-1)).toBe(false);
    expect(isColor(1.5)).toBe(false);
  });

  it('lets a person choose a color, and reports whether anything changed', () => {
    const { game, changed } = chooseColor(newGame(), 0, 2);
    expect(changed).toBe(true);
    expect(game.colors).toEqual([2, 3]);
  });

  it('changes nothing when a person chooses the color they already have, or one outside the palette', () => {
    const g = newGame();
    expect(chooseColor(g, 0, 1)).toEqual({ game: g, changed: false });
    expect(chooseColor(g, 0, 9 as never)).toEqual({ game: g, changed: false });
  });

  it('lets the two people share a color, since nothing here stops it', () => {
    const { game, changed } = chooseColor(newGame(), 1, 1);
    expect(changed).toBe(true);
    expect(game.colors).toEqual([1, 1]);
  });

  it('keeps the color of lines already drawn when a person changes color later', () => {
    let g = lineBy(newGame(), 0, { x: 10, y: 10 }, { x: 20, y: 20 });
    g = chooseColor(g, 0, 0).game;
    expect(g.strokes[0]?.color).toBe(1);
  });
});

describe('drawing a line', () => {
  it('starts a line in the color of the person whose turn it is, with the line width', () => {
    const g = penDown(newGame(), { x: 100, y: 100 });
    expect(g.strokes).toHaveLength(1);
    expect(g.strokes[0]).toEqual({ person: 0, color: DEFAULT_COLORS[0], width: LINE_WIDTH, points: [{ x: 100, y: 100 }] });
    expect(g.pen.down).toBe(true);
  });

  it('adds points to the line while the pen is down, and nothing while it is up', () => {
    let g = penDown(newGame(), { x: 10, y: 10 });
    g = moveTo(g, { x: 20, y: 30 });
    expect(g.strokes[0]?.points).toEqual([
      { x: 10, y: 10 },
      { x: 20, y: 30 },
    ]);
    g = penUp(g);
    g = moveTo(g, { x: 50, y: 50 });
    expect(g.strokes[0]?.points).toHaveLength(2);
    expect(g.pen).toEqual({ x: 50, y: 50, down: false });
  });

  it('does not add a point the same as the last one', () => {
    let g = penDown(newGame(), { x: 10, y: 10 });
    g = moveTo(g, { x: 10, y: 10 });
    expect(g.strokes[0]?.points).toHaveLength(1);
  });

  it('keeps drawing the same line when the pen is put down while already down', () => {
    let g = penDown(newGame(), { x: 10, y: 10 });
    g = penDown(g, { x: 30, y: 30 });
    expect(g.strokes).toHaveLength(1);
    expect(g.strokes[0]?.points).toHaveLength(2);
  });

  it('keeps a single point as a dot', () => {
    const g = penUp(penDown(newGame(), { x: 5, y: 5 }));
    expect(g.strokes[0]?.points).toEqual([{ x: 5, y: 5 }]);
  });

  it('clamps every point to the drawing, so a pointer past the edge lands on it', () => {
    expect(clampPoint({ x: -5, y: 9999 })).toEqual({ x: 0, y: CANVAS_HEIGHT });
    expect(clampPoint({ x: 9999, y: -1 })).toEqual({ x: CANVAS_WIDTH, y: 0 });
    let g = penDown(newGame(), { x: -40, y: -40 });
    g = moveTo(g, { x: CANVAS_WIDTH + 100, y: CANVAS_HEIGHT + 100 });
    expect(g.strokes[0]?.points).toEqual([
      { x: 0, y: 0 },
      { x: CANVAS_WIDTH, y: CANVAS_HEIGHT },
    ]);
  });

  it('ignores a point that is not a number', () => {
    const g = newGame();
    expect(moveTo(g, { x: Number.NaN, y: 3 })).toBe(g);
    expect(penDown(g, { x: 3, y: Number.POSITIVE_INFINITY }).strokes[0]?.points[0]).toEqual({ x: g.pen.x, y: g.pen.y });
  });

  it('counts the lines on the sheet', () => {
    let g = newGame();
    expect(lineCount(g)).toBe(0);
    g = lineBy(g, 0, { x: 1, y: 1 }, { x: 2, y: 2 });
    g = lineBy(g, 1, { x: 3, y: 3 }, { x: 4, y: 4 });
    expect(lineCount(g)).toBe(2);
  });
});

describe('the pen dot from the keyboard or a switch', () => {
  it('moves one step of 12 units in each direction', () => {
    const start = newGame();
    expect(movePen(start, 1, 0).pen).toMatchObject({ x: start.pen.x + PEN_STEP, y: start.pen.y });
    expect(movePen(start, -1, 0).pen).toMatchObject({ x: start.pen.x - PEN_STEP, y: start.pen.y });
    expect(movePen(start, 0, 1).pen).toMatchObject({ x: start.pen.x, y: start.pen.y + PEN_STEP });
    expect(movePen(start, 0, -1).pen).toMatchObject({ x: start.pen.x, y: start.pen.y - PEN_STEP });
    expect(PEN_STEP).toBe(12);
  });

  it('keeps the pen inside the drawing at every edge', () => {
    let g = newGame();
    for (let i = 0; i < 200; i++) g = movePen(g, -1, -1);
    expect(g.pen).toMatchObject({ x: 0, y: 0 });
    for (let i = 0; i < 200; i++) g = movePen(g, 1, 1);
    expect(g.pen).toMatchObject({ x: CANVAS_WIDTH, y: CANVAS_HEIGHT });
  });

  it('draws the moves while the pen is down, and only moves while it is up', () => {
    let g = togglePen(newGame()).game;
    expect(g.pen.down).toBe(true);
    expect(g.strokes).toHaveLength(1);
    g = movePen(g, 1, 0);
    g = movePen(g, 0, 1);
    expect(g.strokes[0]?.points).toHaveLength(3);
    g = togglePen(g).game;
    expect(g.pen.down).toBe(false);
    g = movePen(g, 1, 0);
    expect(g.strokes[0]?.points).toHaveLength(3);
  });

  it('toggles between down and up, and reports which', () => {
    const down = togglePen(newGame());
    expect(down.down).toBe(true);
    const up = togglePen(down.game);
    expect(up.down).toBe(false);
  });

  it('starts the line in the color of the person whose turn it is when the pen goes down', () => {
    let g = passPen(newGame());
    g = togglePen(g).game;
    expect(g.strokes[0]?.person).toBe(1);
    expect(g.strokes[0]?.color).toBe(DEFAULT_COLORS[1]);
  });
});

describe('turns', () => {
  it('passes the pen to the other person, and either person may pass', () => {
    let g = newGame();
    expect(g.turn).toBe(0);
    g = passPen(g);
    expect(g.turn).toBe(1);
    g = passPen(g);
    expect(g.turn).toBe(0);
  });

  it('finishes the line being drawn when the pen is passed', () => {
    let g = penDown(newGame(), { x: 1, y: 1 });
    g = passPen(g);
    expect(g.pen.down).toBe(false);
    expect(g.turn).toBe(1);
    expect(g.strokes).toHaveLength(1);
  });
});

describe('taking back a line', () => {
  it('removes the last line of the person whose turn it is, and not the other person', () => {
    let g = lineBy(newGame(), 0, { x: 1, y: 1 }, { x: 2, y: 2 });
    g = lineBy(g, 1, { x: 3, y: 3 }, { x: 4, y: 4 });
    g = lineBy(g, 0, { x: 5, y: 5 }, { x: 6, y: 6 });
    expect(g.turn).toBe(0);
    const { game, removed } = takeBackLine(g);
    expect(removed?.person).toBe(0);
    expect(game.strokes.map((s) => s.person)).toEqual([0, 1]);
    expect(game.strokes[0]?.points[0]).toEqual({ x: 1, y: 1 });
  });

  it('does not move the turn', () => {
    let g = lineBy(newGame(), 0, { x: 1, y: 1 }, { x: 2, y: 2 });
    g = passPen(g);
    const { game } = takeBackLine(g);
    expect(game.turn).toBe(1);
  });

  it('removes nothing when the person whose turn it is has no line', () => {
    // The second person draws; then the turn is with the first person, who has no line yet.
    const g = passPen(lineBy(newGame(), 1, { x: 1, y: 1 }, { x: 2, y: 2 }));
    expect(g.turn).toBe(0);
    const { game, removed } = takeBackLine(g);
    expect(removed).toBeNull();
    expect(game.strokes).toEqual(g.strokes);
    expect(hasLineBy(g, 0)).toBe(false);
    expect(hasLineBy(g, 1)).toBe(true);
  });

  it('finishes a line in progress first, so the pen is up after taking back', () => {
    let g = penDown(newGame(), { x: 1, y: 1 });
    const { game } = takeBackLine(g);
    expect(game.pen.down).toBe(false);
    expect(game.strokes).toHaveLength(0);
  });

  it('takes back one line at a time, from the newest', () => {
    let g = lineBy(newGame(), 0, { x: 1, y: 1 }, { x: 2, y: 2 });
    g = lineBy(g, 0, { x: 3, y: 3 }, { x: 4, y: 4 });
    expect(lineCount(g)).toBe(2);
    const first = takeBackLine(g).game;
    expect(lineCount(first)).toBe(1);
    expect(takeBackLine(first).game.strokes).toHaveLength(0);
  });
});

describe('start again and put it back', () => {
  it('clears the sheet and gives the first person the turn', () => {
    let g = lineBy(newGame(), 0, { x: 1, y: 1 }, { x: 2, y: 2 });
    g = passPen(g);
    g = clearSheet(g);
    expect(g.strokes).toEqual([]);
    expect(g.turn).toBe(0);
  });

  it('keeps the cleared lines so one step can put them back', () => {
    let g = lineBy(newGame(), 0, { x: 1, y: 1 }, { x: 2, y: 2 });
    const before = g.strokes;
    g = clearSheet(g);
    expect(canPutBack(g)).toBe(true);
    const { game, restored } = putBack(g);
    expect(restored).toBe(true);
    expect(game.strokes).toBe(before);
    expect(canPutBack(game)).toBe(false);
  });

  it('keeps the earlier lines when clearing an empty sheet', () => {
    let g = lineBy(newGame(), 0, { x: 1, y: 1 }, { x: 2, y: 2 });
    g = clearSheet(g);
    const kept = g.undo;
    g = clearSheet(g);
    expect(g.undo).toBe(kept);
  });

  it('has nothing to put back at the start, and putting back then does nothing', () => {
    const g = newGame();
    expect(canPutBack(g)).toBe(false);
    expect(putBack(g)).toEqual({ game: g, restored: false });
  });

  it('forgets the cleared lines once a new line is drawn', () => {
    let g = lineBy(newGame(), 0, { x: 1, y: 1 }, { x: 2, y: 2 });
    g = clearSheet(g);
    g = lineBy(g, 0, { x: 9, y: 9 }, { x: 8, y: 8 });
    expect(canPutBack(g)).toBe(false);
  });

  it('forgets the cleared lines once a line is taken back', () => {
    let g = lineBy(newGame(), 0, { x: 1, y: 1 }, { x: 2, y: 2 });
    g = lineBy(g, 0, { x: 3, y: 3 }, { x: 4, y: 4 });
    g = clearSheet(g);
    g = lineBy(g, 0, { x: 5, y: 5 }, { x: 6, y: 6 });
    expect(canPutBack(takeBackLine(g).game)).toBe(false);
  });

  it('keeps the pass made after clearing, since putting back only restores lines', () => {
    let g = lineBy(newGame(), 0, { x: 1, y: 1 }, { x: 2, y: 2 });
    g = clearSheet(g);
    g = passPen(g);
    const { game } = putBack(g);
    expect(game.turn).toBe(1);
    expect(game.strokes).toHaveLength(1);
  });
});

describe('the data stays plain', () => {
  it('stores each line as person, color, width and points, with no functions or hidden values', () => {
    const g = lineBy(newGame(), 0, { x: 1, y: 1 }, { x: 2, y: 2 });
    const copy = JSON.parse(JSON.stringify(g)) as DuetGame;
    expect(copy).toEqual(g);
    expect(Object.keys(g.strokes[0] ?? {}).sort()).toEqual(['color', 'person', 'points', 'width']);
  });

  it('never changes the game it was given', () => {
    const g = lineBy(newGame(), 0, { x: 1, y: 1 }, { x: 2, y: 2 });
    const snapshot = JSON.stringify(g);
    passPen(g);
    takeBackLine(g);
    clearSheet(g);
    movePen(g, 1, 1);
    chooseColor(g, 0, 2);
    expect(JSON.stringify(g)).toBe(snapshot);
  });
});
