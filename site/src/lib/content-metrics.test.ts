import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  formatReport,
  median,
  overdueReviews,
  pageFacts,
  reviewedCoverage,
  sourceCoverage,
  translationCoverage,
} from '../../scripts/content-metrics-lib.mjs';
import { buildReport } from '../../scripts/content-metrics.mjs';
import { parseRetiredIds } from '../../scripts/translation-queue.mjs';

const fm = (lines: string[]) => lines.join('\n');

describe('reading one page (MET-010, MET-015)', () => {
  it('reads the health flag, the dates, the review record and the sources', () => {
    const facts = pageFacts(
      'guide',
      'caregiving/x',
      fm([
        'title: "X"',
        'health: true',
        'published: 2026-01-01',
        'updated: 2026-06-01',
        'review:',
        '  name: A Reviewer',
        '  date: 2026-03-01',
        '  scope: "Checked."',
        'sources:',
        '  - title: "One"',
        '    publisher: "P"',
        '  - title: "Two"',
        '    publisher: "Q"',
        '    retrieved: 2026-05-01',
        'summary: "after"',
      ]),
    );
    expect(facts).toMatchObject({
      health: true,
      hasReviewRecord: true,
      reviewDate: '2026-03-01',
      updated: '2026-06-01',
      checked: '2026-03-01',
      sources: 2,
      datedSources: 1,
    });
  });

  it('reads a page with no review and no sources as exactly that', () => {
    const facts = pageFacts('hub', 'h', fm(['title: "H"', 'updated: 2026-02-02', 'sources: []']));
    expect(facts).toMatchObject({ health: false, hasReviewRecord: false, reviewDate: null, sources: 0, datedSources: 0, checked: null });
  });

  it('never invents a review date: an edit or a publication date is not a review', () => {
    expect(pageFacts('hub', 'h', 'published: 2026-01-05').checked).toBeNull();
    expect(pageFacts('hub', 'h', 'title: "H"').checked).toBeNull();
    expect(pageFacts('hub', 'h', 'updated: 2026-13-45').updated).toBeNull();
  });

  it('counts a crisis route as health-adjacent, as the translation queue does', () => {
    expect(pageFacts('activity', 'a', fm(['name: "A"', 'crisisRoute: true'])).health).toBe(true);
    expect(pageFacts('guide', 'g', fm(['title: "G"', 'health: true'])).health).toBe(true);
    expect(pageFacts('guide', 'g', fm(['title: "G"', 'crisisRoute: false'])).health).toBe(false);
  });

  it('reads whether a hub is held from search', () => {
    expect(pageFacts('hub', 'h', fm(['title: "H"', 'indexable: false'])).indexable).toBe(false);
    expect(pageFacts('hub', 'h', fm(['title: "H"', 'indexable: true'])).indexable).toBe(true);
    expect(pageFacts('hub', 'h', fm(['title: "H"'])).indexable).toBe(true);
  });

  it('reads a review date written with a time, as the site\u2019s schema allows', () => {
    const facts = pageFacts('activity', 'a', fm(['updated: 2026-06-01', 'review:', '  date: 2026-03-01T10:00:00Z', '  name: R']));
    expect(facts.reviewDate).toBe('2026-03-01');
    expect(pageFacts('activity', 'a', fm(['review:', '  date: "2026-03-01"', '  name: R'])).reviewDate).toBe('2026-03-01');
    expect(pageFacts('activity', 'a', fm(['review:', '  date: 2026-13-45', '  name: R'])).reviewDate).toBeNull();
  });

  it('does not take a date inside a source or a list for the page date', () => {
    expect(pageFacts('guide', 'g', fm(['sources:', '  - title: "S"', '    updated: 2020-01-01'])).updated).toBeNull();
  });
});

describe('median', () => {
  it('is the middle value, the mean of the two middle values for an even count, and 0 for none', () => {
    expect(median([5, 1, 3])).toBe(3);
    expect(median([1, 2, 3, 4])).toBe(3);
    expect(median([])).toBe(0);
  });
});

