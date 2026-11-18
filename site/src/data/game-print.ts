import type { GameSlug } from './games';
import type { PlayUi } from '../i18n/play';
import { fill } from '../i18n/play/format';
import { groupSize } from '../lib/games/together';
import { TOGETHER_PRINT_COUNT } from '../lib/games/print-sheet';

/**
 * WEB-052: the paper partner of each game, or the plain reason there is none.
 *
 * - `island`: the game's own component already renders a print sheet (`.sheet`)
 *   from what is on the screen (a word search grid, a coloring page, the card
 *   set, bingo cards). GameView adds the rules line, version and scope lines.
 * - `page`: GameView renders a fixed, seeded print-only sheet at build time
 *   (`src/lib/games/print-sheet.ts`), so the page prints the same paper version
 *   every time. One page, A4 or US Letter.
 * - `none`: no paper version; the reason is shown on the game page
 *   (`gamePage.print.reasons.<reason>` in `src/i18n/ui/en.json`).
 *
 * `version` is the date the paper version's rules or layout last changed. It
 * prints as `Version <date>`, the same way activity cards print theirs (WEB-016).
 * Change it whenever the sheet or the rules line changes.
 */
export type NoPrintReason = 'photos' | 'paced' | 'sayings' | 'turns';

export type GamePrint =
  | { kind: 'island'; version: string }
  | { kind: 'page'; version: string }
  | { kind: 'none'; reason: NoPrintReason };

export const GAME_PRINT: Readonly<Record<GameSlug, GamePrint>> = {
  'picture-pairs': { kind: 'page', version: '2026-11-15' },
  'find-the-same': { kind: 'page', version: '2026-11-15' },
  'shadow-match': { kind: 'page', version: '2026-11-15' },
  'four-together': { kind: 'page', version: '2026-11-15' },
  'odd-one-out': { kind: 'page', version: '2026-11-15' },
  'color-match': { kind: 'page', version: '2026-11-17' },
  'halves-match': { kind: 'page', version: '2026-11-17' },
  'color-by-number': { kind: 'page', version: '2026-11-17' },
  'pattern-maker': { kind: 'island', version: '2026-11-18' },
  'build-together': { kind: 'island', version: '2026-11-18' },
  'find-together': { kind: 'none', reason: 'turns' },
  'seated-toss': { kind: 'page', version: '2026-11-18' },
  'decorate-a-card': { kind: 'page', version: '2026-11-18' },
  'story-chain': { kind: 'page', version: '2026-11-17' },
  'story-dice': { kind: 'page', version: '2026-11-17' },
  'sort-together': { kind: 'page', version: '2026-11-15' },
  'picture-puzzle': { kind: 'page', version: '2026-11-15' },
  'finish-the-saying': { kind: 'none', reason: 'sayings' },
  'word-search': { kind: 'island', version: '2026-11-15' },
  coloring: { kind: 'island', version: '2026-11-15' },
  'conversation-cards': { kind: 'island', version: '2026-11-15' },
  'photo-pairs': { kind: 'none', reason: 'photos' },
  'picture-bingo': { kind: 'island', version: '2026-11-15' },
  'calm-breathing': { kind: 'none', reason: 'paced' },
};

/** Whether a game has a paper version (built in or rendered by the page). */
export function hasPaperVersion(slug: GameSlug): boolean {
  return GAME_PRINT[slug].kind !== 'none';
}

/**
 * The guidance line the game shows on screen (the `guidance` prop each game
 * passes to GameFrame), by slug. The printable prints this exact string, so
 * the rules are written once (WEB-052 risk: "Write the rules once").
 */
export const RULES_KEY: Readonly<Record<GameSlug, readonly [keyof PlayUi, string]>> = {
  'picture-pairs': ['picturePairs', 'guidanceShowing'],
  'find-the-same': ['findTheSame', 'guidance'],
  'shadow-match': ['shadowMatch', 'guidance'],
  'four-together': ['fourTogether', 'guidance'],
  'odd-one-out': ['oddOneOut', 'guidance'],
  'color-match': ['colorMatch', 'guidance'],
  'halves-match': ['halvesMatch', 'guidance'],
  'color-by-number': ['colorByNumber', 'guidance'],
  'pattern-maker': ['patternMaker', 'guidance'],
  'build-together': ['buildTogether', 'guidance'],
  'find-together': ['findTogether', 'guidance'],
  'seated-toss': ['seatedToss', 'guidance'],
  'decorate-a-card': ['decorateACard', 'guidance'],
  'story-chain': ['storyChain', 'guidance'],
  'story-dice': ['storyDice', 'guidance'],
  'sort-together': ['sortTogether', 'guidance'],
  'picture-puzzle': ['picturePuzzle', 'guidance'],
  'finish-the-saying': ['finishTheSaying', 'guidance'],
  'word-search': ['wordSearch', 'guidance'],
  coloring: ['coloring', 'guidance'],
  'conversation-cards': ['conversationCards', 'guidance'],
  'photo-pairs': ['photoPairs', 'guidance'],
  'picture-bingo': ['pictureBingo', 'guidance'],
  'calm-breathing': ['calmBreathing', 'guidance'],
};

/** The one-line rules text, identical on the game and on its paper version. */
export function rulesText(slug: GameSlug, ui: PlayUi, lang = 'en'): string {
  const [section, key] = RULES_KEY[slug];
  const text = (ui[section] as unknown as Record<string, unknown>)[key];
  if (typeof text !== 'string') throw new Error(`No rules text at ui.${String(section)}.${key}`);
  // Four together names the group size; the paper version uses sets of four (a group of three).
  return slug === 'four-together' ? fill(text, { n: groupSize(TOGETHER_PRINT_COUNT) }, lang) : text;
}
