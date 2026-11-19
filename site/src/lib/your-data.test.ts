import { describe, expect, it } from 'vitest';
import {
  SITE_STORES,
  exportText,
  readAll,
  readStore,
  removeAll,
  removeStore,
  type SiteStore,
} from './your-data';

/** A Storage stand-in that can be told to refuse reads or writes, as private windows do. */
function fakeStorage(initial: Record<string, string> = {}, options: { refuse?: boolean } = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem(key: string) {
      if (options.refuse) throw new DOMException('blocked', 'SecurityError');
      return data.get(key) ?? null;
    },
    removeItem(key: string) {
      if (options.refuse) throw new DOMException('blocked', 'SecurityError');
      data.delete(key);
    },
  };
}

const local = (id: string): SiteStore => {
  const store = SITE_STORES.find((s) => s.id === id);
  if (!store) throw new Error(`no store ${id}`);
  return store;
};

describe('site storage registry', () => {
  it('lists every key the site writes, once each', () => {
    const keys = SITE_STORES.map((s) => `${s.kind}:${s.key}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys.sort()).toEqual(
      [
        'cookie:gm_lang',
        'localStorage:ca-analytics-consent-v1',
        'localStorage:ca-paths-v1',
        'localStorage:ca-plain-steps',
        'localStorage:ca-saved-activities-v1',
        'localStorage:ca-tried-activities-v1',
        'localStorage:ca-what-i-have-v1',
        'localStorage:gm-contrast',
        'localStorage:gm-line-length',
        'localStorage:gm-play-settings',
        'localStorage:gm-spacing',
        'localStorage:gm-text-size',
        'localStorage:gm-theme',
        'localStorage:gm-today-notes-v1',
      ].sort(),
    );
  });

  it('counts the paths that have a place kept, and ignores places on paths that do not exist', () => {
    const paths = SITE_STORES.find((s) => s.id === 'paths');
    expect(paths?.count?.(JSON.stringify({ 'quiet-weeks-at-the-table': { start: 1, skipped: [] }, 'no-such-path': { start: 2, skipped: [] } }))).toBe(1);
    expect(paths?.count?.('not json')).toBe(0);
    expect(paths?.count?.('{}')).toBe(0);
  });

  it('gives every store a plain label and a description', () => {
    for (const store of SITE_STORES) {
      expect(store.label.trim().length).toBeGreaterThan(0);
      expect(store.description.trim().length).toBeGreaterThan(20);
    }
  });
});

describe('readStore and readAll', () => {
  it('reads a localStorage value and a cookie value', () => {
    const storage = fakeStorage({ 'gm-text-size': 'large' });
    expect(readStore(local('text-size'), storage, '')).toBe('large');
    expect(readStore(local('language'), storage, 'other=1; gm_lang=fr')).toBe('fr');
  });

  it('reads null when nothing is stored, storage is missing or storage refuses', () => {
    expect(readStore(local('saved'), fakeStorage(), '')).toBeNull();
    expect(readStore(local('saved'), undefined, '')).toBeNull();
    expect(readStore(local('saved'), fakeStorage({}, { refuse: true }), '')).toBeNull();
  });

  it('counts entries for list stores and skips the count for others', () => {
    const storage = fakeStorage({
      'ca-saved-activities-v1': '["make-a-card","sing-along"]',
      'gm-text-size': 'large',
    });
    const rows = readAll(storage, '');
    expect(rows.find((r) => r.store.id === 'saved')?.count).toBe(2);
    expect(rows.find((r) => r.store.id === 'text-size')?.count).toBeNull();
    expect(rows.find((r) => r.store.id === 'tried')?.raw).toBeNull();
  });

  it('counts the items on the What I have list and ignores names that are not on the list', () => {
    const storage = fakeStorage({ 'ca-what-i-have-v1': '["plain-paper","pencil","not-an-item"]' });
    expect(readAll(storage, '').find((r) => r.store.id === 'what-i-have')?.count).toBe(2);
  });
});

describe('removeStore and removeAll', () => {
  it('removes one store and leaves the others alone', () => {
    const storage = fakeStorage({ 'gm-text-size': 'large', 'ca-saved-activities-v1': '["a-b"]' });
    expect(removeStore(local('text-size'), storage, () => {})).toBe(true);
    expect(storage.data.has('gm-text-size')).toBe(false);
    expect(storage.data.has('ca-saved-activities-v1')).toBe(true);
  });

  it('expires the language cookie instead of touching storage', () => {
    const expired: string[] = [];
    expect(removeStore(local('language'), fakeStorage(), (name) => expired.push(name))).toBe(true);
    expect(expired).toEqual(['gm_lang']);
  });

  it('reports failure when the browser refuses to remove a value', () => {
    expect(removeStore(local('saved'), fakeStorage({}, { refuse: true }), () => {})).toBe(false);
  });

  it('removes every site key, keeps unrelated keys, and counts failures', () => {
    const storage = fakeStorage({
      'ca-saved-activities-v1': '[]',
      'gm-today-notes-v1': '{}',
      'unrelated-app-key': 'keep me',
    });
    const expired: string[] = [];
    const result = removeAll(storage, (name) => expired.push(name));
    expect(storage.data.get('unrelated-app-key')).toBe('keep me');
    expect(storage.data.has('ca-saved-activities-v1')).toBe(false);
    expect(storage.data.has('gm-today-notes-v1')).toBe(false);
    expect(expired).toEqual(['gm_lang']);
    expect(result).toEqual({ removed: SITE_STORES.length, failed: 0 });

    const refused = removeAll(fakeStorage({}, { refuse: true }), () => {});
    expect(refused.failed).toBe(SITE_STORES.filter((s) => s.kind === 'localStorage').length);
  });
});

describe('exportText', () => {
  it('writes a readable file with each store, its key and its stored value', () => {
    const rows = readAll(fakeStorage({ 'ca-tried-activities-v1': '["sing-along"]' }), 'gm_lang=de');
    const text = exportText(rows, new Date('2026-11-15T10:00:00Z'));
    expect(text).toContain('Creative Activities: what this browser keeps');
    expect(text).toContain('Exported: 2026-11-15T10:00:00.000Z');
    expect(text).toContain('Activities you tried');
    expect(text).toContain('ca-tried-activities-v1');
    expect(text).toContain('["sing-along"]');
    expect(text).toContain('Language choice');
    expect(text).toContain('de');
    expect(text).toContain('Not stored.');
  });
});
