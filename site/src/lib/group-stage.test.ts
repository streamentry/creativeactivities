import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PAUSE_LINE } from './scope';
import { STAGE_TEXT, keyAction, move, slidesFor, spoken, view, type StageCard } from './group-stage';

/**
 * Group mode for facilitators (WEB-046): one step per screen, the person leading moves on, nothing counts down.
 * The logic is pure so it can be checked here; the dialog that shows it is checked in a real browser
 * (`pnpm check:group`).
 */

const card: StageCard = {
  name: 'Arrange flowers together',
  summary: 'Choose, trim and place flowers or leafy stems in a jar or vase together.',
  materials: ['A small bunch of flowers', 'A jar or vase'],
  steps: ['Spread the towel on the table.', 'Fill the jar halfway with water together.', 'Place the stems one at a time.'],
  stopNote: 'It is fine to stop after one or two stems.',
};

describe('the screens of a group view', () => {
  const slides = slidesFor(card);

  it('opens with what the person leading needs before they begin', () => {
    expect(slides[0]).toEqual({
      kind: 'start',
      label: STAGE_TEXT.startLabel,
      title: card.name,
      summary: card.summary,
      materials: card.materials,
      note: PAUSE_LINE,
    });
  });

  it('then shows one step per screen, in order, with the step’s own words', () => {
    const steps = slides.filter((s) => s.kind === 'step');
    expect(steps.map((s) => s.kind === 'step' && s.text)).toEqual([...card.steps]);
    expect(steps.map((s) => s.label)).toEqual(['Step 1 of 3', 'Step 2 of 3', 'Step 3 of 3']);
  });

  it('closes with the card’s own note that it is fine to stop', () => {
    expect(slides.at(-1)).toEqual({ kind: 'end', label: STAGE_TEXT.endLabel, title: STAGE_TEXT.endTitle, text: card.stopNote });
    expect(slides).toHaveLength(card.steps.length + 2);
  });

  it('is never empty, even for a card with no steps', () => {
    expect(slidesFor({ ...card, steps: [] }).map((s) => s.kind)).toEqual(['start', 'end']);
  });

  it('does not change the card it was given', () => {
    const before = JSON.stringify(card);
    slidesFor(card);
    expect(JSON.stringify(card)).toBe(before);
  });
});

describe('what a screen reader says when the screen changes', () => {
  const slides = slidesFor(card);

  it('says the whole start screen: the name, summary, every material and the note about pausing', () => {
    const said = spoken(slides[0]);
    expect(said).toContain(card.name);
    expect(said).toContain(card.summary);
    for (const m of card.materials) expect(said).toContain(m);
    expect(said).toContain(STAGE_TEXT.materialsHeading);
    expect(said).toContain(PAUSE_LINE);
    expect(said.startsWith(STAGE_TEXT.startLabel)).toBe(true);
  });

  it('says a step with its number first, then the step in the card’s own words', () => {
    expect(spoken(slides[2])).toBe(`Step 2 of 3. ${card.steps[1]}`);
  });

  it('says the last screen with the card’s own note that it is fine to stop', () => {
    const said = spoken(slides.at(-1)!);
    expect(said).toContain(STAGE_TEXT.endTitle);
    expect(said).toContain(card.stopNote);
  });

  it('does not double a full stop when a line already ends with one', () => {
    expect(spoken(slides[0])).not.toMatch(/\.\./);
  });

  it('tells a person using the keys what they do, in the description of the view', () => {
    expect(STAGE_TEXT.hint).toMatch(/right arrow/i);
    expect(STAGE_TEXT.hint).toMatch(/left arrow/i);
  });
});

describe('moving on and back', () => {
  it('moves one screen at a time and stops at both ends', () => {
    expect(move(0, 5, 1)).toBe(1);
    expect(move(3, 5, -1)).toBe(2);
    expect(move(4, 5, 1)).toBe(4);
    expect(move(0, 5, -1)).toBe(0);
  });

  it('stays put when there is one screen or none', () => {
    expect(move(0, 1, 1)).toBe(0);
    expect(move(0, 0, 1)).toBe(0);
  });
});

describe('keys', () => {
  it('moves on with Right and Page Down (a presenter’s clicker), and back with Left and Page Up', () => {
    for (const key of ['ArrowRight', 'PageDown']) expect(keyAction(key)).toBe('next');
    for (const key of ['ArrowLeft', 'PageUp']) expect(keyAction(key)).toBe('previous');
  });

  it('leaves Up and Down to scroll a long step, and every key a button or the dialog already answers', () => {
    for (const key of ['ArrowUp', 'ArrowDown', ' ', 'Enter', 'Escape', 'Tab', 'Home', 'End', 'p', 'n', 'f']) expect(keyAction(key)).toBeNull();
  });
});

