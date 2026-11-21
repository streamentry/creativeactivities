import 'dart:io';

import 'package:creative_activities/features/finder/data/finder_card.dart';
import 'package:creative_activities/features/finder/data/finder_filters.dart';
import 'package:flutter_test/flutter_test.dart';

FinderFacts _facts({
  FinderType type = FinderType.craft,
  int minMinutes = 10,
  int maxMinutes = 30,
  FinderCost cost = FinderCost.free,
  FinderMess mess = FinderMess.none,
  FinderEnergy energy = FinderEnergy.low,
  FinderSupervision supervision = FinderSupervision.nearby,
  Set<FinderSetting> settings = const {FinderSetting.seated},
  Set<FinderGroup> groups = const {FinderGroup.oneToOne},
  Set<FinderSense> senses = const {},
  Set<String> variationKinds = const {},
  Set<FinderSafetyFlag> safetyFlags = const {},
}) => FinderFacts(
  type: type,
  prepMinutes: 5,
  minMinutes: minMinutes,
  maxMinutes: maxMinutes,
  cost: cost,
  mess: mess,
  energy: energy,
  supervision: supervision,
  settings: settings,
  groups: groups,
  senses: senses,
  variationKinds: variationKinds,
  safetyFlags: safetyFlags,
);

void main() {
  group('FinderChoice.fromQuery', () {
    test('an empty query chooses nothing, so every card fits', () {
      final choice = FinderChoice.fromQuery('');
      expect(choice.maxStartMinutes, isNull);
      expect(choice.matches(_facts()), isTrue);
      expect(choice.reasonsFor(_facts()), isEmpty);
    });

    test('"any" and unknown values are dropped, as on the website', () {
      final choice = FinderChoice.fromQuery(
        'time=any&materials=any&setting=standing&time=99'
        '&sense=taste&type=ballet',
      );
      expect(choice.maxStartMinutes, isNull);
      expect(choice.costs, isNull);
      expect(choice.setting, isNull);
      expect(choice.sense, isNull);
      expect(choice.type, isNull);
    });

    test('a repeated scalar key keeps its first value', () {
      expect(FinderChoice.fromQuery('time=15&time=30').maxStartMinutes, 15);
    });

    test('avoid keeps only the filterable safety flags, once each', () {
      final choice = FinderChoice.fromQuery(
        'avoid=heat&avoid=heat&avoid=allergen&avoid=none&avoid=sharp-tool',
      );
      expect(choice.avoid, {FinderSafetyFlag.heat, FinderSafetyFlag.sharpTool});
    });

    test('a leading question mark and encoded values are read', () {
      expect(FinderChoice.fromQuery('?time=15').maxStartMinutes, 15);
      expect(FinderChoice.fromQuery('type=art%20').type, isNull);
    });
  });

  group('matches', () {
    test('time keeps cards whose shortest run fits, at the boundary', () {
      final fifteen = FinderChoice.fromQuery('time=15');
      expect(fifteen.matches(_facts(minMinutes: 15)), isTrue);
      expect(fifteen.matches(_facts(minMinutes: 16)), isFalse);
    });

    test('materials "none" excludes low-cost cards', () {
      final nothing = FinderChoice.fromQuery('materials=none');
      expect(nothing.matches(_facts()), isTrue);
      expect(nothing.matches(_facts(cost: FinderCost.low)), isFalse);
    });

    test('a calmer choice needs a less-sensory variation', () {
      final calm = FinderChoice.fromQuery('sense=calm');
      expect(calm.matches(_facts(variationKinds: {'less-sensory'})), isTrue);
      expect(calm.matches(_facts()), isFalse);
    });

    test('a sense choice needs that sense on the card', () {
      final touch = FinderChoice.fromQuery('sense=touch');
      expect(touch.matches(_facts(senses: {FinderSense.touch})), isTrue);
      expect(touch.matches(_facts(senses: {FinderSense.sight})), isFalse);
    });

    test('without words needs a nonverbal variation', () {
      final wordless = FinderChoice.fromQuery('talking=none');
      expect(wordless.matches(_facts(variationKinds: {'nonverbal'})), isTrue);
      expect(wordless.matches(_facts()), isFalse);
    });

    test('nearby supervision excludes hands-on cards', () {
      final nearby = FinderChoice.fromQuery('supervision=nearby');
      expect(nearby.matches(_facts()), isTrue);
      expect(
        nearby.matches(_facts(supervision: FinderSupervision.handsOn)),
        isFalse,
      );
    });

    test('avoiding a flag excludes cards that list it', () {
      final noHeat = FinderChoice.fromQuery('avoid=heat');
      expect(
        noHeat.matches(_facts(safetyFlags: {FinderSafetyFlag.heat})),
        isFalse,
      );
      expect(
        noHeat.matches(_facts(safetyFlags: {FinderSafetyFlag.water})),
        isTrue,
      );
    });

    test('filter keeps the order it was given', () {
      final choice = FinderChoice.fromQuery('mess=none');
      final cards = [
        FinderCard(id: 'b', name: 'B', facts: _facts()),
        FinderCard(
          id: 'a',
          name: 'A',
          facts: _facts(mess: FinderMess.medium),
        ),
        FinderCard(id: 'c', name: 'C', facts: _facts()),
      ];
      expect(choice.filter(cards).map((c) => c.id), ['b', 'c']);
    });
  });

  group('reasonsFor', () {
    test('lists only the choices made, in the website order', () {
      final choice = FinderChoice.fromQuery(
        'time=30&materials=low&setting=bedside&mess=low&energy=low'
        '&sense=hearing&talking=none&supervision=nearby',
      );
      final card = _facts(
        cost: FinderCost.low,
        mess: FinderMess.low,
        settings: {FinderSetting.bedside},
      );
      expect(choice.reasonsFor(card).map((r) => r.english), [
        'can start in under 30 minutes',
        'needs only low-cost things',
        'works bedside',
        'little or no mess',
        'mostly sitting still',
        'uses sounds or music',
        'works without words',
        'works with you nearby',
      ]);
    });

    test('a calmer choice gives its reason whenever it is chosen', () {
      final calm = FinderChoice.fromQuery('sense=calm');
      expect(
        calm
            .reasonsFor(_facts(variationKinds: {'less-sensory'}))
            .map((r) => r.english),
        ['has a calmer version'],
      );
    });
  });

  group('no network', () {
    test('the finder code imports no network or device-storage library', () {
      final files = Directory('lib/features/finder')
          .listSync(recursive: true)
          .whereType<File>()
          .where((file) => file.path.endsWith('.dart'));
      expect(files, isNotEmpty);
      const banned = [
        'dart:io',
        'dart:html',
        'package:http',
        'package:dio',
        'package:url_launcher',
        'package:firebase',
        'package:connectivity',
      ];
      for (final file in files) {
        final source = file.readAsStringSync();
        for (final name in banned) {
          expect(source, isNot(contains("import '$name")), reason: file.path);
        }
      }
    });
  });
}
