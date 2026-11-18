import { describe, expect, it } from 'vitest';
import {
  CARD_COUNTS,
  DEFAULT_CARD_COUNT,
  cardVisual,
  deal,
  isFaceUp,
  isFinished,
  isWaiting,
  otherPerson,
  pairsFound,
  pass,
  turnBack,
  turnCard,
  type CardCount,
  type FindState,
  type Person,
} from './find-together';
import { createRng } from './random';

const PICTURES = Array.from({ length: 12 }, (_, i) => `picture-${i}`);

/** A board with the given cards, in order, for tests that need a known layout. */
function boardOf(values: string[], turn: Person = 0): FindState {
  return { tiles: values.map((value, i) => ({ key: `${i}`, value, matched: false })), turn, turned: [] };
}

/** Two positions that hold the same picture, and two that hold different ones. */
const SAME = boardOf(['a', 'a', 'b', 'b']);
const DIFFERENT_PAIR: [number, number] = [0, 2];

/** Turns two cards, in order, and returns the final result. */
function turnTwo(state: FindState, a: number, b: number) {
  const first = turnCard(state, a);
  return turnCard(first.state, b);
}

describe('dealing', () => {
  it.each(CARD_COUNTS)('deals %i cards as pairs of pictures, all face down, with the first person to turn', (count: CardCount) => {
    const state = deal(count, PICTURES, createRng(4));

    expect(state.tiles).toHaveLength(count);
    expect(state.turn).toBe(0);
    expect(state.turned).toEqual([]);
    expect(pairsFound(state)).toBe(0);
    expect(isFinished(state)).toBe(false);
    const counts = new Map<string, number>();
    for (const tile of state.tiles) counts.set(tile.value, (counts.get(tile.value) ?? 0) + 1);
    expect([...counts.values()].every((n) => n === 2)).toBe(true);
    expect(counts.size).toBe(count / 2);
  });

  it('starts with six cards, and offers six, eight and twelve', () => {
    expect(DEFAULT_CARD_COUNT).toBe(6);
    expect(CARD_COUNTS).toEqual([6, 8, 12]);
  });

  it('draws only from the pictures it is given', () => {
    const state = deal(8, ['only-a', 'only-b', 'only-c', 'only-d', 'only-e'], createRng(9));
    for (const tile of state.tiles) expect(tile.value.startsWith('only-')).toBe(true);
  });

  it('is reproducible from the same seed', () => {
    expect(deal(12, PICTURES, createRng(3))).toEqual(deal(12, PICTURES, createRng(3)));
  });
});

describe('turning two cards', () => {
  it('turns up the first card of a turn and keeps the turn with the same person', () => {
    const { state, outcome } = turnCard(SAME, 0);

    expect(outcome).toBe('turned');
    expect(state.turned).toEqual([0]);
    expect(state.turn).toBe(0);
  });

  it('ignores a card already face up this turn, and a card already matched', () => {
    const one = turnCard(SAME, 0).state;
    expect(turnCard(one, 0).outcome).toBe('ignored');
    expect(turnCard(one, 0).state).toBe(one);

    const matched = turnTwo(SAME, 0, 1).state;
    expect(turnCard(matched, 0).outcome).toBe('ignored');
    const partly = turnTwo(boardOf(['a', 'a', 'b', 'c', 'c', 'b']), 0, 1).state;
    expect(turnCard(partly, 1).outcome).toBe('ignored');
  });

  it('ignores a position that is not on the board', () => {
    expect(turnCard(SAME, 9).outcome).toBe('ignored');
    expect(turnCard(SAME, -1).outcome).toBe('ignored');
  });

  it('finds a matching pair together and passes the turn at once', () => {
    const { state, outcome } = turnTwo(SAME, 0, 1);

    expect(outcome).toBe('matched');
    expect(state.tiles[0]?.matched).toBe(true);
    expect(state.tiles[1]?.matched).toBe(true);
    expect(state.turned).toEqual([]);
    expect(state.turn).toBe(1);
    expect(pairsFound(state)).toBe(1);
  });

  it('leaves two cards that differ face up and does not pass the turn', () => {
    const { state, outcome } = turnTwo(SAME, DIFFERENT_PAIR[0], DIFFERENT_PAIR[1]);

    expect(outcome).toBe('different');
    expect(state.turned).toEqual([0, 2]);
    expect(isWaiting(state)).toBe(true);
    expect(state.turn).toBe(0);
    expect(pairsFound(state)).toBe(0);
  });

  it('keeps everything as it is on a tap while two cards wait for Turn them back', () => {
    const waiting = turnTwo(SAME, 0, 2).state;
    const result = turnCard(waiting, 1);

    expect(result.outcome).toBe('waiting');
    expect(result.state).toBe(waiting);
  });

  it('turns the two cards back and passes the turn when Turn them back is pressed', () => {
    const waiting = turnTwo(SAME, 0, 2).state;
    const { state, outcome } = turnBack(waiting);

    expect(outcome).toBe('turnedBack');
    expect(state.turned).toEqual([]);
    expect(state.turn).toBe(1);
    expect(isWaiting(state)).toBe(false);
  });

  it('ignores Turn them back when no two cards are waiting', () => {
    const one = turnCard(SAME, 0).state;
    expect(turnBack(SAME)).toEqual({ state: SAME, outcome: 'ignored' });
    expect(turnBack(one).outcome).toBe('ignored');
  });
});

