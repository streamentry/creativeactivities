import { useEffect, useState } from 'react';
import { pictureUrl } from '../data/pictures';
import type { PlayProps, PlayUi } from '../i18n/play';
import { fill } from '../i18n/play/format';
import { readAloud, speechOf, type SpeechLike } from '../lib/games/readAloud';
import { createRng, randomSeed } from '../lib/games/random';
import {
  WORD_PICTURE_COUNTS,
  createWordRound,
  isWordMatched,
  isWordPairsDone,
  putWordsBack,
  startWordPairs,
  startWordsAgain,
  tapWord,
  wordTapResult,
  type WordSide,
  type WordState,
} from '../lib/games/word-picture';
import { ChoiceChips } from './shared/ChoiceChips';
import { GameFrame } from './shared/GameFrame';
import { Icon } from './shared/Icon';
import { pictureNamer } from './shared/PictureTile';
import { sounds } from './shared/sound';

type Look = 'resting' | 'selected' | 'matched';

function lookOf(state: WordState, side: WordSide, id: string): Look {
  if (isWordMatched(state, id)) return 'matched';
  return state.selected?.side === side && state.selected.id === id ? 'selected' : 'resting';
}

interface WordsAndPicturesBoardProps {
  ui: PlayUi;
  lang: string;
  state: WordState;
  pictureName: (id: string) => string;
  /** The speech synthesizer, or null when the browser has none: then no Read aloud button is shown. */
  synth: SpeechLike | null;
  onTap: (side: WordSide, id: string) => void;
}

/**
 * The pictures in a grid, and the words in a list beside them (or below them
 * on a narrow screen). Each word has its own Read aloud button.
 */
function WordsAndPicturesBoard({ ui, lang, state, pictureName, synth, onTap }: WordsAndPicturesBoardProps) {
  return (
    <div className="word-pairs">
      <div className="word-pairs__pictures" role="group" aria-label={ui.wordPicture.picturesGroup}>
        {state.round.pictures.map((id) => {
          const look = lookOf(state, 'picture', id);
          const name = pictureName(id);
          return (
            <div key={id} className="word-pairs__picture-cell">
              <button
                type="button"
                className={`tile word-pairs__picture tile--${look}`}
                data-state={look}
                aria-label={name}
                aria-pressed={look === 'selected'}
                aria-disabled={look === 'matched' ? true : undefined}
                onClick={() => onTap('picture', id)}
              >
                <img src={pictureUrl(id)} alt="" width="120" height="120" draggable={false} />
              </button>
              {look === 'matched' ? (
                <p className="word-pairs__status">
                  <Icon name="check" size={18} />
                  {ui.tile.matched}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
      <ul className="word-pairs__words" aria-label={ui.wordPicture.wordsGroup}>
        {state.round.words.map((id) => {
          const look = lookOf(state, 'word', id);
          const name = pictureName(id);
          return (
            <li key={id} className="word-pairs__word" data-state={look}>
              <button
                type="button"
                className={`word-pairs__label word-pairs__label--${look}`}
                aria-pressed={look === 'selected'}
                aria-disabled={look === 'matched' ? true : undefined}
                onClick={() => onTap('word', id)}
              >
                {name}
              </button>
              {look === 'matched' ? (
                <span className="word-pairs__status">
                  <Icon name="check" size={18} />
                  {ui.tile.matched}
                </span>
              ) : null}
              {synth ? (
                <button
                  type="button"
                  className="btn btn--quiet word-pairs__read"
                  aria-label={fill(ui.wordPicture.readWord, { name }, lang)}
                  onClick={() => {
                    sounds.tap();
                    readAloud(synth, name, lang);
                  }}
                >
                  <Icon name="sound" />
                  {ui.frame.readAloud}
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Word and picture pairs (GAME-023): pictures and their English words, in
 * different orders. Tap a word and its picture to pair them. A wrong tap
 * clears quietly. No timer, score or count, and nothing ends on its own.
 */
export default function WordAndPicturePairs(props: PlayProps) {
  const { ui, lang } = props;
  const pictureName = pictureNamer(props);
  const [count, setCount] = useState<number>(WORD_PICTURE_COUNTS[0]);
  const [state, setState] = useState<WordState | null>(null);
  const [synth, setSynth] = useState<SpeechLike | null>(null);
  const [message, setMessage] = useState('');

  // The board is made after the page loads, so every visit starts with new pictures.
  useEffect(() => {
    setState(startWordPairs(createWordRound(count, createRng(randomSeed()))));
    setSynth(speechOf());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = WORD_PICTURE_COUNTS.map((n) => ({ value: n, label: fill(ui.wordPicture.count, { n }) }));
  const options = <ChoiceChips legend={ui.wordPicture.countLegend} choices={counts} value={count} onChange={changeCount} />;

  // A different count starts a new set: the pairs already made do not carry over.
  function changeCount(n: number) {
    setCount(n);
    setState(startWordPairs(createWordRound(n, createRng(randomSeed()))));
    setMessage('');
  }

  if (!state) {
    return (
      <GameFrame ui={ui} lang={lang} guidance={ui.wordPicture.guidance} options={options}>
        {null}
      </GameFrame>
    );
  }

  const done = isWordPairsDone(state);

  const tap = (side: WordSide, id: string) => {
    const result = wordTapResult(state, side, id);
    if (result === 'ignore') return;
    const after = tapWord(state, side, id);
    setState(after);
    if (result === 'select') {
      sounds.tap();
      setMessage(side === 'picture' ? ui.wordPicture.pickWord : ui.wordPicture.pickPicture);
    } else if (result === 'deselect' || result === 'miss') {
      // Quiet: the selection clears without a sound, a word or a count.
      setMessage('');
    } else {
      if (isWordPairsDone(after)) {
        sounds.done();
        setMessage(ui.wordPicture.all);
      } else {
        sounds.match();
        setMessage(fill(ui.wordPicture.fit, { name: pictureName(id) }, lang));
      }
    }
  };

  const next = () => {
    sounds.tap();
    setState(startWordPairs(createWordRound(count, createRng(randomSeed()), state.round)));
    setMessage(ui.wordPicture.newSet);
  };

  const again = () => {
    sounds.tap();
    setState(startWordsAgain(state));
    setMessage(ui.wordPicture.restarted);
  };

  const back = () => {
    sounds.tap();
    setState(putWordsBack(state));
    setMessage(ui.wordPicture.restored);
  };

  return (
    <GameFrame
      ui={ui}
      lang={lang}
      guidance={ui.wordPicture.guidance}
      message={message}
      options={options}
      footer={
        <div className="btn-row btn-row--center">
          <button type="button" className={done ? 'btn btn--primary btn--hero' : 'btn'} onClick={next}>
            <Icon name="refresh" />
            {ui.wordPicture.next}
          </button>
          <button type="button" className="btn" onClick={again}>
            {ui.frame.restart}
          </button>
          {state.before ? (
            <button type="button" className="btn" onClick={back}>
              {ui.wordPicture.putBack}
            </button>
          ) : null}
        </div>
      }
    >
      <WordsAndPicturesBoard ui={ui} lang={lang} state={state} pictureName={pictureName} synth={synth} onTap={tap} />
    </GameFrame>
  );
}
