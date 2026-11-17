import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Guide sections. `brain-health` is retired in English (lib/retired-guides.ts)
 * but stays here so its translations remain valid until they are replaced.
 */
export const SECTIONS = ['activities', 'crafts', 'kids', 'together', 'creative-calm', 'caregiving', 'brain-health'] as const;

export const GAME_SLUGS = [
  'picture-pairs',
  'find-the-same',
  'shadow-match',
  'four-together',
  'odd-one-out',
  'color-match',
  'halves-match',
  'color-by-number',
  'story-chain',
  'story-dice',
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
    /** Shows the crisis-safe route (WEB-061) on pages that invite talk about feelings, grief or loss. */
    crisisRoute: z.boolean().default(false),
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

import { VARIATION_KINDS, activityCardSchema } from './lib/activity-schema';

export { ACTIVITY_GROUPS, ACTIVITY_SETTINGS, ACTIVITY_TYPES, VARIATION_KINDS } from './lib/activity-schema';

/**
 * Activity cards: the schema lives in lib/activity-schema.ts so tests can check it.
 */
const activityCards = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/activity-cards' }),
  schema: activityCardSchema,
});

/**
 * One search hub per intent (VISION.md › Search architecture). A hub explains
 * how its activities were chosen and links to the canonical activity pages;
 * it never copies their steps.
 */
const hubs = defineCollection({
  // Intent hubs sit at the top; occasion hubs sit in `occasions/` and are served at /occasions/<slug>/ (WEB-034).
  loader: glob({ pattern: '**/*.md', base: './src/content/hubs' }),
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
    /** Indexed only when the H3 threshold passes and any required reviewer has signed off (02 H3; 12 SEO-009). */
    indexable: z.boolean().default(true),
    /** Why the hub is held from search. Required when `indexable` is false. */
    indexHold: z.string().max(400).optional(),
  }).refine((d) => d.indexable || (d.indexHold ?? '').length > 0, 'a noindex hub needs an indexHold reason'),
});

export const collections = { guides, guidesI18n, activityCards, hubs };
