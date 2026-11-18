import { COLORING_PAGES, type ColoringPage } from './coloring';

/**
 * Group coloring wall (GAME-052): one picture from the Coloring game, printed across several pages so that many
 * people can color one large picture. This file holds the shape of the wall: the page grid, the section boxes that
 * tile the picture exactly, and the paper scale. The words (labels, steps, names) live in `ui.coloringWall` and
 * `content.coloring`, so the paper and the screen read the same.
 */

/** The three wall sizes: 2 by 2, 3 across and 2 down, and 3 by 3. Each is a number of printed pages. */
export const WALL_SIZES = ['2x2', '3x2', '3x3'] as const;
export type WallSize = (typeof WALL_SIZES)[number];

/** The size the page shows until a person chooses another one. */
export const DEFAULT_WALL_SIZE: WallSize = '3x2';

/** The pictures the wall can use: every Coloring picture, in the Coloring game's order. */
export const WALL_PICTURE_IDS: readonly string[] = COLORING_PAGES.map((p) => p.id);

/** The picture the page shows until a person chooses another one. */
export const DEFAULT_WALL_PICTURE = 'flower';

export interface WallGrid {
  /** Pages across the wall. */
  columns: number;
  /** Pages down the wall. */
  rows: number;
}

export const WALL_GRIDS: Readonly<Record<WallSize, WallGrid>> = {
  '2x2': { columns: 2, rows: 2 },
  '3x2': { columns: 3, rows: 2 },
  '3x3': { columns: 3, rows: 3 },
};

/** The Coloring pictures are drawn on a square this many units on each side. */
export const WALL_VIEW = 400;

/**
 * The largest printed page, in mm. Every section is scaled to fit this box, so each page fits A4 (210 by 297 mm)
 * and US Letter (216 by 279 mm) with the browser's default margins, and the print footer still fits under it.
 */
export const PAGE_MAX_MM = { width: 170, height: 220 } as const;

export interface WallSection {
  /** Row letter then column number, such as A1 (top left) or B3. */
  label: string;
  row: number;
  column: number;
  /** The section's box in picture units. Neighbouring boxes share an edge value exactly. */
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** The edges of `count` equal parts of the picture. Each edge is computed once, so neighbours meet exactly. */
export function wallEdges(count: number): number[] {
  return Array.from({ length: count + 1 }, (_, i) => (i === count ? WALL_VIEW : (WALL_VIEW * i) / count));
}

/** Row letters run down the wall (A, B, C) and column numbers run across it (1, 2, 3). */
export function sectionLabel(row: number, column: number): string {
  return `${String.fromCharCode(65 + row)}${column + 1}`;
}

/** Every section of the wall, row by row from the top left. */
export function wallSections(size: WallSize): WallSection[] {
  const { columns, rows } = WALL_GRIDS[size];
  const xs = wallEdges(columns);
  const ys = wallEdges(rows);
  const sections: WallSection[] = [];
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      sections.push({
        label: sectionLabel(row, column),
        row,
        column,
        x0: xs[column]!,
        x1: xs[column + 1]!,
        y0: ys[row]!,
        y1: ys[row + 1]!,
      });
    }
  }
  return sections;
}

/**
 * The printed size of one section, in mm. Every section of a wall has the same scale, so the pages join up; the
 * scale is the largest one that keeps a section inside PAGE_MAX_MM. `scale` converts picture units to mm.
 */
export function pageMm(size: WallSize): { width: number; height: number; scale: number } {
  const first = wallSections(size)[0]!;
  const unitsWide = first.x1 - first.x0;
  const unitsHigh = first.y1 - first.y0;
  const scale = Math.min(PAGE_MAX_MM.width / unitsWide, PAGE_MAX_MM.height / unitsHigh);
  return { width: unitsWide * scale, height: unitsHigh * scale, scale };
}

/** The Coloring picture with this id, with its regions and detail lines. */
export function wallPicture(id: string): ColoringPage | undefined {
  return COLORING_PAGES.find((p) => p.id === id);
}
