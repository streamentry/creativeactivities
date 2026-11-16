import { useEffect, useMemo, useRef, useState } from 'react';
import { MORE_FACETS, interpret, overrideFacet, planFinderChanges, type Chip, type Facet } from '../lib/situation';

/**
 * What the box has done to the finder, and what the person has since changed by hand. `applied` holds the value the
 * box set for each question it owns; `overridden` holds a question the person changed after the box set it, with the
 * value the box had set, so the box leaves it alone for as long as the words say the same thing about it.
 */
export interface Ownership {
  applied: Map<Facet, string>;
  overridden: Map<Facet, string>;
}

/**
 * Sets the finder's choices to the chips, and puts back to "any" a question a chip no longer names.
 * Only questions this box has set are touched, so choices a person made by hand stay as they are.
 * One change event follows, so the finder shows the results and writes the address once.
 */
export function applyToFinder(chips: readonly Chip[], own: Ownership): boolean {
  const form = document.getElementById('finder');
  if (!(form instanceof HTMLFormElement)) return false;
  const plan = planFinderChanges(chips, own.applied, own.overridden);
  let changed = false;
  for (const [facet, value] of plan.set) {
    const input = form.querySelector<HTMLInputElement>(`input[name="${facet}"][value="${value}"]`);
    if (input && !input.checked) {
      input.checked = true;
      changed = true;
    }
  }
  own.applied = plan.applied;
  own.overridden = plan.overridden;
  if (!changed) return false;
  // The optional questions sit behind "More ways to fit the moment"; open it so the choice can be seen.
  if (chips.some((c) => MORE_FACETS.has(c.facet))) form.querySelector('.finder__more')?.setAttribute('open', '');
  // This event is not the person's own (`isTrusted` is false), so the listener below does not take it for a hand choice.
  form.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}

/** A chip is removed for the words that made it: other words that mean the same bring it back. */
const dismissKey = (c: Chip) => `${c.facet}=${c.value}:${c.source}`;

/**
 * "Describe your situation": a few words become choices on the finder. The words are not sent, saved or put in the
 * address. A chip can be removed; focus stays in the box. A choice the person makes by hand afterwards is not
 * overruled, and going back in the browser clears the box so it never describes a finder it no longer matches.
 */
export function DescribeSituation() {
  const [text, setText] = useState('');
  const [dismissed, setDismissed] = useState<ReadonlySet<string>>(new Set());
  const [settled, setSettled] = useState('');
  const own = useRef<Ownership>({ applied: new Map(), overridden: new Map() });
  const box = useRef<HTMLInputElement>(null);

  const read = useMemo(() => interpret(text), [text]);
  const chips = useMemo(() => read.filter((c) => !dismissed.has(dismissKey(c))), [read, dismissed]);
  // The finder is only touched when what the chips say changes, never because another letter was typed: a choice the
  // person made by hand in between must not snap back.
  const chipsKey = chips.map((c) => `${c.facet}=${c.value}`).join('|');

  // Wait for a pause in typing, so the finder is not redrawn and the history is not filled with every letter.
  useEffect(() => {
    const id = window.setTimeout(() => applyToFinder(chips, own.current), 350);
    return () => window.clearTimeout(id);
    // `chips` is read when the timer fires; the effect runs again only when what they say has changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chipsKey]);

  useEffect(() => {
    const id = window.setTimeout(() => setSettled(text.trim()), 350);
    return () => window.clearTimeout(id);
  }, [text]);

  // A change the person makes to the finder by hand, and going back or forward in the browser.
  useEffect(() => {
    const form = document.getElementById('finder');
    const onChange = (event: Event) => {
      const target = event.target;
      if (!event.isTrusted || !(target instanceof HTMLInputElement)) return;
      own.current = { ...own.current, ...overrideFacet(own.current.applied, own.current.overridden, target.name as Facet) };
    };
    const onPopState = () => {
      own.current = { applied: new Map(), overridden: new Map() };
      setText('');
      setDismissed(new Set());
      setSettled('');
    };
    form?.addEventListener('change', onChange);
    window.addEventListener('popstate', onPopState);
    return () => {
      form?.removeEventListener('change', onChange);
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  const remove = (chip: Chip) => {
    setDismissed(new Set([...dismissed, dismissKey(chip)]));
    box.current?.focus();
  };

  const onChange = (value: string) => {
    setText(value);
    if (value.trim() === '') setDismissed(new Set());
  };

  const status = (() => {
    if (text.trim() === '' || settled !== text.trim()) return '';
    if (chips.length > 0) return `We read your words as ${chips.length} ${chips.length === 1 ? 'choice' : 'choices'}. Remove any that are wrong.`;
    if (read.length > 0) return 'You removed what we read. Use the filters below.';
    return 'We could not turn that into choices. Use the filters below.';
  })();

  return (
    <div className="describe">
      <label htmlFor="describe-box">Or describe what you are looking for, in your own words (optional)</label>
      <input
        ref={box}
        id="describe-box"
        type="text"
        autoComplete="off"
        spellCheck={false}
        value={text}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby="describe-note describe-status"
        placeholder="For example: my dad likes music but tires quickly"
      />
      <p id="describe-note" className="muted">
        Your words stay on this page: they are not sent, saved or put in the address, and we never ask about a diagnosis.
        The choices we read from them are put in the filters below, so they appear in the address as any filter you pick by hand does.
      </p>
      {chips.length > 0 && (
        <ul className="describe__chips" aria-label="Choices we read from your words">
          {chips.map((c) => (
            <li key={dismissKey(c)}>
              <button type="button" className="describe__chip" onClick={() => remove(c)} aria-label={`Remove ${c.label}`}>
                {c.label} <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p id="describe-status" role="status" aria-live="polite" className="muted">
        {status}
      </p>
    </div>
  );
}
