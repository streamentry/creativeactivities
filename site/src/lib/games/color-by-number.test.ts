import { describe, expect, it } from 'vitest';
import { GRID_SIZES, MOTIFS, type ColorNumber, type GridSize } from '../../data/color-by-number';
import {
  anotherPicture,
  boardOf,
  chooseColor,
  chooseSize,
  clearBoard,
  fillWithNumbers,
  filledCount,
  isAllFilled,
  isEmpty,
  isSheetPicture,
  newGame,
  numberAt,
  paintCell,
  placeOf,
} from './color-by-number';

const COLOR_NUMBERS: ColorNumber[] = [1, 2, 3, 4];

describe('starting', () => {
  it('begins with an empty 4 by 4 grid and the first color chosen', () => {
    const game = newGame();

    expect(game.size).toBe(4);
    expect(game.brush).toBe(1);
    expect(boardOf(game).cells).toHaveLength(16);
    expect(isEmpty(boardOf(game))).toBe(true);
  });

  it('has an empty board of each size ready', () => {
    const game = newGame();

    for (const size of GRID_SIZES) expect(game.boards[size].cells).toHaveLength(size * size);
  });
});

describe('numbers and places', () => {
  it('reads each cell number from the picture, row by row', () => {
    const game = newGame();
    const house = MOTIFS[4][0].rows;

    expect(numberAt(4, boardOf(game), 0)).toBe(house[0]?.[0]);
    expect(numberAt(4, boardOf(game), 6)).toBe(house[1]?.[2]);
    expect(numberAt(4, boardOf(game), 15)).toBe(house[3]?.[3]);
  });

  it('counts rows and columns from 1', () => {
    expect(placeOf(4, 0)).toEqual({ row: 1, column: 1 });
    expect(placeOf(4, 6)).toEqual({ row: 2, column: 3 });
    expect(placeOf(8, 63)).toEqual({ row: 8, column: 8 });
  });
});

describe('painting a cell', () => {
  it('fills the cell with the chosen color and leaves the rest alone', () => {
    const start = chooseColor(newGame(), 3);
    const { game, result } = paintCell(start, 5);

    expect(result).toBe('filled');
    expect(boardOf(game).cells[5]).toBe(3);
    expect(filledCount(boardOf(game))).toBe(1);
  });

  it('does not change the game it was given', () => {
    const start = newGame();
    const before = JSON.stringify(start);
    paintCell(start, 0);
    fillWithNumbers(start);
    clearBoard(start);
    anotherPicture(start);

    expect(JSON.stringify(start)).toBe(before);
  });

  it('lets any color go in any cell, and a new color replaces the old one', () => {
    const first = paintCell(chooseColor(newGame(), 2), 0).game;
    const second = paintCell(chooseColor(first, 4), 0);

    expect(second.result).toBe('filled');
    expect(boardOf(second.game).cells[0]).toBe(4);
  });

  it('says "same" and changes nothing when a cell already has that color', () => {
    const first = paintCell(newGame(), 0).game;
    const again = paintCell(first, 0);

    expect(again.result).toBe('same');
    expect(again.game).toBe(first);
  });

  it('ignores a cell that is not on the grid', () => {
    const start = newGame();

    for (const index of [-1, 16, 2.5, Number.NaN]) {
      const { game, result } = paintCell(start, index);
      expect(result).toBe('outside');
      expect(game).toBe(start);
    }
  });
});

