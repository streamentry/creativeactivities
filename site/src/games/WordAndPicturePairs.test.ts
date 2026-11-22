import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { playProps } from '../i18n/play';
import WordAndPicturePairs from './WordAndPicturePairs';

describe('WordAndPicturePairs', () => {
  // The pairs are made after the page loads, so the server render holds only the frame's chrome.
  it('shows no score, timer, count of tries or wrong answer', () => {
    const html = renderToStaticMarkup(createElement(WordAndPicturePairs, playProps('en', 'word-and-picture-pairs')));
    expect(html).toBeTypeOf('string');
    expect(html).not.toMatch(/score|timer|streak|moves|wrong|incorrect|well done|great job|level/i);
  });

  it('has the New pictures, Start again and Put it back wording, and the one-line finish', () => {
    const { wordPicture, frame } = playProps('en', 'word-and-picture-pairs').ui;
    expect(wordPicture.next).toBe('New pictures');
    expect(frame.restart).toBe('Start again');
    expect(wordPicture.putBack).toBe('Put it back');
    expect(wordPicture.all).toBe('Every word has its picture.');
  });

  it('uses the English text until a locale has a reviewed translation', () => {
    expect(playProps('xx', 'word-and-picture-pairs').ui.wordPicture.next).toBe('New pictures');
  });
});
