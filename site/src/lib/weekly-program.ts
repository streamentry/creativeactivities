import { listedActivities } from './activities';

/** WEB-045: the five weekdays a care-home activity program usually covers. */
export const PROGRAM_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

export interface ProgramCard {
  id: string;
  data: {
    name: string;
    type: string;
    summary: string;
    variations: readonly { kind: string; text: string }[];
    withdrawn?: unknown;
  };
}

export type ProgramEntry<T extends ProgramCard = ProgramCard> = T & {
  /** The card's group version, shown on the sheet. */
  group: string;
  /** The one-to-one version: the card itself, in one line. */
  oneToOne: string;
};

/** Listed cards that carry a group version, in their given order. */
export function groupCards<T extends ProgramCard>(cards: readonly T[]): T[] {
  return listedActivities(cards).filter((c) => c.data.variations.some((v) => v.kind === 'for-a-group'));
}

/** Adds the two versions the sheet prints for a card. */
export function programEntry<T extends ProgramCard>(card: T): ProgramEntry<T> {
  const group = card.data.variations.find((v) => v.kind === 'for-a-group')?.text ?? card.data.summary;
  return { ...card, group, oneToOne: card.data.summary };
}

/**
 * A starting week: one group card per weekday, a different activity type each day where
 * possible, then any unused card, and a repeat only when there are fewer than five cards.
 */
export function defaultWeek<T extends ProgramCard>(cards: readonly T[]): ProgramEntry<T>[] {
  const pool = groupCards(cards);
  if (pool.length === 0) return [];
  const chosen: T[] = [];
  const types = new Set<string>();
  for (const c of pool) {
    if (chosen.length === PROGRAM_DAYS.length) break;
    if (!types.has(c.data.type)) {
      chosen.push(c);
      types.add(c.data.type);
    }
  }
  for (const c of pool) {
    if (chosen.length === PROGRAM_DAYS.length) break;
    if (!chosen.includes(c)) chosen.push(c);
  }
  while (chosen.length < PROGRAM_DAYS.length) chosen.push(pool[chosen.length % pool.length]);
  return chosen.map(programEntry);
}
