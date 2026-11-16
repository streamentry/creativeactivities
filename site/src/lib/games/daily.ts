import { createRng, sample } from './random';

/**
 * GAME-061 daily shared card: one Picture pairs board per calendar day, the same
 * pictures for everyone, kept for any past day. Nothing is stored or sent, a
 * missed day shows nothing, and there is no streak or reminder.
 */
export const DAILY_PAIRS = 4;
export const ARCHIVE_DAYS = 30;

/** Local calendar date as YYYY-MM-DD, so "today" is the player's today. */
export function dayKey(date: Date): string {
  const y = String(date.getFullYear()).padStart(4, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isDayKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number) as [number, number, number];
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** FNV-1a: a stable seed from the date text, identical on every device. */
export function daySeed(key: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** The pictures for a day. Ids are sorted first, so the order the library lists them in cannot change a day. */
export function dailyValues(key: string, pictureIds: readonly string[], pairs = DAILY_PAIRS): string[] {
  const ids = [...pictureIds].sort();
  return sample(ids, pairs, createRng(daySeed(key)));
}

/** Today first, then each earlier day, newest to oldest. */
export function archiveDays(today: Date, count = ARCHIVE_DAYS): string[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    return dayKey(d);
  });
}

/** A plain sentence with no score, rank, count of misses or streak. */
export function resultLine(pairs: number): string {
  return pairs === 1 ? 'Made 1 pair together.' : `Made ${pairs} pairs together.`;
}
