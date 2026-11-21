// Due-for-review queue (WEB-076) with the review cadence from TSA-036.
// The interval is a proposal until the maintainer records another value.
// The queue is internal: it is printed by `pnpm review:queue` and never built into the site.
// Owner roles (PLAT-012) are defined in src/lib/review-owner.ts; a page without one is defaulted by rule.
import { ownerOf, REVIEW_OWNER_ROLES } from '../src/lib/review-owner.ts';

export const REVIEW_INTERVAL_MONTHS = 12;

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** @param {string} iso */
function parse(iso) {
  if (!ISO.test(iso)) return null;
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * The date a page checked on `checked` is next due, clamped to the month's last day.
 * @param {string} checked ISO date
 * @param {number} months
 * @returns {string}
 */
export function dueDate(checked, months) {
  const date = parse(checked);
  if (!date) throw new RangeError(`Not an ISO date: ${checked}`);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + months;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const due = new Date(Date.UTC(year, month, Math.min(date.getUTCDate(), lastDay)));
  return due.toISOString().slice(0, 10);
}

/**
 * The date a page was last reviewed: the review record's date only (MET-011).
 * An edit (`updated`) or the first publication never counts as a review, so a page
 * with no review record returns null and is reported as not yet reviewed.
 * @param {string} frontmatter
 * @returns {string | null}
 */
export function readFrontmatterDates(frontmatter) {
  return frontmatter.match(/^review:\n(?:[ \t]+.*\n)*?[ \t]+date: (\d{4}-\d{2}-\d{2})/m)?.[1] ?? null;
}

/**
 * The due date when a page checked on `checked` is past its review on `today`, else null.
 * Used at build time for the reader-facing notice on activity cards (WEB-076, TSA-036).
 * @param {string} checked ISO date
 * @param {string} today ISO date
 * @param {number} [months]
 * @returns {string | null}
 */
export function overdueSince(checked, today, months = REVIEW_INTERVAL_MONTHS) {
  const due = dueDate(checked, months);
  return due < today ? due : null;
}

/**
 * @typedef {{ id: string, kind: string, checked: string, safetyFlagged: boolean, owner?: string }} ReviewItem
 * @typedef {ReviewItem & { due: string, daysOverdue: number, owner: string, ownerDefaulted: boolean }} ReviewEntry
 */

/**
 * Pages past their due date: safety-flagged first, then the most overdue.
 * @param {ReviewItem[]} items
 * @param {string} today ISO date
 * @param {number} [months]
 * @returns {ReviewEntry[]}
 */
export function reviewQueue(items, today, months = REVIEW_INTERVAL_MONTHS) {
  const now = parse(today);
  if (!now) throw new RangeError(`Not an ISO date: ${today}`);
  return items
    .map((item) => {
      if (!parse(item.checked)) throw new RangeError(`${item.id}: bad date ${item.checked}`);
      const due = dueDate(item.checked, months);
      const daysOverdue = Math.round((now.getTime() - /** @type {Date} */ (parse(due)).getTime()) / 86_400_000);
      const { role, defaulted } = ownerOf(item);
      return { ...item, due, daysOverdue, owner: role, ownerDefaulted: defaulted };
    })
    .filter((entry) => entry.daysOverdue > 0)
    .sort((a, b) => Number(b.safetyFlagged) - Number(a.safetyFlagged) || b.daysOverdue - a.daysOverdue);
}

/**
 * The entries whose owner is `role`, in the same priority order.
 * @param {ReviewEntry[]} entries
 * @param {string} role
 * @returns {ReviewEntry[]}
 */
export function filterByOwner(entries, role) {
  return entries.filter((entry) => entry.owner === role);
}

/**
 * How many entries each owner holds, in the fixed role order; roles with none are left out.
 * @param {ReviewEntry[]} entries
 * @returns {Record<string, number>}
 */
export function ownerSummary(entries) {
  /** @type {Record<string, number>} */
  const counts = {};
  for (const role of REVIEW_OWNER_ROLES) {
    const n = entries.filter((entry) => entry.owner === role).length;
    if (n > 0) counts[role] = n;
  }
  return counts;
}
