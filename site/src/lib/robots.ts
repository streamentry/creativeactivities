import { SITE } from './site';
import { SEARCH_CRAWLERS, TRAINING_CRAWLERS, USER_TRIGGERED_CRAWLERS } from './ai-crawlers';

/**
 * Generates `robots.txt` from the crawler lists in `ai-crawlers.ts`. Everyone
 * may read the public pages by default; each named search and user-triggered
 * crawler gets an explicit allow; each training crawler gets `Disallow: /`.
 * `robots.txt` is a request, not access control.
 */
export function renderRobots(): string {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    '# Search crawlers: allowed. Googlebot and Bingbot are never blocked.',
    ...SEARCH_CRAWLERS.flatMap((bot) => [`User-agent: ${bot}`, 'Allow: /', '']),
    '# Fetchers that act for one person\'s question: allowed.',
    ...USER_TRIGGERED_CRAWLERS.flatMap((bot) => [`User-agent: ${bot}`, 'Allow: /', '']),
    '# AI training crawlers: disallowed (SEO-035). This is a request, not access control.',
    ...TRAINING_CRAWLERS.flatMap((bot) => [`User-agent: ${bot}`, 'Disallow: /', '']),
    `# A plain-text map for AI answer engines: ${SITE.url}/llms.txt`,
    `# Self-contained summaries of every page: ${SITE.url}/llms-full.txt`,
    '',
    // The index points to one sitemap per language (/sitemap-en.xml, /vi/sitemap.xml, ...).
    `Sitemap: ${SITE.url}/sitemap.xml`,
    '',
  ].join('\n');
}
