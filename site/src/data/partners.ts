/**
 * Sponsors, paid placements and partners (TSA-049). The About page prints this
 * list, and any page that carries a relationship shows a disclosure line from
 * lib/partners.ts.
 *
 * Rules: add an entry only with written permission from the partner, never for
 * an activity, and keep the list current. `permissionDate` is the date written
 * permission was received, as YYYY-MM-DD. Partner logos are not listed here.
 */

export const PARTNER_RELATIONSHIPS = ['sponsor', 'paid placement', 'partner'] as const;

export type PartnerRelationship = (typeof PARTNER_RELATIONSHIPS)[number];

export interface Partner {
  readonly name: string;
  readonly url: string;
  readonly relationship: PartnerRelationship;
  readonly permissionDate: string;
}

/** Empty: no sponsor, paid placement or partner exists today (checked 2026-11-19). */
export const PARTNERS: readonly Partner[] = [];
