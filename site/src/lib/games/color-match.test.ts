import { describe, expect, it } from 'vitest';
import { MATCH_COLORS, colorOfPicture } from '../../data/color-match';
import { createRng } from './random';
import {
  COLOR_COUNTS,
  colorTapResult,
  createColorRound,
  isColorDone,
  matchSize,
  pictureColor,
  resizeColorState,
  showColors,
  startColors,
  tapColor,
} from './color-match';

const seeds = Array.from({ length: 60 }, (_, i) => i + 1);

describe('color match rounds', () => {
  it('splits the board half and half: two of four, three of six', () => {
    expect(COLOR_COUNTS).toEqual([4, 6]);
    expect(matchSize(4)).toBe(2);
    expect(matchSize(6)).toBe(3);
  });

  it('builds a board of the chosen size with only table pictures, each once', () => {
    for (const count of COLOR_COUNTS) {
      for (const seed of seeds) {
        const round = createColorRound(count, createRng(seed));
        expect(round.pictures).toHaveLength(count);
        expect(new Set(round.pictures).size).toBe(count);
        for (const id of round.pictures) expect(colorOfPicture(id), `${id} is in the table`).toBeDefined();
      }
    }
  });

  it('has exactly the matching pictures in the target color and no other picture of it', () => {
    for (const count of COLOR_COUNTS) {
      for (const seed of seeds) {
        const round = createColorRound(count, createRng(seed));
        expect(round.matches).toHaveLength(matchSize(count));
        const ofTarget = round.pictures.filter((id) => pictureColor(id) === round.color);
        expect([...ofTarget].sort()).toEqual([...round.matches].sort());
      }
    }
  });

  it('shows others of different colors, so no second answer can be argued', () => {
    for (const seed of seeds) {
      const round = createColorRound(6, createRng(seed));
      const others = round.pictures.filter((id) => !round.matches.includes(id));
      const colors = others.map((id) => pictureColor(id));
      expect(colors).not.toContain(round.color);
      // Three others come from three different colors while there are four to choose from.
      expect(new Set(colors).size).toBe(others.length);
    }
  });

  it('is the same for the same seed', () => {
    expect(createColorRound(6, createRng(9))).toEqual(createColorRound(6, createRng(9)));
  });

  it('never repeats the previous color on Another color', () => {
    const rng = createRng(5);
    let color = createColorRound(4, rng).color;
    for (let i = 0; i < 100; i++) {
      const next = createColorRound(i % 2 ? 4 : 6, rng, color);
      expect(next.color).not.toBe(color);
      color = next.color;
    }
  });

  it('works from a small table, and says so when it cannot', () => {
    const small = [
      { id: 'red' as const, pictures: ['apple', 'bus'] },
      { id: 'blue' as const, pictures: ['kettle', 'car', 'umbrella'] },
    ];
    const round = createColorRound(4, createRng(1), undefined, small);
    expect(round.pictures).toHaveLength(4);
    expect(() => createColorRound(4, createRng(1), undefined, [])).toThrow();
  });

  it('uses every color in the table over many rounds', () => {
    const seen = new Set(seeds.map((s) => createColorRound(4, createRng(s)).color));
    expect(seen).toEqual(new Set(MATCH_COLORS.map((c) => c.id)));
  });
});

describe('color match play', () => {
  const round = createColorRound(4, createRng(3));
  const [a, b] = round.matches as [string, string];
  const other = round.pictures.find((id) => !round.matches.includes(id)) as string;

  it('keeps a found picture and is done when every match is found', () => {
    let state = startColors(round);
    expect(colorTapResult(state, a)).toBe('found');
    state = tapColor(state, a);
    expect(state.found).toEqual([a]);
    expect(isColorDone(state)).toBe(false);
    expect(colorTapResult(state, a)).toBe('already');
    expect(tapColor(state, a)).toBe(state);
    state = tapColor(state, b);
    expect(isColorDone(state)).toBe(true);
  });

  it('changes nothing when another color is tapped, however many times', () => {
    const state = startColors(round);
    expect(colorTapResult(state, other)).toBe('other');
    expect(tapColor(state, other)).toBe(state);
    expect(tapColor(tapColor(state, other), other)).toEqual(state);
  });

  it('shows every match without penalty, and a tap after that only names the picture', () => {
    const state = showColors(startColors(round));
    expect(state.shown).toBe(true);
    expect([...state.found].sort()).toEqual([...round.matches].sort());
    expect(isColorDone(state)).toBe(true);
    expect(colorTapResult(state, other)).toBe('other');
    expect(colorTapResult(state, a)).toBe('already');
  });

  it('does not change the state it was given', () => {
    const state = startColors(round);
    const before = JSON.stringify(state);
    tapColor(state, a);
    showColors(state);
    expect(JSON.stringify(state)).toBe(before);
  });
});

describe('changing the count keeps the place (WEB-053)', () => {
  it('keeps the color and the pictures already on the board when going from four to six', () => {
    for (const seed of seeds) {
      const state = tapColor(startColors(createColorRound(4, createRng(seed))), createColorRound(4, createRng(seed)).matches[0] as string);
      const next = resizeColorState(state, 6, createRng(seed + 100));
      expect(next.round.color).toBe(state.round.color);
      expect(next.round.pictures).toHaveLength(6);
      expect(next.round.matches).toHaveLength(3);
      for (const id of state.round.pictures) expect(next.round.pictures).toContain(id);
      expect(next.found).toEqual(state.found);
      const ofTarget = next.round.pictures.filter((id) => pictureColor(id) === next.round.color);
      expect([...ofTarget].sort()).toEqual([...next.round.matches].sort());
    }
  });

  it('keeps what was found, and the color, when going from six to four', () => {
    for (const seed of seeds) {
      const round = createColorRound(6, createRng(seed));
      let state = startColors(round);
      state = tapColor(state, round.matches[2] as string);
      state = tapColor(state, round.matches[0] as string);
      const next = resizeColorState(state, 4, createRng(seed + 100));
      expect(next.round.color).toBe(round.color);
      expect(next.round.pictures).toHaveLength(4);
      expect(next.round.matches).toHaveLength(2);
      expect([...next.found].sort()).toEqual([round.matches[0], round.matches[2]].sort());
      const ofTarget = next.round.pictures.filter((id) => pictureColor(id) === next.round.color);
      expect([...ofTarget].sort()).toEqual([...next.round.matches].sort());
    }
  });

  it('keeps a shown round shown', () => {
    const state = showColors(startColors(createColorRound(4, createRng(2))));
    const next = resizeColorState(state, 6, createRng(3));
    expect(next.shown).toBe(true);
    expect(isColorDone(next)).toBe(true);
  });

  it('returns the same board for the same count', () => {
    const state = startColors(createColorRound(6, createRng(4)));
    const next = resizeColorState(state, 6, createRng(5));
    expect([...next.round.pictures].sort()).toEqual([...state.round.pictures].sort());
  });
});
