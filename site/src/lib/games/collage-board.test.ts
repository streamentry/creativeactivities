import { describe, expect, it } from 'vitest';
import { PLACES, TRAY_SETS } from '../../data/collage-board';
import {
  chooseCutout,
  isFull,
  lastStep,
  newGame,
  nextSet,
  pass,
  placeAt,
  putBack,
  startAgain,
  takeBack,
  trayOf,
  type CollageGame,
} from './collage-board';

/** Choose the first cut-out and place it, so a test can start from one placed piece. */
function placeFirst(game: CollageGame, place: number): CollageGame {
  const picked = chooseCutout(game, trayOf(game)[0] as string).game;
  return placeAt(picked, place).game;
}

describe('collage board logic', () => {
  it('starts with twelve empty places, the first person to go, and nothing chosen', () => {
    const game = newGame();

    expect(game.cells).toHaveLength(PLACES);
    expect(game.cells.every((c) => c === null)).toBe(true);
    expect(game.turn).toBe(0);
    expect(game.chosen).toBeNull();
    expect(game.before).toBeNull();
    expect(lastStep(game)).toBeNull();
    expect(trayOf(game)).toEqual(TRAY_SETS[0]);
  });

  it('chooses a cut-out from the tray, and puts the choice down when it is tapped again', () => {
    const game = newGame();
    const first = chooseCutout(game, 'teacup');
    expect(first.outcome).toBe('chosen');
    expect(first.game.chosen).toBe('teacup');

    const again = chooseCutout(first.game, 'teacup');
    expect(again.outcome).toBe('unchosen');
    expect(again.game.chosen).toBeNull();
  });

  it('refuses a picture that is not in the tray, without changing the game', () => {
    const game = newGame();
    const result = chooseCutout(game, 'rowing-boat');

    expect(result.outcome).toBe('outside');
    expect(result.game).toBe(game);
  });

  it('places the chosen cut-out in an empty place, passes the turn, and clears the choice', () => {
    const game = placeFirst(newGame(), 4);

    expect(game.cells[4]).toEqual({ picture: 'teacup', person: 0 });
    expect(game.turn).toBe(1);
    expect(game.chosen).toBeNull();
    expect(lastStep(game)).toEqual({ kind: 'place', place: 4, person: 0 });
  });

  it('gives the next place to the second person, and the cut-out can be used again', () => {
    let game = placeFirst(newGame(), 0);
    game = chooseCutout(game, 'teacup').game;
    const result = placeAt(game, 1);

    expect(result.outcome).toBe('placed');
    expect(result.game.cells[0]).toEqual({ picture: 'teacup', person: 0 });
    expect(result.game.cells[1]).toEqual({ picture: 'teacup', person: 1 });
    expect(result.game.turn).toBe(0);
  });

  it('does nothing when a place is tapped with no cut-out chosen', () => {
    const game = newGame();
    const result = placeAt(game, 2);

    expect(result.outcome).toBe('needCutout');
    expect(result.game).toBe(game);
  });

  it('refuses a place that already has a picture, and keeps the turn where it was', () => {
    const game = placeFirst(newGame(), 3);
    const picked = chooseCutout(game, 'kettle').game;
    const result = placeAt(picked, 3);

    expect(result.outcome).toBe('filled');
    expect(result.game.cells[3]).toEqual({ picture: 'teacup', person: 0 });
    expect(result.game.turn).toBe(1);
  });

  it('refuses a place outside the board', () => {
    const game = chooseCutout(newGame(), 'teacup').game;

    expect(placeAt(game, -1).outcome).toBe('outside');
    expect(placeAt(game, PLACES).outcome).toBe('outside');
    expect(placeAt(game, 1.5).outcome).toBe('outside');
  });

  it('passes the turn to the other person, in either direction, and clears the choice', () => {
    const chosen = chooseCutout(newGame(), 'teacup').game;
    const after = pass(chosen);

    expect(after.turn).toBe(1);
    expect(after.chosen).toBeNull();
    expect(lastStep(after)).toEqual({ kind: 'pass', person: 0 });
    expect(pass(after).turn).toBe(0);
  });

  it('takes back the last piece: it comes off its place and the turn goes back to whoever placed it', () => {
    const game = placeFirst(newGame(), 5);
    const { game: after, step } = takeBack(game);

    expect(step).toEqual({ kind: 'place', place: 5, person: 0 });
    expect(after.cells[5]).toBeNull();
    expect(after.turn).toBe(0);
    expect(after.steps).toHaveLength(0);
  });

  it('takes back a pass, and returns the turn to the person who passed', () => {
    const { game: after, step } = takeBack(pass(newGame()));

    expect(step).toEqual({ kind: 'pass', person: 0 });
    expect(after.turn).toBe(0);
    expect(after.steps).toHaveLength(0);
  });

  it('takes back one step at a time, in order', () => {
    let game = placeFirst(newGame(), 0);
    game = pass(game);
    game = placeFirst(game, 1);

    game = takeBack(game).game;
    expect(game.cells[1]).toBeNull();
    expect(game.cells[0]).not.toBeNull();
    game = takeBack(game).game;
    expect(game.turn).toBe(1);
    game = takeBack(game).game;
    expect(game.cells[0]).toBeNull();
    expect(takeBack(game).step).toBeNull();
  });

  it('starts again with an empty board and the first person to go, and keeps the tray set', () => {
    const shown = nextSet(placeFirst(newGame(), 2));
    const again = startAgain(shown);

    expect(again.cells.every((c) => c === null)).toBe(true);
    expect(again.turn).toBe(0);
    expect(again.steps).toHaveLength(0);
    expect(again.set).toBe(1);
    expect(again.before).toEqual({ cells: shown.cells, turn: shown.turn, steps: shown.steps });
  });

  it('leaves an empty board alone when asked to start again', () => {
    const game = newGame();

    expect(startAgain(game)).toBe(game);
  });

  it('puts the board back after a start again, and then has nothing more to put back', () => {
    const shown = placeFirst(newGame(), 7);
    const restored = putBack(startAgain(shown));

    expect(restored.cells[7]).toEqual({ picture: 'teacup', person: 0 });
    expect(restored.turn).toBe(1);
    expect(restored.steps).toEqual(shown.steps);
    expect(restored.before).toBeNull();
    expect(putBack(restored)).toBe(restored);
  });

  it('forgets the put-back once the board changes again', () => {
    const cleared = startAgain(placeFirst(newGame(), 7));
    const changed = placeFirst(cleared, 0);

    expect(changed.before).toBeNull();
  });

  it('switches between the two tray sets, and keeps the pictures already on the board', () => {
    const game = placeFirst(newGame(), 6);
    const other = nextSet(game);

    expect(trayOf(other)).toEqual(TRAY_SETS[1]);
    expect(other.cells[6]).toEqual({ picture: 'teacup', person: 0 });
    expect(trayOf(nextSet(other))).toEqual(TRAY_SETS[0]);
    expect(other.chosen).toBeNull();
  });

  it('knows when every place has a picture, and places nothing more after that', () => {
    let game = newGame();
    for (let i = 0; i < PLACES; i += 1) game = placeFirst(game, i);

    expect(isFull(game)).toBe(true);
    expect(placeAt(chooseCutout(game, 'cat').game, 0).outcome).toBe('filled');
  });

  it('never changes the game it was given', () => {
    const game = newGame();
    const snapshot = JSON.stringify(game);
    placeFirst(game, 1);
    pass(game);
    startAgain(game);
    nextSet(game);

    expect(JSON.stringify(game)).toBe(snapshot);
  });
});
