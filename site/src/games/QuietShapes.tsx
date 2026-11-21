import { useRef, useState } from 'react';
import type { PlayProps } from '../i18n/play';
import { fill } from '../i18n/play/format';
import { SAFETY_FLAG_LABELS } from '../lib/activities';
import {
  CELL,
  PRINT_MM_PER_UNIT,
  choosePiece,
  clipClass,
  isComplete,
  localPoints,
  PUZZLES,
  nextPuzzle,
  newGame,
  puzzleOf,
  putBack,
  setHints,
  shapeSize,
  spaceBox,
  spacePoints,
  startAgain,
  tapSpace,
  tray,
  viewBoxOf,
  type Outcome,
  type Pt,
  type QuietGame,
  type Result,
  type Space,
  type ShapeType,
} from '../lib/games/quiet-shapes';
import { GameFrame } from './shared/GameFrame';
import { Icon } from './shared/Icon';
import { sounds } from './shared/sound';

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * The saved picture, or null unless it is a known puzzle with each placed piece in a space of its own shape, no piece
 * placed twice, and a chosen piece that is not already placed. Optional fields (before, chosen) must be null or valid.
 */
function parseQuiet(b: unknown): QuietGame | null {
  if (!isRecord(b)) return null;
  const { puzzle, placed, chosen, hints, before } = b;
  if (typeof puzzle !== 'number' || !Number.isInteger(puzzle)) return null;
  const data = PUZZLES[puzzle];
  if (!data) return null;
  const count = data.spaces.length;
  const isPiece = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < count;
  const slots = (list: unknown): (number | null)[] | null => {
    if (!Array.isArray(list) || list.length !== count) return null;
    const out: (number | null)[] = [];
    for (const v of list) {
      if (v === null) out.push(null);
      else if (isPiece(v)) out.push(v);
      else return null;
    }
    return out;
  };
  const now = slots(placed);
  if (!now) return null;
  const used = now.filter((p): p is number => p !== null);
  if (new Set(used).size !== used.length) return null;
  for (let space = 0; space < count; space++) {
    const piece = now[space] ?? null;
    if (piece !== null && data.spaces[piece]?.type !== data.spaces[space]?.type) return null;
  }
  if (chosen !== null && !isPiece(chosen)) return null;
  const pick = isPiece(chosen) ? chosen : null;
  if (pick !== null && used.includes(pick)) return null;
  if (typeof hints !== 'boolean') return null;
  const older = before === null ? null : slots(before);
  if (before !== null && !older) return null;
  return { puzzle, placed: now, chosen: pick, hints, before: older };
}

const pointsAttr = (points: readonly Pt[]): string => points.map(([x, y]) => `${x},${y}`).join(' ');

/** A space as a piece lies in the tray: turned to its first position, with its top-left corner at 0, 0. */
const trayPiece = (type: ShapeType): Space => ({ type, turn: 0, col: 0, row: 0 });

/**
 * Quiet shapes puzzle (GAME-060). A picture outline is made of spaces; a tapped piece snaps into a space of the
 * same shape, and the space sets its turn, so nothing is dragged or turned. Nothing is timed, scored or counted,
 * and a piece of another shape is refused with a calm line. The paper version prints the same picture: its
 * outline with the hint lines, and the pieces at the same scale beside it.
 */
