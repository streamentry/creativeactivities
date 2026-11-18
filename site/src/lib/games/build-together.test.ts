import { describe, expect, it } from 'vitest';
import { BOARD_SIZES, DEFAULT_BOARD_SIZE, DEFAULT_COLORS, type BoardSize } from '../../data/build-together';
import {
  boardOf,
  canPass,
  canPlace,
  canTakeBack,
  chooseColor,
  chooseSize,
  colorOf,
  isBuilt,
  isEmpty,
  lastStep,
  newGame,
  otherPerson,
  pass,
  place,
  placeOf,
  startAgain,
  takeBack,
  turnOf,
  type BuildGame,
} from './build-together';

/** Fill the grid in reading order, each person taking their turn. */
function fillAll(start: BuildGame): BuildGame {
  let game = start;
  for (let i = 0; i < boardOf(game).cells.length; i++) game = place(game, i).game;
  return game;
}

describe('starting', () => {
  it('begins with an empty 4 by 4 grid, the first person to go, and two different colors', () => {
    const game = newGame();

    expect(game.size).toBe(DEFAULT_BOARD_SIZE);
    expect(game.size).toBe(4);
    expect(boardOf(game).cells).toHaveLength(16);
    expect(boardOf(game).cells.every((c) => c === null)).toBe(true);
    expect(isEmpty(game)).toBe(true);
    expect(turnOf(game)).toBe(0);
    expect(colorOf(game, 0)).not.toBe(colorOf(game, 1));
    expect([colorOf(game, 0), colorOf(game, 1)]).toEqual([...DEFAULT_COLORS]);
    expect(canTakeBack(game)).toBe(false);
    expect(isBuilt(game)).toBe(false);
  });

  it('has a board ready for each size, 3 by 3 and 4 by 4', () => {
    const game = newGame();

    expect(BOARD_SIZES).toEqual([3, 4]);
    for (const size of BOARD_SIZES) expect(game.boards[size].cells).toHaveLength(size * size);
  });
});

describe('places', () => {
  it('counts rows and columns from 1', () => {
    expect(placeOf(3, 0)).toEqual({ row: 1, column: 1 });
    expect(placeOf(3, 5)).toEqual({ row: 2, column: 3 });
    expect(placeOf(4, 15)).toEqual({ row: 4, column: 4 });
  });

  it('names the other person', () => {
    expect(otherPerson(0)).toBe(1);
    expect(otherPerson(1)).toBe(0);
  });
});

describe('putting a piece in a place', () => {
  it('puts the piece of the person whose turn it is in the place, and gives the turn to the other person', () => {
    const { game, outcome } = place(newGame(), 5);

    expect(outcome).toBe('placed');
    expect(boardOf(game).cells[5]).toBe(0);
    expect(turnOf(game)).toBe(1);
    const second = place(game, 6).game;
    expect(boardOf(second).cells[6]).toBe(1);
    expect(turnOf(second)).toBe(0);
  });

  it('alternates for as long as both keep placing', () => {
    let game = newGame();
    const turns: number[] = [];
    for (let i = 0; i < 6; i++) {
      turns.push(turnOf(game));
      game = place(game, i).game;
    }

    expect(turns).toEqual([0, 1, 0, 1, 0, 1]);
    expect(boardOf(game).cells.slice(0, 6)).toEqual([0, 1, 0, 1, 0, 1]);
  });

  it('leaves every other place alone', () => {
    const start = newGame();
    const { game } = place(start, 7);

    expect(boardOf(game).cells.filter((c) => c !== null)).toHaveLength(1);
  });

  it('does nothing for a place that already has a piece, and the turn stays', () => {
    const once = place(newGame(), 3).game;
    const { game, outcome } = place(once, 3);

    expect(outcome).toBe('taken');
    expect(game).toBe(once);
    expect(turnOf(game)).toBe(1);
    expect(canPlace(once, 3)).toBe(false);
  });

  it('does nothing for a place outside the grid', () => {
    const start = newGame();

    for (const index of [-1, 16, 2.5, Number.NaN]) {
      const { game, outcome } = place(start, index);
      expect(outcome).toBe('outside');
      expect(game).toBe(start);
      expect(canPlace(start, index)).toBe(false);
    }
  });

  it('does not change the game it was given', () => {
    const start = newGame();
    const before = JSON.stringify(start);
    place(start, 2);
    pass(start);
    takeBack(place(start, 2).game);
    chooseColor(start, 0, 2);
    chooseSize(start, 3);
    startAgain(place(start, 1).game);

    expect(JSON.stringify(start)).toBe(before);
  });
});

