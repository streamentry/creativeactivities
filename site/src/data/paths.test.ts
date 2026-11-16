import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkClaims } from '../lib/claims';
import { PATH_TEXT, PRESSURE_WORDS, WEEKS_PER_PATH, weekMinutes } from '../lib/paths';
import { PATHS, PATH_BY_ID, PATH_INDEX_HOLD, pathActivities, type PathDef } from './paths';

const cardsDir = new URL('../content/activity-cards/', import.meta.url);
const cardFiles = new Map(
  readdirSync(cardsDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => [f.replace(/\.md$/, ''), readFileSync(new URL(f, cardsDir), 'utf8')] as const),
);

const field = (slug: string, key: string): string => {
  const front = (cardFiles.get(slug) ?? '').split('---')[1] ?? '';
  return new RegExp(`^${key}:\\s*(.*)$`, 'm').exec(front)?.[1]?.trim() ?? '';
};
const list = (slug: string, key: string): string[] =>
  field(slug, key).replace(/^\[|\]$/g, '').split(',').map((v) => v.trim()).filter(Boolean);
const hasVariation = (slug: string, kind: string): boolean => new RegExp(`^  - kind: ${kind}$`, 'm').test(cardFiles.get(slug) ?? '');

const textOf = (p: PathDef): string =>
  [p.title, p.seoTitle, p.description, p.eyebrow, p.who, p.purpose, p.rule, p.notFor, p.stopNote, ...p.weeks.flatMap((w) => [w.title, w.note])].join('\n');

