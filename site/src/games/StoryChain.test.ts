import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { playProps } from '../i18n/play';
import StoryChain from './StoryChain';

const render = () => renderToStaticMarkup(createElement(StoryChain, playProps('en', 'story-chain')));

describe('StoryChain', () => {
  it('starts with one picture, the guidance line and the Rest control', () => {
    const html = render();
    expect(html).toContain('Take turns: one sentence each, add the next picture.');
    expect(html.match(/class="chain__item"/g) ?? []).toHaveLength(1);
    expect(html).toContain('data-rest');
  });

  it('offers a large Add a picture button, a new chain and taking the last one off', () => {
    const html = render();
    expect(html).toContain('btn btn--primary btn--hero');
    expect(html).toContain('Add a picture');
    expect(html).toContain('Start a new chain');
    expect(html).toContain('Take the last one off');
    expect(html).toContain('Anyone may pass.');
  });

  it('shows no score, timer, count or failure wording', () => {
    const html = render();
    expect(html).not.toMatch(/score|timer|streak|moves?\b|wrong|try again|correct|remember/i);
  });

  it('keeps the chain to a row of pictures that are not buttons', () => {
    const html = render();
    const chain = html.slice(html.indexOf('<ol class="chain"'), html.indexOf('</ol>'));
    expect(chain).not.toContain('<button');
  });

  it('uses the English words in another language until one is reviewed', () => {
    expect(playProps('es', 'story-chain').ui.storyChain.add).toBe('Add a picture');
  });
});
