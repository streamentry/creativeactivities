import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { factList, fitReasons, glance, matches, minutesRange, type ActivityFacts } from './activities';

const COLLAGE: ActivityFacts = {
  type: 'craft',
  prepMinutes: 10,
  activityMinutes: [15, 30],
  cost: 'low',
  mess: 'low',
  energy: 'low',
  supervision: 'nearby',
  settings: ['tabletop', 'seated'],
  groups: ['one-to-one', 'intergenerational'],
};

describe('glance', () => {
  it('reads like the design brief: setup, length, seating and cost', () => {
    expect(glance(COLLAGE)).toEqual(['10 min setup', '15–30 min activity', 'seated-friendly', 'low cost']);
  });

  it('says when there is nothing to set up and collapses equal ranges', () => {
    expect(glance({ ...COLLAGE, prepMinutes: 0, activityMinutes: [20, 20] }).slice(0, 2)).toEqual([
      'no setup',
      '20 min activity',
    ]);
    expect(minutesRange([20, 20])).toBe('20 min');
  });

  it('lists every fact with a value', () => {
    expect(factList(COLLAGE).every((f) => f.value.length > 0)).toBe(true);
  });
});

describe('matches', () => {
  it('never filters on "any" or an unset choice', () => {
    expect(matches(COLLAGE, {})).toBe(true);
    expect(matches(COLLAGE, { time: 'any', materials: 'any', type: 'any', setting: 'any', group: 'any' })).toBe(true);
  });

  it('keeps activities whose shortest run fits the time', () => {
    expect(matches(COLLAGE, { time: '15' })).toBe(true);
    expect(matches({ ...COLLAGE, activityMinutes: [20, 40] }, { time: '15' })).toBe(false);
  });

  it('filters by cost, type, setting and who is taking part', () => {
    expect(matches(COLLAGE, { materials: 'none' })).toBe(false);
    expect(matches(COLLAGE, { materials: 'low' })).toBe(true);
    expect(matches(COLLAGE, { type: 'music' })).toBe(false);
    expect(matches(COLLAGE, { setting: 'bedside' })).toBe(false);
    expect(matches(COLLAGE, { setting: 'seated' })).toBe(true);
    expect(matches(COLLAGE, { group: 'intergenerational' })).toBe(true);
  });
});

describe('optional fit filters', () => {
  it('filters by how much mess is okay', () => {
    expect(matches({ ...COLLAGE, mess: 'none' }, { mess: 'none' })).toBe(true);
    expect(matches(COLLAGE, { mess: 'none' })).toBe(false);
    expect(matches(COLLAGE, { mess: 'low' })).toBe(true);
    expect(matches({ ...COLLAGE, mess: 'medium' }, { mess: 'low' })).toBe(false);
    expect(matches({ ...COLLAGE, mess: 'medium' }, { mess: 'any' })).toBe(true);
  });

  it('keeps only sit-still activities on a low-energy day', () => {
    expect(matches(COLLAGE, { energy: 'low' })).toBe(true);
    expect(matches({ ...COLLAGE, energy: 'medium' }, { energy: 'low' })).toBe(false);
    expect(matches({ ...COLLAGE, energy: 'medium' }, { energy: 'any' })).toBe(true);
  });

  it('keeps activities that use the sense they enjoy most', () => {
    const songs: ActivityFacts = { ...COLLAGE, senses: ['hearing', 'movement'] };
    expect(matches(songs, { sense: 'hearing' })).toBe(true);
    expect(matches(songs, { sense: 'smell' })).toBe(false);
    expect(matches(songs, { sense: 'any' })).toBe(true);
    // An activity with no recorded senses never matches a chosen sense.
    expect(matches(COLLAGE, { sense: 'touch' })).toBe(false);
  });

  it('offers a calmer choice only where a less-sensory version is written', () => {
    expect(matches({ ...COLLAGE, variationKinds: ['easier', 'less-sensory'] }, { sense: 'calm' })).toBe(true);
    expect(matches({ ...COLLAGE, variationKinds: ['easier'] }, { sense: 'calm' })).toBe(false);
  });

  it('keeps only activities with a written way to do them without words', () => {
    expect(matches({ ...COLLAGE, variationKinds: ['nonverbal'] }, { talking: 'none' })).toBe(true);
    expect(matches({ ...COLLAGE, variationKinds: ['easier'] }, { talking: 'none' })).toBe(false);
    expect(matches({ ...COLLAGE, variationKinds: ['easier'] }, { talking: 'any' })).toBe(true);
  });

  it('keeps only activities that need someone nearby when hands-on help is not possible', () => {
    expect(matches(COLLAGE, { supervision: 'nearby' })).toBe(true);
    expect(matches({ ...COLLAGE, supervision: 'hands-on' }, { supervision: 'nearby' })).toBe(false);
    expect(matches({ ...COLLAGE, supervision: 'hands-on' }, { supervision: 'any' })).toBe(true);
  });
});

