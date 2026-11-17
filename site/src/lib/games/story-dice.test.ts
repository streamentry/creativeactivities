import { describe, expect, it } from 'vitest';
import { PICTURE_BY_ID } from '../../data/pictures';
import { createRng } from './random';
import { DICE_COUNTS, DICE_POOL, resizeDice, rollDice } from './story-dice';

describe('story dice', () => {
  it('uses only pictures in the library, each once', () => {
    expect(new Set(DICE_POOL).size).toBe(DICE_POOL.length);
    for (const id of DICE_POOL) expect(PICTURE_BY_ID.has(id), id).toBe(true);
    expect(DICE_POOL.length).toBeGreaterThan(20);
  });

  it('rolls three or four different pictures', () => {
    for (const count of DICE_COUNTS) {
      for (let seed = 1; seed <= 50; seed++) {
        const roll = rollDice(count, createRng(seed));
        expect(roll.pictures).toHaveLength(count);
        expect(new Set(roll.pictures).size).toBe(count);
      }
    }
  });

  it('is the same for the same seed', () => {
    expect(rollDice(4, createRng(7))).toEqual(rollDice(4, createRng(7)));
  });

  it('shows new pictures on every Roll again', () => {
    for (const count of DICE_COUNTS) {
      const rng = createRng(11);
      let roll = rollDice(count, rng);
      for (let i = 0; i < 100; i++) {
        const next = rollDice(count, rng, roll);
        expect(next.pictures.filter((id) => roll.pictures.includes(id))).toEqual([]);
        roll = next;
      }
    }
  });

  it('still rolls a full set from a small pool, avoiding repeats where it can', () => {
    const pool = ['apple', 'pear', 'bus', 'dog', 'cat'];
    const first = rollDice(4, createRng(3), undefined, pool);
    const next = rollDice(4, createRng(4), first, pool);
    expect(new Set(next.pictures).size).toBe(4);
    const left = pool.find((id) => !first.pictures.includes(id)) as string;
    expect(next.pictures).toContain(left);
  });

  it('keeps the dice in place when the count changes', () => {
    const roll = rollDice(4, createRng(5));
    expect(resizeDice(roll, 3, createRng(1)).pictures).toEqual(roll.pictures.slice(0, 3));
    const three = rollDice(3, createRng(6));
    const four = resizeDice(three, 4, createRng(2));
    expect(four.pictures.slice(0, 3)).toEqual(three.pictures);
    expect(new Set(four.pictures).size).toBe(4);
  });
});
