/**
 * WEB-002: turns a short description of a situation into the finder's choices.
 *
 * "My dad likes music but tires quickly" becomes the music kind, low energy and seated. The first version
 * reads a reviewed list of words and phrases, not a language model, and runs in the visitor's browser: the
 * words are not sent or stored. It maps to situations and fit only. A word that names a condition, a
 * diagnosis or a feeling that points to one ("arthritis", "anxious", "forgetful") maps to nothing, and a
 * test keeps it that way. A word that is ordinary outside a situation ("short" in "short term", "sort" in "some
 * sort of", "hearing" in "hard of hearing", "loud" in "loves loud music") is not a rule on its own.
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
  /** The words that produced it, so removing a chip is about those words and not about every way of saying the same. */
  readonly source: string;
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
  return `${FACET_NAME[facet]}: ${(text ?? value).replace(/^(?!I\b)./, (c) => c.toLowerCase())}`;
}

interface Rule {
  readonly facet: Facet;
  readonly value: string;
  /** Single words; each is matched by its stem, so list an inflection that stems differently (make, making). */
  readonly words?: readonly string[];
  /** Phrases, written as they read after `normalize` (lowercase, no apostrophes, hyphens as spaces). */
  readonly phrases?: readonly string[];
  /** A word match is skipped when one of these is one or two words before it ("adult child", "grown up children"). */
  readonly notAfter?: readonly string[];
  /** A word match is skipped when one of these comes right after it ("short term", "sort of"). */
  readonly notBefore?: readonly string[];
}

/**
 * The reviewed list. Within a facet the choice named first in the description wins. Nothing here names a
 * condition: see `situation.test.ts`.
 */
