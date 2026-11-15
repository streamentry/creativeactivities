import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PICTURE_BY_ID } from '../data/pictures';
import { SAFETY_FLAGS, type SafetyFlag } from './activities';

/**
 * Checks on the 38 activity cards on disk: the structured safety flags
 * (WEB-022), step images (WEB-012) and the review field (TSA-034). The Astro
 * schema checks the shape at build time; these checks check the content.
 */
const dir = new URL('../content/activity-cards/', import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith('.md'));

const frontmatter = (text: string) => text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';

/** The "  - item" lines under a top-level block key such as `safety:`. */
function blockList(fm: string, key: string): string[] {
  const lines = fm.split('\n');
  const start = lines.findIndex((l) => l === `${key}:`);
  if (start < 0) return [];
  const items: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (/^\S/.test(line)) break;
    const item = line.match(/^\s+- (.*)$/);
    if (item) items.push(item[1].replace(/^"(.*)"$/, '$1'));
  }
  return items;
}

/** A flow list such as `safetyFlags: [heat, adhesive]`. */
const inlineList = (fm: string, key: string): string[] | null => {
  const m = fm.match(new RegExp(`^${key}: \\[(.*)\\]$`, 'm'));
  return m ? m[1].split(',').map((s) => s.trim()).filter(Boolean) : null;
};

/**
 * What the card's own safety and materials text must say before a flag is
 * set. A flag with no matching words is a guess, so the check fails.
 */
const EVIDENCE: Record<Exclude<SafetyFlag, 'none'>, RegExp> = {
  'small-parts': /swallow|chok|small (pieces|items|objects|parts|seeds|grains|blocks|torn)|buttons|beads|\brice\b|seeds|lavender|\bpins\b|petals|fit in the mouth|small or loose/,
  'sharp-tool': /scissors|pruners|knife|stapler|trimmer/,
  heat: /stove|oven|heater|radiator|flame|candle|hot glue|burner|warm/,
  adhesive: /\bglue|\btape/,
  'skin-contact': /skin|sensitiv|irritat|lotion|paint|\bink\b|clay|potting|soil|wool|itch|hand cream|stain|allerg/,
  allergen: /allerg|poison ivy|peanut/,
  ingestion: /mouth|toxic|poison|taste|chew|nibbl|not food|eaten|drink from|swallow/,
  water: /spill|slip|basin|shallow water|water/,
  'fall-risk': /trip|fall|walker|step stool|ladder|lean out|level path|chair/,
};

/**
 * Plain wording that must be flagged. Kept to the words that name the
 * hazard outright, so a missed flag fails the build.
 */
const MUST: Partial<Record<SafetyFlag, RegExp>> = {
  'sharp-tool': /scissors|pruners|knife|stapler|trimmer/,
  heat: /stove|oven|heater|radiator|open flame|candle|hot glue gun|burner/,
  adhesive: /\bglue\b|\btape\b/,
  'small-parts': /swallowed|\bswallow\b|chok|small (pieces|items|objects|parts|seeds|grains|blocks|torn)|buttons|beads|\brice\b|seeds|lavender/,
  water: /slip|mop up|shallow water|basin|wet floor|spilled water|spilled rice|wipe up spills/,
};

describe('activity cards: safety flags (WEB-022)', () => {
  it('covers all 38 cards', () => {
    expect(files.length).toBe(38);
  });

  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const fm = frontmatter(readFileSync(new URL(file, dir), 'utf8'));
    const flags = inlineList(fm, 'safetyFlags') ?? [];
    const evidence = [...blockList(fm, 'safety'), ...blockList(fm, 'materials')].join(' ').toLowerCase();

    it(`${slug}: has flags from the spec list, and "none" only alone`, () => {
      expect(flags.length, `${slug} has no safetyFlags`).toBeGreaterThan(0);
      for (const flag of flags) expect(SAFETY_FLAGS, `${slug}: ${flag}`).toContain(flag);
      if (flags.includes('none')) expect(flags, slug).toEqual(['none']);
    });

    it(`${slug}: every flag matches words in its safety or materials text`, () => {
      for (const flag of flags) {
        if (flag === 'none') continue;
        expect(EVIDENCE[flag as Exclude<SafetyFlag, 'none'>].test(evidence), `${slug} is flagged ${flag} but its text does not say so`).toBe(true);
      }
    });

    it(`${slug}: flags every hazard its text plainly names`, () => {
      for (const [flag, re] of Object.entries(MUST) as [SafetyFlag, RegExp][]) {
        if (re.test(evidence)) expect(flags, `${slug} should be flagged ${flag}`).toContain(flag);
      }
    });
  }
});

describe('activity cards: step images (WEB-012)', () => {
  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const fm = frontmatter(readFileSync(new URL(file, dir), 'utf8'));
    if (!/^images:/m.test(fm)) continue;

    it(`${slug}: each image is from the library, with alt text, caption and provenance`, () => {
      const srcs = [...fm.matchAll(/src: "?(\/pictures\/[^"\s]+\.svg)"?/g)].map((m) => m[1]);
      expect(srcs.length, `${slug} lists no images`).toBeGreaterThan(0);
      for (const src of srcs) {
        const id = src.replace('/pictures/', '').replace(/\.svg$/, '');
        expect(PICTURE_BY_ID.has(id), `${slug}: ${src} is not in the picture library`).toBe(true);
      }
      for (const key of ['alt', 'caption', 'creator', 'source', 'rights', 'people']) {
        const count = [...fm.matchAll(new RegExp(`^\\s+${key}: `, 'gm'))].length;
        expect(count, `${slug}: ${key} for every image`).toBe(srcs.length);
      }
      expect(fm).not.toMatch(/people: "?child/);
    });
  }
});

describe('activity cards: review field (TSA-034)', () => {
  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    it(`${slug}: has no plain reviewer string, so no reviewer is claimed without a record`, () => {
      expect(frontmatter(readFileSync(new URL(file, dir), 'utf8'))).not.toMatch(/^reviewer:/m);
    });
  }
});
