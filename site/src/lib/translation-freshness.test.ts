import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import {
  daysBehind,
  groupByGuide,
  isProtected,
  isStale,
  queueOrder,
  readFreshnessFields,
} from '../../scripts/translation-freshness-lib.mjs';
import { parseRetiredIds, readTranslations, staleQueue } from '../../scripts/translation-queue.mjs';
import { RETIRED_GUIDES } from './retired-guides';

/** L10N-021: a translation made from an older English page is stale, found from two dates. */
describe('isStale and daysBehind', () => {
  it('is stale only when the translation is from an older English page', () => {
    expect(isStale('2026-10-25', '2026-11-11')).toBe(true);
    expect(isStale('2026-11-11', '2026-11-11')).toBe(false);
    expect(isStale('2026-11-12', '2026-11-11')).toBe(false);
  });

  it('never calls a page stale from a missing or unreadable date', () => {
    expect(isStale('', '2026-11-11')).toBe(false);
    expect(isStale('2026-10-25', '')).toBe(false);
    expect(isStale('yesterday', '2026-11-11')).toBe(false);
    expect(isStale('2026-02-30', '2026-11-11')).toBe(false);
  });

  it('counts whole days behind, and zero when current or unreadable', () => {
    expect(daysBehind('2026-10-25', '2026-11-11')).toBe(17);
    expect(daysBehind('2026-11-11', '2026-11-11')).toBe(0);
    expect(daysBehind('2026-11-12', '2026-11-11')).toBe(0);
    expect(daysBehind('', '2026-11-11')).toBe(0);
  });
});

describe('readFreshnessFields', () => {
  it('reads quoted and plain dates and the protection flags', () => {
    const fm = 'title: "A"\nupdated: 2026-11-11\ntranslatedFrom: "2026-10-25"\nhealth: true\ncrisisRoute: false';
    expect(readFreshnessFields(fm)).toEqual({ updated: '2026-11-11', translatedFrom: '2026-10-25', health: true, crisisRoute: false });
  });

  it('reports a missing field as null or false instead of inventing one', () => {
    expect(readFreshnessFields('title: "A"')).toEqual({ updated: null, translatedFrom: null, health: false, crisisRoute: false });
  });

  it('does not mistake a dated line inside a list for the page date', () => {
    expect(readFreshnessFields('sources:\n  - title: "x"\n    updated: 2020-01-01').updated).toBeNull();
  });

  it('treats health advice and the crisis route as protected', () => {
    expect(isProtected({ health: true, crisisRoute: false })).toBe(true);
    expect(isProtected({ health: false, crisisRoute: true })).toBe(true);
    expect(isProtected({ health: false, crisisRoute: false })).toBe(false);
  });
});

describe('the re-review queue', () => {
  const items = [
    { id: 'b', lang: 'fr', protected: false, daysBehind: 30 },
    { id: 'a', lang: 'fr', protected: false, daysBehind: 5 },
    { id: 'c', lang: 'es', protected: true, daysBehind: 1 },
    { id: 'c', lang: 'de', protected: true, daysBehind: 1 },
    { id: 'a', lang: 'de', protected: false, daysBehind: 5 },
  ];

  it('puts protected guides first, then the most days behind, then a fixed order', () => {
    expect(queueOrder(items).map((i) => `${i.id}/${i.lang}`)).toEqual(['c/de', 'c/es', 'b/fr', 'a/de', 'a/fr']);
  });

  it('gives the same order whatever order it is given', () => {
    expect(queueOrder([...items].reverse())).toEqual(queueOrder(items));
  });

  it('does not change the list it is given', () => {
    const copy = items.map((i) => ({ ...i }));
    queueOrder(items);
    expect(items).toEqual(copy);
  });

  it('groups by English guide in review order', () => {
    const groups = groupByGuide(items);
    expect(groups.map((g) => g.id)).toEqual(['c', 'b', 'a']);
    expect(groups[0]).toMatchObject({ protected: true, languages: ['de', 'es'] });
    expect(groups[2]?.languages).toEqual(['de', 'fr']);
  });
});

