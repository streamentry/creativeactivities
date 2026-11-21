/**
 * WEB-017: the printable pack builder. Pure functions for the choice a link describes, the supply list a pack
 * needs and how long it prints. The choice is cards and one version; it holds nothing about a person.
 */
import { MATERIAL_TAGS, MATERIAL_TAG_BY_ID } from '../data/materials';
import type { Needs } from './what-i-have';

/** A pack holds at most eight cards: five to eight is a good size, and more would not fit one folder. */
export const MAX_CARDS = 8;

/** Every card has an easier version, so it is the one a pack starts with. */
export const DEFAULT_VARIATION = 'easier';

/** The cover and the supply list print on at most two pages; each card on at most two (checked by `pnpm check:print`). */
export const MAX_COVER_PAGES = 2;
export const MAX_PAGES_PER_CARD = 2;

export interface PackState {
  readonly cards: readonly string[];
  readonly variation: string;
}

/** The names in a `cards` value: split on commas, spaces trimmed, empty ones dropped. */
function splitIds(value: string | null): string[] {
  return (value ?? '').split(',').map((id) => id.trim()).filter((id) => id !== '');
}

/** How many different activities a link named, before any were checked against the cards on the site. */
export function countRequested(search: string): number {
  return new Set(splitIds(new URLSearchParams(search).get('cards'))).size;
}

/**
 * The pack a link describes: only cards that exist, once each, in the order given, up to eight, and a version
 * that exists (else the easier one). Anything else in the address is ignored.
 */
export function parsePackState(search: string, cards: ReadonlySet<string>, variations: ReadonlySet<string>): PackState {
  const params = new URLSearchParams(search);
  const seen = new Set<string>();
  const chosen: string[] = [];
  for (const id of splitIds(params.get('cards'))) {
    if (cards.has(id) && !seen.has(id) && chosen.length < MAX_CARDS) {
      seen.add(id);
      chosen.push(id);
    }
  }
  const asked = params.get('variation') ?? DEFAULT_VARIATION;
  return { cards: chosen, variation: variations.has(asked) ? asked : DEFAULT_VARIATION };
}

/** The query string for a pack, without the question mark. Empty for no cards and the default version. */
export function serializePackState(state: PackState): string {
  const params = new URLSearchParams();
  if (state.cards.length > 0) params.set('cards', state.cards.join(','));
  if (state.variation !== DEFAULT_VARIATION) params.set('variation', state.variation);
  return params.toString().replace(/%2C/g, ',');
}

export interface PackCardLike {
  readonly id: string;
  readonly variations: readonly string[];
}

/** Whether a card has the version a pack prints. A card is in a pack only with that version. */
export function hasVersion(card: PackCardLike | undefined, kind: string): boolean {
  return card?.variations.includes(kind) === true;
}

/** The ids, in the order given, whose card has the version. */
export function idsWithVersion(ids: readonly string[], byId: ReadonlyMap<string, PackCardLike>, kind: string): string[] {
  return ids.filter((id) => hasVersion(byId.get(id), kind));
}

/** Why a card cannot be added to a pack of `count` cards printing version `kind`, or null when it can. */
export function whyNotAdded(card: PackCardLike | undefined, kind: string, count: number): 'version' | 'full' | null {
  if (!hasVersion(card, kind)) return 'version';
  return count >= MAX_CARDS ? 'full' : null;
}

/** A version's name inside a sentence: lower case in quotes, so "make it easier" reads as a name. */
export function quotedName(label: string): string {
  return `\u201c${label.toLocaleLowerCase('en')}\u201d`;
}

const plural = (count: number, one: string, many: string): string => (count === 1 ? one : many);

/** What to say when a tick is refused. `versionName` is already quoted. */
export function blockedNote(reason: 'version' | 'full', versionName: string): string {
  return reason === 'full'
    ? 'The pack is full. Untick an activity to add another.'
    : `This activity has no ${versionName} version. Choose another version to add it.`;
}

