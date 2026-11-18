/**
 * Browse facets and the hub rules that decide which may become pages
 * (docs/specs/global/02-information-architecture.md §6, H1 and H3; WEB-010).
 *
 * Pure: no file reads and no Astro imports. The loader lives in
 * facet-inputs.ts. A facet is a selection rule over card fields only, so one
 * card can sit in several facets.
 *
 * Verdicts (first match wins):
 * - filter-only: fails H3 (fewer than MIN_CARDS live cards, or fewer than
 *   MIN_DIFFERENT distinct card profiles). Use it as a finder filter only.
 * - route-to-hub: passes H3 but more than OVERLAP_LIMIT of its cards are
 *   listed by an existing hub (H1). The facet links or canonicalises to that hub.
 * - route-to-facet: passes H3 but more than OVERLAP_LIMIT of its cards sit in
 *   another facet. H1 says nothing about facet-to-facet overlap, so this rule
 *   extends it to match. The facet routes to the other facet.
 * - page: passes H3 and overlaps no hub or facet by more than the limit.
 */

export interface FacetCard {
  /** Card key: the file name without `.md`. */
  readonly id: string;
  /** Withdrawn cards are hidden from every listing (TSA-045), so they count for no facet. */
  readonly withdrawn: boolean;
  readonly settings: readonly string[];
  readonly groups: readonly string[];
  readonly activityMinutes: readonly [number, number];
  readonly prepMinutes: number;
  readonly mess: string;
  readonly cost: string;
  readonly energy: string;
  readonly supervision: string;
}

export interface FacetHub {
  /** Hub id: the file path under src/content/hubs without `.md`, such as `occasions/visit`. */
  readonly id: string;
  /** Card keys the hub lists (its `activities` field). */
  readonly cards: readonly string[];
  /** False when the hub is held from search (`indexable: false`). It still counts for H1. */
  readonly indexable: boolean;
}

export interface FacetDef {
  readonly id: string;
  readonly label: string;
  /** The selection rule, in words, as the report prints it. */
  readonly rule: string;
  readonly matches: (card: FacetCard) => boolean;
}

export type Verdict = 'page' | 'route-to-hub' | 'route-to-facet' | 'filter-only';

export interface Overlap {
  /** The hub or facet id. */
  readonly other: string;
  /** Share of this facet's live cards that the other list also holds, from 0 to 1. */
  readonly share: number;
}

export interface FacetResult {
  readonly id: string;
  readonly label: string;
  readonly rule: string;
  /** Live card keys in the facet, in input order. */
  readonly cards: readonly string[];
  /** Number of distinct card profiles among the facet's cards (see profileOf). */
  readonly differ: number;
  readonly passesH3: boolean;
  readonly largestHub: Overlap | null;
  readonly largestFacet: Overlap | null;
  readonly verdict: Verdict;
  /** The hub or facet id for a route verdict; null otherwise. */
  readonly routeTo: string | null;
}

/** H3: a hub is indexable only with at least this many cards that meet its rule. */
export const MIN_CARDS = 8;
/** H3: and at least this many distinct profiles among those cards (see profileOf). */
export const MIN_DIFFERENT = 3;
/** H1: "more than half" means a share strictly above this value. Exactly half does not overlap. */
export const OVERLAP_LIMIT = 0.5;

const SETTINGS = ['tabletop', 'seated', 'bedside', 'standing', 'outdoors'] as const;
const GROUPS = ['one-to-one', 'small-group', 'intergenerational'] as const;

/**
 * The profile of a card, used for the H3 "differ" count. Two cards differ when
 * their profiles differ. A profile has three parts:
 * - setting: the sorted set of `settings`, so order in the file does not matter;
 * - group size: the sorted set of `groups`;
 * - adaptation: `energy/supervision`. Nearly every card lists the same variation
 *   kinds (easier, low-vision, with-children and so on), so those cannot tell
 *   cards apart. Energy and supervision say how much the card asks of the
 *   person and of the helper, which is what an adaptation changes.
 */
export function profileOf(card: FacetCard): string {
  const settings = [...card.settings].sort().join('+');
  const groups = [...card.groups].sort().join('+');
  return `${settings} | ${groups} | ${card.energy}/${card.supervision}`;
}

/** H3 "differ": the number of distinct profiles among the cards. */
export function differentCount(cards: readonly FacetCard[]): number {
  return new Set(cards.map(profileOf)).size;
}

/** H3: enough cards, and enough of them differ. */
export function passesH3(cards: readonly FacetCard[]): boolean {
  return cards.length >= MIN_CARDS && differentCount(cards) >= MIN_DIFFERENT;
}

/** Share of `ids` that appear in `listed`; 0 for an empty list. */
export function overlapShare(ids: readonly string[], listed: ReadonlySet<string>): number {
  if (ids.length === 0) return 0;
  return ids.filter((id) => listed.has(id)).length / ids.length;
}

