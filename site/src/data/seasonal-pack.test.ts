import { describe, expect, it } from 'vitest';
import { playProps } from '../i18n/play';
import { SEASON_IDS } from '../lib/seasons';
import { SEASON_PAGE_BY_ID } from './seasons';
import { PACK_SEASONS, packPictures, seasonPack } from './seasonal-pack';
import { PICTURE_BY_ID } from './pictures';

describe('seasonal puzzle pack (GAME-040)', () => {
  it('offers the four seasons, in order', () => {
    expect(PACK_SEASONS).toEqual(['spring', 'summer', 'autumn', 'winter']);
    expect([...PACK_SEASONS]).toEqual([...SEASON_IDS]);
  });

  it('uses only pictures that exist in the picture library, six to eight per season', () => {
    for (const season of PACK_SEASONS) {
      const ids = packPictures(seasonPack(season));
      for (const id of ids) expect(PICTURE_BY_ID.has(id), `${season}: ${id}`).toBe(true);
      expect(new Set(ids).size, season).toBe(ids.length);
      expect(ids.length, season).toBeGreaterThanOrEqual(6);
      expect(ids.length, season).toBeLessThanOrEqual(8);
    }
  });

  it('gives each season the three puzzles', () => {
    for (const season of PACK_SEASONS) {
      const pack = seasonPack(season);
      expect(pack.pairsLeft, season).toHaveLength(4);
      expect(pack.pairsRight, season).toHaveLength(4);
      expect(pack.differentRow, season).toHaveLength(4);
      expect(pack.color, season).toEqual(expect.any(String));
    }
  });

  it('draws the right column of Match the pairs from the same four pictures, in another order', () => {
    for (const season of PACK_SEASONS) {
      const { pairsLeft, pairsRight } = seasonPack(season);
      expect([...pairsRight].sort(), season).toEqual([...pairsLeft].sort());
      pairsRight.forEach((id, i) => expect(id, `${season} row ${i}`).not.toBe(pairsLeft[i]));
    }
  });

  it('has exactly one picture that differs in Which one is different, and three that match', () => {
    for (const season of PACK_SEASONS) {
      const row = seasonPack(season).differentRow;
      const counts = new Map<string, number>();
      for (const id of row) counts.set(id, (counts.get(id) ?? 0) + 1);
      const sizes = [...counts.values()].sort();
      expect(sizes, season).toEqual([1, 3]);
      const [odd] = [...counts].find(([, n]) => n === 1) ?? [];
      expect(row.filter((id) => id === odd), season).toHaveLength(1);
    }
  });

  it('uses the season page wording for when each season runs', () => {
    for (const season of PACK_SEASONS) {
      expect(seasonPack(season).months, season).toBe(SEASON_PAGE_BY_ID[season].months);
    }
  });

  it('keeps pressure words out of the English text', () => {
    const text = JSON.stringify(playProps('en').ui.seasonalPack);
    expect(text).not.toMatch(/\b(wrong|score|timer|winner|win|correct|fail|hurry|quick|faster|streak|brain|memory|therapy|safe|test|odd one out)\b/i);
  });
});
