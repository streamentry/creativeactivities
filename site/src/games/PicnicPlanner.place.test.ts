import { describe, expect, it } from 'vitest';
import { PICNIC_ITEMS } from '../data/picnic-planner';
import { parsePicnicPlace } from './PicnicPlanner';

const [a, b, c] = PICNIC_ITEMS.map((item) => item.id);
const tile = (value: string, matched = false) => ({ value, matched });
const play = (basket: string[], tiles: unknown) => ({ basket, stage: 'play', tiles });

describe('Picnic planner keeps its place (WEB-054)', () => {
  it('keeps a basket being planned, with no board', () => {
    expect(parsePicnicPlace({ basket: [a], stage: 'plan', tiles: [] })).toEqual({ basket: [a], stage: 'plan', tiles: [] });
  });

  it('refuses a planning place that still holds a board', () => {
    expect(parsePicnicPlace({ basket: [a, b], stage: 'plan', tiles: [tile(a), tile(a), tile(b), tile(b)] })).toBeNull();
  });

  it('keeps a board in play, in its saved layout with matched pairs', () => {
    const tiles = [tile(b), tile(a, true), tile(a, true), tile(b)];
    expect(parsePicnicPlace(play([a, b], tiles))).toEqual({ basket: [a, b], stage: 'play', tiles });
  });

  it('refuses a play place with fewer than the fewest pictures to play', () => {
    expect(parsePicnicPlace(play([a], [tile(a), tile(a)]))).toBeNull();
  });

  it('refuses a play board whose layout is not the basket', () => {
    expect(parsePicnicPlace(play([a, b], [tile(a), tile(a), tile(b), tile(c)]))).toBeNull();
    expect(parsePicnicPlace(play([a, b], [tile(a), tile(a), tile(b)]))).toBeNull();
  });

  it('refuses a play board with a pair that disagrees about matched', () => {
    expect(parsePicnicPlace(play([a, b], [tile(a, true), tile(a), tile(b), tile(b)]))).toBeNull();
  });

  it('refuses a stage it does not know, or a basket that is not a list of known pictures', () => {
    expect(parsePicnicPlace({ basket: [a], stage: 'sprint', tiles: [] })).toBeNull();
    expect(parsePicnicPlace({ basket: ['not-a-picture'], stage: 'plan', tiles: [] })).toBeNull();
    expect(parsePicnicPlace({ basket: [a, a], stage: 'plan', tiles: [] })).toBeNull();
    expect(parsePicnicPlace(null)).toBeNull();
  });

  it('refuses a play place with no layout at all', () => {
    expect(parsePicnicPlace({ basket: [a, b], stage: 'play' })).toBeNull();
  });
});
