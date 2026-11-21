import { describe, expect, it } from 'vitest';
import {
  EXPORT_FORMAT,
  EXPORT_VERSION,
  MAX_CARDS,
  MAX_COLLECTIONS,
  MAX_IMPORT_BYTES,
  MAX_NAME_LENGTH,
  STORAGE_KEY,
  addCard,
  checkName,
  clearCollections,
  createCollection,
  deleteCollection,
  exportCollections,
  importCollections,
  loadCollections,
  parseStored,
  removeCard,
  renameCollection,
  saveCollections,
  type Collection,
  type Collections,
} from './saved-collections';

const KNOWN = new Set(['draw-to-music', 'make-a-greeting-card', 'paper-flowers']);
const known = (n: number) => new Set(Array.from({ length: n }, (_, i) => `card-${i}`));

function memory(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => {
      data.set(k, v);
    },
    removeItem: (k: string) => {
      data.delete(k);
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
  removeItem: () => {
    throw new Error('blocked');
  },
};

const ids = (): (() => string) => {
  let i = 0;
  return () => `c${(i += 1)}`;
};

/** Builds a list with the given collections, without going through the API under test. */
const list = (...items: Array<[string, string, string[]]>): Collections =>
  items.map(([id, name, cards]) => ({ id, name, cards }));

const deepFreeze = <T>(value: T): T => {
  if (value && typeof value === 'object') {
    for (const v of Object.values(value)) deepFreeze(v);
    Object.freeze(value);
  }
  return value;
};

/** A collections file as text, for the import tests. */
const file = (body: unknown) => JSON.stringify(body);
const good = (collections: unknown[] = [{ name: 'Sunday with Dad', cards: ['draw-to-music'] }]) => ({
  format: EXPORT_FORMAT,
  version: EXPORT_VERSION,
  collections,
});

describe('storage key and limits', () => {
  it('keeps every collection under one local key with the agreed limits', () => {
    expect(STORAGE_KEY).toBe('ca-collections-v1');
    expect(MAX_COLLECTIONS).toBe(20);
    expect(MAX_CARDS).toBe(60);
    expect(MAX_NAME_LENGTH).toBe(60);
    expect(MAX_IMPORT_BYTES).toBe(64 * 1024);
  });
});

describe('checkName', () => {
  it('accepts a plain name and rejects an empty one', () => {
    expect(checkName('Sunday with Dad', [])).toBeNull();
    expect(checkName('   ', [])).toMatch(/name/i);
  });

  it('counts characters, not bytes, against the 60 character limit', () => {
    expect(checkName('a'.repeat(60), [])).toBeNull();
    expect(checkName('a'.repeat(61), [])).toMatch(/60/);
    expect(checkName('é'.repeat(60), [])).toBeNull();
  });

  it('rejects line breaks and control characters', () => {
    expect(checkName('Two\nlines', [])).toMatch(/plain text/i);
    expect(checkName('tab\there', [])).toMatch(/plain text/i);
    expect(checkName('bell\u0007', [])).toMatch(/plain text/i);
  });

  it('rejects a name already used, ignoring case and the collection being renamed', () => {
    const existing = list(['c1', 'Sunday with Dad', []]);
    expect(checkName('sunday WITH dad', existing)).toMatch(/already/i);
    expect(checkName('Sunday with Dad', existing, 'c1')).toBeNull();
  });
});

describe('creating, renaming and deleting collections', () => {
  it('adds a named, empty collection and keeps the name trimmed', () => {
    const result = createCollection([], '  Sunday with Dad  ', 'c1');
    expect(result).toEqual({ ok: true, collections: [{ id: 'c1', name: 'Sunday with Dad', cards: [] }] });
  });

  it('refuses a twenty-first collection with a plain message', () => {
    const full = Array.from({ length: MAX_COLLECTIONS }, (_, i) => ({ id: `c${i}`, name: `Name ${i}`, cards: [] }));
    const result = createCollection(full, 'One more', 'x');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/20/);
  });

  it('renames one collection and refuses a name another collection has', () => {
    const start = list(['c1', 'Sunday', []], ['c2', 'Birthday', []]);
    const renamed = renameCollection(start, 'c1', 'Sunday afternoon');
    expect(renamed.ok && renamed.collections[0]?.name).toBe('Sunday afternoon');
    expect(renameCollection(start, 'c1', 'birthday').ok).toBe(false);
  });

  it('deletes one collection and leaves the others', () => {
    const start = list(['c1', 'A', []], ['c2', 'B', []]);
    expect(deleteCollection(start, 'c1')).toEqual({ ok: true, collections: [{ id: 'c2', name: 'B', cards: [] }] });
  });
});

