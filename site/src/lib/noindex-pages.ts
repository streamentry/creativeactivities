/**
 * Pages held from search and left out of the sitemap, by address. A tool page or a page that has not yet been reviewed
 * goes here, so the sitemap and the page's own robots meta stay in step. The page itself sets `noindex` on its layout.
 */
export const NOINDEX_PAGES: ReadonlySet<string> = new Set([
  // Tool pages that ask not to be indexed (WEB-003, WEB-017, WEB-032).
  '/search/',
  '/activity/pack/',
  '/paths/',
  // A referrer handout held until a credentialed reviewer has seen it (WEB-048).
  '/for-professionals/',
  // The care-home and day-center session plans (CNT-014, adult variant) held until a care-setting reviewer has read them.
  '/for-organizations/care-settings/',
]);
