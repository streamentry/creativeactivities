import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { GAMES } from './games';
import { GAME_PRINT, RULES_KEY, hasPaperVersion, rulesText } from './game-print';
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
  'story-dice': 'StoryDice',
  'sort-together': 'SortTogether',
  'picture-puzzle': 'PicturePuzzle',
  'finish-the-saying': 'FinishTheSaying',
  'word-search': 'WordSearch',
  coloring: 'Coloring',
  'conversation-cards': 'ConversationCards',
  'photo-pairs': 'PhotoPairs',
  'picture-bingo': 'PictureBingo',
  'calm-breathing': 'CalmBreathing',
};

describe('printable partner on each game page (WEB-052)', () => {
  it('covers all 15 games: each has a paper version or a non-empty reason', () => {
    expect(GAMES).toHaveLength(15);
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
    const dice = printSheet('story-dice');
    if (dice?.layout !== 'rows') throw new Error('dice sheet');
    expect(dice.dice).toBe(true);
    expect(dice.rows).toHaveLength(4);
    for (const row of dice.rows) expect(new Set(row.choices).size).toBe(4);
    expect(new Set(dice.rows.flatMap((r) => r.choices)).size).toBe(16);
    const sort = printSheet('sort-together');
    if (sort?.layout !== 'sort') throw new Error('sort sheet');
    expect(sort.pictures).toHaveLength(8);
    expect(playProps('en').content.sorting.themes[sort.theme]?.baskets).toHaveLength(2);
  });
});
