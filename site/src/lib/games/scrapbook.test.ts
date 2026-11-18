import { describe, expect, it } from 'vitest';
import {
  CAPTION_MAX,
  MAX_PHOTOS,
  MIN_PHOTOS,
  canMakeBook,
  canMove,
  canTurn,
  clampCaption,
  clampPage,
  movePage,
  pageNumber,
  setCaption,
  takeBookPhotos,
  turnPage,
  visibleCaption,
  type ScrapPage,
} from './scrapbook';

const pages = (n: number): ScrapPage[] => Array.from({ length: n }, (_, i) => ({ id: i + 1, url: `blob:${i + 1}`, caption: '' }));
const ids = (list: readonly ScrapPage[]) => list.map((p) => p.id);

describe('how many photos a book takes', () => {
  it('needs at least two photos and takes at most twelve', () => {
    expect(MIN_PHOTOS).toBe(2);
    expect(MAX_PHOTOS).toBe(12);
    expect(canMakeBook(1)).toBe(false);
    expect(canMakeBook(0)).toBe(false);
    expect(canMakeBook(2)).toBe(true);
  });

  it('keeps the first twelve photos in the order chosen and counts the rest', () => {
    const photos = Array.from({ length: 15 }, (_, i) => i);
    const { kept, left } = takeBookPhotos(photos);
    expect(kept).toEqual(photos.slice(0, 12));
    expect(left).toBe(3);
  });

  it('leaves nothing out when there are twelve or fewer', () => {
    expect(takeBookPhotos([1, 2])).toEqual({ kept: [1, 2], left: 0 });
    expect(takeBookPhotos(Array.from({ length: 12 }, (_, i) => i)).left).toBe(0);
  });
});

describe('caption length', () => {
  it('allows 80 characters and cuts the rest', () => {
    expect(CAPTION_MAX).toBe(80);
    expect(clampCaption('a'.repeat(80))).toHaveLength(80);
    expect(clampCaption('a'.repeat(120))).toBe('a'.repeat(80));
  });

  it('counts whole characters, so an emoji or accent is never split', () => {
    const text = 'é'.repeat(79) + '😀' + 'tail';
    const clamped = clampCaption(text);
    expect(Array.from(clamped)).toHaveLength(80);
    expect(clamped.endsWith('😀')).toBe(true);
  });

  it('leaves a short caption as it is', () => {
    expect(clampCaption('Grandma at the lake')).toBe('Grandma at the lake');
  });

  it('shows a blank caption as no caption at all', () => {
    expect(visibleCaption({ id: 1, url: 'blob:1', caption: '   ' })).toBe('');
    expect(visibleCaption({ id: 1, url: 'blob:1', caption: ' Lake day ' })).toBe('Lake day');
  });
});

describe('page bounds', () => {
  it('keeps the index inside the book', () => {
    expect(clampPage(-3, 4)).toBe(0);
    expect(clampPage(9, 4)).toBe(3);
    expect(clampPage(2, 4)).toBe(2);
    expect(clampPage(Number.NaN, 4)).toBe(0);
  });

  it('is page 0 for an empty book', () => {
    expect(clampPage(5, 0)).toBe(0);
    expect(canTurn(0, 0, 1)).toBe(false);
  });

  it('turns one page at a time and stops at the ends without wrapping', () => {
    expect(turnPage(0, 3, 1)).toBe(1);
    expect(turnPage(2, 3, 1)).toBe(2);
    expect(turnPage(0, 3, -1)).toBe(0);
    expect(turnPage(1, 3, -1)).toBe(0);
  });

  it('says when a page can be turned, so the buttons can be disabled', () => {
    expect(canTurn(0, 3, -1)).toBe(false);
    expect(canTurn(0, 3, 1)).toBe(true);
    expect(canTurn(2, 3, 1)).toBe(false);
    expect(canTurn(1, 3, -1)).toBe(true);
  });

  it('gives the page number counted from one', () => {
    expect(pageNumber(0, 8)).toBe(1);
    expect(pageNumber(2, 8)).toBe(3);
    expect(pageNumber(99, 8)).toBe(8);
  });
});

describe('moving a page', () => {
  it('moves a page later and follows it with the index', () => {
    const result = movePage(pages(4), 1, 1);
    expect(ids(result.pages)).toEqual([1, 3, 2, 4]);
    expect(result.index).toBe(2);
  });

  it('moves a page earlier and follows it with the index', () => {
    const result = movePage(pages(4), 2, -1);
    expect(ids(result.pages)).toEqual([1, 3, 2, 4]);
    expect(result.index).toBe(1);
  });

  it('does nothing past either end', () => {
    expect(ids(movePage(pages(3), 0, -1).pages)).toEqual([1, 2, 3]);
    expect(movePage(pages(3), 0, -1).index).toBe(0);
    expect(ids(movePage(pages(3), 2, 1).pages)).toEqual([1, 2, 3]);
    expect(canMove(2, 3, 1)).toBe(false);
  });

  it('keeps every photo once and never changes a URL', () => {
    const before = pages(5);
    const after = movePage(before, 4, -1).pages;
    expect(after).toHaveLength(5);
    expect(new Set(after.map((p) => p.url))).toEqual(new Set(before.map((p) => p.url)));
  });

  it('does not change the list it was given', () => {
    const before = pages(3);
    const snapshot = [...before];
    movePage(before, 0, 1);
    expect(before).toEqual(snapshot);
  });
});

describe('captions', () => {
  it('changes one page and clamps the text', () => {
    const before = pages(3);
    const after = setCaption(before, 2, 'x'.repeat(100));
    expect(after[1]?.caption).toHaveLength(80);
    expect(after[0]).toBe(before[0]);
    expect(after[2]).toBe(before[2]);
    expect(before[1]?.caption).toBe('');
  });

  it('keeps a caption with its photo when pages move', () => {
    const list = setCaption(pages(3), 3, 'The garden');
    const moved = movePage(list, 2, -1).pages;
    expect(moved.find((p) => p.id === 3)?.caption).toBe('The garden');
  });
});
