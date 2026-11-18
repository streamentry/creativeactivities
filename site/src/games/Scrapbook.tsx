import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
// Photos are read in this tab only: object URLs, released when replaced or closed. Never uploaded or stored.
import type { PlayProps } from '../i18n/play';
import { fill, plural } from '../i18n/play/format';
import { isUsablePhoto } from '../lib/games/own-photo';
import {
  CAPTION_MAX,
  MAX_PHOTOS,
  canMakeBook,
  canMove,
  canTurn,
  clampPage,
  movePage,
  pageNumber,
  setCaption,
  takeBookPhotos,
  turnPage,
  visibleCaption,
  type ScrapPage,
} from '../lib/games/scrapbook';
import { GameFrame } from './shared/GameFrame';
import { Icon } from './shared/Icon';
import { sounds } from './shared/sound';

/** Size used for a page until its photo has loaded: a 4 by 3 frame, so nothing jumps much when it arrives. */
const DEFAULT_SIZE = { width: 800, height: 600 };

type Stage = 'choose' | 'book';

/**
 * GAME-037 Scrapbook: the family chooses their own photos, adds an optional caption
 * under each, and turns the pages together. Photos are read with object URLs that
 * exist only in this tab: nothing is uploaded, stored or sent. Every URL is released
 * when the book is replaced, cleared or the page closes. Captions live in component
 * state only.
 */
