import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { playProps } from '../i18n/play';
import Scrapbook from './Scrapbook';

const props = playProps('en', 'scrapbook');
const render = () => renderToStaticMarkup(createElement(Scrapbook, props));
const t = props.ui.scrapbook;
const source = readFileSync(new URL('./Scrapbook.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles/games.css', import.meta.url), 'utf8');

describe('Scrapbook', () => {
  it('starts with the choosing guidance, the consent and privacy lines, and Rest', () => {
    const html = render();

    expect(html).toContain(t.guidanceEmpty);
    expect(html).toContain('Use your own family photos. Ask before using a photo of someone who cannot say yes.');
    expect(html).toContain('Your photos stay on this device. They are not uploaded or saved.');
    expect(html).toContain('Done for now');
    expect(html).toContain('Rest for now');
  });

  it('reads the family photos from a native file input that takes several images', () => {
    const input = render().match(/<input[^>]*type="file"[^>]*>/)?.[0] ?? '';

    expect(input).toMatch(/accept="image\/\*"/);
    expect(input).toMatch(/ multiple/);
    expect(source).toContain('accept="image/*" multiple');
  });

  it('shows the picture of a book only after photos are chosen, so the first view has no photo', () => {
    expect(render()).not.toMatch(/<img/);
  });

  it('keeps the photo files in this tab: object URLs, released when replaced, cleared or closed', () => {
    expect(source).toContain('URL.createObjectURL');
    expect(source).toContain('URL.revokeObjectURL');
    expect(source).toMatch(/useEffect\(\s*\(\) => \(\) => \{[\s\S]*?revokeObjectURL[\s\S]*?\},\s*\[\],?\s*\)/);
    expect(source).toContain('releasePhotos()');
  });

  it('uses no network, storage, cookie or beacon, and no upload', () => {
    expect(source).not.toMatch(/localStorage|sessionStorage|indexedDB|\bfetch\(|XMLHttpRequest|sendBeacon|document\.cookie|FormData/);
  });

  it('uses no clock, timer or animation loop', () => {
    expect(source).not.toMatch(/setTimeout|setInterval|requestAnimationFrame|Date\.now|performance\.now/);
  });

  it('shows captions as text and never as HTML', () => {
    expect(source).not.toMatch(/dangerouslySetInnerHTML|innerHTML/);
    expect(source).toContain('maxLength={CAPTION_MAX}');
    expect(source).toContain('setCaption(');
  });

  it('gives the caption field a label that matches its wording and a limit of 80 characters', () => {
    expect(t.captionLabel).toBe('A few words for this page, if you like');
    expect(t.captionHelp).toContain('Up to 80 characters');
  });

  it('keeps the arrow keys for paging, and leaves them alone inside a caption', () => {
    expect(source).toContain("'ArrowLeft'");
    expect(source).toContain("'ArrowRight'");
    expect(source).toMatch(/event\.target instanceof HTMLInputElement/);
  });

  it('never puts a focusable element inside an aria-hidden container', () => {
    // A container with aria-hidden may not hold a control. Icons are decorative and may be hidden.
    const html = render();
    expect(html.match(/<(div|section|ul|li|fieldset|p|h2|label|figure|nav)[^>]*aria-hidden/g)).toBeNull();
    expect(source).not.toMatch(/aria-hidden="true"/);
  });

  it('gives every picture an explicit width and height, from the photo once it has loaded', () => {
    expect(source).toMatch(/<img[\s\S]*?width=\{size\(page\.id\)\.width\}[\s\S]*?height=\{size\(page\.id\)\.height\}/);
    expect(source).toMatch(/<img[\s\S]*?width=\{size\(p\.id\)\.width\}[\s\S]*?height=\{size\(p\.id\)\.height\}/);
  });

  it('prints one photo and its caption on each page, with page numbers', () => {
    expect(source).toContain('className="sheet scrapbook-sheet"');
    expect(source).toContain('className="sheet__page scrapbook-sheet__page"');
    expect(source).toContain('fill(text.pageOf, { n: i + 1, total })');
  });

  it('hides the printed book on screen only, with its own @media screen rule and no unconditional hide', () => {
    const screen = css.match(/@media screen \{\s*\.scrapbook-sheet \{\s*display: none;\s*\}\s*\}/);
    expect(screen).not.toBeNull();
    // No unconditional rule may hide the sheet: a top-level .scrapbook-sheet block must not set display none.
    const outside = css.replace(/@media screen \{\s*\.scrapbook-sheet \{\s*display: none;\s*\}\s*\}/, '');
    expect(outside).not.toMatch(/\.scrapbook-sheet \{[^}]*display: none/);
    expect(css).toMatch(/@media print \{[\s\S]*?\.scrapbook-sheet \{\s*display: block;/);
  });

  it('prints the book guidance line, which the paper version reads from ui.scrapbook.guidance', () => {
    expect(source).toContain('ui.scrapbook.guidance');
    expect(t.guidance).toMatch(/Nothing you make is saved or sent\./);
  });

  it('has no score, timer, count, streak or praise in any English string', () => {
    const text = JSON.stringify(t);
    expect(text).not.toMatch(/score|timer|clock|streak|moves|miss|wrong|incorrect|fail|mistake|try again|remember|correct|recall/i);
    expect(text).not.toMatch(/\b(win|wins|winner|won|lose|lost|loser|remaining|count|points?|best|better|faster|slow|hurry|complete|completed|well done|great)\b/i);
    expect(text).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u);
  });

  it('keeps no inline style attributes', () => {
    expect(render()).not.toContain(' style=');
  });
});
