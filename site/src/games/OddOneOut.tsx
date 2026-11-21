import { useEffect, useState } from 'react';
import type { PlayProps } from '../i18n/play';
import { fill } from '../i18n/play/format';
import { boardColumns } from '../lib/games/pairs';
import { createRng, randomSeed } from '../lib/games/random';
import { resizeOddState } from '../lib/games/resize';
import { TOGETHER_THEMES } from '../lib/games/together';
import {
  ODD_COUNTS,
  createOddRound,
  oddTapResult,
  sharedSize,
  showOdd,
  startOdd,
  tapOdd,
  type OddRound,
  type OddState,
} from '../lib/games/odd-one-out';
import { ChoiceChips } from './shared/ChoiceChips';
import { GameFrame } from './shared/GameFrame';
import { PictureTile, pictureNamer } from './shared/PictureTile';
import { sounds } from './shared/sound';
import { useWide } from './shared/useWide';

/** A pause with the set still open before the hint names the theme. Never fired by a tap. */
const HINT_AFTER_MS = 20_000;

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** A list of distinct ids, each passing [ok]. Reads only: a bad saved value is refused, never repaired. */
const isIdList = (v: unknown, ok: (id: string) => boolean): v is string[] =>
  Array.isArray(v) && v.every((id) => typeof id === 'string' && ok(id)) && new Set(v).size === v.length;

const TOGETHER_PICTURES: ReadonlySet<string> = new Set(TOGETHER_THEMES.flatMap((t) => [...t.pictures]));

/** The saved board, or null when this game cannot show it. */
function parseBoard(b: unknown): { count: number; state: OddState } | null {
  if (!isRecord(b)) return null;
  const { count, round, found, shown } = b;
  if (typeof count !== 'number' || !(ODD_COUNTS as readonly number[]).includes(count) || typeof found !== 'boolean' || typeof shown !== 'boolean') return null;
  if (!isRecord(round)) return null;
  const { theme, odd, pictures } = round;
  const pool = TOGETHER_THEMES.find((t) => t.id === theme);
  if (!pool || typeof odd !== 'string' || pool.pictures.includes(odd) || !TOGETHER_PICTURES.has(odd)) return null;
  if (!isIdList(pictures, (id) => id === odd || pool.pictures.includes(id))) return null;
  if (pictures.length !== sharedSize(count) + 1 || !pictures.includes(odd)) return null;
  return { count, state: { round: { theme: pool.id, odd, pictures: [...pictures] }, found, shown } };
}

const newState = (count: number, previous?: OddRound): OddState =>
  startOdd(createOddRound(count, createRng(randomSeed()), previous));

export default function OddOneOut(props: PlayProps) {
  const { ui, lang, content } = props;
  const pictureName = pictureNamer(props);
  const wide = useWide();
  const [count, setCount] = useState<number>(ODD_COUNTS[0]);
  const [state, setState] = useState<OddState | null>(null);
  const [message, setMessage] = useState('');
  const [hint, setHint] = useState(false);
  // WEB-053: hints are optional. Turning them off also hides one already showing.
  const [hintsOn, setHintsOn] = useState(true);

  const fresh = (next: OddState) => {
    setState(next);
    setMessage('');
    setHint(false);
  };

  useEffect(() => {
    fresh(newState(count));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // WEB-053: a different count keeps the theme, the odd picture and whether it was found.
  const changeCount = (n: number) => {
    setCount(n);
    if (!state) return;
    const next = resizeOddState(state, n, createRng(randomSeed()), TOGETHER_THEMES);
    setState(next);
    // A fresh round (the theme ran out of pictures) clears the note; otherwise it still applies.
    if (next.round.odd !== state.round.odd) {
      setMessage('');
      setHint(false);
    } else if (!next.found) {
      setMessage('');
    }
  };

  const done = state?.found ?? false;

  // Rest pauses the hint wait; it starts again from zero on return.
  const [resting, setResting] = useState(false);
  // The hint waits for a quiet pause on an open set; taps never bring it sooner.
  useEffect(() => {
    if (!state || done || hint || resting || !hintsOn) return undefined;
    const timer = window.setTimeout(() => setHint(true), HINT_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [state?.round, done, hint, resting, hintsOn]);

  if (!state) return null;
  const { round } = state;
  const themeName = content.fourTogether.themes[round.theme] ?? round.theme;
  const counts = ODD_COUNTS.map((n) => ({ value: n, label: fill(ui.oddOneOut.count, { n }) }));
  const guidance = ui.oddOneOut.guidance;
  // Three pictures sit in one row on a wide screen, so none is left alone below.
  const threeInRow = wide && round.pictures.length === 3;
  const othersNote =fill(ui.oddOneOut.others, { theme: themeName }, lang);

  const tap = (id: string) => {
    const result = oddTapResult(state, id);
    if (result === 'already') return;
    if (result === 'belongs') {
      sounds.tap();
      setMessage(fill(ui.oddOneOut.belongs, { name: pictureName(id) }, lang));
      return;
    }
    sounds.done();
    setState(tapOdd(state, id));
    setMessage(fill(ui.oddOneOut.found, { name: pictureName(id), theme: themeName }, lang));
  };

  const show = () => {
    sounds.tap();
    setState(showOdd(state));
    setMessage(fill(ui.oddOneOut.shown, { name: pictureName(round.odd), theme: themeName }, lang));
  };

  const next = () => {
    sounds.tap();
    fresh(newState(count, round));
  };

  return (
    <GameFrame
      onRestingChange={setResting}
      ui={ui}
      lang={lang}
      guidance={guidance}
      readAloudText={done ? othersNote : guidance}
      message={message}
      options={
        <>
          <ChoiceChips legend={ui.oddOneOut.countLegend} choices={counts} value={count} onChange={changeCount} />
          <ChoiceChips
            legend={ui.oddOneOut.hintLegend}
            choices={[
              { value: 'on', label: ui.oddOneOut.hintOn },
              { value: 'off', label: ui.oddOneOut.hintOff },
            ] as const}
            value={hintsOn ? 'on' : 'off'}
            onChange={(v) => {
              setHintsOn(v === 'on');
              setHint(false);
            }}
          />
        </>
      }
      footer={
        <div className="btn-row btn-row--center">
          {done ? null : (
            <button type="button" className="btn" onClick={show}>
              {ui.oddOneOut.show}
            </button>
          )}
          <button type="button" className={done ? 'btn btn--primary btn--hero' : 'btn'} onClick={next}>
            {ui.oddOneOut.next}
          </button>
        </div>
      }
      place={{
        slug: 'odd-one-out',
        save: () => ({ count, state }),
        check: (b) => parseBoard(b) !== null,
        restore: (b) => {
          const saved = parseBoard(b);
          if (!saved) return;
          setCount(saved.count);
          setState(saved.state);
          setMessage('');
          setHint(false);
        },
      }}
    >
      <p className="together__note" aria-live="polite">
        {done
          ? othersNote
          : hint
            ? fill(ui.oddOneOut.hint, { n: sharedSize(round.pictures.length), theme: themeName }, lang)
            : ''}
      </p>
      <div className="board" data-cols={threeInRow ? 3 : boardColumns(round.pictures.length, wide)} data-width={threeInRow ? 'medium' : 'small'}>
        {round.pictures.map((id, i) => (
          <PictureTile
            key={`${round.theme}-${round.odd}-${id}`}
            ui={ui}
            value={id}
            name={pictureName(id)}
            position={i + 1}
            state={done && id === round.odd ? 'matched' : 'resting'}
            onTap={() => tap(id)}
          />
        ))}
      </div>
    </GameFrame>
  );
}
