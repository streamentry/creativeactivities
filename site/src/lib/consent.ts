/**
 * Analytics consent (maintainer decision, 2026-11-15): keep Google Analytics 4
 * through Tag Manager, but load nothing from Google until a visitor says yes.
 * "No" is the easy default: ignoring the question, or having no JavaScript,
 * means no analytics. Consent is remembered in this browser only.
 *
 * Google consent mode is set as well, belt and braces: everything starts
 * denied, and a yes grants analytics storage only. Nothing for ads, ever.
 */

/** The one storage key for the answer. Listed in docs/specs/global/data-inventory.md. */
export const CONSENT_KEY = 'ca-analytics-consent-v1';

export type Consent = 'granted' | 'denied';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** The stored answer, or null when the visitor has not chosen (or storage is unavailable). */
export function readConsent(storage: StorageLike | null): Consent | null {
  try {
    const value = storage?.getItem(CONSENT_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

/** Stores the answer; returns false when the browser refuses storage. */
export function saveConsent(storage: StorageLike | null, consent: Consent): boolean {
  if (!storage) return false;
  try {
    storage.setItem(CONSENT_KEY, consent);
    return true;
  } catch {
    return false;
  }
}

/** Google's scripts load only after an explicit yes. */
export function shouldLoadAnalytics(consent: Consent | null): boolean {
  return consent === 'granted';
}

/** The question is shown only while it is unanswered. */
export function showConsentChoice(consent: Consent | null): boolean {
  return consent === null;
}

type ConsentState = 'granted' | 'denied';
interface ConsentSignals {
  analytics_storage: ConsentState;
  ad_storage: ConsentState;
  ad_user_data: ConsentState;
  ad_personalization: ConsentState;
}

/** Consent mode defaults, set before the container starts: all denied. */
export function consentDefaults(): ConsentSignals {
  return { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
}

/** The consent mode update for an answer: analytics storage follows it; ads never change. */
export function consentUpdate(consent: Consent): ConsentSignals {
  return { ...consentDefaults(), analytics_storage: consent };
}

/**
 * Tag Manager types that may never run on this site, whatever the container
 * says (developers.google.com/tag-platform/tag-manager/restrict). These are
 * the automatic listeners that send full URLs and page details (clicks, link
 * clicks, form submits, element visibility, scroll depth, timers, history
 * changes, JavaScript errors, YouTube) and Custom HTML tags. The GA4 tags
 * themselves are not listed, so page views and the allowlisted events still
 * reach Analytics after a yes.
 */
export const GTM_BLOCKLIST = ['cl', 'lcl', 'fsl', 'evl', 'sdl', 'tl', 'hl', 'jel', 'ytl', 'html'] as const;

/** Browser storage, or null where it is blocked. */
export function browserConsentStorage(): StorageLike | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}
