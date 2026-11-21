/**
 * Guides retired on 2026-11-15 (maintainer decision): the site moves from a
 * dementia-first library to creative activities for anyone caring for someone
 * (MISSION.md). Most dementia guides are retired; each old English address
 * sends a permanent redirect to the nearest page that fits the new mission.
 *
 * Retired guides keep their files so their translations stay live until they
 * are re-translated and reviewed (also the maintainer's decision). Only the
 * English page is replaced by a redirect. See docs/specs/global/retired-guides.md.
 */

import { englishGuideRedirectLines } from './english-guide-redirects.ts';

const AFTER_DIAGNOSIS = '/caregiving/after-dementia-diagnosis/';
const DEMENTIA_HUB = '/dementia-activities/';
const DEMENTIA_IDEAS = '/activities/ideas/';

/** Old guide id (`<section>/<slug>`) → new path. */
export const RETIRED_GUIDES: Readonly<Record<string, string>> = {
  // Dementia activity guides → the new page groups, or the one kept list of dementia ideas.
  'activities/alzheimers': DEMENTIA_IDEAS,
  'activities/early-onset': DEMENTIA_IDEAS,
  'activities/early-stage': DEMENTIA_IDEAS,
  'activities/middle-stage': DEMENTIA_IDEAS,
  'activities/for-men': DEMENTIA_IDEAS,
  'activities/household-tasks': DEMENTIA_IDEAS,
  'activities/printable': DEMENTIA_IDEAS,
  'activities/art-projects': '/crafts/easy-crafts-for-adults/',
  'activities/arts-and-crafts': '/crafts/easy-crafts-for-adults/',
  'activities/care-home-groups': '/crafts/craft-group-sessions/',
  'activities/coloring': '/crafts/coloring-pages-for-adults/',
  'activities/holidays': '/crafts/seasonal-crafts/',
  'activities/conversation-games': '/together/conversation-games-for-all-ages/',
  'activities/finish-the-saying': '/together/conversation-games-for-all-ages/',
  'activities/reminiscence-questions': '/together/conversation-games-for-all-ages/',
  'activities/trivia': '/together/conversation-games-for-all-ages/',
  'activities/memory-games': '/together/puzzles-and-table-games/',
  'activities/puzzles': '/together/puzzles-and-table-games/',
  'activities/outdoor-and-gardening': '/together/outdoor-and-garden-activities/',
  'activities/phone-and-video-calls': '/together/staying-connected-from-afar/',
  'activities/visiting': '/together/visiting-someone-in-care/',
  'activities/daily-routine': '/creative-calm/calm-afternoon-activities/',
  'activities/music': '/creative-calm/music-for-calm-and-connection/',
  'activities/sensory': '/creative-calm/sensory-activities-for-adults/',
  'activities/online-games': '/games/',
  'activities/picture-bingo': '/games/picture-bingo/',
  // Brain-health research guides: off-mission (not activities) → the dementia hub.
  'brain-health/brain-games': DEMENTIA_HUB,
  'brain-health/can-dementia-be-prevented': DEMENTIA_HUB,
  'brain-health/diet': DEMENTIA_HUB,
  'brain-health/exercise': DEMENTIA_HUB,
  'brain-health/fasting': DEMENTIA_HUB,
  'brain-health/hearing': DEMENTIA_HUB,
  'brain-health/risk-factors': DEMENTIA_HUB,
  'brain-health/sleep': DEMENTIA_HUB,
  'brain-health/social-connection': DEMENTIA_HUB,
  'brain-health/warning-signs': AFTER_DIAGNOSIS,
  // Dementia care advice: off-mission (not activities) → where to find help, or a new page that fits.
  'caregiving/caregiver-self-care': '/creative-calm/creative-self-care-for-caregivers/',
  'caregiving/late-day-restlessness': '/creative-calm/calm-afternoon-activities/',
  'caregiving/long-distance-caregiving-with-dementia': '/together/staying-connected-from-afar/',
  'caregiving/hospital-visit-with-dementia': '/together/visiting-someone-in-care/',
  'caregiving/choosing-apps-and-games': '/games/',
  'caregiving/tablets-and-screens': '/games/',
  'caregiving/asking-to-go-home': AFTER_DIAGNOSIS,
  'caregiving/bathing-with-dementia': AFTER_DIAGNOSIS,
  'caregiving/choosing-adult-day-program-dementia': AFTER_DIAGNOSIS,
  'caregiving/choosing-in-home-dementia-care': AFTER_DIAGNOSIS,
  'caregiving/choosing-residential-dementia-care': AFTER_DIAGNOSIS,
  'caregiving/communication-tips': AFTER_DIAGNOSIS,
  'caregiving/doctor-visit-with-dementia': AFTER_DIAGNOSIS,
  'caregiving/drinking-enough-with-dementia': AFTER_DIAGNOSIS,
  'caregiving/driving-and-dementia-conversation': AFTER_DIAGNOSIS,
  'caregiving/emergency-planning-dementia': AFTER_DIAGNOSIS,
  'caregiving/family-disagreements-about-dementia-care': AFTER_DIAGNOSIS,
  'caregiving/getting-dressed-with-dementia': AFTER_DIAGNOSIS,
  'caregiving/hallucinations-with-dementia': AFTER_DIAGNOSIS,
  'caregiving/home-safety': AFTER_DIAGNOSIS,
  'caregiving/language-and-dementia-communication': AFTER_DIAGNOSIS,
  'caregiving/living-alone-with-dementia': AFTER_DIAGNOSIS,
  'caregiving/managing-money-with-dementia': AFTER_DIAGNOSIS,
  'caregiving/mealtimes-with-dementia': AFTER_DIAGNOSIS,
  'caregiving/medication-support-with-dementia': AFTER_DIAGNOSIS,
  'caregiving/oral-care-with-dementia': AFTER_DIAGNOSIS,
  'caregiving/pain-with-dementia': AFTER_DIAGNOSIS,
  'caregiving/pet-care-and-dementia': AFTER_DIAGNOSIS,
  'caregiving/repeated-questions': AFTER_DIAGNOSIS,
  'caregiving/responding-after-a-fall-with-dementia': AFTER_DIAGNOSIS,
  'caregiving/supporting-lgbtq-person-with-dementia': AFTER_DIAGNOSIS,
  'caregiving/talking-to-children-about-dementia': AFTER_DIAGNOSIS,
  'caregiving/toileting-and-incontinence-with-dementia': AFTER_DIAGNOSIS,
  'caregiving/traveling-with-dementia': AFTER_DIAGNOSIS,
  'caregiving/when-anger-becomes-aggression-with-dementia': AFTER_DIAGNOSIS,
  'caregiving/when-someone-with-dementia-does-not-recognize-you': AFTER_DIAGNOSIS,
  'caregiving/when-someone-with-dementia-is-suspicious': AFTER_DIAGNOSIS,
  'caregiving/working-with-younger-onset-dementia': AFTER_DIAGNOSIS,
};

