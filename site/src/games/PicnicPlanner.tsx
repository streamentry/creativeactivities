import { useRef, useState } from 'react';
import { PICNIC_FOOD, PICNIC_ITEMS, PICNIC_OUTINGS, type PicnicItem } from '../data/picnic-planner';
import { pictureUrl } from '../data/pictures';
import type { PlayProps } from '../i18n/play';
import { fill } from '../i18n/play/format';
import { parsePairTiles, type SavedPairTile } from '../lib/games/pairs';
import {
  SLOTS,
  addToBasket,
  canPlay,
  emptyBasket,
  newPicnic,
  pairValues,
  summaryList,
  takeOut,
  type Picnic,
} from '../lib/games/picnic-planner';
import { GameFrame } from './shared/GameFrame';
import { Icon } from './shared/Icon';
import { PairsBoard } from './shared/PairsBoard';
import { sounds } from './shared/sound';

type Stage = 'plan' | 'play';

const ITEM_IDS: ReadonlySet<string> = new Set(PICNIC_ITEMS.map((item) => item.id));

/**
 * The saved place (WEB-054): the basket, the stage and, while playing, the board's
 * layout with matched pairs. The basket holds at most `SLOTS` different known
 * pictures; a play board needs the fewest to play and must be a whole board for
 * that basket. Nothing is repaired: a bad value makes the whole place unusable.
 */
export function parsePicnicPlace(b: unknown): { basket: string[]; stage: Stage; tiles: SavedPairTile[] } | null {
  if (typeof b !== 'object' || b === null || Array.isArray(b)) return null;
  const { basket, stage, tiles } = b as { basket?: unknown; stage?: unknown; tiles?: unknown };
  if (!Array.isArray(basket) || basket.length > SLOTS) return null;
  const seen = new Set<string>();
  for (const id of basket) {
    if (typeof id !== 'string' || !ITEM_IDS.has(id) || seen.has(id)) return null;
    seen.add(id);
  }
  const picked = basket as string[];
  if (stage === 'plan') {
    return Array.isArray(tiles) && tiles.length === 0 ? { basket: picked, stage, tiles: [] } : null;
  }
  if (stage !== 'play' || !canPlay({ basket: picked })) return null;
  const layout = parsePairTiles(tiles, picked);
  return layout === null ? null : { basket: picked, stage, tiles: layout };
}

/**
 * Picnic planner (GAME-043): tap pictures of food and things to do to put them in a picnic basket (up to six), then
 * play a gentle matching round made from the chosen pictures. Nothing is timed, scored or saved, and there are no
 * misses. The paper version is a checklist of the chosen pictures, with tick boxes "to pack", printed beside the
 * game frame.
 */
