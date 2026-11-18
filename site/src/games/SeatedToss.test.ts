import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { playProps } from '../i18n/play';
import { SAFETY_FLAG_LABELS } from '../lib/activities';
import { PAUSE_LINE } from '../lib/scope';
import SeatedToss from './SeatedToss';

const props = playProps('en', 'seated-toss');
const render = () => renderToStaticMarkup(createElement(SeatedToss, props));
const t = props.ui.seatedToss;
const source = readFileSync(new URL('./SeatedToss.tsx', import.meta.url), 'utf8');

describe('SeatedToss', () => {
  it('always renders the safety block, with its heading, one-line statement and every safety line', () => {
    const html = render();
    expect(html).toContain('class="toss__safety"');
    expect(html).toContain(`>${t.safetyHeading}</h2>`);
    expect(html).toContain(t.safetyLine);
    for (const line of t.safety) expect(html).toContain(line.replace("'", '&#x27;'));
    expect(html).toContain(PAUSE_LINE);
  });

  it('puts the safety block before the steps and does not make it conditional', () => {
    const html = render();
    expect(html.indexOf('toss__safety')).toBeLessThan(html.indexOf('toss__steps'));
    const start = source.indexOf('<section className="toss__safety"');
    const end = source.indexOf('</section>', start);
    const block = source.slice(source.lastIndexOf('\n', start - 1), end);
    expect(block).not.toMatch(/\?\s|&&|\bif\b/);
  });

  it('uses the same words as the activity cards for small parts and mouths', () => {
    expect(t.flags).toEqual([SAFETY_FLAG_LABELS['small-parts'], SAFETY_FLAG_LABELS.ingestion]);
    const html = render();
    for (const flag of t.flags) expect(html).toContain(flag);
  });

  it('warns about choking, a sewn-shut cover or a rolled sock, an adult nearby, staying seated and faces', () => {
    const all = [t.safetyLine, ...t.safety].join(' ');
    expect(all).toMatch(/choking hazard/);
    expect(all).toMatch(/sewn-shut cover/);
    expect(all).toMatch(/rolled-up sock|roll up a clean sock/);
    expect(all).toMatch(/adult nearby|arm's reach/);
    expect(all).toMatch(/stay seated/i);
    expect(all).toMatch(/never toss toward a face/);
  });

  it('shows the guidance, numbered steps, a print button and the Rest control', () => {
    const html = render();
    expect(html).toContain(t.guidance);
    expect(html).toMatch(/<ol class="toss__steps">/);
    expect(html.match(/<li>/g)?.length).toBeGreaterThanOrEqual(t.steps.length);
    expect(html).toContain('Print the target and tally sheet');
    expect(html).toContain('data-rest');
  });

  it('prints with the browser print window and keeps nothing', () => {
    expect(source).toContain('window.print()');
    expect(source).not.toMatch(/useState|localStorage|sessionStorage|fetch\(|setInterval|setTimeout|Date\.now/);
  });

  it('previews the target with its ring names written on it', () => {
    const html = render();
    for (const name of t.rings) expect(html).toContain(`>${name}</text>`);
    expect(html.match(/<circle /g)).toHaveLength(3);
    expect(html).toContain(`aria-label="${t.previewLabel}"`);
  });

  it('shows no score, timer, streak, count of misses or competitive wording', () => {
    const html = render().replace(/<[^>]+>/g, ' ');
    expect(html).not.toMatch(/\b(score|timer|streak|miss|misses|missed|winner|wins?|lose|loses|losing|points?|best|beat|remember|recall|wrong|try again)\b/i);
  });

  it('has a tally with a column for each person and no total or winner row', () => {
    const html = render();
    for (const person of t.people) expect(html).toContain(`>${person}</th>`);
    expect(html).not.toMatch(/total|winner/i);
  });

  it('uses the English words in another language until one is reviewed', () => {
    expect(playProps('es', 'seated-toss').ui.seatedToss.print).toBe('Print the target and tally sheet');
  });
});
