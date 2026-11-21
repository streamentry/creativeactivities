import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { GAMES, SPEC_TAG_GAPS, type GameSlug, type PlayMode } from './games';

/*
 * WEB-051 tags. The values come from the 05-games.md table; these tests keep them in step with it.
 * The table is the source, so a change there must come here too.
 */

const TABLE = readFileSync(new URL('../../../docs/specs/global/05-games.md', import.meta.url), 'utf8');

// Which GAME- row each game is. Mapped by name; see games.ts for the rules used.
const SPEC_ID: Record<GameSlug, string> = {
  'picture-pairs': 'GAME-001',
  'find-the-same': 'GAME-002',
  'shadow-match': 'GAME-003',
  'four-together': 'GAME-022',
  'odd-one-out': 'GAME-018',
  'color-match': 'GAME-020',
  'halves-match': 'GAME-021',
  'color-by-number': 'GAME-031',
  'pattern-maker': 'GAME-034',
  'build-together': 'GAME-048',
  'drawing-duet': 'GAME-032',
  'seated-toss': 'GAME-049',
  'decorate-a-card': 'GAME-035',
  'seasonal-pack': 'GAME-040',
  'find-together': 'GAME-047',
  'story-dice': 'GAME-025',
  'story-chain': 'GAME-046',
  'word-and-picture-pairs': 'GAME-023',
  'sort-together': 'GAME-004',
  'picture-puzzle': 'GAME-005',
  'finish-the-saying': 'GAME-006',
  'word-search': 'GAME-007',
  coloring: 'GAME-008',
  'conversation-cards': 'GAME-009',
  'photo-pairs': 'GAME-010',
  'picture-bingo': 'GAME-011',
  'quiet-shapes': 'GAME-060',
  'color-wash': 'GAME-038',
  'collage-board': 'GAME-033',
  'garden-planner': 'GAME-041',
  'coloring-wall': 'GAME-052',
  scrapbook: 'GAME-037',
  'picnic-planner': 'GAME-043',
  'quiet-scene': 'GAME-039',
  'calm-breathing': 'GAME-012',
};

/** The table row for a GAME- id: its Co-play and Offline cells. */
function specRow(id: string): { coPlay: string; offline: string } {
  const line = TABLE.split('\n').find((l) => l.startsWith(`| ${id} |`));
  if (!line) throw new Error(`No table row for ${id}`);
  const cells = line.split('|').map((c) => c.trim());
  // cells[0] is empty (before the leading bar); cells[5] is Co-play and cells[7] is Offline.
  return { coPlay: cells[5], offline: cells[7] };
}

/** The play modes a Co-play cell names. "1" is solo, "2" is together, "group" is group. */
function modesFromCoPlay(text: string): PlayMode[] {
  const modes: PlayMode[] = [];
  if (/\bsolo\b|^1\b/i.test(text)) modes.push('solo');
  if (/side by side|\b2\b|adult and child|shared control/i.test(text)) modes.push('together');
  if (/group/i.test(text)) modes.push('group');
  return modes;
}

describe('WEB-051 tags are present or listed as a gap', () => {
  it('maps every game to a table row', () => {
    for (const g of GAMES) expect(SPEC_ID[g.slug], g.slug).toMatch(/^GAME-\d{3}$/);
  });

  it('has a play mode for every game, or a listed reason', () => {
    for (const g of GAMES) {
      const gap = SPEC_TAG_GAPS.some((x) => x.slug === g.slug && x.field === 'playModes');
      if (gap) expect(g.playModes, g.slug).toBeUndefined();
      else expect(g.playModes?.length, g.slug).toBeGreaterThan(0);
    }
  });

  it('has offline-ready for every game, or a listed reason', () => {
    for (const g of GAMES) {
      const gap = SPEC_TAG_GAPS.some((x) => x.slug === g.slug && x.field === 'offline');
      if (gap) expect(g.offline, g.slug).toBeUndefined();
      else expect(typeof g.offline, g.slug).toBe('boolean');
    }
  });

  it('lists only real gaps, each with a reason', () => {
    for (const gap of SPEC_TAG_GAPS) {
      const game = GAMES.find((g) => g.slug === gap.slug);
      expect(game, gap.slug).toBeDefined();
      expect(game?.[gap.field], `${gap.slug} ${gap.field}`).toBeUndefined();
      expect(gap.reason.length, gap.slug).toBeGreaterThan(20);
    }
  });
});

describe('WEB-051 tags agree with the 05-games table', () => {
  for (const g of GAMES) {
    it(`${g.slug} (${SPEC_ID[g.slug]})`, () => {
      const row = specRow(SPEC_ID[g.slug]);
      expect(modesFromCoPlay(row.coPlay).sort(), g.slug).toEqual([...(g.playModes ?? [])].sort());
      // Offline is true only when the table says exactly "Yes"; a qualified cell is a gap.
      if (row.offline === 'Yes') expect(g.offline, g.slug).toBe(true);
      else expect(g.offline, g.slug).toBeUndefined();
    });
  }
});
