/**
 * GAME-037 Scrapbook: the pages of a family book. Each page is one photo the person
 * chose on this device, with an optional caption. Nothing here reads, uploads or stores
 * a photo; the component owns the object URLs. Every change returns a new list, so an
 * earlier list is never mutated.
 */

/** Fewest photos a book needs. */
export const MIN_PHOTOS = 2;

/** Most photos a book takes. More than this would make a long print and a long page to turn. */
export const MAX_PHOTOS = 12;

/** Longest family caption, in characters (code points, not UTF-16 units). */
export const CAPTION_MAX = 80;

export interface ScrapPage {
  /** Stable key for React and for updating a caption; never reused within a book. */
  readonly id: number;
  /** Object URL of the chosen photo. The component releases it when the book is replaced or closed. */
  readonly url: string;
  readonly caption: string;
}

/** Trims a caption to [CAPTION_MAX] characters, counting whole characters rather than code units. */
export function clampCaption(text: string): string {
  return Array.from(text).slice(0, CAPTION_MAX).join('');
}

/** Whether there are enough photos to make a book. */
export function canMakeBook(photoCount: number): boolean {
  return photoCount >= MIN_PHOTOS;
}

/** The first [MAX_PHOTOS] photos in the order they were chosen, and how many were left out. */
export function takeBookPhotos<T>(photos: readonly T[]): { kept: T[]; left: number } {
  const kept = photos.slice(0, MAX_PHOTOS);
  return { kept, left: photos.length - kept.length };
}

/** Keeps a page index inside the book: 0 for an empty book, otherwise from the first page to the last. */
export function clampPage(index: number, total: number): number {
  if (total <= 0 || !Number.isFinite(index)) return 0;
  return Math.min(Math.max(Math.trunc(index), 0), total - 1);
}

/** The page after (step 1) or before (step -1) the current one. It stops at the first and last page and does not wrap. */
export function turnPage(index: number, total: number, step: -1 | 1): number {
  const from = clampPage(index, total);
  return canTurn(from, total, step) ? from + step : from;
}

/** Whether the page can be turned that way. The Previous and Next buttons are disabled when it cannot. */
export function canTurn(index: number, total: number, step: -1 | 1): boolean {
  if (total <= 0) return false;
  const target = clampPage(index, total) + step;
  return target >= 0 && target <= total - 1;
}

/** Whether a page can move one place earlier or later. The same bounds as turning. */
export function canMove(index: number, total: number, step: -1 | 1): boolean {
  return canTurn(index, total, step);
}

/**
 * Moves the page at [index] one place earlier or later. Returns the new list and the
 * index where that page now sits, so the family keeps looking at the same photo. A
 * move past either end changes nothing.
 */
export function movePage(pages: readonly ScrapPage[], index: number, step: -1 | 1): { pages: ScrapPage[]; index: number } {
  const from = clampPage(index, pages.length);
  if (!canMove(from, pages.length, step)) return { pages: [...pages], index: from };
  const to = from + step;
  const next = [...pages];
  const [moved] = next.splice(from, 1);
  if (moved) next.splice(to, 0, moved);
  return { pages: next, index: to };
}

/** The same pages with one caption replaced, clamped to [CAPTION_MAX]. The other pages are the same objects. */
export function setCaption(pages: readonly ScrapPage[], id: number, text: string): ScrapPage[] {
  const caption = clampCaption(text);
  return pages.map((page) => (page.id === id ? { ...page, caption } : page));
}

/** The caption to show as text: trimmed, and empty when the family left it blank. */
export function visibleCaption(page: ScrapPage): string {
  return page.caption.trim();
}

/** The page number for display, counted from 1, such as the 3 in "Page 3 of 8". */
export function pageNumber(index: number, total: number): number {
  return clampPage(index, total) + 1;
}
