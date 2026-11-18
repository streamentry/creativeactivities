import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DEFAULT_OCCASION, OCCASIONS, occasionWords } from '../data/decorate-a-card';
import { playProps } from '../i18n/play';
import { PAUSE_LINE } from '../lib/scope';
import DecorateACard from './DecorateACard';

const props = playProps('en', 'decorate-a-card');
const render = () => renderToStaticMarkup(createElement(DecorateACard, props));
const t = props.ui.decorateACard;
const source = readFileSync(new URL('./DecorateACard.tsx', import.meta.url), 'utf8');

describe('DecorateACard', () => {
  it('offers each occasion as a native radio button with a label, in a labelled group', () => {
    const html = render();
    expect(html).toMatch(/<fieldset class="card-deco__choices"><legend>/);
    expect(html.match(/type="radio"/g)).toHaveLength(OCCASIONS.length);
    for (const o of OCCASIONS) expect(html).toContain(`value="${o}"`);
    for (const o of OCCASIONS) expect(html).toContain(`>${t.occasions[o].label}</span>`);
  });

  it('shows the front words of the default occasion on the preview', () => {
    const html = render();
    expect(html).toContain(`<p class="card-deco__words">${occasionWords(t.occasions, DEFAULT_OCCASION)}</p>`);
  });

  it('switches the preview words by occasion: each choice sets the chosen occasion, and each has its own words', () => {
    expect(source).toMatch(/onChange=\{\(\) => setOccasion\(o\)\}/);
    expect(source).toMatch(/checked=\{occasion === o\}/);
    const words = OCCASIONS.map((o) => occasionWords(t.occasions, o));
    expect(new Set(words).size).toBe(OCCASIONS.length);
  });

  it('shows the guidance, numbered steps, the two-person rules, the print button and the Rest control', () => {
    const html = render();
    expect(html).toContain(t.guidance);
    expect(html).toMatch(/<ol class="card-deco__steps">/);
    expect(html.match(/<ol class="card-deco__steps">.*?<\/ol>/s)?.[0].match(/<li>/g)).toHaveLength(5);
    expect(html).toContain(t.print);
    expect(html).toContain('data-rest');
  });

  it('prints with the browser print window and keeps nothing', () => {
    expect(source).toContain('window.print()');
    expect(source).not.toMatch(/localStorage|sessionStorage|fetch\(|setInterval|setTimeout|Date\.now/);
  });

  it('names the materials as crayons, colored pencils or pens, and shows the pause line', () => {
    const html = render();
    expect(t.materials).toMatch(/crayons, colored pencils or felt-tip pens/);
    expect(html).toContain(PAUSE_LINE);
  });

  it('labels the preview for a screen reader with the words on the front', () => {
    const html = render();
    expect(html).toContain(`aria-label="A preview of the card folded in half. The front says ${occasionWords(t.occasions, DEFAULT_OCCASION)},`);
  });

  it('shows no score, timer, streak, count, winner or competitive wording', () => {
    const plain = render().replace(/<[^>]+>/g, ' ');
    expect(plain).not.toMatch(/\b(score|timer|streak|miss|misses|missed|winner|wins?|lose|loses|losing|points?|best|beat|remember|recall|wrong|try again|ranked|judged)\b/i);
  });

  it('uses the English words in another language until one is reviewed', () => {
    expect(playProps('es', 'decorate-a-card').ui.decorateACard.print).toBe('Print the card');
  });
});
