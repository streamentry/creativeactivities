/**
 * WEB-033: which season it is, for a visitor who says which half of the world
 * they are in. Seasons here are the four plain ones by calendar month. They are
 * not holidays: no festival is tied to a season (MISSION, "Cultural openness").
 *
 * The choice is never stored. With no choice, the visitor's language setting
 * guesses the half; the guess is shown and can be changed.
 */
export const SEASON_IDS = ['spring', 'summer', 'autumn', 'winter'] as const;
export type SeasonId = (typeof SEASON_IDS)[number];

export type Hemisphere = 'north' | 'south';
/** What a visitor can pick. "Neither" is for places without four seasons. */
export type HemisphereChoice = Hemisphere | 'neither';

export function isSeasonId(value: string): value is SeasonId {
  return (SEASON_IDS as readonly string[]).includes(value);
}

// Northern-hemisphere seasons by month (0 = January), using whole calendar months.
const NORTH_BY_MONTH: readonly SeasonId[] = [
  'winter', 'winter', 'spring', 'spring', 'spring', 'summer',
  'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter',
];

const OPPOSITE: Record<SeasonId, SeasonId> = {
  spring: 'autumn',
  summer: 'winter',
  autumn: 'spring',
  winter: 'summer',
};

/** The season for a month (0 to 11) in a half of the world. */
export function seasonFor(month: number, hemisphere: Hemisphere): SeasonId {
  if (!Number.isInteger(month) || month < 0 || month > 11) throw new RangeError(`month out of range: ${month}`);
  const north = NORTH_BY_MONTH[month] as SeasonId;
  return hemisphere === 'north' ? north : OPPOSITE[north];
}

/** Countries that lie mostly or wholly south of the equator and have four seasons. */
const SOUTH_REGIONS: ReadonlySet<string> = new Set([
  'AU', 'NZ', 'ZA', 'AR', 'CL', 'UY', 'PY', 'BO', 'BR', 'LS', 'SZ', 'NA', 'BW', 'ZW', 'MZ', 'ZM', 'MW', 'MG',
]);

/** The two-letter region in a language tag such as "en-AU", or null when it names none. */
export function regionOf(languageTag: string | undefined): string | null {
  const match = /^[a-z]{2,3}(?:[-_][A-Za-z]{4})?[-_]([A-Za-z]{2})(?:[-_]|$)/.exec(languageTag ?? '');
  return match ? (match[1] as string).toUpperCase() : null;
}

/** A guess from the language setting; a tag with no region reads as north, and the page says it is a guess. */
export function hemisphereFromLocale(languageTag: string | undefined): Hemisphere {
  const region = regionOf(languageTag);
  return region !== null && SOUTH_REGIONS.has(region) ? 'south' : 'north';
}

/** The season to point at, or null when the visitor says their place has no four seasons. */
export function currentSeason(
  today: Date,
  choice: HemisphereChoice | null,
  languageTag: string | undefined,
): SeasonId | null {
  if (choice === 'neither') return null;
  const hemisphere = choice ?? hemisphereFromLocale(languageTag);
  return seasonFor(today.getMonth(), hemisphere);
}
