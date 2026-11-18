import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CARE_PLANS, CLEANUP_TEXT, PLAN_MINUTES, STOP_RULE, cardFitsPlan, setupText } from './care-setting-plans';
import { NOINDEX_PAGES } from './noindex-pages';
import { PAUSE_LINE, SCOPE_LINE } from './scope';

/** CNT-014 (adult variant): session plans for care homes and day centers, built from existing cards. */
const cardsDir = new URL('../content/activity-cards/', import.meta.url);
const frontmatter = (text: string) => text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const cardText = (slug: string) => {
  try {
    return readFileSync(new URL(`${slug}.md`, cardsDir), 'utf8');
  } catch {
    return '';
  }
};
const page = read('../pages/for-organizations/care-settings.astro');
const organizations = read('../views/OrganizationsView.astro');
const a11y = read('../../scripts/a11y-check.mjs');
const checkPrint = read('../../scripts/check-print.mjs');

const minutesRange = (fm: string) => {
  const m = fm.match(/^activityMinutes:\s*\[(\d+),\s*(\d+)\]/m);
  return m ? ([Number(m[1]), Number(m[2])] as [number, number]) : null;
};

describe('care-setting session plans (CNT-014, adult variant)', () => {
  it('has one plan for each length, 10, 20 and 30 minutes, with one to three cards', () => {
    expect(CARE_PLANS.map((p) => p.minutes)).toEqual([...PLAN_MINUTES]);
    for (const plan of CARE_PLANS) {
      expect(plan.cards.length).toBeGreaterThanOrEqual(1);
      expect(plan.cards.length).toBeLessThanOrEqual(3);
      expect(new Set(plan.cards).size).toBe(plan.cards.length);
    }
  });

  it('links only cards that exist, are not withdrawn, and whose activity time holds the plan length', () => {
    for (const plan of CARE_PLANS) {
      for (const slug of plan.cards) {
        const fm = frontmatter(cardText(slug));
        expect(fm, `${slug} exists`).not.toBe('');
        expect(fm, `${slug} is not withdrawn`).not.toMatch(/^withdrawn:/m);
        const range = minutesRange(fm);
        expect(range, `${slug} has activityMinutes`).not.toBeNull();
        expect(cardFitsPlan(range!, plan.minutes), `${slug} fits ${plan.minutes} minutes`).toBe(true);
      }
    }
  });

  it('takes each group version from the card itself, so every linked card has a for-a-group variation', () => {
    for (const plan of CARE_PLANS) {
      for (const slug of plan.cards) {
        expect(cardText(slug), `${slug} has a group variation`).toMatch(/kind: for-a-group/);
      }
    }
  });

  it('only links cards that are in the library', () => {
    const files = new Set(readdirSync(cardsDir).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)));
    for (const plan of CARE_PLANS) for (const slug of plan.cards) expect(files.has(slug)).toBe(true);
  });

  it('never invents a setup or clean-up time: a missing prep time reads "Check the card"', () => {
    expect(setupText(0)).toBe('Check the card');
    expect(setupText(5)).toBe('5 minutes');
    expect(CLEANUP_TEXT).toBe('Check the card');
    expect(STOP_RULE).toBe('Stop when the person wants to stop.');
  });
});

describe('care-settings page (CNT-014, adult variant)', () => {
  it('is held from search: noindex on its layout, and listed in NOINDEX_PAGES', () => {
    expect(page).toMatch(/<PageLayout[\s\S]*?\bnoindex\b[\s\S]*?>/);
    expect(NOINDEX_PAGES.has('/for-organizations/care-settings/')).toBe(true);
  });

  it('is linked from for-organizations in one line, English only', () => {
    expect(organizations).toContain('href="/for-organizations/care-settings/"');
    expect(organizations).toMatch(/\{lang === 'en' && \(/);
  });

  it('reuses the site scope and pause lines rather than retyping them', () => {
    expect(page).toMatch(/import \{[^}]*\bSCOPE_LINE\b[^}]*\} from '\.\.\/\.\.\/lib\/scope'/);
    expect(page).toMatch(/import \{[^}]*\bPAUSE_LINE\b[^}]*\} from '\.\.\/\.\.\/lib\/scope'/);
    expect(SCOPE_LINE).toContain('not medical advice');
    expect(PAUSE_LINE).toContain('Pause or stop');
  });

  it('has no forms, scripts, email capture or hard-coded colours', () => {
    expect(page).not.toMatch(/<form[\s>]/i);
    expect(page).not.toMatch(/<script[\s>]/i);
    expect(page).not.toMatch(/type="email"/i);
    expect(page).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(page).not.toMatch(/Colors\.|Color\(0x/);
  });

  it('keeps to the voice rules, with the allowed phrases for "therapy" and "clinical" only', () => {
    const allowed = /\bnot therapy\b|\bnot a clinical program\b|\bclinical endorsement\b/gi;
    const text = page.replace(allowed, '');
    const banned = ['patient', 'sufferer', 'brain', 'score', 'therapy', 'therapeutic', 'clinical', 'evidence-based', 'outcome', 'school', 'classroom', 'early years', 'child', 'kids'];
    const found = banned.filter((word) => new RegExp(`\\b${word.replace(/[-\s]/g, (c) => (c === ' ' ? '\\s+' : '\\' + c))}`, 'i').test(text));
    expect(found).toEqual([]);
  });

  it('has a family note with no input field, only a blank line for the activity name', () => {
    const family = page.slice(page.indexOf('data-family-note'), page.indexOf('data-permission-template'));
    expect(family.length).toBeGreaterThan(0);
    expect(family).not.toMatch(/<input|<textarea|<select/);
    expect(family).not.toMatch(/date of birth|room number/i);
  });

  it('names no partner organization, and says written agreement is needed', () => {
    expect(page).toMatch(/no organization is named as using this site without written agreement/i);
  });

  it('is in the a11y check and the print check, with five one-page sheets', () => {
    expect(a11y).toContain("path: '/for-organizations/care-settings/'");
    expect(checkPrint).toMatch(/const CARE_SHEETS = 5;/);
    expect(checkPrint).toMatch(/careSheets\(/);
  });
});
