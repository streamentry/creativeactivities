import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { matchCards } from '../lib/what-i-have';
import { splitFrontmatter } from '../lib/yaml-subset';
import { CARD_NEEDS } from './card-needs';
import { MATERIAL_GROUP_IDS, MATERIAL_TAGS, MATERIAL_TAG_BY_ID, tagsByGroup } from './materials';

/**
 * WEB-006: the card records and the controlled list stay true to each card's own materials list.
 *
 * Every line of every card's materials is read against a plain-words hint for each item. Both ways are
 * checked: a line that names an item must be recorded (as needed or optional), and a recorded item must be
 * named somewhere in the card. A line that names nothing must be one of the few that are not asked about.
 */
const CARD_DIR = new URL('../content/activity-cards/', import.meta.url);

interface CardFile {
  readonly id: string;
  readonly lines: readonly string[];
}

const cards: CardFile[] = readdirSync(CARD_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const { frontmatter } = splitFrontmatter(readFileSync(new URL(f, CARD_DIR), 'utf8'));
    const lines = (frontmatter.materials as string[]).map((l) => l.toLowerCase());
    return { id: f.replace(/\.md$/, ''), lines };
  });

/** Plain words that show a line names an item. Lowercase. Used only here, to keep the records honest. */
const HINTS: Readonly<Record<string, RegExp>> = {
  'plain-paper': /plain paper|printer paper|copy paper|thin paper|tracing paper|notepaper|lined paper|sheets? of paper|piece of paper|paper in a folder/,
  'thick-card':
    /thick (?:paper|card)|sheet of card\b|poster board|index card\b|small card\b|piece of card\b|postcard-sized|thin card\b|watercolou?r paper/,
  cardboard: /sturdy cardboard/,
  box: /shoebox|small cardboard box|box with a lid/,
  'colored-paper': /(?<!dark blue )construction paper|colou?red paper|colou?red tape, paper|scrap paper in/,
  'dark-paper': /black or dark blue/,
  'wrapping-paper': /wrapping paper|wallpaper/,
  'tissue-paper': /tissue paper/,
  newspaper: /newspaper/,
  magazines: /magazine|catalogs?|calendars/,
  'old-cards': /postcards?|picture cards|old cards|greeting cards/,
  envelope: /envelopes?/,
  notebook: /notebook|binder/,
  'paper-towels': /paper towels|tissues/,
  pencil: /(?<!colou?red )\bpencils?\b/,
  'pen-marker': /\bpens?\b|\bmarkers?\b|felt-tip/,
  crayons: /crayons?/,
  'colored-pencils': /colou?red pencils?/,
  paint: /\bpaint\b(?! sample)|poster paint|acrylic|washable ink/,
  brush: /brush/,
  'watercolor-set': /watercolou?r set/,
  'oil-pastels': /oil pastels?/,
  sponge: /sponges?/,
  'cotton-swabs': /cotton swabs?/,
  ruler: /\bruler\b/,
  scissors: /scissors|pruners|paper trimmer/,
  'glue-stick': /glue stick/,
  'craft-glue': /craft glue|white glue|glue dot/,
  tape: /\btape\b/,
  stapler: /stapler/,
  'contact-film': /contact film|self-adhesive film/,
  yarn: /\byarn\b|embroidery thread/,
  'string-ribbon': /\bstring\b|twine|ribbon/,
  fabric: /fabric|\bfelt\b(?!-tip)|clean cloth|soft cloth|scarf|corduroy|textured scraps/,
  towels: /(?<!paper )towels?\b|old cloth/,
  'plastic-cloth': /plastic tablecloth|plastic cloth|oilcloth/,
  'bowls-plates': /\bbowls?\b|\bplates?\b|saucers\b|muffin tin|small dishes|\bdishes\b|basin/,
  'cups-jars': /\bcups?\b|\bjars?\b|\bmugs?\b|\bvase\b|glass of water/,
  spoon: /\bspoons?\b|teaspoon|trowel|blunt knife/,
  'tray-board': /\btrays?\b|clipboard|flat board|firm board|(?<!poster )\bboard\b/,
  'wet-wipes': /wet wipes|baby wipes|damp cloth/,
  'plastic-bottle': /plastic bottle/,
  'dried-rice': /dried rice/,
  'hand-cream': /hand cream|lotion/,
  spread: /vegetable shortening|peanut butter/,
  'heavy-book': /heavy book|more books|\bbrick\b/,
  'small-gift': /unbreakable gift/,
  leaves: /\bleaves\b/,
  flowers: /\bflowers\b|leafy stems|pressed flower/,
  'pine-cone': /pine cone/,
  birdseed: /birdseed/,
  stones: /\bstones?\b/,
  'plant-pot': /plant pot/,
  'potting-soil': /potting (?:mix|soil)/,
  seeds: /\bseeds\b/,
  'plant-or-bulb': /small plant, herb or bulb/,
  lavender: /lavender/,
  photos: /\bphotos?\b|photo album|copies of old/,
  'music-device': /\bphone\b|radio|music player|tablet|\bplayer\b|music service/,
  buttons: /\bbuttons?\b/,
  clay: /air-dry clay/,
  beads: /\bbeads?\b/,
  'elastic-cord': /elastic (?:bead )?cord/,
  straw: /drinking straw|\bstraw\b/,
  keyring: /key ?ring/,
};

