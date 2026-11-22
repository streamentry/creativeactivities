import 'dart:convert';

import 'package:creative_activities/features/activity_cards/data/activity_card.dart';
import 'package:creative_activities/features/activity_cards/data/activity_catalog.dart';
import 'package:creative_activities/features/activity_cards/presentation/activity_card_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../helpers/pump_app.dart';

const _key = 'personal_plan.v1';

ActivityCard _card() {
  final source = jsonEncode({
    'version': 1,
    'generatedFrom': '0123456789ab',
    'cards': [
      {
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
        'materials': ['Paper'],
        'steps': [
          'Sit together at a table.',
          'Choose one person to write.',
          'Read it back aloud.',
        ],
        'safety': ['Take breaks.'],
        'stopNote': 'Stop after one line if that is enough.',
        'crisisRoute': false,
        'version': 3,
        'reviewStatus': 'not-reviewed',
      },
    ],
  });
  final result = parseActivityCatalog(source);
  return (result as CatalogLoaded).catalog.cards.single;
}

Future<void> _pump(WidgetTester tester) async {
  tester.view.physicalSize = const Size(800, 4000);
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.resetPhysicalSize);
  addTearDown(tester.view.resetDevicePixelRatio);
  await tester.pumpApp(ActivityCardPage(card: _card()));
  await tester.pumpAndSettle();
}

void _savePlan(String activities) {
  SharedPreferences.setMockInitialValues({
    _key:
        '{"v":1,"title":"Sunday with Dad","note":"", '
        '"activities":$activities}',
  });
}

Future<String?> _stored() async =>
    (await SharedPreferences.getInstance()).getString(_key);

Future<void> _tapAdd(WidgetTester tester) async {
  await tester.tap(find.text('Add to my plan'));
  await tester.pumpAndSettle();
}

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  testWidgets('adds the card to the plan and says so', (tester) async {
    _savePlan('["animals_farm"]');
    await _pump(tester);
    await _tapAdd(tester);

    expect(find.text('Added to your plan.'), findsOneWidget);
    expect(
      (jsonDecode((await _stored())!) as Map<String, Object?>)['activities'],
      ['animals_farm', 'card:ca-0022'],
    );
  });

  testWidgets('a card already in the plan is not added twice', (tester) async {
    _savePlan('["card:ca-0022"]');
    await _pump(tester);
    final before = await _stored();
    await _tapAdd(tester);

    expect(find.text('This activity is already in your plan.'), findsOneWidget);
    expect(await _stored(), before);
  });

  testWidgets('a full plan of five keeps the card out and says so calmly', (
    tester,
  ) async {
    _savePlan('["a","b","c","card:ca-0001","d"]');
    await _pump(tester);
    final before = await _stored();
    await _tapAdd(tester);

    expect(
      find.text(
        'Your plan is full. Remove an activity on My plan for a visit '
        'to add this one.',
      ),
      findsOneWidget,
    );
    expect(await _stored(), before);
  });

  testWidgets('with no saved plan nothing is created', (tester) async {
    await _pump(tester);
    await _tapAdd(tester);

    expect(
      find.text(
        'Make your plan first on My plan for a visit, then add this activity.',
      ),
      findsOneWidget,
    );
    expect(await _stored(), isNull);
  });

  testWidgets('an unreadable saved plan is kept as it is', (tester) async {
    SharedPreferences.setMockInitialValues({_key: '{not json'});
    await _pump(tester);
    await _tapAdd(tester);

    expect(
      find.text(
        'Your saved plan could not be read, so nothing was added. '
        'It has not been changed or deleted.',
      ),
      findsOneWidget,
    );
    expect(await _stored(), '{not json');
  });
}
