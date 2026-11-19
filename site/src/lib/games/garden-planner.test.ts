import { describe, expect, it } from 'vitest';
import { BEDS, GARDEN_EXTRAS, GARDEN_ITEMS, PLANTS } from '../../data/garden-planner';
import {
  countPhrase,
  choosePicture,
  joinList,
  newGarden,
  putBack,
  startAgain,
  summaryList,
  tally,
  tapBed,
  type Garden,
} from './garden-planner';

const sunflower = 'sunflower';
const rose = 'rose';
const tree = 'tree';

function planted(beds: Record<number, string>): Garden {
  const garden = newGarden();
  return { ...garden, beds: garden.beds.map((_, i) => beds[i] ?? null) };
}

describe('garden planner data', () => {
  it('has twelve beds, nine plants and two garden extras', () => {
    expect(BEDS).toBe(12);
    expect(PLANTS).toHaveLength(9);
    expect(GARDEN_EXTRAS.map((i) => i.id)).toEqual(['watering-can', 'birdhouse']);
    expect(GARDEN_ITEMS).toHaveLength(11);
  });

  it('gives every item a singular and a plural name', () => {
    for (const item of GARDEN_ITEMS) {
      expect(item.one.length, item.id).toBeGreaterThan(0);
      expect(item.many.length, item.id).toBeGreaterThan(0);
      expect(item.many, item.id).not.toBe(item.one);
    }
  });
});

describe('choosing a picture', () => {
  it('chooses a picture in the tray, then puts the choice down when it is tapped again', () => {
    const first = choosePicture(newGarden(), sunflower);
    expect(first.outcome).toBe('chosen');
    expect(first.garden.chosen).toBe(sunflower);
    const second = choosePicture(first.garden, sunflower);
    expect(second.outcome).toBe('unchosen');
    expect(second.garden.chosen).toBeNull();
  });

  it('switches the choice to another picture without planting anything', () => {
    const next = choosePicture(choosePicture(newGarden(), sunflower).garden, rose);
    expect(next.garden.chosen).toBe(rose);
    expect(next.garden.beds.every((b) => b === null)).toBe(true);
  });

  it('refuses a picture that is not in the tray', () => {
    const result = choosePicture(newGarden(), 'not-in-tray');
    expect(result.outcome).toBe('outside');
    expect(result.garden).toEqual(newGarden());
  });
});

describe('tapping a bed', () => {
  it('plants the chosen picture in an empty bed and puts the choice down', () => {
    const chosen = choosePicture(newGarden(), sunflower).garden;
    const result = tapBed(chosen, 4);
    expect(result.outcome).toBe('planted');
    expect(result.garden.beds[4]).toBe(sunflower);
    expect(result.garden.chosen).toBeNull();
  });

  it('replaces the picture in a planted bed when another picture is chosen', () => {
    const chosen = choosePicture(planted({ 2: sunflower }), rose).garden;
    const result = tapBed(chosen, 2);
    expect(result.outcome).toBe('replaced');
    expect(result.garden.beds[2]).toBe(rose);
  });

  it('plants the same picture again without changing anything else', () => {
    const chosen = choosePicture(planted({ 2: sunflower }), sunflower).garden;
    const result = tapBed(chosen, 2);
    expect(result.outcome).toBe('planted');
    expect(result.garden.beds[2]).toBe(sunflower);
  });

  it('asks for a picture first when an empty bed is tapped with nothing chosen', () => {
    const garden = newGarden();
    const result = tapBed(garden, 0);
    expect(result.outcome).toBe('needPicture');
    expect(result.garden).toBe(garden);
  });

  it('clears a planted bed when it is tapped with nothing chosen, and keeps a step to put it back', () => {
    const garden = planted({ 3: tree });
    const result = tapBed(garden, 3);
    expect(result.outcome).toBe('cleared');
    expect(result.garden.beds[3]).toBeNull();
    expect(putBack(result.garden).beds[3]).toBe(tree);
  });

  it('refuses a bed number outside the twelve', () => {
    expect(tapBed(newGarden(), -1).outcome).toBe('outside');
    expect(tapBed(newGarden(), BEDS).outcome).toBe('outside');
    expect(tapBed(newGarden(), 1.5).outcome).toBe('outside');
  });
});

describe('start again and put it back', () => {
  it('empties every bed, and put it back restores them', () => {
    const garden = planted({ 0: sunflower, 5: rose, 11: tree });
    const cleared = startAgain(garden);
    expect(cleared.beds.every((b) => b === null)).toBe(true);
    expect(putBack(cleared).beds).toEqual(garden.beds);
  });

  it('leaves an empty garden as it is, so there is nothing to put back', () => {
    const garden = newGarden();
    expect(startAgain(garden)).toBe(garden);
    expect(putBack(garden)).toBe(garden);
  });

  it('keeps only one step: a second start again replaces the first', () => {
    const once = startAgain(planted({ 0: sunflower }));
    const twice = startAgain(planted({ 1: rose }));
    expect(putBack(twice).beds[1]).toBe(rose);
    expect(putBack(twice).beds[0]).toBeNull();
    expect(putBack(once).beds[0]).toBe(sunflower);
  });
});

describe('the summary in words', () => {
  it('counts each picture and names it in the plural when there is more than one', () => {
    const garden = planted({ 0: sunflower, 1: sunflower, 2: sunflower, 3: rose, 4: rose, 5: tree });
    expect(summaryList(garden, 'and')).toBe('3 sunflowers, 2 roses and 1 tree');
  });

  it('uses the singular for one of anything', () => {
    expect(summaryList(planted({ 0: tree }), 'and')).toBe('1 tree');
    expect(countPhrase(1, { id: 'daisies', one: 'daisy', many: 'daisies' })).toBe('1 daisy');
  });

  it('uses the plural names for the garden extras and irregular plurals', () => {
    expect(summaryList(planted({ 0: 'birdhouse', 1: 'birdhouse', 2: 'cactus', 3: 'cactus' }), 'and')).toBe(
      '2 cacti and 2 birdhouses',
    );
    expect(countPhrase(2, { id: 'strawberry', one: 'strawberry', many: 'strawberries' })).toBe('2 strawberries');
  });

  it('is an empty string when no bed is planted', () => {
    expect(summaryList(newGarden(), 'and')).toBe('');
  });

  it('gives a full plot no special wording: it is the same plain count', () => {
    const full = planted(Object.fromEntries(Array.from({ length: BEDS }, (_, i) => [i, sunflower])));
    expect(summaryList(full, 'and')).toBe('12 sunflowers');
  });

  it('tallies only the pictures that are in a bed, in tray order', () => {
    const rows = tally(planted({ 0: tree, 1: sunflower }));
    expect(rows.map((r) => [r.item.id, r.count])).toEqual([
      ['sunflower', 1],
      ['tree', 1],
    ]);
  });

  it('joins a list in English without a comma before "and"', () => {
    expect(joinList([], 'and')).toBe('');
    expect(joinList(['a'], 'and')).toBe('a');
    expect(joinList(['a', 'b'], 'and')).toBe('a and b');
    expect(joinList(['a', 'b', 'c'], 'and')).toBe('a, b and c');
  });
});
