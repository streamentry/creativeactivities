import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { englishGuideLanguages } from './english-guides';
import { ENGLISH_GUIDE_REDIRECTS, englishGuideRedirectLines } from './english-guide-redirects';
import { isRetiredGuide, redirectsFile } from './retired-guides';

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = resolve(HERE, '..', '..');
const LANGS = new Set(englishGuideLanguages(readFileSync(join(SITE, 'src', 'i18n', 'english-guides.txt'), 'utf8')));
const PAIRS = Object.entries(ENGLISH_GUIDE_REDIRECTS).flatMap(([lang, ids]) => ids.map((id) => [lang, id] as const));

describe('redirects for guides that moved to English', () => {
  it('covers only languages whose guides stay in English', () => {
    for (const lang of Object.keys(ENGLISH_GUIDE_REDIRECTS)) expect(LANGS.has(lang), lang).toBe(true);
  });

  it('sends each old address to a live English guide', () => {
    for (const [, id] of PAIRS) {
      expect(isRetiredGuide(id), id).toBe(false);
      expect(existsSync(join(SITE, 'src', 'content', 'guides', `${id}.md`)), id).toBe(true);
    }
  });

  it('redirects only addresses whose translation is gone, so no page is hidden behind a redirect', () => {
    const stillThere = PAIRS.filter(([lang, id]) => existsSync(join(SITE, 'src', 'content', 'guides-i18n', lang, `${id}.md`)));
    expect(stillThere).toEqual([]);
  });

  it('writes both address forms into _redirects, within the 2,000 static rule limit', () => {
    const file = redirectsFile();
    expect(englishGuideRedirectLines()).toContain('/za/activities/ideas/ /activities/ideas/ 301');
    for (const line of englishGuideRedirectLines()) expect(file).toContain(line);
    const rules = file.split('\n').filter((line) => line && !line.startsWith('#'));
    expect(rules.length).toBeLessThanOrEqual(2000);
  });
});
