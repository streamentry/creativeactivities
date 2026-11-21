// Content hash for an activity card (PLAT-005). A review record stores the hash of the content the reviewer checked.
// When the card's hash later differs, the content has changed since review. Only reviewable content is hashed: the
// fields that card-versions.ts counts as content (PLAT-007). Formatting does not count. Text is normalized (Unicode
// NFC, runs of whitespace reduced to one space, ends trimmed) and object keys are sorted, so reflowing a line or
// reordering keys keeps the hash. Array order is content, so reordering steps changes it.
import { createHash } from 'node:crypto';

/** The fields a reviewer signs off on. Same list as CONTENT_FIELDS in src/lib/card-versions.ts (PLAT-007). */
export const REVIEWED_FIELDS = ['steps', 'plainSteps', 'materials', 'safety', 'safetyFlags', 'stopNote', 'variations'];

/** @param {string} text */
function normalizeText(text) {
  return text.normalize('NFC').replace(/\s+/g, ' ').trim();
}

/**
 * Plain data with text normalized and object keys sorted. An absent value becomes null, so a missing field and an
 * empty one stay distinct (`null` against `[]`).
 * @param {unknown} value
 * @returns {unknown}
 */
export function normalizeValue(value) {
  if (typeof value === 'string') return normalizeText(value);
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map((item) => normalizeValue(item ?? null));
  if (value && typeof value === 'object') {
    const record = /** @type {Record<string, unknown>} */ (value);
    return Object.fromEntries(Object.keys(record).sort().map((key) => [key, normalizeValue(record[key] ?? null)]));
  }
  return value ?? null;
}

/**
 * The reviewable content of a card, normalized, in the fixed order of REVIEWED_FIELDS.
 * @param {Record<string, unknown>} card the card's front matter
 */
export function reviewedContent(card) {
  return Object.fromEntries(REVIEWED_FIELDS.map((field) => [field, normalizeValue(card[field] ?? null)]));
}

/**
 * `sha256:` followed by the hex digest of the card's reviewed content.
 * @param {Record<string, unknown>} card the card's front matter
 * @returns {string}
 */
export function contentHash(card) {
  return `sha256:${createHash('sha256').update(JSON.stringify(reviewedContent(card))).digest('hex')}`;
}
