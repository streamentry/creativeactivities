import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  BRAND_ALLOWLIST,
  findOldBrand,
  scanFiles,
  scopeFiles,
  type AllowedHits,
} from './brand-name';

/**
 * L10N-008: launched copy must not say the old name ("Golden Moments") or show
 * the old domain (dementiaactivities.games), except for records and redirects
 * listed in BRAND_ALLOWLIST. Each allowed file has an exact hit count, so a new
 * hit in an allowed file still fails.
 */

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

describe('findOldBrand', () => {
  it('finds the old name in any case, across a line break, and in a URL-encoded subject', () => {
    expect(findOldBrand('Golden Moments')).toHaveLength(1);
    expect(findOldBrand('golden moments')).toHaveLength(1);
    expect(findOldBrand('GOLDEN MOMENTS')).toHaveLength(1);
    expect(findOldBrand('Golden\n  Moments')).toHaveLength(1);
    expect(findOldBrand('subject=Golden%20Moments%20support')).toHaveLength(1);
    expect(findOldBrand('dementia-games-golden-moments')).toHaveLength(1);
  });

  it('finds the old name with the words reversed (a translation may do this)', () => {
    expect(findOldBrand('Moments Golden : natal')).toHaveLength(1);
  });

  it('does not match ordinary words', () => {
    expect(findOldBrand('a goldenrod moment and golden hour')).toHaveLength(0);
    expect(findOldBrand('the golden rule of moments')).toHaveLength(0);
    expect(findOldBrand('goldenen Rahmen')).toHaveLength(0);
  });

  it('finds the old domain, with or without www', () => {
    expect(findOldBrand('https://dementiaactivities.games/')).toHaveLength(1);
    expect(findOldBrand('www.dementiaactivities.games')).toHaveLength(1);
    expect(findOldBrand('creativeactivities.org')).toHaveLength(0);
  });

  it('reports the line of each hit', () => {
    const hits = findOldBrand('first line\nsecond Golden Moments\nthird');
    expect(hits.map((h) => h.line)).toEqual([2]);
  });
});

describe('launched content has no old name outside the allowlist (L10N-008)', () => {
  it('scans the launched content roots', () => {
    const files = scopeFiles(REPO);
    expect(files.length).toBeGreaterThan(1000);
    expect(files.some((f) => f.endsWith('lib/l10n/arb/app_en.arb'))).toBe(true);
    expect(files.some((f) => f.includes('site/src/content/guides/'))).toBe(true);
    expect(files.some((f) => f.includes('docs/store-description/'))).toBe(true);
  });

  it('has no unlisted hits, and every allowlisted hit is still present', () => {
    const actual = scanFiles(REPO, scopeFiles(REPO));
    const allowed = new Map<string, AllowedHits>(BRAND_ALLOWLIST.map((entry) => [entry.file, entry]));
    const problems: string[] = [];

    for (const [file, hits] of actual) {
      const entry = allowed.get(file);
      if (!entry) {
        for (const hit of hits) problems.push(`${file}:${hit.line} unlisted "${hit.text}"`);
      } else if (entry.hits !== hits.length) {
        problems.push(`${file}: expected ${entry.hits} allowlisted hit(s), found ${hits.length}`);
      }
    }
    for (const entry of BRAND_ALLOWLIST) {
      if (!actual.has(entry.file)) problems.push(`${entry.file}: allowlisted but no longer has a hit (remove the entry)`);
    }
    expect(problems).toEqual([]);
  });

  it('gives every allowlist entry a kind and a reason', () => {
    for (const entry of BRAND_ALLOWLIST) {
      expect(['record', 'redirect', 'store-url', 'native-review']).toContain(entry.kind);
      expect(entry.reason.length).toBeGreaterThan(20);
    }
  });

  it('does not allowlist any English-source user copy (only records, redirects, store URLs and translations awaiting review)', () => {
    const englishSource = BRAND_ALLOWLIST.filter((entry) => entry.kind !== 'record' && entry.kind !== 'redirect' && entry.kind !== 'store-url');
    for (const entry of englishSource) {
      expect(entry.file.startsWith('site/src/content/guides-i18n/') || entry.file.startsWith('site/src/i18n/ui/')).toBe(true);
      expect(entry.kind).toBe('native-review');
    }
  });

  it('keeps the sent-outreach and changelog records out of launched scope', () => {
    const files = scopeFiles(REPO).map((f) => f.slice(REPO.length + 1));
    expect(files.filter((f) => f.startsWith('docs/strategy/') || f.startsWith('changelog/'))).toEqual([]);
  });

  it('reads a file as UTF-8 text without throwing on a non-ASCII name', () => {
    expect(() => readFileSync(join(REPO, 'lib/l10n/arb/app_en.arb'), 'utf8')).not.toThrow();
  });
});
