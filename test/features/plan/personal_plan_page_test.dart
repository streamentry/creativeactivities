import 'package:creative_activities/data/models/pack.dart';
import 'package:creative_activities/features/plan/data/personal_plan.dart';
import 'package:creative_activities/features/plan/presentation/personal_plan_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../helpers/pump_app.dart';

const _key = 'personal_plan.v1';

// Ids are not in the bundled index, so the titles below are used as they are.
final List<Pack> _packs = [
  for (var i = 1; i <= 6; i++)
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

Future<void> _pumpPage(WidgetTester tester, {double textScale = 1}) async {
  await tester.pumpApp(
    MediaQuery(
      data: MediaQueryData(textScaler: TextScaler.linear(textScale)),
      child: PersonalPlanPage(loadPacks: () async => _packs),
    ),
  );
  await tester.pumpAndSettle();
}

Future<void> _makePlan(WidgetTester tester, String name) async {
  await tester.tap(find.text('Make a plan'));
  await tester.pumpAndSettle();
  await tester.enterText(find.byType(TextField).first, name);
  await tester.tap(find.text('Save plan'));
  await tester.pumpAndSettle();
}

Future<void> _addActivity(WidgetTester tester, int number) async {
  await tester.tap(find.text('Add an activity'));
  await tester.pumpAndSettle();
  await tester.tap(find.text('Activity $number'));
  await tester.pumpAndSettle();
}

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  testWidgets('a new plan is named, saved and shown with its name', (
    tester,
  ) async {
    await _pumpPage(tester);
    expect(find.text('Make a plan'), findsOneWidget);

    await _makePlan(tester, 'Sunday with Dad');

    expect(find.text('Sunday with Dad'), findsOneWidget);
    expect(
      find.text('No activities yet. Add up to five for this visit.'),
      findsOneWidget,
    );
  });

  testWidgets('a plan with no name is not saved', (tester) async {
    await _pumpPage(tester);
    await tester.tap(find.text('Make a plan'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Save plan'));
    await tester.pumpAndSettle();

    expect(find.text('Please write a name for the plan.'), findsOneWidget);
    expect(find.text('Save plan'), findsOneWidget, reason: 'still editing');
    expect((await const PersonalPlanStore().load()).plan, isNull);
  });

  testWidgets('activities can be added, removed, and stop at five', (
    tester,
  ) async {
    await _pumpPage(tester);
    await _makePlan(tester, 'Visit');

    for (var i = 1; i <= 5; i++) {
      await _addActivity(tester, i);
    }
    expect(find.text('Add an activity'), findsNothing);
    expect(
      find.text(
        'A plan holds up to five activities. Remove one to add another.',
      ),
      findsOneWidget,
    );
    final saved = await const PersonalPlanStore().load();
    expect(saved.plan!.activityIds, hasLength(5));

    await tester.tap(find.widgetWithText(OutlinedButton, 'Remove').first);
    await tester.pumpAndSettle();
    expect(find.text('Add an activity'), findsOneWidget);
    expect(
      (await const PersonalPlanStore().load()).plan!.activityIds,
      hasLength(4),
    );
  });

  testWidgets('the same activity cannot be chosen twice', (tester) async {
    await _pumpPage(tester);
    await _makePlan(tester, 'Visit');
    await _addActivity(tester, 1);

    await tester.tap(find.text('Add an activity'));
    await tester.pumpAndSettle();
    expect(find.text('Already in the plan'), findsOneWidget);
    await tester.tap(find.text('Activity 1'));
    await tester.pumpAndSettle();

    expect((await const PersonalPlanStore().load()).plan!.activityIds, [
      'test_pack_1',
    ]);
  });

  testWidgets('the plan is still there after a restart', (tester) async {
    await _pumpPage(tester);
    await _makePlan(tester, 'Sunday with Dad');
    await _addActivity(tester, 2);

    // A fresh page reads only what was saved.
    await tester.pumpWidget(const SizedBox());
    await _pumpPage(tester);

    expect(find.text('Sunday with Dad'), findsOneWidget);
    expect(find.text('Activity 2'), findsOneWidget);
  });

  testWidgets('a saved record that cannot be read is shown as such and kept', (
    tester,
  ) async {
    const bad = '{"v":1,"title":"","note":"","activities":[]}';
    SharedPreferences.setMockInitialValues({_key: bad});
    await _pumpPage(tester);

    expect(
      find.text(
        'The saved plan could not be read. It has not been changed or deleted.',
      ),
      findsOneWidget,
    );
    expect(find.text('Make a plan'), findsNothing);
    expect(find.text('Add an activity'), findsNothing);

    final raw = (await SharedPreferences.getInstance()).getString(_key);
    expect(raw, bad, reason: 'an unreadable plan is not overwritten');
  });

  testWidgets('starting a new plan after unreadable data clears it', (
    tester,
  ) async {
    SharedPreferences.setMockInitialValues({_key: '{broken'});
    await _pumpPage(tester);

    await tester.tap(find.text('Start a new plan'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Start new'));
    await tester.pumpAndSettle();

    expect(find.text('Make a plan'), findsOneWidget);
    expect((await SharedPreferences.getInstance()).getString(_key), isNull);
  });

  testWidgets('deleting the plan asks first and then removes it', (
    tester,
  ) async {
    await _pumpPage(tester);
    await _makePlan(tester, 'Visit');
    await _addActivity(tester, 3);

    await tester.tap(find.text('Delete this plan'));
    await tester.pumpAndSettle();
    expect(find.text('Delete this plan?'), findsOneWidget);
    await tester.tap(find.text('Cancel'));
    await tester.pumpAndSettle();
    expect(find.text('Visit'), findsOneWidget, reason: 'cancel keeps it');

    await tester.tap(find.text('Delete this plan'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Delete plan'));
    await tester.pumpAndSettle();

    expect(find.text('Make a plan'), findsOneWidget);
    expect((await const PersonalPlanStore().load()).plan, isNull);
  });

  testWidgets('an activity that left the app can still be removed', (
    tester,
  ) async {
    SharedPreferences.setMockInitialValues({
      _key: '{"v":1,"title":"Visit","note":"","activities":["gone_pack"]}',
    });
    await _pumpPage(tester);

    expect(
      find.text('This activity is no longer in the app. You can remove it.'),
      findsOneWidget,
    );
    await tester.tap(find.widgetWithText(OutlinedButton, 'Remove'));
    await tester.pumpAndSettle();
    expect((await const PersonalPlanStore().load()).plan!.activityIds, isEmpty);
  });

  testWidgets('at 200% text the plan page scrolls without errors', (
    tester,
  ) async {
    await _pumpPage(tester, textScale: 2);
    await _makePlan(tester, 'Sunday with Dad');
    for (var i = 1; i <= 5; i++) {
      await _addActivity(tester, i);
    }
    expect(tester.takeException(), isNull);
    await tester.scrollUntilVisible(
      find.text('Done for now'),
      200,
      scrollable: find.byType(Scrollable).first,
    );
    expect(find.text('Done for now'), findsOneWidget);
  });
}
