import { useRef, useState } from 'react';
import { PERSON_SHAPE, PLACES, TRAY_SETS, type Person } from '../data/collage-board';
import { pictureUrl } from '../data/pictures';
import type { PlayProps } from '../i18n/play';
import { fill } from '../i18n/play/format';
import { SAFETY_FLAG_LABELS } from '../lib/activities';
import {
  chooseCutout,
  isFull,
  lastStep,
  newGame,
  nextSet,
  pass,
  placeAt,
  putBack,
  type Board,
  type Placed,
  type Step,
  startAgain,
  takeBack,
  trayOf,
  turnOf,
  type CollageGame,
} from '../lib/games/collage-board';
import { PAUSE_LINE } from '../lib/scope';
import { GameFrame } from './shared/GameFrame';
import { Icon } from './shared/Icon';
import { sounds } from './shared/sound';

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isPerson = (v: unknown): v is Person => v === 0 || v === 1;
const ALL_PICTURES: ReadonlySet<string> = new Set(TRAY_SETS.flatMap((set) => [...set]));

/** One board (places, turn and steps), or null unless every place, step and person is valid. */
function parseBoard(b: unknown): Board | null {
  if (!isRecord(b)) return null;
  const { cells, turn, steps } = b;
  if (!Array.isArray(cells) || cells.length !== PLACES || !isPerson(turn) || !Array.isArray(steps)) return null;
  const places: (Placed | null)[] = [];
  for (const cell of cells) {
    if (cell === null) {
      places.push(null);
      continue;
    }
    if (!isRecord(cell) || typeof cell.picture !== 'string' || !ALL_PICTURES.has(cell.picture) || !isPerson(cell.person)) return null;
    places.push({ picture: cell.picture, person: cell.person });
  }
  const log: Step[] = [];
  for (const step of steps) {
    if (!isRecord(step) || !isPerson(step.person)) return null;
    if (step.kind === 'pass') {
      log.push({ kind: 'pass', person: step.person });
    } else if (step.kind === 'place' && typeof step.place === 'number' && Number.isInteger(step.place) && step.place >= 0 && step.place < PLACES) {
      log.push({ kind: 'place', place: step.place, person: step.person });
    } else {
      return null;
    }
  }
  return { cells: places, turn, steps: log };
}

/** The saved game, or null unless the set, the chosen cut-out (in that set's tray) and both boards are valid. */
function parseCollage(b: unknown): CollageGame | null {
  if (!isRecord(b)) return null;
  const { set, chosen } = b;
  if (typeof set !== 'number' || !Number.isInteger(set) || set < 0 || set >= TRAY_SETS.length) return null;
  const tray = TRAY_SETS[set] ?? [];
  if (chosen !== null && (typeof chosen !== 'string' || !tray.includes(chosen))) return null;
  const board = parseBoard(b);
  if (!board) return null;
  const before = b.before === null ? null : parseBoard(b.before);
  if (b.before !== null && !before) return null;
  return { ...board, set, chosen: chosen === null ? null : chosen, before };
}

/**
 * Collage board (GAME-033): two people place cut-outs on one shared board, taking turns. Each person's pieces carry
 * their own shape (a circle or a square) with their written name, so color is never the only signal. Nothing is
 * scored, timed, counted, saved or sent. The paper version prints the empty board and the tray, with the cutting
 * line and the sharp-tool label.
 */