describe('which buttons show', () => {
  const states = [
    ...[0, 1, 2, 3, 4].map((i) => ({ at: `screen ${i + 1} of 5`, v: view(i, 5, false) })),
    { at: 'paused on the first screen', v: view(0, 5, true) },
    { at: 'paused on the last screen', v: view(4, 5, true) },
  ];

  it('has exactly one filled button on every screen', () => {
    for (const { v } of states) expect(['next', 'done', 'carryOn']).toContain(v.primary);
  });

  it('always leaves a way out in plain words: Done for now is on every screen', () => {
    for (const { at, v } of states) expect(v.primary === 'done' || v.secondary.includes('done'), at).toBe(true);
    expect(STAGE_TEXT.done).toBe('Done for now');
  });

  it('offers Pause on every screen where the group is looking at a step, and Carry on only while paused', () => {
    for (const i of [0, 1, 2, 3, 4]) expect(view(i, 5, false).secondary).toContain('pause');
    expect(view(2, 5, false).primary).toBe('next');
    expect(view(2, 5, true).primary).toBe('carryOn');
    expect(view(2, 5, true).secondary).not.toContain('pause');
  });

  it('cannot go back from the first screen, and ends on Done for now', () => {
    expect(view(0, 5, false).previousEnabled).toBe(false);
    expect(view(1, 5, false).previousEnabled).toBe(true);
    expect(view(4, 5, false).primary).toBe('done');
    expect(view(4, 5, false).secondary).not.toContain('done');
    expect(view(3, 5, false).primary).toBe('next');
  });

  it('hides the steps while paused: only Carry on and Done for now remain', () => {
    const paused = view(2, 5, true);
    expect(paused.showSlide).toBe(false);
    expect(paused.secondary).toEqual(['done']);
    expect(view(2, 5, false).showSlide).toBe(true);
  });
});

describe('every activity card on disk', () => {
  const dir = new URL('../content/activity-cards/', import.meta.url);
  const files = readdirSync(dir).filter((f) => f.endsWith('.md'));
  const frontmatter = (text: string) => text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  const scalar = (fm: string, key: string) => (fm.match(new RegExp(`^${key}: (.*)$`, 'm'))?.[1] ?? '').replace(/^"(.*)"$/, '$1').replace(/\\"/g, '"');
  const list = (fm: string, key: string): string[] => {
    const lines = fm.split('\n');
    const start = lines.findIndex((l) => l === `${key}:`);
    if (start < 0) return [];
    const out: string[] = [];
    for (const line of lines.slice(start + 1)) {
      if (/^\S/.test(line)) break;
      const item = line.match(/^\s+- (.*)$/);
      if (item) out.push(item[1].replace(/^"(.*)"$/, '$1').replace(/\\"/g, '"'));
    }
    return out;
  };
  const cards = files.map((f) => {
    const fm = frontmatter(readFileSync(new URL(f, dir), 'utf8'));
    return {
      file: f,
      card: { name: scalar(fm, 'name'), summary: scalar(fm, 'summary'), materials: list(fm, 'materials'), steps: list(fm, 'steps'), stopNote: scalar(fm, 'stopNote') } satisfies StageCard,
    };
  });

  it('is read in full (there are cards, and each has steps, materials and a stop note)', () => {
    expect(cards.length).toBeGreaterThanOrEqual(50);
    for (const { file, card: c } of cards) {
      expect(c.name, file).not.toBe('');
      expect(c.steps.length, file).toBeGreaterThan(0);
      expect(c.materials.length, file).toBeGreaterThan(0);
      expect(c.stopNote, file).not.toBe('');
    }
  });

  it('becomes a start screen, one screen for each step and an end screen, with no step lost', () => {
    for (const { file, card: c } of cards) {
      const slides = slidesFor(c);
      expect(slides, file).toHaveLength(c.steps.length + 2);
      expect(slides.filter((s) => s.kind === 'step').map((s) => (s.kind === 'step' ? s.text : '')), file).toEqual(c.steps);
    }
  });
});

describe('what the group view says and does', () => {
  const words = Object.values(STAGE_TEXT).filter((v) => typeof v === 'string') as string[];
  const code = ['group-stage.ts', 'group-stage-dom.ts'].map((f) => ({ f, text: readFileSync(new URL(f, import.meta.url), 'utf8') }));

  it('uses plain words with no clock, score, hurry or praise', () => {
    for (const w of words) {
      expect(w, w).not.toMatch(/\b(?:timer|countdown|seconds?|minutes?|hurry|quick(?:ly)?|score|points?|streak|win|wrong|correct|fail|well done|great|amazing)\b/i);
      expect(w, w).not.toMatch(/\p{Extended_Pictographic}/u);
    }
  });

  it('counts only the steps: the one number shown is "Step n of N"', () => {
    for (const w of words) expect(w, w).not.toMatch(/\d/);
    expect(STAGE_TEXT.stepLabel(2, 7)).toBe('Step 2 of 7');
  });

  it('has no timer and keeps nothing: no storage, network request or analytics call', () => {
    for (const { f, text } of code) {
      const source = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
      expect(source, f).not.toMatch(/\b(?:setTimeout|setInterval|requestAnimationFrame)\(/);
      expect(source, f).not.toMatch(/\b(?:localStorage|sessionStorage|indexedDB|document\.cookie)\b|\bfetch\(|XMLHttpRequest|sendBeacon|\btrack\(/);
    }
  });
});
