/**
 * Saved collections on the device (WEB-028): named groups of saved activities,
 * such as "Sunday with Dad". Everything stays in this browser under ONE local
 * key (`ca-collections-v1`, listed in docs/specs/global/data-inventory.md).
 * Clearing site data, or "Delete everything" on /your-data/, removes them all.
 *
 * Export writes a file with collection names and activity keys only. Import
 * checks the whole file and either adds all of it or nothing: a bad file is
 * rejected with a plain message and never partly applied.
 *
 * Every change returns a new list; the list it was given is never altered.
 */

export const STORAGE_KEY = 'ca-collections-v1';
export const MAX_COLLECTIONS = 20;
export const MAX_CARDS = 60;
export const MAX_NAME_LENGTH = 60;
export const MAX_IMPORT_BYTES = 64 * 1024;
export const EXPORT_FORMAT = 'creative-activities-collections';
export const EXPORT_VERSION = 1;

export interface Collection {
  readonly id: string;
  readonly name: string;
  /** Activity keys (their short names), in the order added. */
  readonly cards: readonly string[];
}

export type Collections = readonly Collection[];

export type Outcome = { readonly ok: true; readonly collections: Collections } | { readonly ok: false; readonly message: string };

type ReadStorage = Pick<Storage, 'getItem'>;
type WriteStorage = Pick<Storage, 'setItem'>;
type RemoveStorage = Pick<Storage, 'removeItem'>;

const ID = /^[a-z0-9]{1,40}$/;
const CONTROL = /\p{Cc}/u;

const fail = (message: string): Outcome => ({ ok: false, message });
const done = (collections: Collections): Outcome => ({ ok: true, collections });

/** Null when the name can be used, otherwise the plain reason it cannot. */
export function checkName(name: string, taken: Collections, exceptId?: string): string | null {
  const clean = name.trim();
  if (clean.length === 0) return 'Give the collection a name.';
  if ([...clean].length > MAX_NAME_LENGTH) return `Keep the name to ${MAX_NAME_LENGTH} characters or fewer.`;
  if (CONTROL.test(clean)) return 'Use plain text for the name, without line breaks.';
  const key = clean.toLocaleLowerCase('en');
  if (taken.some((c) => c.id !== exceptId && c.name.toLocaleLowerCase('en') === key)) {
    return 'A collection with this name already exists.';
  }
  return null;
}

export function createCollection(collections: Collections, name: string, id: string): Outcome {
  if (collections.length >= MAX_COLLECTIONS) {
    return fail(`You can keep up to ${MAX_COLLECTIONS} collections. Delete one to make another.`);
  }
  const problem = checkName(name, collections);
  if (problem) return fail(problem);
  return done([...collections, { id, name: name.trim(), cards: [] }]);
}

export function renameCollection(collections: Collections, id: string, name: string): Outcome {
  if (!collections.some((c) => c.id === id)) return fail('That collection is no longer here.');
  const problem = checkName(name, collections, id);
  if (problem) return fail(problem);
  return done(collections.map((c) => (c.id === id ? { ...c, name: name.trim() } : c)));
}

export function deleteCollection(collections: Collections, id: string): Outcome {
  return done(collections.filter((c) => c.id !== id));
}

export function addCard(collections: Collections, id: string, key: string, known: ReadonlySet<string>): Outcome {
  if (!known.has(key)) return fail('That activity is not on this site.');
  const target = collections.find((c) => c.id === id);
  if (!target) return fail('That collection is no longer here.');
  if (target.cards.includes(key)) return done([...collections]);
  if (target.cards.length >= MAX_CARDS) return fail(`A collection holds up to ${MAX_CARDS} activities.`);
  return done(collections.map((c) => (c.id === id ? { ...c, cards: [...c.cards, key] } : c)));
}

export function removeCard(collections: Collections, id: string, key: string): Outcome {
  if (!collections.some((c) => c.id === id)) return fail('That collection is no longer here.');
  return done(collections.map((c) => (c.id === id ? { ...c, cards: c.cards.filter((k) => k !== key) } : c)));
}

/**
 * Reads the stored value. Malformed or unknown entries are dropped, not fatal,
 * so a later change to the activity list does not lose the rest.
 */