describe('adding and removing cards', () => {
  it('adds a known card once, at the end of the collection', () => {
    const start = list(['c1', 'A', ['paper-flowers']]);
    const result = addCard(start, 'c1', 'draw-to-music', KNOWN);
    expect(result.ok && result.collections[0]?.cards).toEqual(['paper-flowers', 'draw-to-music']);
    const again = addCard(start, 'c1', 'paper-flowers', KNOWN);
    expect(again.ok && again.collections[0]?.cards).toEqual(['paper-flowers']);
  });

  it('refuses a card key that is not an activity on this site', () => {
    expect(addCard(list(['c1', 'A', []]), 'c1', 'not-a-card', KNOWN).ok).toBe(false);
  });

  it('refuses a sixty-first card in one collection', () => {
    const full = list(['c1', 'A', Array.from({ length: MAX_CARDS }, (_, i) => `card-${i}`)]);
    const result = addCard(full, 'c1', 'card-60', known(MAX_CARDS + 1));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/60/);
  });

  it('removes a card and reports a missing collection', () => {
    const start = list(['c1', 'A', ['draw-to-music', 'paper-flowers']]);
    const result = removeCard(start, 'c1', 'draw-to-music');
    expect(result.ok && result.collections[0]?.cards).toEqual(['paper-flowers']);
    expect(removeCard(start, 'nope', 'draw-to-music').ok).toBe(false);
  });
});

describe('immutability', () => {
  it('never changes the list or collection it was given', () => {
    const start = deepFreeze(list(['c1', 'Sunday', ['paper-flowers']], ['c2', 'Other', []]));
    const snapshot = JSON.stringify(start);

    createCollection(start, 'New', 'c3');
    renameCollection(start, 'c1', 'Renamed');
    deleteCollection(start, 'c1');
    addCard(start, 'c1', 'draw-to-music', KNOWN);
    removeCard(start, 'c1', 'paper-flowers');
    importCollections(file(good()), KNOWN, start, ids());

    expect(JSON.stringify(start)).toBe(snapshot);
  });

  it('returns a new object for the collection it changes and keeps the others', () => {
    const start = list(['c1', 'A', []], ['c2', 'B', []]);
    const result = addCard(start, 'c1', 'draw-to-music', KNOWN);
    if (!result.ok) throw new Error('expected ok');
    expect(result.collections[0]).not.toBe(start[0]);
    expect(result.collections[1]).toBe(start[1]);
  });
});

