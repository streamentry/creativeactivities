import 'dart:convert';
import 'dart:io';

import 'package:creative_activities/features/activity_cards/data/activity_catalog.dart';
import 'package:flutter_test/flutter_test.dart';

Map<String, Object?> _card({
  String id = 'ca-0001',
  String slug = 'make-a-test-card',
}) => {
  'id': id,
  'slug': slug,
  'name': 'Make a test card',
  'summary': 'Fold one sheet of paper together with a helper.',
  'type': 'craft',
  'prepMinutes': 0,
  'activityMinutes': [10, 20],
  'cost': 'free',
  'mess': 'none',
  'energy': 'low',
  'supervision': 'nearby',
  'settings': ['seated', 'tabletop'],
  'groups': ['one-to-one'],
  'senses': ['touch'],
  'variationKinds': ['less-sensory'],
  'safetyFlags': ['none'],
  'materials': ['One sheet of paper'],
  'steps': ['Fold the sheet in half.', 'Crease the fold.', 'Open it up.'],
  'safety': ['Use paper only; no tools are needed.'],
  'stopNote': 'Stop at any point and put the paper down.',
  'crisisRoute': false,
  'version': 1,
  'reviewStatus': 'not-reviewed',
};

String _file({
  List<Map<String, Object?>>? cards,
  int version = 1,
  String generatedFrom = '0123456789ab',
}) => jsonEncode({
  'version': version,
  'generatedFrom': generatedFrom,
  'cards': cards ?? [_card()],
});

ActivityCatalog _loaded(String source) {
  final result = parseActivityCatalog(source);
  expect(result, isA<CatalogLoaded>());
  return (result as CatalogLoaded).catalog;
}

void _expectUnavailable(String source) {
  expect(parseActivityCatalog(source), isA<CatalogUnavailable>());
}

void main() {
  test('a well-formed file gives every card with its finder facts', () {
    final catalog = _loaded(_file());
    final card = catalog.byId('ca-0001');

    expect(catalog.generatedFrom, '0123456789ab');
    expect(card, isNotNull);
    expect(card!.slug, 'make-a-test-card');
    expect(card.facts.maxMinutes, 20);
    expect(card.facts.minMinutes, 10);
    expect(card.facts.variationKinds, {'less-sensory'});
    expect(card.reviewed, isFalse);
    expect(catalog.finderCards.single.id, 'ca-0001');
  });

  test('the committed assets/cards/cards.v1.json parses in full', () {
    final text = File('assets/cards/cards.v1.json').readAsStringSync();
    final catalog = _loaded(text);

    expect(catalog.cards.length, greaterThanOrEqualTo(50));
    for (final card in catalog.cards) {
      expect(card.materials, isNotEmpty, reason: card.slug);
      expect(card.steps.length, greaterThanOrEqualTo(3), reason: card.slug);
      expect(card.safety, isNotEmpty, reason: card.slug);
      expect(card.stopNote, isNotEmpty, reason: card.slug);
    }
  });

  test('an unknown file version makes the cards unavailable', () {
    _expectUnavailable(_file(version: 2));
  });

  test('a file that is not JSON makes the cards unavailable', () {
    _expectUnavailable('{not json');
  });

  test('a file with no cards makes the cards unavailable', () {
    _expectUnavailable(_file(cards: []));
  });

  test('a card missing a required field makes the file unavailable', () {
    final card = _card()..remove('stopNote');
    _expectUnavailable(_file(cards: [card]));
  });

  test('an unknown finder value makes the file unavailable', () {
    final card = _card()..['cost'] = 'pricey';
    _expectUnavailable(_file(cards: [card]));
  });

  test('a card with too few steps makes the file unavailable', () {
    final card = _card()..['steps'] = ['Only one step.'];
    _expectUnavailable(_file(cards: [card]));
  });

  test('a card id in the wrong form makes the file unavailable', () {
    _expectUnavailable(_file(cards: [_card(id: 'card-1')]));
  });

  test('two cards with the same id make the file unavailable', () {
    _expectUnavailable(
      _file(
        cards: [
          _card(),
          _card(slug: 'another-card'),
        ],
      ),
    );
  });

  test('a bad content hash makes the file unavailable', () {
    _expectUnavailable(_file(generatedFrom: 'not-a-hash'));
  });

  test('a review status the app does not know makes the file unavailable', () {
    final card = _card()..['reviewStatus'] = 'signed-off';
    _expectUnavailable(_file(cards: [card]));
  });

  test(
    'a store whose read fails reports unavailable and does not throw',
    () async {
      const store = ActivityCatalogStore(read: _unreadable);
      final result = await store.load();

      expect(result, isA<CatalogUnavailable>());
    },
  );

  test('a store reads the text it is given', () async {
    final store = ActivityCatalogStore(read: () async => _file());
    final result = await store.load();

    expect(result, isA<CatalogLoaded>());
  });
}

Future<String> _unreadable() =>
    Future<String>.error(const FileSystemException('asset missing'));
