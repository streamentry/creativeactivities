// Review owner roles for the due-for-review queue (PLAT-012, TSA-036).
// A role says who is answerable for a page's review, never a person's name.
// The field is optional on activity cards and guides. Without it, the queue defaults by rule.

export const REVIEW_OWNER_ROLES = ['editor', 'safety-reviewer', 'translation-reviewer'] as const;
export type ReviewOwnerRole = (typeof REVIEW_OWNER_ROLES)[number];

/** Owner a page gets when none is set: safety-flagged pages go to the safety reviewer, the rest to the editor. */
export const defaultOwnerRole = (safetyFlagged: boolean): ReviewOwnerRole => (safetyFlagged ? 'safety-reviewer' : 'editor');

/**
 * The owner role for a queue item. A set owner wins; otherwise the role is defaulted and flagged as such.
 * An owner value outside the fixed set throws, so a typo is never shown as if it were real.
 */
export function ownerOf(item: { owner?: string | undefined; safetyFlagged: boolean }): {
  role: ReviewOwnerRole;
  defaulted: boolean;
} {
  if (item.owner === undefined || item.owner === '') {
    return { role: defaultOwnerRole(item.safetyFlagged), defaulted: true };
  }
  if (!(REVIEW_OWNER_ROLES as readonly string[]).includes(item.owner)) {
    throw new RangeError(`Unknown review owner "${item.owner}"; use one of ${REVIEW_OWNER_ROLES.join(', ')}`);
  }
  return { role: item.owner as ReviewOwnerRole, defaulted: false };
}

/** The reviewOwner value from a page's frontmatter text, or null when none is set. */
export function readFrontmatterOwner(frontmatter: string): string | null {
  // Any value is captured, so a bad one reaches ownerOf and fails loudly instead of being defaulted.
  return frontmatter.match(/^reviewOwner: "?([^"\n]*?)"?[ \t]*$/m)?.[1] ?? null;
}
