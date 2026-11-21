import { describe, expect, it } from 'vitest';
import { CANONICAL_ALTERNATES, canonicalError } from '../../scripts/canonical-lib.mjs';

const SITE = 'https://creativeactivities.org';
const built = new Set(['/activity/wrap-a-small-gift/', '/activity/wrap-a-small-gift/large-print/', '/games/scrapbook/']);
const options = {
  site: SITE,
  targetIndexable: (target: string) => built.has(target) && target !== '/activity/wrap-a-small-gift/large-print/',
};

describe('canonical rule (SEO-029)', () => {
  it('lists the large-print card as the only alternate template', () => {
    expect(CANONICAL_ALTERNATES.map((t) => t.name)).toEqual(['large-print card']);
  });

  it('lets an ordinary page canonicalize only to itself', () => {
    expect(canonicalError('/games/scrapbook/', `${SITE}/games/scrapbook/`, options)).toBeNull();
    expect(canonicalError('/games/scrapbook/', `${SITE}/games/`, options)).toMatch(/should be/);
    expect(canonicalError('/games/scrapbook/', `${SITE}/games/scrapbook`, options)).toMatch(/should be/);
    expect(canonicalError('/games/scrapbook/', undefined, options)).toMatch(/undefined/);
  });

  it('lets the large-print card canonicalize to its activity page', () => {
    expect(canonicalError('/activity/wrap-a-small-gift/large-print/', `${SITE}/activity/wrap-a-small-gift/`, options)).toBeNull();
  });

  it('rejects a large-print card that canonicalizes to itself', () => {
    expect(canonicalError('/activity/wrap-a-small-gift/large-print/', `${SITE}/activity/wrap-a-small-gift/large-print/`, options)).toMatch(
      /large-print card canonical .* should be/,
    );
  });

  it('rejects a large-print card whose canonical points at a different page or a different language', () => {
    expect(canonicalError('/activity/wrap-a-small-gift/large-print/', `${SITE}/games/scrapbook/`, options)).toMatch(/should be/);
    expect(canonicalError('/activity/wrap-a-small-gift/large-print/', `${SITE}/vi/activity/wrap-a-small-gift/`, options)).toMatch(/should be/);
    expect(canonicalError('/activity/wrap-a-small-gift/large-print/', undefined, options)).toMatch(/should be/);
  });

  it('rejects a large-print canonical whose target is not built or is noindex', () => {
    expect(canonicalError('/activity/missing-card/large-print/', `${SITE}/activity/missing-card/`, options)).toMatch(/not a built, indexable page/);
    expect(canonicalError('/activity/wrap-a-small-gift/large-print/', `${SITE}/activity/wrap-a-small-gift/`, {
      ...options,
      targetIndexable: () => false,
    })).toMatch(/not a built, indexable page/);
  });

  it('does not treat a page that only resembles a large-print card as one', () => {
    expect(canonicalError('/activity/wrap-a-small-gift/large-print/extra/', `${SITE}/activity/wrap-a-small-gift/`, options)).toMatch(/should be/);
    expect(canonicalError('/activity/large-print/', `${SITE}/activity/`, options)).toMatch(/should be/);
  });
});
