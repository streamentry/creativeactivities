/**
 * WEB-002: turns a short description of a situation into the finder's choices.
 *
 * "My dad likes music but tires quickly" becomes the music kind, low energy and seated. The first version
 * reads a reviewed list of words and phrases, not a language model, and runs in the visitor's browser: the
 * words are not sent or stored. It maps to situations and fit only. A word that names a condition, a
 * diagnosis or a feeling that points to one ("arthritis", "anxious", "forgetful") maps to nothing, and a
 * test keeps it that way.
 */
import {
  ENERGY_CHOICES,
  GROUP_LABELS,
  MATERIAL_CHOICES,
  MESS_CHOICES,
  SENSE_CHOICES,
  SETTING_LABELS,
  SUPERVISION_CHOICES,
  TALKING_CHOICES,
  TIME_CHOICES,
  TYPE_LABELS,
  type ActivitySetting,
} from './activities';
import { normalize, stem } from './search';

export type Facet = 'type' | 'time' | 'materials' | 'setting' | 'group' | 'energy' | 'mess' | 'sense' | 'talking' | 'supervision';

/** The order chips are shown in: the first three are the finder's first-view questions. */
export const FACET_ORDER: readonly Facet[] = ['type', 'time', 'materials', 'setting', 'group', 'energy', 'mess', 'sense', 'talking', 'supervision'];

/** Facets the finder keeps behind "More ways to fit the moment". */
export const MORE_FACETS: ReadonlySet<Facet> = new Set(['setting', 'group', 'energy', 'mess', 'sense', 'talking', 'supervision']);

export interface Chip {
  readonly facet: Facet;
  readonly value: string;
  /** Shown on the chip, in the finder's own words. */
  readonly label: string;
}

const FACET_NAME: Readonly<Record<Facet, string>> = {
  type: 'Kind',
  time: 'Time',
  materials: 'Materials',
  setting: 'Where',
  group: 'Who',
  energy: 'Energy',
  mess: 'Mess',
  sense: 'Enjoys',
  talking: 'Talking',
  supervision: 'Help',
};

const labelIn = (list: readonly { value: string; label: string }[], value: string) => list.find((c) => c.value === value)?.label ?? value;

/** The finder's own label for a choice, so a chip reads like the form. */
export function chipLabel(facet: Facet, value: string): string {
  const text =
    facet === 'type' ? (TYPE_LABELS as Record<string, string>)[value]
    : facet === 'group' ? (GROUP_LABELS as Record<string, string>)[value]
    : facet === 'setting' ? (SETTING_LABELS as Record<string, string>)[value as ActivitySetting]
    : facet === 'time' ? labelIn(TIME_CHOICES, value)
    : facet === 'materials' ? labelIn(MATERIAL_CHOICES, value)
    : facet === 'energy' ? labelIn(ENERGY_CHOICES, value)
    : facet === 'mess' ? labelIn(MESS_CHOICES, value)
    : facet === 'sense' ? labelIn(SENSE_CHOICES, value)
    : facet === 'talking' ? labelIn(TALKING_CHOICES, value)
    : labelIn(SUPERVISION_CHOICES, value);
  return `${FACET_NAME[facet]}: ${(text ?? value).replace(/^./, (c) => c.toLowerCase())}`;
}

interface Rule {
  readonly facet: Facet;
  readonly value: string;
  /** Single words; each is matched by its stem, so list an inflection that stems differently (make, making). */
  readonly words?: readonly string[];
  /** Phrases, written as they read after `normalize` (lowercase, no apostrophes, hyphens as spaces). */
  readonly phrases?: readonly string[];
  /** A word match is skipped when one of these comes right before it ("adult child" is not a child). */
  readonly notAfter?: readonly string[];
}

/**
 * The reviewed list. Within a facet the choice named first in the description wins. Nothing here names a
 * condition: see `situation.test.ts`.
 */
