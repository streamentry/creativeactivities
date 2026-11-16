import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { TRIED_STORAGE_KEY, loadTried, markTried } from './activity-feedback';
import {
  FRESH,
  PATHS_STORAGE_KEY,
  PRESSURE_WORDS,
  WEEKS_PER_PATH,
  applyAction,
  commitAction,
  loadPaths,
  nextWeek,
  parsePaths,
  progressOf,
  savePaths,
  triedCounts,
  type PathAction,
  type PathsState,
} from './paths';

const KNOWN = new Set(['a-path', 'b-path']);

function fakeStorage(initial: Record<string, string> = {}, refuse = false) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => {
      if (refuse) throw new Error('blocked');
      return data.get(key) ?? null;
    },
    setItem: (key: string, value: string) => {
      if (refuse) throw new Error('blocked');
      data.set(key, value);
    },
    removeItem: (key: string) => {
      if (refuse) throw new Error('blocked');
      data.delete(key);
    },
    raw: (key: string) => data.get(key) ?? null,
  };
}

describe('reading a stored place (WEB-032)', () => {
  it('reads a start and the weeks set aside, in order and once each', () => {
    const raw = JSON.stringify({ 'a-path': { start: 2, skipped: [3, 1, 1] } });
    expect(parsePaths(raw, KNOWN)).toEqual({ 'a-path': { start: 2, skipped: [1, 3] } });
  });

  it('reads nothing from nothing, bad JSON, or the wrong shape', () => {
    expect(parsePaths(null, KNOWN)).toEqual({});
    expect(parsePaths('', KNOWN)).toEqual({});
    expect(parsePaths('{not json', KNOWN)).toEqual({});
    expect(parsePaths('[1,2]', KNOWN)).toEqual({});
    expect(parsePaths('"a-path"', KNOWN)).toEqual({});
    expect(parsePaths('null', KNOWN)).toEqual({});
  });

  it('keeps only paths that exist and weeks that exist', () => {
    const raw = JSON.stringify({
      'a-path': { start: 9, skipped: [0, 4, -1, 1.5, '2', null] },
      'gone-path': { start: 1, skipped: [1] },
      __proto__: { start: 1 },
      constructor: { start: 1 },
    });
    expect(parsePaths(raw, KNOWN)).toEqual({ 'a-path': { start: 0, skipped: [0] } });
  });

  it('drops a path whose place is the beginning with nothing set aside', () => {
    expect(parsePaths(JSON.stringify({ 'a-path': { start: 0, skipped: [] } }), KNOWN)).toEqual({});
    expect(parsePaths(JSON.stringify({ 'a-path': {} }), KNOWN)).toEqual({});
  });

  it('survives a browser that refuses storage', () => {
    expect(loadPaths(fakeStorage({}, true), KNOWN)).toEqual({});
    expect(loadPaths(undefined, KNOWN)).toEqual({});
    expect(savePaths(fakeStorage({}, true), { 'a-path': { start: 1, skipped: [] } })).toBe(false);
    expect(savePaths(undefined, {})).toBe(false);
  });

  it('keeps a place and reads it back, and removes the key when there is nothing to keep', () => {
    const storage = fakeStorage();
    const state: PathsState = { 'a-path': { start: 1, skipped: [2] }, 'b-path': { start: 0, skipped: [0, 3] } };
    expect(savePaths(storage, state)).toBe(true);
    expect(loadPaths(storage, KNOWN)).toEqual(state);
    expect(savePaths(storage, {})).toBe(true);
    expect(storage.raw(PATHS_STORAGE_KEY)).toBeNull();
  });
});

describe('keeping a tap on this device (WEB-032)', () => {
  const taps: PathAction[] = [
    { type: 'start', path: 'a-path', week: 2 },
    { type: 'skip', path: 'a-path', week: 0 },
    { type: 'skip', path: 'a-path', week: 3 },
  ];

  it('keeps each tap when the device accepts them', () => {
    const storage = fakeStorage();
    let onPage: PathsState = {};
    let kept = true;
    for (const action of taps) ({ state: onPage, kept } = commitAction(storage, KNOWN, onPage, kept, action));
    expect(kept).toBe(true);
    expect(onPage).toEqual({ 'a-path': { start: 2, skipped: [0, 3] } });
    expect(loadPaths(storage, KNOWN)).toEqual(onPage);
  });

  it('keeps every tap on the page when the device refuses them, and says the save was not kept', () => {
    const storage = fakeStorage({}, true);
    let onPage: PathsState = {};
    let kept = true;
    const results: boolean[] = [];
    for (const action of taps) {
      ({ state: onPage, kept } = commitAction(storage, KNOWN, onPage, kept, action));
      results.push(kept);
    }
    // The same places as when the device accepts them: an earlier tap is never lost to a refused save.
    expect(onPage).toEqual({ 'a-path': { start: 2, skipped: [0, 3] } });
    expect(results).toEqual([false, false, false]);
  });

  it('with no storage at all, still keeps the taps on the page', () => {
    let onPage: PathsState = {};
    let kept = true;
    for (const action of taps) ({ state: onPage, kept } = commitAction(undefined, KNOWN, onPage, kept, action));
    expect(onPage).toEqual({ 'a-path': { start: 2, skipped: [0, 3] } });
    expect(kept).toBe(false);
  });

  it('builds on what another tab kept, so a second path is never overwritten', () => {
    const storage = fakeStorage();
    // This page knows nothing of b-path; another tab kept a place there meanwhile.
    storage.setItem(PATHS_STORAGE_KEY, JSON.stringify({ 'b-path': { start: 1, skipped: [2] } }));
    const { state } = commitAction(storage, KNOWN, {}, true, { type: 'skip', path: 'a-path', week: 1 });
    expect(state).toEqual({ 'a-path': { start: 0, skipped: [1] }, 'b-path': { start: 1, skipped: [2] } });
    expect(loadPaths(storage, KNOWN)).toEqual(state);
  });
});

