/**
 * Claims lint for English copy (TSA-028, CNT-1000, CNT-1001, CNT-1018).
 *
 * Creative Activities offers creative activities, not therapy, healing or
 * treatment. This module lists the phrases we must not use as our own claim,
 * and the narrow contexts where they are allowed: a negation ("does not treat"),
 * the profession named in a sentence about credentials ("art therapy is a
 * profession"), and the explainer pages listed in EXPLAINER_FILES.
 *
 * Node-only helpers (englishSources) read the content folders; checkClaims is pure.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';

export type ClaimViolation = {
  file: string;
  /** 1-based line in the file. */
  line: number;
  /** The text that matched, as written. */
  match: string;
  /** Rule id, for the failure message. */
  rule: string;
  /** The sentence around the match, trimmed. */
  sentence: string;
};

type Rule = {
  id: string;
  pattern: RegExp;
  /** Profession-context rules pass when the sentence names credentials, a profession or a referral. */
  profession?: boolean;
  /** Title-field rules apply to title, seoTitle, description and name lines, and ignore context. */
  titleOnly?: boolean;
};

/** Art and music labels: the profession's name, used as a label for our own activities is banned. */
const PROFESSION_LABEL = /\b(?:art|music|dance|drama|movement|expressive arts?|creative arts?|poetry|play)\s+therap(?:y|ies)\b/gi;

/** Other professions (occupational, physical, speech...) are ordinary referral vocabulary, not our claim. */
const OTHER_PROFESSION_PREFIX =
  '(?<!(?:occupational|physical|speech|language|recreational|horticultural|respiratory|animal[- ]assisted|art|music|dance|drama|movement|expressive arts?|creative arts?|poetry|play)\\s)';

const OBJECTS =
  'memory|cognition|cognitive|brain|mind|anxiety|anxious|stress|depression|depressive|agitation|sundowning|dementia|alzheimer\\S*|decline|progression|mood|loneliness|pain|insomnia|symptoms?|ptsd|trauma|grief';

export const RULES: Rule[] = [
  {
    id: 'therapy-word',
    pattern: new RegExp(`${OTHER_PROFESSION_PREFIX}\\btherap(?:y|ies|eutic|eutically|eutics)\\b`, 'gi'),
    profession: true,
  },
  { id: 'profession-label', pattern: PROFESSION_LABEL, profession: true },
  { id: 'healing-and-cure', pattern: /\b(?:heals?|healing|healed|cures?|cured|curing)\b/gi },
  {
    id: 'treat-claim',
    pattern: new RegExp(`\\btreat(?:s|ing|ed)?\\s+(?:\\w+\\s+)?(?:${OBJECTS}|conditions?|illness|disease|disorders?|mental health)\\b`, 'gi'),
  },
  {
    id: 'outcome-claim',
    pattern: new RegExp(
      `\\b(?:improv\\w*|boost\\w*|sharpen\\w*|enhanc\\w*|strengthen\\w*|slow\\w*|prevent\\w*|reduc\\w*|lower\\w*|reverse\\w*|relie\\w*|eas(?:e|es|ing)|lift\\w*)\\s+(?:\\w+\\s+){0,2}?(?:${OBJECTS})\\b`,
      'gi',
    ),
  },
  { id: 'calm-claim', pattern: new RegExp(`\\bcalms?\\s+(?:\\w+\\s+)?(?:anxiety|stress|depression|agitation|sundowning|pain)\\b`, 'gi') },
  { id: 'stop-claim', pattern: /\bstops?\s+(?:dementia|alzheimer\S*|decline|progression|memory loss)\b/gi },
  {
    id: 'cognitive-outcome',
    pattern: /\b(?:cognitive|memory|brain)\s+(?:benefits?|boosts?|improvements?|gains?|training|function)\b|\bbetter memory\b/gi,
  },
  { id: 'brain-training', pattern: /\bbrain[- ](?:training|age|boost(?:ing|er)?|workouts?|exercises?)\b|\btrain your brain\b/gi },
  // TSA-029: games are described by what they are, never as exercises that improve something.
  { id: 'memory-exercise', pattern: /\bmemory (?:exercises?|workouts?|training|boosters?)\b/gi },
  { id: 'mental-workout', pattern: /\bmental (?:workouts?|exercises?|fitness|gym)\b/gi },
  { id: 'keeps-sharp', pattern: /\bkeeps? (?:your |the |their |a )?(?:mind|brain|memory|wits)\s+(?:sharp|active|young|fit|healthy)\b/gi },
  {
    id: 'brain-benefit',
    pattern: /\b(?:supports?|boosts?|improves?|protects?|helps?|good for|great for|best for)\s+(?:your |the |their |a |healthy )?(?:brain|memory|mind|cognition|cognitive)(?: health| function| power)?\b/gi,
  },
  { id: 'delays-decline', pattern: /\bdelays?\s+(?:the\s+)?(?:onset|progression|decline|dementia|alzheimer\S*|memory loss)\b/gi },
  { id: 'proof-claim', pattern: /\b(?:clinically|scientifically)\s+(?:proven|proved|shown|tested|validated)\b|\bproven\b/gi },
  { id: 'stress-relief', pattern: /\bstress[- ]relie(?:f|ving|ver)s?\b/gi },
  { id: 'dementia-sufferer', pattern: /\bdementia sufferers?\b/gi },
  // TSA-022: an activity is "playful practice", never a claim to build a named skill, unless the sentence cites evidence.
  {
    id: 'skill-claim',
    pattern:
      /\b(?:builds?|develops?|boosts?|improves?|strengthens?|teaches|enhances?|promotes?|fosters?|sharpens?)\s+(?:\w+\s+){0,3}?(?:skills?|motor|literacy|numeracy|vocabulary|coordination|confidence|creativity|dexterity|imagination|self-esteem|resilience|empathy|school readiness|development)\b/gi,
  },
  { id: 'skill-building', pattern: /\bskill[- ]building\b/gi },
  // CNT-1004: no "reviewed" badge in copy. A review is shown only from a card's review record.
  {
    id: 'review-badge',
    pattern: /\b(?:clinically|medically|therapist|doctor|clinician|expert|professionally|credentialed)[- ](?:reviewed|approved|endorsed|verified|certified)\b/gi,
  },
  {
    id: 'condition-title',
    titleOnly: true,
    pattern: /\b(?:art|music|painting|drawing|coloring|colouring|craft|crafts|creative)\b[^.\n]{0,40}?\bfor\s+(?:anxiety|depression|ptsd|stress|trauma|anxious)\b/gi,
  },
];

