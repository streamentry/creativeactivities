import { describe, expect, it } from 'vitest';
import { PICTURES } from '../../data/pictures';
import {
  WEEKDAYS_SHORT,
  archiveDays,
  dailyTitle,
  dailyValues,
  dayKey,
  daySeed,
  isDayKey,
  monthCalendar,
  monthLabel,
  monthWeeks,
  resultLine,
} from './daily';

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

describe('daily printed month (GAME-061)', () => {
  const nameOf = (id: string) => `Picture ${id}`;

  it('lays a month out Sunday first, with blanks before the 1st and after the last day', () => {
    // 2026-11-01 is a Sunday, and November has 30 days: five full weeks.
    const weeks = monthWeeks(2026, 10);
    expect(weeks).toHaveLength(5);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
    expect(weeks[0]?.[0]).toBe('2026-11-01');
    expect(weeks[4]?.[1]).toBe('2026-11-30');
    expect(weeks[4]?.[2]).toBeNull();
    // 2026-02-01 is a Sunday; February 2026 has 28 days and fits four weeks.
    expect(monthWeeks(2026, 1)).toHaveLength(4);
    // 2026-08-01 is a Saturday: six leading blanks.
    expect(monthWeeks(2026, 7)[0]?.slice(0, 6)).toEqual([null, null, null, null, null, null]);
  });

  it('gives each day its card title, the same as the day picker shows for that date', () => {
    const ids = PICTURES.map((p) => p.id);
    const cells = monthCalendar(2026, 10, ids, nameOf).flat().filter((c) => c !== null);
    expect(cells).toHaveLength(30);
    const nov16 = cells.find((c) => c.key === '2026-11-16');
    expect(nov16?.day).toBe(16);
    expect(nov16?.title).toBe(dailyValues('2026-11-16', ids).map(nameOf).join(', '));
  });

  it('labels the month in English and keeps the title to the four picture names', () => {
    expect(monthLabel(2026, 10)).toBe('November 2026');
    expect(dailyTitle(['a', 'b'], nameOf)).toBe('Picture a, Picture b');
    expect(WEEKDAYS_SHORT).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  });
});
