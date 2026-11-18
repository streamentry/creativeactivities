import type { FrontmatterSplit } from './yaml-subset';

/**
 * L10N-006: a translated document must keep the English structure. Translators
 * change the words; the number of headings, list items, links, steps,
 * variations, safety flags and numbers stays the same. Pure functions only:
 * the content test (translation-structure.content.test.ts) reads the files.
 */

export interface Mismatch {
  /** Which part of the structure differs, e.g. `headings`, `variations`. */
  field: string;
  /** Human-readable difference, used in test output and in the baseline file. */
  detail: string;
}

export interface MarkdownStructure {
  headings: number[];
  lists: { ordered: boolean; items: number }[];
  links: number;
}

export interface CompareOptions {
  /** True for a translation: `translatedFrom` is then an allowed extra key. */
  translation: boolean;
}

/** The fields of an activity card that a translation must keep, in the order the card gives them. */
export interface ActivityCardLike {
  steps: unknown[];
  variations: { kind: string; text?: unknown }[];
  safetyFlags: string[];
  supervision: string;
  safety: unknown[];
  /** The step each image belongs to, in the order the images appear (absent or null when none). */
  imageSteps?: (number | null)[];
}

export interface ActivityStructure {
  steps: number;
  variationKinds: string[];
  safetyFlags: string[];
  supervision: string;
  safetyLines: number;
  imageSteps: (number | null)[];
}

const KEYS_THAT_MUST_MATCH = ['section', 'order', 'health', 'crisisRoute'] as const;
const LISTS_THAT_MUST_MATCH = ['relatedGames', 'related'] as const;
const TRANSLATION_ONLY_KEYS = ['translatedFrom'] as const;

