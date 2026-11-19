import { useEffect, useRef, useState } from 'react';
import type { PlayProps, PlayUi } from '../i18n/play';
import { boldRuns, fill, plural } from '../i18n/play/format';
import { hasPhotoNavigation, initialPhotoMode, movePhotoIndex } from '../lib/games/photo-viewer';
import { CAPTION_MAX, clampCaption, createHintWait } from '../lib/games/photo-hint';
import { ChoiceChips } from './shared/ChoiceChips';
import { GameFrame } from './shared/GameFrame';
import { Icon } from './shared/Icon';
import { PairsBoard } from './shared/PairsBoard';
import { sounds } from './shared/sound';

const MAX_PHOTOS = 6;
const MAX_BYTES = 40 * 1024 * 1024;
/** A pause with no tap before one unmatched pair is marked. Never fired by a tap. */
const HINT_AFTER_MS = 20_000;

function pickNote(ui: PlayUi, lang: string, skipped: number, extra: number): string {
  return [
    extra > 0 ? fill(ui.photoPairs.usingFirst, { max: MAX_PHOTOS }) : '',
    skipped > 0 ? fill(plural(ui.photoPairs.skipped, skipped, lang), { count: skipped }) : '',
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * Photos are read with object URLs that exist only in this tab. Nothing is
 * uploaded or stored; the URLs are revoked when cleared or when the page closes.
 * Captions are page state only: never saved, never sent. The picker stays in one
 * place so keyboard focus is never lost.
 */
export default function PhotoPairs(props: PlayProps) {
  const { ui, lang } = props;
  const [urls, setUrls] = useState<string[]>([]);
  const [captions, setCaptions] = useState<string[]>([]);
  const [lookOnly, setLookOnly] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [round, setRound] = useState(0);
  const [message, setMessage] = useState('');
  const [note, setNote] = useState('');
  const [done, setDone] = useState(false);
  // Hints: one unmatched pair is marked after a pause. A tap starts the pause again.
  const [hinting, setHinting] = useState(false);
  const [hintsOn, setHintsOn] = useState(true);
  const [resting, setResting] = useState(false);
  const [hintWait] = useState(() =>
    createHintWait(HINT_AFTER_MS, () => {
      setHinting(true);
      setMessage(ui.photoPairs.hint);
    }),
  );
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls]);

  const hasPhotos = urls.length > 0;
  // Only a board being played waits for a hint; rest, hints off, a finished board or one-photo viewing pause it.
  const boardLive = hasPhotos && !lookOnly && !done;
  useEffect(() => {
    hintWait.setActive(boardLive && hintsOn && !resting);
  }, [hintWait, boardLive, hintsOn, resting]);
  useEffect(() => () => hintWait.setActive(false), [hintWait]);

  // A new or restarted board, and every tap, starts the pause again and clears a shown hint.
  const startPause = () => {
    hintWait.tap();
    setHinting(false);
  };

  const resetInput = () => {
    if (input.current) input.current.value = '';
  };

  const choose = (files: FileList | null) => {
    if (!files) return;
    const images = Array.from(files).filter((f) => f.type.startsWith('image/') && f.size <= MAX_BYTES);
    const skipped = files.length - images.length;
    const picked = images.slice(0, MAX_PHOTOS);
    const mode = initialPhotoMode(picked.length);
    // Clear the input so choosing the same files again still fires a change.
    resetInput();
    if (mode === 'empty') {
      setNote([ui.photoPairs.atLeastOne, pickNote(ui, lang, skipped, 0)].filter(Boolean).join(' '));
      return;
    }
    setNote(
      [mode === 'look' ? ui.photoPairs.atLeastTwo : '', pickNote(ui, lang, skipped, images.length - picked.length)]
        .filter(Boolean)
        .join(' '),
    );
    setUrls(picked.map((f) => URL.createObjectURL(f)));
    setCaptions(picked.map(() => ''));
    setLookOnly(mode === 'look');
    setPhotoIndex(0);
    setMessage(mode === 'look' ? fill(ui.photoPairs.photoPosition, { n: 1, total: 1 }) : '');
    setDone(false);
    setRound((r) => r + 1);
    startPause();
  };

  const clear = () => {
    sounds.tap();
    setUrls([]);
    setCaptions([]);
    setLookOnly(false);
    setPhotoIndex(0);
    setMessage(ui.photoPairs.cleared);
    setNote('');
    setDone(false);
    resetInput();
    input.current?.focus();
    startPause();
  };

  const guidance = hasPhotos
    ? lookOnly
      ? ui.photoPairs.lookGuidance
      : ui.photoPairs.guidance
    : ui.photoPairs.guidanceEmpty;
  const currentCaption = captions[photoIndex]?.trim() ?? '';
  const hintChoices = [
    { value: 'on', label: ui.photoPairs.hintOn },
    { value: 'off', label: ui.photoPairs.hintOff },
  ] as const;

  return (
    <GameFrame
      ui={ui}
      lang={lang}
      guidance={guidance}
      readAloudText={message || guidance}
      message={message}
      onRestingChange={setResting}
      onRestart={
        hasPhotos && !lookOnly
          ? () => {
              sounds.tap();
              setDone(false);
              setMessage('');
              setRound((r) => r + 1);
              startPause();
            }
          : undefined
      }
      restartLabel={ui.photoPairs.restart}
      options={
        <div className="photo-pick">
          <p className="m-0">
            {boldRuns(ui.photoPairs.intro).map((run, i) => (run.bold ? <strong key={i}>{run.text}</strong> : run.text))}
          </p>
          {!hasPhotos ? <p className="m-0">{ui.photoPairs.setupHint}</p> : null}
          <p className="m-0">{ui.photoPairs.photoComfort}</p>
          <p className="m-0">{ui.photoPairs.consent}</p>
          <label className={hasPhotoNavigation(urls.length) ? 'btn' : 'btn btn--primary'}>
            <Icon name="photo" />
            {hasPhotos ? ui.photoPairs.chooseDifferent : ui.photoPairs.choose}
            <input ref={input} type="file" accept="image/*" multiple onChange={(e) => choose(e.currentTarget.files)} />
          </label>
          {note ? <p role="status" className="m-0">{note}</p> : null}
          {hasPhotos ? (
            <details className="photo-pick__caption-details" open>
              <summary>{ui.photoPairs.captionSummary}</summary>
              <p className="photo-pick__caption-help">{ui.photoPairs.captionHelp}</p>
              <div className="photo-pick__caption-list">
                {urls.map((url, index) => {
                  const id = `photo-caption-${round}-${index + 1}`;
                  return (
                    <div className="photo-pick__caption-row" key={id}>
                      <img className="photo-pick__caption-thumb" src={url} alt="" />
                      <label className="photo-pick__caption-field" htmlFor={id}>
                        <span>{fill(ui.photoPairs.captionLabel, { n: index + 1 })}</span>
                        <input
                          id={id}
                          className="photo-pick__caption-input"
                          type="text"
                          maxLength={CAPTION_MAX}
                          value={captions[index] ?? ''}
                          onChange={(event) => {
                            const value = clampCaption(event.currentTarget.value);
                            setCaptions((current) => current.map((caption, i) => (i === index ? value : caption)));
                          }}
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            </details>
          ) : null}
          {hasPhotoNavigation(urls.length) ? (
            <label className="chip photo-pick__look-toggle">
              <input
                type="checkbox"
                checked={lookOnly}
                onChange={(event) => {
                  sounds.tap();
                  const enabled = event.currentTarget.checked;
                  setLookOnly(enabled);
                  setPhotoIndex(0);
                  setMessage(enabled ? fill(ui.photoPairs.photoPosition, { n: 1, total: urls.length }) : '');
                  setDone(false);
                  setHinting(false);
                }}
              />
              <span>{ui.photoPairs.lookOnly}</span>
            </label>
          ) : null}
          {hasPhotos && !lookOnly ? (
            <ChoiceChips
              legend={ui.photoPairs.hintLegend}
              choices={hintChoices}
              value={hintsOn ? 'on' : 'off'}
              onChange={(v) => {
                setHintsOn(v === 'on');
                setHinting(false);
              }}
            />
          ) : null}
          {hasPhotos ? (
            <button type="button" className="btn btn--quiet" onClick={clear}>
              {ui.photoPairs.clear}
            </button>
          ) : null}
        </div>
      }
      footer={
        done ? (
          <div className="game__done">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                sounds.tap();
                setDone(false);
                setMessage('');
                setRound((r) => r + 1);
                startPause();
              }}
            >
              {ui.photoPairs.playAgain}
            </button>
          </div>
        ) : null
      }
    >
      {hasPhotos ? (
        lookOnly ? (
          <figure className="photo-pairs__viewer">
            <img
              src={urls[photoIndex] ?? urls[0] ?? ''}
              alt={currentCaption ? '' : fill(ui.tile.photoNumber, { n: photoIndex + 1 })}
            />
            {currentCaption ? <figcaption aria-live="polite" aria-atomic="true">{currentCaption}</figcaption> : null}
            {hasPhotoNavigation(urls.length) ? (
              <div className="btn-row">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    sounds.tap();
                    const index = movePhotoIndex(photoIndex, urls.length, -1);
                    setPhotoIndex(index);
                    setMessage(fill(ui.photoPairs.photoPosition, { n: index + 1, total: urls.length }));
                  }}
                >
                  <Icon name="back" />
                  {ui.photoPairs.previousPhoto}
                </button>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => {
                    sounds.tap();
                    const index = movePhotoIndex(photoIndex, urls.length, 1);
                    setPhotoIndex(index);
                    setMessage(fill(ui.photoPairs.photoPosition, { n: index + 1, total: urls.length }));
                  }}
                >
                  {ui.photoPairs.nextPhoto}
                  <Icon name="arrow" />
                </button>
              </div>
            ) : null}
          </figure>
        ) : (
          <PairsBoard
            play={props}
            values={urls}
            photoLabels={captions}
            photos
            hidden={false}
            hinting={hinting}
            hintLabel={ui.photoPairs.hintMark}
            onTapped={startPause}
            round={round}
            onMessage={setMessage}
            onComplete={() => setDone(true)}
          />
        )
      ) : (
        <p className="muted">{ui.photoPairs.empty}</p>
      )}
    </GameFrame>
  );
}
