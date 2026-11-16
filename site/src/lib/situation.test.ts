import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { serializeFinderState } from './finder-state';
import { FACET_ORDER, MORE_FACETS, RULES, chipLabel, interpret, mentionsChild, minutesIn, planFinderChanges, type Facet } from './situation';
import { normalize } from './search';

const chips = (text: string) => interpret(text).map((c) => `${c.facet}=${c.value}`);

/**
 * WEB-002: situations from 01 §3, in a visitor's own words, and the finder choices each should give.
 * The expectations are one author's proposal and wait for an editor's check. A situation with no known
 * word gives no choices, and the page then shows the plain filters.
 */
const SITUATIONS: readonly (readonly [string, readonly string[]])[] = [
  ['A toddler, rainy afternoon, 20 minutes, nothing to buy', ['time=30', 'materials=none', 'group=intergenerational']],
  ['My father likes music but tires quickly', ['type=music', 'setting=seated', 'energy=low']],
  ['My child dislikes sticky textures', ['group=intergenerational', 'mess=none']],
  ['In bed after surgery, can hold a clipboard for ten minutes', ['time=15', 'setting=bedside']],
  ['Grandparent on a video call with a 7 year old', ['group=intergenerational']],
  ['A care home group of eight, mixed abilities', ['group=small-group']],
  ['Teacher with 20 minutes before lunch, a class of 24 aged six', ['time=30', 'group=small-group']],
  ["A librarian's Tuesday drop-in, all ages", ['group=intergenerational']],
  ['My grandmother used to knit but cannot grip, she has arthritis', ['type=craft']],
  ['Visiting my mother, who responds to touch and voice', ['sense=touch']],
  ['Quiet crafts for a five year old who gets overwhelmed by noise', ['type=craft', 'group=intergenerational', 'sense=calm']],
  ['Someone with low vision who still wants to paint', ['type=art']],
  ['A non-speaking adult at a day centre who likes sorting', ['type=sensory', 'talking=none']],
  ['A retired carpenter in a chair who wants to make something useful', ['type=craft', 'setting=seated']],
  ['Two siblings stuck indoors with a cold', ['group=intergenerational']],
  ['A new baby, and a grandparent who visits weekly: five minutes, seated', ['time=15', 'setting=seated', 'group=intergenerational']],
  ['Five minutes between tasks and only paper and pencils at hand', ['time=15', 'materials=none']],
  ['She loves singing but gets anxious in groups', ['type=music']],
  ['Grieving, wants to make something with their hands, and does not want to talk about the loss', ['type=craft', 'talking=none']],
  ['A weekly creative habit with no pressure', []],
  ['A volunteer visiting someone who speaks very little near the end of life', ['talking=none']],
  ["A care home activity director planning the week's program on paper", []],
  ['A family with a basic phone and weak wifi', []],
  ['A grandmother who reads a language we have not translated yet', []],
  ['A teenager who wants a calm thing to do alone', ['sense=calm']],
  ['An adult and a parent sharing one tablet, taking turns', []],
  ['Birthday activity for ten six year olds on a small budget', ['materials=low', 'group=intergenerational']],
  ['A grandparent planning a gift that is also something to do on the visit', ['group=intergenerational']],
  ['After a hard day I want something quiet and I do not want to talk', ['sense=calm', 'talking=none']],
  ['An occupational therapist suggesting an activity between sessions', []],
  ['A family celebrating a holiday we have not written for', []],
  ['An adult child on a call with a parent who has macular degeneration', []],
  ['A person in a wheelchair at a table, using one hand', ['setting=seated']],
  ['They want to stop after one step and a relative keeps pushing', []],
  ['Two children aged 3 and 9 who want one activity they can both do', ['group=intergenerational']],
  ['A caregiver who wants an activity with a relative and with a child in the same week', ['group=intergenerational']],
  ['Something free to do in the garden with the grandchildren', ['type=nature', 'materials=none', 'group=intergenerational']],
  ['My mum is tired and cannot hold a pen', ['energy=low']],
  ['No mess please, and quick', ['mess=none', 'time=15']],
  ['A bit of mess is fine', ['mess=low']],
  ['Half an hour with Nan, she likes to sit', ['time=30', 'setting=seated']],
];

const sorted = (list: readonly string[]) => [...list].sort();

describe('situations in a visitor\'s own words (WEB-002)', () => {
  it('has at least thirty test situations', () => {
    expect(SITUATIONS.length).toBeGreaterThanOrEqual(30);
  });

  it.each(SITUATIONS.map(([text, expected]) => [text, expected] as const))('%s', (text, expected) => {
    expect(sorted(chips(text))).toEqual(sorted(expected));
  });
});

