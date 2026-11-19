import { PICNIC_ITEMS, type PicnicItem } from '../../data/picnic-planner';

/**
 * Picnic planner (GAME-043). A person taps a picture in a tray to put it in the picnic basket, and taps it in the
 * basket to take it out. The basket holds up to six things, each picture once, in the order they were added. Two or
 * more things make a matching round, where each chosen picture is paired with itself. Nothing here scores, times,
 * rates or finishes the plan. Every function returns a new value.
 */

/** Slots in the basket. */
export const SLOTS = 6;

/** The fewest things that make a matching round. */
export const MIN_TO_PLAY = 2;

export interface Picnic {
  /** Picture ids in the basket, in the order they were added. Never more than `SLOTS`, never the same id twice. */
  readonly basket: readonly string[];
}

export function newPicnic(): Picnic {
  return { basket: [] };
}

/** The tray item with this picture id, or undefined when the id is not offered. */
export const itemOf = (id: string): PicnicItem | undefined => PICNIC_ITEMS.find((item) => item.id === id);

export type Add = 'added' | 'present' | 'full' | 'outside';

/** Put a tray picture in the basket. A picture already there, a full basket and an unknown id each leave it unchanged. */
export function addToBasket(picnic: Picnic, id: string): { picnic: Picnic; outcome: Add } {
  if (!itemOf(id)) return { picnic, outcome: 'outside' };
  if (picnic.basket.includes(id)) return { picnic, outcome: 'present' };
  if (picnic.basket.length >= SLOTS) return { picnic, outcome: 'full' };
  return { picnic: { basket: [...picnic.basket, id] }, outcome: 'added' };
}

/** Take a picture out of the basket. A picture that is not there leaves the basket as it is. */
export function takeOut(picnic: Picnic, id: string): { picnic: Picnic; outcome: 'removed' | 'absent' } {
  if (!picnic.basket.includes(id)) return { picnic, outcome: 'absent' };
  return { picnic: { basket: picnic.basket.filter((item) => item !== id) }, outcome: 'removed' };
}

/** Empty the basket. An empty basket is returned as it is. */
export function emptyBasket(picnic: Picnic): Picnic {
  return picnic.basket.length === 0 ? picnic : newPicnic();
}

/** Whether there are enough things in the basket for a matching round. */
export function canPlay(picnic: Picnic): boolean {
  return picnic.basket.length >= MIN_TO_PLAY;
}

/** Join English phrases: "a", "a and b", "a, b and c". An empty list joins to an empty string. */
export function joinList(parts: readonly string[], and: string): string {
  if (parts.length <= 1) return parts[0] ?? '';
  return `${parts.slice(0, -1).join(', ')} ${and} ${parts[parts.length - 1]}`;
}

/** The basket in words, such as "bread, cheese, apples and a kite", or an empty string when it is empty. */
export function summaryList(picnic: Picnic, and: string): string {
  return joinList(
    picnic.basket.map((id) => itemOf(id)?.phrase ?? '').filter((phrase) => phrase.length > 0),
    and,
  );
}

/** The picture ids for the matching round: each chosen picture is one pair, in basket order. */
export function pairValues(picnic: Picnic): readonly string[] {
  return picnic.basket;
}