describe('parseStored', () => {
  it('reads what was saved', () => {
    const data: Collections = list(['c1', 'Sunday with Dad', ['draw-to-music']]);
    expect(parseStored(JSON.stringify({ version: 1, collections: data }), KNOWN)).toEqual(data);
  });

  it('reads anything malformed as nothing saved', () => {
    expect(parseStored(null)).toEqual([]);
    expect(parseStored('not json')).toEqual([]);
    expect(parseStored('[]')).toEqual([]);
    expect(parseStored('{"collections":"nope"}')).toEqual([]);
  });

  it('drops bad entries but keeps the good ones, and caps the count', () => {
    const raw = JSON.stringify({
      version: 1,
      collections: [
        { id: 'c1', name: 'Good', cards: ['draw-to-music', 'gone-card'] },
        { id: 'bad id', name: 'Bad id', cards: [] },
        { id: 'c2', name: '', cards: [] },
        { id: 'c3', name: 'Good', cards: [] },
      ],
    });
    expect(parseStored(raw, KNOWN)).toEqual([{ id: 'c1', name: 'Good', cards: ['draw-to-music'] }]);
    const many = JSON.stringify({
      version: 1,
      collections: Array.from({ length: MAX_COLLECTIONS + 3 }, (_, i) => ({ id: `c${i}`, name: `N${i}`, cards: [] })),
    });
    expect(parseStored(many)).toHaveLength(MAX_COLLECTIONS);
  });
});

describe('browser storage', () => {
  it('round-trips through the one key', () => {
    const storage = memory();
    const data = list(['c1', 'Sunday with Dad', ['draw-to-music']]);
    expect(saveCollections(storage, data)).toBe(true);
    expect([...storage.data.keys()]).toEqual([STORAGE_KEY]);
    expect(loadCollections(storage, KNOWN)).toEqual(data);
  });

  it('clears every collection in one step', () => {
    const storage = memory();
    saveCollections(storage, list(['c1', 'A', []], ['c2', 'B', []]));
    expect(clearCollections(storage)).toBe(true);
    expect(storage.data.has(STORAGE_KEY)).toBe(false);
    expect(loadCollections(storage, KNOWN)).toEqual([]);
  });

  it('catches storage that throws: reads as empty, writes report false, the page still works', () => {
    expect(loadCollections(refusing, KNOWN)).toEqual([]);
    expect(saveCollections(refusing, list(['c1', 'A', []]))).toBe(false);
    expect(clearCollections(refusing)).toBe(false);
    expect(loadCollections(undefined, KNOWN)).toEqual([]);
    expect(saveCollections(undefined, [])).toBe(false);
    expect(clearCollections(undefined)).toBe(false);
  });
});

describe('exportCollections', () => {
  it('holds exactly the format, version and, per collection, a name and card keys', () => {
    const text = exportCollections(list(['c1', 'Sunday with Dad', ['draw-to-music', 'paper-flowers']]));
    const parsed = JSON.parse(text) as Record<string, unknown>;
    expect(Object.keys(parsed).sort()).toEqual(['collections', 'format', 'version']);
    expect(parsed.format).toBe(EXPORT_FORMAT);
    expect(parsed.version).toBe(EXPORT_VERSION);
    expect(parsed.collections).toEqual([{ name: 'Sunday with Dad', cards: ['draw-to-music', 'paper-flowers'] }]);
  });

  it('does not write internal ids, dates, card titles or anything else', () => {
    const text = exportCollections(list(['c1', 'A', ['draw-to-music']]));
    expect(text).not.toContain('"id"');
    expect(text).not.toContain('Draw');
    expect(text).not.toMatch(/\d{4}-\d{2}-\d{2}T/);
  });

  it('exports an empty list as an empty collections array', () => {
    expect(JSON.parse(exportCollections([])).collections).toEqual([]);
  });
});

