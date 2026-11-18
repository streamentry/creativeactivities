import { describe, expect, it } from 'vitest';
import { createRng } from './random';
import { SHADOW_IDS } from './shadow';
import { STORY_MAX, addPicture, buildChain, canTakeOff, isFull, removeLast, startChain } from './story-chain';

describe('Story chain (GAME-046)', () => {
  it('starts with one picture from the shared library', () => {
    const chain = startChain(createRng(1));
    expect(chain.pictures).toHaveLength(1);
    expect(SHADOW_IDS).toContain(chain.pictures[0]);
  });

  it('adds a picture at the end that is not already in the chain', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const rng = createRng(seed);
      let chain = startChain(rng);
      while (!isFull(chain)) {
        const next = addPicture(chain, rng);
        expect(next.pictures).toHaveLength(chain.pictures.length + 1);
        expect(next.pictures.slice(0, -1)).toEqual(chain.pictures);
        expect(chain.pictures).not.toContain(next.pictures.at(-1));
        chain = next;
      }
      expect(new Set(chain.pictures).size).toBe(chain.pictures.length);
    }
  });

  it('stops growing at eight pictures', () => {
    const rng = createRng(7);
    const full = buildChain(rng, 20);
    expect(full.pictures).toHaveLength(STORY_MAX);
    expect(STORY_MAX).toBe(8);
    expect(isFull(full)).toBe(true);
    expect(addPicture(full, rng)).toBe(full);
  });

  it('leaves the chain as it is when the pool has nothing new', () => {
    const chain = startChain(createRng(3), undefined, ['a', 'b']);
    const two = addPicture(chain, createRng(3), ['a', 'b']);
    expect(two.pictures).toHaveLength(2);
    expect(addPicture(two, createRng(3), ['a', 'b'])).toBe(two);
  });

  it('takes the last picture off, and never the first', () => {
    const chain = buildChain(createRng(5), 3);
    expect(canTakeOff(chain)).toBe(true);
    const shorter = removeLast(chain);
    expect(shorter.pictures).toEqual(chain.pictures.slice(0, 2));
    const one = removeLast(shorter);
    expect(one.pictures).toEqual(chain.pictures.slice(0, 1));
    expect(canTakeOff(one)).toBe(false);
    expect(removeLast(one)).toBe(one);
  });

  it('does not change the chain it was given', () => {
    const chain = buildChain(createRng(9), 4);
    const copy = [...chain.pictures];
    addPicture(chain, createRng(9));
    removeLast(chain);
    expect(chain.pictures).toEqual(copy);
  });

  it('a new chain does not start with the previous first picture', () => {
    for (let seed = 1; seed <= 60; seed++) {
      const previous = buildChain(createRng(seed), 5);
      const next = startChain(createRng(seed + 1000), previous);
      expect(next.pictures[0]).not.toBe(previous.pictures[0]);
    }
  });

  it('is the same for the same seed and different for another', () => {
    expect(buildChain(createRng(11))).toEqual(buildChain(createRng(11)));
    expect(buildChain(createRng(11))).not.toEqual(buildChain(createRng(12)));
  });
});
