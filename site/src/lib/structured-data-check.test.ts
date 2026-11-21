import { describe, expect, it } from 'vitest';
import {
  checkFaqPage,
  checkHowTo,
  checkItemList,
  checkStructuredData,
  decodeEntities,
  emptyFieldProblems,
  missingRequiredFields,
  visibleContent,
} from './structured-data-check';

const PAGE = 'https://creativeactivities.org/activity/make-a-collage/';

const page = (body: string, jsonLd: unknown[] = []): string => {
  const script = jsonLd.length
    ? `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': jsonLd }).replace(/</g, '\\u003c')}</script>`
    : '';
  return `<!doctype html><html><head><title>x</title>${script}</head><body>${body}</body></html>`;
};

describe('decodeEntities', () => {
  it('decodes named and numeric entities once', () => {
    expect(decodeEntities('Tom &amp; Jerry &#39;s &#x2019; &rsquo;')).toBe('Tom & Jerry \'s \u2019 \u2019');
    expect(decodeEntities('&amp;lt;')).toBe('&lt;');
  });

  it('leaves unknown names alone and ignores prototype keys', () => {
    expect(decodeEntities('&unknownthing; &constructor;')).toBe('&unknownthing; &constructor;');
  });
});

describe('visibleContent', () => {
  it('drops scripts, styles, hidden elements and comments', () => {
    const html = page(
      '<style>p{}</style><!-- secret --><p>Shown</p><div hidden><p>Hidden copy</p></div><script>var x = 1;</script><p>Also shown</p>',
    );
    const { text } = visibleContent(html, PAGE);
    expect(text).toContain('Shown');
    expect(text).toContain('Also shown');
    expect(text).not.toContain('Hidden copy');
    expect(text).not.toContain('secret');
    expect(text).not.toContain('var x');
  });

  it('joins inline tags without a space and separates block tags', () => {
    const { text } = visibleContent(page('<p>Make a <strong>collage</strong>.</p><p>Next step</p>'), PAGE);
    expect(text).toContain('Make a collage.');
    expect(text).toContain('collage. Next step');
  });

  it('collects visible links resolved against the page, skipping hidden ones', () => {
    const html = page('<a href="/activity/a/">A</a><a href="https://creativeactivities.org/activity/b/">B</a><div hidden><a href="/activity/c/">C</a></div>');
    expect(visibleContent(html, PAGE).links).toEqual([
      'https://creativeactivities.org/activity/a/',
      'https://creativeactivities.org/activity/b/',
    ]);
  });
});

describe('checkHowTo', () => {
  const howTo = (steps: string[]) => ({ '@type': 'HowTo', name: 'x', step: steps.map((text) => ({ '@type': 'HowToStep', text })) });

  it('passes when steps appear in visible order', () => {
    const visible = 'Gather paper. Fold it in half. Glue the edges.';
    expect(checkHowTo(howTo(['Gather paper.', 'Fold it in half.', 'Glue the edges.']), visible)).toEqual([]);
  });

  it('reports a step missing from the visible text', () => {
    const problems = checkHowTo(howTo(['Gather paper.', 'Paint it gold.']), 'Gather paper.');
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('step 2 is not in the visible page text');
  });

  it('reports steps that appear out of order', () => {
    const problems = checkHowTo(howTo(['Fold it in half.', 'Gather paper.']), 'Gather paper. Fold it in half.');
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('step 2 appears in the page out of order');
  });
});

describe('checkFaqPage', () => {
  const faq = (q: string, a: string) => ({
    '@type': 'FAQPage',
    mainEntity: [{ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }],
  });

  it('passes when question and answer are visible', () => {
    expect(checkFaqPage(faq('Is it free?', 'Yes, it is free.'), 'Is it free? Yes, it is free.')).toEqual([]);
  });

  it('reports an answer that exists only in hidden markup', () => {
    const problems = checkFaqPage(faq('Is it free?', 'Yes, it is free.'), 'Is it free?');
    expect(problems).toEqual(['FAQ answer 1 is not in the visible page text: "Yes, it is free."']);
  });
});

