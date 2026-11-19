import { useCreateStore, useSelector } from '@tanstack/react-store';
import { useEffect, useRef, useState } from 'react';
import { pictureUrl } from '../data/pictures';
import type { PlayProps } from '../i18n/play';
import { fill, plural } from '../i18n/play/format';
import { SAFETY_FLAG_LABELS } from '../lib/activities';
import { isUsablePhoto, squarePhotoUrl } from '../lib/games/own-photo';
import { correctCount, createPuzzle, isSolved, tapPiece, type PuzzleState } from '../lib/games/puzzle';
import { createRng, randomSeed } from '../lib/games/random';
import { PAUSE_LINE, SCOPE_LINE } from '../lib/scope';
import { ChoiceChips } from './shared/ChoiceChips';
import { GameFrame } from './shared/GameFrame';
import { Icon } from './shared/Icon';
import { pictureNamer } from './shared/PictureTile';
import { sounds } from './shared/sound';

/** Picture ids offered as puzzles; their chip labels are `ui.picturePuzzle.pictures`. */
const PUZZLE_PICTURES = ['sailboat', 'house', 'balloon', 'sunflower', 'lighthouse', 'cat'] as const;
type PuzzlePicture = (typeof PUZZLE_PICTURES)[number];

const SIZES = [2, 3] as const;

/**
 * GAME-058 "Jigsaw from your photo": the person can cut a photo from this device
 * into the same pieces. The photo is read in this tab only (object URLs), is never
 * uploaded or stored, and is printed from the same object URL.
 */
