import { useId, useRef, useState } from 'react';
import { PATTERN_COLORS, REPEATS, TILE_SIZES, colorAt, type PatternColor, type PatternColorInfo, type TileSize } from '../data/pattern-maker';
import type { PlayProps } from '../i18n/play';
import { fill } from '../i18n/play/format';
import {
  canPutBack,
  chooseSize,
  clearTile,
  cycleSquare,
  newGame,
  placeOf,
  putBack,
  repeatTile,
  surprise,
  tileOf,
  type PatternGame,
} from '../lib/games/pattern-maker';
import { createRng, randomSeed } from '../lib/games/random';
import { ChoiceChips } from './shared/ChoiceChips';
import { GameFrame } from './shared/GameFrame';
import { Icon } from './shared/Icon';
import { moveInGrid } from './shared/gridKeys';
import { sounds } from './shared/sound';

/** A small shape in a color, so the color is also known by its shape. The shape is drawn in the square's ink color. */
function Shape({ color }: { color: PatternColorInfo }) {
  return <span className="cbn__shape" data-shape={color.shape} aria-hidden="true" />;
}

/**
 * Pattern maker (GAME-034): one small tile of squares, each tap changing a
 * square to the next of four colors, and "your pattern", the tile repeated in a
 * block beside it. There is no right pattern. Nothing is counted, timed, saved
 * or sent; the only thing that leaves the page is what the person chooses to
 * print.
 */
export default function PatternMaker(props: PlayProps) {
  const { ui, lang } = props;
  const [game, setGame] = useState<PatternGame>(newGame);
  // Taps can arrive faster than the page redraws (a shaky hand, a double tap), so every tap starts from the
  // latest game kept here, never from the one the last redraw saw.
  const latest = useRef(game);
  const [message, setMessage] = useState('');
  const grid = useRef<HTMLDivElement>(null);
  const keyId = useId();

  const commit = (next: PatternGame) => {
    latest.current = next;
    setGame(next);
  };

  const { size } = game;
  const cells = tileOf(game);
  const colorName = (c: PatternColor) => ui.patternMaker.colors[c] ?? '';

  const tap = (index: number) => {
    const before = latest.current;
    const { game: after, color } = cycleSquare(before, index);
    if (color === null) return;
    sounds.tap();
    commit(after);
    const place = placeOf(before.size, index);
    setMessage(fill(ui.patternMaker.changed, { row: place.row, column: place.column, color: colorName(color) }, lang));
  };

  const clear = () => {
    commit(clearTile(latest.current));
    setMessage(ui.patternMaker.cleared);
  };

  const surpriseMe = () => {
    sounds.tap();
    commit(surprise(latest.current, createRng(randomSeed())));
    setMessage(ui.patternMaker.surprised);
  };

  // The button disappears once the tile is back, so focus goes to the first square rather than being lost.
  const bringBack = () => {
    sounds.tap();
    commit(putBack(latest.current));
    setMessage(ui.patternMaker.restored);
    grid.current?.querySelector<HTMLButtonElement>('button[data-index="0"]')?.focus();
  };

  const changeSize = (n: TileSize) => {
    commit(chooseSize(latest.current, n));
    setMessage('');
  };

  const print = () => {
    sounds.tap();
    window.print();
  };

  const sizes = TILE_SIZES.map((n) => ({ value: n, label: fill(ui.patternMaker.size, { n }, lang) }));
  const pattern = repeatTile(cells, size);
  const across = size * REPEATS;

  return (
    <>
      <GameFrame
        ui={ui}
        lang={lang}
        guidance={ui.patternMaker.guidance}
        message={message}
        options={<ChoiceChips legend={ui.patternMaker.sizeLegend} choices={sizes} value={size} onChange={changeSize} />}
        onRestart={clear}
        footer={
          <div className="btn-row btn-row--center">
            <button type="button" className="btn" onClick={surpriseMe}>
              <Icon name="refresh" />
              {ui.patternMaker.surprise}
            </button>
            {canPutBack(game) ? (
              <button type="button" className="btn" onClick={bringBack}>
                <Icon name="back" />
                {ui.patternMaker.putBack}
              </button>
            ) : null}
            <button type="button" className="btn btn--primary btn--hero" onClick={print}>
              <Icon name="print" />
              {ui.patternMaker.print}
            </button>
          </div>
        }
      >
        <div className="pm">
          <div className="pm__colors">
            <p id={keyId} className="pm__label">
              {ui.patternMaker.keyLegend}
            </p>
            <ul className="pm__key" aria-labelledby={keyId}>
              {PATTERN_COLORS.map((color) => (
                <li key={color.index} data-tone={color.index}>
                  <span className="pm__swatch" aria-hidden="true">
                    <Shape color={color} />
                  </span>
                  <span>{colorName(color.index)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="pm__stage">
            <div className="pm__panel">
              <p className="pm__label">
                {ui.patternMaker.tileLabel}
              </p>
              <div className="pm__region" role="region" aria-label={fill(ui.patternMaker.region, { n: size }, lang)} tabIndex={0}>
                <div ref={grid} className="pm__tile" data-size={size} onKeyDown={(event) => moveInGrid(event, grid.current, size)}>
                  {cells.map((cell, index) => {
                    const color = colorAt(cell);
                    const place = placeOf(size, index);
                    return (
                      <button
                        key={index}
                        type="button"
                        className="pm__square"
                        data-index={index}
                        data-tone={cell}
                        onClick={() => tap(index)}
                        aria-label={fill(ui.patternMaker.square, { row: place.row, column: place.column, color: colorName(cell) }, lang)}
                      >
                        <Shape color={color} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="pm__panel">
              <p className="pm__label">
                {ui.patternMaker.patternLabel}
              </p>
              <div className="pm__pattern" data-size={size} role="img" aria-label={fill(ui.patternMaker.pattern, { n: REPEATS }, lang)}>
                {pattern.map((cell, index) => (
                  <PreviewSquare key={index} index={index} across={across} size={size} cell={cell} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </GameFrame>
      <section className="sheet pm-sheet" aria-hidden="true">
        <h2>{ui.patternMaker.sheetTitle}</h2>
        <ul className="pm-sheet__key">
          {PATTERN_COLORS.map((color) => (
            <li key={color.index} data-tone={color.index}>
              <span className="pm-sheet__swatch">
                <Shape color={color} />
              </span>
              {colorName(color.index)}
            </li>
          ))}
        </ul>
        <div className="pm-sheet__grid" data-size={size}>
          {pattern.map((cell, index) => (
            <PreviewSquare key={index} index={index} across={across} size={size} cell={cell} sheet />
          ))}
        </div>
      </section>
    </>
  );
}

interface PreviewSquareProps {
  index: number;
  across: number;
  size: TileSize;
  cell: PatternColor;
  sheet?: boolean;
}

/** One square of "your pattern" or of the paper sheet. The first row and column of each repeat of the tile are marked, so the repeat can be seen. */
function PreviewSquare({ index, across, size, cell, sheet }: PreviewSquareProps) {
  const column = index % across;
  const row = Math.floor(index / across);
  return (
    <span
      className={sheet ? 'pm-sheet__square' : 'pm__mini'}
      data-tone={cell}
      data-tile-left={column % size === 0 ? 'yes' : undefined}
      data-tile-top={row % size === 0 ? 'yes' : undefined}
    >
      <Shape color={colorAt(cell)} />
    </span>
  );
}
