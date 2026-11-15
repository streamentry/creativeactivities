/**
 * Related cards chosen by function (WEB-008; VISION: "functional similarity, not
 * arbitrary keywords"). A card's hand-picked `related` slugs come first; the rest
 * are filled from shared facets: type, setting, senses, energy, group and the
 * class of material. Names and summaries are never compared.
 */

export interface RelatedFacts {
  slug: string;
  type: string;
  energy: string;
  settings: readonly string[];
  groups: readonly string[];
  senses: readonly string[];
  /** The card's materials list, as written. */
  materials: readonly string[];
}

/** Functional classes of everyday materials. Order is the order they are reported in. */
const MATERIAL_CLASSES: readonly [string, RegExp][] = [
  ['paper', /\b(paper|papers|newspapers?|cards?|cardboard|magazines?|envelopes?|postcards?|notepaper|catalogs?|calendars?|filters?|wrapping|sheets?)\b/i],
  ['paint', /\b(paint|watercolou?rs?|brush|brushes|sponges?|swabs?)\b/i],
  ['drawing', /\b(pencils?|crayons?|markers?|pens?|ink)\b/i],
  ['plants', /\b(flowers?|leaf|leaves|plants?|herbs?|seeds?|soil|potting|pine cones?|stems?|lavender|birdseed|garden|bulbs?)\b/i],
  ['fabric', /\b(yarn|fabrics?|felt|cloth|towels?|ribbons?|twine|string|buttons?|textured|corduroy|skeins?|burlap|velvet|cotton)\b/i],
  ['glue', /\b(glue|tape|stapler|adhesive)\b/i],
  ['containers', /\b(bowls?|saucers?|spoons?|jars?|cups?|mugs?|vases?|baskets?|pots?|boxe?s|tins?)\b/i],
  ['sound', /\b(music|songs?|speakers?|headphones?|phones?|radios?|drums?|tambourines?)\b/i],
];

/** The functional material classes a card's materials list falls into. */
export function materialClasses(materials: readonly string[]): string[] {
  const text = materials.join('\n');
  return MATERIAL_CLASSES.filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
}

/** How alike two cards are in function. Zero means nothing in common. */
export function relatedScore(a: RelatedFacts, b: RelatedFacts): number {
  const shared = (x: readonly string[], y: readonly string[]) => x.filter((value) => y.includes(value)).length;
  let score = 0;
  if (a.type === b.type) score += 3;
  score += shared(a.settings, b.settings);
  score += shared(a.senses, b.senses);
  score += shared(a.groups, b.groups);
  if (a.energy === b.energy) score += 1;
  score += shared(materialClasses(a.materials), materialClasses(b.materials));
  return score;
}

/** Below this, two cards are not related enough to link (a type match plus one more facet). */
const MIN_SCORE = 3;

/**
 * The related slugs for one card: hand-picked slugs that are still listed, in
 * their order, then the best functional matches until `min` is reached (never
 * more than `max`). A weak match is left out rather than shown.
 */
export function relatedCards(
  card: RelatedFacts,
  pool: readonly RelatedFacts[],
  handPicked: readonly string[],
  { min = 3, max = 4 }: { min?: number; max?: number } = {},
): string[] {
  const listed = new Map(pool.filter((other) => other.slug !== card.slug).map((other) => [other.slug, other]));
  const picked: string[] = [];
  for (const slug of handPicked) {
    if (picked.length < max && listed.has(slug) && !picked.includes(slug)) picked.push(slug);
  }
  const ranked = [...listed.values()]
    .filter((other) => !picked.includes(other.slug))
    .map((other) => ({ slug: other.slug, score: relatedScore(card, other) }))
    .filter((entry) => entry.score >= MIN_SCORE)
    .sort((x, y) => y.score - x.score || x.slug.localeCompare(y.slug));
  for (const entry of ranked) {
    if (picked.length >= min) break;
    picked.push(entry.slug);
  }
  return picked;
}
