import { describe, expect, it } from 'vitest';
import {
  DEFAULT_NUM_HASHES,
  chooseBands,
  estimatedJaccard,
  exactDuplicates,
  findNearDuplicates,
  hashString,
  jaccard,
  minhash,
  missingBarFields,
  normaliseText,
  shingles,
  words,
  type SimilarityDocument,
} from './similarity';

/** Deterministic pseudo-random words so tests do not depend on Math.random. */
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function randomText(rand: () => number, count: number, vocabulary = 5000): string {
  const out: string[] = [];
  for (let i = 0; i < count; i++) out.push(`w${Math.floor(rand() * vocabulary)}`);
  return out.join(' ');
}

describe('normaliseText and words', () => {
  it('lowercases, strips punctuation and collapses spaces', () => {
    expect(normaliseText('  Fold a  Paper BOAT!  Gently... ')).toBe('fold a paper boat gently');
  });

  it('folds compatibility forms and keeps letters with accents', () => {
    expect(normaliseText('Café ＡＢＣ')).toBe('café abc');
  });

  it('treats each Han or Thai character as a word, since those scripts have no spaces', () => {
    expect(words('纸船')).toEqual(['纸', '船']);
    expect(words('ทดลอง')).toHaveLength(5);
  });

  it('returns no words for empty or punctuation-only text', () => {
    expect(words('')).toEqual([]);
    expect(words(' ... ')).toEqual([]);
  });
});

describe('shingles', () => {
  it('makes one 5-word shingle per position', () => {
    const six = words('one two three four five six');
    expect(shingles(six)).toHaveLength(2);
  });

  it('has none for a text shorter than the shingle size', () => {
    expect(shingles(words('only four words here')).size).toBe(0);
  });

  it('gives the same hash for the same five words in the same order', () => {
    expect(hashString('a b c d e')).toBe(hashString('a b c d e'));
    expect(shingles(words('x a b c d e')).has(hashString('a b c d e'))).toBe(true);
  });
});

describe('jaccard', () => {
  it('is 1 for identical sets, 0 for disjoint sets and exact in between', () => {
    const a = new Set([1, 2, 3, 4]);
    expect(jaccard(a, new Set([1, 2, 3, 4]))).toBe(1);
    expect(jaccard(a, new Set([9, 10]))).toBe(0);
    // common 2, union 6
    expect(jaccard(a, new Set([3, 4, 5, 6]))).toBeCloseTo(2 / 6, 10);
  });

  it('is 0 when either set is empty', () => {
    expect(jaccard(new Set(), new Set([1]))).toBe(0);
  });
});

describe('minhash', () => {
  it('is deterministic and estimates Jaccard within a tolerance', () => {
    const rand = lcg(7);
    const base = words(randomText(rand, 400));
    const altered = [...base];
    for (let i = 0; i < 60; i++) altered[Math.floor(rand() * altered.length)] = `z${i}`;
    const a = shingles(base);
    const b = shingles(altered);
    const sigA = minhash(a);
    expect(minhash(a)).toEqual(sigA);
    expect(sigA).toHaveLength(DEFAULT_NUM_HASHES);
    expect(Math.abs(estimatedJaccard(sigA, minhash(b)) - jaccard(a, b))).toBeLessThan(0.12);
  });

  it('rejects signatures of different lengths', () => {
    expect(() => estimatedJaccard(new Uint32Array(4), new Uint32Array(8))).toThrow(RangeError);
  });
});

describe('chooseBands', () => {
  it('keeps recall at the threshold at or above the target', () => {
    for (const threshold of [0.3, 0.5, 0.7, 0.85]) {
      const { bands, rows, recallAtThreshold } = chooseBands(DEFAULT_NUM_HASHES, threshold);
      expect(bands * rows).toBe(DEFAULT_NUM_HASHES);
      expect(recallAtThreshold).toBeGreaterThanOrEqual(0.98);
    }
  });

  it('rejects thresholds outside (0, 1]', () => {
    expect(() => chooseBands(120, 0)).toThrow(RangeError);
    expect(() => chooseBands(120, 1.5)).toThrow(RangeError);
  });
});

