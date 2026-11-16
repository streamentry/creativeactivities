import { useEffect, useMemo, useState } from 'react';
import { KIND_LABELS, prepare, search, type SearchEntry } from '../lib/search';

type Load = { state: 'loading' } | { state: 'ready'; entries: SearchEntry[] } | { state: 'failed' };

/**
 * Site search. The index downloads once; the question is matched in this browser. Nothing typed here is sent,
 * stored or counted, and it is kept out of the address so it cannot reach page-view reports.
 */
export function Search() {
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const [question, setQuestion] = useState('');

  useEffect(() => {
    let live = true;
    fetch('/search-index.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((file: { entries: SearchEntry[] }) => live && setLoad({ state: 'ready', entries: file.entries }))
      .catch(() => live && setLoad({ state: 'failed' }));
    return () => {
      live = false;
    };
  }, []);

  const prepared = useMemo(() => (load.state === 'ready' ? prepare(load.entries) : []), [load]);
  const asked = question.trim();
  const result = useMemo(() => (asked ? search(prepared, asked) : null), [prepared, asked]);

  return (
    <div className="site-search">
      <form role="search" aria-label="Site search" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="site-search-box" className="site-search__label">
          Search activities, situations, games and guides
        </label>
        <input
          id="site-search-box"
          className="site-search__box"
          type="search"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          aria-describedby="site-search-note"
        />
        <p id="site-search-note" className="muted">
          What you type stays on this device. It is not sent, saved or counted.
        </p>
      </form>

      {load.state === 'failed' && (
        <p role="alert">
          Search could not load. <a href="/activity/">Use the activity finder</a> to look by time, materials and setting instead.
        </p>
      )}

      <div role="status" aria-live="polite" className="site-search__status">
        {load.state === 'loading' && asked ? 'Loading search…' : null}
        {result && result.match === 'none' && load.state === 'ready' ? (
          <p>
            Nothing matched. Try fewer or simpler words, or <a href="/activity/">use the activity finder</a> to look by time,
            materials and setting.
          </p>
        ) : null}
        {result && result.match === 'some' ? (
          <p>No page matches every word. These are the closest matches ({result.count}).</p>
        ) : null}
        {result && result.match === 'all' ? <p>{result.count} {result.count === 1 ? 'result' : 'results'}.</p> : null}
      </div>

      {result &&
        result.groups.map((g) => (
          <section key={g.kind} aria-labelledby={`site-search-${g.kind}`} className="site-search__group">
            <h2 id={`site-search-${g.kind}`}>{KIND_LABELS[g.kind]}</h2>
            <ul className="activity-list">
              {g.hits.map(({ entry }) => (
                <li key={entry.url}>
                  <a href={entry.url}>{entry.title}</a>
                  <span className="muted"> · {entry.summary}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
    </div>
  );
}
