import { describe, expect, it } from 'vitest';
import { createPairs, isComplete, matchedPairs, matchedValues, tapPair } from './pairs';
import { createRng } from './random';

const tapBoth = (state: ReturnType<typeof createPairs>, value: string) => {
  const idx = state.tiles.map((t, i) => (t.value === value ? i : -1)).filter((i) => i >= 0);
  return tapPair(tapPair(state, idx[0] as number), idx[1] as number);
};

describe('carrying matched pairs to a resized board (WEB-053)', () => {
  it('lists each matched picture once', () => {
    let state = createPairs(['a', 'b', 'c'], createRng(1));
    expect(matchedValues(state)).toEqual([]);
    state = tapBoth(tapBoth(state, 'a'), 'c');
    expect(matchedValues(state).sort()).toEqual(['a', 'c']);
  });

  it('starts the carried pictures already matched and the rest unmatched', () => {
    const state = createPairs(['a', 'b', 'c', 'd'], createRng(2), new Set(['a', 'c']));
    expect(matchedPairs(state)).toBe(2);
    expect(state.tiles.filter((t) => t.matched).map((t) => t.value).sort()).toEqual(['a', 'a', 'c', 'c']);
    expect(state.tiles.filter((t) => !t.matched).map((t) => t.value).sort()).toEqual(['b', 'b', 'd', 'd']);
    expect(isComplete(state)).toBe(false);
  });

  it('ignores carried pictures that are no longer on the board', () => {
    const state = createPairs(['a', 'b'], createRng(3), new Set(['z']));
    expect(matchedPairs(state)).toBe(0);
  });

  it('with nothing to carry, makes the same board as before', () => {
    expect(createPairs(['a', 'b'], createRng(4)).tiles.every((t) => !t.matched)).toBe(true);
  });

  it('a board whose pictures are all carried is complete', () => {
    expect(isComplete(createPairs(['a', 'b'], createRng(5), new Set(['a', 'b'])))).toBe(true);
  });
});
