import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { captchaLoaded, postingForm } from '../../scripts/post-rules.mjs';

const SRC = new URL('../', import.meta.url).pathname;
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

describe('the site posts nothing to a server (TSA-044)', () => {
  it.each([
    '<form method="post">',
    '<form method = "post">',
    '<form action="/send">',
    '<form class="x" action ="/send" id="f">',
    '<form id="f"><button formaction="/send">Send</button></form>',
    '<form id="f"><input type="submit" formmethod="post"></form>',
    '<FORM METHOD="POST">',
  ])('sees a posting form in %s', (html) => {
    expect(postingForm(html)).toBe(true);
  });

  it.each([
    '<form class="finder" id="finder" aria-label="Find an activity">',
    '<form role="search" aria-label="Site search">',
    '<p>Use the action plan in your method.</p>',
    '<button type="button" class="btn">Print</button>',
  ])('lets %s through', (html) => {
    expect(postingForm(html)).toBe(false);
  });

  it('sees a captcha service by where it loads from, and not by the words on a page', () => {
    expect(captchaLoaded('<script src="https://challenges.cloudflare.com/turnstile/v0/api.js"></script>')).toBe(true);
    expect(captchaLoaded("<iframe src='https://www.google.com/recaptcha/api2/anchor'></iframe>")).toBe(true);
    expect(captchaLoaded('<link rel="preload" href="/captcha-explained.woff2">')).toBe(false);
    expect(captchaLoaded('<p>We do not use a captcha.</p>')).toBe(false);
  });

  it('has no request in its code that sends data: no POST, PUT, PATCH, DELETE or beacon', () => {
    const files = ['pages', 'views', 'components', 'tools', 'games', 'layouts', 'lib', 'data']
      .flatMap((d) => walk(join(SRC, d)))
      .filter((f) => /\.(astro|tsx?|mjs)$/.test(f) && !/\.test\.tsx?$/.test(f));
    const sends = /sendBeacon|method\s*:\s*['"](?:POST|PUT|PATCH|DELETE)|\.open\(\s*['"](?:POST|PUT|PATCH|DELETE)/i;
    const hits = files.flatMap((f) => readFileSync(f, 'utf8').split('\n').flatMap((line, i) => (sends.test(line) ? [`${relative(SRC, f)}:${i + 1}`] : [])));
    expect(hits).toEqual([]);
  });
});

describe('a box where something is typed leaves the browser’s spell-check off', () => {
  // Enhanced spell-check in some browsers sends what is typed to the browser's maker, which the pages say never happens.
  it.each(['../tools/DescribeSituation.tsx', '../tools/Search.tsx'])('in %s', (file) => {
    const source = readFileSync(new URL(file, import.meta.url), 'utf8');
    expect(source).toMatch(/spellCheck=\{false\}/);
    expect(source).not.toMatch(/spellCheck(?!=\{false\})/);
  });
});
