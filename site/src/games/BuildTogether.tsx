import { useId, useRef, useState } from 'react';
import { BOARD_SIZES, BUILD_COLORS, PEOPLE, buildColorAt, type BoardSize, type PatternColor, type PatternColorInfo, type Person } from '../data/build-together';
import type { PlayProps } from '../i18n/play';
import { fill } from '../i18n/play/format';
import {
  boardOf,
  canPass,
  canTakeBack,
  chooseColor,
  chooseSize,
  colorOf,
  isBuilt,
  lastStep,
  newGame,
  otherPerson,
  pass,
  place,
  placeOf,
  startAgain,
  takeBack,
  turnOf,
  type Board,
  type BuildGame,
  type Cell,
  type Step,
} from '../lib/games/build-together';
import { ChoiceChips } from './shared/ChoiceChips';
import { GameFrame } from './shared/GameFrame';
import { Icon } from './shared/Icon';
import { moveInGrid } from './shared/gridKeys';
import { sounds } from './shared/sound';

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** A list of distinct ids, each passing [ok]. Reads only: a bad saved value is refused, never repaired. */
const isIdList = (v: unknown, ok: (id: string) => boolean): v is string[] =>
  Array.isArray(v) && v.every((id) => typeof id === 'string' && ok(id)) && new Set(v).size === v.length;

const isPerson = (v: unknown): v is Person => v === 0 || v === 1;
const isBuildColor = (v: unknown): v is PatternColor => BUILD_COLORS.some((c) => c.index === v);
const isCellOwner = (v: unknown): v is Cell => v === null || isPerson(v);

/** One saved board of a size, or null. */
function parseBoardOf(b: unknown, n: BoardSize): Board | null {
  if (!isRecord(b)) return null;
  const { cells, turn, steps } = b;
  if (!Array.isArray(cells) || cells.length !== n * n || !cells.every(isCellOwner) || !isPerson(turn) || !Array.isArray(steps)) return null;
  const parsed: Step[] = [];
  for (const step of steps) {
    if (!isRecord(step)) return null;
    const { kind, index, person } = step;
    if (!isPerson(person)) return null;
    if (kind === 'pass') {
      parsed.push({ kind: 'pass', person });
    } else if (kind === 'place' && typeof index === 'number' && Number.isInteger(index) && index >= 0 && index < n * n) {
      parsed.push({ kind: 'place', index, person });
    } else {
      return null;
    }
  }
  return { cells, turn, steps: parsed };
}

/** The saved game, or null when this game cannot show it. */
function parseGame(b: unknown): BuildGame | null {
  if (!isRecord(b)) return null;
  const { size, colors, boards } = b;
  if (!(BOARD_SIZES as readonly unknown[]).includes(size) || !Array.isArray(colors) || colors.length !== 2 || !isRecord(boards)) return null;
  const [first, second] = colors;
  if (!isBuildColor(first) || !isBuildColor(second) || first === second) return null;
  const out = {} as Record<BoardSize, Board>;
  for (const n of BOARD_SIZES) {
    const board = parseBoardOf(boards[String(n)], n);
    if (!board) return null;
    out[n] = board;
  }
  return { size: size as BoardSize, colors: [first, second], boards: out };
}

/** A small shape in a color, so the color is also known by its shape. The shape is drawn in the swatch's ink color. */
function Shape({ color }: { color: PatternColorInfo }) {
  return <span className="cbn__shape" data-shape={color.shape} aria-hidden="true" />;
}

/**
 * Build together (GAME-048): two people, side by side, fill one shared grid by
 * taking turns to put a piece in an empty place. Each has their own color, with a
 * written name and a shape. Nobody wins: the grid being full is "built together".
 * Nothing is counted, timed, saved or sent; the only thing that leaves the page is
 * what the people choose to print.
 */
