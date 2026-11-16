import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import en from '../i18n/play/en.json';

/**
 * WEB-053 and the AGENTS.md rules for games: no score, timer, move count, streak
 * or failure message anywhere a participant can see it, and no clock except the
 * quiet hint wait (20 seconds idle) and the breathing circle's own pace. This
 * reads the game source and the English strings, so adding a counter fails here.
 */
const DIR = fileURLToPath(new URL('.', import.meta.url));
const sources = [
  ...readdirSync(DIR).filter((f) => f.endsWith('.tsx')).map((f) => ({ f, text: readFileSync(join(DIR, f), 'utf8') })),
  ...readdirSync(join(DIR, 'shared')).filter((f) => f.endsWith('.tsx')).map((f) => ({ f: `shared/${f}`, text: readFileSync(join(DIR, 'shared', f), 'utf8') })),
];

const PRESSURE = /\b(score|scores|streak|countdown|stopwatch|time'?s up|seconds left|time left|moves?:|attempts?:|mistakes?|you lose|game over|incorrect|wrong answer|try again later)\b/i;

function strings(node: unknown): string[] {
  if (typeof node === 'string') return [node];
  if (Array.isArray(node)) return node.flatMap(strings);
  if (node && typeof node === 'object') return Object.values(node).flatMap(strings);
  return [];
}

describe('games show no pressure (WEB-053)', () => {
  it('reads the game components', () => {
    expect(sources.length).toBeGreaterThan(15);
  });

  it('has no pressure wording in any English game string', () => {
    const offenders = strings(en.ui).filter((s) => PRESSURE.test(s));
    expect(offenders).toEqual([]);
  });

  it('uses no repeating clock in a game, except read-aloud pacing', () => {
    const offenders = sources.filter((s) => /setInterval\(|requestAnimationFrame\(|Date\.now\(\)|performance\.now\(\)/.test(s.text) && s.f !== 'shared/ReadAloud.tsx');
    expect(offenders.map((s) => s.f)).toEqual([]);
  });

  it('starts a hint only after 20 seconds with no tap, in the two games that have one', () => {
    const withHint = sources.filter((s) => /HINT_AFTER_MS/.test(s.text));
    expect(withHint.map((s) => s.f).sort()).toEqual(['FourTogether.tsx', 'OddOneOut.tsx']);
    for (const s of withHint) {
      expect(s.text, s.f).toMatch(/HINT_AFTER_MS = 20_000/);
      expect(s.text, s.f).toMatch(/clearTimeout/);
    }
  });

  it('lets a player switch the hint off, and then never starts the wait', () => {
    for (const s of sources.filter((x) => /HINT_AFTER_MS/.test(x.text))) {
      expect(s.text, s.f).toMatch(/const \[hintsOn, setHintsOn\] = useState\(true\)/);
      expect(s.text, s.f).toMatch(/!hintsOn\) return undefined/);
    }
  });

  it('allows a timeout only for the hint wait and the breathing circle', () => {
    const offenders = sources.filter((s) => /setTimeout\(/.test(s.text) && !['FourTogether.tsx', 'OddOneOut.tsx', 'CalmBreathing.tsx'].includes(s.f));
    expect(offenders.map((s) => s.f)).toEqual([]);
  });

  it('the pattern catches what it should', () => {
    expect(PRESSURE.test('Score: 3')).toBe(true);
    expect(PRESSURE.test('Time left')).toBe(true);
    expect(PRESSURE.test('Any one of these goes with the others.')).toBe(false);
  });
});
