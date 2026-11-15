import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { GLOSSARY } from './glossary';

/** CNT-012: every glossary term comes from the cards, with one plain sentence and a translator note. */
const dir = new URL('../content/activity-cards/', import.meta.url);
const cards = readdirSync(dir)
  .filter((f) => f.endsWith('.md'))
  .map((f) => readFileSync(new URL(f, dir), 'utf8').toLowerCase())
  .join('\n');

/** The word as the cards may write it: "Felt-tip pen" also matches "felt-tip"; "Chunky crayon" matches "chunky". */
const stem = (term: string) => term.toLowerCase().split(' ')[0].replace(/s$/, '');

describe('glossary (CNT-012)', () => {
  it('has terms in alphabetical order, each once', () => {
    const terms = GLOSSARY.map((t) => t.term);
    expect(new Set(terms).size).toBe(terms.length);
    expect([...terms].sort((a, b) => a.localeCompare(b))).toEqual(terms);
  });

  for (const t of GLOSSARY) {
    it(`${t.term}: appears in a card and has a one-sentence meaning and a translator note`, () => {
      expect(cards.includes(t.term.toLowerCase()) || cards.includes(stem(t.term)), `${t.term} is in no card`).toBe(true);
      expect(t.meaning.length).toBeLessThanOrEqual(160);
      expect(t.meaning.trim().endsWith('.')).toBe(true);
      expect(t.meaning.slice(0, -1)).not.toMatch(/[.!?]\s/);
      expect(t.translatorNote.length).toBeGreaterThan(5);
    });
  }

  it('uses no clinical or benefit words', () => {
    const text = GLOSSARY.map((t) => `${t.term} ${t.meaning}`).join(' ').toLowerCase();
    expect(text).not.toMatch(/therap|cognitive|brain|patient|dementia|cure|treat/);
  });
});
