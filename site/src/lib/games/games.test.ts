import { describe, expect, it } from 'vitest';
import { createRng, shuffle } from './random';
import { boardColumns, createPairs, isComplete, matchedPairs, tapPair, tileVisualState } from './pairs';
import { correctCount, createPuzzle, isSolved, tapPiece } from './puzzle';
import { cellsOf, createWordSearch, lettersOf, normalizeWord, wordBetween, wordsLeft } from './wordsearch';
import { createBingoCards } from './bingo';
import { createSort, dropInBasket, isSorted, selectItem } from './sorting';
import { SHADOW_IDS, createShadowRound } from './shadow';
import {
  TOGETHER_COUNTS,
  TOGETHER_THEMES,
  createTogetherRound,
  groupSize,
  isTogether,
  showGroup,
  startTogether,
  tapResult,
  tapTogether,
} from './together';
import { ODD_COUNTS, createOddRound, oddTapResult, sharedSize, showOdd, startOdd, tapOdd } from './odd-one-out';
import { ACTIVITY_MATERIALS, ACTIVITY_RESULTS_SITE, PICTURE_BY_ID, PICTURES } from '../../data/pictures';
import { ACTIVITY_RESULTS_A } from '../../data/picture-art/activity-results-a';
import { ACTIVITY_RESULTS_B } from '../../data/picture-art/activity-results-b';

describe('random', () => {
  it('shuffles a copy without touching the input', () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input, createRng(1));
    expect(input).toEqual([1, 2, 3, 4, 5]);
    expect([...out].sort()).toEqual(input);
  });

  it('is reproducible for a seed', () => {
    expect(shuffle([1, 2, 3, 4, 5, 6], createRng(42))).toEqual(shuffle([1, 2, 3, 4, 5, 6], createRng(42)));
  });
});

describe('pairs', () => {
  const findPair = (state: ReturnType<typeof createPairs>, index: number) =>
    state.tiles.findIndex((t, i) => i !== index && t.value === state.tiles[index]?.value);

  it('creates two tiles per value', () => {
    const state = createPairs(['a', 'b'], createRng(3));
    expect(state.tiles).toHaveLength(4);
    expect(state.tiles.filter((t) => t.value === 'a')).toHaveLength(2);
  });

  it('matches two equal tiles and keeps them matched', () => {
    let state = createPairs(['a', 'b'], createRng(3));
    const other = findPair(state, 0);
    state = tapPair(tapPair(state, 0), other);
    expect(state.tiles[0]?.matched).toBe(true);
    expect(state.tiles[other]?.matched).toBe(true);
    expect(state.lastMatch).toBe(other);
    expect(matchedPairs(state)).toBe(1);
  });

  it('leaves a mismatch visible until the next deliberate tap', () => {
    let state = createPairs(['a', 'b'], createRng(3));
    const different = state.tiles.findIndex((t) => t.value !== state.tiles[0]?.value);
    state = tapPair(tapPair(state, 0), different);
    expect(state.mismatch).toEqual([0, different]);
    // Nothing else changes until another tap; that tap clears and selects.
    const next = tapPair(state, 0);
    expect(next.mismatch).toBeNull();
    expect(next.selected).toBe(0);
  });

  it('ignores taps on matched tiles and deselects on a second tap', () => {
    let state = createPairs(['a', 'b'], createRng(5));
    state = tapPair(state, 1);
    expect(tapPair(state, 1).selected).toBeNull();
    const other = findPair(state, 1);
    state = tapPair(state, other);
    expect(tapPair(state, 1)).toBe(state);
  });

  it('completes when every pair is matched', () => {
    let state = createPairs(['a', 'b', 'c'], createRng(9));
    for (let i = 0; i < state.tiles.length; i++) {
      if (state.tiles[i]?.matched) continue;
      state = tapPair(tapPair(state, i), findPair(state, i));
    }
    expect(isComplete(state)).toBe(true);
  });

  it('keeps small boards in two columns', () => {
    expect(boardColumns(4, true)).toBe(2);
    expect(boardColumns(12, false)).toBe(3);
  });

  it('determines tile visual state for resting, hidden, selected, mismatch, and matched', () => {
    let state = createPairs(['a', 'b'], createRng(3));
    expect(tileVisualState(state, 0, false)).toBe('resting');
    expect(tileVisualState(state, 0, true)).toBe('hidden');
    expect(tileVisualState(state, 999, false)).toBe('resting');

    // Select a tile
    state = tapPair(state, 0);
    expect(tileVisualState(state, 0, false)).toBe('selected');
    expect(tileVisualState(state, 0, true)).toBe('selected');
    expect(tileVisualState(state, 1, true)).toBe('hidden');

    // Mismatch
    const different = state.tiles.findIndex((t) => t.value !== state.tiles[0]?.value);
    state = tapPair(state, different);
    expect(tileVisualState(state, 0, true)).toBe('mismatch');
    expect(tileVisualState(state, different, true)).toBe('mismatch');
    const third = state.tiles.findIndex((_, i) => i !== 0 && i !== different);
    expect(tileVisualState(state, third, true)).toBe('hidden');
    expect(tileVisualState(state, third, false)).toBe('resting');

    // Match
    const matchPair = findPair(state, 0);
    state = tapPair(tapPair(state, 0), matchPair);
    expect(tileVisualState(state, 0, false)).toBe('matched');
    expect(tileVisualState(state, matchPair, true)).toBe('matched');
  });
});

