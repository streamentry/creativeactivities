import type { GAME_SLUGS } from '../content.config';

/**
 * Real-world activity cards that do on paper or at the table what each game
 * does on screen (MISSION.md: real-world activities started, not more screen
 * time). Shown on English game pages under "Try it away from the screen".
 */
export const GAME_ACTIVITIES: Record<(typeof GAME_SLUGS)[number], readonly string[]> = {
  'picture-pairs': ['make-a-button-picture', 'make-a-color-collage'],
  'find-the-same': ['make-a-color-collage', 'make-a-button-picture'],
  'shadow-match': ['print-with-leaves', 'sketch-what-is-on-the-table'],
  'sort-together': ['make-a-button-picture', 'arrange-flowers-together'],
  'picture-puzzle': ['tear-paper-mosaic', 'weave-paper-strips'],
  'finish-the-saying': ['make-a-personal-songbook', 'start-a-family-recipe-book'],
  'word-search': ['write-a-letter-together', 'make-a-greeting-card'],
  coloring: ['paint-with-watercolors', 'draw-repeating-patterns', 'paint-a-garden-stone'],
  'conversation-cards': ['make-a-memory-collage', 'start-a-family-recipe-book'],
  'photo-pairs': ['make-a-memory-collage', 'make-a-photo-postcard'],
  'picture-bingo': ['make-a-paper-chain-garland', 'paint-a-shared-picture'],
  'calm-breathing': ['make-a-lavender-sachet', 'wind-a-ball-of-yarn'],
};