export function parseStored(raw: string | null, known?: ReadonlySet<string>): Collections {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!isRecord(data) || !Array.isArray(data.collections)) return [];
  const out: Collection[] = [];
  for (const item of data.collections) {
    if (!isRecord(item) || typeof item.id !== 'string' || !ID.test(item.id)) continue;
    if (typeof item.name !== 'string' || checkName(item.name, out) !== null) continue;
    if (!Array.isArray(item.cards)) continue;
    const cards = [...new Set(item.cards.filter((k): k is string => typeof k === 'string' && (!known || known.has(k))))];
    out.push({ id: item.id, name: item.name.trim(), cards: cards.slice(0, MAX_CARDS) });
    if (out.length === MAX_COLLECTIONS) break;
  }
  return out;
}

/** Collections in this browser; blocked or missing storage reads as none. */
export function loadCollections(storage: ReadStorage | undefined, known?: ReadonlySet<string>): Collections {
  try {
    return parseStored(storage?.getItem(STORAGE_KEY) ?? null, known);
  } catch {
    return [];
  }
}

/** True when stored; false when the browser refused or there is no storage. */
export function saveCollections(storage: WriteStorage | undefined, collections: Collections): boolean {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: EXPORT_VERSION, collections }));
    return true;
  } catch {
    return false;
  }
}

/** Removes every collection at once. False when the browser refused. */
export function clearCollections(storage: RemoveStorage | undefined): boolean {
  if (!storage) return false;
  try {
    storage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

/** The export file: format, version, and per collection only its name and card keys. */
export function exportCollections(collections: Collections): string {
  return JSON.stringify(
    {
      format: EXPORT_FORMAT,
      version: EXPORT_VERSION,
      collections: collections.map((c) => ({ name: c.name, cards: [...c.cards] })),
    },
    null,
    2,
  );
}

/**
 * Validates an import file in full and returns the collections with the file's
 * ones added after the existing ones, or a plain reason. Nothing is partly applied.
 */
export function importCollections(
  text: string,
  known: ReadonlySet<string>,
  existing: Collections,
  newId: () => string,
): Outcome {
  if (new TextEncoder().encode(text).length > MAX_IMPORT_BYTES) return fail('That file is too large to be a collections file.');
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return fail('That file is not a collections file. It is not in the right format.');
  }
  const notOurs = 'That file is not a Creative Activities collections file.';
  if (!isRecord(data) || !sameKeys(data, ['collections', 'format', 'version'])) return fail(notOurs);
  if (data.format !== EXPORT_FORMAT || data.version !== EXPORT_VERSION) return fail(notOurs);
  if (!Array.isArray(data.collections) || data.collections.length === 0) return fail('That file has no collections in it.');
  if (data.collections.length > MAX_COLLECTIONS) {
    return fail(`That file holds more than ${MAX_COLLECTIONS} collections. Nothing was added.`);
  }

  const incoming: Array<{ name: string; cards: string[] }> = [];
  for (const item of data.collections) {
    if (!isRecord(item) || !sameKeys(item, ['cards', 'name'])) return fail(notOurs);
    if (typeof item.name !== 'string') return fail(notOurs);
    const problem = checkName(item.name, [...existing, ...incoming.map((c) => ({ id: '', ...c, cards: [] }))]);
    if (problem) return fail(`A collection in the file cannot be added: ${problem} Nothing was added.`);
    if (!Array.isArray(item.cards)) return fail(notOurs);
    if (item.cards.length > MAX_CARDS) return fail(`A collection in the file holds more than ${MAX_CARDS} activities. Nothing was added.`);
    const cards: string[] = [];
    for (const key of item.cards) {
      if (typeof key !== 'string' || !known.has(key)) {
        return fail('The file lists an activity this site does not have. Nothing was added.');
      }
      if (cards.includes(key)) return fail('The file lists the same activity twice in one collection. Nothing was added.');
      cards.push(key);
    }
    incoming.push({ name: item.name.trim(), cards });
  }

  if (existing.length + incoming.length > MAX_COLLECTIONS) {
    return fail(`This device keeps up to ${MAX_COLLECTIONS} collections, and the file would go past it. Nothing was added.`);
  }
  return done([...existing, ...incoming.map((c) => ({ id: newId(), name: c.name, cards: c.cards }))]);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sameKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const have = Object.keys(value).sort();
  return have.length === keys.length && have.every((k, i) => k === keys[i]);
}
