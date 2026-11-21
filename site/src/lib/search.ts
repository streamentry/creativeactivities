/**
 * WEB-003: site search over activity cards, situations (hubs), guides and games.
 *
 * Pure functions, run in the visitor's browser over `/search-index.json`. Nothing here sends, stores or
 * counts what a person types. Matching is by word (with a light stem and an editor-owned synonym list), so
 * "painting", "paints" and "watercolour" meet; it never reads a phrase as a condition, and it suggests nothing.
 */
import { PHRASES, STOPWORDS, SYNONYM_GROUPS } from '../data/search-synonyms';

export type SearchKind = 'activity' | 'hub' | 'game' | 'guide';

export interface SearchEntry {
  readonly kind: SearchKind;
  readonly title: string;
  readonly url: string;
  /** One line shown under the title. */
  readonly summary: string;
  /** Extra words that match but are not shown. */
  readonly text: string;
  /** Guides only: the addresses of the cards and situations that link to this guide. */
  readonly linked?: readonly string[];
}

/** The order results are shown in: activities first, then situations, games, then guides. */
export const KIND_ORDER: readonly SearchKind[] = ['activity', 'hub', 'game', 'guide'];

export const KIND_LABELS: Readonly<Record<SearchKind, string>> = {
  activity: 'Activities',
  hub: 'Situations',
  game: 'Games',
  guide: 'Guides',
};