export default function PicnicPlanner(props: PlayProps) {
  const { ui, lang, pictureNames } = props;
  const text = ui.picnicPlanner;
  const [picnic, setPicnic] = useState<Picnic>(newPicnic);
  // Taps can arrive faster than the page redraws, so every tap starts from the latest basket kept here.
  const latest = useRef(picnic);
  const [stage, setStage] = useState<Stage>('plan');
  const [round, setRound] = useState(0);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState('');
  // WEB-054: the play board's layout and matched pairs, kept for Rest, and a saved layout to rebuild once.
  const boardTiles = useRef<SavedPairTile[]>([]);
  const [resume, setResume] = useState<SavedPairTile[] | undefined>(undefined);

  const commit = (next: Picnic) => {
    latest.current = next;
    setPicnic(next);
  };

  const nameOf = (id: string): string => pictureNames[id] ?? '';

  const pick = (id: string) => {
    const result = addToBasket(latest.current, id);
    if (result.outcome === 'outside') return;
    if (result.outcome === 'present') {
      setMessage(fill(text.already, { picture: nameOf(id) }, lang));
      return;
    }
    if (result.outcome === 'full') {
      setMessage(text.full);
      return;
    }
    sounds.tap();
    commit(result.picnic);
    setMessage(fill(text.added, { picture: nameOf(id) }, lang));
  };

  const removeFromBasket = (id: string) => {
    const result = takeOut(latest.current, id);
    if (result.outcome === 'absent') return;
    sounds.tap();
    commit(result.picnic);
    setMessage(fill(text.removed, { picture: nameOf(id) }, lang));
  };

  const startPlay = () => {
    if (!canPlay(latest.current)) {
      setMessage(text.needTwo);
      return;
    }
    sounds.tap();
    setDone(false);
    setMessage('');
    setRound((r) => r + 1);
    setStage('play');
  };

  const backToPicnic = () => {
    sounds.tap();
    setDone(false);
    setMessage('');
    setStage('plan');
  };

  const playAgain = () => {
    sounds.tap();
    setDone(false);
    setMessage('');
    setRound((r) => r + 1);
  };

  const startAgain = () => {
    const next = emptyBasket(latest.current);
    commit(next);
    setDone(false);
    setStage('plan');
    setMessage(next === latest.current ? '' : text.cleared);
  };

  const print = () => {
    sounds.tap();
    window.print();
  };

  const list = summaryList(picnic, text.and);
  const summaryLine = list ? fill(text.summary, { list }, lang) : text.summaryNone;
  const planning = stage === 'plan';
  const guidance = planning ? ui.picnicPlanner.guidance : text.guidancePlay;

  const renderTray = (items: readonly PicnicItem[]) =>
    items.map((item) => {
      const inBasket = picnic.basket.includes(item.id);
      return (
        <li key={item.id}>
          <button type="button" className="picnic__pick" data-in={inBasket ? 'yes' : undefined} onClick={() => pick(item.id)}>
            <img src={pictureUrl(item.id)} alt="" width={96} height={96} draggable={false} />
            <span className="picnic__pick-name">{nameOf(item.id)}</span>
            {inBasket ? <span className="picnic__in">{text.inBasket}</span> : null}
          </button>
        </li>
      );
    });

  return (
    <>
      <GameFrame
        ui={ui}
        lang={lang}
        guidance={guidance}
        message={message}
        onRestart={startAgain}
        place={{
          slug: 'picnic-planner',
          save: () => ({ basket: latest.current.basket, stage, tiles: stage === 'play' ? boardTiles.current : [] }),
          check: (b) => parsePicnicPlace(b) !== null,
          restore: (b) => {
            const saved = parsePicnicPlace(b);
            if (!saved) return;
            commit({ basket: saved.basket });
            setStage(saved.stage);
            setDone(false);
            setMessage('');
            setResume(saved.stage === 'play' ? saved.tiles : undefined);
            setRound((r) => r + 1);
          },
        }}
        footer={
          planning ? (
            <div className="btn-row btn-row--center">
              <button type="button" className="btn" onClick={startPlay}>
                {text.play}
              </button>
              <button type="button" className="btn btn--primary btn--hero" onClick={print}>
                <Icon name="print" />
                {text.print}
              </button>
            </div>
          ) : done ? (
            <div className="btn-row btn-row--center">
              <button type="button" className="btn btn--primary" onClick={playAgain}>
                {text.playAgain}
              </button>
              <button type="button" className="btn" onClick={backToPicnic}>
                <Icon name="back" />
                {text.back}
              </button>
            </div>
          ) : (
            <div className="btn-row btn-row--center">
              <button type="button" className="btn" onClick={backToPicnic}>
                <Icon name="back" />
                {text.back}
              </button>
            </div>
          )
        }
      >
        {planning ? (
          <div className="picnic">
            <section className="picnic__basket" aria-labelledby="picnic-basket-heading">
              <h2 id="picnic-basket-heading">{text.basketHeading}</h2>
              <ol className="picnic__slots" aria-label={text.basketLabel}>
                {Array.from({ length: SLOTS }, (_, i) => {
                  const id = picnic.basket[i];
                  return id ? (
                    <li key={id}>
                      <button
                        type="button"
                        className="picnic__slot"
                        aria-label={fill(text.takeOut, { picture: nameOf(id) }, lang)}
                        onClick={() => removeFromBasket(id)}
                      >
                        <img src={pictureUrl(id)} alt="" width={80} height={80} draggable={false} />
                        <span className="picnic__slot-name">{nameOf(id)}</span>
                      </button>
                    </li>
                  ) : (
                    <li key={`empty-${i}`} className="picnic__slot picnic__slot--empty">
                      {i + 1}
                    </li>
                  );
                })}
              </ol>
              <p className="picnic__summary">{summaryLine}</p>
            </section>

            <section className="picnic__tray-section" aria-labelledby="picnic-food-heading">
              <h2 id="picnic-food-heading">{text.foodHeading}</h2>
              <ul className="picnic__tray">{renderTray(PICNIC_FOOD)}</ul>
            </section>

            <section className="picnic__tray-section" aria-labelledby="picnic-outings-heading">
              <h2 id="picnic-outings-heading">{text.outingsHeading}</h2>
              <ul className="picnic__tray">{renderTray(PICNIC_OUTINGS)}</ul>
            </section>

            <p className="picnic__notice">{text.notice}</p>
          </div>
        ) : (
          <div className="picnic picnic--play">
            <PairsBoard
              play={props}
              values={pairValues(picnic)}
              hidden={false}
              round={round}
              resume={resume}
              onResumed={() => setResume(undefined)}
              onTiles={(t) => {
                boardTiles.current = t;
              }}
              onMessage={setMessage}
              onComplete={() => setDone(true)}
            />
          </div>
        )}
      </GameFrame>

      {/* The paper version sits beside the game frame, not inside it: games hide the frame in print. */}
      <section className="sheet picnic-sheet">
        <h2>{text.sheetTitle}</h2>
        <p className="picnic-sheet__how">{text.sheetHow}</p>
        <p className="picnic-sheet__summary">{summaryLine}</p>
        <h3 className="picnic-sheet__head">{text.sheetToPack}</h3>
        <ul className="picnic-sheet__list">
          {picnic.basket.map((id) => (
            <li key={id} className="picnic-sheet__row">
              <span className="picnic-sheet__box" />
              <img src={pictureUrl(id)} alt="" width={96} height={96} />
              <span className="picnic-sheet__name">{nameOf(id)}</span>
            </li>
          ))}
          {Array.from({ length: Math.max(0, SLOTS - picnic.basket.length) }, (_, i) => (
            <li key={`blank-${i}`} className="picnic-sheet__row picnic-sheet__row--blank">
              <span className="picnic-sheet__box" />
              <span className="picnic-sheet__line" />
            </li>
          ))}
        </ul>
        <p className="picnic-sheet__notice">{text.notice}</p>
      </section>
    </>
  );
}
