import 'dart:math';

import 'package:creative_activities/features/gentle_activities/models/sort_board.dart';
import 'package:flutter_test/flutter_test.dart';

SortBoard _board({int perBasket = 2, int seed = 3}) => SortBoard.deal(
  first: const ['teacup', 'kettle', 'bread'],
  second: const ['sunflower', 'tulip', 'tree'],
  perBasket: perBasket,
  random: Random(seed),
);

/// Places every picture in its own basket, the way a careful person would.
void _sortAll(SortBoard board) {
  while (!board.complete) {
    final piece = board.tray.first;
    board
      ..select(piece)
      ..drop(board.correctBasketOf(piece));
  }
}

void main() {
  test('deals the chosen number of pictures per basket, all in the tray', () {
    final board = _board();
    expect(board.tray, hasLength(4));
    expect(board.complete, isFalse);
    expect(board.canUndo, isFalse);
    expect(board.basket(0), isEmpty);
    expect(board.basket(1), isEmpty);
  });

  test('a wrong basket moves nothing and keeps the choice', () {
    final board = _board();
    final piece = board.tray.first;
    final right = board.correctBasketOf(piece);
    expect(board.select(piece), isTrue);
    expect(board.drop(1 - right), SortResult.wrongBasket);
    expect(board.selected, piece);
    expect(board.tray, contains(piece));
    expect(board.canUndo, isFalse);
    expect(board.drop(right), SortResult.placed);
    expect(board.basket(right), contains(piece));
    expect(board.selected, isNull);
  });

  test('dropping with nothing chosen says so and changes nothing', () {
    final board = _board();
    expect(board.drop(0), SortResult.noneChosen);
    expect(board.tray, hasLength(4));
  });

  test('tapping a chosen picture again un-chooses it', () {
    final board = _board();
    final piece = board.tray.first;
    board
      ..select(piece)
      ..select(piece);
    expect(board.selected, isNull);
  });

  test('a placed picture cannot be chosen again', () {
    final board = _board();
    final piece = board.tray.first;
    board
      ..select(piece)
      ..drop(board.correctBasketOf(piece));
    expect(board.select(piece), isFalse);
  });

  test('undo is false with nothing to undo', () {
    expect(_board().undo(), isFalse);
  });

  test('undo takes back the last placement, one step at a time', () {
    final board = _board();
    _sortAll(board);
    expect(board.complete, isTrue);
    expect(board.undo(), isTrue);
    expect(board.complete, isFalse);
    expect(board.tray, hasLength(1));
    expect(board.basket(0).length + board.basket(1).length, 3);
    while (board.undo()) {}
    expect(board.tray, hasLength(4));
    expect(board.basket(0), isEmpty);
    expect(board.basket(1), isEmpty);
  });

  test('perBasket above the group size uses every picture there is', () {
    expect(_board(perBasket: 9).tray, hasLength(6));
  });
}
