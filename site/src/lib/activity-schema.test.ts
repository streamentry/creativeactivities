import { describe, expect, it } from 'vitest';
import { REVIEW_ROLES, activityCardSchema } from './activity-schema';

const DESCRIPTION =
  'Fold a basket of clean, warm towels together at a table. Easy steps, an easier version and a clear place to stop.';

/** A valid card; each test changes one field to see what the schema says. */
const CARD = {
  name: 'Fold towels together',
  description: DESCRIPTION,
  summary: 'Fold clean, warm towels together at a table.',
  type: 'craft',
  prepMinutes: 0,
  activityMinutes: [10, 20],
  cost: 'free',
  mess: 'none',
  energy: 'low',
  supervision: 'nearby',
  settings: ['seated'],
  groups: ['one-to-one'],
  materials: ['A basket of clean, dry towels'],
  senses: ['touch'],
  steps: ['Hand over one towel.', 'Fold it in half, then in half again.', 'Stack it on the pile.'],
  variations: [
    { kind: 'easier', text: 'Fold only the towel in front of them.' },
    { kind: 'bedside', text: 'Fold a hand towel on a tray table.' },
  ],
  safety: ['Keep towels away from stove burners and open flames.'],
  safetyFlags: ['heat'],
  stopNote: 'It is fine to stop after one towel.',
  published: '2026-11-13',
  updated: '2026-11-13',
  author: 'Creative Activities editorial team',
};

const IMAGE = {
  src: '/pictures/vase-of-flowers.svg',
  alt: 'Drawing of a glass jar of flowers on a table, the finished arrangement.',
  caption: 'The finished jar, with stems chosen together.',
  step: 3,
  provenance: {
    creator: 'Creative Activities editorial team',
    source: 'Original drawing made for this website',
    rights: 'Owned by Creative Activities; free to print for personal use.',
    people: 'none',
    date: '2026-11-13',
  },
};

const parse = (overrides: Record<string, unknown>) => activityCardSchema.safeParse({ ...CARD, ...overrides });

