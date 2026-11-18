import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { hasValue, inventoryRow, nearDuplicates, scalar, tally, toCsv } from '../../scripts/library-inventory-lib.mjs';
import { buildInventory } from '../../scripts/library-inventory.mjs';

/** CNT-040: the inventory file matches the content, so the counts in the plan are never a guess. */
describe('library inventory (CNT-040)', () => {
  it('reads front matter values and lists', () => {
    const fm = 'title: "A: B"\nsources:\n  - one\nupdated: 2026-01-02\nrelated: []\nindexable: false';
    expect(scalar(fm, 'title')).toBe('A: B');
    expect(hasValue(fm, 'sources')).toBe(true);
    expect(hasValue(fm, 'related')).toBe(false);
    expect(inventoryRow('hub', 'x', fm).status).toBe('noindex');
    expect(inventoryRow('hub', 'x', fm).sources_present).toBe('yes');
  });

  it('never invents a reviewer, test date or AI flag', () => {
    const row = inventoryRow('activity', 'x', 'name: X\nupdated: 2026-01-02');
    expect(row.reviewer).toBe('none');
    expect(row.tested_date).toBe('not recorded');
    expect(row.ai_assisted).toBe('not recorded');
  });

  it('finds overlapping titles but not generic ones', () => {
    const rows = [
      { type: 'guide', id: 'a', title: 'Conversation games for all ages' },
      { type: 'guide', id: 'b', title: 'Conversation games with elderly people' },
      { type: 'guide', id: 'c', title: 'Gardening activities for dementia' },
    ];
    const pairs = nearDuplicates(rows);
    expect(pairs.map((p: { a: string; b: string }) => `${p.a} ${p.b}`)).toEqual(['guide/a guide/b']);
  });

  it('has an up-to-date inventory file', () => {
    const csv = toCsv(buildInventory());
    const file = readFileSync(new URL('../../../docs/specs/global/library-inventory.csv', import.meta.url), 'utf8');
    expect(file, 'run `pnpm library:inventory`').toBe(csv);
  });

  it('counts every English page', () => {
    const t = tally(buildInventory()) as Record<string, number>;
    expect(t['activity:published']).toBe(53);
    expect(t['hub:published']).toBe(7);
    expect(t['hub:noindex']).toBe(7);
    expect(Object.values(t).reduce((a, b) => a + b, 0)).toBe(182);
  });
});
