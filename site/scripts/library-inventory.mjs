// Writes the English library inventory (CNT-040): one row per activity card, hub and guide.
// Usage: node scripts/library-inventory.mjs [--check]   (--check exits 1 when the file is out of date)
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inventoryRow, nearDuplicates, tally, toCsv } from './library-inventory-lib.mjs';

const content = fileURLToPath(new URL('../src/content/', import.meta.url));
const out = fileURLToPath(new URL('../../docs/specs/global/library-inventory.csv', import.meta.url));

function markdown(dir, prefix = '') {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return markdown(path, `${prefix}${name}/`);
    return name.endsWith('.md') ? [{ id: `${prefix}${name.replace(/\.md$/, '')}`, path }] : [];
  });
}

export function buildInventory() {
  const sources = [
    ['activity', join(content, 'activity-cards')],
    ['hub', join(content, 'hubs')],
    ['guide', join(content, 'guides')],
  ];
  return sources.flatMap(([kind, dir]) =>
    markdown(dir).map(({ id, path }) => inventoryRow(kind, id, readFileSync(path, 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '')),
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const rows = buildInventory();
  const csv = toCsv(rows);
  if (process.argv.includes('--check')) {
    if (!existsSync(out) || readFileSync(out, 'utf8') !== csv) {
      console.error('docs/specs/global/library-inventory.csv is out of date: run `pnpm library:inventory`');
      process.exit(1);
    }
  } else {
    writeFileSync(out, csv);
    console.log(`${rows.length} rows`, tally(rows));
    const dups = nearDuplicates(rows);
    console.log(`${dups.length} near-duplicate title pairs`);
    for (const d of dups.slice(0, 15)) console.log(`  ${d.score} ${d.a} ~ ${d.b}`);
  }
}