describe('what a description must never turn into (WEB-002)', () => {
  it('maps no word that names a condition, a diagnosis or a feeling that points to one', () => {
    const words = [
      'dementia', 'alzheimers', 'arthritis', 'autistic', 'autism', 'adhd', 'depressed', 'depression', 'anxious', 'anxiety',
      'forgetful', 'confused', 'memory loss', 'stroke', 'parkinsons', 'blind', 'deaf', 'disabled', 'macular degeneration',
      'grieving', 'trauma', 'ptsd', 'diagnosis', 'patient', 'illness', 'surgery', 'cancer',
    ];
    for (const w of words) expect(chips(`my mother is ${w}`), w).toEqual([]);
    for (const w of words) expect(chips(w), w).toEqual([]);
  });

  it('keeps any condition word out of every rule', () => {
    const forbidden = /dementia|alzheimer|arthrit|autis|adhd|depress|anxi|forget|confus|stroke|parkinson|blind|deaf|disab|degenerat|trauma|ptsd|diagnos|patient|illness|cancer|surgery/;
    for (const r of RULES) for (const w of [...(r.words ?? []), ...(r.phrases ?? [])]) expect(w, w).not.toMatch(forbidden);
  });

  it('does not read a wish into a word that is turned around', () => {
    expect(chips('She does not like music')).toEqual([]);
    expect(chips('not tired, wants something lively')).toEqual([]);
    expect(chips('he dislikes textures')).toEqual([]);
    expect(chips('anxious in groups')).toEqual([]);
    expect(chips('never sits down')).toEqual([]);
  });

  it('returns nothing, not an error, for empty text, gibberish and punctuation', () => {
    for (const text of ['', '   ', 'zzzqx plorb', '?!...', '12345']) expect(chips(text), text).toEqual([]);
  });

  it('gives one choice for each question at most, in the finder order', () => {
    const result = interpret('I want to paint and sing and make things, quick and cheap, in bed, for the grandchildren and the group');
    const facets = result.map((c) => c.facet);
    expect(new Set(facets).size).toBe(facets.length);
    expect(facets).toEqual(FACET_ORDER.filter((f) => facets.includes(f)));
  });

  it('lets the first thing named win a question', () => {
    expect(chips('we like to paint and sing')).toContain('type=art');
    expect(chips('we like to sing and paint')).toContain('type=music');
  });
});

describe('numbers in a description', () => {
  it('reads minutes written as digits or words', () => {
    expect(minutesIn(normalize('20 minutes').split(' '))).toBe(20);
    expect(minutesIn(normalize('about ten minutes').split(' '))).toBe(10);
    expect(minutesIn(normalize('an hour').split(' '))).toBeNull();
  });

  it('puts a number of minutes in the finder\'s time bands, and none over thirty', () => {
    expect(chips('15 minutes')).toEqual(['time=15']);
    expect(chips('16 minutes')).toEqual(['time=30']);
    expect(chips('45 minutes')).toEqual([]);
    expect(chips('quick, about 20 minutes')).toEqual(['time=30']);
  });

  it('reads a child\'s age as a child taking part, and an adult\'s as nothing', () => {
    expect(mentionsChild(normalize('a 7 year old').split(' '))).toBe(true);
    expect(mentionsChild(normalize('aged 3 and 9').split(' '))).toBe(true);
    expect(mentionsChild(normalize('my 82 year old mother').split(' '))).toBe(false);
    expect(chips('my 82 year old mother')).toEqual([]);
  });
});

describe('every choice is one the finder offers', () => {
  it('writes into the finder address for every rule, so no choice is made up', () => {
    for (const r of RULES) {
      expect(serializeFinderState({ [r.facet]: r.value }), `${r.facet}=${r.value}`).not.toBe('');
    }
    for (const value of ['15', '30']) expect(serializeFinderState({ time: value })).not.toBe('');
    expect(serializeFinderState({ group: 'intergenerational' })).not.toBe('');
  });

  it('labels each chip in the finder\'s own words', () => {
    expect(chipLabel('type', 'music')).toBe('Kind: music');
    expect(chipLabel('time', '30')).toBe('Time: up to 30 minutes');
    expect(chipLabel('group', 'intergenerational')).toBe('Who: with grandchildren');
    expect(chipLabel('energy', 'low')).toMatch(/^Energy: low/);
  });

  it('knows which questions the finder keeps behind "more ways"', () => {
    const first: Facet[] = ['type', 'time', 'materials'];
    for (const f of FACET_ORDER) expect(MORE_FACETS.has(f), f).toBe(!first.includes(f));
  });
});

describe('setting the finder from the chips (WEB-002)', () => {
  const chip = (facet: Facet, value: string) => ({ facet, value, label: `${facet}: ${value}` });

  it('sets each chosen question and nothing else', () => {
    const plan = planFinderChanges([chip('type', 'music'), chip('energy', 'low')], new Map());
    expect([...plan.set]).toEqual([['type', 'music'], ['energy', 'low']]);
    expect([...plan.applied]).toEqual([['type', 'music'], ['energy', 'low']]);
  });

  it('puts back to "any" a question this box set before and no chip names now', () => {
    const plan = planFinderChanges([chip('type', 'music')], new Map<Facet, string>([['type', 'music'], ['energy', 'low']]));
    expect(plan.set.get('energy')).toBe('any');
    expect(plan.set.get('type')).toBe('music');
  });

  it('leaves alone a question this box never set, so a choice made by hand stays', () => {
    const plan = planFinderChanges([chip('type', 'music')], new Map());
    expect(plan.set.has('setting')).toBe(false);
  });

  it('puts everything back when the description is emptied', () => {
    const plan = planFinderChanges([], new Map<Facet, string>([['time', '15'], ['group', 'intergenerational']]));
    expect([...plan.set]).toEqual([['time', 'any'], ['group', 'any']]);
    expect(plan.applied.size).toBe(0);
  });
});

describe('what is typed in the box is never kept (WEB-002)', () => {
  const sources = ['../tools/DescribeSituation.tsx', './situation.ts'].map((p) => [p, readFileSync(new URL(p, import.meta.url), 'utf8')] as const);

  it('stores, sends and counts nothing, and never puts the words in the address', () => {
    for (const [file, text] of sources) {
      expect(text, file).not.toMatch(/localStorage|sessionStorage|indexedDB|document\.cookie|sendBeacon|gtag|dataLayer|\btrack\(|\bfetch\(|XMLHttpRequest|history\.(?:push|replace)State|location\.(?:search|hash|href)|URLSearchParams/);
    }
  });
});
