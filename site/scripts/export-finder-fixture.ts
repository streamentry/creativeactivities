/**
 * Writes the finder fixture the app's Dart tests check against (APP-005).
 *
 * Run from the repository root:
 *   node --experimental-strip-types site/scripts/export-finder-fixture.ts
 *
 * It reads the website's own activity cards and runs the website's own finder
 * logic (parseFinderState, matches, fitReasons, listedActivities) for a fixed
 * list of query strings. The output holds facts and expected results only: no
 * card copy, no images and no personal data. Re-run it whenever a card's fit
 * fields or the finder rules change, then commit the JSON.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { fitReasons, listedActivities, matches, type ActivityFacts } from '../src/lib/activities.ts';
import { parseFinderState } from '../src/lib/finder-state.ts';
import { splitFrontmatter } from '../src/lib/yaml-subset.ts';

const cardsDir = new URL('../src/content/activity-cards/', import.meta.url);
const outFile = new URL('../../test/fixtures/finder/finder_fixture.json', import.meta.url);

/** Every query the fixture checks. Each value is what the website writes in its address bar. */
const QUERIES = [
  '',
  'time=15',
  'time=30',
  'time=any',
  'materials=none',
  'materials=low',
  'type=art',
  'type=craft',
  'type=nature',
  'type=music',
  'type=sensory',
  'type=conversation',
  'setting=seated',
  'setting=bedside',
  'setting=outdoors',
  'group=one-to-one',
  'group=small-group',
  'group=intergenerational',
  'mess=none',
  'mess=low',
  'energy=low',
  'sense=sight',
  'sense=touch',
  'sense=hearing',
  'sense=smell',
  'sense=movement',
  'sense=calm',
  'talking=none',
  'supervision=nearby',
  'avoid=sharp-tool',
  'avoid=small-parts&avoid=heat',
  'avoid=adhesive&avoid=skin-contact',
  'time=15&setting=bedside&mess=none',
  'materials=none&energy=low&talking=none',
  'sense=calm&group=one-to-one&supervision=nearby',
  'time=30&type=art&avoid=adhesive',
  'time=15&materials=none&mess=none&energy=low&talking=none&sense=hearing&supervision=nearby',
  'time=99&setting=standing&sense=taste',
];

type Frontmatter = Record<string, unknown>;

function factsFrom(fm: Frontmatter): ActivityFacts {
  const variations = Array.isArray(fm.variations) ? (fm.variations as { kind: string }[]) : [];
  return {
    type: fm.type as ActivityFacts['type'],
    prepMinutes: fm.prepMinutes as number,
    activityMinutes: fm.activityMinutes as [number, number],
    cost: fm.cost as ActivityFacts['cost'],
    mess: fm.mess as ActivityFacts['mess'],
    energy: fm.energy as ActivityFacts['energy'],
    supervision: fm.supervision as ActivityFacts['supervision'],
    settings: fm.settings as ActivityFacts['settings'],
    groups: fm.groups as ActivityFacts['groups'],
    senses: (fm.senses ?? []) as ActivityFacts['senses'],
    variationKinds: variations.map((v) => v.kind),
    safetyFlags: (fm.safetyFlags ?? []) as ActivityFacts['safetyFlags'],
  };
}

interface CardRow {
  id: string;
  name: string;
  fm: Frontmatter;
}

const rows: CardRow[] = readdirSync(cardsDir)
  .filter((file) => file.endsWith('.md'))
  .map((file) => {
    const fm = splitFrontmatter(readFileSync(new URL(file, cardsDir), 'utf8')).frontmatter;
    return { id: String(fm.id), name: String(fm.name), fm };
  });

// listedActivities() is the website's own filter: it reads data.withdrawn and data.reviewDeclined.
const listedIds = new Set(
  listedActivities(rows.map((row) => ({ ...row, data: { withdrawn: row.fm.withdrawn, reviewDeclined: row.fm.reviewDeclined } }))).map((row) => row.id),
);
const fixtureCards = rows
  .filter((row) => listedIds.has(row.id))
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((row) => ({ id: row.id, name: row.name, facts: factsFrom(row.fm) }));

const cases = QUERIES.map((query) => {
  const choice = parseFinderState(query);
  const results = fixtureCards
    .filter((card) => matches(card.facts, choice))
    .map((card) => ({ id: card.id, reasons: fitReasons(card.facts, choice) }));
  return { query, results };
});

const fixture = {
  generatedBy: 'site/scripts/export-finder-fixture.ts',
  note: 'Generated from the website finder. Do not edit by hand.',
  cards: fixtureCards,
  cases,
};

writeFileSync(fileURLToPath(outFile), `${JSON.stringify(fixture, null, 2)}\n`);
console.log(`cards ${fixtureCards.length}, cases ${cases.length}`);
