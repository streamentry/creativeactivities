import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { APP_CARDS_REFRESH_COMMAND, buildAppCards, readCardRows, serializeAppCards } from '../../scripts/app-cards-lib.ts';

const cardsDir = new URL('../content/activity-cards/', import.meta.url);
const committed = new URL('../../../assets/cards/cards.v1.json', import.meta.url);

describe('bundled app cards (APP-001)', () => {
  it('matches the committed assets/cards/cards.v1.json', () => {
    const fresh = serializeAppCards(buildAppCards(readCardRows(cardsDir)));
    const onDisk = readFileSync(committed, 'utf8');
    expect(
      onDisk,
      `assets/cards/cards.v1.json is stale. Refresh it with: ${APP_CARDS_REFRESH_COMMAND}`,
    ).toBe(fresh);
  });

  it('exports only listed cards, one per website card', () => {
    const payload = buildAppCards(readCardRows(cardsDir));
    const ids = payload.cards.map((card) => card.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(payload.cards.length).toBeGreaterThan(0);
  });
});
