import { describe, expect, it } from 'vitest';
import { canonical, checkCardVersions, type VersionedCard } from './card-versions';

/** A card as the frontmatter reader gives it, at version 1 with one changes entry. */
const BASE_ENTRY = { date: '2026-11-15', safety: true, note: 'Added labelled safety flags above the steps.' };
const base = (overrides: Partial<VersionedCard> = {}): VersionedCard => ({
  version: 1,
  steps: ['Lay the stems out side by side.', 'Fill the jar about halfway.', 'Look at it together.'],
  materials: ['A jar', 'Flowers'],
  safety: ['Keep scissors with the helper.'],
  stopNote: 'It is fine to stop after one stem.',
  variations: [{ kind: 'easier', text: 'Offer two stems at a time.' }],
  changes: [BASE_ENTRY],
  ...overrides,
});

const oneCard = (before: VersionedCard, after: VersionedCard) =>
  checkCardVersions(new Map([['card', before]]), new Map([['card', after]]));

const LOG_ENTRY = { date: '2026-11-20', safety: false, note: 'Changed the second step to use one jar.' };

describe('card version rule (PLAT-007)', () => {
  it('passes when nothing changed', () => {
    const report = oneCard(base(), base());
    expect(report.problems).toEqual([]);
    expect(report.contentChanges).toBe(0);
  });

  it('passes a content change with a bump and a new changes entry', () => {
    const after = base({
      version: 2,
      steps: ['Lay the stems out side by side.', 'Fill the jar about halfway with water.', 'Look at it together.'],
      changes: [BASE_ENTRY, LOG_ENTRY],
    });
    const report = oneCard(base(), after);
    expect(report.problems).toEqual([]);
    expect(report.contentChanges).toBe(1);
    expect(report.bumps).toBe(1);
  });

  it('fails a steps change that keeps the version', () => {
    const after = base({ steps: ['Lay them out.', 'Fill the jar.', 'Look.'], changes: [BASE_ENTRY, LOG_ENTRY] });
    const problems = oneCard(base(), after).problems;
    expect(problems).toHaveLength(1);
    expect(problems[0].message).toContain('steps changed but version is 1, not above the base version 1');
  });

  it('fails a materials change with no new changes entry', () => {
    const after = base({ version: 2, materials: ['A jar', 'Flowers', 'Ribbon'] });
    const problems = oneCard(base(), after).problems;
    expect(problems.map((p) => p.message)).toEqual(['materials changed but the changes log has no new entry']);
  });

  it('fails a safety, stopNote or variations change that does not bump', () => {
    const cases: Partial<VersionedCard>[] = [
      { safety: ['Keep scissors and pruners with the helper at all times.'] },
      { stopNote: 'Stop as soon as anyone looks tired.' },
      { variations: [{ kind: 'seated', text: 'Sit at the table.' }] },
    ];
    for (const change of cases) {
      const after = base({ ...change, changes: [BASE_ENTRY, LOG_ENTRY] });
      const problems = oneCard(base(), after).problems;
      expect(problems.length, JSON.stringify(change)).toBe(1);
      expect(problems[0].message).toMatch(/not above the base version 1/);
    }
  });

  it('fails a version that rose with no content change', () => {
    const after = base({ version: 2 });
    const problems = oneCard(base(), after).problems;
    expect(problems.map((p) => p.message)).toEqual([
      'version changed from 1 to 2 with no change to steps, materials, safety, stopNote, variations',
    ]);
  });

  it('ignores a change to fields the rule does not list (pictures, plain steps, a new changes entry alone)', () => {
    const after = base({ changes: [BASE_ENTRY, LOG_ENTRY], plainSteps: ['Lay them out.'] });
    expect(oneCard(base(), after).problems).toEqual([]);
  });

  it('treats a base card with no version as version 1, so the first version line is not a bump', () => {
    const { version: _omitted, ...withoutVersion } = base();
    expect(oneCard(withoutVersion, base()).problems).toEqual([]);
  });

  it('requires a bump above 1 when a base card with no version changes its steps', () => {
    const { version: _omitted, ...withoutVersion } = base();
    const after = base({ steps: ['Lay them out.', 'Fill the jar.', 'Look.'], changes: [BASE_ENTRY, LOG_ENTRY] });
    expect(oneCard(withoutVersion, after).problems[0].message).toContain('not above the base version 1');
  });

  it('flags a current card with a missing, fractional or zero version', () => {
    for (const version of [undefined, 1.5, 0, '2']) {
      const problems = checkCardVersions(new Map(), new Map([['card', base({ version })]])).problems;
      expect(problems.map((p) => p.id), String(version)).toEqual(['card']);
    }
  });

  it('reports added and removed cards without comparing them', () => {
    const report = checkCardVersions(
      new Map([['gone', base()]]),
      new Map([['new', base({ steps: ['A.', 'B.', 'C.'] })]]),
    );
    expect(report.problems).toEqual([]);
    expect(report.added).toEqual(['new']);
    expect(report.removed).toEqual(['gone']);
  });

  it('compares content regardless of key order in the frontmatter', () => {
    const reordered = { variations: [{ text: 'Offer two stems at a time.', kind: 'easier' }] };
    expect(canonical(base().variations)).toBe(canonical(reordered.variations));
    expect(oneCard(base(), base({ ...reordered })).problems).toEqual([]);
  });
});
