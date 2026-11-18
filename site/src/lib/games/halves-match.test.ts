import { describe, expect, it } from 'vitest';
import { HALVES_PICTURES } from '../../data/halves-match';
import { createRng } from './random';
import {
  HALVES_COUNTS,
  createHalvesRound,
  derange,
  halvesCategory,
  halvesTapResult,
  isHalvesDone,
  loosePictures,
  pickHalves,
  resizeHalvesState,
  showHalves,
  startHalves,
  tapHalf,
  type HalvesState,
} from './halves-match';

const seeds = Array.from({ length: 80 }, (_, i) => i + 1);

describe('halves match rounds', () => {
  it('offers two or three pictures, two first', () => {
    expect(HALVES_COUNTS).toEqual([2, 3]);
  });

  it('builds a round of the chosen size from the picture set, each picture once', () => {
    for (const count of HALVES_COUNTS) {
      for (const seed of seeds) {
        const round = createHalvesRound(count, createRng(seed));
        expect(round.pictures).toHaveLength(count);
        expect(new Set(round.pictures).size).toBe(count);
        for (const id of round.pictures) expect(HALVES_PICTURES).toContain(id);
        expect([...round.rightOrder].sort()).toEqual([...round.pictures].sort());
      }
    }
  });

  it('never puts two pictures of one category in a round', () => {
    for (const count of HALVES_COUNTS) {
      for (const seed of seeds) {
        const round = createHalvesRound(count, createRng(seed));
        const categories = round.pictures.map(halvesCategory);
        expect(categories).not.toContain(undefined);
        expect(new Set(categories).size, `${round.pictures.join(',')} (seed ${seed})`).toBe(count);
      }
    }
  });

  it('starts with no right half beside its own left half, so the answer is never lined up', () => {
    for (const count of HALVES_COUNTS) {
      for (const seed of seeds) {
        const round = createHalvesRound(count, createRng(seed));
        round.rightOrder.forEach((id, row) => expect(id).not.toBe(round.pictures[row]));
      }
    }
  });

  it('is the same for the same seed and differs between seeds', () => {
    expect(createHalvesRound(3, createRng(9))).toEqual(createHalvesRound(3, createRng(9)));
    const sets = new Set(seeds.map((s) => createHalvesRound(3, createRng(s)).pictures.join(',')));
    expect(sets.size).toBeGreaterThan(20);
  });

  it('uses new pictures for another set while others are open', () => {
    for (const seed of seeds) {
      const first = createHalvesRound(3, createRng(seed));
      const next = createHalvesRound(3, createRng(seed + 1000), first.pictures);
      for (const id of next.pictures) expect(first.pictures).not.toContain(id);
    }
  });

  it('uses every picture of the set across many rounds', () => {
    const seen = new Set<string>();
    for (const seed of seeds) for (const id of createHalvesRound(3, createRng(seed)).pictures) seen.add(id);
    expect([...seen].sort()).toEqual([...HALVES_PICTURES].sort());
  });

  it('stops with a clear error when too few categories are open', () => {
    expect(() => pickHalves(3, createRng(1), [], ['teacup', 'kettle', 'pear'])).toThrow(/different categories/);
  });

  it('derange moves every item and leaves one item alone', () => {
    for (const seed of seeds) {
      const ids = ['a', 'b', 'c'];
      const out = derange(ids, createRng(seed));
      expect([...out].sort()).toEqual(ids);
      out.forEach((id, i) => expect(id).not.toBe(ids[i]));
    }
    expect(derange(['a'], createRng(1))).toEqual(['a']);
    expect(derange([], createRng(1))).toEqual([]);
  });
});

const stateFor = (count: number, seed: number): HalvesState => startHalves(createHalvesRound(count, createRng(seed)));

