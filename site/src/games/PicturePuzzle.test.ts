import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { playProps } from '../i18n/play';
import { centeredSquare, isUsablePhoto, OWN_PHOTO_MAX_BYTES } from '../lib/games/own-photo';
import PicturePuzzle from './PicturePuzzle';

const source = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const component = source('./PicturePuzzle.tsx');
const cropper = source('../lib/games/own-photo.ts');
const css = source('../styles/games.css');

// Nothing the own-photo option touches may send, store or keep the photo beyond this tab.
const FORBIDDEN = /\bfetch\(|localStorage|sessionStorage|indexedDB|sendBeacon|document\.cookie|XMLHttpRequest/;

describe('PicturePuzzle: use your own photo (GAME-058)', () => {
  const props = playProps('en', 'picture-puzzle');
  const html = renderToStaticMarkup(createElement(PicturePuzzle, props));

  it('offers a native file input for one image, with the own-photo label', () => {
    expect(html).toContain(props.ui.picturePuzzle.ownChoose);
    expect(html).toMatch(/<input[^>]*type="file"[^>]*>/);
    expect(html).toMatch(/<input[^>]*accept="image\/\*"[^>]*>/);
    expect(html).not.toMatch(/<input[^>]*\bmultiple\b/);
  });

  it('states the privacy line and the consent line near the choice', () => {
    expect(props.ui.picturePuzzle.ownPrivacy).toBe('Your photo stays on this device. It is not uploaded or saved.');
    expect(props.ui.picturePuzzle.ownConsent).toBe('Use your own photos. Ask before using a photo of someone who cannot say yes.');
    expect(html).toContain(props.ui.picturePuzzle.ownPrivacy);
    expect(html).toContain(props.ui.picturePuzzle.ownConsent);
    expect(html.indexOf(props.ui.picturePuzzle.ownPrivacy)).toBeLessThan(html.indexOf('type="file"'));
  });

  it('names the whole-picture alt "Your photo" and the pieces by position', () => {
    expect(props.ui.picturePuzzle.ownAlt).toBe('Your photo');
    expect(props.ui.picturePuzzle.ownPiece).toContain('{n}');
    expect(props.ui.picturePuzzle.ownPiece).toContain('{place}');
    expect(component).toContain('ui.picturePuzzle.ownPiece');
    expect(component).toContain('ui.picturePuzzle.ownAlt');
    expect(props.ui.picturePuzzle.places4).toEqual(['top left', 'top right', 'bottom left', 'bottom right']);
  });

  it('reads and crops the photo only in the browser, with object URLs', () => {
    expect(cropper).toContain('URL.createObjectURL(file)');
    expect(cropper).toContain('URL.revokeObjectURL(source)');
    expect(component).toContain('URL.revokeObjectURL(ownUrl)');
    expect(component).toContain('URL.revokeObjectURL(url)');
  });

  it('never fetches, stores, beacons or uploads anything in the own-photo code', () => {
    expect(component).not.toMatch(FORBIDDEN);
    expect(cropper).not.toMatch(FORBIDDEN);
  });

  it('adds no timers to the own-photo path', () => {
    expect(component).not.toMatch(/setTimeout|setInterval|requestAnimationFrame/);
    expect(cropper).not.toMatch(/setTimeout|setInterval|requestAnimationFrame/);
  });

  it('hides the cut-up photo sheet on screen only, never with an unconditional display: none', () => {
    expect(css).toMatch(/@media screen \{\s*\.pp-photo-sheet \{\s*display: none;\s*\}\s*\}/);
    expect(css).not.toMatch(/(^|\})\s*\.pp-photo-sheet\s*\{\s*display:\s*none/);
    expect(css).toMatch(/@media print \{[\s\S]*\.pp-photo-sheet \{\s*display: block;/);
  });

  it('replaces the built-in print sheet only while the photo sheet is present', () => {
    expect(css).toContain('.game-stage:has(.pp-photo-sheet) + .sheet-paper');
    expect(component).toContain("SAFETY_FLAG_LABELS['sharp-tool']");
    expect(component).toContain('PAUSE_LINE');
  });

  it('keeps the photo sheet outside the aria-hidden board and out of focusable content', () => {
    expect(component).not.toMatch(/aria-hidden/);
  });
});

describe('own-photo crop and checks', () => {
  it('crops to a centered square', () => {
    expect(centeredSquare(400, 300)).toEqual({ side: 300, x: 50, y: 0 });
    expect(centeredSquare(300, 400)).toEqual({ side: 300, x: 0, y: 50 });
    expect(centeredSquare(200, 200)).toEqual({ side: 200, x: 0, y: 0 });
  });

  it('accepts only images within the size limit', () => {
    const photo = new File(['x'], 'a.jpg', { type: 'image/jpeg' });
    const text = new File(['x'], 'a.txt', { type: 'text/plain' });
    expect(isUsablePhoto(photo)).toBe(true);
    expect(isUsablePhoto(text)).toBe(false);
    expect(OWN_PHOTO_MAX_BYTES).toBe(40 * 1024 * 1024);
  });
});
