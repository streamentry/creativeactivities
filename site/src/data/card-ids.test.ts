import { describe, expect, it } from 'vitest';
import { CARD_IDS, CARD_ID_FORMAT, cardProblems, cardRedirectLines, registryProblems, type CardIdEntry } from './card-ids';
import { redirectLines } from '../lib/retired-guides';
import { CARDS_DIR, readCards } from '../../scripts/content-bundle.mjs';

/** The cards on disk as the build sees them: the frontmatter id and the slug (file name). */
const liveCards = readCards(CARDS_DIR).map((card) => ({
  id: String((card.data as { id?: unknown }).id),
  slug: card.id,
}));

describe('card ids (PLAT-001)', () => {
  it('gives every live card an id in the format, unique, and listed with its current slug', () => {
    expect(liveCards.length).toBeGreaterThan(0);
    for (const card of liveCards) expect(card.id, card.slug).toMatch(CARD_ID_FORMAT);
    expect(new Set(liveCards.map((c) => c.id)).size).toBe(liveCards.length);
    expect(cardProblems(CARD_IDS, liveCards)).toEqual([]);
  });

  it('never reuses an id for a different card', () => {
    const bySlug = new Map(CARD_IDS.map((e) => [e.id, e.slug]));
    for (const card of liveCards) expect(bySlug.get(card.id)).toBe(card.slug);
  });

  it('rejects a card whose id is registered to another slug', () => {
    const swapped = liveCards.map((c, i) => (i === 0 ? { ...c, slug: 'some-other-card' } : c));
    expect(cardProblems(CARD_IDS, swapped).join('\n')).toMatch(/registered to/);
  });

  it('rejects two cards that share an id', () => {
    const [first, second] = liveCards;
    expect(cardProblems(CARD_IDS, [first, { ...second, id: first.id }]).join('\n')).toMatch(/two cards use this id/);
  });

  it('rejects an id that was retired and is then used again', () => {
    const entries: CardIdEntry[] = [{ id: 'ca-0001', slug: null, retired: true }];
    expect(cardProblems(entries, [{ id: 'ca-0001', slug: 'x' }]).join('\n')).toMatch(/retired/);
  });

  it('rejects a registered live id that no card has', () => {
    expect(cardProblems(CARD_IDS, liveCards.slice(1)).join('\n')).toMatch(/no card has it/);
  });

  it('rejects a malformed id', () => {
    expect(registryProblems([{ id: 'CA-1', slug: 'a' }]).join('\n')).toMatch(/not a card id/);
  });
});

describe('renamed slugs (PLAT-008)', () => {
  const fixture: CardIdEntry[] = [
    { id: 'ca-0001', slug: 'new-name', previousSlugs: ['old-name'] },
    { id: 'ca-0002', slug: 'other-card' },
  ];

  it('emits a 301 from each previous slug to the current page, with and without the slash', () => {
    const lines = cardRedirectLines(fixture);
    expect(lines).toContain('/activity/old-name /activity/new-name/ 301');
    expect(lines).toContain('/activity/old-name/ /activity/new-name/ 301');
    expect(lines).toContain('/activity/old-name/large-print /activity/new-name/large-print/ 301');
    expect(lines).toContain('/activity/old-name/large-print/ /activity/new-name/large-print/ 301');
    expect(lines.some((l) => l.includes('other-card'))).toBe(false);
  });

  it('refuses to reuse a retired slug for a different card', () => {
    const reused: CardIdEntry[] = [
      { id: 'ca-0001', slug: 'new-name', previousSlugs: ['old-name'] },
      { id: 'ca-0002', slug: 'old-name' },
    ];
    expect(registryProblems(reused).join('\n')).toMatch(/never reused/);
    expect(() => cardRedirectLines(reused)).toThrow(/never reused/);
  });

  it("refuses a previous slug that is the same card's current slug or listed twice", () => {
    expect(registryProblems([{ id: 'ca-0001', slug: 'a-card', previousSlugs: ['a-card'] }]).join('\n')).toMatch(
      /its own current slug/,
    );
    expect(
      registryProblems([{ id: 'ca-0001', slug: 'a-card', previousSlugs: ['old-card', 'old-card'] }]).join('\n'),
    ).toMatch(/listed twice/);
  });

  it('gives every recorded previous slug a redirect in the generated lines', () => {
    const all = new Set(redirectLines());
    for (const entry of CARD_IDS) {
      for (const old of entry.previousSlugs ?? []) {
        expect(all.has(`/activity/${old} /activity/${entry.slug}/ 301`)).toBe(true);
      }
    }
  });

  it('has no card redirects today, because no card has been renamed', () => {
    expect(cardRedirectLines()).toEqual([]);
  });
});