export const RULES: readonly Rule[] = [
  // Kind of activity
  { facet: 'type', value: 'music', words: ['music', 'song', 'songs', 'sing', 'singing', 'singalong', 'tune', 'tunes', 'dance', 'dancing'] },
  { facet: 'type', value: 'art', words: ['paint', 'painting', 'watercolor', 'watercolour', 'draw', 'drawing', 'sketch', 'sketching', 'doodle', 'color', 'colour', 'coloring', 'colouring', 'art', 'pastel', 'pastels'] },
  { facet: 'type', value: 'nature', words: ['garden', 'gardening', 'plant', 'plants', 'flower', 'flowers', 'leaf', 'leaves', 'bird', 'birds', 'seeds', 'nature'] },
  { facet: 'type', value: 'conversation', words: ['chat', 'conversation', 'story', 'stories', 'photo', 'photos', 'album', 'reminisce', 'letter', 'letters', 'writing', 'write'], phrases: ['old memories', 'happy memories', 'family memories', 'share memories', 'sharing memories'] },
  { facet: 'type', value: 'sensory', words: ['sensory', 'massage', 'sort', 'sorting', 'buttons', 'yarn', 'wool', 'fabric'] },
  { facet: 'type', value: 'craft', words: ['craft', 'crafts', 'crafting', 'make', 'makes', 'making', 'collage', 'glue', 'knit', 'knitting', 'sew', 'sewing', 'crochet', 'fold', 'folding', 'origami', 'decorate', 'decorating', 'handmade'] },
  // Time (a number of minutes is read first; see `minutesIn`)
  { facet: 'time', value: '15', words: ['quick', 'short', 'brief', 'fiveminutes'], phrases: ['few minutes', 'little time', 'no time', 'between tasks', 'not long', 'quarter of an hour'] },
  { facet: 'time', value: '30', phrases: ['half hour', 'half an hour'] },
  // What is to hand
  { facet: 'materials', value: 'none', words: ['free'], phrases: ['nothing to buy', 'no cost', 'no money', 'what i have', 'what we have', 'already have', 'only have', 'at hand', 'around the house', 'in the house', 'household items'] },
  { facet: 'materials', value: 'low', words: ['cheap', 'inexpensive', 'budget', 'affordable'], phrases: ['low cost', 'small budget', 'not much money'] },
  // Where
  { facet: 'setting', value: 'bedside', words: ['bed', 'bedside', 'bedrest', 'bedridden', 'bedbound'], phrases: ['in bed', 'lap tray'] },
  { facet: 'setting', value: 'seated', words: ['seated', 'sit', 'sits', 'sitting', 'chair', 'armchair', 'wheelchair'], phrases: ['tires quickly', 'tire quickly', 'tires easily', 'tire easily', 'tired quickly', 'gets tired', 'low energy', 'sit down'] },
  { facet: 'setting', value: 'outdoors', words: ['outdoors', 'outdoor', 'outside', 'park', 'yard', 'backyard', 'patio'] },
  // Who
  { facet: 'group', value: 'intergenerational', words: ['grandchild', 'grandchildren', 'grandson', 'granddaughter', 'grandkid', 'grandkids', 'grandparent', 'grandparents', 'child', 'children', 'kid', 'kids', 'toddler', 'baby', 'sibling', 'siblings', 'nephew', 'niece'], phrases: ['all ages', 'mixed ages', 'mixed age'], notAfter: ['adult', 'grown', 'elderly'] },
  { facet: 'group', value: 'small-group', words: ['group', 'groups', 'class', 'friends', 'club', 'residents'], phrases: ['few people', 'several people'] },
  { facet: 'group', value: 'one-to-one', phrases: ['one to one', 'two of us', 'just us', 'me and my'] },
  // Energy
  { facet: 'energy', value: 'low', words: ['tired', 'tiring', 'sleepy', 'exhausted', 'restful'], phrases: ['low energy', 'not much energy', 'little energy', 'tires quickly', 'tire quickly', 'tires easily', 'tire easily', 'tired quickly', 'gets tired', 'sitting still', 'take it easy'] },
  // Mess
  { facet: 'mess', value: 'none', words: ['tidy', 'clean'], phrases: ['no mess', 'not messy', 'mess free', 'without mess', 'nothing messy', 'hates mess', 'dislikes mess', 'dislike mess', 'hates sticky', 'hate sticky', 'dislikes sticky', 'dislike sticky', 'doesnt like sticky', 'does not like sticky', 'avoid sticky', 'no sticky'] },
  { facet: 'mess', value: 'low', phrases: ['little mess', 'bit of mess', 'not too messy', 'minimal mess', 'a little mess'] },
  // What they enjoy
  { facet: 'sense', value: 'touch', words: ['touch', 'texture', 'textures', 'tactile', 'feel', 'feeling'] },
  { facet: 'sense', value: 'hearing', words: ['listen', 'listening', 'hear', 'hearing', 'sounds', 'voice'] },
  { facet: 'sense', value: 'sight', words: ['looking', 'colors', 'colours', 'bright', 'pictures', 'watching'] },
  { facet: 'sense', value: 'smell', words: ['scent', 'scents', 'smell', 'smells', 'lavender', 'fragrance'] },
  { facet: 'sense', value: 'movement', words: ['moving', 'movement', 'stretch', 'stretching', 'walk', 'walking'] },
  { facet: 'sense', value: 'calm', words: ['calm', 'calmer', 'quiet', 'quieter', 'peaceful', 'soothing', 'noisy', 'noise', 'loud'], phrases: ['too much going on', 'less to see', 'quiet time'] },
  // Talking
  { facet: 'talking', value: 'none', phrases: ['without words', 'no words', 'no talking', 'not talking', 'few words', 'speaks very little', 'speaks little', 'does not speak', 'doesnt speak', 'not speaking', 'non speaking', 'nonspeaking', 'non verbal', 'nonverbal', 'doesnt want to talk', 'dont want to talk', 'not want to talk'] },
  // Help
  { facet: 'supervision', value: 'nearby', words: ['independent', 'independently'], phrases: ['stay nearby', 'keep an eye', 'on their own', 'by themselves', 'on his own', 'on her own', 'not hands on', 'hands off'] },
];

