import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { RETIRED_GUIDES, RETIRED_SECTIONS, guideIdOfPath, isRetiredGuide } from './retired-guides';

const content = (p: string) => new URL(`../content/${p}`, import.meta.url);
// content.config.ts imports astro:content, which vitest cannot load; read the slug list instead.
const GAME_SLUGS = [...readFileSync(new URL('../content.config.ts', import.meta.url), 'utf8').split('GAME_SLUGS = [')[1]!.split(']')[0]!.matchAll(/'([a-z-]+)'/g)].map((m) => m[1]!);

/** True when a path is a page the build produces (a live guide, a hub, or a game page). */
function pageExists(path: string): boolean {
  if (path === '/games/') return true;
  const game = /^\/games\/([a-z-]+)\/$/.exec(path);
  if (game) return GAME_SLUGS.includes(game[1]!);
  const hub = /^\/([a-z0-9-]+)\/$/.exec(path);
  if (hub) return existsSync(content(`hubs/${hub[1]}.md`));
  const id = guideIdOfPath(path);
  return id !== null && !isRetiredGuide(id) && existsSync(content(`guides/${id}.md`));
}

describe('retired guides map (content)', () => {
  it('only retires guides that exist, so their translations stay valid', () => {
    for (const id of Object.keys(RETIRED_GUIDES)) expect(existsSync(content(`guides/${id}.md`)), id).toBe(true);
  });

  it('sends every retired address to a page that exists', () => {
    for (const [from, to] of [...Object.entries(RETIRED_GUIDES), ...Object.entries(RETIRED_SECTIONS)]) {
      expect(pageExists(to), `${from} → ${to}`).toBe(true);
    }
  });
});
