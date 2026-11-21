import { describe, expect, it } from 'vitest';
import { PICTURE_BY_ID } from '../../data/pictures';
import { playProps } from '../../i18n/play';
import { createRng } from './random';
import {
  WORD_PICTURE_COUNTS,
  WORD_PICTURE_POOL,
  createWordRound,
  isWordMatched,
  isWordPairsDone,
  putWordsBack,
  startWordPairs,
  startWordsAgain,
  tapWord,
  wordOrderFor,
  wordTapResult,
} from './word-picture';

const names = playProps('en').pictureNames;
/** English names that can be read two ways, so a word could point at the wrong picture. */
const AMBIGUOUS = ['orange', 'rose', 'glasses', 'bee', 'moon and stars', 'hen', 'key', 'bird', 'fish', 'aeroplane', 'ladybird', 'boiled egg'];

describe('word and picture pairs (GAME-023)', () => {
  it('uses only library pictures, each once, with a short plain English name', () => {
    expect(new Set(WORD_PICTURE_POOL).size).toBe(WORD_PICTURE_POOL.length);
    for (const id of WORD_PICTURE_POOL) {
      expect(PICTURE_BY_ID.has(id), id).toBe(true);
      const name = names[id] ?? '';
      expect(name, id).not.toBe('');
      expect(name.split(' ').length, id).toBeLessThanOrEqual(3);
      expect(AMBIGUOUS, id).not.toContain(name.toLowerCase());
    }
  });

  it('shows the chosen number of different pictures', () => {
    for (const count of WORD_PICTURE_COUNTS) {
      const round = createWordRound(count, createRng(7));
      expect(round.pictures).toHaveLength(count);
      expect(new Set(round.pictures).size).toBe(count);
    }
  });

  it('gives the same pictures as words, in a different order', () => {
    const round = createWordRound(6, createRng(20261119));
    expect([...round.words].sort()).toEqual([...round.pictures].sort());
    expect(round.words).not.toEqual(round.pictures);
  });

  it('shuffles from the seed, so the same seed gives the same board', () => {
    expect(createWordRound(4, createRng(3))).toEqual(createWordRound(4, createRng(3)));
    expect(createWordRound(4, createRng(3))).not.toEqual(createWordRound(4, createRng(4)));
  });

  it('does not repeat the previous pictures while there are fresh ones', () => {
    const first = createWordRound(4, createRng(11));
    const second = createWordRound(4, createRng(12), first);
    expect(second.pictures.some((id) => first.pictures.includes(id))).toBe(false);
  });

  it('gives the words a different order even for two pictures', () => {
    expect(wordOrderFor(['teacup', 'owl'], createRng(1))).not.toEqual(['teacup', 'owl']);
  });

  it('matches a word to its picture, whichever is tapped first', () => {
    const round = createWordRound(4, createRng(5));
    const [a, b] = round.pictures as [string, string];
    let state = startWordPairs(round);
    state = tapWord(state, 'word', a);
    state = tapWord(state, 'picture', a);
    expect(state.matched).toEqual([a]);
    state = tapWord(state, 'picture', b);
    expect(isWordMatched(state, b)).toBe(false);
    expect(state.selected).toEqual({ side: 'picture', id: b });
    state = tapWord(state, 'word', b);
    expect(isWordMatched(state, b)).toBe(true);
  });

  it('clears a wrong tap quietly, with no match and no count', () => {
    const round = createWordRound(4, createRng(9));
    const [a, b] = round.pictures as [string, string];
    const state = tapWord(startWordPairs(round), 'word', a);
    expect(wordTapResult(state, 'picture', b)).toBe('miss');
    const after = tapWord(state, 'picture', b);
    expect(after.selected).toBeNull();
    expect(after.matched).toEqual([]);
    expect(Object.keys(after).sort()).toEqual(['before', 'matched', 'round', 'selected']);
  });

  it('un-selects the same tile and moves the selection on the same side', () => {
    const round = createWordRound(4, createRng(9));
    const [a, b] = round.pictures as [string, string];
    const selected = tapWord(startWordPairs(round), 'word', a);
    expect(wordTapResult(selected, 'word', a)).toBe('deselect');
    expect(tapWord(selected, 'word', a).selected).toBeNull();
    expect(wordTapResult(selected, 'word', b)).toBe('select');
    expect(tapWord(selected, 'word', b).selected).toEqual({ side: 'word', id: b });
  });

  it('ignores a tap on a pair that is already matched', () => {
    const round = createWordRound(4, createRng(9));
    const [a] = round.pictures as [string];
    const matched = tapWord(tapWord(startWordPairs(round), 'word', a), 'picture', a);
    expect(wordTapResult(matched, 'picture', a)).toBe('ignore');
    expect(tapWord(matched, 'picture', a)).toBe(matched);
  });

  it('is done only when every pair is matched', () => {
    const round = createWordRound(4, createRng(2));
    let state = startWordPairs(round);
    for (const id of round.pictures) {
      expect(isWordPairsDone(state)).toBe(false);
      state = tapWord(tapWord(state, 'picture', id), 'word', id);
    }
    expect(isWordPairsDone(state)).toBe(true);
  });

  it('starts again, and Put it back restores the matches for one step only', () => {
    const round = createWordRound(4, createRng(2));
    const [a, b] = round.pictures as [string, string];
    let state = tapWord(tapWord(startWordPairs(round), 'word', a), 'picture', a);
    state = startWordsAgain(state);
    expect(state.matched).toEqual([]);
    expect(state.before).toEqual([a]);
    const back = putWordsBack(state);
    expect(back.matched).toEqual([a]);
    expect(back.before).toBeNull();
    // A new match ends the one step: there is nothing left to put back.
    const moved = tapWord(tapWord(state, 'word', b), 'picture', b);
    expect(moved.before).toBeNull();
    expect(putWordsBack(moved)).toBe(moved);
  });

  it('keeps nothing to put back when Start again has no matches to undo', () => {
    const state = startWordPairs(createWordRound(4, createRng(2)));
    expect(startWordsAgain(state).before).toBeNull();
  });
});
