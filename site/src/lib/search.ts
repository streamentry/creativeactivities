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
}

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
  if (asked.length === 0) return { match: 'none', groups: [], count: 0 };
  const alts = asked.map(alternatives);

  const scored = prepared
    .map((p) => {
      const perWord = alts.map((a) => wordScore(p, a));
      const matched = perWord.filter((s) => s > 0).length;
      return { entry: p.entry, matched, score: perWord.reduce((a, b) => a + b, 0) };
    })
    .filter((h) => h.matched > 0);

  const full = scored.filter((h) => h.matched === asked.length);
  const chosen = full.length > 0 ? full : scored;
  const match: SearchResult['match'] = full.length > 0 ? 'all' : scored.length > 0 ? 'some' : 'none';

  // WEB-003: a question that reaches only guides still returns a card or situation the guide links to.
  // When no card or situation is in the set, add the ones linked from the matched guides.
  const guideHits = chosen.filter((h) => h.entry.kind === 'guide');
  const hasCardOrHub = chosen.some((h) => h.entry.kind === 'activity' || h.entry.kind === 'hub');
  if (guideHits.length > 0 && !hasCardOrHub) {
    const linked = linkedFromGuides(prepared, guideHits);
    if (linked.length > 0) return groupHits([...chosen, ...linked], perKind, match);
    // No card or situation links to the matched guides: the guides are still the best answer, so they stay.
    // Linking a card to each such guide is a content task (14 English guides had none on 2026-11-21).
  }
  return groupHits(chosen, perKind, match);
}

/** The cards and situations linked from the matched guides, each once, with the guide's own match. */
function linkedFromGuides(
  prepared: readonly Prepared[],
  guideHits: readonly { entry: SearchEntry; matched: number; score: number }[],
): { entry: SearchEntry; matched: number; score: number }[] {
  const byUrl = new Map(prepared.map((p) => [p.entry.url, p.entry] as const));
  const seen = new Set<string>();
  const out: { entry: SearchEntry; matched: number; score: number }[] = [];
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

function groupHits(
  chosen: readonly { entry: SearchEntry; matched: number; score: number }[],
  perKind: number,
  match: SearchResult['match'],
): SearchResult {
  const groups = KIND_ORDER.map((kind) => ({
    kind,
    hits: chosen
      .filter((h) => h.entry.kind === kind)
      .sort((a, b) => b.matched - a.matched || b.score - a.score || a.entry.title.localeCompare(b.entry.title))
      .slice(0, perKind)
      .map(({ entry, score }) => ({ entry, score })),
  })).filter((g) => g.hits.length > 0);

  return { match, groups, count: groups.reduce((n, g) => n + g.hits.length, 0) };
}
