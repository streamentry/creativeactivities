import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { GAMES } from './games';
import { PACKS } from './packs';
import { PATHS } from './paths';
import { packVersion, paperGameCount, printableGroups } from './printables';

const PAGES = fileURLToPath(new URL('../pages', import.meta.url));
const updated = new Map([
  ['a', '2026-11-08'],
  ['b', '2026-11-17'],
]);
const groups = printableGroups({ cardCount: 53, cardUpdated: updated });
const items = groups.flatMap((g) => g.items);

/** True when the address is a dynamic route whose id the data lists, or a static page file. */
function routeExists(href: string): boolean {
  const packMatch = href.match(/^\/activity\/packs\/([^/]+)\/$/);
  if (packMatch) return PACKS.some((p) => p.id === packMatch[1]);
  const pathMatch = href.match(/^\/paths\/([^/]+)\/$/);
  if (pathMatch) return PATHS.some((p) => p.id === pathMatch[1]);
  const gameMatch = href.match(/^\/games\/([^/]+)\/$/);
  if (gameMatch) return GAMES.some((g) => g.slug === gameMatch[1]);
  const base = href.replace(/\/$/, '');
  return existsSync(`${PAGES}${base}/index.astro`) || existsSync(`${PAGES}${base}.astro`);
}

describe('printables index links', () => {
  it('every link points to a route that exists', () => {
    const missing = items.filter((item) => !routeExists(item.href)).map((item) => item.href);
    expect(missing).toEqual([]);
  });

  it('every link is a site address with a trailing slash', () => {
    for (const item of items) expect(item.href).toMatch(/^\/[a-z0-9/-]*\/$/);
  });

  it('every version date is YYYY-MM-DD', () => {
    for (const item of items) {
      if (item.version !== undefined) expect(item.version).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('lists every pack and path once', () => {
    const hrefs = items.map((i) => i.href);
    for (const p of PACKS) expect(hrefs).toContain(`/activity/packs/${p.id}/`);
    for (const p of PATHS) expect(hrefs).toContain(`/paths/${p.id}/`);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});

describe('packVersion', () => {
  it('uses the newest card change in the pack', () => {
    expect(packVersion(['a', 'b'], updated)).toBe('2026-11-17');
  });

  it('is undefined when no card has a date', () => {
    expect(packVersion(['x'], updated)).toBeUndefined();
  });
});

describe('paperGameCount', () => {
  it('counts games with a paper version and leaves out the rest', () => {
    const count = paperGameCount();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(GAMES.length);
  });
});
