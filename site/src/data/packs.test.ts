import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PACKS } from './packs';

describe('printable packs', () => {
  it('has unique ids', () => {
    expect(new Set(PACKS.map((p) => p.id)).size).toBe(PACKS.length);
  });

  for (const pack of PACKS) {
    it(`${pack.id}: prints existing activities once each`, () => {
      expect(pack.activities.length).toBeGreaterThanOrEqual(3);
      expect(new Set(pack.activities).size).toBe(pack.activities.length);
      for (const slug of pack.activities) {
        expect(existsSync(new URL(`../content/activity-cards/${slug}.md`, import.meta.url)), `missing ${slug}`).toBe(true);
      }
    });

    it(`${pack.id}: fits search and social limits`, () => {
      expect(pack.seoTitle.length).toBeLessThanOrEqual(60);
      expect(pack.description.length).toBeGreaterThanOrEqual(110);
      expect(pack.description.length).toBeLessThanOrEqual(165);
    });
  }
});
