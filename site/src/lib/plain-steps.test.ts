import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { splitFrontmatter } from './yaml-subset';
import {
  PLAIN_STEP_MAX_WORDS,
  plainMaterialProblems,
  plainSafetyProblems,
  plainStepProblems,
  safetyKeywordsIn,
} from './plain-steps';

/** Cards that carry plain steps, read from the frontmatter on disk. */
const dir = new URL('../content/activity-cards/', import.meta.url);
const cards = readdirSync(dir)
  .filter((f) => f.endsWith('.md'))
  .map((file) => ({ file, data: splitFrontmatter(readFileSync(new URL(file, dir), 'utf8')).frontmatter }))
  .filter((c) => Array.isArray(c.data.plainSteps));

const list = (value: unknown): string[] => (Array.isArray(value) ? value.map(String) : []);

describe('plain steps on the cards on disk (WEB-039)', () => {
  it('has plain steps on every listed card, so the Short steps switch is never missing', () => {
    const all = readdirSync(dir).filter((f) => f.endsWith('.md'));
    expect(cards.map((c) => c.file).sort()).toEqual(all.sort());
  });

  it.each(cards.map((c) => [c.file, c] as const))('%s: each plain step is short and does one action', (_file, card) => {
    expect(plainStepProblems(list(card.data.plainSteps))).toEqual([]);
    for (const step of list(card.data.plainSteps)) {
      expect(step.split(/\s+/).length).toBeLessThanOrEqual(PLAIN_STEP_MAX_WORDS);
    }
  });

  it.each(cards.map((c) => [c.file, c] as const))('%s: safety words match the standard steps and safety notes', (_file, card) => {
    expect(
      plainSafetyProblems(list(card.data.steps), list(card.data.plainSteps), list(card.data.safety)),
    ).toEqual([]);
  });

  it.each(cards.map((c) => [c.file, c] as const))('%s: plain steps name only things the card already names', (_file, card) => {
    expect(plainMaterialProblems(list(card.data.plainSteps), list(card.data.materials), list(card.data.steps))).toEqual([]);
  });
});

describe('plainStepProblems', () => {
  it('accepts short single-action steps', () => {
    expect(plainStepProblems(['Fold the sheet in half.', 'Press the crease flat.'])).toEqual([]);
  });

  it('flags a step over the word limit', () => {
    const long = 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen.';
    expect(plainStepProblems([long]).join()).toMatch(/15 words/);
  });

  it('flags two actions joined with "and then" or a semicolon', () => {
    expect(plainStepProblems(['Fold it, and then press it.'])).toHaveLength(1);
    expect(plainStepProblems(['Fold it; press it.'])).toHaveLength(1);
  });

  it('flags a step with more than one sentence', () => {
    expect(plainStepProblems(['Fold it. Press it.'])).toHaveLength(1);
  });

  it('flags an empty step', () => {
    expect(plainStepProblems(['   '])).toHaveLength(1);
  });
});

describe('plainSafetyProblems', () => {
  const standard = ['Float it in a basin of water.', 'Fold the sheet.'];
  const safety = ['Use only a few inches of water.'];

  it('flags a standard safety step that no plain step keeps', () => {
    expect(plainSafetyProblems(standard, ['Fold the sheet.'], safety)).toHaveLength(1);
  });

  it('accepts a plain step that keeps the safety word', () => {
    expect(plainSafetyProblems(standard, ['Float it in a basin of water.'], safety)).toEqual([]);
  });

  it('flags a plain step that adds a safety word the card does not say', () => {
    expect(plainSafetyProblems(['Fold the sheet.'], ['Keep the scissors near.'], safety)).toHaveLength(2);
  });
});

describe('plainMaterialProblems', () => {
  it('flags a named object the materials do not list', () => {
    expect(plainMaterialProblems(['Lay the paper on the tray.'], ['A sheet of paper'])).toHaveLength(1);
  });

  it('accepts a named object the standard steps already mention', () => {
    expect(plainMaterialProblems(['Offer a drink of water.'], ['A chair'], ['Offer a drink of water when you finish.'])).toEqual([]);
  });

  it('accepts a named object the materials list', () => {
    expect(plainMaterialProblems(['Lay the paper on the tray.'], ['A sheet of paper', 'A tray'])).toEqual([]);
  });

  it('matches safety keywords at the start of a word', () => {
    expect(safetyKeywordsIn('The helper can do the cutting.')).toEqual(['cut']);
  });
});
