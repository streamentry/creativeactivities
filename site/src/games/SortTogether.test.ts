import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { playProps } from '../i18n/play';
import SortTogether from './SortTogether';

describe('SortTogether', () => {
  // The round is dealt after the page loads, so the server render holds the frame, the chips and the two baskets.
  const html = renderToStaticMarkup(createElement(SortTogether, playProps('en', 'sort-together')));

  it('offers Larger targets as a choice that is off at the start', () => {
    expect(html).toContain('Larger targets');
    expect(html).toMatch(/type="checkbox"/);
    expect(html).not.toMatch(/<input type="checkbox"[^>]*\bchecked(?:=""|(?=\s|\/?>))/);
    expect(html).not.toContain('basket--large');
    expect(html).not.toContain('baskets--large');
    expect(html).not.toContain('board--large');
  });

  it('shows exactly two baskets, with Rest and no score, timer or count', () => {
    expect(html.match(/class="basket(?: |")/g)).toHaveLength(2);
    expect(html).toContain('Rest');
    expect(html).not.toMatch(/score|timer|streak|moves|wrong|incorrect/i);
  });

  it('says plainly what the option did, with no pressure words', () => {
    const { sortTogether } = playProps('en', 'sort-together').ui;
    for (const line of [sortTogether.largerOn, sortTogether.largerOff, sortTogether.largerOnNewRound]) {
      expect(line).not.toMatch(/score|timer|streak|moves|wrong|incorrect|fail|lost/i);
    }
    expect(sortTogether.largerOn).toMatch(/Nothing has moved/);
    expect(sortTogether.largerOnNewRound).toMatch(/new pictures/);
  });

  it('uses the English text until a locale has a reviewed translation', () => {
    expect(playProps('es', 'sort-together').ui.sortTogether.largerTargets).toBe('Larger targets');
  });
});