describe('halves match taps', () => {
  it('starts with nothing joined or chosen', () => {
    const state = stateFor(3, 4);
    expect(state.joined).toEqual([]);
    expect(state.selected).toBeNull();
    expect(state.shown).toBe(false);
    expect(isHalvesDone(state)).toBe(false);
  });

  it('chooses a half, and the other side then decides', () => {
    const state = stateFor(3, 4);
    const [a, b] = state.round.pictures as [string, string];
    expect(halvesTapResult(state, 'left', a)).toBe('select');
    const picked = tapHalf(state, 'left', a);
    expect(picked.selected).toEqual({ side: 'left', id: a });
    expect(halvesTapResult(picked, 'right', a)).toBe('fit');
    expect(halvesTapResult(picked, 'right', b)).toBe('apart');
    expect(halvesTapResult(picked, 'left', b)).toBe('select');
    expect(halvesTapResult(picked, 'left', a)).toBe('deselect');
  });

  it('works from the right side too', () => {
    const state = stateFor(3, 4);
    const a = state.round.pictures[0] as string;
    const picked = tapHalf(state, 'right', a);
    expect(halvesTapResult(picked, 'left', a)).toBe('fit');
    expect(tapHalf(picked, 'left', a).joined).toEqual([a]);
  });

  it('switches the choice on the same side and puts a half down when it is tapped again', () => {
    const state = stateFor(3, 4);
    const [a, b] = state.round.pictures as [string, string];
    const switched = tapHalf(tapHalf(state, 'left', a), 'left', b);
    expect(switched.selected).toEqual({ side: 'left', id: b });
    expect(tapHalf(switched, 'left', b).selected).toBeNull();
  });

  it('separates a pair that does not fit and changes nothing else, however many times', () => {
    const state = stateFor(3, 4);
    const [a, b] = state.round.pictures as [string, string];
    let now = state;
    for (let i = 0; i < 10; i++) {
      now = tapHalf(tapHalf(now, 'left', a), 'right', b);
      expect(now.selected).toBeNull();
      expect(now.joined).toEqual([]);
      expect(now.right).toEqual(state.right);
      expect(now.shown).toBe(false);
    }
  });

  it('joins a pair that fits: the right half moves beside its left half and stays', () => {
    for (const seed of seeds) {
      const state = stateFor(3, seed);
      const id = state.round.pictures[1] as string;
      const joined = tapHalf(tapHalf(state, 'left', id), 'right', id);
      expect(joined.joined).toEqual([id]);
      expect(joined.selected).toBeNull();
      expect(joined.right[1]).toBe(id);
      expect([...joined.right].sort()).toEqual([...state.right].sort());
      // Only the right half that sat in that row moves: one other half takes the place the joined one left.
      const moved = joined.right.filter((r, row) => r !== state.right[row]);
      expect(moved).toHaveLength(state.right[1] === id ? 0 : 2);
    }
  });

  it('keeps a joined pair joined, whatever is tapped afterwards', () => {
    const state = stateFor(3, 4);
    const [a, b] = state.round.pictures as [string, string];
    const joined = tapHalf(tapHalf(state, 'left', a), 'right', a);
    expect(halvesTapResult(joined, 'left', a)).toBe('ignore');
    expect(halvesTapResult(joined, 'right', a)).toBe('ignore');
    expect(tapHalf(joined, 'left', a)).toBe(joined);
    const after = tapHalf(tapHalf(joined, 'left', b), 'right', a);
    expect(after.joined).toEqual([a]);
  });

  it('is done when every pair is joined, in any order', () => {
    for (const seed of seeds) {
      const orders = [[0, 1, 2], [2, 1, 0], [1, 2, 0]];
      for (const order of orders) {
        let state = stateFor(3, seed);
        const ids = state.round.pictures;
        for (const i of order) {
          expect(isHalvesDone(state)).toBe(false);
          const id = ids[i] as string;
          state = tapHalf(tapHalf(state, 'left', id), 'right', id);
          expect(state.right[i]).toBe(id);
        }
        expect(isHalvesDone(state)).toBe(true);
        expect(state.right).toEqual(ids);
        expect(loosePictures(state)).toEqual([]);
      }
    }
  });

  it('while pieces remain, a left half beside its own right half only happens for the last pair', () => {
    for (const seed of seeds) {
      let state = stateFor(3, seed);
      const first = state.round.pictures[0] as string;
      state = tapHalf(tapHalf(state, 'left', first), 'right', first);
      const loose = loosePictures(state);
      expect(loose).toHaveLength(2);
      for (const id of loose) expect(state.right[state.round.pictures.indexOf(id)]).not.toBe(id);
    }
  });

  it('shows every picture whole without penalty', () => {
    const state = tapHalf(stateFor(3, 4), 'left', stateFor(3, 4).round.pictures[0] as string);
    const shown = showHalves(state);
    expect(shown.shown).toBe(true);
    expect(isHalvesDone(shown)).toBe(true);
    expect(shown.right).toEqual(shown.round.pictures);
    expect(shown.selected).toBeNull();
    for (const id of shown.round.pictures) expect(halvesTapResult(shown, 'left', id)).toBe('ignore');
  });

  it('does not change the state it is given', () => {
    const state = stateFor(3, 4);
    const copy = JSON.parse(JSON.stringify(state));
    const id = state.round.pictures[0] as string;
    tapHalf(tapHalf(state, 'left', id), 'right', id);
    showHalves(state);
    resizeHalvesState(state, 2, createRng(1));
    expect(state).toEqual(copy);
  });
});

