import 'dart:convert';
import 'dart:io';

import 'package:creative_activities/features/activity_cards/data/activity_card.dart';
import 'package:creative_activities/features/activity_cards/data/activity_catalog.dart';
import 'package:creative_activities/features/activity_cards/presentation/activity_card_page.dart';
import 'package:creative_activities/l10n/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../helpers/pump_app.dart';

Map<String, Object?> _cardJson({required bool crisis}) => {
  'id': 'ca-0022',
  'slug': 'write-a-letter-together',
  'name': 'Write a letter together',
  'summary': 'Write a short letter with one person holding the pen.',
  'type': 'conversation',
  'prepMinutes': 5,
  'activityMinutes': [15, 30],
  'cost': 'free',
  'mess': 'none',
  'energy': 'low',
  'supervision': 'nearby',
  'settings': ['seated'],
  'groups': ['one-to-one'],
  'senses': ['sight'],
  'variationKinds': ['nonverbal'],
  'safetyFlags': ['adhesive'],
  'materials': ['Paper', 'A pen with thick ink'],
  'steps': [
    'Sit together at a table.',
    'Choose one person to write.',
    'Read it back aloud.',
  ],
  'safety': ['Check for pen or ink sensitivity.'],
  'stopNote': 'Stop after one line if that is enough.',
  'crisisRoute': crisis,
  'version': 3,
  'reviewStatus': 'not-reviewed',
};

ActivityCard _card({required bool crisis}) {
  final source = jsonEncode({
    'version': 1,
    'generatedFrom': '0123456789ab',
    'cards': [_cardJson(crisis: crisis)],
  });
  final result = parseActivityCatalog(source);
  return (result as CatalogLoaded).catalog.cards.single;
}

/// Any attempt to open a network connection fails the test (APP-001).
class _NoNetwork extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) {
    throw StateError('The activity card made a network call.');
  }
}

Future<void> _pump(WidgetTester tester, ActivityCard card) async {
  tester.view.physicalSize = const Size(800, 4000);
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.resetPhysicalSize);
  addTearDown(tester.view.resetDevicePixelRatio);
  await tester.pumpApp(ActivityCardPage(card: card));
  await tester.pumpAndSettle();
}

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  testWidgets('shows the name, summary, numbered steps, safety and stop note', (
    tester,
  ) async {
    await _pump(tester, _card(crisis: false));
    final l10n = AppLocalizations.of(tester.element(find.byType(Scaffold)));

    expect(find.text('Write a letter together'), findsWidgets);
    expect(
      find.text('Write a short letter with one person holding the pen.'),
      findsOneWidget,
    );
    expect(find.text('1. Sit together at a table.'), findsOneWidget);
    expect(find.text('3. Read it back aloud.'), findsOneWidget);
    expect(find.text(l10n.activityCardWhatToDo), findsOneWidget);
    expect(find.text(l10n.activityCardSafety), findsOneWidget);
    expect(find.text('Check for glue or tape sensitivity'), findsOneWidget);
    expect(find.text(l10n.activityCardStopHeading), findsOneWidget);
    expect(find.text('Stop after one line if that is enough.'), findsOneWidget);
    expect(find.text(l10n.activityCardVersion(3)), findsOneWidget);
    expect(find.text(l10n.activityCardNotReviewed), findsOneWidget);
  });

  testWidgets('materials come with the I have this checklist', (tester) async {
    await _pump(tester, _card(crisis: false));
    final l10n = AppLocalizations.of(tester.element(find.byType(Scaffold)));

    expect(find.text('Paper'), findsOneWidget);
    expect(find.text('A pen with thick ink'), findsOneWidget);
    expect(find.text(l10n.materialsNeedToGet), findsNWidgets(2));
  });

  testWidgets('the full guide and share buttons are shown', (tester) async {
    await _pump(tester, _card(crisis: false));
    final l10n = AppLocalizations.of(tester.element(find.byType(Scaffold)));

    expect(find.text(l10n.activityGuideOpenFull), findsOneWidget);
    expect(find.text(l10n.activityGuideShare), findsOneWidget);
  });

  testWidgets(
    'a card that invites talk shows the crisis routes, with no checked date',
    (tester) async {
      await _pump(tester, _card(crisis: true));

      expect(find.text('If you are in crisis'), findsOneWidget);
      expect(find.textContaining('Numbers checked'), findsNothing);
      expect(find.textContaining('988'), findsOneWidget);
      expect(find.textContaining('Samaritans on 116 123'), findsOneWidget);
    },
  );

  testWidgets('a card without the crisis flag shows no crisis routes', (
    tester,
  ) async {
    await _pump(tester, _card(crisis: false));

    expect(find.text('If you are in crisis'), findsNothing);
    expect(find.textContaining('988'), findsNothing);
  });

  testWidgets('Done for now goes back', (tester) async {
    tester.view.physicalSize = const Size(800, 4000);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpApp(
      Builder(
        builder: (context) => TextButton(
          onPressed: () => Navigator.of(context).push(
            MaterialPageRoute<void>(
              builder: (_) => ActivityCardPage(card: _card(crisis: false)),
            ),
          ),
          child: const Text('open'),
        ),
      ),
    );
    await tester.tap(find.text('open'));
    await tester.pumpAndSettle();
    final l10n = AppLocalizations.of(
      tester.element(find.byType(Scaffold).last),
    );

    await tester.tap(find.text(l10n.commonDoneForNow));
    await tester.pumpAndSettle();

    expect(find.byType(ActivityCardPage), findsNothing);
  });

  testWidgets('the card makes no network call, even offline', (tester) async {
    final previous = HttpOverrides.current;
    HttpOverrides.global = _NoNetwork();
    addTearDown(() => HttpOverrides.global = previous);

    await _pump(tester, _card(crisis: true));

    expect(find.text('1. Sit together at a table.'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
