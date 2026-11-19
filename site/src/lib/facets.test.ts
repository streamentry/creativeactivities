import { describe, expect, it } from 'vitest';
import { loadFacetCards, loadFacetHubs } from './facet-inputs.ts';
import {
  type FacetCard,
  type FacetDef,
  type FacetHub,
  type Verdict,
  buildFacets,
  differentCount,
  evaluateFacets,
  overlapShare,
  passesH3,
  profileOf,
} from './facets.ts';

const cardDir = new URL('../content/activity-cards/', import.meta.url);
const hubDir = new URL('../content/hubs/', import.meta.url);

function card(id: string, patch: Partial<FacetCard> = {}): FacetCard {
  return {
    id,
    withdrawn: false,
    settings: ['tabletop'],
    groups: ['one-to-one'],
    activityMinutes: [10, 20],
    prepMinutes: 5,
    mess: 'low',
    cost: 'low',
    energy: 'low',
    supervision: 'nearby',
    ...patch,
  };
}

/** Three distinct profiles, so eight cards pass the "differ" rule. */
const VARIED: Partial<FacetCard>[] = [
  { settings: ['seated'] },
  { settings: ['tabletop'], groups: ['small-group'] },
  { settings: ['bedside'], supervision: 'hands-on' },
];

function varied(prefix: string, n: number): FacetCard[] {
  return Array.from({ length: n }, (_, i) => card(`${prefix}${i}`, VARIED[i % VARIED.length]));
}

const prefixFacet = (id: string, prefix: string): FacetDef => ({
  id,
  label: id,
  rule: `id starts with ${prefix}`,
  matches: (c) => c.id.startsWith(prefix),
});

const hub = (id: string, cards: string[]): FacetHub => ({ id, cards, indexable: true });

const ALLOWED: Verdict[] = ['candidate', 'route-to-hub', 'route-to-facet', 'too-broad', 'filter-only'];

describe('H3 threshold', () => {
  it('fails at seven cards and passes at eight when three profiles differ', () => {
    expect(passesH3(varied('a', 7))).toBe(false);
    expect(passesH3(varied('a', 8))).toBe(true);
  });

  it('fails when eight cards show fewer than three distinct profiles', () => {
    const twoProfiles = Array.from({ length: 8 }, (_, i) => card(`b${i}`, VARIED[i % 2]));
    expect(differentCount(twoProfiles)).toBe(2);
    expect(passesH3(twoProfiles)).toBe(false);
  });

  it('fails when all eight cards are identical', () => {
    const same = Array.from({ length: 8 }, (_, i) => card(`c${i}`));
    expect(passesH3(same)).toBe(false);
  });

  it('ignores the order of settings and groups in a profile', () => {
    const a = card('x', { settings: ['seated', 'tabletop'], groups: ['small-group', 'one-to-one'] });
    const b = card('y', { settings: ['tabletop', 'seated'], groups: ['one-to-one', 'small-group'] });
    expect(profileOf(a)).toBe(profileOf(b));
  });
});

