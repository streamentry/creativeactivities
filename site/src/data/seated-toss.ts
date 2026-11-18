/**
 * Seated toss tally (GAME-049): the shape of the printed target and tally.
 *
 * The game is physical: two people at a table toss a soft bag onto a printed target, and the tally is
 * kept on paper. Nothing here counts anything. These numbers only say how the sheet and its on-screen
 * preview are drawn, so the two cannot drift apart. The words (ring names, column headings) are text,
 * so they live in `ui.seatedToss` in `src/i18n/play/en.json`.
 */

/** The rings from the outer edge to the middle. The names in `ui.seatedToss.rings` follow this order. */
export const RING_IDS = ['near', 'middle', 'far'] as const;
export type RingId = (typeof RING_IDS)[number];

/** Empty boxes in each person's row on the tally, so a row is long enough for a relaxed game. */
export const TALLY_BOXES = 8;

/** Two people, each with a column on the tally; `ui.seatedToss.people` names them. */
export const PEOPLE_COUNT = 2;

/** The target is drawn in a square of this many units, with its centre in the middle. */
export const TARGET_SIZE = 200;
const CENTER = TARGET_SIZE / 2;

/** The outside edge of each ring, in the order of `RING_IDS`. The last ring is the disc in the middle. */
export const RING_RADII: readonly number[] = [96, 64, 32];

/** The name is written this tall (in the same units); its baseline sits a third of that below the middle of the band. */
export const NAME_SIZE = 12;

/** One ring as drawn: where its edge is and where its name is written (the baseline of the text). */
export interface RingMark {
  id: RingId;
  radius: number;
  name: string;
  /** The baseline of the name written above the middle of the target, upright for the person on that side. */
  nameY: number;
}

/**
 * The rings to draw, with each name written once in its band. The sheet and the preview write each name a
 * second time turned half a turn about the centre, so the person sitting opposite can read it too.
 */
export function ringMarks(names: readonly string[]): RingMark[] {
  return RING_IDS.map((id, i) => {
    const radius = RING_RADII[i] as number;
    const inner = RING_RADII[i + 1];
    // Inside the band between this edge and the next one in; the middle disc is named just above its centre.
    const nameY = inner === undefined ? CENTER - NAME_SIZE / 3 : CENTER - (radius + inner) / 2 + NAME_SIZE / 3;
    return { id, radius, name: names[i] ?? '', nameY };
  });
}

/** The centre of the target, for drawing the circles and for turning the second copy of each name. */
export const TARGET_CENTER = CENTER;
