import { describe, expect, it } from 'vitest';
import { DEFAULT_OCCASION, FRAME_BOX, MESSAGE_LINES, OCCASIONS, PANEL_HEIGHT, PANEL_WIDTH, STEP_KEYS, frameMarks, leafPath, messageLineYs, occasionWords, starPath } from './decorate-a-card';
import en from '../i18n/play/en.json';

const text = en.ui.decorateACard;

describe('Decorate a card together (GAME-035)', () => {
  it('offers five occasions, with the birthday first', () => {
    expect(OCCASIONS).toEqual(['birthday', 'thank-you', 'thinking-of-you', 'new-season', 'just-because']);
    expect(new Set(OCCASIONS).size).toBe(OCCASIONS.length);
    expect(DEFAULT_OCCASION).toBe('birthday');
  });

  it('gives every occasion a label and front words in the English text, with no religious or health wording', () => {
    for (const o of OCCASIONS) {
      const entry = text.occasions[o];
      expect(entry.label.trim().length, o).toBeGreaterThan(0);
      expect(entry.words.trim().length, o).toBeGreaterThan(0);
    }
    const all = OCCASIONS.map((o) => `${text.occasions[o].label} ${text.occasions[o].words}`).join(' ');
    expect(all).not.toMatch(/christmas|easter|diwali|hanukkah|eid|holiday|get well|recover|sick|illness|hospital|health/i);
  });

  it('gives each occasion distinct front words, so switching the occasion changes the card', () => {
    const words = OCCASIONS.map((o) => occasionWords(text.occasions, o));
    expect(new Set(words).size).toBe(OCCASIONS.length);
  });

  it('has five steps, each with a key and a sentence', () => {
    expect(STEP_KEYS).toHaveLength(5);
    for (const key of STEP_KEYS) expect(text.steps[key].trim().length, key).toBeGreaterThan(20);
    expect(Object.keys(text.steps).sort()).toEqual([...STEP_KEYS].sort());
  });

  it('draws the front frame inside its own half of the card, and the message lines inside the inside half', () => {
    const half = PANEL_WIDTH;
    expect(FRAME_BOX.x).toBeGreaterThan(half);
    expect(FRAME_BOX.x + FRAME_BOX.width).toBeLessThanOrEqual(half * 2);
    expect(FRAME_BOX.y + FRAME_BOX.height).toBeLessThanOrEqual(PANEL_HEIGHT);
    const ys = messageLineYs();
    expect(ys).toHaveLength(MESSAGE_LINES);
    expect(Math.max(...ys)).toBeLessThan(PANEL_HEIGHT - 20);
  });

  it('draws only outline marks inside the front half', () => {
    const marks = frameMarks();
    expect(marks.length).toBeGreaterThan(10);
    for (const m of marks) {
      if (m.kind === 'circle') {
        expect(m.cx).toBeGreaterThan(PANEL_WIDTH);
        expect(m.cx).toBeLessThan(PANEL_WIDTH * 2);
      } else {
        expect(m.d).toMatch(/^M[-\d. ]+/);
      }
    }
  });

  it('builds a star with ten points and a leaf that closes its path', () => {
    const star = starPath(0, 0, 5, 2);
    expect(star.match(/L/g)).toHaveLength(9);
    expect(star.endsWith('Z')).toBe(true);
    expect(leafPath(0, 0, 10, 3, 0).endsWith('Z')).toBe(true);
  });
});