/**
 * The facets. Time bands overlap on purpose: a card with a 15 to 40 minute
 * range is both "short to start" and "about 30 minutes".
 */
export function buildFacets(): FacetDef[] {
  const settingFacets: FacetDef[] = SETTINGS.map((setting) => ({
    id: `setting:${setting}`,
    label: `Setting: ${setting}`,
    rule: `\`settings\` includes \`${setting}\`.`,
    matches: (card) => card.settings.includes(setting),
  }));
  const groupFacets: FacetDef[] = GROUPS.map((group) => ({
    id: `group:${group}`,
    label: `Group: ${group}`,
    rule: `\`groups\` includes \`${group}\`.`,
    matches: (card) => card.groups.includes(group),
  }));
  const timeFacets: FacetDef[] = [
    {
      id: 'time:short',
      label: 'Time: short to start',
      rule: 'The shortest estimate, `activityMinutes[0]`, is 15 minutes or less.',
      matches: (card) => card.activityMinutes[0] <= 15,
    },
    {
      id: 'time:about-30',
      label: 'Time: about 30 minutes',
      rule: 'The estimate range includes 30: min is 30 or less and max is 30 or more.',
      matches: (card) => card.activityMinutes[0] <= 30 && card.activityMinutes[1] >= 30,
    },
    {
      id: 'time:45-plus',
      label: 'Time: 45 minutes or more',
      rule: 'The longest estimate, `activityMinutes[1]`, is 45 minutes or more.',
      matches: (card) => card.activityMinutes[1] >= 45,
    },
  ];
  const prepFacets: FacetDef[] = [
    {
      id: 'prep:none',
      label: 'Setup: none',
      rule: '`prepMinutes` is 0.',
      matches: (card) => card.prepMinutes === 0,
    },
    {
      id: 'prep:little',
      label: 'Setup: 5 minutes or less',
      rule: '`prepMinutes` is 5 or less.',
      matches: (card) => card.prepMinutes <= 5,
    },
  ];
  const lowFacets: FacetDef[] = [
    {
      id: 'mess:low',
      label: 'Mess: low',
      rule: '`mess` is `none` or `low`.',
      matches: (card) => card.mess === 'none' || card.mess === 'low',
    },
    {
      id: 'cost:low',
      label: 'Cost: low',
      rule: '`cost` is `free` or `low`.',
      matches: (card) => card.cost === 'free' || card.cost === 'low',
    },
  ];
  return [...settingFacets, ...groupFacets, ...timeFacets, ...prepFacets, ...lowFacets];
}

/** The largest overlap by share; ties keep the earlier entry. Null for an empty list. */
function largest(overlaps: readonly Overlap[]): Overlap | null {
  return overlaps.reduce<Overlap | null>((best, next) => (best === null || next.share > best.share ? next : best), null);
}

function verdictFor(
  passes: boolean,
  largestHub: Overlap | null,
  largestFacet: Overlap | null,
): { verdict: Verdict; routeTo: string | null } {
  if (!passes) return { verdict: 'filter-only', routeTo: null };
  if (largestHub !== null && largestHub.share > OVERLAP_LIMIT) return { verdict: 'route-to-hub', routeTo: largestHub.other };
  if (largestFacet !== null && largestFacet.share > OVERLAP_LIMIT) return { verdict: 'route-to-facet', routeTo: largestFacet.other };
  return { verdict: 'page', routeTo: null };
}

/**
 * Evaluates each facet against H3, the existing hubs (H1) and the other facets.
 * Withdrawn cards are dropped before anything is counted. The input is not mutated.
 */
export function evaluateFacets(
  allCards: readonly FacetCard[],
  hubs: readonly FacetHub[],
  facets: readonly FacetDef[] = buildFacets(),
): FacetResult[] {
  const live = allCards.filter((card) => !card.withdrawn);
  const members = facets.map((facet) => ({ facet, cards: live.filter(facet.matches) }));
  const hubSets = hubs.map((hub) => ({ id: hub.id, listed: new Set(hub.cards) }));
  const facetIds = members.map((m) => ({ id: m.facet.id, ids: m.cards.map((c) => c.id) }));

  return members.map(({ facet, cards }) => {
    const ids = cards.map((c) => c.id);
    const passes = passesH3(cards);
    const largestHub = largest(hubSets.map((hub) => ({ other: hub.id, share: overlapShare(ids, hub.listed) })));
    const largestFacet = largest(
      facetIds
        .filter((other) => other.id !== facet.id)
        .map((other) => ({ other: other.id, share: overlapShare(ids, new Set(other.ids)) })),
    );
    const { verdict, routeTo } = verdictFor(passes, largestHub, largestFacet);
    return {
      id: facet.id,
      label: facet.label,
      rule: facet.rule,
      cards: ids,
      differ: differentCount(cards),
      passesH3: passes,
      largestHub,
      largestFacet,
      verdict,
      routeTo,
    };
  });
}
