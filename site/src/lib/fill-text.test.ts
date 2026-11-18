import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * The sun fill (`--gm-primary-container`) is a fill behind dark text (DESIGN.md). In the dark theme the
 * inherited text color is light, so a rule that paints the fill must also set its paired text color, or
 * the text turns light on yellow (found on the current nav item when WEB-042 added the dark theme).
 */
const inDir = (dir: string, ext: string) =>
  readdirSync(new URL(dir, import.meta.url), { recursive: true })
    .map(String)
    .filter((f) => f.endsWith(ext))
    .map((f) => new URL(`${dir}${f}`, import.meta.url));
// Styles, components, views and pages: a sun fill set in a view's own <style> counts too (the path pill was one).
const files = [...inDir('../styles/', '.css'), ...inDir('../components/', '.astro'), ...inDir('../views/', '.astro'), ...inDir('../pages/', '.astro')];

describe('sun fill always comes with dark text (WEB-042)', () => {
  it('sets a text color in every rule that paints --gm-primary-container', () => {
    const offenders: string[] = [];
    for (const file of files) {
      const css = readFileSync(file, 'utf8');
      for (const m of css.matchAll(/([^{}]+)\{([^{}]*background(?:-color)?:\s*var\(--gm-primary-container\)[^{}]*)\}/g)) {
        const body = m[2].replace(/background(?:-color)?:/g, '');
        if (!/(^|[\s;])color:/.test(body)) offenders.push(`${file.pathname.split('/').pop()}: ${m[1].trim().slice(-60)}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
