import 'package:creative_activities/design_system.dart';
import 'package:creative_activities/features/gentle_activities/presentation/gentle_home_page.dart';
import 'package:creative_activities/features/gentle_activities/presentation/keep_the_beat_page.dart';
import 'package:creative_activities/features/gentle_activities/presentation/picture_puzzle_page.dart';
import 'package:creative_activities/features/gentle_activities/presentation/picture_sort_page.dart';
import 'package:creative_activities/l10n/l10n.dart';
import 'package:creative_activities/shared/utils/experiments.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// The pilot games are listed on Home only in builds made with
/// `--dart-define=GM_EXPERIMENTS=true`. Run both ways:
/// `flutter test test/features/gentle_activities/pilot_games_entry_test.dart`
/// and with the define added.
void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  Future<void> pumpHome(WidgetTester tester) async {
    await tester.binding.setSurfaceSize(const Size(390, 844));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(
      MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        theme: gmBuildTheme(),
        home: const GentleHomePage(),
      ),
    );
    await tester.pumpAndSettle();
  }

  testWidgets('pilot games are listed only in experiment builds', (
    tester,
  ) async {
    await pumpHome(tester);
    if (experimentsEnabled) {
      expect(find.text('Pilot games'), findsOneWidget);
      expect(find.text('Tap-to-place puzzle'), findsOneWidget);
      expect(find.text('Sort pictures'), findsOneWidget);
      expect(find.text('Keep the beat'), findsOneWidget);
    } else {
      expect(find.text('Pilot games'), findsNothing);
      expect(find.text('Tap-to-place puzzle'), findsNothing);
      expect(find.text('Sort pictures'), findsNothing);
      expect(find.text('Keep the beat'), findsNothing);
    }
    expect(tester.takeException(), isNull);
  });

  testWidgets('each pilot game opens from Home when the build lists it', (
    tester,
  ) async {
    if (!experimentsEnabled) return;
    await pumpHome(tester);
    final openers = {
      'Tap-to-place puzzle': PicturePuzzlePage,
      'Sort pictures': PictureSortPage,
      'Keep the beat': KeepTheBeatPage,
    };
    for (final entry in openers.entries) {
      await tester.ensureVisible(find.text(entry.key));
      await tester.tap(find.text(entry.key));
      await tester.pumpAndSettle();
      expect(find.byType(entry.value), findsOneWidget);
      // Leave the page; the beat game has a timer that must stop first.
      await tester.pumpWidget(const SizedBox());
      await pumpHome(tester);
    }
  });
}
