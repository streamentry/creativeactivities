// Printable activity cards as PDF (PLAT-019, CNT-007). These helpers are pure, so a test can feed them numbers and bytes;
// build-card-pdfs.mjs renders the pages and calls them. Nothing here reads the disk or starts a browser.

/** PLAT-019 asks for an agreed size budget but the specs name no number, so this is the working budget: 500 KB per PDF. */
export const CARD_PDF_BUDGET_KB = 500;
export const CARD_PDF_BUDGET_BYTES = CARD_PDF_BUDGET_KB * 1024;

/** A card is one sheet printed on both sides (DESIGN.md §8), so its PDF is exactly this many pages. */
export const CARD_PDF_SHEETS = 2;

/** The two paper sizes CNT-007 asks for. `format` is Playwright's name; `suffix` is the file-name part. */
export const PAPER = Object.freeze([
  Object.freeze({ format: 'A4', suffix: 'a4' }),
  Object.freeze({ format: 'Letter', suffix: 'letter' }),
]);

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** The file name for one card on one paper size: `<card-slug>-a4.pdf` or `<card-slug>-letter.pdf`. */
export function cardPdfName(slug, format) {
  const paper = PAPER.find((p) => p.format === format);
  if (!paper) throw new Error(`Unknown paper size "${format}": use A4 or Letter`);
  if (!SLUG.test(slug)) throw new Error(`Card slug "${slug}" is not a lowercase file-name slug`);
  return `${slug}-${paper.suffix}.pdf`;
}

/** Bytes to kilobytes (1 KB = 1024 bytes), rounded to one decimal place. */
export function toKB(bytes) {
  return Math.round((bytes / 1024) * 10) / 10;
}

/**
 * Min, median and max size in KB of a list of `{ name, bytes }` files. Returns null for an empty list, so a caller
 * that built nothing cannot pass a size check by measuring nothing.
 */
export function sizeTable(files) {
  if (files.length === 0) return null;
  const sorted = files.map((f) => f.bytes).sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  return {
    count: sorted.length,
    minKB: toKB(sorted[0]),
    medianKB: toKB(median),
    maxKB: toKB(sorted[sorted.length - 1]),
  };
}

/** The files larger than the budget, as `{ name, kb }`. A file exactly at the budget is within it. */
export function overBudget(files, budgetBytes = CARD_PDF_BUDGET_BYTES) {
  return files.filter((f) => f.bytes > budgetBytes).map((f) => ({ name: f.name, kb: toKB(f.bytes) }));
}

/** Pages in a PDF: each page object is /Type /Page (not /Pages). Same rule as check-print.mjs. */
export function pdfPages(pdf) {
  return (Buffer.from(pdf).toString('latin1').match(/\/Type\s*\/Page(?!s)/g) ?? []).length;
}

/**
 * What the PDF's bytes say about its structure. `tagged`: a structure tree with MarkInfo /Marked true (the accessible,
 * tagged form that `tagged: true` asks for). `outline`: a document outline (bookmarks) exists. `titled`: the document
 * has a /Title in its Info dictionary. Reads the uncompressed text only, so a file that hides these in compressed
 * object streams reports false: the caller says so rather than claiming the flag is absent.
 */
export function pdfFlags(pdf) {
  const text = Buffer.from(pdf).toString('latin1');
  return {
    tagged: /\/MarkInfo\s*<<[^>]*\/Marked\s+true/.test(text) && /\/StructTreeRoot\b/.test(text),
    outline: /\/Type\s*\/Outlines\b/.test(text),
    titled: /\/Title\s*[(<]/.test(text),
  };
}

/** True when `child` is `root` or inside it. Both must be absolute, normalized paths (no trailing separator). */
export function isInsideFolder(child, root) {
  return child === root || child.startsWith(root.endsWith('/') ? root : `${root}/`);
}