describe('what a person can do on a path (WEB-032)', () => {
  it('starts at a week, and a week started at is no longer set aside', () => {
    const skipped = applyAction({}, { type: 'skip', path: 'a-path', week: 2 });
    const started = applyAction(skipped, { type: 'start', path: 'a-path', week: 2 });
    expect(progressOf(started, 'a-path')).toEqual({ start: 2, skipped: [] });
  });

  it('skips a week in one step, keeps the weeks in order and each once, and brings it back in one step', () => {
    let state: PathsState = {};
    for (const week of [3, 1, 3]) state = applyAction(state, { type: 'skip', path: 'a-path', week });
    expect(progressOf(state, 'a-path').skipped).toEqual([1, 3]);
    state = applyAction(state, { type: 'unskip', path: 'a-path', week: 1 });
    expect(progressOf(state, 'a-path').skipped).toEqual([3]);
    state = applyAction(state, { type: 'unskip', path: 'a-path', week: 3 });
    expect(state).toEqual({});
  });

  it('forgets one path and leaves the others', () => {
    let state: PathsState = {};
    state = applyAction(state, { type: 'start', path: 'a-path', week: 2 });
    state = applyAction(state, { type: 'skip', path: 'b-path', week: 0 });
    state = applyAction(state, { type: 'forget', path: 'a-path' });
    expect(state).toEqual({ 'b-path': { start: 0, skipped: [0] } });
  });

  it('ignores a week that does not exist, and leaves the old state untouched', () => {
    const before: PathsState = Object.freeze({ 'a-path': Object.freeze({ start: 1, skipped: Object.freeze([2]) }) });
    for (const week of [-1, 4, 1.5, Number.NaN]) {
      expect(applyAction(before, { type: 'start', path: 'a-path', week })).toBe(before);
      expect(applyAction(before, { type: 'skip', path: 'a-path', week })).toBe(before);
      expect(applyAction(before, { type: 'unskip', path: 'a-path', week })).toBe(before);
    }
    applyAction(before, { type: 'skip', path: 'a-path', week: 0 });
    expect(before).toEqual({ 'a-path': { start: 1, skipped: [2] } });
  });

  it('points at the first week from the start that is not set aside, or at none', () => {
    expect(nextWeek(FRESH)).toBe(0);
    expect(nextWeek({ start: 0, skipped: [0, 1] })).toBe(2);
    expect(nextWeek({ start: 2, skipped: [] })).toBe(2);
    expect(nextWeek({ start: 2, skipped: [2] })).toBe(3);
    expect(nextWeek({ start: 2, skipped: [2, 3] })).toBeNull();
    // A week before the start is not "next", set aside or not.
    expect(nextWeek({ start: 3, skipped: [] })).toBe(3);
  });
});

describe('tried counts (WEB-032)', () => {
  const weeks = [['a', 'b'], ['c', 'd'], ['e'], ['f', 'a']];

  it('counts the path activities on the tried list, in total and by week', () => {
    const counts = triedCounts(weeks, new Set(['a', 'c', 'zzz']));
    expect(counts.of).toBe(6);
    expect(counts.tried).toBe(2);
    expect(counts.byWeek).toEqual([
      { tried: 1, of: 2 },
      { tried: 1, of: 2 },
      { tried: 0, of: 1 },
      { tried: 1, of: 2 },
    ]);
  });

  it('counts an activity once however many weeks list it', () => {
    expect(triedCounts([['a'], ['a']], new Set(['a'])).tried).toBe(1);
  });

  it('counts nothing for an empty tried list', () => {
    expect(triedCounts(weeks, new Set()).tried).toBe(0);
  });
});

