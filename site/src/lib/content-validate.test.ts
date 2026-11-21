import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { issuesOf, listRecordFiles, patternToRegExp } from '../../scripts/content-validate-lib.mjs';
import { activityCardSchema } from './activity-schema';

/** A valid card as the schema reads it (the front matter of the real sample, already parsed). */
const CARD_DATA = {
  name: 'Arrange flowers together',
  seoTitle: 'Arrange Flowers Together: A Simple Shared Activity',
  description:
    'Arrange a jar of flowers together from garden or store stems. Five minutes to set up, seated at a table, low cost, with easier, bedside and low-vision versions.',
  summary: 'Choose, trim and place flowers or leafy stems in a jar or vase together.',
  type: 'nature',
  prepMinutes: 5,
  activityMinutes: [10, 30],
  cost: 'low',
  mess: 'low',
  energy: 'low',
  supervision: 'nearby',
  settings: ['tabletop', 'seated', 'bedside'],
  groups: ['one-to-one', 'small-group', 'intergenerational'],
  materials: ['A small bunch of flowers or leafy stems, checked as safe to handle', 'A jar, mug or vase that will not tip easily', 'Water in a jug'],
  senses: ['sight', 'touch', 'smell'],
  steps: ['Spread the towel on the table.', 'Fill the jar about halfway with water.', 'Place the first stem in the jar.'],
  variations: [
    { kind: 'easier', text: 'Trim all the stems to the same length before you start and offer two at a time to choose from.' },
    { kind: 'bedside', text: 'Use a small, heavy mug on a tray table with three to five short stems. Keep the water low.' },
  ],
  safetyFlags: ['none'],
  safety: ['Keep the vase on a steady surface away from the edge of the table.'],
  stopNote: 'Stop when the stems are placed, or whenever the person wants to rest.',
  published: '2026-11-15',
  updated: '2026-11-15',
  version: 1,
  author: 'Creative Activities editorial team',
};

const SITE = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCRIPT = join(SITE, 'scripts', 'content-validate.mjs');

/** One real record of each type; the broken copy changes a single field. */
const RECORDS = [
  {
    type: 'activity card',
    path: 'src/content/activity-cards/arrange-flowers-together.md',
    broken: ['prepMinutes: 5', 'prepMinutes: 90'],
    field: 'prepMinutes',
  },
  {
    type: 'guide',
    path: 'src/content/guides/crafts/seasonal-crafts.md',
    broken: ['section: crafts', 'section: gardening'],
    field: 'section',
  },
  {
    type: 'hub',
    path: 'src/content/hubs/reminiscence-activities.md',
    broken: ['published: 2026-11-15', 'published: someday'],
    field: 'published',
  },
  {
    type: 'translated guide',
    path: 'src/content/guides-i18n/sl/brain-health/sleep.md',
    broken: ['translatedFrom: 2026-10-25', 'translatedFrom: someday'],
    field: 'translatedFrom',
  },
] as const;

const fixtures: string[] = [];

/** A folder with only the given files, at the same relative paths the site uses. */
function makeFixture(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'content-validate-'));
  fixtures.push(root);
  for (const [path, contents] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), contents);
  }
  return root;
}

function runValidator(root?: string) {
  const args = root ? [SCRIPT, '--root', root] : [SCRIPT];
  const result = spawnSync(process.execPath, args, { encoding: 'utf8' });
  return { status: result.status, output: `${result.stdout}${result.stderr}` };
}

function realRecord(path: string): string {
  return readFileSync(join(SITE, path), 'utf8');
}

