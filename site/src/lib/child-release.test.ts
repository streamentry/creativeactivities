import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ALL_SERVED_PICTURES } from '../data/pictures';

/**
 * PLAT-003 / CNT-031 / WEB-073: no image of a child is published without a
 * recorded parental release. The register (docs/specs/asset-provenance.json)
 * holds child_release (unknown | verified) on each record with
 * child_depicted true. Only a person may set verified.
 */
const REGISTER_PATH = new URL('../../../docs/specs/asset-provenance.json', import.meta.url);
const PUBLIC_DIR = fileURLToPath(new URL('../../public/', import.meta.url));
const SRC_DIR = fileURLToPath(new URL('../', import.meta.url));
const TEXT_FILE = /\.(astro|ts|tsx|js|mjs|cjs|md|mdx|json|html|css|svg|txt|xml|webmanifest|ya?ml|csv)$/i;
const CATALOG_PATH = 'assets/images/catalog';

interface ChildRecord {
  id: string;
  url: string;
  child_depicted: boolean;
  child_release?: string;
  child_release_ref?: string | null;
}

const register = JSON.parse(readFileSync(REGISTER_PATH, 'utf8')) as { site_images: ChildRecord[] };
const records = register.site_images;
const childRecords = records.filter((r) => r.child_depicted === true);

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const publicFiles = walk(PUBLIC_DIR);
const srcFiles = walk(SRC_DIR).filter((f) => TEXT_FILE.test(f));
const publicUrls = new Set(publicFiles.map((f) => `/${relative(PUBLIC_DIR, f).split(sep).join('/')}`));
const pictureUrls = new Set(ALL_SERVED_PICTURES.map((p) => `/pictures/${p.id}.svg`));
const srcText = srcFiles.map((f) => readFileSync(f, 'utf8')).join('\n');

/** A record is served when its file is in site/public, its drawn picture is in the picture library, or its URL appears in site/src. */
function isServed(url: string): boolean {
  return publicUrls.has(url) || pictureUrls.has(url) || srcText.includes(url);
}

describe('child image releases (PLAT-003, CNT-031, WEB-073)', () => {
  it('gives every child record a release status and a release reference field', () => {
    for (const r of childRecords) {
      expect(['unknown', 'verified'], `${r.id}: child_release`).toContain(r.child_release);
      expect(r, `${r.id}: child_release_ref`).toHaveProperty('child_release_ref');
    }
  });

  it('publishes no served child image without child_release verified', () => {
    const offenders = childRecords
      .filter((r) => isServed(r.url) && r.child_release !== 'verified')
      .map((r) => `${r.id} (${r.url}): child_release ${r.child_release ?? 'missing'}`);
    expect(offenders).toEqual([]);
  });
});

describe('the website does not reference the app catalog (CNT-031)', () => {
  it('has no served website file that mentions assets/images/catalog', () => {
    // Test files are not served; this file names the path it checks for.
    const hits = [...publicFiles, ...srcFiles]
      .filter((f) => TEXT_FILE.test(f) && !/\.test\.[cm]?[jt]sx?$/.test(f))
      .filter((f) => readFileSync(f, 'utf8').includes(CATALOG_PATH))
      .map((f) => relative(join(SRC_DIR, '..'), f).split(sep).join('/'));
    expect(hits).toEqual([]);
  });
});
