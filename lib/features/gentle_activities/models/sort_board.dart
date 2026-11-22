import 'dart:math';

/// What a basket tap did. A wrong basket is never a mistake on the record:
/// nothing moves and the picture stays chosen, so the person can try again.
enum SortResult { placed, wrongBasket, noneChosen }

/// A picture-sorting round with two baskets (GM-010, GAME-017). Each picture
/// belongs in one basket. A picture is chosen from the tray, then a basket is
/// tapped. Undo takes back the last picture put in a basket, as many times as
/// the person likes. There is no clock, score or penalty.
class SortBoard {
  new _(this._correct, List<String> tray) : _tray = List<String>.of(tray);

  /// Deals [perBasket] pictures from each group (fewer when a group is
  /// smaller), shuffled into the tray. Groups never share a picture.
  factory deal({
    required List<String> first,
    required List<String> second,
    int perBasket = 3,
    Random? random,
  }) {
    final rng = random ?? Random();
    final correct = <String, int>{};
    for (final id in _pick(first, perBasket, rng)) {
      correct[id] = 0;
    }
    for (final id in _pick(second, perBasket, rng)) {
      correct[id] = 1;
    }
    final tray = correct.keys.toList()..shuffle(rng);
    return SortBoard._(correct, tray);
  }

  /// The correct basket (0 or 1) for each picture in this round.
  final Map<String, int> _correct;
  final List<String> _tray;
  final List<List<String>> _baskets = [[], []];
  final List<(String, int)> _history = [];
  String? _selected;

  List<String> get tray => List<String>.unmodifiable(_tray);
  List<String> basket(int index) => List<String>.unmodifiable(_baskets[index]);
  String? get selected => _selected;
  bool get complete => _tray.isEmpty;
  bool get canUndo => _history.isNotEmpty;

  /// The basket a picture belongs in, for the screen reader hint and tests.
  int correctBasketOf(String id) => _correct[id]!;

  /// Chooses a picture in the tray. Choosing the same one again un-chooses
  /// it. Returns false for a picture that is not waiting in the tray.
  bool select(String id) {
    if (!_tray.contains(id)) return false;
    _selected = _selected == id ? null : id;
    return true;
  }

  /// Taps a basket with a picture chosen.
  SortResult drop(int basket) {
    final id = _selected;
    if (id == null) return SortResult.noneChosen;
    if (_correct[id] != basket) return SortResult.wrongBasket;
    _tray.remove(id);
    _baskets[basket].add(id);
    _history.add((id, basket));
    _selected = null;
    return SortResult.placed;
  }

  /// Takes the last placed picture back to the tray. Returns false when no
  /// picture has been placed.
  bool undo() {
    if (_history.isEmpty) return false;
    final (id, basket) = _history.removeLast();
    _baskets[basket].remove(id);
    _tray.add(id);
    _selected = null;
    return true;
  }

  static List<String> _pick(List<String> group, int count, Random rng) {
    final shuffled = List<String>.of(group)..shuffle(rng);
    return shuffled.take(min(count, group.length)).toList();
  }
}
