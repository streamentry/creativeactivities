import { describe, expect, it } from 'vitest';
import { REVIEW_INTERVAL_MONTHS, dueDate, filterByOwner, ownerSummary, overdueSince, readFrontmatterDates, reviewQueue } from '../../scripts/review-queue-lib.mjs';
import { REVIEW_OWNER_ROLES, ownerOf, readFrontmatterOwner } from './review-owner';

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

  it('dates a page only by its review, never by its update or publication (MET-011)', () => {
    expect(readFrontmatterDates('review:\n  name: A Person\n  date: 2026-03-04\nupdated: 2026-01-02')).toBe('2026-03-04');
    expect(readFrontmatterDates('updated: 2026-01-02\npublished: 2025-01-01')).toBeNull();
    expect(readFrontmatterDates('published: 2025-01-01')).toBeNull();
    expect(readFrontmatterDates('title: no dates')).toBeNull();
  });

  it('rejects a bad date instead of guessing', () => {
    expect(() => reviewQueue([item('bad', 'not-a-date')], '2026-11-15')).toThrow(/bad/);
  });

  it('gives the reader notice its due date only once a page is past it', () => {
    expect(overdueSince('2025-10-15', '2026-11-15')).toBe('2026-10-15');
    expect(overdueSince('2025-11-15', '2026-11-15')).toBeNull();
    expect(overdueSince('2026-06-01', '2026-11-15')).toBeNull();
  });
});

describe('review owner (PLAT-012, TSA-036)', () => {
  it('names three roles, none of them a person', () => {
    expect(REVIEW_OWNER_ROLES).toEqual(['editor', 'safety-reviewer', 'translation-reviewer']);
  });

  it('uses the owner set on the page', () => {
    expect(ownerOf({ owner: 'translation-reviewer', safetyFlagged: false })).toEqual({ role: 'translation-reviewer', defaulted: false });
  });

  it('defaults a safety-flagged page to the safety reviewer, and marks it defaulted', () => {
    expect(ownerOf({ safetyFlagged: true })).toEqual({ role: 'safety-reviewer', defaulted: true });
  });

  it('defaults any other page to the editor, and marks it defaulted', () => {
    expect(ownerOf({ safetyFlagged: false })).toEqual({ role: 'editor', defaulted: true });
  });

  it('keeps an owner set on a safety-flagged page', () => {
    expect(ownerOf({ owner: 'editor', safetyFlagged: true })).toEqual({ role: 'editor', defaulted: false });
  });

  it('rejects an owner that is not a listed role instead of guessing', () => {
    expect(() => ownerOf({ owner: 'Jane Doe', safetyFlagged: false })).toThrow(/Jane Doe/);
  });

  it('reads the owner from its own frontmatter key, not from the review record', () => {
    expect(readFrontmatterOwner('review:\n  name: A Person\n  role: art-therapist\nreviewOwner: safety-reviewer')).toBe('safety-reviewer');
    expect(readFrontmatterOwner('review:\n  name: A Person\n  role: editor')).toBeNull();
    expect(readFrontmatterOwner('title: no owner')).toBeNull();
  });

  it('keeps the priority order and gives each entry its owner and whether it was defaulted', () => {
    const queue = reviewQueue(
      [
        { ...item('plain-older', '2024-01-01'), owner: 'translation-reviewer' },
        item('flagged', '2025-09-01', true),
        item('plain-newer', '2025-06-01'),
      ],
      '2026-11-15',
    );
    expect(queue.map((q) => q.id)).toEqual(['flagged', 'plain-older', 'plain-newer']);
    expect(queue.map((q) => [q.owner, q.ownerDefaulted])).toEqual([
      ['safety-reviewer', true],
      ['translation-reviewer', false],
      ['editor', true],
    ]);
  });

  it('filters the queue to one owner role and summarises it by owner', () => {
    const queue = reviewQueue(
      [item('a', '2024-01-01'), item('b', '2024-02-01', true), { ...item('c', '2024-03-01'), owner: 'translation-reviewer' }],
      '2026-11-15',
    );
    expect(filterByOwner(queue, 'editor').map((q) => q.id)).toEqual(['a']);
    expect(filterByOwner(queue, 'safety-reviewer').map((q) => q.id)).toEqual(['b']);
    expect(ownerSummary(queue)).toEqual({ 'safety-reviewer': 1, editor: 1, 'translation-reviewer': 1 });
  });
});