describe('paths (WEB-032)', () => {
  it('has at least one path for care and one for together, each with its own id', () => {
    expect(new Set(PATHS.map((p) => p.id)).size).toBe(PATHS.length);
    expect(PATHS.some((p) => p.audience === 'care')).toBe(true);
    expect(PATHS.some((p) => p.audience === 'together')).toBe(true);
    for (const p of PATHS) {
      expect(p.id, p.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(PATH_BY_ID.get(p.id)).toBe(p);
    }
  });

  it('is four weeks long, each week with one to three activities that exist', () => {
    for (const p of PATHS) {
      expect(p.weeks, p.id).toHaveLength(WEEKS_PER_PATH);
      for (const [i, w] of p.weeks.entries()) {
        expect(w.activities.length, `${p.id} week ${i + 1}`).toBeGreaterThanOrEqual(1);
        expect(w.activities.length, `${p.id} week ${i + 1}`).toBeLessThanOrEqual(3);
        for (const slug of w.activities) expect(cardFiles.has(slug), `${p.id}: ${slug}`).toBe(true);
      }
    }
  });

  it('has a time for every week that the cards give, from at least five minutes to under an hour', () => {
    for (const p of PATHS) {
      for (const [i, w] of p.weeks.entries()) {
        const ranges = w.activities.map((slug) => list(slug, 'activityMinutes').map(Number) as [number, number]);
        const [low, high] = weekMinutes(ranges);
        expect(low, `${p.id} week ${i + 1}`).toBeGreaterThanOrEqual(5);
        expect(high, `${p.id} week ${i + 1}`).toBeLessThanOrEqual(60);
        expect(low, `${p.id} week ${i + 1}`).toBeLessThanOrEqual(high);
      }
    }
  });

  it('never lists an activity twice, in a path or across paths', () => {
    const seen = new Map<string, string>();
    for (const p of PATHS) {
      const all = p.weeks.flatMap((w) => w.activities);
      expect(new Set(all).size, p.id).toBe(all.length);
      expect(pathActivities(p)).toEqual(all);
      for (const slug of all) {
        expect(seen.get(slug), `${slug} is on both ${seen.get(slug)} and ${p.id}`).toBeUndefined();
        seen.set(slug, p.id);
      }
    }
  });

  it('states its purpose, who it is for and who it is not for', () => {
    for (const p of PATHS) {
      for (const f of ['who', 'purpose', 'rule', 'notFor', 'stopNote'] as const) expect(p[f].trim().length, `${p.id} ${f}`).toBeGreaterThan(30);
      expect(p.notFor, p.id).toMatch(/^This path is not for\b/);
      expect(p.purpose, p.id).toMatch(/^To give\b/);
    }
    const notFors = PATHS.map((p) => p.notFor);
    expect(new Set(notFors).size).toBe(notFors.length);
  });

  it('keeps the care path to activities that can be done sitting down, with little energy, at little cost', () => {
    for (const p of PATHS.filter((x) => x.audience === 'care')) {
      for (const slug of pathActivities(p)) {
        const settings = list(slug, 'settings');
        expect(settings, `${p.id}: ${slug}`).toContain('seated');
        expect(field(slug, 'energy'), `${p.id}: ${slug}`).toBe('low');
        expect(['free', 'low'], `${p.id}: ${slug}`).toContain(field(slug, 'cost'));
      }
    }
  });

  it('keeps the together path to activities for an older person and a child, of 45 minutes or less, at little cost', () => {
    for (const p of PATHS.filter((x) => x.audience === 'together')) {
      for (const slug of pathActivities(p)) {
        expect(list(slug, 'groups'), `${p.id}: ${slug}`).toContain('intergenerational');
        expect(hasVariation(slug, 'with-children'), `${p.id}: ${slug} has no children's version`).toBe(true);
        const [low, high] = list(slug, 'activityMinutes').map(Number) as [number, number];
        expect(low, `${p.id}: ${slug}`).toBeLessThanOrEqual(30);
        // "45 minutes or less" is what the path's words say.
        expect(high, `${p.id}: ${slug}`).toBeLessThanOrEqual(45);
        expect(['free', 'low'], `${p.id}: ${slug}`).toContain(field(slug, 'cost'));
      }
    }
  });

  it('says nothing about the cards as a whole that the card files do not each back', () => {
    // Claims found in an earlier draft and not written on every card: stopping "after the first step", things
    // "already in the house", "most homes", "half an hour", and activities with "no right answer".
    const unsupported = /after the first step|already in the house|most homes|about half an hour|right answer/i;
    for (const p of PATHS) expect(textOf(p), p.id).not.toMatch(unsupported);
  });

  it('is dated no earlier than the newest card it lists, so a printed version is never older than its cards', () => {
    for (const p of PATHS) {
      const newest = pathActivities(p)
        .map((slug) => field(slug, 'updated'))
        .sort()
        .at(-1) as string;
      expect(newest, p.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(p.updated >= newest, `${p.id} is dated ${p.updated}, a card it lists changed on ${newest}`).toBe(true);
    }
  });

  it('uses no word that makes a path a streak, a schedule or a debt', () => {
    for (const p of PATHS) expect(textOf(p), p.id).not.toMatch(PRESSURE_WORDS);
    // Each sentence, with a week and a title where it takes them.
    const sentences = Object.values(PATH_TEXT).map((v) => (typeof v === 'function' ? (v as (...args: unknown[]) => string)(2, 'Sing and tap') : v));
    for (const s of sentences) expect(s).not.toMatch(PRESSURE_WORDS);
  });

  it('names no year, festival or tradition', () => {
    for (const p of PATHS) {
      expect(textOf(p), p.id).not.toMatch(/\b20\d\d\b/);
      expect(textOf(p), p.id).not.toMatch(/\b(?:christmas|easter|halloween|thanksgiving|hanukkah|diwali|ramadan|eid|passover|birthday)\b/i);
    }
  });

  it('keeps titles and descriptions within the limits for a page', () => {
    for (const p of PATHS) {
      expect(p.title.length, `${p.id} title`).toBeLessThanOrEqual(80);
      expect(p.seoTitle.length, `${p.id} seoTitle`).toBeLessThanOrEqual(60);
      expect(p.description.length, `${p.id} description`).toBeGreaterThanOrEqual(110);
      expect(p.description.length, `${p.id} description`).toBeLessThanOrEqual(165);
      for (const w of p.weeks) expect(w.title.length, `${p.id} ${w.title}`).toBeLessThanOrEqual(40);
    }
  });

  it('passes the claims lint', () => {
    const violations = PATHS.flatMap((p) => checkClaims(textOf(p), `paths/${p.id}`));
    const report = violations.map((v) => `${v.file}:${v.line} "${v.match}" (${v.rule})`).join('\n');
    expect(violations, report).toEqual([]);
  });

  it('dates each path, as the version a printed copy shows', () => {
    for (const p of PATHS) {
      expect(p.updated, p.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(p.updated)), p.id).toBe(false);
    }
  });

  it('says why the pages are held from search', () => {
    expect(PATH_INDEX_HOLD.length).toBeGreaterThan(40);
  });
});
