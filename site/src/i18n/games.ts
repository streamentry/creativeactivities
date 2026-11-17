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
 * likewise (GAME-018), and Story chain (GAME-046).
 */
export function gameAvailable(slug: string, code: string): boolean {
  if (slug === 'four-together') return FOUR_TOGETHER_REVIEWED.includes(code);
  if (slug === 'odd-one-out') return ODD_ONE_OUT_REVIEWED.includes(code);
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
