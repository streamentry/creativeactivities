/**
 * The lower-effort option beside a result set (WEB-004): one card with fewer
 * materials, less energy, less setup or less cost than the top result. Pure
 * functions, so the finder page (client) and the static fallback (build) agree.
 */

export interface EffortFacts {
  slug: string;
  energy: 'low' | 'medium';
  cost: 'free' | 'low' | 'some';
  /** How many everyday things the card lists. */
  materials: number;
  prepMinutes: number;
}

const ENERGY_RANK: Record<EffortFacts['energy'], number> = { low: 0, medium: 1 };
const COST_RANK: Record<EffortFacts['cost'], number> = { free: 0, low: 1, some: 2 };

/** Each dimension as a number where lower means less effort. */
function dimensions(card: EffortFacts): number[] {
  return [ENERGY_RANK[card.energy], COST_RANK[card.cost], card.materials, card.prepMinutes];
}

/**
 * The candidate that asks least of the visitor, as long as it is no heavier than
 * the top result on any dimension and strictly lighter on at least one. The top
 * card itself is never returned. On a tie the earlier card wins.
 */
export function lowerEffortPick<T extends EffortFacts>(top: EffortFacts, candidates: readonly T[]): T | undefined {
  const topDims = dimensions(top);
  let best: { card: T; dims: number[] } | undefined;
  for (const card of candidates) {
    if (card.slug === top.slug) continue;
    const dims = dimensions(card);
    const noHeavier = dims.every((value, i) => value <= topDims[i]);
    const someLighter = dims.some((value, i) => value < topDims[i]);
    if (!noHeavier || !someLighter) continue;
    if (!best || compare(dims, best.dims) < 0) best = { card, dims };
  }
  return best?.card;
}

function compare(a: readonly number[], b: readonly number[]): number {
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

/** What is lighter about the lower-effort card, in plain words. */
export function lowerEffortReasons(card: EffortFacts, top: EffortFacts): string[] {
  const reasons: string[] = [];
  if (ENERGY_RANK[card.energy] < ENERGY_RANK[top.energy]) reasons.push('less energy, mostly sitting still');
  if (card.materials < top.materials) reasons.push('fewer things to gather');
  if (COST_RANK[card.cost] < COST_RANK[top.cost]) reasons.push(card.cost === 'free' ? 'nothing to buy' : 'costs less');
  if (card.prepMinutes < top.prepMinutes) reasons.push(card.prepMinutes === 0 ? 'no setup' : 'less setup');
  return reasons;
}
