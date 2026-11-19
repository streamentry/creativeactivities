import { useEffect, useState } from 'react';
import { pictureUrl } from '../data/pictures';
import { PACK_SEASONS, seasonPack, type SeasonPack } from '../data/seasonal-pack';
import type { PlayProps } from '../i18n/play';
import type { SeasonId } from '../lib/seasons';
import { GameFrame } from './shared/GameFrame';
import { Icon } from './shared/Icon';
import { sounds } from './shared/sound';

/**
 * Seasonal puzzle pack (GAME-040): the person chooses a season, sees its three paper puzzles and prints one page.
 * A rest day replaces the puzzles with one calm line. The season is always chosen by the person, never taken
 * from the date or place. Nothing here times, scores, ranks or saves anything, and no answer is shown.
 */
const DEFAULT_SEASON: SeasonId = 'spring';

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
  const [season, setSeason] = useState<SeasonId>(DEFAULT_SEASON);
  const [restDay, setRestDay] = useState(false);
  const pack: SeasonPack = seasonPack(season);
  const name = (id: string) => pictureNames[id] ?? ui.tile.picture;

  // The printed sheet holds one page for each season; only the chosen season prints (as in Decorate a card).
  useEffect(() => {
    for (const el of document.querySelectorAll<HTMLElement>('[data-season-pack]')) {
      el.hidden = el.dataset.seasonPack !== season;
    }
  }, [season]);

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
          <legend>{text.seasonLegend}</legend>
          {PACK_SEASONS.map((s) => (
            <label key={s} className="seasonal__choice">
              <input type="radio" name="season" value={s} checked={season === s} onChange={() => setSeason(s)} />
              <span>{text.seasons[s]}</span>
            </label>
          ))}
        </fieldset>

        <p className="seasonal__when">
          <strong>{text.whenLabel}:</strong> {pack.months}
        </p>

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
