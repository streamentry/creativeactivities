import 'dart:convert';

import 'package:equatable/equatable.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// A short plan of activities for one visit, kept on this device only.
///
/// It has a title, an optional note and up to [PersonalPlan.maxActivities]
/// activity ids. It holds no dates, reminders, counts or history. A saved
/// record that cannot be read is reported as unreadable and is never
/// overwritten by an edit; only the person can start a new plan.
class PersonalPlan extends Equatable {
  const new({required this.title, this.note = '', this.activityIds = const []});

  static const maxActivities = 5;
  static const maxTitle = 60;
  static const maxNote = 200;

  /// Marks an entry that names a bundled activity card (APP-001). Picture
  /// pack ids never contain a colon, so `card:` entries cannot collide with
  /// the entries that older saved plans hold.
  static const cardEntryMark = 'card:';
  static final _cardEntryPattern = RegExp(r'^card:ca-\d{4}$');

  /// The plan entry for the bundled card [cardId], for example `ca-0022`.
  static String cardEntry(String cardId) => '$cardEntryMark$cardId';

  /// The card id held by a `card:` entry, or null for a picture pack id.
  static String? cardIdOf(String entry) => entry.startsWith(cardEntryMark)
      ? entry.substring(cardEntryMark.length)
      : null;

  final String title;
  final String note;

  /// Entries in the order the person added them; each at most once. An entry
  /// is a picture pack id, or a [cardEntry]. Packs and cards share the cap.
  final List<String> activityIds;

  bool get isFull => activityIds.length >= maxActivities;

  PersonalPlan copyWith({String? title, String? note}) => PersonalPlan(
    title: title ?? this.title,
    note: note ?? this.note,
    activityIds: activityIds,
  );

  /// The plan with [id] appended, or null when it is full or already listed.
  PersonalPlan? withActivity(String id) {
    if (isFull || activityIds.contains(id)) return null;
    return PersonalPlan(
      title: title,
      note: note,
      activityIds: [...activityIds, id],
    );
  }

  /// The plan without [id].
  PersonalPlan withoutActivity(String id) => PersonalPlan(
    title: title,
    note: note,
    activityIds: [
      for (final a in activityIds)
        if (a != id) a,
    ],
  );

  @override
  List<Object?> get props => [title, note, activityIds];
}

/// Result of reading the saved plan. [plan] is null when there is none, or
/// when a saved record exists but cannot be read ([readable] is then false).
class PersonalPlanRead extends Equatable {
  const new({this.plan, this.readable = true});

  final PersonalPlan? plan;
  final bool readable;

  @override
  List<Object?> get props => [plan, readable];
}

/// Saves and reads the one personal plan under a versioned key.
class PersonalPlanStore {
  const new({this.key = _defaultKey});

  static const _defaultKey = 'personal_plan.v1';
  static const _schemaVersion = 1;
  static final _idPattern = RegExp(r'^[A-Za-z0-9_-]{1,80}$');

  final String key;

  Future<PersonalPlanRead> load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(key);
    if (raw == null) return const PersonalPlanRead();
    final plan = _parse(raw);
    if (plan == null) return const PersonalPlanRead(readable: false);
    return PersonalPlanRead(plan: plan);
  }

  /// Writes [plan]. Returns whether the device accepted the write.
  Future<bool> save(PersonalPlan plan) async {
    final prefs = await SharedPreferences.getInstance();
    return await prefs.setString(key, _encode(plan));
  }

  /// Removes the plan, including an unreadable record.
  Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(key);
  }

  static String _encode(PersonalPlan plan) => jsonEncode({
    'v': _schemaVersion,
    'title': plan.title,
    'note': plan.note,
    'activities': plan.activityIds,
  });

  /// A picture pack id as older builds stored it, or a well-formed card entry.
  static bool _validEntry(String id) =>
      _idPattern.hasMatch(id) || PersonalPlan._cardEntryPattern.hasMatch(id);

  /// Null for anything that is not a well-formed current-version record.
  static PersonalPlan? _parse(String raw) {
    final Object? json;
    try {
      json = jsonDecode(raw);
    } on FormatException {
      return null;
    }
    if (json is! Map || json['v'] != _schemaVersion) return null;
    final title = json['title'];
    final note = json['note'];
    final activities = json['activities'];
    if (title is! String ||
        title.trim().isEmpty ||
        title.length > PersonalPlan.maxTitle ||
        note is! String ||
        note.length > PersonalPlan.maxNote ||
        activities is! List ||
        activities.length > PersonalPlan.maxActivities) {
      return null;
    }
    final ids = <String>[];
    for (final id in activities) {
      if (id is! String || !_validEntry(id) || ids.contains(id)) {
        return null;
      }
      ids.add(id);
    }
    return PersonalPlan(title: title, note: note, activityIds: ids);
  }
}
