import { useEffect, useMemo, useRef, useState } from 'react';
import { MORE_FACETS, interpret, planFinderChanges, type Chip, type Facet } from '../lib/situation';

/**
 * Sets the finder's choices to the chips, and puts back to "any" a question a chip no longer names.
 * Only questions this box has set are touched, so choices a person made by hand stay as they are.
 * One change event follows, so the finder shows the results and writes the address once.
 */
export function applyToFinder(chips: readonly Chip[], applied: Map<Facet, string>): boolean {
  const form = document.getElementById('finder');
  if (!(form instanceof HTMLFormElement)) return false;
  const plan = planFinderChanges(chips, applied);
  let changed = false;
  for (const [facet, value] of plan.set) {
    const input = form.querySelector<HTMLInputElement>(`input[name="${facet}"][value="${value}"]`);
    if (input && !input.checked) {
      input.checked = true;
      changed = true;
    }
  }
  applied.clear();
  for (const [facet, value] of plan.applied) applied.set(facet, value);
  if (!changed) return false;
  // The optional questions sit behind "More ways to fit the moment"; open it so the choice can be seen.
  if (chips.some((c) => MORE_FACETS.has(c.facet))) form.querySelector('.finder__more')?.setAttribute('open', '');
  form.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}

/**
 * "Describe your situation": a few words become choices on the finder. Nothing typed here is sent or saved.
 * A chip can be removed; focus stays in the box.
 */
export function DescribeSituation() {
  const [text, setText] = useState('');
  const [dismissed, setDismissed] = useState<ReadonlySet<string>>(new Set());
  const [settled, setSettled] = useState('');
  const applied = useRef(new Map<Facet, string>());
  const box = useRef<HTMLInputElement>(null);

  const chips = useMemo(
    () => interpret(text).filter((c) => !dismissed.has(`${c.facet}=${c.value}`)),
    [text, dismissed],
  );

  // Wait for a pause in typing, so the finder is not redrawn and the history is not filled with every letter.
  useEffect(() => {
    const id = window.setTimeout(() => {
      applyToFinder(chips, applied.current);
      setSettled(text.trim());
    }, 350);
    return () => window.clearTimeout(id);
  }, [chips, text]);

  const remove = (chip: Chip) => {
    setDismissed(new Set([...dismissed, `${chip.facet}=${chip.value}`]));
    box.current?.focus();
  };

  const onChange = (value: string) => {
    setText(value);
    if (value.trim() === '') setDismissed(new Set());
  };

  return (
    <div className="describe">
      <label htmlFor="describe-box">Or describe what you are looking for, in your own words (optional)</label>
      <input
        ref={box}
        id="describe-box"
        type="text"
        autoComplete="off"
        spellCheck
        value={text}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby="describe-note describe-status"
        placeholder="For example: my dad likes music but tires quickly"
      />
      <p id="describe-note" className="muted">
        Your words stay on this page. They are not sent or saved, and we never ask about a diagnosis.
      </p>
      {chips.length > 0 && (
        <ul className="describe__chips" aria-label="Choices we read from your words">
          {chips.map((c) => (
            <li key={`${c.facet}=${c.value}`}>
              <button type="button" className="describe__chip" onClick={() => remove(c)} aria-label={`Remove ${c.label}`}>
                {c.label} <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p id="describe-status" role="status" aria-live="polite" className="muted">
        {text.trim() === '' || settled !== text.trim()
          ? ''
          : chips.length > 0
            ? `We read your words as ${chips.length} ${chips.length === 1 ? 'choice' : 'choices'}. Remove any that are wrong.`
            : 'We could not turn that into choices. Use the filters below.'}
      </p>
    </div>
  );
}
