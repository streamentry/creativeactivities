/**
 * CNT-012 glossary: the craft and setup words in the activity cards that can stop someone,
 * each with a one-sentence plain meaning and a note for translators (13-localization).
 * Every term must appear in at least one English card (glossary.test.ts), so the list grows
 * from what the cards actually say, not from a general craft dictionary.
 */
export interface GlossaryTerm {
  term: string;
  /** One plain sentence. */
  meaning: string;
  /** What a translator should keep or adapt. */
  translatorNote: string;
}

export const GLOSSARY: readonly GlossaryTerm[] = [
  { term: 'Air-dry clay', meaning: 'Soft modelling clay that hardens by itself in the air over a day or two, with no oven or kiln.', translatorNote: 'Use the local shop name for clay that needs no firing.' },
  { term: 'Autoplay', meaning: 'A setting on music and video apps that starts the next song or video by itself; turn it off to avoid sudden changes.', translatorNote: 'Use the word the main local music apps use for this setting.' },
  { term: 'Bed table', meaning: 'A small table on legs or a stand that sits over a bed so things can rest within reach.', translatorNote: 'Also called an over-bed table; use the hospital or care term.' },
  { term: 'Birdseed', meaning: 'A mix of seeds sold for feeding garden birds, not for people to eat.', translatorNote: 'Keep "for birds, not for people".' },
  { term: 'Braid', meaning: 'To cross three strands over each other in turn, right over middle, then left over middle, to make one thicker strand.', translatorNote: 'Also called plaiting in some English-speaking places.' },
  { term: 'Chunky crayon', meaning: 'A crayon much thicker than usual, which is easier to hold for stiff or tired hands.', translatorNote: 'Translate the idea of "thick and easy to hold".' },
  { term: 'Clipboard', meaning: 'A stiff board with a clip at the top that holds paper still, useful on a lap or in bed.', translatorNote: 'A rigid board with a spring clip.' },
  { term: 'Collage', meaning: 'A picture made by sticking pieces of paper, fabric or photos onto a sheet.', translatorNote: 'Most languages use the French word; keep it if so.' },
  { term: 'Construction paper', meaning: 'Thick, colored paper sold for crafts, sturdier than printer paper.', translatorNote: 'Use the local name for thick colored craft paper.' },
  { term: 'Contact film', meaning: 'Clear plastic sheet that is sticky on one side once you peel off its backing.', translatorNote: 'Also sold as self-adhesive book-covering film.' },
  { term: 'Embroidery thread', meaning: 'Soft, thick sewing thread in many colors, made of several fine strands twisted together.', translatorNote: 'Also called embroidery floss.' },
  { term: 'Felt-tip pen', meaning: 'A pen with a soft fiber tip that draws a bold colored line.', translatorNote: 'Also called a marker; use the common local word.' },
  { term: 'Gift tag', meaning: 'A small card tied or stuck to a present, with space to write who it is for.', translatorNote: 'A label for a present.' },
  { term: 'Glue stick', meaning: 'Solid glue in a twist-up tube that spreads like a crayon and makes little mess.', translatorNote: 'Use the local name for solid stick glue.' },
  { term: 'Lap tray', meaning: 'A tray with a raised edge, or a cushion underneath, that rests on the lap to work on.', translatorNote: 'A tray used on the knees, not a serving tray.' },
  { term: 'Lavender', meaning: 'A plant with small purple flowers and a strong sweet smell, often dried for sachets.', translatorNote: 'Keep the plant name; mention the smell if the plant is unfamiliar locally.' },
  { term: 'Low-tack tape', meaning: 'Tape that sticks lightly and peels off paper and walls without tearing them.', translatorNote: 'Painter\'s tape or masking tape in many places.' },
  { term: 'Masking tape', meaning: 'Paper tape that tears by hand and peels off easily, used to hold paper still.', translatorNote: 'Use the common local name for paper craft tape.' },
  { term: 'Mosaic', meaning: 'A picture made from many small pieces placed side by side, such as torn paper or tiles.', translatorNote: 'Keep the art term.' },
  { term: 'Non-slip mat', meaning: 'A thin rubbery mat that stops paper, bowls or trays from sliding on a table.', translatorNote: 'Also sold as a shelf liner or grip mat.' },
  { term: 'Non-toxic', meaning: 'Labelled by the maker as not harmful in normal use; it still is not food and should stay away from the mouth.', translatorNote: 'Keep the warning that non-toxic does not mean edible.' },
  { term: 'Oil pastel', meaning: 'A soft, waxy color stick that glides on paper with little pressure and shows up well on dark paper.', translatorNote: 'Use the art-shop name.' },
  { term: 'Pinch pot', meaning: 'A small bowl made by pressing a thumb into a ball of clay and pinching the sides out.', translatorNote: 'Describe the method if there is no local term.' },
  { term: 'Playlist', meaning: 'A list of songs chosen to play one after another, kept on a phone, computer or paper.', translatorNote: 'Most languages use the English word; keep it if so.' },
  { term: 'Poster paint', meaning: 'Thick, bright water-based paint for crafts that washes off most skin and surfaces.', translatorNote: 'Also called tempera paint.' },
  { term: 'Potting soil', meaning: 'Bagged soil mix for growing plants in pots, sold at garden shops.', translatorNote: 'Also called potting compost or potting mix.' },
  { term: 'Pruners', meaning: 'Strong garden scissors for cutting stems, kept with the helper.', translatorNote: 'Also called secateurs.' },
  { term: 'Rim', meaning: 'The top edge of a cup, bowl, pot or jar.', translatorNote: 'The upper edge of a container.' },
  { term: 'Sachet', meaning: 'A small sealed cloth bag filled with something that smells nice, such as dried lavender.', translatorNote: 'A scented pouch, not a single-portion packet.' },
  { term: 'Shaker', meaning: 'A sealed container with something inside that rattles when shaken, used to keep a rhythm.', translatorNote: 'A simple rattle instrument.' },
  { term: 'Skein', meaning: 'A loose loop of yarn as it is sold, before it is wound into a ball.', translatorNote: 'Also called a hank.' },
  { term: 'Tassel', meaning: 'A small bunch of threads tied at the top and left loose at the bottom, used as a decoration.', translatorNote: 'Keep the decoration term.' },
  { term: 'Tissue paper', meaning: 'Very thin, soft, colored paper that lets light through, often used to wrap gifts.', translatorNote: 'Gift-wrap tissue, not paper handkerchiefs.' },
  { term: 'Tray table', meaning: 'A small folding table with a tray top that stands beside or over a chair.', translatorNote: 'A folding side table.' },
  { term: 'Washable paint', meaning: 'Paint made to wash out of skin and most clothes with soap and water.', translatorNote: 'Keep "washes out with soap and water".' },
  { term: 'Watercolor', meaning: 'Paint that is mixed with water on the brush and gives soft, see-through color.', translatorNote: 'Watercolour in British English.' },
  { term: 'Wax crayon', meaning: 'A colored stick made of wax, good for rubbings because its side picks up texture.', translatorNote: 'The common school crayon.' },
  { term: 'Yarn', meaning: 'Thick thread for knitting and crafts, usually sold in balls or loose loops.', translatorNote: 'Also called wool, even when it is not wool.' },
];
