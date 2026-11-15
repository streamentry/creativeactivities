import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { RETIRED_GUIDES, RETIRED_SECTIONS, englishPathFor, isRetiredGuide } from './retired-guides';

/**
 * English content must never link to a retired guide. Links go to the redirect
 * target instead (the 301 is for old bookmarks only). Other languages keep their
 * own copies, so only English sources are scanned.
 */
const SRC = fileURLToPath(new URL('../', import.meta.url));

/** Lines that intentionally name a retired path, with the reason. */
const ALLOWED: readonly { file: string; text: string; reason: string }[] = [
  { file: 'views/HomeView.astro', text: "l('/brain-health/')", reason: 'non-English research block; English hides it' },
  { file: 'lib/site.ts', text: "href: '/brain-health/'", reason: 'retired section metadata, not a guide link' },
];

/** Every file under `dir` (relative to src/), excluding tests. */
function sources(dir: string, exts: readonly string[]): string[] {
  const root = join(SRC, dir);
  if (!existsSync(root)) return [];
  return readdirSync(root, { recursive: true })
    .map(String)
    .filter((f) => exts.some((e) => f.endsWith(e)) && !f.endsWith('.test.ts') && !f.endsWith('retired-guides.ts'))
    .map((f) => join(dir, f))
    .filter((f) => statSync(join(SRC, f)).isFile());
}

function englishFiles(): string[] {
  const guides = sources('content/guides', ['.md']).filter((f) => {
    const id = relative('content/guides', f).replace(/\.md$/, '');
    return !isRetiredGuide(id);
  });
  return [
    ...sources('content/hubs', ['.md']),
    ...sources('content/activity-cards', ['.md']),
    ...guides,
    ...sources('pages', ['.astro', '.ts']),
    ...sources('views', ['.astro', '.ts', '.tsx']),
    ...sources('components', ['.astro', '.ts', '.tsx']),
    ...sources('layouts', ['.astro']),
    ...sources('data', ['.ts']),
    ...sources('lib', ['.ts', '.tsx']),
    ...sources('tools', ['.ts', '.tsx']),
  ];
}

/** Every English string value in a dictionary JSON file. */
function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

const RETIRED_PATH = new RegExp(
  [...Object.keys(RETIRED_GUIDES).map((id) => `/${id}`), ...Object.keys(RETIRED_SECTIONS).map((s) => `/${s}`)]
    .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .map((p) => `(?<![\\w/.-])${p}(?![\\w-])`)
    .join('|'),
);

/** Ids written as list items, such as `guides: [activities/alzheimers]`. */
const RETIRED_LIST_ID = new RegExp(
  Object.keys(RETIRED_GUIDES)
    .map((id) => id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .map((id) => `(?<![\\w/-])${id}(?![\\w-])`)
    .join('|'),
);

function offending(file: string, text: string): string[] {
  return text
    .split('\n')
    .filter((line) => !ALLOWED.some((a) => a.file === file && line.includes(a.text)))
    .filter((line) => RETIRED_PATH.test(line) || (/^\s*(guides|relatedGuides):/.test(line) && RETIRED_LIST_ID.test(line)))
    .map((line) => line.trim().slice(0, 160));
}

describe('English sources never link to a retired guide', () => {
  it('finds no retired guide path or list id in English source files', () => {
    const files = englishFiles();
    expect(files.length).toBeGreaterThan(50);
    const bad: string[] = [];
    for (const f of files) {
      for (const line of offending(f, readFileSync(join(SRC, f), 'utf8'))) bad.push(`${f}: ${line}`);
    }
    expect(bad).toEqual([]);
  });

  it('finds no retired guide path in English dictionary strings', () => {
    const bad: string[] = [];
    for (const f of ['i18n/ui/en.json', 'i18n/games/en.json']) {
      const values = strings(JSON.parse(readFileSync(join(SRC, f), 'utf8')));
      for (const v of values) if (RETIRED_PATH.test(v)) bad.push(`${f}: ${v.slice(0, 160)}`);
    }
    expect(bad).toEqual([]);
  });
});

describe('englishPathFor', () => {
  it('sends a retired English address to its redirect target and leaves other paths alone', () => {
    expect(englishPathFor('/activities/alzheimers/')).toBe('/activities/ideas/');
    expect(englishPathFor('/brain-health/diet/')).toBe('/dementia-activities/');
    expect(englishPathFor('/brain-health/')).toBe('/dementia-activities/');
    expect(englishPathFor('/activities/ideas/')).toBe('/activities/ideas/');
    expect(englishPathFor('/')).toBe('/');
  });
});
