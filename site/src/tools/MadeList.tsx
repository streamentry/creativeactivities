import { useEffect, useMemo, useState } from 'react';
import { loadTried } from '../lib/activity-feedback';
import { loadNotes, madeRows, saveNotes, setNote } from '../lib/made-list';
import { browserStorage } from '../lib/saved-activities';

interface Props {
  /** Every listed activity's short name and title, so a tried one can be shown by name. */
  names: Record<string, string>;
  /** The paper version: the same list with the notes as plain text and no controls. */
  printable?: boolean;
}

/**
 * COM-024 "My made list". The tried list and the notes are read from this
 * browser after the page loads, so the server and the first client render both
 * show the same loading line. Nothing is sent anywhere.
 */
export function MadeList({ names, printable = false }: Props) {
  const [tried, setTried] = useState<string[] | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [canKeep, setCanKeep] = useState(true);

  useEffect(() => {
    const storage = browserStorage();
    setTried(loadTried(storage));
    setNotes(loadNotes(storage));
  }, []);

  const rows = useMemo(() => madeRows(tried ?? [], notes, names), [tried, notes, names]);

  if (tried === null) {
    return <p className="made__status" role="status">Reading your list from this browser.</p>;
  }

  const edit = (slug: string, text: string) => {
    const next = setNote(notes, slug, text);
    setNotes(next);
    setCanKeep(saveNotes(browserStorage(), next));
  };

  if (rows.length === 0) {
    return (
      <div className="made">
        <p className="made__status">
          Nothing is on your list yet. When you try an activity, press “We tried this” on its page and it will appear here.
        </p>
        {!printable && (
          <p>
            <a className="btn" href="/activity/">Find an activity</a>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="made">
      {!printable && (
        <div className="made__controls no-print">
          <p className="made__status" role="status" aria-live="polite">
            {canKeep
              ? 'Notes are saved in this browser only.'
              : 'This browser did not allow saving, so notes are kept only while this page is open.'}
          </p>
          <div className="made__buttons">
            <button type="button" className="btn btn--primary" onClick={() => window.print()}>
              Print this list
            </button>
            <a className="btn" href="/made/print/">Open the printable list</a>
          </div>
        </div>
      )}
      <ol className="made__list">
        {rows.map((row) => (
          <li className="made__item" key={row.slug}>
            <h2 className="made__name">
              <a href={`/activity/${row.slug}/`}>{row.name}</a>
            </h2>
            {printable ? (
              row.note && <p className="made__note-text">{row.note}</p>
            ) : (
              <div className="made__note">
                <label htmlFor={`made-note-${row.slug}`}>Your note on {row.name} (optional, up to 280 characters)</label>
                <textarea
                  id={`made-note-${row.slug}`}
                  className="made__textarea"
                  rows={3}
                  maxLength={280}
                  value={row.note}
                  onChange={(event) => edit(row.slug, event.target.value)}
                />
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
