import { describe, expect, it } from 'vitest';
import { COLORING_PAGES } from './coloring';
import {
  DEFAULT_WALL_PICTURE,
  DEFAULT_WALL_SIZE,
  PAGE_MAX_MM,
  WALL_GRIDS,
  WALL_PICTURE_IDS,
  WALL_SIZES,
  WALL_VIEW,
  pageMm,
  sectionLabel,
  wallEdges,
  wallPicture,
  wallSections,
} from './coloring-wall';

describe('group coloring wall: sizes and pictures', () => {
  it('offers 4, 6 and 9 pages, as 2 by 2, 3 across and 2 down, and 3 by 3', () => {
    expect(WALL_SIZES).toEqual(['2x2', '3x2', '3x3']);
    expect(WALL_SIZES.map((s) => wallSections(s).length)).toEqual([4, 6, 9]);
    expect(WALL_GRIDS['3x2']).toEqual({ columns: 3, rows: 2 });
  });

  it('offers every Coloring picture and defaults to one of them', () => {
    expect(WALL_PICTURE_IDS).toEqual(COLORING_PAGES.map((p) => p.id));
    expect(WALL_PICTURE_IDS).toHaveLength(5);
    expect(WALL_PICTURE_IDS).toContain(DEFAULT_WALL_PICTURE);
    expect(WALL_SIZES).toContain(DEFAULT_WALL_SIZE);
    for (const id of WALL_PICTURE_IDS) expect(wallPicture(id)?.regions.length, id).toBeGreaterThan(0);
    expect(wallPicture('no-such-picture')).toBeUndefined();
  });
});

describe('group coloring wall: sections tile the picture', () => {
  it('has one edge at each side of the picture, and the edges step evenly between them', () => {
    expect(wallEdges(3)[0]).toBe(0);
    expect(wallEdges(3).at(-1)).toBe(WALL_VIEW);
    expect(wallEdges(3)).toHaveLength(4);
    expect(wallEdges(2)[1]).toBe(200);
  });

  for (const size of WALL_SIZES) {
    it(`${size}: the sections meet edge to edge with no gap and no overlap`, () => {
      const { columns, rows } = WALL_GRIDS[size];
      const sections = wallSections(size);
      const at = (row: number, column: number) => sections.find((s) => s.row === row && s.column === column)!;
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const s = at(row, column);
          expect(s.x1 > s.x0 && s.y1 > s.y0).toBe(true);
          if (column + 1 < columns) expect(s.x1, `${s.label} right`).toBe(at(row, column + 1).x0);
          if (row + 1 < rows) expect(s.y1, `${s.label} bottom`).toBe(at(row + 1, column).y0);
        }
      }
      expect(at(0, 0).x0).toBe(0);
      expect(at(0, 0).y0).toBe(0);
      expect(at(0, columns - 1).x1).toBe(WALL_VIEW);
      expect(at(rows - 1, 0).y1).toBe(WALL_VIEW);
      const area = sections.reduce((sum, s) => sum + (s.x1 - s.x0) * (s.y1 - s.y0), 0);
      expect(area).toBeCloseTo(WALL_VIEW * WALL_VIEW, 6);
    });
  }

  it('labels the pages with a row letter and a column number, top left first, with no repeats', () => {
    expect(sectionLabel(0, 0)).toBe('A1');
    expect(sectionLabel(1, 2)).toBe('B3');
    expect(wallSections('3x2').map((s) => s.label)).toEqual(['A1', 'A2', 'A3', 'B1', 'B2', 'B3']);
    for (const size of WALL_SIZES) {
      const labels = wallSections(size).map((s) => s.label);
      expect(new Set(labels).size, size).toBe(labels.length);
      for (const label of labels) expect(label).toMatch(/^[A-C][1-3]$/);
    }
  });
});

describe('group coloring wall: paper size', () => {
  it('scales every page inside the largest allowed box, and the 2 by 2 page is 170 mm square', () => {
    for (const size of WALL_SIZES) {
      const page = pageMm(size);
      expect(page.width, size).toBeLessThanOrEqual(PAGE_MAX_MM.width + 1e-9);
      expect(page.height, size).toBeLessThanOrEqual(PAGE_MAX_MM.height + 1e-9);
    }
    expect(pageMm('2x2').width).toBeCloseTo(170, 6);
    expect(pageMm('2x2').height).toBeCloseTo(170, 6);
  });

  it('fits both A4 and US Letter with room for the footer', () => {
    // A4 is 210 by 297 mm and Letter is 216 by 279 mm; the browser's default margins leave at least 190 by 259 mm.
    expect(PAGE_MAX_MM.width).toBeLessThanOrEqual(190);
    expect(PAGE_MAX_MM.height).toBeLessThanOrEqual(259 - 30);
  });

  it('keeps one scale across a wall, so neighbouring pages line up', () => {
    for (const size of WALL_SIZES) {
      const sections = wallSections(size);
      const { scale } = pageMm(size);
      for (const s of sections) {
        expect((s.x1 - s.x0) * scale, `${s.label} width`).toBeCloseTo((sections[0]!.x1 - sections[0]!.x0) * scale, 6);
        expect((s.y1 - s.y0) * scale, `${s.label} height`).toBeCloseTo((sections[0]!.y1 - sections[0]!.y0) * scale, 6);
      }
    }
  });
});
