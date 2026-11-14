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
        expect(path === '/activity/' || existsSync(target), `${hub} links to missing page ${path}`).toBe(true);
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
