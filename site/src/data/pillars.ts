/**
 * WEB-009: four pillars, each with its own opening, a written selection rule,
 * a "not for" line, six cards picked by the rule below, and links to the
 * intent hubs that serve the same need. The pillars keep their live paths
 * (PM decision, 2026-11-19); `/kids/` is not a pillar here and is untouched.
 *
 * The pillar's cards come from its rule, never from a typed list, so a new
 * card that fits the rule appears without an edit here. The first six by the
 * rule's order are shown: quickest to set up first, then by slug.
 */

/** The card fields a pillar rule reads. Same names as the card schema. */
export interface PillarCardFacts {
  readonly type: string;
  readonly settings: readonly string[];
  readonly groups: readonly string[];
  readonly mess: string;
  readonly energy: string;
  readonly supervision: string;
  readonly prepMinutes: number;
}

/** A card matches when every field the rule names matches. Empty lists are not used. */
export interface PillarRule {
  /** The card's `type` is one of these. */
  readonly types?: readonly string[];
  /** The card's `mess` is one of these. */
  readonly mess?: readonly string[];
  /** The card's `energy` is one of these. */
  readonly energy?: readonly string[];
  /** The card's `supervision` is one of these. */
  readonly supervision?: readonly string[];
  /** The card lists every one of these settings. */
  readonly settings?: readonly string[];
  /** The card lists none of these settings. */
  readonly notSettings?: readonly string[];
  /** The card lists every one of these group sizes. */
  readonly groups?: readonly string[];
}

export interface Pillar {
  readonly id: 'crafts' | 'together' | 'creative-calm' | 'older-adults';
  /** The section page this pillar opens (a live path). */
  readonly section: 'crafts' | 'together' | 'creative-calm' | 'caregiving';
  /** The tile on the home page and on `/activity/`. */
  readonly tileTitle: string;
  readonly tileText: string;
  readonly tileLabel: string;
  /** The first paragraph: this pillar's own answer, two or three plain sentences. */
  readonly opening: string;
  /** Starts "Cards here are chosen because". */
  readonly rule: string;
  /** Starts "Not for:". */
  readonly notFor: string;
  readonly cardRule: PillarRule;
  /** How many cards the pillar shows. */
  readonly take: number;
  /** Intent hubs (ids in `src/content/hubs`) that this pillar links to. */
  readonly hubs: readonly string[];
}

