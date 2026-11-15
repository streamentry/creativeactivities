/**
 * TSA-011 and TSA-042: the data and tracker inventory must list everything the
 * code writes or calls. This test scans the website and the app for storage
 * keys, cookies, analytics events and outside origins, and fails when one is
 * missing from docs/specs/global/data-inventory.md. Adding a key or an origin
 * therefore means documenting it, in the same change.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EVENT_DICTIONARY } from './track';

const SITE_SRC = new URL('../', import.meta.url); // site/src/
const REPO = new URL('../../../', import.meta.url); // repository root
const APP_LIB = new URL('lib/', REPO);
const INVENTORY = new URL('docs/specs/global/data-inventory.md', REPO);

function files(dir: URL, keep: (path: string) => boolean): { path: string; text: string }[] {
  const root = dir.pathname;
  const out: { path: string; text: string }[] = [];
  for (const name of readdirSync(root, { recursive: true }) as string[]) {
    const full = join(root, name);
    if (statSync(full).isFile() && keep(relative(root, full))) {
      out.push({ path: relative(REPO.pathname, full), text: readFileSync(full, 'utf8') });
    }
  }
  return out;
}

/** Website source that runs or ships to a visitor's browser. Tests and translated content are excluded. */
const siteSource = files(SITE_SRC, (p) => /\.(ts|tsx|astro)$/.test(p) && !/\.test\.ts$/.test(p) && !p.startsWith('content/'));
/** The Flutter app, excluding its tests. */
const appSource = files(APP_LIB, (p) => p.endsWith('.dart') && !p.endsWith('_test.dart'));
const inventory = readFileSync(INVENTORY, 'utf8');

/** Every page of the inventory names an item in backticks, so a quoted name is the proof it is listed. */
const listed = (name: string) => inventory.includes(`\`${name}\``);

/** Storage keys written by the website: named constants ending in KEY, and the language cookie. */
function siteStorageKeys(): Set<string> {
  const keys = new Set<string>();
  for (const { text } of siteSource) {
    // A storage key is a short lowercase name; a longer list of words is not one.
    for (const m of text.matchAll(/(?:const|let)\s+([A-Z][A-Z_]*KEY|LANGUAGE_COOKIE)\s*=\s*'([a-z][a-z0-9._-]*)'/g)) keys.add(m[2] as string);
  }
  return keys;
}

/** Keys the app passes to SharedPreferences: constants named like keys in files that use it. */
function appStorageKeys(): Set<string> {
  const keys = new Set<string>();
  for (const { text } of appSource) {
    if (!/shared_preferences|SharedPreferences/.test(text)) continue;
    for (const m of text.matchAll(/(?:const|final)\s+(?:String\s+)?(\w+)\s*=\s*'([^']+)'/g)) {
      if (/key|prefix|storage/i.test(m[1] as string)) keys.add(m[2] as string);
    }
  }
  return keys;
}

/** Outside origins named in code, minus the ones that only appear in scripts or namespaces. */
function origins(sources: { text: string }[]): Set<string> {
  const found = new Set<string>();
  for (const { text } of sources) {
    for (const m of text.matchAll(/https?:\/\/[^\s'"`)<>{}\\$]+/g)) {
      found.add((m[0].match(/^https?:\/\/[^/]+/) as RegExpMatchArray)[0]);
    }
  }
  return found;
}

describe('data and tracker inventory (TSA-011)', () => {
  it('lists every website storage key', () => {
    const keys = siteStorageKeys();
    expect(keys.size).toBeGreaterThan(0);
    for (const key of keys) expect(listed(key), `storage key ${key}`).toBe(true);
  });

  it('lists every app storage key', () => {
    const keys = appStorageKeys();
    expect(keys.size).toBeGreaterThan(0);
    for (const key of keys) expect(listed(key), `app storage key ${key}`).toBe(true);
  });

  it('lists the only cookie the site writes in code, and the files that write it', () => {
    const writers = siteSource.filter((f) => /document\.cookie\s*=/.test(f.text)).map((f) => f.path.replace(/^site\/src\//, ''));
    expect(writers.sort()).toEqual(['components/LanguageChoice.astro', 'pages/your-data.astro'].sort());
    expect(listed('gm_lang')).toBe(true);
  });

  it('lists every analytics event the site can send', () => {
    for (const event of Object.keys(EVENT_DICTIONARY)) expect(listed(event), `event ${event}`).toBe(true);
  });

  it('lists every outside origin named in website or app code', () => {
    const all = origins([...siteSource, ...appSource]);
    expect(all.size).toBeGreaterThan(0);
    for (const origin of all) expect(listed(origin), `origin ${origin}`).toBe(true);
  });

  it('records the analytics vendor as an open maintainer decision', () => {
    expect(inventory).toMatch(/open maintainer decision/i);
    expect(inventory).toContain('GTM-5ZSV72WC');
  });
});

describe('third-party assets (TSA-042)', () => {
  /** External assets that cannot carry SRI, with the reason. Keep this list short. */
  const NO_SRI: Record<string, string> = {
    'components/Analytics.astro': 'Google Tag Manager loader: Google changes gtm.js per container, so no fixed hash exists.',
  };

  it('gives every external script or stylesheet an integrity attribute, or a documented reason', () => {
    for (const { path, text } of siteSource) {
      const tags = [...text.matchAll(/<(script|link)\b[^>]*>/g)].map((m) => m[0]);
      for (const tag of tags) {
        const external = /\s(src|href)=["']https?:\/\//.test(tag);
        if (!external) continue;
        const file = path.replace(/^site\/src\//, '');
        const hasSri = /\sintegrity=/.test(tag);
        expect(hasSri || Object.hasOwn(NO_SRI, file), `${path}: ${tag}`).toBe(true);
      }
    }
  });

  it('loads no stylesheet, font or CSS import from another origin', () => {
    for (const { path, text } of siteSource) {
      expect(/url\(\s*['"]?https?:\/\//.test(text), path).toBe(false);
      expect(/@import\s+(url\()?['"]?https?:\/\//.test(text), path).toBe(false);
      expect(/fonts\.(googleapis|gstatic)\.com/.test(text), path).toBe(false);
    }
  });
});
