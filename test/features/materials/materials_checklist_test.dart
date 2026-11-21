import 'package:creative_activities/features/materials/data/material_ticks.dart';
import 'package:creative_activities/features/materials/presentation/materials_checklist.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../helpers/pump_app.dart';

const _materials = ['A jar', 'Water', 'Scissors'];
const _key = 'material_ticks.v1';

Future<void> _pump(WidgetTester tester, {double textScale = 1}) async {
  await tester.pumpApp(
    MediaQuery(
      data: MediaQueryData(textScaler: TextScaler.linear(textScale)),
      child: const Scaffold(
        body: SingleChildScrollView(
          padding: EdgeInsets.all(16),
          child: Column(
            children: [
              MaterialsChecklist(
                activityId: 'animals_farm',
                materials: _materials,
              ),
            ],
          ),
        ),
      ),
    ),
  );
  await tester.pumpAndSettle();
}

Future<void> _tapRow(WidgetTester tester, String material) async {
  await tester.tap(find.widgetWithText(CheckboxListTile, material));
  await tester.pumpAndSettle();
}

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  testWidgets('each material shows whether it is ticked, in words', (
    tester,
  ) async {
    await _pump(tester);

    expect(find.text('Need to get'), findsNWidgets(3));
    expect(find.text('I have this'), findsNothing);

    await _tapRow(tester, 'Water');
    expect(find.text('I have this'), findsOneWidget);
    expect(find.text('Need to get'), findsNWidgets(2));
  });

  testWidgets('ticks survive a restart and are cleared by clearing the data', (
    tester,
  ) async {
    await _pump(tester);
    await _tapRow(tester, 'A jar');

    await tester.pumpWidget(const SizedBox());
    await _pump(tester);
    expect(find.text('I have this'), findsOneWidget);

    await const MaterialTicksStore().clear();
    await tester.pumpWidget(const SizedBox());
    await _pump(tester);
    expect(find.text('I have this'), findsNothing);
    expect(find.text('Need to get'), findsNWidgets(3));
  });

  testWidgets('when everything is ticked the card says so', (tester) async {
    await _pump(tester);
    expect(find.text('You have everything you need'), findsNothing);

    for (final m in _materials) {
      await _tapRow(tester, m);
    }
    expect(find.text('You have everything you need'), findsOneWidget);
    expect(find.text('Need to get'), findsNothing);
  });

  testWidgets('the card has no shopping or product links', (tester) async {
    await _pump(tester);
    final texts = tester
        .widgetList<Text>(find.byType(Text))
        .map((t) => t.data ?? '')
        .join(' ')
        .toLowerCase();
    expect(texts, isNot(contains('http')));
    expect(texts, isNot(contains('buy')));
    expect(texts, isNot(contains('shop')));
    expect(find.byType(TextButton), findsNothing);
  });

  testWidgets('every tick target is at least 48 units high', (tester) async {
    await _pump(tester);
    for (final m in _materials) {
      expect(
        tester.getSize(find.widgetWithText(CheckboxListTile, m)).height,
        greaterThanOrEqualTo(48),
        reason: m,
      );
    }
  });

  testWidgets('unreadable saved ticks are reported and not changed', (
    tester,
  ) async {
    const bad = '{"v":1,"activities":[]}';
    SharedPreferences.setMockInitialValues({_key: bad});
    await _pump(tester);

    expect(
      find.text(
        'The saved ticks could not be read. They have not been changed.',
      ),
      findsOneWidget,
    );
    await _tapRow(tester, 'Water');
    expect(find.text('I have this'), findsNothing);
    expect((await SharedPreferences.getInstance()).getString(_key), bad);
  });

  testWidgets('at 200% text the checklist shows every row without errors', (
    tester,
  ) async {
    await _pump(tester, textScale: 2);
    for (final m in _materials) {
      await _tapRow(tester, m);
    }
    expect(tester.takeException(), isNull);
    expect(find.text('You have everything you need'), findsOneWidget);
  });
}
