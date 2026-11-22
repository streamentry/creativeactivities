import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { playProps } from '../i18n/play';
import ColorMatch from './ColorMatch';

const render = () => renderToStaticMarkup(createElement(ColorMatch, playProps('en', 'color-match')));

describe('ColorMatch', () => {
  // The board is made after the page loads (a new color each visit), so the first render is the frame:
  // its guidance, the choice of 4 or 6 pictures, Rest, and nothing that counts or times anything.
  it('starts with the guidance, a choice of four or six pictures, and Rest', () => {
    const html = render();

    expect(html).toContain('Look at the color and its name, then tap every picture that is that color.');
    expect(html).toContain('How many pictures');
    expect(html).toContain('4 pictures');
    expect(html).toContain('6 pictures');
    expect(html).toContain('Rest for now');
    expect(html).toContain('Done for now');
  });

  it('shows no score, timer, count, streak or failure wording', () => {
    const html = render();

    expect(html).not.toMatch(/score|timer|clock|streak|moves|miss|wrong|incorrect|try again|remember/i);
  });

  it('has the two ways on: Show them, and Another color, and names a tap on another color', () => {
    const { colorMatch } = playProps('en', 'color-match').ui;

    expect(colorMatch.show).toBe('Show them');
    expect(colorMatch.next).toBe('Another color');
    expect(colorMatch.named.replace('{name|lower}', 'pear').replace('{color|lower}', 'green')).toBe('The pear is green.');
    expect(colorMatch.names).toEqual({ red: 'Red', orange: 'Orange', yellow: 'Yellow', green: 'Green', blue: 'Blue' });
  });

  it('uses the English text until a locale has a reviewed translation', () => {
    expect(playProps('xx', 'color-match').ui.colorMatch.next).toBe('Another color');
  });
});