export default function PicturePuzzle(props: PlayProps) {
  const { ui, lang } = props;
  const pictureName = pictureNamer(props);
  const [picture, setPicture] = useState<PuzzlePicture>('sailboat');
  const [size, setSize] = useState<2 | 3>(2);
  const [round, setRound] = useState(0);
  const [message, setMessage] = useState('');
  const [ownUrl, setOwnUrl] = useState<string | null>(null);
  const [ownNote, setOwnNote] = useState('');
  const input = useRef<HTMLInputElement>(null);
  // Counts each choice, so a photo that finishes cropping after a newer choice, or after leaving, is dropped.
  const choice = useRef(0);

  // Releases the photo's object URL when it is replaced, cleared, or the game closes.
  useEffect(() => () => {
    if (ownUrl) URL.revokeObjectURL(ownUrl);
  }, [ownUrl]);
  useEffect(() => () => {
    choice.current += 1;
  }, []);

  const store = useCreateStore<PuzzleState, { tap: (slot: number) => void; reset: (s: 2 | 3) => void }>(
    { size: 2, order: [], selected: null },
    ({ setState }) => ({
      tap: (slot) => setState((s) => tapPiece(s, slot)),
      reset: (s) => setState(() => createPuzzle(s, createRng(randomSeed()))),
    }),
  );
  const state = useSelector(store);
  const solved = state.order.length > 0 && isSolved(state);

  useEffect(() => {
    store.actions.reset(size);
    setMessage('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, picture, round, ownUrl]);

  /** "top left", "center": where a slot is on the board. */
  const placeName = (slot: number): string => (state.size === 2 ? ui.picturePuzzle.places4 : ui.picturePuzzle.places9)[slot] ?? '';

  const whole = ownUrl ? ui.picturePuzzle.ownWhole : fill(ui.picturePuzzle.whole, { name: pictureName(picture) }, lang);

  const tap = (slot: number) => {
    if (solved) return;
    const before = store.state.selected;
    store.actions.tap(slot);
    if (before === null) {
      sounds.tap();
      setMessage(ui.picturePuzzle.pickedUp);
    } else if (before === slot) {
      sounds.tap();
      setMessage('');
    } else if (isSolved(store.state)) {
      sounds.done();
      setMessage(whole);
    } else {
      sounds.tap();
      const total = store.state.order.length;
      setMessage(fill(plural(ui.picturePuzzle.swapped, total, lang), { correct: correctCount(store.state), total }));
    }
  };

  const choose = (files: FileList | null) => {
    const file = files?.[0];
    // Clear the input so choosing the same file again still fires a change.
    if (input.current) input.current.value = '';
    if (!file) return;
    if (!isUsablePhoto(file)) {
      setOwnNote(ui.picturePuzzle.ownNotUsable);
      return;
    }
    const attempt = ++choice.current;
    setOwnNote(ui.picturePuzzle.ownWorking);
    squarePhotoUrl(file).then(
      (url) => {
        if (attempt !== choice.current) {
          URL.revokeObjectURL(url);
          return;
        }
        sounds.tap();
        setOwnNote('');
        setOwnUrl(url);
      },
      () => {
        if (attempt === choice.current) setOwnNote(ui.picturePuzzle.ownNotUsable);
      },
    );
  };

  const backToPictures = () => {
    sounds.tap();
    choice.current += 1;
    setOwnNote('');
    setOwnUrl(null);
  };

  const pictures = PUZZLE_PICTURES.map((id) => ({ value: id, label: ui.picturePuzzle.pictures[id] }));
  const sizes = SIZES.map((n) => ({ value: n, label: fill(plural(ui.picturePuzzle.size, n * n, lang), { n: n * n }) }));
  const src = ownUrl ?? pictureUrl(picture);
  const pct = (n: number) => (n / (state.size - 1)) * 100;
  const sheetCount = state.size * state.size;

  const ownPick = (
    <div className="photo-pick">
      <p className="m-0">{ui.picturePuzzle.ownPrivacy}</p>
      <p className="m-0">{ui.picturePuzzle.ownConsent}</p>
      <label className="btn btn--primary">
        <Icon name="photo" />
        {ownUrl ? ui.picturePuzzle.ownChange : ui.picturePuzzle.ownChoose}
        <input ref={input} type="file" accept="image/*" onChange={(e) => choose(e.currentTarget.files)} />
      </label>
      {ownNote ? (
        <p role="status" className="m-0">
          {ownNote}
        </p>
      ) : null}
      {ownUrl ? (
        <button type="button" className="btn btn--quiet" onClick={backToPictures}>
          <Icon name="back" />
          {ui.picturePuzzle.ownBack}
        </button>
      ) : null}
    </div>
  );

  return (
    <>
      <GameFrame
        ui={ui}
        lang={lang}
        guidance={ui.picturePuzzle.guidance}
        readAloudText={solved ? whole : ownUrl ? ui.picturePuzzle.guidance : `${ui.picturePuzzle.guidance}: ${pictureName(picture)}.`}
        message={message}
        onRestart={() => {
          sounds.tap();
          setRound((r) => r + 1);
        }}
        restartLabel={ui.picturePuzzle.restart}
        options={
          <>
            {ownUrl ? null : <ChoiceChips legend={ui.picturePuzzle.pictureLegend} choices={pictures} value={picture} onChange={setPicture} />}
            {ownPick}
            <ChoiceChips legend={ui.picturePuzzle.sizeLegend} choices={sizes} value={size} onChange={(v) => setSize(v as 2 | 3)} />
          </>
        }
        footer={
          solved ? (
            <div className="game__done">
              <p>{ui.picturePuzzle.done}</p>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  sounds.tap();
                  setRound((r) => r + 1);
                }}
              >
                {ui.picturePuzzle.playAgain}
              </button>
            </div>
          ) : null
        }
      >
        <div className="puzzle-guide">
          <img
            src={src}
            alt={ownUrl ? ui.picturePuzzle.ownAlt : fill(ui.picturePuzzle.guideAlt, { name: pictureName(picture) })}
            width={96}
            height={96}
          />
          <p className="m-0">{ui.picturePuzzle.guideText}</p>
        </div>
        <div className="puzzle" data-size={state.size} data-has-selected={state.selected !== null ? 'true' : undefined}>
          {state.order.map((piece, slot) => {
            const row = Math.floor(piece / state.size);
            const col = piece % state.size;
            const correct = piece === slot;
            // Your photo has no name, so its pieces are named by where they sit on the board.
            const label = ownUrl
              ? fill(ui.picturePuzzle.ownPiece, { n: slot + 1, place: placeName(slot) })
              : fill(ui.picturePuzzle.piece, { place: placeName(slot) });
            return (
              <button
                key={slot}
                type="button"
                className={`piece${state.selected === slot ? ' piece--selected' : ''}${correct ? ' piece--correct' : ''}`}
                style={{
                  backgroundImage: `url(${src})`,
                  backgroundSize: `${state.size * 100}% ${state.size * 100}%`,
                  backgroundPosition: `${pct(col)}% ${pct(row)}%`,
                }}
                onClick={() => tap(slot)}
                aria-label={`${label}${correct ? ui.picturePuzzle.pieceInPlace : ''}${state.selected === slot ? ui.picturePuzzle.piecePickedUp : ''}`}
                aria-pressed={state.selected === slot}
              />
            );
          })}
        </div>
      </GameFrame>

      {ownUrl ? (
        <section className="pp-photo-sheet">
          <h2>{ui.picturePuzzle.ownSheetTitle}</h2>
          <p className="pp-photo-sheet__how">{ui.picturePuzzle.ownSheetHow}</p>
          <div className="pp-photo-sheet__grid" data-size={state.size}>
            {Array.from({ length: sheetCount }, (_, slot) => {
              const row = Math.floor(slot / state.size);
              const col = slot % state.size;
              return (
                <span key={slot} className="pp-photo-sheet__cell">
                  <img
                    src={ownUrl}
                    alt=""
                    style={{
                      width: `${state.size * 100}%`,
                      height: `${state.size * 100}%`,
                      left: `${-col * 100}%`,
                      top: `${-row * 100}%`,
                    }}
                  />
                </span>
              );
            })}
          </div>
          <p className="pp-photo-sheet__safety">{SAFETY_FLAG_LABELS['sharp-tool']}</p>
          <p className="pp-photo-sheet__scope">{SCOPE_LINE}</p>
          <p className="pp-photo-sheet__pause">{PAUSE_LINE}</p>
        </section>
      ) : null}
    </>
  );
}
