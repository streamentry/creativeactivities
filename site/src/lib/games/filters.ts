import type { GameInfo, PlayMode } from '../../data/games';

/**
 * WEB-051 games filters. Each filter has its own static page (`/games/<id>/`), which is noindex and
 * canonical to `/games/`. Combinations of filters are not built, so no combination page exists.
 * English only.
 */
export type GameFilter = PlayMode | 'printable';

export const GAME_FILTERS: readonly { id: GameFilter; label: string; heading: string; lede: string }[] = [
  {
    id: 'solo',
    label: 'Solo',
    heading: 'Games to play on your own',
    lede: 'Games that work for one person, with nobody else needed. You can still share the result afterwards.',
  },
  {
    id: 'together',
    label: 'Together',
    heading: 'Games to play side by side',
    lede: 'Games for two people sitting together, taking turns or working on one picture.',
  },
  {
    id: 'group',
    label: 'Group',
    heading: 'Games for a group',
    lede: 'Games for three or more people, or for a room with a few people in it.',
  },
  {
    id: 'printable',
    label: 'Printable',
    heading: 'Games with a printed version',
    lede: 'Games that also have a paper version you can print at home, with the same rules.',
  },
];

/** Whether one game is in a filter. A game with no recorded value for a filter is never in it. */
export function gameMatchesFilter(game: GameInfo, filter: GameFilter): boolean {
  if (filter === 'printable') return game.printable;
  return game.playModes?.includes(filter) === true;
}

/** The games in a filter, in the order given. */
export function gamesForFilter(games: readonly GameInfo[], filter: GameFilter): GameInfo[] {
  return games.filter((g) => gameMatchesFilter(g, filter));
}

/** The address of a filter's page, such as `/games/together/`. */
export function filterPath(filter: GameFilter): string {
  return `/games/${filter}/`;
}

/** Filter pages are held from search and point at the full index (WEB-051). */
export const FILTER_CANONICAL = '/games/';
