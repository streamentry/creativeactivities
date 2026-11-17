import { describe, expect, it } from 'vitest';
import { GAME_PRINT } from '../data/game-print';
import { GAME_SHEET_PAGES, STEP_PT, gamesWithPaper } from '../../scripts/check-print.mjs';

describe('the print check knows every template with a paper version (PLAT-039, MET-020)', () => {
  it('finds the games that have a paper version exactly as the data declares them', () => {
    const declared = Object.entries(GAME_PRINT)
      .filter(([, print]) => print.kind !== 'none')
      .map(([slug, print]) => ({ slug, kind: print.kind }))
      .sort((a, b) => a.slug.localeCompare(b.slug));
    const found = [...gamesWithPaper()].sort((a: { slug: string }, b: { slug: string }) => a.slug.localeCompare(b.slug));
    expect(found).toEqual(declared);
    expect(found.length).toBeGreaterThanOrEqual(11);
  });

  it('declares pages only for games that have a paper version of their own, so the table never goes stale', () => {
    const islands = new Set(gamesWithPaper().filter((g: { kind: string }) => g.kind === 'island').map((g: { slug: string }) => g.slug));
    for (const slug of Object.keys(GAME_SHEET_PAGES)) expect(islands.has(slug), slug).toBe(true);
  });

  it('asks the type sizes the specs propose: 12 pt for a card and a pack, 18 pt for large print', () => {
    expect(STEP_PT).toEqual({ card: 12, pack: 12, largePrint: 18 });
  });
});
