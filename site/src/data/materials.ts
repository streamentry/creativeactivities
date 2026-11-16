/**
 * WEB-006: the controlled list of everyday items behind "What I have" mode (02 §4.1, "Materials: tags").
 *
 * A tag names something a person may or may not have at home. It is never a brand. Furniture a card assumes
 * (a table, a chair, floor space, tap water) is not a tag: the page says it is assumed.
 *
 * Each activity card's own materials list stays the source of truth. `card-needs.ts` records which tags a
 * card needs, and `materials.test.ts` fails when a card's list and its record disagree.
 */
export const MATERIAL_GROUP_IDS = ['paper', 'draw', 'stick', 'cloth', 'home', 'nature', 'keepsakes'] as const;
export type MaterialGroupId = (typeof MATERIAL_GROUP_IDS)[number];

export const MATERIAL_GROUP_LABELS: Readonly<Record<MaterialGroupId, string>> = {
  paper: 'Paper and card',
  draw: 'Drawing and painting',
  stick: 'Cutting and sticking',
  cloth: 'Cloth, thread and string',
  home: 'Kitchen and home',
  nature: 'Garden and nature',
  keepsakes: 'Photos, music and keepsakes',
};

export interface MaterialTag {
  /** Stable, lowercase, hyphenated. Stored on the device, so never rename one without a migration. */
  readonly id: string;
  /** Shown beside the checkbox, in plain words. */
  readonly label: string;
  readonly group: MaterialGroupId;
}