describe('reading a content folder', () => {
  const root = mkdtempSync(join(tmpdir(), 'freshness-'));
  afterAll(() => rmSync(root, { recursive: true, force: true }));

  const write = (path: string, frontmatter: string) => {
    const file = join(root, path);
    mkdirSync(join(file, '..'), { recursive: true });
    writeFileSync(file, `---\n${frontmatter}\n---\nBody\n`);
  };
  write('guides/caregiving/water.md', 'updated: 2026-11-11\nhealth: true');
  write('guides/activities/games.md', 'updated: 2026-11-11');
  write('guides-i18n/fr/caregiving/water.md', 'updated: 2026-11-11\ntranslatedFrom: 2026-11-11');
  write('guides-i18n/es/caregiving/water.md', 'updated: 2026-10-01\ntranslatedFrom: 2026-10-25');
  write('guides-i18n/es/activities/games.md', 'updated: 2026-10-01\ntranslatedFrom: 2026-10-25');
  write('guides-i18n/de/activities/gone.md', 'updated: 2026-10-01\ntranslatedFrom: 2026-10-25');

  it('finds the stale translations and marks the protected one', () => {
    const queue = staleQueue(readTranslations(root, new Set()));
    expect(queue.map((q: { id: string; lang: string }) => `${q.lang}/${q.id}`)).toEqual(['es/caregiving/water', 'es/activities/games']);
    expect(queue[0]).toMatchObject({ protected: true, daysBehind: 17 });
    expect(queue[1]).toMatchObject({ protected: false });
  });

  it('does not queue a translation behind a retired English guide, but still reports it as stale', () => {
    const all = readTranslations(root, new Set(['activities/games']));
    const games = all.find((t: { lang: string; id: string }) => t.lang === 'es' && t.id === 'activities/games');
    expect(games).toMatchObject({ stale: true, retired: true });
    expect(staleQueue(all).map((q: { id: string }) => q.id)).toEqual(['caregiving/water']);
  });

  it('leaves a current translation out and skips one with no English source', () => {
    const all = readTranslations(root, new Set());
    expect(all.find((t: { lang: string; id: string }) => t.lang === 'fr')?.stale).toBe(false);
    expect(all.some((t: { id: string }) => t.id === 'activities/gone')).toBe(false);
  });
});

describe('the retired guide list', () => {
  it('is read from the RETIRED_GUIDES table without drifting from it', () => {
    expect([...parseRetiredIds()].sort()).toEqual(Object.keys(RETIRED_GUIDES).sort());
  });

  it('reads nothing from text that has no table', () => {
    expect(parseRetiredIds('const x = 1;')).toEqual([]);
  });
});

describe('the real content', () => {
  const all = readTranslations();

  it('has translations to check', () => {
    expect(all.length).toBeGreaterThan(1000);
  });

  it('has no translation made from an English version dated after the English page', () => {
    // A translatedFrom later than the English `updated` would mean the page claims a source from the future.
    const future = all.filter(
      (t: { translatedFrom: string | null; englishUpdated: string | null }) =>
        t.translatedFrom !== null && t.englishUpdated !== null && t.translatedFrom > t.englishUpdated,
    );
    expect(future.map((t: { file: string }) => t.file)).toEqual([]);
  });

  it('reads a date for every translation and its English page', () => {
    const missing = all.filter(
      (t: { translatedFrom: string | null; englishUpdated: string | null }) => t.translatedFrom === null || t.englishUpdated === null,
    );
    expect(missing.map((t: { file: string }) => t.file)).toEqual([]);
  });

  it('reports every stale translation with a positive number of days', () => {
    for (const t of staleQueue(all)) expect(t.daysBehind, t.file).toBeGreaterThan(0);
  });
});
