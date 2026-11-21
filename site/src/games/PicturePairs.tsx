import { useMemo, useRef, useState } from 'react';
import { PICTURES } from '../data/pictures';
import type { PlayProps } from '../i18n/play';
import { localePath } from '../i18n/locales';
import { fill, plural } from '../i18n/play/format';
import {
  DAILY_PRINT_VERSION,
  WEEKDAYS_SHORT,
  archiveDays,
  dailyValues,
  dayKey,
  monthCalendar,
  monthLabel,
  resultLine,
} from '../lib/games/daily';
import { parsePairTiles, type SavedPairTile } from '../lib/games/pairs';
import { createRng, randomSeed, sample } from '../lib/games/random';
import { resizeValues } from '../lib/games/resize';
import { ChoiceChips } from './shared/ChoiceChips';
import { GameFrame } from './shared/GameFrame';
import { PairsBoard } from './shared/PairsBoard';
import { pictureNamer } from './shared/PictureTile';
import { sounds } from './shared/sound';

const SIZES = [4, 6, 8, 12] as const;

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** A list of distinct ids, each passing [ok]. Reads only: a bad saved value is refused, never repaired. */
const isIdList = (v: unknown, ok: (id: string) => boolean): v is string[] =>
  Array.isArray(v) && v.every((id) => typeof id === 'string' && ok(id)) && new Set(v).size === v.length;

const PICTURE_IDS: ReadonlySet<string> = new Set(PICTURES.map((p) => p.id));
const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;

const PICTURE_ID_LIST: readonly string[] = PICTURES.map((p) => p.id);

/**
 * The saved board (WEB-054): its size, view, pictures, daily day and the layout
 * with matched pairs. The layout must be a whole board for the saved pictures,
 * or the daily card for the saved day. A daily card is refused where it is not
 * offered. Nothing is repaired: a bad value makes the whole place unusable.
 */
export function parseBoard(
  b: unknown,
  dailyAvailable: boolean,
): { size: number; view: 'showing' | 'hidden'; picks: string[]; day: string | null; tiles: SavedPairTile[] } | null {
  if (!isRecord(b)) return null;
  const { size, view, picks, day, tiles } = b;
  if (typeof size !== 'number' || !(SIZES as readonly number[]).includes(size)) return null;
  if (view !== 'showing' && view !== 'hidden') return null;
  if (!isIdList(picks, (id) => PICTURE_IDS.has(id)) || picks.length !== size / 2) return null;
  if (day !== null && !(typeof day === 'string' && DAY_KEY.test(day))) return null;
  if (day !== null && !dailyAvailable) return null;
  const values = typeof day === 'string' ? dailyValues(day, PICTURE_ID_LIST) : picks;
  const layout = parsePairTiles(tiles, values);
  if (layout === null) return null;
  return { size, view: view as 'showing' | 'hidden', picks, day: day as string | null, tiles: layout };
}

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

  // A fresh set of pictures each round, or the day's fixed card. WEB-053: a different
  // size keeps the pictures on the board and the pairs already matched.
  const ids = useMemo(() => PICTURES.map((p) => p.id), []);
  const freshPicks = (pairs: number) => sample(ids, pairs, createRng(randomSeed()));
  const [picks, setPicks] = useState<string[]>(() => freshPicks(size / 2));
  // WEB-054: the shared board's layout and matched pairs, kept for Rest, and a saved layout to rebuild once.
  const boardTiles = useRef<SavedPairTile[]>([]);
  const [resume, setResume] = useState<SavedPairTile[] | undefined>(undefined);
  const values = useMemo(() => (day ? dailyValues(day, ids) : picks), [day, ids, picks]);
  // GAME-061 print: the month the viewer is in, one card title a day, the same as the day picker's dates.
  const nameOf = useMemo(() => pictureNamer(props), [props.pictureNames, props.ui]);
  const calendar = useMemo(() => {
    if (!day) return null;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return { label: monthLabel(year, month), today: dayKey(now), weeks: monthCalendar(year, month, ids, nameOf) };
  }, [day, ids, nameOf]);

  const restart = () => {
    sounds.tap();
    setDone(false);
    setCopied(false);
    setPicks(freshPicks(size / 2));
    setRound((r) => r + 1);
  };

  const changeSize = (n: number) => {
    setSize(n);
    setDone(false);
    setPicks((p) => resizeValues(p, n / 2, ids, createRng(randomSeed())));
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
    <>
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
                setPicks(freshPicks(size / 2));
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
          {daily ? null : <ChoiceChips legend={ui.picturePairs.sizeLegend} choices={sizes} value={size} onChange={changeSize} />}
          {daily ? null : <ChoiceChips legend={ui.picturePairs.viewLegend} choices={views} value={view} onChange={setView} />}
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
      place={{
        slug: 'picture-pairs',
        save: () => ({ size, view, picks, day, tiles: boardTiles.current }),
        check: (b) => parseBoard(b, dailyAvailable) !== null,
        restore: (b) => {
          const saved = parseBoard(b, dailyAvailable);
          if (!saved) return;
          setSize(saved.size);
          setView(saved.view);
          setPicks(saved.picks);
          setDay(saved.day);
          setDone(false);
          setCopied(false);
          setResume(saved.tiles);
          setRound((r) => r + 1);
        },
      }}
    >
      <PairsBoard
        play={props}
        values={values}
        hidden={!daily && view === 'hidden'}
        round={round}
        keepPlace
        resume={resume}
        onResumed={() => setResume(undefined)}
        onTiles={(t) => {
          boardTiles.current = t;
        }}
        onMessage={setMessage}
        onComplete={() => setDone(true)}
      />
    </GameFrame>
    {calendar ? (
      <section className="sheet sheet--calendar" aria-hidden="true">
        <h2>{fill(ui.picturePairs.calendarTitle, { month: calendar.label })}</h2>
        <table className="sheet-calendar">
          <thead>
            <tr>
              {WEEKDAYS_SHORT.map((name) => (
                <th key={name} scope="col">{name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {calendar.weeks.map((week, row) => (
              <tr key={row}>
                {week.map((cell, col) => (
                  <td key={col} className={cell?.key === calendar.today ? 'sheet-calendar__today' : undefined}>
                    {cell ? (
                      <>
                        <span className="sheet-calendar__day">{cell.day}</span>
                        <span className="sheet-calendar__title">{cell.title}</span>
                      </>
                    ) : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="sheet-calendar__help">{ui.picturePairs.calendarHelp}</p>
        <p className="sheet-calendar__version">{fill(ui.picturePairs.calendarVersion, { date: DAILY_PRINT_VERSION })}</p>
      </section>
    ) : null}
    </>
  );
}
