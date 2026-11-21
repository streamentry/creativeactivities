import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { englishGuideLanguages } from './english-guides';
import { isRetiredGuide } from './retired-guides';

/**
 * Languages in src/i18n/english-guides.txt show the English guide: machine translation of long
 * guides is not trustworthy there (maintainer decision, 2026-11-21). Their translations of live
 * guides must not exist; translations of retired guides may stay until every language's are retired.
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = resolve(HERE, '..', '..');
const GUIDES = join(SITE, 'src', 'content', 'guides');
const TRANSLATED = join(SITE, 'src', 'content', 'guides-i18n');

const LANGS = englishGuideLanguages(readFileSync(join(SITE, 'src', 'i18n', 'english-guides.txt'), 'utf8'));

function markdownUnder(dir: string, prefix = ''): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? markdownUnder(join(dir, entry.name), `${prefix}${entry.name}/`)
      : entry.name.endsWith('.md')
        ? [`${prefix}${entry.name}`]
        : [],
  );
}

describe('languages whose guides stay in English', () => {
  it('reads the list, ignoring comments', () => {
    expect(englishGuideLanguages('# a comment ab\nza  zu\n\n  # more\nyo')).toEqual(['za', 'zu', 'yo']);
  });

  it('lists only real site languages, once each', () => {
    expect(LANGS.length).toBeGreaterThan(0);
    expect(new Set(LANGS).size).toBe(LANGS.length);
    for (const lang of LANGS) expect(existsSync(join(TRANSLATED, lang)), lang).toBe(true);
  });

  it('has no translation of a live guide in those languages', () => {
    const live = new Set(markdownUnder(GUIDES).filter((rel) => !isRetiredGuide(rel.replace(/\.md$/, ''))));
    const found = LANGS.flatMap((lang) => markdownUnder(join(TRANSLATED, lang)).filter((rel) => live.has(rel)).map((rel) => `${lang}/${rel}`));
    expect(found).toEqual([]);
  });
});
