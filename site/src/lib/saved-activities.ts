/**
 * Activities saved for later (DESIGN.md › Individual activity: Start / Print /
 * Save). Only activity slugs are kept, in this browser's localStorage: nothing
 * is sent anywhere, and clearing site data removes them.
 */
export const STORAGE_KEY = 'ca-saved-activities-v1';
export const MAX_SAVED = 60;

type ReadStorage = Pick<Storage, 'getItem'>;
type WriteStorage = Pick<Storage, 'setItem'>;

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Saved slugs, keeping only well-formed ones once each; anything else reads as none. */
export function parseSaved(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    const slugs = data.filter((s): s is string => typeof s === 'string' && SLUG.test(s));
    return [...new Set(slugs)].slice(0, MAX_SAVED);
  } catch {
    return [];
  }
}

export function isSaved(saved: readonly string[], slug: string): boolean {
  return saved.includes(slug);
}

/** Saves a new activity first, or removes one already saved. */
export function toggleSaved(saved: readonly string[], slug: string): string[] {
  return isSaved(saved, slug) ? saved.filter((s) => s !== slug) : [slug, ...saved].slice(0, MAX_SAVED);
}

/** Private windows and blocked site data throw on access; treat both as empty. */
export function loadSaved(storage: ReadStorage | undefined): string[] {
  try {
    return parseSaved(storage?.getItem(STORAGE_KEY) ?? null);
  } catch {
    return [];
  }
}

/** Whether the list was stored; false means the browser refused. */
export function saveSaved(storage: WriteStorage | undefined, saved: readonly string[]): boolean {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(saved));
    return true;
  } catch {
    return false;
  }
}

/** The page's localStorage, or undefined where even reading the property throws. */
export function browserStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}
