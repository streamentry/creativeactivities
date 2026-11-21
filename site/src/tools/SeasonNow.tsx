import { useEffect, useState } from 'react';
import { SEASON_PAGE_BY_ID } from '../data/seasons';
import { currentSeason, hemisphereFromLocale, seasonCalendar, type Hemisphere, type HemisphereChoice } from '../lib/seasons';

const CHOICES: readonly { value: HemisphereChoice; label: string }[] = [
  { value: 'north', label: 'Northern half' },
  { value: 'south', label: 'Southern half' },
  { value: 'neither', label: 'Not four seasons' },
];

/**
 * "Which season is it where you are?" The answer follows the half of the world
 * the visitor picks; until they pick, the language setting is used and the
 * page says it is a guess. Nothing is stored or sent: the choice lasts until
 * the page is closed.
 */
export function SeasonNow() {
  const [choice, setChoice] = useState<HemisphereChoice | null>(null);
  const [guess, setGuess] = useState<Hemisphere | null>(null);
  const [month, setMonth] = useState<number | null>(null);

  useEffect(() => {
    setGuess(hemisphereFromLocale(typeof navigator === 'undefined' ? undefined : navigator.language));
    setMonth(new Date().getMonth());
  }, []);

  if (month === null || guess === null) return null;

  const shown: HemisphereChoice = choice ?? guess;
  const season = currentSeason(new Date(2000, month, 15), shown, undefined);
  const page = season ? SEASON_PAGE_BY_ID[season] : null;

  return (
    <section className="season-now" aria-labelledby="season-now-title">
      <h2 id="season-now-title">Which season is it where you are?</h2>
      <fieldset className="season-now__choices">
        <legend>Where do you live?</legend>
        {CHOICES.map((c) => (
          <label key={c.value} className="season-now__choice">
            <input
              type="radio"
              name="hemisphere"
              value={c.value}
              checked={shown === c.value}
              onChange={() => setChoice(c.value)}
            />
            <span>{c.label}</span>
          </label>
        ))}
      </fieldset>
      {shown !== 'neither' && (
        <>
          <h3 id="season-year-title">The year where you are</h3>
          <ol className="season-year" aria-labelledby="season-year-title">
            {seasonCalendar(shown).map((m) => (
              <li key={m.month} aria-current={m.month === month ? 'date' : undefined} className={m.month === month ? 'season-year__now' : undefined}>
                <span className="season-year__month">{m.name}</span>{' '}
                <a href={`/seasons/${m.season}/`}>{SEASON_PAGE_BY_ID[m.season].eyebrow.toLocaleLowerCase('en')}</a>
                {m.month === month ? <span className="season-year__marker"> (this month)</span> : null}
              </li>
            ))}
          </ol>
        </>
      )}
      <p className="season-now__answer" role="status">
        {page ? (
          <>
            {choice === null ? 'We guess it is ' : 'It is '}
            <a href={`/seasons/${page.id}/`}>{page.eyebrow.toLocaleLowerCase('en')}</a>
            {choice === null ? ' where you are, from your language setting. Change it above if that is wrong.' : '.'}
          </>
        ) : (
          'Pick any season below, or use the any-time activities that work in any weather.'
        )}
      </p>
    </section>
  );
}
