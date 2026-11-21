import 'dart:convert';
import 'dart:io';

import 'package:creative_activities/features/finder/data/finder_card.dart';
import 'package:creative_activities/features/finder/data/finder_filters.dart';
import 'package:flutter_test/flutter_test.dart';

/// The shared fixture is generated from the website's finder by
/// site/scripts/export-finder-fixture.ts. Every case here must give the same
/// cards, in the same order, with the same fit reasons, as the website.
final _fixture = jsonDecode(
  File('test/fixtures/finder/finder_fixture.json').readAsStringSync(),
) as Map<String, dynamic>;

T _enumOf<T extends FinderWire>(List<T> values, Object? wire) {
  for (final value in values) {
    if (value.wire == wire) return value;
  }
  throw FormatException('Unknown finder value: $wire');
}

Set<T> _enumsOf<T extends FinderWire>(List<T> values, Object? list) => {
  for (final item in (list! as List<dynamic>)) _enumOf(values, item),
};

FinderFacts _factsOf(Map<String, dynamic> json) {
  final minutes = json['activityMinutes'] as List<dynamic>;
  return FinderFacts(
    type: _enumOf(FinderType.values, json['type']),
    prepMinutes: json['prepMinutes'] as int,
    minMinutes: minutes[0] as int,
    maxMinutes: minutes[1] as int,
    cost: _enumOf(FinderCost.values, json['cost']),
    mess: _enumOf(FinderMess.values, json['mess']),
    energy: _enumOf(FinderEnergy.values, json['energy']),
    supervision: _enumOf(FinderSupervision.values, json['supervision']),
    settings: _enumsOf(FinderSetting.values, json['settings']),
    groups: _enumsOf(FinderGroup.values, json['groups']),
    senses: _enumsOf(FinderSense.values, json['senses'] ?? const <String>[]),
    variationKinds: {
      for (final kind
          in (json['variationKinds'] ?? const <String>[]) as List<dynamic>)
        kind as String,
    },
    safetyFlags: _enumsOf(
      FinderSafetyFlag.values,
      json['safetyFlags'] ?? const <String>[],
    ),
  );
}

final List<FinderCard> _cards = [
  for (final raw in _fixture['cards'] as List<dynamic>)
    FinderCard(
      id: (raw as Map<String, dynamic>)['id'] as String,
      name: raw['name'] as String,
      facts: _factsOf(raw['facts'] as Map<String, dynamic>),
    ),
];

void main() {
  test('the fixture holds the website cards and checks many queries', () {
    expect(_cards.length, greaterThanOrEqualTo(50));
    expect(
      (_fixture['cases'] as List<dynamic>).length,
      greaterThanOrEqualTo(30),
    );
  });

  final cases = _fixture['cases'] as List<dynamic>;
  for (final raw in cases) {
    final expectation = raw as Map<String, dynamic>;
    final query = expectation['query'] as String;

    test('query "$query" gives the website results and reasons', () {
      final choice = FinderChoice.fromQuery(query);
      final results = <String, List<String>>{
        for (final card in choice.filter(_cards))
          card.id: [
            for (final reason in choice.reasonsFor(card.facts)) reason.english,
          ],
      };
      final expected = expectation['results'] as List<dynamic>;

      expect(results.keys.toList(), [
        for (final row in expected) (row as Map<String, dynamic>)['id'],
      ], reason: 'cards and their order for "$query"');
      for (final row in expected) {
        final map = row as Map<String, dynamic>;
        expect(results[map['id']], [
          for (final reason in map['reasons'] as List<dynamic>)
            reason as String,
        ], reason: 'fit reasons for ${map['id']} with "$query"');
      }
    });
  }
}
