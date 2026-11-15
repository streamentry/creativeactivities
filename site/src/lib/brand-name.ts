import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * L10N-008: the product was renamed from "Golden Moments" (old domain
 * dementiaactivities.games) to "Creative Activities" on 2026-11-13. This module
 * finds the old name and old domain in launched content. Records and redirects
 * are allowlisted here with a reason; translated copy that needs a native
 * reviewer is listed here too, not edited.
 */

export type AllowKind = 'record' | 'redirect' | 'store-url' | 'native-review';

export interface AllowedHits {
  /** Repository-relative path. */
  file: string;
  /** Exact number of hits that are allowed in this file. */
  hits: number;
  kind: AllowKind;
  reason: string;
}

export interface BrandHit {
  term: 'old-name' | 'old-domain';
  /** 1-based line of the start of the match. */
  line: number;
  text: string;
}

/** "Golden Moments" with any whitespace, hyphen or %20 between the words; also reversed (a translation may reverse the order). */
const OLD_NAME = /\bgolden(?:\s|-|%20|\+)+moments\b|\bmoments(?:\s|-|%20|\+)+golden\b/giu;
const OLD_DOMAIN = /dementiaactivities\.games/giu;

export function findOldBrand(text: string): BrandHit[] {
  const hits: BrandHit[] = [];
  for (const [term, pattern] of [
    ['old-name', OLD_NAME],
    ['old-domain', OLD_DOMAIN],
  ] as const) {
    for (const match of text.matchAll(new RegExp(pattern.source, pattern.flags))) {
      const index = match.index ?? 0;
      const line = text.slice(0, index).split('\n').length;
      hits.push({ term, line, text: match[0] });
    }
  }
  return hits.sort((a, b) => a.line - b.line);
}

const TEXT_EXTENSIONS = new Set([
  '.md', '.json', '.jsonc', '.js', '.mjs', '.ts', '.tsx', '.astro', '.arb', '.txt', '.html', '.xml',
  '.webmanifest', '.svg', '.css', '.yaml', '.yml', '.toml',
]);

/** Launched content: the site source and public files, the Flutter ARB strings, store metadata, and the redirect workers. */
const SCOPE_ROOTS = [
  'site/src',
  'site/public',
  'site/redirect-www',
  'site/redirect-www-creative',
  'site/wrangler.jsonc',
  'lib/l10n/arb',
  'metadata',
  'docs/store-description',
];

/** This module and its test contain the pattern and reasons, so they are not scanned. */
const SELF = new Set(['site/src/lib/brand-name.ts', 'site/src/lib/brand-name.test.ts']);

function walk(path: string, out: string[]): void {
  const stat = statSync(path);
  if (stat.isDirectory()) {
    for (const name of readdirSync(path)) {
      if (name === 'node_modules' || name === 'dist' || name.startsWith('.')) continue;
      walk(join(path, name), out);
    }
    return;
  }
  const dot = path.lastIndexOf('.');
  if (dot !== -1 && TEXT_EXTENSIONS.has(path.slice(dot).toLowerCase())) out.push(path);
}

/** Every launched text file, as absolute paths. */
export function scopeFiles(repoRoot: string): string[] {
  const out: string[] = [];
  for (const root of SCOPE_ROOTS) {
    try {
      walk(join(repoRoot, root), out);
    } catch {
      // A root that does not exist in this checkout contributes no files.
    }
  }
  return out.filter((file) => !SELF.has(relative(repoRoot, file).split('\\').join('/')));
}

/** Hits per repository-relative file, only for files that have at least one hit. */
export function scanFiles(repoRoot: string, files: string[]): Map<string, BrandHit[]> {
  const result = new Map<string, BrandHit[]>();
  for (const file of files) {
    const hits = findOldBrand(readFileSync(file, 'utf8'));
    if (hits.length) result.set(relative(repoRoot, file).split('\\').join('/'), hits);
  }
  return result;
}

const STORE_HISTORY =
  'Store-copy history note: it names the old brand only to say what the older description was, before the 2026-11-13 rename. The older text stays in git history.';

const TRANSLATED_GUIDE_LINE_BREAK =
  'Translated copy in a summary: the old name is split across a line break ("Golden" then "Moments"). A translated product name needs a native reviewer (L10N-008, native review). Not edited.';

const WORKER_REDIRECT =
  'Redirect or Worker configuration for the old domain (dementiaactivities.games). Needed while that host redirects or serves its own site; not copy.';

/** Translated guides whose summary keeps the old name, one hit each (see the Golden/Moments split above). */
const TRANSLATED_GUIDE_HITS: AllowedHits[] = [
  ['an', 'activities/finish-the-saying.md'],
  ['co', 'activities/online-games.md'],
  ['cu', 'activities/online-games.md'],
  ['ee', 'activities/finish-the-saying.md'],
  ['es', 'activities/finish-the-saying.md'],
  ['fi', 'activities/finish-the-saying.md'],
  ['fr', 'activities/finish-the-saying.md'],
  ['id', 'activities/online-games.md'],
  ['it', 'activities/online-games.md'],
  ['jv', 'activities/online-games.md'],
  ['ms', 'activities/online-games.md'],
  ['nl', 'activities/finish-the-saying.md'],
  ['tw', 'activities/finish-the-saying.md'],
  ['uk', 'activities/finish-the-saying.md'],
].map(([locale, page]) => ({
  file: `site/src/content/guides-i18n/${locale}/${page}`,
  hits: 1,
  kind: 'native-review' as const,
  reason: TRANSLATED_GUIDE_LINE_BREAK,
}));

const STORE_DESCRIPTION_FILES = [
  'README', 'ar', 'de', 'es', 'fr', 'hi', 'it', 'ja', 'ko', 'nl', 'no', 'pt', 'ru', 'sv', 'vi', 'zh-cn', 'zh-tw',
];

export const BRAND_ALLOWLIST: AllowedHits[] = [
  ...STORE_DESCRIPTION_FILES.map((name) => ({
    file: `docs/store-description/${name}.md`,
    hits: 1,
    kind: 'record' as const,
    reason: STORE_HISTORY,
  })),
  ...TRANSLATED_GUIDE_HITS,
  {
    file: 'site/src/i18n/ui/ff.json',
    hits: 1,
    kind: 'native-review',
    reason:
      'Fula default image alt text still uses the old name, reversed ("Moments Golden"). A translated product name needs a native reviewer. Not edited.',
  },
  {
    file: 'site/src/lib/site.ts',
    hits: 1,
    kind: 'store-url',
    reason:
      'App Store link path keeps the listing slug from the old name. Apple resolves the link by app ID (id6749312459), and the store listing name is now Creative Activities Together. A maintainer should confirm the live listing name.',
  },
  {
    file: 'site/redirect-www/index.js',
    hits: 1,
    kind: 'redirect',
    reason: WORKER_REDIRECT,
  },
  {
    file: 'site/redirect-www/wrangler.jsonc',
    hits: 2,
    kind: 'redirect',
    reason: WORKER_REDIRECT,
  },
  {
    file: 'site/redirect-www-creative/wrangler.jsonc',
    hits: 1,
    kind: 'redirect',
    reason: WORKER_REDIRECT,
  },
  {
    file: 'site/wrangler.jsonc',
    hits: 1,
    kind: 'redirect',
    reason: WORKER_REDIRECT,
  },
];
