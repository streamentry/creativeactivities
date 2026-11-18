#!/usr/bin/env node
// Prints what changed between two content bundles (PLAT-035): per activity id,
// the fields that changed and the surfaces they reach, plus added and removed ids.
// Usage: node scripts/content-diff.mjs <old.json> <new.json>
// Node 24 strips the TypeScript types on import.
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { diffBundles } from '../src/lib/content-bundle.ts';

/** The report as lines of text, so the test can read it without a process. */
export function formatDiff(diff) {
  const lines = [];
  for (const id of diff.added) lines.push(`added: ${id}`);
  for (const id of diff.removed) lines.push(`removed: ${id}`);
  for (const change of diff.changed) {
    lines.push(`changed: ${change.id}`);
    lines.push(`  fields: ${change.fields.join(', ')}`);
    lines.push(`  surfaces: ${change.surfaces.join(', ')}`);
  }
  for (const key of diff.bundle) lines.push(`bundle field changed: ${key}`);
  if (lines.length === 0) lines.push('No content changes.');
  return lines;
}

function load(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function main(args) {
  if (args.length !== 2) {
    console.error('usage: node scripts/content-diff.mjs <old.json> <new.json>');
    process.exit(2);
  }
  const diff = diffBundles(load(args[0]), load(args[1]));
  console.log(formatDiff(diff).join('\n'));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2));
}
