import { describe, expect, it } from 'vitest';
import { MATCH_COLORS, colorOfPicture } from './color-match';
import { PICTURES, PICTURE_BY_ID } from './pictures';
import { FAMILY_RANGES, dominantFamily, familyOf, hexToHsl, isNeutral } from './svg-dominant';
import en from '../i18n/play/en.json';

/**
 * Proof that the hand-picked Color match table (src/data/color-match.ts) is
 * right. For every listed picture, the dominant non-background, non-outline,
 * non-shade fill color is read from its SVG source and its hue must fall in the
 * range of the color it is listed under.
 *
 * Hue ranges, in degrees (see FAMILY_RANGES in svg-dominant.ts). A fill must
 * also be saturated enough and neither too dark nor too pale to count, so brown,
 * tan, pink, purple and pastel tints are "other" and never pass as a color:
 *   red     345 to 13    (saturation 0.50 or more, lightness 0.30 to 0.65)
 *   orange   13 to 37    (saturation 0.70 or more, lightness 0.35 to 0.70)
 *   yellow   37 to 65    (saturation 0.70 or more, lightness 0.30 to 0.80)
 *   green    65 to 170   (saturation 0.30 or more, lightness 0.30 to 0.75)
 *   blue    190 to 250   (saturation 0.30 or more, lightness 0.30 to 0.75)
 * Ignored as neutral: the outline and shade ink, the five mounted-print
 * grounds, white and cream, grey, and anything almost black or white.
 *
 * "Dominant" is estimated from shape bounding boxes (see svg-dominant.ts). The
 * picture must also be clearly one color: its family needs at least 1,500 of
 * the 14,400 square units of the picture and more than half of all its colored
 * fill area, so a white hen with a small red comb or a multi-colored kite fails.
 */
const MIN_AREA = 1500;
const MIN_SHARE = 0.55;

const byId = new Map(PICTURES.map((p) => [p.id, p]));
const listed = MATCH_COLORS.flatMap((c) => c.pictures.map((id) => ({ id, color: c.id })));

describe('color match table', () => {
  it('lists the five colors, each with at least five pictures', () => {
    expect(MATCH_COLORS.map((c) => c.id)).toEqual(['red', 'orange', 'yellow', 'green', 'blue']);
    for (const c of MATCH_COLORS) expect(c.pictures.length, c.id).toBeGreaterThanOrEqual(5);
  });

  it('lists only pictures that exist in the shared library', () => {
    for (const { id } of listed) {
      expect(byId.has(id), id).toBe(true);
      expect(PICTURE_BY_ID.has(id), id).toBe(true);
    }
  });

  it('puts no picture under two colors, or twice under one', () => {
    const ids = listed.map((l) => l.id);
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
    for (const { id, color } of listed) expect(colorOfPicture(id), id).toBe(color);
  });

  it('names every color in plain words in English', () => {
    const names = en.ui.colorMatch.names as Record<string, string>;
    expect(Object.keys(names).sort()).toEqual(MATCH_COLORS.map((c) => c.id).sort());
    for (const name of Object.values(names)) expect(name).toMatch(/^[A-Z][a-z]+$/);
  });

  describe('each listed picture is its color, read from its SVG fills', () => {
    for (const { id, color } of listed) {
      it(`${id} is ${color}`, () => {
        const dominant = dominantFamily(byId.get(id)?.body ?? '');
        expect(dominant, `${id} has a colored fill`).not.toBeNull();
        expect(dominant?.family, `${id} dominant family`).toBe(color);
        expect(dominant?.area ?? 0, `${id} dominant area`).toBeGreaterThanOrEqual(MIN_AREA);
        expect(dominant?.share ?? 0, `${id} dominant share`).toBeGreaterThanOrEqual(MIN_SHARE);
      });
    }
  });

  it('has the hue of each dominant fill inside the documented range of its color', () => {
    const inRange = (h: number, [from, to]: readonly [number, number]) => (from <= to ? h >= from && h < to : h >= from || h < to);
    for (const { id, color } of listed) {
      const dominant = dominantFamily(byId.get(id)?.body ?? '');
      const { h } = hexToHsl(dominant?.hex ?? '#000000');
      expect(inRange(h, FAMILY_RANGES[color].hue), `${id}: ${dominant?.hex} has hue ${Math.round(h)}, listed as ${color}`).toBe(true);
    }
  });
});

describe('the color reader catches what it should', () => {
  it('tells the five colors apart and files brown, tan, pink and purple as other', () => {
    expect(familyOf('#C8473A')).toBe('red');
    expect(familyOf('#E07B28')).toBe('orange');
    expect(familyOf('#F2D03B')).toBe('yellow');
    expect(familyOf('#4E8A3E')).toBe('green');
    expect(familyOf('#2F6F9E')).toBe('blue');
    for (const other of ['#8A5A2B', '#D9A15B', '#E58FA0', '#7B4A8C', '#C8C8C8']) expect(familyOf(other), other).toBe('other');
  });

  it('ignores outline, shade, ground, white and grey', () => {
    for (const neutral of ['#2b2b2b', '#F9E7C3', '#DCEBF2', '#FFFDF7', '#FFFFFF', '#8C8C8C']) expect(isNeutral(neutral), neutral).toBe(true);
    expect(isNeutral('#C8473A')).toBe(false);
  });

  it('refuses a picture that is several colors or mostly one small color', () => {
    const kite = dominantFamily(byId.get('kite')?.body ?? '');
    expect(kite?.share ?? 1).toBeLessThan(MIN_SHARE);
    const hen = dominantFamily(byId.get('hen')?.body ?? '');
    expect(hen?.area ?? 0).toBeLessThan(MIN_AREA);
    const sailboat = dominantFamily(byId.get('sailboat')?.body ?? '');
    expect(sailboat?.share ?? 1).toBeLessThan(MIN_SHARE);
  });

  it('would fail a picture listed under the wrong color', () => {
    expect(dominantFamily(byId.get('pear')?.body ?? '')?.family).not.toBe('yellow');
    expect(dominantFamily(byId.get('apple')?.body ?? '')?.family).not.toBe('green');
  });
});
