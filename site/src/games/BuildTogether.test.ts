import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { BUILD_COLORS } from '../data/build-together';
import { playProps } from '../i18n/play';
import BuildTogether from './BuildTogether';

const props = playProps('en', 'build-together');
const render = () => renderToStaticMarkup(createElement(BuildTogether, props));
const t = props.ui.buildTogether;
const source = readFileSync(new URL('./BuildTogether.tsx', import.meta.url), 'utf8');

describe('BuildTogether', () => {
  it('starts with the guidance, two color pickers, whose turn it is, a 4 by 4 grid, and Rest', () => {
    const html = render();

    // The page's style policy blocks style attributes, so nothing here may rely on one.
    expect(html).not.toContain(' style=');
    expect(html).toContain('Take turns to put a piece in an empty place. Each of you has your own color. Nothing you make is saved or sent.');
    expect(html.indexOf('bt__players')).toBeLessThan(html.indexOf('bt__turn'));
    expect(html.indexOf('bt__turn')).toBeLessThan(html.indexOf('bt__grid'));
    expect(html).toContain('data-size="4"');
    expect(html).toContain('Rest for now');
    expect(html).toContain('Done for now');
    expect(html).toContain('Start again');
  });

  it('says in the guidance line that nothing is saved or sent, and uses no storage or network', () => {
    expect(t.guidance).toMatch(/Nothing you make is saved or sent\./);
    expect(source).not.toMatch(/localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest|navigator\.sendBeacon|document\.cookie/);
  });

  it('offers 3 by 3 and 4 by 4, with 4 by 4 chosen', () => {
    const html = render();

    for (const label of ['3 by 3', '4 by 4']) expect(html).toContain(label);
    expect(html).toMatch(/<input[^>]*checked=""[^>]*value="4"/);
    expect(html).toContain('Grid size');
  });

  it('says whose turn it is in words, with the color of the person whose turn it is', () => {
    const html = render();
    const turn = html.slice(html.indexOf('bt__turn'), html.indexOf('bt__label'));

    expect(turn).toContain('Your turn, first person');
    expect(turn).toContain('Your color is orange.');
    expect(turn).toContain('data-shape="square"');
    expect(turn).toContain('data-tone="1"');
  });

  it('gives each person a group of the four colors, each with its written name and its shape', () => {
    const html = render();
    const players = html.slice(html.indexOf('bt__players'), html.indexOf('bt__turn'));

    expect(players.match(/<fieldset/g)).toHaveLength(2);
    expect(players).toContain("First person&#x27;s color");
    expect(players).toContain("Second person&#x27;s color");
    expect(players.match(/type="radio"/g)).toHaveLength(8);
    for (const color of BUILD_COLORS) {
      expect(players.match(new RegExp(`<span class="bt__name">${t.colors[color.index]}</span>`, 'g'))).toHaveLength(2);
      expect(players).toContain(`data-shape="${color.shape}"`);
    }
    expect(new Set(t.colors).size).toBe(4);
  });

  it('marks the color the other person has as in use, in words, and does not let it be picked', () => {
    const html = render();
    const players = html.slice(html.indexOf('bt__players'), html.indexOf('bt__turn'));

    // Orange is the first person's and Purple the second's, so each is in use for the other.
    expect(players.match(/disabled=""/g)).toHaveLength(2);
    expect(players.match(/<span class="bt__note">In use<\/span>/g)).toHaveLength(2);
    expect(players.match(/data-in-use="yes"/g)).toHaveLength(2);
  });

  it('marks whose turn it is on the first person, not the second, at the start', () => {
    const html = render();

    expect(html.match(/data-turn="yes"/g)).toHaveLength(1);
    expect(html.indexOf('data-turn="yes"')).toBeLessThan(html.indexOf("Second person&#x27;s color"));
  });

  it('draws one native button for each of the 16 places, each naming its row, column and that it is empty', () => {
    const html = render();
    const grid = html.slice(html.indexOf('bt__grid'), html.indexOf('class="sheet bt-sheet"'));
    const cells = grid.match(/<button[^>]*class="bt__cell"[^>]*>/g) ?? [];

    expect(cells).toHaveLength(16);
    for (const tag of cells) {
      expect(tag).toMatch(/type="button"/);
      expect(tag).toMatch(/aria-label="Row [1-4], column [1-4], empty"/);
      expect(tag).toMatch(/data-state="empty"/);
    }
    expect(grid).toContain('aria-label="Row 4, column 4, empty"');
    expect(grid).not.toContain('data-shape');
  });

  it('puts the grid in its own labelled, focusable region so a wide grid scrolls inside it', () => {
    expect(render()).toMatch(/<div class="bt__region" role="region" aria-label="The shared grid, 4 by 4\. It scrolls sideways if the screen is narrow\." tabindex="0">/);
  });

  it('has Pass and Print the grid from the start, Start again from the frame, and no Take back until there is a step to take back', () => {
    const html = render();

    for (const label of ['Pass', 'Print the grid', 'Start again']) expect(html).toContain(label);
    expect(html).not.toContain('Take back');
    expect(html).not.toContain('Built together');
  });

  it('prints one page: a print-only sheet with the empty grid and the two colors by name, hidden from the screen reader', () => {
    const html = render();
    const sheet = html.slice(html.indexOf('class="sheet bt-sheet"'));

    expect(sheet).toContain('aria-hidden="true"');
    expect(sheet).toContain('<h2>Build together</h2>');
    expect(sheet.match(/class="bt-sheet__square"/g)).toHaveLength(16);
    expect(sheet).toContain('First person: Orange');
    expect(sheet).toContain('Second person: Purple');
    expect(sheet).toContain('data-size="4"');
    expect(sheet).not.toContain('data-state');
    expect(source).toContain('window.print()');
  });

  it('says nothing negative: no winner, score, timer, count, miss or failure wording anywhere on the page or in its strings', () => {
    const text = JSON.stringify(t) + render();

    expect(text).not.toMatch(/score|timer|clock|streak|moves|miss|wrong|incorrect|fail|mistake|try again|remember|name the|correct|recall/i);
    expect(text).not.toMatch(/\b(win|wins|winner|won|lose|lost|loser|left|remaining|count|points?|best|better|faster|slow|hurry)\b/i);
  });

  it('never asks anyone to name or recall anything', () => {
    expect(JSON.stringify(t)).not.toMatch(/who is|what is this|name |guess|recall|remember|\?/i);
  });

  it('uses the English text until a locale has a reviewed translation', () => {
    expect(playProps('xx', 'build-together').ui.buildTogether.pass).toBe('Pass');
  });

  it('starts every tap from the latest game, so two quick taps both land', () => {
    expect(source).toContain('const latest = useRef(game)');
    for (const call of ['place(before', 'pass(before', 'takeBack(before', 'startAgain(latest.current', 'chooseSize(latest.current', 'chooseColor(latest.current']) expect(source).toContain(call);
    expect(source).not.toMatch(/(place|pass|takeBack|startAgain|chooseSize|chooseColor)\(game[,)]/);
  });

  it('moves between places with the arrow keys, and keeps focus when the Take back button goes', () => {
    expect(source).toContain('moveInGrid(event, grid.current, size)');
    expect(source).toMatch(/if \(!canTakeBack\(after\)\)/);
    expect(source).toContain('.focus()');
  });

  it('waits for no timer and counts nothing: the source sets no timeout and keeps no counter', () => {
    expect(source).not.toMatch(/setTimeout|setInterval|requestAnimationFrame|Date\.now|confetti/);
    expect(source).not.toMatch(/attempts|misses|taps\b|count\b|score|winner/);
  });
});
