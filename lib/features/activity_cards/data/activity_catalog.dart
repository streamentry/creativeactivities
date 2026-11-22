import 'dart:convert';

import 'package:creative_activities/features/activity_cards/data/activity_card.dart';
import 'package:creative_activities/features/finder/data/finder_card.dart';
import 'package:flutter/services.dart';

/// The bundled card file, written by site/scripts/export-app-cards.ts.
const activityCardsAssetPath = 'assets/cards/cards.v1.json';

/// The only file version this build reads.
const activityCardsVersion = 1;

const _maxCards = 200;
final _idPattern = RegExp(r'^ca-\d{4}$');
final _slugPattern = RegExp(r'^[a-z0-9]+(?:-[a-z0-9]+)*$');
final _hashPattern = RegExp(r'^[0-9a-f]{12}$');

/// The cards loaded from the bundle. Immutable after parsing.
class ActivityCatalog {
  const new({required this.generatedFrom, required this.cards});

  final String generatedFrom;
  final List<ActivityCard> cards;

  List<FinderCard> get finderCards => [for (final c in cards) c.finderCard];

  ActivityCard? byId(String id) {
    for (final card in cards) {
      if (card.id == id) return card;
    }
    return null;
  }
}

/// Whether the cards could be read. An unreadable file hides the features
/// that need it; it never stops the rest of the app.
sealed class ActivityCatalogResult {
  const new();
}

final class CatalogLoaded extends ActivityCatalogResult {
  const new(this.catalog);

  final ActivityCatalog catalog;
}

final class CatalogUnavailable extends ActivityCatalogResult {
  const new(this.reason);

  /// For tests and diagnostics only; never shown to the person.
  final String reason;
}

Future<String> _readBundled() => rootBundle.loadString(activityCardsAssetPath);

/// Reads the bundled cards. [read] is replaceable in tests.
class ActivityCatalogStore {
  const new({this.read = _readBundled});

  final Future<String> Function() read;

  Future<ActivityCatalogResult> load() async {
    final String text;
    try {
      text = await read();
    } on Exception {
      return const CatalogUnavailable('the card file could not be read');
    }
    return parseActivityCatalog(text);
  }
}

/// Parses the card file strictly. Any unknown version, wrong shape, unknown
/// value or duplicate card makes the whole file unavailable.
ActivityCatalogResult parseActivityCatalog(String source) {
  try {
    final root = _asMap(jsonDecode(source), 'file');
    if (_int(root, 'version') != activityCardsVersion) {
      throw const _BadShape('unknown version');
    }
    final generatedFrom = _string(root, 'generatedFrom');
    if (!_hashPattern.hasMatch(generatedFrom)) {
      throw const _BadShape('bad generatedFrom');
    }
    final rawCards = _list(root, 'cards');
    if (rawCards.isEmpty || rawCards.length > _maxCards) {
      throw const _BadShape('card count out of range');
    }
    final cards = [for (final raw in rawCards) _card(_asMap(raw, 'card'))];
    final ids = {for (final c in cards) c.id};
    final slugs = {for (final c in cards) c.slug};
    if (ids.length != cards.length || slugs.length != cards.length) {
      throw const _BadShape('duplicate card');
    }
    return CatalogLoaded(
      ActivityCatalog(generatedFrom: generatedFrom, cards: cards),
    );
  } on FormatException catch (error) {
    return CatalogUnavailable(error.message);
  } on _BadShape catch (error) {
    return CatalogUnavailable(error.message);
  }
}

