/**
 * WEB-031: the printable weekly plan for a path. Each path week prints on one sheet, with one line per day: the
 * activity, its time from the card, and blanks to tick or write on. Days are optional, so a line with nothing
 * planned is left blank rather than marked. Nothing here counts days or says a day was missed.
 */

/** Five lines, one for each weekday the sheet offers; a path week has at most three activities. */
export const PLAN_LINES = 5;

export interface PlanItem {
  readonly id: string;
  readonly name: string;
  /** The card's own time, for example "15–25 min". */
  readonly time: string;
}

/**
 * The lines of one sheet: the planned items first, then blanks up to PLAN_LINES. Throws when there are more items
 * than lines, so an extra activity is never dropped from the paper without anyone noticing.
 */
export function planLines(items: readonly PlanItem[]): (PlanItem | null)[] {
  if (items.length > PLAN_LINES) {
    throw new Error(`A weekly plan sheet has room for ${PLAN_LINES} lines, not ${items.length}`);
  }
  return [...items, ...Array.from({ length: PLAN_LINES - items.length }, () => null)];
}

/** The words printed on the sheets, outside the card names and times. */
export const PLAN_TEXT = {
  eyebrow: 'Weekly plan',
  blankHeading: 'A blank week to fill in by hand',
  weekStarting: 'Week starting',
  day: 'Day',
  daysOptional: 'Days are optional.',
  printButton: 'Print the weekly plans',
  printNote: 'Each week prints on its own page, with a blank week to fill in by hand.',
} as const;
