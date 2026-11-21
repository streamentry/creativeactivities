/**
 * Sponsors and partners (TSA-049). Source-level checks: the About section is wired
 * in, the wording says "none" while PARTNERS is empty, no activity card carries
 * sponsor wording, and no page or component shows a logo-like image except the
 * site's own brand mark. The built pages are not checked here.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { PARTNERS, PARTNER_RELATIONSHIPS } from '../data/partners';
import { disclosureLine } from './partners';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const en = JSON.parse(read('../i18n/ui/en.json')) as {
  pages: { about: { sponsors: Record<'heading' | 'none' | 'listed' | 'policy' | 'listHeading' | 'noPartners', string> } };
};
const sponsors = en.pages.about.sponsors;

describe('TSA-049: About page shows the sponsors and partners section', () => {
  it('the About page is English ProseView, and ProseView renders the section for English only', () => {
    expect(read('../pages/about.astro')).toMatch(/page="about"/);
    expect(read('../pages/about.astro')).toMatch(/lang="en"/);
    const prose = read('../views/ProseView.astro');
    expect(prose).toContain("import SponsorsSection from '../components/SponsorsSection.astro'");
    expect(prose).toMatch(/page === 'about' && lang === 'en' && <SponsorsSection \/>/);
  });

  it('the section component reads PARTNERS and prints the list publicly', () => {
    const section = read('../components/SponsorsSection.astro');
    expect(section).toContain("from '../data/partners'");
    expect(section).toContain('PARTNERS.map(');
    expect(section).toContain('id="sponsors-heading"');
  });

  it('when PARTNERS is empty, the page says there are none', () => {
    const section = read('../components/SponsorsSection.astro');
    expect(section).toMatch(/PARTNERS\.length === 0 \? <p>\{t\.none\}<\/p>/);
    expect(section).toMatch(/\{t\.noPartners\}/);
    expect(sponsors.noPartners).toBe('There are no partners at the moment.');
    expect(sponsors.none).toMatch(/has no sponsors, no paid placements/);
    expect(sponsors.heading).toBe('Sponsors and partners');
  });

  it('every partner entry has a name, an https link, a known relationship and a YYYY-MM-DD date', () => {
    for (const p of PARTNERS) {
      expect(p.name.trim()).not.toBe('');
      expect(p.url).toMatch(/^https:\/\//);
      expect(PARTNER_RELATIONSHIPS).toContain(p.relationship);
      expect(p.permissionDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe('TSA-049: disclosure line for any page that shows a partner', () => {
  it('names the relationship for each kind', () => {
    expect(disclosureLine({ name: 'Acme', relationship: 'sponsor' })).toBe('This page is sponsored by Acme.');
    expect(disclosureLine({ name: 'Acme', relationship: 'paid placement' })).toBe('Acme has paid for its place on this page.');
    expect(disclosureLine({ name: 'Acme', relationship: 'partner' })).toBe('Acme is a partner of Creative Activities.');
  });

  it('the disclosure component uses the helper', () => {
    expect(read('../components/PartnerDisclosure.astro')).toContain("import { disclosureLine } from '../lib/partners'");
  });
});

describe('TSA-049: no activity card carries sponsor or partner wording', () => {
  const cardsDir = new URL('../content/activity-cards/', import.meta.url);
  const FORBIDDEN = /\b(sponsor\w*|affiliate\w*|paid placement|in partnership|partner logos?|brand partners?)\b/i;

  it('scans a non-empty set of card files, none with forbidden wording', () => {
    const files = readdirSync(cardsDir).filter((f) => f.endsWith('.md'));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const text = readFileSync(new URL(file, cardsDir), 'utf8');
      expect(text, file).not.toMatch(FORBIDDEN);
    }
  });
});

describe('TSA-049: logo guard', () => {
  /** The site's brand mark: the only image allowed to carry a logo-like name. */
  const BRAND_MARK_SRC = '/icons/brand-mark.png';
  const BRAND_MARK_FILE = 'components/BrandMark.astro';
  const LOGO_LIKE = /logo|partner|sponsor/i;
  const srcRoot = fileURLToPath(new URL('../', import.meta.url));

  /** Recursively lists .astro and .tsx sources under src (tests excluded). */
  function sources(dir: string, out: string[] = []): string[] {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) sources(path, out);
      else if (/\.(astro|tsx)$/.test(name) && !/\.test\./.test(name)) out.push(path);
    }
    return out;
  }

  /** The src and alt attribute values of one img tag, as text (static or expression). */
  function attrText(tag: string): string {
    const parts: string[] = [];
    for (const m of tag.matchAll(/\b(src|alt)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([^}]*)\})/g)) {
      parts.push(`${m[1]}=${m[2] ?? m[3] ?? m[4] ?? ''}`);
    }
    return parts.join(' ');
  }

  it('the brand mark exists and is the only logo-like img', () => {
    expect(existsSync(new URL(`../../public${BRAND_MARK_SRC}`, import.meta.url))).toBe(true);
    expect(read(`../${BRAND_MARK_FILE}`)).toContain(`src="${BRAND_MARK_SRC}"`);

    const violations: string[] = [];
    for (const file of sources(srcRoot)) {
      const text = readFileSync(file, 'utf8');
      for (const m of text.matchAll(/<img\b[\s\S]*?>/g)) {
        const attrs = attrText(m[0]);
        if (!LOGO_LIKE.test(attrs)) continue;
        const isBrandMark = file.endsWith(BRAND_MARK_FILE) && attrs.includes(`src=${BRAND_MARK_SRC}`);
        if (!isBrandMark) violations.push(`${file}: ${attrs}`);
      }
    }
    expect(violations).toEqual([]);
  });
});
