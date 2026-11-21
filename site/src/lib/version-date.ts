/**
 * WEB-065: the version date a printable shows when it is made from other
 * items (a pack from its cards, a weekly sheet from its activities). The newest
 * date wins, because the printable changes when any of its items changes.
 * Dates are `YYYY-MM-DD`, so the newest is the largest string.
 */
export function latestDate(dates: readonly (string | undefined)[]): string | undefined {
  let latest: string | undefined;
  for (const date of dates) {
    if (date !== undefined && (latest === undefined || date > latest)) latest = date;
  }
  return latest;
}
