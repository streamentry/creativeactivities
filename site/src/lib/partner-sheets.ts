/**
 * SEO-025: one-page partner sheets for libraries, activity directors and facilitators. Each sheet draws on the
 * existing activity cards only. A missing, withdrawn or non-fitting card fails the build, as it does for the care-home
 * session plans (CNT-014, adult variant). No partner is named and no outcome is claimed.
 */
import { cardFitsPlan } from './care-setting-plans';

/** The session length the library sheet plans for. Every card below must hold it in its activity time. */
export const LIBRARY_MINUTES = 30;

/** Three cards for a drop-in session, one of them chosen on the day. All are marked small-group. */
export const LIBRARY_CARD_SLUGS = ['fold-a-paper-boat', 'hold-a-sing-along-at-home', 'start-a-family-recipe-book'] as const;

/** The minimal shape the sheets read from an activity card. */
export interface SheetCard {
  id: string;
  data: {
    name: string;
    summary: string;
    withdrawn?: unknown;
    activityMinutes: readonly [number, number];
    prepMinutes: number;
    materials: readonly string[];
    variations: readonly { kind: string; text: string }[];
  };
}

/** Looks up each slug, in order. Throws when a card is missing, withdrawn, or its activity time does not hold `minutes`. */
export function pickCards<T extends SheetCard>(cards: readonly T[], slugs: readonly string[], minutes?: number): T[] {
  const byId = new Map(cards.map((card) => [card.id, card]));
  return slugs.map((slug) => {
    const card = byId.get(slug);
    if (!card || card.data.withdrawn) throw new Error(`partner-sheets: ${slug} is missing or withdrawn`);
    if (minutes !== undefined && !cardFitsPlan(card.data.activityMinutes, minutes)) {
      throw new Error(`partner-sheets: ${slug} does not fit ${minutes} minutes`);
    }
    return card;
  });
}

/** The card's own text for a group, from its for-a-group variation. Throws when the card has none. */
export function groupVersion(card: SheetCard): string {
  const group = card.data.variations.find((v) => v.kind === 'for-a-group');
  if (!group) throw new Error(`partner-sheets: ${card.id} has no for-a-group variation`);
  return group.text;
}

/** The activity time as the card states it, for example "10 to 30 minutes". */
export function activityTimeText(card: SheetCard): string {
  const [low, high] = card.data.activityMinutes;
  return `${low} to ${high} minutes`;
}

/** The routes of the three partner sheets. Each is held from search and prints on one page. */
export const PARTNER_SHEET_PATHS = [
  '/for-organizations/library-programming/',
  '/for-organizations/activity-director/',
  '/for-organizations/facilitator-note/',
] as const;
