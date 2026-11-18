import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { playProps } from '../i18n/play';
import { CAPTION_MAX } from '../lib/games/photo-hint';
import PhotoPairs from './PhotoPairs';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const PHOTO_FILES = ['PhotoPairs.tsx', 'shared/PairsBoard.tsx', 'shared/PictureTile.tsx', '../lib/games/photo-hint.ts'];

describe('PhotoPairs', () => {
  it('shows the setup reminder before photo selection', () => {
    const props = playProps('en', 'photo-pairs');
    const html = renderToStaticMarkup(createElement(PhotoPairs, props));

    expect(html).toContain(props.ui.photoPairs.setupHint);
    expect(html).toContain(props.ui.photoPairs.photoComfort);
    expect(html.indexOf(props.ui.photoPairs.setupHint)).toBeLessThan(html.indexOf(props.ui.photoPairs.photoComfort));
  });

  it('shows the family-photo consent line near the photo choice', () => {
    const props = playProps('en', 'photo-pairs');
    const html = renderToStaticMarkup(createElement(PhotoPairs, props));

    expect(props.ui.photoPairs.consent).toBe(
      'Use your own family photos. Ask before using a photo of someone who cannot say yes.',
    );
    expect(html).toContain(props.ui.photoPairs.consent);
    // Between the comfort reminder and the file picker.
    expect(html.indexOf(props.ui.photoPairs.consent)).toBeGreaterThan(html.indexOf(props.ui.photoPairs.photoComfort));
    expect(html.indexOf(props.ui.photoPairs.consent)).toBeLessThan(html.indexOf('type="file"'));
  });

  it('uses the English setup reminder where no reviewed translation exists', () => {
    const english = playProps('en', 'photo-pairs');
    const vietnamese = playProps('vi', 'photo-pairs');

    expect(vietnamese.ui.photoPairs.setupHint).toBe(english.ui.photoPairs.setupHint);
    expect(vietnamese.ui.photoPairs.consent).toBe(english.ui.photoPairs.consent);
    expect(vietnamese.ui.photoPairs.hint).toBe(english.ui.photoPairs.hint);
  });

  it('uses Japanese copy for one-photo viewing and its controls', () => {
    const english = playProps('en', 'photo-pairs').ui.photoPairs;
    const japanese = playProps('ja', 'photo-pairs').ui.photoPairs;

    expect(japanese.intro).toContain('写真を1〜6枚');
    expect(japanese.intro).toContain('1枚ずつ');
    expect(japanese.lookOnly).toBe('写真を1枚ずつ見る');
    expect(japanese.lookOnly).not.toBe(english.lookOnly);
    expect(japanese.atLeastTwo).toContain('もう1枚');
    expect(japanese.previousPhoto).toBe('前の写真');
    expect(japanese.nextPhoto).toBe('次の写真');
    expect(japanese.captionLabel).toContain('{n}');
  });

  it('marks the hint and caption copy in English, with fallback on translated pages', () => {
    const english = playProps('en', 'photo-pairs').ui.photoPairs;
    expect(english.hint).toBe('Here is a pair you could try.');
    expect(english.hintMark).toBe('Here');
    expect(english.captionHelp).toContain('60 characters');
    expect(english.captionHelp).toContain('gone when you close the page');
    expect(playProps('fr', 'photo-pairs').ui.photoPairs.hintOn).toBe(english.hintOn);
  });

  it('keeps captions to 60 characters in the input and in the state', () => {
    expect(CAPTION_MAX).toBe(60);
    const source = read('./PhotoPairs.tsx');
    expect(source).toContain('maxLength={CAPTION_MAX}');
    expect(source).toContain('clampCaption(event.currentTarget.value)');
    expect(source).not.toMatch(/maxLength=\{80\}/);
  });

  it('renders captions and labels as text, never as markup', () => {
    for (const file of PHOTO_FILES) {
      expect(read(`./${file}`), file).not.toMatch(/innerHTML|dangerouslySetInnerHTML|insertAdjacentHTML/);
    }
    expect(read('./shared/PictureTile.tsx')).toMatch(/<p className="tile__caption" aria-hidden="true">\s*\{caption\}/);
  });

  it('keeps photos and captions out of storage and the network', () => {
    for (const file of PHOTO_FILES) {
      expect(read(`./${file}`), file).not.toMatch(/localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest|sendBeacon|FormData/);
    }
  });

  it('starts the hint pause again on every tap, including a tap that changes nothing', () => {
    const board = read('./shared/PairsBoard.tsx');
    expect(board).toMatch(/onTapped\?\.\(\);\s*const before = store\.state;/);
    const page = read('./PhotoPairs.tsx');
    expect(page).toContain('onTapped={startPause}');
    expect(page).toMatch(/const startPause = \(\) => \{\s*hintWait\.tap\(\);\s*setHinting\(false\);/);
  });

  it('marks the hinted pair with a dashed outline and a text marker, not colour alone', () => {
    const tile = read('./shared/PictureTile.tsx');
    expect(tile).toContain('tile--hinted');
    expect(tile).toContain('hintLabel');
    const css = read('../styles/games.css');
    expect(css).toMatch(/\.tile--hinted::before\s*\{[^}]*border:\s*4px dashed/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: no-preference\) \{\s*\.tile--hinted::before \{\s*animation:/);
  });

  it('names one pair for the hint through the board state', () => {
    const board = read('./shared/PairsBoard.tsx');
    expect(board).toContain('hintValue = hinting ? nextHintValue(state.tiles) : null');
    expect(board).toMatch(/hinted=\{hintValue !== null && t\.value === hintValue\}/);
  });
});
