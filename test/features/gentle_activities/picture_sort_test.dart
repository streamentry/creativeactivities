import 'dart:math';

import 'package:creative_activities/design_system.dart';
import 'package:creative_activities/features/gentle_activities/models/activity_picture.dart';
import 'package:creative_activities/features/gentle_activities/models/sort_board.dart';
import 'package:creative_activities/features/gentle_activities/presentation/picture_sort_page.dart';
import 'package:creative_activities/l10n/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

/// Icon stand-ins for the bundled drawings, with the same ids and names.
const _pictures = [
  ActivityPicture(id: 'teacup', label: 'Teacup', icon: Icons.coffee),
  ActivityPicture(id: 'kettle', label: 'Kettle', icon: Icons.kitchen),
  ActivityPicture(
    id: 'bread',
    label: 'Loaf of bread',
    icon: Icons.bakery_dining,
  ),
  ActivityPicture(
    id: 'frying-pan',
    label: 'Frying pan',
    icon: Icons.soup_kitchen,
  ),
  ActivityPicture(id: 'cake', label: 'Birthday cake', icon: Icons.cake),
  ActivityPicture(
    id: 'sunflower',
    label: 'Sunflower',
    icon: Icons.local_florist,
  ),
  ActivityPicture(id: 'tulip', label: 'Red tulip', icon: Icons.spa),
  ActivityPicture(
    id: 'watering-can',
    label: 'Watering can',
    icon: Icons.water_drop,
  ),
  ActivityPicture(id: 'potted-plant', label: 'Potted plant', icon: Icons.grass),
  ActivityPicture(id: 'tree', label: 'Tree', icon: Icons.park),
];

const _kitchen = ['teacup', 'kettle', 'bread', 'frying-pan', 'cake'];
const _garden = ['sunflower', 'tulip', 'watering-can', 'potted-plant', 'tree'];

Widget _app({double textScale = 1, int seed = 5}) => MaterialApp(
  localizationsDelegates: AppLocalizations.localizationsDelegates,
  supportedLocales: AppLocalizations.supportedLocales,
  theme: gmBuildTheme(),
  builder: (context, child) => MediaQuery(
    data: MediaQuery.of(context)
        .copyWith(textScaler: TextScaler.linear(textScale)),
    child: child!,
  ),
  home: PictureSortPage(pictures: _pictures, random: Random(seed)),
);

/// The page deals with the same random source first, so a board built here
/// from the same seed has the same pictures in the same tray order.
SortBoard _mirror(int seed) =>
    SortBoard.deal(first: _kitchen, second: _garden, random: Random(seed));

final Finder _kitchenBasket = find.bySemanticsLabel('Kitchen');
final Finder _gardenBasket = find.bySemanticsLabel('Garden');
Finder _trayPicture(String name) =>
    find.bySemanticsLabel('$name, not in a basket yet');

/// Scrolls the target into view first; the page scrolls at large text.
Future<void> _tap(WidgetTester tester, Finder finder) async {
  await tester.ensureVisible(finder);
  await tester.tap(finder);
}

String _name(String id) => _pictures.firstWhere((p) => p.id == id).label;

