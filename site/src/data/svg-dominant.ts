/**
 * Dominant fill colour of a picture, read from its SVG source. Used only by
 * `color-match.test.ts` to prove the hand-curated Color match table; nothing
 * on the site imports it.
 *
 * An estimate, not a renderer: each filled shape counts for the area of its
 * bounding box (circle, ellipse, rect, or the box around a path's points).
 * Transforms are ignored. That is enough to tell a red apple from a green one
 * and to flag a picture with no clearly larger colour.
 */
import { BG, INK } from './picture-art/kit';

export interface Hsl {
  /** Degrees, 0 to 360. */
  h: number;
  /** 0 to 1. */
  s: number;
  /** 0 to 1. */
  l: number;
}

export function hexToHsl(hex: string): Hsl {
  const full = hex.length === 4 ? `#${[...hex.slice(1)].map((c) => c + c).join('')}` : hex;
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(full.slice(i, i + 2), 16) / 255) as [number, number, number];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s, l };
}

interface Box {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

const COMMAND_ARGS: Record<string, number> = { m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2, a: 7, z: 0 };

/** The box around every point a path visits, control points included. */
function pathBox(d: string): Box | null {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  const box: Box = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  const add = (x: number, y: number) => {
    box.minX = Math.min(box.minX, x);
    box.maxX = Math.max(box.maxX, x);
    box.minY = Math.min(box.minY, y);
    box.maxY = Math.max(box.maxY, y);
  };
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;
  let command = 'm';
  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i] as string;
    if (/[a-zA-Z]/.test(token)) {
      command = token;
      i += 1;
      if (command.toLowerCase() === 'z') {
        x = startX;
        y = startY;
      }
      continue;
    }
    const lower = command.toLowerCase();
    const n = COMMAND_ARGS[lower] ?? 0;
    if (n === 0) break;
    const args = tokens.slice(i, i + n).map(Number);
    if (args.length < n) break;
    i += n;
    const rel = command !== command.toUpperCase();
    const ox = rel ? x : 0;
    const oy = rel ? y : 0;
    if (lower === 'h') x = (args[0] as number) + ox;
    else if (lower === 'v') y = (args[0] as number) + oy;
    else if (lower === 'a') {
      x = (args[5] as number) + ox;
      y = (args[6] as number) + oy;
    } else {
      for (let k = 0; k + 1 < n; k += 2) add((args[k] as number) + ox, (args[k + 1] as number) + oy);
      x = (args[n - 2] as number) + ox;
      y = (args[n - 1] as number) + oy;
    }
    add(x, y);
    if (lower === 'm') {
      startX = x;
      startY = y;
      command = rel ? 'l' : 'L';
    }
  }
  return Number.isFinite(box.minX) ? box : null;
}

const attr = (tag: string, name: string): string | undefined => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];
const num = (tag: string, name: string): number => Number(attr(tag, name) ?? 0);

function area(kind: string, tag: string): number {
  if (kind === 'circle') return Math.PI * num(tag, 'r') ** 2;
  if (kind === 'ellipse') return Math.PI * num(tag, 'rx') * num(tag, 'ry');
  if (kind === 'rect') return num(tag, 'width') * num(tag, 'height');
  const box = pathBox(attr(tag, 'd') ?? '');
  return box ? (box.maxX - box.minX) * (box.maxY - box.minY) : 0;
}

/** Estimated area of each fill colour (upper-case hex) in a picture body, shapes with `fill="none"` skipped. */
export function fillAreas(body: string): Map<string, number> {
  const areas = new Map<string, number>();
  const inherited: (string | undefined)[] = [];
  for (const m of body.matchAll(/<(\/?)(path|circle|ellipse|rect|g)\b([^>]*?)(\/?)>/g)) {
    const [, closing, kind, rest, selfClosing] = m as unknown as [string, string, string, string, string];
    if (closing) {
      inherited.pop();
      continue;
    }
    const tag = ` ${rest}`;
    const own = attr(tag, 'fill');
    const fillColour = own ?? inherited[inherited.length - 1];
    if (kind === 'g') {
      if (!selfClosing) inherited.push(fillColour);
      continue;
    }
    if (!fillColour || !/^#[0-9a-fA-F]{3,6}$/.test(fillColour)) continue;
    const key = fillColour.toUpperCase();
    areas.set(key, (areas.get(key) ?? 0) + area(kind, tag));
  }
  return areas;
}

const BACKGROUNDS = new Set<string>(Object.values(BG).map((c) => c.toUpperCase()));
const OUTLINE_AND_SHADE = INK.toUpperCase();

/** True for fills that are not a colour a person would name: ink, the mounted-print grounds, white, cream and grey. */
export function isNeutral(hex: string): boolean {
  const upper = hex.toUpperCase();
  if (upper === OUTLINE_AND_SHADE || BACKGROUNDS.has(upper)) return true;
  const { s, l } = hexToHsl(upper);
  return s < 0.2 || l > 0.9 || l < 0.12;
}

/**
 * The colour families Color match uses, as hue ranges in degrees (start
 * inclusive, end exclusive), with the saturation and lightness a fill needs to
 * count as that colour. A fill outside every family (brown, tan, pink, purple,
 * a pale or greyed tint) is "other": it never counts toward a family, but it
 * does count against it when working out how clear the winner is.
 */
export const FAMILY_RANGES = {
  red: { hue: [345, 13], minS: 0.5, minL: 0.3, maxL: 0.65 },
  orange: { hue: [13, 37], minS: 0.7, minL: 0.35, maxL: 0.7 },
  yellow: { hue: [37, 65], minS: 0.7, minL: 0.3, maxL: 0.8 },
  green: { hue: [65, 170], minS: 0.3, minL: 0.3, maxL: 0.75 },
  blue: { hue: [190, 250], minS: 0.3, minL: 0.3, maxL: 0.75 },
} as const;

export type Family = keyof typeof FAMILY_RANGES | 'other';

/** The family a fill colour belongs to. */
export function familyOf(hex: string): Family {
  const { h, s, l } = hexToHsl(hex);
  for (const [family, r] of Object.entries(FAMILY_RANGES)) {
    const [from, to] = r.hue;
    const inHue = from <= to ? h >= from && h < to : h >= from || h < to;
    if (inHue && s >= r.minS && l >= r.minL && l <= r.maxL) return family as Family;
  }
  return 'other';
}

export interface DominantFamily {
  family: Family;
  /** The largest single fill inside that family (upper-case hex). */
  hex: string;
  /** Estimated area of that family, in the 120 x 120 picture. */
  area: number;
  /** That area as a share (0 to 1) of all non-neutral fill area. */
  share: number;
}

/**
 * The colour family with the most fill area, ignoring outline, shade, the
 * mounted-print ground, white, cream and grey. Null when a picture has no
 * coloured fill at all.
 */
export function dominantFamily(body: string): DominantFamily | null {
  const totals = new Map<Family, number>();
  const largest = new Map<Family, [string, number]>();
  for (const [hex, a] of fillAreas(body)) {
    if (isNeutral(hex)) continue;
    const family = familyOf(hex);
    totals.set(family, (totals.get(family) ?? 0) + a);
    if (a > (largest.get(family)?.[1] ?? 0)) largest.set(family, [hex, a]);
  }
  const all = [...totals.values()].reduce((sum, a) => sum + a, 0);
  if (all <= 0) return null;
  const [family, area] = [...totals].reduce((best, entry) => (entry[1] > best[1] ? entry : best));
  return { family, hex: (largest.get(family) as [string, number])[0], area, share: area / all };
}
