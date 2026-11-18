/**
 * CNT-014, adult variant: 10, 20 and 30 minute group sessions for care homes and day centers, built only from
 * existing activity cards. The page reads each card from the content collection; a missing or withdrawn card
 * fails the build, and so does a card whose activity time does not hold the session length.
 */
export const PLAN_MINUTES = [10, 20, 30] as const;
export type PlanMinutes = (typeof PLAN_MINUTES)[number];

export interface CarePlan {
  minutes: PlanMinutes;
  /** Card slugs (file names without .md), best fit first. */
  cards: readonly string[];
}

export const CARE_PLANS: readonly CarePlan[] = [
  { minutes: 10, cards: ['hold-a-sing-along-at-home', 'match-colors-to-a-tune', 'fold-a-paper-boat'] },
  { minutes: 20, cards: ['arrange-flowers-together', 'make-a-greeting-card'] },
  { minutes: 30, cards: ['paint-a-shared-picture', 'make-a-festival-decoration'] },
];

/**
 * A card fits a session when the session length lies inside the card's activity range (`activityMinutes`, the
 * card's own minimum and maximum). Setup is the card's `prepMinutes` and is not counted in the session.
 */
export function cardFitsPlan(range: readonly [number, number], minutes: number): boolean {
  return range[0] <= minutes && minutes <= range[1];
}

/** Cards have no clean-up field, so the clean-up time is never invented. */
export const CLEANUP_TEXT = 'Check the card';

/** The card's prep time in minutes, or the fallback when the card gives none. */
export function setupText(prepMinutes: number): string {
  return prepMinutes > 0 ? `${prepMinutes} minutes` : CLEANUP_TEXT;
}

export const STOP_RULE = 'Stop when the person wants to stop.';
