import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { PlayProps } from '../i18n/play';
import { fill, plural } from '../i18n/play/format';
import { createRng, randomSeed, sample } from '../lib/games/random';
import { cellsOf, createWordSearch, wordBetween, wordsLeft, type WordGrid } from '../lib/games/wordsearch';
import { ChoiceChips } from './shared/ChoiceChips';
import { GameFrame } from './shared/GameFrame';
import { Icon } from './shared/Icon';
import { sounds } from './shared/sound';
import { useWide } from './shared/useWide';

const SIZES = [6, 8] as const;

/** Row and column steps for the arrow keys, in left-to-right layout. */
const MOVES: Record<string, [number, number]> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
};

const WORDS_FOR: Record<number, number> = { 6: 4, 8: 6 };

const isRecord = (b: unknown): b is Record<string, unknown> => typeof b === 'object' && b !== null && !Array.isArray(b);
const isIndex = (v: unknown, size: number): boolean => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < size;

/**
 * A saved board (WEB-054) is kept only when its theme and size are ones this screen offers, its grid is square with
 * one letter per cell, every placed word lies inside it, and every word found is a word on that grid.
 */
function checkBoard(b: unknown, themeValues: readonly string[], sizes: readonly number[]): boolean {
  if (!isRecord(b) || typeof b.theme !== 'string' || !themeValues.includes(b.theme)) return false;
  const grid = b.grid;
  if (!isRecord(grid) || typeof grid.size !== 'number' || !sizes.includes(grid.size) || b.size !== grid.size) return false;
  const size = grid.size;
  const cells = grid.cells;
  const words = grid.words;
  const found = b.found;
  if (!Array.isArray(cells) || !Array.isArray(words) || !Array.isArray(found)) return false;
  if (cells.length !== size || words.length < 1) return false;
  const squareOk = cells.every(
    (row) => Array.isArray(row) && row.length === size && row.every((ch) => typeof ch === 'string' && ch.length > 0 && ch.length <= 8),
  );
  if (!squareOk) return false;
  const placedOk = words.every(
    (w) => isRecord(w) && typeof w.word === 'string' && w.word.length > 0 && isIndex(w.row, size) && isIndex(w.col, size) && (w.dir === 'across' || w.dir === 'down'),
  );
  if (!placedOk) return false;
  const listed = words.map((w) => (w as { word: string }).word);
  if (new Set(listed).size !== listed.length) return false;
  return found.every((f) => typeof f === 'string' && listed.includes(f));
}

export default function WordSearch(props: PlayProps) {
  if (!props.content.wordSearch.available) {
    return <p className="notice">{props.ui.wordSearch.unavailable}</p>;
  }
  return <WordSearchGame {...props} />;
}

