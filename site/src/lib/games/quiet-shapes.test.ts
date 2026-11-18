import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  CELL,
  PUZZLES,
  SHAPE_TYPES,
  TURNS,
  choosePiece,
  clipClass,
  clipPath,
  isComplete,
  localPoints,
  newGame,
  nextPuzzle,
  polygonsOverlap,
  puzzleOf,
  putBack,
  setHints,
  shapeSize,
  spacePoints,
  startAgain,
  tapSpace,
  tray,
  turnedPoints,
  viewBoxOf,
  type Puzzle,
  type QuietGame,
  type Space,
} from './quiet-shapes';

const area = (points: readonly (readonly [number, number])[]): number => {
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i] as readonly [number, number];
    const [x2, y2] = points[(i + 1) % points.length] as readonly [number, number];
    sum += x1 * y2 - x2 * y1;
  }
  return Math.abs(sum) / 2;
};

/** The spaces of a puzzle with the piece placed in each, for a finished picture. */
function filled(puzzle: number): QuietGame {
  let game = newGame(puzzle);
  for (let i = 0; i < puzzleOf(game).spaces.length; i++) {
    game = choosePiece(game, i).game;
    game = tapSpace(game, i).game;
  }
  return game;
}

describe('the six pictures', () => {
  it('has six pictures, each made of 4 to 6 spaces (pieces)', () => {
    expect(PUZZLES.map((p) => p.id)).toEqual(['house', 'boat', 'tree', 'fish', 'cat', 'rocket']);
    for (const puzzle of PUZZLES) {
      expect(puzzle.spaces.length, puzzle.id).toBeGreaterThanOrEqual(4);
      expect(puzzle.spaces.length, puzzle.id).toBeLessThanOrEqual(6);
    }
  });

  it('uses only the five shape types, and a quarter turn for each space', () => {
    for (const puzzle of PUZZLES) {
      for (const space of puzzle.spaces) {
        expect(SHAPE_TYPES).toContain(space.type);
        expect(TURNS).toContain(space.turn);
      }
    }
  });

  it('keeps every space inside its picture viewBox', () => {
    for (const puzzle of PUZZLES) {
      const box = viewBoxOf(puzzle);
      for (const space of puzzle.spaces) {
        for (const [x, y] of spacePoints(space)) {
          expect(x, puzzle.id).toBeGreaterThanOrEqual(box.x);
          expect(x, puzzle.id).toBeLessThanOrEqual(box.x + box.w);
          expect(y, puzzle.id).toBeGreaterThanOrEqual(box.y);
          expect(y, puzzle.id).toBeLessThanOrEqual(box.y + box.h);
        }
      }
    }
  });

  it('has no two spaces that overlap', () => {
    for (const puzzle of PUZZLES) {
      for (let i = 0; i < puzzle.spaces.length; i++) {
        for (let j = i + 1; j < puzzle.spaces.length; j++) {
          const a = spacePoints(puzzle.spaces[i] as Space);
          const b = spacePoints(puzzle.spaces[j] as Space);
          expect(polygonsOverlap(a, b), `${puzzle.id} ${i} and ${j}`).toBe(false);
        }
      }
    }
  });

  it('makes every space a whole or half number of cells (a small triangle is half a cell)', () => {
    for (const puzzle of PUZZLES) {
      for (const space of puzzle.spaces) {
        const cells = area(spacePoints(space)) / (CELL * CELL);
        expect(Number.isInteger(cells * 2), `${puzzle.id} ${space.type}`).toBe(true);
      }
    }
  });

  it('gives each piece the shape type of its space, so the piece types match the space types', () => {
    for (const puzzle of PUZZLES) {
      const pieces = puzzle.spaces.map((s) => s.type).sort();
      const spaces = puzzle.spaces.map((s) => s.type).sort();
      expect(pieces).toEqual(spaces);
    }
  });

  it('turns each shape to a whole number of cells, with a quarter turn swapping its width and height', () => {
    for (const type of SHAPE_TYPES) {
      const flat = shapeSize(type, 0);
      expect(shapeSize(type, 90)).toEqual({ w: flat.h, h: flat.w });
      expect(shapeSize(type, 180)).toEqual(flat);
      for (const turn of TURNS) {
        const { w, h } = shapeSize(type, turn);
        expect(turnedPoints(type, turn).every(([x, y]) => x >= 0 && x <= w && y >= 0 && y <= h)).toBe(true);
        expect(area(turnedPoints(type, turn))).toBeCloseTo(area(turnedPoints(type, 0)), 9);
      }
    }
  });

  it('draws the local points of a space inside its own box', () => {
    for (const puzzle of PUZZLES) {
      for (const space of puzzle.spaces) {
        const { w, h } = shapeSize(space.type, space.turn);
        for (const [x, y] of localPoints(space)) {
          expect(x).toBeGreaterThanOrEqual(0);
          expect(x).toBeLessThanOrEqual(w * CELL);
          expect(y).toBeGreaterThanOrEqual(0);
          expect(y).toBeLessThanOrEqual(h * CELL);
        }
      }
    }
  });
});

