import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { PATTERN_COLORS, colorAt, type PatternColor, type PatternColorInfo } from '../data/pattern-maker';
import type { PlayProps } from '../i18n/play';
import { fill } from '../i18n/play/format';
import {
  BRUSH_SIZES,
  BRUSH_WIDTH,
  PAGE_HEIGHT,
  PAGE_WIDTH,
  WASH_OPACITY,
  canPutBack,
  chooseColor,
  isBrushSize,
  isColor,
  chooseSize,
  freshPage,
  liftBrush,
  moveBrushTo,
  newPage,
  putBack,
  putBrushDown,
  stepBrush,
  toggleBrush,
  type BrushSize,
  type Point,
  type Wash,
  type WashPage,
} from '../lib/games/color-wash';
import { GameFrame } from './shared/GameFrame';
import { Icon } from './shared/Icon';
import { sounds } from './shared/sound';

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Limits on a saved page, so a damaged or oversized value is ignored rather than loaded. */
const MAX_WASHES = 2000;
const MAX_POINTS = 5000;

function parsePoint(v: unknown): Point | null {
  if (!isRecord(v)) return null;
  const { x, y } = v;
  if (typeof x !== 'number' || typeof y !== 'number' || !Number.isFinite(x) || !Number.isFinite(y)) return null;
  if (x < 0 || x > PAGE_WIDTH || y < 0 || y > PAGE_HEIGHT) return null;
  return { x, y };
}

function parseWashes(list: unknown): Wash[] | null {
  if (!Array.isArray(list) || list.length > MAX_WASHES) return null;
  const out: Wash[] = [];
  for (const item of list) {
    if (!isRecord(item)) return null;
    const { color, width, points } = item;
    if (typeof color !== 'number' || !isColor(color)) return null;
    if (typeof width !== 'number' || !(Object.values(BRUSH_WIDTH) as number[]).includes(width)) return null;
    if (!Array.isArray(points) || points.length === 0 || points.length > MAX_POINTS) return null;
    const checked: Point[] = [];
    for (const p of points) {
      const point = parsePoint(p);
      if (!point) return null;
      checked.push(point);
    }
    out.push({ color, width, points: checked });
  }
  return out;
}

/** The saved page, or null unless every wash, the color, size, brush and undo are valid. The brush always comes back up. */
function parseWashPage(b: unknown): WashPage | null {
  if (!isRecord(b)) return null;
  const { washes, color, size, brush, undo } = b;
  const list = parseWashes(washes);
  if (!list) return null;
  if (typeof color !== 'number' || !isColor(color)) return null;
  if (typeof size !== 'string' || !isBrushSize(size)) return null;
  const at = parsePoint(brush);
  if (!at) return null;
  const before = undo === null ? null : parseWashes(undo);
  if (undo !== null && !before) return null;
  return { washes: list, color, size, brush: { x: at.x, y: at.y, down: false }, undo: before };
}

/** A small shape in a color, so the color is also known by its shape. */
function Shape({ color }: { color: PatternColorInfo }) {
  return <span className="cbn__shape" data-shape={color.shape} aria-hidden="true" />;
}

/** Arrow keys and the step each one moves the brush ring by, as -1, 0 or 1 on each axis. */
const ARROWS: Readonly<Record<string, readonly [-1 | 0 | 1, -1 | 0 | 1]>> = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
};

/**
 * One wash, drawn as a single wide line with round ends at low opacity. A single
 * path does not darken where it crosses itself, so the wash is even in tone.
 */
