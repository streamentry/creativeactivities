import { describe, expect, it } from 'vitest';
import { DEFAULT_TILE_SIZE, REPEATS, STARTERS, TILE_SIZES, type PatternColor } from '../../data/pattern-maker';
import {
  canPutBack,
  chooseSize,
  clearTile,
  cycleSquare,
  isBlank,
  newGame,
  nextColor,
  placeOf,
  putBack,
  repeatTile,
  surprise,
  surpriseTile,
  tileOf,
} from './pattern-maker';
import { createRng } from './random';

describe('starting', () => {
  it('begins with the 3 by 3 starter tile and nothing to put back', () => {
    const game = newGame();

    expect(game.size).toBe(DEFAULT_TILE_SIZE);
    expect(game.size).toBe(3);
    expect(tileOf(game)).toEqual(STARTERS[3].flat());
    expect(canPutBack(game)).toBe(false);
  });

  it('has a tile of each size ready, each with more than one color so the repeat shows something', () => {
    const game = newGame();

    for (const size of TILE_SIZES) {
      expect(game.tiles[size]).toHaveLength(size * size);
      expect(new Set(game.tiles[size]).size).toBeGreaterThan(1);
    }
  });
});

describe('places', () => {
  it('counts rows and columns from 1', () => {
    expect(placeOf(3, 0)).toEqual({ row: 1, column: 1 });
    expect(placeOf(3, 5)).toEqual({ row: 2, column: 3 });
    expect(placeOf(4, 15)).toEqual({ row: 4, column: 4 });
  });
});

describe('tapping a square', () => {
  it('changes it to the next color and leaves every other square alone', () => {
    const start = newGame();
    const { game, color } = cycleSquare(start, 0);

    expect(color).toBe(nextColor(tileOf(start)[0] as PatternColor));
    expect(tileOf(game)[0]).toBe(color);
    expect(tileOf(game).slice(1)).toEqual(tileOf(start).slice(1));
  });

  it('goes round the four colors and back to the first, never to a fifth', () => {
    expect([0, 1, 2, 3].map((c) => nextColor(c as PatternColor))).toEqual([1, 2, 3, 0]);
    let game = clearTile(newGame());
    const seen: PatternColor[] = [];
    for (let i = 0; i < 5; i++) {
      const tapped = cycleSquare(game, 4);
      game = tapped.game;
      seen.push(tapped.color as PatternColor);
    }
    expect(seen).toEqual([1, 2, 3, 0, 1]);
  });

  it('ignores a tap outside the tile', () => {
    const start = newGame();

    for (const index of [-1, 9, 3.5, Number.NaN]) {
      const { game, color } = cycleSquare(start, index);
      expect(game).toBe(start);
      expect(color).toBeNull();
    }
  });

  it('does not change the game it was given', () => {
    const start = newGame();
    const before = JSON.stringify(start);
    cycleSquare(start, 2);
    clearTile(start);
    surprise(start, createRng(1));
    chooseSize(start, 4);

    expect(JSON.stringify(start)).toBe(before);
  });

  it('lets go of a step that could be put back, since the tile has changed since', () => {
    const cleared = clearTile(newGame());
    expect(canPutBack(cleared)).toBe(true);

    expect(canPutBack(cycleSquare(cleared, 0).game)).toBe(false);
  });
});

describe('Start again', () => {
  it('makes every square the first color', () => {
    const game = clearTile(newGame());

    expect(isBlank(tileOf(game))).toBe(true);
    expect(tileOf(game)).toHaveLength(9);
  });

  it('clears only the tile being edited and keeps the other size as it was', () => {
    const game = clearTile(newGame());

    expect(game.tiles[4]).toEqual(STARTERS[4].flat());
  });

  it('can be put back, exactly as it was, once', () => {
    const start = cycleSquare(newGame(), 3).game;
    const cleared = clearTile(start);
    const back = putBack(cleared);

    expect(tileOf(back)).toEqual(tileOf(start));
    expect(canPutBack(back)).toBe(false);
    expect(putBack(back)).toBe(back);
  });

  it('keeps what can be put back when it is pressed again on a tile that is already clear', () => {
    const start = newGame();
    const twice = clearTile(clearTile(start));

    expect(tileOf(putBack(twice))).toEqual(tileOf(start));
  });
});

