import { describe, expect, it } from 'vitest';
import { renderRobots } from './robots';
import { SEARCH_CRAWLERS, TRAINING_CRAWLERS, USER_TRIGGERED_CRAWLERS } from './ai-crawlers';

/** Splits the file into groups: each starts with one or more User-agent lines. */
function groups(text: string): Map<string, string[]> {
  const map = new Map<string, string[]>();
  let current: string[] = [];
  for (const line of text.split('\n')) {
    const ua = /^User-agent: (.+)$/.exec(line);
    if (ua) {
      current = map.get(ua[1]) ?? [];
      map.set(ua[1], current);
    } else if (/^(Allow|Disallow):/.test(line)) {
      current.push(line);
    }
  }
  return map;
}

describe('renderRobots', () => {
  const text = renderRobots();
  const rules = groups(text);

  it('allows everyone by default and lists the sitemap index', () => {
    expect(text).toMatch(/^User-agent: \*\nAllow: \/$/m);
    expect(text).toContain('Sitemap: https://creativeactivities.org/sitemap.xml');
  });

  it('allows each search crawler, including Googlebot and Bingbot', () => {
    for (const bot of ['Googlebot', 'Bingbot', 'OAI-SearchBot']) expect(SEARCH_CRAWLERS).toContain(bot);
    for (const bot of SEARCH_CRAWLERS) expect(rules.get(bot), bot).toEqual(['Allow: /']);
  });

  it('allows user-triggered fetchers', () => {
    for (const bot of USER_TRIGGERED_CRAWLERS) expect(rules.get(bot), bot).toEqual(['Allow: /']);
  });

  it('disallows each training crawler', () => {
    for (const bot of ['GPTBot', 'Google-Extended', 'CCBot', 'ClaudeBot', 'anthropic-ai', 'Applebot-Extended', 'Bytespider']) {
      expect(TRAINING_CRAWLERS).toContain(bot);
    }
    for (const bot of TRAINING_CRAWLERS) expect(rules.get(bot), bot).toEqual(['Disallow: /']);
  });

  it('never blocks a search crawler with a disallow rule', () => {
    for (const bot of SEARCH_CRAWLERS) expect(rules.get(bot)?.some((r) => r.startsWith('Disallow')), bot).toBe(false);
    expect(rules.get('*')).toEqual(['Allow: /']);
  });

  it('has no training crawler that is also a search or user crawler', () => {
    const overlap = TRAINING_CRAWLERS.filter((bot) => (SEARCH_CRAWLERS as readonly string[]).includes(bot));
    expect(overlap).toEqual([]);
  });
});
