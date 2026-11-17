// Plain-language prompts for an editor (TSA-008). A readability formula is a prompt, not a score target: it points at a
// step an editor may want to look at, and the editor decides. The one hard rule is the one the spec states: no step joins
// two actions with "and then". These functions are pure, so a test can feed them text.

/** A step of this many words or more is worth a second look. */
export const LONG_STEP_WORDS = 25;
/** More than this many sentences in a step suggests more than one action. */
export const MAX_SENTENCES_PER_STEP = 1;
/** A sentence of this many words or more, in a hub, is worth a second look. */
export const LONG_SENTENCE_WORDS = 30;

// "Now and then" is an idiom for "sometimes", not two actions.
const IDIOM = /\bnow and then\b/gi;
const AND_THEN = /\band then\b/i;

/** The words in a text: letters, with an apostrophe or hyphen inside a word. */
export function wordsOf(text) {
  return text.match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g) ?? [];
}

/** How many sentences a text has, at least one. A full stop inside a number or an abbreviation is not counted. */
export function sentenceCount(text) {
  const ends = text.match(/[.!?]+(?=\s|$)/g) ?? [];
  return Math.max(1, ends.length);
}

/** A rough syllable count for an English word. It is a prompt, so it only has to be close. */
export function syllables(word) {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length === 0) return 0;
  if (w.length <= 3) return 1;
  const stripped = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
  const groups = stripped.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

/** The Flesch-Kincaid grade level of a text: about the school year at which it reads easily. A prompt, not a target. */
export function readingGrade(text) {
  const words = wordsOf(text);
  if (words.length === 0) return 0;
  const syllableTotal = words.reduce((sum, word) => sum + syllables(word), 0);
  return 0.39 * (words.length / sentenceCount(text)) + 11.8 * (syllableTotal / words.length) - 15.59;
}

/** Whether a step joins two actions with "and then". */
export function joinsTwoActions(step) {
  return AND_THEN.test(step.replace(IDIOM, ''));
}

/**
 * What an editor may want to look at in one step. `rule` prompts break the standard and fail the check; the others are
 * advisory.
 */
export function stepPrompts(step) {
  const prompts = [];
  const words = wordsOf(step).length;
  if (joinsTwoActions(step)) prompts.push({ id: 'and-then', rule: true, note: 'joins two actions with "and then"' });
  if (words >= LONG_STEP_WORDS) prompts.push({ id: 'long-step', rule: false, note: `${words} words` });
  const sentences = sentenceCount(step);
  if (sentences > MAX_SENTENCES_PER_STEP) prompts.push({ id: 'several-sentences', rule: false, note: `${sentences} sentences` });
  return prompts;
}

/** The steps in a card's front matter: the lines of the indented list below `steps:`, unquoted. */
export function readSteps(frontMatter) {
  const lines = frontMatter.split('\n');
  const start = lines.findIndex((line) => /^steps:\s*$/.test(line));
  if (start === -1) return [];
  const steps = [];
  for (const line of lines.slice(start + 1)) {
    const item = /^ {2}- (.*)$/.exec(line);
    if (!item) break;
    steps.push(unquote(item[1].trim()));
  }
  return steps;
}

function unquote(value) {
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) return value.slice(1, -1).replace(/\\"/g, '"');
  if (value.length >= 2 && value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1).replace(/''/g, "'");
  return value;
}

/** The front matter and the body of a markdown file. */
export function splitMarkdown(text) {
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text);
  return match ? { frontMatter: match[1], body: match[2] } : { frontMatter: '', body: text };
}

/** The sentences of a markdown body as plain text, without links, markup and list markers. */
export function bodySentences(body) {
  const plain = body
    .replace(/<[^>]+>/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^\s*\|.*$/gm, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}(?:#{1,6}\s+|[-*+]\s+|\d+\.\s+|>\s*)/gm, '')
    .replace(/[*_`|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.split(/(?<=[.!?])\s+(?=[A-Z"“])/).map((s) => s.trim()).filter((s) => wordsOf(s).length > 0);
}

/** The sentences of a hub that run to the limit or longer. */
export function longSentences(body, limit = LONG_SENTENCE_WORDS) {
  return bodySentences(body).filter((sentence) => wordsOf(sentence).length >= limit);
}

/** The prompts for every step of one card. */
export function cardPrompts(id, steps) {
  return steps.flatMap((step, i) => stepPrompts(step).map((prompt) => ({ card: id, step: i + 1, stepText: step, ...prompt })));
}

/** Totals over many cards: `[{ id, steps }]`. */
export function summarize(cards) {
  const all = cards.flatMap((card) => card.steps);
  const lengths = all.map((step) => wordsOf(step).length).sort((a, b) => a - b);
  const grades = all.map((step) => readingGrade(step));
  const prompts = cards.flatMap((card) => cardPrompts(card.id, card.steps));
  return {
    cards: cards.length,
    steps: all.length,
    longest: lengths.at(-1) ?? 0,
    meanGrade: grades.length ? grades.reduce((a, b) => a + b, 0) / grades.length : 0,
    rule: prompts.filter((p) => p.rule),
    long: prompts.filter((p) => p.id === 'long-step'),
    several: prompts.filter((p) => p.id === 'several-sentences'),
  };
}