describe('reviewed coverage (MET-010)', () => {
  const page = (over: object) => ({ health: false, hasReviewRecord: false, reviewDate: null, updated: '2026-05-01', ...over }) as ReturnType<typeof pageFacts>;

  it('counts current, stale and none, health-adjacent pages apart from the rest', () => {
    const r = reviewedCoverage([
      page({ health: true, hasReviewRecord: true, reviewDate: '2026-05-01' }),
      page({ health: true, hasReviewRecord: true, reviewDate: '2026-01-01' }),
      page({ health: true }),
      page({}),
      page({ hasReviewRecord: true, reviewDate: '2026-06-01' }),
    ]);
    expect(r.health).toEqual({ total: 3, current: 1, stale: 1, none: 1 });
    expect(r.other).toEqual({ total: 2, current: 1, stale: 0, none: 1 });
  });

  it('shows a review older than the last update as stale, not as reviewed', () => {
    const r = reviewedCoverage([page({ hasReviewRecord: true, reviewDate: '2026-04-30' })]);
    expect(r.other).toMatchObject({ current: 0, stale: 1 });
  });

  it('does not count a page with a reviewer name but no record as reviewed', () => {
    expect(reviewedCoverage([page({ hasReviewRecord: false })]).other.current).toBe(0);
  });

  it('does not count a page that names a reviewer in its front matter but has no review record', () => {
    const named = pageFacts('activity', 'a', fm(['name: "A"', 'updated: 2026-05-01', 'reviewer: "A. Person, RN"']));
    expect(named.hasReviewRecord).toBe(false);
    expect(reviewedCoverage([named], '2026-11-17').other).toEqual({ total: 1, current: 0, stale: 0, none: 1 });
  });

  it('does not count a record whose date cannot be read, or lies after today, as current', () => {
    const r = reviewedCoverage(
      [
        page({ hasReviewRecord: true, reviewDate: null }),
        page({ hasReviewRecord: true, reviewDate: '2027-06-01' }),
        page({ hasReviewRecord: true, reviewDate: '2026-06-01' }),
      ],
      '2026-11-17',
    );
    expect(r.other).toEqual({ total: 3, current: 1, stale: 2, none: 0 });
  });
});

describe('the review clock (MET-011, PLAT-012)', () => {
  it('reports a page by its review date, even when a later edit has updated it', () => {
    const facts = pageFacts('activity', 'a', fm(['updated: 2026-06-01', 'review:', '  name: R', '  date: 2026-03-01']));
    expect(facts.checked).toBe('2026-03-01');
  });

  it('reports a page with no review record as never reviewed, not as checked on its updated date', () => {
    const facts = pageFacts('guide', 'g', fm(['title: "G"', 'published: 2025-01-01', 'updated: 2026-06-01']));
    expect(facts.checked).toBeNull();
    expect(overdueReviews([facts], '2026-11-16')).toMatchObject({ overdue: 0, undated: 1, total: 1 });
  });

  it('does not clear an overdue page by editing it: a review record is needed to move the date', () => {
    const edited = pageFacts('guide', 'g', fm(['title: "G"', 'published: 2024-01-01', 'updated: 2026-11-01']));
    expect(edited.checked).toBeNull();
    const reviewed = pageFacts('guide', 'g', fm(['title: "G"', 'updated: 2026-11-01', 'review:', '  name: R', '  date: 2024-01-01']));
    expect(overdueReviews([reviewed], '2026-11-16').overdue).toBe(1);
  });
});

describe('overdue reviews (MET-011)', () => {
  const page = (id: string, checked: string | null, health = false) =>
    ({ kind: 'guide', id, health, checked }) as ReturnType<typeof pageFacts>;

  it('counts pages past twelve months, lists health-adjacent ones first and reports the median days over', () => {
    const r = overdueReviews([page('a', '2025-01-01'), page('b', '2025-06-01', true), page('c', '2026-10-01'), page('d', null)], '2026-11-16');
    expect(r.overdue).toBe(2);
    expect(r.undated).toBe(1);
    expect(r.healthFirst[0]).toBe('guide/b');
    expect(r.medianDaysOver).toBeGreaterThan(0);
  });

  it('reports nothing overdue for pages checked this year', () => {
    expect(overdueReviews([page('a', '2026-09-01')], '2026-11-16')).toMatchObject({ overdue: 0, medianDaysOver: 0 });
  });
});

describe('translation coverage (MET-012)', () => {
  const rows = [
    { lang: 'fr', retired: false, stale: false },
    { lang: 'fr', retired: false, stale: true },
    { lang: 'de', retired: false, stale: false },
    { lang: 'de', retired: true, stale: true },
  ];

  it('counts live translations and stale ones per language, and sets those behind a retired guide apart', () => {
    const r = translationCoverage(rows, 10);
    expect(r).toMatchObject({ languages: 2, translatedPages: 3, stalePages: 1, behindRetiredGuides: 1, staleBehindRetired: 1, min: 1, max: 2, liveEnglishGuides: 10 });
    expect(r.rows.map((x: { lang: string }) => x.lang)).toEqual(['de', 'fr']);
  });

  it('counts a stale translation of a retired guide, which stays published, and shows it apart', () => {
    const r = translationCoverage([{ lang: 'fr', retired: true, stale: true }, { lang: 'fr', retired: true, stale: false }], 3);
    expect(r).toMatchObject({ translatedPages: 0, stalePages: 0, behindRetiredGuides: 2, staleBehindRetired: 1 });
  });

  it('never counts machine translation as native review', () => {
    expect(translationCoverage(rows, 10).nativeReviewedPages).toBe(0);
  });

  it('handles no translations', () => {
    expect(translationCoverage([], 5)).toMatchObject({ languages: 0, translatedPages: 0, min: 0, max: 0 });
  });
});