ActivityCard _card(Map<String, Object?> json) {
  final id = _string(json, 'id');
  if (!_idPattern.hasMatch(id)) throw const _BadShape('bad card id');
  final slug = _string(json, 'slug');
  if (!_slugPattern.hasMatch(slug)) throw const _BadShape('bad slug');
  final minutes = _list(json, 'activityMinutes');
  if (minutes.length != 2 || minutes[0] is! int || minutes[1] is! int) {
    throw const _BadShape('bad activityMinutes');
  }
  final low = minutes[0]! as int;
  final high = minutes[1]! as int;
  if (low < 0 || high < low) throw const _BadShape('bad activityMinutes');
  final reviewStatus = _string(json, 'reviewStatus');
  if (reviewStatus != 'reviewed' && reviewStatus != 'not-reviewed') {
    throw const _BadShape('bad reviewStatus');
  }
  final name = _string(json, 'name');
  final summary = _string(json, 'summary');
  if (name.length > 60 || summary.length > 200) {
    throw const _BadShape('text too long');
  }

  final facts = FinderFacts(
    type: _enum(FinderType.values, json['type']),
    prepMinutes: _int(json, 'prepMinutes'),
    minMinutes: low,
    maxMinutes: high,
    cost: _enum(FinderCost.values, json['cost']),
    mess: _enum(FinderMess.values, json['mess']),
    energy: _enum(FinderEnergy.values, json['energy']),
    supervision: _enum(FinderSupervision.values, json['supervision']),
    settings: _enums(FinderSetting.values, json, 'settings'),
    groups: _enums(FinderGroup.values, json, 'groups'),
    senses: _enums(FinderSense.values, json, 'senses'),
    variationKinds: _strings(json, 'variationKinds', min: 0, max: 20).toSet(),
    safetyFlags: _enums(FinderSafetyFlag.values, json, 'safetyFlags'),
  );
  return ActivityCard(
    id: id,
    slug: slug,
    name: name,
    summary: summary,
    facts: facts,
    materials: _strings(json, 'materials', min: 1, max: 10),
    steps: _strings(json, 'steps', min: 3, max: 9),
    safety: _strings(json, 'safety', min: 1, max: 6),
    stopNote: _string(json, 'stopNote'),
    crisisRoute: _bool(json, 'crisisRoute'),
    version: _int(json, 'version'),
    reviewed: reviewStatus == 'reviewed',
  );
}

/// A shape problem. Carries a short reason for diagnostics only.
class _BadShape implements Exception {
  const new(this.message);

  final String message;
}

Map<String, Object?> _asMap(Object? value, String what) {
  if (value is! Map) throw _BadShape('$what is not an object');
  return value.cast<String, Object?>();
}

List<Object?> _list(Map<String, Object?> json, String key) {
  final value = json[key];
  if (value is! List) throw _BadShape('$key is not a list');
  return value.cast<Object?>();
}

String _string(Map<String, Object?> json, String key) {
  final value = json[key];
  if (value is! String || value.isEmpty) throw _BadShape('$key is not text');
  return value;
}

int _int(Map<String, Object?> json, String key) {
  final value = json[key];
  if (value is! int) throw _BadShape('$key is not a whole number');
  return value;
}

bool _bool(Map<String, Object?> json, String key) {
  final value = json[key];
  if (value is! bool) throw _BadShape('$key is not true or false');
  return value;
}

List<String> _strings(
  Map<String, Object?> json,
  String key, {
  required int min,
  required int max,
}) {
  final list = _list(json, key);
  if (list.length < min || list.length > max) {
    throw _BadShape('$key has the wrong number of items');
  }
  return [
    for (final item in list)
      if (item is String && item.isNotEmpty)
        item
      else
        throw _BadShape('$key holds a non-text item'),
  ];
}

T _enum<T extends FinderWire>(List<T> values, Object? wire) {
  for (final value in values) {
    if (value.wire == wire) return value;
  }
  throw _BadShape('unknown value $wire');
}

Set<T> _enums<T extends FinderWire>(
  List<T> values,
  Map<String, Object?> json,
  String key,
) {
  final list = _list(json, key);
  if (list.isEmpty) throw _BadShape('$key is empty');
  return {for (final item in list) _enum(values, item)};
}
