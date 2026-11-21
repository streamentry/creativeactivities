import { useEffect, useRef, useState } from 'react';
import type { Saying } from '../data/sayings';
import type { PlayProps } from '../i18n/play';
import { fill } from '../i18n/play/format';
import { createRng, randomSeed, shuffle } from '../lib/games/random';
import { GameFrame } from './shared/GameFrame';
import { sounds } from './shared/sound';

const isRecord = (b: unknown): b is Record<string, unknown> => typeof b === 'object' && b !== null && !Array.isArray(b);

/** A saved deck (WEB-054): every saying once, as its place in the page's list, and the place on screen. */
function checkBoard(b: unknown, total: number): boolean {
  if (!isRecord(b) || !Array.isArray(b.order)) return false;
  const order: unknown[] = b.order;
  const index = b.index;
  if (total < 1 || order.length !== total) return false;
  if (typeof index !== 'number' || !Number.isInteger(index) || index < 0 || index >= total) return false;
  const seen = new Set<number>();
  for (const i of order) {
    if (typeof i !== 'number' || !Number.isInteger(i) || i < 0 || i >= total || seen.has(i)) return false;
    seen.add(i);
  }
  return true;
}

export default function FinishTheSaying(props: PlayProps) {
  const { ui, lang, content } = props;
  const sayings = content.sayings;
  const [deck, setDeck] = useState<Saying[]>([]);
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [message, setMessage] = useState('');
  // The choice buttons disappear once answered, so focus moves to Next saying.
  const nextButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setDeck(shuffle(content.sayings, createRng(randomSeed())));
  }, [content.sayings]);

  const saying = deck[index];
  useEffect(() => {
    if (!saying) return;
    setChoices(shuffle([saying.end, ...saying.others], createRng(randomSeed())));
    setRevealed(false);
    setMessage('');
  }, [saying]);

  const restoreBoard = (b: unknown) => {
    if (!isRecord(b)) return;
    const saved = b as { order: number[]; index: number };
    setDeck(saved.order.map((i) => content.sayings[i]!));
    setIndex(saved.index);
    setMessage('');
  };

  if (!saying) return null;
  const parts = { start: saying.start, end: saying.end };

  const choose = (word: string) => {
    if (revealed) return;
    setRevealed(true);
    nextButton.current?.focus();
    if (word === saying.end) {
      sounds.match();
      setMessage(fill(ui.finishTheSaying.yes, parts, lang));
    } else {
      sounds.tap();
      setMessage(fill(ui.finishTheSaying.otherEnding, { ...parts, word }, lang));
    }
  };

  const reveal = () => {
    setRevealed(true);
    sounds.tap();
    nextButton.current?.focus();
    setMessage(fill(ui.finishTheSaying.revealed, parts, lang));
  };

  const next = () => {
    sounds.tap();
    setIndex((i) => (i + 1) % deck.length);
  };

  return (
    <GameFrame
      ui={ui}
      lang={lang}
      guidance={ui.finishTheSaying.guidance}
      place={{ slug: 'finish-the-saying', save: () => ({ order: deck.map((s) => sayings.indexOf(s)), index }), check: (b) => checkBoard(b, sayings.length), restore: restoreBoard }}
      readAloudText={revealed ? `${saying.start} ${saying.end}. ${saying.prompt}` : `${saying.start}...`}
      message={message}
      footer={
        <div className="btn-row btn-row--center">
          <button ref={nextButton} type="button" className={revealed ? 'btn btn--primary btn--hero' : 'btn'} onClick={next}>
            {ui.finishTheSaying.next}
          </button>
        </div>
      }
    >
      <div className="say-card">
        <p className="say-card__text">
          {saying.start}
          {ui.finishTheSaying.gap}
          <span className="say-card__blank">{revealed ? fill(ui.finishTheSaying.ending, parts, lang) : '    '}</span>
        </p>
        {!revealed ? (
          <>
            <div className="say-choices" role="group" aria-label={ui.finishTheSaying.choicesLabel}>
              {choices.map((w) => (
                <button key={w} type="button" className="btn" onClick={() => choose(w)}>
                  {w}
                </button>
              ))}
            </div>
            <button type="button" className="btn btn--quiet" onClick={reveal}>
              {ui.finishTheSaying.show}
            </button>
          </>
        ) : (
          <p className="say-prompt">
            <strong>{ui.finishTheSaying.talk}</strong>
            {saying.prompt}
          </p>
        )}
      </div>
    </GameFrame>
  );
}
