import { describe, expect, it } from 'vitest';
import { latestDate } from './version-date';

describe('latestDate', () => {
  it('returns the newest date, ignoring missing ones', () => {
    expect(latestDate(['2026-11-08', undefined, '2026-11-17', '2026-10-30'])).toBe('2026-11-17');
  });

  it('returns undefined when no item has a date', () => {
    expect(latestDate([])).toBeUndefined();
    expect(latestDate([undefined])).toBeUndefined();
  });
});
