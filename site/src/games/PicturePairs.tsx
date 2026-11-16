import { useMemo, useState } from 'react';
import { PICTURES } from '../data/pictures';
import type { PlayProps } from '../i18n/play';
import { localePath } from '../i18n/locales';
import { fill, plural } from '../i18n/play/format';
import { archiveDays, dailyValues, dayKey, resultLine } from '../lib/games/daily';
import { createRng, randomSeed, sample } from '../lib/games/random';
import { ChoiceChips } from './shared/ChoiceChips';
import { GameFrame } from './shared/GameFrame';
import { PairsBoard } from './shared/PairsBoard';
import { sounds } from './shared/sound';

const SIZES = [4, 6, 8, 12] as const;

export default function PicturePairs(props: PlayProps) {
  const { ui, lang } = props;
  const [size, setSize] = useState<number>(4);
  const [view, setView] = useState<'showing' | 'hidden'>('showing');
  const [round, setRound] = useState(0);
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);
  // GAME-061: the daily card is English only until its words are reviewed.
  const dailyAvailable = lang === 'en';
  const [day, setDay] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const days = useMemo(() => (day ? archiveDays(new Date()) : []), [day]);

  // A fresh set of pictures each round, or the day's fixed card.
  const values = useMemo(
    () =>
      day
        ? dailyValues(day, PICTURES.map((p) => p.id))
        : sample(PICTURES.map((p) => p.id), size / 2, createRng(randomSeed())),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [size, round, day],
  );

  const restart = () => {
    sounds.tap();
    setDone(false);
    setCopied(false);
    setRound((r) => r + 1);
  };

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(resultLine(values.length));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const dayLabel = (key: string, i: number) => {
    const [y, m, d] = key.split('-').map(Number) as [number, number, number];
    const text = new Date(y, m - 1, d).toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long' });
    return i === 0 ? `Today, ${text}` : text;
  };

  const sizes = SIZES.map((n) => ({ value: n, label: fill(plural(ui.picturePairs.size, n, lang), { n }) }));
  const views = [
    { value: 'showing', label: ui.picturePairs.viewShowing },
    { value: 'hidden', label: ui.picturePairs.viewHidden },
  ] as const;

  const daily = day !== null;
  const guidance = daily ? ui.picturePairs.guidanceDaily : view === 'showing' ? ui.picturePairs.guidanceShowing : ui.picturePairs.guidanceHidden;

  return (
    <GameFrame
      ui={ui}
      lang={lang}
      guidance={guidance}
      readAloudText={message || guidance}
      message={message}
      onRestart={restart}
      restartLabel={daily ? ui.picturePairs.restartDaily : ui.picturePairs.restart}
      options={
        <>
          {dailyAvailable ? (
            <ChoiceChips
              legend={ui.picturePairs.modeLegend}
              choices={[
                { value: 'play', label: ui.picturePairs.modePlay },
                { value: 'daily', label: ui.picturePairs.modeDaily },
              ] as const}
              value={daily ? 'daily' : 'play'}
              onChange={(v) => {
                setDone(false);
                setCopied(false);
                setDay(v === 'daily' ? dayKey(new Date()) : null);
                setRound((r) => r + 1);
              }}
            />
          ) : null}
          {daily ? (
            <div className="chips">
              <label className="chips__legend" htmlFor="daily-day">{ui.picturePairs.dayLegend}</label>
              <select
                id="daily-day"
                className="game__select"
                value={day}
                onChange={(e) => {
                  sounds.tap();
                  setDay(e.target.value);
                  setDone(false);
                  setCopied(false);
                  setRound((r) => r + 1);
                }}
              >
                {days.map((key, i) => (
                  <option key={key} value={key}>{dayLabel(key, i)}</option>
                ))}
              </select>
              <p className="game__help">{ui.picturePairs.dayHelp}</p>
            </div>
          ) : null}
          {daily ? null : <ChoiceChips legend={ui.picturePairs.sizeLegend} choices={sizes} value={size} onChange={(v) => { setSize(v); setDone(false); }} />}
          {daily ? null : <ChoiceChips legend={ui.picturePairs.viewLegend} choices={views} value={view} onChange={(v) => { setView(v); restart(); }} />}
        </>
      }
      footer={
        done ? (
          <div className="game__done">
            {daily ? (
              <div className="game__result">
                <p><strong>{resultLine(values.length)}</strong></p>
                <button type="button" className="btn" onClick={copyResult}>{ui.picturePairs.copy}</button>
                <p role="status" className="game__help">{copied ? ui.picturePairs.copied : ''}</p>
              </div>
            ) : null}
            <div className="btn-row">
              <button type="button" className={daily ? 'btn' : 'btn btn--primary'} onClick={restart}>
                {daily ? ui.picturePairs.restartDaily : ui.picturePairs.playAgain}
              </button>
              <a className="btn" href={localePath(lang, '/games/conversation-cards/')}>
                {ui.picturePairs.talk}
              </a>
            </div>
          </div>
        ) : null
      }
    >
      <PairsBoard play={props} values={values} hidden={!daily && view === 'hidden'} round={round} onMessage={setMessage} onComplete={() => setDone(true)} />
    </GameFrame>
  );
}
