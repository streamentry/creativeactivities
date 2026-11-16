import { useEffect, useState } from 'react';
import type { PlayProps } from '../i18n/play';
import { fill } from '../i18n/play/format';
import { boardColumns } from '../lib/games/pairs';
import { createRng, randomSeed } from '../lib/games/random';
import {
  TOGETHER_COUNTS,
  createTogetherRound,
  groupSize,
  isTogether,
  showGroup,
  startTogether,
  tapResult,
  tapTogether,
  type TogetherState,
} from '../lib/games/together';
import { ChoiceChips } from './shared/ChoiceChips';
import { GameFrame } from './shared/GameFrame';
import { PictureTile, pictureNamer } from './shared/PictureTile';
import { sounds } from './shared/sound';
import { useWide } from './shared/useWide';

/** A pause with no new picture found before the hint names the theme. Never fired by a tap. */
const HINT_AFTER_MS = 20_000;

const newState = (count: number, previousTheme?: string): TogetherState =>
  startTogether(createTogetherRound(count, createRng(randomSeed()), previousTheme));

export default function FourTogether(props: PlayProps) {
  const { ui, lang, content } = props;
  const pictureName = pictureNamer(props);
  const wide = useWide();
  const [count, setCount] = useState<number>(TOGETHER_COUNTS[0]);
  const [state, setState] = useState<TogetherState | null>(null);
  const [message, setMessage] = useState('');
  const [hint, setHint] = useState(false);

  const fresh = (next: TogetherState) => {
    setState(next);
    setMessage('');
    setHint(false);
  };

  useEffect(() => {
    fresh(newState(count));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const done = state ? isTogether(state) : false;
  const foundCount = state?.found.length ?? 0;

  // Rest pauses the hint wait; it starts again from zero on return.
  const [resting, setResting] = useState(false);
  // The hint waits for a pause: the clock restarts whenever a picture is found.
  useEffect(() => {
    if (!state || done || hint || resting) return undefined;
    const timer = window.setTimeout(() => setHint(true), HINT_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [state?.round, foundCount, done, hint, resting]);

  if (!state) return null;
  const { round } = state;
  const themeName = content.fourTogether.themes[round.theme] ?? round.theme;
  const counts = TOGETHER_COUNTS.map((n) => ({ value: n, label: fill(ui.fourTogether.count, { n }) }));
  const guidance = fill(ui.fourTogether.guidance, { n: groupSize(count) });

  const tap = (id: string) => {
    const result = tapResult(state, id);
    if (result === 'already') return;
    if (result === 'elsewhere') {
      sounds.tap();
      setMessage(fill(ui.fourTogether.elsewhere, { name: pictureName(id) }, lang));
      return;
    }
    const after = tapTogether(state, id);
    setState(after);
    if (isTogether(after)) {
      sounds.done();
      setMessage(fill(ui.fourTogether.together, { theme: themeName }, lang));
    } else {
      sounds.match();
      setMessage(fill(ui.fourTogether.found, { name: pictureName(id) }, lang));
    }
  };

  const show = () => {
    sounds.tap();
    setState(showGroup(state));
    setMessage(fill(ui.fourTogether.shown, { theme: themeName }, lang));
  };

  const next = () => {
    sounds.tap();
    fresh(newState(count, round.theme));
  };

  return (
    <GameFrame
      onRestingChange={setResting}
      ui={ui}
      lang={lang}
      guidance={guidance}
      readAloudText={done ? fill(ui.fourTogether.groupName, { theme: themeName }, lang) : guidance}
      message={message}
      options={<ChoiceChips legend={ui.fourTogether.countLegend} choices={counts} value={count} onChange={setCount} />}
      footer={
        <div className="btn-row btn-row--center">
          {done ? null : (
            <button type="button" className="btn" onClick={show}>
              {ui.fourTogether.show}
            </button>
          )}
          <button type="button" className={done ? 'btn btn--primary btn--hero' : 'btn'} onClick={next}>
            {ui.fourTogether.next}
          </button>
        </div>
      }
    >
      <p className="together__note" aria-live="polite">
        {done
          ? fill(ui.fourTogether.groupName, { theme: themeName }, lang)
          : hint
            ? fill(ui.fourTogether.hint, { theme: themeName }, lang)
            : ''}
      </p>
      <div className="board" data-cols={boardColumns(round.pictures.length, wide)} data-width={round.pictures.length <= 4 ? 'small' : 'large'}>
        {round.pictures.map((id, i) => (
          <PictureTile
            key={`${round.theme}-${id}`}
            ui={ui}
            value={id}
            name={pictureName(id)}
            position={i + 1}
            state={state.found.includes(id) ? 'matched' : 'resting'}
            onTap={() => tap(id)}
          />
        ))}
      </div>
    </GameFrame>
  );
}
