import { describe, expect, it } from 'vitest';
import { retiredTarget } from './retired-redirects';

const has = (pairs: string[]) => (lang: string, id: string) => pairs.includes(`${lang}:${id}`);

describe('where an old translated dementia guide now sends its reader', () => {
  it('goes to the replacement guide in the same language when it is translated', () => {
    expect(retiredTarget('es', 'activities/coloring', has(['es:crafts/coloring-pages-for-adults']))).toBe('/es/crafts/coloring-pages-for-adults/');
  });

  it('goes to the English replacement when the language has no translation of it', () => {
    expect(retiredTarget('za', 'activities/coloring', has([]))).toBe('/crafts/coloring-pages-for-adults/');
  });

  it('keeps the language for games, which exist in every language', () => {
    expect(retiredTarget('ja', 'activities/picture-bingo', has([]))).toBe('/ja/games/picture-bingo/');
    expect(retiredTarget('ja', 'activities/online-games', has([]))).toBe('/ja/games/');
  });

  it('sends brain-health guides to the English dementia hub, which has no translations', () => {
    expect(retiredTarget('de', 'brain-health/diet', has([]))).toBe('/dementia-activities/');
  });

  it('uses the full locale prefix for a regional language', () => {
    expect(retiredTarget('pt-BR', 'activities/coloring', has(['pt-BR:crafts/coloring-pages-for-adults']))).toMatch(/^\/[a-z-]+\/crafts\/coloring-pages-for-adults\/$/i);
  });

  it('refuses an id that is not retired', () => {
    expect(() => retiredTarget('es', 'crafts/paper-crafts', has([]))).toThrow();
  });
});