describe('passing', () => {
  it('passes the turn when no card is face up', () => {
    const { state, outcome } = pass(SAME);

    expect(outcome).toBe('passed');
    expect(state.turn).toBe(1);
    expect(state.turned).toEqual([]);
  });

  it('turns back a single card that is face up, and passes the turn', () => {
    const one = turnCard(SAME, 0).state;
    const { state, outcome } = pass(one);

    expect(outcome).toBe('passed');
    expect(state.turned).toEqual([]);
    expect(state.turn).toBe(1);
  });

  it('turns back two waiting cards, and passes the turn', () => {
    const waiting = turnTwo(SAME, 0, 2).state;
    const { state } = pass(waiting);

    expect(state.turned).toEqual([]);
    expect(state.turn).toBe(1);
    expect(isWaiting(state)).toBe(false);
  });

  it('does nothing once every pair is found', () => {
    const done = turnTwo(boardOf(['a', 'a']), 0, 1).state;
    expect(pass(done)).toEqual({ state: done, outcome: 'finished' });
  });
});

describe('finishing', () => {
  it('is finished when every card is matched, and the tally counts every pair', () => {
    const board = boardOf(['a', 'a', 'b', 'b', 'c', 'c']);
    const first = turnTwo(board, 0, 1).state;
    const second = turnTwo(first, 2, 3).state;
    const last = turnTwo(second, 4, 5);

    expect(last.outcome).toBe('matched');
    expect(isFinished(last.state)).toBe(true);
    expect(pairsFound(last.state)).toBe(3);
    expect(turnCard(last.state, 0)).toEqual({ state: last.state, outcome: 'finished' });
  });
});

describe('the shared tally', () => {
  it.each(CARD_COUNTS)('only ever counts up, and ends at half the cards, for %i cards', (count: CardCount) => {
    const { tallies, state } = playThrough(count, 11);

    for (let i = 1; i < tallies.length; i++) {
      expect(tallies[i]).toBeGreaterThanOrEqual(tallies[i - 1] as number);
      expect((tallies[i] as number) - (tallies[i - 1] as number)).toBeLessThanOrEqual(1);
    }
    expect(pairsFound(state)).toBe(count / 2);
  });

  it.each(CARD_COUNTS)('passes the turn after every completed turn, for %i cards', (count: CardCount) => {
    const { turns } = playThrough(count, 5);

    turns.forEach((turn, i) => expect(turn).toBe(i % 2));
  });
});

describe('cards on screen', () => {
  it('shows a matched card as matched, two waiting cards as mismatched, and the first card as selected', () => {
    const matched = turnTwo(SAME, 0, 1).state;
    expect(cardVisual(matched, 0, false)).toBe('matched');

    const waiting = turnTwo(SAME, 0, 2).state;
    expect(cardVisual(waiting, 0, false)).toBe('mismatch');
    expect(cardVisual(waiting, 2, false)).toBe('mismatch');
    expect(cardVisual(waiting, 1, false)).toBe('hidden');

    expect(cardVisual(turnCard(SAME, 1).state, 1, false)).toBe('selected');
  });

  it('shows a face-down card hidden, or resting when the pictures are showing', () => {
    expect(cardVisual(SAME, 3, false)).toBe('hidden');
    expect(cardVisual(SAME, 3, true)).toBe('resting');
    expect(cardVisual(SAME, 9, true)).toBe('hidden');
  });

  it('shows the picture of a card that is matched, turned, or when the pictures are showing', () => {
    expect(isFaceUp('hidden')).toBe(false);
    expect(isFaceUp('resting')).toBe(true);
    expect(isFaceUp('selected')).toBe(true);
    expect(isFaceUp('matched')).toBe(true);
    expect(isFaceUp('mismatch')).toBe(true);
  });
});

describe('purity and people', () => {
  it('never changes the state it is given', () => {
    const before = JSON.stringify(SAME);
    turnTwo(SAME, 0, 1);
    turnTwo(SAME, 0, 2);
    pass(SAME);
    turnBack(turnTwo(SAME, 0, 2).state);

    expect(JSON.stringify(SAME)).toBe(before);
  });

  it('alternates between the two people', () => {
    expect(otherPerson(0)).toBe(1);
    expect(otherPerson(1)).toBe(0);
  });
});

/**
 * Plays a whole board: each turn finds a pair, or (on alternate turns) turns over two
 * different cards and turns them back. Records the tally and whose turn it was.
 */
function playThrough(count: CardCount, seed: number): { state: FindState; tallies: number[]; turns: Person[] } {
  let state = deal(count, PICTURES, createRng(seed));
  const tallies: number[] = [];
  const turns: Person[] = [];
  let step = 0;
  while (!isFinished(state)) {
    turns.push(state.turn);
    const open = state.tiles.flatMap((t, i) => (t.matched ? [] : [i]));
    const a = open[0] as number;
    const differs = open.find((i) => state.tiles[i]?.value !== state.tiles[a]?.value);
    if (step % 2 === 0 && differs !== undefined) {
      state = turnTwo(state, a, differs).state;
      state = turnBack(state).state;
    } else {
      const same = open.find((i) => i !== a && state.tiles[i]?.value === state.tiles[a]?.value) as number;
      state = turnTwo(state, a, same).state;
    }
    tallies.push(pairsFound(state));
    step += 1;
  }
  return { state, tallies, turns };
}
