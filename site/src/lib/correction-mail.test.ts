import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SITE } from './site';
import { CORRECTION_PROMPTS, canonicalPageUrl, correctionMailto } from './correction-mail';

/** Pulls the decoded subject and body back out of a mailto link. */
function parts(href: string) {
  const query = href.slice(href.indexOf('?') + 1);
  const params = new Map(query.split('&').map((pair) => {
    const i = pair.indexOf('=');
    return [pair.slice(0, i), decodeURIComponent(pair.slice(i + 1))] as const;
  }));
  return { to: href.slice('mailto:'.length, href.indexOf('?')), subject: params.get('subject'), body: params.get('body') };
}

describe('correction mailto link (COM-031)', () => {
  const href = correctionMailto({ title: 'Paper Plate Sunflower', path: '/activity/paper-plate-sunflower/' });

  it('is a mailto to the support address with a subject and body', () => {
    const p = parts(href);
    expect(p.to).toBe(SITE.supportEmail);
    expect(p.subject).toBe('Correction: Paper Plate Sunflower');
  });

  it('names the canonical absolute page address in the body', () => {
    expect(parts(href).body).toContain('Page: https://creativeactivities.org/activity/paper-plate-sunflower/');
  });

  it('asks the three prompts in order', () => {
    const body = parts(href).body ?? '';
    expect(CORRECTION_PROMPTS).toEqual([
      'What is wrong:',
      'Where on the page:',
      'Your email if you want a reply (optional):',
    ]);
    const positions = CORRECTION_PROMPTS.map((p) => body.indexOf(p));
    expect(positions.every((i) => i >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it('encodes spaces as %20 and line breaks as %0D%0A, with no raw whitespace', () => {
    expect(href).not.toMatch(/\s/);
    expect(href).toContain('%20');
    expect(href).toContain('%0D%0A');
  });

  it('has exactly one query separator, even when the title has punctuation', () => {
    const tricky = correctionMailto({ title: 'Tea & toast? Yes #1', path: '/guides/x/' });
    expect(tricky.split('?')).toHaveLength(2);
    expect(parts(tricky).subject).toBe('Correction: Tea & toast? Yes #1');
  });

  it('adds nothing about the visitor (no referrer, locale, time or agent)', () => {
    const body = parts(href).body ?? '';
    expect(body).not.toMatch(/user|agent|referr|locale|time|ip\b|browser/i);
  });
});

describe('canonicalPageUrl', () => {
  it('builds an absolute address and drops any query string or fragment', () => {
    expect(canonicalPageUrl('/activity/x/?utm_source=a#steps')).toBe(`${SITE.url}/activity/x/`);
  });

  it('keeps a localized path as it is', () => {
    expect(canonicalPageUrl('/es/guides/x/')).toBe(`${SITE.url}/es/guides/x/`);
  });

  it('rejects a path without a leading slash', () => {
    expect(() => canonicalPageUrl('activity/x/')).toThrow();
  });
});

describe('correction link is wired on every activity, guide and pack page (COM-031)', () => {
  const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

  it('the shared component builds the mailto and links the corrections page', () => {
    const component = read('components/SuggestCorrection.astro');
    expect(component).toContain('correctionMailto');
    expect(component).toContain('href="/corrections/"');
    expect(component).not.toMatch(/style=["']/);
  });

  it('activity, guide and pack views render it', () => {
    expect(read('views/ActivityView.astro')).toContain('<SuggestCorrection');
    expect(read('views/GuideView.astro')).toContain('<SuggestCorrection');
    expect(read('views/PackView.astro')).toContain('<SuggestCorrection');
  });

  it('the printed card points to the corrections page as well as the safety report', () => {
    const card = read('components/ActivityPrintCard.astro');
    expect(card).toContain('Corrections: {SITE.domain}/corrections/');
    expect(card).toContain('Report a safety problem: {SITE.domain}/corrections/#report-safety');
  });

  it('has English strings for the link and its alternative', () => {
    const en = JSON.parse(read('i18n/ui/en.json')) as { corrections?: { suggest?: string; otherWays?: string } };
    expect(en.corrections?.suggest).toBe('Suggest a correction');
    expect(en.corrections?.otherWays).toBe('Other ways to tell us');
  });
});
