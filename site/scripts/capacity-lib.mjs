// Hosting capacity (PLAT-015): what dist/ holds against what the host accepts. These functions are pure, so a test can
// feed them a list of files; check-capacity.mjs reads the disk and prints the result.
//
// The site is served by Workers Static Assets (wrangler.jsonc). The limits below are the ones Cloudflare documents, with
// the date they were read. Check the page again before relying on them: the host can change them.

export const LIMITS = Object.freeze({
  /** Files in one Worker version, Free plan. */
  filesFree: 20000,
  /** Files in one Worker version, Paid plan. */
  filesPaid: 100000,
  /** One asset file, either plan. */
  fileBytes: 25 * 1024 * 1024,
  source: 'https://developers.cloudflare.com/workers/platform/limits/',
  checked: '2026-11-17',
});

/** The share of the limit at which the next step should be chosen, and the share at which a release may not deploy. */
export const WARN_AT = 0.8;
export const FAIL_AT = 0.98;
/** The planning multiple in PLAT-015: ten times today's pages. */
export const GROWTH = 10;

const KIB = 1024;

/** A language folder holds a whole translated site, so it has at least this many files; a single page in a folder is not one. */
export const MIN_LOCALE_FILES = 10;

/**
 * A language folder is a top-level folder with a home page, whose name is a language code such as "de" or "pt-br", and
 * which holds a whole translated site. A section with a short name (such as "faq") or one page is not one.
 */
export function localeFolders(entries) {
  const files = new Map();
  const withHome = new Set();
  for (const { path } of entries) {
    const parts = path.split('/');
    if (parts.length < 2) continue;
    files.set(parts[0], (files.get(parts[0]) ?? 0) + 1);
    if (parts.length === 2 && parts[1] === 'index.html') withHome.add(parts[0]);
  }
  return [...withHome]
    .filter((name) => /^[a-z]{2,3}(?:-[a-z0-9]{2,8})?$/.test(name) && (files.get(name) ?? 0) >= MIN_LOCALE_FILES)
    .sort();
}

/** Counts for a list of files, each `{ path: 'de/index.html', bytes }` with a path relative to dist and "/" separators. */
export function summarize(entries) {
  let bytes = 0;
  let html = 0;
  let largest = null;
  const topLevel = new Map();
  for (const entry of entries) {
    bytes += entry.bytes;
    if (entry.path.endsWith('.html')) html += 1;
    if (!largest || entry.bytes > largest.bytes) largest = entry;
    const top = entry.path.includes('/') ? entry.path.slice(0, entry.path.indexOf('/')) : '(root)';
    topLevel.set(top, (topLevel.get(top) ?? 0) + 1);
  }
  return { files: entries.length, bytes, html, largest, topLevel, locales: localeFolders(entries) };
}

/**
 * How full the build is, against the Free limit by default (the repository does not say which plan the account is on, so
 * the safer one is assumed) or the Paid limit with plan "paid".
 */
export function assess(summary, { plan = 'free', limits = LIMITS } = {}) {
  const limit = plan === 'paid' ? limits.filesPaid : limits.filesFree;
  const share = summary.files / limit;
  const headroom = limit - summary.files;
  const perLocalePage = Math.max(1, summary.locales.length);
  const oversize = summary.largest && summary.largest.bytes > limits.fileBytes ? summary.largest : null;
  const projected = summary.files - summary.html + summary.html * GROWTH;
  let level = 'ok';
  if (share >= WARN_AT) level = 'warn';
  if (share >= FAIL_AT || oversize) level = 'fail';
  return {
    level,
    plan,
    limit,
    share,
    headroom,
    // A page type that exists in every language adds one file per language.
    // Counted to the level where the check fails, not to the plan's hard limit.
    pageTypesInHeadroom: Math.max(0, Math.floor((limit * FAIL_AT - summary.files) / perLocalePage)),
    perLocalePage,
    projected,
    projectedFitsFree: projected <= limits.filesFree,
    projectedFitsPaid: projected <= limits.filesPaid,
    oversize,
  };
}

const n = (value) => value.toLocaleString('en-US');
const mib = (bytes) => `${(bytes / (KIB * KIB)).toFixed(1)} MiB`;

/** The lines the check prints. */
export function describe(summary, result, limits = LIMITS) {
  const lines = [
    `Files in dist: ${n(summary.files)} (${n(summary.html)} pages), ${mib(summary.bytes)} in all.`,
    `Limit: ${n(result.limit)} files per version on the ${result.plan === 'paid' ? 'Paid' : 'Free'} plan (${n(limits.filesFree)} Free, ${n(limits.filesPaid)} Paid; ${limits.source}, read ${limits.checked}). In use: ${(result.share * 100).toFixed(1)}%. Headroom: ${n(result.headroom)} files.`,
    `Languages: ${summary.locales.length} folders. A page type that exists in every language adds about ${result.perLocalePage} files, so the headroom is about ${result.pageTypesInHeadroom} such page types.`,
  ];
  if (summary.largest) {
    lines.push(`Largest file: ${summary.largest.path} (${mib(summary.largest.bytes)}) of ${mib(limits.fileBytes)} allowed.`);
  }
  lines.push(
    `At ${GROWTH} times the pages: about ${n(result.projected)} files, ${result.projectedFitsPaid ? 'within' : 'over'} the Paid limit and ${result.projectedFitsFree ? 'within' : 'over'} the Free limit.`,
  );
  if (result.oversize) lines.push(`OVER THE FILE SIZE LIMIT: ${result.oversize.path}.`);
  return lines;
}