describe('puzzle', () => {
  it('never starts solved', () => {
    for (let seed = 0; seed < 50; seed++) {
      expect(isSolved(createPuzzle(2, createRng(seed)))).toBe(false);
    }
  });

  it('swaps two tapped pieces', () => {
    const start = createPuzzle(3, createRng(7));
    const after = tapPiece(tapPiece(start, 0), 4);
    expect(after.order[0]).toBe(start.order[4]);
    expect(after.order[4]).toBe(start.order[0]);
    expect(after.selected).toBeNull();
  });

  it('can always be solved by swapping', () => {
    let state = createPuzzle(3, createRng(11));
    for (let slot = 0; slot < state.order.length; slot++) {
      const where = state.order.indexOf(slot);
      if (where !== slot) state = tapPiece(tapPiece(state, slot), where);
    }
    expect(isSolved(state)).toBe(true);
    expect(correctCount(state)).toBe(9);
  });
});

describe('word search', () => {
  const words = ['APPLE', 'PEAR', 'LEMON', 'PLUM'];

  it('lists the words still to find as plain words, for reading aloud', () => {
    const grid = createWordSearch(words, 7, createRng(2));
    const [first, ...rest] = grid.words.map((w) => w.word);
    expect(wordsLeft(grid, [])).toEqual([first, ...rest]);
    expect(wordsLeft(grid, [first as string])).toEqual(rest);
    expect(wordsLeft(grid, grid.words.map((w) => w.word))).toEqual([]);
    expect(wordsLeft(grid, []).join(', ')).not.toContain('[object');
  });

  it('places words across or down only, readable forwards', () => {
    const grid = createWordSearch(words, 7, createRng(2));
    expect(grid.words.length).toBeGreaterThanOrEqual(3);
    for (const w of grid.words) {
      expect(['across', 'down']).toContain(w.dir);
      const read = cellsOf(w)
        .map(([r, c]) => grid.cells[r]?.[c])
        .join('');
      expect(read).toBe(w.word);
    }
  });

  it('fills every cell with a capital letter', () => {
    const grid = createWordSearch(words, 7, createRng(4));
    expect(grid.cells.flat().every((ch) => /^[A-Z]$/.test(ch))).toBe(true);
  });

  it('finds a word from its first and last letters in either order', () => {
    const grid = createWordSearch(words, 7, createRng(6));
    const w = grid.words[0]!;
    const coords = cellsOf(w);
    expect(wordBetween(grid, coords[0]!, coords[coords.length - 1]!)).toBe(w);
    expect(wordBetween(grid, coords[coords.length - 1]!, coords[0]!)).toBe(w);
    expect(wordBetween(grid, coords[0]!, coords[0]!)).toBeNull();
  });

  it('keeps accented and non-Latin letters, in the language capitals', () => {
    const grid = createWordSearch(['ırmak', 'çiçek', 'elma'], 6, createRng(8), { fill: 'ABCÇDEFGĞHIİ', locale: 'tr' });
    expect(grid.words.map((w) => w.word).sort()).toEqual(['ELMA', 'IRMAK', 'ÇİÇEK']);
    for (const w of grid.words) {
      expect(cellsOf(w).map(([r, c]) => grid.cells[r]?.[c]).join('')).toBe(w.word);
    }
    expect(grid.cells.flat().every((ch) => [...'ABCÇDEFGĞHIİKLMRŞEÜ'].includes(ch) || /\p{L}/u.test(ch))).toBe(true);
  });

  it('keeps a letter with its marks in one cell', () => {
    expect(lettersOf('किताब')).toEqual(['कि', 'ता', 'ब']);
    expect(lettersOf('NGƯỜI')).toHaveLength(5);
    const grid = createWordSearch(['किताब', 'अनार', 'कमल'], 6, createRng(3), { fill: 'कखगचजतदनपबमरलवस', locale: 'hi' });
    expect(grid.words).toHaveLength(3);
    for (const w of grid.words) {
      expect(cellsOf(w)).toHaveLength(lettersOf(w.word).length);
      expect(cellsOf(w).map(([r, c]) => grid.cells[r]?.[c]).join('')).toBe(w.word);
    }
  });

  it('drops spaces and punctuation from words', () => {
    expect(normalizeWord("tea-pot's", 'en')).toBe('TEAPOTS');
  });
});

