// Compares translated guides with their English source, using the same rules as
// src/lib/translation-structure.content.test.ts (L10N-006). The translator runs it
// before keeping a translation, so a guide that would fail the test is never written.
//
// Usage: node scripts/check-structure.ts <english.md> <translated.md> [<english.md> <translated.md> ...]
// Prints one JSON line per pair: {"translated": path, "mismatches": ["field: detail", ...]}.
// A translated path that does not exist yet can be given as "-" followed by the text on stdin
// (one pair only).
import { readFileSync } from 'node:fs';
import { compareDocuments } from '../src/lib/translation-structure.ts';
import { splitFrontmatter } from '../src/lib/yaml-subset.ts';

function read(path: string): string {
  return path === '-' ? readFileSync(0, 'utf8') : readFileSync(path, 'utf8');
}

const args = process.argv.slice(2);
if (args.length === 0 || args.length % 2 !== 0) {
  console.error('usage: node scripts/check-structure.ts <english.md> <translated.md> ...');
  process.exit(2);
}

let failed = 0;
for (let i = 0; i < args.length; i += 2) {
  const [englishPath, translatedPath] = [args[i], args[i + 1]];
  let mismatches: string[];
  try {
    const english = splitFrontmatter(read(englishPath));
    const translated = splitFrontmatter(read(translatedPath));
    mismatches = compareDocuments(english, translated, { translation: true }).map((m) => `${m.field}: ${m.detail}`);
  } catch (error) {
    mismatches = [`unreadable: ${error instanceof Error ? error.message : String(error)}`];
  }
  if (mismatches.length) failed += 1;
  console.log(JSON.stringify({ translated: translatedPath, mismatches }));
}
process.exit(failed ? 1 : 0);
