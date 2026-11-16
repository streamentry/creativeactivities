// Prints the internal due-for-review queue (WEB-076, TSA-036): English activity cards, hubs and guides
// past their review date, safety-flagged cards first. Nothing here is published or written to dist/.
// Usage: node scripts/review-queue.mjs [--today=YYYY-MM-DD] [--json]
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { REVIEW_INTERVAL_MONTHS, readFrontmatterDates, reviewQueue } from './review-queue-lib.mjs';

const content = fileURLToPath(new URL('../src/content/', import.meta.url));
const frontmatter = (path) => readFileSync(path, 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';

/** @returns {{ id: string, path: string }[]} */
function markdown(dir, prefix = '') {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return markdown(path, `${prefix}${name}/`);
    return name.endsWith('.md') ? [{ id: `${prefix}${name.replace(/\.md$/, '')}`, path }] : [];
  });
}

const sources = [
  ['activity', join(content, 'activity-cards')],
  ['hub', join(content, 'hubs')],
  ['guide', join(content, 'guides')],
];

const missing = [];
const items = sources.flatMap(([kind, dir]) =>
  markdown(dir).flatMap(({ id, path }) => {
    const fm = frontmatter(path);
    const checked = readFrontmatterDates(fm);
    if (!checked) {
      missing.push(`${kind}/${id}`);
      return [];
    }
    const flags = fm.match(/^safetyFlags: \[(.*)\]$/m)?.[1] ?? '';
    const safetyFlagged = kind === 'activity' && flags.split(',').some((f) => f.trim() && f.trim() !== 'none');
    return [{ id, kind, checked, safetyFlagged }];
  }),
);

const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const today = arg('today') ?? new Date().toISOString().slice(0, 10);
const queue = reviewQueue(items, today);

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ today, intervalMonths: REVIEW_INTERVAL_MONTHS, queue, missing }, null, 2));
} else {
  for (const e of queue) {
    console.log(`${e.safetyFlagged ? 'SAFETY ' : '       '}${e.kind.padEnd(8)} ${e.id.padEnd(60)} checked ${e.checked}, due ${e.due}, ${e.daysOverdue} days overdue`);
  }
  for (const m of missing) console.log(`NO DATE  ${m}`);
  console.log(`\n${queue.length} of ${items.length} pages past a ${REVIEW_INTERVAL_MONTHS}-month review (today ${today}); ${missing.length} with no date.`);
}
