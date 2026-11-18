import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BOARD_SIZES, BUILD_COLORS, DEFAULT_BOARD_SIZE, DEFAULT_COLORS, PEOPLE, buildColorAt } from './build-together';
import { PATTERN_COLORS } from './pattern-maker';

describe('the four colors', () => {
  it('are the four colors of Pattern maker, so the games cannot drift apart', () => {
    expect(BUILD_COLORS).toBe(PATTERN_COLORS);
    expect(BUILD_COLORS).toHaveLength(4);
    expect(BUILD_COLORS.map((c) => c.index)).toEqual([0, 1, 2, 3]);
  });

  it('each have a shape of their own, so color is never the only signal', () => {
    expect(new Set(BUILD_COLORS.map((c) => c.shape)).size).toBe(4);
    for (const color of BUILD_COLORS) expect(buildColorAt(color.index)).toBe(color);
  });
});

describe('the grid and the people', () => {
  it('offers 3 by 3 and 4 by 4, with 4 by 4 to start', () => {
    expect(BOARD_SIZES).toEqual([3, 4]);
    expect(DEFAULT_BOARD_SIZE).toBe(4);
  });

  it('has two people, who start with two different colors', () => {
    expect(PEOPLE).toEqual([0, 1]);
    expect(DEFAULT_COLORS[0]).not.toBe(DEFAULT_COLORS[1]);
    for (const c of DEFAULT_COLORS) expect(BUILD_COLORS.some((b) => b.index === c)).toBe(true);
  });
});

describe('the stylesheet', () => {
  const css = readFileSync(new URL('../styles/games.css', import.meta.url), 'utf8');

  it('draws each color and its shape ink with the hex values in the data file', () => {
    for (const color of BUILD_COLORS) {
      const rule = css.match(new RegExp(`\\.bt \\[data-tone='${color.index}'\\],\\s*\\.bt-sheet \\[data-tone='${color.index}'\\] \\{([^}]*)\\}`));
      expect(rule, `a rule for color ${color.index}`).not.toBeNull();
      expect(rule?.[1]).toContain(`--bt-fill: ${color.hex.toLowerCase()};`);
      expect(rule?.[1]).toContain(`--bt-ink: ${color.ink.toLowerCase()};`);
    }
  });

  it('sets the column count for each grid size, on the screen and on paper', () => {
    for (const size of BOARD_SIZES) {
      expect(css).toMatch(new RegExp(`\\.bt__grid\\[data-size='${size}'\\] \\{[^}]*--bt-n: ${size};`));
      expect(css).toMatch(new RegExp(`\\.bt-sheet__grid\\[data-size='${size}'\\] \\{\\s*--bt-across: ${size};`));
    }
  });

  it('keeps every place at least 56px, and scrolls the grid rather than shrinking it', () => {
    expect(css).toMatch(/\.bt__grid \{[^}]*--bt-floor: 56px;/);
    expect(css).toMatch(/--bt-cell: max\(var\(--bt-floor\),/);
    expect(css).toMatch(/\.bt__region \{[^}]*overflow-x: auto;/);
    expect(css).toMatch(/\.bt__face \{[^}]*min-block-size: 56px;/);
  });

  it('animates nothing but a shadow, uses no pixel font sizes and no physical left or right properties', () => {
    const block = css.slice(css.indexOf('/* Build together:'), css.indexOf('/* Story chain'));

    expect(block.length).toBeGreaterThan(1000);
    expect(block.match(/transition: [^;]+;/g)).toEqual(['transition: box-shadow var(--duration-fast) ease;']);
    expect(block).not.toMatch(/font-size: \d+px/);
    expect(block).not.toMatch(/\b(margin|padding|border)-(left|right)\b|\b(left|right):/);
  });

  it('tells a filled place from an empty one by its edge and its shape as well as by color', () => {
    expect(css).toMatch(/\.bt__cell\[data-state='empty'\] \{\s*border-style: dashed;/);
    expect(css).toMatch(/\.bt__pick\[data-in-use='yes'\] \.bt__face \{\s*border-style: dashed;/);
  });

  it('adapts to high contrast and to forced colors', () => {
    expect(css).toMatch(/prefers-contrast: more\) \{[^@]*\.bt__cell \{\s*border-width: 3px;\s*border-color: #000000;/);
    expect(css).toMatch(/forced-colors: active\) \{[^@]*\.bt__cell\[data-state='empty'\]:hover,/);
  });

  it('uses the design tokens for surfaces, text and outlines, not new colors', () => {
    const block = css.slice(css.indexOf('/* Build together:'), css.indexOf('/* Story chain'));
    const hexes = [...block.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0].toLowerCase());
    // Only the four fills and inks, and black, white and the print blacks.
    const allowed = new Set(['#000', '#fff', ...BUILD_COLORS.flatMap((c) => [c.hex.toLowerCase(), c.ink.toLowerCase()])]);
    expect(hexes.filter((h) => !allowed.has(h))).toEqual([]);
    expect(block).toContain('var(--gm-on-surface)');
    expect(block).toContain('var(--gm-outline)');
  });
});
