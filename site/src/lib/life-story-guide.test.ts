import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const content = (p: string) => new URL(`../content/${p}`, import.meta.url);
const GUIDE = readFileSync(content('guides/activities/life-story-book.md'), 'utf8');
const frontmatter = GUIDE.split('---')[1] ?? '';
const body = GUIDE.split(/^---$/m)[2] ?? '';

/** The one card title that may contain the word "memory" (SEO-038: allowed only inside an existing card title). */
const CARD_TITLE = 'Make a memory collage';
const CARD_SLUG_PATH = '/activity/make-a-memory-collage/';
const bodyWithoutCardTitle = body.replace(CARD_TITLE, '').replace(CARD_SLUG_PATH, '');

describe('SEO-038: life-story book guide', () => {
  it('turns on the crisis route, because the page invites talk about the person\'s life', () => {
    expect(frontmatter).toMatch(/^crisisRoute: true$/m);
  });

  it('keeps health claims off the page', () => {
    expect(frontmatter).toMatch(/^health: false$/m);
  });

  it('contains none of the banned clinical, loss or quiz words', () => {
    const banned = [/remember/i, /memory exercise/i, /therap/i, /treatment/i, /improv/i, /diagnos/i, /\bloss\b/i, /\bdied\b/i, /grief/i, /\bmemory\b/i];
    for (const pattern of banned) expect(bodyWithoutCardTitle, String(pattern)).not.toMatch(pattern);
  });

  it('uses the word "memory" only inside the existing card title', () => {
    expect(body).toContain(CARD_TITLE);
    expect(bodyWithoutCardTitle).not.toMatch(/memory/i);
    expect(body.match(/memory/gi)?.length ?? 0).toBe(2); // the card title and its link path, nothing else
  });

  it('states the pause line in plain words', () => {
    expect(body).toContain('come back another day, or never');
  });

  it('links to the reminiscence guides and hub instead of repeating their prompts', () => {
    expect(body).toContain('(/activities/reminiscence/)');
    expect(body).toContain('(/reminiscence-activities/)');
  });

  it('links only to activity cards that exist', () => {
    const slugs = [...body.matchAll(/\(\/activity\/([a-z-]+)\/\)/g)].map((m) => m[1]!);
    expect(slugs.length).toBeGreaterThan(0);
    for (const slug of slugs) expect(existsSync(content(`activity-cards/${slug}.md`)), slug).toBe(true);
  });

  it('keeps the page to its intended length', () => {
    const words = body.split(/\s+/).filter(Boolean).length;
    expect(words).toBeGreaterThanOrEqual(700);
    expect(words).toBeLessThanOrEqual(1000);
  });
});
