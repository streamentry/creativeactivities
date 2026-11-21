/**
 * The CNT-901 and CNT-902 card audit: which live activity cards are missing a
 * seated or bedside setting or variation, and which have no large-grip variation.
 * Pure logic, no file access, so scripts/card-audit.mjs and the tests share it.
 */

export interface AuditVariation {
  kind: string;
  text?: string;
}

export interface AuditCard {
  id: string;
  data: {
    name?: string;
    settings?: readonly string[];
    variations?: readonly AuditVariation[];
    withdrawn?: unknown;
  };
}

export interface AuditFailures {
  /** `settings` does not list `seated`. */
  noSeatedSetting: string[];
  /** `settings` does not list `bedside` and there is no `bedside` variation. */
  noBedsideOrVariation: string[];
  /** No `large-grip` variation. */
  noLargeGrip: string[];
  /** No `seated` variation. */
  noSeatedVariation: string[];
}

export interface AuditReport {
  /** Every card read, withdrawn ones included. */
  total: number;
  /** Cards not withdrawn: the only ones the audit reports on. */
  live: number;
  failures: AuditFailures;
}

const byId = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/** Audits the live cards. A withdrawn card (TSA-045) is hidden from listings, so it is skipped. */
export function auditCards(cards: readonly AuditCard[]): AuditReport {
  const failures: AuditFailures = {
    noSeatedSetting: [],
    noBedsideOrVariation: [],
    noLargeGrip: [],
    noSeatedVariation: [],
  };
  let live = 0;

  for (const card of cards) {
    if (card.data.withdrawn) continue;
    live += 1;

    const settings = card.data.settings ?? [];
    const kinds = new Set((card.data.variations ?? []).map((variation) => variation.kind));

    if (!settings.includes('seated')) failures.noSeatedSetting.push(card.id);
    if (!settings.includes('bedside') && !kinds.has('bedside')) failures.noBedsideOrVariation.push(card.id);
    if (!kinds.has('large-grip')) failures.noLargeGrip.push(card.id);
    if (!kinds.has('seated')) failures.noSeatedVariation.push(card.id);
  }

  for (const list of Object.values(failures)) list.sort(byId);
  return { total: cards.length, live, failures };
}