export const RULES: readonly Rule[] = [
  // Kind of activity
  { facet: 'type', value: 'music', words: ['music', 'song', 'songs', 'sing', 'singing', 'singalong', 'tune', 'tunes', 'dance', 'dancing'] },
  { facet: 'type', value: 'art', words: ['paint', 'painting', 'watercolor', 'watercolour', 'draw', 'drawing', 'sketch', 'sketching', 'doodle', 'color', 'colour', 'coloring', 'colouring', 'art', 'pastel', 'pastels'] },
  { facet: 'type', value: 'nature', words: ['garden', 'gardening', 'plant', 'plants', 'flower', 'flowers', 'bird', 'birds', 'seeds', 'nature'], phrases: ['autumn leaves', 'fallen leaves', 'pressed leaves', 'leaf rubbing', 'leaf rubbings', 'leaf printing', 'collect leaves', 'collecting leaves'] },
  { facet: 'type', value: 'conversation', words: ['chat', 'conversation', 'story', 'stories', 'photo', 'photos', 'album', 'reminisce', 'letter', 'letters', 'writing', 'write'], phrases: ['old memories', 'happy memories', 'family memories', 'share memories', 'sharing memories'] },
  { facet: 'type', value: 'sensory', words: ['sensory', 'massage', 'sort', 'sorting', 'buttons', 'yarn', 'wool', 'fabric'], notBefore: ['of'] },
  { facet: 'type', value: 'craft', words: ['craft', 'crafts', 'crafting', 'make', 'makes', 'making', 'collage', 'glue', 'knit', 'knitting', 'sew', 'sewing', 'crochet', 'fold', 'folding', 'origami', 'decorate', 'decorating', 'handmade'] },
  // Time (a number of minutes is read first; see `minutesIn`)
  { facet: 'time', value: '15', words: ['quick', 'short', 'brief', 'fiveminutes'], notBefore: ['term'], phrases: ['few minutes', 'little time', 'no time', 'between tasks', 'not long', 'quarter of an hour'] },
  { facet: 'time', value: '30', phrases: ['half hour', 'half an hour'] },
  // What is to hand
  { facet: 'materials', value: 'none', words: ['free'], phrases: ['nothing to buy', 'no cost', 'no money', 'what i have', 'what we have', 'already have', 'only have', 'at hand', 'around the house', 'in the house', 'household items'] },
  { facet: 'materials', value: 'low', words: ['cheap', 'inexpensive', 'budget', 'affordable'], phrases: ['low cost', 'small budget', 'not much money'] },
  // Where
  { facet: 'setting', value: 'bedside', words: ['bed', 'bedside', 'bedrest', 'bedridden', 'bedbound'], phrases: ['in bed', 'lap tray'] },
  { facet: 'setting', value: 'seated', words: ['seated', 'sit', 'sits', 'sitting', 'chair', 'armchair', 'wheelchair'], phrases: ['tires quickly', 'tire quickly', 'tires easily', 'tire easily', 'tired quickly', 'gets tired', 'low energy', 'sit down'] },
  { facet: 'setting', value: 'outdoors', words: ['outdoors', 'outdoor', 'outside', 'park', 'yard', 'backyard', 'patio'] },
  // Who
  { facet: 'group', value: 'intergenerational', words: ['grandchild', 'grandchildren', 'grandson', 'granddaughter', 'grandkid', 'grandkids', 'grandparent', 'grandparents', 'child', 'children', 'kid', 'kids', 'toddler', 'baby', 'sibling', 'siblings', 'nephew', 'niece'], phrases: ['all ages', 'mixed ages', 'mixed age'], notAfter: ['adult', 'adults', 'grown', 'grownup', 'elderly', 'older'] },
  { facet: 'group', value: 'small-group', words: ['group', 'groups', 'class', 'friends', 'club', 'residents'], phrases: ['few people', 'several people'] },
  { facet: 'group', value: 'one-to-one', phrases: ['one to one', 'two of us', 'just us', 'me and my'] },
  // Energy
  { facet: 'energy', value: 'low', words: ['tired', 'tiring', 'sleepy', 'exhausted', 'restful'], phrases: ['low energy', 'not much energy', 'little energy', 'tires quickly', 'tire quickly', 'tires easily', 'tire easily', 'tired quickly', 'gets tired', 'sitting still', 'take it easy'] },
  // Mess
  { facet: 'mess', value: 'none', words: ['tidy', 'clean'], phrases: ['no mess', 'not messy', 'mess free', 'without mess', 'nothing messy', 'hates mess', 'dislikes mess', 'dislike mess', 'hates sticky', 'hate sticky', 'dislikes sticky', 'dislike sticky', 'doesnt like sticky', 'does not like sticky', 'avoid sticky', 'no sticky'] },
  { facet: 'mess', value: 'low', phrases: ['little mess', 'bit of mess', 'not too messy', 'minimal mess', 'a little mess'] },
  // What they enjoy
  { facet: 'sense', value: 'touch', words: ['touch', 'texture', 'textures', 'tactile'], phrases: ['something to feel', 'things to feel'] },
  { facet: 'sense', value: 'hearing', words: ['listen', 'listening'] },
  { facet: 'sense', value: 'sight', words: ['looking', 'colors', 'colours', 'bright', 'pictures', 'watching'] },
  { facet: 'sense', value: 'smell', words: ['scent', 'scents', 'smell', 'smells', 'lavender', 'fragrance'] },
  { facet: 'sense', value: 'movement', words: ['moving', 'movement', 'stretch', 'stretching'] },
  { facet: 'sense', value: 'calm', words: ['calm', 'calmer', 'quiet', 'quieter', 'peaceful', 'soothing'], phrases: ['too loud', 'too noisy', 'too much noise', 'less noise', 'no noise', 'not too loud', 'not noisy', 'too much going on', 'less to see', 'quiet time'] },
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

/**
 * An age under eighteen named in the description ("a 7 year old", "aged 3 and 9"), which means a child is taking part.
 * After "aged" only the number right after it, and numbers joined to it by "and", are ages: "mother, aged 90, has ten
 * minutes" names one age, and it is not a child's.
 */
export function mentionsChild(tokens: readonly string[]): boolean {
  for (let i = 0; i < tokens.length; i += 1) {
    const t = tokens[i];
    const next = tokens[i + 1];
    if (((t === 'year' || t === 'years') && (next === 'old' || next === 'olds')) || t === 'yearolds' || t === 'yearold') {
      const n = asNumber(tokens[i - 1]);
      if (n !== null && n < 18) return true;
    }
    if (t === 'aged') {
      let j = i + 1;
      let n = asNumber(tokens[j]);
      while (n !== null) {
        if (n < 18) return true;
        if (tokens[j + 1] !== 'and') break;
        j += 2;
        n = asNumber(tokens[j]);
      }
    }
  }
  return false;
}

const stemOf = (word: string) => stem(word);

/**
 * Words that turn a nearby word around: "dislikes sticky textures" is not a wish for textures, "anxious in groups" is
 * not a wish for a group, and "difficulty walking" or "hard of hearing" is a limit and not a liking. Such a word is only
 * a signal to leave the next word out. It never produces a choice.
 */
const NEGATORS: ReadonlySet<string> = new Set([
  'no', 'not', 'nor', 'neither', 'never', 'without', 'cannot', 'unable',
  'dont', 'doesnt', 'didnt', 'isnt', 'wasnt', 'arent', 'werent', 'wont', 'cant', 'havent', 'hasnt', 'shouldnt', 'wouldnt', 'couldnt',
  'dislike', 'dislikes', 'disliked', 'hate', 'hates', 'hated', 'avoid', 'avoids',
  'difficulty', 'trouble', 'struggle', 'struggles', 'struggling', 'problem', 'problems', 'hard', 'limited', 'poor',
  'anxious', 'nervous', 'scared', 'afraid', 'shy',
]);

/** Words right after a match that make it a limit and not a wish ("hearing loss", "memory problems"). */
const LIMITS_AFTER: ReadonlySet<string> = new Set(['loss', 'impairment', 'problems', 'difficulties', 'trouble']);

/** The words of a description with the clause each belongs to, and their stems. */
export interface Reading {
  readonly tokens: readonly string[];
  readonly clause: readonly number[];
  readonly stems: readonly string[];
}

/**
 * Splits a description into words. A clause ends at punctuation or at "but", so a "not" or a "dislikes" never reaches into
 * the next clause: in "no mess, quick" the "quick" is still a wish.
 */
export function read(text: string): Reading {
  const tokens: string[] = [];
  const clause: number[] = [];
  text.split(/[.,;:!?\n]+|\b(?:but|however|though)\b/i).forEach((part, index) => {
    for (const token of normalize(part).split(' ').filter(Boolean)) {
      tokens.push(token);
      clause.push(index);
    }
  });
  return { tokens, clause, stems: tokens.map(stemOf) };
}

/** True when a negating word comes within the three words before position `at`, in the same clause. */
const negatedAt = (r: Reading, at: number) => {
  for (let k = Math.max(0, at - 3); k < at; k += 1) {
    if (r.clause[k] === r.clause[at] && NEGATORS.has(r.tokens[k] ?? '')) return true;
  }
  return false;
};

interface Match {
  readonly at: number;
  /** The words matched, as read. */
  readonly source: string;
}

/** The first match of a rule in a reading, or null. */
function firstAt(rule: Rule, r: Reading): Match | null {
  let best: Match | null = null;
  const take = (m: Match) => {
    if (best === null || m.at < best.at) best = m;
  };
  for (const w of rule.words ?? []) {
    const target = stemOf(w);
    // The first mention that is not turned around by a nearby "not", "dislikes", "difficulty" or the like.
    const at = r.stems.findIndex(
      (st, i) =>
        st === target &&
        !negatedAt(r, i) &&
        !(rule.notAfter ?? []).some((n) => n === r.tokens[i - 1] || n === r.tokens[i - 2]) &&
        !(rule.notBefore ?? []).includes(r.tokens[i + 1] ?? '') &&
        !LIMITS_AFTER.has(r.tokens[i + 1] ?? ''),
    );
    if (at !== -1) take({ at, source: r.tokens[at] ?? w });
  }
  for (const phrase of rule.phrases ?? []) {
    const parts = phrase.split(' ');
    for (let i = 0; i + parts.length <= r.tokens.length; i += 1) {
      const there = parts.every((p, k) => r.tokens[i + k] === p && r.clause[i + k] === r.clause[i]);
      if (there && !negatedAt(r, i) && !LIMITS_AFTER.has(r.tokens[i + parts.length] ?? '')) {
        take({ at: i, source: phrase });
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
  const r = read(text);
  if (r.tokens.length === 0) return [];
  const chosen = new Map<Facet, { value: string; at: number; source: string }>();

  for (const rule of RULES) {
    const m = firstAt(rule, r);
    if (m === null) continue;
    const have = chosen.get(rule.facet);
    if (!have || m.at < have.at) chosen.set(rule.facet, { value: rule.value, at: m.at, source: m.source });
  }

  // A number of minutes beats the loose words: "twenty minutes" is up to 30, "ten" is about 15.
  const minutes = minutesIn(r.tokens);
  if (minutes !== null) {
    if (minutes <= 15) chosen.set('time', { value: '15', at: -1, source: `${minutes} minutes` });
    else if (minutes <= 30) chosen.set('time', { value: '30', at: -1, source: `${minutes} minutes` });
    else chosen.delete('time');
  }
  // A child's age means a child is taking part, unless the description already said who.
  if (mentionsChild(r.tokens) && !chosen.has('group')) chosen.set('group', { value: 'intergenerational', at: -1, source: 'a child\u2019s age' });

  return FACET_ORDER.flatMap((facet) => {
    const pick = chosen.get(facet);
    return pick ? [{ facet, value: pick.value, label: chipLabel(facet, pick.value), source: pick.source }] : [];
  });
}

/**
 * What to set on the finder for these chips. Every question a chip names gets its value; a question this box
 * set before and no chip names now goes back to "any". A question this box never set is left alone, so a
 * choice made by hand stays. A question the person changed by hand after this box set it (`overridden`, with the
 * value the box had set) is left alone for as long as the words still say the same thing about it.
 */
export function planFinderChanges(
  chips: readonly Chip[],
  applied: ReadonlyMap<Facet, string>,
  overridden: ReadonlyMap<Facet, string> = new Map(),
): { set: Map<Facet, string>; applied: Map<Facet, string>; overridden: Map<Facet, string> } {
  const usable = chips.filter((c) => overridden.get(c.facet) !== c.value);
  const wanted = new Map(usable.map((c) => [c.facet, c.value] as const));
  const keep = new Map([...overridden].filter(([facet, value]) => chips.some((c) => c.facet === facet && c.value === value)));
  const set = new Map<Facet, string>();
  for (const facet of new Set([...applied.keys(), ...wanted.keys()])) set.set(facet, wanted.get(facet) ?? 'any');
  return { set, applied: wanted, overridden: keep };
}

/** The person changed a question by hand: this box no longer owns it, and will not put its own value back. */
export function overrideFacet(
  applied: ReadonlyMap<Facet, string>,
  overridden: ReadonlyMap<Facet, string>,
  facet: Facet,
): { applied: Map<Facet, string>; overridden: Map<Facet, string> } {
  const nextApplied = new Map(applied);
  const nextOverridden = new Map(overridden);
  const value = nextApplied.get(facet);
  if (value !== undefined) nextOverridden.set(facet, value);
  nextApplied.delete(facet);
  return { applied: nextApplied, overridden: nextOverridden };
}
