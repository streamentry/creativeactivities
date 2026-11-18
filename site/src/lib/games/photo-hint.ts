import type { PairTile } from './pairs';

/** Longest family caption, in characters. Captions are plain text kept only on the page. */
export const CAPTION_MAX = 60;

/** Trims a caption to [CAPTION_MAX] characters, counting whole characters rather than code units. */
export function clampCaption(text: string): string {
  return Array.from(text).slice(0, CAPTION_MAX).join('');
}

/** The picture (or photo URL) of the first pair not yet matched, in board order. Null when all are matched. */
export function nextHintValue(tiles: readonly PairTile[]): string | null {
  return tiles.find((t) => !t.matched)?.value ?? null;
}

/** The timer functions, injectable so tests can drive the wait with fake timers. */
export interface HintTimers {
  setTimeout(run: () => void, ms: number): unknown;
  clearTimeout(id: unknown): void;
}

const browserTimers: HintTimers = {
  setTimeout: (run, ms) => setTimeout(run, ms),
  clearTimeout: (id) => clearTimeout(id as ReturnType<typeof setTimeout>),
};

export interface HintWait {
  /**
   * Any tap, including one that changes nothing. The pause is cleared and starts
   * again from zero, so a hint can never fire straight after a tap.
   */
  tap(): void;
  /** Turns the wait on for a board being played, or off (rest, hints off, finished or looking at photos). */
  setActive(active: boolean): void;
}

/**
 * A single quiet pause. [onHint] runs once, after [afterMs] with no tap, and only
 * while the wait is active. Nothing repeats.
 */
export function createHintWait(afterMs: number, onHint: () => void, timers: HintTimers = browserTimers): HintWait {
  let active = false;
  let timer: unknown = null;

  const clear = () => {
    if (timer !== null) timers.clearTimeout(timer);
    timer = null;
  };
  const start = () => {
    clear();
    if (!active) return;
    timer = timers.setTimeout(() => {
      timer = null;
      onHint();
    }, afterMs);
  };

  return {
    tap: start,
    setActive(next) {
      if (next === active) return;
      active = next;
      start();
    },
  };
}