describe('bingo', () => {
  it('makes distinct cards of the requested size', () => {
    const pool = Array.from({ length: 24 }, (_, i) => `p${i}`);
    const cards = createBingoCards(pool, 9, 20, createRng(8));
    expect(cards).toHaveLength(20);
    const signatures = new Set(cards.map((c) => [...c].sort().join()));
    expect(signatures.size).toBe(20);
    expect(cards.every((c) => c.length === 9 && new Set(c).size === 9)).toBe(true);
  });
});

describe('sorting', () => {
  it('accepts the right basket and offers a hint for the other one', () => {
    let state = createSort(['k1', 'k2', 'k3'], ['g1', 'g2', 'g3'], 2, createRng(1));
    const item = state.items[0]!;
    state = selectItem(state, item.id);
    const wrong = dropInBasket(state, item.basket === 0 ? 1 : 0);
    expect(wrong.placed[item.id]).toBeUndefined();
    expect(wrong.hint).toEqual({ id: item.id, basket: item.basket });
    const right = dropInBasket(wrong, item.basket);
    expect(right.placed[item.id]).toBe(item.basket);
    expect(right.hint).toBeNull();
  });

  it('is sorted when every item has a basket', () => {
    let state = createSort(['k1', 'k2'], ['g1', 'g2'], 2, createRng(3));
    for (const item of state.items) state = dropInBasket(selectItem(state, item.id), item.basket);
    expect(isSorted(state)).toBe(true);
  });
});

describe('shadow match', () => {
  it('offers distinct pictures that include the shadow', () => {
    for (let seed = 0; seed < 50; seed++) {
      for (const count of [2, 3, 4]) {
        const round = createShadowRound(count, createRng(seed));
        expect(round.options).toHaveLength(count);
        expect(new Set(round.options).size).toBe(count);
        expect(round.options).toContain(round.target);
      }
    }
  });

  it('does not repeat the last shadow straight away', () => {
    for (let seed = 0; seed < 50; seed++) {
      const first = createShadowRound(3, createRng(seed));
      expect(createShadowRound(3, createRng(seed + 1000), first.target).target).not.toBe(first.target);
    }
  });

  it('uses only real pictures, leaving out shapes that read as blobs', () => {
    for (const id of SHADOW_IDS) expect(PICTURE_BY_ID.has(id)).toBe(true);
    for (const blob of ['bread', 'dog', 'lemon']) expect(SHADOW_IDS).not.toContain(blob);
  });
});

describe('four together', () => {
  const themeOf = (id: string) => TOGETHER_THEMES.filter((t) => t.pictures.includes(id)).map((t) => t.id);

  it('builds a group from one theme and fills the rest from other themes, one each', () => {
    for (let seed = 0; seed < 80; seed++) {
      for (const count of TOGETHER_COUNTS) {
        const round = createTogetherRound(count, createRng(seed));
        expect(round.pictures).toHaveLength(count);
        expect(new Set(round.pictures).size).toBe(count);
        expect(round.group).toHaveLength(groupSize(count));
        for (const id of round.group) {
          expect(round.pictures).toContain(id);
          expect(themeOf(id)).toEqual([round.theme]);
        }
        const others = round.pictures.filter((id) => !round.group.includes(id)).map((id) => themeOf(id)[0]);
        expect(others).not.toContain(round.theme);
        // One picture per other theme, so no second group can form.
        expect(new Set(others).size).toBe(others.length);
      }
    }
  });

  it('does not repeat the last theme straight away', () => {
    for (let seed = 0; seed < 50; seed++) {
      const first = createTogetherRound(6, createRng(seed));
      expect(createTogetherRound(6, createRng(seed + 1000), first.theme).theme).not.toBe(first.theme);
    }
  });

  it('uses only general library drawings, each in exactly one theme', () => {
    const results = new Set([...ACTIVITY_RESULTS_A, ...ACTIVITY_RESULTS_B, ...ACTIVITY_MATERIALS, ...ACTIVITY_RESULTS_SITE].map((p) => p.id));
    const general = new Set(PICTURES.map((p) => p.id));
    for (const theme of TOGETHER_THEMES) {
      expect(theme.pictures.length, theme.id).toBeGreaterThanOrEqual(4);
      for (const id of theme.pictures) {
        expect(PICTURE_BY_ID.has(id), id).toBe(true);
        expect(general.has(id), id).toBe(true);
        expect(results.has(id), id).toBe(false);
        expect(themeOf(id), id).toEqual([theme.id]);
      }
    }
  });

  it('leaves out pictures a reader could place in two themes', () => {
    const all = TOGETHER_THEMES.flatMap((t) => t.pictures);
    for (const id of ['bee', 'butterfly', 'tractor', 'balloon', 'vase-of-flowers', 'umbrella', 'straw-hat', 'kite']) {
      expect(all, id).not.toContain(id);
    }
  });

  it('keeps group pictures, lets any other tap change nothing, and shows the group without a penalty', () => {
    const round = createTogetherRound(8, createRng(7));
    let state = startTogether(round);
    const other = round.pictures.find((id) => !round.group.includes(id))!;
    expect(tapResult(state, other)).toBe('elsewhere');
    expect(tapTogether(state, other)).toBe(state);
    const first = round.group[0]!;
    state = tapTogether(state, first);
    expect(state.found).toEqual([first]);
    expect(tapResult(state, first)).toBe('already');
    expect(isTogether(state)).toBe(false);
    for (const id of round.group) state = tapTogether(state, id);
    expect(isTogether(state)).toBe(true);

    const shown = showGroup(startTogether(round));
    expect(shown.shown).toBe(true);
    expect(isTogether(shown)).toBe(true);
    expect(Object.keys(shown).sort()).toEqual(['found', 'round', 'shown']);
  });
});

