import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { loadTried } from '../lib/activity-feedback';
import {
  PATH_TEXT,
  commitAction,
  loadPaths,
  nextWeek,
  progressOf,
  triedCounts,
  type PathAction,
  type PathsState,
} from '../lib/paths';
import { browserStorage } from '../lib/saved-activities';

export interface PathActivityInfo {
  id: string;
  name: string;
  summary: string;
  typeLabel: string;
  /** The time for this activity on its own day, such as "10–20 min", from its card. */
  time: string;
}

export interface PathWeekInfo {
  title: string;
  note: string;
  /** How long the week's activities take, such as "10–40 min", worked out from the cards. */
  minutes: string;
  activities: PathActivityInfo[];
}

interface Props {
  pathId: string;
  weeks: PathWeekInfo[];
  /** Every path's id, so saving one path's place never drops another's. */
  allPathIds: string[];
  /** The site address, printed under each activity so a paper copy works without the screen. */
  address: string;
}

/**
 * The four weeks of a path (WEB-032): where to start, a skip for any week, and how many activities are on the
 * tried list. The only thing this keeps is the start and the skipped weeks, on this device. It reads the tried
 * list and never writes it, so no action here can lower a count.
 */
export function PathPlan({ pathId, weeks, allPathIds, address }: Props) {
  const known = useMemo(() => new Set(allPathIds), [allPathIds]);
  const [paths, setPaths] = useState<PathsState>({});
  const [tried, setTried] = useState<ReadonlySet<string>>(new Set());
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState('');
  // Whether the last save was accepted. When it was refused the page's own places are the truth, not the device's.
  const lastSaveKept = useRef(true);

  const refresh = useCallback(() => {
    const storage = browserStorage();
    if (lastSaveKept.current) setPaths(loadPaths(storage, known));
    setTried(new Set(loadTried(storage)));
    // A sentence about an earlier tap may no longer be true after another tab changed things.
    setMessage('');
  }, [known]);

  // Read on arrival, and again when the page comes back from another page, another tab or the back button.
  useEffect(() => {
    refresh();
    setReady(true);
    window.addEventListener('pageshow', refresh);
    window.addEventListener('storage', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.removeEventListener('pageshow', refresh);
      window.removeEventListener('storage', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [refresh]);

  // Until the page has read this device, what it would say about a place is held back but keeps its room, so a
  // returning visitor never sees the beginning flash up before their own place, and nothing on the page moves.
  const unread = ready ? '' : ' path-plan--unread';
  const progress = progressOf(paths, pathId);
  const counts = useMemo(() => triedCounts(weeks.map((w) => w.activities.map((a) => a.id)), tried), [weeks, tried]);
  const next = nextWeek(progress);

  const act = (action: PathAction, note: string) => {
    const { state, kept } = commitAction(browserStorage(), known, paths, lastSaveKept.current, action);
    lastSaveKept.current = kept;
    setPaths(state);
    setMessage(kept ? note : PATH_TEXT.notKept);
  };

  // A week started at was meant, so it is no longer set aside; the sentence says so when that happened.
  const startHere = (week: number) => {
    const wasSkipped = progress.skipped.includes(week);
    if (progress.start === week && !wasSkipped) {
      setMessage(PATH_TEXT.alreadyStart(week + 1));
      return;
    }
    act({ type: 'start', path: pathId, week }, wasSkipped ? PATH_TEXT.startSetBack(week + 1) : PATH_TEXT.startSet(week + 1));
  };

  const forget = () => {
    if (progress.start === 0 && progress.skipped.length === 0) {
      setMessage(PATH_TEXT.nothingToForget);
      return;
    }
    act({ type: 'forget', path: pathId }, PATH_TEXT.forgotten);
  };

  return (
    <section className="path-plan" aria-labelledby="path-plan-title" data-ready={ready ? 'true' : undefined}>
      <h2 id="path-plan-title">{PATH_TEXT.heading}</h2>
      <div className={`path-plan__summary no-print${unread}`}>
        <p>{PATH_TEXT.howItWorks}</p>
        <p className="path-plan__count">
          <strong>{PATH_TEXT.triedOf(counts.tried, counts.of)}</strong>
        </p>
        <p className="muted">{PATH_TEXT.triedFrom}</p>
        <p className="path-plan__next">
          {next === null ? (
            PATH_TEXT.nothingWaiting
          ) : (
            <>
              {PATH_TEXT.next(next + 1, weeks[next]?.title ?? '')} <a href={`#week-${next + 1}`}>{PATH_TEXT.goTo(next + 1)}</a>
            </>
          )}
        </p>
        {/* Always on the page, so a screen reader is already listening when a message arrives. */}
        <p className="muted path-plan__message" role="status" aria-live="polite">{message}</p>
      </div>

      <ol className="path-weeks">
        {weeks.map((week, i) => {
          const skipped = progress.skipped.includes(i);
          const isStart = progress.start === i;
          const here = counts.byWeek[i];
          return (
            <li
              key={week.title}
              id={`week-${i + 1}`}
              className={`path-week${skipped ? ' path-week--skipped' : ''}${next === i ? ' path-week--next' : ''}`}
              aria-labelledby={`week-${i + 1}-title`}
            >
              <div className="path-week__head">
                <h3 id={`week-${i + 1}-title`}>{PATH_TEXT.weekHeading(i + 1, week.title)}</h3>
                <p className={`path-week__marks no-print${unread}`}>
                  {isStart && <span className="path-pill">{PATH_TEXT.yourStart}</span>}
                  {next === i && <span className="path-pill path-pill--next">{PATH_TEXT.nextPill}</span>}
                  <span>{PATH_TEXT.triedOf(here?.tried ?? 0, here?.of ?? 0)}</span>
                </p>
              </div>
              <p>
                {week.note} <span className="muted path-week__minutes">{PATH_TEXT.eachTakes(week.minutes)}</span>
              </p>
              {skipped && <p className="path-week__skipped no-print">{PATH_TEXT.skipped}</p>}
              <ul className="path-week__activities">
                {week.activities.map((a) => (
                  <li key={a.id}>
                    <p className="path-activity__name">
                      <a href={`/activity/${a.id}/`}>{a.name}</a>
                      {tried.has(a.id) && (
                        <>
                          {' '}
                          <span className="path-pill no-print">{'\u2713'} {PATH_TEXT.triedMark}</span>
                        </>
                      )}
                      {/* On paper the address sits on the name's line, so the page stays within two pages. */}
                      <span className="print-only path-week__address">{address}/activity/{a.id}/</span>
                    </p>
                    <p className="muted path-activity__summary">{a.typeLabel}. {PATH_TEXT.takes(a.time)} {a.summary}</p>
                  </li>
                ))}
              </ul>
              {/* A blank line to write on, on paper only. */}
              <p className="print-only path-week__notes">{PATH_TEXT.whatWeDid}</p>
              <div className={`btn-row no-print${unread}`}>
                <button
                  type="button"
                  className="btn"
                  aria-pressed={isStart}
                  onClick={() => startHere(i)}
                >
                  {PATH_TEXT.startHere}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() =>
                    act(
                      { type: skipped ? 'unskip' : 'skip', path: pathId, week: i },
                      skipped ? PATH_TEXT.weekBack(i + 1) : PATH_TEXT.weekSkipped(i + 1),
                    )
                  }
                >
                  {skipped ? PATH_TEXT.bringBack : PATH_TEXT.skip}
                </button>
              </div>
            </li>
          );
        })}
      </ol>

      <p className="path-end">{PATH_TEXT.theEnd}</p>

      <div className={`btn-row no-print${unread}`}>
        <button type="button" className="btn btn--primary" onClick={() => window.print()}>
          {PATH_TEXT.print}
        </button>
        {/* Never disabled: a keyboard user who presses it would otherwise lose their place when it switched itself off. */}
        <button type="button" className="btn" onClick={forget}>
          {PATH_TEXT.forget}
        </button>
      </div>
    </section>
  );
}
