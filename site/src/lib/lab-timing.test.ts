import { describe, expect, it } from 'vitest';
import {
  TARGETS,
  clsFromShifts,
  compareToTargets,
  formatOver,
  formatValue,
  hasMiss,
  median,
  missesOf,
  summarizeRuns,
  tbtFromLongTasks,
} from '../../scripts/lab-timing-lib.mjs';

describe('lab timing targets (SEO-028, PLAT-036)', () => {
  it('uses LCP 2.5 s, CLS 0.1 and TBT 200 ms', () => {
    expect(TARGETS).toEqual({ lcp: 2500, cls: 0.1, tbt: 200 });
  });
});

describe('median', () => {
  it('returns the middle value of an odd count', () => {
    expect(median([300, 100, 200])).toBe(200);
  });

  it('averages the middle pair of an even count', () => {
    expect(median([100, 400, 200, 300])).toBe(250);
  });

  it('ignores missing and non-finite values', () => {
    expect(median([null, 100, Number.NaN, 300] as unknown as number[])).toBe(200);
  });

  it('returns null when nothing is measured', () => {
    expect(median([])).toBeNull();
    expect(median([null, undefined] as unknown as number[])).toBeNull();
  });
});

describe('clsFromShifts', () => {
  it('is zero when nothing shifted', () => {
    expect(clsFromShifts([])).toBe(0);
  });

  it('sums shifts that fall in one session', () => {
    const shifts = [
      { startTime: 100, value: 0.04, hadRecentInput: false },
      { startTime: 600, value: 0.03, hadRecentInput: false },
    ];
    expect(clsFromShifts(shifts)).toBeCloseTo(0.07, 10);
  });

  it('starts a new session after a one second gap and takes the largest session', () => {
    const shifts = [
      { startTime: 100, value: 0.05, hadRecentInput: false },
      { startTime: 1200, value: 0.02, hadRecentInput: false },
      { startTime: 1300, value: 0.02, hadRecentInput: false },
    ];
    // Sessions: 0.05 and 0.04. The largest one wins.
    expect(clsFromShifts(shifts)).toBeCloseTo(0.05, 10);
  });

  it('starts a new session once a session reaches five seconds', () => {
    const shifts = [
      { startTime: 0, value: 0.03, hadRecentInput: false },
      { startTime: 900, value: 0.03, hadRecentInput: false },
      { startTime: 1800, value: 0.03, hadRecentInput: false },
      { startTime: 2700, value: 0.03, hadRecentInput: false },
      { startTime: 3600, value: 0.03, hadRecentInput: false },
      { startTime: 4500, value: 0.03, hadRecentInput: false },
      { startTime: 5400, value: 0.03, hadRecentInput: false },
    ];
    // Each 900 ms step keeps the session open, but a session cannot run past 5 s from its start:
    // the shifts at 0 to 4500 ms (six of them, 0.18) form one session; the shift at 5400 ms starts a new one.
    expect(clsFromShifts(shifts)).toBeCloseTo(0.18, 10);
  });

  it('ignores shifts that follow recent input', () => {
    const shifts = [
      { startTime: 100, value: 0.5, hadRecentInput: true },
      { startTime: 150, value: 0.02, hadRecentInput: false },
    ];
    expect(clsFromShifts(shifts)).toBeCloseTo(0.02, 10);
  });

  it('does not depend on the order entries arrive in', () => {
    const ordered = [
      { startTime: 100, value: 0.02, hadRecentInput: false },
      { startTime: 200, value: 0.03, hadRecentInput: false },
      { startTime: 5000, value: 0.04, hadRecentInput: false },
    ];
    const reversed = [...ordered].reverse();
    expect(clsFromShifts(reversed)).toBeCloseTo(clsFromShifts(ordered), 10);
  });
});

