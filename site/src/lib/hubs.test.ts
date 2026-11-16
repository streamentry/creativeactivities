import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const hubDir = new URL('../content/hubs/', import.meta.url);
const cardDir = new URL('../content/activity-cards/', import.meta.url);
const pageDir = new URL('../pages/', import.meta.url);
const hubs = readdirSync(hubDir)
  .filter((f) => f.endsWith('.md'))
  .map((f) => f.replace(/\.md$/, ''));
const cards = new Set(
  readdirSync(cardDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, '')),
);
const list = (text: string, key: string) =>
  (text.match(new RegExp(`^${key}: \\[(.*)\\]$`, 'm'))?.[1] ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

describe('search hubs', () => {
  it('has the Stage 1 hubs', () => {
    expect(hubs.length).toBeGreaterThanOrEqual(3);
  });

  for (const hub of hubs) {
    const text = readFileSync(new URL(`${hub}.md`, hubDir), 'utf8');

    it(`${hub}: has a page at /${hub}/`, () => {
      const page = readFileSync(new URL(`${hub}.astro`, pageDir), 'utf8');
      expect(page).toContain(`<HubView id="${hub}" />`);
    });

    it(`${hub}: lists existing activities once each`, () => {
      const activities = list(text, 'activities');
      expect(activities.length).toBeGreaterThanOrEqual(6);
      expect(new Set(activities).size).toBe(activities.length);
      for (const slug of activities) expect(cards.has(slug), `${hub} lists missing activity ${slug}`).toBe(true);
    });

    it(`${hub}: links only to hubs and guides that exist`, () => {
      for (const id of list(text, 'related')) {
        expect(hubs.includes(id), `${hub}: no hub ${id}`).toBe(true);
        expect(id).not.toBe(hub);
      }
      for (const ref of list(text, 'guides')) {
        expect(existsSync(new URL(`../content/guides/${ref}.md`, import.meta.url)), `${hub}: no guide ${ref}`).toBe(true);
      }
      for (const [, path] of text.matchAll(/\]\((\/[^)#]*)/g)) {
        const [kind, slug] = path.split('/').filter(Boolean);
        const target =
          kind === 'activity' && slug
            ? new URL(`${slug}.md`, cardDir)
            : slug
              ? new URL(`../content/guides/${kind}/${slug}.md`, import.meta.url)
              : new URL(`${kind}.md`, hubDir);
        // The seasons pages are routes, not content files (src/pages/seasons).
        const seasonRoute = kind === 'seasons' && existsSync(new URL('seasons/index.astro', pageDir));
        expect(path === '/activity/' || seasonRoute || existsSync(target), `${hub} links to missing page ${path}`).toBe(true);
      }
    });

    it(`${hub}: avoids clinical and test-like claims`, () => {
      const body = text.toLowerCase();
      for (const banned of ['therapeutic', 'cognitive', 'brain', 'improve memory', 'improves memory', 'do you remember', 'patient']) {
        expect(body.includes(banned), `${hub} says "${banned}"`).toBe(false);
      }
    });
  }
});

// Index rules for hubs (02-information-architecture H1, H3; 12 SEO-009, SEO-010).
const hubText = (id: string) => readFileSync(new URL(`${id}.md`, hubDir), 'utf8');
const cardText = (slug: string) => readFileSync(new URL(`${slug}.md`, cardDir), 'utf8');
const cardSettings = (slug: string) => list(cardText(slug), 'settings');
const cardGroups = (slug: string) => list(cardText(slug), 'groups');
const cardEnergy = (slug: string) => cardText(slug).match(/^energy: (\w+)$/m)?.[1];
const cardVariations = (slug: string) => [...cardText(slug).matchAll(/kind: ([a-z-]+)/g)].map((m) => m[1]);
const isIndexable = (text: string) => text.match(/^indexable: (true|false)$/m)?.[1] !== 'false';
const NEW_HUBS = ['seated-activities', 'dementia-activities'];

describe('hub index rules', () => {
  for (const hub of hubs) {
    const text = hubText(hub);

    it(`${hub}: is indexable only with eight cards and three kinds of setting or group, else it says why not`, () => {
      if (!isIndexable(text)) {
        expect(text, `${hub} is noindex but gives no indexHold reason`).toMatch(/^indexHold: .{40,}$/m);
        return;
      }
      const activities = list(text, 'activities');
      expect(activities.length, `${hub} needs eight cards to be indexable (H3)`).toBeGreaterThanOrEqual(8);
      const kinds = new Set(activities.flatMap((slug) => [...cardSettings(slug), ...cardGroups(slug)]));
      expect(kinds.size, `${hub} needs three settings or group sizes (H3)`).toBeGreaterThanOrEqual(3);
    });
  }

  for (const hub of NEW_HUBS) {
    it(`${hub}: shares no more than half of a smaller hub's cards with any other hub (H1)`, () => {
      const mine = list(hubText(hub), 'activities');
      for (const other of hubs.filter((h) => h !== hub)) {
        const theirs = list(hubText(other), 'activities');
        const shared = mine.filter((slug) => theirs.includes(slug)).length;
        expect(shared, `${hub} and ${other}`).toBeLessThanOrEqual(Math.floor(Math.min(mine.length, theirs.length) / 2));
      }
    });
  }
});

describe('hub overlap (H1) and the seniors hub (H1, H3)', () => {
  // H1: if two hubs share more than half their cards, merge them. The limit is half of the smaller hub.
  for (const hub of hubs) {
    for (const other of hubs.filter((h) => h > hub)) {
      it(`${hub} and ${other} share no more than half of the smaller hub (H1)`, () => {
        const mine = list(hubText(hub), 'activities');
        const theirs = list(hubText(other), 'activities');
        const shared = mine.filter((slug) => theirs.includes(slug));
        const limit = Math.floor(Math.min(mine.length, theirs.length) / 2);
        expect(shared.length, `shared: ${shared.join(', ')}`).toBeLessThanOrEqual(limit);
      });
    }
  }

  it('activities-for-seniors lists no bedside-first card and still meets H3', () => {
    const text = hubText('activities-for-seniors');
    const activities = list(text, 'activities');
    expect(activities.length, 'H3 needs eight cards').toBeGreaterThanOrEqual(8);
    for (const slug of activities) {
      expect(cardSettings(slug), `${slug} is bedside-first`).not.toContain('bedside');
      const outdoorOrStanding = cardSettings(slug).some((s) => s === 'outdoors' || s === 'standing');
      const withOthers = cardGroups(slug).some((g) => g !== 'one-to-one');
      expect(outdoorOrStanding || withOthers, `${slug} is neither outdoors, standing nor with others`).toBe(true);
    }
  });
});

describe('seated activities hub (SEO-010)', () => {
  const text = hubText('seated-activities');
  const activities = list(text, 'activities');

  it('uses the seated variation and lists only cards that have it', () => {
    expect(text).toMatch(/^variation: seated$/m);
    for (const slug of activities) {
      expect(cardVariations(slug), `${slug} has no seated variation`).toContain('seated');
      expect(cardSettings(slug), `${slug} is not set up for seated use`).toContain('seated');
    }
  });

  it('has at least five cards where the seated set-up changes the materials or steps', () => {
    expect(activities.length).toBeGreaterThanOrEqual(5);
  });

  it('lists only light-energy cards, as its rule says', () => {
    for (const slug of activities) expect(['low', 'medium']).toContain(cardEnergy(slug));
  });

  it('cross-links the bedside hub in both directions', () => {
    expect(text).toContain('/bedside-activities/');
    expect(hubText('bedside-activities')).toContain('/seated-activities/');
    expect(list(hubText('bedside-activities'), 'related')).toContain('seated-activities');
  });
});

describe('dementia activities hub (SEO-009)', () => {
  const text = hubText('dementia-activities');
  const activities = list(text, 'activities');

  it('stays noindex until a named reviewer signs off and H3 is checked, and says so', () => {
    expect(text).toMatch(/^indexable: false$/m);
    expect(text).toMatch(/^indexHold: .*reviewer/m);
  });

  it('lists five to twelve activities', () => {
    expect(activities.length).toBeGreaterThanOrEqual(5);
    expect(activities.length).toBeLessThanOrEqual(12);
  });

  it('does not sort people by stage', () => {
    expect(text).not.toMatch(/\b(early|middle|late)[- ]stage\b/i);
  });

  it('states that the activities are not treatment', () => {
    expect(text).toMatch(/not (a )?treatment/i);
  });

  it('makes no cognitive, memory or slowing claims', () => {
    expect(text).not.toMatch(/\b(slow|slows|slowing|prevent|prevents|reverse|improve|improves|sharpen|boost)\b/i);
    expect(text).not.toMatch(/memory (care|loss|function)|cognitive|therap/i);
  });
});
