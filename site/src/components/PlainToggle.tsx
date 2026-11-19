import { PLAIN_STEPS_KEY } from '../lib/display-settings';
import { useEffect, useRef, useState } from 'react';

/** The per-viewer choice (WEB-039). It stays in this browser only and is never sent anywhere. */
export const PLAIN_STORAGE_KEY = PLAIN_STEPS_KEY;

/** The part of localStorage this island uses; a test can pass a stand-in. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** The two step lists on a card page: the standard steps and the plain steps (null when absent). */
export interface StepLists {
  standard: HTMLElement | null;
  plain: HTMLElement | null;
}

/** Shows the plain list and hides the standard one, or the other way round. */
export function applyPlainMode(lists: StepLists, plain: boolean): void {
  if (lists.standard) lists.standard.hidden = plain;
  if (lists.plain) lists.plain.hidden = !plain;
}

/** Reads the saved choice. A missing, blocked or throwing store means the standard steps. */
export function readPlainPreference(store: KeyValueStore | null): boolean {
  try {
    return store?.getItem(PLAIN_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

/** Saves the choice. If storage is blocked, the choice lasts only until the page is left. */
export function savePlainPreference(store: KeyValueStore | null, plain: boolean): void {
  try {
    store?.setItem(PLAIN_STORAGE_KEY, plain ? '1' : '0');
  } catch {
    // Private windows and blocked site data can refuse writes; the switch still works for this page.
  }
}

/** The browser's localStorage, or null when the page cannot reach it. */
export function localStore(): KeyValueStore | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** Finds the two step lists inside the card's "What to do" section. */
export function findStepLists(section: ParentNode | null): StepLists {
  const plain = section?.querySelector<HTMLOListElement>('ol.activity-steps--plain') ?? null;
  const standard = section?.querySelector<HTMLOListElement>('ol.activity-steps:not(.activity-steps--plain)') ?? null;
  return { standard, plain };
}

interface PlainToggleProps {
  /** The fixed label; it does not change, so the state is carried by aria-pressed. */
  label?: string;
}

/**
 * The "Short steps" switch. It renders hidden and is shown only after hydration,
 * so no button appears that does nothing. Without JavaScript the standard steps stay.
 */
export function PlainToggle({ label = 'Short steps' }: PlainToggleProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [plain, setPlain] = useState(false);

  useEffect(() => {
    const lists = findStepLists(wrapRef.current?.closest('section') ?? null);
    const saved = readPlainPreference(localStore());
    applyPlainMode(lists, saved);
    setPlain(saved);
    setReady(lists.plain !== null);
  }, []);

  const toggle = () => {
    const next = !plain;
    applyPlainMode(findStepLists(wrapRef.current?.closest('section') ?? null), next);
    savePlainPreference(localStore(), next);
    setPlain(next);
  };

  return (
    <div ref={wrapRef} className="plain-toggle no-print" hidden={!ready}>
      <button type="button" className="btn" aria-pressed={plain} onClick={toggle}>
        {label}
      </button>
    </div>
  );
}
