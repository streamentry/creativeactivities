import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CAPTION_MAX, clampCaption, createHintWait, nextHintValue } from './photo-hint';
import type { PairTile } from './pairs';

const tile = (value: string, matched = false): PairTile => ({ key: `${value}-${Math.random()}`, value, matched });

describe('nextHintValue', () => {
  it('names one pair: the first unmatched picture in board order', () => {
    const tiles = [tile('a', true), tile('a', true), tile('b'), tile('c'), tile('b'), tile('c')];
    expect(nextHintValue(tiles)).toBe('b');
  });

  it('returns null when every pair is matched or there is no board', () => {
    expect(nextHintValue([tile('a', true), tile('a', true)])).toBeNull();
    expect(nextHintValue([])).toBeNull();
  });
});

describe('clampCaption', () => {
  it('keeps captions to 60 characters and leaves shorter ones alone', () => {
    expect(CAPTION_MAX).toBe(60);
    expect(clampCaption('x'.repeat(100))).toHaveLength(60);
    expect(clampCaption('Grandma at the lake')).toBe('Grandma at the lake');
  });

  it('counts whole characters, so an accented letter is never split', () => {
    const out = clampCaption('é'.repeat(70));
    expect(Array.from(out)).toHaveLength(60);
    expect(out.endsWith('é')).toBe(true);
  });
});

describe('createHintWait', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('fires once after the pause, and only while active', () => {
    const onHint = vi.fn();
    const wait = createHintWait(20_000, onHint);
    wait.tap();
    vi.advanceTimersByTime(60_000);
    expect(onHint).not.toHaveBeenCalled();

    wait.setActive(true);
    vi.advanceTimersByTime(19_999);
    expect(onHint).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onHint).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(60_000);
    expect(onHint).toHaveBeenCalledTimes(1);
  });

  it('clears and restarts the pause on every tap, so a hint never fires on a tap', () => {
    const onHint = vi.fn();
    const wait = createHintWait(20_000, onHint);
    wait.setActive(true);

    for (let i = 0; i < 5; i += 1) {
      vi.advanceTimersByTime(15_000);
      wait.tap();
    }
    expect(onHint).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(1);

    vi.advanceTimersByTime(19_999);
    expect(onHint).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onHint).toHaveBeenCalledTimes(1);
  });

  it('a tap at the last moment still restarts the wait', () => {
    const onHint = vi.fn();
    const wait = createHintWait(20_000, onHint);
    wait.setActive(true);
    vi.advanceTimersByTime(19_990);
    wait.tap();
    vi.advanceTimersByTime(19_990);
    expect(onHint).not.toHaveBeenCalled();
  });

  it('turning the wait off cancels the pending hint, and turning it on starts from zero', () => {
    const onHint = vi.fn();
    const wait = createHintWait(20_000, onHint);
    wait.setActive(true);
    vi.advanceTimersByTime(10_000);
    wait.setActive(false);
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(60_000);
    expect(onHint).not.toHaveBeenCalled();

    wait.setActive(true);
    vi.advanceTimersByTime(19_999);
    expect(onHint).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onHint).toHaveBeenCalledTimes(1);
  });

  it('setting the same state twice does not restart the pause', () => {
    const onHint = vi.fn();
    const wait = createHintWait(20_000, onHint);
    wait.setActive(true);
    vi.advanceTimersByTime(15_000);
    wait.setActive(true);
    vi.advanceTimersByTime(5_000);
    expect(onHint).toHaveBeenCalledTimes(1);
  });

  it('uses the injected timers', () => {
    const timers = { setTimeout: vi.fn(() => 7), clearTimeout: vi.fn() };
    const wait = createHintWait(20_000, () => undefined, timers);
    wait.setActive(true);
    expect(timers.setTimeout).toHaveBeenCalledWith(expect.any(Function), 20_000);
    wait.tap();
    expect(timers.clearTimeout).toHaveBeenCalledWith(7);
  });
});
