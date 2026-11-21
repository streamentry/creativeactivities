import { describe, expect, it } from 'vitest';
import { playProps } from '../i18n/play';
import { DEFAULT_MONTH, PACK_MONTHS, monthForDate, monthPack, packPictures } from './seasonal-pack';
import { PICTURE_BY_ID } from './pictures';

describe('monthly puzzle pack (GAME-040)', () => {
  it('offers the twelve months, January first', () => {
    expect([...PACK_MONTHS]).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(DEFAULT_MONTH).toBe(0);
    expect(playProps('en').ui.seasonalPack.months).toHaveLength(12);
  });

  it('uses only pictures that exist in the picture library, six to eight per month, none twice', () => {
    for (const month of PACK_MONTHS) {
      const ids = packPictures(monthPack(month));
      for (const id of ids) {
        expect(PICTURE_BY_ID.has(id), `${month}: ${id}`).toBe(true);
      }
      expect(new Set(ids).size, String(month)).toBe(ids.length);
      expect(ids.length, String(month)).toBeGreaterThanOrEqual(6);
      expect(ids.length, String(month)).toBeLessThanOrEqual(8);
    }
  });

  it('gives each month the three puzzles', () => {
    for (const month of PACK_MONTHS) {
      const pack = monthPack(month);
      expect(pack.month).toBe(month);
      expect(pack.pairsLeft, String(month)).toHaveLength(4);
      expect(pack.pairsRight, String(month)).toHaveLength(4);
      expect(pack.differentRow, String(month)).toHaveLength(4);
      expect(pack.color, String(month)).toEqual(expect.any(String));
    }
  });

  it('draws the right column of Match the pairs from the same four pictures, in another order', () => {
    for (const month of PACK_MONTHS) {
      const { pairsLeft, pairsRight } = monthPack(month);
      expect([...pairsRight].sort(), String(month)).toEqual([...pairsLeft].sort());
      pairsRight.forEach((id, i) => expect(id, `${month} row ${i}`).not.toBe(pairsLeft[i]));
    }
  });

  it('has exactly one picture that differs in Which one is different, and three that match', () => {
    for (const month of PACK_MONTHS) {
      const row = monthPack(month).differentRow;
      const counts = new Map<string, number>();
      for (const id of row) counts.set(id, (counts.get(id) ?? 0) + 1);
      const sizes = [...counts.values()].sort();
      expect(sizes, String(month)).toEqual([1, 3]);
      const [odd] = [...counts].find(([, n]) => n === 1) ?? [];
      expect(row.filter((id) => id === odd), String(month)).toHaveLength(1);
    }
  });

  it('takes the default month from the device date, by the device calendar', () => {
    expect(monthForDate(new Date(2026, 10, 21))).toBe(10);
    expect(monthForDate(new Date(2027, 0, 1))).toBe(0);
    expect(monthForDate(new Date(2026, 11, 31, 23, 59))).toBe(11);
  });

  it('keeps pressure words out of the English text', () => {
    const text = JSON.stringify(playProps('en').ui.seasonalPack);
    expect(text).not.toMatch(/\b(wrong|score|timer|winner|win|correct|fail|hurry|quick|faster|streak|brain|memory|therapy|safe|test|odd one out)\b/i);
  });
});
