import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { GAMES } from './games';
import { GAME_PRINT, RULES_KEY, hasPaperVersion, rulesText } from './game-print';
import { colorOfPicture } from './color-match';
import { PICTURE_BY_ID } from './pictures';
import { playProps } from '../i18n/play';
import { ui } from '../i18n/ui';
import { printSheet, sheetPictures } from '../lib/games/print-sheet';

const COMPONENT: Record<string, string> = {
  'picture-pairs': 'PicturePairs',
  'find-the-same': 'FindTheSame',
  'shadow-match': 'ShadowMatch',
  'four-together': 'FourTogether',
  'odd-one-out': 'OddOneOut',
  'color-match': 'ColorMatch',
  'halves-match': 'HalvesMatch',
  'color-by-number': 'ColorByNumber',
  'pattern-maker': 'PatternMaker',
  'build-together': 'BuildTogether',
  'find-together': 'FindTogether',
  'drawing-duet': 'DrawingDuet',
  'color-wash': 'ColorWash',
  'seated-toss': 'SeatedToss',
  'decorate-a-card': 'DecorateACard',
  'seasonal-pack': 'SeasonalPack',
  'story-chain': 'StoryChain',
  'story-dice': 'StoryDice',
  'word-and-picture-pairs': 'WordAndPicturePairs',
  'sort-together': 'SortTogether',
  'picture-puzzle': 'PicturePuzzle',
  'finish-the-saying': 'FinishTheSaying',
  'word-search': 'WordSearch',
  coloring: 'Coloring',
  'conversation-cards': 'ConversationCards',
  'photo-pairs': 'PhotoPairs',
  'picture-bingo': 'PictureBingo',
  'calm-breathing': 'CalmBreathing',
  'quiet-shapes': 'QuietShapes',
  'collage-board': 'CollageBoard',
  'garden-planner': 'GardenPlanner',
  'coloring-wall': 'ColoringWall',
  scrapbook: 'Scrapbook',
  'picnic-planner': 'PicnicPlanner',
  'quiet-scene': 'QuietScene',
};

