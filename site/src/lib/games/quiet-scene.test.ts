import { describe, expect, it } from 'vitest';
import { PICTURE_BY_ID } from '../../data/pictures';
import { QUIET_SCENES, sceneAt, stepScene } from './quiet-scene';

describe('quiet scene pictures', () => {
  it('has 10 to 12 scenes, with no repeats', () => {
    expect(QUIET_SCENES.length).toBeGreaterThanOrEqual(10);
    expect(QUIET_SCENES.length).toBeLessThanOrEqual(12);
    expect(new Set(QUIET_SCENES).size).toBe(QUIET_SCENES.length);
  });

  it('uses only pictures that exist in the shared library', () => {
    for (const id of QUIET_SCENES) expect(PICTURE_BY_ID.has(id), id).toBe(true);
  });
});

describe('stepping through the scenes', () => {
  it('moves one picture forward and back', () => {
    expect(stepScene(0, 1)).toEqual({ index: 1, edge: null });
    expect(stepScene(5, -1)).toEqual({ index: 4, edge: null });
  });

  it('stops at the last picture and reports it, without wrapping', () => {
    const last = QUIET_SCENES.length - 1;
    expect(stepScene(last, 1)).toEqual({ index: last, edge: 'last' });
    expect(stepScene(last - 1, 1)).toEqual({ index: last, edge: null });
  });

  it('stops at the first picture and reports it, without wrapping', () => {
    expect(stepScene(0, -1)).toEqual({ index: 0, edge: 'first' });
  });

  it('keeps an out-of-range index inside the list', () => {
    expect(stepScene(-3, 1, 4)).toEqual({ index: 1, edge: null });
    expect(stepScene(99, -1, 4)).toEqual({ index: 2, edge: null });
    expect(sceneAt(99)).toBe(QUIET_SCENES[QUIET_SCENES.length - 1]);
    expect(sceneAt(-1)).toBe(QUIET_SCENES[0]);
  });

  it('is a pure function of its inputs, so nothing moves on its own', () => {
    expect(stepScene(3, 1)).toEqual(stepScene(3, 1));
  });
});
