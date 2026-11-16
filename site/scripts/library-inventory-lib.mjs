// Pure helpers for the library inventory (CNT-040). No file access here, so tests can feed text.

export const COLUMNS = [
  'type',
  'id',
  'section',
  'language',
  'status',
  'tested_date',
  'reviewer',
  'sources_present',
  'safety_check_date',
  'updated',
  'print_view',
  'ai_assisted',
  'title',
];

const clean = (v) => v.trim().replace(/^["']|["']$/g, '');

/** First top-level scalar for `key` in a front-matter block, or ''. */
export function scalar(fm, key) {
  const m = fm.match(new RegExp(`^${key}:[ \\t]*(.*)$`, 'm'));
  return m ? clean(m[1]) : '';
}

/** True when a top-level key has a value: inline `[a]`, a scalar, or an indented list below it. */
export function hasValue(fm, key) {
  const m = fm.match(new RegExp(`^${key}:[ \\t]*(.*)$`, 'm'));
  if (!m) return false;
  const inline = m[1].trim();
  if (inline && inline !== '[]' && inline !== '>-' && inline !== '|') return true;
  const rest = fm.slice(m.index + m[0].length).split('\n').slice(1);
  return /^\s+\S/.test(rest[0] ?? '');
}

/** One inventory row from a content file's front matter. */
export function inventoryRow(kind, id, fm) {
  const title = scalar(fm, 'name') || scalar(fm, 'title');
  const withdrawn = hasValue(fm, 'withdrawn');
  const noindex = scalar(fm, 'indexable') === 'false';
  const updated = scalar(fm, 'updated');
  const reviewer = scalar(fm, 'reviewedBy') || 'none';
  return {
    type: kind,
    id,
    section: scalar(fm, 'section') || scalar(fm, 'type') || '',
    language: 'en',
    status: withdrawn ? 'withdrawn' : noindex ? 'noindex' : 'published',
    tested_date: scalar(fm, 'testedOn') || 'not recorded',
    reviewer,
    sources_present: kind === 'activity' ? 'n/a' : hasValue(fm, 'sources') ? 'yes' : 'no',
    safety_check_date: scalar(fm, 'reviewedAt') || 'none',
    updated,
    print_view: kind === 'activity' ? 'yes' : 'no',
    ai_assisted: 'not recorded',
    title,
  };
}

const quote = (v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

export function toCsv(rows) {
  const sorted = [...rows].sort((a, b) => `${a.type}/${a.id}`.localeCompare(`${b.type}/${b.id}`));
  return [COLUMNS.join(','), ...sorted.map((r) => COLUMNS.map((c) => quote(String(r[c] ?? ''))).join(','))].join('\n') + '\n';
}

/** Counts by type and status, for the summary that replaces the baseline counts. */
export function tally(rows) {
  const out = {};
  for (const r of rows) {
    const key = `${r.type}:${r.status}`;
    out[key] = (out[key] ?? 0) + 1;
  }
  return out;
}

/** Words nearly every page in this library uses; they say nothing about whether two pages overlap. */
const COMMON = new Set('with from your their they that this have what when about people person older adult adults senior seniors elderly dementia alzheimers alzheimer activities activity ideas guide best simple easy home care caregivers caregiver family together'.split(' '));
const words = (title) => new Set(title.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w.length > 3 && !COMMON.has(w)));

/** Pairs of same-type pages whose titles share most of their words: candidates to merge, never auto-merged. */
export function nearDuplicates(rows, threshold = 0.67) {
  const pairs = [];
  const guides = rows.filter((r) => r.type === 'guide' || r.type === 'hub');
  for (let i = 0; i < guides.length; i++) {
    for (let j = i + 1; j < guides.length; j++) {
      const a = words(guides[i].title);
      const b = words(guides[j].title);
      if (a.size < 2 || b.size < 2) continue;
      const shared = [...a].filter((w) => b.has(w)).length;
      const score = shared / Math.min(a.size, b.size);
      if (score >= threshold) pairs.push({ a: `${guides[i].type}/${guides[i].id}`, b: `${guides[j].type}/${guides[j].id}`, score: Math.round(score * 100) / 100 });
    }
  }
  return pairs.sort((x, y) => y.score - x.score);
}