export default function QuietShapes(props: PlayProps) {
  const { ui, lang } = props;
  const text = ui.quietShapes;
  const [game, setGame] = useState<QuietGame>(() => newGame(0));
  // Taps can arrive faster than the page redraws, so every tap starts from the latest game kept here.
  const latest = useRef(game);
  const [message, setMessage] = useState('');

  const puzzle = puzzleOf(game);
  const picture = text.pictures[puzzle.id] ?? '';
  const box = viewBoxOf(puzzle);
  const pieces = tray(game);
  const complete = isComplete(game);
  const pieceName = (type: ShapeType): string => text.pieces[type] ?? '';
  const shapeName = (type: ShapeType): string => text.shapes[type] ?? '';

  const lineFor = (outcome: Outcome, next: QuietGame, n: number, piece: string): string => {
    const name = text.pictures[puzzleOf(next).id] ?? '';
    switch (outcome) {
      case 'chosen':
        return fill(text.chosen, { piece }, lang);
      case 'unchosen':
        return text.unchosen;
      case 'placed':
        return fill(text.placed, { n }, lang);
      case 'complete':
        return fill(text.complete, { picture: name }, lang);
      case 'different':
        return text.different;
      case 'needPiece':
        return text.needPiece;
      case 'filled':
        return text.filled;
      case 'tookBack':
        return text.tookBack;
      case 'cleared':
        return text.cleared;
      case 'restored':
        return text.restored;
      case 'next':
        return fill(text.next, { picture: name }, lang);
      default:
        return '';
    }
  };

  /** Keep the new game and say what happened. A tap that changes nothing keeps the last message. */
  const update = (result: Result, n = 0, piece = '') => {
    latest.current = result.game;
    setGame(result.game);
    const line = lineFor(result.outcome, result.game, n, piece);
    if (line) setMessage(line);
  };

  const choose = (piece: number) => {
    const result = choosePiece(latest.current, piece);
    if (result.outcome === 'outside') return;
    sounds.tap();
    const type = puzzleOf(result.game).spaces[piece]?.type;
    update(result, 0, type ? pieceName(type) : '');
  };

  const tapAt = (space: number) => {
    const result = tapSpace(latest.current, space);
    if (result.outcome === 'outside') return;
    if (result.outcome === 'placed' || result.outcome === 'complete' || result.outcome === 'tookBack') sounds.tap();
    update(result, space + 1);
  };

  const restart = () => update(startAgain(latest.current));
  const restore = () => update(putBack(latest.current));
  const another = () => update(nextPuzzle(latest.current));
  const toggleHints = (on: boolean) => {
    const next = setHints(latest.current, on);
    latest.current = next;
    setGame(next);
  };
  const print = () => {
    sounds.tap();
    window.print();
  };

  const spaceLabel = (space: Space, i: number): string => {
    const values = { n: i + 1, shape: shapeName(space.type) };
    return fill(game.placed[i] === null ? text.spaceEmpty : text.spaceFilled, values, lang);
  };

  return (
    <>
      <GameFrame
        ui={ui}
        lang={lang}
        guidance={ui.quietShapes.guidance}
        message={message}
        options={
          <label className="qs__hints">
            <input type="checkbox" checked={game.hints} onChange={(event) => toggleHints(event.currentTarget.checked)} />
            <span>{text.hints}</span>
          </label>
        }
        onRestart={restart}
        place={{
          slug: 'quiet-shapes',
          save: () => ({
            puzzle: latest.current.puzzle,
            placed: latest.current.placed,
            chosen: latest.current.chosen,
            hints: latest.current.hints,
            before: latest.current.before,
          }),
          check: (b) => parseQuiet(b) !== null,
          restore: (b) => {
            const saved = parseQuiet(b);
            if (!saved) return;
            latest.current = saved;
            setGame(saved);
            setMessage('');
          },
        }}
        footer={
          <div className="btn-row btn-row--center">
            {game.before !== null ? (
              <button type="button" className="btn" onClick={restore}>
                {text.putBack}
              </button>
            ) : null}
            <button type="button" className="btn" onClick={another}>
              {text.another}
            </button>
            <button type="button" className="btn btn--primary btn--hero" onClick={print}>
              <Icon name="print" />
              {text.print}
            </button>
          </div>
        }
      >
        <div className="qs">
          <p className="qs__picture">{fill(text.pictureLine, { picture }, lang)}</p>
          {complete ? <p className="qs__done">{fill(text.complete, { picture }, lang)}</p> : null}

          <div className="qs__outline" role="group" aria-label={fill(text.outlineLabel, { picture }, lang)}>
            <svg className="qs__art" viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`} focusable="false" role="none">
              {puzzle.spaces.map((space, i) => (
                <polygon key={`edge-${i}`} aria-hidden="true" className="qs__edge" points={pointsAttr(spacePoints(space))} />
              ))}
              {puzzle.spaces.map((space, i) => (
                <polygon key={`area-${i}`} aria-hidden="true" className="qs__area" data-shape={space.type} data-state={game.placed[i] === null ? 'empty' : 'filled'} points={pointsAttr(spacePoints(space))} />
              ))}
              {game.hints
                ? puzzle.spaces.map((space, i) => <polygon key={`hint-${i}`} aria-hidden="true" className="qs__hint" points={pointsAttr(spacePoints(space))} />)
                : null}
              {puzzle.spaces.map((space, i) => {
                const b = spaceBox(space);
                return (
                  <foreignObject key={`space-${i}`} x={b.x} y={b.y} width={b.w} height={b.h}>
                    <div className="qs__cell">
                      <button
                        type="button"
                        className={`qs__hit ${clipClass(space.type, space.turn)}`}
                        data-state={game.placed[i] === null ? 'empty' : 'filled'}
                        onClick={() => tapAt(i)}
                        aria-label={spaceLabel(space, i)}
                      />
                      <svg className="qs__ring" viewBox={`0 0 ${b.w} ${b.h}`} focusable="false" aria-hidden="true">
                        <polygon points={pointsAttr(localPoints(space))} />
                      </svg>
                    </div>
                  </foreignObject>
                );
              })}
            </svg>
          </div>

          <section className="qs__tray-section" aria-labelledby="qs-tray">
            <h2 id="qs-tray">{text.trayHeading}</h2>
            <ul className="qs__tray">
              {pieces.map((i) => {
                const space = puzzle.spaces[i] as Space;
                const piece = trayPiece(space.type);
                const { w, h } = shapeSize(space.type, 0);
                const chosen = game.chosen === i;
                return (
                  <li key={i}>
                    <button
                      type="button"
                      className="qs__piece"
                      aria-pressed={chosen}
                      data-chosen={chosen ? 'yes' : undefined}
                      onClick={() => choose(i)}
                    >
                      <svg className="qs__piece-art" viewBox={`0 0 ${w * CELL} ${h * CELL}`} focusable="false" aria-hidden="true">
                        <polygon data-shape={space.type} points={pointsAttr(localPoints(piece))} />
                      </svg>
                      <span className="qs__piece-name">{pieceName(space.type)}</span>
                      {chosen ? <span className="qs__chosen">{text.chosenLabel}</span> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </GameFrame>

      <section className="sheet qs-sheet" aria-hidden="true">
        <h2>{text.sheetTitle}</h2>
        <p className="qs-sheet__picture">{fill(text.pictureLine, { picture }, lang)}</p>
        <svg
          className="qs-sheet__outline"
          width={`${(box.w * PRINT_MM_PER_UNIT).toFixed(2)}mm`}
          height={`${(box.h * PRINT_MM_PER_UNIT).toFixed(2)}mm`}
          viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
          focusable="false"
        >
          {puzzle.spaces.map((space, i) => (
            <polygon key={`line-${i}`} className="qs-sheet__line" points={pointsAttr(spacePoints(space))} />
          ))}
        </svg>
        <p className="qs-sheet__label">{text.sheetPieces}</p>
        <ul className="qs-sheet__pieces">
          {puzzle.spaces.map((space, i) => {
            const piece = trayPiece(space.type);
            const { w, h } = shapeSize(space.type, 0);
            return (
              <li key={i}>
                <svg
                  className="qs-sheet__piece"
                  width={`${(w * CELL * PRINT_MM_PER_UNIT).toFixed(2)}mm`}
                  height={`${(h * CELL * PRINT_MM_PER_UNIT).toFixed(2)}mm`}
                  viewBox={`0 0 ${w * CELL} ${h * CELL}`}
                  focusable="false"
                >
                  <polygon className="qs-sheet__line" points={pointsAttr(localPoints(piece))} />
                </svg>
                <span>{pieceName(space.type)}</span>
              </li>
            );
          })}
        </ul>
        <p className="qs-sheet__how">{text.sheetHow}</p>
        <p className="qs-sheet__safety">{SAFETY_FLAG_LABELS['sharp-tool']}</p>
      </section>
    </>
  );
}
