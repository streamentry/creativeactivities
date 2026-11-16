import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { listFiles } from '../../scripts/check-capacity.mjs';
import { FAIL_AT, GROWTH, LIMITS, WARN_AT, assess, describe as describeCapacity, localeFolders, summarize } from '../../scripts/capacity-lib.mjs';

type Entry = { path: string; bytes: number };

/** A build with `locales` language folders of `perLocale` pages each, and some files that belong to no language. */
function build(locales: number, perLocale: number, extra = 3): Entry[] {
  const codes = Array.from({ length: locales }, (_, i) => `l${String.fromCharCode(97 + (i % 26))}${String.fromCharCode(97 + Math.floor(i / 26))}`);
  const entries: Entry[] = [{ path: 'index.html', bytes: 100 }];
  for (let i = 0; i < extra; i += 1) entries.push({ path: `_astro/chunk-${i}.js`, bytes: 1000 });
  for (const code of codes) {
    entries.push({ path: `${code}/index.html`, bytes: 100 });
    for (let p = 1; p < perLocale; p += 1) entries.push({ path: `${code}/page-${p}/index.html`, bytes: 100 });
  }
  return entries;
}

describe('what a build holds (PLAT-015)', () => {
  it('counts files, pages, bytes and the largest file', () => {
    const summary = summarize([
      { path: 'index.html', bytes: 10 },
      { path: 'de/index.html', bytes: 20 },
      { path: 'de/games/index.html', bytes: 30 },
      { path: '_astro/app.js', bytes: 5000 },
      { path: 'sitemap.xml', bytes: 40 },
    ]);
    expect(summary.files).toBe(5);
    expect(summary.html).toBe(3);
    expect(summary.bytes).toBe(5100);
    expect(summary.largest).toEqual({ path: '_astro/app.js', bytes: 5000 });
    expect(summary.topLevel.get('de')).toBe(2);
    expect(summary.topLevel.get('(root)')).toBe(2);
    expect(summary.topLevel.get('_astro')).toBe(1);
  });

  it('knows a language folder by its home page, its code and the size of the site in it, and nothing else', () => {
    const site = (folder: string, files: number): Entry[] =>
      Array.from({ length: files }, (_, i) => ({ path: i === 0 ? `${folder}/index.html` : `${folder}/page-${i}/index.html`, bytes: 1 }));
    const entries = [
      ...site('de', 12),
      ...site('pt-br', 10),
      ...site('haw', 30),
      ...site('activity', 40),
      ...site('faq', 1),
      ...site('app', 1),
      ...site('app-privacy', 1),
      ...site('fr', 9),
      ...site('_astro', 50),
      { path: 'pictures/a.svg', bytes: 1 },
    ];
    // "activity" is a section of the site; "faq", "app" and "app-privacy" are single pages with short names; "fr" here is
    // too small to be a whole translated site; "_astro" is not a code.
    expect(localeFolders(entries)).toEqual(['de', 'haw', 'pt-br']);
  });
});

describe('how full the build is (PLAT-015)', () => {
  it('is fine well below the limit', () => {
    const result = assess(summarize(build(10, 100)));
    expect(result.level).toBe('ok');
    expect(result.limit).toBe(LIMITS.filesFree);
  });

  it('warns from 80% of the Free limit and fails from 98%, so a release that cannot deploy is found by the build', () => {
    const at = (share: number) => {
      const files = Math.round(LIMITS.filesFree * share);
      return assess(summarize(build(1, files - 4)));
    };
    expect(at(WARN_AT - 0.01).level).toBe('ok');
    expect(at(WARN_AT + 0.01).level).toBe('warn');
    expect(at(FAIL_AT - 0.01).level).toBe('warn');
    expect(at(FAIL_AT + 0.005).level).toBe('fail');
  });

  it('measures against the Paid limit when told the plan is Paid', () => {
    const entries = build(1, LIMITS.filesFree - 4);
    expect(assess(summarize(entries)).level).toBe('fail');
    const paid = assess(summarize(entries), { plan: 'paid' });
    expect(paid.level).toBe('ok');
    expect(paid.limit).toBe(LIMITS.filesPaid);
  });

  it('fails on a file over the size limit however few files there are', () => {
    const entries = [{ path: 'index.html', bytes: 1 }, { path: 'huge.bin', bytes: LIMITS.fileBytes + 1 }];
    const result = assess(summarize(entries));
    expect(result.level).toBe('fail');
    expect(result.oversize?.path).toBe('huge.bin');
    expect(describeCapacity(summarize(entries), result).join('\n')).toContain('OVER THE FILE SIZE LIMIT: huge.bin');
  });

  it('says how many page types for every language still fit', () => {
    // 100 languages of 100 files, plus a few more: about 10,000 files used, 10,000 free, 100 per page type.
    const result = assess(summarize(build(100, 100)));
    expect(result.perLocalePage).toBe(100);
    expect(result.headroom).toBe(LIMITS.filesFree - 10004);
    expect(result.pageTypesInHeadroom).toBe(Math.floor(result.headroom / 100));
  });

  it('projects ten times the pages and says whether that fits either plan', () => {
    // 30 languages of 100 pages: about 3,000 files now, about 30,000 at ten times, which is over Free and within Paid.
    const summary = summarize(build(30, 100));
    const result = assess(summary);
    expect(GROWTH).toBe(10);
    expect(result.projected).toBe(summary.files - summary.html + summary.html * 10);
    expect(result.projectedFitsFree).toBe(false);
    expect(result.projectedFitsPaid).toBe(true);
    expect(assess(summarize(build(100, 100))).projectedFitsPaid).toBe(false);
  });

  it('records the limits Cloudflare documents, with where and when they were read', () => {
    expect(LIMITS.filesFree).toBe(20000);
    expect(LIMITS.filesPaid).toBe(100000);
    expect(LIMITS.fileBytes).toBe(25 * 1024 * 1024);
    expect(LIMITS.source).toMatch(/^https:\/\/developers\.cloudflare\.com\//);
    expect(LIMITS.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('reading a folder', () => {
  const root = mkdtempSync(join(tmpdir(), 'capacity-'));
  afterAll(() => rmSync(root, { recursive: true, force: true }));

  it('lists every file under it with a relative path and a size', () => {
    mkdirSync(join(root, 'de', 'games'), { recursive: true });
    writeFileSync(join(root, 'index.html'), 'abc');
    writeFileSync(join(root, 'de', 'index.html'), 'abcdef');
    writeFileSync(join(root, 'de', 'games', 'index.html'), 'x');
    const files = listFiles(root).sort((a: Entry, b: Entry) => a.path.localeCompare(b.path));
    expect(files).toEqual([
      { path: 'de/games/index.html', bytes: 1 },
      { path: 'de/index.html', bytes: 6 },
      { path: 'index.html', bytes: 3 },
    ]);
  });
});
