import 'dart:convert';

import 'package:creative_activities/features/plan/data/personal_plan.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _key = 'personal_plan.v1';

void main() {
  group('PersonalPlan rules', () {
    test('holds at most five activities and never repeats one', () {
      var plan = const PersonalPlan(title: 'Sunday with Dad');
      for (final id in ['a', 'b', 'c', 'd', 'e']) {
        plan = plan.withActivity(id)!;
      }
      expect(plan.isFull, isTrue);
      expect(plan.withActivity('f'), isNull);
      expect(plan.activityIds, ['a', 'b', 'c', 'd', 'e']);

      final fewer = plan.withoutActivity('a');
      expect(fewer.activityIds, ['b', 'c', 'd', 'e']);
      expect(fewer.withActivity('b'), isNull, reason: 'already listed');
      expect(fewer.withActivity('a')!.activityIds.last, 'a');
    });

    test('removing an id that is not listed changes nothing', () {
      const plan = PersonalPlan(title: 'x', activityIds: ['a']);
      expect(plan.withoutActivity('zz'), plan);
    });
  });

  group('PersonalPlanStore', () {
    setUp(() => SharedPreferences.setMockInitialValues({}));

    test('nothing saved reads as no plan and readable', () async {
      final read = await const PersonalPlanStore().load();
      expect(read.plan, isNull);
      expect(read.readable, isTrue);
    });

    test(
      'a saved plan survives a restart (a new store and prefs read)',
      () async {
        const plan = PersonalPlan(
          title: 'Sunday with Dad',
          note: 'Bring the blue cups',
          activityIds: ['animals_farm', 'nature_mountains'],
        );
        expect(await const PersonalPlanStore().save(plan), isTrue);

        final again = await const PersonalPlanStore().load();
        expect(again.plan, plan);
        expect(again.readable, isTrue);
      },
    );

    test('the record is versioned and holds only the plan fields', () async {
      await const PersonalPlanStore().save(
        const PersonalPlan(title: 'Tea', activityIds: ['animals_farm']),
      );
      final raw = (await SharedPreferences.getInstance()).getString(_key)!;
      expect(jsonDecode(raw), {
        'v': 1,
        'title': 'Tea',
        'note': '',
        'activities': ['animals_farm'],
      });
    });

    test('clear removes the plan', () async {
      const store = PersonalPlanStore();
      await store.save(const PersonalPlan(title: 'Tea'));
      await store.clear();
      final read = await store.load();
      expect(read.plan, isNull);
      expect(read.readable, isTrue);
    });

    for (final (label, raw) in [
      ('not JSON', '{not json'),
      ('a list instead of a record', '[]'),
      ('an unknown version', '{"v":2,"title":"x","note":"","activities":[]}'),
      ('an empty title', '{"v":1,"title":"  ","note":"","activities":[]}'),
      (
        'a title that is too long',
        '{"v":1,"title":"${'x' * 61}","note":"","activities":[]}',
      ),
      (
        'six activities',
        '{"v":1,"title":"x","note":"","activities":["a","b","c","d","e","f"]}',
      ),
      (
        'a repeated activity',
        '{"v":1,"title":"x","note":"","activities":["a","a"]}',
      ),
      (
        'an activity id with spaces',
        '{"v":1,"title":"x","note":"","activities":["a b"]}',
      ),
      (
        'a number as an activity',
        '{"v":1,"title":"x","note":"","activities":[3]}',
      ),
    ]) {
      test('a record with $label is unreadable, not empty', () async {
        SharedPreferences.setMockInitialValues({_key: raw});
        final read = await const PersonalPlanStore().load();
        expect(read.plan, isNull);
        expect(read.readable, isFalse);
      });
    }
  });
}
