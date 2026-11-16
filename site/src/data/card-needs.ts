/**
 * WEB-006: what each activity card needs, in the controlled tags of `materials.ts`.
 *
 * `needs` is a list of groups. A group is met by ANY ONE of its tags (a card that says "a glue stick or
 * double-sided tape" is `['glue-stick', 'tape']`). The card can be made when every group is met.
 * `optional` lists tracked extras the card calls optional or "if you have them"; they never block a card.
 *
 * Things with no tag are not asked about: furniture, tap water and comfort extras such as a blanket, reading
 * glasses or binoculars. `materials.test.ts` checks every line of every card's materials list against this
 * record, both ways, so a card cannot change its list without this record being looked at again.
 */
export interface CardNeeds {
  readonly needs: readonly (readonly string[])[];
  readonly optional?: readonly string[];
}

/** Anything that keeps the table clean counts: the cards ask for one of these for the same reason. */
const COVER: readonly string[] = ['newspaper', 'towels', 'plastic-cloth'];

export const CARD_NEEDS: Readonly<Record<string, CardNeeds>> = {
  'arrange-flowers-together': { needs: [['flowers'], ['cups-jars'], ['scissors'], COVER] },
  'decorate-a-keepsake-box': {
    needs: [['box'], ['wrapping-paper', 'fabric'], ['glue-stick', 'tape'], ['scissors']],
    optional: ['string-ribbon', 'photos'],
  },
  'decorate-a-plant-pot': {
    needs: [['plant-pot'], ['paint'], ['brush'], COVER, ['plant-or-bulb'], ['potting-soil']],
    optional: ['string-ribbon', 'yarn', 'magazines', 'glue-stick'],
  },
  'draw-a-comic-strip-together': {
    needs: [['plain-paper'], ['pencil'], ['pen-marker', 'crayons']],
    optional: ['ruler', 'tray-board'],
  },
  'draw-a-map-of-a-favorite-place': {
    needs: [['plain-paper'], ['pen-marker', 'pencil', 'crayons']],
    optional: ['tray-board'],
  },
  'draw-a-slow-line-pattern': { needs: [['plain-paper'], ['cups-jars', 'bowls-plates'], ['pencil', 'pen-marker']] },
  'draw-repeating-patterns': {
    needs: [['plain-paper'], ['pencil', 'pen-marker', 'crayons']],
    optional: ['ruler'],
  },
  'draw-to-music': {
    needs: [['plain-paper'], ['crayons', 'colored-pencils', 'pen-marker'], ['music-device'], ['tape']],
  },
  'draw-with-oil-pastels-on-dark-paper': {
    needs: [['oil-pastels'], ['dark-paper'], ['tray-board'], COVER, ['paper-towels', 'wet-wipes']],
  },
  'fold-a-paper-boat': {
    needs: [['plain-paper', 'newspaper'], ['towels']],
    optional: ['bowls-plates', 'tray-board'],
  },
  'fold-towels-together': { needs: [['towels']] },
  'give-a-hand-massage': { needs: [['hand-cream'], ['towels']], optional: ['bowls-plates'] },
  'hold-a-sing-along-at-home': { needs: [], optional: ['music-device'] },
  'look-through-a-photo-album': { needs: [['photos'], ['paper-towels'], ['cups-jars']] },
  'make-a-button-picture': {
    needs: [['buttons'], ['thick-card'], ['craft-glue'], ['pencil'], ['bowls-plates', 'tray-board']],
  },
  'make-a-color-collage': {
    needs: [['magazines', 'colored-paper'], ['thick-card'], ['glue-stick']],
    optional: ['scissors'],
  },
  'make-a-family-tree-of-hands': {
    needs: [
      ['plain-paper', 'thick-card'],
      ['pencil'],
      ['colored-pencils', 'crayons', 'pen-marker'],
      ['pen-marker', 'crayons'],
      ['tape'],
    ],
  },
  'make-a-festival-decoration': {
    needs: [
      ['colored-paper', 'wrapping-paper', 'old-cards'],
      ['scissors'],
      ['glue-stick', 'tape'],
      ['pen-marker', 'crayons'],
      ['string-ribbon'],
    ],
  },
  'make-a-friendship-bracelet': { needs: [['yarn'], ['scissors'], ['tape'], ['tray-board']] },
  'make-a-greeting-card': {
    needs: [['thick-card'], ['old-cards', 'magazines'], ['glue-stick'], ['pen-marker'], ['envelope']],
  },
  'make-a-lavender-sachet': {
    needs: [['fabric'], ['lavender'], ['string-ribbon', 'yarn'], ['bowls-plates'], ['spoon'], ['bowls-plates', 'tray-board']],
  },
  'make-a-memory-collage': {
    needs: [['photos'], ['magazines'], ['thick-card'], ['glue-stick'], ['scissors']],
  },
  'make-a-paper-chain-garland': {
    needs: [['colored-paper', 'wrapping-paper', 'magazines'], ['scissors'], ['glue-stick', 'stapler'], ['ruler'], ['pencil']],
    optional: ['tape'],
  },
  'make-a-personal-songbook': { needs: [['plain-paper', 'notebook'], ['pen-marker'], ['music-device']] },
  'make-a-photo-postcard': {
    needs: [['photos'], ['thick-card', 'old-cards'], ['glue-stick'], ['pen-marker']],
    optional: ['envelope'],
  },
  'make-a-pine-cone-bird-feeder': {
    needs: [
      ['pine-cone'],
      ['spread'],
      ['birdseed'],
      ['spoon'],
      ['string-ribbon'],
      [...COVER, 'tray-board'],
      ['wet-wipes'],
    ],
  },
  'make-a-playlist-together': { needs: [['music-device'], ['plain-paper', 'thick-card'], ['pen-marker']] },
  'make-a-sealed-shaker': {
    needs: [['plastic-bottle'], ['dried-rice'], ['plain-paper'], ['craft-glue'], ['tape'], ['music-device']],
    optional: ['colored-paper'],
  },
  // "Six to ten textured scraps: corduroy, felt, velvet, burlap, ribbon, sponge": any of them will do.
  'make-a-texture-board': { needs: [['cardboard'], ['fabric', 'string-ribbon', 'sponge'], ['craft-glue'], ['scissors']] },
  'make-a-tissue-paper-window-picture': {
    needs: [['contact-film'], ['tissue-paper'], ['bowls-plates'], ['tape'], ['scissors']],
  },
  'make-a-torn-paper-landscape': {
    needs: [['colored-paper', 'wrapping-paper', 'envelope'], ['thick-card'], ['glue-stick'], ['bowls-plates', 'tray-board']],
  },
  'make-leaf-rubbings': { needs: [['leaves'], ['plain-paper'], ['crayons'], ['tray-board'], ['tape']] },
  'match-colors-to-a-tune': { needs: [['music-device'], ['colored-paper'], ['tray-board', 'plain-paper']] },
  'move-to-music-in-a-chair': { needs: [], optional: ['music-device', 'fabric'] },
  'paint-a-garden-stone': {
    needs: [['stones'], ['paint'], ['brush', 'cotton-swabs'], ['cups-jars'], ['paper-towels'], COVER],
  },
  'paint-a-shared-picture': {
    needs: [['thick-card'], ['paint'], ['brush', 'sponge', 'cotton-swabs'], ['cups-jars'], COVER, ['tape'], ['paper-towels']],
  },
  'paint-with-watercolors': {
    needs: [['watercolor-set'], ['brush'], ['thick-card'], ['cups-jars'], COVER, ['paper-towels']],
  },
  'plant-seeds-in-a-pot': {
    needs: [['plant-pot'], ['potting-soil'], ['seeds'], ['spoon'], ['cups-jars'], [...COVER, 'tray-board']],
  },
  'press-leaves-and-flowers': { needs: [['leaves', 'flowers'], ['heavy-book'], ['plain-paper', 'paper-towels']] },
  'print-with-leaves': {
    needs: [['leaves'], ['paint'], ['brush', 'sponge'], ['thick-card'], COVER, ['paper-towels']],
  },
  'print-with-sponge-shapes': {
    needs: [['sponge'], ['paint'], ['bowls-plates'], ['thick-card'], COVER, ['paper-towels'], ['scissors']],
  },
  'shape-a-pinch-pot': {
    needs: [['clay'], ['plastic-cloth'], ['wet-wipes', 'sponge'], ['bowls-plates'], ['tray-board']],
  },
  'sketch-what-is-on-the-table': { needs: [['plain-paper'], ['pencil', 'pen-marker']] },
  'sort-a-box-of-postcards': { needs: [['old-cards'], ['bowls-plates', 'plain-paper']], optional: ['tray-board'] },
  'sort-buttons-by-color': { needs: [['buttons'], ['bowls-plates'], ['tray-board', 'towels']] },
  'start-a-family-recipe-book': {
    needs: [['plain-paper', 'notebook'], ['pen-marker']],
    optional: ['envelope', 'magazines'],
  },
  'tap-a-rhythm-together': { needs: [['music-device']], optional: ['tray-board', 'towels'] },
  'tear-paper-mosaic': {
    needs: [['colored-paper', 'magazines', 'wrapping-paper'], ['thick-card'], ['glue-stick'], ['pencil'], ['bowls-plates']],
  },
  'watch-birds-from-a-window': { needs: [['plain-paper'], ['colored-pencils', 'crayons']], optional: ['bowls-plates'] },
  'weave-paper-strips': {
    needs: [['thick-card'], ['colored-paper', 'thick-card'], ['scissors'], ['ruler'], ['glue-stick', 'tape']],
  },
  'wind-a-ball-of-yarn': { needs: [['yarn'], ['bowls-plates']] },
  'wrap-a-small-gift': {
    needs: [
      ['small-gift'],
      ['wrapping-paper', 'plain-paper', 'fabric'],
      ['string-ribbon'],
      ['tape'],
      ['scissors'],
      ['thick-card', 'plain-paper'],
      ['pen-marker'],
    ],
  },
  'write-a-letter-together': {
    needs: [['plain-paper', 'old-cards'], ['pen-marker', 'pencil']],
    optional: ['envelope', 'flowers', 'tape'],
  },
};
