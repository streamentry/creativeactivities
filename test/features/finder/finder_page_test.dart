import 'dart:io';

import 'package:creative_activities/features/finder/data/finder_card.dart';
import 'package:creative_activities/features/finder/presentation/finder_page.dart';
import 'package:creative_activities/l10n/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../helpers/pump_app.dart';

const _sortButtons = FinderCard(
  id: 'sort-buttons',
  name: 'Sort buttons',
  facts: FinderFacts(
    type: FinderType.craft,
    prepMinutes: 0,
    minMinutes: 10,
    maxMinutes: 20,
    cost: FinderCost.free,
    mess: FinderMess.none,
    energy: FinderEnergy.low,
    supervision: FinderSupervision.nearby,
    settings: {FinderSetting.seated},
    groups: {FinderGroup.oneToOne},
    senses: {FinderSense.touch},
  ),
);

const _paintPlate = FinderCard(
  id: 'paint-plate',
  name: 'Paint a plate',
  facts: FinderFacts(
    type: FinderType.art,
    prepMinutes: 5,
    minMinutes: 40,
    maxMinutes: 60,
    cost: FinderCost.low,
    mess: FinderMess.medium,
    energy: FinderEnergy.low,
    supervision: FinderSupervision.nearby,
    settings: {FinderSetting.bedside},
    groups: {FinderGroup.oneToOne},
    senses: {FinderSense.sight},
  ),
);

const _humSong = FinderCard(
  id: 'hum-song',
  name: 'Hum a song',
  facts: FinderFacts(
    type: FinderType.music,
    prepMinutes: 0,
    minMinutes: 15,
    maxMinutes: 25,
    cost: FinderCost.free,
    mess: FinderMess.none,
    energy: FinderEnergy.low,
    supervision: FinderSupervision.nearby,
    settings: {FinderSetting.seated},
    groups: {FinderGroup.smallGroup},
    senses: {FinderSense.hearing},
    variationKinds: {'nonverbal'},
    safetyFlags: {FinderSafetyFlag.heat},
  ),
);

const List<FinderCard> _cards = [_sortButtons, _paintPlate, _humSong];

/// Any attempt to open a network connection fails the test (APP-005: no
/// network call).
class _NoNetwork extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) {
    throw StateError('The finder made a network call.');
  }
}

Future<void> _pumpFinder(WidgetTester tester) async {
  tester.view.physicalSize = const Size(800, 4000);
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.resetPhysicalSize);
  addTearDown(tester.view.resetDevicePixelRatio);
  await tester.pumpApp(const FinderPage(cards: _cards));
  await tester.pump();
}

void main() {
  testWidgets(
    'with no choices every activity is listed and Done for now stays visible',
    (tester) async {
      await _pumpFinder(tester);
      final l10n = AppLocalizations.of(tester.element(find.byType(FinderPage)));

      expect(find.text('Sort buttons'), findsOneWidget);
      expect(find.text('Paint a plate'), findsOneWidget);
      expect(find.text('Hum a song'), findsOneWidget);
      expect(find.text(l10n.commonDoneForNow), findsOneWidget);
    },
  );

  testWidgets(
    'a filter hides activities that do not fit and says why the rest do',
    (tester) async {
      await _pumpFinder(tester);
      final l10n = AppLocalizations.of(tester.element(find.byType(FinderPage)));

      await tester.tap(find.text(l10n.finderSettingSeated));
      await tester.pump();

      expect(find.text('Sort buttons'), findsOneWidget);
      expect(find.text('Hum a song'), findsOneWidget);
      expect(find.text('Paint a plate'), findsNothing);
      expect(find.text(l10n.finderReasonWorksSeated), findsNWidgets(2));
      expect(find.text(l10n.finderWhyFits), findsNWidgets(2));
    },
  );

  testWidgets('tapping a chosen filter again clears it', (tester) async {
    await _pumpFinder(tester);
    final l10n = AppLocalizations.of(tester.element(find.byType(FinderPage)));

    await tester.tap(find.text(l10n.finderSettingSeated));
    await tester.pump();
    await tester.tap(find.text(l10n.finderSettingSeated));
    await tester.pump();

    expect(find.text('Paint a plate'), findsOneWidget);
    expect(find.text('Sort buttons'), findsOneWidget);
  });

  testWidgets('leaving out a safety flag removes activities that list it', (
    tester,
  ) async {
    await _pumpFinder(tester);
    final l10n = AppLocalizations.of(tester.element(find.byType(FinderPage)));

    await tester.tap(find.text(l10n.finderAvoidHeat));
    await tester.pump();

    expect(find.text('Hum a song'), findsNothing);
    expect(find.text('Sort buttons'), findsOneWidget);
  });

  testWidgets(
    'no result offers to clear the choices, and clearing shows all again',
    (tester) async {
      await _pumpFinder(tester);
      final l10n = AppLocalizations.of(tester.element(find.byType(FinderPage)));

      await tester.tap(find.text(l10n.finderTimeFifteen));
      await tester.pump();
      await tester.tap(find.text(l10n.finderSettingBedside));
      await tester.pump();

      expect(find.text(l10n.finderEmptyTitle), findsOneWidget);
      expect(find.text('Sort buttons'), findsNothing);

      await tester.tap(find.text(l10n.finderClearAll));
      await tester.pump();

      expect(find.text(l10n.finderEmptyTitle), findsNothing);
      expect(find.text('Sort buttons'), findsOneWidget);
      expect(find.text('Paint a plate'), findsOneWidget);
      expect(find.text('Hum a song'), findsOneWidget);
    },
  );

  testWidgets('filters are real controls with a padded touch target', (
    tester,
  ) async {
    await _pumpFinder(tester);
    final chips = tester.widgetList<FilterChip>(find.byType(FilterChip));

    expect(chips, isNotEmpty);
    for (final chip in chips) {
      expect(chip.materialTapTargetSize, MaterialTapTargetSize.padded);
    }
  });

  testWidgets('the finder makes no network call, even in airplane mode', (
    tester,
  ) async {
    final previous = HttpOverrides.current;
    HttpOverrides.global = _NoNetwork();
    addTearDown(() => HttpOverrides.global = previous);

    await _pumpFinder(tester);
    final l10n = AppLocalizations.of(tester.element(find.byType(FinderPage)));
    await tester.tap(find.text(l10n.finderTimeThirty));
    await tester.pump();
    await tester.tap(find.text(l10n.finderSettingSeated));
    await tester.pump();

    expect(find.text('Sort buttons'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
