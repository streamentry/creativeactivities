import { getCollection, type CollectionEntry } from 'astro:content';
import { DEFAULT_LOCALE, LOCALES, localeOfContentDir } from './locales';
import { PUBLISHED } from './ui';
import { guideIdOfPath, guidePath, isRetiredGuide } from '../lib/retired-guides';

export type GuideEntry = CollectionEntry<'guides'> | CollectionEntry<'guidesI18n'>;

/** A guide in one language: `id` is the shared `<section>/<slug>`. */
export interface LocalGuide {
  id: string;
  lang: string;
  entry: GuideEntry;
}

const CODES = new Set(LOCALES.map((l) => l.code));
const PUBLISHED_CODES = new Set(PUBLISHED.map((l) => l.code));

let cache: LocalGuide[] | undefined;

/**
 * Every live guide in every published language, English first. A retired
 * English guide (lib/retired-guides.ts) has no English page, but its
 * translations stay live until they are replaced.
 */
export async function allGuides(): Promise<LocalGuide[]> {
  if (cache) return cache;
  const englishAll = (await getCollection('guides')).map((entry) => ({ id: entry.id, lang: DEFAULT_LOCALE, entry }));
  const englishIds = new Set(englishAll.map((e) => e.id));
  const english = englishAll.filter((e) => !isRetiredGuide(e.id));
  const translated = (await getCollection('guidesI18n'))
    .map((entry) => {
      // Entry ids arrive lowercased (`pt-br/...`); map the folder back to its code (`pt-BR`).
      const [dir, ...rest] = entry.id.split('/');
      return { id: rest.join('/'), lang: localeOfContentDir(dir as string) ?? '', entry };
    })
    .filter((g) => CODES.has(g.lang) && PUBLISHED_CODES.has(g.lang) && englishIds.has(g.id));
  cache = [...english, ...translated];
  return cache;
}

/** Languages a guide exists in. */
export async function guideLanguages(id: string): Promise<string[]> {
  return (await allGuides()).filter((g) => g.id === id).map((g) => g.lang);
}

/** The guide in `lang`, or `undefined` when it is not translated. */
export async function findGuide(lang: string, id: string): Promise<LocalGuide | undefined> {
  return (await allGuides()).find((g) => g.lang === lang && g.id === id);
}

/**
 * The page a guide reference leads to in `lang`: the translation when there
 * is one, else the English guide, else (for a retired guide) the English page
 * it now redirects to. `undefined` only when nothing fits.
 */
export async function resolveGuide(lang: string, id: string): Promise<LocalGuide | undefined> {
  const local = await findGuide(lang, id);
  if (local) return local;
  const english = await findGuide(DEFAULT_LOCALE, id);
  if (english) return english;
  const target = guideIdOfPath(guidePath(id));
  return target && target !== id ? findGuide(DEFAULT_LOCALE, target) : undefined;
}

/**
 * Guides of one section in `lang`, falling back to English per guide. A
 * translated section also keeps its translations of retired guides.
 */
export async function sectionGuides(lang: string, section: string): Promise<LocalGuide[]> {
  const all = await allGuides();
  const inSection = all.filter((g) => g.entry.data.section === section);
  const ids = new Set(inSection.filter((g) => g.lang === DEFAULT_LOCALE || g.lang === lang).map((g) => g.id));
  return [...ids]
    .map((id) => inSection.find((g) => g.lang === lang && g.id === id) ?? inSection.find((g) => g.lang === DEFAULT_LOCALE && g.id === id))
    .filter((g): g is LocalGuide => g !== undefined)
    .sort((a, b) => a.entry.data.order - b.entry.data.order);
}
