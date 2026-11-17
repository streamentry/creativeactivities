import { describe, expect, it } from 'vitest';
import { HALVES_PICTURES } from './halves-match';
import { PICTURE_BY_ID, PICTURES } from './pictures';

describe('Halves match picture set (GAME-021)', () => {
  it('is about twenty pictures, each listed once', () => {
    expect(HALVES_PICTURES.length).toBeGreaterThanOrEqual(18);
    expect(HALVES_PICTURES.length).toBeLessThanOrEqual(24);
    expect(new Set(HALVES_PICTURES).size).toBe(HALVES_PICTURES.length);
  });

  it('uses only pictures of the shared library, which are square 120 x 120 drawings', () => {
    const library = new Set(PICTURES.map((p) => p.id));
    for (const id of HALVES_PICTURES) {
      expect(library.has(id), `${id} is a library picture`).toBe(true);
      expect(PICTURE_BY_ID.get(id)?.body.length, `${id} has a drawing`).toBeGreaterThan(100);
    }
  });

  it('has at least two pictures in each of at least five categories, so three different categories are always open', () => {
    const counts = new Map<string, number>();
    for (const id of HALVES_PICTURES) {
      const category = PICTURE_BY_ID.get(id)?.category as string;
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
    expect([...counts.values()].filter((n) => n >= 2).length).toBeGreaterThanOrEqual(5);
  });

  it('leaves out the pictures whose two halves look alike or are mostly empty', () => {
    for (const id of ['sun', 'moon', 'rainbow', 'kite', 'bread', 'banana', 'snail']) expect(HALVES_PICTURES).not.toContain(id);
  });
});