export default function BuildTogether(props: PlayProps) {
  const { ui, lang } = props;
  const [game, setGame] = useState<BuildGame>(newGame);
  // Taps can arrive faster than the page redraws (a shaky hand, two people reaching at once), so every tap starts
  // from the latest game kept here, never from the one the last redraw saw.
  const latest = useRef(game);
  const [message, setMessage] = useState('');
  const grid = useRef<HTMLDivElement>(null);
  const passButton = useRef<HTMLButtonElement>(null);
  const pickId = useId();

  const commit = (next: BuildGame) => {
    latest.current = next;
    setGame(next);
  };

  const { size } = game;
  const { cells, turn } = boardOf(game);
  const built = isBuilt(game);
  const colorName = (c: PatternColor) => ui.buildTogether.colors[c] ?? '';
  const personName = (p: Person) => ui.buildTogether.people[p] ?? '';
  const colorOfPerson = (p: Person) => buildColorAt(colorOf(game, p));

  const tap = (index: number) => {
    const before = latest.current;
    const { game: after, outcome } = place(before, index);
    if (outcome === 'outside' || outcome === 'finished') return;
    const spot = placeOf(before.size, index);
    if (outcome === 'taken') {
      setMessage(fill(ui.buildTogether.taken, spot, lang));
      return;
    }
    sounds.tap();
    commit(after);
    const color = colorName(colorOf(before, turnOf(before)));
    const values = { ...spot, color, next: personName(turnOf(after)) };
    setMessage(fill(outcome === 'built' ? ui.buildTogether.placedLast : ui.buildTogether.placed, values, lang));
  };

  const passTurn = () => {
    const before = latest.current;
    if (!canPass(before)) return;
    sounds.tap();
    const after = pass(before);
    commit(after);
    setMessage(fill(ui.buildTogether.passed, { person: personName(turnOf(after)) }, lang));
  };

  // The button disappears once nothing can be taken back, so focus goes to where the piece was, or to Pass, never lost.
  const takeLastBack = () => {
    const before = latest.current;
    const { game: after, step } = takeBack(before);
    if (!step) return;
    sounds.tap();
    commit(after);
    const person = personName(step.person);
    setMessage(fill(step.kind === 'place' ? ui.buildTogether.tookBack : ui.buildTogether.tookBackPass, { person }, lang));
    if (!canTakeBack(after)) {
      const back = step.kind === 'place' ? grid.current?.querySelector<HTMLButtonElement>(`button[data-index="${step.index}"]`) : passButton.current;
      back?.focus();
    }
  };

  const restart = () => {
    const after = startAgain(latest.current);
    commit(after);
    setMessage(fill(ui.buildTogether.restarted, { person: personName(turnOf(after)) }, lang));
  };

  const changeSize = (n: BoardSize) => {
    commit(chooseSize(latest.current, n));
    setMessage('');
  };

  const pickColor = (person: Person, color: PatternColor) => {
    const { game: after, outcome } = chooseColor(latest.current, person, color);
    if (outcome !== 'changed') return;
    sounds.tap();
    commit(after);
    setMessage(fill(ui.buildTogether.colorChanged, { person: personName(person), color: colorName(color) }, lang));
  };

  const print = () => {
    sounds.tap();
    window.print();
  };

  const sizes = BOARD_SIZES.map((n) => ({ value: n, label: fill(ui.buildTogether.size, { n }, lang) }));
  const step = lastStep(game);
  const turnColor = colorOfPerson(turn);

  return (
    <>
      <GameFrame
        ui={ui}
        lang={lang}
        guidance={ui.buildTogether.guidance}
        message={message}
        options={<ChoiceChips legend={ui.buildTogether.sizeLegend} choices={sizes} value={size} onChange={changeSize} />}
        onRestart={restart}
        footer={
          <div className="btn-row btn-row--center">
            {canPass(game) ? (
              <button ref={passButton} type="button" className="btn" onClick={passTurn}>
                <Icon name="arrow" />
                {ui.buildTogether.pass}
              </button>
            ) : null}
            {step ? (
              <button type="button" className="btn" onClick={takeLastBack}>
                <Icon name="back" />
                {step.kind === 'place' ? ui.buildTogether.takeBack : ui.buildTogether.takeBackPass}
              </button>
            ) : null}
            <button type="button" className="btn btn--primary btn--hero" onClick={print}>
              <Icon name="print" />
              {ui.buildTogether.print}
            </button>
          </div>
        }
        place={{
          slug: 'build-together',
          save: () => game,
          check: (b) => parseGame(b) !== null,
          restore: (b) => {
            const saved = parseGame(b);
            if (!saved) return;
            commit(saved);
            setMessage('');
          },
        }}
      >
        <div className="bt">
          <div className="bt__players">
            {PEOPLE.map((person) => {
              const mine = colorOf(game, person);
              const theirs = colorOf(game, otherPerson(person));
              return (
                <fieldset key={person} className="bt__player" data-turn={!built && turn === person ? 'yes' : undefined}>
                  <legend className="bt__legend">{fill(ui.buildTogether.colorLegend, { person: personName(person) }, lang)}</legend>
                  <div className="bt__picks">
                    {BUILD_COLORS.map((color) => {
                      const inUse = color.index === theirs;
                      return (
                        <label key={color.index} className="bt__pick" data-tone={color.index} data-in-use={inUse ? 'yes' : undefined}>
                          <input
                            type="radio"
                            name={`${pickId}-${person}`}
                            value={color.index}
                            checked={color.index === mine}
                            disabled={inUse}
                            onChange={() => pickColor(person, color.index)}
                          />
                          <span className="bt__face">
                            <span className="bt__swatch" aria-hidden="true">
                              <Shape color={color} />
                            </span>
                            <span className="bt__name">{colorName(color.index)}</span>
                            {inUse ? <span className="bt__note">{ui.buildTogether.inUse}</span> : null}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              );
            })}
          </div>
          <div className="bt__turn" data-tone={built ? undefined : turnColor.index} data-built={built ? 'yes' : undefined}>
            {built ? (
              <p className="bt__turn-line">{ui.buildTogether.built}</p>
            ) : (
              <>
                <span className="bt__swatch" aria-hidden="true">
                  <Shape color={turnColor} />
                </span>
                <div>
                  <p className="bt__turn-line">{fill(ui.buildTogether.turn, { person: personName(turn) }, lang)}</p>
                  <p className="bt__turn-color">{fill(ui.buildTogether.yourColor, { color: colorName(turnColor.index) }, lang)}</p>
                </div>
              </>
            )}
          </div>
          <p className="bt__label">{ui.buildTogether.gridLabel}</p>
          <div className="bt__region" role="region" aria-label={fill(ui.buildTogether.region, { n: size }, lang)} tabIndex={0}>
            <div ref={grid} className="bt__grid" data-size={size} onKeyDown={(event) => moveInGrid(event, grid.current, size)}>
              {cells.map((cell, index) => {
                const spot = placeOf(size, index);
                const owner = cell === null ? null : colorOfPerson(cell);
                return (
                  <button
                    key={index}
                    type="button"
                    className="bt__cell"
                    data-index={index}
                    data-state={owner ? 'filled' : 'empty'}
                    data-tone={owner?.index}
                    onClick={() => tap(index)}
                    aria-label={
                      cell === null || !owner
                        ? fill(ui.buildTogether.cellEmpty, spot, lang)
                        : fill(ui.buildTogether.cellFilled, { ...spot, color: colorName(owner.index), person: personName(cell) }, lang)
                    }
                  >
                    {owner ? <Shape color={owner} /> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </GameFrame>
      <section className="sheet bt-sheet" aria-hidden="true">
        <h2>{ui.buildTogether.sheetTitle}</h2>
        <p className="bt-sheet__help">{ui.buildTogether.sheetHelp}</p>
        <ul className="bt-sheet__key">
          {PEOPLE.map((person) => {
            const color = colorOfPerson(person);
            return (
              <li key={person} data-tone={color.index}>
                <span className="bt-sheet__swatch">
                  <Shape color={color} />
                </span>
                {fill(ui.buildTogether.sheetKey, { person: personName(person), color: colorName(color.index) }, lang)}
              </li>
            );
          })}
        </ul>
        <div className="bt-sheet__grid" data-size={size}>
          {cells.map((_, index) => (
            <span key={index} className="bt-sheet__square" />
          ))}
        </div>
      </section>
    </>
  );
}
