import { useEffect, useRef, useState } from 'react';
import { pictureUrl } from '../data/pictures';
import { HALVES_PICTURES } from '../data/halves-match';
import type { PlayProps, PlayUi } from '../i18n/play';
import { fill } from '../i18n/play/format';
import {
  HALVES_COUNTS,
  createHalvesRound,
  halvesTapResult,
  isHalfJoined,
  isHalvesDone,
  resizeHalvesState,
  showHalves,
  startHalves,
  tapHalf,
  type HalvesSide,
  type HalvesState,
} from '../lib/games/halves-match';
import { createRng, randomSeed } from '../lib/games/random';
import { ChoiceChips } from './shared/ChoiceChips';
import { GameFrame } from './shared/GameFrame';
import { Icon } from './shared/Icon';
import { pictureNamer } from './shared/PictureTile';
import { sounds } from './shared/sound';

const newState = (count: number, previous: readonly string[] = []): HalvesState =>
  startHalves(createHalvesRound(count, createRng(randomSeed()), previous));

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** A list of distinct ids, each passing [ok]. Reads only: a bad saved value is refused, never repaired. */
const isIdList = (v: unknown, ok: (id: string) => boolean): v is string[] =>
  Array.isArray(v) && v.every((id) => typeof id === 'string' && ok(id)) && new Set(v).size === v.length;

const HALVES_SET: ReadonlySet<string> = new Set(HALVES_PICTURES);

/** The saved board, or null when this game cannot show it. The selected half is never kept. */
function parseBoard(b: unknown): { count: number; state: HalvesState } | null {
  if (!isRecord(b)) return null;
  const { count, round, right, joined, shown } = b;
  if (typeof count !== 'number' || !(HALVES_COUNTS as readonly number[]).includes(count) || typeof shown !== 'boolean') return null;
  if (!isRecord(round)) return null;
  const { pictures, rightOrder } = round;
  if (!isIdList(pictures, (id) => HALVES_SET.has(id)) || pictures.length !== count) return null;
  const sameSet = (ids: unknown): ids is string[] => isIdList(ids, (id) => pictures.includes(id)) && ids.length === pictures.length;
  if (!sameSet(rightOrder) || !sameSet(right) || !isIdList(joined, (id) => pictures.includes(id))) return null;
  return {
    count,
    state: { round: { pictures: [...pictures], rightOrder: [...rightOrder] }, right: [...right], joined: [...joined], shown, selected: null },
  };
}

type HalfLook = 'resting' | 'selected' | 'joined';

interface HalfProps {
  ui: PlayUi;
  lang: string;
  side: HalvesSide;
  id: string;
  name: string;
  look: HalfLook;
  onTap: () => void;
  buttonRef?: (el: HTMLButtonElement | null) => void;
}

/** One half of a picture: the same drawing, cropped to its left or right side. */
function Half({ ui, lang, side, id, name, look, onTap, buttonRef }: HalfProps) {
  const label = fill(side === 'left' ? ui.halvesMatch.left : ui.halvesMatch.right, { name }, lang);
  const stateWord = look === 'joined' ? ui.halvesMatch.joined : look === 'selected' ? ui.tile.selected : undefined;
  return (
    <button
      ref={buttonRef}
      type="button"
      className={`half half--${side} half--${look}`}
      data-state={look}
      onClick={onTap}
      aria-label={stateWord ? fill(ui.tile.withState, { label, state: stateWord }) : label}
      aria-pressed={look === 'selected' ? true : undefined}
      aria-disabled={look === 'joined' ? true : undefined}
    >
      <span className="half__crop" aria-hidden="true">
        <img src={pictureUrl(id)} alt="" width="120" height="120" draggable={false} />
      </span>
      {look === 'joined' && side === 'right' ? (
        <span className="half__badge" aria-hidden="true">
          <Icon name="check" size={22} />
        </span>
      ) : null}
    </button>
  );
}

interface HalvesBoardProps {
  ui: PlayUi;
  lang: string;
  state: HalvesState;
  pictureName: (id: string) => string;
  onTap: (side: HalvesSide, id: string) => void;
  /** Told about each right-hand button, so the game can keep the keyboard on a half that moves. */
  rightButtons?: (row: number, el: HTMLButtonElement | null) => void;
}

/**
 * The two columns of halves. The left halves come first in the page, then the
 * right halves, so Tab goes down one column and then the other.
 */
