import { describe, expect, it } from 'vitest';
import { createOddRound, ODD_COUNTS, startOdd, tapOdd } from './odd-one-out';
import { createRng } from './random';
import { resizeOdd, resizeOddState, resizePicks, resizeTogether, resizeTogetherState, resizeValues } from './resize';
import { TOGETHER_COUNTS, TOGETHER_THEMES, createTogetherRound, startTogether, tapTogether } from './together';

const POOL = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
const SEEDS = Array.from({ length: 60 }, (_, i) => i + 1);
const themeOf = (id: string) => TOGETHER_THEMES.find((t) => t.pictures.includes(id))?.id;

describe('resizeValues (pairs)', () => {
  it('keeps the first pictures when shrinking', () => {
    expect(resizeValues(['a', 'b', 'c', 'd'], 2, POOL, createRng(1))).toEqual(['a', 'b']);
  });

  it('keeps every picture and adds new ones when growing', () => {
    for (const seed of SEEDS) {
      const out = resizeValues(['a', 'b'], 5, POOL, createRng(seed));
      expect(out.slice(0, 2)).toEqual(['a', 'b']);
      expect(out).toHaveLength(5);
      expect(new Set(out).size).toBe(5);
    }
  });

  it('is unchanged at the same count', () => {
    expect(resizeValues(['a', 'b'], 2, POOL, createRng(1))).toEqual(['a', 'b']);
  });
});

describe('resizePicks (find the same, shadow match)', () => {
  it('always keeps the target and never repeats a picture', () => {
    for (const seed of SEEDS) {
      for (const from of [2, 3, 4]) {
        for (const to of [2, 3, 4]) {
          const options = ['a', 'b', 'c', 'd'].slice(0, from);
          const out = resizePicks(options, 'b', to, POOL, createRng(seed));
          expect(out).toHaveLength(to);
          expect(out).toContain('b');
          expect(new Set(out).size).toBe(to);
        }
      }
    }
  });

  it('keeps the pictures already on the board when growing, in their order', () => {
    for (const seed of SEEDS) {
      const out = resizePicks(['a', 'b'], 'a', 4, POOL, createRng(seed));
      expect(out.filter((id) => id === 'a' || id === 'b')).toEqual(['a', 'b']);
    }
  });

  it('only removes pictures that are not the target when shrinking', () => {
    for (const seed of SEEDS) {
      const out = resizePicks(['a', 'b', 'c', 'd'], 'c', 2, POOL, createRng(seed));
      expect(out).toContain('c');
      for (const id of out) expect(['a', 'b', 'c', 'd']).toContain(id);
    }
  });

  it('never goes below two options', () => {
    expect(resizePicks(['a', 'b', 'c'], 'a', 1, POOL, createRng(1))).toHaveLength(2);
  });
});

describe('resizeOdd', () => {
  it('keeps the theme and the odd picture, and the others still share the theme', () => {
    for (const seed of SEEDS) {
      for (const from of ODD_COUNTS) {
        for (const to of ODD_COUNTS) {
          const rng = createRng(seed);
          const before = createOddRound(from, rng);
          const after = resizeOdd(before, to, rng, TOGETHER_THEMES);
          expect(after.pictures).toHaveLength(to);
          expect(after.odd).toBe(before.odd);
          expect(after.theme).toBe(before.theme);
          expect(after.pictures).toContain(after.odd);
          const shared = after.pictures.filter((id) => id !== after.odd);
          for (const id of shared) expect(themeOf(id)).toBe(after.theme);
          expect(new Set(after.pictures).size).toBe(to);
        }
      }
    }
  });

  it('keeps the pictures already on the board when growing', () => {
    const rng = createRng(7);
    const before = createOddRound(3, rng);
    const after = resizeOdd(before, 4, rng, TOGETHER_THEMES);
    for (const id of before.pictures) expect(after.pictures).toContain(id);
  });

  it('makes a fresh round when the theme has no pictures left to add', () => {
    const themes = [
      { id: 't1', pictures: ['a', 'b'] },
      { id: 't2', pictures: ['c', 'd', 'e'] },
    ];
    const before = { theme: 't1', odd: 'c', pictures: ['a', 'b', 'c'] };
    const after = resizeOdd(before, 4, createRng(1), themes);
    expect(after.pictures).toHaveLength(4);
    // Only t2 has the three pictures a four-picture round needs, so the new round shares t2.
    expect(after.theme).toBe('t2');
    expect(['a', 'b']).toContain(after.odd);
    expect(after.pictures.filter((id) => id !== after.odd).sort()).toHaveLength(3);
    for (const id of after.pictures.filter((p) => p !== after.odd)) expect(['c', 'd', 'e']).toContain(id);
  });

  it('keeps the found state when the round carries on, and starts over only for a fresh round', () => {
    const rng = createRng(3);
    const found = tapOdd(startOdd(createOddRound(3, rng)), createOddRound(3, createRng(3)).odd);
    expect(found.found).toBe(true);
    const grown = resizeOddState(found, 4, rng, TOGETHER_THEMES);
    expect(grown.found).toBe(true);
    expect(grown.round.odd).toBe(found.round.odd);
  });
});

