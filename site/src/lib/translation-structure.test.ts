import { describe, expect, it } from 'vitest';
import {
  activityStructure,
  compareActivityCards,
  compareDocuments,
  markdownStructure,
  type CompareOptions,
  normalizeDigits,
  type ActivityCardLike,
} from './translation-structure';
import { splitFrontmatter, type FrontmatterSplit } from './yaml-subset';

const englishGuide = [
  '---',
  'title: "Sleep"',
  'section: brain-health',
  'order: 7',
  'health: true',
  'crisisRoute: false',
  'summary: "Sleep is 7 to 9 hours for most adults."',
  'keyPoints:',
  '  - "Point one with 25 years."',
  '  - "Point two."',
  '  - "Point three."',
  'faq:',
  '  - q: "Why?"',
  '    a: "Because."',
  '  - q: "How?"',
  '    a: "Slowly."',
  'sources:',
  '  - title: "A"',
  '    publisher: "P"',
  '    url: "https://example.org/a"',
  'relatedGames: [calm-breathing]',
  'related: [caregiving/late-day-restlessness]',
  '---',
  '',
  '## First heading',
  '',
  'Intro with a [link](https://example.org/a) and an image ![alt](/x.png).',
  '',
  '- one',
  '- two',
  '',
  '1. step',
  '2. step',
  '',
  '### Sub heading',
  '',
  '- alone',
  '',
  '```md',
  '## not a heading',
  '- not a list item',
  '```',
  '',
].join('\n');

/** The English fixture with some text replaced; a translation carries `translatedFrom`, as the schema requires. */
function variant(replace: [string, string][] = [], withTranslatedFrom = true): FrontmatterSplit {
  let text = englishGuide;
  for (const [from, to] of replace) {
    if (!text.includes(from)) throw new Error(`fixture does not contain: ${from}`);
    text = text.replace(from, to);
  }
  if (withTranslatedFrom) text = text.replace('relatedGames:', 'translatedFrom: 2026-10-25\nrelatedGames:');
  return splitFrontmatter(text);
}

describe('markdownStructure', () => {
  it('counts headings by level in order, skipping fenced code', () => {
    const s = markdownStructure(splitFrontmatter(englishGuide).body);
    expect(s.headings).toEqual([2, 3]);
  });

  it('counts list items per list block and records ordered lists', () => {
    const s = markdownStructure(splitFrontmatter(englishGuide).body);
    expect(s.lists).toEqual([
      { ordered: false, items: 2 },
      { ordered: true, items: 2 },
      { ordered: false, items: 1 },
    ]);
  });

  it('counts links but not images', () => {
    expect(markdownStructure(splitFrontmatter(englishGuide).body).links).toBe(1);
  });

  it('keeps nested items inside their parent item', () => {
    const s = markdownStructure('- parent\n  - child\n  - child\n- parent\n');
    expect(s.lists).toEqual([{ ordered: false, items: 2 }]);
  });

  it('treats a blank line between items as one list (loose list)', () => {
    const s = markdownStructure('- a\n\n- b\n\n- c\n');
    expect(s.lists).toEqual([{ ordered: false, items: 3 }]);
  });
});

describe('normalizeDigits', () => {
  it('reads ASCII and other script digits as the same numbers', () => {
    expect(normalizeDigits('٧ و ٩ ساعات 8,000 ８')).toEqual(['7', '8', '8000', '9']);
  });

  it('reads thousands separators as one number, so 8,000 and 8.000 and 8 000 and 8000 are the same', () => {
    expect(normalizeDigits('8,000')).toEqual(['8000']);
    expect(normalizeDigits('8.000')).toEqual(['8000']);
    expect(normalizeDigits('8 000')).toEqual(['8000']);
    expect(normalizeDigits('8000')).toEqual(['8000']);
    expect(normalizeDigits('1.5 and 2021')).toEqual(['1', '2021', '5']);
  });

  it('ignores URLs, phone numbers and emergency numbers, which are not structure', () => {
    expect(normalizeDigits('Call 911 or 1-800-272-3900. See https://example.org/x/1134031/dl and [a](https://doi.org/10.1016/S0140-6736(24)01296-0) now')).toEqual([]);
    expect(normalizeDigits('Helpline 800-677-1116 today')).toEqual([]);
    expect(normalizeDigits('25 years')).toEqual(['25']);
  });

  it('removes only the link target when a link is followed directly by text, as in Japanese or Chinese', () => {
    expect(normalizeDigits('[988 Lifeline](https://988lifeline.org/)に連絡できます。一日24時間。Samaritansに116 123で電話')).toEqual(['116123', '24']);
    expect(normalizeDigits('[a](https://doi.org/10.1016/S0140-6736(24)01296-0)です。1972年')).toEqual(['1972']);
  });
});

