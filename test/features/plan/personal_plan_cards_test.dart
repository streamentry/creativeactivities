import 'dart:convert';

import 'package:creative_activities/data/models/pack.dart';
import 'package:creative_activities/features/activity_cards/data/activity_catalog.dart';
import 'package:creative_activities/features/activity_cards/presentation/activity_card_page.dart';
import 'package:creative_activities/features/plan/presentation/personal_plan_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../helpers/pump_app.dart';

const _key = 'personal_plan.v1';

Map<String, Object?> _cardJson(String id, String slug, String name) => {
  'id': id,
  'slug': slug,
  'name': name,
  'summary': 'A short summary for $name.',
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
  'materials': ['Paper'],
  'steps': ['Sit together.', 'Choose one person.', 'Read it back.'],
  'safety': ['Take breaks.'],
  'stopNote': 'Stop whenever you like.',
  'crisisRoute': false,
  'version': 1,
  'reviewStatus': 'not-reviewed',
};

ActivityCatalogStore _catalogStore() {
  final source = jsonEncode({
    'version': 1,
    'generatedFrom': '0123456789ab',
    'cards': [
      _cardJson(
        'ca-0022',
        'write-a-letter-together',
        'Write a letter together',
      ),
    ],
  });
  return ActivityCatalogStore(read: () async => source);
}

final List<Pack> _packs = [
  for (var i = 1; i <= 2; i++)
    Pack(
      id: 'test_pack_$i',
      title: 'Activity $i',
      theme: 'theme',
      category: 'category',
      version: '1',
      difficulty: GameDifficulty.easy,
      thumbnailUrl: 'assets/images/catalog/none.jpg',
      images: const [],
      estimatedSize: '1 MB',
    ),
];

Future<void> _pumpPage(WidgetTester tester) async {
  await tester.pumpApp(
    PersonalPlanPage(
      loadPacks: () async => _packs,
      catalogStore: _catalogStore(),
    ),
  );
  await tester.pumpAndSettle();
}

void _savePlanRecord(String activities) {
  SharedPreferences.setMockInitialValues({
    _key:
        '{"v":1,"title":"Sunday with Dad","note":"", '
        '"activities":$activities}',
  });
}

Future<List<dynamic>> _storedActivities() async {
  final raw = (await SharedPreferences.getInstance()).getString(_key)!;
  final json = jsonDecode(raw) as Map<String, Object?>;
  return json['activities']! as List<dynamic>;
}

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  testWidgets('a card entry shows its name as a button, a pack entry as text', (
    tester,
  ) async {
    _savePlanRecord('["test_pack_1","card:ca-0022"]');
    await _pumpPage(tester);

    expect(find.text('Activity 1'), findsOneWidget);
    expect(find.widgetWithText(TextButton, 'Activity 1'), findsNothing);
    expect(
      find.widgetWithText(TextButton, 'Write a letter together'),
      findsOneWidget,
    );
  });

  testWidgets('tapping a card entry opens its activity card', (tester) async {
    _savePlanRecord('["card:ca-0022"]');
    await _pumpPage(tester);

    await tester.tap(
      find.widgetWithText(TextButton, 'Write a letter together'),
    );
    await tester.pumpAndSettle();

    expect(find.byType(ActivityCardPage), findsOneWidget);
  });

  testWidgets('a card no longer bundled says so and can still be removed', (
    tester,
  ) async {
    _savePlanRecord('["card:ca-0999"]');
    await _pumpPage(tester);

    expect(
      find.text('This activity is no longer in the app. You can remove it.'),
      findsOneWidget,
    );
    await tester.tap(find.text('Remove'));
    await tester.pumpAndSettle();

    expect(await _storedActivities(), isEmpty);
  });

  testWidgets('removing a card leaves the pack entries in place', (
    tester,
  ) async {
    _savePlanRecord('["test_pack_1","card:ca-0022"]');
    await _pumpPage(tester);

    await tester.tap(find.text('Remove').last);
    await tester.pumpAndSettle();

    expect(await _storedActivities(), ['test_pack_1']);
  });

  testWidgets('the plan page reads the plan again after a card screen', (
    tester,
  ) async {
    _savePlanRecord('["card:ca-0022","test_pack_1"]');
    tester.view.physicalSize = const Size(800, 4000);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await _pumpPage(tester);

    await tester.tap(
      find.widgetWithText(TextButton, 'Write a letter together'),
    );
    await tester.pumpAndSettle();

    // A change saved while the card screen was open, as the card screen
    // would save an addition.
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _key,
      '{"v":1,"title":"Sunday with Dad","note":"", '
      '"activities":["card:ca-0022","test_pack_1","test_pack_2"]}',
    );

    await tester.tap(find.text('Done for now'));
    await tester.pumpAndSettle();
    expect(find.text('Activity 2'), findsOneWidget);

    await tester.tap(find.text('Remove').last);
    await tester.pumpAndSettle();

    expect(await _storedActivities(), ['card:ca-0022', 'test_pack_1']);
  });
}