function WordSearchGame(props: PlayProps) {
  const { ui, lang, content } = props;
  const themes = content.wordSearch.themes;
  const [theme, setTheme] = useState(themes[0]!.value);
  const [size, setSize] = useState<number>(6);
  const [round, setRound] = useState(0);
  const [grid, setGrid] = useState<WordGrid | null>(null);
  const [start, setStart] = useState<[number, number] | null>(null);
  const [found, setFound] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  // One tab stop for the grid; arrow keys move between letters.
  const [cursor, setCursor] = useState<[number, number]>([0, 0]);
  const cells = useRef(new Map<string, HTMLButtonElement>());
  // WEB-054: a board carried back by Carry on is put back by the effect below, not drawn anew.
  const pending = useRef<{ grid: WordGrid; found: string[] } | null>(null);
  // 8 by 8 letters only stay 48px or larger on wider screens.
  const wide = useWide(560);
  const effectiveSize = wide ? size : 6;

  useEffect(() => {
    const saved = pending.current;
    pending.current = null;
    if (saved) {
      setGrid(saved.grid);
      setFound(saved.found);
      setStart(null);
      setCursor([0, 0]);
      setMessage('');
      return;
    }
    const t = themes.find((w) => w.value === theme) ?? themes[0]!;
    const rng = createRng(randomSeed());
    const words = sample(t.words, WORDS_FOR[effectiveSize] ?? 4, rng);
    setGrid(createWordSearch(words, effectiveSize, rng, { fill: content.wordSearch.fill, locale: lang }));
    setStart(null);
    setFound([]);
    setCursor([0, 0]);
    setMessage('');
  }, [theme, effectiveSize, round, themes, content.wordSearch.fill, lang]);

  if (!grid) return null;

  const restoreBoard = (b: unknown) => {
    if (!isRecord(b)) return;
    const saved = b as { theme: string; size: number; grid: WordGrid; found: string[] };
    pending.current = { grid: saved.grid, found: [...saved.found] };
    setTheme(saved.theme);
    setSize(saved.size);
    setRound((n) => n + 1);
    setMessage('');
  };

  const foundCells = new Set(
    grid.words.filter((w) => found.includes(w.word)).flatMap((w) => cellsOf(w).map(([r, c]) => `${r}-${c}`)),
  );

  const tap = (r: number, c: number) => {
    if (!start) {
      sounds.tap();
      setStart([r, c]);
      setMessage(fill(ui.wordSearch.letterChosen, { letter: grid.cells[r]?.[c] ?? '' }));
      return;
    }
    if (start[0] === r && start[1] === c) {
      sounds.tap();
      setStart(null);
      setMessage('');
      return;
    }
    const w = wordBetween(grid, start, [r, c]);
    setStart(null);
    if (w && !found.includes(w.word)) {
      const next = [...found, w.word];
      setFound(next);
      if (next.length === grid.words.length) {
        sounds.done();
        setMessage(fill(ui.wordSearch.foundAll, { word: w.word }));
      } else {
        sounds.match();
        setMessage(fill(ui.wordSearch.found, { word: w.word }));
      }
    } else {
      sounds.tap();
      setMessage(ui.wordSearch.tryAgain);
    }
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, r: number, c: number) => {
    const move = MOVES[e.key];
    if (!move) return;
    e.preventDefault();
    // In right-to-left pages the first column is on the right, so left and right swap.
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const dc = rtl ? -move[1] : move[1];
    const nr = Math.min(grid.size - 1, Math.max(0, r + move[0]));
    const nc = Math.min(grid.size - 1, Math.max(0, c + dc));
    setCursor([nr, nc]);
    cells.current.get(`${nr}-${nc}`)?.focus();
  };

  const sizes = SIZES.map((n) => {
    const words = WORDS_FOR[n] ?? 4;
    return { value: n, label: fill(plural(ui.wordSearch.size, words, lang), { n, words }) };
  });
  const themeChoices = themes.map((t) => ({ value: t.value, label: t.label }));
  const allFound = found.length === grid.words.length;
  return (
    <>
      <GameFrame
        ui={ui}
        lang={lang}
        guidance={ui.wordSearch.guidance}
        place={{ slug: 'word-search', save: () => ({ theme, size: grid.size, grid, found }), check: (b) => checkBoard(b, themes.map((t) => t.value), wide ? SIZES : [6]), restore: restoreBoard }}
        readAloudText={
          message ||
          (allFound
            ? fill(ui.wordSearch.foundAll, { word: '' })
            : `${ui.wordSearch.guidance}. ${wordsLeft(grid, found).join(', ')}.`)
        }
        message={message}
        onRestart={() => {
          sounds.tap();
          setRound((n) => n + 1);
        }}
        restartLabel={ui.wordSearch.restart}
        options={
          <>
            <ChoiceChips legend={ui.wordSearch.themeLegend} choices={themeChoices} value={theme} onChange={setTheme} />
            {wide ? <ChoiceChips legend={ui.wordSearch.sizeLegend} choices={sizes} value={size} onChange={setSize} /> : null}
          </>
        }
        footer={
          <div className="btn-row">
            {allFound ? (
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  sounds.tap();
                  setRound((n) => n + 1);
                }}
              >
                {ui.wordSearch.restart}
              </button>
            ) : null}
            <button
              type="button"
              className={allFound ? 'btn' : 'btn btn--primary'}
              onClick={() => {
                sounds.tap();
                window.print();
              }}
            >
              <Icon name="print" />
              {ui.wordSearch.print}
            </button>
          </div>
        }
      >
        <div className="ws" role="group" aria-label={fill(ui.wordSearch.gridLabel, { n: grid.size })} data-size={grid.size}>
          {grid.cells.map((row, r) => (
            <div key={r} className="ws__row">
              {row.map((ch, c) => {
                const key = `${r}-${c}`;
                const isStart = start?.[0] === r && start?.[1] === c;
                return (
                  <button
                    key={key}
                    type="button"
                    className={`ws__cell${isStart ? ' ws__cell--start' : ''}${foundCells.has(key) ? ' ws__cell--found' : ''}`}
                    aria-label={`${fill(ui.wordSearch.cell, { letter: ch, row: r + 1, col: c + 1 })}${foundCells.has(key) ? ui.wordSearch.cellFound : ''}`}
                    aria-pressed={isStart}
                    tabIndex={cursor[0] === r && cursor[1] === c ? 0 : -1}
                    ref={(el) => {
                      if (el) cells.current.set(key, el);
                      else cells.current.delete(key);
                    }}
                    onFocus={() => setCursor([r, c])}
                    onKeyDown={(e) => onKey(e, r, c)}
                    onClick={() => tap(r, c)}
                  >
                    {ch}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <h2 className="visually-hidden">{ui.wordSearch.wordsHeading}</h2>
        <ul className="ws-words">
          {grid.words.map((w) => (
            <li key={w.word} data-found={found.includes(w.word)}>
              {found.includes(w.word) ? <Icon name="check" size={20} /> : null}
              {w.word}
              {found.includes(w.word) ? <span className="visually-hidden">{ui.wordSearch.wordFound}</span> : null}
            </li>
          ))}
        </ul>
      </GameFrame>
      <section className="sheet" aria-hidden="true">
        <h2>{fill(ui.wordSearch.sheetTitle, { theme: themes.find((t) => t.value === theme)?.label ?? '' })}</h2>
        <div className="sheet-ws" data-size={grid.size}>
          {grid.cells.flat().map((ch, i) => (
            <span key={i}>{ch}</span>
          ))}
        </div>
        <p>{ui.wordSearch.sheetNote}</p>
        <ul className="sheet-words">
          {grid.words.map((w) => (
            <li key={w.word}>☐ {w.word}</li>
          ))}
        </ul>
        <p>creativeactivities.org</p>
      </section>
    </>
  );
}
