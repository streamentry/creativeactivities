import { describe, expect, it } from 'vitest';
import { classify } from '../../scripts/check-budget.mjs';

describe('which page weight budget a page gets (WEB-074)', () => {
  it('gives home pages the landing budget, in every language', () => {
    expect(classify('index.html')).toBe('landing');
    expect(classify('de/index.html')).toBe('landing');
    expect(classify('pt-br/index.html')).toBe('landing');
  });

  it('gives the finder, the games, Today and the pack builder the app budget', () => {
    expect(classify('activity/index.html')).toBe('app');
    expect(classify('games/picture-pairs/index.html')).toBe('app');
    expect(classify('de/games/index.html')).toBe('app');
    expect(classify('today/index.html')).toBe('app');
    expect(classify('activity/pack/index.html')).toBe('app');
  });

  it('gives every other page the microsite budget, a card and a pack of cards included', () => {
    expect(classify('activity/wrap-a-small-gift/index.html')).toBe('microsite');
    expect(classify('activity/packs/five-quiet-bedside-activities/index.html')).toBe('microsite');
    expect(classify('seniors/index.html')).toBe('microsite');
    expect(classify('seasons/winter/index.html')).toBe('microsite');
  });
});
