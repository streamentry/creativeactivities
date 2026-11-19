import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { splitFrontmatter } from '../lib/yaml-subset';
import { SECTION_META } from '../lib/site';
import { PILLARS, pillarCards, pillarFor, type PillarCardFacts } from './pillars';

const cardDir = new URL('../content/activity-cards/', import.meta.url);
const hubDir = new URL('../content/hubs/', import.meta.url);
const pageDir = new URL('../pages/', import.meta.url);

const readFm = (path: URL) => splitFrontmatter(readFileSync(path, 'utf8')).frontmatter;

/** Listed cards only: a withdrawn card leaves every pillar (TSA-045). */
const cards = new Map<string, PillarCardFacts & { withdrawn: boolean }>();
for (const file of readdirSync(cardDir).filter((f) => f.endsWith('.md'))) {
  const fm = readFm(new URL(file, cardDir));
  cards.set(file.replace(/\.md$/, ''), {
    type: String(fm.type),
    settings: fm.settings as string[],
    groups: fm.groups as string[],
    mess: String(fm.mess),
    energy: String(fm.energy),
    supervision: String(fm.supervision),
    prepMinutes: Number(fm.prepMinutes),
    withdrawn: fm.withdrawn !== undefined,
  });
}
const listed = new Map([...cards].filter(([, c]) => !c.withdrawn));

/** Every intent hub, including occasion hubs under occasions/. */
const hubs = new Map<string, { activities: string[]; related: string[]; guides: string[] }>();
for (const file of readdirSync(hubDir, { recursive: true }) as string[]) {
  const id = file.split('\\').join('/');
  if (!id.endsWith('.md')) continue;
  const fm = readFm(new URL(id, hubDir));
  hubs.set(id.replace(/\.md$/, ''), {
    activities: (fm.activities as string[]) ?? [],
    related: (fm.related as string[]) ?? [],
    guides: (fm.guides as string[]) ?? [],
  });
}

const BANNED = [
  'therap',
  'healing',
  'heal ',
  'treatment',
  'brain',
  'memory',
  'cognitive',
  'clinical',
  'patient',
  'diagnos',
  'score',
  'improve',
  'prevent',
  'cure',
];
const openingAndRule = (p: (typeof PILLARS)[number]) => `${p.opening} ${p.rule}`.toLowerCase();

describe('pillars (WEB-009)', () => {
  it('has four pillars on live section paths, and kids is not one of them', () => {
    expect(PILLARS.map((p) => p.section)).toEqual(['crafts', 'together', 'creative-calm', 'caregiving']);
    expect(new Set(PILLARS.map((p) => p.id)).size).toBe(4);
    expect(pillarFor('kids')).toBeUndefined();
    expect(pillarFor('brain-health')).toBeUndefined();
  });

  it('every pillar section exists in the site section list', () => {
    for (const p of PILLARS) expect(Object.keys(SECTION_META), p.id).toContain(p.section);
  });

  for (const p of PILLARS) {
    describe(p.id, () => {
      it('has its own opening of two or three sentences', () => {
        const sentences = p.opening.split(/(?<=[.!?])\s+/).filter(Boolean);
        expect(sentences.length).toBeGreaterThanOrEqual(2);
        expect(sentences.length).toBeLessThanOrEqual(3);
      });

      it('states a selection rule and a not-for line', () => {
        expect(p.rule).toMatch(/^Cards here are chosen because /);
        expect(p.notFor).toMatch(/^Not for: /);
      });

      it('shows at least six cards, every one a real listed card', () => {
        const shown = pillarCards(p, listed);
        expect(shown.length).toBeGreaterThanOrEqual(6);
        expect(new Set(shown).size).toBe(shown.length);
        for (const slug of shown) {
          expect(existsSync(new URL(`${slug}.md`, cardDir)), slug).toBe(true);
          expect(cards.get(slug)?.withdrawn, slug).toBe(false);
        }
      });

      it('no list repeats an intent hub: not identical, and at most half of the smaller list shared', () => {
        const shown = pillarCards(p, listed);
        for (const [hub, hubData] of hubs) {
          const theirs = hubData.activities;
          const shared = shown.filter((slug) => theirs.includes(slug)).length;
          const limit = Math.floor(Math.min(shown.length, theirs.length) / 2);
          expect(shared, `${p.id} and ${hub}`).toBeLessThanOrEqual(limit);
          expect(shown.length === theirs.length && shared === theirs.length, `${p.id} repeats ${hub}`).toBe(false);
        }
      });

      it('avoids clinical and treatment words in the opening and the rule', () => {
        const text = openingAndRule(p);
        for (const word of BANNED) expect(text.includes(word), `${p.id} says "${word}"`).toBe(false);
      });

      it('links only to intent hubs that exist, with a page for each', () => {
        expect(p.hubs.length).toBeGreaterThanOrEqual(1);
        for (const hub of p.hubs) {
          expect(hubs.has(hub), `${p.id} links to missing hub ${hub}`).toBe(true);
          expect(existsSync(new URL(`${hub}.astro`, pageDir)), `${hub} has no page`).toBe(true);
        }
      });

      it('has a tile with a name, one line and a label', () => {
        expect(p.tileTitle.length).toBeGreaterThan(0);
        expect(p.tileText.length).toBeGreaterThan(20);
        expect(p.tileText.length).toBeLessThanOrEqual(120);
        expect(p.tileLabel.length).toBeGreaterThan(0);
      });
    });
  }

  it('the older adults pillar lists no bedside-first card (it is the bedside hub\'s job)', () => {
    const older = PILLARS.find((p) => p.id === 'older-adults');
    expect(older).toBeDefined();
    for (const slug of pillarCards(older!, listed)) {
      expect(cards.get(slug)?.settings).not.toContain('bedside');
    }
  });
});

describe('English only', () => {
  it('the section view shows a pillar only in English', () => {
    const view = readFileSync(new URL('../views/SectionView.astro', pageDir), 'utf8');
    expect(view).toMatch(/pillarFor\(section\)/);
    expect(view).toMatch(/lang === 'en' \? pillarFor\(section\)/);
  });

  it('the home page and the finder show the tiles from this file', () => {
    expect(readFileSync(new URL('../views/HomeView.astro', pageDir), 'utf8')).toMatch(/PILLARS/);
    expect(readFileSync(new URL('../views/ActivityFinderView.astro', pageDir), 'utf8')).toMatch(/PILLARS/);
  });
});
