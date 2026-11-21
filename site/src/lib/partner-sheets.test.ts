import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LIBRARY_CARD_SLUGS, LIBRARY_MINUTES, PARTNER_SHEET_PATHS, pickCards, type SheetCard } from './partner-sheets';
import { NOINDEX_PAGES } from './noindex-pages';

/** SEO-025: one-page partner sheets for libraries, activity directors and facilitators. */
const cardsDir = new URL('../content/activity-cards/', import.meta.url);
const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const frontmatter = (text: string) => text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
const cardText = (slug: string) => readFileSync(new URL(`${slug}.md`, cardsDir), 'utf8');

const pages = {
  library: read('../pages/for-organizations/library-programming.astro'),
  director: read('../pages/for-organizations/activity-director.astro'),
  facilitator: read('../pages/for-organizations/facilitator-note.astro'),
};
const organizations = read('../views/OrganizationsView.astro');
const printables = read('../data/printables.ts');
const a11y = read('../../scripts/a11y-check.mjs');
const checkPrint = read('../../scripts/check-print.mjs');

const card = (slug: string): SheetCard => {
  const fm = frontmatter(cardText(slug));
  const minutes = fm.match(/^activityMinutes:\s*\[(\d+),\s*(\d+)\]/m);
  const prep = fm.match(/^prepMinutes:\s*(\d+)/m);
  const name = fm.match(/^name:\s*(.+)$/m)?.[1] ?? '';
  const summary = fm.match(/^summary:\s*(.+)$/m)?.[1] ?? '';
  const materials = (fm.match(/^materials:\n((?:\s+-\s.*\n?)*)/m)?.[1] ?? '')
    .split('\n')
    .filter((l) => l.trim().startsWith('-'))
    .map((l) => l.replace(/^\s*-\s*/, '').replace(/^"(.*)"$/, '$1'));
  const variations = [...cardText(slug).matchAll(/kind: ([a-z-]+)\n\s+text: "?([^"\n]+)"?/g)].map((m) => ({ kind: m[1], text: m[2] }));
  return {
    id: slug,
    data: {
      name,
      summary,
      ...(/^withdrawn:/m.test(fm) ? { withdrawn: true } : {}),
      activityMinutes: [Number(minutes?.[1]), Number(minutes?.[2])],
      prepMinutes: Number(prep?.[1] ?? 0),
      materials,
      variations,
    },
  };
};

describe('partner sheets cards (SEO-025)', () => {
  it('uses only live cards that exist and hold the library session length', () => {
    const files = new Set(readdirSync(cardsDir).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)));
    for (const slug of LIBRARY_CARD_SLUGS) {
      expect(files.has(slug), `${slug} exists`).toBe(true);
      expect(frontmatter(cardText(slug))).not.toMatch(/^withdrawn:/m);
    }
    expect(() => pickCards(LIBRARY_CARD_SLUGS.map(card), LIBRARY_CARD_SLUGS, LIBRARY_MINUTES)).not.toThrow();
  });

  it('marks every library card for small groups and a table, as the sheet says', () => {
    for (const slug of LIBRARY_CARD_SLUGS) {
      const fm = frontmatter(cardText(slug));
      expect(fm, `${slug} small-group`).toMatch(/^groups:.*small-group/m);
      expect(fm, `${slug} tabletop or seated`).toMatch(/^settings:.*(tabletop|seated)/m);
    }
  });

  it('fails the build for a missing or withdrawn card', () => {
    const cards = [card('fold-a-paper-boat')];
    expect(() => pickCards(cards, ['no-such-card'])).toThrow(/missing or withdrawn/);
    expect(() => pickCards([{ ...cards[0], data: { ...cards[0].data, withdrawn: true } }], ['fold-a-paper-boat'])).toThrow(/withdrawn/);
  });

  it('fails the build for a card whose activity time does not hold the session length', () => {
    const c = card('fold-a-paper-boat');
    expect(() => pickCards([c], ['fold-a-paper-boat'], 90)).toThrow(/does not fit/);
  });
});

describe('partner sheet pages (SEO-025)', () => {
  it('are held from search and listed in NOINDEX_PAGES', () => {
    for (const path of PARTNER_SHEET_PATHS) expect(NOINDEX_PAGES.has(path), path).toBe(true);
    for (const text of Object.values(pages)) expect(text).toMatch(/^\s*noindex\s*$/m);
  });

  it('are linked from for-organizations (English only) and the printables index', () => {
    for (const path of PARTNER_SHEET_PATHS) {
      expect(organizations).toContain(`href="${path}"`);
      expect(printables).toContain(`href: '${path}'`);
    }
    expect(organizations).toMatch(/\{lang === 'en' && \(/);
  });

  it('are checked in the accessibility and print scripts', () => {
    for (const path of PARTNER_SHEET_PATHS) expect(a11y).toContain(`path: '${path}'`);
    expect(checkPrint).toMatch(/partnerSheets\(/);
    expect(checkPrint).toMatch(/const PARTNER_SHEET_PAGES = 1;/);
  });

  it('have no forms, scripts, email fields, logos, testimonials or hard-coded colors', () => {
    for (const text of Object.values(pages)) {
      expect(text).not.toMatch(/<form[\s>]/i);
      expect(text).not.toMatch(/<script[\s>]/i);
      expect(text).not.toMatch(/type="email"/i);
      expect(text).not.toMatch(/<img[\s>]/i);
      expect(text).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
      expect(text).not.toMatch(/testimonial|endorse|recommend(s|ed)? (the|this) site/i);
    }
  });

  it('keep to the voice rules, with "not therapy" as the only allowed term', () => {
    const allowed = /\bnot therapy\b|\bnot a clinical program\b|\bnot a care plan\b|\bclinical endorsement\b/gi;
    const banned = ['patient', 'brain', 'score', 'therapy', 'therapeutic', 'clinical', 'outcome', 'child', 'kids', 'timezone', 'start-up', 'licence', 'walk-through', 'programme', 'centre'];
    for (const text of Object.values(pages)) {
      const body = text.replace(allowed, '');
      const found = banned.filter((word) => new RegExp(`\\b${word}`, 'i').test(body));
      expect(found).toEqual([]);
    }
  });
});
