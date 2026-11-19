import type { Partner, PartnerRelationship } from '../data/partners';

/** The disclosure line every page with a sponsor, paid placement or partner must show (TSA-049). */
const LINES: Record<PartnerRelationship, (name: string) => string> = {
  sponsor: (name) => `This page is sponsored by ${name}.`,
  'paid placement': (name) => `${name} has paid for its place on this page.`,
  partner: (name) => `${name} is a partner of Creative Activities.`,
};

export function disclosureLine(partner: Pick<Partner, 'name' | 'relationship'>): string {
  return LINES[partner.relationship](partner.name);
}
