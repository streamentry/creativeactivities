import { describe, expect, it } from 'vitest';
import {
  CARD_PDF_BUDGET_BYTES,
  CARD_PDF_BUDGET_KB,
  cardPdfName,
  isInsideFolder,
  overBudget,
  pdfFlags,
  pdfPages,
  sizeTable,
} from '../../scripts/card-pdf-lib.mjs';

describe('cardPdfName (CNT-007: one file per card per paper size)', () => {
  it('names A4 and Letter files from the card slug', () => {
    expect(cardPdfName('make-a-bookmark', 'A4')).toBe('make-a-bookmark-a4.pdf');
    expect(cardPdfName('make-a-bookmark', 'Letter')).toBe('make-a-bookmark-letter.pdf');
  });

  it('rejects an unknown paper size', () => {
    expect(() => cardPdfName('make-a-bookmark', 'A3')).toThrow(/A4 or Letter/);
  });

  it('rejects a slug that would not be a safe file name', () => {
    expect(() => cardPdfName('../escape', 'A4')).toThrow(/file-name slug/);
    expect(() => cardPdfName('Upper-Case', 'A4')).toThrow(/file-name slug/);
  });
});

describe('sizeTable', () => {
  it('returns null for no files, so nothing measured cannot pass', () => {
    expect(sizeTable([])).toBeNull();
  });

  it('takes the middle of an odd list as the median', () => {
    const table = sizeTable([
      { name: 'a', bytes: 1024 },
      { name: 'b', bytes: 3072 },
      { name: 'c', bytes: 2048 },
    ]);
    expect(table).toEqual({ count: 3, minKB: 1, medianKB: 2, maxKB: 3 });
  });

  it('averages the two middle values of an even list and rounds to one decimal', () => {
    const table = sizeTable([
      { name: 'a', bytes: 1000 },
      { name: 'b', bytes: 2000 },
      { name: 'c', bytes: 4000 },
      { name: 'd', bytes: 5000 },
    ]);
    expect(table?.medianKB).toBe(2.9);
    expect(table?.minKB).toBe(1);
    expect(table?.maxKB).toBe(4.9);
  });
});

describe('overBudget', () => {
  it('uses a 500 KB budget by default', () => {
    expect(CARD_PDF_BUDGET_KB).toBe(500);
    expect(CARD_PDF_BUDGET_BYTES).toBe(512000);
  });

  it('lists only files above the budget, and a file exactly at the budget passes', () => {
    const files = [
      { name: 'small-a4.pdf', bytes: 100 * 1024 },
      { name: 'exact-letter.pdf', bytes: CARD_PDF_BUDGET_BYTES },
      { name: 'big-a4.pdf', bytes: CARD_PDF_BUDGET_BYTES + 1024 },
    ];
    expect(overBudget(files)).toEqual([{ name: 'big-a4.pdf', kb: 501 }]);
  });

  it('takes a budget in bytes when the caller gives one', () => {
    expect(overBudget([{ name: 'x.pdf', bytes: 2048 }], 1024)).toEqual([{ name: 'x.pdf', kb: 2 }]);
  });
});

describe('pdfPages', () => {
  it('counts page objects and not the page tree', () => {
    const pdf = Buffer.from('1 0 obj << /Type /Pages /Count 2 >> endobj 2 0 obj << /Type /Page >> endobj 3 0 obj << /Type /Page >> endobj');
    expect(pdfPages(pdf)).toBe(2);
  });
});

describe('pdfFlags', () => {
  it('reads a tagged structure, an outline and a title', () => {
    const pdf = Buffer.from('/Title (Make a bookmark) /MarkInfo << /Marked true >> /StructTreeRoot 5 0 R /Type /Outlines /Count 1');
    expect(pdfFlags(pdf)).toEqual({ tagged: true, outline: true, titled: true });
  });

  it('reports an untagged file with no outline and no title', () => {
    const pdf = Buffer.from('1 0 obj << /Type /Catalog >> endobj');
    expect(pdfFlags(pdf)).toEqual({ tagged: false, outline: false, titled: false });
  });

  it('does not count a MarkInfo that is not marked', () => {
    const pdf = Buffer.from('/MarkInfo << /Marked false >> /StructTreeRoot 5 0 R');
    expect(pdfFlags(pdf).tagged).toBe(false);
  });
});

describe('isInsideFolder', () => {
  it('is true for the folder itself and anything under it', () => {
    expect(isInsideFolder('/site/dist', '/site/dist')).toBe(true);
    expect(isInsideFolder('/site/dist/card.pdf', '/site/dist')).toBe(true);
  });

  it('is false for a sibling that only shares the name prefix', () => {
    expect(isInsideFolder('/site/dist-pdfs', '/site/dist')).toBe(false);
    expect(isInsideFolder('/site/.pdf-out', '/site/dist')).toBe(false);
  });
});
