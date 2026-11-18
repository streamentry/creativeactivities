import { BEDS, GARDEN_ITEMS, type GardenItem } from '../../data/garden-planner';

/**
 * Garden planner (GAME-041). A person taps a picture in the tray, then taps a bed to put it there. A bed holds one
 * picture. Tapping a planted bed while nothing is chosen clears it. "Start again" empties every bed, and "Put it
 * back" undoes the last start again or clear. Solo or side by side: there are no turns. Nothing here scores, times,
 * rates or finishes the plan. Every function returns a new value.
 */

/** The picture id in a bed, or null when the bed is empty. */
export type Bed = string | null;

export interface Garden {
  /** The twelve beds, in reading order. */
  beds: readonly Bed[];
  /** The picture id chosen in the tray, or null. */
  chosen: string | null;
  /** The beds before the last "Start again" or clear, so "Put it back" can restore them; null when there is nothing. */
  before: readonly Bed[] | null;
}

export function newGarden(): Garden {
  return { beds: new Array<Bed>(BEDS).fill(null), chosen: null, before: null };
}

/** The tray item with this picture id, or undefined when the id is not offered. */
export const itemOf = (id: string): GardenItem | undefined => GARDEN_ITEMS.find((item) => item.id === id);

export type Choice = 'chosen' | 'unchosen' | 'outside';

/** Choose a picture in the tray. Tapping the chosen one again puts the choice down. A picture not in the tray is refused. */
export function choosePicture(garden: Garden, id: string): { garden: Garden; outcome: Choice } {
  if (!itemOf(id)) return { garden, outcome: 'outside' };
  if (garden.chosen === id) return { garden: { ...garden, chosen: null }, outcome: 'unchosen' };
  return { garden: { ...garden, chosen: id }, outcome: 'chosen' };
}

export type Tap = 'planted' | 'replaced' | 'cleared' | 'needPicture' | 'outside';

function withBed(beds: readonly Bed[], index: number, value: Bed): Bed[] {
  return beds.map((bed, i) => (i === index ? value : bed));
}

/**
 * Tap a bed. With a picture chosen, the bed takes it (replacing any picture already there) and the choice is put
 * down. With nothing chosen, an empty bed asks for a picture first, and a planted bed is cleared.
 */
export function tapBed(garden: Garden, index: number): { garden: Garden; outcome: Tap } {
  if (!Number.isInteger(index) || index < 0 || index >= BEDS) return { garden, outcome: 'outside' };
  const current = garden.beds[index] ?? null;
  if (garden.chosen === null) {
    if (current === null) return { garden, outcome: 'needPicture' };
    return { garden: { ...garden, beds: withBed(garden.beds, index, null), before: garden.beds }, outcome: 'cleared' };
  }
  const outcome: Tap = current === null || current === garden.chosen ? 'planted' : 'replaced';
  return {
    garden: { ...garden, beds: withBed(garden.beds, index, garden.chosen), chosen: null, before: null },
    outcome,
  };
}

/** Empty every bed. A garden that is already empty is returned as it is, so there is nothing to put back. */
export function startAgain(garden: Garden): Garden {
  if (garden.beds.every((bed) => bed === null)) return garden;
  return { ...garden, beds: new Array<Bed>(BEDS).fill(null), chosen: null, before: garden.beds };
}

/** Put back the beds that the last "Start again" or clear took away. Nothing to put back leaves the garden as it is. */
export function putBack(garden: Garden): Garden {
  if (!garden.before) return garden;
  return { ...garden, beds: garden.before, chosen: null, before: null };
}

/** How many of each picture are in the beds, in tray order, leaving out any picture with none. */
export function tally(garden: Garden): { item: GardenItem; count: number }[] {
  return GARDEN_ITEMS.map((item) => ({ item, count: garden.beds.filter((bed) => bed === item.id).length })).filter(
    (row) => row.count > 0,
  );
}

/** A count and its name in English: "1 tree", "3 sunflowers". */
export function countPhrase(count: number, item: GardenItem): string {
  return `${count} ${count === 1 ? item.one : item.many}`;
}

/** Join phrases in English: "a", "a and b", "a, b and c". An empty list joins to an empty string. */
export function joinList(parts: readonly string[], and: string): string {
  if (parts.length <= 1) return parts[0] ?? '';
  return `${parts.slice(0, -1).join(', ')} ${and} ${parts[parts.length - 1]}`;
}

/** The plan in words, with English counts, or an empty string when no bed is planted. */
export function summaryList(garden: Garden, and: string): string {
  return joinList(
    tally(garden).map((row) => countPhrase(row.count, row.item)),
    and,
  );
}
