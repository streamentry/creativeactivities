/**
 * The transparency set (TSA-048): the pages that say who runs the site, how
 * content is checked, how data is handled and how to complain. Each one is
 * linked from the footer on every page and carries a date.
 */
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const pagesDir = new URL('../pages/', import.meta.url);
const read = (file: string) => readFileSync(new URL(file, pagesDir), 'utf8');

/** Path on the site and the source file that serves it. */
const TRANSPARENCY_SET = [
  { path: '/about/', file: 'about.astro' },
  { path: '/editorial-policy/', file: 'editorial-policy.astro' },
  { path: '/corrections/', file: 'corrections.astro' },
  { path: '/safety/', file: 'safety.astro' },
  { path: '/accessibility/', file: 'accessibility.astro' },
  { path: '/privacy/', file: 'privacy.astro' },
  { path: '/your-data/', file: 'your-data.astro' },
  { path: '/terms/', file: 'terms.astro' },
  { path: '/support/', file: 'support.astro' },
] as const;

describe('transparency set (TSA-048)', () => {
  const footer = readFileSync(new URL('../components/Footer.astro', import.meta.url), 'utf8');

  it.each(TRANSPARENCY_SET)('$path exists and is linked from the footer', ({ path, file }) => {
    expect(existsSync(new URL(file, pagesDir))).toBe(true);
    expect(footer).toContain(`'${path}'`);
  });

  it('puts the set in its own footer column', () => {
    expect(footer).toMatch(/title: f\.transparency/);
  });

  // Pages still without their own date. Each is a gap in TSA-033 (dated and
  // reviewed) and must get a date when a maintainer reviews it; then remove it here.
  const UNDATED_UNTIL_REVIEWED = new Set(['support.astro', 'corrections.astro']);

  it.each(TRANSPARENCY_SET.filter((p) => !UNDATED_UNTIL_REVIEWED.has(p.file)))('$path is dated', ({ file }) => {
    expect(read(file)).toMatch(/updated=|ProseView/);
  });

  it('lists the pages still undated, so the gap stays visible', () => {
    const undated = TRANSPARENCY_SET.filter((p) => !/updated=|ProseView/.test(read(p.file))).map((p) => p.file);
    expect(undated.sort()).toEqual([...UNDATED_UNTIL_REVIEWED].sort());
  });
});