/** Whole English sections retired: their index page redirects too. */
export const RETIRED_SECTIONS: Readonly<Record<string, string>> = {
  'brain-health': DEMENTIA_HUB,
};

export function isRetiredGuide(id: string): boolean {
  return Object.hasOwn(RETIRED_GUIDES, id);
}

export function isRetiredSection(section: string): boolean {
  return Object.hasOwn(RETIRED_SECTIONS, section);
}

/** Where a guide reference should point now: its own path, or its redirect target. */
export function guidePath(id: string): string {
  return RETIRED_GUIDES[id] ?? `/${id}/`;
}

/** The guide id behind a path such as `/crafts/paper-crafts/`, or null for other pages. */
export function guideIdOfPath(path: string): string | null {
  const m = /^\/([a-z0-9-]+)\/([a-z0-9-]+)\/$/.exec(path);
  return m ? `${m[1]}/${m[2]}` : null;
}

/**
 * The English address to show for a path: the redirect target when the page is
 * a retired English guide or section, otherwise the path itself. Translated pages
 * use it for their "read the original" link.
 */
export function englishPathFor(path: string): string {
  const id = guideIdOfPath(path);
  if (id !== null && isRetiredGuide(id)) return RETIRED_GUIDES[id] ?? path;
  const section = /^\/([a-z-]+)\/$/.exec(path)?.[1];
  if (section !== undefined && isRetiredSection(section)) return RETIRED_SECTIONS[section] ?? path;
  return path;
}

/**
 * The Cloudflare `_redirects` lines for every retired English address, with
 * and without the trailing slash so no visitor goes through two redirects.
 */
export function redirectLines(): string[] {
  const pairs = [
    ...Object.entries(RETIRED_SECTIONS).map(([section, to]) => [`/${section}`, to] as const),
    ...Object.entries(RETIRED_GUIDES).map(([id, to]) => [`/${id}`, to] as const),
  ];
  return pairs.flatMap(([from, to]) => [`${from} ${to} 301`, `${from}/ ${to} 301`]);
}

export function redirectsFile(): string {
  return [
    '# Generated from site/src/lib/retired-guides.ts and english-guide-redirects.ts. Do not edit by hand:',
    '# run `pnpm gen:redirects` after changing them.',
    ...redirectLines(),
    ...englishGuideRedirectLines(),
    '',
  ].join('\n');
}
