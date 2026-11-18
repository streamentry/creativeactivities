import { describe, expect, it } from 'vitest';
import { GAMES } from '../data/games';
import english from './games/en.json';
import { BUILD_TOGETHER_REVIEWED, COLLAGE_BOARD_REVIEWED, COLORING_WALL_REVIEWED, COLOR_BY_NUMBER_REVIEWED, COLOR_MATCH_REVIEWED, COLOR_WASH_REVIEWED, DECORATE_A_CARD_REVIEWED, DRAWING_DUET_REVIEWED, FIND_TOGETHER_REVIEWED, FOUR_TOGETHER_REVIEWED, GARDEN_PLANNER_REVIEWED, HALVES_MATCH_REVIEWED, ODD_ONE_OUT_REVIEWED, PATTERN_MAKER_REVIEWED, QUIET_SHAPES_REVIEWED, SCRAPBOOK_REVIEWED, SEASONAL_PACK_REVIEWED, SEATED_TOSS_REVIEWED, STORY_CHAIN_REVIEWED, STORY_DICE_REVIEWED, gameAvailable } from './games';
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

  it('offers Scrapbook in English only until its words are reviewed', () => {
    expect(SCRAPBOOK_REVIEWED).toEqual(['en']);
    for (const { code } of LOCALES) expect(gameAvailable('scrapbook', code), code).toBe(code === 'en');
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

  it('offers Find together in English only until its words are reviewed', () => {
    expect(FIND_TOGETHER_REVIEWED).toEqual(['en']);
    for (const { code } of LOCALES) expect(gameAvailable('find-together', code), code).toBe(code === 'en');
  });

  it('offers Color wash in English only until its words are reviewed', () => {
    expect(COLOR_WASH_REVIEWED).toEqual(['en']);
    for (const { code } of LOCALES) expect(gameAvailable('color-wash', code), code).toBe(code === 'en');
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

  it('offers Decorate a card together in English only for now', () => {
    expect(DECORATE_A_CARD_REVIEWED).toEqual(['en']);
    for (const { code } of LOCALES) expect(gameAvailable('decorate-a-card', code), code).toBe(code === 'en');
  });

  it('offers Seasonal puzzle pack in English only for now', () => {
    expect(SEASONAL_PACK_REVIEWED).toEqual(['en']);
    for (const { code } of LOCALES) expect(gameAvailable('seasonal-pack', code), code).toBe(code === 'en');
  });

  it('offers Collage board in English only until its words are reviewed', () => {
    expect(COLLAGE_BOARD_REVIEWED).toEqual(['en']);
    for (const { code } of LOCALES) expect(gameAvailable('collage-board', code), code).toBe(code === 'en');
  });

  it('offers Garden planner in English only until its words are reviewed', () => {
    expect(GARDEN_PLANNER_REVIEWED).toEqual(['en']);
    for (const { code } of LOCALES) expect(gameAvailable('garden-planner', code), code).toBe(code === 'en');
  });

  it('offers Group coloring wall in English only until its words are reviewed', () => {
    expect(COLORING_WALL_REVIEWED).toEqual(['en']);
    for (const { code } of LOCALES) expect(gameAvailable('coloring-wall', code), code).toBe(code === 'en');
  });

  it('offers Quiet shapes puzzle in English only until its words are reviewed', () => {
    expect(QUIET_SHAPES_REVIEWED).toEqual(['en']);
    for (const { code } of LOCALES) expect(gameAvailable('quiet-shapes', code), code).toBe(code === 'en');
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
