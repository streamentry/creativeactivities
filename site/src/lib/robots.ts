import { SITE } from './site';

/**
 * Crawlers of AI search, assistants and model training that are named on
 * purpose. Each is allowed, as `*` already allows it: a named group makes the
 * policy explicit and survives a later change to the wildcard group. To opt
 * one out, replace its `Allow: /` with `Disallow: /`.
 */
export const AI_CRAWLERS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  'Claude-SearchBot',
  'Claude-User',
  'ClaudeBot',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
] as const;

export function renderRobots(): string {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    '# AI search and assistant crawlers, named so the policy is explicit: all may read and cite the public pages.',
    ...AI_CRAWLERS.flatMap((bot) => [`User-agent: ${bot}`, 'Allow: /', '']),
    `# A plain-text map for AI answer engines: ${SITE.url}/llms.txt`,
    `# Self-contained summaries of every page: ${SITE.url}/llms-full.txt`,
    '',
    // The index points to one sitemap per language (/sitemap-en.xml, /vi/sitemap.xml, ...).
    `Sitemap: ${SITE.url}/sitemap.xml`,
    '',
  ].join('\n');
}
