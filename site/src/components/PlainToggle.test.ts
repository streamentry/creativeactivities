import { describe, expect, it } from 'vitest';
import {
  PLAIN_STORAGE_KEY,
  applyPlainMode,
  findStepLists,
  readPlainPreference,
  savePlainPreference,
  type KeyValueStore,
  type StepLists,
} from './PlainToggle';

/** A stand-in for a list element: only `hidden` matters to the toggle. */
const fakeList = (hidden: boolean): HTMLElement => ({ hidden }) as HTMLElement;

const lists = (): StepLists & { standard: HTMLElement; plain: HTMLElement } => ({
  standard: fakeList(false),
  plain: fakeList(true),
});

/** A Map-backed store; `broken` makes every call throw, like blocked or private storage. */
const memory = (broken = false): KeyValueStore & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => {
      if (broken) throw new DOMException('blocked', 'SecurityError');
      return data.get(key) ?? null;
    },
    setItem: (key, value) => {
      if (broken) throw new DOMException('blocked', 'QuotaExceededError');
      data.set(key, value);
    },
  };
};

describe('PlainToggle', () => {
  it('swaps hidden between the standard and plain lists', () => {
    const l = lists();
    applyPlainMode(l, true);
    expect(l.standard.hidden).toBe(true);
    expect(l.plain.hidden).toBe(false);
    applyPlainMode(l, false);
    expect(l.standard.hidden).toBe(false);
    expect(l.plain.hidden).toBe(true);
  });

  it('does nothing to a missing list', () => {
    const standard = fakeList(false);
    const l: StepLists = { standard, plain: null };
    expect(() => applyPlainMode(l, true)).not.toThrow();
    expect(standard.hidden).toBe(true);
  });

  it('remembers the choice under the ca-plain-steps key', () => {
    const store = memory();
    savePlainPreference(store, true);
    expect(store.data.get(PLAIN_STORAGE_KEY)).toBe('1');
    expect(readPlainPreference(store)).toBe(true);
    savePlainPreference(store, false);
    expect(readPlainPreference(store)).toBe(false);
  });

  it('survives a throwing localStorage: reads as off and writes nothing', () => {
    const store = memory(true);
    expect(readPlainPreference(store)).toBe(false);
    expect(() => savePlainPreference(store, true)).not.toThrow();
  });

  it('treats a missing store as off', () => {
    expect(readPlainPreference(null)).toBe(false);
    expect(() => savePlainPreference(null, true)).not.toThrow();
  });

  it('finds the two lists inside a section and ignores other lists', () => {
    const section = {
      querySelector: (selector: string) =>
        selector === 'ol.activity-steps--plain'
          ? 'PLAIN'
          : selector === 'ol.activity-steps:not(.activity-steps--plain)'
            ? 'STANDARD'
            : null,
    } as unknown as ParentNode;
    expect(findStepLists(section)).toEqual({ standard: 'STANDARD', plain: 'PLAIN' });
    expect(findStepLists(null)).toEqual({ standard: null, plain: null });
  });
});
