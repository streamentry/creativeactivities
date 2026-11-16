// L10N-021: a translation made from an older English page is stale. Every translated guide records
// `translatedFrom`, the English `updated` date it was made from, so staleness follows from two dates and
// nothing is set by hand. These pure functions are shared by the build check, the page notice and the
// re-review queue (`pnpm translations:queue`).

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** @param {string} iso @returns {number | null} milliseconds at midnight UTC, or null when not an ISO date */
function toTime(iso) {
  if (typeof iso !== 'string' || !ISO.test(iso)) return null;
  const date = new Date(`${iso}T00:00:00Z`);
  // JavaScript rolls 2026-02-30 over to March, so a date that does not read back the same is not a date.
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso ? null : date.getTime();
}

/**
 * True when the translation was made from an older English page than the one now published.
 * A missing or malformed date is not called stale: other checks report it, and none is invented here.
 * @param {string} translatedFrom ISO date the translation was made from
 * @param {string} englishUpdated ISO `updated` date of the English page
 */
export function isStale(translatedFrom, englishUpdated) {
  const from = toTime(translatedFrom);
  const current = toTime(englishUpdated);
  return from !== null && current !== null && from < current;
}

/** Whole days the translation is behind the English page; 0 when current or when a date is unreadable. */
export function daysBehind(translatedFrom, englishUpdated) {
  const from = toTime(translatedFrom);
  const current = toTime(englishUpdated);
  return from === null || current === null || from >= current ? 0 : Math.round((current - from) / 86_400_000);
}

/**
 * Dates and flags a page declares in its front matter.
 * @param {string} frontmatter the text between the `---` lines
 */
export function readFreshnessFields(frontmatter) {
  const date = (key) => frontmatter.match(new RegExp(`^${key}: "?(\\d{4}-\\d{2}-\\d{2})"?\\s*$`, 'm'))?.[1] ?? null;
  const flag = (key) => new RegExp(`^${key}: true\\s*$`, 'm').test(frontmatter);
  return {
    updated: date('updated'),
    translatedFrom: date('translatedFrom'),
    health: flag('health'),
    crisisRoute: flag('crisisRoute'),
  };
}

/**
 * A guide whose translation carries health advice or the crisis route is protected: a stale copy of it
 * is the harm L10N-021 names, so it goes first in the queue and the page says so.
 * @param {{ health: boolean, crisisRoute: boolean }} fields
 */
export const isProtected = (fields) => fields.health || fields.crisisRoute;

/**
 * Stale translations in the order to re-review them: protected guides first, then the most days behind,
 * then by guide and language so the order never changes between runs.
 * @template {{ id: string, lang: string, protected: boolean, daysBehind: number }} T
 * @param {T[]} items
 * @returns {T[]}
 */
export function queueOrder(items) {
  return [...items].sort(
    (a, b) =>
      Number(b.protected) - Number(a.protected) ||
      b.daysBehind - a.daysBehind ||
      a.id.localeCompare(b.id) ||
      a.lang.localeCompare(b.lang),
  );
}

/**
 * The queue grouped by English guide, in review order: how many languages are stale for each.
 * @param {{ id: string, lang: string, protected: boolean, daysBehind: number }[]} items
 */
export function groupByGuide(items) {
  const groups = new Map();
  for (const item of queueOrder(items)) {
    const group = groups.get(item.id) ?? { id: item.id, protected: item.protected, daysBehind: item.daysBehind, languages: [] };
    group.languages.push(item.lang);
    groups.set(item.id, group);
  }
  return [...groups.values()];
}
