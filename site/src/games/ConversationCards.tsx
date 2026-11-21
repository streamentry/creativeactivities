import { useEffect, useMemo, useState } from 'react';
import { pictureUrl } from '../data/pictures';
import { TALK_THEME_ORDER, type TalkTheme } from '../data/prompts';
import type { PlayProps } from '../i18n/play';
import { fill } from '../i18n/play/format';
import { conversationPromptPresentation } from '../lib/games/conversation-prompt';
import { createRng, randomSeed, shuffle } from '../lib/games/random';
import { ChoiceChips } from './shared/ChoiceChips';
import { GameFrame } from './shared/GameFrame';
import { Icon } from './shared/Icon';
import { pictureNamer } from './shared/PictureTile';
import { sounds } from './shared/sound';

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

interface SavedTalk {
  theme: TalkTheme | 'all';
  seed: number;
  index: number;
  showPrompt: boolean;
  big: boolean;
}

/** The saved deck position, or null unless every field is present and in range. */
function parseTalk(b: unknown): SavedTalk | null {
  if (!isRecord(b)) return null;
  const { theme, seed, index, showPrompt, big } = b;
  if (!(TALK_THEME_ORDER as readonly unknown[]).includes(theme)) return null;
  if (typeof seed !== 'number' || !Number.isSafeInteger(seed)) return null;
  if (typeof index !== 'number' || !Number.isSafeInteger(index) || index < 0) return null;
  if (typeof showPrompt !== 'boolean' || typeof big !== 'boolean') return null;
  return { theme: theme as TalkTheme | 'all', seed, index, showPrompt, big };
}

export default function ConversationCards(props: PlayProps) {
  const { ui, lang, content } = props;
  const { cards, themes } = content.conversation;
  const pictureName = pictureNamer(props);
  const [theme, setTheme] = useState<TalkTheme | 'all'>('all');
  const [showPrompt, setShowPrompt] = useState(false);
  const [big, setBig] = useState(false);
  const [seed, setSeed] = useState(0);
  const [index, setIndex] = useState(0);

  useEffect(() => setSeed(randomSeed()), []);

  const deck = useMemo(
    () => shuffle(theme === 'all' ? cards : cards.filter((c) => c.theme === theme), createRng(seed)),
    [theme, seed, cards],
  );
  // A new theme starts at its first card. This runs in the change handler, not an effect, so a restored position is kept.
  const changeTheme = (next: TalkTheme | 'all') => {
    if (next === theme) return;
    setTheme(next);
    setIndex(0);
  };
  const card = deck[index % deck.length];
  if (!card) return null;
  const promptPresentation = conversationPromptPresentation(showPrompt, card.prompt, ui.conversationCards.guidance);

  const themeChoices = TALK_THEME_ORDER.map((value) => ({ value, label: themes[value] }));

  return (
    <>
      <GameFrame
        ui={ui}
        lang={lang}
        guidance={ui.conversationCards.guidance}
        readAloudText={promptPresentation.spokenText}
        message={fill(ui.conversationCards.position, { n: (index % deck.length) + 1, total: deck.length })}
        options={
          <>
            <ChoiceChips legend={ui.conversationCards.themeLegend} choices={themeChoices} value={theme} onChange={changeTheme} />
            <label className="chip conversation-cards__prompt-toggle">
              <input
                type="checkbox"
                checked={showPrompt}
                onChange={(event) => {
                  sounds.tap();
                  setShowPrompt(event.currentTarget.checked);
                }}
              />
              <span>{ui.conversationCards.showPrompt}</span>
            </label>
            <label className="chip conversation-cards__big-toggle">
              <input
                type="checkbox"
                checked={big}
                onChange={(event) => {
                  sounds.tap();
                  setBig(event.currentTarget.checked);
                }}
              />
              <span>{ui.conversationCards.bigPicture}</span>
            </label>
            <details className="talk-group">
              <summary>{ui.conversationCards.groupTitle}</summary>
              <p>{ui.conversationCards.groupSit}</p>
              <p>{ui.conversationCards.groupPass}</p>
              <p>{ui.conversationCards.groupNoSpeech}</p>
              <p>{ui.conversationCards.groupEnd}</p>
            </details>
          </>
        }
        footer={
          <div className="btn-row">
            <button
              type="button"
              className="btn btn--primary btn--hero"
              onClick={() => {
                sounds.tap();
                setIndex((i) => i + 1);
              }}
            >
              {ui.conversationCards.next}
              <Icon name="arrow" />
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                sounds.tap();
                setIndex((i) => (i - 1 + deck.length) % deck.length);
              }}
            >
              <Icon name="back" />
              {ui.conversationCards.previous}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                sounds.tap();
                window.print();
              }}
            >
              <Icon name="print" />
              {ui.conversationCards.print}
            </button>
          </div>
        }
        place={{
          slug: 'conversation-cards',
          save: () => ({ theme, seed, index, showPrompt, big }),
          check: (b) => parseTalk(b) !== null,
          restore: (b) => {
            const saved = parseTalk(b);
            if (!saved) return;
            setTheme(saved.theme);
            setSeed(saved.seed);
            setIndex(saved.index);
            setShowPrompt(saved.showPrompt);
            setBig(saved.big);
          },
        }}
      >
        <article className={big ? 'talk-card talk-card--big' : 'talk-card'}>
          <img src={pictureUrl(card.picture)} alt={pictureName(card.picture)} width={220} height={220} />
          <div>
            <p className="talk-card__theme">{themes[card.theme]}</p>
            <div aria-live="polite" aria-atomic="true">
              {promptPresentation.visiblePrompt ? <p className="talk-card__prompt">{promptPresentation.visiblePrompt}</p> : null}
            </div>
            {big && promptPresentation.visiblePrompt ? <p className="talk-card__pass">{ui.conversationCards.passNote}</p> : null}
          </div>
        </article>
      </GameFrame>
      <section className="sheet" aria-hidden="true">
        <h2>{ui.conversationCards.sheetTitle}</h2>
        <div className="sheet-cards">
          {cards.map((c, i) => (
            <article key={i}>
              <img src={pictureUrl(c.picture)} alt="" width={120} height={120} />
              <span>{c.prompt}</span>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
