import { describe, expect, it } from 'vitest';
import { createPairs, isComplete, matchedPairs, parsePairTiles, restorePairs, savePairs, tapPair } from './pairs';
import { createRng } from './random';

const tile = (value: string, matched = false) => ({ value, matched });

describe('a PairsBoard place (WEB-054)', () => {
  describe('parsePairTiles refuses a bad saved board and never repairs it', () => {
    const values = ['a', 'b'];
    const good = [tile('b'), tile('a', true), tile('a', true), tile('b')];

    it('accepts a full board in any layout order, with matched pairs as whole pairs', () => {
      expect(parsePairTiles(good, values)).toEqual(good);
    });

    it('accepts a board with nothing matched yet', () => {
      expect(parsePairTiles([tile('a'), tile('b'), tile('a'), tile('b')], values)).not.toBeNull();
    });

    it('rejects a value that is not an array', () => {
      expect(parsePairTiles('tiles', values)).toBeNull();
      expect(parsePairTiles(undefined, values)).toBeNull();
      expect(parsePairTiles({ 0: tile('a') }, values)).toBeNull();
    });

    it('rejects a board of the wrong length', () => {
      expect(parsePairTiles(good.slice(0, 3), values)).toBeNull();
      expect(parsePairTiles([...good, tile('a')], values)).toBeNull();
    });

    it('rejects a picture that is not on this board', () => {
      expect(parsePairTiles([tile('a'), tile('z'), tile('a'), tile('z')], values)).toBeNull();
    });

    it('rejects a picture that is not exactly two tiles', () => {
      expect(parsePairTiles([tile('a'), tile('a'), tile('a'), tile('b')], values)).toBeNull();
    });

    it('rejects a pair whose two tiles disagree about matched', () => {
      expect(parsePairTiles([tile('a', true), tile('b'), tile('a'), tile('b')], values)).toBeNull();
    });

    it('rejects a matched flag that is not a boolean, or a tile that is not a record', () => {
      expect(parsePairTiles([tile('a'), tile('b'), { value: 'a', matched: 'yes' }, tile('b')], values)).toBeNull();
      expect(parsePairTiles([tile('a'), tile('b'), null, tile('b')], values)).toBeNull();
      expect(parsePairTiles([tile('a'), tile('b'), { value: 3, matched: false }, tile('b')], values)).toBeNull();
    });
  });

  describe('restorePairs puts the saved layout and matched pairs back', () => {
    it('keeps each matched pair matched and the rest unmatched, in the saved order', () => {
      const saved = [tile('c', true), tile('a'), tile('a'), tile('c', true), tile('b'), tile('b')];
      const state = restorePairs(saved);
      expect(state.tiles.map((t) => [t.value, t.matched])).toEqual(saved.map((t) => [t.value, t.matched]));
      expect(matchedPairs(state)).toBe(1);
      expect(isComplete(state)).toBe(false);
      expect(state.selected).toBeNull();
      expect(state.mismatch).toBeNull();
    });

    it('gives every restored tile a distinct key', () => {
      const state = restorePairs([tile('a'), tile('b'), tile('a'), tile('b')]);
      expect(new Set(state.tiles.map((t) => t.key)).size).toBe(4);
    });

    it('round-trips what savePairs wrote after some play', () => {
      const values = ['a', 'b', 'c'];
      let state = createPairs(values, createRng(7));
      const first = state.tiles.findIndex((t) => t.value === 'a');
      const second = state.tiles.findIndex((t, i) => i !== first && t.value === 'a');
      state = tapPair(tapPair(state, first), second);
      const saved = savePairs(state);
      expect(saved).toHaveLength(6);
      expect(saved.filter((t) => t.matched).map((t) => t.value)).toEqual(['a', 'a']);
      expect(parsePairTiles(JSON.parse(JSON.stringify(saved)), values)).toEqual(saved);
      expect(savePairs(restorePairs(saved))).toEqual(saved);
    });

    it('saves only the picture and matched flag, never keys or selection', () => {
      const first = savePairs(createPairs(['a', 'b'], createRng(8)))[0];
      expect(Object.keys(first ?? {}).sort()).toEqual(['matched', 'value']);
    });
  });
});
