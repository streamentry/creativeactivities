import type { PlayProps } from '../i18n/play';
import { PEOPLE_COUNT, TARGET_CENTER, TARGET_SIZE, ringMarks } from '../data/seated-toss';
import { PAUSE_LINE } from '../lib/scope';
import { GameFrame } from './shared/GameFrame';
import { Icon } from './shared/Icon';
import { sounds } from './shared/sound';

/**
 * Seated toss tally (GAME-049): a game played with a real bean bag at a real table. The page gives the steps,
 * the safety advice and the printed target and tally; there is nothing to tap but Print and Rest. The tally is
 * kept on paper, so nothing here counts, times or saves anything. The safety block is always shown.
 */
export default function SeatedToss(props: PlayProps) {
  const { ui, lang } = props;
  const rings = ringMarks(ui.seatedToss.rings);
  // The lists are read whole first, because the text-key test stops reading a key at the first method call.
  const names: readonly string[] = ui.seatedToss.people;
  const people = names.slice(0, PEOPLE_COUNT);
  const flags: readonly string[] = ui.seatedToss.flags;
  const safety: readonly string[] = ui.seatedToss.safety;
  const steps: readonly string[] = ui.seatedToss.steps;

  return (
    <GameFrame
      ui={ui}
      lang={lang}
      guidance={ui.seatedToss.guidance}
      readAloudText={ui.seatedToss.guidance}
      place={{
        slug: 'seated-toss',
        // Nothing is kept: the tally is on paper and the page is the same on every visit.
        save: () => ({}),
        check: () => false,
        restore: () => undefined,
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
            {ui.seatedToss.print}
          </button>
        </div>
      }
    >
      <div className="toss">
        <section className="toss__safety" aria-labelledby="toss-safety">
          <h2 id="toss-safety">{ui.seatedToss.safetyHeading}</h2>
          <p className="toss__safety-line">{ui.seatedToss.safetyLine}</p>
          <ul className="toss__flags">
            {flags.map((flag) => (
              <li key={flag}>{flag}</li>
            ))}
          </ul>
          <ul className="toss__safety-list">
            {safety.map((line) => (
              <li key={line}>{line}</li>
            ))}
            <li>{PAUSE_LINE}</li>
          </ul>
        </section>

        <section aria-labelledby="toss-steps">
          <h2 id="toss-steps">{ui.seatedToss.stepsHeading}</h2>
          <ol className="toss__steps">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <figure className="toss__preview">
          <div className="toss__sheet" role="img" aria-label={ui.seatedToss.previewLabel}>
            <svg className="toss__target" viewBox={`0 0 ${TARGET_SIZE} ${TARGET_SIZE}`} focusable="false" aria-hidden="true">
              {rings.map((ring) => (
                <circle key={ring.id} className="toss__ring" data-ring={ring.id} cx={TARGET_CENTER} cy={TARGET_CENTER} r={ring.radius} />
              ))}
              {rings.map((ring) => (
                <text key={ring.id} className="toss__ring-name" x={TARGET_CENTER} y={ring.nameY} textAnchor="middle">
                  {ring.name}
                </text>
              ))}
            </svg>
            <table className="toss__tally">
              <thead>
                <tr>
                  <th scope="col">{ui.seatedToss.ringHeading}</th>
                  {people.map((person) => (
                    <th key={person} scope="col">
                      {person}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rings.map((ring) => (
                  <tr key={ring.id}>
                    <th scope="row">{ring.name}</th>
                    {people.map((person) => (
                      <td key={person}>
                        <span className="toss__box" />
                        <span className="toss__box" />
                        <span className="toss__box" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <figcaption>{ui.seatedToss.sheetHow}</figcaption>
        </figure>
      </div>
    </GameFrame>
  );
}
