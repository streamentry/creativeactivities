import { useEffect, useState } from 'react';
import type { PlayProps } from '../i18n/play';
import { fill } from '../i18n/play/format';
import { DEFAULT_OCCASION, FRAME_BOX, OCCASIONS, PANEL_HEIGHT, PANEL_WIDTH, STEP_KEYS, frameMarks, messageLineYs, occasionWords, type Occasion } from '../data/decorate-a-card';
import { PAUSE_LINE } from '../lib/scope';
import { GameFrame } from './shared/GameFrame';
import { Icon } from './shared/Icon';
import { sounds } from './shared/sound';

const isRecord = (b: unknown): b is Record<string, unknown> => typeof b === 'object' && b !== null && !Array.isArray(b);

/** A saved board is the occasion chosen: one of the five the card has. */
function checkBoard(b: unknown): boolean {
  return isRecord(b) && typeof b.occasion === 'string' && (OCCASIONS as readonly string[]).includes(b.occasion);
}

/**
 * Decorate a card together (GAME-035): two people decorate a printed greeting card, folded in half. The page
 * shows the chosen occasion, the steps and a small preview of the card; the paper version is the same drawing,
 * printed. Nothing here counts, times, ranks or saves anything.
 */
export default function DecorateACard(props: PlayProps) {
  const { ui, lang } = props;
  const text = ui.decorateACard;
  const [occasion, setOccasion] = useState<Occasion>(DEFAULT_OCCASION);
  const words = occasionWords(text.occasions, occasion);
  const marks = frameMarks();
  const lines = messageLineYs();

  // The printed sheet (GamePrintSheet) holds one front for each occasion; only the chosen one prints.
  useEffect(() => {
    for (const el of document.querySelectorAll<HTMLElement>('[data-card-front]')) {
      el.hidden = el.dataset.cardFront !== occasion;
    }
  }, [occasion]);

  const steps: readonly string[] = STEP_KEYS.map((key) => text.steps[key]);
  const sheetRules: readonly string[] = text.sheetRules;

  return (
    <GameFrame
      ui={ui}
      lang={lang}
      guidance={ui.decorateACard.guidance}
      readAloudText={ui.decorateACard.guidance}
      place={{
        slug: 'decorate-a-card',
        save: () => ({ occasion }),
        check: checkBoard,
        restore: (b) => {
          if (isRecord(b)) setOccasion(b.occasion as Occasion);
        },
      }}
      footer={
        <div className="btn-row btn-row--center">
          <button
            type="button"
            className="btn btn--primary btn--hero"
            onClick={() => {
              sounds.tap();
              window.print();
            }}
          >
            <Icon name="print" />
            {text.print}
          </button>
        </div>
      }
    >
      <div className="card-deco">
        <fieldset className="card-deco__choices">
          <legend>{text.occasionLegend}</legend>
          {OCCASIONS.map((o) => (
            <label key={o} className="card-deco__choice">
              <input type="radio" name="occasion" value={o} checked={occasion === o} onChange={() => setOccasion(o)} />
              <span>{text.occasions[o].label}</span>
            </label>
          ))}
        </fieldset>

        <figure className="card-deco__preview">
          <div className="card-deco__sheet" role="img" aria-label={fill(text.previewLabel, { words })}>
            <div className="card-deco__panel card-deco__panel--inside" aria-hidden="true">
              <svg className="card-deco__art" viewBox={`0 0 ${PANEL_WIDTH} ${PANEL_HEIGHT}`} focusable="false">
                {lines.map((y) => (
                  <line key={y} className="card-deco__line" x1={10} x2={80} y1={y} y2={y} />
                ))}
                <line className="card-deco__line" x1={22} x2={80} y1={106} y2={106} />
              </svg>
              <p className="card-deco__from">{text.from}</p>
            </div>
            <div className="card-deco__panel card-deco__panel--front" aria-hidden="true">
              <svg className="card-deco__art" viewBox={`0 0 ${PANEL_WIDTH} ${PANEL_HEIGHT}`} focusable="false">
                <rect className="card-deco__frame" x={FRAME_BOX.x - PANEL_WIDTH} y={FRAME_BOX.y} width={FRAME_BOX.width} height={FRAME_BOX.height} rx={FRAME_BOX.rx} />
                {marks.map((m, i) =>
                  m.kind === 'circle' ? (
                    <circle key={i} className="card-deco__mark" cx={m.cx - PANEL_WIDTH} cy={m.cy} r={m.r} />
                  ) : (
                    <path key={i} className="card-deco__mark" d={m.d} transform={`translate(-${PANEL_WIDTH} 0)`} />
                  ),
                )}
              </svg>
              <p className="card-deco__words">{words}</p>
            </div>
          </div>
          <figcaption>{text.sheetHow}</figcaption>
        </figure>

        <section aria-labelledby="card-steps">
          <h2 id="card-steps">{text.stepsHeading}</h2>
          <ol className="card-deco__steps">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="card-deco__materials">{text.materials}</p>
          <h2 className="card-deco__rules-heading">{text.rulesHeading}</h2>
          <ul className="card-deco__rules">
            {sheetRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
          <p className="card-deco__pause">{PAUSE_LINE}</p>
        </section>
      </div>
    </GameFrame>
  );
}