describe('compareDocuments (guides)', () => {
  const en = splitFrontmatter(englishGuide);
  const fields = (replace: [string, string][], opts: CompareOptions = { translation: true }) =>
    compareDocuments(en, variant(replace), opts).map((m) => m.field);

  it('finds no mismatch for a faithful translation', () => {
    expect(compareDocuments(en, variant([]), { translation: true })).toEqual([]);
  });

  it('reports a heading that is changed to plain text', () => {
    expect(fields([['### Sub heading', 'Plain paragraph']])).toContain('headings');
  });

  it('reports a list with a changed item count', () => {
    expect(fields([['- one\n- two\n', '- one\n']])).toContain('lists');
  });

  it('reports a number that is not in the English', () => {
    const mismatches = compareDocuments(en, variant([['Intro with a', 'Intro in 30 days with a']]), { translation: true });
    expect(mismatches.find((m) => m.field === 'digits')?.detail).toContain('30');
  });

  it('accepts digits that are written in another script or with another separator', () => {
    expect(fields([['Sleep is 7 to 9 hours', 'Sleep is ７ to ９ hours'], ['with 25 years', 'with ２５ years']])).toEqual([]);
  });

  it('reports a changed link count and a changed source URL', () => {
    expect(fields([['[link](https://example.org/a)', 'plain']])).toContain('links');
    expect(fields([['"https://example.org/a"', '"https://example.org/b"']])).toContain('sources');
  });

  it('reports a missing frontmatter key, and allows translatedFrom only on translations', () => {
    expect(fields([['health: true\n', '']])).toContain('frontmatter.keys');
    expect(fields([], { translation: false })).toContain('frontmatter.keys');
  });

  it('reports a changed section, order or related list', () => {
    expect(fields([['order: 7', 'order: 8']])).toContain('order');
    expect(fields([['relatedGames: [calm-breathing]', 'relatedGames: [picture-pairs]']])).toContain('relatedGames');
  });

  it('reports a dropped key point', () => {
    expect(fields([['  - "Point three."\n', '']])).toContain('keyPoints');
  });
});

const card: ActivityCardLike = {
  steps: ['Step one', 'Step two', 'Step three'],
  variations: [
    { kind: 'easier', text: 'Easier.' },
    { kind: 'seated', text: 'Seated.' },
  ],
  safetyFlags: ['scissors', 'small-parts'],
  supervision: 'nearby',
  safety: ['Keep scissors away.'],
};

describe('compareActivityCards', () => {
  it('passes an identical structure with translated words', () => {
    const tr: ActivityCardLike = {
      ...card,
      steps: ['Schritt eins', 'Schritt zwei', 'Schritt drei'],
      variations: [
        { kind: 'easier', text: 'Leichter.' },
        { kind: 'seated', text: 'Sitzend.' },
      ],
    };
    expect(compareActivityCards(card, tr)).toEqual([]);
  });

  it('fails when a variation is missing', () => {
    const tr: ActivityCardLike = { ...card, variations: [{ kind: 'easier', text: 'Leichter.' }] };
    const mismatches = compareActivityCards(card, tr);
    expect(mismatches.find((m) => m.field === 'variations')?.detail).toContain('seated');
  });

  it('fails when variations change order', () => {
    const tr: ActivityCardLike = { ...card, variations: [card.variations[1], card.variations[0]] };
    expect(compareActivityCards(card, tr).map((m) => m.field)).toContain('variations');
  });

  it('fails when the number or order of steps changes, and when a safety flag or supervision differs', () => {
    expect(compareActivityCards(card, { ...card, steps: card.steps.slice(1) }).map((m) => m.field)).toContain('steps');
    expect(compareActivityCards(card, { ...card, safetyFlags: ['small-parts', 'scissors'] }).map((m) => m.field)).toContain('safetyFlags');
    expect(compareActivityCards(card, { ...card, supervision: 'hands-on' }).map((m) => m.field)).toContain('supervision');
  });

  it('reads the structure from parsed frontmatter', () => {
    const data = {
      steps: ['a', 'b', 'c'],
      variations: [{ kind: 'easier', text: 'x' }],
      safetyFlags: ['none'],
      supervision: 'nearby',
      safety: ['x'],
    };
    expect(activityStructure(data).variationKinds).toEqual(['easier']);
    expect(activityStructure(data).steps).toBe(3);
  });
});