/** Explainer pages may name the profession (CNT-1000). Their titles and profession sentences are exempt. */
export const EXPLAINER_FILES = [
  'guides/activities/art-therapy-or-creative-activity.md',
  'guides/activities/finding-an-art-therapist.md',
  'guides/activities/creative-arts-therapies.md',
  'pages/art-therapy-and-creative-activities.astro',
];

/** Link labels that point to an explainer page (TSA-030): the footer link names the profession boundary page. */
export const EXPLAINER_LABELS = ['i18n/ui/en.json#/footer/artTherapyBoundary'];

const PROFESSION_CONTEXT =
  /\b(?:profession|professional|professionals|qualified|credential\w*|registered|register|licensed|licen[cs]e|trained|training|regulated|protected title|ATR|ATR-BC|HCPC|therapists?|doctor|clinician|care team|find|look for|ask|check|refer\w*|explain\w*|difference)\b/i;

const NEGATION = /\b(?:not|no|never|nor|none|nothing|without|cannot|can[’']t|don[’']t|doesn[’']t|isn[’']t|aren[’']t|wasn[’']t|won[’']t|neither|unproven|instead of|rather than|avoid\w*|free of)\b/i;

/** Research framing (CONTENT_GUIDE "Health and research pages"): hedged or sourced statements about evidence. */
const RESEARCH_FRAME =
  /\b(?:linked|link|links|associated|association|research\w*|stud(?:y|ies)|trials?|evidence|suggests?|found|finds|mixed|unclear|whether|not (?:been )?(?:shown|proven|proved|clear|linked|enough)|no (?:brain game|evidence|study|studies|trial|proof|single)|claims?|mostly|narrow|weak|FTC|Lumosity|ACTIVE|question|according to|lists?|notes?|reports?|says|said|summari[sz]ed)\b/i;

/** Hedged modals are research framing only on health pages (CONTENT_GUIDE: "may lower risk"). */
const HEDGE_MODAL = /\b(?:may|might|could)\b/i;

/** Warnings, and contrasts with other people's products: "be wary of any app that promises better memory". */
const WARNING_FRAME = /\b(?:be wary|beware|watch out|red flags?|warning signs?|promises?|scam|misleading|false|avoid|claims? (?:that|to)|says? (?:it|that|they)|won[’']t|no (?:one|single|app|game)|other (?:apps?|games?|sites?)|many apps|most of what|made for people who want)\b/i;

/** Medical framing: a sentence about a doctor's or clinician's treatment, not our activity. */
const MEDICAL_FRAME = /\b(?:doctor|clinician|medical|medication|medicines?|prescri\w*|care team|health care|healthcare|GP|specialist|diagnos\w*)\b/i;

// Titles, descriptions and names, and the alt text and caption of a card's picture (CNT-1000): all are shown
// out of context, in results and to screen readers, so no context excuses a claim in them.
const TITLE_FIELD = /^(?:title|seoTitle|description|name):|^\s+(?:alt|caption):/;

/** Sentence and paragraph boundaries. Wrapped lines do not end a sentence; blank lines, list items and YAML keys do. */
const FRONT_KEY =
  'title|seoTitle|description|name|summary|keyPoints|faq|sources|relatedGames|related|health|section|order|updated|published|enjoy|type|cost|mess|energy|supervision|settings|groups|senses|materials|substitutions|prepMinutes|activityMinutes|translatedFrom';
const BOUNDARY = new RegExp(`[.!?](?=\\s|$)|\\n\\s*\\n|\\n(?=\\s*(?:[-*] |\\d+\\. |#|(?:${FRONT_KEY}):))`, 'g');

/** The sentence around [start, end), from the last boundary before it to the next one after it. */
function sentenceAround(text: string, start: number, end: number): { before: string; sentence: string } {
  let from = 0;
  for (const m of text.slice(0, start).matchAll(BOUNDARY)) from = (m.index ?? 0) + m[0].length;
  const after = text.slice(end).match(new RegExp(BOUNDARY.source));
  const to = after?.index === undefined ? text.length : end + after.index + (/[.!?]/.test(after[0]) ? 1 : 0);
  return { before: text.slice(from, start), sentence: text.slice(from, to).trim() };
}

/**
 * Blank out link targets, URLs and path-like slugs (keeping positions), so that a therapy word in a
 * source address or a related-guide slug is not read as copy.
 */
function maskLinks(text: string): string {
  const blank = (m: string) => m.replace(/[^\n]/g, ' ');
  return text
    .replace(/\]\([^)]*\)/g, (m) => ']' + blank(m).slice(1))
    .replace(/https?:\/\/[^\s)\]"']+/g, blank)
    .replace(/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_.-]+)+/g, blank);
}