export default function CollageBoard(props: PlayProps) {
  const { ui, lang, pictureNames } = props;
  const text = ui.collageBoard;
  const [game, setGame] = useState<CollageGame>(newGame);
  // Taps can arrive faster than the page redraws, so every tap starts from the latest game kept here.
  const latest = useRef(game);
  const [message, setMessage] = useState('');
  const passButton = useRef<HTMLButtonElement>(null);

  const commit = (next: CollageGame) => {
    latest.current = next;
    setGame(next);
  };

  const nameOf = (picture: string): string => pictureNames[picture] ?? '';
  const personName = (person: Person): string => text.people[person] ?? '';
  const markOf = (person: Person): string => text.marks[person] ?? '';

  const pickCutout = (picture: string) => {
    const result = chooseCutout(latest.current, picture);
    if (result.outcome === 'outside') return;
    sounds.tap();
    commit(result.game);
    setMessage(result.outcome === 'chosen' ? fill(text.chosen, { picture: nameOf(picture) }, lang) : text.unchosen);
  };

  const tapPlace = (index: number) => {
    const before = latest.current;
    const result = placeAt(before, index);
    if (result.outcome === 'outside') return;
    if (result.outcome === 'filled') {
      setMessage(fill(text.filled, { n: index + 1 }, lang));
      return;
    }
    if (result.outcome === 'needCutout') {
      setMessage(text.needCutout);
      return;
    }
    sounds.tap();
    commit(result.game);
    if (isFull(result.game)) {
      setMessage(text.full);
      return;
    }
    const values = { n: index + 1, picture: nameOf(before.chosen ?? ''), next: personName(turnOf(result.game)) };
    setMessage(fill(text.placed, values, lang));
  };

  const passTurn = () => {
    const after = pass(latest.current);
    sounds.tap();
    commit(after);
    setMessage(fill(text.passed, { person: personName(turnOf(after)) }, lang));
  };

  // The take-back button disappears once nothing is left to take back, so focus goes to Pass rather than being lost.
  const takeLastBack = () => {
    const { game: after, step } = takeBack(latest.current);
    if (!step) return;
    sounds.tap();
    commit(after);
    setMessage(fill(step.kind === 'place' ? text.tookBack : text.tookBackPass, { person: personName(turnOf(after)) }, lang));
    if (!lastStep(after)) passButton.current?.focus();
  };

  const restart = () => {
    const after = startAgain(latest.current);
    if (after === latest.current) return;
    commit(after);
    setMessage(fill(text.restarted, { person: personName(turnOf(after)) }, lang));
  };

  const restore = () => {
    commit(putBack(latest.current));
    setMessage(text.putBackDone);
  };

  const anotherSet = () => {
    commit(nextSet(latest.current));
    setMessage(text.anotherSet);
  };

  const print = () => {
    sounds.tap();
    window.print();
  };

  const turn = turnOf(game);
  const step = lastStep(game);
  const tray = trayOf(game);

  return (
    <>
      <GameFrame
        ui={ui}
        lang={lang}
        guidance={ui.collageBoard.guidance}
        message={message}
        onRestart={restart}
        place={{
          slug: 'collage-board',
          save: () => ({
            cells: latest.current.cells,
            turn: latest.current.turn,
            steps: latest.current.steps,
            set: latest.current.set,
            chosen: latest.current.chosen,
            before: latest.current.before,
          }),
          check: (b) => parseCollage(b) !== null,
          restore: (b) => {
            const saved = parseCollage(b);
            if (!saved) return;
            commit(saved);
            setMessage('');
          },
        }}
        footer={
          <div className="btn-row btn-row--center">
            <button ref={passButton} type="button" className="btn" onClick={passTurn}>
              <Icon name="arrow" />
              {text.pass}
            </button>
            {step ? (
              <button type="button" className="btn" onClick={takeLastBack}>
                <Icon name="back" />
                {step.kind === 'place' ? text.takeBack : text.takeBackPass}
              </button>
            ) : null}
            {game.before ? (
              <button type="button" className="btn" onClick={restore}>
                {text.putBack}
              </button>
            ) : null}
            <button type="button" className="btn" onClick={anotherSet}>
              {text.another}
            </button>
            <button type="button" className="btn btn--primary btn--hero" onClick={print}>
              <Icon name="print" />
              {text.print}
            </button>
          </div>
        }
      >
        <div className="cb">
          <div className="cb__turn">
            <span className="cbn__shape cb__marker" data-shape={PERSON_SHAPE[turn]} aria-hidden="true" />
            <div>
              <p className="cb__turn-line">{fill(text.turn, { person: personName(turn) }, lang)}</p>
              <p className="cb__turn-mark">{fill(text.marked, { mark: markOf(turn) }, lang)}</p>
            </div>
          </div>

          <div className="cb__board" role="group" aria-label={text.boardLabel}>
            {game.cells.map((cell, index) => {
              const n = index + 1;
              return (
                <button
                  key={index}
                  type="button"
                  className="cb__place"
                  data-state={cell ? 'filled' : 'empty'}
                  onClick={() => tapPlace(index)}
                  aria-label={
                    cell
                      ? fill(text.placeFilled, { n, picture: nameOf(cell.picture), person: personName(cell.person) }, lang)
                      : fill(text.placeEmpty, { n }, lang)
                  }
                >
                  {cell ? (
                    <>
                      <img className="cb__art" src={pictureUrl(cell.picture)} alt="" width={120} height={120} draggable={false} />
                      <span className="cbn__shape cb__corner" data-shape={PERSON_SHAPE[cell.person]} aria-hidden="true" />
                    </>
                  ) : (
                    <span className="cb__no" aria-hidden="true">
                      {n}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <section className="cb__tray-section" aria-labelledby="cb-tray">
            <h2 id="cb-tray">{text.trayHeading}</h2>
            <ul className="cb__tray">
              {tray.map((picture) => {
                const chosen = game.chosen === picture;
                return (
                  <li key={picture}>
                    <button
                      type="button"
                      className="cb__cutout"
                      aria-pressed={chosen}
                      data-chosen={chosen ? 'yes' : undefined}
                      onClick={() => pickCutout(picture)}
                    >
                      <img src={pictureUrl(picture)} alt="" width={120} height={120} draggable={false} />
                      <span className="cb__cutout-name">{nameOf(picture)}</span>
                      {chosen ? <span className="cb__chosen">{text.chosenLabel}</span> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </GameFrame>

      <section className="sheet cb-sheet" aria-hidden="true">
        <h2>{text.sheetTitle}</h2>
        <p className="cb-sheet__how">{text.sheetHow}</p>
        <div className="cb-sheet__board">
          {Array.from({ length: PLACES }, (_, i) => (
            <span key={i} className="cb-sheet__box" />
          ))}
        </div>
        <p className="cb-sheet__label">{text.sheetTray}</p>
        <ul className="cb-sheet__tray">
          {tray.map((picture) => (
            <li key={picture}>
              <img src={pictureUrl(picture)} alt="" width={120} height={120} />
              <span>{nameOf(picture)}</span>
            </li>
          ))}
        </ul>
        <p className="cb-sheet__safety">{SAFETY_FLAG_LABELS['sharp-tool']}</p>
        <p className="cb-sheet__pause">{PAUSE_LINE}</p>
      </section>
    </>
  );
}
