// The per-release accessibility record (TSA-001, MET-016). Pure: the caller passes the date, the commit
// and the pages with their violations, so the same input always gives the same bytes.
// Written by `pnpm run check:a11y -- --record=<file>`; see docs/release/site-release-checks.md.

/** The sentence every record carries (MET-016, TSA-002): a clean scan is not accessibility. */
export const AUTOMATED_NOT_SUFFICIENT =
  'Automated checks are necessary but not sufficient. The manual checklist and the assistive-technology sessions are recorded separately.';

const IMPACTS = ['critical', 'serious', 'moderate', 'minor', 'unknown'];

/**
 * @param {{
 *   date: string,
 *   commit: string | null,
 *   pages: Array<{
 *     template: string,
 *     path: string,
 *     variant: string,
 *     violations: Array<{ id: string, impact: string | null, nodes: number }>,
 *     problems: string[],
 *   }>,
 * }} run
 */
export function a11yRecord({ date, commit, pages }) {
  const rows = pages.map((page) => ({
    template: page.template,
    path: page.path,
    variant: page.variant,
    violations: page.violations
      .map((v) => ({ id: v.id, impact: v.impact ?? 'unknown', nodes: v.nodes }))
      .sort((a, b) => a.id.localeCompare(b.id)),
    problems: [...page.problems].sort(),
  })).sort((a, b) => `${a.template}|${a.variant}|${a.path}`.localeCompare(`${b.template}|${b.variant}|${b.path}`));
  const passes = (row) => row.violations.length === 0 && row.problems.length === 0;

  const byTemplate = {};
  const byImpact = Object.fromEntries(IMPACTS.map((impact) => [impact, 0]));
  for (const row of rows) {
    const entry = (byTemplate[row.template] ??= { pagesChecked: 0, pagesPassed: 0, violations: 0, seriousOrCritical: 0, problems: 0 });
    entry.pagesChecked++;
    if (passes(row)) entry.pagesPassed++;
    entry.problems += row.problems.length;
    for (const v of row.violations) {
      entry.violations += v.nodes;
      if (v.impact === 'critical' || v.impact === 'serious') entry.seriousOrCritical += v.nodes;
      byImpact[IMPACTS.includes(v.impact) ? v.impact : 'unknown'] += v.nodes;
    }
  }

  return {
    schema: 'creative-activities/a11y-record',
    version: 1,
    date,
    commit: commit ?? null,
    pagesChecked: rows.length,
    pagesPassed: rows.filter(passes).length,
    templates: Object.fromEntries(Object.keys(byTemplate).sort().map((name) => [name, byTemplate[name]])),
    violationsByImpact: byImpact,
    pages: rows,
    note: AUTOMATED_NOT_SUFFICIENT,
  };
}
