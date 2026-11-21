import { describe, expect, it } from 'vitest';
import { MATERIAL_TAGS } from './materials';
import { PRINT_LABELS, printLabel } from './materials-print';

describe('the printed checklist labels (CNT-007)', () => {
  it('has a short label for every tag, so no item prints with the long screen wording', () => {
    const missing = MATERIAL_TAGS.filter((t) => PRINT_LABELS[t.id] === undefined).map((t) => t.id);
    expect(missing).toEqual([]);
  });

  it('keeps each label short enough for one line in a column of the checklist', () => {
    for (const label of Object.values(PRINT_LABELS)) {
      expect(label.length).toBeGreaterThan(0);
      expect(label.length).toBeLessThanOrEqual(36);
    }
  });

  it('has no label for an id that is not a tag', () => {
    const ids = new Set(MATERIAL_TAGS.map((t) => t.id));
    expect(Object.keys(PRINT_LABELS).filter((id) => !ids.has(id))).toEqual([]);
  });

  it('falls back to the screen label for a tag with no short label', () => {
    const tag = { id: 'new-tag', label: 'A new item', group: 'paper' as const };
    expect(printLabel(tag)).toBe('A new item');
  });
});
