import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearPlace, keepsPlace, loadPlace, placeKey, PLACE_KEY, savePlace } from './place';

/** A Storage stand-in that can refuse every call, as private windows and blocked storage do. */
function fakeStorage(options: { refuse?: boolean } = {}) {
  const data = new Map<string, string>();
  const check = () => {
    if (options.refuse) throw new DOMException('blocked', 'SecurityError');
  };
  return {
    data,
    getItem(key: string) {
      check();
      return data.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      check();
      data.set(key, value);
    },
    removeItem(key: string) {
      check();
      data.delete(key);
    },
  };
}

const KEY = 'gm-place-v1-find-the-same';
const BOARD = { count: 3, target: 'apple', options: ['apple', 'pear', 'fig'], found: false };

describe('a game place on this device (WEB-054)', () => {
  let storage: ReturnType<typeof fakeStorage>;

  beforeEach(() => {
    storage = fakeStorage();
    vi.stubGlobal('localStorage', storage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('uses one versioned key per game, starting with the shared prefix', () => {
    expect(PLACE_KEY).toBe('gm-place-v1-');
    expect(placeKey('find-the-same')).toBe(KEY);
  });

  it('saves a board and reads the same board back on a later visit', () => {
    expect(savePlace('find-the-same', BOARD)).toBe(true);
    expect(loadPlace('find-the-same')).toEqual(BOARD);
  });

  it('stores only the board, with a version and no timestamps or other fields', () => {
    savePlace('find-the-same', BOARD);
    const parsed = JSON.parse(storage.data.get(KEY) as string) as Record<string, unknown>;
    expect(Object.keys(parsed).sort()).toEqual(['board', 'v']);
    expect(parsed.v).toBe(1);
    expect(storage.data.get(KEY)).not.toMatch(/time|date|"at"|"ts"/i);
  });

  it('keeps each game in its own key', () => {
    savePlace('find-the-same', BOARD);
    savePlace('shadow-match', { other: true });
    expect(loadPlace('find-the-same')).toEqual(BOARD);
    expect(loadPlace('shadow-match')).toEqual({ other: true });
  });

  it('returns undefined when nothing is saved', () => {
    expect(loadPlace('find-the-same')).toBeUndefined();
  });

  it('clears the saved place', () => {
    savePlace('find-the-same', BOARD);
    clearPlace('find-the-same');
    expect(storage.data.has(KEY)).toBe(false);
    expect(loadPlace('find-the-same')).toBeUndefined();
  });

  it('ignores a saved place from an older version and removes it quietly', () => {
    storage.data.set(KEY, JSON.stringify({ v: 0, board: BOARD }));
    expect(loadPlace('find-the-same')).toBeUndefined();
    expect(storage.data.has(KEY)).toBe(false);
  });

  it('ignores corrupt JSON without throwing', () => {
    storage.data.set(KEY, '{"v":1,"board":');
    expect(() => loadPlace('find-the-same')).not.toThrow();
    expect(loadPlace('find-the-same')).toBeUndefined();
    expect(storage.data.has(KEY)).toBe(false);
  });

  it('ignores values that are not an envelope object', () => {
    for (const raw of ['null', '5', '"text"', '[]', '{"v":1}', '{"board":{}}']) {
      storage.data.set(KEY, raw);
      expect(loadPlace('find-the-same'), raw).toBeUndefined();
    }
  });

  it('refuses to save a board that cannot be turned into JSON', () => {
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(savePlace('find-the-same', cyclic)).toBe(false);
    expect(storage.data.has(KEY)).toBe(false);
  });

  it('never keeps a place for the photo games, which use family photos', () => {
    for (const slug of ['photo-pairs', 'scrapbook', 'picture-puzzle']) {
      expect(keepsPlace(slug), slug).toBe(false);
      expect(savePlace(slug, BOARD), slug).toBe(false);
      expect(storage.data.size, slug).toBe(0);
      expect(loadPlace(slug), slug).toBeUndefined();
    }
  });

  it('keeps a place for the other games', () => {
    expect(keepsPlace('find-the-same')).toBe(true);
    expect(keepsPlace('picture-pairs')).toBe(true);
  });
});

describe('when browser storage is unavailable', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', fakeStorage({ refuse: true }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does not throw on save, load or clear, and the game can still run', () => {
    expect(savePlace('find-the-same', BOARD)).toBe(false);
    expect(loadPlace('find-the-same')).toBeUndefined();
    expect(() => clearPlace('find-the-same')).not.toThrow();
  });

  it('works when localStorage is missing altogether', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(savePlace('find-the-same', BOARD)).toBe(false);
    expect(loadPlace('find-the-same')).toBeUndefined();
    expect(() => clearPlace('find-the-same')).not.toThrow();
  });
});
