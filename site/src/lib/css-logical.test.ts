import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/*
 * L10N-016: layout must follow reading direction, so right-to-left scripts
 * mirror correctly. Physical left/right declarations are banned in site CSS
 * and in <style> blocks or style attributes of .astro files. Use the logical
 * properties instead (margin-inline-start, padding-inline-end,
 * inset-inline-start, text-align: start, border-inline-start, ...).
 */

const SRC = fileURLToPath(new URL('../', import.meta.url));

const PHYSICAL: RegExp[] = [
  // margin-left, padding-right, border-left, border-left-color/width/style, ...
  /(?<![\w-])(?:margin|padding|border)-(?:left|right)(?:-(?:color|width|style))?\s*:/,
  // Offsets: left: 0, right: 50%
  /(?<![\w-])(?:left|right)\s*:/,
  /text-align\s*:\s*(?:left|right)\b/,
  /(?<![\w-])float\s*:\s*(?:left|right)\b/,
];

/** Physical declarations in a stylesheet fragment, comments removed. */
export function physicalDeclarations(css: string): string[] {
  const bare = css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  return bare
    .split(/[;{}\n]/)
    .map((d) => d.trim().replace(/\s+/g, ' '))
    .filter((d) => d.length > 0 && PHYSICAL.some((re) => re.test(d)));
}

/**
 * Intentionally physical declarations. Each entry must name the file, the
 * declaration exactly as written and why direction does not apply. A stale
 * entry fails the test, so the list cannot quietly grow.
 */
const ALLOWLIST: { file: string; declaration: string; reason: string }[] = [
  {
    file: 'styles/studio-home.css',
    declaration: 'left: 50%',
    reason: 'Centers the washi tape with translateX(-50%); centering is the same in both directions, and inset-inline-start would push it off center on a right-to-left page.',
  },
];

function styleFiles(): string[] {
  return readdirSync(SRC, { recursive: true })
    .map(String)
    .filter((f) => f.endsWith('.css') || f.endsWith('.astro'))
    .sort();
}

/** The CSS in a file: the whole stylesheet, or <style> blocks and style attributes in .astro. */
function cssFragments(file: string, text: string): string[] {
  if (file.endsWith('.css')) return [text];
  const blocks = [...text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1] ?? '');
  const attributes = [...text.matchAll(/\sstyle="([^"]*)"/g)].map((m) => m[1] ?? '');
  return [...blocks, ...attributes];
}

function siteViolations(): { file: string; declaration: string }[] {
  const found: { file: string; declaration: string }[] = [];
  for (const file of styleFiles()) {
    const text = readFileSync(join(SRC, file), 'utf8');
    for (const fragment of cssFragments(file, text)) {
      for (const declaration of physicalDeclarations(fragment)) found.push({ file, declaration });
    }
  }
  return found;
}

describe('physical direction detector', () => {
  it('flags physical left and right declarations', () => {
    expect(physicalDeclarations('.a { margin-left: 1px; }')).toEqual(['margin-left: 1px']);
    expect(physicalDeclarations('.a { padding-right: 2px; }')).toEqual(['padding-right: 2px']);
    expect(physicalDeclarations('.a { border-left: 4px solid red; }')).toEqual(['border-left: 4px solid red']);
    expect(physicalDeclarations('.a { border-right-width: 2px; }')).toEqual(['border-right-width: 2px']);
    expect(physicalDeclarations('.a { left: 0; }')).toEqual(['left: 0']);
    expect(physicalDeclarations('.a { text-align: right; }')).toEqual(['text-align: right']);
    expect(physicalDeclarations('.a { float: left; }')).toEqual(['float: left']);
  });

  it('accepts logical properties and ignores comments and custom property names', () => {
    const css = `
      /* left: 5px was the old offset */
      .a {
        margin-inline-start: 1px;
        padding-inline-end: 2px;
        border-inline-start: 4px solid red;
        inset-inline-start: 0;
        text-align: start;
        --space-left: 4px;
      }`;
    expect(physicalDeclarations(css)).toEqual([]);
  });
});

describe('site CSS uses logical direction properties (L10N-016)', () => {
  it('has no physical left/right declarations outside the allowlist', () => {
    const allowed = new Set(ALLOWLIST.map((a) => `${a.file} ${a.declaration}`));
    const unexpected = siteViolations().filter((v) => !allowed.has(`${v.file} ${v.declaration}`));
    expect(unexpected).toEqual([]);
  });

  it('keeps every allowlist entry justified and still in use', () => {
    const present = new Set(siteViolations().map((v) => `${v.file} ${v.declaration}`));
    for (const entry of ALLOWLIST) {
      expect(entry.reason.trim().length, `${entry.file}: ${entry.declaration}`).toBeGreaterThan(0);
      expect(present.has(`${entry.file} ${entry.declaration}`), `stale: ${entry.file} ${entry.declaration}`).toBe(true);
    }
  });
});
