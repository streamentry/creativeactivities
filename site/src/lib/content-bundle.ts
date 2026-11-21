/**
 * The content bundle (PLAT-035): one small, versioned JSON document that the
 * web and the app both read, built from the activity cards. It holds the
 * same ids, statuses and review data the site uses, and nothing else.
 *
 * Pure on purpose: no file access and no clock. The caller passes the cards
 * and the `generated` date, so the same cards always give the same bytes.
 * scripts/content-bundle.mjs reads the markdown; tests run this directly.
 * Imports are deliberately none, so Node can strip the types at run time.
 */

export const BUNDLE_SCHEMA = 'creative-activities/content-bundle';
export const BUNDLE_VERSION = 1;

/** Places the content shows up. `app` is not a site surface: it is the app reading this bundle. */
export const SURFACES = ['web-card', 'large-print', 'print', 'app'] as const;
export type Surface = (typeof SURFACES)[number];

/** What the bundle says for an activity. A withdrawn card stays out of every listing (TSA-045). */
export type ActivityStatus = 'listed' | 'withdrawn';

/** The fields of an activity card the bundle reads. Dates may arrive as a Date or as YYYY-MM-DD text. */
export interface CardData {
  name: string;
  summary: string;
  steps: readonly string[];
  plainSteps?: readonly string[];
  materials: readonly string[];
  safetyFlags: readonly string[];
  safety: readonly string[];
  /** When and how to stop; travels with the steps so no surface shows steps without it. */
  stopNote: string;
  variations: readonly { kind: string; text: string }[];
  images: readonly { src: string }[];
  review?: {
    name: string;
    role: string;
    credential: string;
    body?: string;
    date: Date | string;
  } | null;
  published: Date | string;
  updated: Date | string;
  withdrawn?: unknown;
}

/** One card as the site knows it: its slug is the id every surface uses. */
export interface CardInput {
  id: string;
  data: CardData;
}

export interface BundleReview {
  name: string;
  role: string;
  credential: string;
  body?: string;
  date: string;
}

export interface BundleVariation {
  kind: string;
  text: string;
}

export interface BundleActivity {
  id: string;
  status: ActivityStatus;
  title: string;
  summary: string;
  steps: string[];
  plainSteps?: string[];
  materials: string[];
  safetyFlags: string[];
  safety: string[];
  stopNote: string;
  variations: BundleVariation[];
  pictures: string[];
  review: BundleReview | null;
  published: string;
  updated: string;
  languages: Record<string, string>;
  surfaces: Surface[];
}

export interface ContentBundle {
  schema: typeof BUNDLE_SCHEMA;
  version: typeof BUNDLE_VERSION;
  /** The date this bundle was built, given by the caller (YYYY-MM-DD). */
  generated: string;
  translationNote: string;
  activities: BundleActivity[];
}

export interface BundleOptions {
  /** YYYY-MM-DD. Passed in, never read from the clock, so rebuilds are reproducible. */
  generated: string;
  /**
   * Translation status per activity id and language code, from the translation source.
   * Empty today: activity cards exist only in English.
   */
  translations?: Readonly<Record<string, Readonly<Record<string, string>>>>;
}

export const ORIGINAL_STATUS = 'original';
export const TRANSLATION_NOTE =
  'Activity cards are written in English only. No translated activity card exists yet, so each activity lists English alone. A translation adds its language code and status under languages.';

/** The surfaces a listed card renders: the web card, its large-print copy and the printed card (WEB-018, WEB-073). */
const LISTED_SURFACES: readonly Surface[] = ['web-card', 'large-print', 'print'];
/** A withdrawn card keeps only its own page, with the notice and noindex (TSA-045). */
const WITHDRAWN_SURFACES: readonly Surface[] = ['web-card'];

const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** A date as YYYY-MM-DD. Anything else is an error, not a guess. */
export function isoDay(value: Date | string): string {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) throw new Error('content-bundle: invalid Date');
    return value.toISOString().slice(0, 10);
  }
  const text = String(value);
  if (!DAY.test(text)) throw new Error(`content-bundle: not a YYYY-MM-DD date: ${text}`);
  return text;
}

function languagesFor(id: string, translations: BundleOptions['translations']): Record<string, string> {
  const languages: Record<string, string> = { en: ORIGINAL_STATUS };
  const extra = translations?.[id] ?? {};
  for (const code of Object.keys(extra).sort()) {
    if (code !== 'en') languages[code] = extra[code];
  }
  return languages;
}

function reviewOf(review: CardData['review']): BundleReview | null {
  if (!review) return null;
  return {
    name: review.name,
    role: review.role,
    credential: review.credential,
    ...(review.body ? { body: review.body } : {}),
    date: isoDay(review.date),
  };
}

