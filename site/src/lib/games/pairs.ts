import { shuffle, type Rng } from './random';

export interface PairTile {
  /** Stable key for rendering. */
  key: string;
  /** What the tile shows: a picture id or a photo URL. */
  value: string;
  matched: boolean;
}

export interface PairsState {
  tiles: PairTile[];
  selected: number | null;
  /** Two tiles that were tapped and differ; they stay put until the next tap. */
  mismatch: [number, number] | null;
  lastMatch: number | null;
}

/** The pictures whose pair has been matched. */
export function matchedValues(state: PairsState): string[] {
  return [...new Set(state.tiles.filter((t) => t.matched).map((t) => t.value))];
}

/**
 * A new board for [values]. Pictures in [matched] start already matched, so a
 * board resized mid-game (WEB-053) keeps the pairs a person has found.
 */
export function createPairs(values: readonly string[], rng: Rng, matched: ReadonlySet<string> = new Set()): PairsState {
  const doubled = values.flatMap((value, i) => [
    { key: `${i}-a`, value, matched: matched.has(value) },
    { key: `${i}-b`, value, matched: matched.has(value) },
  ]);
  return { tiles: shuffle(doubled, rng), selected: null, mismatch: null, lastMatch: null };
}

/**
 * One tap. Nothing changes on a timer: a mismatch stays visible until the
 * next deliberate tap, which clears it and starts the next turn.
 */
export function tapPair(state: PairsState, index: number): PairsState {
  const tile = state.tiles[index];
  if (!tile || tile.matched) return state;

  if (state.mismatch) {
    return { ...state, mismatch: null, selected: index, lastMatch: null };
  }
  if (state.selected === null) {
    return { ...state, selected: index, lastMatch: null };
  }
  if (state.selected === index) {
    return { ...state, selected: null };
  }

  const first = state.tiles[state.selected];
  if (first && first.value === tile.value) {
    const tiles = state.tiles.map((t, i) => (i === index || i === state.selected ? { ...t, matched: true } : t));
    return { tiles, selected: null, mismatch: null, lastMatch: index };
  }
  return { ...state, selected: null, mismatch: [state.selected, index], lastMatch: null };
}

/** One tile as a game keeps it (WEB-054): the picture and whether it is matched. */
export interface SavedPairTile {
  value: string;
  matched: boolean;
}

/** The board in layout order, for a game to keep on this device. No keys, no selection. */
export function savePairs(state: PairsState): SavedPairTile[] {
  return state.tiles.map((t) => ({ value: t.value, matched: t.matched }));
}

/**
 * A board rebuilt in exactly the saved layout and matched pairs. Callers must
 * check the tiles with parsePairTiles first.
 */
export function restorePairs(tiles: readonly SavedPairTile[]): PairsState {
  return {
    tiles: tiles.map((t, i) => ({ key: `r${i}`, value: t.value, matched: t.matched })),
    selected: null,
    mismatch: null,
    lastMatch: null,
  };
}

const isRecordValue = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * The saved tiles, when they are a whole board for exactly `values`: each value
 * on two tiles, both tiles of a pair agreeing on matched, nothing else. Returns
 * null for anything else. Never repairs a bad value.
 */
export function parsePairTiles(raw: unknown, values: readonly string[]): SavedPairTile[] | null {
  if (!Array.isArray(raw) || raw.length !== values.length * 2) return null;
  const allowed = new Set(values);
  const seen = new Map<string, boolean[]>();
  const out: SavedPairTile[] = [];
  for (const entry of raw) {
    if (!isRecordValue(entry)) return null;
    const { value, matched } = entry;
    if (typeof value !== 'string' || !allowed.has(value) || typeof matched !== 'boolean') return null;
    seen.set(value, [...(seen.get(value) ?? []), matched]);
    out.push({ value, matched });
  }
  for (const flags of seen.values()) {
    if (flags.length !== 2 || flags[0] !== flags[1]) return null;
  }
  if (seen.size !== values.length) return null;
  return out;
}

export function isComplete(state: PairsState): boolean {
  return state.tiles.length > 0 && state.tiles.every((t) => t.matched);
}

export function matchedPairs(state: PairsState): number {
  return state.tiles.filter((t) => t.matched).length / 2;
}

export type TileVisualState = 'resting' | 'selected' | 'matched' | 'hidden' | 'mismatch';

export function tileVisualState(state: PairsState, i: number, hidden: boolean): TileVisualState {
  const t = state.tiles[i];
  if (!t) return 'resting';
  if (t.matched) return 'matched';
  if (state.mismatch?.includes(i)) return 'mismatch';
  if (state.selected === i) return 'selected';
  return hidden ? 'hidden' : 'resting';
}

/** Columns that keep the whole board on one screen without tiny tiles. */
export function boardColumns(tileCount: number, wide: boolean): number {
  if (tileCount <= 4) return 2;
  if (tileCount <= 6) return wide ? 3 : 2;
  if (tileCount <= 8) return wide ? 4 : 2;
  return wide ? 4 : 3;
}
