import { describe, expect, it } from 'vitest';
import {
  MADE_NOTES_KEY,
  MAX_NOTE,
  MAX_NOTES,
  cleanNote,
  countNotes,
  loadNotes,
  madeRows,
  parseNotes,
  saveNotes,
  setNote,
} from './made-list';

function fakeStorage(initial: Record<string, string> = {}, options: { refuse?: boolean; refuseWrite?: boolean } = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem(key: string) {
      if (options.refuse) throw new DOMException('blocked', 'SecurityError');
      return data.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      if (options.refuse || options.refuseWrite) throw new DOMException('full', 'QuotaExceededError');
      data.set(key, value);
    },
  };
}

describe('the made list key', () => {
  it('is versioned and named for the notes it holds', () => {
    expect(MADE_NOTES_KEY).toBe('ca-made-notes-v1');
    expect(MAX_NOTE).toBe(280);
    expect(MAX_NOTES).toBe(200);
  });
});

describe('parseNotes', () => {
  it('reads a map of activity short names to notes', () => {
    expect(parseNotes('{"sing-along":"Sang in the garden","make-a-card":"Used the blue card"}')).toEqual({
      'sing-along': 'Sang in the garden',
      'make-a-card': 'Used the blue card',
    });
  });

  it('reads nothing for empty, corrupt, or wrongly shaped values', () => {
    expect(parseNotes(null)).toEqual({});
    expect(parseNotes('')).toEqual({});
    expect(parseNotes('not json')).toEqual({});
    expect(parseNotes('["sing-along"]')).toEqual({});
    expect(parseNotes('"text"')).toEqual({});
    expect(parseNotes('null')).toEqual({});
  });

  it('keeps only well-formed short names and string values, trimmed and non-empty', () => {
    const raw = JSON.stringify({
      'Not A Slug': 'bad key',
      'good-one': '  padded  ',
      'blank-one': '   ',
      'number-one': 42,
      'list-one': ['x'],
      '../etc': 'path',
    });
    expect(parseNotes(raw)).toEqual({ 'good-one': 'padded' });
  });

  it('truncates a note to the maximum length', () => {
    const long = 'a'.repeat(MAX_NOTE + 50);
    expect(parseNotes(JSON.stringify({ 'long-one': long }))['long-one']).toHaveLength(MAX_NOTE);
  });

  it('keeps at most MAX_NOTES entries', () => {
    const many: Record<string, string> = {};
    for (let i = 0; i < MAX_NOTES + 20; i += 1) many[`activity-${i}`] = 'note';
    expect(Object.keys(parseNotes(JSON.stringify(many)))).toHaveLength(MAX_NOTES);
  });
});

describe('loadNotes', () => {
  it('reads what is stored under the key', () => {
    const storage = fakeStorage({ [MADE_NOTES_KEY]: '{"sing-along":"Good"}' });
    expect(loadNotes(storage)).toEqual({ 'sing-along': 'Good' });
  });

  it('reads nothing when storage is missing, empty, corrupt, or refuses to be read', () => {
    expect(loadNotes(undefined)).toEqual({});
    expect(loadNotes(fakeStorage())).toEqual({});
    expect(loadNotes(fakeStorage({ [MADE_NOTES_KEY]: '{broken' }))).toEqual({});
    expect(loadNotes(fakeStorage({}, { refuse: true }))).toEqual({});
  });
});

describe('saveNotes', () => {
  it('writes the map as JSON under the versioned key and reports success', () => {
    const storage = fakeStorage();
    expect(saveNotes(storage, { 'sing-along': 'Good' })).toBe(true);
    expect(storage.data.get(MADE_NOTES_KEY)).toBe('{"sing-along":"Good"}');
  });

  it('reports failure, without throwing, when storage is missing or refuses the write', () => {
    expect(saveNotes(undefined, { 'sing-along': 'Good' })).toBe(false);
    expect(saveNotes(fakeStorage({}, { refuseWrite: true }), { 'sing-along': 'Good' })).toBe(false);
  });
});

describe('setNote', () => {
  it('adds a trimmed note without changing the map it was given', () => {
    const before = { 'make-a-card': 'Earlier' };
    const after = setNote(before, 'sing-along', '  Sang together  ');
    expect(after).toEqual({ 'make-a-card': 'Earlier', 'sing-along': 'Sang together' });
    expect(before).toEqual({ 'make-a-card': 'Earlier' });
  });

  it('removes the note when the text is cleared', () => {
    expect(setNote({ 'sing-along': 'Good' }, 'sing-along', '   ')).toEqual({});
  });

  it('truncates long text to the maximum length', () => {
    expect(setNote({}, 'sing-along', 'b'.repeat(MAX_NOTE + 1))['sing-along']).toHaveLength(MAX_NOTE);
  });

  it('ignores a name that is not a short name', () => {
    const before = { 'make-a-card': 'Earlier' };
    expect(setNote(before, '<b>bad</b>', 'x')).toEqual(before);
  });

  it('does not add a new note once the list is full, but still edits existing ones', () => {
    const full: Record<string, string> = {};
    for (let i = 0; i < MAX_NOTES; i += 1) full[`activity-${i}`] = 'note';
    expect(setNote(full, 'one-more', 'x')).toEqual(full);
    expect(setNote(full, 'activity-0', 'changed')['activity-0']).toBe('changed');
  });
});

describe('cleanNote', () => {
  it('keeps plain text as typed, but drops control characters', () => {
    expect(cleanNote('Good\u0007 day <i>')).toBe('Good day <i>');
  });
});

describe('madeRows', () => {
  it('lists tried activities in the order they were marked, with their names and notes', () => {
    const rows = madeRows(['sing-along', 'make-a-card'], { 'make-a-card': 'Blue card' }, {
      'sing-along': 'Sing-along',
      'make-a-card': 'Make a card',
    });
    expect(rows).toEqual([
      { slug: 'sing-along', name: 'Sing-along', note: '' },
      { slug: 'make-a-card', name: 'Make a card', note: 'Blue card' },
    ]);
  });

  it('leaves out tried activities that no longer exist', () => {
    expect(madeRows(['retired-one'], {}, { 'sing-along': 'Sing-along' })).toEqual([]);
  });
});

describe('countNotes', () => {
  it('counts the notes that hold text', () => {
    expect(countNotes(JSON.stringify({ 'sing-along': 'Good', 'make-a-card': '' }))).toBe(1);
    expect(countNotes('not json')).toBe(0);
  });
});
