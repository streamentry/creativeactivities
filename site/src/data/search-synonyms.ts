/**
 * WEB-003: the editor-owned synonym list behind site search. People use many words for the same
 * thing ("grandma", "nan", "granny"), so each group below is treated as one word when searching.
 *
 * Rules for this list (checked in `search.test.ts`):
 * - It links everyday words for people, places, materials and situations only. It never maps a phrase
 *   to a condition or a diagnosis, and never adds a treatment word. "Forgetful" is not a search input.
 * - A word belongs to one group. Groups are lowercase single words; a few phrases are folded into one
 *   word first (see `PHRASES`).
 * - Thirty or more groups at launch (proposal). These are written by one author and wait for an editor's review.
 */
export const SYNONYM_GROUPS: readonly (readonly string[])[] = [
  // People
  ['grandparent', 'grandparents', 'grandmother', 'grandma', 'nan', 'nana', 'nanna', 'granny', 'gran', 'grandfather', 'grandpa', 'granddad', 'grandad', 'gramps'],
  ['grandchild', 'grandchildren', 'grandkid', 'grandkids', 'grandson', 'granddaughter'],
  ['parent', 'parents', 'mother', 'mum', 'mom', 'mam', 'mama', 'father', 'dad', 'papa'],
  ['elderly', 'senior', 'seniors', 'older', 'aged'],
  ['child', 'children', 'kid', 'kids', 'youngster', 'youngsters'],
  ['toddler', 'toddlers', 'preschooler', 'preschoolers'],
  ['carer', 'carers', 'caregiver', 'caregivers', 'caretaker'],
  // Places and settings
  ['carehome', 'residential', 'nursing'],
  ['hospital', 'ward', 'infirmary'],
  ['bedrest', 'bedside', 'bedridden', 'bedbound'],
  ['seated', 'sitting', 'chair', 'armchair'],
  ['indoor', 'indoors', 'rainy', 'rain'],
  ['group', 'groups', 'class', 'classes', 'workshop'],
  ['visit', 'visits', 'visiting', 'visitor', 'visitors'],
  ['picnic', 'picnics', 'outing', 'outings'],
  // How long, how hard
  ['fiveminutes', 'quick', 'short', 'brief'],
  ['easy', 'easier', 'simple', 'gentle'],
  ['calm', 'quiet', 'relaxing', 'relax', 'peaceful'],
  // Making
  ['paint', 'painting', 'watercolor', 'watercolour', 'brush', 'brushes'],
  ['draw', 'drawing', 'sketch', 'sketching', 'doodle', 'doodling'],
  ['color', 'colour', 'coloring', 'colouring'],
  ['craft', 'crafts', 'crafting', 'handmade', 'diy'],
  ['letter', 'letters', 'write', 'writing', 'postcard', 'postcards'],
  ['gift', 'gifts', 'present', 'presents'],
  ['printable', 'print', 'printout', 'printouts', 'handout'],
  ['largeprint', 'bigprint'],
  ['yarn', 'wool', 'thread'],
  // Music and moving
  ['music', 'song', 'songs', 'sing', 'singing', 'tune', 'tunes', 'singalong'],
  ['rhythm', 'beat', 'drum', 'drumming', 'tap', 'tapping'],
  ['dance', 'dancing', 'movement', 'move', 'moving'],
  // Photos and memories
  ['photo', 'photos', 'photograph', 'photographs', 'picture', 'pictures', 'snapshot', 'album', 'scrapbook', 'scrapbooks'],
  ['reminiscence', 'reminisce', 'memories', 'nostalgia', 'keepsake', 'keepsakes'],
  // Outdoors and nature
  ['flower', 'flowers', 'bouquet', 'blossom', 'blooms'],
  ['leaf', 'leaves', 'foliage'],
  ['garden', 'gardening', 'plant', 'plants', 'planting', 'seed', 'seeds'],
  ['bird', 'birds', 'birdwatching', 'feeder'],
  // Play and senses
  ['game', 'games', 'puzzle', 'puzzles'],
  ['sensory', 'texture', 'textures', 'tactile', 'touch'],
];

/**
 * Phrases folded into one word before searching, so "care home", "nursing home" and "assisted living"
 * reach the same pages. The same fold is applied to page text.
 */
export const PHRASES: readonly (readonly [phrase: string, word: string])[] = [
  ['care home', 'carehome'],
  ['nursing home', 'carehome'],
  ['residential home', 'carehome'],
  ['assisted living', 'carehome'],
  ['retirement home', 'carehome'],
  ['aged care', 'carehome'],
  ['old people', 'elderly'],
  ['old folks', 'elderly'],
  ['older people', 'elderly'],
  ['older adults', 'elderly'],
  ['older adult', 'elderly'],
  ['bed rest', 'bedrest'],
  ['bed bound', 'bedbound'],
  ['five minutes', 'fiveminutes'],
  ['5 minutes', 'fiveminutes'],
  ['sing along', 'singalong'],
  ['bird watching', 'birdwatching'],
  ['large print', 'largeprint'],
  ['big print', 'largeprint'],
  ['large type', 'largeprint'],
];

/** Words that carry no search meaning here: filler, and words that every page on the site contains. */
export const STOPWORDS: ReadonlySet<string> = new Set([
  'a', 'an', 'the', 'and', 'or', 'for', 'with', 'to', 'of', 'in', 'on', 'at', 'my', 'me', 'we', 'our', 'you', 'your',
  'is', 'are', 'it', 'its', 'do', 'does', 'can', 'how', 'what', 'some', 'something', 'someone', 'that', 'this', 'when',
  'activity', 'activities', 'idea', 'ideas', 'together',
]);