describe('fitReasons', () => {
  it('says nothing when nothing was chosen', () => {
    expect(fitReasons(COLLAGE, {})).toEqual([]);
    expect(fitReasons(COLLAGE, { time: 'any', materials: 'any', mess: 'any' })).toEqual([]);
  });

  it('explains each choice the activity meets, in plain words', () => {
    expect(fitReasons(COLLAGE, { time: '30', materials: 'low', setting: 'seated', mess: 'low', energy: 'low' })).toEqual([
      'can start in under 30 minutes',
      'needs only low-cost things',
      'works seated',
      'little or no mess',
      'mostly sitting still',
    ]);
  });

  it('explains sense, calm and wordless fits in plain words', () => {
    const songs: ActivityFacts = { ...COLLAGE, senses: ['hearing'], variationKinds: ['nonverbal', 'less-sensory'] };
    expect(fitReasons(songs, { sense: 'hearing' })).toEqual(['uses sounds or music']);
    expect(fitReasons(songs, { sense: 'calm' })).toEqual(['has a calmer version']);
    expect(fitReasons(songs, { talking: 'none' })).toEqual(['works without words']);
  });

  it('says the activity works with the helper nearby', () => {
    expect(fitReasons(COLLAGE, { supervision: 'nearby' })).toEqual(['works with you nearby']);
  });

  it('names the actual cost and mess when they are better than asked', () => {
    expect(fitReasons({ ...COLLAGE, cost: 'free', mess: 'none' }, { materials: 'low', mess: 'low' })).toEqual([
      'nothing to buy',
      'no mess',
    ]);
  });
});

describe('activity cards on disk', () => {
  const dir = new URL('../content/activity-cards/', import.meta.url);
  const files = readdirSync(dir).filter((f) => f.endsWith('.md'));
  const slugs = new Set(files.map((f) => f.replace(/\.md$/, '')));
  const list = (text: string, key: string) =>
    (text.match(new RegExp(`^${key}: \\[(.*)\\]$`, 'm'))?.[1] ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  it('has the twenty Stage 1 activities', () => {
    expect(files.length).toBeGreaterThanOrEqual(20);
  });

  for (const file of files) {
    const text = readFileSync(new URL(file, dir), 'utf8');
    const slug = file.replace(/\.md$/, '');

    it(`${slug}: related activities and guides exist`, () => {
      for (const ref of list(text, 'related')) {
        expect(slugs.has(ref), `${slug} links to missing activity ${ref}`).toBe(true);
        expect(ref).not.toBe(slug);
      }
      for (const ref of list(text, 'guides')) {
        expect(existsSync(new URL(`../content/guides/${ref}.md`, import.meta.url)), `${slug}: no guide ${ref}`).toBe(true);
      }
    });

    it(`${slug}: has the variation its settings and groups promise`, () => {
      // The finder and hubs offer a card for bedside or with grandchildren; the card must say how.
      const kinds = [...text.matchAll(/kind: ([a-z-]+)/g)].map((m) => m[1]);
      if (list(text, 'settings').includes('bedside')) expect(kinds, `${slug} needs a bedside variation`).toContain('bedside');
      if (list(text, 'groups').includes('intergenerational')) {
        expect(kinds, `${slug} needs a with-children variation`).toContain('with-children');
      }
      expect(kinds).toContain('easier');
    });

    it(`${slug}: suggests who might enjoy it by interest, never by label`, () => {
      const enjoy = text.match(/^enjoy: "(.*)"$/m)?.[1]?.toLowerCase();
      if (!enjoy) return;
      for (const label of ['dementia', 'alzheimer', 'memory', 'diagnos', 'stage', 'elderly', 'senior', 'calming']) {
        expect(enjoy.includes(label), `${slug} enjoy line says "${label}"`).toBe(false);
      }
    });

    it(`${slug}: avoids clinical and test-like claims`, () => {
      const body = text.toLowerCase();
      for (const banned of ['therapy', 'therapeutic', 'cognitive', 'brain', 'improve memory', 'improves memory', 'do you remember', 'patient']) {
        expect(body.includes(banned), `${slug} says "${banned}"`).toBe(false);
      }
    });
  }
});
