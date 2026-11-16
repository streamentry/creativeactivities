/**
 * WEB-003: turns the site's pages into search entries. These functions take plain data, so the build
 * endpoint (`/search-index.json`) and the tests build entries the same way.
 */
import type { SearchEntry } from './search';

/** Hidden match text is capped so the index stays small to download. */
const MAX_TEXT = 900;
const clip = (text: string) => text.replace(/\s+/g, ' ').trim().slice(0, MAX_TEXT);

export interface CardData {
  name: string;
  summary: string;
  description: string;
  materials: readonly string[];
  enjoy?: string | undefined;
}

export interface HubData {
  title: string;
  description: string;
  eyebrow: string;
  lede: string;
  choosing: readonly string[];
}

export interface GuideData {
  title: string;
  description: string;
  summary: string;
  keyPoints?: readonly string[] | undefined;
}

export interface GameData {
  slug: string;
  name: string;
  short: string;
  description: string;
  intro: string;
}

/** `typeLabel` is the card's plain-words type ("Painting and drawing"), so "painting" finds it. */
export function cardEntry(id: string, d: CardData, typeLabel: string): SearchEntry {
  return {
    kind: 'activity',
    title: d.name,
    url: `/activity/${id}/`,
    summary: d.summary,
    text: clip([d.description, typeLabel, d.materials.join(' '), d.enjoy ?? ''].join(' ')),
  };
}

export function hubEntry(id: string, d: HubData): SearchEntry {
  return {
    kind: 'hub',
    title: d.title,
    url: `/${id}/`,
    summary: d.description,
    text: clip([d.eyebrow, d.lede, d.choosing.join(' ')].join(' ')),
  };
}

export function guideEntry(id: string, d: GuideData): SearchEntry {
  return {
    kind: 'guide',
    title: d.title,
    url: `/${id}/`,
    summary: d.description,
    text: clip([d.summary, (d.keyPoints ?? []).join(' ')].join(' ')),
  };
}

export function gameEntry(g: GameData): SearchEntry {
  return {
    kind: 'game',
    title: g.name,
    url: `/games/${g.slug}/`,
    summary: g.short,
    text: clip([g.description, g.intro].join(' ')),
  };
}

export interface SearchIndexFile {
  readonly version: 1;
  readonly entries: readonly SearchEntry[];
}

/** The file the search page downloads: every entry once, in a stable order. */
export function indexFile(entries: readonly SearchEntry[]): SearchIndexFile {
  const order = ['activity', 'hub', 'game', 'guide'];
  const sorted = [...entries].sort(
    (a, b) => order.indexOf(a.kind) - order.indexOf(b.kind) || a.title.localeCompare(b.title) || a.url.localeCompare(b.url),
  );
  const seen = new Set<string>();
  return { version: 1, entries: sorted.filter((e) => (seen.has(e.url) ? false : (seen.add(e.url), true))) };
}
