import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { playProps } from '../i18n/play';
import { createRng } from '../lib/games/random';
import { createHalvesRound, startHalves, tapHalf, type HalvesState } from '../lib/games/halves-match';
import HalvesMatch, { HalvesBoard } from './HalvesMatch';
import { pictureNamer } from './shared/PictureTile';

const props = playProps('en', 'halves-match');
const render = () => renderToStaticMarkup(createElement(HalvesMatch, props));
const board = (state: HalvesState) =>
  renderToStaticMarkup(createElement(HalvesBoard, { ui: props.ui, lang: 'en', state, pictureName: pictureNamer(props), onTap: () => undefined }));
const fresh = () => startHalves(createHalvesRound(3, createRng(7)));

describe('HalvesMatch', () => {
  // The board is made after the page loads (new pictures each visit), so the first render is the frame:
  // its guidance, the choice of 2 or 3 pictures, Rest, and nothing that counts or times anything.
  it('starts with the guidance, a choice of two or three pictures, and Rest', () => {
    const html = render();

    expect(html).toContain('Tap a half on the left, then tap the half on the right that fits it.');
    expect(html).toContain('How many pictures');
    expect(html).toContain('2 pictures');
    expect(html).toContain('3 pictures');
    expect(html).toContain('Rest for now');
    expect(html).toContain('Done for now');
  });

  it('shows no score, timer, count, streak or failure wording', () => {
    const html = render() + board(fresh());

    expect(html).not.toMatch(/score|timer|clock|streak|moves|miss|wrong|incorrect|try again|remember|name the/i);
  });

  it('has Show me, Another set, and a gentle message for halves that do not fit', () => {
    const { halvesMatch } = props.ui;

    expect(halvesMatch.show).toBe('Show me');
    expect(halvesMatch.next).toBe('Another set');
    expect(halvesMatch.apart).toBe('Those two do not fit together. Try another.');
    expect(halvesMatch.fit.replace('{name|lower}', 'teacup')).toBe('Yes, those two make the teacup.');
  });

  it('draws one button for each half, the left column first, each with a spoken label', () => {
    const state = fresh();
    const html = board(state);

    expect(html.match(/<button/g)).toHaveLength(6);
    expect(html.indexOf('Left halves')).toBeLessThan(html.indexOf('Right halves'));
    expect(html.lastIndexOf('Left half of')).toBeLessThan(html.indexOf('Right half of'));
    for (const id of state.round.pictures) {
      expect(html).toContain(`Left half of the ${(props.pictureNames[id] ?? '').toLowerCase()}`);
      expect(html).toContain(`Right half of the ${(props.pictureNames[id] ?? '').toLowerCase()}`);
      expect(html).toContain(`/pictures/${id}.svg`);
    }
    // The drawings are decoration: the button's label says what is on it.
    expect(html).not.toMatch(/<img[^>]*alt="[^"]/);
  });

  it('marks a chosen half and a joined pair with words and a check mark, not color alone', () => {
    const state = fresh();
    const id = state.round.pictures[0] as string;
    const name = (props.pictureNames[id] ?? '').toLowerCase();

    const chosen = board(tapHalf(state, 'left', id));
    expect(chosen).toContain(`Left half of the ${name}, Selected`);
    expect(chosen).toContain('aria-pressed="true"');
    expect(chosen).not.toContain('half__badge');

    const joined = board(tapHalf(tapHalf(state, 'left', id), 'right', id));
    expect(joined).toContain(`Left half of the ${name}, Joined`);
    expect(joined).toContain(`Right half of the ${name}, Joined`);
    expect(joined.match(/aria-disabled="true"/g)).toHaveLength(2);
    expect(joined.match(/half__badge/g)).toHaveLength(1);
  });

  it('uses the English text until a locale has a reviewed translation', () => {
    expect(playProps('xx', 'halves-match').ui.halvesMatch.next).toBe('Another set');
  });

  it('waits for no timer: the source sets no timeout and no interval', () => {
    const source = readFileSync(new URL('./HalvesMatch.tsx', import.meta.url), 'utf8');

    expect(source).not.toMatch(/setTimeout|setInterval|requestAnimationFrame|Date\.now/);
  });
});
