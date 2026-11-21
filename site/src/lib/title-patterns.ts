/**
 * Title and H1 pattern check (SEO-006, SEO-015). Pure functions only; the
 * build-output reader lives in scripts/check-duplicates.mjs.
 *
 * A pattern is a title or H1 with the page's own subject replaced by
 * `{subject}` and case and whitespace normalised. Pages built from one
 * template share a pattern by design, so a pattern group is not a problem by
 * itself. A collision is two indexable pages of the same language and page
 * type that also share the subject: those two pages cannot be told apart by
 * their title or H1 and compete for the same query.
 */

export const SITE_TITLE_SUFFIX = ' | Creative Activities';

export type PatternPageType = 'activity' | 'hub' | 'guide' | 'game' | 'printable' | 'other';

export interface PageTypeContext {
  /** Top-level folders that hold guides (`<section>/<slug>`) and section indexes (`<section>/`). */
  guideSections: ReadonlySet<string>;
  /** Top-level hub slugs (`/<slug>/`), taken from the hubs content collection. */
  hubSlugs: ReadonlySet<string>;
}

/**
 * Page type from a built path such as `/fr/activity/draw-to-music/`. The
 * language prefix is removed first, using the same rule as check-duplicates.mjs.
 */
export function pageTypeOf(path: string, lang: string, ctx: PageTypeContext): PatternPageType {
  const segments = path.split('/').filter(Boolean);
  if (lang !== 'en' && segments[0] === lang.toLowerCase()) segments.shift();
  const [first, second, third, ...rest] = segments;
  if (first === undefined) return 'other';

  if (first === 'activity') {
    if (second === 'packs') return 'other';
    if (second === undefined) return 'other';
    if (third === undefined && rest.length === 0) return 'activity';
    if (third === 'large-print' && rest.length === 0) return 'printable';
    return 'other';
  }
  if (first === 'printables') return 'printable';
  if (first === 'games') {
    if (second === undefined) return 'hub';
    return rest.length === 0 && third === undefined ? 'game' : 'other';
  }
  if (first === 'paths' || first === 'occasions' || first === 'seasons') {
    return second !== undefined && third === undefined ? 'hub' : 'other';
  }
  if (ctx.guideSections.has(first)) {
    if (second === undefined) return 'hub';
    return third === undefined ? 'guide' : 'other';
  }
  if (ctx.hubSlugs.has(first) && second === undefined) return 'hub';
  return 'other';
}

/** Lowercase, NFKC, and whitespace collapsed to single spaces (non-breaking spaces included). */
export function normalisePatternText(text: string): string {
  return text.normalize('NFKC').replace(/[\s ]+/g, ' ').trim().toLowerCase();
}

/** Removes the brand suffix from the end of a title, if present. */
export function stripSiteSuffix(title: string, suffix: string = SITE_TITLE_SUFFIX): string {
  return title.endsWith(suffix) ? title.slice(0, -suffix.length) : title;
}

/**
 * The subject of a page: the text of its current-page breadcrumb, with tags
 * removed. Undefined when the page has no breadcrumb. Entities are not decoded
 * here; the caller decodes.
 */
export function breadcrumbCurrent(html: string): string | undefined {
  const match = html.match(/<nav class="breadcrumbs[^"]*"[\s\S]*?<span aria-current="page">([\s\S]*?)<\/span>/);
  if (!match) return undefined;
  return match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Pattern of a title or H1: the subject (normalised) replaced by `{subject}`,
 * every occurrence, and the rest normalised. Without a subject only the
 * normalisation applies.
 */
export function patternOf(text: string, subject: string | undefined): string {
  const normalised = normalisePatternText(text);
  const normalisedSubject = subject ? normalisePatternText(subject) : '';
  if (!normalisedSubject) return normalised;
  return normalised.split(normalisedSubject).join('{subject}');
}

export interface PatternEntry {
  id: string;
  lang: string;
  type: PatternPageType;
  title: string;
  h1: string;
  /** Breadcrumb subject; undefined or empty when the page has none. */
  subject: string | undefined;
}

export interface PatternCollision {
  lang: string;
  type: PatternPageType;
  subject: string;
  titlePattern: string;
  h1Pattern: string;
  ids: string[];
}

/**
 * Collisions: two or more entries with the same language, page type, title
 * pattern, H1 pattern and normalised subject. Entries without a title or H1
 * are skipped. Output is sorted by language, type, then first id.
 */
export function patternCollisions(entries: readonly PatternEntry[]): PatternCollision[] {
  const groups = new Map<string, PatternCollision>();
  for (const e of entries) {
    if (!e.title.trim() || !e.h1.trim()) continue;
    const subject = e.subject ? normalisePatternText(e.subject) : '';
    const titlePattern = patternOf(stripSiteSuffix(e.title), e.subject);
    const h1Pattern = patternOf(e.h1, e.subject);
    const key = JSON.stringify([e.lang, e.type, titlePattern, h1Pattern, subject]);
    const group = groups.get(key);
    if (group) group.ids.push(e.id);
    else groups.set(key, { lang: e.lang, type: e.type, subject, titlePattern, h1Pattern, ids: [e.id] });
  }
  return [...groups.values()]
    .filter((g) => g.ids.length > 1)
    .sort((a, b) => a.lang.localeCompare(b.lang) || a.type.localeCompare(b.type) || a.ids[0].localeCompare(b.ids[0]));
}