describe('the picture on the sheet', () => {
  it('is reached by painting every cell with the color of its number, in any order', () => {
    for (const size of GRID_SIZES) {
      let game = chooseSize(newGame(), size);
      const order = [...game.boards[size].cells.keys()].reverse();
      for (const i of order) {
        game = chooseColor(game, numberAt(size, boardOf(game), i));
        game = paintCell(game, i).game;
      }
      expect(isSheetPicture(size, boardOf(game)), `${size}x${size}`).toBe(true);
    }
  });

  it('is not the picture while a cell is empty', () => {
    expect(isSheetPicture(4, boardOf(newGame()))).toBe(false);
    const filled = fillWithNumbers(newGame());
    const almost = { ...filled, boards: { ...filled.boards, 4: { ...boardOf(filled), cells: boardOf(filled).cells.map((c, i) => (i === 0 ? (0 as const) : c)) } } };
    expect(isSheetPicture(4, boardOf(almost))).toBe(false);
  });

  it('is not the picture, and not a problem, when a cell has another color: it is simply the player\'s own picture', () => {
    let game = fillWithNumbers(newGame());
    const own = ((numberAt(4, boardOf(game), 0) % 4) + 1) as ColorNumber;
    game = paintCell(chooseColor(game, own), 0).game;

    expect(isAllFilled(boardOf(game))).toBe(true);
    expect(isSheetPicture(4, boardOf(game))).toBe(false);
  });
});

describe('Fill with the numbers', () => {
  it('fills every empty cell with its numbered color', () => {
    for (const size of GRID_SIZES) {
      const game = fillWithNumbers(chooseSize(newGame(), size));

      expect(isSheetPicture(size, boardOf(game)), `${size}x${size}`).toBe(true);
    }
  });

  it('keeps the colors the player chose', () => {
    const own = ((numberAt(4, boardOf(newGame()), 3) % 4) + 1) as ColorNumber;
    const painted = paintCell(chooseColor(newGame(), own), 3).game;
    const filled = fillWithNumbers(painted);

    expect(boardOf(filled).cells[3]).toBe(own);
    expect(isAllFilled(boardOf(filled))).toBe(true);
  });
});

describe('Clear and Another picture', () => {
  it('Clear empties the current grid, keeps the picture and leaves the other sizes alone', () => {
    const four = fillWithNumbers(newGame());
    const six = fillWithNumbers(chooseSize(four, 6));
    const cleared = clearBoard(six);

    expect(isEmpty(boardOf(cleared))).toBe(true);
    expect(boardOf(cleared).motifIndex).toBe(boardOf(six).motifIndex);
    expect(isAllFilled(cleared.boards[4])).toBe(true);
  });

  it('Clear on an empty grid changes nothing', () => {
    const game = newGame();

    expect(clearBoard(game)).toBe(game);
  });

  it('Another picture swaps to the other picture of this size, empty, and back again', () => {
    for (const size of GRID_SIZES as readonly GridSize[]) {
      const start = fillWithNumbers(chooseSize(newGame(), size));
      const other = anotherPicture(start);

      expect(boardOf(other).motifIndex).not.toBe(boardOf(start).motifIndex);
      expect(isEmpty(boardOf(other))).toBe(true);
      expect(boardOf(anotherPicture(other)).motifIndex).toBe(boardOf(start).motifIndex);
    }
  });
});

describe('sizes', () => {
  it('keeps each size\'s painting when another size is chosen and the first comes back', () => {
    const painted = paintCell(newGame(), 2).game;
    const away = chooseSize(painted, 8);
    const back = chooseSize(away, 4);

    expect(boardOf(away).cells.every((c) => c === 0)).toBe(true);
    expect(boardOf(back).cells[2]).toBe(1);
  });

  it('ignores a size that is not offered', () => {
    const game = newGame();

    expect(chooseSize(game, 5 as GridSize)).toBe(game);
  });

  it('keeps the chosen color when the size changes', () => {
    expect(chooseSize(chooseColor(newGame(), 4), 6).brush).toBe(4);
  });
});

describe('choosing a color', () => {
  it('returns the same game when the color is already chosen', () => {
    const game = newGame();

    expect(chooseColor(game, 1)).toBe(game);
    expect(chooseColor(game, 2).brush).toBe(2);
    expect(COLOR_NUMBERS).toContain(chooseColor(game, 4).brush);
  });
});
