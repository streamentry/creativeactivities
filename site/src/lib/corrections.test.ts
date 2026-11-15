import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CORRECTIONS, CORRECTION_KINDS } from './corrections';

describe('corrections log (TSA-035)', () => {
  it('keeps entries newest first, with a valid date, page and kind', () => {
    const dates = CORRECTIONS.map((e) => e.date);
    expect([...dates].sort().reverse()).toEqual(dates);
    for (const e of CORRECTIONS) {
      expect(e.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(e.page.startsWith('/')).toBe(true);
      expect(Object.keys(CORRECTION_KINDS)).toContain(e.kind);
      expect(e.change.trim().length).toBeGreaterThan(20);
    }
  });
});

describe('corrections and boundary routes are linked (TSA-035, WEB-060)', () => {
  const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

  it('points every "Report a mistake" link at /corrections/, not /support/', () => {
    for (const view of ['views/ActivityView.astro', 'views/HubView.astro']) {
      const text = read(view);
      expect(text, view).toContain('href="/corrections/">Report a mistake');
      expect(text, view).not.toContain('href="/support/">Report a mistake');
    }
  });

  it('links the corrections page and the art-therapy boundary page from the footer', () => {
    const footer = read('components/Footer.astro');
    expect(footer).toContain("'/corrections/'");
    expect(footer).toContain("'/art-therapy-and-creative-activities/'");
  });

  it('shows the crisis-safe route on the Today page and on flagged guides', () => {
    expect(read('pages/today.astro')).toContain('<CrisisRoute />');
    expect(read('views/GuideView.astro')).toContain('d.crisisRoute && <CrisisRoute />');
  });
});
