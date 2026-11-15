/**
 * Browser side of analytics consent: loads Google Tag Manager only after a
 * yes, and switches consent off (and clears Google's cookies) after a no.
 * Pure decisions live in consent.ts, which is unit tested.
 */
import { GTM_BLOCKLIST, consentDefaults, consentUpdate, type Consent } from './consent';

interface GtmWindow {
  dataLayer?: unknown[];
  __caAnalyticsLoaded?: boolean;
}

function gtagPush(w: GtmWindow, ...args: unknown[]): void {
  // Consent commands must be pushed as an arguments object, as gtag() does.
  (function pushArgs(..._unused: unknown[]) {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments);
  })(...args);
}

/** Starts Tag Manager once, with consent mode and the blocklist set first. */
export function loadAnalytics(containerId: string, w: GtmWindow = window as GtmWindow, doc: Document = document): void {
  if (w.__caAnalyticsLoaded || !/^GTM-[A-Z0-9]+$/.test(containerId)) return;
  w.__caAnalyticsLoaded = true;
  w.dataLayer = w.dataLayer || [];
  gtagPush(w, 'consent', 'default', consentDefaults());
  gtagPush(w, 'consent', 'update', consentUpdate('granted'));
  w.dataLayer.push({ 'gtm.blocklist': [...GTM_BLOCKLIST] });
  w.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  const script = doc.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${containerId}`;
  doc.head.appendChild(script);
}

/** After a no: tell Google consent is off for this page, and remove its cookies. */
export function stopAnalytics(w: GtmWindow = window as GtmWindow, doc: Document = document): void {
  if (Array.isArray(w.dataLayer)) gtagPush(w, 'consent', 'update', consentUpdate('denied'));
  const host = doc.location?.hostname ?? '';
  const domains = ['', host, `.${host.replace(/^www\./, '')}`];
  for (const name of doc.cookie.split(';').map((c) => c.split('=')[0]!.trim())) {
    if (!/^_ga(_|$)|^_gid$/.test(name)) continue;
    for (const domain of domains) {
      doc.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`;
    }
  }
}

export type { Consent };