/** A small seeded generator, so a failure is the same failure next time. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('counts never go down (WEB-032 acceptance, a test and not a style)', () => {
  const pathWeeks = { 'a-path': [['a1', 'a2'], ['a3', 'a4'], ['a5', 'a6'], ['a7', 'a8']], 'b-path': [['b1', 'b2'], ['b3', 'b4'], ['b5', 'b6'], ['b7', 'b8']] };
  const everyActivity = Object.values(pathWeeks).flat(2);
  const ids = Object.keys(pathWeeks);

  it.each([1, 2, 3, 4, 5, 6, 7, 8])('holds over a long random run of everything a person can do (seed %i)', (seed) => {
    const rand = seeded(seed * 7919);
    const pick = <T,>(items: readonly T[]): T => items[Math.floor(rand() * items.length)] as T;
    const storage = fakeStorage();
    const known = new Set(ids);
    let state: PathsState = {};
    let previous: Record<string, number> = { 'a-path': 0, 'b-path': 0 };

    for (let step = 0; step < 400; step += 1) {
      const roll = rand();
      const triedBefore = storage.raw(TRIED_STORAGE_KEY);
      if (roll < 0.25) {
        // A person marks an activity as tried, on its own page: the one thing that raises a count.
        markTried(storage, pick(everyActivity));
      } else if (roll < 0.9) {
        const path = pick(ids);
        const week = Math.floor(rand() * (WEEKS_PER_PATH + 2)) - 1; // includes weeks that do not exist
        const kinds: PathAction[] = [
          { type: 'start', path, week },
          { type: 'skip', path, week },
          { type: 'unskip', path, week },
          { type: 'forget', path },
        ];
        state = applyAction(state, pick(kinds));
        savePaths(storage, state);
        // Whatever a person does on a path, the tried list is exactly as it was.
        expect(storage.raw(TRIED_STORAGE_KEY), `step ${step}`).toBe(triedBefore);
      } else {
        // The page is opened again.
        state = loadPaths(storage, known);
      }
      const tried = new Set(loadTried(storage));
      for (const id of ids) {
        const count = triedCounts(pathWeeks[id as keyof typeof pathWeeks], tried).tried;
        expect(count, `${id} at step ${step}`).toBeGreaterThanOrEqual(previous[id] as number);
        previous = { ...previous, [id]: count };
      }
    }
  });

  it('is the same count after skipping every week and bringing every week back', () => {
    const tried = new Set(['a1', 'a3']);
    const before = triedCounts(pathWeeks['a-path'], tried);
    let state: PathsState = {};
    for (let week = 0; week < WEEKS_PER_PATH; week += 1) state = applyAction(state, { type: 'skip', path: 'a-path', week });
    expect(triedCounts(pathWeeks['a-path'], tried)).toEqual(before);
    for (let week = 0; week < WEEKS_PER_PATH; week += 1) state = applyAction(state, { type: 'unskip', path: 'a-path', week });
    expect(triedCounts(pathWeeks['a-path'], tried)).toEqual(before);
  });
});

describe('what the paths page keeps, sends and says (WEB-032)', () => {
  const island = readFileSync(new URL('../tools/PathPlan.tsx', import.meta.url), 'utf8');
  // The words of the code, without the comments that explain it.
  const code = island.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

  it('sends nothing and counts nothing', () => {
    expect(code).not.toMatch(/sessionStorage|indexedDB|document\.cookie|sendBeacon|gtag|dataLayer|\btrack\(/);
    expect(code).not.toMatch(/\bfetch\(|XMLHttpRequest|WebSocket|new Image\(/);
  });

  it('keeps a place only through the one key, and only reads the tried list', () => {
    expect(code).not.toMatch(/setItem|removeItem|localStorage/);
    expect(code).toContain('commitAction(');
    expect(code).toContain('loadTried(');
    expect(code).not.toMatch(/markTried|TRIED_STORAGE_KEY/);
  });

  it('keeps nothing about a person in the address', () => {
    expect(code).not.toMatch(/history\.|location\.(?:search|hash|href|assign|replace)|URLSearchParams/);
  });

  it('has no place to type', () => {
    expect(code).not.toMatch(/type="(?:text|search|email|tel|url|number|password)"|<textarea|contentEditable/i);
  });

  it('styles with classes only, as the content security policy blocks style attributes', () => {
    expect(code).not.toMatch(/\bstyle=/);
  });

  it('says nothing that makes a path a streak, a schedule or a debt', () => {
    expect(code).not.toMatch(PRESSURE_WORDS);
  });

  it('keeps that promise on the pages too, in the words a visitor reads', () => {
    for (const file of ['../views/PathView.astro', '../pages/paths/index.astro', '../pages/paths/[slug].astro']) {
      const source = readFileSync(new URL(file, import.meta.url), 'utf8');
      // The words of the page, without the comments and styles that explain it.
      const words = source
        .replace(/<style[\s\S]*?<\/style>/g, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:])\/\/.*$/gm, '$1');
      expect(words, file).not.toMatch(PRESSURE_WORDS);
    }
  });
});
