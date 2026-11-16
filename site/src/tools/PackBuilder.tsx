import { useEffect, useMemo, useState } from 'react';
import { ASSUMED_NOTE } from '../data/materials';
import {
  DEFAULT_VARIATION,
  MAX_CARDS,
  blockedNote,
  combineNeeds,
  countRequested,
  droppedNote,
  groupLabel,
  idsWithVersion,
  linkLeftOutNote,
  optionalExtras,
  packKey,
  pagesAtMost,
  parsePackState,
  printLabel,
  quotedName,
  savedLeftOutNote,
  serializePackState,
  whyNotAdded,
  type PackState,
} from '../lib/pack';
import { browserStorage, loadSaved } from '../lib/saved-activities';

export interface PackCardInfo {
  id: string;
  name: string;
  summary: string;
  typeLabel: string;
  /** The variation kinds this card has. */
  variations: string[];
  needs: string[][];
  optional: string[];
}

interface Props {
  cards: PackCardInfo[];
  variations: { kind: string; label: string }[];
  /** The date the builder's layout last changed; printed as the version. */
  version: string;
  /** The site address printed on the cover. */
  address: string;
}

/**
 * The printable pack builder (WEB-017): pick up to eight cards and one version, see the supply list and how many
 * pages it prints on, and print. The cards are already on the page, hidden; this chooses which show and in what
 * order. This page keeps nothing and sends nothing itself: the pack is the address.
 */
