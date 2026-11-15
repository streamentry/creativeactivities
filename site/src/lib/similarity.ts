/**
 * Near-duplicate detection and the SEO-007 minimum bar (SEO-015, SEO-007).
 *
 * Pure functions: no DOM, no file access. The release script
 * (scripts/check-duplicates.mjs) loads this file with Node's built-in type
 * stripping, so keep to plain type annotations (no enums, no parameter
 * properties, no namespaces).
 *
 * Method: normalised words, 5-word shingles hashed to 32-bit integers,
 * MinHash signatures, LSH banding to find candidate pairs, then exact
 * Jaccard similarity on the shingle sets to confirm each candidate.
 */

/** Words per shingle. Five words catch reused sentences without flagging shared single phrases. */
export const SHINGLE_SIZE = 5;

/** MinHash signature length. 120 divides evenly into the band and row choices used here. */
export const DEFAULT_NUM_HASHES = 120;

/** Pages with fewer shingles than this cannot be compared meaningfully (about 35 words). */
export const DEFAULT_MIN_SHINGLES = 30;

/**
 * Scripts written without spaces between words. Each character is treated
 * as one word so that shingles still work on them (an approximation: a
 * character n-gram, not a segmented word).
 */
const UNSPACED_SCRIPT = /([\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Thai}\p{Script=Lao}\p{Script=Khmer}\p{Script=Myanmar}])/gu;

/** Lowercase, compatibility-normalised text with punctuation reduced to single spaces. */
export function normaliseText(text: string): string {
  return text
    .normalize('NFKD')
    .replace(UNSPACED_SCRIPT, ' $1 ')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFC');
}

/** The words of a text, after normalisation. */
export function words(text: string): string[] {
  const normalised = normaliseText(text);
  return normalised === '' ? [] : normalised.split(' ');
}

