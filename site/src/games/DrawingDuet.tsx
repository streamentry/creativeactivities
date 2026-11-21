import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { PATTERN_COLORS, colorAt, type PatternColor, type PatternColorInfo } from '../data/pattern-maker';
import type { PlayProps } from '../i18n/play';
import { fill } from '../i18n/play/format';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  PEOPLE,
  canPutBack,
  chooseColor,
  clearSheet,
  colorOf,
  lineCount,
  movePen,
  moveTo,
  newGame,
  passPen,
  penDown,
  penUp,
  putBack,
  takeBackLine,
  togglePen,
  type DuetGame,
  type Person,
  type Point,
  type Stroke,
} from '../lib/games/drawing-duet';
import { GameFrame } from './shared/GameFrame';
import { Icon } from './shared/Icon';
import { sounds } from './shared/sound';

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** A list of distinct ids, each passing [ok]. Reads only: a bad saved value is refused, never repaired. */
const isIdList = (v: unknown, ok: (id: string) => boolean): v is string[] =>
  Array.isArray(v) && v.every((id) => typeof id === 'string' && ok(id)) && new Set(v).size === v.length;

const isPerson = (v: unknown): v is Person => v === 0 || v === 1;
const isPaletteValue = (v: unknown): v is PatternColor => PATTERN_COLORS.some((c) => c.index === v);
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** A point that lies on the drawing. */
const onCanvas = (p: unknown): p is Point => {
  if (!isRecord(p)) return false;
  const { x, y } = p;
  return finite(x) && finite(y) && x >= 0 && x <= CANVAS_WIDTH && y >= 0 && y <= CANVAS_HEIGHT;
};

function parseStroke(s: unknown): Stroke | null {
  if (!isRecord(s)) return null;
  const { person, color, width, points } = s;
  if (!isPerson(person) || !isPaletteValue(color) || !finite(width) || width <= 0 || width > 200) return null;
  if (!Array.isArray(points) || points.length === 0 || !points.every(onCanvas)) return null;
  return { person, color, width, points: [...points] };
}

function parseStrokes(list: unknown): Stroke[] | null {
  if (!Array.isArray(list)) return null;
  const out: Stroke[] = [];
  for (const item of list) {
    const stroke = parseStroke(item);
    if (!stroke) return null;
    out.push(stroke);
  }
  return out;
}

/** The saved drawing, or null when this game cannot show it. */
function parseGame(b: unknown): DuetGame | null {
  if (!isRecord(b)) return null;
  const { strokes, turn, colors, pen, undo } = b;
  const drawn = parseStrokes(strokes);
  const kept = undo === null ? null : parseStrokes(undo);
  if (!drawn || (undo !== null && !kept) || !isPerson(turn)) return null;
  if (!Array.isArray(colors) || colors.length !== 2) return null;
  const [first, second] = colors;
  if (!isPaletteValue(first) || !isPaletteValue(second)) return null;
  if (!isRecord(pen)) return null;
  const { x, y, down } = pen;
  if (!onCanvas({ x, y }) || typeof down !== 'boolean') return null;
  return { strokes: drawn, turn, colors: [first, second], pen: { x: x as number, y: y as number, down }, undo: kept };
}

/** A small shape in a color, so the color is also known by its shape. */
function Shape({ color }: { color: PatternColorInfo }) {
  return <span className="cbn__shape" data-shape={color.shape} aria-hidden="true" />;
}

/** Arrow keys and the step each one moves the pen dot by, as -1, 0 or 1 on each axis. */
const ARROWS: Readonly<Record<string, readonly [-1 | 0 | 1, -1 | 0 | 1]>> = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
};

