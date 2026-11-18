import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { activityCardSchema } from './activity-schema';
import { buildContentBundle, diffBundles, formatBundle, type CardInput, type ContentBundle } from './content-bundle';
import { BUNDLE_PATH, buildBundleFromDir, CARDS_DIR, readCards } from '../../scripts/content-bundle.mjs';
import { formatDiff } from '../../scripts/content-diff.mjs';
import { splitFrontmatter } from './yaml-subset';

/**
 * PLAT-035: one content contract for the web and the app. The committed bundle
 * is built from the activity cards, so it cannot drift from them.
 */

const schema = JSON.parse(readFileSync(new URL('./content-bundle.schema.json', import.meta.url), 'utf8')) as JsonSchema;

type JsonSchema = {
  type?: string | string[];
  const?: unknown;
  enum?: unknown[];
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  required?: string[];
  properties?: Record<string, JsonSchema>;
  additionalProperties?: boolean | JsonSchema;
  propertyNames?: JsonSchema;
  items?: JsonSchema;
  oneOf?: JsonSchema[];
};

/** A minimal JSON Schema check for the keywords content-bundle.schema.json uses. No dependency is added. */
function validate(value: unknown, s: JsonSchema, path = '$'): string[] {
  const errors: string[] = [];
  if (s.oneOf) {
    const passing = s.oneOf.filter((option) => validate(value, option, path).length === 0).length;
    if (passing !== 1) errors.push(`${path}: must match exactly one alternative`);
    return errors;
  }
  if (s.type) {
    const types = Array.isArray(s.type) ? s.type : [s.type];
    const actual = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value === 'number' && Number.isInteger(value) ? 'integer' : typeof value;
    const ok = types.some((t) => t === actual || (t === 'number' && typeof value === 'number'));
    if (!ok) return [`${path}: expected ${types.join('|')}, got ${actual}`];
  }
  if ('const' in s && value !== s.const) errors.push(`${path}: must be ${JSON.stringify(s.const)}`);
  if (s.enum && !s.enum.includes(value)) errors.push(`${path}: ${JSON.stringify(value)} is not an allowed value`);
  if (typeof value === 'string') {
    if (s.pattern && !new RegExp(s.pattern).test(value)) errors.push(`${path}: does not match ${s.pattern}`);
    if (s.minLength !== undefined && value.length < s.minLength) errors.push(`${path}: shorter than ${s.minLength}`);
    if (s.maxLength !== undefined && value.length > s.maxLength) errors.push(`${path}: longer than ${s.maxLength}`);
  }
  if (Array.isArray(value)) {
    if (s.minItems !== undefined && value.length < s.minItems) errors.push(`${path}: fewer than ${s.minItems} items`);
    if (s.maxItems !== undefined && value.length > s.maxItems) errors.push(`${path}: more than ${s.maxItems} items`);
    if (s.uniqueItems && new Set(value.map((v) => JSON.stringify(v))).size !== value.length) errors.push(`${path}: items are not unique`);
    if (s.items) value.forEach((item, i) => errors.push(...validate(item, s.items as JsonSchema, `${path}[${i}]`)));
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    for (const key of s.required ?? []) if (!(key in record)) errors.push(`${path}: missing ${key}`);
    if (s.propertyNames) {
      for (const key of Object.keys(record)) errors.push(...validate(key, s.propertyNames, `${path} key`));
    }
    for (const [key, child] of Object.entries(record)) {
      const declared = s.properties?.[key];
      if (declared) errors.push(...validate(child, declared, `${path}.${key}`));
      else if (s.additionalProperties === false) errors.push(`${path}: unexpected ${key}`);
      else if (s.additionalProperties && typeof s.additionalProperties === 'object') {
        errors.push(...validate(child, s.additionalProperties, `${path}.${key}`));
      }
    }
  }
  return errors;
}

const committed = JSON.parse(readFileSync(BUNDLE_PATH, 'utf8')) as ContentBundle;
const cards = readCards(CARDS_DIR);
const listedCardIds = cards
  .filter((card) => card.data.withdrawn === undefined)
  .map((card) => card.id);

/** A small hand-made card set, for the diff and the builder rules. */
function sample(id: string, overrides: Record<string, unknown> = {}): CardInput {
  return {
    id,
    data: {
      name: `Activity ${id}`,
      summary: 'A short summary of the activity.',
      steps: ['Set out the things.', 'Make the first piece.', 'Look at it together.'],
      materials: ['Paper'],
      safetyFlags: ['none'],
      safety: ['Keep it simple.'],
      variations: [
        { kind: 'easier', text: 'Do less at a time.' },
        { kind: 'seated', text: 'Sit at a table.' },
      ],
      images: [{ src: '/pictures/teacup.svg' }],
      review: null,
      published: '2026-11-01',
      updated: '2026-11-02',
      ...overrides,
    },
  };
}

