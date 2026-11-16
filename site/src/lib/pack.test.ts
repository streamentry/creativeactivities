import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CARD_NEEDS } from '../data/card-needs';
import { MATERIAL_TAG_BY_ID } from '../data/materials';
import { canMake } from './what-i-have';
import {
  DEFAULT_VARIATION,
  MAX_CARDS,
  MAX_COVER_PAGES,
  MAX_PAGES_PER_CARD,
  blockedNote,
  combineNeeds,
  countRequested,
  droppedNote,
  groupLabel,
  hasVersion,
  idsWithVersion,
  linkLeftOutNote,
  optionalExtras,
  packKey,
  pagesAtMost,
  parsePackState,
  printLabel,
  quotedName,
  savedLeftOutNote,
  serializePackState,
  whyNotAdded,
  type PackCardLike,
} from './pack';

const CARDS = new Set(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']);
const VARIATIONS = new Set(['easier', 'seated', 'bedside']);

describe('the pack a link describes (WEB-017)', () => {
  it('keeps cards that exist, once each, in the order given', () => {
    expect(parsePackState('?cards=c,a,zzz,c,b', CARDS, VARIATIONS).cards).toEqual(['c', 'a', 'b']);
  });

  it('stops at eight cards', () => {
    const state = parsePackState('?cards=a,b,c,d,e,f,g,h,i,j', CARDS, VARIATIONS);
    expect(state.cards).toHaveLength(MAX_CARDS);
    expect(state.cards.at(-1)).toBe('h');
  });

  it('takes a version that exists and falls back to the easier one', () => {
    expect(parsePackState('?variation=seated', CARDS, VARIATIONS).variation).toBe('seated');
    expect(parsePackState('?variation=unknown', CARDS, VARIATIONS).variation).toBe(DEFAULT_VARIATION);
    expect(parsePackState('', CARDS, VARIATIONS)).toEqual({ cards: [], variation: DEFAULT_VARIATION });
  });

  it('trims spaces around a name and counts each different name once', () => {
    expect(parsePackState('?cards=a,%20b%20,,c', CARDS, VARIATIONS).cards).toEqual(['a', 'b', 'c']);
    expect(countRequested('?cards=a,b,a,,zzz')).toBe(3);
    expect(countRequested('?cards=a, b')).toBe(2);
    expect(countRequested('')).toBe(0);
    expect(countRequested('?variation=seated')).toBe(0);
  });

  it('ignores anything else in the address, however odd', () => {
    expect(parsePackState('?cards=a&name=Jane&x=<script>', CARDS, VARIATIONS).cards).toEqual(['a']);
    expect(parsePackState('?cards=%00,,,&&&', CARDS, VARIATIONS).cards).toEqual([]);
  });

  it('writes a plain address and reads it back', () => {
    const state = { cards: ['b', 'a'], variation: 'seated' };
    const query = serializePackState(state);
    expect(query).toBe('cards=b,a&variation=seated');
    expect(parsePackState(`?${query}`, CARDS, VARIATIONS)).toEqual(state);
    expect(serializePackState({ cards: [], variation: DEFAULT_VARIATION })).toBe('');
    expect(serializePackState({ cards: ['a'], variation: DEFAULT_VARIATION })).toBe('cards=a');
  });
});

const CARD_INFO: ReadonlyMap<string, PackCardLike> = new Map([
  ['a', { id: 'a', variations: ['easier', 'seated'] }],
  ['b', { id: 'b', variations: ['easier'] }],
  ['c', { id: 'c', variations: ['easier', 'seated', 'bedside'] }],
]);

describe('a card is in a pack only with the version the pack prints (WEB-017)', () => {
  it('says whether a card has a version', () => {
    expect(hasVersion(CARD_INFO.get('a'), 'seated')).toBe(true);
    expect(hasVersion(CARD_INFO.get('b'), 'seated')).toBe(false);
    expect(hasVersion(undefined, 'easier')).toBe(false);
  });

  it('keeps the ids that have the version, in the order given, and drops unknown ones', () => {
    expect(idsWithVersion(['c', 'b', 'a', 'zzz'], CARD_INFO, 'seated')).toEqual(['c', 'a']);
    expect(idsWithVersion(['c', 'b', 'a'], CARD_INFO, 'easier')).toEqual(['c', 'b', 'a']);
    expect(idsWithVersion([], CARD_INFO, 'easier')).toEqual([]);
  });

  it('refuses a card for lack of the version first, then for a full pack, and otherwise allows it', () => {
    expect(whyNotAdded(CARD_INFO.get('b'), 'seated', 0)).toBe('version');
    expect(whyNotAdded(CARD_INFO.get('b'), 'seated', MAX_CARDS)).toBe('version');
    expect(whyNotAdded(CARD_INFO.get('a'), 'seated', MAX_CARDS)).toBe('full');
    expect(whyNotAdded(CARD_INFO.get('a'), 'seated', MAX_CARDS - 1)).toBeNull();
    expect(whyNotAdded(undefined, 'easier', 0)).toBe('version');
  });
});

describe('what the page says when something is left out (WEB-017)', () => {
  const seated = quotedName('Seated');
  const bed = quotedName('In bed or an armchair');

  it('quotes a version name in lower case', () => {
    expect(seated).toBe('\u201cseated\u201d');
    expect(bed).toBe('\u201cin bed or an armchair\u201d');
  });

  it('says nothing when nothing was left out', () => {
    expect(droppedNote(0, seated)).toBe('');
    expect(savedLeftOutNote(0, seated)).toBe('');
    expect(linkLeftOutNote(3, 3, seated)).toBe('');
    expect(linkLeftOutNote(0, 0, seated)).toBe('');
  });

  it('says how many were taken out when the version changed, once or many', () => {
    expect(droppedNote(1, seated)).toBe('1 activity has no \u201cseated\u201d version, so it was taken out.');
    expect(droppedNote(3, seated)).toBe('3 activities have no \u201cseated\u201d version, so they were taken out.');
  });

  it('says how many saved activities were left out', () => {
    expect(savedLeftOutNote(1, seated)).toContain('1 saved activity was left out');
    expect(savedLeftOutNote(2, seated)).toContain('2 saved activities were left out');
    expect(savedLeftOutNote(2, seated)).toContain(`more than ${MAX_CARDS}`);
  });

  it('says so when a link opens a shorter pack than it names, with every reason it could be', () => {
    const one = linkLeftOutNote(1, 0, bed);
    expect(one).toBe(`The activity in this link could not be added (no ${bed} version, no longer on the site, or more than ${MAX_CARDS} in all).`);
    const some = linkLeftOutNote(5, 3, seated);
    expect(some).toContain('2 of the 5 activities in this link could not be added');
    expect(some).toContain('no longer on the site');
    expect(linkLeftOutNote(9, 8, seated)).toContain('1 of the 9 activities');
    expect(linkLeftOutNote(4, 0, seated)).toMatch(/^None of the 4 activities in this link could be added \(/);
  });

  it('explains a refused tick in the words of the reason', () => {
    expect(blockedNote('full', seated)).toBe('The pack is full. Untick an activity to add another.');
    expect(blockedNote('version', seated)).toBe('This activity has no \u201cseated\u201d version. Choose another version to add it.');
  });
});

describe('how long a pack prints (WEB-017)', () => {
  it('shows no pages for an empty pack and a cover plus each card otherwise', () => {
    expect(pagesAtMost(0)).toBe(0);
    expect(pagesAtMost(1)).toBe(4);
    expect(pagesAtMost(5)).toBe(12);
    expect(pagesAtMost(MAX_CARDS)).toBe(18);
  });

  it('states the same limits the print check proves', () => {
    // scripts/check-print.mjs prints every card through the builder and fails when a cover or a card is longer than
    // these numbers; if the page promised more or less than the check measures, the promise would not be tested.
    const script = readFileSync(new URL('../../scripts/check-print.mjs', import.meta.url), 'utf8');
    expect(Number(/const COVER_PAGES = (\d+);/.exec(script)?.[1])).toBe(MAX_COVER_PAGES);
    expect(Number(/const CARD_PAGES = (\d+);/.exec(script)?.[1])).toBe(MAX_PAGES_PER_CARD);
  });
});

describe('the pack key', () => {
  it('is six hex digits, the same for the same pack and different when the pack differs', () => {
    const a = packKey({ cards: ['a', 'b'], variation: 'easier' });
    expect(a).toMatch(/^[0-9a-f]{6}$/);
    expect(packKey({ cards: ['a', 'b'], variation: 'easier' })).toBe(a);
    expect(packKey({ cards: ['b', 'a'], variation: 'easier' })).not.toBe(a);
    expect(packKey({ cards: ['a', 'b'], variation: 'seated' })).not.toBe(a);
  });
});

describe('the supply list (WEB-017)', () => {
  it('lists a shared item once', () => {
    const list = combineNeeds([[['glue-stick'], ['plain-paper']], [['glue-stick'], ['pencil']], [['plain-paper']]]);
    expect(list).toEqual([['plain-paper'], ['pencil'], ['glue-stick']]);
  });

  it('drops a choice that a smaller one already covers', () => {
    expect(combineNeeds([[['glue-stick', 'tape']], [['tape']]])).toEqual([['tape']]);
    expect(combineNeeds([[['glue-stick', 'tape']], [['glue-stick', 'tape']]])).toEqual([['glue-stick', 'tape']]);
  });

  it('keeps two choices that overlap but neither covers the other', () => {
    expect(combineNeeds([[['glue-stick', 'tape']], [['tape', 'stapler']]])).toHaveLength(2);
  });

  it('is the same whatever order the cards come in', () => {
    const one = [[['glue-stick', 'tape'], ['pencil']], [['tape'], ['scissors']]] as const;
    expect(combineNeeds(one)).toEqual(combineNeeds([one[1], one[0]]));
  });

  it('asks for nothing when the cards need nothing', () => {
    expect(combineNeeds([[], []])).toEqual([]);
    expect(combineNeeds([])).toEqual([]);
  });

  it('is met by exactly what meets every card, for any pack of real cards', () => {
    const ids = Object.keys(CARD_NEEDS);
    for (let start = 0; start + 4 <= ids.length; start += 5) {
      const pack = ids.slice(start, start + 8);
      const list = combineNeeds(pack.map((id) => CARD_NEEDS[id]!.needs));
      // Someone who has one item from every group on the list can make every card in the pack.
      const have = new Set(list.map((g) => g[0]!));
      for (const id of pack) expect(canMake(CARD_NEEDS[id]!.needs, have), `${id} in pack ${start}`).toBe(true);
    }
  });

  it('is never longer than the cards would list one by one', () => {
    const ids = Object.keys(CARD_NEEDS).slice(0, 8);
    const separate = ids.reduce((n, id) => n + CARD_NEEDS[id]!.needs.length, 0);
    expect(combineNeeds(ids.map((id) => CARD_NEEDS[id]!.needs)).length).toBeLessThanOrEqual(separate);
  });

  it('is met by exactly what meets every card, over many random packs and shelves', () => {
    // A seeded generator, so a failure is the same failure next time.
    let seed = 20261116;
    const rand = () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const ids = Object.keys(CARD_NEEDS);
    const tags = [...MATERIAL_TAG_BY_ID.keys()];
    let can = 0;
    let cannot = 0;
    for (let trial = 0; trial < 600; trial += 1) {
      const pack = Array.from({ length: 1 + Math.floor(rand() * MAX_CARDS) }, () => ids[Math.floor(rand() * ids.length)]!);
      const density = 0.2 + rand() * 0.75;
      const have = new Set(tags.filter(() => rand() < density));
      const everyCard = pack.every((id) => canMake(CARD_NEEDS[id]!.needs, have));
      const everyLine = combineNeeds(pack.map((id) => CARD_NEEDS[id]!.needs)).every((group) => group.some((t) => have.has(t)));
      expect(everyLine, `trial ${trial}: ${pack.join(', ')}`).toBe(everyCard);
      if (everyCard) can += 1;
      else cannot += 1;
    }
    // Both outcomes must occur, or the test proves nothing.
    expect(can).toBeGreaterThan(20);
    expect(cannot).toBeGreaterThan(20);
  });

  it('names extras only when no card needs them', () => {
    const extras = optionalExtras([
      { needs: [['pencil']], optional: ['ruler', 'pencil'] },
      { needs: [['ruler']], optional: ['tape'] },
    ]);
    expect(extras).toEqual(['tape']);
  });
});

describe('words for a printed list', () => {
  it('drops the examples in brackets from an item name', () => {
    expect(printLabel('plain-paper')).toBe('Plain paper');
    expect(printLabel('tape')).toBe('Tape');
    expect(printLabel('not-an-item')).toBe('not-an-item');
    for (const id of MATERIAL_TAG_BY_ID.keys()) expect(printLabel(id), id).not.toContain('(');
  });

  it('joins a group of choices with "or"', () => {
    expect(groupLabel(['glue-stick', 'tape'])).toBe('A glue stick or tape');
    expect(groupLabel(['pencil'])).toBe('Pencils');
  });
});

describe('what the builder keeps, sends and shows (WEB-017)', () => {
  const island = readFileSync(new URL('../tools/PackBuilder.tsx', import.meta.url), 'utf8');

  it('stores nothing and sends nothing: the pack is only in the address', () => {
    expect(island).not.toMatch(/sessionStorage|indexedDB|document\.cookie|sendBeacon|gtag|dataLayer|\btrack\(/);
    expect(island).not.toMatch(/\bfetch\(|XMLHttpRequest|WebSocket|new Image\(/);
    // It reads the activities saved on this device, to offer them as a start, and never writes that list or any other.
    expect(island).not.toMatch(/setItem|saveSaved|localStorage/);
  });

  it('writes the address once, with the string made from card names and a version', () => {
    expect(island.match(/history\.replaceState\(/g)).toHaveLength(1);
    expect(island).not.toMatch(/history\.pushState|location\.(?:assign|replace|hash)\b/);
    expect(island).toContain('serializePackState(state)');
  });

  it('claims nothing about all the cards that the cards do not each say', () => {
    // "Can stop after the first step" and "no right answer" are not written on every card; the stop wording the site
    // has reviewed (PAUSE_LINE) says a person may pause or stop whenever they want to, and the cover says only that.
    expect(island).not.toMatch(/Every activity|none has a right answer|after the first step/i);
    expect(island).toContain('Pause or stop whenever the person wants to.');
  });

  it('has no place to type, so nothing a person writes can reach the address or a printout', () => {
    expect(island).not.toMatch(/type="(?:text|search|email|tel|url|number|password)"|<textarea|contentEditable/i);
  });
});
