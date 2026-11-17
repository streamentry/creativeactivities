import { sample, type Rng } from './random';
import { TOGETHER_THEMES } from './together';
import { SHADOW_IDS } from './shadow';

/**
 * Story dice (GAME-025): three or four picture "dice" are shown and the
 * players tell a story using them, in any order. There is no right answer,
 * so nothing here scores, checks or ends anything; it only picks pictures.
 *
 * The pool is everyday, culturally wide pictures from the shared library:
 * Four together's themes plus a few objects and places from the shadow set.
 * Nothing in it needs one culture's knowledge to read.
 */

/** Dice counts a person can choose; three is the simplest. */
export const DICE_COUNTS = [3, 4] as const;

const EXTRA_IDS = ['house', 'lamp', 'key', 'umbrella', 'tree', 'moon', 'lighthouse', 'balloon', 'armchair', 'butterfly', 'potted-plant', 'watering-can'];

/** Every picture a die can show, each once. */
export const DICE_POOL: readonly string[] = [
  ...new Set([...TOGETHER_THEMES.flatMap((t) => t.pictures), ...EXTRA_IDS.filter((id) => SHADOW_IDS.includes(id))]),
];

export interface DiceRoll {
  /** The pictures on the dice, all different, in the order shown. */
  pictures: string[];
}

/**
 * A roll of [count] different pictures (3 or 4). When there are enough other
 * pictures, none from the [previous] roll is shown again, so Roll again always
 * looks new; otherwise it avoids as many as it can.
 */
export function rollDice(count: number, rng: Rng, previous?: DiceRoll, pool: readonly string[] = DICE_POOL): DiceRoll {
  const size = Math.max(1, Math.min(count, pool.length));
  const used = new Set(previous?.pictures ?? []);
  const fresh = pool.filter((id) => !used.has(id));
  if (fresh.length >= size) return { pictures: sample(fresh, size, rng) };
  const rest = sample(pool.filter((id) => used.has(id)), size - fresh.length, rng);
  return { pictures: [...sample(fresh, fresh.length, rng), ...rest] };
}

/**
 * The same roll with a different number of dice: dice are kept in place, a
 * fourth die is added or the last one is taken away, so the story so far stays.
 */
export function resizeDice(roll: DiceRoll, count: number, rng: Rng, pool: readonly string[] = DICE_POOL): DiceRoll {
  if (count <= roll.pictures.length) return { pictures: roll.pictures.slice(0, count) };
  const used = new Set(roll.pictures);
  const extra = sample(pool.filter((id) => !used.has(id)), count - roll.pictures.length, rng);
  return { pictures: [...roll.pictures, ...extra] };
}
