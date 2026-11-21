import { useCreateStore, useSelector } from '@tanstack/react-store';
import { useEffect, useRef } from 'react';
import type { PlayProps } from '../../i18n/play';
import { fill } from '../../i18n/play/format';
import {
  boardColumns,
  createPairs,
  isComplete,
  matchedValues,
  restorePairs,
  savePairs,
  tapPair,
  tileVisualState,
  type PairsState,
  type SavedPairTile,
} from '../../lib/games/pairs';
import { createRng, randomSeed } from '../../lib/games/random';
import { photoTileName } from '../../lib/games/photo-label';
import { nextHintValue } from '../../lib/games/photo-hint';
import { PictureTile, pictureNamer } from './PictureTile';
import { sounds } from './sound';
import { useWide } from './useWide';

interface PairsBoardProps {
  play: PlayProps;
  values: readonly string[];
  hidden: boolean;
  photos?: boolean;
  /** Optional, page-only captions for family photos. */
  photoLabels?: readonly string[];
  /** Photo pairs: while true, the first unmatched pair is marked as a hint. */
  hinting?: boolean;
  /** Visible marker on the hinted pair, such as "Here". */
  hintLabel?: string;
  /** Called on every tap, including one that changes nothing, so a hint pause can start again. */
  onTapped?: () => void;
  /** Changing this starts a new board. */
  round: number;
  /** When `values` change within the same round, keep the pairs already matched (WEB-053). */
  keepPlace?: boolean;
  /** WEB-054: a saved layout to rebuild in place of a deal. Applied once, then `onResumed` is called. */
  resume?: readonly SavedPairTile[];
  onResumed?: () => void;
  /** WEB-054: told the board's layout and matched pairs after each change, so a game can keep them. */
  onTiles?: (tiles: SavedPairTile[]) => void;
  onMessage: (message: string) => void;
  onComplete: () => void;
}

export function PairsBoard({
  play,
  values,
  hidden,
  photos = false,
  photoLabels,
  hinting = false,
  hintLabel,
  onTapped,
  round,
  keepPlace = false,
  resume,
  onResumed,
  onTiles,
  onMessage,
  onComplete,
}: PairsBoardProps) {
  const { ui, lang } = play;
  const pictureName = pictureNamer(play);
  const wide = useWide();
  const store = useCreateStore<PairsState, { tap: (i: number) => void; reset: (v: readonly string[], matched?: ReadonlySet<string>) => void; restore: (t: readonly SavedPairTile[]) => void }>(
    { tiles: [], selected: null, mismatch: null, lastMatch: null },
    ({ setState }) => ({
      tap: (i) => setState((s) => tapPair(s, i)),
      reset: (v, matched) => setState(() => createPairs(v, createRng(randomSeed()), matched)),
      restore: (t) => setState(() => restorePairs(t)),
    }),
  );
  const state = useSelector(store);

  const lastRound = useRef(round);
  useEffect(() => {
    const sameRound = lastRound.current === round;
    lastRound.current = round;
    // A saved layout replaces the deal once; a stale one is never applied twice (strict mode runs effects twice, so the game clears it in onResumed).
    if (resume) {
      store.actions.restore(resume);
      onResumed?.();
    } else {
      store.actions.reset(values, keepPlace && sameRound ? new Set(matchedValues(store.state)) : undefined);
    }
    // A board that is already all matched after resizing is a finished board.
    if (isComplete(store.state)) onComplete();
    onMessage('');
    // `round` intentionally restarts the board.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, round]);

  useEffect(() => {
    onTiles?.(savePairs(state));
    // Only the board itself is reported; the callback may be a new function on each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.tiles]);

  const label = (v: string) => {
    if (!photos) return pictureName(v);
    const index = values.indexOf(v);
    const number = index + 1;
    return photoTileName(fill(ui.tile.photoNumber, { n: number }), photoLabels?.[index]);
  };

  const onTap = (i: number) => {
    onTapped?.();
    const before = store.state;
    if (before.tiles[i]?.matched) return;
    store.actions.tap(i);
    const after = store.state;
    if (after === before) return;
    if (after.lastMatch !== null) {
      const v = after.tiles[i]?.value ?? '';
      if (isComplete(after)) {
        sounds.done();
        onMessage(ui.pairs.allTogether);
        onComplete();
      } else {
        sounds.match();
        onMessage(photos ? ui.pairs.photoPair : fill(ui.pairs.picturePair, { name: pictureName(v) }, lang));
      }
    } else if (after.mismatch) {
      // With hidden tiles a screen reader user cannot see what turned over, so name both.
      const [a, b] = after.mismatch;
      onMessage(
        hidden
          ? fill(ui.pairs.mismatchNamed, { a: label(after.tiles[a]?.value ?? ''), b: label(after.tiles[b]?.value ?? '') })
          : ui.pairs.mismatch,
      );
    } else {
      sounds.tap();
      const v = after.tiles[i]?.value ?? '';
      onMessage(after.selected === i ? fill(ui.pairs.selected, { name: label(v) }) : '');
    }
  };

  const cols = boardColumns(state.tiles.length, wide);
  const hintValue = hinting ? nextHintValue(state.tiles) : null;
  return (
    <div className="board" data-cols={cols} data-width={state.tiles.length <= 4 ? 'small' : 'large'}>
      {state.tiles.map((t, i) => (
        <PictureTile
          key={t.key}
          ui={ui}
          value={t.value}
          photo={photos}
          name={label(t.value)}
          position={i + 1}
          state={tileVisualState(state, i, hidden)}
          onTap={() => onTap(i)}
          hinted={hintValue !== null && t.value === hintValue}
          hintLabel={photos ? hintLabel : undefined}
          caption={photos ? (photoLabels?.[values.indexOf(t.value)] ?? '') : undefined}
        />
      ))}
    </div>
  );
}
