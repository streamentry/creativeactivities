/** One entry in a card's "What changed" list (WEB-027). */
export interface CardChange {
  date: Date;
  /** Safety-related changes are labelled on the page and in print (WEB-027). */
  safety: boolean;
  note: string;
}

/** The newest changes first, at most `limit` (WEB-027: show the last three; the rest is in the log). */
export function recentChanges(changes: readonly CardChange[], limit = 3): CardChange[] {
  return [...changes].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, limit);
}
