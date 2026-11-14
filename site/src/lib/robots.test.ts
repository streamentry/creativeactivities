import { describe, expect, it } from 'vitest';
import { AI_CRAWLERS, renderRobots } from './robots';

describe('renderRobots', () => {
  const text = renderRobots();

  it('allows everyone and lists the sitemap index', () => {
    expect(text).toMatch(/^User-agent: \*\nAllow: \/$/m);
    expect(text).toContain('Sitemap: https://creativeactivities.org/sitemap.xml');
  });

  it('names each AI crawler with its own allow rule and never disallows anything', () => {
    for (const bot of AI_CRAWLERS) expect(text).toContain(`User-agent: ${bot}\nAllow: /\n`);
    expect(text).not.toMatch(/^Disallow:/m);
  });
});