function activityOf(card: CardInput, options: BundleOptions): BundleActivity {
  const d = card.data;
  const withdrawn = d.withdrawn !== undefined && d.withdrawn !== null;
  return {
    id: card.id,
    status: withdrawn ? 'withdrawn' : 'listed',
    title: d.name,
    summary: d.summary,
    steps: [...d.steps],
    ...(d.plainSteps && d.plainSteps.length > 0 ? { plainSteps: [...d.plainSteps] } : {}),
    materials: [...d.materials],
    safetyFlags: [...d.safetyFlags],
    safety: [...d.safety],
    stopNote: d.stopNote,
    variations: d.variations.map((v) => ({ kind: v.kind, text: v.text })),
    pictures: (d.images ?? []).map((image) => image.src),
    review: reviewOf(d.review),
    published: isoDay(d.published),
    updated: isoDay(d.updated),
    languages: languagesFor(card.id, options.translations),
    surfaces: [...(withdrawn ? WITHDRAWN_SURFACES : LISTED_SURFACES)],
  };
}

/**
 * Builds the bundle from the activity cards. Activities are sorted by id so the
 * file diffs cleanly. Throws on a duplicate id or a malformed date.
 */
export function buildContentBundle(cards: readonly CardInput[], options: BundleOptions): ContentBundle {
  if (!DAY.test(options.generated)) throw new Error(`content-bundle: generated must be YYYY-MM-DD, got ${options.generated}`);
  const ids = new Set<string>();
  for (const card of cards) {
    if (ids.has(card.id)) throw new Error(`content-bundle: duplicate activity id ${card.id}`);
    ids.add(card.id);
  }
  const activities = cards
    .map((card) => activityOf(card, options))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return {
    schema: BUNDLE_SCHEMA,
    version: BUNDLE_VERSION,
    generated: options.generated,
    translationNote: TRANSLATION_NOTE,
    activities,
  };
}

/** Which surfaces a changed activity field can affect. An unknown field counts as every surface. */
export const FIELD_SURFACES: Readonly<Record<string, readonly Surface[]>> = {
  status: SURFACES,
  title: SURFACES,
  summary: SURFACES,
  steps: SURFACES,
  plainSteps: SURFACES,
  materials: SURFACES,
  safetyFlags: SURFACES,
  safety: SURFACES,
  stopNote: SURFACES,
  variations: SURFACES,
  pictures: SURFACES,
  review: SURFACES,
  surfaces: SURFACES,
  published: ['web-card', 'app'],
  updated: ['web-card', 'app'],
  languages: ['web-card', 'app'],
};

export interface ActivityChange {
  id: string;
  fields: string[];
  surfaces: Surface[];
}

export interface BundleDiff {
  added: string[];
  removed: string[];
  changed: ActivityChange[];
  /** Top-level fields other than `generated` that changed (for example the translation note). */
  bundle: string[];
}

const BUNDLE_LEVEL = ['schema', 'version', 'translationNote'] as const;

/** Compares two bundles: which activities were added, removed or changed, and which surfaces each change reaches. */
export function diffBundles(oldBundle: ContentBundle, newBundle: ContentBundle): BundleDiff {
  const before = new Map(oldBundle.activities.map((a) => [a.id, a]));
  const after = new Map(newBundle.activities.map((a) => [a.id, a]));
  const added = [...after.keys()].filter((id) => !before.has(id)).sort();
  const removed = [...before.keys()].filter((id) => !after.has(id)).sort();
  const changed: ActivityChange[] = [];
  for (const id of [...after.keys()].filter((key) => before.has(key)).sort()) {
    const was = before.get(id) as unknown as Record<string, unknown>;
    const now = after.get(id) as unknown as Record<string, unknown>;
    const keys = [...new Set([...Object.keys(now), ...Object.keys(was)])];
    const fields = keys.filter((key) => JSON.stringify(was[key]) !== JSON.stringify(now[key]));
    if (fields.length === 0) continue;
    const surfaces = SURFACES.filter((surface) =>
      fields.some((field) => (FIELD_SURFACES[field] ?? SURFACES).includes(surface)),
    );
    changed.push({ id, fields, surfaces: [...surfaces] });
  }
  const bundle = BUNDLE_LEVEL.filter(
    (key) => JSON.stringify(oldBundle[key]) !== JSON.stringify(newBundle[key]),
  );
  return { added, removed, changed, bundle: [...bundle] };
}

/** Serialises a bundle as the committed file: 2-space indent and a final newline. */
export function formatBundle(bundle: ContentBundle): string {
  return `${JSON.stringify(bundle, null, 2)}\n`;
}