/** Lowercase, fold phrases to one word, and reduce everything else to letters, digits and spaces. */
export function normalize(text: string): string {
  let out = ` ${text.toLowerCase().replace(/[‘’]/g, "'").replace(/[-–—]/g, ' ')} `.replace(/[^\p{L}\p{N}'\s]/gu, ' ');
  out = out.replace(/\s+/g, ' ');
  for (const [phrase, word] of PHRASES) out = out.split(` ${phrase} `).join(` ${word} `);
  return out.replace(/'/g, '').trim();
}

/** A light stem: "painting", "paints" and "painted" all reduce to "paint". Short words are left alone. */
export function stem(word: string): string {
  if (word.length <= 3) return word;
  if (word.endsWith('ies') && word.length > 4) return `${word.slice(0, -3)}y`;
  if (word.endsWith('ing') && word.length > 5) return word.slice(0, -3);
  if (word.endsWith('ed') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('es') && word.length > 4 && /(?:ch|sh|x|s|z)es$/.test(word)) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

/** The meaningful words of a text as stems, in order, with filler removed. */
export function words(text: string): string[] {
  return normalize(text)
    .split(' ')
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
    .map(stem);
}

/** Every stem in a synonym group maps to the whole group's stems. */
const GROUP_OF: ReadonlyMap<string, readonly string[]> = (() => {
  const map = new Map<string, readonly string[]>();
  for (const group of SYNONYM_GROUPS) {
    const stems = [...new Set(group.map(stem))];
    for (const s of stems) map.set(s, stems);
  }
  return map;
})();

/** The stems that count as the same word as `word` (itself when it has no synonyms). */
export function alternatives(wordStem: string): readonly string[] {
  return GROUP_OF.get(wordStem) ?? [wordStem];
}

export interface Prepared {
  readonly entry: SearchEntry;
  readonly title: ReadonlySet<string>;
  readonly summary: ReadonlySet<string>;
  readonly text: ReadonlySet<string>;
}

/** Splits each entry into word sets once, so each search is a few set lookups. */
export function prepare(entries: readonly SearchEntry[]): Prepared[] {
  return entries.map((entry) => ({
    entry,
    title: new Set(words(entry.title)),
    summary: new Set(words(entry.summary)),
    text: new Set(words(entry.text)),
  }));
}

export interface SearchHit {
  readonly entry: SearchEntry;
  readonly score: number;
}

export interface SearchResult {
  /** `all`: every word matched. `some`: only part of the question matched. `none`: nothing matched. */
  readonly match: 'all' | 'some' | 'none';
  readonly groups: readonly { kind: SearchKind; hits: readonly SearchHit[] }[];
  readonly count: number;
  /** WEB-003: true when no activity card or situation is in the answer, so the page offers the activity finder. */
  readonly finder: boolean;
}

/** How many closest cards or situations are added when a question reaches only games or guides. */
const NEAREST_CARDS = 5;

type Scored = { entry: SearchEntry; matched: number; score: number };

const WEIGHT = { title: 6, summary: 3, text: 1 } as const;

/** Score of one word in one entry: the best place it appears, or 0. */
function wordScore(p: Prepared, alts: readonly string[]): number {
  if (alts.some((a) => p.title.has(a))) return WEIGHT.title;
  if (alts.some((a) => p.summary.has(a))) return WEIGHT.summary;
  if (alts.some((a) => p.text.has(a))) return WEIGHT.text;
  return 0;
}

/**
 * Finds entries for a question. An entry must match every word to count as a full match. When no entry does,
 * the entries matching some of the words are shown as closest matches. A question with no meaningful word
 * returns nothing, so the page can say so.
 */
export function search(prepared: readonly Prepared[], question: string, perKind = 20): SearchResult {
  const asked = [...new Set(words(question))];
  if (asked.length === 0) return { match: 'none', groups: [], count: 0, finder: true };
  const alts = asked.map(alternatives);

  const scored: Scored[] = prepared
    .map((p) => {
      const perWord = alts.map((a) => wordScore(p, a));
      const matched = perWord.filter((s) => s > 0).length;
      return { entry: p.entry, matched, score: perWord.reduce((a, b) => a + b, 0) };
    })
    .filter((h) => h.matched > 0);

  const full = scored.filter((h) => h.matched === asked.length);
  const chosen = full.length > 0 ? full : scored;
  const match: SearchResult['match'] = full.length > 0 ? 'all' : scored.length > 0 ? 'some' : 'none';

  // WEB-003: every answer leads to a card or situation where one can be found. When none can be found, the
  // matching guides and games still show, and `finder` makes the page offer the activity finder beside them.
  return groupHits(withCardOrSituation(prepared, scored, chosen), perKind, match);
}

const isCardOrSituation = (h: Scored): boolean => h.entry.kind === 'activity' || h.entry.kind === 'hub';

/**
 * Adds cards and situations to an answer that has none: first those linked from its guides, then, if still none,
 * the closest ones from the whole question (those sharing at least one word), at most NEAREST_CARDS.
 */
function withCardOrSituation(prepared: readonly Prepared[], scored: readonly Scored[], chosen: readonly Scored[]): Scored[] {
  if (chosen.some(isCardOrSituation)) return [...chosen];
  const linked = linkedFromGuides(prepared, chosen.filter((h) => h.entry.kind === 'guide'));
  const withLinked = [...chosen, ...linked];
  if (withLinked.some(isCardOrSituation)) return withLinked;
  const nearest = scored
    .filter(isCardOrSituation)
    .sort((a, b) => b.matched - a.matched || b.score - a.score || a.entry.title.localeCompare(b.entry.title))
    .slice(0, NEAREST_CARDS);
  return [...withLinked, ...nearest];
}

/** The cards and situations linked from the matched guides, each once, with the guide's own match. */
function linkedFromGuides(prepared: readonly Prepared[], guideHits: readonly Scored[]): Scored[] {
  const byUrl = new Map(prepared.map((p) => [p.entry.url, p.entry] as const));
  const seen = new Set<string>();
  const out: Scored[] = [];
  for (const guide of guideHits) {
    for (const url of guide.entry.linked ?? []) {
      const target = byUrl.get(url);
      if (!target || target.kind === 'guide' || target.kind === 'game' || seen.has(url)) continue;
      seen.add(url);
      out.push({ entry: target, matched: guide.matched, score: guide.score });
    }
  }
  return out;
}

function groupHits(chosen: readonly Scored[], perKind: number, match: SearchResult['match']): SearchResult {
  const groups = KIND_ORDER.map((kind) => ({
    kind,
    hits: chosen
      .filter((h) => h.entry.kind === kind)
      .sort((a, b) => b.matched - a.matched || b.score - a.score || a.entry.title.localeCompare(b.entry.title))
      .slice(0, perKind)
      .map(({ entry, score }) => ({ entry, score })),
  })).filter((g) => g.hits.length > 0);

  return {
    match,
    groups,
    count: groups.reduce((n, g) => n + g.hits.length, 0),
    finder: !chosen.some(isCardOrSituation),
  };
}