describe('resizeTogether', () => {
  it('keeps the theme and gives the right group and filler counts at every count', () => {
    for (const seed of SEEDS) {
      for (const from of TOGETHER_COUNTS) {
        for (const to of TOGETHER_COUNTS) {
          const rng = createRng(seed);
          const before = createTogetherRound(from, rng);
          const after = resizeTogether(before, to, rng, TOGETHER_THEMES);
          expect(after.theme).toBe(before.theme);
          expect(after.pictures).toHaveLength(to);
          expect(new Set(after.pictures).size).toBe(to);
          expect(after.group).toHaveLength(to <= 4 ? 3 : 4);
          for (const id of after.group) expect(themeOf(id)).toBe(after.theme);
          const fillers = after.pictures.filter((id) => !after.group.includes(id));
          // One filler per other theme, so no second group can form by accident.
          expect(new Set(fillers.map(themeOf)).size).toBe(fillers.length);
          for (const id of fillers) expect(themeOf(id)).not.toBe(after.theme);
          for (const id of after.group) expect(after.pictures).toContain(id);
        }
      }
    }
  });

  it('keeps the pictures already on the board when growing', () => {
    for (const seed of SEEDS) {
      const rng = createRng(seed);
      const before = createTogetherRound(4, rng);
      const after = resizeTogether(before, 8, rng, TOGETHER_THEMES);
      for (const id of before.pictures) expect(after.pictures, `seed ${seed}`).toContain(id);
    }
  });

  it('drops a group picture that is not yet found before one that is', () => {
    for (const seed of SEEDS) {
      const rng = createRng(seed);
      const before = createTogetherRound(8, rng);
      const found = before.group.slice(0, 3);
      const after = resizeTogether(before, 4, rng, TOGETHER_THEMES, found);
      for (const id of found) expect(after.group).toContain(id);
    }
  });
});

describe('resizeTogetherState', () => {
  it('keeps what was found when the count changes', () => {
    for (const seed of SEEDS) {
      const rng = createRng(seed);
      let state = startTogether(createTogetherRound(8, rng));
      const [a, b] = state.round.group as [string, string];
      state = tapTogether(tapTogether(state, a), b);
      const smaller = resizeTogetherState(state, 4, rng, TOGETHER_THEMES);
      expect(smaller.found.sort()).toEqual([a, b].sort());
      const larger = resizeTogetherState(smaller, 8, rng, TOGETHER_THEMES);
      expect(larger.found.sort()).toEqual([a, b].sort());
    }
  });

  it('keeps a shown group shown', () => {
    const rng = createRng(2);
    const state = { ...startTogether(createTogetherRound(4, rng)), shown: true };
    const bigger = resizeTogetherState({ ...state, found: [...state.round.group] }, 8, rng, TOGETHER_THEMES);
    expect(bigger.shown).toBe(true);
    expect(bigger.found).toEqual(bigger.round.group);
  });
});
