import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { NOINDEX_PAGES } from './noindex-pages';
import { PAUSE_LINE, SCOPE_LINE } from './scope';

/** WEB-048: a printable handout for health and social care referrers, held from search until a credentialed reviewer signs off. */
const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const page = read('../pages/for-professionals.astro');
const organizations = read('../views/OrganizationsView.astro');
const header = read('../components/Header.astro');
const footer = read('../components/Footer.astro');
const sitemapEntries = read('./sitemap-entries.ts');
const checkPrint = read('../../scripts/check-print.mjs');

// Words the page must never use (WEB-048). Each is matched from its start, so plurals and forms are caught too.
const BANNED = ['prescription', 'prescribe', 'treatment', 'outcome', 'therapy', 'therapeutic', 'clinical', 'patient', 'improve memory', 'cognitive', 'brain', 'evidence-based', 'proven', 'benefit'];

// The only allowed uses: the phrases that say what the activity is not.
const ALLOWED = /\bnot (?:therapy|treatment)\b/gi;

describe('for-professionals handout (WEB-048)', () => {
  it('uses the site scope line and the stop line, imported and not retyped', () => {
    expect(page).toMatch(/import \{[^}]*\bSCOPE_LINE\b[^}]*\} from '\.\.\/lib\/scope'/);
    expect(page).toMatch(/import \{[^}]*\bPAUSE_LINE\b[^}]*\} from '\.\.\/lib\/scope'/);
    expect(page).toContain('{SCOPE_LINE}');
    expect(page).toContain('{PAUSE_LINE}');
    expect(SCOPE_LINE).toContain('not medical advice');
    expect(PAUSE_LINE).toContain('Pause or stop');
  });

  it('has none of the banned words outside the allowed "not therapy" and "not treatment" phrases', () => {
    const text = [page, SCOPE_LINE, PAUSE_LINE].join('\n').replace(ALLOWED, '');
    const found = BANNED.filter((word) => new RegExp(`\\b${word.replace(/[-\s]/g, (c) => (c === ' ' ? '\\s+' : '\\'+c))}`, 'i').test(text));
    expect(found).toEqual([]);
  });

  it('is held from search: noindex on its layout, and listed in NOINDEX_PAGES', () => {
    expect(page).toMatch(/<PageLayout[\s\S]*?\bnoindex\b[\s\S]*?>/);
    expect(NOINDEX_PAGES.has('/for-professionals/')).toBe(true);
  });

  it('is left out of the sitemap through the same list the other held pages use', () => {
    expect(sitemapEntries).toMatch(/import \{ NOINDEX_PAGES \} from '\.\/noindex-pages'/);
    expect(sitemapEntries).toMatch(/\.filter\(\(path\) => !NOINDEX_PAGES\.has\(path\)\)/);
  });

  it('is linked from for-organizations only, in English, and not from the main navigation', () => {
    expect(organizations).toContain('href="/for-professionals/"');
    expect(organizations).toContain('For health and social care professionals: ');
    expect(organizations).toMatch(/\{lang === 'en' && \(/);
    expect(header).not.toContain('for-professionals');
    expect(footer).not.toContain('for-professionals');
  });

  it('has one h1 (from the layout), h2 sections, a notes line on review, and a corrections link', () => {
    expect(page).not.toMatch(/<h1[\s>]/);
    expect((page.match(/<h2[\s>]/g) ?? []).length).toBeGreaterThanOrEqual(5);
    expect(page).toContain('This handout has not yet been reviewed by a credentialed professional.');
    expect(page).toContain('href="/corrections/"');
    expect(page).toMatch(/datetime=\{UPDATED\}/);
  });

  it('keeps the page free of aria-hidden and hard-coded colours', () => {
    expect(page).not.toMatch(/aria-hidden/);
    expect(page).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });

  it('prints on one page on A4 and US Letter, registered in the print check with a one-page limit', () => {
    expect(checkPrint).toMatch(/const PROFESSIONALS_HANDOUT_PAGES = 1;/);
    expect(checkPrint).toMatch(/check\('professionals handout',[^\n]*'\/for-professionals\/', PROFESSIONALS_HANDOUT_PAGES/);
  });
});
