import { GAMES, type GameInfo, type Stage } from '../data/games';
import { DEFAULT_LOCALE, localeInfo } from './locales';
import { PUBLISHED, deepMerge, fill, ui } from './ui';
import { NO_SAYINGS_GAME, playProps } from './play';

/**
 * Languages where Four together's group names have been reviewed. A language
 * is added only after a native speaker checks every theme name and that each
 * group still reads as one group (no machine translation).
 */
export const FOUR_TOGETHER_REVIEWED: readonly string[] = [DEFAULT_LOCALE];

/**
 * Languages where Odd one out has passed its category review. It reuses Four
 * together's group names, but a language is added only after a native speaker
 * also checks that the odd picture plainly sits outside every set, so it has
 * its own list.
 */
export const ODD_ONE_OUT_REVIEWED: readonly string[] = [DEFAULT_LOCALE];

/**
 * Languages where Story chain is offered. It is English-only for now: its
 * words are one guidance line and a few buttons, and a language is added only
 * after a native speaker has checked them (no machine translation).
 */
export const STORY_CHAIN_REVIEWED: readonly string[] = [DEFAULT_LOCALE];

/**
 * Languages where Color match is offered. It needs five color names and a few
 * short messages, but they are English only until a native speaker has checked
 * them, and until each color name is confirmed to name the same color for
 * people of that language (GAME-020), so it has its own list.
 */
export const COLOR_MATCH_REVIEWED: readonly string[] = [DEFAULT_LOCALE];

/**
 * Languages where Halves match is offered. It needs one guidance line, a few
 * buttons and short messages, all English only until a native speaker has
 * checked them (GAME-021), so it has its own list.
 */
export const HALVES_MATCH_REVIEWED: readonly string[] = [DEFAULT_LOCALE];

/**
 * Languages where Color by number is offered. It needs the names of four colors
 * and of six small pictures, a few buttons and short messages, all English only
 * until a native speaker has checked them (GAME-031), so it has its own list.
 */
export const COLOR_BY_NUMBER_REVIEWED: readonly string[] = [DEFAULT_LOCALE];

/**
 * Languages where Pattern maker is offered. It needs the names of four colors,
 * a few buttons and short messages, all English only until a native speaker has
 * checked them (GAME-034), so it has its own list.
 */
export const PATTERN_MAKER_REVIEWED: readonly string[] = [DEFAULT_LOCALE];

/**
 * Languages where Build together is offered. It needs the names of four colors and
 * of two people, a few buttons and short messages, all English only until a native
 * speaker has checked them (GAME-048), so it has its own list.
 */
export const BUILD_TOGETHER_REVIEWED: readonly string[] = [DEFAULT_LOCALE];

/**
 * Languages where Find together is offered. Its cards, the two people and a few buttons are
 * English only until a native speaker has checked them (GAME-047), so it has its own list.
 */
export const FIND_TOGETHER_REVIEWED: readonly string[] = [DEFAULT_LOCALE];

/**
 * Languages where Drawing duet is offered. Its name, its guidance and its color names
 * are English only until a native speaker has checked them (GAME-032), so it has its own list.
 */
export const DRAWING_DUET_REVIEWED: readonly string[] = [DEFAULT_LOCALE];

/**
 * Languages where Seated toss tally is offered. Its page text and safety wording are English only until a
 * native speaker and a safety reviewer have checked them (GAME-049), so it has its own list.
 */
export const SEATED_TOSS_REVIEWED: readonly string[] = [DEFAULT_LOCALE];

/**
 * Languages where Seasonal puzzle pack is offered. Its season names, puzzle titles and lines are English only
 * until a native speaker has checked them (GAME-040), so it has its own list.
 */
export const SEASONAL_PACK_REVIEWED: readonly string[] = [DEFAULT_LOCALE];

/**
 * Languages where Decorate a card together is offered. Its occasion names, steps and safety wording are English
 * only until a native speaker has checked them (GAME-035), so it has its own list.
 */
export const DECORATE_A_CARD_REVIEWED: readonly string[] = [DEFAULT_LOCALE];

/**
 * Languages where Quiet shapes puzzle is offered. Its six picture names, piece names, messages and the paper
 * wording are English only until a native speaker has checked them (GAME-060), so it has its own list.
 */
export const QUIET_SHAPES_REVIEWED: readonly string[] = [DEFAULT_LOCALE];

/**
 * Languages where Color wash is offered. Its guidance, color names, brush names and the messages are English
 * only until a native speaker has checked them (GAME-038), so it has its own list.
 */
export const COLOR_WASH_REVIEWED: readonly string[] = [DEFAULT_LOCALE];

/**
 * Languages where Collage board is offered. Its cut-out names, the two people, the marks and its messages are
 * English only until a native speaker has checked them (GAME-033), so it has its own list.
 */
