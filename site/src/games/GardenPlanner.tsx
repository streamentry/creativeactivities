import { useRef, useState } from 'react';
import { BEDS, GARDEN_EXTRAS, PLANTS, type GardenItem } from '../data/garden-planner';
import { pictureUrl } from '../data/pictures';
import type { PlayProps } from '../i18n/play';
import { fill } from '../i18n/play/format';
import {
  choosePicture,
  newGarden,
  putBack,
  startAgain,
  summaryList,
  tapBed,
  type Garden,
} from '../lib/games/garden-planner';
import { PAUSE_LINE } from '../lib/scope';
import { GameFrame } from './shared/GameFrame';
import { Icon } from './shared/Icon';
import { sounds } from './shared/sound';

/**
 * Garden planner (GAME-041): choose pictures of plants and garden things, then lay them out in twelve beds. Solo or
 * side by side, with no turns. Nothing is scored, timed, rated, saved or sent. The paper version prints the beds with
 * the pictures on screen, the summary in words and blank lines for notes. It is a picture plan, not planting advice.
 */
export default function GardenPlanner(props: PlayProps) {
  const { ui, lang, pictureNames } = props;
  const text = ui.gardenPlanner;
  const [garden, setGarden] = useState<Garden>(newGarden);
  // Taps can arrive faster than the page redraws, so every tap starts from the latest garden kept here.
  const latest = useRef(garden);
  const [message, setMessage] = useState('');

  const commit = (next: Garden) => {
    latest.current = next;
    setGarden(next);
  };

  const nameOf = (picture: string): string => pictureNames[picture] ?? '';

  const pickPicture = (picture: string) => {
    const result = choosePicture(latest.current, picture);
    if (result.outcome === 'outside') return;
    sounds.tap();
    commit(result.garden);
    setMessage(result.outcome === 'chosen' ? fill(text.chosen, { picture: nameOf(picture) }, lang) : text.unchosen);
  };

  const tapOneBed = (index: number) => {
    const before = latest.current;
    const result = tapBed(before, index);
    const n = index + 1;
    if (result.outcome === 'outside') return;
    if (result.outcome === 'needPicture') {
      setMessage(text.needPicture);
      return;
    }
    sounds.tap();
    commit(result.garden);
    if (result.outcome === 'cleared') {
      setMessage(fill(text.cleared, { n }, lang));
      return;
    }
    const picture = nameOf(result.garden.beds[index] ?? '');
    setMessage(fill(result.outcome === 'replaced' ? text.replaced : text.planted, { picture, n }, lang));
  };

  const restart = () => {
    const after = startAgain(latest.current);
    if (after === latest.current) return;
    commit(after);
    setMessage(text.restarted);
  };

  const restore = () => {
    commit(putBack(latest.current));
    setMessage(text.putBackDone);
  };

  const print = () => {
    sounds.tap();
    window.print();
  };

  const summary = summaryList(garden, text.and);
  const summaryLine = summary ? fill(text.summary, { list: summary }, lang) : text.summaryNone;

  const renderItems = (items: readonly GardenItem[]) =>
    items.map((item) => {
      const chosen = garden.chosen === item.id;
      return (
        <li key={item.id}>
          <button
            type="button"
            className="gp__pick"
            aria-pressed={chosen}
            data-chosen={chosen ? 'yes' : undefined}
            onClick={() => pickPicture(item.id)}
          >
            <img src={pictureUrl(item.id)} alt="" width={120} height={120} draggable={false} />
            <span className="gp__pick-name">{nameOf(item.id)}</span>
            {chosen ? <span className="gp__chosen">{text.chosenLabel}</span> : null}
          </button>
        </li>
      );
    });

  return (
    <>
      <GameFrame
        ui={ui}
        lang={lang}
        guidance={ui.gardenPlanner.guidance}
        message={message}
        onRestart={restart}
        footer={
          <div className="btn-row btn-row--center">
            {garden.before ? (
              <button type="button" className="btn" onClick={restore}>
                {text.putBack}
              </button>
            ) : null}
            <button type="button" className="btn btn--primary btn--hero" onClick={print}>
              <Icon name="print" />
              {text.print}
            </button>
          </div>
        }
      >
        <div className="gp">
          <div className="gp__beds" role="group" aria-label={text.bedsLabel}>
            {garden.beds.map((bed, index) => {
              const n = index + 1;
              return (
                <button
                  key={index}
                  type="button"
                  className="gp__bed"
                  data-state={bed ? 'filled' : 'empty'}
                  onClick={() => tapOneBed(index)}
                  aria-label={bed ? fill(text.bedFilled, { n, picture: nameOf(bed) }, lang) : fill(text.bedEmpty, { n }, lang)}
                >
                  {bed ? (
                    <img src={pictureUrl(bed)} alt="" width={120} height={120} draggable={false} />
                  ) : (
                    <span className="gp__no" aria-hidden="true">
                      {n}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <section className="gp__summary" aria-labelledby="gp-summary">
            <h2 id="gp-summary">{text.summaryHeading}</h2>
            <p>{summaryLine}</p>
          </section>

          <section className="gp__tray-section" aria-labelledby="gp-plants">
            <h2 id="gp-plants">{text.plantsHeading}</h2>
            <ul className="gp__tray">{renderItems(PLANTS)}</ul>
          </section>

          <section className="gp__tray-section" aria-labelledby="gp-extras">
            <h2 id="gp-extras">{text.extrasHeading}</h2>
            <ul className="gp__tray">{renderItems(GARDEN_EXTRAS)}</ul>
          </section>

          <p className="gp__notice">{text.notice}</p>
        </div>
      </GameFrame>

      <section className="sheet gp-sheet" aria-hidden="true">
        <h2>{text.sheetTitle}</h2>
        <p className="gp-sheet__summary">{summaryLine}</p>
        <div className="gp-sheet__beds">
          {Array.from({ length: BEDS }, (_, i) => {
            const bed = garden.beds[i] ?? null;
            return (
              <span key={i} className="gp-sheet__bed">
                {bed ? <img src={pictureUrl(bed)} alt="" width={120} height={120} /> : null}
              </span>
            );
          })}
        </div>
        <p className="gp-sheet__how">{text.sheetHow}</p>
        <h3 className="gp-sheet__notes">{text.sheetNotes}</h3>
        <div className="gp-sheet__lines">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className="gp-sheet__line" />
          ))}
        </div>
        <p className="gp-sheet__notice">{text.notice}</p>
        <p className="gp-sheet__pause">{PAUSE_LINE}</p>
      </section>
    </>
  );
}
