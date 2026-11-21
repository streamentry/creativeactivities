import { describe, expect, it } from 'vitest';
import { printRecord } from '../../scripts/check-print.mjs';

describe('the print record (MET-020)', () => {
  const run = (templates: [string, { ok: number; total: number }][]) =>
    printRecord({ date: '2026-11-21', commit: 'abc123', cards: 53, templates: new Map(templates) });

  it('holds the date, the commit, the cards checked and the pages passed and checked per template', () => {
    const record = run([
      ['card', { ok: 53, total: 53 }],
      ['game sheet', { ok: 10, total: 11 }],
    ]);
    expect(record).toMatchObject({
      schema: 'creative-activities/print-record',
      date: '2026-11-21',
      commit: 'abc123',
      cards: 53,
      templates: { card: { passed: 53, checked: 53 }, 'game sheet': { passed: 10, checked: 11 } },
    });
  });

  it('counts a template as passing only when every one of its pages passes', () => {
    const record = run([
      ['card', { ok: 53, total: 53 }],
      ['game sheet', { ok: 10, total: 11 }],
      ['path', { ok: 2, total: 2 }],
    ]);
    expect(record).toMatchObject({ templatesPassing: 2, templateTypes: 3, passRate: 67 });
  });

  it('reports 100% when every template passes, and 0 for no templates', () => {
    expect(run([['card', { ok: 1, total: 1 }]]).passRate).toBe(100);
    expect(run([]).passRate).toBe(0);
  });

  it('is the same bytes for the same counts', () => {
    const templates: [string, { ok: number; total: number }][] = [['card', { ok: 2, total: 2 }]];
    expect(JSON.stringify(run(templates))).toBe(JSON.stringify(run(templates)));
  });
});
