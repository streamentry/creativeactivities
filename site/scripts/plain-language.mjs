#!/usr/bin/env node
// Plain-language prompts for an editor (TSA-008). Reads every activity card's steps and every hub's sentences and lists the
// ones an editor may want to look at: long steps, steps of more than one sentence, long hub sentences. A reading grade is a
// prompt, not a score target. The one rule that fails the check is the spec's: no step joins two actions with "and then".
// Usage: node scripts/plain-language.mjs [--all]     (lists every prompt, not the first ten of each kind)

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LONG_SENTENCE_WORDS, LONG_STEP_WORDS, longSentences, readSteps, splitMarkdown, summarize, wordsOf } from './plain-language-lib.mjs';

const CARDS = fileURLToPath(new URL('../src/content/activity-cards/', import.meta.url));
const HUBS = fileURLToPath(new URL('../src/content/hubs/', import.meta.url));
const ALL = process.argv.includes('--all');

/** Every markdown file under a folder. */
export function markdownFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return markdownFiles(full);
    return name.endsWith('.md') ? [full] : [];
  });
}

export function readCards() {
  return markdownFiles(CARDS).map((file) => ({
    id: file.slice(file.lastIndexOf('/') + 1, -3),
    steps: readSteps(splitMarkdown(readFileSync(file, 'utf8')).frontMatter),
  }));
}

export function readHubs() {
  return markdownFiles(HUBS).map((file) => ({
    id: file.slice(HUBS.length, -3),
    long: longSentences(splitMarkdown(readFileSync(file, 'utf8')).body),
  }));
}

function main() {
  const cards = readCards();
  const hubs = readHubs();
  const s = summarize(cards);
  const show = (items) => (ALL ? items : items.slice(0, 10));
  const quote = (text) => `"${text.length > 90 ? `${text.slice(0, 87)}...` : text}"`;

  console.log('Plain-language prompts for an editor (TSA-008). A reading grade is a prompt, not a score target.');
  console.log(`Activity steps: ${s.steps} steps in ${s.cards} cards. Mean reading grade ${s.meanGrade.toFixed(1)} (Flesch-Kincaid). Longest step: ${s.longest} words.`);
  console.log(`Rule: no step joins two actions with "and then". ${s.rule.length} step${s.rule.length === 1 ? '' : 's'} break it.`);
  for (const p of s.rule) console.log(`  ${p.card} step ${p.step}: ${quote(p.stepText)}`);

  console.log(`\nFor an editor to look at: ${s.long.length} steps of ${LONG_STEP_WORDS} words or more, and ${s.several.length} steps of more than one sentence.`);
  for (const p of show(s.long)) console.log(`  ${p.card} step ${p.step} (${p.note}): ${quote(p.stepText)}`);
  if (!ALL && s.long.length > 10) console.log(`  ... ${s.long.length - 10} more (--all lists them)`);

  const sentences = hubs.flatMap((hub) => hub.long.map((sentence) => ({ hub: hub.id, sentence })));
  console.log(`\nHubs: ${hubs.length} hub pages, ${sentences.length} sentences of ${LONG_SENTENCE_WORDS} words or more.`);
  for (const item of show(sentences)) console.log(`  ${item.hub} (${wordsOf(item.sentence).length} words): ${quote(item.sentence)}`);
  if (!ALL && sentences.length > 10) console.log(`  ... ${sentences.length - 10} more (--all lists them)`);

  console.log('\nThe editor decides. This is a prompt, and a short step must not lose a safety instruction.');
  process.exit(s.rule.length ? 1 : 0);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
