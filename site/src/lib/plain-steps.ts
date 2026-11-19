/**
 * Plain-language steps (WEB-039). A card may carry a shorter version of its
 * steps, shown when a reader switches on "Short steps". The rules here are
 * checked at build time by the card schema (word limit, one action) and by
 * plain-steps.test.ts (safety words and materials, across every card).
 */

/** One plain step is read at a glance: at most this many words. */
export const PLAIN_STEP_MAX_WORDS = 14;

/**
 * Words that mark a safety instruction (for example "keep the scissors with the helper").
 * A standard step that contains one must keep it in a plain step too, and a plain step
 * may use one only when the card's standard steps or safety notes already say it.
 * Each matches at the start of a word, so "cut" also matches "cutting".
 */
export const SAFETY_KEYWORDS = [
  'adult',
  'scissors',
  'cut',
  'hot',
  'water',
  'wash',
  'small parts',
  'mouth',
  'choke',
  'glue',
  'sharp',
  'supervise',
  'near',
] as const;

/**
 * Everyday objects a plain step may name. A plain step names one only when the
 * card already does, in its materials list or in its standard steps, so a
 * shortened step cannot add a thing to gather but may keep what the standard
 * steps say (a drink of water, a flower bed). Furniture (table, chair) is left
 * out on purpose: it is not a material.
 */
const MATERIAL_WORDS: readonly RegExp[] = [
  /\bpaper/i,
  /\bcards?\b/i,
  /\bglue/i,
  /\bpictures?\b/i,
  /\benvelopes?\b/i,
  /\bleaf|\bleaves\b/i,
  /\bflowers?\b/i,
  /\bstems?\b/i,
  /\bbooks?\b/i,
  /\bbuttons?\b/i,
  /\bbowls?\b/i,
  /\btrays?\b/i,
  /\bmuffin/i,
  /\bdish(?:es)?\b/i,
  /\byarn\b/i,
  /\bbaskets?\b/i,
  /\bjars?\b/i,
  /\btowels?\b/i,
  /\bcrayons?\b/i,
  /\btape\b/i,
  /\bbasin/i,
  /\bwater/i,
  /\bmusic\b/i,
  /\bphone/i,
];

/** True when `text` contains the keyword at the start of a word, ignoring case. */
export function hasKeyword(text: string, keyword: string): boolean {
  const pattern = keyword.split(' ').join('\\s+');
  return new RegExp(`\\b${pattern}`, 'i').test(text);
}

/** The safety keywords a piece of text contains. */
export function safetyKeywordsIn(text: string): string[] {
  return SAFETY_KEYWORDS.filter((keyword) => hasKeyword(text, keyword));
}

/** Problems with the plain steps alone: word count and one action per step. */
export function plainStepProblems(plain: readonly string[]): string[] {
  const problems: string[] = [];
  for (const step of plain) {
    const text = step.trim();
    const words = text.split(/\s+/).filter(Boolean).length;
    if (words === 0) problems.push('a plain step is empty');
    if (words > PLAIN_STEP_MAX_WORDS) problems.push(`"${text}" has ${words} words; the limit is ${PLAIN_STEP_MAX_WORDS}`);
    if (/\band then\b/i.test(text) || text.includes(';')) problems.push(`"${text}" joins two actions`);
    const body = text.replace(/[.!?]+$/, '');
    if (/[.!?]/.test(body)) problems.push(`"${text}" has more than one sentence`);
  }
  return problems;
}

/**
 * Safety wording: every safety keyword in a standard step must appear in some plain
 * step, and a plain step may not add a safety keyword the standard steps and safety
 * notes do not already contain.
 */
export function plainSafetyProblems(
  standard: readonly string[],
  plain: readonly string[],
  safety: readonly string[],
): string[] {
  const problems: string[] = [];
  const plainText = plain.join('\n');
  const knownText = [...standard, ...safety].join('\n');
  for (const step of standard) {
    for (const keyword of safetyKeywordsIn(step)) {
      if (!hasKeyword(plainText, keyword)) problems.push(`standard step "${step}" has "${keyword}", which no plain step keeps`);
    }
  }
  for (const step of plain) {
    for (const keyword of safetyKeywordsIn(step)) {
      if (!hasKeyword(knownText, keyword)) problems.push(`plain step "${step}" adds the safety word "${keyword}"`);
    }
  }
  return problems;
}

/** A plain step may name an everyday object only when the card's materials list or standard steps name it. */
export function plainMaterialProblems(plain: readonly string[], materials: readonly string[], steps: readonly string[] = []): string[] {
  const materialsText = [...materials, ...steps].join('\n');
  const problems: string[] = [];
  for (const step of plain) {
    for (const pattern of MATERIAL_WORDS) {
      const match = pattern.exec(step);
      if (match && !pattern.test(materialsText)) problems.push(`plain step "${step}" names "${match[0]}", which the card's materials and steps do not`);
    }
  }
  return problems;
}
