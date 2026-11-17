/**
 * GAME-019, Large-target sort. "Larger targets" is an option inside Sort
 * together for people with low vision, a tremor or limited reach. These are the
 * rules that do not depend on the screen: how many baskets show, and whether
 * switching the option can change the round. The sizes themselves live in
 * `games.css` as tokens, and `large-targets.test.ts` checks them against the
 * numbers here.
 */

/** Larger targets always show exactly two baskets, side by side. */
export const LARGE_BASKET_COUNT = 2;

/** The smallest a picture is drawn with the option on, in CSS pixels. */
export const LARGE_PICTURE_PX = 96;

/** The smallest space between two targets with the option on, so a shaking hand can still choose one. */
export const LARGE_GAP_PX = 16;

/** The smallest share of the board's width each basket takes with the option on. */
export const LARGE_BASKET_SHARE = 0.4;

/** The baskets to show: all of them normally, only the first two when larger targets are on. */
export function visibleBaskets<T>(baskets: readonly T[], larger: boolean): readonly T[] {
  return larger ? baskets.slice(0, LARGE_BASKET_COUNT) : baskets;
}

/**
 * Whether switching the option must begin a new round. Only turning it on while
 * more than two baskets are in use does, because a picture that belongs in a
 * hidden basket would have nowhere to go. Turning it off, or any switch with
 * two baskets, keeps every picture where it is.
 */
export function needsNewRound(basketCount: number, larger: boolean): boolean {
  return larger && basketCount > LARGE_BASKET_COUNT;
}
