/**
 * COM-024 "My made list": the activities a person marked as tried ("We tried
 * this"), each with an optional short private note. The tried list is kept by
 * activity-feedback.ts; this module keeps only the notes, under one versioned
 * key in this browser's localStorage. Nothing is sent anywhere.
 */

export const MADE_NOTES_KEY = 'ca-made-notes-v1';
export const MAX_NOTE = 280;
export const MAX_NOTES = 200;

type ReadStorage = Pick<Storage, 'getItem'>;
type WriteStorage = Pick<Storage, 'setItem'>;

export type MadeNotes = Readonly<Record<string, string>>;

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
// Control characters have no place in a plain-text note; line breaks are dropped too.
const CONTROL = /[\u0000-\u001f\u007f]/g;

/** A note as stored: plain text, trimmed, at most MAX_NOTE characters. */
export function cleanNote(text: string): string {
  return text.replace(CONTROL, '').trim().slice(0, MAX_NOTE);
}

/** Notes keyed by short name, keeping only well-formed entries; anything else reads as none. */
export function parseNotes(raw: string | null): Record<string, string> {
  if (!raw) return {};
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== 'object' || data === null || Array.isArray(data)) return {};
    const out: Record<string, string> = {};
    for (const [slug, value] of Object.entries(data as Record<string, unknown>)) {
      if (Object.keys(out).length >= MAX_NOTES) break;
      if (!SLUG.test(slug) || typeof value !== 'string') continue;
      const note = cleanNote(value);
      if (note) out[slug] = note;
    }
    return out;
  } catch {
    return {};
  }
}

/** The number of notes that hold text. */
export function countNotes(raw: string): number {
  return Object.keys(parseNotes(raw)).length;
}

/**
 * Sets one note without changing the map given. Empty text removes the note.
 * A new note is not added once the list is full, and a bad short name is ignored.
 */
export function setNote(notes: MadeNotes, slug: string, text: string): Record<string, string> {
  if (!SLUG.test(slug)) return { ...notes };
  const note = cleanNote(text);
  const next: Record<string, string> = { ...notes };
  if (!note) {
    delete next[slug];
    return next;
  }
  if (!(slug in notes) && Object.keys(notes).length >= MAX_NOTES) return { ...notes };
  next[slug] = note;
  return next;
}

/** Private windows and blocked site data throw on access; treat both as empty. */
export function loadNotes(storage: ReadStorage | undefined): Record<string, string> {
  try {
    return parseNotes(storage?.getItem(MADE_NOTES_KEY) ?? null);
  } catch {
    return {};
  }
}

/** Whether the notes were stored; false means the browser refused or there is no storage. */
export function saveNotes(storage: WriteStorage | undefined, notes: MadeNotes): boolean {
  if (!storage) return false;
  try {
    storage.setItem(MADE_NOTES_KEY, JSON.stringify(notes));
    return true;
  } catch {
    return false;
  }
}

export interface MadeRow {
  slug: string;
  name: string;
  note: string;
}

/**
 * The made list: tried activities in the order they were marked, with their
 * names and notes. A tried activity that no longer exists is left out.
 */
export function madeRows(
  tried: readonly string[],
  notes: MadeNotes,
  names: Readonly<Record<string, string>>,
): MadeRow[] {
  return tried
    .filter((slug) => names[slug] !== undefined)
    .map((slug) => ({ slug, name: names[slug] as string, note: notes[slug] ?? '' }));
}
