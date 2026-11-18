import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LARGE_BASKET_COUNT, LARGE_BASKET_SHARE, LARGE_GAP_PX, LARGE_PICTURE_PX, needsNewRound, visibleBaskets } from './large-targets';

describe('visibleBaskets', () => {
  it('shows every basket when the option is off', () => {
    expect(visibleBaskets(['a', 'b', 'c'], false)).toEqual(['a', 'b', 'c']);
    expect(visibleBaskets(['a', 'b'], false)).toEqual(['a', 'b']);
  });

  it('shows exactly two baskets when the option is on, even if there would be more', () => {
    expect(visibleBaskets(['a', 'b', 'c', 'd'], true)).toEqual(['a', 'b']);
    expect(visibleBaskets(['a', 'b'], true)).toEqual(['a', 'b']);
    expect(visibleBaskets([], true)).toEqual([]);
  });

  it('does not change the list it is given', () => {
    const baskets = ['a', 'b', 'c'];
    visibleBaskets(baskets, true);
    expect(baskets).toEqual(['a', 'b', 'c']);
  });
});

describe('needsNewRound', () => {
  it('keeps the round for two baskets, in either direction', () => {
    expect(needsNewRound(2, true)).toBe(false);
    expect(needsNewRound(2, false)).toBe(false);
  });

  it('begins a new round only when turning it on hides a basket in use', () => {
    expect(needsNewRound(3, true)).toBe(true);
    expect(needsNewRound(4, true)).toBe(true);
  });

  it('keeps the round when turning it off, since nothing is hidden by that', () => {
    expect(needsNewRound(3, false)).toBe(false);
  });
});

/** The rules for the larger layout, read from the stylesheet so a later edit cannot quietly shrink a target. */
const css = readFileSync(new URL('../../styles/games.css', import.meta.url), 'utf8');
const ruleFor = (selector: string): string => {
  const start = css.indexOf(`\n${selector} {`);
  expect(start, `${selector} rule`).toBeGreaterThan(-1);
  return css.slice(start, css.indexOf('}', start));
};

describe('larger targets stylesheet', () => {
  const large = ['.baskets--large', '.basket--large', '.board--large', '.board--large .tile', '.basket--large .basket__items', '.basket--large .basket__items img'];
  const spacing = (name: string) => Number(new RegExp(`--space-${name}: (\\d+)px`).exec(readFileSync(new URL('../../styles/tokens.css', import.meta.url), 'utf8'))?.[1]);

  it('uses tokens only, with no hard-coded color', () => {
    for (const selector of large) expect(ruleFor(selector), selector).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(|hsl\(|\b(?:black|white)\b/i);
  });

  it('draws every edge in the darkest ink token', () => {
    for (const selector of ['.basket--large', '.board--large .tile', '.basket--large .basket__items img']) {
      expect(ruleFor(selector), selector).toContain('border: ');
      expect(ruleFor(selector), selector).toContain('solid var(--gm-on-surface)');
    }
  });

  it('draws pictures at least the large size, in the board and in the baskets', () => {
    expect(LARGE_PICTURE_PX).toBeGreaterThanOrEqual(96);
    expect(ruleFor('.board--large')).toContain('--tile-min: 96px');
    expect(ruleFor('.basket--large .basket__items img')).toMatch(/width: 96px;[\s\S]*height: 96px;/);
  });

  it('spaces targets at least 16px apart with a token that is that wide', () => {
    expect(spacing('md')).toBeGreaterThanOrEqual(LARGE_GAP_PX);
    expect(spacing('lg')).toBeGreaterThanOrEqual(LARGE_GAP_PX);
    expect(ruleFor('.baskets--large')).toMatch(/gap: var\(--space-(md|lg|xl)\);/);
    expect(ruleFor('.board--large')).toMatch(/gap: var\(--space-(md|lg|xl)\);/);
    expect(ruleFor('.basket--large .basket__items')).toMatch(/gap: var\(--space-(md|lg|xl)\);/);
  });

  it('puts two baskets in two equal columns, which is at least 40% of the board each', () => {
    expect(LARGE_BASKET_COUNT).toBe(2);
    // Two equal columns with a gap of at most 24px share the width at about 48% each on a 320px phone.
    expect(1 / LARGE_BASKET_COUNT).toBeGreaterThan(LARGE_BASKET_SHARE);
    expect(ruleFor('.baskets--large')).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))');
  });

  it('keeps two columns at large text on a phone', () => {
    expect(css).toMatch(/html\[data-text-size='large'\] \.baskets--large \{\s*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
  });
});
