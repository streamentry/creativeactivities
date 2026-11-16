import { describe, expect, it } from 'vitest';
import { MATERIAL_TAGS } from '../data/materials';
import {
  STORAGE_KEY,
  canMake,
  choiceLabels,
  loadHave,
  matchCards,
  parseHave,
  saveHave,
  unlockers,
  unmetGroups,
} from './what-i-have';

const have = (...ids: string[]) => new Set(ids);

describe('what a ticked list can make (WEB-006)', () => {
  const needs = [['glue-stick', 'tape'], ['plain-paper']];

  it('is ready only when every group has a ticked item', () => {
    expect(canMake(needs, have('plain-paper', 'tape'))).toBe(true);
    expect(canMake(needs, have('plain-paper', 'glue-stick'))).toBe(true);
    expect(canMake(needs, have('plain-paper'))).toBe(false);
    expect(canMake(needs, have('glue-stick', 'tape'))).toBe(false);
  });

  it('is always ready for a card that needs nothing', () => {
    expect(canMake([], have())).toBe(true);
  });

  it('names the groups still unmet, with their choices', () => {
    expect(unmetGroups(needs, have('plain-paper'))).toEqual([['glue-stick', 'tape']]);
    expect(unmetGroups(needs, have())).toEqual(needs.map((g) => [...g]));
  });

  it('never calls a card ready when an item it needs was not ticked', () => {
    const cards = [
      { id: 'a', needs: [['plain-paper'], ['pencil']] },
      { id: 'b', needs: [['plain-paper']] },
      { id: 'c', needs: [] },
    ];
    for (const ticked of [[], ['plain-paper'], ['pencil'], ['plain-paper', 'pencil']]) {
      const h = have(...ticked);
      for (const id of matchCards(cards, h).ready) {
        for (const group of cards.find((c) => c.id === id)?.needs ?? []) {
          expect(group.some((t) => h.has(t)), `${id} with ${ticked.join(',') || 'nothing'}`).toBe(true);
        }
      }
    }
  });

  it('sorts cards into ready and one group short, keeping the order given', () => {
    const cards = [
      { id: 'a', needs: [['plain-paper'], ['pencil']] },
      { id: 'b', needs: [['plain-paper']] },
      { id: 'c', needs: [['yarn'], ['scissors'], ['tape']] },
      { id: 'd', needs: [] },
    ];
    const m = matchCards(cards, have('plain-paper'));
    expect(m.ready).toEqual(['b', 'd']);
    expect(m.oneAway).toEqual([{ id: 'a', missing: ['pencil'] }]);
  });

  it('suggests the items that would unlock the most cards, ties in list order', () => {
    const oneAway = [
      { id: 'a', missing: ['tape', 'glue-stick'] },
      { id: 'b', missing: ['glue-stick'] },
      { id: 'c', missing: ['yarn'] },
    ];
    const tips = unlockers(oneAway, have());
    expect(tips[0]).toEqual({ id: 'glue-stick', unlocks: 2 });
    expect(tips.map((t) => t.id)).toEqual(['glue-stick', 'tape', 'yarn']);
    expect(unlockers(oneAway, have('glue-stick')).map((t) => t.id)).toEqual(['tape', 'yarn']);
  });

  it('turns choices into the words shown to a person', () => {
    expect(choiceLabels(['glue-stick', 'tape'])).toEqual(['A glue stick', MATERIAL_TAGS.find((t) => t.id === 'tape')?.label]);
    expect(choiceLabels(['unknown-item'])).toEqual(['unknown-item']);
  });
});

describe('keeping the list on the device', () => {
  it('keeps only known items, once each, in list order', () => {
    expect(parseHave('["pencil","plain-paper","pencil","made-up",3,null]')).toEqual(['plain-paper', 'pencil']);
  });

  it('reads anything else as an empty list', () => {
    for (const raw of [null, '', 'not json', '{"a":1}', '"pencil"', '42']) expect(parseHave(raw), String(raw)).toEqual([]);
  });

  it('stores and reads back, and says when the browser refuses', () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    };
    expect(saveHave(storage, ['pencil', 'plain-paper'])).toBe(true);
    expect(store.get(STORAGE_KEY)).toBe('["pencil","plain-paper"]');
    expect(loadHave(storage)).toEqual(['plain-paper', 'pencil']);
    expect(saveHave(undefined, ['pencil'])).toBe(false);
    expect(
      saveHave({ setItem: () => { throw new Error('blocked'); } }, ['pencil']),
    ).toBe(false);
    expect(loadHave({ getItem: () => { throw new Error('blocked'); } })).toEqual([]);
    expect(loadHave(undefined)).toEqual([]);
  });

  it('stores an emptied list as an empty list', () => {
    const store = new Map<string, string>();
    const storage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) };
    saveHave(storage, []);
    expect(loadHave(storage)).toEqual([]);
    expect(store.get(STORAGE_KEY)).toBe('[]');
  });
});
