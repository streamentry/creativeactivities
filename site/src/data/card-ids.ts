/**
 * Stable card IDs (PLAT-001) and the renamed-slug redirects they drive (PLAT-008).
 *
 * Every activity card carries an `id` in its frontmatter. The id never changes when the
 * file name (the slug, which is the URL) changes, and an id is never given to a second card.
 *
 * ID rule: `ca-` followed by four digits, `ca-0001` to `ca-9999`. The first 56 were issued in
 * alphabetical order of their slug on 2026-11-21. A new card takes the next unused number
 * after the highest one in this registry; a retired card keeps its number.
 *
 * This registry is the record of every id ever issued. Each entry holds:
 * - `slug`: the slug the card has now (null once the card is retired);
 * - `previousSlugs`: earlier slugs, oldest first. Each one gets a permanent redirect to the
 *   card's current `/activity/<slug>/` (emitted into public/_redirects);
 * - `retired`: true for a card removed for good. Its id stays here so it is never reused.
 *
 * Rules the tests enforce (card-ids.test.ts): ids are unique and well formed; each live card's
 * frontmatter id is listed with its current slug; no slug belongs to two ids, and no previous
 * slug is another card's current slug, so an old address never points at a different card.
 *
 * Pure on purpose: no file access, so the redirect generator and the tests can both use it.
 * Node strips the types when scripts import it, so keep to plain interfaces and constants.
 */

export const CARD_ID_FORMAT = /^ca-\d{4}$/;

export interface CardIdEntry {
  readonly id: string;
  readonly slug: string | null;
  readonly previousSlugs?: readonly string[];
  readonly retired?: boolean;
}

/** Every card id issued so far, in id order. The 56 cards on 2026-11-21 are listed alphabetically by slug. */
export const CARD_IDS: readonly CardIdEntry[] = [
  { id: 'ca-0001', slug: 'arrange-flowers-together' },
  { id: 'ca-0002', slug: 'decorate-a-keepsake-box' },
  { id: 'ca-0003', slug: 'decorate-a-plant-pot' },
  { id: 'ca-0004', slug: 'draw-a-comic-strip-together' },
  { id: 'ca-0005', slug: 'draw-a-map-of-a-favorite-place' },
  { id: 'ca-0006', slug: 'draw-a-slow-line-pattern' },
  { id: 'ca-0007', slug: 'draw-repeating-patterns' },
  { id: 'ca-0008', slug: 'draw-to-music' },
  { id: 'ca-0009', slug: 'draw-with-oil-pastels-on-dark-paper' },
  { id: 'ca-0010', slug: 'fold-a-paper-boat' },
  { id: 'ca-0011', slug: 'fold-towels-together' },
  { id: 'ca-0012', slug: 'give-a-hand-massage' },
  { id: 'ca-0013', slug: 'hold-a-sing-along-at-home' },
  { id: 'ca-0014', slug: 'look-through-a-photo-album' },
  { id: 'ca-0015', slug: 'make-a-beaded-keyring' },
  { id: 'ca-0016', slug: 'make-a-button-picture' },
  { id: 'ca-0017', slug: 'make-a-color-collage' },
  { id: 'ca-0018', slug: 'make-a-family-tree-of-hands' },
  { id: 'ca-0019', slug: 'make-a-festival-decoration' },
  { id: 'ca-0020', slug: 'make-a-friendship-bracelet' },
  { id: 'ca-0021', slug: 'make-a-greeting-card' },
  { id: 'ca-0022', slug: 'make-a-lavender-sachet' },
  { id: 'ca-0023', slug: 'make-a-memory-collage' },
  { id: 'ca-0024', slug: 'make-a-paper-chain-garland' },
  { id: 'ca-0025', slug: 'make-a-personal-songbook' },
  { id: 'ca-0026', slug: 'make-a-photo-postcard' },
  { id: 'ca-0027', slug: 'make-a-pine-cone-bird-feeder' },
  { id: 'ca-0028', slug: 'make-a-playlist-together' },
  { id: 'ca-0029', slug: 'make-a-sealed-shaker' },
  { id: 'ca-0030', slug: 'make-a-texture-board' },
  { id: 'ca-0031', slug: 'make-a-tissue-paper-window-picture' },
  { id: 'ca-0032', slug: 'make-a-torn-paper-landscape' },
  { id: 'ca-0033', slug: 'make-leaf-rubbings' },
  { id: 'ca-0034', slug: 'match-colors-to-a-tune' },
  { id: 'ca-0035', slug: 'move-to-music-in-a-chair' },
  { id: 'ca-0036', slug: 'paint-a-garden-stone' },
  { id: 'ca-0037', slug: 'paint-a-shared-picture' },
  { id: 'ca-0038', slug: 'paint-with-watercolors' },
  { id: 'ca-0039', slug: 'plant-seeds-in-a-pot' },
  { id: 'ca-0040', slug: 'press-leaves-and-flowers' },
  { id: 'ca-0041', slug: 'print-with-leaves' },
  { id: 'ca-0042', slug: 'print-with-sponge-shapes' },
  { id: 'ca-0043', slug: 'roll-paper-beads' },
  { id: 'ca-0044', slug: 'shape-a-pinch-pot' },
  { id: 'ca-0045', slug: 'sketch-what-is-on-the-table' },
  { id: 'ca-0046', slug: 'sort-a-box-of-postcards' },
  { id: 'ca-0047', slug: 'sort-buttons-by-color' },
  { id: 'ca-0048', slug: 'start-a-family-recipe-book' },
  { id: 'ca-0049', slug: 'tap-a-rhythm-together' },
  { id: 'ca-0050', slug: 'tear-paper-mosaic' },
  { id: 'ca-0051', slug: 'thread-a-large-bead-bracelet' },
  { id: 'ca-0052', slug: 'watch-birds-from-a-window' },
  { id: 'ca-0053', slug: 'weave-paper-strips' },
  { id: 'ca-0054', slug: 'wind-a-ball-of-yarn' },
  { id: 'ca-0055', slug: 'wrap-a-small-gift' },
  { id: 'ca-0056', slug: 'write-a-letter-together' },
];

