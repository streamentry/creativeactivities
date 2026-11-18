import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { playProps } from '../i18n/play';
import StoryDice from './StoryDice';

describe('StoryDice', () => {
  // The dice are rolled after the page loads, so the server render holds only the frame's chrome.
  it('always shows Rest, with no score, timer or count', () => {
    const html = renderToStaticMarkup(createElement(StoryDice, playProps('en', 'story-dice')));
    expect(html).toBeTypeOf('string');
    expect(html).not.toMatch(/score|timer|streak|moves|wrong|incorrect/i);
  });

  it('has the one-tap Roll again, a Pass, and a choice of 3 or 4 dice in its text', () => {
    const { storyDice } = playProps('en', 'story-dice').ui;
    expect(storyDice.roll).toBe('Roll again');
    expect(storyDice.pass).toBe('Pass');
    expect(storyDice.count.replace('{n}', '3')).toBe('3 dice');
    expect(storyDice.passed).toMatch(/fine/);
  });

  it('uses the English text until a locale has a reviewed translation', () => {
    expect(playProps('es', 'story-dice').ui.storyDice.roll).toBe('Roll again');
  });
});
