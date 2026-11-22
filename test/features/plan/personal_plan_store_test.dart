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

    test('pack and card entries count together toward the five cap', () {
      var plan = const PersonalPlan(
        title: 'Tea',
        activityIds: ['animals_farm'],
      );
      for (final id in ['ca-0001', 'ca-0002', 'ca-0003', 'ca-0004']) {
        plan = plan.withActivity(PersonalPlan.cardEntry(id))!;
      }
      expect(plan.isFull, isTrue);
      expect(plan.withActivity(PersonalPlan.cardEntry('ca-0005')), isNull);
      expect(plan.withActivity('nature_mountains'), isNull);
      expect(
        plan.withActivity(PersonalPlan.cardEntry('ca-0001')),
        isNull,
        reason: 'already listed',
      );
    });

    test('a card entry can be removed like a pack entry', () {
      const plan = PersonalPlan(
        title: 'Tea',
        activityIds: ['animals_farm', 'card:ca-0022'],
      );
      expect(
        plan.withoutActivity(PersonalPlan.cardEntry('ca-0022')).activityIds,
        ['animals_farm'],
      );
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

    test('an old record with pack ids only loads unchanged', () async {
      SharedPreferences.setMockInitialValues({
        _key:
            '{"v":1,"title":"Sunday with Dad","note":"Bring the blue cups", '
            '"activities":["animals_farm","nature_mountains"]}',
      });
      final read = await const PersonalPlanStore().load();
      expect(read.readable, isTrue);
      expect(
        read.plan,
        const PersonalPlan(
          title: 'Sunday with Dad',
          note: 'Bring the blue cups',
          activityIds: ['animals_farm', 'nature_mountains'],
        ),
      );
    });

    test('a card entry is saved as card: plus its card id', () async {
      const store = PersonalPlanStore();
      final plan = const PersonalPlan(
        title: 'Tea',
        activityIds: ['animals_farm'],
      ).withActivity(PersonalPlan.cardEntry('ca-0022'))!;
      expect(await store.save(plan), isTrue);

      final raw = (await SharedPreferences.getInstance()).getString(_key)!;
      expect(jsonDecode(raw), {
        'v': 1,
        'title': 'Tea',
        'note': '',
        'activities': ['animals_farm', 'card:ca-0022'],
      });
      expect((await store.load()).plan, plan);
      expect(PersonalPlan.cardIdOf('card:ca-0022'), 'ca-0022');
      expect(PersonalPlan.cardIdOf('animals_farm'), isNull);
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
      (
        'a card entry with a short card id',
        '{"v":1,"title":"x","note":"","activities":["card:ca-022"]}',
      ),
      (
        'a card entry with an upper case card id',
        '{"v":1,"title":"x","note":"","activities":["card:CA-0022"]}',
      ),
      (
        'a card entry with no card id',
        '{"v":1,"title":"x","note":"","activities":["card:"]}',
      ),
      (
        'a card entry with a slash after the id',
        '{"v":1,"title":"x","note":"","activities":["card:ca-0022/x"]}',
      ),
      (
        'a card repeated',
        '{"v":1,"title":"x","note":"", '
            '"activities":["card:ca-0022","card:ca-0022"]}',
      ),
      (
        'six mixed pack and card entries',
        '{"v":1,"title":"x","note":"","activities":["a","b","card:ca-0001",'
            '"card:ca-0002","card:ca-0003","card:ca-0004"]}',
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
