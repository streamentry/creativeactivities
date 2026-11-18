import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * WEB-053: changing the picture count keeps the place. A game that rebuilt its
 * round whenever the count changed would throw away what a person had found,
 * so these sources must resize the round they have instead.
 */
const source = (name: string) => readFileSync(new URL(`./${name}.tsx`, import.meta.url), 'utf8');

const RESIZERS: Record<string, string> = {
  FindTheSame: 'resizePicks',
  ShadowMatch: 'resizePicks',
  OddOneOut: 'resizeOddState',
  FourTogether: 'resizeTogetherState',
  PicturePairs: 'resizeValues',
  StoryDice: 'resizeDice',
  ColorMatch: 'resizeColorState',
  HalvesMatch: 'resizeHalvesState',
};

describe('changing the count keeps the place', () => {
  for (const [game, resizer] of Object.entries(RESIZERS)) {
    it(`${game} resizes the round with ${resizer} instead of starting a new one`, () => {
      const text = source(game);
      expect(text).toContain(resizer);
      expect(text).toMatch(/const change(Count|Size) = /);
    });

    it(`${game} does not rebuild the round in an effect that depends on the count`, () => {
      const text = source(game);
      // An effect that lists the count (or size) as its only dependency would run on every change.
      expect(text).not.toMatch(/\}, \[(count|size)\]\)/);
    });
  }

  it('Picture pairs keeps its board when only the view changes', () => {
    const text = source('PicturePairs');
    expect(text).not.toMatch(/setView\(v\);\s*restart\(\)/);
    expect(text).toContain('keepPlace');
  });
});
