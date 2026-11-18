import { useRef, useState } from 'react';
import { PICTURES, pictureUrl } from '../data/pictures';
import type { PlayProps } from '../i18n/play';
import { fill } from '../i18n/play/format';
import { boardColumns } from '../lib/games/pairs';
import {
  CARD_COUNTS,
  DEFAULT_CARD_COUNT,
  cardVisual,
  deal,
  isFaceUp,
  isFinished,
  isWaiting,
  pairsFound,
  pass,
  turnBack,
  turnCard,
  type CardCount,
  type FindState,
  type Person,
} from '../lib/games/find-together';
import { createRng, randomSeed } from '../lib/games/random';
import { ChoiceChips } from './shared/ChoiceChips';
import { GameFrame } from './shared/GameFrame';
import { Icon } from './shared/Icon';
import { pictureNamer } from './shared/PictureTile';
import { sounds } from './shared/sound';
import { useWide } from './shared/useWide';

/** Every picture in the library. Each new board is dealt from these. */
const PICTURE_IDS = PICTURES.map((p) => p.id);

/** "Play with pictures showing" or face-down cards. The game starts with the pictures showing, as Picture pairs does. */
type View = 'showing' | 'hidden';
const DEFAULT_VIEW: View = 'showing';

const newBoard = (cards: CardCount): FindState => deal(cards, PICTURE_IDS, createRng(randomSeed()));

/**
 * Find together (GAME-047): two people share one screen. Each turn, the person whose
 * turn it is turns over two cards. A pair is found together; two different cards stay
 * face up until "Turn them back". Either person may pass. One shared tally counts the
 * pairs found together. Nothing is timed, scored, saved or sent.
 */
export default function FindTogether(props: PlayProps) {
  const { ui, lang } = props;
  const pictureName = pictureNamer(props);
  const wide = useWide();
  const [cards, setCards] = useState<CardCount>(DEFAULT_CARD_COUNT);
  const [view, setView] = useState<View>(DEFAULT_VIEW);
  const [game, setGame] = useState<FindState>(() => newBoard(DEFAULT_CARD_COUNT));
  // Taps can arrive faster than the page redraws, so every tap starts from the latest board kept here.
  const latest = useRef(game);
  const [message, setMessage] = useState('');
  const passButton = useRef<HTMLButtonElement>(null);

  const commit = (next: FindState) => {
    latest.current = next;
    setGame(next);
  };

  const personName = (p: Person) => ui.findTogether.people[p] ?? '';

  const tap = (index: number) => {
    const before = latest.current;
    const { state: after, outcome } = turnCard(before, index);
    if (outcome === 'ignored' || outcome === 'finished') return;
    if (outcome === 'waiting') {
      setMessage(ui.findTogether.waiting);
      return;
    }
    const name = pictureName(before.tiles[index]?.value ?? '');
    commit(after);
    if (outcome === 'turned') {
      sounds.tap();
      setMessage(fill(ui.findTogether.first, { name }, lang));
    } else if (outcome === 'matched') {
      if (isFinished(after)) {
        sounds.done();
        setMessage(ui.findTogether.allTogether);
      } else {
        sounds.match();
        setMessage(fill(ui.findTogether.found, { name, next: personName(after.turn) }, lang));
      }
    } else {
      sounds.tap();
      const first = before.turned[0];
      const firstName = first === undefined ? '' : pictureName(before.tiles[first]?.value ?? '');
      setMessage(fill(ui.findTogether.different, { a: firstName, b: name }, lang));
    }
  };

  const turnBackNow = () => {
    const { state: after, outcome } = turnBack(latest.current);
    if (outcome !== 'turnedBack') return;
    sounds.tap();
    commit(after);
    setMessage(fill(ui.findTogether.turnedBack, { person: personName(after.turn) }, lang));
    // The Turn them back button goes away, so focus moves to Pass.
    passButton.current?.focus();
  };

  const passTurn = () => {
    const { state: after, outcome } = pass(latest.current);
    if (outcome !== 'passed') return;
    sounds.tap();
    commit(after);
    setMessage(fill(ui.findTogether.passed, { person: personName(after.turn) }, lang));
  };

  const restart = () => {
    setMessage('');
    commit(newBoard(cards));
  };

  const changeCards = (n: CardCount) => {
    setCards(n);
    setMessage('');
    commit(newBoard(n));
  };

  const done = isFinished(game);
  const waiting = isWaiting(game);
  const showing = view === 'showing';
  const cols = boardColumns(game.tiles.length, wide);
  const sizes = CARD_COUNTS.map((n) => ({ value: n, label: fill(ui.findTogether.size, { n }, lang) }));
  const views = [
    { value: 'showing', label: ui.findTogether.viewShowing },
    { value: 'hidden', label: ui.findTogether.viewHidden },
  ] as const;
  const turnLine = done ? ui.findTogether.turnDone : fill(ui.findTogether.turn, { person: personName(game.turn) }, lang);

  return (
    <GameFrame
      ui={ui}
      lang={lang}
      guidance={ui.findTogether.guidance}
      message={message}
      options={
        <>
          <ChoiceChips legend={ui.findTogether.sizeLegend} choices={sizes} value={cards} onChange={changeCards} />
          <ChoiceChips legend={ui.findTogether.viewLegend} choices={views} value={view} onChange={setView} />
        </>
      }
      onRestart={restart}
      footer={
        done ? (
          <div className="btn-row btn-row--center">
            <button
              type="button"
              className="btn btn--primary btn--hero"
              onClick={() => {
                sounds.tap();
                restart();
              }}
            >
              {ui.findTogether.playAgain}
            </button>
          </div>
        ) : (
          <div className="btn-row btn-row--center">
            {waiting ? (
              <button type="button" className="btn btn--primary" onClick={turnBackNow}>
                <Icon name="back" />
                {ui.findTogether.turnBack}
              </button>
            ) : null}
            <button ref={passButton} type="button" className="btn" onClick={passTurn}>
              <Icon name="arrow" />
              {ui.findTogether.pass}
            </button>
          </div>
        )
      }
    >
      <div className="ft">
        <div className="ft__turn" data-turn={done ? undefined : game.turn}>
          {done ? null : <span className="ft__marker" data-shape={game.turn === 0 ? 'circle' : 'square'} aria-hidden="true" />}
          <p className="ft__turn-line">{turnLine}</p>
        </div>
        <p className="ft__tally">{fill(ui.findTogether.tally, { n: pairsFound(game) }, lang)}</p>
        <div className="board" data-cols={cols} data-width="large">
          {game.tiles.map((tile, i) => {
            const visual = cardVisual(game, i, showing);
            const faceUp = isFaceUp(visual);
            const name = pictureName(tile.value);
            const number = i + 1;
            const base = faceUp
              ? fill(ui.findTogether.cardNamed, { name, n: number }, lang)
              : fill(ui.findTogether.cardFaceDown, { n: number }, lang);
            const label = tile.matched ? fill(ui.tile.withState, { label: base, state: ui.tile.matched }, lang) : base;
            return (
              <button
                key={tile.key}
                type="button"
                className={`tile tile--${visual}`}
                data-state={visual}
                onClick={() => tap(i)}
                aria-label={label}
                aria-disabled={tile.matched ? true : undefined}
              >
                {faceUp ? (
                  <img src={pictureUrl(tile.value)} alt="" draggable={false} />
                ) : (
                  <span className="tile__back" aria-hidden="true">
                    <Icon name="photo" size={40} />
                  </span>
                )}
                {tile.matched ? (
                  <span className="tile__badge" aria-hidden="true">
                    <Icon name="check" size={22} />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </GameFrame>
  );
}
