import { describe, expect, it } from 'vitest';
import { reviewSchema } from './activity-schema';

/** A credentialed-free review record (lived experience needs no body), valid except where a test changes it. */
const review = (overrides: Record<string, unknown> = {}) => ({
  name: 'Sam Reviewer',
  role: 'lived-experience',
  credential: 'Carer, family member of a person with dementia',
  date: new Date('2026-03-01T00:00:00Z'),
  permissionOnFile: true,
  scope: 'Reviewed the seated tabletop steps and the stop note with a family carer.',
  notFor: ['Bedside use'],
  notUnsupervised: ['Any step with scissors'],
  stopSigns: ['Pulling away from the table'],
  ...overrides,
});

describe('review record content hash (PLAT-005)', () => {
  it('accepts a review record without a hash (older records)', () => {
    expect(reviewSchema.safeParse(review()).success).toBe(true);
  });

  it('accepts a well-formed sha256 content hash', () => {
    expect(reviewSchema.safeParse(review({ contentHash: `sha256:${'a'.repeat(64)}` })).success).toBe(true);
  });

  it('rejects a hash that is not sha256 followed by 64 lowercase hex digits', () => {
    expect(reviewSchema.safeParse(review({ contentHash: 'md5:abc' })).success).toBe(false);
    expect(reviewSchema.safeParse(review({ contentHash: `sha256:${'A'.repeat(64)}` })).success).toBe(false);
    expect(reviewSchema.safeParse(review({ contentHash: `sha256:${'a'.repeat(63)}` })).success).toBe(false);
  });
});