const NUMBER_WORDS: Readonly<Record<string, number>> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, fifteen: 15,
  twenty: 20, thirty: 30, forty: 40, fortyfive: 45, sixty: 60,
};

const asNumber = (token: string | undefined): number | null => {
  if (token === undefined) return null;
  if (/^\d+$/.test(token)) return Number(token);
  return NUMBER_WORDS[token] ?? null;
};

/** A number of minutes named in the description ("20 minutes", "ten minutes"), or null. */
export function minutesIn(tokens: readonly string[]): number | null {
  for (let i = 1; i < tokens.length; i += 1) {
    if (/^(?:minute|minutes|min|mins)$/.test(tokens[i] ?? '')) {
      const n = asNumber(tokens[i - 1]);
      if (n !== null) return n;
    }
  }
  return null;
}

/** An age under eighteen named in the description ("a 7 year old", "aged 3 and 9"), which means a child is taking part. */
export function mentionsChild(tokens: readonly string[]): boolean {
  for (let i = 0; i < tokens.length; i += 1) {
    const t = tokens[i];
    const next = tokens[i + 1];
    if (((t === 'year' || t === 'years') && (next === 'old' || next === 'olds')) || t === 'yearolds' || t === 'yearold') {
      const n = asNumber(tokens[i - 1]);
      if (n !== null && n < 18) return true;
    }
    if (t === 'aged') {
      for (let j = i + 1; j < Math.min(tokens.length, i + 4); j += 1) {
        const n = asNumber(tokens[j]);
        if (n !== null && n < 18) return true;
      }
    }
  }
  return false;
}