/** Parses a Markdown body into the structure the check compares. Fenced code is skipped for headings and lists. */
export function markdownStructure(body: string): MarkdownStructure {
  const headings: number[] = [];
  const lists: { ordered: boolean; items: number }[] = [];
  let fence: string | null = null;
  let block: { ordered: boolean; base: number; items: number } | null = null;
  const closeBlock = () => {
    if (block) lists.push({ ordered: block.ordered, items: block.items });
    block = null;
  };

  for (const line of body.split(/\r?\n/)) {
    const fenceMatch = /^\s*(```+|~~~+)/.exec(line);
    if (fence) {
      if (fenceMatch && fenceMatch[1].startsWith(fence)) fence = null;
      continue;
    }
    if (fenceMatch) {
      closeBlock();
      fence = fenceMatch[1];
      continue;
    }
    if (line.trim() === '') continue;
    const indent = line.length - line.trimStart().length;
    const heading = /^ {0,3}(#{1,6})(\s|$)/.exec(line);
    if (heading) {
      closeBlock();
      headings.push(heading[1].length);
      continue;
    }
    const item = /^(\s*)([-*+]|\d{1,9}[.)])\s+\S/.exec(line);
    if (item) {
      const itemIndent = item[1].length;
      const ordered = /\d/.test(item[2]);
      // A change of bullet style (dash to number) starts a new list; deeper items are nested.
      if (block && itemIndent >= block.base && (itemIndent > block.base || ordered === block.ordered)) {
        if (itemIndent === block.base) block.items += 1;
      } else {
        closeBlock();
        block = { ordered, base: itemIndent, items: 1 };
      }
      continue;
    }
    if (block && indent > block.base) {
      // Continuation of the current item (indented text, or a nested paragraph).
      continue;
    }
    closeBlock();
  }
  closeBlock();

  const links = (body.match(/(?<!!)\[[^\][\n]*\]\([^)\s]*(?:\s[^)]*)?\)/g) ?? []).length;
  return { headings, lists, links };
}

/** Digit values from any Unicode decimal-digit script (Arabic-Indic, full-width, Devanagari, ...), as ASCII. */
const ND = /\p{Nd}/u;

function digitValue(ch: string): string {
  const cp = ch.codePointAt(0) ?? 0;
  if (cp >= 48 && cp <= 57) return ch;
  let start = cp;
  while (start > 0 && ND.test(String.fromCodePoint(start - 1))) start -= 1;
  return String((cp - start) % 10);
}

/**
 * Numbers a translation is expected to change: emergency numbers (911 becomes
 * 112, 999, 119 and so on), and helplines. Their correctness is an L10N-009
 * check against each country's official source, not a structure check.
 */
const LOCALE_FACT_NUMBERS = new Set(['911', '112', '999', '119', '988']);

/**
 * The numbers in a text as a sorted list of digit runs. Thousands separators
 * (`8,000`, `8.000`, `8 000`, `8000`) read as one number. URLs, phone-number
 * shapes and locale facts (see LOCALE_FACT_NUMBERS) are removed first. Order is
 * ignored because translators move numbers within a sentence.
 */
export function normalizeDigits(text: string): string[] {
  const cleaned = text
    // A link target ends at its closing parenthesis; one level of parentheses inside it (a DOI) is allowed.
    // Text may follow with no space (Japanese, Chinese), so the end is not found by looking for a space.
    .replace(/\]\((?:[^()\s]|\([^()\s]*\))*\)/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/\+?\d[\d\s().-]{5,}\d/g, (match) => (match.replace(/\D/g, '').length >= 7 ? ' ' : match))
    .replace(/(?<!\p{Nd})\p{Nd}{1,3}(?:[.,\u00a0\u202f' ’]\p{Nd}{3}(?!\p{Nd}))+/gu, (match) => match.replace(/\D/g, ''));
  const runs: string[] = [];
  let current = '';
  for (const ch of cleaned) {
    if (ND.test(ch)) {
      current += digitValue(ch);
    } else if (current !== '') {
      runs.push(current);
      current = '';
    }
  }
  if (current !== '') runs.push(current);
  return runs.filter((run) => !LOCALE_FACT_NUMBERS.has(run)).sort();
}

function multisetDifference(from: string[], minus: string[]): string[] {
  const counts = new Map<string, number>();
  for (const value of minus) counts.set(value, (counts.get(value) ?? 0) + 1);
  const missing: string[] = [];
  for (const value of from) {
    const left = counts.get(value) ?? 0;
    if (left > 0) counts.set(value, left - 1);
    else missing.push(value);
  }
  return missing;
}

/** The text of a guide that can carry numbers: the frontmatter prose and the body. */
function guideText(doc: FrontmatterSplit): string {
  const fm = doc.frontmatter;
  const parts: string[] = [];
  for (const key of ['title', 'seoTitle', 'description', 'summary']) {
    if (typeof fm[key] === 'string') parts.push(fm[key] as string);
  }
  for (const point of asArray(fm.keyPoints)) if (typeof point === 'string') parts.push(point);
  for (const pair of asArray(fm.faq)) {
    if (isRecord(pair)) parts.push(String(pair.q ?? ''), String(pair.a ?? ''));
  }
  for (const source of asArray(fm.sources)) if (isRecord(source)) parts.push(String(source.title ?? ''));
  parts.push(doc.body);
  return parts.join('\n');
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function same(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Compares a translated guide with its English source. Returns one entry per
 * structural difference; an empty list means the structure survives.
 */
export function compareDocuments(english: FrontmatterSplit, translated: FrontmatterSplit, options: CompareOptions): Mismatch[] {
  const out: Mismatch[] = [];
  const en = english.frontmatter;
  const tr = translated.frontmatter;

  const enKeys = Object.keys(en);
  const trKeys = Object.keys(tr);
  const allowedExtra = new Set<string>(options.translation ? TRANSLATION_ONLY_KEYS : []);
  const missing = enKeys.filter((key) => !(key in tr));
  const extra = trKeys.filter((key) => !(key in en) && !allowedExtra.has(key));
  if (missing.length || extra.length) {
    out.push({ field: 'frontmatter.keys', detail: `missing: ${missing.join(', ') || 'none'}; extra: ${extra.join(', ') || 'none'}` });
  }

  for (const key of KEYS_THAT_MUST_MATCH) {
    if (key in en && !same(en[key], tr[key])) {
      out.push({ field: key, detail: `en: ${JSON.stringify(en[key])} tr: ${JSON.stringify(tr[key])}` });
    }
  }
  for (const key of LISTS_THAT_MUST_MATCH) {
    if (key in en && !same(en[key], tr[key])) {
      out.push({ field: key, detail: `en: ${JSON.stringify(en[key])} tr: ${JSON.stringify(tr[key])}` });
    }
  }

  for (const key of ['keyPoints', 'faq'] as const) {
    const enCount = asArray(en[key]).length;
    const trCount = asArray(tr[key]).length;
    if (enCount !== trCount) out.push({ field: key, detail: `en: ${enCount} tr: ${trCount}` });
  }

  const enUrls = asArray(en.sources).map((s) => (isRecord(s) ? s.url : undefined));
  const trUrls = asArray(tr.sources).map((s) => (isRecord(s) ? s.url : undefined));
  if (!same(enUrls, trUrls)) out.push({ field: 'sources', detail: `en: ${enUrls.length} tr: ${trUrls.length} (URLs must match in order)` });

  const enMd = markdownStructure(english.body);
  const trMd = markdownStructure(translated.body);
  if (!same(enMd.headings, trMd.headings)) {
    out.push({ field: 'headings', detail: `en: [${enMd.headings}] tr: [${trMd.headings}]` });
  }
  if (!same(enMd.lists, trMd.lists)) {
    const show = (lists: MarkdownStructure['lists']) => lists.map((l) => `${l.ordered ? 'ol' : 'ul'}:${l.items}`).join(' ');
    out.push({ field: 'lists', detail: `en: [${show(enMd.lists)}] tr: [${show(trMd.lists)}]` });
  }
  if (enMd.links !== trMd.links) out.push({ field: 'links', detail: `en: ${enMd.links} tr: ${trMd.links}` });

  const enDigits = normalizeDigits(guideText(english));
  const trDigits = normalizeDigits(guideText(translated));
  const lost = multisetDifference(enDigits, trDigits);
  const added = multisetDifference(trDigits, enDigits);
  if (lost.length || added.length) {
    out.push({ field: 'digits', detail: `missing: ${lost.join(' ') || 'none'}; extra: ${added.join(' ') || 'none'}` });
  }
  return out;
}

/** Reads the parts of a parsed activity card frontmatter that the structure check uses. */
export function activityCardLike(data: Record<string, unknown>): ActivityCardLike {
  const images = asArray(data.images).map((image) => (isRecord(image) && typeof image.step === 'number' ? image.step : null));
  return {
    steps: asArray(data.steps),
    variations: asArray(data.variations).map((v) => ({ kind: String(isRecord(v) ? v.kind : ''), text: isRecord(v) ? v.text : undefined })),
    safetyFlags: asArray(data.safetyFlags).map(String),
    supervision: String(data.supervision ?? ''),
    safety: asArray(data.safety),
    imageSteps: images,
  };
}

/** The structure of a card, as the numbers and kinds a translation must keep. */
export function activityStructure(data: Record<string, unknown>): ActivityStructure {
  const card = activityCardLike(data);
  return {
    steps: card.steps.length,
    variationKinds: card.variations.map((v) => v.kind),
    safetyFlags: card.safetyFlags,
    supervision: card.supervision,
    safetyLines: card.safety.length,
    imageSteps: card.imageSteps ?? [],
  };
}

/**
 * Compares a translated activity card with its English card. A missing
 * variation is a mismatch, so a translation that drops an adaptation fails.
 */
export function compareActivityCards(english: ActivityCardLike, translated: ActivityCardLike): Mismatch[] {
  const en = activityStructure({ steps: english.steps, variations: english.variations, safetyFlags: english.safetyFlags, supervision: english.supervision, safety: english.safety, images: (english.imageSteps ?? []).map((step) => ({ step })) });
  const tr = activityStructure({ steps: translated.steps, variations: translated.variations, safetyFlags: translated.safetyFlags, supervision: translated.supervision, safety: translated.safety, images: (translated.imageSteps ?? []).map((step) => ({ step })) });
  const out: Mismatch[] = [];

  if (en.steps !== tr.steps) out.push({ field: 'steps', detail: `en: ${en.steps} tr: ${tr.steps}` });
  if (!same(en.imageSteps, tr.imageSteps)) {
    out.push({ field: 'imageSteps', detail: `en: [${en.imageSteps}] tr: [${tr.imageSteps}]` });
  }

  const lostKinds = multisetDifference(en.variationKinds, tr.variationKinds);
  const addedKinds = multisetDifference(tr.variationKinds, en.variationKinds);
  if (lostKinds.length || addedKinds.length) {
    out.push({ field: 'variations', detail: `missing: ${lostKinds.join(', ') || 'none'}; extra: ${addedKinds.join(', ') || 'none'}` });
  } else if (!same(en.variationKinds, tr.variationKinds)) {
    out.push({ field: 'variations', detail: `order en: ${en.variationKinds.join(', ')} tr: ${tr.variationKinds.join(', ')}` });
  }

  if (!same(en.safetyFlags, tr.safetyFlags)) {
    out.push({ field: 'safetyFlags', detail: `en: ${en.safetyFlags.join(', ')} tr: ${tr.safetyFlags.join(', ')}` });
  }
  if (en.supervision !== tr.supervision) out.push({ field: 'supervision', detail: `en: ${en.supervision} tr: ${tr.supervision}` });
  if (en.safetyLines !== tr.safetyLines) out.push({ field: 'safety', detail: `en: ${en.safetyLines} tr: ${tr.safetyLines}` });
  return out;
}

