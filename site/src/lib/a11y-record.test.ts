import { describe, expect, it } from 'vitest';
import { AUTOMATED_NOT_SUFFICIENT, a11yRecord } from '../../scripts/a11y-record-lib.mjs';

type Page = Parameters<typeof a11yRecord>[0]['pages'][number];

const page = (over: Partial<Page> & Pick<Page, 'template'>): Page => ({
  path: '/x/',
  variant: '390',
  violations: [],
  problems: [],
  ...over,
});

describe('the accessibility record (TSA-001, MET-016)', () => {
  const run = (pages: Page[], commit: string | null = 'abc123') => a11yRecord({ date: '2026-11-22', commit, pages });

  it('holds the date, the commit, the pages checked and the sentence that automated checks are not sufficient', () => {
    const record = run([page({ template: 'home' }), page({ template: 'home', variant: '1440' })]);
    expect(record).toMatchObject({
      schema: 'creative-activities/a11y-record',
      date: '2026-11-22',
      commit: 'abc123',
      pagesChecked: 2,
      pagesPassed: 2,
      note: AUTOMATED_NOT_SUFFICIENT,
    });
    expect(AUTOMATED_NOT_SUFFICIENT).toContain('necessary but not sufficient');
  });

  it('records the commit as null when there is none, such as outside a git checkout', () => {
    expect(run([page({ template: 'home' })], null).commit).toBeNull();
  });

  it('lists each violation with its rule, impact and node count, sorted by rule id', () => {
    const record = run([
      page({
        template: 'game',
        violations: [
          { id: 'color-contrast', impact: 'serious', nodes: 2 },
          { id: 'button-name', impact: 'critical', nodes: 1 },
        ],
      }),
    ]);
    expect(record.pages[0].violations).toEqual([
      { id: 'button-name', impact: 'critical', nodes: 1 },
      { id: 'color-contrast', impact: 'serious', nodes: 2 },
    ]);
    expect(record.templates.game).toMatchObject({ violations: 3, seriousOrCritical: 3, pagesPassed: 0 });
    expect(record.violationsByImpact).toMatchObject({ critical: 1, serious: 2, moderate: 0 });
  });

  it('counts a page as passing only when it has no axe violation and no keyboard, layout or motion problem', () => {
    const record = run([
      page({ template: 'hub' }),
      page({ template: 'hub', variant: '320 reflow', problems: ['horizontal page scroll'] }),
      page({ template: 'hub', variant: '640', violations: [{ id: 'label', impact: 'minor', nodes: 1 }] }),
    ]);
    expect(record.templates.hub).toMatchObject({ pagesChecked: 3, pagesPassed: 1, problems: 1, violations: 1 });
    expect(record.pagesPassed).toBe(1);
  });

  it('is the same bytes for the same input, whatever order the pages came in', () => {
    const a = [page({ template: 'b' }), page({ template: 'a', violations: [{ id: 'x', impact: 'moderate', nodes: 1 }] })];
    expect(JSON.stringify(run(a))).toBe(JSON.stringify(run([...a].reverse())));
  });

  it('gives an unknown impact to a violation that has none', () => {
    const record = run([page({ template: 'home', violations: [{ id: 'y', impact: null, nodes: 1 }] })]);
    expect(record.pages[0].violations[0].impact).toBe('unknown');
    expect(record.violationsByImpact.unknown).toBe(1);
  });
});