const stemOf = (word: string) => stem(word);

/**
 * Words that turn a nearby word around: "dislikes sticky textures" is not a wish for textures, and "anxious in
 * groups" is not a wish for a group. A feeling word is only a signal to leave the next word out. It never
 * produces a choice.
 */
const NEGATORS: ReadonlySet<string> = new Set([
  'no', 'not', 'dont', 'doesnt', 'cant', 'cannot', 'without', 'never',
  'dislike', 'dislikes', 'disliked', 'hate', 'hates', 'hated', 'avoid', 'avoids',
  'anxious', 'nervous', 'scared', 'afraid', 'shy',
]);

/** True when a negating word comes within the three words before position `at`. */
const negatedAt = (tokens: readonly string[], at: number) => tokens.slice(Math.max(0, at - 3), at).some((t) => NEGATORS.has(t));

/** Position of the first match of a rule in the tokens, or -1. */
function firstAt(rule: Rule, tokens: readonly string[], stems: readonly string[]): number {
  let best = -1;
  const take = (i: number) => {
    if (i >= 0 && (best === -1 || i < best)) best = i;
  };
  for (const w of rule.words ?? []) {
    const target = stemOf(w);
    // The first mention that is not turned around by a nearby "not", "dislikes" or the like.
    const at = stems.findIndex(
      (st, i) => st === target && !negatedAt(tokens, i) && !(rule.notAfter ?? []).includes(tokens[i - 1] ?? ''),
    );
    take(at);
  }
  for (const phrase of rule.phrases ?? []) {
    const parts = phrase.split(' ');
    for (let i = 0; i + parts.length <= tokens.length; i += 1) {
      if (parts.every((p, k) => tokens[i + k] === p)) {
        take(i);
        break;
      }
    }
  }
  return best;
}

/**
 * The finder choices a description points to, one per question, in the finder's order. A description with no
 * known word returns nothing, and the page then shows the plain filters.
 */
export function interpret(text: string): Chip[] {
  const tokens = normalize(text).split(' ').filter(Boolean);
  if (tokens.length === 0) return [];
  const stems = tokens.map(stemOf);
  const chosen = new Map<Facet, { value: string; at: number }>();

  for (const rule of RULES) {
    const at = firstAt(rule, tokens, stems);
    if (at === -1) continue;
    const have = chosen.get(rule.facet);
    if (!have || at < have.at) chosen.set(rule.facet, { value: rule.value, at });
  }

  // A number of minutes beats the loose words: "twenty minutes" is up to 30, "ten" is about 15.
  const minutes = minutesIn(tokens);
  if (minutes !== null) {
    if (minutes <= 15) chosen.set('time', { value: '15', at: -1 });
    else if (minutes <= 30) chosen.set('time', { value: '30', at: -1 });
    else chosen.delete('time');
  }
  // A child's age means a child is taking part, unless the description already said who.
  if (mentionsChild(tokens) && !chosen.has('group')) chosen.set('group', { value: 'intergenerational', at: -1 });

  return FACET_ORDER.flatMap((facet) => {
    const pick = chosen.get(facet);
    return pick ? [{ facet, value: pick.value, label: chipLabel(facet, pick.value) }] : [];
  });
}

/**
 * What to set on the finder for these chips. Every question a chip names gets its value; a question this box
 * set before and no chip names now goes back to "any". A question this box never set is left alone, so a
 * choice made by hand stays.
 */
export function planFinderChanges(
  chips: readonly Chip[],
  applied: ReadonlyMap<Facet, string>,
): { set: Map<Facet, string>; applied: Map<Facet, string> } {
  const wanted = new Map(chips.map((c) => [c.facet, c.value] as const));
  const set = new Map<Facet, string>();
  for (const facet of new Set([...applied.keys(), ...wanted.keys()])) set.set(facet, wanted.get(facet) ?? 'any');
  return { set, applied: wanted };
}
