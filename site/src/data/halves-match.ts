/**
 * Halves match (GAME-021): which pictures from the shared library are cut in
 * half for the game. Each is a square 120 x 120 drawing, shown as its left half
 * and its right half (`src/games/HalvesMatch.tsx` crops the same SVG with CSS,
 * so there is no new artwork).
 *
 * Chosen by eye from a contact sheet of every picture's two halves (2026-11-17).
 * What each one needs to be a good half-picture:
 * - The drawing fills the width, so each half holds a recognizable part of it and
 *   the drawing touches the cut line where the other half takes it up again.
 * - Both halves differ from each other and from every other picture's halves:
 *   a spout and a handle (kettle), a handle (teacup), a leaf (pear), a head and
 *   a tail (fish, bird), a wing (airplane), a key's teeth, a sail, a wheel.
 * - Mostly asymmetric. A mirror-image picture such as a cat or an umbrella is
 *   kept only where its outline is plainly its own (ears, a hooked handle).
 *
 * Left out on purpose: the sun, a moon, a rainbow, a kite and a bread loaf (the
 * two halves look alike, so either could join either), a banana and a snail
 * (a half is mostly empty), and every busy picture of several objects.
 *
 * `halves-match.test.ts` checks that every id is a library picture, that no id is
 * repeated, and that the set is large and varied enough for a board of three
 * pictures from three different categories.
 */
export const HALVES_PICTURES: readonly string[] = [
  // kitchen
  'teacup',
  'kettle',
  // garden
  'watering-can',
  'sunflower',
  'tulip',
  // animals
  'cat',
  'dog',
  'fish',
  'bird',
  // fruit
  'pear',
  'strawberry',
  'apple',
  // home
  'house',
  'lamp',
  'umbrella',
  'key',
  // travel
  'sailboat',
  'car',
  'bicycle',
  'airplane',
];
