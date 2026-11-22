import 'dart:convert';

import 'package:creative_activities/features/materials/data/material_ticks.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _key = 'material_ticks.v1';

void main() {
  group('MaterialTicksStore', () {
    const store = MaterialTicksStore();

    setUp(() => SharedPreferences.setMockInitialValues({}));

    Future<bool> tick(String activity, String material, {bool on = true}) =>
        store.setTicked(activityId: activity, material: material, ticked: on);

    test('nothing saved reads as no ticks and readable', () async {
      final ticks = await store.load();
      expect(ticks.readable, isTrue);
      expect(ticks.ticksFor('animals_farm'), isEmpty);
    });

    test('ticks are per activity and survive a restart', () async {
      expect(await tick('animals_farm', 'A jar'), isTrue);
      expect(await tick('animals_farm', 'Water'), isTrue);
      expect(await tick('nature_mountains', 'A jar'), isTrue);

      final again = await const MaterialTicksStore().load();
      expect(again.ticksFor('animals_farm'), {'A jar', 'Water'});
      expect(again.ticksFor('nature_mountains'), {'A jar'});
    });

    test(
      'unticking removes the tick, and an empty activity is dropped',
      () async {
        await tick('animals_farm', 'A jar');
        expect(await tick('animals_farm', 'A jar', on: false), isTrue);

        final raw = (await SharedPreferences.getInstance()).getString(_key)!;
        expect(jsonDecode(raw), {'v': 1, 'activities': <String, dynamic>{}});
      },
    );

    test('the record is versioned and lists sorted material texts', () async {
      await tick('animals_farm', 'Water');
      await tick('animals_farm', 'A jar');
      final raw = (await SharedPreferences.getInstance()).getString(_key)!;
      expect(jsonDecode(raw), {
        'v': 1,
        'activities': {
          'animals_farm': ['A jar', 'Water'],
        },
      });
    });

    test('no more than ten materials per activity', () async {
      for (var i = 0; i < 10; i++) {
        expect(await tick('a', 'item $i'), isTrue);
      }
      expect(await tick('a', 'item 10'), isFalse);
      expect((await store.load()).ticksFor('a'), hasLength(10));
    });

    test('no more than 200 activities', () async {
      final many = {
        for (var i = 0; i < 200; i++) 'act_$i': ['m'],
      };
      SharedPreferences.setMockInitialValues({
        _key: jsonEncode({'v': 1, 'activities': many}),
      });
      expect(await tick('one_more', 'm'), isFalse);
      expect(
        await tick('act_0', 'another'),
        isTrue,
        reason: 'existing is fine',
      );
    });

    test('an empty or over-long material text is refused', () async {
      expect(await tick('a', ''), isFalse);
      expect(await tick('a', 'x' * 201), isFalse);
    });

    test('an activity id outside the safe pattern is refused', () async {
      expect(await tick('bad id', 'x'), isFalse);
    });

    test('clear removes every tick', () async {
      await tick('animals_farm', 'A jar');
      await store.clear();
      expect((await store.load()).ticksFor('animals_farm'), isEmpty);
      expect((await store.load()).readable, isTrue);
    });

    for (final (label, raw) in [
      ('not JSON', '{nope'),
      ('an unknown version', '{"v":9,"activities":{}}'),
      ('a list of activities', '{"v":1,"activities":[]}'),
      ('a material that is a number', '{"v":1,"activities":{"a":[3]}}'),
      ('an empty material text', '{"v":1,"activities":{"a":[""]}}'),
    ]) {
      test(
        'a record with $label is unreadable and is not overwritten',
        () async {
          SharedPreferences.setMockInitialValues({_key: raw});
          final ticks = await store.load();
          expect(ticks.readable, isFalse);
          expect(ticks.byActivity, isEmpty);

          expect(await tick('animals_farm', 'A jar'), isFalse);
          expect((await SharedPreferences.getInstance()).getString(_key), raw);
        },
      );
    }
  });
}
