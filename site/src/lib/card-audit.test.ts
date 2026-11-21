import { describe, expect, it } from 'vitest';
import { auditCards, type AuditCard } from './card-audit';

const card = (id: string, data: Partial<AuditCard['data']>): AuditCard => ({ id, data });

describe('auditCards (CNT-901, CNT-902)', () => {
  const complete = card('complete', {
    name: 'Complete',
    settings: ['tabletop', 'seated', 'bedside'],
    variations: [
      { kind: 'bedside', text: 'x' },
      { kind: 'seated', text: 'x' },
      { kind: 'large-grip', text: 'x' },
    ],
  });

  it('passes a card with every setting and variation', () => {
    const report = auditCards([complete]);
    expect(report.live).toBe(1);
    expect(report.failures.noSeatedSetting).toEqual([]);
    expect(report.failures.noBedsideOrVariation).toEqual([]);
    expect(report.failures.noLargeGrip).toEqual([]);
    expect(report.failures.noSeatedVariation).toEqual([]);
  });

  it('flags a card without the seated setting', () => {
    const report = auditCards([card('a', { name: 'A', settings: ['tabletop'], variations: complete.data.variations })]);
    expect(report.failures.noSeatedSetting).toEqual(['a']);
  });

  it('flags bedside only when neither the setting nor a bedside variation exists', () => {
    const noBedsideAtAll = card('b', {
      name: 'B',
      settings: ['tabletop', 'seated'],
      variations: [{ kind: 'easier', text: 'x' }, { kind: 'large-grip', text: 'x' }],
    });
    const bedsideVariationOnly = card('c', {
      name: 'C',
      settings: ['tabletop', 'seated'],
      variations: [{ kind: 'bedside', text: 'x' }, { kind: 'large-grip', text: 'x' }],
    });
    const bedsideSettingOnly = card('d', {
      name: 'D',
      settings: ['tabletop', 'bedside', 'seated'],
      variations: [{ kind: 'easier', text: 'x' }, { kind: 'large-grip', text: 'x' }],
    });
    const report = auditCards([noBedsideAtAll, bedsideVariationOnly, bedsideSettingOnly]);
    expect(report.failures.noBedsideOrVariation).toEqual(['b']);
  });

  it('flags missing large-grip and missing seated variations separately', () => {
    const report = auditCards([
      card('e', { name: 'E', settings: ['seated'], variations: [{ kind: 'easier', text: 'x' }, { kind: 'bedside', text: 'x' }] }),
    ]);
    expect(report.failures.noLargeGrip).toEqual(['e']);
    expect(report.failures.noSeatedVariation).toEqual(['e']);
  });

  it('leaves withdrawn cards out of the live count and every list', () => {
    const withdrawn = card('gone', { name: 'Gone', settings: ['tabletop'], variations: [], withdrawn: { date: '2026-01-01' } });
    const report = auditCards([complete, withdrawn]);
    expect(report.total).toBe(2);
    expect(report.live).toBe(1);
    expect(report.failures.noSeatedSetting).toEqual([]);
  });

  it('sorts ids so the report is stable', () => {
    const report = auditCards([
      card('zeta', { name: 'Z', settings: ['tabletop'], variations: [] }),
      card('alpha', { name: 'A', settings: ['tabletop'], variations: [] }),
    ]);
    expect(report.failures.noSeatedSetting).toEqual(['alpha', 'zeta']);
  });
});
