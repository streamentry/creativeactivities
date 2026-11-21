import { useState } from 'react';
import { PICTURES, pictureUrl } from '../data/pictures';
import type { PlayProps } from '../i18n/play';
import { fill, plural } from '../i18n/play/format';
import { createBingoCards, createCallOrder } from '../lib/games/bingo';
import { createRng, randomSeed } from '../lib/games/random';
import { ChoiceChips } from './shared/ChoiceChips';
import { GameFrame } from './shared/GameFrame';
import { Icon } from './shared/Icon';
import { pictureNamer } from './shared/PictureTile';
import { sounds } from './shared/sound';

const POOL = PICTURES.map((p) => p.id);

const POOL_SET: ReadonlySet<string> = new Set(POOL);

const SQUARES = [9, 16] as const;
const PLAYERS = [4, 8, 12, 20] as const;

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

interface SavedBingo {
  squares: number;
  players: number;
  cards: string[][];
  calls: string[];
  called: number;
}

/** A list of distinct picture ids of the given length, all in the pool; null otherwise. */
function distinctIds(list: unknown, size: number): string[] | null {
  if (!Array.isArray(list) || list.length !== size) return null;
  const seen = new Set<string>();
  for (const id of list) {
    if (typeof id !== 'string' || !POOL_SET.has(id) || seen.has(id)) return null;
    seen.add(id);
  }
  return list as string[];
}

/** The saved bingo, or null unless the cards match the chosen size and count and the calls are every picture once. */
function parseBingo(b: unknown): SavedBingo | null {
  if (!isRecord(b)) return null;
  const { squares, players, cards, calls, called } = b;
  if (typeof squares !== 'number' || !(SQUARES as readonly number[]).includes(squares)) return null;
  if (typeof players !== 'number' || !(PLAYERS as readonly number[]).includes(players)) return null;
  if (!Array.isArray(cards) || cards.length !== players) return null;
  const checked: string[][] = [];
  for (const card of cards) {
    const ids = distinctIds(card, squares);
    if (!ids) return null;
    checked.push(ids);
  }
  const order = distinctIds(calls, POOL.length);
  if (!order) return null;
  if (typeof called !== 'number' || !Number.isSafeInteger(called) || called < 0 || called > order.length) return null;
  return { squares, players, cards: checked, calls: order, called };
}

export default function PictureBingo(props: PlayProps) {
  const { ui, lang } = props;
  const pictureName = pictureNamer(props);
  const [squares, setSquares] = useState<number>(9);
  const [players, setPlayers] = useState<number>(8);
  const [cards, setCards] = useState<string[][]>(() => createBingoCards(POOL, 9, 8, createRng(randomSeed())));
  const [calls, setCalls] = useState<string[]>(() => createCallOrder(POOL, createRng(randomSeed())));
  const [called, setCalled] = useState(0);

  // New cards are dealt in the change handlers, not an effect, so a restored board keeps its own cards.
  const chooseSquares = (n: number) => {
    if (n === squares) return;
    setSquares(n);
    setCards(createBingoCards(POOL, n, players, createRng(randomSeed())));
  };
  const choosePlayers = (n: number) => {
    if (n === players) return;
    setPlayers(n);
    setCards(createBingoCards(POOL, squares, n, createRng(randomSeed())));
  };

  const newGame = () => {
    sounds.tap();
    setCalls(createCallOrder(POOL, createRng(randomSeed())));
    setCalled(0);
  };

  const current = called > 0 ? calls[called - 1] : undefined;
  const next = () => {
    if (called >= calls.length) return;
    const nextCalled = called + 1;
    setCalled(nextCalled);
    if (nextCalled >= calls.length) {
      sounds.done();
    } else {
      sounds.tap();
    }
  };

  const squareChoices = SQUARES.map((n) => ({ value: n, label: fill(ui.pictureBingo.squares, { n, side: Math.sqrt(n) }) }));
  const playerChoices = PLAYERS.map((n) => ({ value: n, label: fill(plural(ui.pictureBingo.cards, n, lang), { n }) }));

  return (
    <>
      <GameFrame
        ui={ui}
        lang={lang}
        guidance={ui.pictureBingo.guidance}
        readAloudText={current ? pictureName(current) : ui.pictureBingo.guidance}
        message={
          current
            ? fill(plural(ui.pictureBingo.called, calls.length, lang), { name: pictureName(current), called, total: calls.length })
            : ui.pictureBingo.start
        }
        onRestart={newGame}
        place={{
          slug: 'picture-bingo',
          save: () => ({ squares, players, cards, calls, called }),
          check: (b) => parseBingo(b) !== null,
          restore: (b) => {
            const saved = parseBingo(b);
            if (!saved) return;
            setSquares(saved.squares);
            setPlayers(saved.players);
            setCards(saved.cards);
            setCalls(saved.calls);
            setCalled(saved.called);
          },
        }}
        restartLabel={ui.pictureBingo.restart}
        options={
          <>
            <ChoiceChips legend={ui.pictureBingo.squaresLegend} choices={squareChoices} value={squares} onChange={chooseSquares} />
            <ChoiceChips legend={ui.pictureBingo.cardsLegend} choices={playerChoices} value={players} onChange={choosePlayers} />
            <div className="btn-row">
              <button
                type="button"
                className="btn"
                onClick={() => {
                  sounds.tap();
                  window.print();
                }}
              >
                <Icon name="print" />
                {fill(plural(ui.pictureBingo.print, players, lang), { n: players })}
              </button>
            </div>
          </>
        }
      >
        <div className="caller">
          {current ? (
            <>
              <div className="caller__print">
                <img src={pictureUrl(current)} alt="" width={312} height={312} />
              </div>
              <p className="caller__name">{pictureName(current)}</p>
            </>
          ) : (
            <p className="caller__name">{ui.pictureBingo.ready}</p>
          )}
          {called >= calls.length ? (
            <div className="game__done">
              <p>{ui.pictureBingo.allCalled}</p>
              <button type="button" className="btn btn--primary btn--hero" onClick={newGame}>
                {ui.pictureBingo.restart}
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn--primary btn--hero" onClick={next}>
              {ui.pictureBingo.next}
            </button>
          )}
          {called > 1 ? (
            <div>
              <h2 className="caller__heading">{ui.pictureBingo.alreadyCalled}</h2>
              <ul className="called">
                {calls.slice(0, called - 1).reverse().map((id) => (
                  <li key={id} title={pictureName(id)}>
                    <img src={pictureUrl(id)} alt={pictureName(id)} title={pictureName(id)} width={52} height={52} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </GameFrame>
      <section className="sheet" aria-hidden="true">
        {cards.map((card, i) => (
          <div className="sheet__page" key={i}>
            <h2>{fill(ui.pictureBingo.sheetTitle, { n: i + 1 })}</h2>
            <div className="sheet-bingo" data-cols={Math.sqrt(squares)}>
              {card.map((id) => (
                <div key={id}>
                  <img src={pictureUrl(id)} alt="" width={120} height={120} />
                  {pictureName(id)}
                </div>
              ))}
            </div>
            <p>creativeactivities.org</p>
          </div>
        ))}
      </section>
    </>
  );
}
