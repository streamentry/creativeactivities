/**
 * WEB-007 "One idea right now": one card at a time from the cards that fit the current choices,
 * with an "Another idea" control that stops after a short run. Startable, not scrollable (MISSION).
 */
export const ONE_IDEA_LIMIT = 5;

export interface IdeaStep {
  /** The card to show, or null when there is nothing (left) to show. */
  slug: string | null;
  /** 1-based position of this idea in the run. */
  position: number;
  /** True when "Another idea" should be offered after this one. */
  more: boolean;
}

/**
 * The idea at `index` (0-based) in a run over `fitting` slugs, which are already in fit order.
 * The run ends at ONE_IDEA_LIMIT or at the end of the list, whichever comes first.
 */
export function ideaAt(fitting: readonly string[], index: number, limit: number = ONE_IDEA_LIMIT): IdeaStep {
  const end = Math.min(fitting.length, limit);
  if (index < 0 || index >= end) return { slug: null, position: index + 1, more: false };
  return { slug: fitting[index], position: index + 1, more: index + 1 < end };
}

/** What the finder says when the run is over. */
export function ideaEndText(shown: number): string {
  if (shown === 0) return 'Nothing fits these choices yet. Try changing one of them.';
  const ideas = shown === 1 ? 'one idea' : `${shown} ideas`;
  return `That was ${ideas}. Choose one to start, or look through the full list below.`;
}
