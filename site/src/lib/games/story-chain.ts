import { SHADOW_IDS } from './shadow';
import { sample, type Rng } from './random';

/**
 * Story chain (GAME-046): a growing row of pictures. Each person says one
 * sentence about the chain so far, aloud, then the next picture is added.
 * Nothing is typed or recorded, there is no right answer and nothing is
 * counted. The chain stops growing at eight pictures.
 *
 * Pictures come from the same recognisable set the shadow game uses, and a
 * picture never appears twice in one chain.
 */

/** The most pictures a chain holds. */
export const STORY_MAX = 8;

export interface StoryChain {
  /** Picture ids in the order they were added; all different, at least one, at most STORY_MAX. */
  readonly pictures: readonly string[];
}

/** A new chain of one picture. The previous chain's first picture is not used first again, when another is available. */
export function startChain(rng: Rng, previous?: StoryChain, pool: readonly string[] = SHADOW_IDS): StoryChain {
  if (pool.length === 0) throw new Error('Story chain needs at least one picture.');
  const avoid = previous?.pictures[0];
  const fresh = pool.filter((id) => id !== avoid);
  return { pictures: sample(fresh.length > 0 ? fresh : pool, 1, rng) };
}

export function isFull(chain: StoryChain): boolean {
  return chain.pictures.length >= STORY_MAX;
}

/**
 * The chain with one more picture at the end, different from every picture
 * already in it. A full chain, or a pool with nothing new, is returned as it is.
 */
export function addPicture(chain: StoryChain, rng: Rng, pool: readonly string[] = SHADOW_IDS): StoryChain {
  if (isFull(chain)) return chain;
  const unused = pool.filter((id) => !chain.pictures.includes(id));
  if (unused.length === 0) return chain;
  return { pictures: [...chain.pictures, sample(unused, 1, rng)[0] as string] };
}

/** Whether "Take the last one off" does anything: a chain always keeps its first picture. */
export function canTakeOff(chain: StoryChain): boolean {
  return chain.pictures.length > 1;
}

/** The chain without its last picture. A chain of one is returned as it is. */
export function removeLast(chain: StoryChain): StoryChain {
  return canTakeOff(chain) ? { pictures: chain.pictures.slice(0, -1) } : chain;
}

/** A whole chain of `length` pictures from one seed, for the paper version and tests. */
export function buildChain(rng: Rng, length: number = STORY_MAX, pool: readonly string[] = SHADOW_IDS): StoryChain {
  let chain = startChain(rng, undefined, pool);
  while (chain.pictures.length < Math.min(length, STORY_MAX)) {
    const next = addPicture(chain, rng, pool);
    if (next === chain) break;
    chain = next;
  }
  return chain;
}