/**
 * Lines that are not asked about, written out so none slips by: furniture, tap water, comforts and extras a
 * card calls optional, and "something around the house" lines. A line here is read by no hint.
 */
const NOT_ASKED: readonly RegExp[] = [
  /^one simple object/,
  /^a few household textures/,
  /^a comfortable (?:chair|seat)/,
  /^a sturdy chair/,
  /^a chair with arms/,
  /^clear floor space/,
  /^a flat, clear table/,
  /^a large flat table/,
  /^a laundry basket or cupboard/,
  /^water in a jug/,
  /^a small basket or bag/,
  /^a short list of three or four pieces of music/,
  /^three or four short tunes/,
  /^reading glasses/,
  /^binoculars/,
  /^a blanket or shawl/,
  /^a speaker/,
  /^headphones/,
  /^a small hand drum/,
  /^printed lyrics/,
  /^old record sleeves/,
  /^old recipe cards/,
  /^gardening gloves/,
  /^a water-based outdoor varnish/,
  /^a soft eraser/,
];

const notAsked = (line: string) => NOT_ASKED.some((p) => p.test(line));
const hits = (line: string) => MATERIAL_TAGS.filter((t) => HINTS[t.id]?.test(line)).map((t) => t.id);

describe('the controlled list of items', () => {
  it('gives every item a unique id, a plain label and a group', () => {
    const ids = MATERIAL_TAGS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const tag of MATERIAL_TAGS) {
      expect(tag.id, tag.id).toMatch(/^[a-z]+(?:-[a-z]+)*$/);
      expect(tag.label.length, tag.id).toBeGreaterThan(3);
      expect(MATERIAL_GROUP_IDS, tag.id).toContain(tag.group);
    }
  });

  it('has a hint for every item, and none for an item that does not exist', () => {
    for (const tag of MATERIAL_TAGS) expect(HINTS[tag.id], tag.id).toBeInstanceOf(RegExp);
    for (const id of Object.keys(HINTS)) expect(MATERIAL_TAG_BY_ID.has(id), id).toBe(true);
  });

  it('lists every group at least once, with items in it', () => {
    for (const group of tagsByGroup()) expect(group.tags.length, group.id).toBeGreaterThan(0);
    expect(tagsByGroup().flatMap((g) => g.tags).length).toBe(MATERIAL_TAGS.length);
  });

  it('uses every item in at least one card, so none is asked about for nothing', () => {
    const used = new Set(Object.values(CARD_NEEDS).flatMap((c) => [...c.needs.flat(), ...(c.optional ?? [])]));
    expect(MATERIAL_TAGS.map((t) => t.id).filter((id) => !used.has(id))).toEqual([]);
  });

  it('keeps labels free of brand names and prices', () => {
    for (const tag of MATERIAL_TAGS) expect(tag.label, tag.id).not.toMatch(/[$£€]|\bbrand\b/i);
  });
});

