import { describe, expect, it } from 'vitest';
import { parseYamlSubset, splitFrontmatter } from './yaml-subset';

describe('parseYamlSubset', () => {
  it('reads plain, quoted and numeric scalars', () => {
    expect(parseYamlSubset('a: plain text\nb: "say \\"hi\\"\\n"\nc: \'it\'\'s\'\nd: 3\ne: true\nf: 2026-10-25')).toEqual({
      a: 'plain text',
      b: 'say "hi"\n',
      c: "it's",
      d: 3,
      e: true,
      f: '2026-10-25',
    });
  });

  it('folds and keeps block scalars the way YAML does', () => {
    const doc = 'folded: >-\n  one two\n  three\n\n  four\nliteral: |\n  line one\n  line two\nafter: x';
    expect(parseYamlSubset(doc)).toEqual({
      folded: 'one two three\nfour',
      literal: 'line one\nline two\n',
      after: 'x',
    });
  });

  it('reads sequences of scalars and of mappings, and flow arrays', () => {
    const doc = [
      'items:',
      '  - "first"',
      '  - second',
      'faq:',
      '  - q: "Why?"',
      '    a: "Because."',
      '  - q: Next',
      '    a: Answer',
      'flow: [a, "b c"]',
      'empty: []',
      'same:',
      '- x',
    ].join('\n');
    expect(parseYamlSubset(doc)).toEqual({
      items: ['first', 'second'],
      faq: [
        { q: 'Why?', a: 'Because.' },
        { q: 'Next', a: 'Answer' },
      ],
      flow: ['a', 'b c'],
      empty: [],
      same: ['x'],
    });
  });

  it('reads nested mappings inside sequence items', () => {
    const doc = ['variations:', '  - kind: easier', '    text: "Use bigger pieces."', '    extra:', '      deep: 1'].join('\n');
    expect(parseYamlSubset(doc)).toEqual({
      variations: [{ kind: 'easier', text: 'Use bigger pieces.', extra: { deep: 1 } }],
    });
  });

  it('ignores comments and blank lines', () => {
    expect(parseYamlSubset('# note\n\na: 1 # trailing\n')).toEqual({ a: 1 });
  });

  it('splits frontmatter from the body', () => {
    const doc = splitFrontmatter('---\ntitle: "T"\n---\n\n## Heading\n\nBody.\n');
    expect(doc.frontmatter).toEqual({ title: 'T' });
    expect(doc.body).toBe('\n## Heading\n\nBody.\n');
  });

  it('throws on a malformed line rather than guessing', () => {
    expect(() => parseYamlSubset('a: 1\njust a bare line with no colon')).toThrow(/cannot parse/);
    expect(() => parseYamlSubset('just a bare line')).toThrow(/mapping/);
  });
});