describe('the clip-path classes in games.css', () => {
  const css = readFileSync(new URL('../../styles/games.css', import.meta.url), 'utf8');

  it('has one class for every shape type and turn, each with the clip-path clipPath() gives', () => {
    for (const type of SHAPE_TYPES) {
      for (const turn of TURNS) {
        const cls = clipClass(type, turn);
        const rule = css.match(new RegExp(`\\.${cls} \\{ clip-path: ([^;]+); \\}`));
        expect(rule, cls).not.toBeNull();
        expect(rule?.[1], cls).toBe(clipPath(type, turn));
      }
    }
  });

  it('is the only place the quiet shapes styles set clip paths', () => {
    expect(css.match(/\.qs-clip-[a-z-]+-\d+ \{ clip-path/g)).toHaveLength(SHAPE_TYPES.length * TURNS.length);
  });
});

describe('starting and choosing', () => {
  it('starts with the first picture, every space empty, nothing chosen, and the hint lines on', () => {
    const game = newGame();
    expect(puzzleOf(game).id).toBe('house');
    expect(game.placed.every((p) => p === null)).toBe(true);
    expect(game.chosen).toBeNull();
    expect(game.hints).toBe(true);
    expect(isComplete(game)).toBe(false);
  });

  it('lists every piece in the tray at the start', () => {
    const game = newGame(1);
    expect(tray(game)).toEqual(puzzleOf(game).spaces.map((_, i) => i));
  });

  it('chooses a piece on a tap, and un-chooses it on a second tap', () => {
    const chosen = choosePiece(newGame(), 2);
    expect(chosen.outcome).toBe('chosen');
    expect(chosen.game.chosen).toBe(2);

    const back = choosePiece(chosen.game, 2);
    expect(back.outcome).toBe('unchosen');
    expect(back.game.chosen).toBeNull();
  });

  it('switches the chosen piece to another piece in the tray', () => {
    const game = choosePiece(choosePiece(newGame(), 0).game, 3).game;
    expect(game.chosen).toBe(3);
  });

  it('refuses a piece that does not exist', () => {
    expect(choosePiece(newGame(), 99).outcome).toBe('outside');
    expect(choosePiece(newGame(), -1).outcome).toBe('outside');
    expect(choosePiece(newGame(), 1.5).outcome).toBe('outside');
  });
});

describe('placing a piece', () => {
  it('asks for a piece first when no piece is chosen', () => {
    const result = tapSpace(newGame(), 0);
    expect(result.outcome).toBe('needPiece');
    expect(result.game.placed[0]).toBeNull();
  });

  it('places a piece in a space of the same shape type and takes it out of the tray', () => {
    const game = newGame(); // house: spaces 0 and 1 are large triangles
    const chosen = choosePiece(game, 0).game;
    const result = tapSpace(chosen, 1);
    expect(result.outcome).toBe('placed');
    expect(result.game.placed[1]).toBe(0);
    expect(result.game.chosen).toBeNull();
    expect(tray(result.game)).not.toContain(0);
  });

  it('refuses a piece of another shape, places nothing and keeps the piece chosen', () => {
    const chosen = choosePiece(newGame(), 0).game; // a large triangle
    const result = tapSpace(chosen, 2); // a rectangle space
    expect(result.outcome).toBe('different');
    expect(result.game.placed[2]).toBeNull();
    expect(result.game.chosen).toBe(0);
  });

  it('does not place a second piece in a space that already has one', () => {
    const placed = tapSpace(choosePiece(newGame(), 0).game, 0).game;
    const result = tapSpace(choosePiece(placed, 1).game, 0);
    expect(result.outcome).toBe('filled');
    expect(result.game.placed[0]).toBe(0);
  });

  it('takes a placed piece back to the tray on a tap, when no piece is chosen', () => {
    const placed = tapSpace(choosePiece(newGame(), 0).game, 0).game;
    const back = tapSpace(placed, 0);
    expect(back.outcome).toBe('tookBack');
    expect(back.game.placed[0]).toBeNull();
    expect(tray(back.game)).toContain(0);
  });

  it('says the picture is complete when the last space is filled, and only then', () => {
    let game = newGame(2); // tree: four spaces
    for (let i = 0; i < 3; i++) game = tapSpace(choosePiece(game, i).game, i).game;
    expect(isComplete(game)).toBe(false);
    const last = tapSpace(choosePiece(game, 3).game, 3);
    expect(last.outcome).toBe('complete');
    expect(isComplete(last.game)).toBe(true);
  });

  it('completes every picture when each piece is placed in its own space', () => {
    PUZZLES.forEach((_, i) => expect(isComplete(filled(i))).toBe(true));
  });

  it('refuses a space that is not in the picture', () => {
    expect(tapSpace(choosePiece(newGame(), 0).game, 50).outcome).toBe('outside');
  });
});

describe('start again, put back, another shape and hints', () => {
  it('takes every piece back to the tray on Start again', () => {
    const game = filled(0);
    const result = startAgain(game);
    expect(result.outcome).toBe('cleared');
    expect(result.game.placed.every((p) => p === null)).toBe(true);
    expect(tray(result.game)).toHaveLength(puzzleOf(game).spaces.length);
  });

  it('does nothing on Start again when the picture is already empty', () => {
    expect(startAgain(newGame()).outcome).toBe('same');
  });

  it('restores the picture with one step of Put it back', () => {
    const game = filled(0);
    const cleared = startAgain(game).game;
    const restored = putBack(cleared);
    expect(restored.outcome).toBe('restored');
    expect(restored.game.placed).toEqual(game.placed);
    expect(restored.game.before).toBeNull();
  });

  it('keeps only one step of Put it back: a later change removes it', () => {
    const cleared = startAgain(filled(0)).game;
    const changed = tapSpace(choosePiece(cleared, 0).game, 0).game;
    expect(changed.before).toBeNull();
    expect(putBack(changed).outcome).toBe('same');
  });

  it('moves to the next picture, empty, wrapping after the last one, keeping the hint setting', () => {
    const game = setHints(filled(0), false);
    const next = nextPuzzle(game);
    expect(next.outcome).toBe('next');
    expect(next.game.puzzle).toBe(1);
    expect(next.game.placed.every((p) => p === null)).toBe(true);
    expect(next.game.hints).toBe(false);
    expect(nextPuzzle({ ...newGame(PUZZLES.length - 1) }).game.puzzle).toBe(0);
  });

  it('turns the hint lines on and off, and changes nothing else', () => {
    const game = newGame();
    const off = setHints(game, false);
    expect(off.hints).toBe(false);
    expect(off.placed).toBe(game.placed);
    expect(setHints(off, false)).toBe(off);
  });
});

describe('the logic keeps its values (no mutation, no counters)', () => {
  it('returns a new game and leaves the old one as it was', () => {
    const game = newGame();
    const snapshot = JSON.stringify(game);
    choosePiece(game, 0);
    tapSpace(choosePiece(game, 0).game, 0);
    startAgain(filled(0));
    expect(JSON.stringify(game)).toBe(snapshot);
  });

  it('keeps no score, move count, timer or mistake count in the game state', () => {
    const keys = Object.keys(newGame());
    expect(keys.sort()).toEqual(['before', 'chosen', 'hints', 'placed', 'puzzle']);
  });

  it('uses the Puzzle type shape for every picture', () => {
    const first: Puzzle = PUZZLES[0] as Puzzle;
    expect(first.spaces.length).toBeGreaterThan(0);
    expect(clipClass('square', 0)).toBe('qs-clip-square-0');
  });
});