/** After the version changed and some chosen activities had none. Empty when none were taken out. */
export function droppedNote(count: number, versionName: string): string {
  if (count <= 0) return '';
  return `${count} ${plural(count, 'activity has', 'activities have')} no ${versionName} version, so ${plural(count, 'it was', 'they were')} taken out.`;
}

/** After "Start from my saved activities". Empty when all were added. */
export function savedLeftOutNote(count: number, versionName: string): string {
  if (count <= 0) return '';
  return `${count} saved ${plural(count, 'activity was', 'activities were')} left out: no ${versionName} version, or more than ${MAX_CARDS}.`;
}

/** When a link named more activities than could be added, so a pack that opens shorter than it was made says so. */
export function linkLeftOutNote(asked: number, kept: number, versionName: string): string {
  const left = asked - kept;
  if (left <= 0) return '';
  const reasons = `no ${versionName} version, no longer on the site, or more than ${MAX_CARDS} in all`;
  if (asked === 1) return `The activity in this link could not be added (${reasons}).`;
  if (kept === 0) return `None of the ${asked} activities in this link could be added (${reasons}).`;
  return `${left} of the ${asked} activities in this link could not be added (${reasons}).`;
}

/** Pages a pack prints on at most: a cover, then each card. Zero for an empty pack. */
export function pagesAtMost(count: number): number {
  return count <= 0 ? 0 : MAX_COVER_PAGES + MAX_PAGES_PER_CARD * count;
}

/**
 * A short key for this pack: the same cards in the same order with the same version always give the same
 * key, so a printed pack can be matched with the link that made it (FNV-1a, six hex digits).
 */
export function packKey(state: PackState): string {
  let hash = 0x811c9dc5;
  for (const ch of `${state.cards.join(',')}|${state.variation}`) {
    hash ^= ch.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0').slice(0, 6);
}

/** An item's name for a printed list: its label without the examples in brackets. */
export function printLabel(tagId: string): string {
  const label = MATERIAL_TAG_BY_ID.get(tagId)?.label ?? tagId;
  return label.replace(/\s*\([^)]*\)/g, '').trim();
}

/** A group of choices in words: "A glue stick or tape". */
export function groupLabel(group: readonly string[]): string {
  const names = group.map(printLabel).map((l, i) => (i === 0 ? l : l.charAt(0).toLocaleLowerCase('en') + l.slice(1)));
  return names.join(' or ');
}

const order = new Map(MATERIAL_TAGS.map((t, i) => [t.id, i]));
const firstRank = (group: readonly string[]) => Math.min(...group.map((t) => order.get(t) ?? 999));

/**
 * The supplies a set of cards needs, with duplicates gone. A group is met by any one of its items, so a group
 * that contains another group is met whenever the smaller one is, and the larger one is left out. The result
 * is in the order of the item list, so the same pack always prints the same list.
 */
export function combineNeeds(cards: readonly Needs[]): string[][] {
  const unique = new Map<string, string[]>();
  for (const needs of cards) {
    for (const group of needs) {
      const sorted = [...new Set(group)].sort((a, b) => (order.get(a) ?? 999) - (order.get(b) ?? 999));
      unique.set(sorted.join('|'), sorted);
    }
  }
  const groups = [...unique.values()];
  const kept = groups.filter((g) => !groups.some((h) => h !== g && h.length < g.length && h.every((t) => g.includes(t))));
  return kept.sort((a, b) => firstRank(a) - firstRank(b) || a.join().localeCompare(b.join()));
}

/** Extras that some card calls optional and no card needs, in item-list order. */
export function optionalExtras(cards: readonly { needs: Needs; optional: readonly string[] }[]): string[] {
  const needed = new Set(cards.flatMap((c) => c.needs.flat()));
  const extras = new Set(cards.flatMap((c) => c.optional).filter((t) => !needed.has(t)));
  return [...extras].sort((a, b) => (order.get(a) ?? 999) - (order.get(b) ?? 999));
}
