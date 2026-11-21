import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { PlayUi } from '../../i18n/play';
import { localePath } from '../../i18n/locales';
import { analyticsAvailable, once, track, trackPrint, type FeedbackAnswer } from '../../lib/track';
import { Icon } from './Icon';
import { ReadAloud } from './ReadAloud';
import { speechOf, stopReading } from '../../lib/games/readAloud';
import { hydrateSettings, settingsStore, useSound } from './settings';
import { sounds } from './sound';
import { clearPlace, keepsPlace, loadPlace, savePlace } from './place';

/** A game's board, kept on this device when the person rests (WEB-054). */
export interface KeptPlace {
  /** The game's slug. Photo games never keep a place. */
  slug: string;
  /** The board's own state as plain JSON: no photos, no scores, no timestamps. */
  save: () => unknown;
  /** True when a saved board has the shape this game needs. Called before the offer. */
  check: (board: unknown) => boolean;
  /** Puts a checked board back. */
  restore: (board: unknown) => void;
}

interface GameFrameProps {
  ui: PlayUi;
  lang: string;
  /** One plain sentence of guidance, always visible. */
  guidance: string;
  /** Polite live message after each turn. */
  message?: string;
  options?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  onRestart?: () => void;
  /** Told when Rest starts and ends, so a game can pause anything that waits, such as a hint. */
  onRestingChange?: (resting: boolean) => void;
  restartLabel?: string;
  /** Optional spoken text for ReadAloud, defaulting to guidance. */
  readAloudText?: string;
  /** WEB-054: keeps the place on this device between visits. Omit for no saved place. */
  place?: KeptPlace;
}