Future<void> _pump(WidgetTester tester, {double textScale = 1}) async {
  await tester.binding.setSurfaceSize(const Size(390, 844));
  addTearDown(() => tester.binding.setSurfaceSize(null));
  await tester.pumpWidget(_app(textScale: textScale));
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('two baskets, the tray, instructions and Done for now', (
    tester,
  ) async {
    final handle = tester.ensureSemantics();
    await _pump(tester);
    expect(_kitchenBasket, findsOneWidget);
    expect(_gardenBasket, findsOneWidget);
    expect(find.text('To sort'), findsOneWidget);
    expect(find.text('Done for now'), findsOneWidget);
    expect(find.text('Undo'), findsOneWidget);
    expect(find.text('New pictures'), findsOneWidget);
    expect(find.textContaining('Tap a picture'), findsOneWidget);
    // No clock, count, score, streak or move counter anywhere.
    expect(
      find.textContaining(
        RegExp(
          r'score|streak|moves|timer|\d+ of \d+|seconds',
          caseSensitive: false,
        ),
      ),
      findsNothing,
    );
    handle.dispose();
  });

  testWidgets('a wrong basket moves nothing and names the right one gently', (
    tester,
  ) async {
    final handle = tester.ensureSemantics();
    await _pump(tester);
    final mirror = _mirror(5);
    final piece = mirror.tray.first;
    final right = mirror.correctBasketOf(piece);
    await _tap(tester, _trayPicture(_name(piece)));
    await tester.pump();
    final wrongBasket = right == 0 ? _gardenBasket : _kitchenBasket;
    await _tap(tester, wrongBasket);
    await tester.pump();
    expect(_trayPicture(_name(piece)), findsOneWidget);
    expect(
      find.textContaining(
        RegExp('wrong|incorrect|try again|mistake', caseSensitive: false),
      ),
      findsNothing,
    );
    final basketName = right == 0 ? 'Kitchen' : 'Garden';
    expect(
      find.text(
        '${_name(piece)} could go in the $basketName basket. '
        'Tap that basket to put it there.',
      ),
      findsOneWidget,
    );
    handle.dispose();
  });

  testWidgets('choose, then the right basket puts the picture in it', (
    tester,
  ) async {
    final handle = tester.ensureSemantics();
    await _pump(tester);
    final mirror = _mirror(5);
    final piece = mirror.tray.first;
    final right = mirror.correctBasketOf(piece);
    await _tap(tester, _trayPicture(_name(piece)));
    await tester.pump();
    await _tap(tester, right == 0 ? _kitchenBasket : _gardenBasket);
    await tester.pump();
    expect(_trayPicture(_name(piece)), findsNothing);
    expect(
      find.text(
        '${_name(piece)} went into the '
        '${right == 0 ? 'Kitchen' : 'Garden'} basket.',
      ),
      findsOneWidget,
    );
    handle.dispose();
  });

  testWidgets('Undo takes the last picture back; with none it says so', (
    tester,
  ) async {
    final handle = tester.ensureSemantics();
    await _pump(tester);
    await _tap(tester, find.text('Undo'));
    await tester.pump();
    expect(find.text('Nothing to undo yet.'), findsOneWidget);
    final mirror = _mirror(5);
    final piece = mirror.tray.first;
    await _tap(tester, _trayPicture(_name(piece)));
    await tester.pump();
    await _tap(
      tester,
      mirror.correctBasketOf(piece) == 0 ? _kitchenBasket : _gardenBasket,
    );
    await tester.pump();
    expect(_trayPicture(_name(piece)), findsNothing);
    await _tap(tester, find.text('Undo'));
    await tester.pump();
    expect(_trayPicture(_name(piece)), findsOneWidget);
    expect(
      find.text('Taken back. It is in the pictures to sort again.'),
      findsOneWidget,
    );
    handle.dispose();
  });

  testWidgets(
    'sorting every picture is calm; New pictures starts a new round',
    (tester) async {
      final handle = tester.ensureSemantics();
      await _pump(tester);
      final mirror = _mirror(5);
      for (final piece in mirror.tray.toList()) {
        await _tap(tester, _trayPicture(_name(piece)));
        await tester.pump();
        await _tap(
          tester,
          mirror.correctBasketOf(piece) == 0 ? _kitchenBasket : _gardenBasket,
        );
        await tester.pump();
      }
      expect(
        find.text(
          'Everything is sorted. Look through the baskets together, '
          'or start with new pictures.',
        ),
        findsOneWidget,
      );
      expect(_trayPicture('Teacup'), findsNothing);
      await _tap(tester, find.text('New pictures'));
      await tester.pumpAndSettle();
      expect(
        find.bySemanticsLabel(RegExp(r', not in a basket yet$')),
        findsNWidgets(6),
      );
      handle.dispose();
    },
  );

  for (final scenario in {
    'phone, 200% text': (const Size(390, 844), 2.0),
    'small phone, 200% text': (const Size(320, 568), 2.0),
    'landscape phone': (const Size(844, 390), 1.0),
  }.entries) {
    testWidgets('holds on ${scenario.key} with Done for now in view', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      await tester.binding.setSurfaceSize(scenario.value.$1);
      addTearDown(() => tester.binding.setSurfaceSize(null));
      await tester.pumpWidget(_app(textScale: scenario.value.$2));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      expect(_kitchenBasket, findsOneWidget);
      expect(
        tester.getSize(_kitchenBasket).shortestSide,
        greaterThanOrEqualTo(gmTileMin),
      );
      expect(find.text('Done for now'), findsOneWidget);
      handle.dispose();
    });
  }
}
