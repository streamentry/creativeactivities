import { describe, expect, it } from 'vitest';
import {
  LONG_STEP_WORDS,
  bodySentences,
  cardPrompts,
  joinsTwoActions,
  longSentences,
  readSteps,
  readingGrade,
  sentenceCount,
  splitMarkdown,
  stepPrompts,
  summarize,
  syllables,
  wordsOf,
} from '../../scripts/plain-language-lib.mjs';
import { readCards, readHubs } from '../../scripts/plain-language.mjs';

/** n made-up words, the first with a capital as a sentence starts. */
const words = (n: number) =>
  Array.from({ length: n }, (_, i) => `${i === 0 ? 'Word' : 'word'}${String.fromCharCode(97 + (i % 26))}`).join(' ');

describe('counting words, sentences and syllables (TSA-008)', () => {
  it('finds words, keeping an apostrophe or a hyphen inside a word', () => {
    expect(wordsOf("Don't tear the paper's well-known edge.")).toEqual(["Don't", 'tear', 'the', "paper's", 'well-known', 'edge']);
    expect(wordsOf('Cut 3 strips, 2 cm wide.')).toEqual(['Cut', 'strips', 'cm', 'wide']);
    expect(wordsOf('')).toEqual([]);
  });

  it('counts sentences by their ends, and never fewer than one', () => {
    expect(sentenceCount('One. Two! Three?')).toBe(3);
    expect(sentenceCount('Hold the strip 1.5 cm from the edge.')).toBe(1);
    expect(sentenceCount('No full stop here')).toBe(1);
    expect(sentenceCount('')).toBe(1);
  });

  it('counts the syllables of everyday words closely enough for a prompt', () => {
    // A rough count, as a prompt needs: it can be a syllable out on a word with three vowels in a row, such as "beautiful".
    const expected: Record<string, number> = { a: 1, the: 1, make: 1, tape: 1, hold: 1, glue: 1, paper: 2, table: 2, ribbon: 2, garland: 2, scissors: 2 };
    for (const [word, count] of Object.entries(expected)) expect(syllables(word), word).toBe(count);
    expect(syllables('')).toBe(0);
  });

  it('works out the Flesch-Kincaid grade', () => {
    // 6 words, 1 sentence, 6 syllables: 0.39 * 6 + 11.8 * 1 - 15.59
    expect(readingGrade('The cat sat on the mat.')).toBeCloseTo(-1.45, 1);
    expect(readingGrade('')).toBe(0);
    const plain = readingGrade('Fold the paper. Press the fold.');
    const dense = readingGrade('Subsequently demonstrate considerable determination while simultaneously rearranging complicated arrangements.');
    expect(dense).toBeGreaterThan(plain + 10);
  });
});

describe('the one rule: no step joins two actions with "and then" (TSA-008)', () => {
  it('flags "and then" and nothing close to it', () => {
    expect(joinsTwoActions('Fold the paper and then tape it down.')).toBe(true);
    expect(joinsTwoActions('Fold the paper AND THEN tape it down.')).toBe(true);
    expect(joinsTwoActions('Fold the paper, then tape it down.')).toBe(false);
    expect(joinsTwoActions('Fold and tape the paper.')).toBe(false);
    expect(joinsTwoActions('Fold the paper. Then tape it down.')).toBe(false);
  });

  it('lets "now and then" through, since it means "sometimes"', () => {
    expect(joinsTwoActions('Hold the chain up together now and then to see how long it has grown.')).toBe(false);
    expect(joinsTwoActions('Hold it up now and then, and then put it down.')).toBe(true);
  });

  it('gives a rule prompt only for "and then", and advisory prompts for length and sentences', () => {
    expect(stepPrompts('Fold the paper in half.')).toEqual([]);
    const rule = stepPrompts('Fold the paper and then tape it.');
    expect(rule.map((p: { id: string }) => p.id)).toEqual(['and-then']);
    expect(rule[0]?.rule).toBe(true);
    const long = stepPrompts(words(LONG_STEP_WORDS));
    expect(long.map((p: { id: string }) => p.id)).toEqual(['long-step']);
    expect(long[0]?.rule).toBe(false);
    expect(stepPrompts(`${words(LONG_STEP_WORDS - 1)}`)).toEqual([]);
    const several = stepPrompts('Fold the paper. Press the fold.');
    expect(several.map((p: { id: string }) => p.id)).toEqual(['several-sentences']);
    expect(several[0]?.rule).toBe(false);
  });

  it('names the card and the step for each prompt', () => {
    const prompts = cardPrompts('wrap-a-gift', ['Choose the paper.', 'Fold and then tape the paper.']);
    expect(prompts).toHaveLength(1);
    expect(prompts[0]).toMatchObject({ card: 'wrap-a-gift', step: 2, stepText: 'Fold and then tape the paper.', id: 'and-then', rule: true });
  });
});

