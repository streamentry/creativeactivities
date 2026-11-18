import { useRef, useState } from 'react';
import { GRID_SIZES, NUMBER_COLORS, colorOf, type CellValue, type ColorNumber, type GridSize, type NumberColor } from '../data/color-by-number';
import type { PlayProps } from '../i18n/play';
import { fill } from '../i18n/play/format';
import {
  anotherPicture,
  boardOf,
  chooseColor,
  chooseSize,
  clearBoard,
  fillWithNumbers,
  isAllFilled,
  isSheetPicture,
  motifOf,
  newGame,
  numberAt,
  paintCell,
  placeOf,
  type Board,
  type ColorGame,
} from '../lib/games/color-by-number';
import { ChoiceChips } from './shared/ChoiceChips';
import { GameFrame } from './shared/GameFrame';
import { Icon } from './shared/Icon';
import { moveInGrid } from './shared/gridKeys';
import { sounds } from './shared/sound';

/** A small shape beside a color, so the color is also known by its shape. */
export function ColorShape({ shape }: { shape: NumberColor['shape'] }) {
  return <span className="cbn__shape" data-shape={shape} aria-hidden="true" />;
}

/**
 * Color by number (GAME-031): a square grid of large cells, each with a number.
 * Choose a color from the key, then tap cells to fill them. Any color may go in
 * any cell; when every cell has the color of its number the grid is the picture
 * on the sheet. Nothing is counted or timed, and a different color is never
 * called anything but the player's own.
 */
export default function ColorByNumber(props: PlayProps) {
  const { ui, lang } = props;
  const [game, setGame] = useState<ColorGame>(newGame);
  // Taps can arrive faster than the page redraws (a shaky hand, a double tap), so every tap starts from the
  // latest game kept here, never from the one the last redraw saw.
  const latest = useRef(game);
  const [message, setMessage] = useState('');
  const grid = useRef<HTMLDivElement>(null);

  const commit = (next: ColorGame) => {
    latest.current = next;
    setGame(next);
  };

  const { size, brush } = game;
  const board = boardOf(game);
  const colorName = (n: CellValue) => (n === 0 ? ui.colorByNumber.empty : (ui.colorByNumber.colors[n - 1] ?? ''));

  // What to say once a grid is full: the picture on the sheet, or the player's own, never a verdict.
  const finish = (after: ColorGame): string | undefined => {
    const b = boardOf(after);
    if (isSheetPicture(after.size, b)) return fill(ui.colorByNumber.sheet, { name: ui.colorByNumber.motifs[motifOf(after.size, b).id as keyof typeof ui.colorByNumber.motifs] ?? '' }, lang);
    return isAllFilled(b) ? ui.colorByNumber.own : undefined;
  };

  const pick = (n: ColorNumber) => {
    sounds.tap();
    commit(chooseColor(latest.current, n));
    setMessage(fill(ui.colorByNumber.chose, { name: colorName(n) }, lang));
  };

  const paint = (index: number) => {
    const before = latest.current;
    const { game: after, result } = paintCell(before, index);
    if (result !== 'filled') return;
    sounds.tap();
    commit(after);
    const place = placeOf(before.size, index);
    const full = finish(after);
    if (full) sounds.done();
    setMessage(full ?? fill(ui.colorByNumber.painted, { name: colorName(before.brush), row: place.row, column: place.column }, lang));
  };

  const fillAll = () => {
    const after = fillWithNumbers(latest.current);
    sounds.tap();
    commit(after);
    setMessage(finish(after) ?? ui.colorByNumber.filledAll);
  };

  const clear = () => {
    sounds.tap();
    commit(clearBoard(latest.current));
    setMessage(ui.colorByNumber.cleared);
  };

  const next = () => {
    sounds.tap();
    commit(anotherPicture(latest.current));
    setMessage(ui.colorByNumber.fresh);
  };

  const changeSize = (n: GridSize) => {
    commit(chooseSize(latest.current, n));
    setMessage('');
  };

  const sizes = GRID_SIZES.map((n) => ({ value: n, label: fill(ui.colorByNumber.size, { n }, lang) }));
  const done = isSheetPicture(size, board);

  return (
    <GameFrame
      ui={ui}
      lang={lang}
      guidance={ui.colorByNumber.guidance}
      message={message}
      options={<ChoiceChips legend={ui.colorByNumber.sizeLegend} choices={sizes} value={size} onChange={changeSize} />}
      footer={
        <div className="btn-row btn-row--center">
          <button type="button" className="btn" onClick={fillAll}>
            {ui.colorByNumber.fillAll}
          </button>
          <button type="button" className="btn" onClick={clear}>
            {ui.colorByNumber.clear}
          </button>
          <button type="button" className={done ? 'btn btn--primary btn--hero' : 'btn'} onClick={next}>
            {ui.colorByNumber.next}
          </button>
        </div>
      }
    >
      <div className="cbn">
        <div className="cbn__key" role="group" aria-label={ui.colorByNumber.keyLegend}>
          {NUMBER_COLORS.map((color) => (
            <button
              key={color.number}
              type="button"
              className="cbn__key-button"
              data-fill={color.number}
              aria-pressed={brush === color.number}
              onClick={() => pick(color.number)}
            >
              <span className="cbn__swatch" aria-hidden="true">
                <ColorShape shape={color.shape} />
              </span>
              <span className="cbn__key-number">{color.number}</span>
              <span className="cbn__key-name">{colorName(color.number)}</span>
              {brush === color.number ? <Icon name="check" size={22} /> : null}
            </button>
          ))}
        </div>
        <div className="cbn__region" role="region" aria-label={fill(ui.colorByNumber.region, { n: size }, lang)} tabIndex={0}>
          <div ref={grid} className="cbn__grid" data-size={size} onKeyDown={(event) => moveInGrid(event, grid.current, size)}>
            {board.cells.map((cell, index) => (
              <Cell key={index} index={index} size={size} board={board} cell={cell} text={props} onTap={() => paint(index)} colorName={colorName} />
            ))}
          </div>
        </div>
      </div>
    </GameFrame>
  );
}

export interface CellProps {
  index: number;
  size: GridSize;
  board: Board;
  cell: CellValue;
  text: PlayProps;
  colorName: (n: CellValue) => string;
  onTap: () => void;
}

/** One cell: a native button that says its number, its place and the color it holds. */
export function Cell({ index, size, board, cell, text, colorName, onTap }: CellProps) {
  const { ui, lang } = text;
  const number = numberAt(size, board, index);
  const place = placeOf(size, index);
  const held = cell === 0 ? undefined : colorOf(cell);
  return (
    <button
      type="button"
      className="cbn__cell"
      data-index={index}
      data-fill={held?.number}
      onClick={onTap}
      aria-label={fill(ui.colorByNumber.cell, { number, row: place.row, column: place.column, color: colorName(cell) }, lang)}
    >
      <span className="cbn__number" aria-hidden="true">
        {number}
      </span>
      {held ? <ColorShape shape={held.shape} /> : null}
    </button>
  );
}
