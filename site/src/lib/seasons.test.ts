import { describe, expect, it } from 'vitest';
import {
  SEASON_IDS,
  currentSeason,
  hemisphereFromLocale,
  isSeasonId,
  MONTH_NAMES,
  regionOf,
  seasonCalendar,
  seasonFor,
} from './seasons';

describe('seasonFor', () => {
  it('uses whole calendar months in the north', () => {
    const north = Array.from({ length: 12 }, (_, m) => seasonFor(m, 'north'));
    expect(north).toEqual([
      'winter', 'winter', 'spring', 'spring', 'spring', 'summer',
      'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter',
    ]);
  });

  it('gives the opposite season in the south for every month', () => {
    const opposite = { spring: 'autumn', summer: 'winter', autumn: 'spring', winter: 'summer' } as const;
    for (let m = 0; m < 12; m += 1) {
      expect(seasonFor(m, 'south')).toBe(opposite[seasonFor(m, 'north')]);
    }
  });

  it('gives every season three months in each half', () => {
    for (const hemisphere of ['north', 'south'] as const) {
      for (const id of SEASON_IDS) {
        const months = Array.from({ length: 12 }, (_, m) => seasonFor(m, hemisphere)).filter((s) => s === id);
        expect(months, `${hemisphere} ${id}`).toHaveLength(3);
      }
    }
  });

  it('refuses a month that is not 0 to 11', () => {
    expect(() => seasonFor(12, 'north')).toThrow(RangeError);
    expect(() => seasonFor(-1, 'south')).toThrow(RangeError);
    expect(() => seasonFor(1.5, 'south')).toThrow(RangeError);
  });
});

describe('locale guess', () => {
  it('reads the region from a language tag', () => {
    expect(regionOf('en-AU')).toBe('AU');
    expect(regionOf('pt_BR')).toBe('BR');
    expect(regionOf('zh-Hans-CN')).toBe('CN');
    expect(regionOf('en')).toBeNull();
    expect(regionOf(undefined)).toBeNull();
    expect(regionOf('')).toBeNull();
  });

  it('guesses south for southern regions and north otherwise', () => {
    expect(hemisphereFromLocale('en-NZ')).toBe('south');
    expect(hemisphereFromLocale('es-AR')).toBe('south');
    expect(hemisphereFromLocale('en-US')).toBe('north');
    expect(hemisphereFromLocale('fr')).toBe('north');
    expect(hemisphereFromLocale(undefined)).toBe('north');
  });
});

describe('currentSeason', () => {
  const july = new Date(2026, 6, 15);

  it('follows the chosen half over the language setting', () => {
    expect(currentSeason(july, 'north', 'en-AU')).toBe('summer');
    expect(currentSeason(july, 'south', 'en-US')).toBe('winter');
  });

  it('falls back to the language setting when nothing is chosen', () => {
    expect(currentSeason(july, null, 'en-AU')).toBe('winter');
    expect(currentSeason(july, null, 'en-GB')).toBe('summer');
  });

  it('points at no season when the visitor says their place has none of the four', () => {
    expect(currentSeason(july, 'neither', 'en-US')).toBeNull();
  });
});

describe('isSeasonId', () => {
  it('accepts the four and nothing else', () => {
    for (const id of SEASON_IDS) expect(isSeasonId(id)).toBe(true);
    expect(isSeasonId('monsoon')).toBe(false);
    expect(isSeasonId('')).toBe(false);
  });
});

describe('the year as a calendar (CNT-013)', () => {
  it('lists twelve months in order, each with the season for that month', () => {
    const north = seasonCalendar('north');
    expect(north.map((m) => m.name)).toEqual([...MONTH_NAMES]);
    expect(north.map((m) => m.month)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    for (const m of north) expect(m.season).toBe(seasonFor(m.month, 'north'));
  });

  it('has the opposite season in the south for every month', () => {
    const opposite = { spring: 'autumn', summer: 'winter', autumn: 'spring', winter: 'summer' } as const;
    for (const [i, m] of seasonCalendar('south').entries()) expect(m.season).toBe(opposite[seasonCalendar('north')[i]!.season]);
  });

  it('gives every season exactly three months in each half', () => {
    for (const h of ['north', 'south'] as const) {
      for (const id of SEASON_IDS) expect(seasonCalendar(h).filter((m) => m.season === id)).toHaveLength(3);
    }
  });
});