describe('reading a card and a hub (TSA-008)', () => {
  const card = ['name: A card', 'type: craft', 'steps:', '  - "Cut the paper."', '  - "Say \\"hello\\" and wave."', "  - 'Tie it up.'", 'variations:', '  - kind: easier'].join('\n');

  it('reads the steps of a card, unquoted, and stops at the next key', () => {
    expect(readSteps(card)).toEqual(['Cut the paper.', 'Say "hello" and wave.', 'Tie it up.']);
    expect(readSteps('name: A card\ntype: craft')).toEqual([]);
  });

  it('splits front matter from the body', () => {
    expect(splitMarkdown('---\nname: X\n---\nBody text.')).toEqual({ frontMatter: 'name: X', body: 'Body text.' });
    expect(splitMarkdown('Just text.')).toEqual({ frontMatter: '', body: 'Just text.' });
  });

  it('reads the sentences of a body without links, markup, list markers or tables', () => {
    const body = ['# A heading', '', 'See [the finder](/activity/) for more. It helps.', '', '- A list item that ends here.', '', '| a | b |', '| --- | --- |', '| one | two |', '', 'Last sentence.'].join('\n');
    expect(bodySentences(body)).toEqual(['A heading See the finder for more.', 'It helps.', 'A list item that ends here.', 'Last sentence.']);
  });

  it('finds the sentences that run to the limit', () => {
    const body = `Short one. ${words(31)}. Another short one.`;
    expect(longSentences(body)).toHaveLength(1);
    expect(longSentences(body, 2)).toHaveLength(3);
    expect(longSentences(body, 100)).toHaveLength(0);
  });

  it('totals the prompts over a set of cards', () => {
    const s = summarize([
      { id: 'a', steps: ['Cut the paper.', `${words(26)}.`] },
      { id: 'b', steps: ['Fold and then tape it.', 'Press. Hold.'] },
    ]);
    expect(s.cards).toBe(2);
    expect(s.steps).toBe(4);
    expect(s.longest).toBe(26);
    expect(s.rule).toHaveLength(1);
    expect(s.long).toHaveLength(1);
    expect(s.several).toHaveLength(1);
  });
});

describe('the cards and hubs on the site (TSA-008)', () => {
  const cards = readCards();

  it('reads the steps of every card', () => {
    expect(cards.length).toBeGreaterThanOrEqual(53);
    for (const card of cards) expect(card.steps.length, card.id).toBeGreaterThanOrEqual(3);
    expect(summarize(cards).steps).toBeGreaterThan(400);
  });

  it('has no step that joins two actions with "and then"', () => {
    const broken = summarize(cards).rule.map((p: { card: string; step: number; stepText: string }) => `${p.card} step ${p.step}: ${p.stepText}`);
    expect(broken).toEqual([]);
  });

  it('keeps every step short enough to read at a glance', () => {
    // An editor's prompt starts at 25 words. This only stops a step from running away between reviews.
    expect(summarize(cards).longest).toBeLessThanOrEqual(60);
  });

  it('reads the hubs, nested folders included', () => {
    const hubs = readHubs();
    expect(hubs.length).toBeGreaterThanOrEqual(14);
    expect(hubs.some((h: { id: string }) => h.id.includes('/'))).toBe(true);
  });
});
