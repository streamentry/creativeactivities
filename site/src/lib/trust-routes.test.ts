import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Trust routes (WEB-058, TSA-047, TSA-037, TSA-030, TSA-027): the report links, the AI disclosure,
 * the art therapy boundary and the crisis route on printed cards. The built pages are checked in
 * scripts/check-site.mjs; these tests check the source the pages are built from.
 */
const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const en = JSON.parse(read('../i18n/ui/en.json')) as { footer: Record<string, string>; pages: { editorial: { bodyHtml: string } } };

describe('WEB-058 and TSA-047: report routes reuse /corrections/', () => {
  const corrections = read('../pages/corrections.astro');

  it('offers a general problem report and a separate safety report, both by mailto', () => {
    expect(corrections).toContain('id="report-a-problem"');
    expect(corrections).toContain('id="report-safety"');
    expect(corrections).toContain('subject=Safety%20problem');
    expect(corrections).toMatch(/mailto:\$\{SITE\.supportEmail\}\?subject=Accessibility%20problem/);
    expect(corrections).toMatch(/mailto:\$\{SITE\.supportEmail\}\?subject=Wrong%20step/);
  });

  it('has no form backend and asks for no name, account or health details', () => {
    expect(corrections).not.toMatch(/<form[\s>]/);
    expect(corrections).toMatch(/You do not need an account or a name/);
    expect(corrections).toMatch(/Please do not send health records/);
  });

  it('links "Report a problem" from the footer on every page', () => {
    expect(en.footer.reportProblem).toBe('Report a problem');
    expect(read('../components/Footer.astro')).toContain("'/corrections/#report-a-problem'");
  });

  it('adds a safety report link to every activity page and printed card', () => {
    expect(read('../views/ActivityView.astro')).toContain('/corrections/#report-safety');
    expect(read('../components/ActivityPrintCard.astro')).toContain('/corrections/#report-safety');
  });
});

describe('TSA-037: AI-assistance disclosure on the editorial policy', () => {
  const body = en.pages.editorial.bodyHtml;

  it('says where AI helps and that a person tests every activity', () => {
    expect(body).toContain('<h2>How AI is used</h2>');
    expect(body).toContain('research, first drafts, translation drafts and formatting');
    expect(body).toContain('AI does not test activities');
  });

  it('does not publish AI-written reviews, testimonials or photos of real activities', () => {
    expect(body).toMatch(/we do not publish AI-written reviews or testimonials/);
    expect(body).toMatch(/No generated image is shown as a photo of a real activity/);
  });
});

describe('TSA-030: art therapy boundary extends the existing page', () => {
  const page = read('../pages/art-therapy-and-creative-activities.astro');

  it('cites the profession to its own bodies', () => {
    for (const host of ['arttherapy.org', 'atcb.org', 'hcpc-uk.org', 'baat.org']) expect(page).toContain(host);
  });

  it('states what the site does not claim', () => {
    expect(page).toContain('What we do not claim');
    expect(page).toContain('No activity on this site is called art therapy');
    expect(page).toContain('unless a signed record says so');
  });
});

describe('TSA-027: crisis route on printed cards and activity pages', () => {
  it('shows the route on the page when the card opts in', () => {
    expect(read('../views/ActivityView.astro')).toMatch(/\{d\.crisisRoute && <CrisisRoute \/>\}/);
  });

  it('prints the route on the card when the card opts in, with the verified numbers only', () => {
    const card = read('../components/ActivityPrintCard.astro');
    expect(card).toMatch(/d\.crisisRoute && \(/);
    expect(card).toContain('data-crisis-route');
    const component = read('../components/CrisisRoute.astro');
    expect(component).toContain("PRINT_CRISIS_LINE =");
    expect(component).toContain('988');
    expect(component).toContain('116 123');
  });
});
