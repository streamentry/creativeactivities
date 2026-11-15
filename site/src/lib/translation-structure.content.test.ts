import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { activityCardLike, compareActivityCards, compareDocuments, type Mismatch } from './translation-structure';
import { parseYamlSubset, splitFrontmatter } from './yaml-subset';

/**
 * L10N-006 over the real content. Every translated guide is compared with its
 * English source. Mismatches recorded in translation-structure.baseline.json
 * are known and reported but do not fail; a new mismatch (a new file, or a new
 * difference in a recorded file) fails. Translated activity cards have no
 * baseline: any mismatch fails.
 *
 * To re-record the baseline after a reviewed fix: TRANSLATION_BASELINE_WRITE=1 pnpm exec vitest run src/lib/translation-structure.content.test.ts
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = resolve(HERE, '..', '..');
const CONTENT = join(SITE, 'src', 'content');
const BASELINE_PATH = join(HERE, 'translation-structure.baseline.json');

type Baseline = Record<string, string[]>;

function walkMarkdown(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walkMarkdown(path, out);
    else if (name.endsWith('.md')) out.push(path);
  }
  return out;
}

function readDocument(path: string) {
  return splitFrontmatter(readFileSync(path, 'utf8'));
}

function signature(m: Mismatch): string {
  return `${m.field}: ${m.detail}`;
}

/** Every translated guide, keyed by its path relative to src/content. */
function compareGuides(): Map<string, Mismatch[]> {
  const i18nRoot = join(CONTENT, 'guides-i18n');
  const englishRoot = join(CONTENT, 'guides');
  const results = new Map<string, Mismatch[]>();
  for (const file of walkMarkdown(i18nRoot)) {
    const rel = relative(CONTENT, file);
    const inLocale = relative(i18nRoot, file).split('/').slice(1).join('/');
    const english = join(englishRoot, inLocale);
    if (!existsSync(english)) {
      results.set(rel, [{ field: 'source', detail: `no English guide at guides/${inLocale}` }]);
      continue;
    }
    const mismatches = compareDocuments(readDocument(english), readDocument(file), { translation: true });
    if (mismatches.length) results.set(rel, mismatches);
  }
  return results;
}

function compareCards(): Map<string, Mismatch[]> {
  const i18nRoot = join(CONTENT, 'activity-cards-i18n');
  const results = new Map<string, Mismatch[]>();
  if (!existsSync(i18nRoot)) return results;
  for (const file of walkMarkdown(i18nRoot)) {
    const rel = relative(CONTENT, file);
    const slug = relative(i18nRoot, file).split('/').slice(1).join('/');
    const english = join(CONTENT, 'activity-cards', slug);
    if (!existsSync(english)) {
      results.set(rel, [{ field: 'source', detail: `no English card at activity-cards/${slug}` }]);
      continue;
    }
    const en = activityCardLike(parseYamlSubset(readFrontmatterText(english)));
    const tr = activityCardLike(parseYamlSubset(readFrontmatterText(file)));
    const mismatches = compareActivityCards(en, tr);
    if (mismatches.length) results.set(rel, mismatches);
  }
  return results;
}

function readFrontmatterText(path: string): string {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(path, 'utf8'));
  return match ? match[1] : '';
}

describe('translated guides keep the English structure (L10N-006)', () => {
  it('reports the structure summary and fails only on new mismatches', () => {
    const results = compareGuides();
    const baseline: Baseline = existsSync(BASELINE_PATH) ? JSON.parse(readFileSync(BASELINE_PATH, 'utf8')) : {};

    const byField = new Map<string, number>();
    for (const mismatches of results.values()) {
      for (const m of mismatches) byField.set(m.field, (byField.get(m.field) ?? 0) + 1);
    }

    if (process.env.TRANSLATION_BASELINE_WRITE === '1') {
      const next: Baseline = {};
      for (const [rel, mismatches] of [...results.entries()].sort(([a], [b]) => (a < b ? -1 : 1))) {
        next[rel] = mismatches.map(signature);
      }
      writeFileSync(BASELINE_PATH, JSON.stringify(next, null, 2) + '\n');
      console.log(`baseline written: ${BASELINE_PATH}`);
      return;
    }

    const newOnes: string[] = [];
    let known = 0;
    for (const [rel, mismatches] of results) {
      const recorded = new Set(baseline[rel] ?? []);
      for (const m of mismatches) {
        if (recorded.has(signature(m))) known += 1;
        else newOnes.push(`${rel} :: ${signature(m)}`);
      }
    }
    const stale = Object.keys(baseline).filter((rel) => !results.has(rel));

    console.log(
      [
        `translated guides checked: ${results.size} files with mismatches`,
        `  known (baseline): ${known}`,
        `  new: ${newOnes.length}`,
        `  baseline entries that no longer mismatch: ${stale.length}`,
        `  by field: ${[...byField].map(([f, n]) => `${f}=${n}`).join(', ')}`,
      ].join('\n'),
    );
    expect(newOnes.slice(0, 50)).toEqual([]);
  }, 120000);
});

describe('translated activity cards keep the English structure (L10N-006, L10N-011)', () => {
  const hasCards = existsSync(join(CONTENT, 'activity-cards-i18n'));
  it.skipIf(!hasCards)('no translated card is missing a step, variation, safety flag or supervision level', () => {
    const results = compareCards();
    const lines = [...results].flatMap(([rel, ms]) => ms.map((m) => `${rel} :: ${signature(m)}`));
    expect(lines).toEqual([]);
  });
});
