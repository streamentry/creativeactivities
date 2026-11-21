// Review drift (PLAT-005). For each activity card with a review record, compares the hash of the card's reviewed
// content now with the hash the reviewer's record holds. A card whose hash differs has changed since review. Older
// records have no hash; they are reported, but cannot be checked. Nothing here changes what readers see.
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { SITE_ROOT, listRecordFiles, loadCollections, parseRecord } from './content-validate-lib.mjs';
import { contentHash } from './content-hash-lib.mjs';

/**
 * The drift state of one card, or null when the card has no review record.
 * `current`: the reviewed hash matches. `changed`: the content differs from the reviewed content.
 * `no-hash`: the record predates content hashes.
 * @param {string} id
 * @param {Record<string, unknown>} card the card's front matter
 */
export function reviewDrift(id, card) {
  const review = card.review;
  if (!review || typeof review !== 'object') return null;
  const record = /** @type {Record<string, unknown>} */ (review);
  const currentHash = contentHash(card);
  const reviewedHash = typeof record.contentHash === 'string' ? record.contentHash : null;
  const state = reviewedHash === null ? 'no-hash' : reviewedHash === currentHash ? 'current' : 'changed';
  return { id, state, reviewedHash, currentHash, reviewDate: dateText(record.date) };
}

/** A review date as YYYY-MM-DD, or the empty string when there is none. @param {unknown} value */
function dateText(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return typeof value === 'string' ? value : '';
}

/**
 * Reads every activity card under `root` (this site by default) and classifies the ones with a review record.
 * @param {{ root?: string }} [options]
 */
export async function reviewDriftReport({ root = SITE_ROOT } = {}) {
  const collections = await loadCollections();
  const { base, pattern } = collections.activityCards.loader.glob;
  const baseDir = resolve(root, base);
  const files = listRecordFiles(baseDir, pattern);
  const entries = [];
  const unreadable = [];
  for (const file of files) {
    const id = file.replace(/\.md$/, '');
    const parsed = await parseRecord(readFileSync(join(baseDir, file), 'utf8'));
    if (parsed.error !== undefined) {
      unreadable.push(`${id}: ${parsed.error}`);
      continue;
    }
    const entry = reviewDrift(id, /** @type {Record<string, unknown>} */ (parsed.data));
    if (entry) entries.push(entry);
  }
  return { total: files.length, entries, unreadable };
}

const short = (hash) => (hash ? hash.slice(0, 19) : 'none');

/**
 * The report as plain text: a count line, then each card that changed, has no hash, or is current.
 * @param {Awaited<ReturnType<typeof reviewDriftReport>>} report
 */
export function formatDriftReport({ total, entries, unreadable }) {
  const of = (state) => entries.filter((entry) => entry.state === state);
  const changed = of('changed');
  const noHash = of('no-hash');
  const current = of('current');
  const lines = [
    `Review drift: ${entries.length} of ${total} activity cards have a review record; ${current.length} current, ${changed.length} updated since review, ${noHash.length} with no content hash (older record, not checked).`,
  ];
  const sections = [
    ['updated since review (content changed after the review)', changed, (e) => `  ${e.id}: reviewed ${e.reviewDate || 'undated'}, reviewed hash ${short(e.reviewedHash)}, now ${short(e.currentHash)}`],
    ['no content hash (older record, cannot be checked)', noHash, (e) => `  ${e.id}: reviewed ${e.reviewDate || 'undated'}`],
    ['current', current, (e) => `  ${e.id}: reviewed ${e.reviewDate || 'undated'}`],
  ];
  for (const [label, rows, format] of sections) {
    if (rows.length === 0) continue;
    lines.push('', `${label}:`, ...rows.map(format));
  }
  if (unreadable.length > 0) lines.push('', 'could not be read (pnpm content:validate names the error):', ...unreadable.map((u) => `  ${u}`));
  return lines.join('\n');
}
