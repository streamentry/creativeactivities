import { describe, expect, it } from 'vitest';
import { PICNIC_FOOD, PICNIC_ITEMS, PICNIC_OUTINGS } from '../../data/picnic-planner';
import {
  MIN_TO_PLAY,
  SLOTS,
  addToBasket,
  canPlay,
  emptyBasket,
  itemOf,
  joinList,
  newPicnic,
  pairValues,
  summaryList,
  takeOut,
  type Picnic,
} from './picnic-planner';

function withBasket(...ids: string[]): Picnic {
  return { basket: ids };
}

describe('picnic planner data', () => {
  it('offers 11 food pictures and 6 things to do', () => {
    expect(PICNIC_FOOD).toHaveLength(11);
    expect(PICNIC_OUTINGS).toHaveLength(6);
    expect(PICNIC_ITEMS).toHaveLength(17);
  });

  it('gives every item a different id and a non-empty English phrase', () => {
    expect(new Set(PICNIC_ITEMS.map((i) => i.id)).size).toBe(PICNIC_ITEMS.length);
    for (const item of PICNIC_ITEMS) expect(item.phrase.trim().length, item.id).toBeGreaterThan(0);
  });

  it('uses the plural for food and an article for things to do, as the summary reads', () => {
    expect(itemOf('apple')?.phrase).toBe('apples');
    expect(itemOf('kite')?.phrase).toBe('a kite');
    for (const item of PICNIC_FOOD) expect(item.phrase.startsWith('a ') || item.phrase.startsWith('an '), item.id).toBe(false);
    for (const item of PICNIC_OUTINGS) expect(item.phrase, item.id).toMatch(/^an? /);
  });

  it('allows up to six things and two to play', () => {
    expect(SLOTS).toBe(6);
    expect(MIN_TO_PLAY).toBe(2);
  });
});

describe('adding to the basket', () => {
  it('adds a tray picture to an empty basket, in order', () => {
    const first = addToBasket(newPicnic(), 'bread');
    expect(first.outcome).toBe('added');
    expect(first.picnic.basket).toEqual(['bread']);
    const second = addToBasket(first.picnic, 'kite');
    expect(second.picnic.basket).toEqual(['bread', 'kite']);
  });

  it('does not add the same picture twice', () => {
    const result = addToBasket(withBasket('bread'), 'bread');
    expect(result.outcome).toBe('present');
    expect(result.picnic.basket).toEqual(['bread']);
  });

  it('holds at most six things and refuses a seventh', () => {
    const full = withBasket('bread', 'cheese', 'apple', 'grapes', 'banana', 'pear');
    const result = addToBasket(full, 'kite');
    expect(result.outcome).toBe('full');
    expect(result.picnic).toBe(full);
    expect(result.picnic.basket).toHaveLength(SLOTS);
  });

  it('refuses a picture that is not in either tray', () => {
    const start = withBasket('bread');
    const result = addToBasket(start, 'not-in-tray');
    expect(result.outcome).toBe('outside');
    expect(result.picnic).toBe(start);
  });

  it('never mutates the basket it was given', () => {
    const start = withBasket('bread');
    addToBasket(start, 'kite');
    expect(start.basket).toEqual(['bread']);
  });
});

describe('taking out of the basket', () => {
  it('takes a picture out, and keeps the others in order', () => {
    const result = takeOut(withBasket('bread', 'kite', 'pear'), 'kite');
    expect(result.outcome).toBe('removed');
    expect(result.picnic.basket).toEqual(['bread', 'pear']);
  });

  it('leaves the basket as it is when the picture is not there', () => {
    const start = withBasket('bread');
    const result = takeOut(start, 'kite');
    expect(result.outcome).toBe('absent');
    expect(result.picnic).toBe(start);
  });

  it('frees a slot, so a seventh thing fits after one comes out', () => {
    const full = withBasket('bread', 'cheese', 'apple', 'grapes', 'banana', 'pear');
    const freed = takeOut(full, 'bread').picnic;
    expect(addToBasket(freed, 'kite').outcome).toBe('added');
  });
});

describe('emptying and playing', () => {
  it('empties a basket with things in it', () => {
    expect(emptyBasket(withBasket('bread', 'kite')).basket).toEqual([]);
  });

  it('returns an empty basket as it is', () => {
    const empty = newPicnic();
    expect(emptyBasket(empty)).toBe(empty);
  });

  it('needs at least two things to play', () => {
    expect(canPlay(newPicnic())).toBe(false);
    expect(canPlay(withBasket('bread'))).toBe(false);
    expect(canPlay(withBasket('bread', 'kite'))).toBe(true);
  });

  it('pairs each chosen picture with itself, in basket order', () => {
    expect(pairValues(withBasket('kite', 'bread'))).toEqual(['kite', 'bread']);
    expect(pairValues(newPicnic())).toEqual([]);
  });
});

describe('the summary sentence', () => {
  it('joins the chosen things in words, with "and" before the last one', () => {
    const picnic = withBasket('bread', 'cheese', 'apple', 'kite');
    expect(summaryList(picnic, 'and')).toBe('bread, cheese, apples and a kite');
  });

  it('names a single thing without a list separator', () => {
    expect(summaryList(withBasket('kite'), 'and')).toBe('a kite');
    expect(summaryList(withBasket('apple'), 'and')).toBe('apples');
  });

  it('is an empty string for an empty basket', () => {
    expect(summaryList(newPicnic(), 'and')).toBe('');
  });

  it('joins two things with the word and, and no comma', () => {
    expect(joinList(['bread', 'a kite'], 'and')).toBe('bread and a kite');
  });

  it('skips an id that is not in the trays rather than printing it', () => {
    expect(summaryList(withBasket('bread', 'not-in-tray'), 'and')).toBe('bread');
  });
});
