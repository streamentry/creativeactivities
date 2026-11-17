import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { playProps } from '../i18n/play';
import ConversationCards from './ConversationCards';

describe('ConversationCards', () => {
  it('starts with the prompt hidden but available by choice', () => {
    const html = renderToStaticMarkup(createElement(ConversationCards, playProps('en', 'conversation-cards')));

    expect(html).toContain('Show a conversation prompt');
    expect(html).toMatch(/type="checkbox"/);
    expect(html).not.toMatch(/<input type="checkbox"[^>]*\bchecked(?:=""|(?=\s|\/?>))/);
    expect(html).not.toContain('class="talk-card__prompt"');
  });

  it('offers a big picture for a group by choice: off at the start, and the pass note only when it is on', () => {
    const html = renderToStaticMarkup(createElement(ConversationCards, playProps('en', 'conversation-cards')));

    expect(html).toContain('Big picture, for a group');
    expect(html).toContain('<article class="talk-card">');
    expect(html).not.toContain('talk-card--big');
    expect(html).not.toContain('Anyone may pass.');
  });

  it('uses the English source label until a locale has a reviewed translation', () => {
    const english = playProps('en', 'conversation-cards');
    const spanish = playProps('es', 'conversation-cards');

    expect(spanish.ui.conversationCards.showPrompt).toBe(english.ui.conversationCards.showPrompt);
  });
});