export function PackBuilder({ cards, variations, version, address }: Props) {
  const ids = useMemo(() => new Set(cards.map((c) => c.id)), [cards]);
  const kinds = useMemo(() => new Set(variations.map((v) => v.kind)), [variations]);
  const byId = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards]);
  const names = useMemo(() => new Map(variations.map((v) => [v.kind, v.label])), [variations]);
  const versionName = (kind: string) => quotedName(names.get(kind) ?? kind);

  const [state, setState] = useState<PackState>({ cards: [], variation: DEFAULT_VARIATION });
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const search = window.location.search;
    const parsed = parsePackState(search, ids, kinds);
    // A link made by hand, or an old one, may name a card that is gone or has no such version. A card is in a pack
    // only with the chosen version, and a pack that opens shorter than the link named says so.
    const kept = idsWithVersion(parsed.cards, byId, parsed.variation);
    setState({ cards: kept, variation: parsed.variation });
    setMessage(linkLeftOutNote(countRequested(search), kept.length, quotedName(names.get(parsed.variation) ?? parsed.variation)));
    setSaved(loadSaved(browserStorage()).filter((id) => ids.has(id)));
    setReady(true);
  }, [ids, kinds, byId, names]);

  // The address holds the pack, so a link opens the same pack.
  useEffect(() => {
    if (!ready) return;
    const query = serializePackState(state);
    window.history.replaceState(null, '', query ? `${window.location.pathname}?${query}` : window.location.pathname);
  }, [state, ready]);

  // Show the chosen cards in order, with the chosen version showing on each.
  useEffect(() => {
    const holder = document.getElementById('pack-cards');
    if (!holder) return;
    const nodes = new Map([...holder.querySelectorAll<HTMLElement>('[data-pack-card]')].map((n) => [n.dataset.packCard ?? '', n] as const));
    for (const [id, node] of nodes) node.hidden = !state.cards.includes(id);
    for (const id of state.cards) {
      const node = nodes.get(id);
      if (node) holder.append(node);
    }
    for (const node of holder.querySelectorAll<HTMLElement>('[data-variation]')) node.hidden = node.dataset.variation !== state.variation;
  }, [state]);

  const chosen = useMemo(
    () =>
      state.cards.flatMap((id) => {
        const card = byId.get(id);
        return card ? [card] : [];
      }),
    [state.cards, byId],
  );
  const full = chosen.length >= MAX_CARDS;
  const supplies = useMemo(() => combineNeeds(chosen.map((c) => c.needs)), [chosen]);
  const extras = useMemo(() => optionalExtras(chosen), [chosen]);
  const query = serializePackState(state);
  const pages = pagesAtMost(chosen.length);

  // A box that cannot be ticked stays reachable and explains itself, here and in a note, rather than going dead.
  const toggle = (id: string) => {
    if (!state.cards.includes(id)) {
      const reason = whyNotAdded(byId.get(id), state.variation, state.cards.length);
      if (reason) {
        setMessage(blockedNote(reason, versionName(state.variation)));
        return;
      }
    }
    setMessage('');
    setState((s) => ({ ...s, cards: s.cards.includes(id) ? s.cards.filter((c) => c !== id) : [...s.cards, id].slice(0, MAX_CARDS) }));
  };

  // A card can be in the pack only with the chosen version, so changing the version takes out cards without it.
  const chooseVariation = (kind: string) => {
    const keep = idsWithVersion(state.cards, byId, kind);
    setState({ cards: keep, variation: kind });
    setMessage(droppedNote(state.cards.length - keep.length, versionName(kind)));
  };

  const clear = () => {
    setMessage('');
    setState((s) => ({ ...s, cards: [] }));
  };

  const fromSaved = () => {
    const keep = idsWithVersion(saved, byId, state.variation).slice(0, MAX_CARDS);
    setState((s) => ({ ...s, cards: keep }));
    setMessage(savedLeftOutNote(saved.length - keep.length, versionName(state.variation)));
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setMessage('Link copied. It opens this same pack.');
    } catch {
      setMessage('Copy the address from your browser bar. It holds this pack.');
    }
  };

  return (
    <>
      <section className="pack-picker no-print" aria-labelledby="pack-pick">
        <h2 id="pack-pick">1. Choose up to {MAX_CARDS} activities</h2>
        <p>
          Five to eight make a good pack. They print in the order you tick them. The version you choose below shows on every card.
        </p>
        <fieldset className="pack-picker__version">
          <legend>Which version should print on each card?</legend>
          {variations.map((v) => (
            <label key={v.kind} className="choice">
              <input type="radio" name="pack-variation" value={v.kind} checked={state.variation === v.kind} onChange={() => chooseVariation(v.kind)} />
              <span>{v.label}</span>
            </label>
          ))}
        </fieldset>
        <div className="btn-row">
          {saved.length > 0 && (
            <button type="button" className="btn" onClick={fromSaved}>
              Start from my saved activities ({saved.length})
            </button>
          )}
          {/* Never disabled: a keyboard user who presses it would otherwise lose their place when it switched itself off. */}
          <button type="button" className="btn" onClick={clear}>
            Clear the pack
          </button>
        </div>
        {full && (
          <p id="pack-full-note" className="pack-picker__note">
            The pack is full: {MAX_CARDS} of {MAX_CARDS}. Untick an activity to add another.
          </p>
        )}
        <ul className="pack-picker__list">
          {cards.map((c) => {
            const on = state.cards.includes(c.id);
            const reason = on ? null : whyNotAdded(c, state.variation, state.cards.length);
            return (
              <li key={c.id}>
                <label className="pack-picker__row">
                  <input
                    type="checkbox"
                    checked={on}
                    aria-disabled={reason !== null || undefined}
                    aria-describedby={reason === 'full' ? 'pack-full-note' : undefined}
                    onChange={() => toggle(c.id)}
                  />
                  <span>
                    <strong>{c.name}</strong> <span className="muted">· {c.typeLabel}. {c.summary}</span>
                    {reason === 'version' && <span className="muted"> No {versionName(state.variation)} version.</span>}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        <p className="muted pack-picker__privacy">
          This page keeps nothing and sends nothing. The pack is only in the address of the page, as activity names and a
          version, so a link opens the same pack. If you have allowed visit counts (see{' '}
          <a href="/privacy/#google-analytics">the privacy notice</a>), the address of each page you open is counted, so a
          pack link you open is counted too.
        </p>
      </section>

      <section className="pack-summary no-print" aria-labelledby="pack-summary-title">
        <h2 id="pack-summary-title">2. Print it</h2>
        <p role="status" aria-live="polite">
          {chosen.length === 0 ? 'Nothing chosen yet.' : `${chosen.length} of ${MAX_CARDS} chosen${full ? ': that is the most a pack holds' : ''}.`}
        </p>
        {chosen.length > 0 && (
          <p>
            It prints on up to {pages} pages: a cover with the supply list, then about two pages for each activity. Your printer
            settings may use fewer.
          </p>
        )}
        {/* Always on the page, so a screen reader is already listening when a message arrives. */}
        <p className="muted pack-summary__message" role="status" aria-live="polite">{message}</p>
        <div className="btn-row">
          <button type="button" className="btn btn--primary" disabled={chosen.length === 0} onClick={() => window.print()}>
            Print my pack
          </button>
          <button type="button" className="btn" disabled={chosen.length === 0} onClick={copyLink}>
            Copy a link to this pack
          </button>
        </div>
      </section>

      {chosen.length > 0 && (
        <header className="pack-cover pack-cover--built" aria-labelledby="pack-cover-title">
          <p className="eyebrow">Printable pack</p>
          <h2 id="pack-cover-title">My activity pack</h2>
          <p>
            {chosen.length} {chosen.length === 1 ? 'activity' : 'activities'}, each in the {versionName(state.variation)} version. Pause or stop whenever the person wants to.
          </p>
          <ol className="activity-list">
            {chosen.map((c) => <li key={c.id}>{c.name}</li>)}
          </ol>
          <h2>Main supplies</h2>
          <p>Tick what you already have. Each card lists everything else it needs, and things to use instead.</p>
          <div className="pack-supplies pack-supplies--one">
            <div>
              <ul className="pack-checklist">
                {supplies.map((g) => <li key={g.join('|')}>{groupLabel(g)}</li>)}
                {supplies.length === 0 && <li>No main supplies. Each card lists what to set out.</li>}
              </ul>
              {extras.length > 0 && (
                <p className="muted">Nice to have: {extras.map((t) => printLabel(t).toLowerCase()).join('; ')}.</p>
              )}
              <p className="muted">{ASSUMED_NOTE}</p>
            </div>
          </div>
          <p className="pack-cover__source">
            Pack {packKey(state)} · Version {version} · {address}/activity/pack/{query ? `?${query}` : ''} · Free to print and share for personal and noncommercial use.
          </p>
        </header>
      )}
    </>
  );
}
