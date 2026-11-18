import { DEFAULT_TILE_SIZE, PATTERN_COLORS, REPEATS, STARTERS, TILE_SIZES, type PatternColor, type TileSize } from '../../data/pattern-maker';
import type { Rng } from './random';

/**
 * Pattern maker (GAME-034). A person edits one small tile by tapping its squares,
 * each tap changing a square to the next of four colors, and the tile is shown
 * repeated beside it. There is no right pattern, so nothing here scores, checks,
 * counts or ends anything. Every function returns a new value.
 *
 * One step can be put back: when Start again or Surprise me replaces the whole
 * tile, the tile it replaced is kept, so an accidental tap is never a loss. Any
 * later change (a tap on a square, another size) lets that step go.
 */

/** A tile's squares, row by row. */
export type Cells = readonly PatternColor[];

export interface PatternGame {
  size: TileSize;
  /** One tile per size, so choosing another size and coming back keeps the work. */
  tiles: Readonly<Record<TileSize, Cells>>;
  /** The tile that Start again or Surprise me replaced, to put back; null when there is nothing to put back. */
  undo: Cells | null;
}

const PALETTE_SIZE = PATTERN_COLORS.length;

const blankTile = (size: TileSize): Cells => new Array<PatternColor>(size * size).fill(0);

const starterTile = (size: TileSize): Cells => STARTERS[size].flat();

export function newGame(): PatternGame {
  return {
    size: DEFAULT_TILE_SIZE,
    tiles: { 3: starterTile(3), 4: starterTile(4) },
    undo: null,
  };
}

/** The tile being edited. */
export const tileOf = (game: PatternGame): Cells => game.tiles[game.size];

function withTile(game: PatternGame, cells: Cells, undo: Cells | null): PatternGame {
  return { ...game, tiles: { ...game.tiles, [game.size]: cells }, undo };
}

/** Where a square is, counting from 1, as people say it ("row 2, column 3"). */
export function placeOf(size: TileSize, index: number): { row: number; column: number } {
  return { row: Math.floor(index / size) + 1, column: (index % size) + 1 };
}

export const isBlank = (cells: Cells): boolean => cells.every((c) => c === 0);

export const canPutBack = (game: PatternGame): boolean => game.undo !== null;

export function chooseSize(game: PatternGame, size: TileSize): PatternGame {
  return TILE_SIZES.includes(size) && size !== game.size ? { ...game, size, undo: null } : game;
}

/** The color a tap on a square would give it: the next in the palette, the last going back to the first. */
export const nextColor = (color: PatternColor): PatternColor => ((color + 1) % PALETTE_SIZE) as PatternColor;

/** Change one square to the next color. A tap outside the tile changes nothing. */
export function cycleSquare(game: PatternGame, index: number): { game: PatternGame; color: PatternColor | null } {
  const cells = tileOf(game);
  if (!Number.isInteger(index) || index < 0 || index >= cells.length) return { game, color: null };
  const color = nextColor(cells[index] as PatternColor);
  return { game: withTile(game, cells.map((c, i) => (i === index ? color : c)), null), color };
}

/** Make every square the first color. The tile it replaced can be put back. A tile that is already clear stays as it is. */
export function clearTile(game: PatternGame): PatternGame {
  const cells = tileOf(game);
  return isBlank(cells) ? game : withTile(game, blankTile(game.size), cells);
}

/**
 * A random tile that is the same on its left and its right, which makes a pleasing
 * repeat, with at least two colors. The same seed always gives the same tile.
 */
export function surpriseTile(size: TileSize, rng: Rng): Cells {
  const half = Math.ceil(size / 2);
  const pick = () => Math.floor(rng() * PALETTE_SIZE) as PatternColor;
  const cells: PatternColor[] = new Array<PatternColor>(size * size).fill(0);
  for (let row = 0; row < size; row++) {
    for (let column = 0; column < half; column++) {
      const color = pick();
      cells[row * size + column] = color;
      cells[row * size + (size - 1 - column)] = color;
    }
  }
  // One color alone is just a blank tile: change the first square so the tile has two.
  if (new Set(cells).size < 2) cells[0] = nextColor(cells[0] as PatternColor);
  return cells;
}

/** Replace the whole tile with a random one that differs from the one shown. The tile it replaced can be put back. */
export function surprise(game: PatternGame, rng: Rng): PatternGame {
  const before = tileOf(game);
  let cells = surpriseTile(game.size, rng);
  // Try a few more times so "Surprise me" never seems to do nothing; the generator is seeded, so this is bounded.
  for (let attempt = 0; attempt < 8 && cells.every((c, i) => c === before[i]); attempt++) cells = surpriseTile(game.size, rng);
  if (cells.every((c, i) => c === before[i])) cells = cells.map((c, i) => (i === 0 ? nextColor(c) : c));
  return withTile(game, cells, before);
}

/** Bring back the tile that Start again or Surprise me replaced. */
export function putBack(game: PatternGame): PatternGame {
  return game.undo ? withTile(game, game.undo, null) : game;
}

/**
 * The tile repeated `across` times by `down` times, row by row, as one grid of
 * squares (`size * across` wide). Used by "your pattern" and by the paper sheet.
 */
export function repeatTile(cells: Cells, size: TileSize, across: number = REPEATS, down: number = REPEATS): PatternColor[] {
  const width = size * across;
  const out: PatternColor[] = [];
  for (let y = 0; y < size * down; y++) {
    for (let x = 0; x < width; x++) out.push(cells[(y % size) * size + (x % size)] as PatternColor);
  }
  return out;
}