describe('the card records', () => {
  it('has a record for every card and no record for a card that does not exist', () => {
    const ids = cards.map((c) => c.id).sort();
    expect(Object.keys(CARD_NEEDS).sort()).toEqual(ids);
  });

  it('names only items that exist, once per group, and never an empty group', () => {
    for (const [id, card] of Object.entries(CARD_NEEDS)) {
      for (const group of card.needs) {
        expect(group.length, `${id}: empty group`).toBeGreaterThan(0);
        expect(new Set(group).size, `${id}: repeated item in a group`).toBe(group.length);
        for (const tag of group) expect(MATERIAL_TAG_BY_ID.has(tag), `${id}: unknown item ${tag}`).toBe(true);
      }
      for (const tag of card.optional ?? []) expect(MATERIAL_TAG_BY_ID.has(tag), `${id}: unknown optional ${tag}`).toBe(true);
    }
  });

  it('never lists the same item as both needed and optional', () => {
    for (const [id, card] of Object.entries(CARD_NEEDS)) {
      const needed = new Set(card.needs.flat());
      for (const tag of card.optional ?? []) expect(needed.has(tag), `${id}: ${tag} is needed and optional`).toBe(false);
    }
  });
});

describe('each card record matches the card\'s own materials list', () => {
  for (const card of cards) {
    const record = CARD_NEEDS[card.id];
    if (!record) continue;
    const recorded = new Set([...record.needs.flat(), ...(record.optional ?? [])]);
    const asked = card.lines.filter((line) => !notAsked(line));

    it(`${card.id}: every item a line names is recorded`, () => {
      const missing = asked.flatMap((line) => hits(line).filter((t) => !recorded.has(t)).map((t) => `${t} <- "${line}"`));
      expect(missing).toEqual([]);
    });

    it(`${card.id}: every needed group and optional item is named in the list`, () => {
      const named = new Set(asked.flatMap(hits));
      const unnamed = record.needs.filter((group) => !group.some((t) => named.has(t))).map((g) => g.join(' | '));
      expect(unnamed, 'a needed group no line names').toEqual([]);
      expect((record.optional ?? []).filter((t) => !named.has(t)), 'an optional item no line names').toEqual([]);
    });

    it(`${card.id}: every line names an item or is one that is not asked about`, () => {
      expect(asked.filter((line) => hits(line).length === 0)).toEqual([]);
    });
  }
});

describe('what a typical set of household items reaches', () => {
  // The editors' picture of a plain household stash, not a claim about any person. A reviewer confirms it.
  const TYPICAL = [
    'plain-paper', 'newspaper', 'pencil', 'pen-marker', 'crayons', 'colored-pencils', 'scissors', 'glue-stick', 'tape',
    'bowls-plates', 'cups-jars', 'spoon', 'towels', 'paper-towels', 'tray-board', 'string-ribbon', 'fabric',
    'photos', 'music-device', 'magazines', 'envelope', 'old-cards', 'wet-wipes',
  ];
  const all = Object.entries(CARD_NEEDS).map(([id, c]) => ({ id, needs: c.needs }));

  it('reaches at least twenty cards (WEB-006 proposal)', () => {
    expect(matchCards(all, new Set(TYPICAL)).ready.length).toBeGreaterThanOrEqual(20);
  });

  it('reaches no card that needs something outside that set', () => {
    const have = new Set(TYPICAL);
    for (const id of matchCards(all, have).ready) {
      for (const group of CARD_NEEDS[id]?.needs ?? []) expect(group.some((t) => have.has(t)), id).toBe(true);
    }
  });

  it('reaches only the cards that need nothing when nothing is ticked', () => {
    const ready = matchCards(all, new Set()).ready;
    expect([...ready].sort()).toEqual(all.filter((c) => c.needs.length === 0).map((c) => c.id).sort());
    expect(ready.length).toBeGreaterThan(0);
  });
});
