import type { SeasonId } from '../lib/seasons';

/**
 * WEB-033: one page per season, updated in place each year (02 H8). Season is
 * not holiday: nothing here names or assumes a festival. Each page has its own
 * opening, a written selection rule, a "not for" line and a stop note (02 H4).
 *
 * The four pages are held from search (`indexable: false`) until each passes
 * the H3 threshold with evidence; they are linked from the seasonal hub.
 */
export interface SeasonPage {
  readonly id: SeasonId;
  readonly title: string;
  readonly seoTitle: string;
  readonly description: string;
  readonly eyebrow: string;
  /** The first paragraph: this season's own answer. */
  readonly opening: string;
  /** Why these cards were chosen. */
  readonly rule: string;
  /** Who the page is not for. */
  readonly notFor: string;
  /** The stop note shown with the cards. */
  readonly stopNote: string;
  /** When it usually runs, in plain words for both halves of the world. */
  readonly months: string;
  /** Cards that belong to this season and to no other season page. */
  readonly activities: readonly string[];
  /** What to use when the weather or the garden does not match. */
  readonly swap: string;
}

/** Cards that suit any time of year indoors, shown on every season page after the season's own. */
export const ANYTIME_ACTIVITIES: readonly string[] = [
  'look-through-a-photo-album',
  'hold-a-sing-along-at-home',
  'make-a-greeting-card',
  'make-a-paper-chain-garland',
  'make-a-color-collage',
  'write-a-letter-together',
];

export const SEASON_PAGES: readonly SeasonPage[] = [
  {
    id: 'spring',
    title: 'Spring Activities to Start Together',
    seoTitle: 'Spring Activities for Older Adults and Families',
    description:
      'Seeds, pots and painted stones for the months when things start to grow, with indoor swaps for a cold or wet week. Everyday materials, no single holiday assumed.',
    eyebrow: 'Spring',
    opening:
      'Spring is the season of starting things: a seed pressed into soil, a pot to decorate, a stone to paint for the garden. These three activities each leave something that keeps changing after you finish, so there is a reason to look again tomorrow.',
    rule:
      'We chose activities that use something growing or something for the garden, can be done at a table or a sunny window, and need no special tools.',
    notFor:
      'This page is not for anyone who cannot be near soil or garden materials, or who finds the garden painful to think about. Choose from the any-time list instead.',
    stopNote: 'Stop whenever the person wants to. A half-filled pot is still a pot.',
    months: 'Usually March to May in the northern half of the world and September to November in the southern half.',
    activities: ['plant-seeds-in-a-pot', 'decorate-a-plant-pot', 'paint-a-garden-stone'],
    swap: 'If it is too cold to be outside, work at a table by a window and keep the pot on the sill.',
  },
  {
    id: 'summer',
    title: 'Summer Activities to Start Together',
    seoTitle: 'Summer Activities for Older Adults and Families',
    description:
      'Flowers, pressed petals, a lavender sachet and loose watercolors for long light days, with shade and indoor choices for hot weather. No holiday assumed.',
    eyebrow: 'Summer',
    opening:
      'Summer brings flowers into the house and light that lasts into the evening. These four activities use what is in bloom, or what dried well from last year, and each can be finished before the afternoon gets too warm.',
    rule:
      'We chose activities built around flowers, scent and light color, that work in the shade or indoors, and that finish quickly so nobody sits in the heat.',
    notFor:
      'This page is not for anyone with pollen allergies unless they choose the watercolor card, and not for outdoor work on very hot days. Choose from the any-time list instead.',
    stopNote: 'Stop if it feels too warm, and offer a drink. The activity can wait for a cooler hour.',
    months: 'Usually June to August in the northern half of the world and December to February in the southern half.',
    activities: [
      'arrange-flowers-together',
      'press-leaves-and-flowers',
      'make-a-lavender-sachet',
      'paint-with-watercolors',
    ],
    swap: 'No garden? Use flowers from a shop or market, herbs from the kitchen, or paper flowers.',
  },
  {
    id: 'autumn',
    title: 'Autumn Activities to Start Together',
    seoTitle: 'Autumn Activities for Older Adults and Families',
    description:
      'Leaf rubbings, leaf prints and a torn paper landscape in the colors of the changing year, with swaps for when leaves have not turned. No holiday assumed.',
    eyebrow: 'Autumn',
    opening:
      'Autumn hands you free materials: leaves in every shape and color. Rubbing, printing and tearing paper into a landscape each turn a handful of them into a picture you can hold, and a short walk to collect them is part of the activity.',
    rule:
      'We chose activities that use leaves or the colors of the changing year, that can be prepared in ten minutes and finished at a table, and that do not need to be perfect.',
    notFor:
      'This page is not for anyone who cannot collect leaves or who would find a walk upsetting. A helper can bring a bagful, or choose from the any-time list.',
    stopNote: 'Stop when the person has had enough. Keep what was made, or let it go.',
    months: 'Usually September to November in the northern half of the world and March to May in the southern half.',
    activities: ['make-leaf-rubbings', 'print-with-leaves', 'make-a-torn-paper-landscape'],
    swap: 'No leaves have turned? Use colored paper torn into leaf shapes, or leaves from houseplants.',
  },
  {
    id: 'winter',
    title: 'Winter Activities to Start Together',
    seoTitle: 'Winter Activities for Older Adults and Families',
    description:
      'Watching birds, a pine cone feeder, a window picture and winding yarn for short days indoors, all with plain materials. No holiday assumed, nothing with a flame.',
    eyebrow: 'Winter',
    opening:
      'Winter keeps many people indoors and close to the window. These four activities make the most of that: look out for birds, make a feeder to hang where you can see it, light up a window with tissue paper, or wind yarn for the pleasure of the handful.',
    rule:
      'We chose activities that work well sitting down by a window, need no outdoor trip, and use warm, soft or bright materials. None uses a flame or heat.',
    notFor:
      'This page is not for anyone who cannot be near a window or who cannot sit near the cold glass. Choose from the any-time list instead.',
    stopNote: 'Stop if the person is tired or cold. A blanket and a drink can come first.',
    months: 'Usually December to February in the northern half of the world and June to August in the southern half.',
    activities: [
      'watch-birds-from-a-window',
      'make-a-pine-cone-bird-feeder',
      'make-a-tissue-paper-window-picture',
      'wind-a-ball-of-yarn',
    ],
    swap: 'No window with a view? Look at a bird book or a photo of a garden, and make the feeder for a friend.',
  },
];

export const SEASON_PAGE_BY_ID: Readonly<Record<SeasonId, SeasonPage>> = Object.fromEntries(
  SEASON_PAGES.map((p) => [p.id, p]),
) as Record<SeasonId, SeasonPage>;

/** Why the season pages are not yet in search (02 H3). */
export const SEASON_INDEX_HOLD =
  'Each page shares most of its cards with the others through the any-time list, and no usability or search evidence yet shows the season pages answer a different question than the seasonal hub. They stay out of search and are linked from the seasonal hub until that is checked.';
