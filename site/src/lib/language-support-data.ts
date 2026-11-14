import { GAMES } from '../data/games';
import { gameAvailable } from '../i18n/games';
import { allGuides } from '../i18n/guides';
import { isIndexable, localePath } from '../i18n/locales';
import { PUBLISHED } from '../i18n/ui';
import { type LanguageSupport } from './language-support';
import { SITE } from './site';
import { sitemapPath } from './sitemap';
import { sitemapEntries } from './sitemap-entries';

/** Top-level paths such as `/` or `/about/`, not game or guide pages. */
const isTopLevel = (path: string): boolean => path.split('/').filter(Boolean).length <= 1;

/** What the site offers in each indexable language, from the same data as the pages and sitemaps. */
export async function languageSupport(totalGuides: number): Promise<LanguageSupport> {
  const entries = await sitemapEntries();
  const localGuides = await allGuides();
  const langs = PUBLISHED.filter((l) => isIndexable(l.code));
  return {
    siteUrl: SITE.url,
    totalGames: GAMES.length,
    totalGuides,
    everyLanguagePaths: entries.filter((e) => isTopLevel(e.path) && langs.every((l) => e.langs.includes(l.code))).map((e) => e.path),
    englishOnlyPaths: entries.filter((e) => e.langs.length === 1 && e.langs[0] === 'en').map((e) => e.path),
    rows: langs.map((l) => ({
      code: l.code,
      bcp47: l.bcp47,
      name: l.name,
      englishName: l.englishName,
      dir: l.dir,
      home: `${SITE.url}${localePath(l.code, '/')}`,
      sitemap: `${SITE.url}${sitemapPath(l.code)}`,
      pages: entries.filter((e) => e.langs.includes(l.code)).length,
      missingGames: GAMES.filter((g) => !gameAvailable(g.slug, l.code)).map((g) => g.name),
      guides: localGuides.filter((g) => g.lang === l.code).length,
    })),
  };
}