describe('Surprise me', () => {
  it('gives the same tile for the same seed', () => {
    expect(surpriseTile(3, createRng(7))).toEqual(surpriseTile(3, createRng(7)));
    expect(surpriseTile(4, createRng(7))).toEqual(surpriseTile(4, createRng(7)));
  });

  it('gives a different tile for a different seed, for most seeds', () => {
    const tiles = new Set(Array.from({ length: 20 }, (_, seed) => surpriseTile(4, createRng(seed)).join('')));

    expect(tiles.size).toBeGreaterThan(10);
  });

  for (const size of TILE_SIZES) {
    it(`makes a ${size} by ${size} tile of palette colors only, the same left and right, with at least two colors, for every seed tried`, () => {
      for (let seed = 0; seed < 200; seed++) {
        const cells = surpriseTile(size, createRng(seed));
        expect(cells).toHaveLength(size * size);
        for (const cell of cells) expect([0, 1, 2, 3]).toContain(cell);
        expect(new Set(cells).size, `seed ${seed}`).toBeGreaterThanOrEqual(2);
        for (let row = 0; row < size; row++) for (let column = 0; column < size; column++) expect(cells[row * size + column]).toBe(cells[row * size + (size - 1 - column)]);
      }
    });
  }

  it('always changes the tile, so the button never seems to do nothing', () => {
    let game = newGame();
    for (let seed = 0; seed < 100; seed++) {
      const next = surprise(game, createRng(seed));
      expect(tileOf(next)).not.toEqual(tileOf(game));
      game = next;
    }
  });

  it('can be put back, and only the tile that was replaced comes back', () => {
    const start = newGame();
    const next = surprise(start, createRng(3));

    expect(canPutBack(next)).toBe(true);
    expect(tileOf(putBack(next))).toEqual(tileOf(start));
  });

  it('works on a clear tile too', () => {
    const next = surprise(clearTile(newGame()), createRng(5));

    expect(isBlank(tileOf(next))).toBe(false);
  });
});

describe('the tile size', () => {
  it('keeps each size as it was left, so going back finds the work', () => {
    const edited = cycleSquare(newGame(), 0).game;
    const there = chooseSize(edited, 4);
    const back = chooseSize(there, 3);

    expect(there.size).toBe(4);
    expect(tileOf(back)).toEqual(tileOf(edited));
  });

  it('lets go of what could be put back, because it belongs to a tile no longer shown', () => {
    expect(canPutBack(chooseSize(clearTile(newGame()), 4))).toBe(false);
  });

  it('keeps the same game for the size already chosen or one that is not offered', () => {
    const start = clearTile(newGame());

    expect(chooseSize(start, 3)).toBe(start);
    expect(chooseSize(start, 5 as never)).toBe(start);
  });
});

describe('your pattern', () => {
  it('repeats the tile 3 across and 3 down', () => {
    expect(REPEATS).toBe(3);
    for (const size of TILE_SIZES) expect(repeatTile(newGame().tiles[size], size)).toHaveLength((size * REPEATS) ** 2);
  });

  it('puts the tile at every repeat, square for square', () => {
    const cells: PatternColor[] = [0, 1, 2, 3];
    const grid = repeatTile(cells as never, 2 as never, 2, 2);

    expect(grid).toEqual([0, 1, 0, 1, 2, 3, 2, 3, 0, 1, 0, 1, 2, 3, 2, 3]);
  });

  it('shows a change to the tile at once, in every repeat', () => {
    const before = newGame();
    const after = cycleSquare(before, 4).game;
    const changed = repeatTile(tileOf(after), 3)
      .map((c, i) => (c === repeatTile(tileOf(before), 3)[i] ? -1 : i))
      .filter((i) => i >= 0);

    expect(changed).toHaveLength(REPEATS * REPEATS);
    expect(new Set(changed.map((i) => (Math.floor(i / 9) % 3) * 3 + (i % 9) % 3))).toEqual(new Set([4]));
  });
});
