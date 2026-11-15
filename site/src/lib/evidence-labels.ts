/**
 * Evidence table for benefit sentences (TSA-031). Each benefit sentence on an English
 * page has a row here: its strength, its source and the date it was checked. Pages show the
 * row beside the sentence (Faq.astro) and list every row on /editorial-policy/#evidence.
 *
 * Strengths are a rating from the sources, not a promise: "proposed" rows are the editor's
 * first reading and await a reviewer. A row becomes "reviewed" only after a named reviewer
 * has read the sources. Strength scale follows research/03-art-therapy-wellbeing.md §5.
 */
export const EVIDENCE_STRENGTHS = ['strong', 'moderate', 'weak', 'none'] as const;
export type EvidenceStrength = (typeof EVIDENCE_STRENGTHS)[number];

export interface EvidenceRow {
  id: string;
  /** Words that appear in the English copy the row covers. Exact match, from the English dictionary. */
  fragment: string;
  /** The sentence as the table allows it to be said. */
  allowed: string;
  strength: EvidenceStrength;
  source: string;
  /** ISO date the row was last checked, YYYY-MM-DD. */
  date: string;
  status: 'proposed' | 'reviewed';
}

export const EVIDENCE_ROWS: EvidenceRow[] = [
  {
    id: 'ev-cognitive-stimulation-faq',
    fragment: 'Cognitive stimulation in a social setting has shown small benefits in research',
    allowed: 'Small benefits have been shown for group cognitive stimulation in research. It is not a treatment and games do not prevent disease.',
    strength: 'weak',
    source: 'Brain health guides on this site, which list their sources. Group cognitive stimulation trials for mild to moderate dementia.',
    date: '2026-11-15',
    status: 'proposed',
  },
  {
    id: 'ev-dementia-risk-factors-faq',
    fragment: 'Addressing them may lower risk for some people',
    allowed: 'Research links several health and lifestyle factors with dementia risk. Addressing them may lower risk for some people.',
    strength: 'moderate',
    source: 'The 2024 Lancet Commission on dementia prevention, intervention and care. Population-level associations, not proof for one person.',
    date: '2026-11-15',
    status: 'proposed',
  },
];

/** The row for a sentence on an English page, if the sentence carries one. */
export function evidenceFor(text: string): EvidenceRow | undefined {
  return EVIDENCE_ROWS.find((row) => text.includes(row.fragment));
}

/** Plain words for the strength shown next to a sentence. */
export const STRENGTH_LABELS: Record<EvidenceStrength, string> = {
  strong: 'strong',
  moderate: 'moderate',
  weak: 'weak',
  none: 'none found',
};
