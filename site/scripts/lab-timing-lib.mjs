// Pure helpers for the lab timing report (PLAT-036, SEO-028). No browser, no file access: the check script
// measures pages in Chromium and hands the numbers here. Covered by src/lib/lab-timing.test.ts.
//
// Targets (SEO-028, DESIGN §7): LCP at or under 2.5 s, CLS at or under 0.1. The lab stand-in for INP is
// Total Blocking Time (TBT); the project's performance rules set it under 200 ms. All values are compared
// "at or under", the same rule for each metric.

/** Lab targets. LCP and TBT in milliseconds, CLS unitless. */
export const TARGETS = Object.freeze({ lcp: 2500, cls: 0.1, tbt: 200 });

/** A layout shift session ends after a 1 s gap or after 5 s, as in the Core Web Vitals definition of CLS. */
const SESSION_GAP_MS = 1000;
const SESSION_MAX_MS = 5000;
/** Tasks longer than this block input; TBT counts only the part beyond it. */
const LONG_TASK_MS = 50;

/** Median of the finite numbers in `values`, or null when there are none. Even counts average the middle pair. */
export function median(values) {
  const sorted = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Cumulative Layout Shift for a list of `layout-shift` entries. Shifts with recent input are excluded, as the
 * browser does. Shifts are grouped into sessions (a gap of 1 s or 5 s of session length starts a new one) and CLS
 * is the largest session total. Returns 0 when nothing shifted.
 */
export function clsFromShifts(shifts) {
  const ordered = shifts
    .filter((s) => !s.hadRecentInput && Number.isFinite(s.value))
    .sort((a, b) => a.startTime - b.startTime);
  let best = 0;
  let current = 0;
  let sessionStart = null;
  let previous = null;
  for (const shift of ordered) {
    const newSession =
      previous === null ||
      shift.startTime - previous >= SESSION_GAP_MS ||
      shift.startTime - sessionStart >= SESSION_MAX_MS;
    if (newSession) {
      current = 0;
      sessionStart = shift.startTime;
    }
    current += shift.value;
    previous = shift.startTime;
    best = Math.max(best, current);
  }
  return best;
}

/**
 * Total Blocking Time after First Contentful Paint. Each `longtask` contributes the part of its duration that
 * falls after FCP, minus the 50 ms allowance. A task that starts before FCP and runs past it counts only its
 * tail. With no FCP value, the whole timeline counts.
 */
export function tbtFromLongTasks(tasks, fcp) {
  const from0 = Number.isFinite(fcp) ? fcp : 0;
  let blocking = 0;
  for (const task of tasks) {
    const end = task.startTime + task.duration;
    const from = Math.max(task.startTime, from0);
    if (end <= from) continue;
    blocking += Math.max(0, end - from - LONG_TASK_MS);
  }
  return blocking;
}

/** Median of each metric across the runs of one page and width. Missing values stay null. */
export function summarizeRuns(runs) {
  return {
    lcp: median(runs.map((r) => r.lcp)),
    cls: median(runs.map((r) => r.cls)),
    tbt: median(runs.map((r) => r.tbt)),
  };
}

/**
 * Compares metric values with the targets. `ok` is true when the value is at or under its target, false when over,
 * and null when the value was not measured (a null never passes silently). `over` is the amount past the target
 * (negative or zero when ok).
 */
export function compareToTargets(metrics, targets = TARGETS) {
  const result = {};
  for (const key of Object.keys(targets)) {
    const value = metrics[key] ?? null;
    const target = targets[key];
    if (value === null) {
      result[key] = { value: null, target, ok: null, over: null };
    } else {
      result[key] = { value, target, ok: value <= target, over: value - target };
    }
  }
  return result;
}

/** Human-readable misses, such as "TBT +85 ms". Unmeasured metrics are listed as "LCP n/a". */
export function missesOf(comparison) {
  const labels = { lcp: 'LCP', cls: 'CLS', tbt: 'TBT' };
  const misses = [];
  for (const key of Object.keys(labels)) {
    const entry = comparison[key];
    if (!entry) continue;
    if (entry.ok === null) misses.push(`${labels[key]} n/a`);
    else if (entry.ok === false) misses.push(`${labels[key]} ${formatOver(key, entry.over)}`);
  }
  return misses;
}

/** True when any metric is over its target or was not measured. */
export function hasMiss(comparison) {
  return Object.values(comparison).some((entry) => entry.ok !== true);
}

/** Formats a metric value: milliseconds as whole numbers, CLS with three decimals. */
export function formatValue(key, value) {
  if (value === null || value === undefined) return 'n/a';
  return key === 'cls' ? value.toFixed(3) : String(Math.round(value));
}

/** Formats the amount past target, with its unit. */
export function formatOver(key, over) {
  const sign = over >= 0 ? '+' : '-';
  const amount = Math.abs(over);
  return key === 'cls' ? `${sign}${amount.toFixed(3)}` : `${sign}${Math.round(amount)} ms`;
}
