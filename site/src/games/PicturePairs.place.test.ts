import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PICTURES } from '../data/pictures';
import { dailyValues } from '../lib/games/daily';
import { keepsPlace, savePlace } from './shared/place';
import { parseBoard } from './PicturePairs';

const ids = PICTURES.map((p) => p.id);
const picks = ids.slice(0, 2);
const DAY = '2026-11-20';
const dayValues = dailyValues(DAY, [...ids].sort());
const tiles = (values: readonly string[]) => values.flatMap((value) => [
  { value, matched: false },
  { value, matched: false },
]);
const board = (over: Record<string, unknown> = {}) => ({
  size: 4,
  view: 'showing',
  picks,
  day: null,
  tiles: tiles(picks),
  ...over,
});

describe('Picture pairs keeps its place (WEB-054)', () => {
  it('accepts a saved board with its picks and layout', () => {
    expect(parseBoard(board(), true)).not.toBeNull();
  });

  it('keeps the matched pairs in the layout it returns', () => {
    const matched = [
      { value: picks[0], matched: true },
      { value: picks[1], matched: false },
      { value: picks[0], matched: true },
      { value: picks[1], matched: false },
    ];
    expect(parseBoard(board({ tiles: matched }), true)?.tiles).toEqual(matched);
  });

  it('refuses a board that is not an object, or has no size or view it knows', () => {
    expect(parseBoard(null, true)).toBeNull();
    expect(parseBoard([], true)).toBeNull();
    expect(parseBoard(board({ size: 5 }), true)).toBeNull();
    expect(parseBoard(board({ view: 'upside' }), true)).toBeNull();
  });

  it('refuses picks that are the wrong count or not known pictures', () => {
    expect(parseBoard(board({ picks: [picks[0]] }), true)).toBeNull();
    expect(parseBoard(board({ picks: [picks[0], 'not-a-picture'] }), true)).toBeNull();
    expect(parseBoard(board({ picks: [picks[0], picks[0]] }), true)).toBeNull();
  });

  it('refuses a layout that is missing, the wrong length, or not the same pictures as the picks', () => {
    expect(parseBoard(board({ tiles: undefined }), true)).toBeNull();
    expect(parseBoard(board({ tiles: tiles(picks).slice(0, 3) }), true)).toBeNull();
    expect(parseBoard(board({ tiles: tiles([picks[0], ids[2]]) }), true)).toBeNull();
    expect(parseBoard(board({ tiles: [{ value: picks[0], matched: false }, { value: picks[1], matched: true }, { value: picks[0], matched: false }, { value: picks[1], matched: false }] }), true)).toBeNull();
  });

  it('refuses a day that is not a date key', () => {
    expect(parseBoard(board({ day: 'today' }), true)).toBeNull();
  });

  it('accepts a daily board whose layout is the daily pictures', () => {
    const daily = board({ day: DAY, picks: ids.slice(0, 4), tiles: tiles(dayValues), size: 8 });
    expect(parseBoard(daily, true)).not.toBeNull();
  });

  it('refuses a daily board when the daily card is not offered in this language', () => {
    const daily = board({ day: DAY, picks: ids.slice(0, 4), tiles: tiles(dayValues), size: 8 });
    expect(parseBoard(daily, false)).toBeNull();
  });

  it('refuses a daily board whose layout is not that day card', () => {
    expect(parseBoard(board({ day: DAY, tiles: tiles(picks) }), true)).toBeNull();
  });

  it('keeps its place under its own slug', () => {
    expect(keepsPlace('picture-pairs')).toBe(true);
  });
});

describe('Photo pairs never keeps a place', () => {
  it('saves nothing for the photo game', () => {
    expect(keepsPlace('photo-pairs')).toBe(false);
    expect(savePlace('photo-pairs', { board: 'family photos' })).toBe(false);
  });

  it('passes no place and no board tiles to its shared board', () => {
    const source = readFileSync(new URL('./PhotoPairs.tsx', import.meta.url), 'utf8');
    expect(source).not.toContain('place=');
    expect(source).not.toContain('onTiles');
    expect(source).not.toContain('resume=');
  });
});
