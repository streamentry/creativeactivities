import { describe, expect, it } from 'vitest';
import { GAMES } from '../data/games';
import english from './games/en.json';
import { BUILD_TOGETHER_REVIEWED, COLOR_BY_NUMBER_REVIEWED, COLOR_MATCH_REVIEWED, DRAWING_DUET_REVIEWED, FOUR_TOGETHER_REVIEWED, HALVES_MATCH_REVIEWED, ODD_ONE_OUT_REVIEWED, PATTERN_MAKER_REVIEWED, SEATED_TOSS_REVIEWED, STORY_CHAIN_REVIEWED, STORY_DICE_REVIEWED, gameAvailable } from './games';
import { LOCALES } from './locales';
import { NO_LETTER_GRID, NO_SAYINGS_GAME } from './play';

describe('which games a language offers', () => {
  it('offers every game in English and in a fully translated language', () => {
    for (const g of GAMES.filter((x) => x.slug !== 'word-search')) expect(gameAvailable(g.slug, 'en'), g.slug).toBe(true);
    expect(gameAvailable('word-search', 'en')).toBe(true);
    expect(gameAvailable('finish-the-saying', 'es')).toBe(true);
  });

  it('leaves Finish the saying out of the languages listed in NO_SAYINGS_GAME, and only that game', () => {
    for (const code of NO_SAYINGS_GAME) {
      expect(gameAvailable('finish-the-saying', code), code).toBe(false);
      expect(gameAvailable('picture-pairs', code), code).toBe(true);
    }
  });

  it('still leaves the word search out where a letter grid does not suit the script', () => {
    for (const code of NO_LETTER_GRID) expect(gameAvailable('word-search', code), code).toBe(false);
  });

  it('offers Four together only where its group names were reviewed, English for now', () => {
    expect(FOUR_TOGETHER_REVIEWED).toEqual(['en']);
    for (const { code } of LOCALES) expect(gameAvailable('four-together', code), code).toBe(code === 'en');
  });

  it('offers Odd one out only where its categories were reviewed, English for now', () => {
    expect(ODD_ONE_OUT_REVIEWED).toEqual(['en']);
    for (const { code } of LOCALES) expect(gameAvailable('odd-one-out', code), code).toBe(code === 'en');
  });

  it('offers Color match in English only until its color names are reviewed', () => {
    expect(COLOR_MATCH_REVIEWED).toEqual(['en']);
    for (const { code } of LOCALES) expect(gameAvailable('color-match', code), code).toBe(code === 'en');
  });

  it('offers Halves match in English only until its words are reviewed', () => {
    expect(HALVES_MATCH_REVIEWED).toEqual(['en']);
    for (const { code } of LOCALES) expect(gameAvailable('halves-match', code), code).toBe(code === 'en');
  });

  it('offers Color by number in English only until its words are reviewed', () => {
    expect(COLOR_BY_NUMBER_REVIEWED).toEqual(['en']);
    for (const { code } of LOCALES) expect(gameAvailable('color-by-number', code), code).toBe(code === 'en');
  });

  it('offers Pattern maker in English only until its words are reviewed', () => {
    expect(PATTERN_MAKER_REVIEWED).toEqual(['en']);
    for (const { code } of LOCALES) expect(gameAvailable('pattern-maker', code), code).toBe(code === 'en');
  });

  it('offers Build together in English only until its words are reviewed', () => {
    expect(BUILD_TOGETHER_REVIEWED).toEqual(['en']);
    for (const { code } of LOCALES) expect(gameAvailable('build-together', code), code).toBe(code === 'en');
  });

  it('offers Drawing duet in English only until its words are reviewed', () => {
    expect(DRAWING_DUET_REVIEWED).toEqual(['en']);
    for (const { code } of LOCALES) expect(gameAvailable('drawing-duet', code), code).toBe(code === 'en');
  });

  it('offers Story chain in English only until its words are reviewed', () => {
    expect(STORY_CHAIN_REVIEWED).toEqual(['en']);
    for (const { code } of LOCALES) expect(gameAvailable('story-chain', code), code).toBe(code === 'en');
  });

  it('offers Seated toss tally in English only for now', () => {
    expect(SEATED_TOSS_REVIEWED).toEqual(['en']);
    for (const { code } of LOCALES) expect(gameAvailable('seated-toss', code), code).toBe(code === 'en');
  });

  it('offers Story dice in English only for now', () => {
    expect(STORY_DICE_REVIEWED).toEqual(['en']);
    for (const { code } of LOCALES) expect(gameAvailable('story-dice', code), code).toBe(code === 'en');
  });

  it('leaves the word search out when a translation lacks enough usable words', () => {
    for (const code of ['pi', 'sa']) expect(gameAvailable('word-search', code), code).toBe(false);
  });
});

describe('game translation source', () => {
  it('matches the English game copy in data/games.ts', () => {
    for (const g of GAMES) {
      const text = (english as Record<string, Record<string, unknown>>)[g.slug];
      expect(text, g.slug).toBeDefined();
      for (const key of ['name', 'seoTitle', 'h1', 'description', 'short', 'players', 'intro', 'howTo', 'tips', 'faq'] as const) {
        expect(text?.[key], `${g.slug}.${key}`).toEqual(g[key]);
      }
    }
  });
});
