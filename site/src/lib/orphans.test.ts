import { describe, expect, it } from 'vitest';
import {
  findOrphans,
  findUnderLinked,
  isEnglishPage,
  isIndexable,
  MIN_INBOUND_LINKS,
  normalizeTarget,
  pageLinks,
  repeatedGenericAnchors,
} from './orphans';

describe('normalizeTarget (SEO-014)', () => {
  it('resolves root, relative and absolute links to a page path with a trailing slash', () => {
    expect(normalizeTarget('/activity/foo', '/')).toBe('/activity/foo/');
    expect(normalizeTarget('../bar/', '/activity/foo/')).toBe('/activity/bar/');
    expect(normalizeTarget('baz/', '/activity/foo/')).toBe('/activity/foo/baz/');
    expect(normalizeTarget('https://creativeactivities.org/hubs/?x=1#top', '/')).toBe('/hubs/');
  });

  it('keeps file links as they are', () => {
    expect(normalizeTarget('/print/card.pdf', '/')).toBe('/print/card.pdf');
  });

  it('ignores hash-only, mail, phone and other-site links', () => {
    expect(normalizeTarget('#main', '/a/')).toBeNull();
    expect(normalizeTarget('mailto:someone@example.org', '/')).toBeNull();
    expect(normalizeTarget('tel:+10000000', '/')).toBeNull();
    expect(normalizeTarget('https://example.com/x', '/')).toBeNull();
  });
});

describe('pageLinks (SEO-014)', () => {
  it('reads every link target and its anchor text, with either quote style and nested tags', () => {
    const html = '<a href="/hubs/">Situations</a> <a href=\'/x/\'><span>Read</span> more</a> <a href="https://other.org/">Other</a>';
    const { links, anchors } = pageLinks(html, '/');
    expect(links).toEqual(['/hubs/', '/x/']);
    expect(anchors).toEqual(['Situations', 'Read more', 'Other']);
  });
});

describe('page flags (SEO-014)', () => {
  it('reads the English language and the robots meta', () => {
    expect(isEnglishPage('<html lang="en-GB">')).toBe(true);
    expect(isEnglishPage('<html lang="de">')).toBe(false);
    expect(isIndexable('<meta name="robots" content="noindex, follow">')).toBe(false);
    expect(isIndexable('<meta name="robots" content="index, follow">')).toBe(true);
    expect(isIndexable('<title>No robots meta</title>')).toBe(true);
  });
});

describe('findOrphans (SEO-014)', () => {
  const pages = [
    { path: '/', english: true, indexable: true },
    { path: '/a/', english: true, indexable: true },
    { path: '/b/', english: true, indexable: true },
    { path: '/c/', english: true, indexable: true },
    { path: '/hidden/', english: true, indexable: false },
    { path: '/de/x/', english: false, indexable: true },
  ];

  it('reports indexable English pages that no other page links to', () => {
    const outgoing = new Map<string, string[]>([
      ['/', ['/a/']],
      ['/a/', ['/', '/b/']],
      ['/b/', ['/a/']],
      ['/c/', ['/c/']],
      ['/hidden/', []],
      ['/de/x/', ['/a/']],
    ]);
    expect(findOrphans(pages, outgoing)).toEqual(['/c/']);
  });

  it('counts a link from a page that is itself noindex or another language', () => {
    const outgoing = new Map<string, string[]>([
      ['/', ['/a/']],
      ['/a/', ['/', '/b/']],
      ['/b/', ['/a/']],
      ['/c/', []],
      ['/hidden/', ['/c/']],
      ['/de/x/', []],
    ]);
    expect(findOrphans(pages, outgoing)).toEqual([]);
  });
});

describe('repeatedGenericAnchors (SEO-014)', () => {
  it('reports generic anchor texts that appear more than once on a page', () => {
    expect(repeatedGenericAnchors(['Read more', 'Read more', 'Hubs', 'click here'])).toEqual([{ text: 'read more', count: 2 }]);
  });

  it('ignores punctuation and case, and ignores once-only or specific texts', () => {
    expect(repeatedGenericAnchors(['Read more →', 'read more'])).toEqual([{ text: 'read more', count: 2 }]);
    expect(repeatedGenericAnchors(['Read more about dementia', 'Read more about dementia'])).toEqual([]);
    expect(repeatedGenericAnchors(['Learn more'])).toEqual([]);
  });
});

describe('findUnderLinked (SEO-014 two inbound links)', () => {
  const pages = [
    { path: '/', english: true, indexable: true },
    { path: '/hubs/', english: true, indexable: true },
    { path: '/a/', english: true, indexable: true },
    { path: '/b/', english: true, indexable: true },
    { path: '/c/', english: true, indexable: true },
    { path: '/hidden/', english: true, indexable: false },
    { path: '/de/x/', english: false, indexable: true },
  ];

  it('requires two inbound internal links', () => {
    expect(MIN_INBOUND_LINKS).toBe(2);
  });

  it('reports indexable English pages with fewer than two distinct linking pages, with the count', () => {
    const outgoing = new Map<string, string[]>([
      ['/', ['/hubs/', '/a/', '/b/']],
      ['/hubs/', ['/a/', '/b/', '/c/']],
      ['/a/', ['/hubs/', '/b/']],
      ['/b/', ['/hubs/', '/a/']],
      ['/c/', ['/c/', '/hubs/']],
      ['/hidden/', []],
      ['/de/x/', []],
    ]);
    expect(findUnderLinked(pages, outgoing)).toEqual([
      { path: '/', inbound: 0 },
      { path: '/c/', inbound: 1 },
    ]);
  });

  it('counts a linking page once however many links it has to the same target', () => {
    const outgoing = new Map<string, string[]>([
      ['/', ['/hubs/', '/a/', '/b/']],
      ['/hubs/', ['/a/', '/b/']],
      ['/a/', ['/b/', '/b/', '/hubs/', '/c/', '/c/']],
      ['/b/', ['/hubs/']],
      ['/c/', []],
      ['/hidden/', []],
      ['/de/x/', []],
    ]);
    expect(findUnderLinked(pages, outgoing)).toEqual([
      { path: '/', inbound: 0 },
      { path: '/c/', inbound: 1 },
    ]);
  });

  it('counts links from noindex and other-language pages, and passes a page with two sources', () => {
    const outgoing = new Map<string, string[]>([
      ['/', ['/hubs/']],
      ['/hubs/', ['/a/', '/b/', '/c/']],
      ['/a/', ['/b/', '/c/']],
      ['/b/', ['/a/', '/c/']],
      ['/c/', ['/a/', '/b/']],
      ['/hidden/', ['/hubs/']],
      ['/de/x/', ['/c/', '/b/']],
    ]);
    expect(findUnderLinked(pages, outgoing)).toEqual([{ path: '/', inbound: 0 }]);
  });

  it('keeps findOrphans as the pages with no inbound link at all', () => {
    const outgoing = new Map<string, string[]>([
      ['/hubs/', ['/a/']],
      ['/a/', ['/hubs/']],
      ['/b/', ['/a/']],
    ]);
    expect(findOrphans(pages, outgoing)).toEqual(['/', '/b/', '/c/']);
  });
});