export default function Scrapbook(props: PlayProps) {
  const { ui, lang } = props;
  const text = ui.scrapbook;
  const [pages, setPages] = useState<ScrapPage[]>([]);
  const [stage, setStage] = useState<Stage>('choose');
  const [index, setIndex] = useState(0);
  const [lookOnly, setLookOnly] = useState(false);
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [sizes, setSizes] = useState<Record<number, { width: number; height: number }>>({});
  const input = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);
  // The object URLs this book holds. Kept apart from state so reordering never releases a photo still in use.
  const live = useRef<string[]>([]);
  const captionId = useId();

  // Releases every photo when the game closes.
  useEffect(
    () => () => {
      live.current.forEach((url) => URL.revokeObjectURL(url));
      live.current = [];
    },
    [],
  );

  const total = pages.length;
  const current = clampPage(index, total);
  const page = pages[current];

  const releasePhotos = () => {
    live.current.forEach((url) => URL.revokeObjectURL(url));
    live.current = [];
  };

  const resetInput = () => {
    if (input.current) input.current.value = '';
  };

  const choose = (files: FileList | null) => {
    if (!files) return;
    const usable = Array.from(files).filter(isUsablePhoto);
    const skipped = files.length - usable.length;
    // Clear the input so choosing the same files again still fires a change.
    resetInput();
    if (!canMakeBook(usable.length)) {
      // Too few usable photos: keep the book as it is and say what is needed.
      setNote([text.needTwo, skipped > 0 ? fill(plural(text.skipped, skipped, lang), { n: skipped }) : ''].filter(Boolean).join(' '));
      return;
    }
    const { kept, left } = takeBookPhotos(usable);
    releasePhotos();
    const urls = kept.map((file) => URL.createObjectURL(file));
    live.current = urls;
    setPages(
      urls.map((url) => ({ id: nextId.current++, url, caption: '' })),
    );
    setSizes({});
    setIndex(0);
    setLookOnly(false);
    setStage('book');
    setMessage('');
    setNote(
      [
        left > 0 ? fill(text.usingFirst, { max: MAX_PHOTOS }) : '',
        skipped > 0 ? fill(plural(text.skipped, skipped, lang), { n: skipped }) : '',
      ]
        .filter(Boolean)
        .join(' '),
    );
  };

  const clearBook = () => {
    sounds.tap();
    releasePhotos();
    setPages([]);
    setIndex(0);
    setLookOnly(false);
    setStage('choose');
    setNote('');
    setMessage(text.cleared);
    resetInput();
    input.current?.focus();
  };

  const go = (step: -1 | 1) => {
    if (!canTurn(current, total, step)) return;
    sounds.tap();
    setIndex((i) => turnPage(i, total, step));
    setMessage('');
  };

  const move = (step: -1 | 1) => {
    if (!canMove(current, total, step)) return;
    sounds.tap();
    const result = movePage(pages, current, step);
    setPages(result.pages);
    setIndex(result.index);
    setMessage(fill(text.moved, { n: pageNumber(result.index, total) }));
  };

  const editCaption = (id: number, value: string) => {
    setPages((list) => setCaption(list, id, value));
  };

  const onBookKey = (event: KeyboardEvent<HTMLElement>) => {
    // Typing in a caption keeps its arrow keys for the text.
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(1);
    }
  };

  const size = (id: number) => sizes[id] ?? DEFAULT_SIZE;
  const onLoaded = (id: number, img: HTMLImageElement) => {
    if (img.naturalWidth <= 0 || img.naturalHeight <= 0) return;
    setSizes((s) => (s[id] ? s : { ...s, [id]: { width: img.naturalWidth, height: img.naturalHeight } }));
  };

  const inBook = stage === 'book' && total > 0;
  // The book-stage line is also printed on the paper version (game-print.ts reads ui.scrapbook.guidance).
  const guidance = !inBook ? text.guidanceEmpty : lookOnly ? text.lookGuidance : ui.scrapbook.guidance;
  const pageLine = fill(text.pageOf, { n: pageNumber(current, total), total });

  return (
    <>
      <GameFrame
        ui={ui}
        lang={lang}
        guidance={guidance}
        message={message}
        onRestart={total > 0 ? clearBook : undefined}
        restartLabel={text.clear}
        options={
          stage === 'choose' || !inBook ? (
            <div className="photo-pick scrapbook__choose">
              <p className="m-0">{text.intro}</p>
              <p className="m-0">{text.consent}</p>
              <p className="m-0">{text.privacy}</p>
              <label className="btn btn--primary">
                <Icon name="photo" />
                {total > 0 ? text.chooseDifferent : text.choose}
                <input ref={input} type="file" accept="image/*" multiple onChange={(e) => choose(e.currentTarget.files)} />
              </label>
              {note ? (
                <p role="status" className="m-0">
                  {note}
                </p>
              ) : null}
              {total > 0 ? (
                <button type="button" className="btn" onClick={() => { sounds.tap(); setStage('book'); }}>
                  <Icon name="back" />
                  {text.backToBook}
                </button>
              ) : null}
            </div>
          ) : undefined
        }
        footer={
          inBook && !lookOnly ? (
            <div className="btn-row btn-row--center">
              <button type="button" className="btn" onClick={() => { sounds.tap(); setStage('choose'); setNote(''); }}>
                <Icon name="back" />
                {text.backToChoose}
              </button>
              <button type="button" className="btn" onClick={() => { sounds.tap(); setLookOnly(true); setMessage(''); }}>
                <Icon name="eye" />
                {text.lookTogether}
              </button>
              <button type="button" className="btn btn--primary btn--hero" onClick={() => { sounds.tap(); window.print(); }}>
                <Icon name="print" />
                {text.print}
              </button>
            </div>
          ) : inBook && lookOnly ? (
            <div className="btn-row btn-row--center">
              <button type="button" className="btn" onClick={() => { sounds.tap(); setLookOnly(false); setMessage(''); }}>
                <Icon name="back" />
                {text.leaveLook}
              </button>
            </div>
          ) : null
        }
      >
        {inBook && page ? (
          <section
            className={lookOnly ? 'scrapbook scrapbook--look' : 'scrapbook'}
            tabIndex={0}
            aria-label={text.bookLabel}
            onKeyDown={onBookKey}
          >
            <figure key={page.id} className="scrapbook__page">
              <img
                className="scrapbook__photo"
                src={page.url}
                alt={fill(ui.tile.photoNumber, { n: current + 1 })}
                width={size(page.id).width}
                height={size(page.id).height}
                onLoad={(e) => onLoaded(page.id, e.currentTarget)}
              />
              {visibleCaption(page) ? <figcaption className="scrapbook__caption">{visibleCaption(page)}</figcaption> : null}
            </figure>

            <nav className="scrapbook__turn" aria-label={text.pagesLabel}>
              <button type="button" className="btn scrapbook__btn" disabled={!canTurn(current, total, -1)} onClick={() => go(-1)}>
                <Icon name="back" />
                {text.previous}
              </button>
              <p className="scrapbook__pageof" role="status" aria-live="polite">
                {pageLine}
              </p>
              <button type="button" className="btn scrapbook__btn" disabled={!canTurn(current, total, 1)} onClick={() => go(1)}>
                {text.next}
                <Icon name="arrow" />
              </button>
            </nav>

            {!lookOnly ? (
              <div className="scrapbook__edit">
                <div className="scrapbook__move">
                  <button type="button" className="btn" disabled={!canMove(current, total, -1)} onClick={() => move(-1)}>
                    {text.moveEarlier}
                  </button>
                  <button type="button" className="btn" disabled={!canMove(current, total, 1)} onClick={() => move(1)}>
                    {text.moveLater}
                  </button>
                </div>
                <label className="scrapbook__caption-field" htmlFor={captionId}>
                  <span>{text.captionLabel}</span>
                  <input
                    id={captionId}
                    className="scrapbook__caption-input"
                    type="text"
                    maxLength={CAPTION_MAX}
                    value={page.caption}
                    onChange={(event) => editCaption(page.id, event.currentTarget.value)}
                  />
                </label>
                <p className="scrapbook__hint">{text.captionHelp}</p>
              </div>
            ) : null}
          </section>
        ) : null}

        {/* The printed book: one photo and its caption per page, with page numbers. Hidden on screen by its own rule. */}
      </GameFrame>
      {/* The paper version sits beside the game frame, not inside it: games hide the frame in print. */}
      <section className="sheet scrapbook-sheet">
        <h2>{text.sheetTitle}</h2>
        <p className="scrapbook-sheet__how">{text.sheetHow}</p>
        {total === 0 ? (
          // With no photos chosen, the paper version is a blank page to fill with a printed photo and a few words.
          <div className="scrapbook-sheet__page scrapbook-sheet__blank">
            <p>{text.sheetEmpty}</p>
            <div className="scrapbook-sheet__frame">{text.sheetFrame}</div>
            <p className="scrapbook-sheet__words">{text.sheetWords}</p>
            <span className="scrapbook-sheet__line" />
            <span className="scrapbook-sheet__line" />
            <span className="scrapbook-sheet__line" />
          </div>
        ) : null}
        {pages.map((p, i) => (
          <figure key={p.id} className="sheet__page scrapbook-sheet__page">
            <img
              src={p.url}
              alt={fill(ui.tile.photoNumber, { n: i + 1 })}
              width={size(p.id).width}
              height={size(p.id).height}
            />
            {visibleCaption(p) ? <figcaption>{visibleCaption(p)}</figcaption> : null}
            <p className="scrapbook-sheet__num">{fill(text.pageOf, { n: i + 1, total })}</p>
          </figure>
        ))}
      </section>
    </>
  );
}
