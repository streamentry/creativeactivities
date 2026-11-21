/**
 * WEB-054: a game's place (its own board state) kept on this device between
 * visits. One versioned key per game. Only the board is stored: no timestamps,
 * no scores, no personal data. The photo games never keep a place, because
 * they work with family photos.
 *
 * Every call is wrapped: storage may be missing, blocked or full, and the game
 * must still work without it.
 */

/** Written by the site as a storage key; listed in docs/specs/global/data-inventory.md. */
export const PLACE_KEY = 'gm-place-v1-';

const VERSION = 1;

/** Games that use family photos. They never keep a place (WEB-054, WEB-055). */
const PHOTO_GAMES: ReadonlySet<string> = new Set(['photo-pairs', 'scrapbook', 'picture-puzzle']);

export function placeKey(slug: string): string {
  return `${PLACE_KEY}${slug}`;
}

/** False for the photo games. */
export function keepsPlace(slug: string): boolean {
  return !PHOTO_GAMES.has(slug);
}

function storage(): Storage | undefined {
  return globalThis.localStorage ?? undefined;
}

/**
 * Saves the board for a game. Returns false when nothing was saved (photo game,
 * board that cannot be turned into JSON, or storage refused).
 */
export function savePlace(slug: string, board: unknown): boolean {
  if (!keepsPlace(slug)) return false;
  const store = storage();
  if (!store) return false;
  try {
    store.setItem(placeKey(slug), JSON.stringify({ v: VERSION, board }));
    return true;
  } catch {
    return false;
  }
}

/**
 * The saved board, or undefined when there is none. A value from another
 * version, or one that cannot be read, is removed quietly and reads as none.
 */
export function loadPlace(slug: string): unknown {
  if (!keepsPlace(slug)) return undefined;
  const key = placeKey(slug);
  let raw: string | null | undefined;
  try {
    raw = storage()?.getItem(key);
  } catch {
    return undefined;
  }
  if (raw === null || raw === undefined) return undefined;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && 'board' in parsed && (parsed as { v?: unknown }).v === VERSION) {
      return (parsed as { board: unknown }).board;
    }
  } catch {
    // Corrupt JSON falls through to removal below.
  }
  clearPlace(slug);
  return undefined;
}

/** Forgets the saved place for a game. Never throws. */
export function clearPlace(slug: string): void {
  try {
    storage()?.removeItem(placeKey(slug));
  } catch {
    // Storage refused; there is nothing to forget.
  }
}