describe('activity card schema', () => {
  it('accepts a complete card', () => {
    expect(parse({}).success).toBe(true);
  });

  describe('safety flags (WEB-022)', () => {
    it('requires the field: a blank card fails the editorial check', () => {
      const { safetyFlags: _omit, ...rest } = CARD;
      expect(activityCardSchema.safeParse(rest).success).toBe(false);
    });

    it('rejects an empty list and unknown flags', () => {
      expect(parse({ safetyFlags: [] }).success).toBe(false);
      expect(parse({ safetyFlags: ['cookies'] }).success).toBe(false);
    });

    it('accepts several flags from the spec list', () => {
      expect(parse({ safetyFlags: ['small-parts', 'adhesive', 'ingestion'] }).success).toBe(true);
    });

    it('lets "none" stand only alone', () => {
      expect(parse({ safetyFlags: ['none'] }).success).toBe(true);
      expect(parse({ safetyFlags: ['none', 'heat'] }).success).toBe(false);
    });
  });

  describe('step images (WEB-012)', () => {
    it('accepts an image with alt text, caption and provenance', () => {
      expect(parse({ images: [IMAGE] }).success).toBe(true);
    });

    it('defaults to no images', () => {
      const result = parse({});
      expect(result.success && result.data.images).toEqual([]);
    });

    it('requires alt text and a caption', () => {
      expect(parse({ images: [{ ...IMAGE, alt: '' }] }).success).toBe(false);
      expect(parse({ images: [{ ...IMAGE, alt: 'Picture' }] }).success).toBe(false);
      expect(parse({ images: [{ ...IMAGE, caption: undefined }] }).success).toBe(false);
    });

    it('requires provenance: creator, source and rights', () => {
      const { provenance: _omit, ...noProvenance } = IMAGE;
      expect(parse({ images: [noProvenance] }).success).toBe(false);
      expect(parse({ images: [{ ...IMAGE, provenance: { ...IMAGE.provenance, rights: '' } }] }).success).toBe(false);
      expect(parse({ images: [{ ...IMAGE, provenance: { ...IMAGE.provenance, creator: undefined } }] }).success).toBe(false);
    });

    it('allows people in a picture only with a release on file, and never a child', () => {
      const withPeople = (people: string) => ({ ...IMAGE, provenance: { ...IMAGE.provenance, people } });
      expect(parse({ images: [withPeople('adult-release-on-file')] }).success).toBe(true);
      expect(parse({ images: [withPeople('child')] }).success).toBe(false);
      expect(parse({ images: [withPeople('unknown')] }).success).toBe(false);
    });

    it('marks a materials picture with kind, never together with a step', () => {
      const { step: _step, ...materials } = IMAGE;
      expect(parse({ images: [{ ...materials, kind: 'materials' }] }).success).toBe(true);
      expect(parse({ images: [{ ...IMAGE, kind: 'materials', step: 2 }] }).success).toBe(false);
      expect(parse({ images: [{ ...materials, kind: 'sketch' }] }).success).toBe(false);
    });

    it('only points at the picture library', () => {
      expect(parse({ images: [{ ...IMAGE, src: 'https://example.org/photo.jpg' }] }).success).toBe(false);
      expect(parse({ images: [{ ...IMAGE, src: '/pictures/../secret.svg' }] }).success).toBe(false);
    });

    it('refuses a step number that the card does not have', () => {
      expect(parse({ images: [{ ...IMAGE, step: 4 }] }).success).toBe(false);
    });
  });

  describe('withdrawal (TSA-045)', () => {
    it('accepts a date and a reason', () => {
      const withdrawn = {
        date: '2026-11-14',
        reason: 'A step said to use a candle near the table. The step is removed while it is fixed.',
      };
      expect(parse({ withdrawn }).success).toBe(true);
    });

    it('requires a date and a reason of real length', () => {
      expect(parse({ withdrawn: { date: '2026-11-14', reason: 'Unsafe' } }).success).toBe(false);
      expect(parse({ withdrawn: { reason: 'A long enough reason to be useful to a reader here.' } }).success).toBe(false);
    });
  });

  describe('review record (TSA-034)', () => {
    const REVIEW = {
      name: 'Jane Example',
      role: 'occupational-therapist',
      credential: 'Registered occupational therapist',
      body: 'Example Register of Occupational Therapists',
      date: '2026-11-10',
      scope: 'Checked the steps and stop signs for people living with early dementia. Not checked for medical use.',
      notFor: ['Anyone who is in distress when asked to make something.'],
      notUnsupervised: ['People who put small objects in their mouth.'],
      stopSigns: ['Pulling away, crying, or agitation that does not settle with a break.'],
      permissionOnFile: true,
    };

    it('accepts a full record when permission is on file', () => {
      expect(parse({ review: REVIEW }).success).toBe(true);
    });

    it('refuses a record without the reviewer\'s permission', () => {
      expect(parse({ review: { ...REVIEW, permissionOnFile: false } }).success).toBe(false);
    });

    it('requires name, credential, date, scope and stop signs', () => {
      expect(parse({ review: { ...REVIEW, credential: undefined } }).success).toBe(false);
      expect(parse({ review: { ...REVIEW, scope: 'Short' } }).success).toBe(false);
      expect(parse({ review: { ...REVIEW, stopSigns: [] } }).success).toBe(false);
    });

    it('records the reviewer\'s role and the body that holds the credential (CNT-1004)', () => {
      expect(parse({ review: { ...REVIEW, role: undefined } }).success).toBe(false);
      expect(parse({ review: { ...REVIEW, role: 'wellness-coach' } }).success).toBe(false);
      expect(parse({ review: { ...REVIEW, body: undefined } }).success).toBe(false);
      expect(parse({ review: { ...REVIEW, body: '' } }).success).toBe(false);
    });

    it('lets a lived-experience reviewer have no credential body, and no one else', () => {
      const lived = { ...REVIEW, role: 'lived-experience', credential: 'Cared for a parent with dementia', body: undefined };
      expect(parse({ review: lived }).success).toBe(true);
      expect(parse({ review: { ...lived, role: 'art-therapist' } }).success).toBe(false);
    });

    it('accepts every role the reviewer table names', () => {
      for (const role of REVIEW_ROLES) {
        const body = role === 'lived-experience' ? undefined : 'Example Register';
        expect(parse({ review: { ...REVIEW, role, body } }).success, role).toBe(true);
      }
    });

    it('no longer takes the plain reviewer string', () => {
      const result = parse({ reviewer: 'Jane Example' });
      expect(result.success && 'reviewer' in result.data).toBe(false);
    });
  });

  describe('declined review (CNT-1004)', () => {
    const DECLINED = {
      name: 'Jane Example',
      role: 'art-therapist',
      credential: 'Registered art therapist',
      body: 'Example Register of Art Therapists',
      date: '2026-11-12',
      reason: 'The activity asks people to name a feeling, which the reviewer does not think is safe for this group.',
      permissionOnFile: true,
    };

    it('accepts a declined record without the fields a shown review needs', () => {
      expect(parse({ reviewDeclined: DECLINED }).success).toBe(true);
    });

    it('requires the reason, the credential body and the reviewer\'s permission', () => {
      expect(parse({ reviewDeclined: { ...DECLINED, reason: 'No.' } }).success).toBe(false);
      expect(parse({ reviewDeclined: { ...DECLINED, body: undefined } }).success).toBe(false);
      expect(parse({ reviewDeclined: { ...DECLINED, permissionOnFile: false } }).success).toBe(false);
    });

    it('lets a lived-experience reviewer decline without a credential body, and no one else', () => {
      const lived = { ...DECLINED, role: 'lived-experience', credential: 'Cared for a parent with dementia', body: undefined };
      expect(parse({ reviewDeclined: lived }).success).toBe(true);
      expect(parse({ reviewDeclined: { ...lived, role: 'grief-practitioner' } }).success).toBe(false);
    });

    it('refuses a card that is both reviewed and declined', () => {
      const approved = {
        name: 'Jane Example',
        role: 'occupational-therapist',
        credential: 'Registered occupational therapist',
        body: 'Example Register of Occupational Therapists',
        date: '2026-11-10',
        scope: 'Checked the steps and stop signs for people living with early dementia. Not checked for medical use.',
        notFor: ['Anyone who is in distress when asked to make something.'],
        notUnsupervised: ['People who put small objects in their mouth.'],
        stopSigns: ['Pulling away, crying, or agitation that does not settle with a break.'],
        permissionOnFile: true,
      };
      expect(parse({ review: approved }).success).toBe(true);
      expect(parse({ review: approved, reviewDeclined: DECLINED }).success).toBe(false);
    });

    it('accepts every card with neither field, as before', () => {
      expect(parse({}).success).toBe(true);
    });
  });
});
