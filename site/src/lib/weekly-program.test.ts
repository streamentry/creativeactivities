import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PROGRAM_DAYS, defaultWeek, groupCards, type ProgramCard } from './weekly-program';

/** WEB-045: a printable weekly program for activity staff. Not a care plan. */
const card = (id: string, type: string, kinds: string[], withdrawn = false): ProgramCard => ({
  id,
  data: {
    name: id,
    type,
    summary: `${id} summary`,
    variations: kinds.map((kind) => ({ kind, text: `${kind} for ${id}` })),
    ...(withdrawn ? { withdrawn: { date: new Date(), reason: 'x' } } : {}),
  },
});

describe('weekly program (WEB-045)', () => {
  it('offers only listed cards that have a group version', () => {
    const cards = [card('a', 'art', ['for-a-group']), card('b', 'art', ['easier']), card('c', 'music', ['for-a-group'], true)];
    expect(groupCards(cards).map((c) => c.id)).toEqual(['a']);
  });

  it('fills five weekdays, preferring a different type each day', () => {
    const cards = [
      card('art1', 'art', ['for-a-group']),
      card('art2', 'art', ['for-a-group']),
      card('music1', 'music', ['for-a-group']),
      card('nature1', 'nature', ['for-a-group']),
      card('craft1', 'craft', ['for-a-group']),
      card('conv1', 'conversation', ['for-a-group']),
    ];
    const week = defaultWeek(cards);
    expect(week).toHaveLength(PROGRAM_DAYS.length);
    expect(new Set(week.map((c) => c.data.type)).size).toBe(5);
  });

  it('repeats no card when there are at least five', () => {
    const cards = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => card(id, 'art', ['for-a-group']));
    const week = defaultWeek(cards);
    expect(new Set(week.map((c) => c.id)).size).toBe(5);
  });

  it('gives every chosen card a group version and a one-to-one line', () => {
    const week = defaultWeek([card('a', 'art', ['easier', 'for-a-group'])]);
    expect(week[0].group).toBe('for-a-group for a');
    expect(week[0].oneToOne).toBe('a summary');
  });

  it('the page asks for no names, diagnoses or care needs (field check)', () => {
    const page = readFileSync(new URL('../views/WeeklyProgramView.astro', import.meta.url), 'utf8');
    const names = [...page.matchAll(/<(?:input|select|textarea)[^>]*\bname="([^"]+)"/g)].map((m) => m[1]);
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) expect(['week', 'room', 'group-size', ...PROGRAM_DAYS.map((d) => d.toLowerCase())]).toContain(name);
    expect(page.toLowerCase()).not.toMatch(/diagnos|resident name|care need|medication|condition/);
  });
});

describe('weekly program materials line (WEB-045)', async () => {
  const { programMaterialsLine } = await import('./weekly-program-text');
  it('scales one set per pair plus a spare', () => {
    expect(programMaterialsLine('8')).toContain('about 5 sets');
    expect(programMaterialsLine('9')).toContain('about 6 sets');
  });
  it('prints nothing for an empty or out-of-range size', () => {
    for (const v of ['', '1', '41', 'abc']) expect(programMaterialsLine(v)).toBe('');
  });
});