export function HalvesBoard({ ui, lang, state, pictureName, onTap, rightButtons }: HalvesBoardProps) {
  const lookOf = (side: HalvesSide, id: string): HalfLook =>
    isHalfJoined(state, id) ? 'joined' : state.selected?.side === side && state.selected.id === id ? 'selected' : 'resting';
  return (
    <div className="halves">
      <div className="halves__column" role="group" aria-label={ui.halvesMatch.leftGroup}>
        {state.round.pictures.map((id, row) => (
          <Half key={`left-${row}`} ui={ui} lang={lang} side="left" id={id} name={pictureName(id)} look={lookOf('left', id)} onTap={() => onTap('left', id)} />
        ))}
      </div>
      <div className="halves__column" role="group" aria-label={ui.halvesMatch.rightGroup}>
        {state.right.map((id, row) => (
          <Half
            key={`right-${row}`}
            ui={ui}
            lang={lang}
            side="right"
            id={id}
            name={pictureName(id)}
            look={lookOf('right', id)}
            onTap={() => onTap('right', id)}
            buttonRef={rightButtons ? (el) => rightButtons(row, el) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Halves match (GAME-021): the left halves of two or three pictures in one
 * column, their right halves in the other. Tap a half, then the half that fits
 * it. A pair that fits is joined into a whole picture; any other pair simply
 * separates again, with a gentle message. No score, clock, miss count or failure.
 */
export default function HalvesMatch(props: PlayProps) {
  const { ui, lang } = props;
  const pictureName = pictureNamer(props);
  const [count, setCount] = useState<number>(HALVES_COUNTS[0]);
  const [state, setState] = useState<HalvesState | null>(null);
  const [message, setMessage] = useState('');
  const rightButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const [focusRow, setFocusRow] = useState<number | null>(null);

  // The board is made after the page loads, so every visit starts with new pictures.
  useEffect(() => {
    setState(newState(count));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A joined right half moves to its partner's row; keep the keyboard on it.
  useEffect(() => {
    if (focusRow === null) return;
    rightButtons.current[focusRow]?.focus();
    setFocusRow(null);
  }, [focusRow]);

  // WEB-053: a different count keeps the pictures already joined.
  const changeCount = (n: number) => {
    setCount(n);
    if (!state) return;
    setState(resizeHalvesState(state, n, createRng(randomSeed())));
    setMessage('');
  };

  const counts = HALVES_COUNTS.map((n) => ({ value: n, label: fill(ui.halvesMatch.count, { n }) }));
  const options = <ChoiceChips legend={ui.halvesMatch.countLegend} choices={counts} value={count} onChange={changeCount} />;

  if (!state) {
    return <GameFrame ui={ui} lang={lang} guidance={ui.halvesMatch.guidance} options={options}>{null}</GameFrame>;
  }

  const { round } = state;
  const done = isHalvesDone(state);

  const tap = (side: HalvesSide, id: string) => {
    const result = halvesTapResult(state, side, id);
    if (result === 'ignore') return;
    const after = tapHalf(state, side, id);
    setState(after);
    if (result === 'select') {
      sounds.tap();
      setMessage(side === 'left' ? ui.halvesMatch.pickRight : ui.halvesMatch.pickLeft);
    } else if (result === 'deselect') {
      sounds.tap();
      setMessage('');
    } else if (result === 'apart') {
      // The two halves are put down and nothing else changes. No sound beyond the soft tap, and nothing counted.
      sounds.tap();
      setMessage(ui.halvesMatch.apart);
    } else {
      setFocusRow(round.pictures.indexOf(id));
      if (isHalvesDone(after)) {
        sounds.done();
        setMessage(ui.halvesMatch.all);
      } else {
        sounds.match();
        setMessage(fill(ui.halvesMatch.fit, { name: pictureName(id) }, lang));
      }
    }
  };

  const show = () => {
    sounds.tap();
    setState(showHalves(state));
    setMessage(ui.halvesMatch.shown);
  };

  const next = () => {
    sounds.tap();
    setState(newState(count, round.pictures));
    setMessage('');
  };

  return (
    <GameFrame
      ui={ui}
      lang={lang}
      guidance={ui.halvesMatch.guidance}
      message={message}
      options={options}
      footer={
        <div className="btn-row btn-row--center">
          {done ? null : (
            <button type="button" className="btn" onClick={show}>
              {ui.halvesMatch.show}
            </button>
          )}
          <button type="button" className={done ? 'btn btn--primary btn--hero' : 'btn'} onClick={next}>
            {ui.halvesMatch.next}
          </button>
        </div>
      }
      place={{
        slug: 'halves-match',
        save: () => ({ count, state: state && { ...state, selected: null } }),
        check: (b) => parseBoard(b) !== null,
        restore: (b) => {
          const saved = parseBoard(b);
          if (!saved) return;
          setCount(saved.count);
          setState(saved.state);
          setMessage('');
        },
      }}
    >
      <HalvesBoard
        ui={ui}
        lang={lang}
        state={state}
        pictureName={pictureName}
        onTap={tap}
        rightButtons={(row, el) => {
          rightButtons.current[row] = el;
        }}
      />
    </GameFrame>
  );
}
