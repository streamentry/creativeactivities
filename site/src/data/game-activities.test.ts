import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { GAMES } from './games';
import { GAME_ACTIVITIES } from './game-activities';

describe('game activity suggestions', () => {
  it('suggests two or three existing cards for every game', () => {
    for (const { slug } of GAMES) {
      const cards = GAME_ACTIVITIES[slug as keyof typeof GAME_ACTIVITIES] ?? [];
      expect(cards.length, slug).toBeGreaterThanOrEqual(2);
      expect(cards.length, slug).toBeLessThanOrEqual(3);
      for (const card of cards) {
        expect(existsSync(new URL(`../content/activity-cards/${card}.md`, import.meta.url)), `${slug} → ${card}`).toBe(true);
      }
    }
  });
});