afterEach(() => {
  for (const root of fixtures.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe('content:validate on the real repository', () => {
  it('passes every record of every type', () => {
    const { status, output } = runValidator();
    expect(output).toMatch(/^Record type\s+files\s+valid\s+invalid$/m);
    for (const name of ['guides', 'guidesI18n', 'activityCards', 'hubs']) {
      expect(output).toMatch(new RegExp(`^${name}\\s+(\\d+)\\s+\\1\\s+0$`, 'm'));
    }
    expect(output).toMatch(/records checked, 0 invalid/);
    expect(status).toBe(0);
  }, 120_000);
});

describe('content:validate with one broken record per type', () => {
  it.each(RECORDS)('a valid $type passes', ({ path }) => {
    const root = makeFixture({ [path]: realRecord(path) });
    expect(runValidator(root).status).toBe(0);
  });

  it.each(RECORDS)('a broken $type fails with its file, field and message', ({ path, broken, field }) => {
    const [from, to] = broken;
    const contents = realRecord(path);
    expect(contents).toContain(from);
    const root = makeFixture({ [path]: contents.replace(from, to) });

    const { status, output } = runValidator(root);
    expect(status).toBe(1);
    expect(output).toContain(`FAIL ${path}: `);
    expect(output).toMatch(new RegExp(`FAIL ${path.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}: .*${field}: \\S`));
  });

  it('reports a record with no front matter block', () => {
    const root = makeFixture({ 'src/content/activity-cards/no-front-matter.md': 'Just a body.\n' });
    const { status, output } = runValidator(root);
    expect(status).toBe(1);
    expect(output).toContain('FAIL src/content/activity-cards/no-front-matter.md: (front matter): no --- front matter block found');
  });

  it('reports YAML that does not parse, with the file and line of the error', () => {
    const path = 'src/content/hubs/broken-yaml.md';
    const root = makeFixture({ [path]: '---\ntitle: "unclosed\n---\nBody\n' });
    const { status, output } = runValidator(root);
    expect(status).toBe(1);
    expect(output).toMatch(new RegExp(`FAIL ${path}: \\(front matter\\): YAML error: \\S`));
  });

  it('lists every failing record and counts them by type', () => {
    const card = RECORDS[0];
    const hub = RECORDS[2];
    const root = makeFixture({
      [card.path]: realRecord(card.path).replace(card.broken[0], card.broken[1]),
      [hub.path]: realRecord(hub.path).replace(hub.broken[0], hub.broken[1]),
    });
    const { status, output } = runValidator(root);
    expect(status).toBe(1);
    expect(output.match(/^FAIL /gm)).toHaveLength(2);
    expect(output).toMatch(/^activityCards\s+1\s+0\s+1$/m);
    expect(output).toMatch(/^hubs\s+1\s+0\s+1$/m);
  });
});

describe('validator helpers', () => {
  it('turns a glob into a matcher for the patterns the site uses', () => {
    expect(patternToRegExp('*.md').test('card.md')).toBe(true);
    expect(patternToRegExp('*.md').test('sub/card.md')).toBe(false);
    expect(patternToRegExp('**/*.md').test('card.md')).toBe(true);
    expect(patternToRegExp('**/*.md').test('a/b/card.md')).toBe(true);
    expect(patternToRegExp('**/*.md').test('a/b/card.txt')).toBe(false);
  });

  it('skips dot files and dot folders, as Astro glob loader does', () => {
    const root = makeFixture({
      'src/content/hubs/a.md': 'x',
      'src/content/hubs/.hidden.md': 'x',
      'src/content/hubs/.cache/b.md': 'x',
      'src/content/hubs/sub/c.md': 'x',
    });
    expect(listRecordFiles(join(root, 'src/content/hubs'), '**/*.md')).toEqual(['a.md', 'sub/c.md']);
  });

  it('gives a readable field and message for each Zod issue, using the real card schema', () => {
    const issues: { field: string; message: string }[] = issuesOf(activityCardSchema, {
      ...CARD_DATA,
      prepMinutes: 90,
      steps: ['One step only'],
    });
    expect(issues.map((issue) => issue.field)).toEqual(['prepMinutes', 'steps']);
    expect(issues.every((issue) => issue.message.length > 0)).toBe(true);
    expect(issuesOf(activityCardSchema, CARD_DATA)).toEqual([]);
  });
});
