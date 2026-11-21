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

  it('offers a big picture for a group by choice, off at the start (the page renders once, so only that state is checked here)', () => {
    const html = renderToStaticMarkup(createElement(ConversationCards, playProps('en', 'conversation-cards')));

    expect(html).toContain('Big picture, for a group');
    expect(html).toContain('<article class="talk-card">');
    expect(html).not.toContain('talk-card--big');
    expect(html).not.toContain('Anyone may pass.');
  });

  it('shows the group rules for passing a card round a circle, with no score or timer words', () => {
    const html = renderToStaticMarkup(createElement(ConversationCards, playProps('en', 'conversation-cards')));
    const rules = playProps('en', 'conversation-cards').ui.conversationCards;

    expect(html).toContain('Passing a card round a group');
    expect(html).toContain('Sit in a circle');
    expect(html).toContain('A person may pass without saying anything');
    expect(html).toContain('Nobody wins.');
    for (const key of ['groupTitle', 'groupSit', 'groupPass', 'groupNoSpeech', 'groupEnd'] as const) {
      expect(rules[key].length).toBeGreaterThan(0);
      expect(rules[key]).not.toMatch(/timer|score|points|streak|countdown/i);
    }
  });

  it('uses the English source label until a locale has a reviewed translation', () => {
    const english = playProps('en', 'conversation-cards');
    const spanish = playProps('es', 'conversation-cards');

    expect(spanish.ui.conversationCards.showPrompt).toBe(english.ui.conversationCards.showPrompt);
  });
});
