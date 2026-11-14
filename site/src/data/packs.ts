/**
 * Printable activity packs (VISION.md › Stage 2: one sharable printable pack).
 * A pack only points at activity cards; the cards stay the single source of
 * their materials and steps.
 */
export interface ActivityPack {
  id: string;
  title: string;
  seoTitle: string;
  description: string;
  lede: string;
  /** Activity card slugs, in the order they print. */
  activities: readonly string[];
  /** The variation each card shows; every card in the pack must have it. Defaults to "easier". */
  variation?: string;
}

export const PACKS: readonly ActivityPack[] = [
  {
    id: 'five-activities-for-a-week',
    title: 'Five Activities for a Week: A Printable Pack',
    seoTitle: 'Printable Activity Pack: Five Activities for a Week',
    description:
      'Five free printable activity cards for a week together: drawing to music, a greeting card, pressed leaves, a letter and a color collage. One card per page.',
    lede:
      'Five different activities, one card per sheet, all with everyday materials. Print them once, keep them in a folder and pick whichever fits the day. There is no order to follow and no need to do all five.',
    activities: [
      'draw-to-music',
      'make-a-greeting-card',
      'press-leaves-and-flowers',
      'write-a-letter-together',
      'make-a-color-collage',
    ],
  },
  {
    id: 'five-quiet-bedside-activities',
    title: 'Five Quiet Bedside Activities: A Printable Pack',
    seoTitle: 'Printable Bedside Activities: Five Quiet Ideas',
    description:
      'Five free printable activity cards that work in bed or an armchair: a songbook, a lavender sachet, a letter, patterns and a sketch. One card per page.',
    lede:
      'Five quiet activities that fit on a lap tray, one card per sheet. Each card shows its version for bed or an armchair. Keep sessions short, follow any advice from the care team about positioning, and stop whenever they have had enough.',
    activities: [
      'make-a-personal-songbook',
      'write-a-letter-together',
      'draw-repeating-patterns',
      'sketch-what-is-on-the-table',
      'make-a-lavender-sachet',
    ],
    variation: 'bedside',
  },
];