describe('importCollections', () => {
  it('adds the collections from a valid file with new ids, after the ones already here', () => {
    const existing = list(['e1', 'Birthday', []]);
    const result = importCollections(file(good()), KNOWN, existing, ids());
    expect(result).toEqual({
      ok: true,
      collections: [
        { id: 'e1', name: 'Birthday', cards: [] },
        { id: 'c1', name: 'Sunday with Dad', cards: ['draw-to-music'] },
      ],
    });
  });

  it('round-trips an export', () => {
    const data = list(['c1', 'Sunday with Dad', ['draw-to-music']], ['c2', 'Rainy days', []]);
    const result = importCollections(exportCollections(data), KNOWN, [], ids());
    expect(result.ok && result.collections.map((c) => [c.name, c.cards])).toEqual([
      ['Sunday with Dad', ['draw-to-music']],
      ['Rainy days', []],
    ]);
  });

  const bad: Array<[string, string]> = [
    ['not JSON', 'Sunday, cards: draw'],
    ['a JSON array', '[]'],
    ['a JSON string', '"hello"'],
    ['the wrong format name', file({ ...good(), format: 'something-else' })],
    ['a different version', file({ ...good(), version: 2 })],
    ['an extra top-level field', file({ ...good(), owner: 'me' })],
    ['a missing collections field', file({ format: EXPORT_FORMAT, version: EXPORT_VERSION })],
    ['no collections', file(good([]))],
    ['a collection that is not an object', file(good(['Sunday']))],
    ['an extra field in a collection', file(good([{ name: 'A', cards: [], id: 'c9' }]))],
    ['a collection with no name', file(good([{ cards: [] }]))],
    ['a name with a line break', file(good([{ name: 'a\nb', cards: [] }]))],
    ['a name over 60 characters', file(good([{ name: 'x'.repeat(61), cards: [] }]))],
    ['a card that is an object, not a key', file(good([{ name: 'A', cards: [{ key: 'x' }] }]))],
    ['an activity that this site does not have', file(good([{ name: 'A', cards: ['no-such-activity'] }]))],
    ['the same activity twice in one collection', file(good([{ name: 'A', cards: ['draw-to-music', 'draw-to-music'] }]))],
    ['more than 60 activities in one collection', file(good([{ name: 'A', cards: Array.from({ length: 61 }, () => 'draw-to-music') }]))],
    ['the same name twice in the file', file(good([{ name: 'A', cards: [] }, { name: 'a', cards: [] }]))],
    ['more than 20 collections', file(good(Array.from({ length: 21 }, (_, i) => ({ name: `N${i}`, cards: [] }))))],
  ];

  it.each(bad)('rejects %s with a plain message and no collections', (_label, text) => {
    const result = importCollections(text, KNOWN, [], ids());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message.length).toBeGreaterThan(10);
      expect(result.message).not.toMatch(/undefined|Error|exception/i);
    }
  });

  it('rejects a file larger than the limit before reading it as collections', () => {
    const padded = file(good([{ name: 'A', cards: [] }])).replace('"A"', `"${'A'.repeat(MAX_IMPORT_BYTES)}"`);
    const result = importCollections(padded, KNOWN, [], ids());
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/too large/i);
  });

  it('rejects a name already on this device, and changes nothing', () => {
    const existing = list(['c1', 'sunday with dad', []]);
    const result = importCollections(file(good()), KNOWN, existing, ids());
    expect(result.ok).toBe(false);
    expect(existing).toEqual(list(['c1', 'sunday with dad', []]));
  });

  it('rejects a file that would take the device past 20 collections, as a whole', () => {
    const existing = Array.from({ length: 18 }, (_, i) => ({ id: `e${i}`, name: `Existing ${i}`, cards: [] }));
    const incoming = Array.from({ length: 3 }, (_, i) => ({ name: `New ${i}`, cards: [] }));
    const result = importCollections(file(good(incoming)), KNOWN, existing, ids());
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/20/);
  });

  it('never partially applies a file with one bad collection', () => {
    const text = file(
      good([
        { name: 'Fine', cards: ['draw-to-music'] },
        { name: 'Broken', cards: ['no-such-activity'] },
      ]),
    );
    expect(importCollections(text, KNOWN, [], ids()).ok).toBe(false);
  });

  it('gives an import the same stored shape as the rest of the list', () => {
    const result = importCollections(file(good()), KNOWN, [], ids());
    if (!result.ok) throw new Error('expected ok');
    const storage = memory();
    expect(saveCollections(storage, result.collections)).toBe(true);
    expect(loadCollections(storage, KNOWN)).toEqual(result.collections as Collection[]);
  });
});
