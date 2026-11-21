import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { browserStorage, loadSaved } from '../lib/saved-activities';
import {
  MAX_IMPORT_BYTES,
  MAX_NAME_LENGTH,
  addCard,
  clearCollections,
  createCollection,
  deleteCollection,
  exportCollections,
  importCollections,
  loadCollections,
  removeCard,
  renameCollection,
  saveCollections,
  type Collections,
  type Outcome,
} from '../lib/saved-collections';

export interface CollectionCard {
  id: string;
  name: string;
}

interface Props {
  /** The activities a collection can hold: every listed card, by its short name. */
  catalog: CollectionCard[];
}

const newId = () => `${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
const plural = (n: number) => (n === 1 ? 'activity' : 'activities');

/**
 * Saved collections (WEB-028). Collections and the saved list are read after the
 * page loads, never on the server. A change is kept only when the browser accepts
 * it; otherwise the list stays as it was and the page says why.
 */
export function SavedCollections({ catalog }: Props) {
  const names = useMemo(() => new Map(catalog.map((c) => [c.id, c.name])), [catalog]);
  const known = useMemo(() => new Set(catalog.map((c) => c.id)), [catalog]);
  const [collections, setCollections] = useState<Collections>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [draftName, setDraftName] = useState('');
  const [renames, setRenames] = useState<Record<string, string>>({});
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    const storage = browserStorage();
    setCollections(loadCollections(storage, known));
    setSaved(loadSaved(storage).filter((k) => known.has(k)));
  }, [known]);

  /** Keeps the change only when the browser stores it. */
  const commit = (outcome: Outcome, success = ''): boolean => {
    if (!outcome.ok) {
      setMessage(outcome.message);
      return false;
    }
    if (!saveCollections(browserStorage(), outcome.collections)) {
      setMessage('This browser would not keep that change. Your collections are as they were.');
      return false;
    }
    setCollections(outcome.collections);
    setMessage(success);
    return true;
  };

  const onCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (commit(createCollection(collections, draftName, newId()), `Created “${draftName.trim()}”.`)) setDraftName('');
  };

  const onRename = (id: string) => {
    const name = renames[id] ?? '';
    if (commit(renameCollection(collections, id, name), 'Renamed the collection.')) {
      setRenames((r) => Object.fromEntries(Object.entries(r).filter(([k]) => k !== id)));
    }
  };

  const onDelete = (id: string, name: string) => {
    if (!window.confirm(`Delete the collection “${name}”? The activities stay saved. Only this collection is removed.`)) return;
    commit(deleteCollection(collections, id), `Deleted “${name}”.`);
  };

  const onAdd = (id: string) => {
    const key = picks[id] ?? '';
    if (!key) {
      setMessage('Choose an activity to add.');
      return;
    }
    if (commit(addCard(collections, id, key, known), `Added ${names.get(key) ?? 'the activity'}.`)) {
      setPicks((p) => ({ ...p, [id]: '' }));
    }
  };

  const onRemove = (id: string, key: string) => {
    commit(removeCard(collections, id, key), `Removed ${names.get(key) ?? 'the activity'}.`);
  };

  const onDownload = () => {
    if (collections.length === 0) {
      setMessage('There are no collections to download yet.');
      return;
    }
    const url = URL.createObjectURL(new Blob([exportCollections(collections)], { type: 'application/json;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'creative-activities-collections.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    setMessage('Downloaded your collections. The file holds the names and activity names only.');
  };

  const onImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      setMessage('That file is too large to be a collections file. Nothing was added.');
      return;
    }
    let text: string;
    try {
      text = await file.text();
    } catch {
      setMessage('Could not read that file. Nothing was added.');
      return;
    }
    const outcome = importCollections(text, known, collections, newId);
    const added = outcome.ok ? outcome.collections.length - collections.length : 0;
    commit(outcome, `Added ${added} ${added === 1 ? 'collection' : 'collections'} from the file.`);
  };

  const onClearAll = () => {
    if (!window.confirm('Remove every collection from this browser? This cannot be undone.')) return;
    if (!clearCollections(browserStorage())) {
      setMessage('This browser would not remove them. Your collections are as they were.');
      return;
    }
    setCollections([]);
    setMessage('Removed every collection from this browser.');
  };

  return (
    <section className="collections" id="collections" aria-labelledby="collections-title">
      <h2 id="collections-title">Collections</h2>
      <p>Group saved activities under a name, such as “Sunday with Dad”.</p>
      <p className="collections__warning">
        Collection names can contain personal information, such as a person’s name or where you go. They stay in this
        browser, and in any file you download. Do not use a name you would not want someone else to see.
      </p>

      <form className="collections__create" onSubmit={onCreate}>
        <label htmlFor="collection-name">Name for a new collection</label>
        <div className="collections__row">
          <input
            id="collection-name"
            type="text"
            maxLength={MAX_NAME_LENGTH}
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
          />
          <button type="submit" className="btn btn--primary">
            Create collection
          </button>
        </div>
      </form>

      {collections.length === 0 && <p className="muted">No collections yet.</p>}

      <div className="collections__list">
        {collections.map((c) => {
          const available = saved.filter((k) => !c.cards.includes(k));
          const pick = picks[c.id] ?? '';
          const rename = renames[c.id] ?? c.name;
          return (
            <article key={c.id} className="collection" aria-labelledby={`col-${c.id}`}>
              <h3 id={`col-${c.id}`}>{c.name}</h3>
              <p className="muted">
                {c.cards.length} {plural(c.cards.length)}
              </p>

              {c.cards.length > 0 && (
                <ul className="collection__cards">
                  {c.cards.map((key) => {
                    const cardName = names.get(key) ?? key;
                    return (
                      <li key={key}>
                        <a href={`/activity/${key}/`}>{cardName}</a>
                        <button
                          type="button"
                          className="btn btn--quiet"
                          aria-label={`Remove ${cardName} from ${c.name}`}
                          onClick={() => onRemove(c.id, key)}
                        >
                          Remove
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {available.length > 0 ? (
                <div className="collection__add">
                  <label htmlFor={`${c.id}-pick`}>Add a saved activity to {c.name}</label>
                  <div className="collections__row">
                    <select id={`${c.id}-pick`} value={pick} onChange={(e) => setPicks((p) => ({ ...p, [c.id]: e.target.value }))}>
                      <option value="">Choose an activity</option>
                      {available.map((key) => (
                        <option key={key} value={key}>
                          {names.get(key) ?? key}
                        </option>
                      ))}
                    </select>
                    <button type="button" className="btn btn--quiet" onClick={() => onAdd(c.id)}>
                      Add to this collection
                    </button>
                  </div>
                </div>
              ) : (
                <p className="muted">Save an activity on its page, then add it here.</p>
              )}

              <div className="collections__row">
                <label htmlFor={`${c.id}-rename`} className="collections__hidden-label">
                  New name for {c.name}
                </label>
                <input
                  id={`${c.id}-rename`}
                  type="text"
                  maxLength={MAX_NAME_LENGTH}
                  value={rename}
                  onChange={(e) => setRenames((r) => ({ ...r, [c.id]: e.target.value }))}
                />
                <button type="button" className="btn btn--quiet" onClick={() => onRename(c.id)}>
                  Rename
                </button>
                <button type="button" className="btn btn--quiet" onClick={() => onDelete(c.id, c.name)}>
                  Delete {c.name}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="collections__files">
        <h3>Keep a copy, or move to another device</h3>
        <p className="muted">
          A file holds the collection names and activity names only. Choose a file you made here to add its collections
          to this browser. A file that does not match is refused and nothing is added.
        </p>
        <div className="collections__row">
          <button type="button" className="btn btn--quiet" onClick={onDownload}>
            Download collections
          </button>
          <label className="btn btn--quiet collections__file-label">
            Load a collections file
            <input type="file" accept="application/json,.json" onChange={onImport} />
          </label>
          {collections.length > 0 && (
            <button type="button" className="btn btn--quiet" onClick={onClearAll}>
              Remove all collections
            </button>
          )}
        </div>
      </div>

      <p className="collections__status" role="status" aria-live="polite">
        {message}
      </p>
    </section>
  );
}
