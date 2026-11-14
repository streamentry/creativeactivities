import 'package:creative_activities/data/services/local_pack_service.dart';
import 'package:creative_activities/features/gentle_activities/presentation/gentle_home_page.dart';
import 'package:creative_activities/l10n/l10n.dart';
import 'package:creative_activities/shared/widgets/pack_card.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'helpers/home_menu.dart';

void main() {
  // Every test starts from a fresh install. Tests share one isolate in CI
  // (very_good --optimization, random order), so a board or comfort choice
  // saved by another test must not leak in as a resume prompt.
  setUp(() => SharedPreferences.setMockInitialValues({}));

  testWidgets('gentle home opens included packs without storage or downloads', (
    tester,
  ) async {
    await tester.runAsync(() => LocalPackService().getPacksIndex());
    await tester.pumpWidget(
      const MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        home: GentleHomePage(),
      ),
    );
    await tapHomeMenuItem(tester, 'Explore the picture-pack library');
    expect(find.byType(PackCard), findsWidgets);
    expect(find.text('Download'), findsNothing);
    expect(find.text('Download Pack'), findsNothing);
    expect(tester.takeException(), isNull);
  });
}
