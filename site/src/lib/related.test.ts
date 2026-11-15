import { describe, expect, it } from 'vitest';
import { materialClasses, relatedCards, relatedScore, type RelatedFacts } from './related';

const card = (slug: string, change: Partial<RelatedFacts> = {}): RelatedFacts => ({
  slug,
  type: 'craft',
  energy: 'low',
  settings: ['tabletop'],
  groups: ['one-to-one'],
  senses: ['sight'],
  materials: ['Plain paper, about letter size', 'A glue stick'],
  ...change,
});

describe('materialClasses', () => {
  it('groups everyday materials into a few functional classes', () => {
    expect(materialClasses(['Newspaper or a tray to work on', 'A glue stick'])).toEqual(['paper', 'glue']);
    expect(materialClasses(['Non-toxic, water-based paint and a thick-handled brush'])).toEqual(['paint']);
    expect(materialClasses(['A skein or loose length of soft, chunky yarn'])).toEqual(['fabric']);
    expect(materialClasses(['A small plant pot with a drainage hole'])).toEqual(['plants', 'containers']);
  });

  it('does not match inside other words', () => {
    expect(materialClasses(['An open window'])).toEqual([]);
  });
});

describe('relatedScore', () => {
  it('scores the same type, shared settings, senses, energy, group and material class', () => {
    const a = card('a');
    expect(relatedScore(a, card('b'))).toBeGreaterThanOrEqual(3);
    expect(relatedScore(a, card('b', { type: 'music', settings: ['outdoors'], senses: ['hearing'], energy: 'medium', groups: ['small-group'], materials: ['A phone'] }))).toBe(0);
  });

  it('treats a shared keyword in the name as nothing: only facets count', () => {
    const a = card('paper-crafts', { type: 'art' });
    const b = card('paper-music', { type: 'music', settings: ['outdoors'], senses: ['hearing'], energy: 'medium', groups: ['small-group'], materials: ['Paper'] });
    expect(relatedScore(a, b)).toBeLessThan(3);
  });
});

describe('relatedCards (WEB-008)', () => {
  const self = card('self');
  const pool = [
    self,
    card('same-type-same-setting'),
    card('same-type-two'),
    card('same-type-three'),
    card('music-with-sound', { type: 'music', senses: ['hearing'], settings: ['outdoors'], energy: 'medium', groups: ['small-group'], materials: ['A phone'] }),
    card('sound-and-sit', { type: 'music', senses: ['hearing'], settings: ['tabletop'], energy: 'low', groups: ['one-to-one'], materials: ['A phone'] }),
    card('unrelated', { type: 'nature', settings: ['outdoors'], senses: ['smell'], energy: 'medium', groups: ['small-group'], materials: ['Dried lavender'] }),
  ];

  it('keeps the hand-picked related cards first, in their order', () => {
    expect(relatedCards(self, pool, ['sound-and-sit', 'same-type-two'], { min: 3, max: 4 })).toEqual([
      'sound-and-sit',
      'same-type-two',
      'same-type-same-setting',
    ]);
  });

  it('fills to three with the best functional matches, never the card itself', () => {
    const picked = relatedCards(self, pool, [], { min: 3, max: 4 });
    expect(picked).toHaveLength(3);
    expect(picked).not.toContain('self');
    expect(picked).not.toContain('unrelated');
  });

  it('never repeats a card and never exceeds the maximum', () => {
    const picked = relatedCards(self, pool, ['same-type-two', 'same-type-two', 'sound-and-sit', 'music-with-sound', 'same-type-same-setting'], { min: 3, max: 4 });
    expect(new Set(picked).size).toBe(picked.length);
    expect(picked.length).toBe(4);
  });

  it('skips a hand-picked slug that is not in the listed pool (for example, a withdrawn card)', () => {
    const picked = relatedCards(self, pool.filter((c) => c.slug !== 'same-type-two'), ['same-type-two'], { min: 3, max: 4 });
    expect(picked).not.toContain('same-type-two');
    expect(picked).toHaveLength(3);
  });

  it('returns fewer than three rather than a weak match when nothing else fits', () => {
    const lonely = card('lonely', { type: 'sensory', settings: ['standing'], senses: ['movement'], energy: 'medium', groups: ['intergenerational'], materials: ['A ball'] });
    const other = card('other', { type: 'nature', settings: ['outdoors'], senses: ['smell'], energy: 'medium', groups: ['small-group'], materials: ['Dried lavender'] });
    expect(relatedCards(lonely, [lonely, other], [])).toEqual([]);
  });
});
