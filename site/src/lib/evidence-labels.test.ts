import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { EVIDENCE_ROWS, EVIDENCE_STRENGTHS, evidenceFor } from './evidence-labels';

/**
 * TSA-031: every benefit sentence on an English page is in the evidence table, and worded
 * as the table allows. The English dictionary is the source of the sentences.
 */
const en = JSON.parse(readFileSync(new URL('../i18n/ui/en.json', import.meta.url), 'utf8')) as Record<string, unknown>;

function strings(value: unknown, path = ''): { path: string; text: string }[] {
  if (typeof value === 'string') return [{ path, text: value }];
  if (Array.isArray(value)) return value.flatMap((v, i) => strings(v, `${path}[${i}]`));
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => strings(v, `${path}/${k}`));
  return [];
}

const all = strings(en);
/** Answers in FAQs across the site: the place where a benefit sentence is most likely to appear. */
const faqAnswers = all.filter((s) => /\/faq(?:\[\d+\]|\/groups\[\d+\]\/items\[\d+\])\/a$/.test(s.path));
/** Wording that says something helps, lowers risk or has benefits. Research framing alone is not enough to escape the table. */
const BENEFIT = /\b(?:benefits?|may lower|may help|has shown small|helps? (?:to )?(?:prevent|reduce|improve|slow)|linked with (?:a )?lower|lower (?:risk|chance))\b/i;

describe('evidence table (TSA-031)', () => {
  it('has a dated row for each entry, with a strength from the scale', () => {
    expect(EVIDENCE_ROWS.length).toBeGreaterThan(0);
    for (const row of EVIDENCE_ROWS) {
      expect(row.id, row.id).toMatch(/^ev-[a-z-]+$/);
      expect(EVIDENCE_STRENGTHS, row.id).toContain(row.strength);
      expect(row.source.length, row.id).toBeGreaterThan(10);
      expect(row.date, row.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(['proposed', 'reviewed'], row.id).toContain(row.status);
    }
  });

  it('keeps row ids unique', () => {
    const ids = EVIDENCE_ROWS.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('points each row at real English copy', () => {
    for (const row of EVIDENCE_ROWS) {
      expect(all.some((s) => s.text.includes(row.fragment)), row.id).toBe(true);
    }
  });

  it('has a row for every FAQ answer that makes a benefit statement', () => {
    const unlabelled = faqAnswers.filter((s) => BENEFIT.test(s.text) && !evidenceFor(s.text)).map((s) => s.path);
    expect(unlabelled).toEqual([]);
  });

  it('finds the row for a labelled answer and nothing for a plain one', () => {
    const labelled = faqAnswers.find((s) => s.text.includes('Cognitive stimulation in a social setting'));
    expect(labelled && evidenceFor(labelled.text)?.id).toBe('ev-cognitive-stimulation-faq');
    expect(evidenceFor('Pictures stay visible and nothing is timed.')).toBeUndefined();
  });

  it('never rates a benefit as strong on this table without a reviewer', () => {
    for (const row of EVIDENCE_ROWS.filter((r) => r.strength === 'strong')) expect(row.status, row.id).toBe('reviewed');
  });
});
