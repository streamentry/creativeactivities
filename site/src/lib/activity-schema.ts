import { z } from 'astro/zod';
import { SAFETY_FLAGS } from './activities';

/** The finder's three first questions (DESIGN.md › Finder filters). */
export const ACTIVITY_TYPES = ['art', 'craft', 'nature', 'music', 'sensory', 'conversation'] as const;
export const ACTIVITY_SETTINGS = ['tabletop', 'seated', 'bedside', 'standing', 'outdoors'] as const;
export const ACTIVITY_GROUPS = ['one-to-one', 'small-group', 'intergenerational'] as const;
export const VARIATION_KINDS = [
  'easier',
  'less-sensory',
  'seated',
  'bedside',
  'more-collaborative',
  'for-a-group',
  'with-children',
  'low-vision',
  'nonverbal',
] as const;

/**
 * An image on a card (WEB-012). It must come from the picture library, and
 * it always carries alt text, a caption and where it came from. Rights and
 * release detail sit in the private rights log (WEB-073); this is the public
 * summary. No child appears in a public image, so there is no value for one.
 */
export const activityImageSchema = z.object({
  src: z.string().regex(/^\/pictures\/[a-z0-9-]+\.svg$/, 'a picture from the library'),
  /** What matters in the picture, written so someone who cannot see it gets the same point. */
  alt: z.string().min(20).max(240),
  caption: z.string().min(10).max(200),
  /** The step (1-based) this picture belongs to; absent for a picture of the finished result or the materials. */
  step: z.number().int().min(1).max(9).optional(),
  /** 'materials' shows what you need (WEB-012); a picture of the result needs no kind. */
  kind: z.enum(['materials']).optional(),
  provenance: z.object({
    creator: z.string().min(2).max(120),
    source: z.string().min(10).max(200),
    rights: z.string().min(10).max(240),
    people: z.enum(['none', 'adult-release-on-file']),
    date: z.coerce.date(),
  }),
}).refine((image) => !(image.kind === 'materials' && image.step !== undefined), {
  message: 'a materials picture belongs to "What you need", not to a step',
});

/** Withdrawal of a card that is unsafe or wrong (TSA-045). */
export const withdrawnSchema = z.object({
  date: z.coerce.date(),
  /** Shown to readers on the notice; say what was wrong, not who reported it. */
  reason: z.string().min(40).max(400),
  replacement: z.string().max(120).optional(),
});

/**
 * The credentialed review record (TSA-034). It exists only when a named
 * person has checked the card and agreed to be named. The page shows only
 * what this record says.
 */
export const reviewSchema = z.object({
  name: z.string().min(2).max(80),
  credential: z.string().min(2).max(120),
  date: z.coerce.date(),
  scope: z.string().min(40).max(400),
  notFor: z.array(z.string().min(3)).min(1).max(6),
  notUnsupervised: z.array(z.string().min(3)).min(1).max(6),
  stopSigns: z.array(z.string().min(3)).min(1).max(6),
  permissionOnFile: z.literal(true),
});

/**
 * One startable activity (DESIGN.md › Content design and data model). The
 * fields describe the activity, never the person doing it.
 */
export const activityCardSchema = z
  .object({
    name: z.string().max(60),
    seoTitle: z.string().max(60).optional(),
    description: z.string().min(110).max(165),
    /** One plain sentence: what you make or do together. */
    summary: z.string().min(30).max(140),
    /** Who might enjoy it: interests and preferences, never a diagnosis (VISION.md). */
    enjoy: z.string().min(40).max(220).optional(),
    type: z.enum(ACTIVITY_TYPES),
    prepMinutes: z.number().int().min(0).max(60),
    activityMinutes: z.tuple([z.number().int().min(5), z.number().int().max(90)]),
    cost: z.enum(['free', 'low', 'some']),
    mess: z.enum(['none', 'low', 'medium']),
    energy: z.enum(['low', 'medium']),
    supervision: z.enum(['nearby', 'hands-on']),
    settings: z.array(z.enum(ACTIVITY_SETTINGS)).min(1),
    groups: z.array(z.enum(ACTIVITY_GROUPS)).min(1),
    /** What you need, in everyday words. */
    materials: z.array(z.string()).min(1).max(10),
    /** Swaps for anything that is not to hand. */
    substitutions: z.array(z.string()).default([]),
    senses: z.array(z.enum(['sight', 'touch', 'smell', 'hearing', 'movement'])).min(1),
    /** One action per step (DESIGN.md › Accessibility). */
    steps: z.array(z.string().max(220)).min(3).max(9),
    variations: z
      .array(z.object({ kind: z.enum(VARIATION_KINDS), text: z.string().max(260) }))
      .min(2)
      .max(6),
    /** Structured flags shown above the steps (WEB-022). `none` only when checked and nothing applies. */
    safetyFlags: z.array(z.enum(SAFETY_FLAGS)).min(1).max(SAFETY_FLAGS.length),
    safety: z.array(z.string().max(220)).min(1).max(6),
    /** The calm exit: what to do when it is not working. */
    stopNote: z.string().max(260),
    /** Guide pages (`section/slug`) that recommend this activity. */
    guides: z.array(z.string()).default([]),
    related: z.array(z.string()).max(4).default([]),
    published: z.coerce.date(),
    updated: z.coerce.date(),
    author: z.string(),
    /** Step photos or illustrations (WEB-012). Empty until real images exist. */
    images: z.array(activityImageSchema).max(6).default([]),
    /** Set when the card is unsafe or wrong; hides it from every listing (TSA-045). */
    withdrawn: withdrawnSchema.optional(),
    /** Absent until a named, credentialed person has reviewed the card (TSA-034). */
    review: reviewSchema.optional(),
    sources: z
      .array(z.object({ title: z.string(), publisher: z.string(), url: z.string().url() }))
      .default([]),
  })
  .refine((d) => d.activityMinutes[0] <= d.activityMinutes[1], 'activityMinutes must be [min, max]')
  .refine((d) => !d.safetyFlags.includes('none') || d.safetyFlags.length === 1, '"none" cannot be combined with other flags')
  .refine(
    (d) => d.images.every((image) => image.step === undefined || image.step <= d.steps.length),
    'an image names a step the card does not have',
  );