describe('changing the count keeps the place (WEB-053)', () => {
  it('goes from three to two, keeping a joined pair and the other halves apart', () => {
    for (const seed of seeds) {
      const state = stateFor(3, seed);
      const id = state.round.pictures[2] as string;
      const joined = tapHalf(tapHalf(state, 'left', id), 'right', id);
      const smaller = resizeHalvesState(joined, 2, createRng(seed));
      expect(smaller.round.pictures).toHaveLength(2);
      expect(smaller.round.pictures).toContain(id);
      expect(smaller.joined).toEqual([id]);
      expect(smaller.right[smaller.round.pictures.indexOf(id)]).toBe(id);
      expect([...smaller.right].sort()).toEqual([...smaller.round.pictures].sort());
    }
  });

  it('goes from two to three, adding a picture from another category and keeping what is joined', () => {
    for (const seed of seeds) {
      const state = stateFor(2, seed);
      const id = state.round.pictures[0] as string;
      const joined = tapHalf(tapHalf(state, 'left', id), 'right', id);
      const bigger = resizeHalvesState(joined, 3, createRng(seed));
      expect(bigger.round.pictures).toHaveLength(3);
      expect(bigger.round.pictures.slice(0, 2)).toEqual(state.round.pictures);
      expect(new Set(bigger.round.pictures.map(halvesCategory)).size).toBe(3);
      expect(bigger.joined).toEqual([id]);
      expect(bigger.right[0]).toBe(id);
      expect([...bigger.right].sort()).toEqual([...bigger.round.pictures].sort());
      for (const loose of loosePictures(bigger)) expect(bigger.right[bigger.round.pictures.indexOf(loose)]).not.toBe(loose);
    }
  });

  it('drops a joined picture only when every other one is joined too', () => {
    const state = showHalves(stateFor(3, 4));
    const smaller = resizeHalvesState(state, 2, createRng(3));
    expect(smaller.round.pictures).toHaveLength(2);
    expect(isHalvesDone(smaller)).toBe(true);
    expect(smaller.shown).toBe(true);
    const grown = resizeHalvesState(smaller, 3, createRng(3));
    expect(grown.shown).toBe(false);
    expect(isHalvesDone(grown)).toBe(false);
  });

  it('keeps the chosen half when it stays on the board', () => {
    const state = stateFor(3, 4);
    const a = state.round.pictures[0] as string;
    const picked = tapHalf(state, 'left', a);
    expect(resizeHalvesState(picked, 3, createRng(1)).selected).toEqual({ side: 'left', id: a });
  });
});