describe('built together', () => {
  it('is true when every place has a piece, and only then', () => {
    let game = newGame();
    for (let i = 0; i < 15; i++) game = place(game, i).game;
    expect(isBuilt(game)).toBe(false);

    const last = place(game, 15);
    expect(last.outcome).toBe('built');
    expect(isBuilt(last.game)).toBe(true);
  });

  it('works for a 3 by 3 grid at nine pieces', () => {
    const game = fillAll(chooseSize(newGame(), 3));

    expect(boardOf(game).cells).toHaveLength(9);
    expect(isBuilt(game)).toBe(true);
  });

  it('has no winner: nothing in the logic says who did better, and each person ends up with their own pieces', () => {
    const game = fillAll(newGame());
    const cells = boardOf(game).cells;

    expect(cells.filter((c) => c === 0)).toHaveLength(8);
    expect(cells.filter((c) => c === 1)).toHaveLength(8);
    expect(Object.keys(game).sort()).toEqual(['boards', 'colors', 'size']);
  });

  it('puts no more pieces on a full grid and passes no more turns on it', () => {
    const built = fillAll(newGame());

    expect(place(built, 0).outcome).toBe('finished');
    expect(place(built, 0).game).toBe(built);
    expect(canPass(built)).toBe(false);
    expect(pass(built)).toBe(built);
  });

  it('can take the last piece back from a full grid, so it is no longer built', () => {
    const built = fillAll(newGame());
    const { game } = takeBack(built);

    expect(isBuilt(game)).toBe(false);
    expect(boardOf(game).cells[15]).toBeNull();
    expect(canPlace(game, 15)).toBe(true);
  });
});

describe('passing', () => {
  it('gives the turn to the other person and puts nothing in the grid', () => {
    const start = newGame();
    const game = pass(start);

    expect(turnOf(game)).toBe(1);
    expect(boardOf(game).cells).toEqual(boardOf(start).cells);
    expect(turnOf(pass(game))).toBe(0);
  });

  it('is open to either person, at any time before the grid is full, even straight away', () => {
    expect(canPass(newGame())).toBe(true);
    expect(canPass(place(newGame(), 0).game)).toBe(true);
  });

  it('lets the person who is next place a piece straight after a pass', () => {
    const game = place(pass(newGame()), 4).game;

    expect(boardOf(game).cells[4]).toBe(1);
    expect(turnOf(game)).toBe(0);
  });
});

describe('taking back the last piece', () => {
  it('takes the last piece off its place and gives the turn back to the person who put it there', () => {
    const start = place(newGame(), 2).game;
    const placed = place(start, 9).game;
    const { game, step } = takeBack(placed);

    expect(step).toEqual({ kind: 'place', index: 9, person: 1 });
    expect(boardOf(game).cells[9]).toBeNull();
    expect(boardOf(game).cells[2]).toBe(0);
    expect(turnOf(game)).toBe(1);
    expect(boardOf(game)).toEqual(boardOf(start));
  });

  it('takes back one step at a time, as far back as the beginning', () => {
    let game = newGame();
    for (let i = 0; i < 4; i++) game = place(game, i).game;
    for (let i = 3; i >= 0; i--) {
      expect(lastStep(game)).toEqual({ kind: 'place', index: i, person: (i % 2) as 0 | 1 });
      game = takeBack(game).game;
    }

    expect(isEmpty(game)).toBe(true);
    expect(turnOf(game)).toBe(0);
    expect(canTakeBack(game)).toBe(false);
    expect(takeBack(game)).toEqual({ game, step: null });
  });

  it('takes back a pass too, giving the turn back to the person who passed', () => {
    const start = place(newGame(), 0).game;
    const passed = pass(start);
    const { game, step } = takeBack(passed);

    expect(step).toEqual({ kind: 'pass', person: 1 });
    expect(turnOf(passed)).toBe(0);
    expect(turnOf(game)).toBe(1);
    expect(boardOf(game)).toEqual(boardOf(start));
  });

  it('is not offered before anything has happened', () => {
    expect(canTakeBack(newGame())).toBe(false);
    expect(canTakeBack(pass(newGame()))).toBe(true);
  });
});

