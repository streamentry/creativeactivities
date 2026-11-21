// Prints the internal due-for-review queue (WEB-076, TSA-036): English activity cards, hubs and guides
// past their review date, safety-flagged cards first. Nothing here is published or written to dist/.
// Each page shows its review owner role (reviewOwner in frontmatter), or the rule default marked "(defaulted)":
// safety-flagged cards go to safety-reviewer, everything else to editor.
// Usage: node scripts/review-queue.mjs [--today=YYYY-MM-DD] [--owner=editor|safety-reviewer|translation-reviewer] [--json]
// Run one owner's list with --owner=<role>. Nothing here sends messages or runs on a schedule.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { REVIEW_INTERVAL_MONTHS, filterByOwner, ownerSummary, readFrontmatterDates, reviewQueue } from './review-queue-lib.mjs';
import { REVIEW_OWNER_ROLES, readFrontmatterOwner } from '../src/lib/review-owner.ts';

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
    const owner = readFrontmatterOwner(fm) ?? undefined;
    return [{ id, kind, checked, safetyFlagged, owner }];
  }),
);

const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const today = arg('today') ?? new Date().toISOString().slice(0, 10);
const ownerFilter = arg('owner');
if (ownerFilter !== undefined && !REVIEW_OWNER_ROLES.includes(ownerFilter)) {
  console.error(`Unknown --owner "${ownerFilter}"; use one of ${REVIEW_OWNER_ROLES.join(', ')}`);
  process.exit(1);
}
// Priority order is set by reviewQueue (safety first, then most overdue); owner only filters and labels it.
const all = reviewQueue(items, today);
const queue = ownerFilter ? filterByOwner(all, ownerFilter) : all;

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ today, intervalMonths: REVIEW_INTERVAL_MONTHS, owner: ownerFilter ?? null, queue, byOwner: ownerSummary(queue), missing }, null, 2));
} else {
  for (const e of queue) {
    const owner = `${e.owner}${e.ownerDefaulted ? ' (defaulted)' : ''}`;
    console.log(`${e.safetyFlagged ? 'SAFETY ' : '       '}${e.kind.padEnd(8)} ${e.id.padEnd(60)} owner ${owner.padEnd(28)} checked ${e.checked}, due ${e.due}, ${e.daysOverdue} days overdue`);
  }
  for (const m of missing) console.log(`NOT REVIEWED  ${m}`);
  const scope = ownerFilter ? `, owner ${ownerFilter}` : '';
  console.log(
    `\n${queue.length} of ${items.length} reviewed pages past a ${REVIEW_INTERVAL_MONTHS}-month review (today ${today}${scope}); ${missing.length} not yet reviewed (no review record; an update does not count as a review).`,
  );
  const summary = Object.entries(ownerSummary(queue)).map(([role, n]) => `${role} ${n}`).join(', ');
  if (summary) console.log(`By owner: ${summary}.`);
}
