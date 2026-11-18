import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { playProps } from '../i18n/play';
import FindTogether from './FindTogether';

const props = playProps('en', 'find-together');
const render = () => renderToStaticMarkup(createElement(FindTogether, props));
const t = props.ui.findTogether;
const source = readFileSync(new URL('./FindTogether.tsx', import.meta.url), 'utf8');

describe('FindTogether', () => {
  it('starts with the guidance, the turn, the tally, six face-down cards, and Rest', () => {
    const html = render();

    // The page's style policy blocks style attributes, so nothing here may rely on one.
    expect(html).not.toContain(' style=');
    expect(html).toContain(t.guidance);
    expect(html.indexOf('ft__turn')).toBeLessThan(html.indexOf('ft__tally'));
    expect(html.indexOf('ft__tally')).toBeLessThan(html.indexOf('class="board"'));
    expect(html).toContain('Rest for now');
    expect(html).toContain('Done for now');
    expect(html).toContain('Start again');
  });

  it('says whose turn it is in words, with a shape as well: First person, a circle', () => {
    const html = render();
    const turn = html.slice(html.indexOf('ft__turn'), html.indexOf('ft__tally'));

    expect(turn).toContain('Turn: First person');
    expect(turn).toContain('data-shape="circle"');
    expect(turn).toContain('data-turn="0"');
  });

  it('shows the shared tally at zero pairs, with no other count on the page', () => {
    const html = render();

    expect(html).toContain('Pairs found together: 0');
    expect(html).not.toMatch(/misses?|tries|attempts?|moves?\b|score/i);
  });

  it('deals six native buttons with the pictures showing, each named by its picture and place', () => {
    const html = render();
    const cards = html.match(/<button[^>]*class="tile[^"]*"[^>]*>/g) ?? [];

    expect(cards).toHaveLength(6);
    expect(html).not.toContain('face down"');
    cards.forEach((tag, i) => {
      expect(tag).toContain('type="button"');
      expect(tag).toMatch(new RegExp(`aria-label="[^"]+, card ${i + 1}"`));
    });
  });

  it('offers 6, 8 and 12 cards, with 6 the start, and both ways to play', () => {
    const html = render();

    for (const label of ['6 cards', '8 cards', '12 cards']) expect(html).toContain(label);
    expect(html).toContain('How many cards');
    expect(html).toContain('Play with pictures showing');
    expect(html).toContain('Cards face down');
  });

  it('has Pass from the start, and no Turn them back until two different cards wait', () => {
    const html = render();

    expect(html).toContain(t.pass);
    expect(html).not.toContain(t.turnBack);
    expect(html).not.toContain(t.playAgain);
  });

  it('names both people, and asks nothing of anyone to name or recall', () => {
    expect(t.people).toEqual(['First person', 'Second person']);
    expect(JSON.stringify(t)).not.toMatch(/who is|what is this|recall|remember|\?/i);
  });

  it('says nothing negative or competitive, and nothing about a winner, time or score', () => {
    const text = JSON.stringify(t) + render();

    expect(text).not.toMatch(/score|timer|clock|streak|miss|wrong|incorrect|fail|mistake|try again|correct|attempt/i);
    expect(text).not.toMatch(/\b(win|wins|winner|won|lose|lost|loser|remaining|points?|best|better|faster|slower|hurry)\b/i);
  });

  it('uses no clock, no storage, no network and no print, and adds no confetti', () => {
    expect(source).not.toMatch(/setTimeout|setInterval|requestAnimationFrame|Date\.now|performance\.now/);
    expect(source).not.toMatch(/localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest|sendBeacon|document\.cookie/);
    expect(source).not.toMatch(/window\.print|confetti/);
  });

  it('keeps every tap on the latest board, so two quick taps both land', () => {
    expect(source).toContain('const latest = useRef(game)');
    expect(source).toMatch(/turnCard\(before, index\)/);
    expect(source).toMatch(/pass\(latest\.current\)/);
    expect(source).toMatch(/turnBack\(latest\.current\)/);
  });

  it('uses the English text until a locale has a reviewed translation', () => {
    expect(playProps('es', 'find-together').ui.findTogether.pass).toBe('Pass');
  });
});