export function GameFrame({ ui, lang, guidance, message, options, children, footer, onRestart, onRestingChange, restartLabel, readAloudText, place }: GameFrameProps) {
  const sound = useSound();
  // A board saved on an earlier visit, offered once on return. undefined means no offer.
  const [offered, setOffered] = useState<unknown>(undefined);
  useEffect(() => {
    if (!place || !keepsPlace(place.slug)) return;
    const saved = loadPlace(place.slug);
    if (saved === undefined) return;
    let usable = false;
    try {
      usable = place.check(saved);
    } catch {
      usable = false;
    }
    if (usable) setOffered(saved);
    else clearPlace(place.slug);
    // Read once, when the game opens; the place is kept by Rest, not by each change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [started, setStarted] = useState(false);
  const [answer, setAnswer] = useState<FeedbackAnswer | null>(null);
  const [canAsk, setCanAsk] = useState(false);
  const thanks = useRef<HTMLParagraphElement>(null);
  useEffect(hydrateSettings, []);
  // The answer buttons disappear on a tap, so keep focus on the reply.
  useEffect(() => {
    if (answer) thanks.current?.focus();
  }, [answer]);
  useEffect(() => {
    const onPrint = () => trackPrint();
    window.addEventListener('beforeprint', onPrint);
    return () => window.removeEventListener('beforeprint', onPrint);
  }, []);
  const [sendStart] = useState(() => once(() => track('activity_start')));
  // Rest hides the play area but keeps it mounted, so the place is kept as it was.
  const [resting, setResting] = useState(false);
  const restButton = useRef<HTMLButtonElement>(null);
  const resumeButton = useRef<HTMLButtonElement>(null);
  const wasResting = useRef(false);
  // The Rest button disappears while resting, so focus moves to Carry on, and back to Rest after.
  useEffect(() => {
    if (resting) resumeButton.current?.focus();
    else if (wasResting.current) restButton.current?.focus();
    wasResting.current = resting;
    onRestingChange?.(resting);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resting]);

  // A click is a real choice on the board; Tab, arrow keys and scrolling
  // touches are not. Keyboard activation of a tile also fires click.
  const markStarted = () => {
    if (!sendStart()) return;
    setStarted(true);
    // Checked now, not at load: the Analytics script may finish after hydration.
    setCanAsk(analyticsAvailable());
  };
  const giveFeedback = (value: FeedbackAnswer) => {
    setAnswer(value);
    track('activity_feedback', { answer: value });
  };
  const stopSpeech = () => {
    const s = speechOf();
    if (s) stopReading(s);
  };
  const leaveGame = () => {
    sounds.tap();
    track('activity_done');
    stopSpeech();
  };
  const rest = () => {
    sounds.tap();
    stopSpeech();
    if (place) {
      try {
        savePlace(place.slug, place.save());
      } catch {
        // Not saved; the place is still kept while this page is open.
      }
    }
    setResting(true);
  };
  const carryOn = () => {
    sounds.tap();
    if (place && offered !== undefined) place.restore(offered);
    setOffered(undefined);
  };
  const startFresh = () => {
    sounds.tap();
    if (place) clearPlace(place.slug);
    setOffered(undefined);
  };

  return (
    <section className="game" aria-label={ui.frame.region}>
      {resting ? (
        <div className="game__rest">
          <h2>{ui.frame.restingTitle}</h2>
          <p>{ui.frame.restingText}</p>
          <div className="game__rest-actions">
            <button ref={resumeButton} type="button" className="btn btn--primary btn--hero" onClick={() => { sounds.tap(); setResting(false); }}>
              <Icon name="play" />
              {ui.frame.resume}
            </button>
            <a className="btn btn--quiet" href={localePath(lang, '/games/')} onClick={leaveGame}>
              <Icon name="door" />
              {ui.frame.done}
            </a>
          </div>
        </div>
      ) : null}
      <div hidden={resting}>
        {offered !== undefined ? (
          <div className="game__place">
            <p>{ui.frame.placeText}</p>
            <div className="game__rest-actions">
              <button type="button" className="btn btn--primary" onClick={carryOn}>
                <Icon name="play" />
                {ui.frame.placeResume}
              </button>
              <button type="button" className="btn btn--quiet" onClick={startFresh}>
                <Icon name="refresh" />
                {ui.frame.placeFresh}
              </button>
            </div>
          </div>
        ) : null}
        {options ? <div className="game__options">{options}</div> : null}
        <p className="game__guidance">{guidance}</p>
        <ReadAloud ui={ui} lang={lang} text={readAloudText ?? guidance} />
        <div className="game__board" onClickCapture={markStarted}>
          {children}
        </div>
        <p className="game__message" role="status" aria-live="polite">
          {message ?? ''}
        </p>
        {footer}
        <div className="game__bar">
          {onRestart ? (
            <button
              type="button"
              className="btn"
              onClick={() => {
                sounds.tap();
                track('activity_restart');
                stopSpeech();
                if (place) clearPlace(place.slug);
                setOffered(undefined);
                onRestart();
              }}
            >
              <Icon name="refresh" />
              {restartLabel ?? ui.frame.restart}
            </button>
          ) : null}
          <button ref={restButton} type="button" className="btn btn--quiet" data-rest onClick={rest}>
            <Icon name="leaf" />
            {ui.frame.rest}
          </button>
          <button
            type="button"
            className="btn btn--quiet"
            aria-pressed={sound}
            onClick={() => {
              const turningOn = !sound;
              settingsStore.actions.toggleSound();
              if (turningOn) {
                sounds.tap();
              }
            }}
          >
            <Icon name={sound ? 'sound' : 'soundOff'} />
            {sound ? ui.frame.soundOn : ui.frame.soundOff}
          </button>
          <a className="btn btn--quiet" href={localePath(lang, '/games/')} onClick={leaveGame}>
            <Icon name="door" />
            {ui.frame.done}
          </a>
        </div>
        {canAsk && started ? (
          <div className="game__feedback">
            {answer ? (
              <p ref={thanks} tabIndex={-1}>
                {ui.frame.feedbackThanks}
              </p>
            ) : (
              <>
                <p id="game-feedback-question">{ui.frame.feedbackQuestion}</p>
                <div role="group" aria-labelledby="game-feedback-question" className="game__feedback-choices">
                  <button
                    type="button"
                    className="btn btn--quiet"
                    onClick={() => {
                      sounds.tap();
                      giveFeedback('yes');
                    }}
                  >
                    {ui.frame.feedbackYes}
                  </button>
                  <button
                    type="button"
                    className="btn btn--quiet"
                    onClick={() => {
                      sounds.tap();
                      giveFeedback('not_really');
                    }}
                  >
                    {ui.frame.feedbackNo}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
