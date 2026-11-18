import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Page-specific CSS moved out of the global stylesheets (WEB-074), so card pages
 * carry less CSS. Each moved selector must live in the file named here, must not
 * come back into a global file, and the template that renders it must import that file.
 */
const styles = (name: string) => readFileSync(new URL(`../styles/${name}`, import.meta.url), 'utf8');
const astro = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

/** Files every page loads (BaseLayout) plus the card-only files, which must not gain these rules back. */
const GLOBAL = ['components.css', 'base.css', 'studio.css', 'tokens.css'];

const MOVED: Record<string, string[]> = {
  'game-cards.css': ['.game-card {', '.game-card__print {', '.game-card__pics {', '.game-card .card__body {', '.tag-list {', '.tag {'],
  'studio-home.css': ['.stage-grid {', '.stage-card__step {'],
  'studio-editorial.css': [
    '.answer {', '.answer::before {', '.answer__label {',
    '.toc {', '.toc__title {', '.toc summary {', '.toc ol a {',
    '.sources {', '.sources .publisher {', '.copy-text {', '.copy-text p {',
  ],
  'cta-band.css': ['.cta-band {', '.cta-band h2 {', '.cta-band p {'],
  'meta-line.css': ['.meta-line {', '.meta-line a {'],
  'article-layout.css': ['.article-layout {', '.article-layout > * {'],
  'faq.css': ['.faq summary {', '.faq summary::after {', '.faq details > div {'],
};

/** Selectors that must stay global, and why (see the commit message). */
const KEPT_GLOBAL = [
  '.faq {', // border-top is also set by studio-editorial.css; moving it would change the winner
  '.faq details {', // border-bottom is also set by studio-editorial.css
  '.faq summary:hover::after {', // same specificity as studio-editorial's open-state rule and sets the same background and color
  '.answer p {', // .prose li and .prose ul in components.css share specificity with these
];

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** True when the stylesheet opens a rule with this selector (given as `.x {`, the brace is optional). */
const declares = (css: string, selector: string) =>
  new RegExp(`^\\s*${escape(selector.replace(/\s*\{$/, ''))}\\s*\\{`, 'm').test(css);

describe('page-specific CSS split (WEB-074)', () => {
  it('moved selectors are defined in their target stylesheet', () => {
    for (const [file, selectors] of Object.entries(MOVED)) {
      const css = styles(file);
      for (const selector of selectors) {
        expect(declares(css, selector), `${selector} in ${file}`).toBe(true);
      }
    }
  });

  it('moved selectors do not creep back into the global stylesheets', () => {
    for (const file of GLOBAL) {
      const css = styles(file);
      for (const selectors of Object.values(MOVED)) {
        for (const selector of selectors) {
          expect(declares(css, selector), `${selector} in ${file}`).toBe(false);
        }
      }
    }
  });

  it('selectors kept global for cascade reasons stay in components.css', () => {
    const css = styles('components.css');
    for (const selector of KEPT_GLOBAL) {
      expect(declares(css, selector), selector).toBe(true);
    }
  });

  it('the print and contrast lists no longer name the moved selectors', () => {
    const css = styles('components.css');
    for (const line of ['.cta-band,', '.toc,', '.answer,', '.sources,', '.copy-text,', '.game-card__print,']) {
      expect(css.split('\n').some((l) => l.trim() === line), line).toBe(false);
    }
  });

  it('each template that renders a moved block imports the file that styles it', () => {
    const importers: Record<string, string[]> = {
      'game-cards.css': ['components/GameCard.astro', 'views/GameView.astro'],
      'studio-home.css': ['views/HomeView.astro'],
      'studio-editorial.css': ['views/GuideView.astro', 'views/HubView.astro', 'views/FaqView.astro', 'views/OrganizationsView.astro'],
      'cta-band.css': ['components/AppCta.astro', 'components/PlayCta.astro'],
      'meta-line.css': ['layouts/PageLayout.astro', 'views/GuideView.astro'],
      'article-layout.css': ['views/GameView.astro', 'views/GuideView.astro'],
      'faq.css': ['components/Faq.astro'],
    };
    for (const [file, paths] of Object.entries(importers)) {
      for (const path of paths) {
        expect(astro(path), `${path} imports ${file}`).toContain(`../styles/${file}'`);
      }
    }
  });
});
