import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkClaims } from '../lib/claims';
import { SEASON_IDS } from '../lib/seasons';
import { ANYTIME_ACTIVITIES, SEASON_INDEX_HOLD, SEASON_PAGES, SEASON_PAGE_BY_ID, type SeasonPage } from './seasons';

const cards = new Set(
  readdirSync(new URL('../content/activity-cards/', import.meta.url))
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, '')),
);

const textOf = (p: SeasonPage): string =>
  [p.title, p.seoTitle, p.description, p.eyebrow, p.opening, p.rule, p.notFor, p.stopNote, p.months, p.swap].join('\n');

/** Words that would tie a season to a festival or a single tradition. */
const HOLIDAY = /\b(christmas|xmas|easter|halloween|thanksgiving|hanukkah|diwali|ramadan|eid|lunar new year|passover|valentine|santa|advent|yule|new year)\b/i;

describe('season pages (WEB-033)', () => {
  it('has one page for each of the four seasons, in order', () => {
    expect(SEASON_PAGES.map((p) => p.id)).toEqual([...SEASON_IDS]);
    for (const id of SEASON_IDS) expect(SEASON_PAGE_BY_ID[id].id).toBe(id);
  });

  it('lists only cards that exist, once each', () => {
    for (const p of SEASON_PAGES) {
      expect(new Set(p.activities).size, p.id).toBe(p.activities.length);
      for (const slug of p.activities) expect(cards.has(slug), `${p.id}: ${slug}`).toBe(true);
    }
    expect(new Set(ANYTIME_ACTIVITIES).size).toBe(ANYTIME_ACTIVITIES.length);
    for (const slug of ANYTIME_ACTIVITIES) expect(cards.has(slug), `any time: ${slug}`).toBe(true);
  });

  it('gives each season cards of its own that no other season page uses (02 H1)', () => {
    const seen = new Map<string, string>();
    for (const p of SEASON_PAGES) {
      expect(p.activities.length, p.id).toBeGreaterThanOrEqual(3);
      for (const slug of p.activities) {
        expect(seen.get(slug), `${slug} is on both ${seen.get(slug)} and ${p.id}`).toBeUndefined();
        seen.set(slug, p.id);
      }
    }
  });

  it('keeps the any-time list apart from the season-only cards', () => {
    const own = new Set(SEASON_PAGES.flatMap((p) => p.activities));
    for (const slug of ANYTIME_ACTIVITIES) expect(own.has(slug), slug).toBe(false);
  });

  it('shows each page at least six cards, as a hub does', () => {
    for (const p of SEASON_PAGES) expect(p.activities.length + ANYTIME_ACTIVITIES.length, p.id).toBeGreaterThanOrEqual(6);
  });

  it('gives every page its own opening, rule, not-for line and stop note (02 H4)', () => {
    for (const field of ['opening', 'rule', 'notFor', 'stopNote', 'swap', 'months'] as const) {
      const values = SEASON_PAGES.map((p) => p[field]);
      expect(new Set(values).size, field).toBe(values.length);
      for (const v of values) expect(v.trim().length, field).toBeGreaterThan(20);
    }
    for (const p of SEASON_PAGES) expect(p.notFor, p.id).toMatch(/not for/i);
  });

  it('names the season and no festival or tradition (season is not holiday)', () => {
    for (const p of SEASON_PAGES) {
      expect(textOf(p), p.id).not.toMatch(HOLIDAY);
      expect(p.title.toLowerCase(), p.id).toContain(p.id);
    }
  });

  it('describes both halves of the world and leaves out no year', () => {
    for (const p of SEASON_PAGES) {
      expect(p.months, p.id).toMatch(/northern/);
      expect(p.months, p.id).toMatch(/southern/);
      expect(textOf(p), p.id).not.toMatch(/\b20\d\d\b/);
    }
  });

  it('keeps titles and descriptions within the hub limits', () => {
    for (const p of SEASON_PAGES) {
      expect(p.title.length, `${p.id} title`).toBeLessThanOrEqual(80);
      expect(p.seoTitle.length, `${p.id} seoTitle`).toBeLessThanOrEqual(60);
      expect(p.description.length, `${p.id} description`).toBeGreaterThanOrEqual(110);
      expect(p.description.length, `${p.id} description`).toBeLessThanOrEqual(165);
    }
  });

  it('passes the claims lint', () => {
    const violations = SEASON_PAGES.flatMap((p) => checkClaims(textOf(p), `seasons/${p.id}`));
    const report = violations.map((v) => `${v.file}:${v.line} "${v.match}" (${v.rule})`).join('\n');
    expect(violations, report).toEqual([]);
  });

  it('says why the pages are held from search', () => {
    expect(SEASON_INDEX_HOLD.length).toBeGreaterThan(40);
  });
});
