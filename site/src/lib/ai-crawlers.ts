/**
 * Crawler policy for `robots.txt` (SEO-035, decided by the maintainer on 2026-11-21).
 *
 * Search crawlers are allowed, because organic visibility is the goal. Crawlers
 * whose purpose is AI model training are disallowed. Search and training are
 * separate controls: allowing a search bot does not consent to training.
 *
 * `robots.txt` is a request that well-behaved crawlers follow, not access
 * control. Keep private material off public URLs and enforce any block at the
 * CDN or WAF, which must also let the search crawlers through.
 */

/** Search and answer crawlers: allowed. Googlebot and Bingbot must never be blocked. */
export const SEARCH_CRAWLERS = [
  'Googlebot',
  'Bingbot',
  'OAI-SearchBot',
  'Claude-SearchBot',
  'PerplexityBot',
] as const;

/** Fetchers that act for one person's question, not for training: allowed. */
export const USER_TRIGGERED_CRAWLERS = ['ChatGPT-User', 'Claude-User', 'Perplexity-User'] as const;

/** Crawlers whose purpose is AI model training: disallowed. */
export const TRAINING_CRAWLERS = [
  'GPTBot',
  'Google-Extended',
  'CCBot',
  'ClaudeBot',
  'anthropic-ai',
  'Applebot-Extended',
  'Bytespider',
] as const;
