import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { GAMES } from '../data/games';
import { EXPLAINER_FILES } from './claims';

/**
 * CNT-1000: no URL slug carries a therapy, healing or cure word, or pairs an art or music word with a
 * condition. The claims lint reads titles, descriptions, names, picture text and body copy; this test reads
 * the addresses, which search results show and links repeat. Only the explainer pages may name the profession.
 */
const CONTENT = new URL('../content/', import.meta.url);
const PAGES = new URL('../pages/', import.meta.url);

const names = (dir: URL, ext: string) =>
  readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(ext) && !e.name.includes('['))
    .map((e) => e.name.slice(0, -ext.length));

function guideIds(): string[] {
  return (readdirSync(new URL('guides/', CONTENT), { recursive: true }) as string[])
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.slice(0, -3));
}

/** Every address segment the site publishes in English, keyed by the path it appears at. */
export function slugs(): string[] {
  return [
    ...names(new URL('activity-cards/', CONTENT), '.md').map((s) => `activity/${s}`),
    ...names(new URL('hubs/', CONTENT), '.md'),
    ...guideIds(),
    ...names(PAGES, '.astro'),
    ...GAMES.map((g) => `games/${g.slug}`),
  ];
}

const explainerSlugs = new Set(
  EXPLAINER_FILES.map((f) => f.replace(/^guides\//, '').replace(/^pages\//, '').replace(/\.(md|astro)$/, '')),
);

/** Old addresses kept so inbound links keep working. Each says why; remove the entry when the address goes. */
export const LEGACY_SLUGS: Readonly<Record<string, string>> = {
  'activities/therapeutic-art-activities-for-adults':
    'Old address kept for inbound links. The page was retitled and rewritten as relaxing activities, not therapy, under CNT-960.',
};

const THERAPY_TOKEN = /^(?:therapy|therapies|therapeutic|therapist|therapists|heal|heals|healing|cure|cures|cured)$/;
const ART_WORD = /^(?:art|music|painting|drawing|coloring|colouring|craft|crafts|creative)$/;
const CONDITION = /^(?:anxiety|anxious|depression|ptsd|stress|trauma)$/;

export function problemWith(slug: string): string | null {
  const tokens = slug.split(/[-/]/);
  const word = tokens.find((t) => THERAPY_TOKEN.test(t));
  if (word) return `names "${word}"`;
  const forAt = tokens.findIndex((t, i) => t === 'for' && CONDITION.test(tokens[i + 1] ?? ''));
  if (forAt > 0 && tokens.slice(0, forAt).some((t) => ART_WORD.test(t))) return `pairs an art or music word with the condition "${tokens[forAt + 1]}"`;
  return null;
}

describe('address slugs (CNT-1000)', () => {
  const all = slugs();

  it('reads every kind of address', () => {
    expect(all.some((s) => s.startsWith('activity/'))).toBe(true);
    expect(all.some((s) => s.startsWith('games/'))).toBe(true);
    expect(all.some((s) => s.includes('/') && !s.startsWith('activity/') && !s.startsWith('games/'))).toBe(true);
    expect(all.length).toBeGreaterThan(150);
  });

  it('names no therapy, healing or cure word and no art-for-a-condition pairing, except the explainers and one legacy address', () => {
    const found = all
      .filter((s) => !explainerSlugs.has(s) && !(s in LEGACY_SLUGS))
      .map((s) => ({ s, why: problemWith(s) }))
      .filter((x) => x.why !== null)
      .map((x) => `${x.s}: ${x.why}`);
    expect(found).toEqual([]);
  });

  it('lets only the listed explainers and the legacy address use such a word', () => {
    const using = all.filter((s) => problemWith(s) !== null).sort();
    expect(using).toEqual([...explainerSlugs, ...Object.keys(LEGACY_SLUGS)].filter((s) => all.includes(s) && problemWith(s) !== null).sort());
  });

  it('keeps every exception pointing at a page that still exists, so the list cannot rot', () => {
    for (const slug of [...explainerSlugs, ...Object.keys(LEGACY_SLUGS)]) expect(all, slug).toContain(slug);
    for (const [slug, why] of Object.entries(LEGACY_SLUGS)) expect(why.length, slug).toBeGreaterThan(30);
  });

  it('catches the patterns it is meant to', () => {
    expect(problemWith('activities/therapy-for-dementia')).toContain('therapy');
    expect(problemWith('crafts/healing-art')).toContain('healing');
    expect(problemWith('activities/art-for-anxiety')).toContain('anxiety');
    expect(problemWith('activities/music-and-crafts-for-stress')).toContain('stress');
    expect(problemWith('activities/arts-and-crafts-for-seniors')).toBeNull();
    expect(problemWith('brain-health/exercise')).toBeNull();
  });
});
