import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SAFETY_FLAGS, SAFETY_FLAG_LABELS, type SafetyFlag } from './activities';

/**
 * Safety rules over the 56 activity cards on disk (TSA-023, TSA-024, TSA-027).
 * The rules read the cards' safetyFlags, materials, safety lines and prompts. They
 * describe what the card must say; they never call an activity "safe" (TSA-023).
 */
const dir = new URL('../content/activity-cards/', import.meta.url);

type Card = {
  id: string;
  name: string;
  description: string;
  summary: string;
  enjoy: string;
  supervision: string;
  crisisRoute: boolean;
  safetyFlags: string[];
  materials: string[];
  safety: string[];
  steps: string[];
  variations: string[];
  hasReview: boolean;
};

const frontmatter = (text: string) => text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
const unquote = (v: string) => v.trim().replace(/^"(.*)"$/, '$1');
const scalar = (fm: string, key: string) => unquote(fm.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))?.[1] ?? '');

/** The "  - item" lines under a top-level block key. */
function blockList(fm: string, key: string): string[] {
  const lines = fm.split('\n');
  const start = lines.findIndex((l) => l === `${key}:`);
  if (start < 0) return [];
  const items: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (/^\S/.test(line)) break;
    const item = line.match(/^\s+- (.*)$/);
    if (item) items.push(unquote(item[1]));
  }
  return items;
}

/** A flow list such as `safetyFlags: [heat, adhesive]`. */
function flowList(fm: string, key: string): string[] {
  const m = fm.match(new RegExp(`^${key}:\\s*\\[(.*)\\]\\s*$`, 'm'));
  return m ? m[1].split(',').map((x) => x.trim()).filter(Boolean) : [];
}

/** The "text:" value of each variation object. */
function variationTexts(fm: string): string[] {
  return [...fm.matchAll(/^\s+text: (.*)$/gm)].map((m) => unquote(m[1]));
}

const cards: Card[] = readdirSync(dir)
  .filter((f) => f.endsWith('.md'))
  .sort()
  .map((f) => {
    const fm = frontmatter(readFileSync(new URL(f, dir), 'utf8'));
    return {
      id: f.replace(/\.md$/, ''),
      name: scalar(fm, 'name'),
      description: scalar(fm, 'description'),
      summary: scalar(fm, 'summary'),
      enjoy: scalar(fm, 'enjoy'),
      supervision: scalar(fm, 'supervision'),
      crisisRoute: scalar(fm, 'crisisRoute') === 'true',
      safetyFlags: flowList(fm, 'safetyFlags'),
      materials: blockList(fm, 'materials'),
      safety: blockList(fm, 'safety'),
      steps: blockList(fm, 'steps'),
      variations: variationTexts(fm),
      hasReview: /^review:/m.test(fm),
    };
  });

/** Words for food or a food-like edible material (TSA-024). Catalogs, magazine pictures of food and seed packets are not food. */
const EDIBLE = /\b(?:peanut|birdseed|beans?|peas?|rice|flour|sugar|dough|honey|shortening|butter|cheese|bread|cake|biscuits?|cookies?|jam|milk|eggs?|oats?|nuts?|fruit|vegetables?|food|seeds?)\b/i;
const NOT_FOOD = /seed catalogs?|seed packets?|pictures? of food|food from magazines/gi;
const isEdible = (material: string) => EDIBLE.test(material.replace(NOT_FOOD, ''));
const SEED_CONTAINERS = /seed (?:catalogs?|packets?)/gi;

/** Small objects a young child or a person who mouths things could swallow (TSA-023 "small parts"). */
const SMALL_PART = /\b(?:buttons?|beads?|rice|seeds?|lavender|blocks?|bottle caps?|caps|coins?|pins?|sequins?|pebbles?)\b/i;
const hasSmallPart = (material: string) => SMALL_PART.test(material.replace(SEED_CONTAINERS, ''));

/** A line that says who must be there or watching (TSA-024 supervision line). */
const SUPERVISION_LINE = /supervis|watch|stay (?:close|at|with)|within reach|nearby|the helper|a helper|someone|adult|do not leave|never use|skip this/i;

/** Prompts that invite a person to talk about feelings, memories or loss (TSA-027). */
const DISCLOSURE_INVITE = /\b(?:memor(?:y|ies)|remember\w*|grie\w*|sadness|sad|feelings?|on (?:their|your) mind|who have died|places they have lived|tell me about|stor(?:y|ies))\b/i;

/** A prompt that asks for a loss, a death or a diagnosis (TSA-027: never asked). */
const ASKS_FOR_LOSS = /\b(?:describe|explain|tell me|talk about|share|say|recount)\b[^.]{0,60}\b(?:loss|death|died|diagnos\w*|illness|grief|cancer|dementia|stroke)\b|\bwhat (?:happened|went wrong)\b/i;

