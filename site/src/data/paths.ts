/**
 * WEB-032: four-week paths. A path is four weeks of activities with a place to start and a way to skip a week.
 * Each path states its purpose and who it is not for. There is no schedule, no streak and no penalty: a
 * person can start at any week, skip any week and come back to it.
 *
 * The paths are held from search (`/paths/` and each path are `noindex`) until there is evidence that
 * they answer a different question than the hubs do (02 H3, H10, H11).
 */
export type PathAudience = 'care' | 'together';

export interface PathWeek {
  readonly title: string;
  /** One plain sentence about the week. */
  readonly note: string;
  /** One to three activity cards. A week offers more than one way in. */
  readonly activities: readonly string[];
}

export interface PathDef {
  readonly id: string;
  readonly title: string;
  readonly seoTitle: string;
  readonly description: string;
  readonly eyebrow: string;
  /** The date this path's activities or words last changed. It is printed as the path's version. */
  readonly updated: string;
  readonly audience: PathAudience;
  /** Who walks this path, in a few plain words. */
  readonly who: string;
  /** What the path is for. */
  readonly purpose: string;
  /** Why these activities were chosen. */
  readonly rule: string;
  /** Who the path is not for. */
  readonly notFor: string;
  /** The stop note shown with the weeks. */
  readonly stopNote: string;
  readonly weeks: readonly [PathWeek, PathWeek, PathWeek, PathWeek];
}

/** Why the path pages are kept out of search. */
export const PATH_INDEX_HOLD =
  'Held from search until there is evidence that a path answers a different question than the hubs do (02 H3, H10, H11).';

export const PATHS: readonly PathDef[] = [
  {
    id: 'quiet-weeks-at-the-table',
    title: 'Four Quiet Weeks at the Table',
    seoTitle: 'A Four-Week Plan of Quiet Activities for Older Adults',
    description:
      'A four-week plan of quiet table activities for a caregiver and an older adult: look, sing, draw, then make something to give. Start anywhere and skip any week.',
    eyebrow: 'Path for care',
    updated: '2026-11-17',
    audience: 'care',
    who: 'A caregiver and an older adult, including someone living with memory loss.',
    purpose:
      'To give a caregiver and an older adult a gentle run of things to try together over four weeks: first looking and sorting, then singing and tapping, then slow drawing, then making something small to give.',
    rule: 'We chose activities that can be done sitting down, need little energy and use everyday things that cost little or nothing. Each week has two, so there is always another way in.',
    notFor:
      'This path is not for a day when the person is unwell, in pain or upset, or for anyone who finds a set order stressful. It is not a replacement for care. Pick single activities from the finder instead.',
    stopNote: 'Stop whenever the person wants to. Half a page is a page.',
    weeks: [
      {
        title: 'Look and sort',
        note: 'Begin with handling and looking.',
        activities: ['sort-a-box-of-postcards', 'look-through-a-photo-album'],
      },
      {
        title: 'Sing and tap',
        note: 'Songs they choose and a steady beat. Join in only if the person does.',
        activities: ['hold-a-sing-along-at-home', 'tap-a-rhythm-together'],
      },
      {
        title: 'Slow drawing',
        note: 'Slow marks on paper, starting from a circle or one thing on the table.',
        activities: ['draw-a-slow-line-pattern', 'sketch-what-is-on-the-table'],
      },
      {
        title: 'Make something to give',
        note: 'A small thing to hand to someone else.',
        activities: ['make-a-greeting-card', 'wrap-a-small-gift'],
      },
    ],
  },
  {
    id: 'making-across-generations',
    title: 'Four Weeks of Making Across the Generations',
    seoTitle: 'A Four-Week Plan for a Child and an Older Relative',
    description:
      'A four-week plan for a child and an older relative to make things side by side: paper, drawing, plants and a letter. Start anywhere and skip any week.',
    eyebrow: 'Path for together',
    updated: '2026-11-17',
    audience: 'together',
    who: 'A child and an older relative, making things side by side.',
    purpose:
      'To give a child and an older relative one small thing to make side by side each week for four weeks, using each activity\u2019s version for children.',
    rule: 'We chose activities that have a version for children, take 45 minutes or less and use everyday things that cost little or nothing. Each week has two, so a visit can pick the one that suits the day.',
    notFor:
      "This path is not for visits where the older person tires quickly or finds a child's company hard, or for a child who needs an adult's full attention. One short activity from the finder may suit those days better.",
    stopNote: 'Stop whenever either of them wants to. A half-made thing is still made together.',
    weeks: [
      {
        title: 'Paper and folding',
        note: 'Folding and looping paper.',
        activities: ['make-a-paper-chain-garland', 'fold-a-paper-boat'],
      },
      {
        title: 'Draw it together',
        note: 'Take turns with the pencil.',
        activities: ['draw-a-comic-strip-together', 'make-a-family-tree-of-hands'],
      },
      {
        title: 'Grow something',
        note: 'Seeds to plant and a pot to decorate.',
        activities: ['plant-seeds-in-a-pot', 'decorate-a-plant-pot'],
      },
      {
        title: 'Write it down',
        note: 'Put what you shared on paper.',
        activities: ['write-a-letter-together', 'start-a-family-recipe-book'],
      },
    ],
  },
];

export const PATH_BY_ID: ReadonlyMap<string, PathDef> = new Map(PATHS.map((p) => [p.id, p]));

/** Every activity a path lists, in order, each once. */
export function pathActivities(path: PathDef): string[] {
  return [...new Set(path.weeks.flatMap((w) => w.activities))];
}
