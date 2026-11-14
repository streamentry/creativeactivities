/**
 * Activity events, sent through the site's one analytics path (this file).
 * The vendor behind it is a maintainer decision (GTM/GA4 in Analytics.astro
 * today, versus DESIGN §7's no-tracker rule), so nothing else in the site
 * calls a vendor directly.
 *
 * EVENT_DICTIONARY is the allowlist. Each event lists its properties and the
 * only values each may hold. Anything else is dropped here: an unknown event,
 * an unknown property, or a value outside its rule. Properties are never free
 * text. Keep docs/specs/global/events.md in step with this table; a test checks it.
 *
 * Where Analytics is not loaded (Photo pairs), every call does nothing.
 */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const FEEDBACK_ANSWERS = ['yes', 'not_really'] as const;
export type FeedbackAnswer = (typeof FEEDBACK_ANSWERS)[number];

/** Fixed reasons for "This didn't fit". Plain words, reviewed for stigma; no free text. */
export const NOT_A_FIT_REASONS = [
  'too_messy',
  'too_hard',
  'needs_materials',
  'not_interested',
  'too_loud_or_busy',
  'hard_to_read_or_use',
  'other',
] as const;
export type NotAFitReason = (typeof NOT_A_FIT_REASONS)[number];

type ParamRule = { readonly values: readonly string[] } | { readonly pattern: RegExp };

export const EVENT_DICTIONARY = {
  activity_start: {},
  activity_restart: {},
  activity_done: {},
  activity_print: {},
  activity_feedback: { answer: { values: FEEDBACK_ANSWERS } },
  /** "We tried this": the activity key only. */
  activity_started_confirmed: { activity: { pattern: SLUG } },
  /** "This didn't fit": the activity key and a fixed reason. */
  activity_not_a_fit: { activity: { pattern: SLUG }, reason: { values: NOT_A_FIT_REASONS } },
} satisfies Record<string, Record<string, ParamRule>>;

export type ActivityEvent = keyof typeof EVENT_DICTIONARY;

export type EventParams<E extends ActivityEvent> = {
  [K in keyof (typeof EVENT_DICTIONARY)[E]]: string;
};

interface GtagWindow {
  gtag?: (command: 'event', name: string, params?: Record<string, string>) => void;
  dataLayer?: unknown[];
}

const browser = (): GtagWindow => (typeof window === 'undefined' ? {} : (window as GtagWindow));

export function analyticsAvailable(w: GtagWindow = browser()): boolean {
  return typeof w.gtag === 'function' || Array.isArray(w.dataLayer);
}

function accepts(rule: ParamRule, value: string): boolean {
  if ('values' in rule) return rule.values.includes(value);
  return rule.pattern.test(value);
}

/**
 * The properties an event may send, or null when the event must not be sent.
 * Unknown properties are dropped; a missing or disallowed allowed property
 * drops the whole event.
 */
export function allowedParams(event: string, params: Record<string, unknown> = {}): Record<string, string> | null {
  if (!Object.prototype.hasOwnProperty.call(EVENT_DICTIONARY, event)) return null;
  const rules = EVENT_DICTIONARY[event as ActivityEvent] as Record<string, ParamRule>;
  const out: Record<string, string> = {};
  for (const [key, rule] of Object.entries(rules)) {
    const value = params[key];
    if (typeof value !== 'string' || !accepts(rule, value)) return null;
    out[key] = value;
  }
  return out;
}

/** Sends one activity event; returns whether it was handed to Analytics. */
export function track<E extends ActivityEvent>(event: E, params?: EventParams<E>, w: GtagWindow = browser()): boolean {
  if (!analyticsAvailable(w)) return false;
  const clean = allowedParams(event, params);
  if (!clean) return false;
  const hasParams = Object.keys(clean).length > 0;
  if (typeof w.gtag === 'function') {
    w.gtag('event', event, hasParams ? clean : undefined);
    return true;
  }
  w.dataLayer?.push({ event, ...clean });
  return true;
}

/** Wraps a callback so only its first call runs: one start per page view. */
export function once(fn: () => void): () => boolean {
  let done = false;
  return () => {
    if (done) return false;
    done = true;
    fn();
    return true;
  };
}

interface SheetDocument {
  querySelector: (selector: string) => unknown;
}

/**
 * Counts a print only on games with a printable sheet. Other game pages print
 * blank (games.css hides the board), so their prints say nothing about use.
 */
export function trackPrint(doc: SheetDocument = document, w: GtagWindow = browser()): boolean {
  return doc.querySelector('.sheet') ? track('activity_print', undefined, w) : false;
}
