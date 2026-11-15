import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { EVENT_DICTIONARY, NOT_A_FIT_REASONS, allowedParams, analyticsAvailable, once, track, trackPrint } from './track';

const calls = (): { calls: unknown[][]; w: { gtag: (...args: unknown[]) => void } } => {
  const list: unknown[][] = [];
  return { calls: list, w: { gtag: (...args: unknown[]) => void list.push(args) } };
};

describe('track', () => {
  it('does nothing where Analytics is not loaded, such as Photo pairs', () => {
    expect(analyticsAvailable({})).toBe(false);
    expect(track('activity_start', undefined, {})).toBe(false);
  });

  it('sends only the event name and the fixed feedback answer', () => {
    const { calls: list, w } = calls();
    expect(analyticsAvailable(w)).toBe(true);
    expect(track('activity_start', undefined, w)).toBe(true);
    expect(track('activity_feedback', { answer: 'not_really' }, w)).toBe(true);
    expect(list).toEqual([
      ['event', 'activity_start', undefined],
      ['event', 'activity_feedback', { answer: 'not_really' }],
    ]);
  });

  it('counts a start once per page view, however often the board is used', () => {
    let starts = 0;
    const start = once(() => void starts++);
    expect([start(), start(), start()]).toEqual([true, false, false]);
    expect(starts).toBe(1);
  });

  it('counts prints only where the game has a printable sheet', () => {
    const { calls: list, w } = calls();
    expect(trackPrint({ querySelector: () => null }, w)).toBe(false);
    expect(trackPrint({ querySelector: () => ({}) }, w)).toBe(true);
    expect(list).toEqual([['event', 'activity_print', undefined]]);
  });
});

describe('event allowlist', () => {
  it('drops any event name that is not in the dictionary', () => {
    const { calls: list, w } = calls();
    expect(track('activity_view' as never, undefined, w)).toBe(false);
    expect(track('constructor' as never, undefined, w)).toBe(false);
    expect(list).toEqual([]);
  });

  it('drops properties that are not in the allowlist and keeps the rest', () => {
    const { calls: list, w } = calls();
    const ok = track('activity_not_a_fit', { activity: 'paper-boats', reason: 'too_hard', note: 'my son cried' } as never, w);
    expect(ok).toBe(true);
    expect(list).toEqual([['event', 'activity_not_a_fit', { activity: 'paper-boats', reason: 'too_hard' }]]);
  });

  it('drops the whole event when a required property is missing or not allowed', () => {
    const { calls: list, w } = calls();
    expect(track('activity_not_a_fit', { activity: 'paper-boats' } as never, w)).toBe(false);
    expect(track('activity_not_a_fit', { activity: 'paper-boats', reason: 'free text here' } as never, w)).toBe(false);
    expect(track('activity_feedback', { answer: 'maybe' } as never, w)).toBe(false);
    expect(list).toEqual([]);
  });

  it('accepts only lowercase slugs as activity keys, so no free text or names get through', () => {
    const { calls: list, w } = calls();
    for (const activity of ['Dad Tom', 'mum@example.com', 'https://x.test/a', 'a/../b', '', 'paper_boats']) {
      expect(track('activity_started_confirmed', { activity }, w)).toBe(false);
    }
    expect(track('activity_started_confirmed', { activity: 'paper-boats' }, w)).toBe(true);
    expect(list).toHaveLength(1);
  });

  it('fixes the not-a-fit reasons to the agreed list, with no "other text" option', () => {
    expect(NOT_A_FIT_REASONS).toEqual([
      'too_messy',
      'too_hard',
      'needs_materials',
      'not_interested',
      'too_loud_or_busy',
      'hard_to_read_or_use',
      'other',
    ]);
    for (const reason of NOT_A_FIT_REASONS) {
      expect(allowedParams('activity_not_a_fit', { activity: 'paper-boats', reason })).not.toBeNull();
    }
  });

  it('has no event with a free-text parameter', () => {
    for (const [event, rules] of Object.entries(EVENT_DICTIONARY)) {
      for (const [key, rule] of Object.entries(rules)) {
        expect(rule, `${event}.${key}`).not.toHaveProperty('free');
        expect('values' in rule || 'pattern' in rule, `${event}.${key}`).toBe(true);
      }
    }
  });

  it('hands GTM a flat dataLayer event when only dataLayer exists', () => {
    const dataLayer: unknown[] = [];
    const w = { dataLayer };
    expect(analyticsAvailable(w)).toBe(true);
    expect(track('activity_started_confirmed', { activity: 'paper-boats' }, w)).toBe(true);
    expect(dataLayer).toEqual([{ event: 'activity_started_confirmed', activity: 'paper-boats' }]);
  });

  it('matches the event dictionary doc table (docs/specs/global/events.md)', () => {
    const doc = readFileSync(fileURLToPath(new URL('../../../docs/specs/global/events.md', import.meta.url)), 'utf8');
    const rows = doc
      .split('\n')
      .filter((line) => /^\| `activity_/.test(line))
      .map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()));
    const documented = Object.fromEntries(
      rows.map(([event, params]) => [
        event.replace(/`/g, ''),
        params === 'none' ? [] : [...params.matchAll(/`([a-z_]+)`/g)].map((m) => m[1]).sort(),
      ]),
    );
    const coded = Object.fromEntries(
      Object.entries(EVENT_DICTIONARY).map(([event, rules]) => [event, Object.keys(rules).sort()]),
    );
    expect(documented).toEqual(coded);
  });
});