describe('Start again', () => {
  it('empties the grid, gives the first turn to the first person and keeps the colors and the size', () => {
    let game = chooseColor(chooseSize(newGame(), 3), 1, 2).game;
    game = place(place(game, 0).game, 4).game;
    const again = startAgain(game);

    expect(isEmpty(again)).toBe(true);
    expect(turnOf(again)).toBe(0);
    expect(canTakeBack(again)).toBe(false);
    expect(again.size).toBe(3);
    expect(again.colors).toEqual(game.colors);
  });

  it('empties only the grid being built and keeps the other size as it was', () => {
    const four = place(newGame(), 5).game;
    const three = place(chooseSize(four, 3), 0).game;
    const again = startAgain(three);

    expect(isEmpty(again)).toBe(true);
    expect(boardOf(chooseSize(again, 4))).toEqual(boardOf(four));
  });

  it('empties a grid that has only had passes, so the first person goes first again', () => {
    const again = startAgain(pass(newGame()));

    expect(turnOf(again)).toBe(0);
    expect(canTakeBack(again)).toBe(false);
  });

  it('leaves a grid that is already empty as it is', () => {
    const start = newGame();

    expect(startAgain(start)).toBe(start);
  });
});

describe('choosing a size', () => {
  it('keeps the board of each size, so going back keeps the work', () => {
    const four = place(newGame(), 5).game;
    const three = chooseSize(four, 3);

    expect(three.size).toBe(3);
    expect(isEmpty(three)).toBe(true);
    expect(boardOf(chooseSize(three, 4))).toEqual(boardOf(four));
  });

  it('ignores a size that is already chosen or not offered', () => {
    const start = newGame();

    expect(chooseSize(start, 4)).toBe(start);
    expect(chooseSize(start, 5 as unknown as BoardSize)).toBe(start);
  });
});

describe('choosing a color', () => {
  it('gives a person the color they pick, leaving the other person alone', () => {
    const { game, outcome } = chooseColor(newGame(), 0, 2);

    expect(outcome).toBe('changed');
    expect(colorOf(game, 0)).toBe(2);
    expect(colorOf(game, 1)).toBe(DEFAULT_COLORS[1]);
  });

  it('refuses the color the other person has, so the two colors always differ', () => {
    const start = newGame();
    const { game, outcome } = chooseColor(start, 0, colorOf(start, 1));

    expect(outcome).toBe('taken');
    expect(game).toBe(start);
    expect(chooseColor(start, 1, colorOf(start, 0)).outcome).toBe('taken');
  });

  it('never ends with the same color for both, whatever is picked', () => {
    let game = newGame();
    for (const color of [0, 1, 2, 3, 3, 2, 1, 0] as const) {
      for (const person of [0, 1] as const) {
        game = chooseColor(game, person, color).game;
        expect(colorOf(game, 0)).not.toBe(colorOf(game, 1));
      }
    }
  });

  it('says so when the pick is the color the person already has, and when it is not one of the four', () => {
    const start = newGame();

    expect(chooseColor(start, 0, colorOf(start, 0))).toEqual({ game: start, outcome: 'same' });
    expect(chooseColor(start, 0, 7 as never)).toEqual({ game: start, outcome: 'outside' });
  });

  it('can be changed in the middle of a game, and the pieces already there keep their person', () => {
    const played = place(place(newGame(), 0).game, 1).game;
    const { game } = chooseColor(played, 0, 2);

    expect(boardOf(game).cells.slice(0, 2)).toEqual([0, 1]);
    expect(colorOf(game, 0)).toBe(2);
  });
});
