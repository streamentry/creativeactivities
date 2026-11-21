import 'dart:convert';
import 'dart:io';

import 'package:creative_activities/features/activity_cards/data/activity_catalog.dart';
import 'package:creative_activities/features/activity_cards/presentation/find_activity_page.dart';
import 'package:creative_activities/l10n/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../helpers/pump_app.dart';

Map<String, Object?> _card({
  required String id,
  required String slug,
  required String name,
  List<String> safetyFlags = const ['none'],
}) => {
  'id': id,
  'slug': slug,
  'name': name,
  'summary': 'A short line about $name.',
  'type': 'craft',
  'prepMinutes': 0,
  'activityMinutes': [10, 20],
  'cost': 'free',
  'mess': 'none',
  'energy': 'low',
  'supervision': 'nearby',
  'settings': ['seated'],
  'groups': ['one-to-one'],
  'senses': ['touch'],
  'variationKinds': <String>[],
  'safetyFlags': safetyFlags,
  'materials': ['Paper'],
  'steps': ['One.', 'Two.', 'Three.'],
  'safety': ['Keep scissors out of reach.'],
  'stopNote': 'It is fine to stop.',
  'crisisRoute': false,
  'version': 1,
  'reviewStatus': 'not-reviewed',
};

String _file(List<Map<String, Object?>> cards) =>
    jsonEncode({'version': 1, 'generatedFrom': '0123456789ab', 'cards': cards});

final String _twoCards = _file([
  _card(id: 'ca-0001', slug: 'fold-paper', name: 'Fold paper'),
  _card(id: 'ca-0002', slug: 'tear-paper', name: 'Tear paper'),
]);

/// Any attempt to open a network connection fails the test (APP-001: no
/// network call).
class _NoNetwork extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) {
    throw StateError('The activity cards made a network call.');
  }
}

Future<void> _pump(WidgetTester tester, Widget page) async {
  tester.view.physicalSize = const Size(800, 4000);
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.resetPhysicalSize);
  addTearDown(tester.view.resetDevicePixelRatio);
  await tester.pumpApp(page);
  await tester.pumpAndSettle();
}

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  testWidgets('the finder lists the bundled cards', (tester) async {
    await _pump(
      tester,
      FindActivityPage(
        store: ActivityCatalogStore(read: () async => _twoCards),
      ),
    );

    expect(find.text('Fold paper'), findsOneWidget);
    expect(find.text('Tear paper'), findsOneWidget);
  });

  testWidgets('choosing a result opens its activity card', (tester) async {
    await _pump(
      tester,
      FindActivityPage(
        store: ActivityCatalogStore(read: () async => _twoCards),
      ),
    );

    await tester.tap(find.text('Tear paper'));
    await tester.pumpAndSettle();

    expect(find.text('Tear paper'), findsWidgets);
    expect(find.text('A short line about Tear paper.'), findsOneWidget);
    expect(find.text('1. One.'), findsOneWidget);
  });

  testWidgets('an unreadable card file shows a calm message and Done for now', (
    tester,
  ) async {
    await _pump(
      tester,
      FindActivityPage(
        store: ActivityCatalogStore(
          read: () async => throw const FileSystemException('missing'),
        ),
      ),
    );
    final l10n = AppLocalizations.of(tester.element(find.byType(Scaffold)));

    expect(find.text(l10n.activityCardsUnavailable), findsOneWidget);
    expect(find.text(l10n.commonDoneForNow), findsOneWidget);
    expect(find.text('Fold paper'), findsNothing);
  });

  testWidgets('a corrupt card file shows the same calm message', (
    tester,
  ) async {
    await _pump(
      tester,
      FindActivityPage(
        store: ActivityCatalogStore(read: () async => '{"version": 9}'),
      ),
    );
    final l10n = AppLocalizations.of(tester.element(find.byType(Scaffold)));

    expect(find.text(l10n.activityCardsUnavailable), findsOneWidget);
  });

  testWidgets('the finder and cards make no network call, even offline', (
    tester,
  ) async {
    final previous = HttpOverrides.current;
    HttpOverrides.global = _NoNetwork();
    addTearDown(() => HttpOverrides.global = previous);

    await _pump(
      tester,
      FindActivityPage(
        store: ActivityCatalogStore(read: () async => _twoCards),
      ),
    );
    await tester.tap(find.text('Fold paper'));
    await tester.pumpAndSettle();

    expect(find.text('1. One.'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
