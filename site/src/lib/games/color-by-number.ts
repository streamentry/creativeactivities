import {
  DEFAULT_GRID_SIZE,
  GRID_SIZES,
  MOTIFS,
  type CellValue,
  type ColorNumber,
  type GridSize,
  type Motif,
} from '../../data/color-by-number';

/**
 * Color by number (GAME-031). A square grid of cells, each with a number and
 * empty. A person picks a color from the key, then taps cells to fill them.
 * There is no wrong color: any cell can hold any of the four colors. When every
 * cell holds the color of its number the grid is the picture on the sheet.
 * Nothing is counted, timed or lost, and every function returns a new value.
 */

/** One painted grid: which picture it is, and what each cell holds, row by row. */
export interface Board {
  motifIndex: 0 | 1;
  cells: readonly CellValue[];
}

export interface ColorGame {
  size: GridSize;
  /** The color the next tap fills with. */
  brush: ColorNumber;
  /** One board per size, so choosing another size and coming back keeps the painting. */
  boards: Readonly<Record<GridSize, Board>>;
}

/** What a tap on a cell did, for the message. */
export type PaintResult = 'filled' | 'same' | 'outside';

const emptyBoard = (size: GridSize, motifIndex: 0 | 1 = 0): Board => ({ motifIndex, cells: new Array<CellValue>(size * size).fill(0) });

export function newGame(): ColorGame {
  return {
    size: DEFAULT_GRID_SIZE,
    brush: 1,
    boards: { 4: emptyBoard(4), 6: emptyBoard(6), 8: emptyBoard(8) },
  };
}

/** The picture a board is painted from. */
export function motifOf(size: GridSize, board: Board): Motif {
  return MOTIFS[size][board.motifIndex];
}

/** The number printed in a cell: the color it belongs to on the sheet. */
export function numberAt(size: GridSize, board: Board, index: number): ColorNumber {
  const row = Math.floor(index / size);
  return motifOf(size, board).rows[row]?.[index % size] as ColorNumber;
}

/** Where a cell is, counting from 1, as people say it ("row 2, column 3"). */
export function placeOf(size: GridSize, index: number): { row: number; column: number } {
  return { row: Math.floor(index / size) + 1, column: (index % size) + 1 };
}

export const boardOf = (game: ColorGame): Board => game.boards[game.size];

function withBoard(game: ColorGame, board: Board): ColorGame {
  return { ...game, boards: { ...game.boards, [game.size]: board } };
}

export function chooseSize(game: ColorGame, size: GridSize): ColorGame {
  return GRID_SIZES.includes(size) ? { ...game, size } : game;
}

export function chooseColor(game: ColorGame, color: ColorNumber): ColorGame {
  return color === game.brush ? game : { ...game, brush: color };
}

/** Fill one cell with the chosen color. Any color is allowed in any cell. */
export function paintCell(game: ColorGame, index: number): { game: ColorGame; result: PaintResult } {
  const board = boardOf(game);
  if (!Number.isInteger(index) || index < 0 || index >= board.cells.length) return { game, result: 'outside' };
  if (board.cells[index] === game.brush) return { game, result: 'same' };
  const cells = board.cells.map((cell, i) => (i === index ? game.brush : cell));
  return { game: withBoard(game, { ...board, cells }), result: 'filled' };
}

/** Fill every empty cell with its own number's color. Cells already filled keep the color they have. */
export function fillWithNumbers(game: ColorGame): ColorGame {
  const board = boardOf(game);
  const cells = board.cells.map((cell, i) => (cell === 0 ? numberAt(game.size, board, i) : cell));
  return withBoard(game, { ...board, cells });
}

/** Empty every cell of the current grid. The picture stays the same. */
export function clearBoard(game: ColorGame): ColorGame {
  const board = boardOf(game);
  return board.cells.every((c) => c === 0) ? game : withBoard(game, { ...board, cells: emptyBoard(game.size).cells });
}

/** Swap to the other picture of this size, with an empty grid. */
export function anotherPicture(game: ColorGame): ColorGame {
  const next = (boardOf(game).motifIndex === 0 ? 1 : 0) as 0 | 1;
  return withBoard(game, emptyBoard(game.size, next));
}

export const filledCount = (board: Board): number => board.cells.filter((c) => c !== 0).length;

export const isAllFilled = (board: Board): boolean => board.cells.every((c) => c !== 0);

export const isEmpty = (board: Board): boolean => board.cells.every((c) => c === 0);

/** True when every cell holds the color of its number: this is the picture on the sheet. */
export function isSheetPicture(size: GridSize, board: Board): boolean {
  return board.cells.every((cell, i) => cell === numberAt(size, board, i));
}
