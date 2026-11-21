import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { commerceLinks, purchasePrompts } from '../../scripts/child-purchase-rules.mjs';

/**
 * BIZ-018: child-directed pages carry no purchase, donation, subscription or price prompt, and no link to
 * checkout. This is the source half of the guard; check-site.mjs checks the built pages with the same rules.
 * Child-directed means the /kids/ section, its guides in every language, and any content marked childDirected.
 */
const SITE = join(__dirname, '..', '..');
const CONTENT = join(SITE, 'src', 'content');
const COMPONENTS = join(SITE, 'src', 'components');
const VIEWS = join(SITE, 'src', 'views');
const LAYOUTS = join(SITE, 'src', 'layouts');

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
const rel = (file: string) => file.slice(SITE.length + 1);

/** Kids guides in English and every translation, plus any content file marked child-directed. */
const kidsContent = walk(CONTENT).filter(
  (f) => f.endsWith('.md') && (/\/kids\/[^/]+\.md$/.test(f) || /^childDirected:\s*true/m.test(readFileSync(f, 'utf8'))),
);

/** Every link target in a markdown or HTML source: https URLs and site paths. */
const linksIn = (text: string): string[] => [
  ...(text.match(/https?:\/\/[^\s)"'<>]+/g) ?? []),
  ...[...text.matchAll(/\]\((\/[^)\s]*)\)|href="([^"]+)"/g)].map((m) => m[1] ?? m[2] ?? ''),
];

/** Components and layouts a kids page renders, read from the views' and layouts' own imports. */
const usedBy = (file: string) => {
  const text = readFileSync(file, 'utf8');
  return [...text.matchAll(/import \w+ from '\.\.\/(components|layouts)\/([\w-]+\.astro)'/g)].map((m) => join(SITE, 'src', m[1], m[2]));
};
const pageParts = [
  join(VIEWS, 'GuideView.astro'),
  join(VIEWS, 'SectionView.astro'),
  join(LAYOUTS, 'BaseLayout.astro'),
  ...usedBy(join(VIEWS, 'GuideView.astro')),
  ...usedBy(join(VIEWS, 'SectionView.astro')),
  ...usedBy(join(LAYOUTS, 'BaseLayout.astro')),
].filter((f, i, all) => all.indexOf(f) === i);

describe('the patterns (BIZ-018)', () => {
  it('flags a call to buy, donate, subscribe or check out', () => {
    for (const s of ['Buy now from us.', 'Donate to us today.', 'Subscribe now for more.', 'Proceed to checkout.', 'Add to cart.', 'Become a supporter.', 'Upgrade to premium.']) {
      expect(purchasePrompts(s).length, s).toBeGreaterThan(0);
    }
  });

  it('flags prices and currency amounts', () => {
    for (const s of ['Only $4.99 a month.', 'Costs £3.', 'Prices start at 5 EUR.']) {
      expect(purchasePrompts(s).length, s).toBeGreaterThan(0);
    }
  });

  it('does not flag craft wording that uses the same words', () => {
    for (const s of [
      'You may need to buy a glue stick.',
      'Buy nothing; use cardboard tubes.',
      'Donate old magazines to a school.',
      'Check out these ideas.',
      'Most of these need no shopping.',
      'The app is free, with no in-app purchases and no ads.',
      'Pay attention to the paint.',
      'Two pounds of flour.',
    ]) {
      expect(purchasePrompts(s), s).toEqual([]);
    }
  });

  it('flags commerce hosts and checkout paths, but not an ordinary public source', () => {
    expect(commerceLinks(['https://www.amazon.com/dp/x', 'https://checkout.stripe.com/c/pay', '/checkout/', '/fr/donate/'])).toHaveLength(4);
    expect(commerceLinks(['https://www.cdc.gov/x', 'https://apps.apple.com/us/app/x/id1', '/kids/', '/activity/x/'])).toEqual([]);
  });
});

describe('child-directed content has no purchase prompts or checkout links (BIZ-018)', () => {
  it('finds the kids guides in English and in every translation', () => {
    expect(kidsContent.length).toBeGreaterThanOrEqual(7 * 2);
  });

  for (const file of kidsContent) {
    it(`${rel(file)} has no purchase, donation, subscription or price prompt`, () => {
      const text = readFileSync(file, 'utf8');
      expect(purchasePrompts(text)).toEqual([]);
    });

    it(`${rel(file)} links to no checkout, cart or donation page`, () => {
      expect(commerceLinks(linksIn(readFileSync(file, 'utf8')))).toEqual([]);
    });
  }
});

describe('components and layouts that kids pages render (BIZ-018)', () => {
  it('reads the views and layouts that kids pages use', () => {
    expect(pageParts.filter((f) => !existsSync(f))).toEqual([]);
    expect(pageParts.some((f) => f.endsWith('AppCta.astro'))).toBe(true);
    expect(pageParts.some((f) => f.endsWith('Footer.astro'))).toBe(true);
  });

  for (const file of pageParts.filter((f) => f.endsWith('.astro'))) {
    it(`${rel(file)} has no purchase, donation, subscription or price prompt`, () => {
      expect(purchasePrompts(readFileSync(file, 'utf8'))).toEqual([]);
    });
  }

  it('the shared interface strings have no purchase prompt outside a denial', () => {
    const strings = readFileSync(join(SITE, 'src', 'i18n', 'ui', 'en.json'), 'utf8');
    expect(purchasePrompts(strings)).toEqual([]);
  });

  it('the component folder is still there to scan', () => {
    expect(existsSync(COMPONENTS)).toBe(true);
  });
});