/** True when the match sits inside an open quotation on its line (a quoted claim, not ours). */
function insideQuote(text: string, index: number): boolean {
  const lineStart = text.lastIndexOf('\n', index - 1) + 1;
  const before = text.slice(lineStart, index);
  const straight = (before.match(/"/g) ?? []).length;
  const opened = (before.match(/“/g) ?? []).length - (before.match(/”/g) ?? []).length;
  return straight % 2 === 1 || opened > 0;
}

function lineOf(text: string, index: number): number {
  return text.slice(0, index).split('\n').length;
}

/**
 * The contexts that make a match acceptable: negation before it, a question, a quotation, a
 * credential sentence (profession rules), research or warning framing, a medical sentence (treat
 * rule), and hedged modals on health pages only.
 */
function allowedInContext(c: { rule: Rule; before: string; sentence: string; inQuote: boolean; healthPage: boolean }): boolean {
  const { rule, before, sentence, inQuote, healthPage } = c;
  if (NEGATION.test(before)) return true;
  if (sentence.includes('?') || inQuote) return true;
  if (rule.profession) return PROFESSION_CONTEXT.test(sentence);
  if (RESEARCH_FRAME.test(sentence) || WARNING_FRAME.test(sentence)) return true;
  if (healthPage && HEDGE_MODAL.test(sentence)) return true;
  return rule.id === 'treat-claim' && MEDICAL_FRAME.test(sentence);
}

/** Find violations in one file's text. `file` is the path relative to the English content root. */
export function checkClaims(source: string, file: string): ClaimViolation[] {
  const text = maskLinks(source);
  const violations: ClaimViolation[] = [];
  const explainer = EXPLAINER_FILES.includes(file) || EXPLAINER_LABELS.includes(file);
  const healthPage = file.startsWith('guides/brain-health/') || /^health: true$/m.test(source);
  const titleLines = new Set<number>();
  text.split('\n').forEach((line, i) => {
    if (TITLE_FIELD.test(line)) titleLines.add(i + 1);
  });

  for (const rule of RULES) {
    if (explainer && rule.profession) continue;
    for (const m of text.matchAll(new RegExp(rule.pattern.source, rule.pattern.flags))) {
      const start = m.index ?? 0;
      const end = start + m[0].length;
      const line = lineOf(text, start);
      const { before, sentence } = sentenceAround(text, start, end);
      const inTitle = titleLines.has(line);

      if (rule.titleOnly && !inTitle) continue;
      if (inTitle && rule.profession && !explainer) {
        // Titles, descriptions and names never use a therapy word, with or without context.
        violations.push({ file, line, match: m[0], rule: rule.id, sentence });
        continue;
      }
      if (allowedInContext({ rule, before, sentence, inQuote: !inTitle && !file.endsWith('.json') && insideQuote(text, start), healthPage })) continue;
      violations.push({ file, line, match: m[0], rule: rule.id, sentence });
    }
  }
  return violations.sort((a, b) => a.line - b.line);
}

const CONTENT = new URL('../content/', import.meta.url);
const PAGES = new URL('../pages/', import.meta.url);

function walk(dir: URL, rel = ''): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(new URL(rel, dir), { withFileTypes: true })) {
    const path = rel ? `${rel}${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...walk(dir, `${path}/`));
    else out.push(path);
  }
  return out;
}

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

/**
 * Every string value in a JSON document, with its key path (`/a/b[0]`). Each value is checked on its
 * own, so a negation in one value cannot excuse a claim in the next. Keys starting with `@` (ARB
 * developer notes) are skipped: they are not shown to readers.
 */
export function jsonStrings(value: Json, path = '', skipAt = false): { path: string; text: string }[] {
  if (typeof value === 'string') return [{ path, text: value }];
  if (Array.isArray(value)) return value.flatMap((v, i) => jsonStrings(v, `${path}[${i}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => (skipAt && k.startsWith('@') ? [] : jsonStrings(v, `${path}/${k}`)));
  }
  return [];
}

