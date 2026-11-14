/**
 * Logic behind the "We tried this" and "This didn't fit" controls on an
 * activity page (WEB-025, WEB-026). The tried list lives only in this browser,
 * as activity keys, and is never sent. Sending the event is track()'s job.
 */
import type { NotAFitReason } from './track';

export const TRIED_STORAGE_KEY = 'ca-tried-activities-v1';
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_TRIED = 200;

type ReadStorage = Pick<Storage, 'getItem'>;
type WriteStorage = Pick<Storage, 'setItem'>;

/** Well-formed activity keys, each once. Anything else reads as none. */
export function parseTried(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    const keys = data.filter((k): k is string => typeof k === 'string' && SLUG.test(k));
    return [...new Set(keys)].slice(0, MAX_TRIED);
  } catch {
    return [];
  }
}

/** Private windows and blocked site data throw on access; treat both as empty. */
export function loadTried(storage: ReadStorage | undefined): string[] {
  try {
    return parseTried(storage?.getItem(TRIED_STORAGE_KEY) ?? null);
  } catch {
    return [];
  }
}

/**
 * Records "tried" for one activity. `first` is true only the first time, so
 * repeat taps send nothing new. `stored` is false when the browser refused.
 */
export function markTried(storage: WriteStorage & ReadStorage | undefined, activity: string): { stored: boolean; first: boolean } {
  if (!SLUG.test(activity)) return { stored: false, first: false };
  const before = loadTried(storage);
  if (before.includes(activity)) return { stored: true, first: false };
  try {
    storage?.setItem(TRIED_STORAGE_KEY, JSON.stringify([activity, ...before].slice(0, MAX_TRIED)));
    return { stored: storage !== undefined, first: true };
  } catch {
    return { stored: false, first: true };
  }
}

export const REASON_LABELS: Record<NotAFitReason, string> = {
  too_messy: 'Too messy',
  too_hard: 'Too hard',
  needs_materials: 'It needs things we do not have',
  not_interested: 'Not interested',
  too_loud_or_busy: 'Too loud or busy',
  hard_to_read_or_use: 'Hard to read or use on my device',
  other: 'Something else',
};

/** The visible next step for each reason: a section on this page, or the finder. */
export const REASON_NEXT: Record<NotAFitReason, { text: string; label: string; href: string }> = {
  too_messy: {
    text: 'A tidier version may be under Make it easier or different.',
    label: 'See the easier options',
    href: '#adapt',
  },
  too_hard: {
    text: 'An easier version may be under Make it easier or different.',
    label: 'See the easier options',
    href: '#adapt',
  },
  needs_materials: {
    text: 'Check the substitutes under What you need.',
    label: 'See what you need',
    href: '#need',
  },
  not_interested: {
    text: 'Another activity may suit better.',
    label: 'Find another activity',
    href: '/activity/',
  },
  too_loud_or_busy: {
    text: 'A calmer version may be under Make it easier or different.',
    label: 'See the calmer options',
    href: '#adapt',
  },
  hard_to_read_or_use: {
    text: 'Look for an activity with a simpler layout.',
    label: 'Find another activity',
    href: '/activity/',
  },
  other: {
    text: 'Another activity may suit better.',
    label: 'Find another activity',
    href: '/activity/',
  },
};
