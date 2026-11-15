import { describe, expect, it } from 'vitest';
import { lowerEffortPick, lowerEffortReasons, type EffortFacts } from './lower-effort';

const BASE: EffortFacts = { slug: 'base', energy: 'medium', cost: 'low', materials: 5, prepMinutes: 10 };
const card = (slug: string, change: Partial<EffortFacts> = {}): EffortFacts => ({ ...BASE, slug, ...change });

describe('lowerEffortPick (WEB-004)', () => {
  it('returns nothing when there is no other card', () => {
    expect(lowerEffortPick(BASE, [])).toBeUndefined();
    expect(lowerEffortPick(BASE, [BASE])).toBeUndefined();
  });

  it('never offers the same card as the top result, even if it is the only lower one', () => {
    const top = card('top', { energy: 'low', materials: 2 });
    expect(lowerEffortPick(top, [top])).toBeUndefined();
  });

  it('prefers fewer materials or less energy, and is strictly lower on one of them', () => {
    const top = card('top');
    const fewerThings = card('fewer-things', { materials: 2 });
    const lessEnergy = card('less-energy', { energy: 'low' });
    expect(lowerEffortPick(top, [fewerThings])?.slug).toBe('fewer-things');
    expect(lowerEffortPick(top, [lessEnergy])?.slug).toBe('less-energy');
  });

  it('never picks a card that is higher than the top on any dimension', () => {
    const top = card('top', { energy: 'low', materials: 3 });
    const heavier = card('heavier', { energy: 'medium', materials: 1 });
    expect(lowerEffortPick(top, [heavier])).toBeUndefined();
  });

  it('never picks a card that is level with the top on everything', () => {
    const top = card('top');
    expect(lowerEffortPick(top, [card('twin')])).toBeUndefined();
  });

  it('chooses the least effort, and keeps the first card on a tie', () => {
    const top = card('top');
    const pick = lowerEffortPick(top, [
      card('one', { materials: 4 }),
      card('two', { energy: 'low', materials: 1, cost: 'free' }),
      card('three', { energy: 'low', materials: 1, cost: 'free' }),
    ]);
    expect(pick?.slug).toBe('two');
  });
});

describe('lowerEffortReasons', () => {
  it('says what is lighter, in plain words', () => {
    const top = card('top');
    const pick = card('lighter', { energy: 'low', materials: 2, cost: 'free', prepMinutes: 0 });
    expect(lowerEffortReasons(pick, top)).toEqual([
      'less energy, mostly sitting still',
      'fewer things to gather',
      'nothing to buy',
      'no setup',
    ]);
  });

  it('says only what really differs', () => {
    expect(lowerEffortReasons(card('x', { materials: 2 }), BASE)).toEqual(['fewer things to gather']);
  });
});
