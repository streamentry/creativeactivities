import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { GAMES, type GameInfo } from '../../data/games';
import { NOINDEX_PAGES } from '../noindex-pages';
import { FILTER_CANONICAL, GAME_FILTERS, filterPath, gameMatchesFilter, gamesForFilter } from './filters';

const game = (over: Partial<GameInfo>): GameInfo => ({ ...GAMES[0], ...over });

describe('games filter logic (WEB-051)', () => {
  const solo = game({ slug: 'quiet-shapes', playModes: ['solo'], printable: true });
  const together = game({ slug: 'picture-pairs', playModes: ['together', 'group'], printable: false });
  const unknown = game({ slug: 'calm-breathing', playModes: undefined, printable: false });

  it('matches a play mode only when the game lists it', () => {
    expect(gameMatchesFilter(solo, 'solo')).toBe(true);
    expect(gameMatchesFilter(solo, 'together')).toBe(false);
    expect(gameMatchesFilter(together, 'group')).toBe(true);
    expect(gameMatchesFilter(together, 'solo')).toBe(false);
  });

  it('never puts a game with no recorded play mode in a play-mode filter', () => {
    for (const f of ['solo', 'together', 'group'] as const) expect(gameMatchesFilter(unknown, f)).toBe(false);
  });

  it('matches printable from the printable flag', () => {
    expect(gameMatchesFilter(solo, 'printable')).toBe(true);
    expect(gameMatchesFilter(together, 'printable')).toBe(false);
  });

  it('keeps the given order', () => {
    expect(gamesForFilter([together, solo], 'printable').map((g) => g.slug)).toEqual(['quiet-shapes']);
    expect(gamesForFilter([solo, together], 'together').map((g) => g.slug)).toEqual(['picture-pairs']);
  });

  it('gives every filter at least one game in the real catalog', () => {
    for (const f of GAME_FILTERS) expect(gamesForFilter(GAMES, f.id).length, f.id).toBeGreaterThan(0);
  });

  it('shows printable games exactly as the catalog flags them', () => {
    expect(gamesForFilter(GAMES, 'printable').length).toBe(GAMES.filter((g) => g.printable).length);
  });
});

describe('games filter pages (WEB-051)', () => {
  const pages = GAME_FILTERS.map((f) => f.id);

  it('has one static page per filter, each naming its filter', () => {
    for (const id of pages) {
      const file = new URL(`../../pages/games/${id}.astro`, import.meta.url);
      expect(existsSync(file), id).toBe(true);
      expect(readFileSync(file, 'utf8'), id).toContain(`filter="${id}"`);
    }
  });

  it('keeps every filter page out of the sitemap and marks it noindex by address', () => {
    for (const id of pages) expect(NOINDEX_PAGES.has(filterPath(id)), id).toBe(true);
  });

  it('canonicalizes every filter page to the full index', () => {
    expect(FILTER_CANONICAL).toBe('/games/');
    expect(pages.map(filterPath)).toEqual(['/games/solo/', '/games/together/', '/games/group/', '/games/printable/']);
  });

  it('renders the filter view with noindex and the canonical path', () => {
    const view = readFileSync(new URL('../../views/GamesFilterView.astro', import.meta.url), 'utf8');
    expect(view).toMatch(/\bnoindex\b/);
    expect(view).toContain('canonicalPath={FILTER_CANONICAL}');
  });
});
