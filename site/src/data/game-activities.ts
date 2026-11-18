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
  'four-together': ['sort-buttons-by-color', 'sort-a-box-of-postcards'],
  'odd-one-out': ['sort-a-box-of-postcards', 'sketch-what-is-on-the-table'],
  'color-match': ['make-a-color-collage', 'sort-buttons-by-color'],
  'halves-match': ['fold-towels-together', 'make-a-greeting-card'],
  'color-by-number': ['paint-a-shared-picture', 'draw-repeating-patterns'],
  'pattern-maker': ['draw-repeating-patterns', 'draw-a-slow-line-pattern'],
  'build-together': ['paint-a-shared-picture', 'tear-paper-mosaic'],
  'find-together': ['make-a-memory-collage', 'make-a-greeting-card'],
  'drawing-duet': ['paint-a-shared-picture', 'draw-a-slow-line-pattern'],
  'seated-toss': ['wind-a-ball-of-yarn', 'move-to-music-in-a-chair'],
  'decorate-a-card': ['make-a-greeting-card', 'write-a-letter-together'],
  'seasonal-pack': ['plant-seeds-in-a-pot', 'make-leaf-rubbings'],
  'story-chain': ['make-a-memory-collage', 'make-a-paper-chain-garland'],
  'story-dice': ['make-a-memory-collage', 'start-a-family-recipe-book'],
  'sort-together': ['make-a-button-picture', 'arrange-flowers-together'],
  'picture-puzzle': ['tear-paper-mosaic', 'weave-paper-strips'],
  'finish-the-saying': ['make-a-personal-songbook', 'start-a-family-recipe-book'],
  'word-search': ['write-a-letter-together', 'make-a-greeting-card'],
  coloring: ['paint-with-watercolors', 'draw-repeating-patterns', 'paint-a-garden-stone'],
  'conversation-cards': ['make-a-memory-collage', 'start-a-family-recipe-book'],
  'photo-pairs': ['make-a-memory-collage', 'make-a-photo-postcard'],
  'picture-bingo': ['make-a-paper-chain-garland', 'paint-a-shared-picture'],
  'calm-breathing': ['make-a-lavender-sachet', 'wind-a-ball-of-yarn'],
  'quiet-shapes': ['tear-paper-mosaic', 'draw-a-slow-line-pattern'],
  'color-wash': ['paint-with-watercolors', 'paint-a-garden-stone'],
  'collage-board': ['make-a-color-collage', 'tear-paper-mosaic'],
  'garden-planner': ['arrange-flowers-together', 'plant-seeds-in-a-pot'],
  'coloring-wall': ['paint-a-shared-picture', 'paint-with-watercolors'],
  scrapbook: ['make-a-photo-postcard', 'make-a-memory-collage'],
  'picnic-planner': ['sketch-what-is-on-the-table', 'make-a-photo-postcard'],
  'quiet-scene': ['arrange-flowers-together', 'paint-a-shared-picture'],
};
