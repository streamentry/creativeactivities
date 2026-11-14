import { describe, expect, it } from 'vitest';
import { MAX_SAVED, STORAGE_KEY, isSaved, loadSaved, parseSaved, saveSaved, toggleSaved } from './saved-activities';

function memory(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (k: string) => data[k] ?? null,
    setItem: (k: string, v: string) => {
      data[k] = v;
    },
  };
}

const refusing = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('blocked');
  },
};

describe('parseSaved', () => {
  it('keeps well-formed slugs once each, newest first as stored', () => {
    expect(parseSaved('["draw-to-music","make-a-greeting-card","draw-to-music"]')).toEqual([
      'draw-to-music',
      'make-a-greeting-card',
    ]);
  });

  it('reads anything malformed as nothing saved', () => {
    expect(parseSaved(null)).toEqual([]);
    expect(parseSaved('not json')).toEqual([]);
    expect(parseSaved('{"a":1}')).toEqual([]);
    expect(parseSaved('["../etc/passwd", "Draw To Music", 3, "ok-slug"]')).toEqual(['ok-slug']);
  });

  it('never keeps more than the limit', () => {
    const many = JSON.stringify(Array.from({ length: MAX_SAVED + 5 }, (_, i) => `card-${i}`));
    expect(parseSaved(many)).toHaveLength(MAX_SAVED);
  });
});

describe('toggleSaved', () => {
  it('adds a new activity first and removes a saved one', () => {
    expect(toggleSaved(['a'], 'b')).toEqual(['b', 'a']);
    expect(toggleSaved(['b', 'a'], 'b')).toEqual(['a']);
  });

  it('does not change the list it was given', () => {
    const list = ['a'];
    toggleSaved(list, 'b');
    expect(list).toEqual(['a']);
  });

  it('drops the oldest when the list is full', () => {
    const full = Array.from({ length: MAX_SAVED }, (_, i) => `card-${i}`);
    const next = toggleSaved(full, 'new-card');
    expect(next).toHaveLength(MAX_SAVED);
    expect(next[0]).toBe('new-card');
    expect(next).not.toContain(`card-${MAX_SAVED - 1}`);
  });
});

describe('browser storage', () => {
  it('round-trips through one key', () => {
    const storage = memory();
    expect(saveSaved(storage, ['draw-to-music'])).toBe(true);
    expect(Object.keys(storage.data)).toEqual([STORAGE_KEY]);
    expect(loadSaved(storage)).toEqual(['draw-to-music']);
    expect(isSaved(loadSaved(storage), 'draw-to-music')).toBe(true);
  });

  it('treats blocked or missing storage as empty and unsaved', () => {
    expect(loadSaved(refusing)).toEqual([]);
    expect(saveSaved(refusing, ['a'])).toBe(false);
    expect(loadSaved(undefined)).toEqual([]);
    expect(saveSaved(undefined, ['a'])).toBe(false);
  });
});
