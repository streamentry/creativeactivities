import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const SECTIONS = ['activities', 'caregiving', 'brain-health'] as const;

export const GAME_SLUGS = [
  'picture-pairs',
  'find-the-same',
  'shadow-match',
  'sort-together',
  'picture-puzzle',
  'finish-the-saying',
  'word-search',
  'coloring',
  'conversation-cards',
  'photo-pairs',
  'picture-bingo',
  'calm-breathing',
] as const;

const guideSchema = z.object({
    title: z.string().max(80),
    seoTitle: z.string().max(60).optional(),
    description: z.string().min(110).max(165),
    section: z.enum(SECTIONS),
    order: z.number().int(),
    /** First publication; defaults to `updated` for pages published once. */
    published: z.coerce.date().optional(),
    updated: z.coerce.date(),
    summary: z.string().min(80).max(420),
    keyPoints: z.array(z.string()).min(3).max(6),
    faq: z
      .array(z.object({ q: z.string(), a: z.string() }))
      .min(2)
      .max(6),
    sources: z
      .array(
        z.object({
          title: z.string(),
          publisher: z.string(),
          url: z.string().url(),
        }),
      )
      .min(1),
    relatedGames: z.array(z.enum(GAME_SLUGS)).default([]),
    related: z.array(z.string()).default([]),
    health: z.boolean().default(false),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: guideSchema,
});

/**
 * Translations live at `guides-i18n/<language code>/<section>/<slug>.md` and
 * mirror the English entry. Character limits are looser because many
 * languages (Chinese, Japanese, Korean) need far fewer characters.
 */
const guidesI18n = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides-i18n' }),
  schema: guideSchema.extend({
    /** Translated headings can expand; keep the full wording instead of cutting it off. */
    title: z.string().max(140),
    seoTitle: z.string().max(80).optional(),
    /** Translated descriptions use the 50–360 display-width bounds in check-site.mjs. */
    description: z.string().min(30).max(360),
    /** Preserve translated summaries that expand beyond the English character limit. */
    summary: z.string().min(30).max(800),
    /** The date of the English version this translation was made from. */
    translatedFrom: z.coerce.date(),
  }),
});

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
 * One startable activity (DESIGN.md › Content design and data model). The
 * fields describe the activity, never the person doing it.
 */
const activityCards = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/activity-cards' }),
  schema: z
    .object({
      name: z.string().max(60),
      seoTitle: z.string().max(60).optional(),
      description: z.string().min(110).max(165),
      /** One plain sentence: what you make or do together. */
      summary: z.string().min(30).max(140),
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
      safety: z.array(z.string().max(220)).min(1).max(6),
      /** The calm exit: what to do when it is not working. */
      stopNote: z.string().max(260),
      /** Guide pages (`section/slug`) that recommend this activity. */
      guides: z.array(z.string()).default([]),
      related: z.array(z.string()).max(4).default([]),
      published: z.coerce.date(),
      updated: z.coerce.date(),
      author: z.string(),
      /** Null until a named person has actually reviewed it. */
      reviewer: z.string().nullable().default(null),
      sources: z
        .array(z.object({ title: z.string(), publisher: z.string(), url: z.string().url() }))
        .default([]),
    })
    .refine((d) => d.activityMinutes[0] <= d.activityMinutes[1], 'activityMinutes must be [min, max]'),
});

/**
 * One search hub per intent (VISION.md › Search architecture). A hub explains
 * how its activities were chosen and links to the canonical activity pages;
 * it never copies their steps.
 */
const hubs = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/hubs' }),
  schema: z.object({
    title: z.string().max(80),
    seoTitle: z.string().max(60).optional(),
    description: z.string().min(110).max(165),
    eyebrow: z.string().max(40),
    lede: z.string().min(80).max(420),
    /** Why these activities suit this situation; shown before the list. */
    choosing: z.array(z.string()).min(3).max(6),
    /** Curated activity card slugs, best fit first. */
    activities: z.array(z.string()).min(6).max(16),
    /** The variation each card shows, when the hub is about one need. */
    variation: z.enum(VARIATION_KINDS).optional(),
    faq: z
      .array(z.object({ q: z.string(), a: z.string() }))
      .min(2)
      .max(6),
    guides: z.array(z.string()).max(6).default([]),
    /** Other hub ids. */
    related: z.array(z.string()).max(4).default([]),
    published: z.coerce.date(),
    updated: z.coerce.date(),
    author: z.string(),
    sources: z
      .array(z.object({ title: z.string(), publisher: z.string(), url: z.string().url() }))
      .default([]),
  }),
});

export const collections = { guides, guidesI18n, activityCards, hubs };
