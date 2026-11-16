// Prints the content-quality metrics the repository can answer (MET-010, MET-011, MET-012, MET-015).
// Internal: nothing here is built into the site. Usage: node scripts/content-metrics.mjs [--today=YYYY-MM-DD] [--json]
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatReport, overdueReviews, pageFacts, reviewedCoverage, sourceCoverage, translationCoverage } from './content-metrics-lib.mjs';
import { parseRetiredIds, readTranslations } from './translation-queue.mjs';

const content = fileURLToPath(new URL('../src/content/', import.meta.url));
const frontmatter = (path) => readFileSync(path, 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';

function markdown(dir, prefix = '') {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return markdown(path, `${prefix}${name}/`);
    return name.endsWith('.md') ? [{ id: `${prefix}${name.replace(/\.md$/, '')}`, path }] : [];
  });
}

/**
 * Everything the metrics read, for a content folder and a date.
 * @param {string} root the src/content folder
 * @param {string} today ISO date
 */
export function buildReport(root = content, today = new Date().toISOString().slice(0, 10)) {
  const retired = new Set(parseRetiredIds());
  const withdrawn = (fm) => /^withdrawn:/m.test(fm);
  const pages = [
    ...markdown(join(root, 'activity-cards')).flatMap(({ id, path }) => {
      const fm = frontmatter(path);
      return withdrawn(fm) ? [] : [pageFacts('activity', id, fm)];
    }),
    ...markdown(join(root, 'hubs')).map(({ id, path }) => pageFacts('hub', id, frontmatter(path))),
    // A retired guide has no English page, so it is not a live page.
    ...markdown(join(root, 'guides'))
      .filter(({ id }) => !retired.has(id))
      .map(({ id, path }) => pageFacts('guide', id, frontmatter(path))),
  ];
  const liveGuides = pages.filter((p) => p.kind === 'guide').length;
  const translations = readTranslations(root, retired);
  const result = {
    pageCount: pages.length,
    reviewed: reviewedCoverage(pages),
    overdue: overdueReviews(pages, today),
    translation: translationCoverage(translations, liveGuides),
    sources: sourceCoverage(pages),
  };
  return { today, result };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const today = process.argv.find((a) => a.startsWith('--today='))?.split('=')[1] ?? new Date().toISOString().slice(0, 10);
  const { result } = buildReport(content, today);
  if (process.argv.includes('--json')) {
    const { translation, ...rest } = result;
    console.log(JSON.stringify({ today, ...rest, translation: { ...translation, rows: undefined } }, null, 2));
  } else {
    console.log(formatReport(result, today).join('\n'));
  }
}