export const MATERIAL_TAGS: readonly MaterialTag[] = [
  // Paper and card
  { id: 'plain-paper', label: 'Plain paper (printer paper, notepaper or scrap paper)', group: 'paper' },
  { id: 'thick-card', label: 'Thick paper or card (the plain side of a cereal box works)', group: 'paper' },
  { id: 'cardboard', label: 'Sturdy cardboard (a shoebox lid or the back of a notepad works)', group: 'paper' },
  { id: 'box', label: 'An empty box with a lid (a shoebox, tea tin or sturdy gift box)', group: 'paper' },
  { id: 'colored-paper', label: 'Colored paper or construction paper', group: 'paper' },
  { id: 'dark-paper', label: 'Black or dark blue paper', group: 'paper' },
  { id: 'wrapping-paper', label: 'Wrapping paper or wallpaper scraps', group: 'paper' },
  { id: 'tissue-paper', label: 'Colored tissue paper', group: 'paper' },
  { id: 'newspaper', label: 'Newspaper', group: 'paper' },
  { id: 'magazines', label: 'Old magazines, catalogs or calendars', group: 'paper' },
  { id: 'old-cards', label: 'Old greeting cards, postcards or picture cards', group: 'paper' },
  { id: 'envelope', label: 'Envelopes', group: 'paper' },
  { id: 'notebook', label: 'A notebook or binder', group: 'paper' },
  { id: 'paper-towels', label: 'Paper towels or tissues', group: 'paper' },

  // Drawing and painting
  { id: 'pencil', label: 'Pencils', group: 'draw' },
  { id: 'pen-marker', label: 'Pens or felt-tip markers', group: 'draw' },
  { id: 'crayons', label: 'Crayons', group: 'draw' },
  { id: 'colored-pencils', label: 'Colored pencils', group: 'draw' },
  { id: 'paint', label: 'Water-based paint (poster, acrylic or washable)', group: 'draw' },
  { id: 'brush', label: 'Paintbrushes', group: 'draw' },
  { id: 'watercolor-set', label: 'A watercolor set', group: 'draw' },
  { id: 'oil-pastels', label: 'Oil pastels', group: 'draw' },
  { id: 'sponge', label: 'Kitchen sponges', group: 'draw' },
  { id: 'cotton-swabs', label: 'Cotton swabs', group: 'draw' },
  { id: 'ruler', label: 'A ruler', group: 'draw' },

  // Cutting and sticking
  { id: 'scissors', label: 'Scissors (a helper uses them)', group: 'stick' },
  { id: 'glue-stick', label: 'A glue stick', group: 'stick' },
  { id: 'craft-glue', label: 'White craft glue', group: 'stick' },
  { id: 'tape', label: 'Tape (sticky, masking or double-sided)', group: 'stick' },
  { id: 'stapler', label: 'A stapler', group: 'stick' },
  { id: 'contact-film', label: 'Clear self-adhesive film (contact film)', group: 'stick' },

  // Cloth, thread and string
  { id: 'yarn', label: 'Yarn or embroidery thread', group: 'cloth' },
  { id: 'string-ribbon', label: 'String, twine or ribbon', group: 'cloth' },
  { id: 'fabric', label: 'Fabric, felt or a clean cloth', group: 'cloth' },
  { id: 'towels', label: 'Towels or old cloths', group: 'cloth' },
  { id: 'plastic-cloth', label: 'A plastic tablecloth or oilcloth', group: 'cloth' },

  // Kitchen and home
  { id: 'bowls-plates', label: 'Bowls, plates, saucers or a muffin tin', group: 'home' },
  { id: 'cups-jars', label: 'Cups, jars, mugs or glasses', group: 'home' },
  { id: 'spoon', label: 'A spoon or teaspoon', group: 'home' },
  { id: 'tray-board', label: 'A tray, clipboard or firm board', group: 'home' },
  { id: 'wet-wipes', label: 'Wet wipes or a damp cloth', group: 'home' },
  { id: 'plastic-bottle', label: 'A small clean plastic bottle with a lid', group: 'home' },
  { id: 'dried-rice', label: 'Dried rice', group: 'home' },
  { id: 'hand-cream', label: 'Plain, unscented hand cream', group: 'home' },
  { id: 'spread', label: 'Vegetable shortening or peanut butter', group: 'home' },
  { id: 'heavy-book', label: 'A large, heavy book', group: 'home' },
  { id: 'small-gift', label: 'A small, unbreakable gift to wrap', group: 'home' },

  // Garden and nature
  { id: 'leaves', label: 'Leaves with clear veins', group: 'nature' },
  { id: 'flowers', label: 'Flowers or leafy stems', group: 'nature' },
  { id: 'pine-cone', label: 'A large, open, dry pine cone', group: 'nature' },
  { id: 'birdseed', label: 'Wild birdseed', group: 'nature' },
  { id: 'stones', label: 'Smooth, flat stones', group: 'nature' },
  { id: 'plant-pot', label: 'A small plant pot', group: 'nature' },
  { id: 'potting-soil', label: 'Potting soil', group: 'nature' },
  { id: 'seeds', label: 'Large seeds, such as beans or sunflowers', group: 'nature' },
  { id: 'plant-or-bulb', label: 'A small plant, herb or bulb', group: 'nature' },
  { id: 'lavender', label: 'Dried lavender', group: 'nature' },

  // Photos, music and keepsakes
  { id: 'photos', label: 'Printed photos or copies, or a photo album', group: 'keepsakes' },
  { id: 'music-device', label: 'A phone, radio or music player', group: 'keepsakes' },
  { id: 'buttons', label: 'Large buttons', group: 'keepsakes' },
  { id: 'clay', label: 'Air-dry clay', group: 'keepsakes' },
];

export const MATERIAL_TAG_BY_ID: ReadonlyMap<string, MaterialTag> = new Map(MATERIAL_TAGS.map((t) => [t.id, t]));

/** Tags grouped for the checklist, in the order of `MATERIAL_GROUP_IDS`. */
export function tagsByGroup(): { id: MaterialGroupId; label: string; tags: readonly MaterialTag[] }[] {
  return MATERIAL_GROUP_IDS.map((id) => ({
    id,
    label: MATERIAL_GROUP_LABELS[id],
    tags: MATERIAL_TAGS.filter((t) => t.group === id),
  }));
}

/** What a card assumes a home already has, so the checklist never asks. */
export const ASSUMED_NOTE =
  'We assume a table or tray, a chair, tap water and a place to wash hands, so the list does not ask about them.';
