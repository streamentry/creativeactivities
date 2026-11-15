import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { PICTURES } from '../data/pictures';

/**
 * TSA-038: every image the website serves has a rights and consent entry in
 * docs/specs/asset-provenance.json (site_images). Gaps are reported by the
 * register's rights_status, not hidden: an entry may say "unreviewed", but it
 * must exist and describe the image.
 */
const REGISTER_PATH = new URL('../../../docs/specs/asset-provenance.json', import.meta.url);
const PUBLIC_DIR = new URL('../../public/', import.meta.url);

interface SiteImage {
  id: string;
  url: string;
  kind: string;
  source_file: string;
  creator: string;
  licence: string;
  rights_status: string;
  reviewed_by: string | null;
  review_date: string | null;
  people_depicted: boolean;
  child_depicted: boolean;
  consent: string;
  release_ref: string | null;
  logged_on: string;
}

const register = JSON.parse(readFileSync(REGISTER_PATH, 'utf8')) as { site_images?: SiteImage[] };
const images: SiteImage[] = register.site_images ?? [];

const KINDS = new Set(['drawn-svg', 'generated-illustration', 'social-card']);
const RIGHTS = new Set(['unreviewed', 'reviewed']);
const CONSENT = new Set(['not_needed_no_person_shown', 'written', 'legal_representative', 'pending']);
const REQUIRED_TEXT = ['id', 'url', 'kind', 'source_file', 'creator', 'licence', 'consent', 'logged_on'] as const;

const manifest = JSON.parse(readFileSync(new URL('illustrations/manifest.json', PUBLIC_DIR), 'utf8')) as {
  illustrations: { id: string }[];
};
const socialCards = readdirSync(new URL('og/', PUBLIC_DIR), { recursive: true })
  .map(String)
  .filter((f) => f.endsWith('.png'))
  .map((f) => `/og/${f.split('\\').join('/')}`);

const byUrl = new Map(images.map((img) => [img.url, img]));

describe('site image provenance register', () => {
  it('has a site_images list', () => {
    expect(images.length).toBeGreaterThan(0);
  });

  it('gives every entry a unique id and url', () => {
    expect(new Set(images.map((i) => i.id)).size).toBe(images.length);
    expect(new Set(images.map((i) => i.url)).size).toBe(images.length);
  });

  it('fills every required field with a known value', () => {
    for (const img of images) {
      for (const key of REQUIRED_TEXT) {
        expect(typeof img[key], `${img.id}: ${key}`).toBe('string');
        expect(img[key].trim().length, `${img.id}: ${key} is empty`).toBeGreaterThan(0);
      }
      expect(KINDS.has(img.kind), `${img.id}: kind ${img.kind}`).toBe(true);
      expect(RIGHTS.has(img.rights_status), `${img.id}: rights_status ${img.rights_status}`).toBe(true);
      expect(CONSENT.has(img.consent), `${img.id}: consent ${img.consent}`).toBe(true);
      expect(typeof img.people_depicted, `${img.id}: people_depicted`).toBe('boolean');
      expect(typeof img.child_depicted, `${img.id}: child_depicted`).toBe('boolean');
    }
  });

  it('never marks an image reviewed without a reviewer and a date', () => {
    for (const img of images.filter((i) => i.rights_status === 'reviewed')) {
      expect(img.reviewed_by, `${img.id}: reviewed_by`).toBeTruthy();
      expect(img.review_date, `${img.id}: review_date`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('requires written consent or a legal representative for any identifiable person', () => {
    for (const img of images.filter((i) => i.people_depicted)) {
      expect(['written', 'legal_representative'], `${img.id}: consent`).toContain(img.consent);
      expect(img.release_ref, `${img.id}: release_ref`).toBeTruthy();
    }
  });

  it('requires a release for any child (TSA-021)', () => {
    for (const img of images.filter((i) => i.child_depicted)) {
      expect(img.release_ref, `${img.id}: release_ref`).toBeTruthy();
    }
  });
});

describe('every image the website references has an entry', () => {
  it('covers each picture in the picture library', () => {
    const missing = PICTURES.map((p) => `/pictures/${p.id}.svg`).filter((url) => !byUrl.has(url));
    expect(missing).toEqual([]);
  });

  it('covers each illustration in public/illustrations/manifest.json', () => {
    const missing = manifest.illustrations
      .map((i) => `/illustrations/${i.id}.webp`)
      .filter((url) => !byUrl.has(url));
    expect(missing).toEqual([]);
  });

  it('covers each social card in public/og', () => {
    expect(socialCards.length).toBeGreaterThan(0);
    const missing = socialCards.filter((url) => !byUrl.has(url));
    expect(missing).toEqual([]);
  });

  it('has no stale entries: every entry points at an image that still exists', () => {
    const pictureUrls = new Set(PICTURES.map((p) => `/pictures/${p.id}.svg`));
    const illustrationUrls = new Set(manifest.illustrations.map((i) => `/illustrations/${i.id}.webp`));
    const stale = images
      .filter((img) => {
        if (img.kind === 'drawn-svg') return !pictureUrls.has(img.url);
        if (img.kind === 'generated-illustration') return !illustrationUrls.has(img.url);
        return !existsSync(new URL(img.url.replace(/^\//, ''), PUBLIC_DIR));
      })
      .map((img) => img.url);
    expect(stale).toEqual([]);
  });
});
