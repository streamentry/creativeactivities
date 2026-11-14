import { describe, expect, it } from 'vitest';
import { qrSvg } from './qr';

const URL_ = 'https://creativeactivities.org/activity/draw-to-music/';

describe('qrSvg', () => {
  it('draws a square code with a quiet zone and an accessible name', () => {
    const svg = qrSvg(URL_, 'QR code for Draw to music');
    const [, w, h] = svg.match(/viewBox="0 0 (\d+) (\d+)"/) ?? [];
    expect(w).toBe(h);
    // Version 3 or 4 for a URL this long: 29 or 33 modules plus 8 of quiet zone.
    expect(Number(w)).toBeGreaterThanOrEqual(29 + 8);
    expect(svg).toContain('role="img"');
    expect(svg).toContain('aria-label="QR code for Draw to music"');
    // The three finder patterns start at the quiet zone corner.
    expect(svg).toContain('M4 4h1v1h-1z');
  });

  it('is the same for the same address and differs for another', () => {
    expect(qrSvg(URL_, 'a')).toBe(qrSvg(URL_, 'a'));
    expect(qrSvg(URL_, 'a')).not.toBe(qrSvg(`${URL_}x`, 'a'));
  });

  it('cannot break out of the label attribute', () => {
    expect(qrSvg(URL_, 'a"><script>')).not.toContain('<script>');
  });
});
