import { useEffect, useId, useState, useSyncExternalStore } from 'react';
import '../styles/card-listen.css';
import { speechOf } from '../lib/games/readAloud';
import { attachLeaveGuard, cardLines, pageListen, type ListenSpeed } from '../lib/listen-card';

/** Replaces `{n}` in a string from the UI dictionary. */
const fill = (text: string, values: Record<string, string | number>): string =>
  text.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));

/** English strings from the `listen` section of src/i18n/ui/en.json. */
export interface ListenStrings {
  listenSteps: string;
  pause: string;
  resume: string;
  stop: string;
  speed: string;
  normal: string;
  slower: string;
  reading: string;
  paused: string;
  note: string;
  listen: string;
  stepLabel: string;
  stopStep: string;
}

const CARD_OWNER = 'card';
const session = pageListen;

/** Set once per page, the first time a control mounts: speech stops on leaving the page or hiding the tab. */
let guardDetach: (() => void) | null = null;
function ensureLeaveGuard(): void {
  if (guardDetach || typeof window === 'undefined') return;
  guardDetach = attachLeaveGuard(session, window, document);
}

function useListenSnapshot() {
  return useSyncExternalStore(
    (listener) => session.subscribe(listener),
    () => session.snapshot(),
    () => session.snapshot(),
  );
}

/** Shows controls only after hydration confirms the browser can speak, so the server markup has no dead buttons. */
function useSpeechSupport(): boolean {
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    if (!speechOf()) return;
    ensureLeaveGuard();
    setSupported(true);
  }, []);
  return supported;
}

interface CardListenProps {
  title: string;
  steps: readonly string[];
  /** Safety notes shown above the steps. They are read first, so they are never skipped. */
  lead?: readonly string[];
  lang?: string;
  ui: ListenStrings;
}

/** The "Listen to the steps" control: play or pause, stop, speed, and a note about the device's voice. */
export function CardListen({ title, steps, lead = [], lang = 'en', ui }: CardListenProps) {
  const supported = useSpeechSupport();
  const snap = useListenSnapshot();
  const speedName = useId();

  useEffect(
    () => () => {
      if (session.snapshot().owner === CARD_OWNER) session.stop();
    },
    [],
  );

  if (!supported) return null;

  const mine = snap.owner === CARD_OWNER && snap.state !== 'idle';
  const playing = mine && snap.state === 'speaking';
  const paused = mine && snap.state === 'paused';
  const label = playing ? ui.pause : paused ? ui.resume : ui.listenSteps;
  const status = playing ? ui.reading : paused ? ui.paused : '';

  const onMain = () => {
    if (playing) session.pause();
    else if (paused) session.resume();
    else session.play(cardLines(title, steps, lead), CARD_OWNER, lang);
  };
  const setSpeed = (speed: ListenSpeed) => session.setSpeed(speed);

  return (
    <div className="card-listen no-print">
      <div className="card-listen__controls">
        <button type="button" className="btn btn--primary" onClick={onMain}>
          {label}
        </button>
        <button type="button" className="btn" onClick={() => session.stop()}>
          {ui.stop}
        </button>
      </div>
      <fieldset className="card-listen__speed">
        <legend>{ui.speed}</legend>
        <label>
          <input
            type="radio"
            name={speedName}
            value="normal"
            checked={snap.speed === 'normal'}
            onChange={() => setSpeed('normal')}
          />
          {ui.normal}
        </label>
        <label>
          <input
            type="radio"
            name={speedName}
            value="slower"
            checked={snap.speed === 'slower'}
            onChange={() => setSpeed('slower')}
          />
          {ui.slower}
        </label>
      </fieldset>
      <p className="card-listen__status" role="status">
        {status}
      </p>
      <p className="card-listen__note">{ui.note}</p>
    </div>
  );
}

interface StepListenProps {
  /** The step's number, from 1. */
  n: number;
  text: string;
  lang?: string;
  ui: Pick<ListenStrings, 'listen' | 'stop' | 'stepLabel' | 'stopStep'>;
}

/** A small "Listen" button that reads only this step. */
export function StepListen({ n, text, lang = 'en', ui }: StepListenProps) {
  const supported = useSpeechSupport();
  const snap = useListenSnapshot();

  if (!supported) return null;

  const owner = `step-${n}`;
  const speaking = snap.owner === owner && snap.state !== 'idle';
  const onClick = () => {
    if (speaking) session.stop();
    else session.play([text], owner, lang);
  };

  return (
    <button
      type="button"
      className="btn btn--quiet card-listen__step no-print"
      aria-label={speaking ? fill(ui.stopStep, { n }) : fill(ui.stepLabel, { n })}
      onClick={onClick}
    >
      {speaking ? ui.stop : ui.listen}
    </button>
  );
}
