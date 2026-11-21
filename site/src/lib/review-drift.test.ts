import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { formatDriftReport, reviewDrift } from '../../scripts/review-drift-lib.mjs';

const FIXTURE_ROOT = new URL('../../scripts/fixtures/review-drift', import.meta.url).pathname;
const SCRIPT = new URL('../../scripts/review-drift.mjs', import.meta.url).pathname;

function runScript(args: string[]) {
  const result = spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });
  return { stdout: result.stdout, status: result.status };
}

/** A minimal card with one reviewable field, plus a review record with or without a hash. */
const card = (review?: Record<string, unknown>) => ({
  steps: ['Spread the towel on the table.', 'Fill the jar with water.', 'Trim the stem.'],
  ...(review ? { review: { date: '2026-03-01', ...review } } : {}),
});

describe('review drift (PLAT-005)', () => {
  it('returns nothing for a card with no review record', () => {
    expect(reviewDrift('plain', card())).toBeNull();
  });

  it('reports current when the recorded hash matches the content', () => {
    const first = reviewDrift('a', card({ contentHash: 'sha256:' + '0'.repeat(64) }));
    expect(first?.state).toBe('changed');
    const hash = first?.currentHash as string;
    expect(reviewDrift('a', card({ contentHash: hash }))?.state).toBe('current');
  });

  it('reports changed when the content differs from the reviewed hash', () => {
    const entry = reviewDrift('a', card({ contentHash: 'sha256:' + 'f'.repeat(64) }));
    expect(entry?.state).toBe('changed');
    expect(entry?.reviewedHash).toBe('sha256:' + 'f'.repeat(64));
  });

  it('reports no-hash for an older record that has no contentHash', () => {
    expect(reviewDrift('old', card({}))?.state).toBe('no-hash');
  });

  it('ignores whitespace-only edits after review (still current)', () => {
    const reviewed = reviewDrift('a', card({ contentHash: 'sha256:' + '0'.repeat(64) }))?.currentHash as string;
    const spaced = {
      steps: ['Spread  the towel on the table. ', 'Fill the jar\nwith water.', 'Trim the stem.'],
      review: { date: '2026-03-01', contentHash: reviewed },
    };
    expect(reviewDrift('a', spaced)?.state).toBe('current');
  });

  // The content config loads only under the script's own Node hooks, so the fixture folder is read by the real script
  // in a child process (the same Node that runs vitest, which is the pinned v24 here).
  it('reads the fixture folder: one current, one changed, one older record, one never reviewed', () => {
    const { stdout, status } = runScript(['--root', FIXTURE_ROOT]);
    expect(status).toBe(0);
    expect(stdout).toContain('Review drift: 3 of 4 activity cards have a review record; 1 current, 1 updated since review, 1 with no content hash');
    expect(stdout).toContain('reviewed-changed: reviewed 2026-03-01');
    expect(stdout).toContain('reviewed-current: reviewed 2026-03-01');
    expect(stdout).toContain('reviewed-older-record: reviewed 2026-03-01');
    expect(stdout).not.toContain('never-reviewed');
  });

  it('exits 0 without --strict even when a card changed since review', () => {
    expect(runScript(['--root', FIXTURE_ROOT]).status).toBe(0);
  });

  it('exits 1 with --strict when a card changed since review', () => {
    expect(runScript(['--root', FIXTURE_ROOT, '--strict']).status).toBe(1);
  });

  it('formats a report with a count line and one section per state', async () => {
    const report = {
      total: 3,
      unreadable: [],
      entries: [
        { id: 'a', state: 'changed', reviewedHash: 'sha256:' + '1'.repeat(64), currentHash: 'sha256:' + '2'.repeat(64), reviewDate: '2026-03-01' },
        { id: 'b', state: 'no-hash', reviewedHash: null, currentHash: 'sha256:' + '3'.repeat(64), reviewDate: '2026-02-01' },
        { id: 'c', state: 'current', reviewedHash: 'sha256:' + '4'.repeat(64), currentHash: 'sha256:' + '4'.repeat(64), reviewDate: '' },
      ],
    };
    const text = formatDriftReport(report);
    expect(text.split('\n')[0]).toBe('Review drift: 3 of 3 activity cards have a review record; 1 current, 1 updated since review, 1 with no content hash (older record, not checked).');
    expect(text).toContain('updated since review (content changed after the review):');
    expect(text).toContain('  a: reviewed 2026-03-01, reviewed hash sha256:111111111111, now sha256:222222222222');
    expect(text).toContain('  c: reviewed undated');
  });

  it('says so when no card has a review record', () => {
    const text = formatDriftReport({ total: 5, entries: [], unreadable: [] });
    expect(text).toBe('Review drift: 0 of 5 activity cards have a review record; 0 current, 0 updated since review, 0 with no content hash (older record, not checked).');
  });
});
