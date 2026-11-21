/**
 * Draft claims check for translated guides (TSA-028). Pure matching logic; the
 * script site/scripts/check-claims-i18n.mjs reads the files and prints the report.
 *
 * The term list in site/src/data/claims-i18n.json is unreviewed: a native reviewer
 * confirms every term. Matching is report-only; nothing here decides a translation
 * is wrong.
 */

export type ClaimTermCell = { forms: string[]; basis: string | null };

export type ClaimTermEntry = {
  id: string;
  english?: string;
  notes?: string;
  terms: Record<string, ClaimTermCell>;
};

export type ClaimTermsFile = {
  languages: string[];
  entries: ClaimTermEntry[];
};

export type TermHit = {
  /** The entry id the matched form belongs to. */
  id: string;
  /** The form as listed in the data file. */
  form: string;
  /** The text as written in the source, for the report. */
  matched: string;
  /** 1-based line in the scanned text. */
  line: number;
};

/**
 * Arabic attaches prefixes to nouns: و (and), ف (so), ب (with/in), ل (for), ك (like),
 * then the definite article ال or لل. A term matches with any of these in front.
 */
const ARABIC_PREFIX = '(?:[وفبلك]?(?:ال|لل)?)';

/**
 * Letters and digits end a word. Combining marks (Arabic tanween and vowel marks,
 * Bengali vowel signs, Latin accents written decomposed) do not, so an inflected
 * form such as Arabic علاجًا still matches the bare term.
 */
const WORD_CHAR = '\\p{L}\\p{N}';

export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Regex for one form in one language, with word boundaries, case folding and any whitespace between words. */
export function formPattern(form: string, lang: string): RegExp {
  const words = form.normalize('NFC').trim().split(/\s+/).map(escapeRegExp);
  const prefix = lang === 'ar' ? ARABIC_PREFIX : '';
  return new RegExp(`(?<![${WORD_CHAR}])${prefix}${words.join('\\s+')}(?![${WORD_CHAR}])`, 'giu');
}

/**
 * Blank out URLs with spaces, keeping every newline and every position, so a term
 * inside a source link or a slug is not read as copy and line numbers stay correct.
 */
export function maskUrls(text: string): string {
  return text.replace(/https?:\/\/[^\s)\]"'<>]+/g, (m) => m.replace(/[^\n]/g, ' '));
}

function lineOf(text: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index; i++) if (text.charCodeAt(i) === 10) line++;
  return line;
}

/** Every hit of every form of the given language in one text. Hits are sorted by line. */
export function findTermHits(text: string, lang: string, entries: ClaimTermEntry[]): TermHit[] {
  const source = maskUrls(text.normalize('NFC'));
  const hits: TermHit[] = [];
  for (const entry of entries) {
    const cell = entry.terms[lang];
    if (!cell) continue;
    for (const form of cell.forms) {
      for (const m of source.matchAll(formPattern(form, lang))) {
        hits.push({ id: entry.id, form, matched: m[0], line: lineOf(source, m.index ?? 0) });
      }
    }
  }
  return hits.sort((a, b) => a.line - b.line || a.id.localeCompare(b.id));
}

/**
 * Structural checks on the data file. Returns one message per problem; an empty list
 * means the file is well formed. A filled cell needs a basis; an empty cell has none.
 */
export function validateClaimTerms(data: unknown): string[] {
  const problems: string[] = [];
  if (!data || typeof data !== 'object') return ['data file is not an object'];
  const file = data as Partial<ClaimTermsFile>;
  if (!Array.isArray(file.languages) || file.languages.some((l) => typeof l !== 'string')) {
    problems.push('languages must be an array of language codes');
    return problems;
  }
  if (!Array.isArray(file.entries)) {
    problems.push('entries must be an array');
    return problems;
  }
  const ids = new Set<string>();
  for (const entry of file.entries as Partial<ClaimTermEntry>[]) {
    const id = typeof entry.id === 'string' ? entry.id : '(no id)';
    if (typeof entry.id !== 'string' || entry.id === '') problems.push('entry without an id');
    if (ids.has(id)) problems.push(`duplicate entry id ${id}`);
    ids.add(id);
    if (!entry.terms || typeof entry.terms !== 'object') {
      problems.push(`${id}: terms missing`);
      continue;
    }
    for (const lang of file.languages) {
      const cell = (entry.terms as Record<string, Partial<ClaimTermCell> | undefined>)[lang];
      if (!cell) {
        problems.push(`${id}/${lang}: cell missing`);
        continue;
      }
      if (!Array.isArray(cell.forms) || cell.forms.some((f) => typeof f !== 'string' || f.trim() === '')) {
        problems.push(`${id}/${lang}: forms must be non-empty strings`);
        continue;
      }
      if (cell.forms.length > 0 && (typeof cell.basis !== 'string' || cell.basis.trim() === '')) {
        problems.push(`${id}/${lang}: a filled cell needs a basis`);
      }
      if (cell.forms.length === 0 && cell.basis !== null) {
        problems.push(`${id}/${lang}: an empty cell has basis null`);
      }
    }
  }
  return problems;
}