/** Every line a visitor reads about feelings or memories: the summary, what the card is for, the steps and the safety notes. */
const disclosureText = (c: Card) => [c.summary, c.enjoy, ...c.steps, ...c.safety].join(' ');

const withFlags = (c: Card, flags: readonly string[]) => flags.every((f) => c.safetyFlags.includes(f));

describe('TSA-023: safety vocabulary and fields', () => {
  it('has a plain label for every flag in the vocabulary', () => {
    for (const flag of SAFETY_FLAGS) expect(SAFETY_FLAG_LABELS[flag as SafetyFlag]).toBeTruthy();
  });

  it('gives every card at least one flag, and only flags from the vocabulary', () => {
    for (const c of cards) {
      expect(c.safetyFlags.length, c.id).toBeGreaterThan(0);
      for (const f of c.safetyFlags) expect(SAFETY_FLAGS as readonly string[], `${c.id}: ${f}`).toContain(f);
    }
  });

  it('uses "none" only alone, and only when the card has no listed hazard', () => {
    for (const c of cards.filter((card) => card.safetyFlags.includes('none'))) {
      expect(c.safetyFlags, c.id).toEqual(['none']);
      expect(c.materials.some((m) => isEdible(m) || hasSmallPart(m)), c.id).toBe(false);
    }
  });

  it('flags a card with small objects in its materials as small parts', () => {
    const gaps = cards.filter((c) => c.materials.some(hasSmallPart) && !withFlags(c, ['small-parts'])).map((c) => c.id);
    expect(gaps).toEqual([]);
  });

  it('never calls an activity safe', () => {
    const claim = /\b(?:this|the) (?:activity|craft|game|project|session) (?:is|feels?|will be) (?:completely |totally |perfectly )?safe\b|\bsafe (?:activity|craft|game|project) for\b|\b(?:completely|totally|perfectly|100%) safe\b/i;
    for (const c of cards) expect(`${c.description} ${c.summary} ${c.enjoy} ${c.safety.join(' ')}`, c.id).not.toMatch(claim);
  });
});

describe('TSA-024: supervision and food as material', () => {
  it('flags every card with an edible material for ingestion and allergens', () => {
    const gaps = cards
      .filter((c) => c.materials.some(isEdible))
      .filter((c) => !withFlags(c, ['ingestion', 'allergen']))
      .map((c) => `${c.id}: ${c.safetyFlags.join(', ')}`);
    expect(gaps).toEqual([]);
  });

  it('gives every card with a small part or an edible material a supervision line', () => {
    const gaps = cards
      .filter((c) => withFlags(c, ['small-parts']) || c.materials.some(isEdible))
      .filter((c) => !c.safety.some((line) => SUPERVISION_LINE.test(line)))
      .map((c) => c.id);
    expect(gaps).toEqual([]);
  });

  it('never describes an edible or small-part activity as suitable for swallowing difficulty', () => {
    for (const c of cards.filter((card) => card.materials.some(isEdible) || withFlags(card, ['small-parts']))) {
      const text = `${c.name} ${c.description} ${c.summary} ${c.enjoy}`;
      expect(text, c.id).not.toMatch(/swallow|dysphagia|difficulty eating|difficulty chewing/i);
    }
  });

  it('keeps every supervision value on the vocabulary', () => {
    for (const c of cards) expect(['nearby', 'hands-on'], c.id).toContain(c.supervision);
  });
});

describe('TSA-027: crisis route on activities that invite disclosure', () => {
  const invitesDisclosure = cards.filter((c) => DISCLOSURE_INVITE.test(disclosureText(c)));

  it('finds the activities that invite disclosure (memory, feelings, relatives, stories)', () => {
    expect(invitesDisclosure.map((c) => c.id)).toEqual(expect.arrayContaining(['make-a-memory-collage', 'look-through-a-photo-album', 'write-a-letter-together']));
  });

  it('shows the crisis route on every activity that invites disclosure', () => {
    const missing = invitesDisclosure.filter((c) => !c.crisisRoute).map((c) => c.id);
    expect(missing).toEqual([]);
  });

  it('never asks for a loss, a death or a diagnosis in any prompt', () => {
    const hits = cards.filter((c) => ASKS_FOR_LOSS.test([c.summary, ...c.steps, ...c.variations].join(' '))).map((c) => c.id);
    expect(hits).toEqual([]);
  });

  it('keeps the crisis route only where it is needed to a well-formed opt-in', () => {
    for (const c of cards.filter((card) => card.crisisRoute)) expect(DISCLOSURE_INVITE.test(disclosureText(c)), c.id).toBe(true);
  });

  it('uses only the crisis numbers the component verifies', () => {
    const component = readFileSync(new URL('../components/CrisisRoute.astro', import.meta.url), 'utf8');
    expect(component).toContain('988');
    expect(component).toContain('116 123');
    expect(component).toContain('Numbers checked on');
  });
});
