#!/usr/bin/env node
// Determinism check (PLAT-013): two builds from the same inputs must produce identical output.
// Compares every file in two dist folders by SHA-256 and reports what differs, grouped by folder, with the
// first differing line of text files. Exits 1 if any file differs, is missing from one side, or is not allowlisted.
// Usage: node scripts/check-determinism.mjs <first-dist> <second-dist>

import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep, dirname, resolve } from 'node:path';

/**
 * Files that legitimately carry build time or other per-run values. Each entry must say why.
 * Empty on purpose: the baseline build has no such files. Add an entry only after finding one and explaining it.
 */
const ALLOWLIST = new Map([
  // Example shape (none today): ['some/path.html', 'why this file carries build time'],
]);

const TEXT_EXTENSIONS = new Set(['.html', '.xml', '.txt', '.json', '.js', '.mjs', '.css', '.svg', '.webmanifest', '.md', '.csv']);
const SAMPLE_LIMIT = 160;
const LIST_LIMIT_PER_GROUP = 15;

/** Map of relative path to { bytes, sha256, abs } for every file under root. */
function hashTree(root) {
  const out = new Map();
  const walk = (dir) => {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, item.name);
      if (item.isDirectory()) walk(full);
      else if (item.isFile()) {
        const rel = relative(root, full).split(sep).join('/');
        const buf = readFileSync(full);
        out.set(rel, { bytes: statSync(full).size, sha256: createHash('sha256').update(buf).digest('hex'), abs: full });
      }
    }
  };
  walk(root);
  return out;
}

/** The first line where two text files differ, shortened for the report. Null for binary or identical files. */
function firstDifferingLine(relPath, aAbs, bAbs) {
  const ext = relPath.slice(relPath.lastIndexOf('.')).toLowerCase();
  if (!TEXT_EXTENSIONS.has(ext)) return null;
  const a = readFileSync(aAbs, 'utf8').split('\n');
  const b = readFileSync(bAbs, 'utf8').split('\n');
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i += 1) {
    if (a[i] !== b[i]) {
      const clip = (s) => (s === undefined ? '(no line)' : s.length > SAMPLE_LIMIT ? `${s.slice(0, SAMPLE_LIMIT)}...` : s);
      return { line: i + 1, first: clip(a[i]), second: clip(b[i]) };
    }
  }
  return null;
}

function main() {
  const [firstArg, secondArg] = process.argv.slice(2);
  if (!firstArg || !secondArg) {
    console.error('Usage: node scripts/check-determinism.mjs <first-dist> <second-dist>');
    process.exit(2);
  }
  const first = resolve(firstArg);
  const second = resolve(secondArg);
  const a = hashTree(first);
  const b = hashTree(second);

  const onlyFirst = [...a.keys()].filter((p) => !b.has(p)).sort();
  const onlySecond = [...b.keys()].filter((p) => !a.has(p)).sort();
  const differing = [...a.keys()].filter((p) => b.has(p) && a.get(p).sha256 !== b.get(p).sha256).sort();
  const allowed = differing.filter((p) => ALLOWLIST.has(p));
  const failing = differing.filter((p) => !ALLOWLIST.has(p));

  console.log(`Compared ${a.size} files in ${first} with ${b.size} files in ${second}.`);
  console.log(`Identical: ${a.size - differing.length - onlyFirst.length} files. Differing: ${differing.length}. Only in first: ${onlyFirst.length}. Only in second: ${onlySecond.length}. Allowlisted: ${allowed.length}.`);

  const groups = new Map();
  for (const p of differing) {
    const dir = dirname(p) === '.' ? '(root)' : dirname(p);
    if (!groups.has(dir)) groups.set(dir, []);
    groups.get(dir).push(p);
  }
  for (const [dir, paths] of [...groups.entries()].sort((x, y) => y[1].length - x[1].length)) {
    console.log(`\n${dir}: ${paths.length} differing`);
    for (const p of paths.slice(0, LIST_LIMIT_PER_GROUP)) {
      const tag = ALLOWLIST.has(p) ? ' [allowlisted]' : '';
      const sample = firstDifferingLine(p, a.get(p).abs, b.get(p).abs);
      console.log(`  ${p}${tag}`);
      if (sample) console.log(`    line ${sample.line}: first "${sample.first}" / second "${sample.second}"`);
      else console.log(`    binary or non-text: ${a.get(p).bytes} bytes vs ${b.get(p).bytes} bytes`);
    }
    if (paths.length > LIST_LIMIT_PER_GROUP) console.log(`  ... and ${paths.length - LIST_LIMIT_PER_GROUP} more`);
  }
  if (onlyFirst.length) console.log(`\nOnly in first (${onlyFirst.length}): ${onlyFirst.slice(0, LIST_LIMIT_PER_GROUP).join(', ')}`);
  if (onlySecond.length) console.log(`\nOnly in second (${onlySecond.length}): ${onlySecond.slice(0, LIST_LIMIT_PER_GROUP).join(', ')}`);

  const ok = failing.length === 0 && onlyFirst.length === 0 && onlySecond.length === 0;
  console.log(ok ? '\nPASS: the two builds are identical (allowlisted files excepted).' : '\nFAIL: the two builds differ.');
  process.exit(ok ? 0 : 1);
}

main();