describe('source coverage (MET-015)', () => {
  it('counts health-adjacent pages with a source and with a dated source', () => {
    const p = (o: object) => ({ health: true, sources: 0, datedSources: 0, ...o }) as ReturnType<typeof pageFacts>;
    expect(sourceCoverage([p({ sources: 2 }), p({ sources: 1, datedSources: 1 }), p({}), p({ health: false, sources: 3 })])).toEqual({
      total: 3,
      withSource: 2,
      withDatedSource: 1,
    });
  });
});

// buildReport reads every guide in every language; on a busy machine that takes well over 5 s.
describe('the report', { timeout: 60_000 }, () => {
  it('shows the date and a count with every figure', () => {
    const { today, result } = buildReport(undefined, '2026-11-16');
    const text = formatReport(result, today).join('\n');
    expect(text).toContain('as of 2026-11-16');
    for (const id of ['MET-010', 'MET-011', 'MET-012', 'MET-015']) expect(text).toContain(id);
    expect(text).not.toMatch(/NaN|undefined|Infinity/);
    expect(text).toMatch(/\d+ of \d+/);
  });

  it('says what the native-reviewed figure is, how many retired-guide translations are stale, and leads with the dated sources', () => {
    const { today, result } = buildReport(undefined, '2026-11-16');
    const text = formatReport(result, today).join('\n');
    expect(text).toContain('a fixed 0 and not yet a measure');
    expect(text).toMatch(/\d+ of them are stale/);
    expect(text).toMatch(/\d+ of \d+ have a dated source \(\d+%\); \d+ have at least one source/);
  });

  it('lists each language when asked', () => {
    const { today, result } = buildReport(undefined, '2026-11-16');
    const withRows = formatReport(result, today, { rows: true });
    const without = formatReport(result, today);
    expect(withRows.length).toBe(without.length + result.translation.languages);
    expect(withRows.join('\n')).toMatch(/\n    [a-z-]+: \d+ of \d+ translated, \d+ stale/);
  });
});

describe('the report over the real pages', () => {
  const { result } = buildReport(undefined, '2026-11-16');
  const CONTENT = new URL('../content/', import.meta.url);
  const ids = (dir: string) =>
    (readdirSync(new URL(dir, CONTENT), { recursive: true }) as string[]).filter((f) => f.endsWith('.md')).map((f) => f.split('\\').join('/').replace(/\.md$/, ''));
  const retired = new Set(parseRetiredIds());
  const liveGuides = ids('guides/').filter((id) => !retired.has(id));
  const text = (dir: string, id: string) => readFileSync(new URL(`${dir}${id}.md`, CONTENT), 'utf8');

  it('counts every live English page once', () => {
    const cards = ids('activity-cards/').filter((id) => !/^withdrawn:/m.test(text('activity-cards/', id))).length;
    const hubs = ids('hubs/').filter((id) => !/^indexable: false\s*$/m.test(text('hubs/', id))).length;
    expect(result.pageCount).toBe(cards + hubs + liveGuides.length);
  });

  it('counts the health-adjacent pages the way the translation queue counts protected ones: a health flag or a crisis route', () => {
    const flagged = (dir: string, list: string[]) => list.filter((id) => /^(?:health|crisisRoute): true\s*$/m.test(text(dir, id))).length;
    const cards = ids('activity-cards/').filter((id) => !/^withdrawn:/m.test(text('activity-cards/', id)));
    const hubs = ids('hubs/').filter((id) => !/^indexable: false\s*$/m.test(text('hubs/', id)));
    const total = flagged('activity-cards/', cards) + flagged('hubs/', hubs) + flagged('guides/', liveGuides);
    expect(result.reviewed.health.total).toBe(total);
    expect(result.sources.total).toBe(total);
  });

  it('reports no page as reviewed until a review record exists, and says so with counts', () => {
    const withRecord = ['activity-cards/'].flatMap((d) => ids(d).filter((id) => /^review:/m.test(text(d, id)))).length;
    expect(result.reviewed.health.current + result.reviewed.other.current + result.reviewed.health.stale + result.reviewed.other.stale).toBe(withRecord);
  });

  it('accounts for every translated guide; retired translations are removed (their addresses redirect)', () => {
    expect(result.translation.translatedPages).toBeGreaterThan(2500);
    expect(result.translation.behindRetiredGuides).toBe(0);
    expect(result.translation.liveEnglishGuides).toBe(liveGuides.length);
    expect(result.translation.nativeReviewedPages).toBe(0);
  });

  it('keeps every figure a whole number', () => {
    const numbers = JSON.stringify(result).match(/:(-?\d+\.?\d*)/g) ?? [];
    for (const n of numbers) expect(Number.isInteger(Number(n.slice(1))), n).toBe(true);
  });
});
