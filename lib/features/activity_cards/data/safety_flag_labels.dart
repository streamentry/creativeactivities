/// Plain-word labels for the card safety flags, shown above the safety notes
/// (WEB-022). A copy of SAFETY_FLAG_LABELS in site/src/lib/activities.ts; the
/// site test `src/lib/app-parity.test.ts` checks the wording matches. Card
/// text is English only, as on the website.
library;

const safetyFlagLabels = <String, String>{
  'small-parts': 'Not for under 3: small parts',
  'sharp-tool': 'Adult needed for sharp tools',
  'heat': 'Adult needed for heat',
  'adhesive': 'Check for glue or tape sensitivity',
  'skin-contact': 'Check for skin sensitivity to paint or materials',
  'allergen': 'Check for food or plant allergies',
  'ingestion': 'Keep away from mouths',
  'water': 'Spills and wet floors',
  'fall-risk': 'Check the chair and space before standing',
};
