// The re-review queue for stale translations (L10N-021): translated guides made from an English page
// that has since changed, protected guides first. Informational: it never fails the build.
// Usage: node scripts/translation-queue.mjs [--lang <folder>] [--fail-on-protected]
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { daysBehind, groupByGuide, isProtected, isStale, queueOrder, readFreshnessFields } from './translation-freshness-lib.mjs';

const content = fileURLToPath(new URL('../src/content/', import.meta.url));
const retiredSource = fileURLToPath(new URL('../src/lib/retired-guides.ts', import.meta.url));

/**
 * The retired English guide ids, read from the RETIRED_GUIDES table in src/lib/retired-guides.ts. They keep
 * their files so their translations stay live until replaced (maintainer decision, 2026-11-15), so a
 * translation behind a retired guide is not queued for re-review. A test keeps this read equal to the table.
 * @param {string} source the text of retired-guides.ts
 */
export function parseRetiredIds(source = readFileSync(retiredSource, 'utf8')) {
  const table = source.match(/export const RETIRED_GUIDES[^{]*\{([\s\S]*?)\n\};/)?.[1] ?? '';
  return [...table.matchAll(/^\s+'([a-z0-9-]+\/[a-z0-9-]+)':/gm)].map((m) => m[1]);
}

function markdown(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return markdown(path);
    return name.endsWith('.md') ? [path] : [];
  });
}

const frontmatterOf = (path) => readFileSync(path, 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';

/**
 * @typedef {{
 *   id: string, lang: string, file: string,
 *   translatedFrom: string | null, englishUpdated: string | null,
 *   protected: boolean, retired: boolean, stale: boolean, daysBehind: number,
 * }} Translation
 */

/**
 * Every translated guide, with whether it is stale against its English source.
 * @param {string} root the src/content folder
 * @param {Set<string>} retired English guide ids that are retired
 * @returns {Translation[]}
 */
export function readTranslations(root = content, retired = new Set(parseRetiredIds())) {
  const englishRoot = join(root, 'guides');
  const i18nRoot = join(root, 'guides-i18n');
  if (!existsSync(i18nRoot)) return [];
  return markdown(i18nRoot).flatMap((file) => {
    const [lang, ...rest] = relative(i18nRoot, file).split(/[\\/]/);
    const id = rest.join('/').replace(/\.md$/, '');
    const englishFile = join(englishRoot, `${id}.md`);
    if (!existsSync(englishFile)) return [];
    const english = readFreshnessFields(frontmatterOf(englishFile));
    const translated = readFreshnessFields(frontmatterOf(file));
    const stale = isStale(translated.translatedFrom ?? '', english.updated ?? '');
    return [
      {
        id,
        lang,
        file: relative(root, file),
        translatedFrom: translated.translatedFrom,
        englishUpdated: english.updated,
        protected: isProtected(english),
        retired: retired.has(id),
        stale,
        daysBehind: stale ? daysBehind(translated.translatedFrom ?? '', english.updated ?? '') : 0,
      },
    ];
  });
}

/**
 * Stale translations of a live English guide, in re-review order. Retired guides are not queued.
 * @param {Translation[]} translations
 * @returns {Translation[]}
 */
export const staleQueue = (translations) => queueOrder(translations.filter((t) => t.stale && !t.retired));

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const all = readTranslations();
  const queue = staleQueue(all);
  const behindRetired = all.filter((t) => t.stale && t.retired);
  const langs = new Set(queue.map((q) => q.lang));
  const protectedStale = queue.filter((q) => q.protected);
  console.log(`${queue.length} of ${all.length} translated guides are stale against a live English guide, in ${langs.size} languages.`);
  console.log(`${protectedStale.length} of them are protected guides (health advice or the crisis route).`);
  console.log(`${behindRetired.length} more are behind a retired English guide; those stay live until replaced and are not queued.`);
  const langArg = process.argv.indexOf('--lang');
  if (langArg !== -1) {
    const lang = process.argv[langArg + 1];
    for (const q of queue.filter((item) => item.lang === lang)) console.log(`  ${q.protected ? '[protected] ' : ''}${q.file} (${q.daysBehind} days behind)`);
  } else {
    for (const g of groupByGuide(queue)) {
      console.log(`  ${g.protected ? '[protected] ' : ''}${g.id}: ${g.languages.length} languages, up to ${g.daysBehind} days behind`);
    }
  }
  if (process.argv.includes('--fail-on-protected') && protectedStale.length > 0) process.exit(1);
}
