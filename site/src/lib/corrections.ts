/**
 * Public corrections log (TSA-035). Newest first. A safety or claim change is logged here,
 * never silently edited. Each entry names the page, the kind of change and what changed.
 */
export type CorrectionKind = 'safety' | 'factual' | 'claim' | 'other';

export type CorrectionEntry = {
  /** ISO date the change was published, YYYY-MM-DD. */
  date: string;
  /** Path of the page changed, starting with a slash. */
  page: string;
  kind: CorrectionKind;
  /** One plain sentence: what was wrong and what it now says. */
  change: string;
};

export const CORRECTION_KINDS: Record<CorrectionKind, string> = {
  safety: 'Safety',
  factual: 'Fact',
  claim: 'Claim wording',
  other: 'Other',
};

/** No entries yet. Add a new entry at the top when a change is made. */
export const CORRECTIONS: CorrectionEntry[] = [];
