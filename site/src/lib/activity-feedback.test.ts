import { describe, expect, it } from 'vitest';
import { NOT_A_FIT_REASONS } from './track';
import { REASON_LABELS, REASON_NEXT, TRIED_STORAGE_KEY, loadTried, markTried, parseTried } from './activity-feedback';

const memory = (initial?: string) => {
  const store = new Map<string, string>(initial ? [[TRIED_STORAGE_KEY, initial]] : []);
  return {
    store,
    storage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    },
  };
};

describe('tried list (this browser only)', () => {
  it('reads nothing when storage is missing, blocked or holds junk', () => {
    expect(loadTried(undefined)).toEqual([]);
    expect(loadTried({ getItem: () => { throw new Error('blocked'); } })).toEqual([]);
    expect(parseTried('not json')).toEqual([]);
    expect(parseTried('{"a":1}')).toEqual([]);
    expect(parseTried('["paper-boats","Bad Name","paper-boats", 3]')).toEqual(['paper-boats']);
  });

  it('marks an activity once and reports whether it was stored', () => {
    const { storage, store } = memory();
    expect(markTried(storage, 'paper-boats')).toEqual({ stored: true, first: true });
    expect(markTried(storage, 'paper-boats')).toEqual({ stored: true, first: false });
    expect(JSON.parse(store.get(TRIED_STORAGE_KEY) ?? '[]')).toEqual(['paper-boats']);
    expect(loadTried(storage)).toEqual(['paper-boats']);
  });

  it('reports refused storage without throwing', () => {
    const refusing = { getItem: () => null, setItem: () => { throw new Error('quota'); } };
    expect(markTried(refusing, 'paper-boats')).toEqual({ stored: false, first: true });
  });

  it('ignores slugs that are not well formed', () => {
    const { storage } = memory();
    expect(markTried(storage, 'Not A Slug')).toEqual({ stored: false, first: false });
  });
});

describe('not-a-fit reasons', () => {
  it('has a plain label and a visible next step for every reason', () => {
    for (const reason of NOT_A_FIT_REASONS) {
      expect(REASON_LABELS[reason].length).toBeGreaterThan(3);
      const next = REASON_NEXT[reason];
      expect(next.text.length).toBeGreaterThan(10);
      expect(['#need', '#adapt', '/activity/']).toContain(next.href);
    }
  });

  it('keeps the wording free of therapy or cure claims', () => {
    const all = [...Object.values(REASON_LABELS), ...Object.values(REASON_NEXT).map((n) => n.text)].join(' ');
    expect(all).not.toMatch(/therap|heal|cure|brain|memory|diagnos/i);
  });
});
