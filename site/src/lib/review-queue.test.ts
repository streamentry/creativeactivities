import { describe, expect, it } from 'vitest';
import { REVIEW_INTERVAL_MONTHS, dueDate, readFrontmatterDates, reviewQueue } from '../../scripts/review-queue-lib.mjs';

/** WEB-076 and TSA-036: an internal list of pages past their review date, safety-flagged cards first. */
const item = (id: string, checked: string, safetyFlagged = false, kind = 'activity') => ({ id, kind, checked, safetyFlagged });

describe('review queue (WEB-076, TSA-036)', () => {
  it('uses a twelve-month interval until the maintainer sets another', () => {
    expect(REVIEW_INTERVAL_MONTHS).toBe(12);
  });

  it('adds the interval in calendar months', () => {
    expect(dueDate('2025-11-15', 12)).toBe('2026-11-15');
    expect(dueDate('2026-01-31', 1)).toBe('2026-02-28');
  });

  it('lists only pages whose due date has passed', () => {
    const queue = reviewQueue([item('fresh', '2026-06-01'), item('old', '2025-10-01')], '2026-11-15');
    expect(queue.map((q) => q.id)).toEqual(['old']);
  });

  it('is not due on the due date itself', () => {
    expect(reviewQueue([item('edge', '2025-11-15')], '2026-11-15')).toEqual([]);
  });

  it('puts safety-flagged cards first, then the most overdue', () => {
    const queue = reviewQueue(
      [item('plain-older', '2024-01-01'), item('flagged', '2025-09-01', true), item('plain-newer', '2025-06-01')],
      '2026-11-15',
    );
    expect(queue.map((q) => q.id)).toEqual(['flagged', 'plain-older', 'plain-newer']);
  });

  it('reports the due date and days overdue', () => {
    const [entry] = reviewQueue([item('old', '2025-10-15')], '2026-11-15');
    expect(entry.due).toBe('2026-10-15');
    expect(entry.daysOverdue).toBe(31);
  });

  it('reads the review date, then updated, then published, never inventing one', () => {
    expect(readFrontmatterDates('updated: 2026-01-02\npublished: 2025-01-01')).toBe('2026-01-02');
    expect(readFrontmatterDates('published: 2025-01-01')).toBe('2025-01-01');
    expect(readFrontmatterDates('review:\n  name: A Person\n  date: 2026-03-04\nupdated: 2026-01-02')).toBe('2026-03-04');
    expect(readFrontmatterDates('title: no dates')).toBeNull();
  });

  it('rejects a bad date instead of guessing', () => {
    expect(() => reviewQueue([item('bad', 'not-a-date')], '2026-11-15')).toThrow(/bad/);
  });
});
