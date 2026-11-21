/**
 * WEB-042: the dark theme must meet WCAG AA on every pairing the site uses, and
 * it may only use colors already in the light palette. The values are read from
 * src/styles/tokens.css, so a change there is tested here.
 *
 * "dark" is the device or reader's dark choice alone. "dark + high contrast" is
 * the same page with the higher-contrast tokens, which are declared later and
 * win whatever the theme. Both must pass.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type Tokens = Record<string, string>;
type Mode = 'light' | 'light+high' | 'dark' | 'dark+high';

const css = readFileSync(new URL('../styles/tokens.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

/** Declarations of the rule whose selector is exactly `selector` (comments removed). */
function block(selector: string): Tokens {
  const out: Tokens = {};
  const re = /([^{}]+)\{([^{}]*)\}/g;
  for (const m of css.matchAll(re)) {
    if (m[1].trim() !== selector) continue;
    for (const d of m[2].matchAll(/(--[\w-]+|color-scheme)\s*:\s*([^;]+);/g)) out[d[1]] = d[2].trim().toLowerCase();
  }
  return out;
}

const ROOT = block(':root');
const DARK_DEVICE = block("html:not([data-theme='light'])");
const DARK_CHOSEN = block("html[data-theme='dark']");
const HIGH = block("html[data-contrast='high']");

/** Resolves var(--x) references against the same merged set. */
function resolve(tokens: Tokens, value: string): string {
  const v = value.match(/^var\((--[\w-]+)\)$/);
  return v && tokens[v[1]] ? resolve(tokens, tokens[v[1]]) : value;
}

/** The effective tokens for a theme: light, then the dark block, then (optionally) high contrast. */
function effective(mode: Mode): Tokens {
  const merged: Tokens = mode.startsWith('dark') ? { ...ROOT, ...DARK_DEVICE } : { ...ROOT };
  if (mode.endsWith('+high')) Object.assign(merged, HIGH);
  const out: Tokens = {};
  for (const key of Object.keys(merged)) out[key] = resolve(merged, merged[key]);
  return out;
}