describe('H1 overlap and verdicts', () => {
  const facetA = prefixFacet('test:a', 'a');
  // Ten other cards, so the 8 matching cards are under half the catalog and not too broad.
  const filler = varied('z', 10);
  const cards = [...varied('a', 8), ...filler];

  it('computes the share as a fraction of the facet cards', () => {
    expect(overlapShare(['a0', 'a1', 'a2', 'a3'], new Set(['a0', 'a1']))).toBe(0.5);
    expect(overlapShare([], new Set(['a0']))).toBe(0);
  });

  it('gives candidate at exactly half overlap with a hub', () => {
    const [result] = evaluateFacets(cards, [hub('hub-x', ['a0', 'a1', 'a2', 'a3'])], [facetA]);
    expect(result.largestHub?.share).toBe(0.5);
    expect(result.verdict).toBe('candidate');
    expect(result.routeTo).toBeNull();
  });

  it('routes to the hub when overlap is above half', () => {
    const [result] = evaluateFacets(cards, [hub('hub-x', ['a0', 'a1', 'a2', 'a3', 'a4'])], [facetA]);
    expect(result.verdict).toBe('route-to-hub');
    expect(result.routeTo).toBe('hub-x');
  });

  it('routes to another facet when that overlap is above half and no hub is involved', () => {
    // first9 = a0..a8 (9 cards); later = a4..a11 (8 cards). 5 of first9's 9 are in later: 5/9 > half.
    const twelve = varied('a', 12);
    const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => `a${from + i}`);
    const first9: FacetDef = { id: 'test:first9', label: 'x', rule: 'x', matches: (c) => range(0, 8).includes(c.id) };
    const later: FacetDef = { id: 'test:later', label: 'y', rule: 'y', matches: (c) => range(4, 11).includes(c.id) };
    const results = evaluateFacets([...twelve, ...varied('z', 12)], [], [first9, later]);
    expect(results[0].verdict).toBe('route-to-facet');
    expect(results[0].routeTo).toBe('test:later');
  });

  it('is too-broad when it holds more than half of all live cards, and is never a routing target', () => {
    const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => `a${from + i}`);
    const all = [...varied('a', 8), ...varied('z', 2)]; // facetA holds 8 of 10
    const small: FacetDef = { id: 'test:small', label: 's', rule: 's', matches: (c) => range(0, 7).includes(c.id) };
    const results = evaluateFacets(all, [], [facetA, small]);
    expect(results[0].verdict).toBe('too-broad');
    expect(results[0].routeTo).toBeNull();
    // small is also 8 of 10, so too broad as well; neither routes to the other.
    expect(results[1].verdict).toBe('too-broad');
  });

  it('is filter-only when H3 fails, whatever the overlap', () => {
    const [result] = evaluateFacets(varied('a', 5), [hub('hub-x', ['a0'])], [facetA]);
    expect(result.passesH3).toBe(false);
    expect(result.verdict).toBe('filter-only');
  });

  it('drops withdrawn cards before counting', () => {
    const withdrawn = card('a-gone', { withdrawn: true, settings: ['outdoors'] });
    const [result] = evaluateFacets([...cards, withdrawn], [], [prefixFacet('test:a', 'a')]);
    expect(result.cards).toHaveLength(8);
    expect(result.cards).not.toContain('a-gone');
  });
});

describe('real cards', () => {
  const cardsOnDisk = loadFacetCards(cardDir);
  const hubs = loadFacetHubs(hubDir);
  const facets = buildFacets();
  const results = evaluateFacets(cardsOnDisk, hubs, facets);

  it('gives every facet exactly one verdict', () => {
    expect(results).toHaveLength(facets.length);
    expect(new Set(results.map((r) => r.id)).size).toBe(facets.length);
    for (const r of results) expect(ALLOWED).toContain(r.verdict);
  });

  it('never gives candidate to a facet that fails H3, is too broad, or overlaps a hub by more than half', () => {
    const live = cardsOnDisk.filter((c) => !c.withdrawn).length;
    for (const r of results) {
      if (r.verdict === 'candidate') {
        expect(r.cards.length / live, r.id).toBeLessThanOrEqual(0.5);
        expect(r.passesH3, r.id).toBe(true);
        expect(r.largestHub?.share ?? 0, r.id).toBeLessThanOrEqual(0.5);
        expect(r.largestFacet?.share ?? 0, r.id).toBeLessThanOrEqual(0.5);
      }
      if (!r.passesH3) expect(r.verdict, r.id).toBe('filter-only');
    }
  });

  it('does not give the bedside facet candidate when it overlaps the bedside hub by more than half', () => {
    const bedside = results.find((r) => r.id === 'setting:bedside');
    expect(bedside).toBeDefined();
    const overlap = bedside?.cards.filter((id) => hubs.find((h) => h.id === 'bedside-activities')?.cards.includes(id)).length ?? 0;
    const share = overlap / (bedside?.cards.length || 1);
    if (share > 0.5) expect(bedside?.verdict).not.toBe('candidate');
  });
});
