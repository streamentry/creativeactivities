/**
 * Builds the bundled activity cards the app ships offline (APP-001).
 *
 * Pure apart from reading the card files: `readCardRows` reads them and
 * `buildAppCards` turns the rows into the payload. The export script writes
 * the payload to assets/cards/cards.v1.json, and a vitest check regenerates it
 * in memory and fails when the committed file is stale.
 *
 * Only LISTED cards are exported (listedActivities: not withdrawn, not
 * declined). Each card passes the website's own schema first, so an invalid
 * card stops the export rather than shipping. Only the fields the app shows
 * or filters on are kept: no author or reviewer names, no images, no changelog
 * and no source links.
 */
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { activityCardSchema } from '../src/lib/activity-schema.ts';
import { listedActivities } from '../src/lib/activities.ts';
import { splitFrontmatter } from '../src/lib/yaml-subset.ts';

export const APP_CARDS_VERSION = 1;

/** The command the freshness check names when the committed asset is stale. */
export const APP_CARDS_REFRESH_COMMAND = 'node --import ./site/scripts/ts-extension-hooks.mjs --experimental-strip-types site/scripts/export-app-cards.ts';

export interface CardRow {
  /** The card's slug, which is its file name without `.md`. */
  slug: string;
  fm: Record<string, unknown>;
}

/** One card as the app bundles it. */
export interface AppCard {
  id: string;
  slug: string;
  name: string;
  summary: string;
  type: string;
  prepMinutes: number;
  activityMinutes: [number, number];
  cost: string;
  mess: string;
  energy: string;
  supervision: string;
  settings: string[];
  groups: string[];
  senses: string[];
  /** Kinds of written variation only (for example `less-sensory`); the text stays on the website. */
  variationKinds: string[];
  safetyFlags: string[];
  materials: string[];
  steps: string[];
  safety: string[];
  stopNote: string;
  crisisRoute: boolean;
  version: number;
  reviewStatus: 'reviewed' | 'not-reviewed';
}

export interface AppCardsPayload {
  version: number;
  generatedFrom: string;
  cards: AppCard[];
}

/** Reads every card file in `dir` as a row. */
export function readCardRows(dir: URL): CardRow[] {
  return readdirSync(dir)
    .filter((file) => file.endsWith('.md'))
    .sort()
    .map((file) => ({
      slug: file.slice(0, -'.md'.length),
      fm: splitFrontmatter(readFileSync(new URL(file, dir), 'utf8')).frontmatter,
    }));
}

/** Sorted-key JSON, so the same cards always give the same bytes. */
function canonical(value: unknown): string {
  return JSON.stringify(value, (_key, item: unknown) => {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      return Object.fromEntries(Object.entries(item).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
    }
    return item;
  });
}

function toAppCard(row: CardRow): AppCard {
  const parsed = activityCardSchema.safeParse(row.fm);
  if (!parsed.success) {
    const problem = parsed.error.issues[0];
    throw new Error(`card ${row.slug} is invalid: ${problem.path.join('.')} ${problem.message}`);
  }
  const d = parsed.data;
  return {
    id: d.id,
    slug: row.slug,
    name: d.name,
    summary: d.summary,
    type: d.type,
    prepMinutes: d.prepMinutes,
    activityMinutes: [d.activityMinutes[0], d.activityMinutes[1]],
    cost: d.cost,
    mess: d.mess,
    energy: d.energy,
    supervision: d.supervision,
    settings: [...d.settings],
    groups: [...d.groups],
    senses: [...d.senses],
    variationKinds: d.variations.map((variation) => variation.kind),
    safetyFlags: [...d.safetyFlags],
    materials: [...d.materials],
    steps: [...d.steps],
    safety: [...d.safety],
    stopNote: d.stopNote,
    crisisRoute: d.crisisRoute,
    version: d.version,
    reviewStatus: d.review ? 'reviewed' : 'not-reviewed',
  };
}

/** The payload for the listed cards, sorted by slug. Throws on the first invalid card. */
export function buildAppCards(rows: readonly CardRow[]): AppCardsPayload {
  const listed = listedActivities(rows.map((row) => ({ ...row, data: { withdrawn: row.fm.withdrawn, reviewDeclined: row.fm.reviewDeclined } })));
  const cards = listed
    .map((row) => toAppCard(row))
    .sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));
  const generatedFrom = createHash('sha256').update(canonical(cards)).digest('hex').slice(0, 12);
  return { version: APP_CARDS_VERSION, generatedFrom, cards };
}

/** The file contents: pretty JSON with a final newline. */
export function serializeAppCards(payload: AppCardsPayload): string {
  return `${JSON.stringify(payload, null, 2)}\n`;
}
