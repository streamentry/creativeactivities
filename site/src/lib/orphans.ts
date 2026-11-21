/**
 * SEO-014: pure helpers for the orphan and generic-anchor check over the built pages. The script in
 * `scripts/check-orphans.mjs` reads `dist/` and calls these; nothing here touches the file system.
 */

const SITE_HOST = 'creativeactivities.org';
const BASE = `https://${SITE_HOST}`;

/** Anchor texts the spec does not allow to repeat on one page (SEO-014). */
export const GENERIC_ANCHORS: readonly string[] = ['read more', 'click here', 'learn more'];

export interface PageInfo {
  readonly path: string;
  readonly english: boolean;
  readonly indexable: boolean;
}

export interface RepeatedAnchor {
  readonly text: string;
  readonly count: number;
}

/** English pages are the ones whose `<html lang>` is English. Other languages sit under their own folder. */
export function isEnglishPage(html: string): boolean {
  return /<html[^>]*\blang="en(?:-[^"]*)?"/i.test(html);
}

/** A page is indexable unless its robots meta says noindex. */
export function isIndexable(html: string): boolean {
  const robots = html.match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? '';
  return !/noindex/i.test(robots);
}

/**
 * The page path a link points to, with a trailing slash for pages (`/activity/x` becomes `/activity/x/`).
 * Returns null for hash-only, mail, phone and other-site links, which are not internal.
 */
export function normalizeTarget(href: string, fromPath: string): string | null {
  const raw = href.trim();
  if (raw === '' || raw.startsWith('#')) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.startsWith('//')) {
    const absolute = raw.startsWith('//') ? `https:${raw}` : raw;
    let url: URL;
    try {
      url = new URL(absolute);
    } catch {
      return null;
    }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (url.hostname !== SITE_HOST) return null;
    return withTrailingSlash(url.pathname);
  }
  const resolved = new URL(raw, `${BASE}${fromPath}`);
  return withTrailingSlash(resolved.pathname);
}

/** Pages end in a slash; a last segment with a file extension (such as `.pdf`) is left as it is. */
function withTrailingSlash(pathname: string): string {
  if (pathname.endsWith('/') || /\.[a-z0-9]+$/i.test(pathname.split('/').pop() ?? '')) return pathname;
  return `${pathname}/`;
}

const plainText = (fragment: string): string =>
  fragment
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

/** Every internal link target on a page, and the anchor text of every link (internal or not). */
export function pageLinks(html: string, fromPath: string): { links: string[]; anchors: string[] } {
  const links: string[] = [];
  const anchors: string[] = [];
  for (const match of html.matchAll(/<a\b[^>]*?\shref=(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi)) {
    const target = normalizeTarget(match[2] ?? '', fromPath);
    if (target !== null) links.push(target);
    anchors.push(plainText(match[3] ?? ''));
  }
  return { links, anchors };
}

/**
 * Indexable English pages that no other page links to. `outgoing` maps each page to the internal targets it
 * links to; a page's own links do not count. Links from any page count, including noindex and other-language pages.
 */
export function findOrphans(pages: readonly PageInfo[], outgoing: ReadonlyMap<string, readonly string[]>): string[] {
  const linkedFrom = new Map<string, Set<string>>();
  for (const [from, targets] of outgoing) {
    for (const to of targets) {
      if (to === from) continue;
      const sources = linkedFrom.get(to) ?? new Set<string>();
      sources.add(from);
      linkedFrom.set(to, sources);
    }
  }
  return pages
    .filter((p) => p.english && p.indexable && !(linkedFrom.get(p.path)?.size))
    .map((p) => p.path)
    .sort();
}

/** Generic anchor texts that occur more than once on one page. Case and punctuation are ignored. */
export function repeatedGenericAnchors(anchors: readonly string[]): RepeatedAnchor[] {
  const counts = new Map<string, number>();
  for (const anchor of anchors) {
    const key = anchor
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (GENERIC_ANCHORS.includes(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts].filter(([, count]) => count > 1).map(([text, count]) => ({ text, count }));
}
