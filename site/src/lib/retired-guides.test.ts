import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  RETIRED_GUIDES,
  guideIdOfPath,
  guidePath,
  isRetiredGuide,
  isRetiredSection,
  redirectLines,
  redirectsFile,
} from './retired-guides';

describe('retired guides', () => {
  it('knows which guides and sections are retired', () => {
    expect(isRetiredGuide('activities/coloring')).toBe(true);
    expect(isRetiredGuide('activities/ideas')).toBe(false);
    expect(isRetiredSection('brain-health')).toBe(true);
    expect(isRetiredSection('crafts')).toBe(false);
  });

  it('points references to the new page, and leaves live guides alone', () => {
    expect(guidePath('activities/coloring')).toBe('/crafts/coloring-pages-for-adults/');
    expect(guidePath('activities/ideas')).toBe('/activities/ideas/');
  });

  it('reads guide ids from paths', () => {
    expect(guideIdOfPath('/crafts/paper-crafts/')).toBe('crafts/paper-crafts');
    expect(guideIdOfPath('/games/')).toBeNull();
    expect(guideIdOfPath('/activity/x/y/')).toBeNull();
  });

  it('never redirects to another retired page, so there are no chains', () => {
    for (const to of Object.values(RETIRED_GUIDES)) {
      const id = guideIdOfPath(to);
      if (id) expect(isRetiredGuide(id), `${to} is itself retired`).toBe(false);
      expect(to.startsWith('/') && to.endsWith('/')).toBe(true);
    }
  });

  it('writes a permanent redirect with and without the trailing slash', () => {
    const lines = redirectLines();
    expect(lines).toContain('/activities/coloring /crafts/coloring-pages-for-adults/ 301');
    expect(lines).toContain('/activities/coloring/ /crafts/coloring-pages-for-adults/ 301');
    expect(lines).toContain('/brain-health/ /dementia-activities/ 301');
    expect(new Set(lines.map((l) => l.split(' ')[0])).size).toBe(lines.length);
  });

  it('public/_redirects is the generated file (run pnpm gen:redirects)', () => {
    expect(readFileSync(new URL('../../public/_redirects', import.meta.url), 'utf8')).toBe(redirectsFile());
  });
});