describe('findNearDuplicates', () => {
  const rand = lcg(42);
  const original = randomText(rand, 300);
  // Change about one word in forty (Jaccard about 0.76): above a 0.6 threshold.
  const lightEdit = original
    .split(' ')
    .map((w, i) => (i % 40 === 0 ? 'edited' : w))
    .join(' ');

  it('finds a near-duplicate pair above the threshold and reports its similarity', () => {
    const docs: SimilarityDocument[] = [
      { id: '/en/a/', group: 'en', text: original },
      { id: '/en/b/', group: 'en', text: lightEdit },
      { id: '/en/c/', group: 'en', text: randomText(rand, 300) },
    ];
    const { pairs } = findNearDuplicates(docs, { threshold: 0.6 });
    expect(pairs).toHaveLength(1);
    expect([pairs[0].a, pairs[0].b].sort()).toEqual(['/en/a/', '/en/b/']);
    expect(pairs[0].similarity).toBeGreaterThanOrEqual(0.6);
    expect(pairs[0].similarity).toBeLessThan(1);
  });

  it('never compares pages in different groups, even when their text is identical', () => {
    const docs: SimilarityDocument[] = [
      { id: '/en/a/', group: 'en', text: original },
      { id: '/fr/a/', group: 'fr', text: original },
    ];
    const { pairs, stats } = findNearDuplicates(docs, { threshold: 0.5 });
    expect(pairs).toEqual([]);
    expect(stats.candidates).toBe(0);
  });

  it('reports identical text in the same group as similarity 1', () => {
    const docs: SimilarityDocument[] = [
      { id: '/en/a/', group: 'en', text: original },
      { id: '/en/b/', group: 'en', text: original },
    ];
    expect(findNearDuplicates(docs, { threshold: 0.9 }).pairs[0]?.similarity).toBe(1);
  });

  it('skips pages with too little text and counts them', () => {
    const docs: SimilarityDocument[] = [
      { id: '/en/short-a/', group: 'en', text: 'Just a few words.' },
      { id: '/en/short-b/', group: 'en', text: 'Just a few words.' },
      { id: '/en/a/', group: 'en', text: original },
    ];
    const { pairs, stats } = findNearDuplicates(docs, { threshold: 0.5 });
    expect(pairs).toEqual([]);
    expect(stats.skipped).toBe(2);
  });

  it('returns pairs sorted by similarity, highest first, with no pair repeated', () => {
    // About one word in ten changed (Jaccard about 0.33): below 0.6 but above 0.2.
    const near = original.split(' ').map((w, i) => (i % 10 === 0 ? 'changed' : w)).join(' ');
    const docs: SimilarityDocument[] = [
      { id: '/en/a/', group: 'en', text: original },
      { id: '/en/b/', group: 'en', text: lightEdit },
      { id: '/en/c/', group: 'en', text: near },
    ];
    const { pairs } = findNearDuplicates(docs, { threshold: 0.2 });
    expect(pairs.length).toBeGreaterThanOrEqual(2);
    const sims = pairs.map((p) => p.similarity);
    expect(sims).toEqual([...sims].sort((x, y) => y - x));
    const keys = pairs.map((p) => [p.a, p.b].sort().join('|'));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('keeps candidate work small for many unrelated pages', () => {
    const r = lcg(99);
    const docs: SimilarityDocument[] = [];
    for (let i = 0; i < 2000; i++) docs.push({ id: `/en/p${i}/`, group: 'en', text: randomText(r, 120, 200000) });
    const { pairs, stats } = findNearDuplicates(docs, { threshold: 0.5 });
    expect(pairs).toEqual([]);
    // All pairs would be about two million. LSH should verify only a tiny fraction.
    expect(stats.verified).toBeLessThan(2000);
  });
});

describe('exactDuplicates', () => {
  it('groups equal titles after normalisation, within a group only', () => {
    const groups = exactDuplicates([
      { id: '/en/a/', group: 'en', value: 'Fold a Paper Boat' },
      { id: '/en/b/', group: 'en', value: 'fold a paper boat!' },
      { id: '/fr/a/', group: 'fr', value: 'Fold a Paper Boat' },
      { id: '/en/c/', group: 'en', value: 'Paint a Stone' },
    ]);
    expect(groups).toEqual([{ value: 'fold a paper boat', group: 'en', ids: ['/en/a/', '/en/b/'] }]);
  });

  it('ignores empty values', () => {
    expect(exactDuplicates([
      { id: 'x', group: 'en', value: '  ' },
      { id: 'y', group: 'en', value: '' },
    ])).toEqual([]);
  });
});

describe('missingBarFields (SEO-007 minimum bar)', () => {
  const complete = {
    author: 'Ada Lovelace',
    materials: ['Paper'],
    activityMinutes: [10, 30] as const,
    variations: [{ text: 'Use larger paper.' }],
    safety: ['Keep scissors with the helper.'],
    stopNote: 'It is fine to stop after one fold.',
  };

  it('reports nothing for a page that has every field', () => {
    expect(missingBarFields(complete)).toEqual([]);
  });

  it.each([
    ['author', { author: undefined }],
    ['materials', { materials: [] }],
    ['time', { activityMinutes: undefined }],
    ['adaptation', { variations: [] }],
    ['safety', { safety: [] }],
    ['stopNote', { stopNote: '   ' }],
  ])('reports %s when it is missing', (field, change) => {
    expect(missingBarFields({ ...complete, ...change })).toEqual([field]);
  });

  it('treats a team byline as no named author', () => {
    expect(missingBarFields({ ...complete, author: 'Creative Activities editorial team' })).toEqual(['author']);
  });

  it('rejects a time range where the maximum is below the minimum', () => {
    expect(missingBarFields({ ...complete, activityMinutes: [30, 10] })).toEqual(['time']);
  });

  it('does not count a blank adaptation as a real one', () => {
    expect(missingBarFields({ ...complete, variations: [{ text: '  ' }] })).toEqual(['adaptation']);
  });
});
