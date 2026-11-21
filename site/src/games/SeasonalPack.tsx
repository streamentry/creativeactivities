import { useEffect, useState } from 'react';
import { pictureUrl } from '../data/pictures';
import { DEFAULT_MONTH, monthForDate, monthPack, PACK_MONTHS, type MonthId, type MonthPack } from '../data/seasonal-pack';
import type { PlayProps } from '../i18n/play';
import { GameFrame } from './shared/GameFrame';
import { Icon } from './shared/Icon';
import { sounds } from './shared/sound';

/**
 * Seasonal puzzle pack (GAME-040): the person chooses a month, sees its three paper puzzles and prints one page.
 * The page starts on the current month of the person's device and can be changed. A rest day replaces the
 * puzzles with one calm line. Nothing here times, scores, ranks or saves anything, and no answer is shown.
 */

interface PictureProps {
  id: string;
  label: string;
  size: number;
}

function Picture({ id, label, size }: PictureProps) {
  return <img src={pictureUrl(id)} alt={label} width={size} height={size} />;
}

export default function SeasonalPack(props: PlayProps) {
  const { ui, lang, pictureNames } = props;
  const text = ui.seasonalPack;
  // The server renders the default month; the device's month replaces it once the page loads.
  const [month, setMonth] = useState<MonthId>(DEFAULT_MONTH);
  const [restDay, setRestDay] = useState(false);
  const pack: MonthPack = monthPack(month);
  const name = (id: string) => pictureNames[id] ?? ui.tile.picture;

  useEffect(() => {
    setMonth(monthForDate(new Date()));
  }, []);

  // The printed sheet holds one page for each month; only the chosen month prints (as in Decorate a card).
  useEffect(() => {
    for (const el of document.querySelectorAll<HTMLElement>('[data-month-pack]')) {
      el.hidden = el.dataset.monthPack !== String(month);
    }
  }, [month]);

  const puzzles = text.puzzles;

  return (
    <GameFrame
      ui={ui}
      lang={lang}
      guidance={ui.seasonalPack.guidance}
      readAloudText={ui.seasonalPack.guidance}
      footer={
        restDay ? null : (
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
        )
      }
    >
      <div className="seasonal">
        <fieldset className="seasonal__seasons">
          <legend>{text.monthLegend}</legend>
          {PACK_MONTHS.map((m) => (
            <label key={m} className="seasonal__choice">
              <input type="radio" name="month" value={m} checked={month === m} onChange={() => setMonth(m)} />
              <span>{text.months[m]}</span>
            </label>
          ))}
        </fieldset>

        <p className="seasonal__note">{text.monthNote}</p>

        <label className="seasonal__rest">
          <input type="checkbox" checked={restDay} onChange={(e) => setRestDay(e.target.checked)} />
          <span>{text.restDay}</span>
        </label>

        {restDay ? (
          <p className="seasonal__rest-line">{text.restLine}</p>
        ) : (
          <section className="seasonal__preview" aria-labelledby="seasonal-preview">
            <h2 id="seasonal-preview">{text.previewHeading}</h2>

            <article className="seasonal__puzzle" aria-labelledby="seasonal-pairs">
              <h3 id="seasonal-pairs">{puzzles.pairs.title}</h3>
              <p>{puzzles.pairs.describe}</p>
              <div className="seasonal__pairs">
                <ul>
                  {pack.pairsLeft.map((id) => (
                    <li key={id}>
                      <Picture id={id} label={name(id)} size={120} />
                    </li>
                  ))}
                </ul>
                <ul>
                  {pack.pairsRight.map((id, i) => (
                    <li key={`${i}-${id}`}>
                      <Picture id={id} label={name(id)} size={120} />
                    </li>
                  ))}
                </ul>
              </div>
              <p className="seasonal__how">{puzzles.pairs.how}</p>
            </article>

            <article className="seasonal__puzzle" aria-labelledby="seasonal-different">
              <h3 id="seasonal-different">{puzzles.different.title}</h3>
              <p>{puzzles.different.describe}</p>
              <ul className="seasonal__row">
                {pack.differentRow.map((id, i) => (
                  <li key={`${i}-${id}`}>
                    <Picture id={id} label={name(id)} size={120} />
                  </li>
                ))}
              </ul>
              <p className="seasonal__how">{puzzles.different.how}</p>
            </article>

            <article className="seasonal__puzzle" aria-labelledby="seasonal-color">
              <h3 id="seasonal-color">{puzzles.color.title}</h3>
              <p>{puzzles.color.describe}</p>
              <div className="seasonal__color">
                <Picture id={pack.color} label={name(pack.color)} size={240} />
              </div>
              <p className="seasonal__how">{puzzles.color.how}</p>
            </article>
          </section>
        )}
      </div>
    </GameFrame>
  );
}