function luminance(hex: string): number {
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  if (!m) throw new Error(`not a hex color: ${hex}`);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Each pairing the site uses: the text (or border) token, the background token, and the minimum ratio. */
const PAIRS: [string, string, string, number][] = [
  ['body text', '--gm-on-surface', '--gm-background', 4.5],
  ['muted text', '--gm-on-surface-variant', '--gm-background', 4.5],
  ['text on card', '--gm-on-surface', '--gm-surface', 4.5],
  ['muted text on card', '--gm-on-surface-variant', '--gm-surface', 4.5],
  ['text on well', '--gm-on-surface', '--gm-surface-sunken', 4.5],
  ['link on page', '--gm-primary', '--gm-background', 4.5],
  ['link on card', '--gm-primary', '--gm-surface', 4.5],
  ['button text on primary fill', '--gm-on-primary', '--gm-primary', 4.5],
  ['button text on pressed fill', '--gm-on-primary', '--gm-primary-deep', 4.5],
  ['information text', '--gm-secondary', '--gm-background', 4.5],
  ['secondary button text', '--gm-on-secondary', '--gm-secondary', 4.5],
  ['notice text', '--gm-on-surface', '--gm-secondary-container', 4.5],
  ['text on decorative fill', '--gm-on-surface', '--gm-accent-pale', 4.5],
  ['selection text', '--gm-on-primary-container', '--gm-primary-container', 4.5],
  ['text on printed-style tile', '--gm-on-print', '--gm-print-white', 4.5],
  ['footer text', '--gm-on-ink', '--gm-footer', 4.5],
  ['footer link', '--gm-on-ink-link', '--gm-footer', 4.5],
  ['footer muted text', '--gm-on-ink-variant', '--gm-footer', 4.5],
  ['error text on page', '--gm-error', '--gm-background', 4.5],
  ['error text on card', '--gm-error', '--gm-surface', 4.5],
  ['success text on page', '--gm-success', '--gm-background', 4.5],
  ['warning text on page', '--gm-warning', '--gm-background', 4.5],
  ['control border on page', '--gm-outline', '--gm-background', 3],
  ['control border on card', '--gm-outline', '--gm-surface', 3],
  ['control border on well', '--gm-outline', '--gm-surface-sunken', 3],
];

describe('dark theme tokens (WEB-042)', () => {
  it('declares the dark values in the device block and the chosen-dark block alike', () => {
    expect(Object.keys(DARK_DEVICE).length).toBeGreaterThan(10);
    expect(DARK_CHOSEN).toEqual(DARK_DEVICE);
  });

  it('uses only colors already in the light palette (no new hex values)', () => {
    const palette = new Set(Object.values(ROOT).map((v) => v.toLowerCase()));
    for (const [name, value] of Object.entries(DARK_DEVICE)) {
      if (!value.startsWith('#')) continue;
      expect(palette.has(value), `${name} ${value} is not a light palette color`).toBe(true);
    }
  });

  it('keeps the print tile white in dark mode, so printed-style pictures stay light', () => {
    expect(DARK_DEVICE['--gm-print-white']).toBe('#ffffff');
  });
});

/**
 * TSA-004 (WCAG 1.4.11): every focus ring must reach 3:1 against the surface it sits on.
 * Most rings are drawn outside the element (outline-offset 2px to 4px), so the background they
 * sit on is the page, card, well or raised surface around it, not the element's own fill (a sun
 * button keeps the primary ring, which is light on dark surfaces in dark mode).
 * - primary (Ink in light, Canvas in dark) and teal (Teal in light, Sun in dark) rings sit on page, card and well;
 * - the puzzle board and word-search cells are print-white in both themes, so the piece ring uses the print text token;
 * - sun is a ring only on the footer band, which is Ink in both themes;
 * - the skip link ring is Ink on the page;
 * - the high-contrast rings are literal black (and white on the black footer).
 * A value starting with '#' is a literal color, not a token.
 */
const FOCUS_PAIRS: [string, string, string][] = [
  ['focus ring on page', '--gm-primary', '--gm-background'],
  ['focus ring on card', '--gm-primary', '--gm-surface'],
  ['focus ring on well', '--gm-primary', '--gm-surface-sunken'],
  ['teal focus ring on page', '--gm-secondary', '--gm-background'],
  ['teal focus ring on card', '--gm-secondary', '--gm-surface'],
  ['teal focus ring on well', '--gm-secondary', '--gm-surface-sunken'],
  ['sun focus ring on footer', '--gm-primary-container', '--gm-footer'],
  ['ink focus ring on print tile (puzzle board)', '--gm-on-print', '--gm-print-white'],
  ['focus ring on raised surface', '--gm-primary', '--gm-surface-raised'],
  ['teal focus ring on raised surface', '--gm-secondary', '--gm-surface-raised'],
  ['skip link ring on page', '--gm-on-surface', '--gm-background'],
];

/** High-contrast rings: literal black (and white on the black footer). Checked in the high-contrast modes only. */
const HIGH_FOCUS_PAIRS: [string, string, string][] = [
  ['black focus ring on page (high contrast)', '#000000', '--gm-background'],
  ['black focus ring on card (high contrast)', '#000000', '--gm-surface'],
  ['black focus ring on well (high contrast)', '#000000', '--gm-surface-sunken'],
  ['black focus ring on sun fill (high contrast)', '#000000', '--gm-primary-container'],
  ['white focus ring on footer (high contrast)', '#FFFFFF', '--gm-footer'],
];

const MODES: Mode[] = ['light', 'light+high', 'dark', 'dark+high'];

for (const mode of MODES) {
  describe(`meets WCAG AA in ${mode}`, () => {
    const tokens = effective(mode);
    const value = (key: string) => (key.startsWith('#') ? key : tokens[key]);
    for (const [label, fg, bg, min] of PAIRS) {
      it(`${label} (${fg} on ${bg}) is at least ${min}:1`, () => {
        const ratio = contrast(value(fg), value(bg));
        expect(ratio, `${label}: ${value(fg)} on ${value(bg)} = ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(min);
      });
    }
    const focusPairs = mode.endsWith('+high') ? [...FOCUS_PAIRS, ...HIGH_FOCUS_PAIRS] : FOCUS_PAIRS;
    for (const [label, ring, bg] of focusPairs) {
      it(`${label} (${ring} on ${bg}) is at least 3:1 (WCAG 1.4.11)`, () => {
        const ratio = contrast(value(ring), value(bg));
        expect(ratio, `${label}: ${value(ring)} on ${value(bg)} = ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(3);
      });
    }
  });
}
