import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PICTURE_BY_ID } from '../data/pictures';
import en from '../i18n/play/en.json';
import { QUIET_SCENES } from '../lib/games/quiet-scene';

const source = readFileSync(new URL('./QuietScene.tsx', import.meta.url), 'utf8');
const lines = (en.ui.quietScene as { lines: Record<string, string> }).lines;
const allStrings = Object.values(en.ui.quietScene).flatMap((v) => (typeof v === 'string' ? [v] : Object.values(v as Record<string, string>)));

describe('Quiet scene (GAME-039)', () => {
  it('shows only pictures that exist in the library, each with a gentle line', () => {
    for (const id of QUIET_SCENES) {
      expect(PICTURE_BY_ID.has(id), id).toBe(true);
      expect(lines[id], id).toBeTruthy();
    }
    expect(Object.keys(lines).sort()).toEqual([...QUIET_SCENES].sort());
  });

  it('has no banned wording in any English string', () => {
    const banned = /\b(relax|calm your mind|soothing|therapy|mindful|timer|slideshow|autoplay)\b/i;
    expect(allStrings.filter((s) => banned.test(s))).toEqual([]);
  });

  it('asks no question and prompts no remembering', () => {
    expect(allStrings.filter((s) => s.includes('?'))).toEqual([]);
  });

  it('starts no timer and no automatic change', () => {
    expect(source).not.toMatch(/setInterval|setTimeout|requestAnimationFrame|Date\.now\(|performance\.now\(/);
  });

  it('gives every picture a width, height and alt text from its name', () => {
    expect(source).toMatch(/<img[^>]*width=\{\d+\}[^>]*height=\{\d+\}/);
    expect(source).toMatch(/alt=\{name\}/);
  });

  it('keeps every button outside aria-hidden regions', () => {
    expect(source).not.toMatch(/aria-hidden/);
  });

  it('has Previous and Next, and Bigger picture with Show everything', () => {
    expect(source).toContain('ui.quietScene.next');
    expect(source).toContain('ui.quietScene.previous');
    expect(source).toContain('ui.quietScene.bigPicture');
    expect(source).toContain('ui.quietScene.showEverything');
  });
});