describe('odd one out', () => {
  const themeOf = (id: string) => TOGETHER_THEMES.filter((t) => t.pictures.includes(id)).map((t) => t.id);

  it('shares one theme among all but one picture, and takes the odd one from another theme', () => {
    for (let seed = 0; seed < 120; seed++) {
      for (const count of ODD_COUNTS) {
        const round = createOddRound(count, createRng(seed));
        expect(round.pictures).toHaveLength(count);
        expect(new Set(round.pictures).size).toBe(count);
        expect(round.pictures).toContain(round.odd);
        const rest = round.pictures.filter((id) => id !== round.odd);
        expect(rest).toHaveLength(sharedSize(count));
        for (const id of rest) expect(themeOf(id)).toEqual([round.theme]);
        const oddThemes = themeOf(round.odd);
        expect(oddThemes).toHaveLength(1);
        expect(oddThemes[0]).not.toBe(round.theme);
      }
    }
  });

  it('keeps two or three pictures in the shared theme', () => {
    expect(sharedSize(3)).toBe(2);
    expect(sharedSize(4)).toBe(3);
    expect(sharedSize(2)).toBe(2);
    expect(sharedSize(9)).toBe(3);
  });

  it('never repeats the previous set: a new theme and a new odd picture', () => {
    for (let seed = 0; seed < 80; seed++) {
      for (const count of ODD_COUNTS) {
        const first = createOddRound(count, createRng(seed));
        const second = createOddRound(count, createRng(seed + 5000), first);
        expect(second.theme).not.toBe(first.theme);
        expect(second.odd).not.toBe(first.odd);
        expect([...second.pictures].sort()).not.toEqual([...first.pictures].sort());
      }
    }
  });

  it('is repeatable for a seed, and still works when only two themes are given', () => {
    expect(createOddRound(4, createRng(3))).toEqual(createOddRound(4, createRng(3)));
    const two = TOGETHER_THEMES.slice(0, 2);
    const round = createOddRound(4, createRng(1), undefined, two);
    const next = createOddRound(4, createRng(2), round, two);
    expect(next.theme).not.toBe(round.theme);
    expect(() => createOddRound(4, createRng(1), undefined, two.slice(0, 1))).toThrow();
  });

  it('keeps the round open on a picture that belongs, finds the odd one, and shows it without a penalty', () => {
    const round = createOddRound(4, createRng(11));
    const start = startOdd(round);
    const belongs = round.pictures.find((id) => id !== round.odd)!;
    expect(oddTapResult(start, belongs)).toBe('belongs');
    expect(tapOdd(start, belongs)).toBe(start);
    expect(start.found).toBe(false);
    const found = tapOdd(start, round.odd);
    expect(found).toEqual({ round, found: true, shown: false });
    expect(start.found).toBe(false);
    expect(oddTapResult(found, belongs)).toBe('already');
    expect(oddTapResult(found, round.odd)).toBe('already');

    const shown = showOdd(start);
    expect(shown).toEqual({ round, found: true, shown: true });
    // No mistake count, score or timer is kept anywhere in the state.
    expect(Object.keys(shown).sort()).toEqual(['found', 'round', 'shown']);
  });
});
