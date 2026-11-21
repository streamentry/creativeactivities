import 'package:creative_activities/design_system.dart';
import 'package:creative_activities/features/gentle_activities/models/activity_picture.dart';
import 'package:creative_activities/features/gentle_activities/presentation/gentle_game_page.dart';
import 'package:creative_activities/features/gentle_activities/presentation/picture_puzzle_page.dart';
import 'package:creative_activities/l10n/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

Future<void> _pump(WidgetTester tester, Widget page) async {
  await tester.binding.setSurfaceSize(const Size(800, 1000));
  addTearDown(() => tester.binding.setSurfaceSize(null));
  await tester.pumpWidget(
    MaterialApp(
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      theme: gmBuildTheme(),
      home: page,
    ),
  );
  await tester.pumpAndSettle();
}

/// Index of the one [GmFocusRing] that currently shows the focus ring, or
/// null when none does. A focused ring paints a foreground ShapeDecoration.
int? _focusedRing(WidgetTester tester) {
  final rings = find.byType(GmFocusRing);
  final shown = <int>[
    for (var i = 0; i < rings.evaluate().length; i++)
      if (find
          .descendant(
            of: rings.at(i),
            matching: find.byWidgetPredicate(
              (w) =>
                  w is DecoratedBox &&
                  w.position == DecorationPosition.foreground &&
                  w.decoration is ShapeDecoration,
            ),
          )
          .evaluate()
          .isNotEmpty)
        i,
  ];
  expect(shown.length, lessThanOrEqualTo(1), reason: 'one ring at a time');
  return shown.isEmpty ? null : shown.single;
}

Future<void> _key(WidgetTester tester, LogicalKeyboardKey key) async {
  await tester.sendKeyEvent(key);
  await tester.pumpAndSettle();
}

/// Presses Tab until a tile shows the focus ring, or fails after a limit.
Future<void> _tabToRing(WidgetTester tester) async {
  for (var i = 0; i < 20 && _focusedRing(tester) == null; i++) {
    await _key(tester, LogicalKeyboardKey.tab);
  }
}

bool _selected(WidgetTester tester, int index) => tester
    .getSemantics(find.bySemanticsLabel(RegExp(r', tile \d+$')).at(index))
    .value
    .isNotEmpty;

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  testWidgets('Tab reaches the first picture tile and shows a focus ring', (
    tester,
  ) async {
    await _pump(
      tester,
      const GentleGamePage(pictures: ActivityPicture.samples),
    );
    expect(_focusedRing(tester), isNull);
    await _tabToRing(tester);
    expect(_focusedRing(tester), 0, reason: 'focus starts at the first tile');
  });

  testWidgets('Tab moves through the tiles in reading order', (tester) async {
    await _pump(
      tester,
      const GentleGamePage(pictures: ActivityPicture.samples),
    );
    await _tabToRing(tester);
    await _key(tester, LogicalKeyboardKey.tab);
    expect(_focusedRing(tester), 1);
    await _key(tester, LogicalKeyboardKey.tab);
    expect(_focusedRing(tester), 2);
  });

  testWidgets('an arrow key moves focus to the neighbouring tile', (
    tester,
  ) async {
    await _pump(
      tester,
      const GentleGamePage(pictures: ActivityPicture.samples),
    );
    await _tabToRing(tester);
    expect(_focusedRing(tester), 0);
    await _key(tester, LogicalKeyboardKey.arrowRight);
    expect(_focusedRing(tester), 1);
    await _key(tester, LogicalKeyboardKey.arrowDown);
    final afterDown = _focusedRing(tester);
    expect(afterDown, isNotNull);
    expect(afterDown, isNot(1), reason: 'down leaves the tile');
  });

  testWidgets('Enter and Space choose the focused tile', (tester) async {
    await _pump(
      tester,
      const GentleGamePage(pictures: ActivityPicture.samples),
    );
    await _tabToRing(tester);
    expect(_selected(tester, 0), isFalse);
    await _key(tester, LogicalKeyboardKey.enter);
    expect(_selected(tester, 0), isTrue, reason: 'Enter chooses the tile');

    await _key(tester, LogicalKeyboardKey.arrowRight);
    expect(_focusedRing(tester), 1);
    await _key(tester, LogicalKeyboardKey.space);
    expect(_selected(tester, 1), isTrue, reason: 'Space chooses the tile');
  });

  testWidgets('the focus ring shows on the puzzle board too', (tester) async {
    await _pump(
      tester,
      const PicturePuzzlePage(pictures: ActivityPicture.samples),
    );
    expect(_focusedRing(tester), isNull);
    await _tabToRing(tester);
    expect(_focusedRing(tester), isNotNull);
    await _key(tester, LogicalKeyboardKey.enter);
    // Choosing a spot or piece must not break the board or drop the ring.
    expect(tester.takeException(), isNull);
  });
}
