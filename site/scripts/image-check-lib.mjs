// The rules for images on built pages (PLAT-017), as functions so they can be tested without a build. Every image
// says what it is (an alt attribute, empty when it is decoration), has its size in the page (so nothing jumps when it
// arrives), and is not delivered at much more than the width it is shown at.
import { extname } from 'node:path';

/** A picture file may be this many times wider than the width it is shown at (a screen twice as sharp as an ordinary one). */
export const MAX_DENSITY = 2;

/** Pictures that may be sent at a higher density, and why. Each is a decision, not a gap: it is listed so it stays one. */
export const EXCEPTIONS = [
  { prefix: '/illustrations/', density: 3, why: 'drawings kept at three times their shown width for phones with very sharp screens (12 to 33 kB each)' },
];

const RASTER = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif']);

/** Width and height from the start of an image file, or null when the file cannot be read. SVG has no pixels and is not read. */
export function sizeOfImage(buffer, ext) {
  try {
    if (ext === '.png') {
      if (buffer.length < 24 || buffer.toString('ascii', 12, 16) !== 'IHDR') return null;
      return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
    }
    if (ext === '.gif') {
      if (buffer.length < 10 || !buffer.toString('ascii', 0, 4).startsWith('GIF8')) return null;
      return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
    }
    if (ext === '.jpg' || ext === '.jpeg') {
      let i = 2;
      while (i + 9 < buffer.length) {
        if (buffer[i] !== 0xff) {
          i += 1;
          continue;
        }
        const marker = buffer[i + 1];
        if (marker === 0xff) {
          i += 1;
          continue;
        }
        if (marker === 0x01 || marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7)) {
          i += 2;
          continue;
        }
        if (marker === 0xd9 || marker === 0xda) return null;
        // A start-of-frame segment holds the size; the others are skipped by their length.
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
          return { width: buffer.readUInt16BE(i + 7), height: buffer.readUInt16BE(i + 5) };
        }
        i += 2 + buffer.readUInt16BE(i + 2);
      }
      return null;
    }
    if (ext === '.webp') {
      if (buffer.length < 30 || buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') return null;
      const chunk = buffer.toString('ascii', 12, 16);
      if (chunk === 'VP8 ') return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
      if (chunk === 'VP8L') {
        const bits = buffer.readUInt32LE(21);
        return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
      }
      if (chunk === 'VP8X') return { width: buffer.readUIntLE(24, 3) + 1, height: buffer.readUIntLE(27, 3) + 1 };
      return null;
    }
    if (ext === '.avif') {
      // The image-spatial-extents box: "ispe", four bytes of version and flags, then width and height.
      // A file may hold several boxes (a thumbnail, a grid); the picture is the largest.
      const head = buffer.subarray(0, Math.min(buffer.length, 8192));
      let best = null;
      for (let at = head.indexOf('ispe'); at >= 0 && at + 16 <= buffer.length; at = head.indexOf('ispe', at + 4)) {
        const size = { width: buffer.readUInt32BE(at + 8), height: buffer.readUInt32BE(at + 12) };
        if (!best || size.width > best.width) best = size;
      }
      return best;
    }
  } catch {
    return null;
  }
  return null;
}

/** The attributes of one image tag. `alt` is undefined when there is none, and '' when it is empty. */
export function attributesOf(tag) {
  const value = (name) => {
    const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
    if (!m) return undefined;
    return m[1] ?? m[2] ?? (m[3] ?? '').replace(/\/$/, '');
  };
  const number = (name) => {
    const v = value(name);
    return v !== undefined && /^\d+$/.test(v) ? Number(v) : undefined;
  };
  const alt = value('alt') ?? (/\salt(?=[\s/>])/i.test(tag) ? '' : undefined);
  return { src: value('src'), alt, width: number('width'), height: number('height'), srcset: value('srcset') };
}

/** Every image tag in a page, with its attributes. */
export function imagesIn(html) {
  return [...html.matchAll(/<img\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi)].map((m) => attributesOf(m[0]));
}

const remote = (src) => /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(src) || src.startsWith('data:');

/**
 * What is wrong with the images in one page. `sizeOf(src)` returns `{ width, height }` for a local file, or null.
 * Vector images, images the browser picks a size for (`srcset`) and images from another address are not measured.
 */
export function imageProblems(html, { sizeOf }) {
  const problems = [];
  for (const img of imagesIn(html)) {
    const src = img.src ?? '';
    if (img.alt === undefined) problems.push({ kind: 'no-alt', src });
    const missing = [img.width ? null : 'width', img.height ? null : 'height'].filter(Boolean).join(' and ');
    if (missing) problems.push({ kind: 'no-size', src, missing });
    if (!src || remote(src) || img.srcset || !img.width) continue;
    const path = src.split(/[?#]/)[0];
    if (!RASTER.has(extname(path).toLowerCase())) continue;
    const natural = sizeOf(path);
    if (!natural) {
      problems.push({ kind: 'unreadable', src });
      continue;
    }
    const density = EXCEPTIONS.find((e) => path.startsWith(e.prefix))?.density ?? MAX_DENSITY;
    if (natural.width > density * img.width) problems.push({ kind: 'oversize', src, natural: natural.width, shown: img.width });
  }
  return problems;
}