/** The lines of the stroke, in the canvas's own units, in the stroke's color. */
function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke): void {
  const [first, ...rest] = stroke.points;
  if (!first) return;
  const color = colorAt(stroke.color).hex;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = stroke.width;
  ctx.beginPath();
  if (rest.length === 0) {
    ctx.arc(first.x, first.y, stroke.width / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.moveTo(first.x, first.y);
  for (const p of rest) ctx.lineTo(p.x, p.y);
  ctx.stroke();
}

/** The pen dot: a ring when the pen is up, a ring with a filled center when it is down, so the state is not told by color alone. */
function drawPen(ctx: CanvasRenderingContext2D, pen: Point & { down: boolean }, ink: string, paper: string): void {
  ctx.beginPath();
  ctx.arc(pen.x, pen.y, 11, 0, Math.PI * 2);
  ctx.lineWidth = 3;
  ctx.strokeStyle = ink;
  ctx.fillStyle = paper;
  ctx.fill();
  ctx.stroke();
  if (pen.down) {
    ctx.beginPath();
    ctx.arc(pen.x, pen.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = ink;
    ctx.fill();
  }
}

/**
 * Paint the whole picture from its data. The background and ink come from the
 * canvas's CSS tokens, and the stroke colors from the shared palette, so no color is
 * written here. Drawing from data every time means Take back and Put it back are exact.
 */
function paint(el: HTMLCanvasElement | null, game: DuetGame, showPen: boolean): void {
  const ctx = el?.getContext('2d');
  if (!el || !ctx) return;
  const scale = el.width / CANVAS_WIDTH;
  const css = getComputedStyle(el);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = css.backgroundColor;
  ctx.fillRect(0, 0, el.width, el.height);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const stroke of game.strokes) drawStroke(ctx, stroke);
  if (showPen) drawPen(ctx, game.pen, css.color, css.backgroundColor);
}

/**
 * Drawing duet (GAME-032): two people share one canvas and take turns to draw
 * lines, each in a color of their own. The turn is always shown in words with the
 * color's name and shape. Nothing is scored, counted, timed, ranked or sent; the
 * picture can be saved to the device on purpose, or printed.
 */
export default function DrawingDuet(props: PlayProps) {
  const { ui, lang } = props;
  const [game, setGame] = useState<DuetGame>(newGame);
  // Every change starts from the latest game kept here, so a fast pointer or two quick key presses both land.
  const latest = useRef(game);
  const [message, setMessage] = useState('');
  const [picture, setPicture] = useState<string | null>(null);
  const pictureUrl = useRef<string | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const focused = useRef(false);
  // A line drawn by pointer ends when that pointer lifts; keyboard lines are ended by the Space key.
  const dragging = useRef(false);
  const pickId = useId();
  const keysId = useId();

  const colorName = (c: PatternColor) => ui.drawingDuet.colors[c] ?? '';
  const personName = (p: Person) => ui.drawingDuet.people[p] ?? '';

  // Redraw from the data right away, inside the handler that changed it.
  const draw = (next: DuetGame) => {
    latest.current = next;
    paint(canvas.current, next, focused.current);
  };

  const dropPicture = () => {
    if (pictureUrl.current) URL.revokeObjectURL(pictureUrl.current);
    pictureUrl.current = null;
    setPicture(null);
  };

  const commit = (next: DuetGame) => {
    // A saved picture no longer matches once the lines change, so its link goes.
    if (next.strokes !== latest.current.strokes) dropPicture();
    draw(next);
    setGame(next);
  };

  // Draw the picture at the canvas's real size, and again whenever that size changes.
  useEffect(() => {
    const el = canvas.current;
    if (!el) return undefined;
    const size = () => {
      const width = el.clientWidth;
      if (width === 0) return;
      el.width = Math.round(width * (window.devicePixelRatio || 1));
      el.height = Math.round((el.width * CANVAS_HEIGHT) / CANVAS_WIDTH);
      paint(el, latest.current, focused.current);
    };
    size();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(size);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(
    () => () => {
      if (pictureUrl.current) URL.revokeObjectURL(pictureUrl.current);
    },
    [],
  );

  const toPoint = (e: PointerEvent<HTMLCanvasElement>): Point => {
    const box = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - box.left) / box.width) * CANVAS_WIDTH,
      y: ((e.clientY - box.top) / box.height) * CANVAS_HEIGHT,
    };
  };

  const pointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    commit(penDown(latest.current, toPoint(e)));
  };

  const pointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!dragging.current) return;
    draw(moveTo(latest.current, toPoint(e)));
  };

  const pointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    commit(penUp(latest.current));
  };

  const keyDown = (e: KeyboardEvent<HTMLCanvasElement>) => {
    const arrow = ARROWS[e.key];
    if (arrow) {
      e.preventDefault();
      draw(movePen(latest.current, arrow[0], arrow[1]));
      return;
    }
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      const { game: after, down } = togglePen(latest.current);
      commit(after);
      setMessage(down ? ui.drawingDuet.penDown : ui.drawingDuet.penUp);
    }
  };

  const focus = () => {
    focused.current = true;
    draw(latest.current);
  };

  const blur = () => {
    focused.current = false;
    draw(latest.current);
  };

  const pass = () => {
    sounds.tap();
    const after = passPen(latest.current);
    commit(after);
    setMessage(fill(ui.drawingDuet.passed, { person: personName(after.turn) }, lang));
  };

  const takeBack = () => {
    const { game: after, removed } = takeBackLine(latest.current);
    if (!removed) {
      commit(after);
      setMessage(fill(ui.drawingDuet.noLine, { person: personName(after.turn) }, lang));
      return;
    }
    sounds.tap();
    commit(after);
    setMessage(fill(ui.drawingDuet.tookBack, { person: personName(removed.person) }, lang));
  };

  const restart = () => {
    commit(clearSheet(latest.current));
    setMessage(ui.drawingDuet.restarted);
  };

  // The button disappears once there is nothing to put back, so focus goes to the drawing, never lost.
  const bringBack = () => {
    const { game: after, restored } = putBack(latest.current);
    if (!restored) return;
    sounds.tap();
    commit(after);
    setMessage(ui.drawingDuet.restored);
    canvas.current?.focus();
  };

  const save = () => {
    const el = canvas.current;
    if (!el) return;
    el.toBlob((blob) => {
      if (!blob) return;
      if (pictureUrl.current) URL.revokeObjectURL(pictureUrl.current);
      const url = URL.createObjectURL(blob);
      pictureUrl.current = url;
      setPicture(url);
      setMessage(ui.drawingDuet.saved);
    }, 'image/png');
  };

  const print = () => {
    sounds.tap();
    window.print();
  };

  const turn = game.turn;
  const turnColor = colorAt(colorOf(game, turn));
  const lines = lineCount(game);
  const label = fill(lines === 1 ? ui.drawingDuet.canvasLabelOne : ui.drawingDuet.canvasLabel, { n: lines }, lang);

  return (
    <>
      <GameFrame
        ui={ui}
        lang={lang}
        guidance={ui.drawingDuet.guidance}
        message={message}
        onRestart={restart}
        footer={
          <div className="btn-row btn-row--center">
            <button type="button" className="btn" onClick={pass}>
              <Icon name="arrow" />
              {ui.drawingDuet.pass}
            </button>
            <button type="button" className="btn" onClick={takeBack}>
              <Icon name="back" />
              {ui.drawingDuet.takeBack}
            </button>
            {canPutBack(game) ? (
              <button type="button" className="btn" onClick={bringBack}>
                <Icon name="back" />
                {ui.drawingDuet.putBack}
              </button>
            ) : null}
            <button type="button" className="btn" onClick={save}>
              <Icon name="photo" />
              {ui.drawingDuet.save}
            </button>
            {picture ? (
              <a className="btn" href={picture} download="drawing-duet.png">
                <Icon name="book" />
                {ui.drawingDuet.download}
              </a>
            ) : null}
            <button type="button" className="btn btn--primary btn--hero" onClick={print}>
              <Icon name="print" />
              {ui.drawingDuet.print}
            </button>
          </div>
        }
        place={{
          slug: 'drawing-duet',
          save: () => game,
          check: (b) => parseGame(b) !== null,
          restore: (b) => {
            const saved = parseGame(b);
            if (!saved) return;
            commit(penUp(saved));
            setMessage('');
          },
        }}
      >
        <div className="dd">
          <div className="dd__players">
            {PEOPLE.map((person) => {
              const mine = colorOf(game, person);
              return (
                <fieldset key={person} className="dd__player" data-turn={turn === person ? 'yes' : undefined}>
                  <legend className="dd__legend">{fill(ui.drawingDuet.colorLegend, { person: personName(person) }, lang)}</legend>
                  <div className="dd__picks">
                    {PATTERN_COLORS.map((color) => (
                      <label key={color.index} className="dd__pick" data-tone={color.index}>
                        <input
                          type="radio"
                          name={`${pickId}-${person}`}
                          value={color.index}
                          checked={color.index === mine}
                          onChange={() => {
                            const { game: after, changed } = chooseColor(latest.current, person, color.index);
                            if (!changed) return;
                            sounds.tap();
                            commit(after);
                          }}
                        />
                        <span className="dd__face">
                          <span className="dd__swatch" aria-hidden="true">
                            <Shape color={color} />
                          </span>
                          <span className="dd__name">{colorName(color.index)}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              );
            })}
          </div>
          <div className="dd__turn" data-tone={turnColor.index}>
            <span className="dd__swatch" aria-hidden="true">
              <Shape color={turnColor} />
            </span>
            <div>
              <p className="dd__turn-line">{fill(ui.drawingDuet.turn, { person: personName(turn) }, lang)}</p>
              <p className="dd__turn-color">{fill(ui.drawingDuet.penColor, { color: colorName(turnColor.index) }, lang)}</p>
            </div>
          </div>
          <div className="dd__board">
            <canvas
              ref={canvas}
              className="dd__canvas"
              role="img"
              tabIndex={0}
              aria-label={label}
              aria-describedby={keysId}
              onPointerDown={pointerDown}
              onPointerMove={pointerMove}
              onPointerUp={pointerUp}
              onPointerCancel={pointerUp}
              onKeyDown={keyDown}
              onFocus={focus}
              onBlur={blur}
            />
          </div>
          <p id={keysId} className="dd__keys">
            {ui.drawingDuet.keys}
          </p>
        </div>
      </GameFrame>
      <section className="sheet dd-sheet" aria-hidden="true">
        <h2>{ui.drawingDuet.sheetTitle}</h2>
        <p className="dd-sheet__rules">{ui.drawingDuet.paperRules}</p>
        <div className="dd-sheet__frame" />
      </section>
    </>
  );
}
