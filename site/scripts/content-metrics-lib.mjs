// Content-quality metrics read straight from the repository (MET-010, MET-011, MET-012, MET-015).
// Pure functions: the CLI (content-metrics.mjs) reads the files and prints what these return. Every figure
// carries its count (MET-038). Nothing here is a proxy for a review that has not happened: a page with no review
// record is counted as not reviewed.
import { reviewQueue } from './review-queue-lib.mjs';
import { isProtected } from './translation-freshness-lib.mjs';

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** A date that exists: 2026-13-45 has the shape of a date and is not one. @param {string | null} value @returns {string | null} */
function calendarDate(value) {
  if (value === null || !ISO.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : value;
}

/** @param {string} frontmatter @param {string} key @returns {string | null} */
function isoField(frontmatter, key) {
  return calendarDate(frontmatter.match(new RegExp(`^${key}: "?(\\d{4}-\\d{2}-\\d{2})"?\\s*$`, 'm'))?.[1] ?? null);
}

/** The lines of one top-level front matter block, without the key line. */
function block(frontmatter, key) {
  const start = frontmatter.search(new RegExp(`^${key}:`, 'm'));
  if (start === -1) return '';
  const rest = frontmatter.slice(start).split('\n').slice(1);
  const lines = [];
  for (const line of rest) {
    if (/^\S/.test(line)) break;
    lines.push(line);
  }
  return lines.join('\n');
}

/**
 * What the metrics need to know about one page.
 * @param {string} kind activity, hub or guide
 * @param {string} id
 * @param {string} frontmatter the text between the `---` lines
 */
export function pageFacts(kind, id, frontmatter) {
  const review = block(frontmatter, 'review');
  const sources = block(frontmatter, 'sources');
  const updated = isoField(frontmatter, 'updated');
  const published = isoField(frontmatter, 'published');
  // A review date may be written with a time ("2026-03-01T10:00:00Z"), which the site's schema accepts; only the day counts.
  const reviewDate = review ? calendarDate(review.match(/^[ \t]+date: "?(\d{4}-\d{2}-\d{2})(?:T[^\s"']*)?"?\s*$/m)?.[1] ?? null) : null;
  return {
    kind,
    id,
    // Health-adjacent is what the translation queue calls protected: a health flag or a crisis route (L10N-021).
    health: isProtected({ health: /^health: true\s*$/m.test(frontmatter), crisisRoute: /^crisisRoute: true\s*$/m.test(frontmatter) }),
    // A hub held from search is not an indexed page, which is what MET-010 counts.
    indexable: !/^indexable: false\s*$/m.test(frontmatter),
    hasReviewRecord: review.trim().length > 0,
    reviewDate,
    updated,
    checked: reviewDate ?? updated ?? published,
    sources: (sources.match(/^[ \t]+- title:/gm) ?? []).length,
    // A source is dated only if it carries a date of its own; none of the schemas has such a field yet.
    datedSources: (sources.match(/^[ \t]+(?:date|retrieved|accessed|checked): /gm) ?? []).length,
  };
}

/** @param {number[]} values */
export function median(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

/**
 * MET-010: pages with a review record that is not older than the page, pages whose review is older than the
 * last update (stale), and pages with no record. A record whose date cannot be read, or lies after today, is not
 * current. Health-adjacent pages are counted apart from the rest.
 * @param {ReturnType<typeof pageFacts>[]} pages
 * @param {string} [today] ISO date
 */
export function reviewedCoverage(pages, today = new Date().toISOString().slice(0, 10)) {
  const count = (group) => {
    const current = group.filter(
      (p) => p.hasReviewRecord && p.reviewDate !== null && p.reviewDate <= today && (!p.updated || p.reviewDate >= p.updated),
    ).length;
    const stale = group.filter((p) => p.hasReviewRecord).length - current;
    return { total: group.length, current, stale, none: group.filter((p) => !p.hasReviewRecord).length };
  };
  return { health: count(pages.filter((p) => p.health)), other: count(pages.filter((p) => !p.health)) };
}

/**
 * MET-011: pages past their review date. A page counts as checked on its review date, else the date it was
 * last updated, else the date it was published; editing a page therefore resets the clock, which the spec
 * warns against (PLAT-012), and this report says so rather than hiding it.
 * @param {ReturnType<typeof pageFacts>[]} pages
 * @param {string} today
 */
export function overdueReviews(pages, today) {
  const items = pages
    .filter((p) => p.checked !== null)
    .map((p) => ({ id: `${p.kind}/${p.id}`, kind: p.kind, checked: /** @type {string} */ (p.checked), safetyFlagged: p.health }));
  const queue = reviewQueue(items, today);
  return {
    total: pages.length,
    undated: pages.filter((p) => p.checked === null).length,
    overdue: queue.length,
    medianDaysOver: median(queue.map((q) => q.daysOverdue)),
    healthFirst: queue.slice(0, 5).map((q) => q.id),
  };
}

/**
 * MET-012: for each language, how many live English guides it has and how many of those are stale. Translations
 * of retired guides stay published, so the stale ones among them are counted too, apart. Native review is a
 * fixed 0: the repository holds no native review record for any translation, so it is not yet a measure.
 * @param {{ lang: string, retired: boolean, stale: boolean }[]} translations
 * @param {number} liveEnglishGuides
 */
export function translationCoverage(translations, liveEnglishGuides) {
  const byLang = new Map();
  for (const t of translations.filter((x) => !x.retired)) {
    const row = byLang.get(t.lang) ?? { lang: t.lang, translated: 0, stale: 0 };
    row.translated += 1;
    if (t.stale) row.stale += 1;
    byLang.set(t.lang, row);
  }
  const rows = [...byLang.values()].sort((a, b) => a.lang.localeCompare(b.lang));
  return {
    liveEnglishGuides,
    languages: rows.length,
    rows,
    translatedPages: rows.reduce((n, r) => n + r.translated, 0),
    stalePages: rows.reduce((n, r) => n + r.stale, 0),
    nativeReviewedPages: 0,
    behindRetiredGuides: translations.filter((t) => t.retired).length,
    staleBehindRetired: translations.filter((t) => t.retired && t.stale).length,
    min: rows.length ? Math.min(...rows.map((r) => r.translated)) : 0,
    max: rows.length ? Math.max(...rows.map((r) => r.translated)) : 0,
  };
}

/**
 * MET-015: health-adjacent pages (a health flag or a crisis route) with at least one source, and with a dated source.
 * @param {ReturnType<typeof pageFacts>[]} pages
 */
export function sourceCoverage(pages) {
  const health = pages.filter((p) => p.health);
  return {
    total: health.length,
    withSource: health.filter((p) => p.sources > 0).length,
    withDatedSource: health.filter((p) => p.datedSources > 0).length,
  };
}

const share = (part, whole) => (whole === 0 ? 'n/a' : `${Math.round((part / whole) * 100)}%`);

/** The report as lines of plain text. Every figure is shown with its count and the date it was read. */
export function formatReport(r, today, { rows = false } = {}) {
  const { reviewed, overdue, translation, sources } = r;
  const line = (label, g) =>
    `  ${label}: ${g.current} of ${g.total} have a current review record (${share(g.current, g.total)}); ${g.stale} stale, ${g.none} with none`;
  return [
    `Content metrics as of ${today}: ${r.pageCount} live English pages and ${translation.translatedPages} guide translations in the repository.`,
    '',
    'MET-010 Reviewed coverage',
    line('health-adjacent pages (a health flag or a crisis route)', reviewed.health),
    line('all other pages', reviewed.other),
    '',
    'MET-011 Overdue reviews (12 months from the review date, else the last update)',
    `  ${overdue.overdue} of ${overdue.total - overdue.undated} dated pages are overdue; median ${overdue.medianDaysOver} days over; ${overdue.undated} have no date`,
    ...(overdue.healthFirst.length ? [`  first: ${overdue.healthFirst.join(', ')}`] : []),
    '',
    'MET-012 Translation coverage and staleness',
    `  ${translation.languages} languages; each has ${translation.min} to ${translation.max} of ${translation.liveEnglishGuides} live English guides`,
    `  ${translation.stalePages} of ${translation.translatedPages} translated pages behind a live English guide are stale; ${translation.nativeReviewedPages} are native-reviewed (the repository has no native review record, so that is a fixed 0 and not yet a measure)`,
    `  ${translation.behindRetiredGuides} more translations belong to retired English guides and are still live; ${translation.staleBehindRetired} of them are stale (pnpm translations:queue lists them)`,
    ...(rows ? translation.rows.map((x) => `    ${x.lang}: ${x.translated} of ${translation.liveEnglishGuides} translated, ${x.stale} stale`) : []),
    '',
    'MET-015 Source coverage on health-adjacent pages (a card has no field for a source)',
    `  ${sources.withDatedSource} of ${sources.total} have a dated source (${share(sources.withDatedSource, sources.total)}); ${sources.withSource} have at least one source`,
  ];
}
