import { describe, expect, it } from 'vitest';
import { MAX_DENSITY, attributesOf, imageProblems, imagesIn, sizeOfImage } from '../../scripts/image-check-lib.mjs';

/**
 * Image quality on the built pages (PLAT-017): every image says what it is (an alt attribute, empty when it is
 * decoration), has its size in the page (so nothing jumps when it arrives), and is not delivered at much more than
 * the width it is shown at. The build check (`pnpm check:images`) applies these to every built page.
 */

const png = (width: number, height: number) => {
  const b = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0);
  b.writeUInt32BE(13, 8);
  b.write('IHDR', 12, 'ascii');
  b.writeUInt32BE(width, 16);
  b.writeUInt32BE(height, 20);
  return b;
};

/** A lossy WebP header (VP8 chunk) with the given size. */
const webp = (width: number, height: number) => {
  const b = Buffer.alloc(40);
  b.write('RIFF', 0, 'ascii');
  b.write('WEBP', 8, 'ascii');
  b.write('VP8 ', 12, 'ascii');
  b.writeUInt16LE(width, 26);
  b.writeUInt16LE(height, 28);
  return b;
};

const jpeg = (width: number, height: number) => {
  // SOI, then a start-of-frame segment: length 17, precision 8, height, width.
  const b = Buffer.alloc(24);
  b[0] = 0xff;
  b[1] = 0xd8;
  b[2] = 0xff;
  b[3] = 0xc0;
  b.writeUInt16BE(17, 4);
  b[6] = 8;
  b.writeUInt16BE(height, 7);
  b.writeUInt16BE(width, 9);
  return b;
};

/** An AVIF file: an `ispe` box holds the size (4 bytes of version and flags, then width and height). */
const avif = (width: number, height: number) => {
  const b = Buffer.alloc(40);
  b.write('ftypavif', 4, 'ascii');
  b.write('ispe', 24, 'ascii');
  b.writeUInt32BE(width, 32);
  b.writeUInt32BE(height, 36);
  return b;
};

describe('reading the size of an image file', () => {
  it('reads PNG, JPEG, WebP and AVIF headers', () => {
    expect(sizeOfImage(png(720, 540), '.png')).toEqual({ width: 720, height: 540 });
    expect(sizeOfImage(jpeg(1280, 960), '.jpg')).toEqual({ width: 1280, height: 960 });
    expect(sizeOfImage(webp(480, 360), '.webp')).toEqual({ width: 480, height: 360 });
    expect(sizeOfImage(avif(640, 480), '.avif')).toEqual({ width: 640, height: 480 });
  });

  it('says so, rather than guessing, when it cannot read a file', () => {
    expect(sizeOfImage(Buffer.from('not an image'), '.png')).toBeNull();
    expect(sizeOfImage(Buffer.alloc(4), '.webp')).toBeNull();
  });
});

describe('reading the images in a page', () => {
  it('finds every image tag and its attributes, in either kind of quote', () => {
    const html = `<p>hi</p><img src="/a.png" alt="A cup" width="120" height="90"><img src='/b.webp' alt='' width=40 height=40/>`;
    const images = imagesIn(html);
    expect(images).toHaveLength(2);
    expect(images[0]).toMatchObject({ src: '/a.png', alt: 'A cup', width: 120, height: 90 });
    expect(images[1]).toMatchObject({ src: '/b.webp', alt: '', width: 40, height: 40 });
  });

  it('tells an empty alt (decoration) from no alt at all', () => {
    expect(attributesOf('<img src="/a.png" alt="">').alt).toBe('');
    expect(attributesOf('<img src="/a.png">').alt).toBeUndefined();
  });
});

describe('what the check refuses', () => {
  const sizes = new Map<string, { width: number; height: number }>([
    ['/photo.png', { width: 480, height: 360 }],
    ['/big.png', { width: 1200, height: 900 }],
    ['/illustrations/pot.webp', { width: 720, height: 720 }],
  ]);
  const sizeOf = (src: string) => sizes.get(src) ?? null;
  const check = (html: string) => imageProblems(html, { sizeOf });

  it('accepts an image with alt text, a size, and a file no more than twice its width', () => {
    expect(check('<img src="/photo.png" alt="A teacup" width="240" height="180">')).toEqual([]);
    expect(MAX_DENSITY).toBe(2);
  });

  it('accepts decoration with an empty alt', () => {
    expect(check('<img src="/photo.png" alt="" width="240" height="180">')).toEqual([]);
  });

  it('refuses an image with no alt attribute', () => {
    expect(check('<img src="/photo.png" width="240" height="180">')).toEqual([{ kind: 'no-alt', src: '/photo.png' }]);
  });

  it('refuses an image with no width or no height, and says which is missing', () => {
    expect(check('<img src="/photo.png" alt="A teacup" height="180">')).toEqual([{ kind: 'no-size', src: '/photo.png', missing: 'width' }]);
    expect(check('<img src="/photo.png" alt="A teacup" width="240">')).toEqual([{ kind: 'no-size', src: '/photo.png', missing: 'height' }]);
    expect(check('<img src="/photo.png" alt="A teacup">')).toEqual([{ kind: 'no-size', src: '/photo.png', missing: 'width and height' }]);
  });

  it('refuses a picture file more than twice as wide as it is shown', () => {
    expect(check('<img src="/big.png" alt="A teacup" width="240" height="180">')).toEqual([{ kind: 'oversize', src: '/big.png', natural: 1200, shown: 240 }]);
    expect(check('<img src="/big.png" alt="A teacup" width="600" height="450">')).toEqual([]);
  });

  it('does not measure a vector image, one the browser chooses a size for, or one from another site', () => {
    expect(check('<img src="/pictures/bread.svg" alt="" width="120" height="120">')).toEqual([]);
    expect(check('<img src="/big.png" srcset="/big.png 1200w, /small.png 600w" alt="A teacup" width="240" height="180">')).toEqual([]);
    expect(check('<img src="https://example.com/x.png" alt="x" width="10" height="10">')).toEqual([]);
  });

  it('allows the listed illustrations up to three times, for phones with very sharp screens, and no more', () => {
    expect(check('<img src="/illustrations/pot.webp" alt="" width="240" height="240">')).toEqual([]);
    expect(check('<img src="/illustrations/pot.webp" alt="" width="200" height="200">')).toEqual([{ kind: 'oversize', src: '/illustrations/pot.webp', natural: 720, shown: 200 }]);
  });

  it('refuses a file it cannot read, so a new image format cannot slip past unmeasured', () => {
    expect(imageProblems('<img src="/mystery.png" alt="x" width="10" height="10">', { sizeOf: () => null })).toEqual([{ kind: 'unreadable', src: '/mystery.png' }]);
  });
});
