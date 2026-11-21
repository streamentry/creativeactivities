import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { GAMES } from '../../data/games';
import { keepsPlace } from './place';

/**
 * WEB-054: every game that keeps its place passes a `place` to GameFrame with
 * its own slug, and the photo games pass none. Reads the game sources, as the
 * other game tests do, so a game added without a place fails here.
 */
const GAME_DIR = fileURLToPath(new URL('..', import.meta.url));
const sources = readdirSync(GAME_DIR)
  .filter((f) => f.endsWith('.tsx'))
  .map((f) => readFileSync(join(GAME_DIR, f), 'utf8'));

const PLACE_SLUGS = [...sources.join('\n').matchAll(/place=\{\{\s*slug: '([a-z-]+)'/g)].map((m) => m[1] as string);

describe('every game keeps its place (WEB-054)', () => {
  it('passes a place for each game that keeps one', () => {
    const kept = GAMES.map((g) => g.slug).filter((slug) => keepsPlace(slug));
    expect(kept.length).toBeGreaterThan(20);
    const missing = kept.filter((slug) => !PLACE_SLUGS.includes(slug));
    expect(missing).toEqual([]);
  });

  it('passes a place only for games that keep one, so the photo games never save', () => {
    const offenders = PLACE_SLUGS.filter((slug) => !keepsPlace(slug));
    expect(offenders).toEqual([]);
  });

  it('gives each game one place, under its own slug', () => {
    const dupes = PLACE_SLUGS.filter((slug, i) => PLACE_SLUGS.indexOf(slug) !== i);
    expect(dupes).toEqual([]);
  });
});