/** 32-bit FNV-1a hash of a string. Stable across runs and platforms. */
export function hashString(value: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * The set of hashed shingles of a word list: every run of `size` consecutive
 * words. A list shorter than `size` has none.
 */
export function shingles(wordList: readonly string[], size: number = SHINGLE_SIZE): Set<number> {
  const out = new Set<number>();
  for (let i = 0; i + size <= wordList.length; i++) {
    out.add(hashString(wordList.slice(i, i + size).join(' ')));
  }
  return out;
}

/** Exact Jaccard similarity of two shingle sets, from 0 to 1. */
export function jaccard(a: ReadonlySet<number>, b: ReadonlySet<number>): number {
  if (a.size === 0 || b.size === 0) return 0;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  let common = 0;
  for (const value of small) if (large.has(value)) common++;
  return common / (a.size + b.size - common);
}

/** A 32-bit integer mixer (the murmur3 finaliser). */
function mix32(input: number): number {
  let x = input >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  x ^= x >>> 16;
  return x >>> 0;
}

/**
 * MinHash signature: for each of `numHashes` seeded hash functions, the
 * smallest hash over the set. The fraction of equal positions in two
 * signatures estimates the Jaccard similarity of the sets.
 */
export function minhash(set: ReadonlySet<number>, numHashes: number = DEFAULT_NUM_HASHES): Uint32Array {
  const signature = new Uint32Array(numHashes).fill(0xffffffff);
  const seeds = new Uint32Array(numHashes);
  for (let i = 0; i < numHashes; i++) seeds[i] = Math.imul(i + 1, 0x9e3779b9) >>> 0;
  for (const value of set) {
    for (let i = 0; i < numHashes; i++) {
      const h = mix32(value ^ seeds[i]);
      if (h < signature[i]) signature[i] = h;
    }
  }
  return signature;
}

/** The fraction of equal positions in two MinHash signatures. */
export function estimatedJaccard(a: Uint32Array, b: Uint32Array): number {
  if (a.length !== b.length || a.length === 0) throw new RangeError('signatures must be the same non-zero length');
  let equal = 0;
  for (let i = 0; i < a.length; i++) if (a[i] === b[i]) equal++;
  return equal / a.length;
}

export interface BandChoice {
  bands: number;
  rows: number;
  /** Probability that a pair at exactly the threshold becomes a candidate. */
  recallAtThreshold: number;
}

/**
 * Splits a signature into bands of rows so that a pair at the threshold
 * shares at least one band with high probability. Among the splits that keep
 * recall at or above `minRecall`, the one with the most rows per band is
 * chosen, which keeps unrelated pairs out of the candidate list.
 */
export function chooseBands(
  numHashes: number,
  threshold: number,
  minRecall = 0.98,
): BandChoice {
  if (!(threshold > 0 && threshold <= 1)) throw new RangeError('threshold must be in (0, 1]');
  let best: BandChoice | undefined;
  for (let rows = 1; rows <= numHashes; rows++) {
    if (numHashes % rows !== 0) continue;
    const bands = numHashes / rows;
    const recall = 1 - Math.pow(1 - Math.pow(threshold, rows), bands);
    if (recall >= minRecall) best = { bands, rows, recallAtThreshold: recall };
  }
  // Fall back to one row per band (highest recall) if nothing meets the target.
  return best ?? { bands: numHashes, rows: 1, recallAtThreshold: 1 - Math.pow(1 - threshold, numHashes) };
}

export interface SimilarityDocument {
  /** A stable identifier, such as the page path. */
  id: string;
  /** Only documents in the same group are compared (for example, the locale). */
  group: string;
  /** The text to compare (the main body, not navigation or footer). */
  text: string;
}

export interface SimilarityOptions {
  /** Minimum exact Jaccard similarity to report, from 0 to 1. */
  threshold: number;
  numHashes?: number;
  shingleSize?: number;
  minShingles?: number;
}

export interface SimilarPair {
  a: string;
  b: string;
  group: string;
  similarity: number;
}

export interface SimilarityStats {
  documents: number;
  /** Documents with too few shingles to compare, skipped. */
  skipped: number;
  /** Pairs that shared at least one LSH band. */
  candidates: number;
  /** Candidate pairs confirmed with exact Jaccard similarity. */
  verified: number;
}

export interface SimilarityResult {
  pairs: SimilarPair[];
  stats: SimilarityStats;
}

/**
 * Finds pairs of documents, within the same group, whose exact shingle
 * Jaccard similarity is at or above the threshold. Candidate pairs come from
 * LSH buckets, so the work grows with the number of similar pairs rather than
 * with the square of the number of pages.
 */
export function findNearDuplicates(
  documents: readonly SimilarityDocument[],
  options: SimilarityOptions,
): SimilarityResult {
  const numHashes = options.numHashes ?? DEFAULT_NUM_HASHES;
  const size = options.shingleSize ?? SHINGLE_SIZE;
  const minShingles = options.minShingles ?? DEFAULT_MIN_SHINGLES;
  const { bands, rows } = chooseBands(numHashes, options.threshold);

  const byGroup = new Map<string, SimilarityDocument[]>();
  for (const doc of documents) {
    const list = byGroup.get(doc.group);
    if (list) list.push(doc);
    else byGroup.set(doc.group, [doc]);
  }

  const pairs: SimilarPair[] = [];
  const stats: SimilarityStats = { documents: documents.length, skipped: 0, candidates: 0, verified: 0 };

  for (const [group, docs] of byGroup) {
    const sets: Array<Set<number>> = [];
    const signatures: Uint32Array[] = [];
    const kept: SimilarityDocument[] = [];
    for (const doc of docs) {
      const set = shingles(words(doc.text), size);
      if (set.size < minShingles) {
        stats.skipped++;
        continue;
      }
      kept.push(doc);
      sets.push(set);
      signatures.push(minhash(set, numHashes));
    }

    const buckets = new Map<string, number[]>();
    for (let i = 0; i < kept.length; i++) {
      const sig = signatures[i];
      for (let band = 0; band < bands; band++) {
        const key = `${band}:${sig.subarray(band * rows, (band + 1) * rows).join(',')}`;
        const bucket = buckets.get(key);
        if (bucket) bucket.push(i);
        else buckets.set(key, [i]);
      }
    }

    const seen = new Set<number>();
    for (const bucket of buckets.values()) {
      if (bucket.length < 2) continue;
      for (let x = 0; x < bucket.length; x++) {
        for (let y = x + 1; y < bucket.length; y++) {
          const i = Math.min(bucket[x], bucket[y]);
          const j = Math.max(bucket[x], bucket[y]);
          const pairKey = i * kept.length + j;
          if (seen.has(pairKey)) continue;
          seen.add(pairKey);
          stats.candidates++;
          const similarity = jaccard(sets[i], sets[j]);
          stats.verified++;
          if (similarity >= options.threshold) {
            pairs.push({ a: kept[i].id, b: kept[j].id, group, similarity });
          }
        }
      }
    }
  }

  pairs.sort((p, q) => q.similarity - p.similarity || p.a.localeCompare(q.a) || p.b.localeCompare(q.b));
  return { pairs, stats };
}

export interface ExactGroup {
  value: string;
  group: string;
  ids: string[];
}

/**
 * Groups documents whose value is the same after normalisation (titles, H1s,
 * descriptions). Only groups with two or more members are returned. Values
 * are compared within a group, so the same title in two languages is not a
 * duplicate.
 */
export function exactDuplicates(entries: ReadonlyArray<{ id: string; group: string; value: string }>): ExactGroup[] {
  const map = new Map<string, ExactGroup>();
  for (const entry of entries) {
    const normal = normaliseText(entry.value);
    if (normal === '') continue;
    const key = `${entry.group}\u0000${normal}`;
    const found = map.get(key);
    if (found) found.ids.push(entry.id);
    else map.set(key, { value: normal, group: entry.group, ids: [entry.id] });
  }
  return [...map.values()]
    .filter((g) => g.ids.length > 1)
    .sort((x, y) => y.ids.length - x.ids.length || x.group.localeCompare(y.group) || x.value.localeCompare(y.value));
}

/**
 * The SEO-007 minimum bar for an activity card. A field is missing when it is
 * absent, blank, or (for the author) a team label instead of a named person.
 */
export const MINIMUM_BAR_FIELDS = ['author', 'materials', 'time', 'adaptation', 'safety', 'stopNote'] as const;
export type MinimumBarField = (typeof MINIMUM_BAR_FIELDS)[number];

/** Bylines that name a group rather than a person. Compared after normalisation. */
export const TEAM_BYLINES: readonly string[] = ['creative activities editorial team'];

export interface ActivityBarInput {
  author?: string;
  materials?: readonly string[];
  activityMinutes?: readonly [number, number] | readonly number[];
  variations?: ReadonlyArray<{ text?: string }>;
  safety?: readonly string[];
  stopNote?: string;
}

const isBlank = (value: string | undefined): boolean => value === undefined || value.trim() === '';

/** The fields of the SEO-007 bar that a page misses, in the order of MINIMUM_BAR_FIELDS. */
export function missingBarFields(page: ActivityBarInput): MinimumBarField[] {
  const missing: MinimumBarField[] = [];
  const author = page.author === undefined ? '' : normaliseText(page.author);
  if (author === '' || TEAM_BYLINES.includes(author)) missing.push('author');
  if (!page.materials || !page.materials.some((m) => !isBlank(m))) missing.push('materials');
  const time = page.activityMinutes;
  if (!time || time.length < 2 || !(time[0] > 0) || !(time[1] >= time[0])) missing.push('time');
  if (!page.variations || !page.variations.some((v) => !isBlank(v.text))) missing.push('adaptation');
  if (!page.safety || !page.safety.some((s) => !isBlank(s))) missing.push('safety');
  if (isBlank(page.stopNote)) missing.push('stopNote');
  return missing;
}
