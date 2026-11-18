/**
 * "Your data on this device" (WEB-029): every item the site keeps in this
 * browser, in plain words, with the means to export or delete it. Nothing here
 * is sent anywhere; the site has no accounts and no server-side personal data.
 *
 * SITE_STORES is the list of keys the site writes. The inventory test
 * (docs/specs/global/data-inventory.md) fails when code writes a key that is
 * not in the inventory, so keep both in step.
 */
import { parseTried, TRIED_STORAGE_KEY } from './activity-feedback';
import { parseHave, STORAGE_KEY as WHAT_I_HAVE_KEY } from './what-i-have';
import { CONSENT_KEY } from './consent';
import { CONTRAST_KEY, PLAIN_STEPS_KEY, PLAY_SETTINGS_KEY, TEXT_SIZE_KEY } from './display-settings';
import { LANGUAGE_COOKIE, readCookie } from './language-choice';
import { PATHS } from '../data/paths';
import { parsePaths, PATHS_STORAGE_KEY } from './paths';
import { parseSaved, STORAGE_KEY as SAVED_KEY } from './saved-activities';
import { parseNotes, STORAGE_KEY as TODAY_NOTES_KEY } from './today/notes';

export interface SiteStore {
  readonly id: string;
  readonly kind: 'localStorage' | 'cookie';
  /** The localStorage key, or the cookie name. */
  readonly key: string;
  readonly label: string;
  readonly description: string;
  /** For stores that hold a list: how many entries a stored value has. */
  readonly count?: (raw: string) => number;
}

export const SITE_STORES: readonly SiteStore[] = [
  {
    id: 'saved',
    kind: 'localStorage',
    key: SAVED_KEY,
    label: 'Saved activities',
    description: 'Activities you chose to save for later, kept as their short names.',
    count: (raw) => parseSaved(raw).length,
  },
  {
    id: 'what-i-have',
    kind: 'localStorage',
    key: WHAT_I_HAVE_KEY,
    label: 'What I have list',
    description: 'The everyday items you ticked on the What I have page, kept as short names.',
    count: (raw) => parseHave(raw).length,
  },
  {
    id: 'tried',
    kind: 'localStorage',
    key: TRIED_STORAGE_KEY,
    label: 'Activities you tried',
    description:
      'Activities you marked as tried, kept as their short names to show your mark. Your first mark for each activity is also counted in site analytics.',
    count: (raw) => parseTried(raw).length,
  },
  {
    id: 'paths',
    kind: 'localStorage',
    key: PATHS_STORAGE_KEY,
    label: 'Place on four-week paths',
    description: 'Where you chose to start on each path and which weeks you skipped, kept as week numbers.',
    count: (raw) => Object.keys(parsePaths(raw, new Set(PATHS.map((p) => p.id)))).length,
  },
  {
    id: 'today-notes',
    kind: 'localStorage',
    key: TODAY_NOTES_KEY,
    label: 'Today notes',
    description: 'Notes you wrote on the Today page, with the day and how the activity went.',
    count: (raw) => parseNotes(raw).length,
  },
  {
    id: 'analytics-consent',
    kind: 'localStorage',
    key: CONSENT_KEY,
    label: 'Your answer about visit counting',
    description:
      'Whether you allowed Google Analytics to count your visits. Deleting it removes the answer, and the site asks again on your next page.',
  },
  {
    id: 'text-size',
    kind: 'localStorage',
    key: TEXT_SIZE_KEY,
    label: 'Text size',
    description: 'Whether you chose larger text on the site.',
  },
  {
    id: 'contrast',
    kind: 'localStorage',
    key: CONTRAST_KEY,
    label: 'High contrast',
    description: 'Whether you chose high contrast colors on the site.',
  },
  {
    id: 'plain-steps',
    kind: 'localStorage',
    key: PLAIN_STEPS_KEY,
    label: 'Short steps',
    description: 'Whether you chose short steps on activity cards.',
  },
  {
    id: 'play-settings',
    kind: 'localStorage',
    key: PLAY_SETTINGS_KEY,
    label: 'Game sound',
    description: 'Whether sound is on in the games.',
  },
  {
    id: 'language',
    kind: 'cookie',
    key: LANGUAGE_COOKIE,
    label: 'Language choice',
    description: 'The language you picked from the menu, so the site stays in it. Kept for one year.',
  },
];

/** The part of a Storage object this module uses, so tests can pass a stand-in. */
export type StorageLike = Pick<Storage, 'getItem' | 'removeItem'>;

export interface StoreRow {
  readonly store: SiteStore;
  /** The stored value as text, or null when nothing is stored (or the browser refuses to say). */
  readonly raw: string | null;
  /** Entries in a list store, or null when nothing is stored or the store is not a list. */
  readonly count: number | null;
}

/** Reads one store. A refused or missing storage reads as nothing stored. */
export function readStore(store: SiteStore, storage: StorageLike | undefined, cookies: string): string | null {
  if (store.kind === 'cookie') return readCookie(cookies, store.key);
  if (!storage) return null;
  try {
    return storage.getItem(store.key);
  } catch {
    return null;
  }
}

/** Every site store with its current value. */
export function readAll(storage: StorageLike | undefined, cookies: string): StoreRow[] {
  return SITE_STORES.map((store) => {
    const raw = readStore(store, storage, cookies);
    return { store, raw, count: raw !== null && store.count ? store.count(raw) : null };
  });
}

/**
 * Removes one store. A cookie is expired through `expireCookie`. Returns false
 * only when the browser refused to remove a value that the site wrote.
 */
export function removeStore(
  store: SiteStore,
  storage: StorageLike | undefined,
  expireCookie: (name: string) => void,
): boolean {
  if (store.kind === 'cookie') {
    expireCookie(store.key);
    return true;
  }
  if (!storage) return true;
  try {
    storage.removeItem(store.key);
    return true;
  } catch {
    return false;
  }
}

/** Removes every site store, and nothing else. */
export function removeAll(
  storage: StorageLike | undefined,
  expireCookie: (name: string) => void,
  stores: readonly SiteStore[] = SITE_STORES,
): { removed: number; failed: number } {
  let removed = 0;
  let failed = 0;
  for (const store of stores) {
    if (removeStore(store, storage, expireCookie)) removed += 1;
    else failed += 1;
  }
  return { removed, failed };
}

/** A plain-text export: each store, what it is for, where it lives and its stored value. */
export function exportText(rows: readonly StoreRow[], now: Date = new Date()): string {
  const lines = [
    'Creative Activities: what this browser keeps',
    `Exported: ${now.toISOString()}`,
    '',
    'This file was made in your browser. Creative Activities does not receive it.',
    '',
  ];
  rows.forEach((row, index) => {
    const where = row.store.kind === 'cookie' ? 'cookie' : 'this browser’s local storage';
    lines.push(`${index + 1}. ${row.store.label}`);
    lines.push(`   ${row.store.description}`);
    lines.push(`   Where: ${where}, name "${row.store.key}"`);
    lines.push(row.raw === null ? '   Not stored.' : `   Stored value: ${row.raw}`);
    lines.push('');
  });
  return lines.join('\n');
}
