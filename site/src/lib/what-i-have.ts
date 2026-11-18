/**
 * WEB-006 "What I have": which activity cards can be made from the items a person ticked.
 *
 * A card is ready when every group in its needs is met by at least one ticked item. A result never needs an
 * item that was not ticked. A card that is one group short is listed apart, with the missing choice named,
 * so it is never mistaken for a result.
 *
 * The ticked list stays in this browser only (data inventory: `ca-what-i-have-v1`) and can be cleared.
 */
import { MATERIAL_TAGS, MATERIAL_TAG_BY_ID } from '../data/materials';

export const STORAGE_KEY = 'ca-what-i-have-v1';

export type Needs = readonly (readonly string[])[];

/** The groups no ticked item meets, each as its list of choices. */
export function unmetGroups(needs: Needs, have: ReadonlySet<string>): string[][] {
  return needs.filter((group) => !group.some((tag) => have.has(tag))).map((group) => [...group]);
}

/** True when every group is met. A card that needs nothing is always ready. */
export function canMake(needs: Needs, have: ReadonlySet<string>): boolean {
  return unmetGroups(needs, have).length === 0;
}

export interface MatchableCard {
  readonly id: string;
  readonly needs: Needs;
}

export interface OneAway {
  readonly id: string;
  /** The choices that would meet the one group still missing. */
  readonly missing: readonly string[];
}

export interface Matches {
  /** Cards that can be made now, in the order given. */
  readonly ready: readonly string[];
  /** Cards one group short, in the order given. */
  readonly oneAway: readonly OneAway[];
}

export function matchCards(cards: readonly MatchableCard[], have: ReadonlySet<string>): Matches {
  const ready: string[] = [];
  const oneAway: OneAway[] = [];
  for (const card of cards) {
    const unmet = unmetGroups(card.needs, have);
    if (unmet.length === 0) ready.push(card.id);
    else if (unmet.length === 1) oneAway.push({ id: card.id, missing: unmet[0] as string[] });
  }
  return { ready, oneAway };
}

/** The labels of a group of choices, joined in plain words: "A glue stick or Tape (sticky...)". */
export function choiceLabels(choices: readonly string[]): string[] {
  return choices.map((id) => MATERIAL_TAG_BY_ID.get(id)?.label ?? id);
}

/**
 * Items that, ticked next, would turn the most one-away cards into ready ones, most first. Ties keep the
 * order of the vocabulary so the list never shuffles.
 */
export function unlockers(oneAway: readonly OneAway[], have: ReadonlySet<string>): { id: string; unlocks: number }[] {
  const counts = new Map<string, number>();
  for (const card of oneAway) {
    for (const tag of card.missing) if (!have.has(tag)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  const order = new Map(MATERIAL_TAGS.map((t, i) => [t.id, i]));
  return [...counts]
    .map(([id, unlocks]) => ({ id, unlocks }))
    .sort((a, b) => b.unlocks - a.unlocks || (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

// ---- Keeping the list on the device ----

type ReadStorage = Pick<Storage, 'getItem'>;
type WriteStorage = Pick<Storage, 'setItem'>;

/** The ticked items from stored text: known items only, once each, in the order of the vocabulary. Anything else reads as none. */
export function parseHave(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    const wanted = new Set(data.filter((x): x is string => typeof x === 'string'));
    return MATERIAL_TAGS.filter((t) => wanted.has(t.id)).map((t) => t.id);
  } catch {
    return [];
  }
}

/** Private windows and blocked site data throw on access; treat both as empty. */
export function loadHave(storage: ReadStorage | undefined): string[] {
  try {
    return parseHave(storage?.getItem(STORAGE_KEY) ?? null);
  } catch {
    return [];
  }
}

/** Whether the list was stored; false means the browser refused. An empty list removes nothing and stores `[]`. */
export function saveHave(storage: WriteStorage | undefined, ids: readonly string[]): boolean {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(ids));
    return true;
  } catch {
    return false;
  }
}
