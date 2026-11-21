/**
 * TSA-005 (WCAG 1.4.3 and 1.4.11): every rule that paints text and a background with design tokens must meet
 * its contrast minimum in every theme the site ships. theme-contrast.test.ts checks a hand-written list of
 * pairs; this file complements it by reading the stylesheets themselves, so a pair added to a component
 * is tested without anyone editing a list.
 *
 * Scope: each CSS rule (in src/styles/*.css and in the <style> blocks of .astro files) that sets both a
 * text `color` and a `background` or `background-color` to a design token (var(--gm-...)), to a color-mix() of
 * two tokens (evaluated in sRGB, as the browser does), or to literal black or white inside
 * @media (prefers-contrast: more), where the colors are fixed on purpose in every theme.
 * Rules outside that scope are counted, not checked, so the report can say what was left out:
 * - rules inside @media print (print is black on white, DESIGN.md);
 * - system colors (Canvas, Highlight, ButtonText...) inside @media (forced-colors: active), which the browser
 *   chooses for the reader;
 * - rules that set only one of the two properties;
 * - rules whose color or background is a keyword (none, transparent, inherit), another hardcoded color, a
 *   non-gm variable (for example the per-color game palette, set per element), or an image or gradient.
 *   These are listed by reason in the scan summary.
 *
 * Themes: light, light + high contrast, dark (device or reader choice), dark + high contrast. Tokens are read
 * from src/styles/tokens.css with the same cascade the browser applies: :root, then the dark block, then the
 * high-contrast block.
 *
 * Minimum: 4.5:1 for text. 3:1 only when the rule's font is large (24px or more, or 18.66px or more in bold),
 * which must be visible in the rule itself; otherwise 4.5:1 applies.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type Decl = { prop: string; value: string };
type Rule = { file: string; selector: string; ancestors: string[]; decls: Decl[] };
type Tokens = Record<string, string>;
type Mode = 'light' | 'light+high' | 'dark' | 'dark+high';

// ---------------------------------------------------------------------------
// CSS parsing (comments removed; nested blocks tracked so @media context is known)
// ---------------------------------------------------------------------------

/** Splits a declaration list on semicolons that are outside parentheses and quotes. */
function splitDecls(text: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let quote = '';
  let cur = '';
  for (const ch of text) {
    if (quote) {
      cur += ch;
      if (ch === quote) quote = '';
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ';' && depth === 0) {
      out.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
}

function parseDecls(text: string): Decl[] {
  const decls: Decl[] = [];
  for (const d of splitDecls(text)) {
    const i = d.indexOf(':');
    if (i < 0) continue;
    decls.push({
      prop: d.slice(0, i).trim().toLowerCase(),
      value: d.slice(i + 1).replace(/!important\s*$/i, '').trim(),
    });
  }
  return decls;
}

interface Frame {
  prelude: string;
  ancestors: string[];
  decls: string;
  text: string;
}

/** Returns every innermost block that has a selector, with the at-rules and selectors around it. */
function parseCss(source: string, file: string): Rule[] {
  const css = source.replace(/\/\*[\s\S]*?\*\//g, '');
  const stack: Frame[] = [{ prelude: '', ancestors: [], decls: '', text: '' }];
  const rules: Rule[] = [];
  for (const ch of css) {
    const top = stack[stack.length - 1];
    if (ch === '{') {
      const cut = top.text.lastIndexOf(';');
      top.decls += top.text.slice(0, cut + 1);
      const prelude = top.text.slice(cut + 1).trim();
      top.text = '';
      stack.push({
        prelude,
        ancestors: top.prelude ? [...top.ancestors, top.prelude] : [...top.ancestors],
        decls: '',
        text: '',
      });
    } else if (ch === '}') {
      const frame = stack.pop();
      if (!frame || stack.length === 0) throw new Error(`unbalanced "}" in ${file}`);
      if (!frame.prelude.startsWith('@')) {
        rules.push({ file, selector: frame.prelude, ancestors: frame.ancestors, decls: parseDecls(frame.decls + frame.text) });
      }
    } else {
      top.text += ch;
    }
  }
  if (stack.length !== 1) throw new Error(`unclosed block in ${file}`);
  return rules;
}

/** Every <style> block in an .astro file, as CSS text. */
function astroStyles(source: string): string {
  return [...source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
}

function listFiles(dirUrl: URL, ext: string): string[] {
  return readdirSync(dirUrl, { recursive: true })
    .map(String)
    .filter((f) => f.endsWith(ext))
    .map((f) => new URL(f, dirUrl).pathname);
}

const SRC = new URL('../', import.meta.url);
const tokensPath = new URL('../styles/tokens.css', import.meta.url).pathname;

const sourceFiles = [
  ...listFiles(new URL('styles/', SRC), '.css').map((p) => ({ path: p, css: readFileSync(p, 'utf8') })),
  ...listFiles(SRC, '.astro').map((p) => ({ path: p, css: astroStyles(readFileSync(p, 'utf8')) })),
];

const allRules: Rule[] = sourceFiles.flatMap(({ path, css }) => parseCss(css, path));

// ---------------------------------------------------------------------------
// Tokens per theme
// ---------------------------------------------------------------------------

const tokenRules = parseCss(readFileSync(tokensPath, 'utf8'), tokensPath);
function blockTokens(selector: string): Tokens {
  const out: Tokens = {};
  for (const r of tokenRules) {
    if (r.selector !== selector) continue;
    for (const d of r.decls) if (d.prop.startsWith('--') || d.prop === 'color-scheme') out[d.prop] = d.value.toLowerCase();
  }
  return out;
}
const ROOT = blockTokens(':root');
const DARK = blockTokens("html:not([data-theme='light'])");
const HIGH = blockTokens("html[data-contrast='high']");

function resolveValue(tokens: Tokens, value: string, depth = 0): string {
  const v = /^var\((--[\w-]+)\)$/.exec(value);
  if (!v || depth > 10) return value;
  const next = tokens[v[1]];
  return next === undefined ? value : resolveValue(tokens, next, depth + 1);
}

/** Opaque hex channels of a color, or a throw that names the value. */
function rgbOf(hex: string): number[] {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) throw new Error(`not an opaque hex color: ${hex}`);
  return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
}

/** The hex value of a color reference under one theme's tokens (throws if a token is missing). */
function colorOf(tokens: Tokens, ref: string): string {
  if (ref.startsWith('#')) return ref;
  if (!ref.startsWith('mix:')) {
    const value = tokens[ref];
    if (value === undefined) throw new Error(`token not defined: ${ref}`);
    return value;
  }
  const [, a, pct, b] = ref.split(':');
  const share = parseFloat(pct) / 100;
  const first = rgbOf(colorOf(tokens, a));
  const second = rgbOf(colorOf(tokens, b));
  return '#' + first.map((c, i) => Math.round(share * c + (1 - share) * second[i]).toString(16).padStart(2, '0')).join('');
}

function effective(mode: Mode): Tokens {
  const merged: Tokens = mode.startsWith('dark') ? { ...ROOT, ...DARK } : { ...ROOT };
  if (mode.endsWith('+high')) Object.assign(merged, HIGH);
  const out: Tokens = {};
  for (const key of Object.keys(merged)) out[key] = resolveValue(merged, merged[key]);
  return out;
}

const MODES: Mode[] = ['light', 'light+high', 'dark', 'dark+high'];

function luminance(hex: string): number {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) throw new Error(`not an opaque hex color: ${hex}`);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// ---------------------------------------------------------------------------
// Classifying rules
// ---------------------------------------------------------------------------

const GM_TOKEN = /^var\(\s*(--gm-[\w-]+)\s*(?:,[\s\S]*)?\)$/;
const gmToken = (value: string): string | null => GM_TOKEN.exec(value)?.[1] ?? null;

/** color-mix(in srgb, var(--gm-a) P%, var(--gm-b)) as the reference "mix:--gm-a:P:--gm-b" (P is the first color's share). */
const MIX = /^color-mix\(\s*in srgb,\s*var\(\s*(--gm-[\w-]+)\s*\)\s*(\d+(?:\.\d+)?)%\s*,\s*var\(\s*(--gm-[\w-]+)\s*\)\s*\)$/;
const mixRef = (value: string): string | null => {
  const m = MIX.exec(value);
  return m ? `mix:${m[1]}:${m[2]}:${m[3]}` : null;
};

/** Literal black and white, accepted only inside @media (prefers-contrast: more). */
const FIXED_HEX: Record<string, string> = { '#000': '#000000', '#000000': '#000000', '#fff': '#ffffff', '#ffffff': '#ffffff' };

/** A color the scan can evaluate: a gm token, a color-mix of two gm tokens, or (when fixed) literal black or white. */
function colorRef(value: string, fixed: boolean): string | null {
  const v = value.trim();
  return gmToken(v) ?? mixRef(v) ?? (fixed ? (FIXED_HEX[v.toLowerCase()] ?? null) : null);
}

/** Readable form of a color reference, for test names and the summary. */
const displayRef = (ref: string): string => {
  if (!ref.startsWith('mix:')) return ref;
  const [, a, pct, b] = ref.split(':');
  return `color-mix(${a} ${pct}%, ${b})`;
};

/** Why a color value is not a single gm token (used only for the skip summary). */
function nonTokenReason(value: string): string {
  if (/^(inherit|initial|unset|revert)$/i.test(value)) return 'keyword inherit/initial/unset';
  if (/^(none|transparent)$/i.test(value)) return 'keyword none/transparent';
  if (/currentcolor/i.test(value)) return 'currentColor';
  if (/gradient\(|url\(|image-set\(/i.test(value)) return 'image or gradient';
  if (/color-mix\(/i.test(value)) return 'color-mix()';
  if (/var\(/i.test(value)) return 'non-gm variable';
  if (/^#|rgba?\(|hsla?\(/i.test(value)) return 'hardcoded color';
  if (/^[a-z]+$/i.test(value)) return 'named or system color';
  return 'other value';
}

/** Font size in px, when the rule states one that can be read without the page (tokens use their clamp minimum). */
const TOKEN_PX: Record<string, number> = {
  '--text-sm': 16,
  '--text-md': 18,
  '--text-lg': 20,
  '--text-title-md': 20,
  '--text-title-lg': 24,
  '--text-h2': 26,
  '--text-h1': 34,
  '--text-hero': 38,
};
function fontSizePx(value: string): number | undefined {
  const v = /^var\((--[\w-]+)\)$/.exec(value);
  if (v) return TOKEN_PX[v[1]];
  const c = /^clamp\(\s*([^,]+),/.exec(value);
  const first = (c ? c[1] : value).trim();
  const n = /^(-?[\d.]+)(px|rem)$/.exec(first);
  if (!n) return undefined;
  return parseFloat(n[1]) * (n[2] === 'rem' ? 16 : 1);
}

/** WCAG large text: 24px or more, or 18.66px or more in bold. Otherwise 4.5:1. */
function minimumFor(decls: Decl[]): number {
  const size = [...decls].reverse().find((d) => d.prop === 'font-size');
  const weight = [...decls].reverse().find((d) => d.prop === 'font-weight');
  const px = size ? fontSizePx(size.value) : undefined;
  if (px === undefined) return 4.5;
  const bold = weight !== undefined && (weight.value === 'bold' || parseInt(weight.value, 10) >= 700);
  return px >= 24 || (bold && px >= 18.66) ? 3 : 4.5;
}

interface Pair {
  fg: string;
  bg: string;
  min: number;
  where: string[];
}

const inScope: (Pair & { file: string; selector: string })[] = [];
const skipped = { print: 0, oneSide: 0, forcedSystem: 0 } as Record<string, number>;
const skipReasons = new Map<string, number>();
const skippedRules: string[] = [];
let rulesWithBoth = 0;
const addSkip = (reason: string, rule: Rule) => {
  skipReasons.set(reason, (skipReasons.get(reason) ?? 0) + 1);
  const values = rule.decls.filter((d) => ['color', 'background', 'background-color'].includes(d.prop)).map((d) => `${d.prop}: ${d.value}`);
  const context = rule.ancestors.map((a) => a.replace(/\s+/g, ' ')).join(' > ') || '(top level)';
  skippedRules.push(`${reason} :: ${rule.file.split('/src/')[1]} :: ${rule.selector.slice(0, 80).replace(/\s+/g, ' ')} :: ${values.join('; ')} :: in ${context}`);
};

for (const rule of allRules) {
  const color = [...rule.decls].reverse().find((d) => d.prop === 'color');
  const bg = [...rule.decls].reverse().find((d) => d.prop === 'background' || d.prop === 'background-color');
  if (!color || !bg) {
    skipped.oneSide++;
    continue;
  }
  rulesWithBoth++;
  const printOnly = rule.ancestors.some((a) => /^@media\b/.test(a) && /\bprint\b/.test(a) && !/\bnot\s+print\b/.test(a));
  if (printOnly) {
    skipped.print++;
    continue;
  }
  const fixed = rule.ancestors.some((a) => /prefers-contrast/.test(a));
  const fg = colorRef(color.value, fixed);
  const bgRef = colorRef(bg.value, fixed);
  if (!fg || !bgRef) {
    const side = fg ? bg : color;
    const reason = nonTokenReason(side.value);
    // The browser picks system colors in forced-colors mode; they are correct and are not checked.
    if (reason === 'named or system color' && rule.ancestors.some((a) => /forced-colors/.test(a))) {
      skipped.forcedSystem++;
      continue;
    }
    addSkip(`${fg ? 'background' : 'text color'}: ${reason}`, rule);
    continue;
  }
  inScope.push({ fg, bg: bgRef, min: minimumFor(rule.decls), where: [], file: rule.file, selector: rule.selector });
}

/** One entry per unique (text, background, minimum) pairing, listing the rules that use it. */
const uniquePairs = new Map<string, Pair & { rules: string[] }>();
for (const r of inScope) {
  const key = `${r.fg}|${r.bg}|${r.min}`;
  const entry = uniquePairs.get(key) ?? { fg: r.fg, bg: r.bg, min: r.min, where: [], rules: [] };
  entry.rules.push(`${r.file.split('/src/')[1]} :: ${r.selector.slice(0, 80)}`);
  uniquePairs.set(key, entry);
}

// Compare with the hand-written lists in theme-contrast.test.ts (PAIRS and FOCUS_PAIRS use the same tuple shape).
const handWritten = readFileSync(new URL('./theme-contrast.test.ts', import.meta.url), 'utf8');
const coveredSet = new Set<string>();
for (const m of handWritten.matchAll(/\['[^']+',\s*'(--gm-[\w-]+)',\s*'(--gm-[\w-]+)'/g)) {
  coveredSet.add([m[1], m[2]].sort().join('|'));
}
const enumeratedSet = new Map<string, string>();
for (const p of uniquePairs.values()) enumeratedSet.set([p.fg, p.bg].sort().join('|'), `${displayRef(p.fg)} on ${displayRef(p.bg)}`);
const newPairs = [...enumeratedSet.entries()].filter(([k]) => !coveredSet.has(k)).map(([, v]) => v);

describe('scan of stylesheets (TSA-005)', () => {
  it('finds the rules it is meant to find and reports what it skipped', () => {
    const summary = {
      filesScanned: sourceFiles.length,
      rulesParsed: allRules.length,
      rulesWithColorAndBackground: rulesWithBoth,
      inScopeTokenRules: inScope.length,
      uniqueTokenPairs: uniquePairs.size,
      uniqueTokenPairsNotInHandList: newPairs.length,
      skippedPrint: skipped.print,
      skippedOneSideOnly: skipped.oneSide,
      skippedForcedColorsSystemColors: skipped.forcedSystem,
      inScopeLiteralBlackOrWhite: inScope.filter((r) => r.fg.startsWith('#') || r.bg.startsWith('#')).length,
      skippedByReason: Object.fromEntries([...skipReasons.entries()].sort((a, b) => b[1] - a[1])),
      skippedRules,
      newPairs,
      lowestRatioPerPair: [...uniquePairs.values()].map((pair) => {
        const worst = Math.min(...MODES.map((m) => contrast(colorOf(effective(m), pair.fg), colorOf(effective(m), pair.bg))));
        return `${displayRef(pair.fg)} on ${displayRef(pair.bg)} >= ${pair.min}:1: lowest ${worst.toFixed(2)}:1`;
      }),
      largeTextRules: inScope.filter((r) => r.min === 3).map((r) => `${r.file.split('/src/')[1]} :: ${r.selector.slice(0, 80)}`),
    };
    console.info(`TSA-005 contrast scan: ${JSON.stringify(summary, null, 2)}`);
    // Guards against a parser that silently finds nothing: the sun fill and the ink text pair are used everywhere.
    expect(allRules.length).toBeGreaterThan(300);
    expect(inScope.length).toBeGreaterThan(50);
    expect(uniquePairs.size).toBeGreaterThan(10);
  });
});

for (const mode of MODES) {
  describe(`token pairs from stylesheets meet their minimum in ${mode}`, () => {
    const tokens = effective(mode);
    for (const pair of uniquePairs.values()) {
      const label = `${displayRef(pair.fg)} on ${displayRef(pair.bg)} >= ${pair.min}:1 (${pair.rules.length} rule${pair.rules.length === 1 ? '' : 's'})`;
      it(label, () => {
        const fgValue = colorOf(tokens, pair.fg);
        const bgValue = colorOf(tokens, pair.bg);
        const ratio = contrast(fgValue, bgValue);
        const detail = `${displayRef(pair.fg)} ${fgValue} on ${displayRef(pair.bg)} ${bgValue} = ${ratio.toFixed(2)}:1 in ${mode}; rules:\n  ${pair.rules.join('\n  ')}`;
        expect(ratio, detail).toBeGreaterThanOrEqual(pair.min);
      });
    }
  });
}
