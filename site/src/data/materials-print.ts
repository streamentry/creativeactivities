/**
 * CNT-007: short labels for the paper "What I have" checklist. The screen list (`materials.ts`) keeps its full
 * wording; a printed tick box needs one line at 14 pt, so each item has a short name here. Keyed by tag id, so a
 * tag cannot be printed without one (`materials-print.test.ts` checks every tag).
 */
import { MATERIAL_TAGS, type MaterialTag } from './materials';

export const PRINT_LABELS: Readonly<Record<string, string>> = {
  'plain-paper': 'Plain paper',
  'thick-card': 'Thick paper or card',
  cardboard: 'Sturdy cardboard',
  box: 'A box with a lid',
  'colored-paper': 'Colored paper',
  'dark-paper': 'Black or dark blue paper',
  'wrapping-paper': 'Wrapping paper or wallpaper',
  'tissue-paper': 'Colored tissue paper',
  newspaper: 'Newspaper',
  magazines: 'Old magazines or catalogs',
  'old-cards': 'Old greeting or picture cards',
  envelope: 'Envelopes',
  notebook: 'A notebook or binder',
  'paper-towels': 'Paper towels or tissues',
  pencil: 'Pencils',
  'pen-marker': 'Pens or felt-tip markers',
  crayons: 'Crayons',
  'colored-pencils': 'Colored pencils',
  paint: 'Water-based paint',
  brush: 'Paintbrushes',
  'watercolor-set': 'A watercolor set',
  'oil-pastels': 'Oil pastels',
  sponge: 'Kitchen sponges',
  'cotton-swabs': 'Cotton swabs',
  ruler: 'A ruler',
  scissors: 'Scissors (a helper uses them)',
  'glue-stick': 'A glue stick',
  'craft-glue': 'White craft glue',
  tape: 'Tape',
  stapler: 'A stapler',
  'contact-film': 'Clear self-adhesive film',
  yarn: 'Yarn or embroidery thread',
  'string-ribbon': 'String, twine or ribbon',
  fabric: 'Fabric, felt or a clean cloth',
  towels: 'Towels or old cloths',
  'plastic-cloth': 'A plastic tablecloth',
  beads: 'Large beads, not seed beads',
  'elastic-cord': 'Stretchy bead cord',
  'bowls-plates': 'Bowls, plates or a muffin tin',
  'cups-jars': 'Cups, jars or mugs',
  spoon: 'A spoon',
  'tray-board': 'A tray or firm board',
  'wet-wipes': 'Wet wipes or a damp cloth',
  'plastic-bottle': 'A small plastic bottle with a lid',
  'dried-rice': 'Dried rice',
  'hand-cream': 'Plain hand cream',
  spread: 'Shortening or peanut butter',
  'heavy-book': 'A large, heavy book',
  'small-gift': 'A small gift to wrap',
  straw: 'A thin drinking straw',
  leaves: 'Leaves with clear veins',
  flowers: 'Flowers or leafy stems',
  'pine-cone': 'A large dry pine cone',
  birdseed: 'Wild birdseed',
  stones: 'Smooth, flat stones',
  'plant-pot': 'A small plant pot',
  'potting-soil': 'Potting soil',
  seeds: 'Large seeds',
  'plant-or-bulb': 'A small plant, herb or bulb',
  lavender: 'Dried lavender',
  photos: 'Printed photos or a photo album',
  'music-device': 'A phone, radio or music player',
  buttons: 'Large buttons',
  keyring: 'A split keyring',
  clay: 'Air-dry clay',
};

/** The short label printed beside a tick box. Falls back to the screen label, so a new tag still prints. */
export function printLabel(tag: MaterialTag): string {
  return PRINT_LABELS[tag.id] ?? tag.label;
}

/** Every tag, with its printed label, in the order of the vocabulary. */
export const PRINT_TAGS = MATERIAL_TAGS.map((t) => ({ id: t.id, group: t.group, label: printLabel(t) }));