describe('content bundle (PLAT-035)', () => {
  it('matches the committed file, so the web and the app read the same content', () => {
    expect(formatBundle(buildBundleFromDir(CARDS_DIR, committed.generated)), 'run `pnpm run content:bundle`').toBe(
      readFileSync(BUNDLE_PATH, 'utf8'),
    );
  });

  it('holds every listed card, once each, under its card id', () => {
    const ids = committed.activities.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of listedCardIds) {
      expect(ids, id).toContain(id);
    }
    expect(committed.activities.filter((a) => a.status === 'listed').map((a) => a.id).sort()).toEqual([...listedCardIds].sort());
    expect(ids).toHaveLength(cards.length);
  });

  it('builds only from cards that pass the site card schema', () => {
    for (const card of cards) {
      const parsed = activityCardSchema.safeParse(splitFrontmatter(readFileSync(new URL(`../content/activity-cards/${card.id}.md`, import.meta.url), 'utf8')).frontmatter);
      expect(parsed.success, card.id).toBe(true);
    }
  });

  it('validates the committed bundle against its JSON Schema', () => {
    expect(validate(committed, schema)).toEqual([]);
  });

  it('rejects a bundle that breaks the schema', () => {
    const broken = JSON.parse(JSON.stringify(committed)) as ContentBundle;
    broken.activities[0].status = 'hidden' as 'listed';
    delete (broken.activities[1] as Partial<ContentBundle['activities'][number]>).languages;
    const errors = validate(broken, schema);
    expect(errors.some((e) => e.includes('status'))).toBe(true);
    expect(errors.some((e) => e.includes('missing languages'))).toBe(true);
  });

  it('gives each activity one language of original text and a fixed surface set', () => {
    for (const activity of committed.activities) {
      expect(Object.keys(activity.languages)).toEqual(['en']);
      expect(activity.languages.en).toBe('original');
      const expected = activity.status === 'listed' ? ['web-card', 'large-print', 'print'] : ['web-card'];
      expect(activity.surfaces).toEqual(expected);
    }
  });

  it('keeps the bundle sorted by id, for reviewable diffs', () => {
    const ids = committed.activities.map((a) => a.id);
    expect(ids).toEqual([...ids].sort());
  });

  it('refuses duplicate ids and malformed dates', () => {
    expect(() => buildContentBundle([sample('a'), sample('a')], { generated: '2026-11-19' })).toThrow(/duplicate/);
    expect(() => buildContentBundle([sample('a', { published: 'November' })], { generated: '2026-11-19' })).toThrow(/YYYY-MM-DD/);
  });

  it('marks a withdrawn card as withdrawn and keeps it to its own page', () => {
    const bundle = buildContentBundle(
      [sample('gone', { withdrawn: { date: '2026-11-10', reason: 'x' } })],
      { generated: '2026-11-19' },
    );
    expect(bundle.activities[0].status).toBe('withdrawn');
    expect(bundle.activities[0].surfaces).toEqual(['web-card']);
  });

  it('reports which surfaces a changed step reaches', () => {
    const before = buildContentBundle([sample('a'), sample('b')], { generated: '2026-11-19' });
    const after = buildContentBundle([sample('a', { steps: ['Set out the things.', 'Make a new first piece.', 'Look at it together.'] }), sample('b')], { generated: '2026-11-19' });
    const diff = diffBundles(before, after);
    expect(diff.changed).toEqual([{ id: 'a', fields: ['steps'], surfaces: ['web-card', 'large-print', 'print', 'app'] }]);
    expect(diff.added).toEqual([]);
    expect(diff.removed).toEqual([]);
  });

  it('reports which surfaces a changed safety line reaches', () => {
    const before = buildContentBundle([sample('a')], { generated: '2026-11-19' });
    const after = buildContentBundle([sample('a', { safety: ['Keep it away from the stove.'] })], { generated: '2026-11-19' });
    const diff = diffBundles(before, after);
    expect(diff.changed).toEqual([{ id: 'a', fields: ['safety'], surfaces: ['web-card', 'large-print', 'print', 'app'] }]);
  });

  it('reports a removed card and does not count it as changed', () => {
    const before = buildContentBundle([sample('a'), sample('b')], { generated: '2026-11-19' });
    const after = buildContentBundle([sample('a')], { generated: '2026-11-19' });
    const diff = diffBundles(before, after);
    expect(diff.removed).toEqual(['b']);
    expect(diff.changed).toEqual([]);
    expect(formatDiff(diff)).toEqual(['removed: b']);
  });

  it('limits a date change to the web card and the app', () => {
    const before = buildContentBundle([sample('a')], { generated: '2026-11-19' });
    const after = buildContentBundle([sample('a', { updated: '2026-11-18' })], { generated: '2026-11-19' });
    expect(diffBundles(before, after).changed).toEqual([{ id: 'a', fields: ['updated'], surfaces: ['web-card', 'app'] }]);
  });

  it('prints "No content changes." when nothing differs', () => {
    const bundle = buildContentBundle([sample('a')], { generated: '2026-11-19' });
    expect(formatDiff(diffBundles(bundle, bundle))).toEqual(['No content changes.']);
  });
});