export const COLLAGE_BOARD_REVIEWED: readonly string[] = [DEFAULT_LOCALE];

/**
 * Languages where Story dice is offered. It needs no picture names to play,
 * but its page text and prompts are English only until a native speaker has
 * reviewed them (GAME-025), so it has its own list.
 */
export const STORY_DICE_REVIEWED: readonly string[] = [DEFAULT_LOCALE];

/** Translatable fields of a game; everything else (slug, pictures, stages) is shared. */
export type GameText = Partial<
  Pick<GameInfo, 'name' | 'seoTitle' | 'h1' | 'description' | 'short' | 'players' | 'intro' | 'howTo' | 'tips' | 'faq'>
>;

const files = import.meta.glob<{ default: Record<string, GameText> }>('./games/*.json', { eager: true });
const OVERLAYS = new Map(
  Object.entries(files).map(([path, mod]) => [path.replace(/^.*\/(.+)\.json$/, '$1'), mod.default]),
);

/** `game` with its text in `code`, English where a translation is missing. */
export function localizeGame(game: GameInfo, code: string): GameInfo {
  if (code === DEFAULT_LOCALE) return game;
  const text = OVERLAYS.get(code)?.[game.slug];
  return text ? deepMerge(game, text) : game;
}

/**
 * Whether a game is offered in `code`. Word search needs a suitable letter grid
 * and enough translated words to fill every theme, while Finish the saying needs
 * 30 genuine sayings. A language leaves an unsupported game out entirely (no
 * page, card or hreflang) rather than show an empty or invented one.
 * Four together stays English-only until its group names pass a per-language
 * category review (GAME-022 in docs/specs/global/05-games.md), Odd one out
 * likewise (GAME-018), Story chain (GAME-046), Color match (GAME-020),
 * Halves match (GAME-021), Color by number (GAME-031), Pattern maker (GAME-034), Build together (GAME-048) and Seated toss tally (GAME-049).
 */
export function gameAvailable(slug: string, code: string): boolean {
  if (slug === 'four-together') return FOUR_TOGETHER_REVIEWED.includes(code);
  if (slug === 'odd-one-out') return ODD_ONE_OUT_REVIEWED.includes(code);
  if (slug === 'color-match') return COLOR_MATCH_REVIEWED.includes(code);
  if (slug === 'halves-match') return HALVES_MATCH_REVIEWED.includes(code);
  if (slug === 'color-by-number') return COLOR_BY_NUMBER_REVIEWED.includes(code);
  if (slug === 'pattern-maker') return PATTERN_MAKER_REVIEWED.includes(code);
  if (slug === 'build-together') return BUILD_TOGETHER_REVIEWED.includes(code);
  if (slug === 'find-together') return FIND_TOGETHER_REVIEWED.includes(code);
  if (slug === 'drawing-duet') return DRAWING_DUET_REVIEWED.includes(code);
  if (slug === 'seated-toss') return SEATED_TOSS_REVIEWED.includes(code);
  if (slug === 'quiet-shapes') return QUIET_SHAPES_REVIEWED.includes(code);
  if (slug === 'color-wash') return COLOR_WASH_REVIEWED.includes(code);
  if (slug === 'collage-board') return COLLAGE_BOARD_REVIEWED.includes(code);
  if (slug === 'decorate-a-card') return DECORATE_A_CARD_REVIEWED.includes(code);
  if (slug === 'seasonal-pack') return SEASONAL_PACK_REVIEWED.includes(code);
  if (slug === 'story-chain') return STORY_CHAIN_REVIEWED.includes(code);
  if (slug === 'story-dice') return STORY_DICE_REVIEWED.includes(code);
  if (slug === 'finish-the-saying') return !NO_SAYINGS_GAME.includes(code);
  if (slug !== 'word-search') return true;
  return playProps(code, slug).content.wordSearch.available;
}

/** Languages a game page exists in. */
export function gameLanguages(slug: string): string[] {
  return PUBLISHED.map((l) => l.code).filter((code) => gameAvailable(slug, code));
}

export function localizedGames(code: string): GameInfo[] {
  return GAMES.filter((g) => gameAvailable(g.slug, code)).map((g) => localizeGame(g, code));
}

/** "Often suits early and middle stages", in `code`. Never a promise. */
export function localStageHint(stages: readonly Stage[], code: string): string {
  const t = ui(code).stage;
  const words = stages.map((s) => t[s]);
  // House style has no serial comma in English; other languages follow Intl.
  const list =
    code === DEFAULT_LOCALE && words.length > 1
      ? `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`
      : new Intl.ListFormat(localeInfo(code).bcp47, { type: 'conjunction' }).format(words);
  return fill(words.length > 1 ? t.hintMany : t.hintOne, { list });
}