describe('tbtFromLongTasks', () => {
  it('is zero with no long tasks', () => {
    expect(tbtFromLongTasks([], 500)).toBe(0);
  });

  it('counts only the part of each task beyond 50 ms', () => {
    expect(tbtFromLongTasks([{ startTime: 1000, duration: 120 }], 500)).toBe(70);
  });

  it('ignores tasks that finish before FCP', () => {
    expect(tbtFromLongTasks([{ startTime: 100, duration: 300 }], 500)).toBe(0);
  });

  it('counts only the tail of a task that starts before FCP and runs past it', () => {
    // Runs from 400 to 600 ms. After FCP (500 ms) that is 100 ms, so 50 ms blocks.
    expect(tbtFromLongTasks([{ startTime: 400, duration: 200 }], 500)).toBe(50);
  });

  it('adds up tasks and ignores short ones inside the allowance', () => {
    const tasks = [
      { startTime: 600, duration: 40 },
      { startTime: 800, duration: 90 },
      { startTime: 1000, duration: 150 },
    ];
    expect(tbtFromLongTasks(tasks, 500)).toBe(40 + 100);
  });

  it('counts the whole timeline when FCP is missing', () => {
    expect(tbtFromLongTasks([{ startTime: 0, duration: 80 }], null as unknown as number)).toBe(30);
  });
});

describe('summarizeRuns', () => {
  it('takes the median of each metric across runs', () => {
    const runs = [
      { lcp: 2000, cls: 0.02, tbt: 100 },
      { lcp: 3000, cls: 0.05, tbt: 300 },
      { lcp: 2400, cls: 0.01, tbt: 150 },
    ];
    expect(summarizeRuns(runs)).toEqual({ lcp: 2400, cls: 0.02, tbt: 150 });
  });

  it('keeps a metric null when no run measured it', () => {
    const runs = [
      { lcp: null, cls: 0.01, tbt: 0 },
      { lcp: null, cls: 0.02, tbt: 0 },
    ];
    expect(summarizeRuns(runs).lcp).toBeNull();
  });
});

type Verdict = Record<'lcp' | 'cls' | 'tbt', { value: number | null; target: number; ok: boolean | null; over: number | null }>;
const verdict = (metrics: { lcp: number | null; cls: number; tbt: number }) =>
  compareToTargets(metrics) as Verdict;

describe('compareToTargets', () => {
  it('passes values at the target and under it', () => {
    const result = verdict({ lcp: 2500, cls: 0.05, tbt: 120 });
    expect(result.lcp.ok).toBe(true);
    expect(result.cls.ok).toBe(true);
    expect(result.tbt.ok).toBe(true);
    expect(hasMiss(result)).toBe(false);
  });

  it('fails a value over its target and reports how far over', () => {
    const result = verdict({ lcp: 2700, cls: 0.05, tbt: 120 });
    expect(result.lcp.ok).toBe(false);
    expect(result.lcp.over).toBeCloseTo(200, 10);
    expect(hasMiss(result)).toBe(true);
  });

  it('does not pass an unmeasured metric', () => {
    const result = verdict({ lcp: null, cls: 0, tbt: 0 });
    expect(result.lcp.ok).toBeNull();
    expect(hasMiss(result)).toBe(true);
  });
});

describe('missesOf', () => {
  it('lists each missed metric with its amount', () => {
    const result = compareToTargets({ lcp: 2600, cls: 0.14, tbt: 90 });
    expect(missesOf(result)).toEqual(['LCP +100 ms', 'CLS +0.040']);
  });

  it('is empty when every target is met', () => {
    expect(missesOf(compareToTargets({ lcp: 1000, cls: 0, tbt: 0 }))).toEqual([]);
  });

  it('names unmeasured metrics', () => {
    expect(missesOf(compareToTargets({ lcp: null, cls: 0, tbt: 0 }))).toEqual(['LCP n/a']);
  });
});

describe('formatting', () => {
  it('rounds milliseconds to whole numbers and keeps three decimals for CLS', () => {
    expect(formatValue('lcp', 2431.7)).toBe('2432');
    expect(formatValue('cls', 0.0456)).toBe('0.046');
    expect(formatValue('tbt', null)).toBe('n/a');
  });

  it('signs the amount over target', () => {
    expect(formatOver('tbt', 85.4)).toBe('+85 ms');
    expect(formatOver('cls', -0.02)).toBe('-0.020');
  });
});
