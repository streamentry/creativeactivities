/**
 * GAME-039 Quiet scene: one still picture at a time, in a fixed order. Nothing
 * moves on its own. A picture changes only when a person presses Next or
 * Previous, and the scene stops at either end rather than wrapping round.
 */

/** Twelve calm, everyday pictures, in the order they are shown. Each id is in the shared picture library. */
export const QUIET_SCENES: readonly string[] = [
  'sunrise',
  'window-with-birds',
  'vase-of-flowers',
  'teacup',
  'tree',
  'sailboat',
  'lighthouse',
  'rainbow',
  'moon',
  'daisies',
  'rowing-boat',
  'potted-plant',
];

/** Where a press stopped: at the first or last picture, or somewhere in between (null). */
export type SceneEdge = 'first' | 'last' | null;

export interface SceneStep {
  /** The picture to show now. */
  readonly index: number;
  /** Set when the press could not move, so the page can say so politely. */
  readonly edge: SceneEdge;
}

/** Moves one picture forward (+1) or back (-1). Stops at the ends and reports the edge. */
export function stepScene(index: number, direction: 1 | -1, count: number = QUIET_SCENES.length): SceneStep {
  const last = count - 1;
  const current = Math.min(Math.max(index, 0), last);
  if (direction === 1) {
    return current >= last ? { index: last, edge: 'last' } : { index: current + 1, edge: null };
  }
  return current <= 0 ? { index: 0, edge: 'first' } : { index: current - 1, edge: null };
}

/** The picture id at `index`, clamped into the list. */
export function sceneAt(index: number): string {
  const id = QUIET_SCENES[Math.min(Math.max(index, 0), QUIET_SCENES.length - 1)];
  if (id === undefined) throw new Error('No quiet scenes');
  return id;
}
