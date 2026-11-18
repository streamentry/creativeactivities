import { describe, expect, it } from 'vitest';
import { PICTURES } from '../../data/pictures';
import { archiveDays, dailyValues, dayKey, daySeed, isDayKey, resultLine } from './daily';

const ids = PICTURES.map((p) => p.id);

describe('daily shared card (GAME-061)', () => {
  it('gives the same pictures for the same date, whatever order the library lists them in', () => {
    const a = dailyValues('2026-11-16', ids);
    const b = dailyValues('2026-11-16', [...ids].reverse());
    expect(a).toEqual(b);
    expect(a).toHaveLength(4);
    expect(new Set(a).size).toBe(4);
  });

  it('gives different days different cards', () => {
    const days = archiveDays(new Date(2026, 10, 16), 30).map((d) => dailyValues(d, ids).join());
    expect(new Set(days).size).toBeGreaterThan(25);
  });

  it('seeds from the date text, not from the clock', () => {
    expect(daySeed('2026-11-16')).toBe(daySeed('2026-11-16'));
    expect(daySeed('2026-11-16')).not.toBe(daySeed('2026-11-17'));
  });

  it('keeps an archive of 30 days, newest first, across a month and year end', () => {
    const days = archiveDays(new Date(2026, 0, 2), 5);
    expect(days).toEqual(['2026-01-02', '2026-01-01', '2025-12-31', '2025-12-30', '2025-12-29']);
    expect(archiveDays(new Date(2026, 10, 16))).toHaveLength(30);
  });

  it('formats and validates dates', () => {
    expect(dayKey(new Date(2026, 2, 5))).toBe('2026-03-05');
    expect(isDayKey('2026-02-30')).toBe(false);
    expect(isDayKey('2026-11-16')).toBe(true);
    expect(isDayKey('today')).toBe(false);
  });

  it('writes a result with no score, miss count or streak', () => {
    expect(resultLine(4)).toBe('Made 4 pairs together.');
    expect(resultLine(1)).toBe('Made 1 pair together.');
    expect(resultLine(4)).not.toMatch(/\d+\s*(day|miss|try|tries|move)|streak|score|best|rank/i);
  });
});