/** English copy outside the content folders: the app ARB, store listings and store text files (TSA-032). */
const REPO = new URL('../../../', import.meta.url);

/** Every English source the lint covers: activity cards, hubs, English guides, the explainer page, English UI and game strings, the app ARB file and the English store copy. */
export function englishSources(): { file: string; text: string }[] {
  const sources: { file: string; text: string }[] = [];
  const add = (file: string, path: URL) => sources.push({ file, text: readFileSync(path, 'utf8') });
  const addJson = (file: string, path: URL, skipAt = false) => {
    for (const { path: at, text } of jsonStrings(JSON.parse(readFileSync(path, 'utf8')) as Json, '', skipAt)) {
      sources.push({ file: `${file}#${at}`, text });
    }
  };
  for (const f of walk(CONTENT).filter((f) => f.startsWith('activity-cards/') || f.startsWith('hubs/'))) {
    if (f.endsWith('.md')) add(f, new URL(f, CONTENT));
  }
  for (const f of walk(CONTENT).filter((f) => f.startsWith('guides/'))) {
    if (f.endsWith('.md')) add(f, new URL(f, CONTENT));
  }
  addJson('i18n/ui/en.json', new URL('../i18n/ui/en.json', import.meta.url));
  addJson('i18n/games/en.json', new URL('../i18n/games/en.json', import.meta.url));
  addJson('i18n/play/en.json', new URL('../i18n/play/en.json', import.meta.url));
  const page = 'art-therapy-and-creative-activities.astro';
  if (existsSync(new URL(page, PAGES))) add(`pages/${page}`, new URL(page, PAGES));
  addJson('lib/l10n/arb/app_en.arb', new URL('lib/l10n/arb/app_en.arb', REPO), true);
  addJson('metadata/app-store.en-US.json', new URL('metadata/app-store.en-US.json', REPO));
  addJson('metadata/google-play.en-US.json', new URL('metadata/google-play.en-US.json', REPO));
  for (const f of ['en-US/description.txt', 'en-US/promotional_text.txt', 'en-US/release_notes.txt', 'en-US/subtitle.txt', 'en-US/keywords.txt', 'en-US/name.txt']) {
    add(`metadata/${f}`, new URL(`metadata/${f}`, REPO));
  }
  for (const f of ['full_description.txt', 'release_notes.txt', 'short_description.txt', 'name.txt']) {
    add(`metadata/google-play/en-US/${f}`, new URL(`metadata/google-play/en-US/${f}`, REPO));
  }
  return sources;
}