export const PILLARS: readonly Pillar[] = [
  {
    id: 'crafts',
    section: 'crafts',
    tileTitle: 'Crafts',
    tileText: 'Things to make at a table, with everyday materials and an easier version for each.',
    tileLabel: 'Browse crafts',
    opening:
      'Making something with paper, paint or a little glue is one of the simplest ways to spend an hour together. Each craft here uses everyday materials, ends with something to keep, and can be put down and picked up again. You do not need a workshop or special tools to start.',
    rule:
      'Cards here are chosen because they are things to make at a table, with little or no mess. The quickest to set up come first.',
    notFor:
      'Not for: a visit where the person would rather talk, listen or watch, or anyone who cannot sit at a table. The together and creative calm pages suit those visits better.',
    cardRule: { types: ['craft'], mess: ['none', 'low'] },
    take: 6,
    hubs: ['arts-and-crafts-for-seniors', 'easy-grip-crafts', 'seasonal-activities'],
  },
  {
    id: 'together',
    section: 'together',
    tileTitle: 'Together',
    tileText: 'Things several people can do side by side, across ages, with a part for everyone.',
    tileLabel: 'Browse things to do together',
    opening:
      'Some of the best hours are the ones where everyone has a part. These cards suit a small group, often across generations, where a child, a grandparent and a friend each do one piece of the work. Nobody has to be the best at it.',
    rule:
      'Cards here are chosen because a small group can do them at once, and a child or an older adult each has a clear part. Only making, drawing, nature and touch cards with that set-up are listed, quickest to set up first.',
    notFor:
      'Not for: a quiet one-to-one visit, or a group where someone would be pushed to join in. For a quiet visit, the bedside and seated pages have cards that fit.',
    cardRule: { types: ['craft', 'art', 'nature', 'sensory'], groups: ['small-group', 'intergenerational'] },
    take: 6,
    hubs: ['grandparent-grandchild-activities', 'reminiscence-activities', 'music-activities'],
  },
  {
    id: 'creative-calm',
    section: 'creative-calm',
    tileTitle: 'Creative calm',
    tileText: 'Slow and quiet, with touch, smell and sight at a table. No clock and no timer.',
    tileLabel: 'Browse creative calm',
    opening:
      'Calm is not an absence of activity. These cards are slow and quiet: winding wool, arranging flowers, filling a sachet, pressing leaves, or sorting postcards and buttons by color. There is no clock and no timer, and the person can stop whenever they like.',
    rule:
      'Cards here are chosen because they are sensory or nature cards, low in energy, done at a table, and they use touch, smell or sight rather than speed or quizzing. The quickest to set up come first.',
    notFor:
      'Not for: treatment or therapy. A calm card does not treat pain, stress or sleep problems; if someone is unwell, ask their care team.',
    cardRule: { types: ['sensory', 'nature'], energy: ['low'], settings: ['tabletop'] },
    take: 6,
    hubs: ['music-activities', 'bedside-activities'],
  },
  {
    id: 'older-adults',
    section: 'caregiving',
    tileTitle: 'Older adults and dementia care',
    tileText: 'Things to do sitting at a table, with a helper close by and an easy place to stop.',
    tileLabel: 'Browse older adults and dementia care',
    opening:
      'Many older adults enjoy making things and talking at a table, and it is easier with a helper close by. These cards are for someone who can sit up at a table, with you nearby to set up and to stop when they tire. Each one works in a short session.',
    rule:
      'Cards here are chosen because they are done sitting at a table, need low energy and a helper nearby rather than hands-on help, and are not bed-based. The quickest to set up come first.',
    notFor:
      'Not for: someone who needs to stay in bed, or who needs hands-on help for every step. Ask their doctor or care team before you plan anything physical.',
    cardRule: { settings: ['tabletop'], notSettings: ['bedside'], energy: ['low'], supervision: ['nearby'] },
    take: 6,
    hubs: ['dementia-activities', 'seated-activities', 'activities-for-seniors'],
  },
];

export const PILLAR_BY_SECTION: Readonly<Record<string, Pillar>> = Object.fromEntries(
  PILLARS.map((pillar) => [pillar.section, pillar]),
);

/** The pillar that opens a section page, if there is one. Other sections (kids, brain-health) have none. */
export function pillarFor(section: string): Pillar | undefined {
  return PILLAR_BY_SECTION[section];
}

/** Whether a card's facts satisfy every condition the rule names. */
export function matchesPillarRule(rule: PillarRule, card: PillarCardFacts): boolean {
  if (rule.types && !rule.types.includes(card.type)) return false;
  if (rule.mess && !rule.mess.includes(card.mess)) return false;
  if (rule.energy && !rule.energy.includes(card.energy)) return false;
  if (rule.supervision && !rule.supervision.includes(card.supervision)) return false;
  if (rule.settings && !rule.settings.every((s) => card.settings.includes(s))) return false;
  if (rule.notSettings && rule.notSettings.some((s) => card.settings.includes(s))) return false;
  if (rule.groups && !rule.groups.every((g) => card.groups.includes(g))) return false;
  return true;
}

/**
 * The cards a pillar shows: every card that matches its rule, quickest setup
 * first, then by slug, cut to `take`. `cards` maps a slug to its facts and
 * should hold only listed (not withdrawn) cards.
 */
export function pillarCards(
  pillar: Pillar,
  cards: ReadonlyMap<string, PillarCardFacts>,
): string[] {
  return [...cards.entries()]
    .filter(([, facts]) => matchesPillarRule(pillar.cardRule, facts))
    .sort(([a, fa], [b, fb]) => fa.prepMinutes - fb.prepMinutes || a.localeCompare(b))
    .slice(0, pillar.take)
    .map(([slug]) => slug);
}