/** A card as the build sees it: its frontmatter id and its slug (the file name without `.md`). */
export interface CardRef {
  readonly id: string;
  readonly slug: string;
}

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Problems inside the registry itself, with no cards read. An empty list means it is sound. */
export function registryProblems(entries: readonly CardIdEntry[]): string[] {
  const problems: string[] = [];
  const issued = new Set<string>();
  const holders = new Map<string, string[]>();
  const claim = (slug: string, id: string) => holders.set(slug, [...(holders.get(slug) ?? []), id]);

  for (const entry of entries) {
    const { id, slug, previousSlugs = [] } = entry;
    if (!CARD_ID_FORMAT.test(id)) problems.push(`${id}: not a card id (ca- and four digits)`);
    if (issued.has(id)) problems.push(`${id}: issued more than once`);
    issued.add(id);
    if (entry.retired === true && slug !== null) problems.push(`${id}: retired, so it must not name a slug`);
    if (entry.retired !== true && slug === null) problems.push(`${id}: no slug, so it must be marked retired`);
    if (slug !== null) {
      if (!SLUG.test(slug)) problems.push(`${id}: slug ${slug} is not lowercase words joined by hyphens`);
      claim(slug, id);
    }
    if (new Set(previousSlugs).size !== previousSlugs.length) problems.push(`${id}: a previous slug is listed twice`);
    for (const old of previousSlugs) {
      if (!SLUG.test(old)) problems.push(`${id}: previous slug ${old} is not lowercase words joined by hyphens`);
      if (old === slug) problems.push(`${id}: previous slug ${old} is its own current slug`);
      claim(old, id);
    }
  }
  for (const [slug, ids] of holders) {
    const unique = [...new Set(ids)];
    if (unique.length > 1) problems.push(`slug ${slug} belongs to ${unique.join(' and ')}: a slug is never reused`);
  }
  return problems;
}

/** Problems between the registry and the cards on disk, plus the registry's own problems. */
export function cardProblems(entries: readonly CardIdEntry[], cards: readonly CardRef[]): string[] {
  const problems = registryProblems(entries);
  const byId = new Map<string, CardIdEntry>();
  for (const entry of entries) if (!byId.has(entry.id)) byId.set(entry.id, entry);

  const used = new Set<string>();
  for (const card of cards) {
    if (used.has(card.id)) problems.push(`${card.id}: two cards use this id`);
    used.add(card.id);
    const entry = byId.get(card.id);
    if (!entry) problems.push(`${card.slug}: id ${card.id} is not in the registry`);
    else if (entry.retired === true) problems.push(`${card.slug}: id ${card.id} is retired and cannot be used again`);
    else if (entry.slug !== card.slug) problems.push(`${card.slug}: id ${card.id} is registered to ${entry.slug}`);
  }
  for (const entry of entries) {
    if (entry.retired !== true && !used.has(entry.id)) {
      problems.push(`${entry.id}: registered to ${entry.slug} but no card has it (retire it instead of deleting it)`);
    }
  }
  return problems;
}

/**
 * The Cloudflare `_redirects` lines for renamed cards (PLAT-008): each earlier slug goes to the card's
 * current page, with and without the trailing slash, and its large-print page moves too. Throws when the
 * registry is unsound, so a bad registry cannot write a redirect.
 */
export function cardRedirectLines(entries: readonly CardIdEntry[] = CARD_IDS): string[] {
  const problems = registryProblems(entries);
  if (problems.length > 0) throw new Error(`card-ids: ${problems.join('; ')}`);
  return entries.flatMap((entry) => {
    if (entry.slug === null) return [];
    const to = `/activity/${entry.slug}/`;
    return (entry.previousSlugs ?? []).flatMap((old) => {
      const from = `/activity/${old}`;
      return [
        `${from} ${to} 301`,
        `${from}/ ${to} 301`,
        `${from}/large-print ${to}large-print/ 301`,
        `${from}/large-print/ ${to}large-print/ 301`,
      ];
    });
  });
}
