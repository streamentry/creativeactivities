import { describe, expect, it } from 'vitest';
import { REVIEWED_FIELDS, contentHash, normalizeValue, reviewedContent } from '../../scripts/content-hash-lib.mjs';

/** A card with every reviewed field set, as the front matter parser returns it. */
const card = (overrides: Record<string, unknown> = {}) => ({
  id: 'ca-0001',
  name: 'Arrange flowers together',
  updated: new Date('2026-10-25T00:00:00Z'),
  steps: ['Spread the towel on the table.', 'Fill the jar about halfway with water.', 'Trim the first stem.'],
  plainSteps: ['Spread the towel.', 'Fill the jar.', 'Trim the stem.'],
  materials: ['A small bunch of flowers', 'A jar that will not tip'],
  safety: ['Check the flowers are safe to handle.'],
  safetyFlags: ['sharp-tools'],
  stopNote: 'Stop when they are tired and put the stems in water.',
  variations: [
    { kind: 'easier', text: 'Trim all the stems to one length first.' },
    { kind: 'bedside', text: 'Use a heavy mug on a tray table.' },
  ],
  ...overrides,
});

describe('content hash (PLAT-005)', () => {
  it('hashes exactly the reviewable fields, in a fixed order', () => {
    expect(REVIEWED_FIELDS).toEqual(['steps', 'plainSteps', 'materials', 'safety', 'safetyFlags', 'stopNote', 'variations']);
    expect(Object.keys(reviewedContent(card()))).toEqual(REVIEWED_FIELDS);
  });

  it('gives the same hash for the same content', () => {
    expect(contentHash(card())).toBe(contentHash(card()));
  });

  it('returns sha256 followed by 64 hex digits', () => {
    expect(contentHash(card())).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it('ignores key order at every level', () => {
    const reordered = card({
      variations: [
        { text: 'Trim all the stems to one length first.', kind: 'easier' },
        { text: 'Use a heavy mug on a tray table.', kind: 'bedside' },
      ],
    });
    const shuffled = Object.fromEntries(Object.entries(card()).reverse());
    expect(contentHash(reordered)).toBe(contentHash(card()));
    expect(contentHash(shuffled)).toBe(contentHash(card()));
  });

  it('ignores whitespace-only changes inside text', () => {
    const spaced = card({
      steps: ['  Spread the towel  on the table. ', 'Fill the jar about\nhalfway with water.', 'Trim the first stem.'],
      stopNote: 'Stop when they are tired and\tput the stems in water.',
    });
    expect(contentHash(spaced)).toBe(contentHash(card()));
  });

  it('ignores fields that are not reviewable content', () => {
    const edited = card({ name: 'Arrange the flowers', updated: new Date('2027-01-01T00:00:00Z'), images: [], review: { name: 'x' } });
    expect(contentHash(edited)).toBe(contentHash(card()));
  });

  it('changes when a step is reworded', () => {
    const changed = card({ steps: ['Spread the towel on the table.', 'Fill the jar with water.', 'Trim the first stem.'] });
    expect(contentHash(changed)).not.toBe(contentHash(card()));
  });

  it('changes when the order of steps changes', () => {
    const swapped = card({ steps: ['Fill the jar about halfway with water.', 'Spread the towel on the table.', 'Trim the first stem.'] });
    expect(contentHash(swapped)).not.toBe(contentHash(card()));
  });

  it('changes when a safety flag or a safety line changes', () => {
    expect(contentHash(card({ safetyFlags: ['sharp-tools', 'hot-water'] }))).not.toBe(contentHash(card()));
    expect(contentHash(card({ safety: ['Check the flowers are safe to handle, and wash hands.'] }))).not.toBe(contentHash(card()));
  });

  it('changes when a material, the stop note or a variation changes', () => {
    expect(contentHash(card({ materials: ['A small bunch of flowers'] }))).not.toBe(contentHash(card()));
    expect(contentHash(card({ stopNote: 'Stop and rest.' }))).not.toBe(contentHash(card()));
    const otherVariations = [
      { kind: 'easier', text: 'Trim all the stems to one length.' },
      { kind: 'bedside', text: 'Use a heavy mug on a tray table.' },
    ];
    expect(contentHash(card({ variations: otherVariations }))).not.toBe(contentHash(card()));
  });

  it('treats a missing optional field differently from an empty one', () => {
    const { plainSteps: _omitted, ...withoutPlain } = card();
    expect(contentHash(withoutPlain)).not.toBe(contentHash(card({ plainSteps: [] })));
    expect(contentHash(withoutPlain)).toBe(contentHash(card({ plainSteps: undefined })));
  });

  it('normalizes text to NFC so composed and decomposed accents match', () => {
    expect(normalizeValue('café')).toBe(normalizeValue('café'));
  });
});