function drawWash(ctx: CanvasRenderingContext2D, wash: Wash): void {
  const [first, ...rest] = wash.points;
  if (!first) return;
  const color = colorAt(wash.color).hex;
  ctx.globalAlpha = WASH_OPACITY;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = wash.width;
  ctx.beginPath();
  if (rest.length === 0) {
    ctx.arc(first.x, first.y, wash.width / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.moveTo(first.x, first.y);
    for (const p of rest) ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/** The brush ring: its size is the width of the next wash. A filled center shows the brush is down. */
function drawBrush(ctx: CanvasRenderingContext2D, page: WashPage, ink: string): void {
  const { brush } = page;
  ctx.beginPath();
  ctx.arc(brush.x, brush.y, BRUSH_WIDTH[page.size] / 2, 0, Math.PI * 2);
  ctx.lineWidth = 3;
  ctx.strokeStyle = ink;
  ctx.stroke();
  if (brush.down) {
    ctx.beginPath();
    ctx.arc(brush.x, brush.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = ink;
    ctx.fill();
  }
}

/**
 * Paint the whole page from its data. The background and ink come from the canvas's
 * CSS tokens and the wash colors from the shared palette, so no color is written here.
 * Drawing from data every time means Put it back is exact.
 */
function paint(el: HTMLCanvasElement | null, page: WashPage, showBrush: boolean): void {
  const ctx = el?.getContext('2d');
  if (!el || !ctx) return;
  const scale = el.width / PAGE_WIDTH;
  const css = getComputedStyle(el);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = css.backgroundColor;
  ctx.fillRect(0, 0, el.width, el.height);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const wash of page.washes) drawWash(ctx, wash);
  if (showBrush) drawBrush(ctx, page, css.color);
}

/**
 * Color wash (GAME-038): one soft brush paints across one page, in four calm colors
 * and two wide brush sizes. There is no end point, no score, no timer and no count,
 * and nothing is saved, sent or printed. The only messages are neutral.
 */
export default function ColorWash(props: PlayProps) {
  const { ui, lang } = props;
  const [page, setPage] = useState<WashPage>(newPage);
  // Every change starts from the latest page kept here, so a fast pointer or two quick key presses both land.
  const latest = useRef(page);
  const [message, setMessage] = useState('');
  const canvas = useRef<HTMLCanvasElement>(null);
  const focused = useRef(false);
  // A wash drawn by pointer ends when that pointer lifts; keyboard washes end with the Space key.
  const dragging = useRef(false);
  const pickId = useId();
  const sizeId = useId();
  const keysId = useId();

  const colorName = (c: PatternColor) => ui.colorWash.colors[c] ?? '';

  // Redraw from the data right away, inside the handler that changed it.
  const draw = (next: WashPage) => {
    latest.current = next;
    paint(canvas.current, next, focused.current);
  };

  const commit = (next: WashPage) => {
    draw(next);
    setPage(next);
  };

  // Draw the page at the canvas's real size, and again whenever that size changes.
  useEffect(() => {
    const el = canvas.current;
    if (!el) return undefined;
    const size = () => {
      const width = el.clientWidth;
      if (width === 0) return;
      el.width = Math.round(width * (window.devicePixelRatio || 1));
      el.height = Math.round((el.width * PAGE_HEIGHT) / PAGE_WIDTH);
      paint(el, latest.current, focused.current);
    };
    size();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(size);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toPoint = (e: PointerEvent<HTMLCanvasElement>): Point => {
    const box = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - box.left) / box.width) * PAGE_WIDTH,
      y: ((e.clientY - box.top) / box.height) * PAGE_HEIGHT,
    };
  };

  const pointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    commit(putBrushDown(latest.current, toPoint(e)));
  };

  const pointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!dragging.current) return;
    draw(moveBrushTo(latest.current, toPoint(e)));
  };

  const pointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    commit(liftBrush(latest.current));
  };

  const keyDown = (e: KeyboardEvent<HTMLCanvasElement>) => {
    const arrow = ARROWS[e.key];
    if (arrow) {
      e.preventDefault();
      draw(stepBrush(latest.current, arrow[0], arrow[1]));
      return;
    }
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      const { page: after, down } = toggleBrush(latest.current);
      commit(after);
      setMessage(down ? ui.colorWash.brushDown : ui.colorWash.brushUp);
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

  const pickColor = (color: PatternColor) => {
    const { page: after, changed } = chooseColor(latest.current, color);
    if (!changed) return;
    sounds.tap();
    commit(after);
  };

  const pickSize = (size: BrushSize) => {
    const { page: after, changed } = chooseSize(latest.current, size);
    if (!changed) return;
    sounds.tap();
    commit(after);
  };

  // A fresh page is the frame's restart button. It is neutral: no count, no end, no praise.
  const restart = () => {
    commit(freshPage(latest.current));
    setMessage(ui.colorWash.freshMessage);
  };

  // The button disappears once there is nothing to put back, so focus goes to the page, never lost.
  const bringBack = () => {
    const { page: after, restored } = putBack(latest.current);
    if (!restored) return;
    sounds.tap();
    commit(after);
    setMessage(ui.colorWash.restored);
    canvas.current?.focus();
  };

  const turnColor = colorAt(page.color);
  const sizeLabel = ui.colorWash.sizes[page.size];
  const label = ui.colorWash.canvasLabel;

  return (
    <GameFrame
      ui={ui}
      lang={lang}
      guidance={ui.colorWash.guidance}
      message={message}
      onRestart={restart}
      place={{
        slug: 'color-wash',
        save: () => ({
          washes: latest.current.washes,
          color: latest.current.color,
          size: latest.current.size,
          brush: { x: latest.current.brush.x, y: latest.current.brush.y },
          undo: latest.current.undo,
        }),
        check: (b) => parseWashPage(b) !== null,
        restore: (b) => {
          const saved = parseWashPage(b);
          if (!saved) return;
          commit(saved);
          setMessage('');
        },
      }}
      restartLabel={ui.colorWash.fresh}
      footer={
        <div className="btn-row btn-row--center">
          {canPutBack(page) ? (
            <button type="button" className="btn" onClick={bringBack}>
              <Icon name="back" />
              {ui.colorWash.putBack}
            </button>
          ) : null}
        </div>
      }
    >
      <div className="cw">
        <div className="cw__controls">
          <fieldset className="cw__group">
            <legend className="cw__legend">{ui.colorWash.colorLegend}</legend>
            <div className="cw__picks">
              {PATTERN_COLORS.map((color) => (
                <label key={color.index} className="cw__pick" data-tone={color.index}>
                  <input
                    type="radio"
                    name={pickId}
                    value={color.index}
                    checked={color.index === page.color}
                    onChange={() => pickColor(color.index)}
                  />
                  <span className="cw__face">
                    <span className="cw__swatch" aria-hidden="true">
                      <Shape color={color} />
                    </span>
                    <span className="cw__name">{colorName(color.index)}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="cw__group">
            <legend className="cw__legend">{ui.colorWash.sizeLegend}</legend>
            <div className="cw__sizes">
              {BRUSH_SIZES.map((size) => (
                <label key={size} className="cw__size" data-size={size}>
                  <input
                    type="radio"
                    name={sizeId}
                    value={size}
                    checked={size === page.size}
                    onChange={() => pickSize(size)}
                  />
                  <span className="cw__face">
                    <span className="cw__stroke" aria-hidden="true" />
                    <span className="cw__name">{ui.colorWash.sizes[size]}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <p className="cw__now" data-tone={turnColor.index}>
          <span className="cw__swatch" aria-hidden="true">
            <Shape color={turnColor} />
          </span>
          <span>
            {fill(ui.colorWash.color, { color: colorName(turnColor.index) }, lang)} {sizeLabel}.{' '}
            {page.brush.down ? ui.colorWash.brushDown : ui.colorWash.brushUp}
          </span>
        </p>
        <div className="cw__board">
          <canvas
            ref={canvas}
            className="cw__canvas"
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
        <p id={keysId} className="cw__keys">
          {ui.colorWash.keys}
        </p>
      </div>
    </GameFrame>
  );
}