describe('printable partner on each game page (WEB-052)', () => {
  it('covers all 35 games: each has a paper version or a non-empty reason', () => {
    expect(GAMES).toHaveLength(35);
    const reasons = ui('en').gamePage.print.reasons as Record<string, string>;
    for (const g of GAMES) {
      const entry = GAME_PRINT[g.slug];
      expect(entry, g.slug).toBeDefined();
      if (entry.kind === 'none') {
        expect(reasons[entry.reason]?.trim().length ?? 0, g.slug).toBeGreaterThan(40);
      } else {
        expect(entry.version, g.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
    expect(Object.keys(GAME_PRINT).sort()).toEqual(GAMES.map((g) => g.slug).sort());
  });

  it('keeps the "Printable" tag in games.ts in step with the audit', () => {
    for (const g of GAMES) expect(g.printable, g.slug).toBe(hasPaperVersion(g.slug));
  });

  it('prints the same rules string the game shows as its guidance', () => {
    const en = playProps('en').ui;
    for (const g of GAMES) {
      const [section, key] = RULES_KEY[g.slug];
      const source = readFileSync(new URL(`../games/${COMPONENT[g.slug]}.tsx`, import.meta.url), 'utf8');
      // The game reads this exact key for the guidance line it passes to GameFrame.
      expect(source, g.slug).toContain(`ui.${String(section)}.${key}`);
      const guidance = (en[section] as unknown as Record<string, string>)[key];
      const expected = g.slug === 'four-together' ? guidance.replace('{n}', '3') : guidance;
      expect(rulesText(g.slug, en), g.slug).toBe(expected);
    }
    expect(rulesText('four-together', en)).toBe('Find the 3 pictures that go together, and tap each one.');
  });

  it('uses the translated guidance on a translated page, never a separate print string', () => {
    const es = playProps('es', 'shadow-match').ui;
    expect(rulesText('shadow-match', es, 'es')).toBe(es.shadowMatch.guidance);
  });

  it('renders a fixed sheet for every page-kind game, and only those', () => {
    for (const g of GAMES) {
      const sheet = printSheet(g.slug);
      expect(sheet !== null, g.slug).toBe(GAME_PRINT[g.slug].kind === 'page');
      if (!sheet) continue;
      expect(printSheet(g.slug), `${g.slug} is the same every build`).toEqual(sheet);
      for (const id of sheetPictures(sheet)) expect(PICTURE_BY_ID.has(id), `${g.slug}: ${id}`).toBe(true);
    }
  });

  it('builds sheets that follow the game rules', () => {
    const pairs = printSheet('picture-pairs');
    if (pairs?.layout !== 'cards') throw new Error('pairs sheet');
    expect(pairs.pictures).toHaveLength(12);
    expect(new Set(pairs.pictures).size).toBe(6);

    for (const slug of ['find-the-same', 'shadow-match']) {
      const sheet = printSheet(slug);
      if (sheet?.layout !== 'rows') throw new Error(slug);
      for (const row of sheet.rows) {
        expect(row.choices).toHaveLength(3);
        expect(row.choices).toContain(row.target);
      }
    }
    for (const slug of ['four-together', 'odd-one-out']) {
      const sheet = printSheet(slug);
      if (sheet?.layout !== 'rows') throw new Error(slug);
      expect(sheet.rows).toHaveLength(4);
      for (const row of sheet.rows) expect(new Set(row.choices).size).toBe(4);
    }
    const colors = printSheet('color-match');
    if (colors?.layout !== 'rows') throw new Error('color sheet');
    expect(colors.rows).toHaveLength(4);
    expect(new Set(colors.rows.map((r) => r.color)).size).toBe(4);
    for (const row of colors.rows) {
      expect(new Set(row.choices).size).toBe(4);
      expect(row.choices.filter((id) => colorOfPicture(id) === row.color)).toHaveLength(2);
    }
    expect(new Set(colors.rows.flatMap((r) => r.choices)).size).toBe(16);
    expect(rulesText('color-match', playProps('en').ui)).toBe('Look at the color and its name, then tap every picture that is that color.');
    const halves = printSheet('halves-match');
    if (halves?.layout !== 'halves') throw new Error('halves sheet');
    expect(halves.pictures).toHaveLength(3);
    expect(new Set(halves.pictures.map((id) => PICTURE_BY_ID.get(id)?.category)).size).toBe(3);
    expect([...halves.rightOrder].sort()).toEqual([...halves.pictures].sort());
    halves.rightOrder.forEach((id, row) => expect(id).not.toBe(halves.pictures[row]));
    expect(rulesText('halves-match', playProps('en').ui)).toBe('Tap a half on the left, then tap the half on the right that fits it.');
    const grid = printSheet('color-by-number');
    if (grid?.layout !== 'grid') throw new Error('grid sheet');
    expect(grid.size).toBe(6);
    expect(grid.rows).toHaveLength(6);
    for (const row of grid.rows) expect(row).toHaveLength(6);
    expect(new Set(grid.rows.flat())).toEqual(new Set([1, 2, 3]));
    expect(sheetPictures(grid)).toEqual([]);
    expect(rulesText('color-by-number', playProps('en').ui)).toBe('Choose a color from the key, then fill a square with it. Any color is fine.');
    const chain = printSheet('story-chain');
    if (chain?.layout !== 'chain') throw new Error('chain sheet');
    expect(chain.pictures).toHaveLength(8);
    expect(new Set(chain.pictures).size).toBe(8);
    expect(rulesText('story-chain', playProps('en').ui)).toBe('Take turns: one sentence each, add the next picture.');
    const dice = printSheet('story-dice');
    if (dice?.layout !== 'rows') throw new Error('dice sheet');
    expect(dice.dice).toBe(true);
    expect(dice.rows).toHaveLength(4);
    for (const row of dice.rows) expect(new Set(row.choices).size).toBe(4);
    expect(new Set(dice.rows.flatMap((r) => r.choices)).size).toBe(16);
    const words = printSheet('word-and-picture-pairs');
    if (words?.layout !== 'words') throw new Error('words sheet');
    expect(words.pictures).toHaveLength(6);
    expect(new Set(words.pictures).size).toBe(6);
    expect([...words.words].sort()).toEqual([...words.pictures].sort());
    expect(words.words).not.toEqual(words.pictures);
    expect(sheetPictures(words)).toEqual(words.pictures);
    expect(rulesText('word-and-picture-pairs', playProps('en').ui)).toBe('Tap a picture, then the word that names it. Or tap a word, then its picture.');
    const toss = printSheet('seated-toss');
    if (toss?.layout !== 'toss') throw new Error('toss sheet');
    expect(toss.rings).toEqual(['near', 'middle', 'far']);
    expect(toss.boxes).toBeGreaterThanOrEqual(6);
    expect(sheetPictures(toss)).toEqual([]);
    expect(rulesText('seated-toss', playProps('en').ui)).toBe('Sit at a table and take turns tossing a soft bean bag into the big target. Keep the tally on paper, together.');
    const card = printSheet('decorate-a-card');
    if (card?.layout !== 'card') throw new Error('card sheet');
    expect(card.occasions).toEqual(['birthday', 'thank-you', 'thinking-of-you', 'new-season', 'just-because']);
    expect(card.defaultOccasion).toBe('birthday');
    expect(sheetPictures(card)).toEqual([]);
    expect(rulesText('decorate-a-card', playProps('en').ui)).toBe('Choose an occasion, then decorate a card together with crayons or pens. There is no right card.');
    const sort = printSheet('sort-together');
    if (sort?.layout !== 'sort') throw new Error('sort sheet');
    expect(sort.pictures).toHaveLength(8);
    expect(playProps('en').content.sorting.themes[sort.theme]?.baskets).toHaveLength(2);
  });
});
