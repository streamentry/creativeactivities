import { useEffect, useMemo, useState } from 'react';
import { choiceLabels, loadHave, matchCards, saveHave, unlockers, type Needs } from '../lib/what-i-have';
import { browserStorage } from '../lib/saved-activities';

export interface WhatIHaveCard {
  id: string;
  name: string;
  summary: string;
  typeLabel: string;
  facts: string[];
  needs: Needs;
  optional: string[];
  substitutions: string[];
}

export interface WhatIHaveGroup {
  id: string;
  label: string;
  tags: { id: string; label: string }[];
}

interface Props {
  cards: WhatIHaveCard[];
  groups: WhatIHaveGroup[];
  assumed: string;
}

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

/**
 * "What I have": tick everyday items and see the activities that need only those. A card never needs an
 * item that was not ticked. The list is kept in this browser only and can be cleared.
 */
export function WhatIHave({ cards, groups, assumed }: Props) {
  const [have, setHave] = useState<ReadonlySet<string>>(new Set());
  const [canKeep, setCanKeep] = useState(true);

  useEffect(() => {
    setHave(new Set(loadHave(browserStorage())));
  }, []);

  const update = (next: Set<string>) => {
    setHave(next);
    setCanKeep(saveHave(browserStorage(), [...next]));
  };

  const toggle = (id: string) => {
    const next = new Set(have);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    update(next);
  };

  const byId = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards]);
  const labelOf = useMemo(() => new Map(groups.flatMap((g) => g.tags.map((t) => [t.id, t.label] as const))), [groups]);
  const matches = useMemo(() => matchCards(cards, have), [cards, have]);
  const tips = useMemo(() => unlockers(matches.oneAway, have).slice(0, 3), [matches, have]);

  return (
    <div className="wih">
      <section aria-labelledby="wih-tick">
        <h2 id="wih-tick">Tick what you have</h2>
        <p className="muted">{assumed}</p>
        <div className="wih__groups">
          {groups.map((g) => {
            const ticked = g.tags.filter((t) => have.has(t.id)).length;
            return (
              <fieldset key={g.id} className="wih__group">
                <legend>
                  {g.label}
                  {ticked > 0 && <span className="wih__ticked"> · {ticked} ticked</span>}
                </legend>
                <ul className="wih__items">
                  {g.tags.map((t) => (
                    <li key={t.id}>
                      <label className="wih__item">
                        <input type="checkbox" checked={have.has(t.id)} onChange={() => toggle(t.id)} />
                        <span>{t.label}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>
            );
          })}
        </div>
        <div className="wih__actions">
          <button type="button" className="btn" disabled={have.size === 0} onClick={() => update(new Set())}>
            Clear my list
          </button>
          <p className="muted" role="status">
            {canKeep
              ? 'Your list stays on this device. Nothing is sent anywhere.'
              : 'This browser would not keep your list, so it will clear when you close the page.'}
          </p>
        </div>
      </section>

      <section aria-labelledby="wih-ready" className="wih__results">
        <h2 id="wih-ready" aria-live="polite">
          {matches.ready.length} {plural(matches.ready.length, 'activity', 'activities')} you can start now
        </h2>
        <p>
          Each one needs only what you ticked. Open it for the full list, the steps and an easier version.
        </p>
        <ul className="activity-grid bento-grid">
          {matches.ready.map((id) => {
            const card = byId.get(id);
            if (!card) return null;
            const extras = card.optional.map((t) => labelOf.get(t)).filter((l): l is string => Boolean(l));
            return (
              <li key={id} className="wih__cell">
                <a className="activity-card" href={`/activity/${id}/`}>
                  <span className="activity-card__type">{card.typeLabel}</span>
                  <span className="activity-card__name">{card.name}</span>
                  <span className="activity-card__summary">{card.summary}</span>
                  <span className="activity-card__glance">
                    {card.facts.map((f) => (
                      <span key={f} className="activity-card__fact">{f} </span>
                    ))}
                  </span>
                </a>
                {extras.length > 0 && <p className="wih__extras muted">Nice to have: {extras.join('; ').toLocaleLowerCase('en')}.</p>}
                {card.substitutions.length > 0 && (
                  <details className="wih__swaps">
                    <summary>If something is missing</summary>
                    <ul className="activity-list">
                      {card.substitutions.map((s) => <li key={s}>{s}</li>)}
                    </ul>
                  </details>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {matches.oneAway.length > 0 && (
        <section aria-labelledby="wih-near" className="wih__results">
          <h2 id="wih-near">One thing short</h2>
          <p>These are not ready yet. Each is missing a single thing, named here.</p>
          {tips.length > 0 && (
            <>
              <h3>What would add the most</h3>
              <ul className="activity-list">
                {tips.map((t) => (
                  <li key={t.id}>
                    {labelOf.get(t.id) ?? t.id}: {t.unlocks} more
                  </li>
                ))}
              </ul>
            </>
          )}
          <h3>Each one, and what it needs</h3>
          <ul className="activity-list">
            {matches.oneAway.map((o) => {
              const card = byId.get(o.id);
              if (!card) return null;
              return (
                <li key={o.id}>
                  <a href={`/activity/${o.id}/`}>{card.name}</a> needs {choiceLabels(o.missing).join(' or ').toLocaleLowerCase('en')}.
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
