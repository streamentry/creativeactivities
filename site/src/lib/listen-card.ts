/**
 * WEB-020, Read-aloud on activity cards. One speech session is shared by the
 * card's "Listen to the steps" control and each step's "Listen" button, so
 * only one thing speaks at a time and every control shows the same state.
 *
 * Speech is the browser's own (see ./games/readAloud.ts). Nothing is stored,
 * sent or counted, and nothing starts until a visitor presses a control.
 */
import { createUtterance, speechOf, type SpeechLike } from './games/readAloud';

/** The browser's synthesizer; pause and resume are used when it has them. */
export type ListenSynth = SpeechLike & { pause?(): void; resume?(): void };

/** Normal is the browser's own pace; Slower is about four-fifths of it. */
export const LISTEN_RATES = { normal: 1, slower: 0.8 } as const;
export type ListenSpeed = keyof typeof LISTEN_RATES;
export type ListenState = 'idle' | 'speaking' | 'paused';

export interface ListenSnapshot {
  readonly state: ListenState;
  /** Which control started the speech, so only that control shows it as active. */
  readonly owner: string | null;
  readonly speed: ListenSpeed;
}

export interface ListenSession {
  snapshot(): ListenSnapshot;
  /** Calls `listener` after every change. Returns the function that removes it. */
  subscribe(listener: () => void): () => void;
  /** Speaks `lines` in order. Returns false when speech is missing or refused. */
  play(lines: readonly string[], owner: string, lang: string): boolean;
  pause(): void;
  resume(): void;
  stop(): void;
  setSpeed(speed: ListenSpeed): void;
}

/** What the card control reads: safety notes shown above the steps first, then the title, then each step. */
export function cardLines(title: string, steps: readonly string[], lead: readonly string[] = []): string[] {
  return [title, ...lead, ...steps];
}

/**
 * A speech session over `getSynth`. Each play() supersedes the one before it:
 * a late "finished" signal from an earlier utterance is ignored, so it cannot
 * switch off speech that started after it.
 */
export function createListenSession(getSynth: () => ListenSynth | null): ListenSession {
  let current: ListenSnapshot = { state: 'idle', owner: null, speed: 'normal' };
  let generation = 0;
  const listeners = new Set<() => void>();

  const update = (next: Partial<ListenSnapshot>): void => {
    const merged: ListenSnapshot = { ...current, ...next };
    current = merged.state === 'idle' ? { ...merged, owner: null } : merged;
    for (const listener of [...listeners]) listener();
  };

  const silence = (): void => {
    try {
      getSynth()?.cancel();
    } catch {
      /* nothing to stop */
    }
  };

  return {
    snapshot: () => current,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    play(lines, owner, lang) {
      const synth = getSynth();
      const spoken = lines.map((line) => line.trim()).filter((line) => line.length > 0);
      if (!synth || spoken.length === 0) return false;
      const id = ++generation;
      const finished = () => {
        if (id === generation) update({ state: 'idle' });
      };
      try {
        synth.cancel();
        const utterances = spoken.map((text) => createUtterance(text, lang, LISTEN_RATES[current.speed]));
        const last = utterances[utterances.length - 1];
        last.onend = finished;
        last.onerror = finished;
        for (const utterance of utterances) synth.speak(utterance);
      } catch {
        update({ state: 'idle' });
        return false;
      }
      update({ state: 'speaking', owner });
      return true;
    },
    pause() {
      if (current.state !== 'speaking') return;
      try {
        getSynth()?.pause?.();
      } catch {
        return;
      }
      update({ state: 'paused' });
    },
    resume() {
      if (current.state !== 'paused') return;
      try {
        getSynth()?.resume?.();
      } catch {
        return;
      }
      update({ state: 'speaking' });
    },
    stop() {
      generation++;
      silence();
      update({ state: 'idle' });
    },
    setSpeed(speed) {
      update({ speed });
    },
  };
}

/** The minimal parts of window and document the leave guard uses. */
export interface ListenEventTarget {
  addEventListener(type: string, listener: () => void): void;
  removeEventListener(type: string, listener: () => void): void;
}

/**
 * Stops speech when the visitor leaves the page or the tab is hidden. Returns
 * the function that removes both listeners.
 */
export function attachLeaveGuard(
  session: ListenSession,
  win: ListenEventTarget,
  doc: ListenEventTarget & { readonly hidden?: boolean },
): () => void {
  const onPageHide = () => session.stop();
  const onVisibility = () => {
    if (doc.hidden) session.stop();
  };
  win.addEventListener('pagehide', onPageHide);
  doc.addEventListener('visibilitychange', onVisibility);
  return () => {
    win.removeEventListener('pagehide', onPageHide);
    doc.removeEventListener('visibilitychange', onVisibility);
  };
}

/** The page's one shared session, backed by the browser's speech when it has any. */
export const pageListen = createListenSession(() => speechOf());
