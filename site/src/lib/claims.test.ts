import { describe, expect, it } from 'vitest';
import { checkClaims, englishSources, EXPLAINER_FILES, type ClaimViolation } from './claims';

const flagged = (text: string, file = 'activity/example.md'): ClaimViolation[] => checkClaims(text, file);

describe('claims lint: banned claims in our own copy', () => {
  it.each([
    ['This activity is therapeutic for the whole family.'],
    ['Making cards is a therapy for busy carers.'],
    ['Our games heal and cure boredom.'],
    ['Coloring reduces anxiety in adults.'],
    ['Painting lowers stress for caregivers.'],
    ['Brain training improves memory every day.'],
    ['Playing this game improves your memory.'],
    ['Clinically proven to help you relax.'],
    ['This method is scientifically shown to work.'],
    ['Joining the group slows dementia.'],
    ['Crafts treat depression and anxiety.'],
    ['Try a brain age test today.'],
    ['Stress relief in ten minutes.'],
    ['Art helps reduce loneliness in care homes.'],
    ['Lift your mood with a quick sketch.'],
  ])('flags: %s', (text) => {
    expect(flagged(text).length).toBeGreaterThan(0);
  });

  it.each([
    ['This is a creative activity, not therapy or medical advice.'],
    ['Coloring does not reduce anxiety, and no one needs to try.'],
    ['It does not treat or cure any condition.'],
    ['Some people find coloring calming.'],
    ['These games are not clinically proven and make no health claim.'],
    ['Creative activities are linked to enjoyment and connection.'],
    ['Some studies have found a change in stress hormones. Results vary.'],
  ])('allows negated or approved wording: %s', (text) => {
    expect(flagged(text)).toEqual([]);
  });

  it('does not flag everyday words that share a stem', () => {
    const text = 'Give the dog a treat, make a healthy snack, and treat yourself to a rest. Heating paper is fine.';
    expect(flagged(text)).toEqual([]);
  });

  it('allows naming the profession in a sentence about credentials', () => {
    expect(flagged('Art therapy is a profession. This is not.')).toEqual([]);
    expect(flagged('Look for an art therapist with an ATR or ATR-BC credential.')).toEqual([]);
    expect(flagged('Occupational therapy is a separate, licensed profession.')).toEqual([]);
  });

  it('flags art therapy used as a label for our activities', () => {
    expect(flagged('Our art therapy kit has five steps.').length).toBe(1);
  });

  it('flags condition-led titles such as "Art for anxiety"', () => {
    const v = flagged('title: "Art for Anxiety at Home"\n', 'activities/x.md');
    expect(v.map((x) => x.rule)).toContain('condition-title');
  });

  it('flags therapy words in title, seoTitle, description and name fields', () => {
    const text = 'seoTitle: "Therapeutic Art Activities for Adults at Home"\n';
    expect(flagged(text, 'activities/relaxing.md').length).toBeGreaterThan(0);
    const desc = 'description: "Searching for therapeutic art activities for adults?"\n';
    expect(flagged(desc, 'activities/relaxing.md').length).toBeGreaterThan(0);
  });

  it('lets the explainer pages use the profession name in their titles', () => {
    const explainer = EXPLAINER_FILES[0];
    expect(flagged('title: "Art Therapy or a Creative Activity"\n', explainer)).toEqual([]);
  });

  it('reports the line and the sentence for each violation', () => {
    const [v] = flagged('First line is fine.\nThis is therapeutic work.\n', 'hubs/x.md');
    expect(v.line).toBe(2);
    expect(v.match.toLowerCase()).toBe('therapeutic');
    expect(v.file).toBe('hubs/x.md');
  });
});

describe('English content sources', () => {
  it('covers activity cards, hubs, English guides and English UI strings', () => {
    const files = englishSources().map((s) => s.file);
    expect(files.some((f) => f.startsWith('activity-cards/'))).toBe(true);
    expect(files.some((f) => f.startsWith('hubs/'))).toBe(true);
    expect(files.some((f) => f.startsWith('guides/'))).toBe(true);
    expect(files).toContain('i18n/ui/en.json');
    expect(files.some((f) => f.startsWith('guides-i18n/'))).toBe(false);
  });
});

describe('English content passes the claims lint', () => {
  it('has no violations in any English source', () => {
    const violations = englishSources().flatMap((s) => checkClaims(s.text, s.file));
    const report = violations.map((v) => `${v.file}:${v.line} "${v.match}" (${v.rule}) …${v.sentence}…`).join('\n');
    expect(violations, report).toEqual([]);
  });
});

describe('claims lint: research framing is scoped', () => {
  it('lets hedged modals through only on health pages', () => {
    const text = 'Painting may reduce anxiety for some people.';
    expect(flagged(text, 'activities/painting.md').length).toBe(1);
    expect(flagged(text, 'guides/brain-health/exercise.md')).toEqual([]);
  });

  it('ignores link targets and slugs that contain therapy words', () => {
    const text = 'See the [Foundation](https://example.org/therapeutic-activities) and activities/art-therapy-or-creative-activity for more.';
    expect(flagged(text, 'guides/activities/x.md')).toEqual([]);
  });

  it('reads wrapped lines as one sentence, so a negation on the previous line still counts', () => {
    const text = 'Trials have not\nproven that exercise prevents dementia.';
    expect(flagged(text, 'guides/brain-health/exercise.md')).toEqual([]);
  });
});