describe('checkItemList', () => {
  const list = (urls: string[]) => ({
    '@type': 'ItemList',
    name: 'Hub',
    itemListElement: urls.map((url, i) => ({ '@type': 'ListItem', position: i + 1, name: `n${i}`, url })),
  });
  const links = ['https://creativeactivities.org/activity/a/', 'https://creativeactivities.org/activity/b/'];

  it('passes when the links appear in list order', () => {
    expect(checkItemList(list(['/activity/a/', '/activity/b/'].map((p) => `https://creativeactivities.org${p}`)), links, PAGE)).toEqual([]);
  });

  it('reports links that appear out of order', () => {
    const problems = checkItemList(list(['https://creativeactivities.org/activity/b/', 'https://creativeactivities.org/activity/a/']), links, PAGE);
    expect(problems.some((p) => p.includes('item 2 is linked out of order'))).toBe(true);
  });

  it('reports an item that is not a visible link', () => {
    const problems = checkItemList(list(['https://creativeactivities.org/activity/z/']), links, PAGE);
    expect(problems).toEqual(['ItemList item 1 is not a visible link on the page: https://creativeactivities.org/activity/z/']);
  });
});

describe('emptyFieldProblems and required fields', () => {
  it('flags empty strings, empty arrays, nulls and placeholder words', () => {
    const problems = emptyFieldProblems({ name: '', genre: [], author: null, description: 'TODO' });
    expect(problems).toEqual(expect.arrayContaining([
      '$.name is an empty string',
      '$.genre is an empty array',
      '$.author is null',
      '$.description is a placeholder value: "TODO"',
    ]));
  });

  it('passes a complete node', () => {
    expect(emptyFieldProblems({ name: 'Collage', url: PAGE, tags: ['craft'] })).toEqual([]);
  });

  it('reports missing required fields by type', () => {
    expect(missingRequiredFields({ '@type': 'HowToStep', position: 1 })).toEqual(['HowToStep is missing required field "text"']);
    expect(missingRequiredFields({ '@type': 'ListItem', position: 1, name: 'x' })).toEqual(['ListItem is missing required field "item or url"']);
  });

  it('does not require a url on a nested parent organization', () => {
    expect(missingRequiredFields({ '@type': 'Organization', name: 'Parent Ltd.' })).toEqual([]);
  });

  it('does not require fields on a bare reference', () => {
    expect(missingRequiredFields({ '@id': 'https://creativeactivities.org/#organization' })).toEqual([]);
  });
});

describe('checkStructuredData', () => {
  const howTo = {
    '@type': 'HowTo',
    name: 'Make a collage',
    step: [
      { '@type': 'HowToStep', position: 1, text: 'Pick photos.' },
      { '@type': 'HowToStep', position: 2, text: 'Glue them down.' },
    ],
  };
  const crumbs = {
    '@type': 'BreadcrumbList',
    itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://creativeactivities.org/' }],
  };

  it('returns undefined for a page without JSON-LD', () => {
    expect(checkStructuredData(page('<p>Plain</p>'), PAGE)).toBeUndefined();
  });

  it('passes a page whose markup matches its visible content', () => {
    const html = page('<ol><li>Pick photos.</li><li>Glue them down.</li></ol>', [howTo, crumbs]);
    expect(checkStructuredData(html, PAGE)).toEqual({ types: ['HowTo', 'BreadcrumbList'], problems: [] });
  });

  it('fails a page whose visible steps differ from the markup', () => {
    const html = page('<ol><li>Pick photos.</li><li>Paint it.</li></ol>', [howTo]);
    const report = checkStructuredData(html, PAGE);
    expect(report?.problems).toEqual(['HowTo step 2 is not in the visible page text: "Glue them down."']);
  });

  it('requires a url on the top-level site publisher', () => {
    const report = checkStructuredData(page('<p>Home</p>', [{ '@type': 'Organization', name: 'Creative Activities' }]), PAGE);
    expect(report?.problems).toEqual(['Organization at the top level is missing required field "url"']);
  });

  it('reports JSON-LD that does not parse', () => {
    const html = '<html><body></body><script type="application/ld+json">{ nope</script></html>';
    const report = checkStructuredData(html, PAGE);
    expect(report?.problems[0]).toContain('does not parse');
  });
});
