import 'dart:convert';

import 'package:equatable/equatable.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Which materials the person already has, per activity, kept on this device.
///
/// A material is identified by its text, so a tick belongs to the material it
/// was made for. A saved record that cannot be read is reported as unreadable
/// and is never overwritten by a tick.
class MaterialTicks extends Equatable {
  const new({required this.byActivity, this.readable = true});

  const new empty() : byActivity = const {}, readable = true;

  static const maxActivities = 200;
  static const maxMaterialsPerActivity = 10;
  static const maxMaterialText = 200;

  /// Activity id to the material texts ticked "I have this".
  final Map<String, Set<String>> byActivity;

  /// False when a saved record exists but cannot be read.
  final bool readable;

  Set<String> ticksFor(String activityId) => byActivity[activityId] ?? const {};

  @override
  List<Object?> get props => [byActivity, readable];
}

/// Saves ticks under a versioned key. Clearing removes every tick.
class MaterialTicksStore {
  const new({this.key = _defaultKey});

  static const _defaultKey = 'material_ticks.v1';
  static const _schemaVersion = 1;
  static final _idPattern = RegExp(r'^[A-Za-z0-9_-]{1,80}$');

  final String key;

  Future<MaterialTicks> load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(key);
    if (raw == null) return const MaterialTicks.empty();
    return _parse(raw) ?? const MaterialTicks(byActivity: {}, readable: false);
  }

  /// Sets or clears one tick. Returns false, and changes nothing, when the
  /// saved record cannot be read or the bounds would be exceeded.
  Future<bool> setTicked({
    required String activityId,
    required String material,
    required bool ticked,
  }) async {
    if (!_idPattern.hasMatch(activityId)) return false;
    if (material.isEmpty || material.length > MaterialTicks.maxMaterialText) {
      return false;
    }
    final current = await load();
    if (!current.readable) return false;
    final map = {
      for (final e in current.byActivity.entries) e.key: {...e.value},
    };
    final set = map[activityId] ?? <String>{};
    if (ticked) {
      if (set.length >= MaterialTicks.maxMaterialsPerActivity &&
          !set.contains(material)) {
        return false;
      }
      if (map.length >= MaterialTicks.maxActivities &&
          !map.containsKey(activityId)) {
        return false;
      }
      set.add(material);
    } else {
      set.remove(material);
    }
    if (set.isEmpty) {
      map.remove(activityId);
    } else {
      map[activityId] = set;
    }
    final prefs = await SharedPreferences.getInstance();
    return await prefs.setString(key, _encode(map));
  }

  /// Removes every tick, including an unreadable record.
  Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(key);
  }

  static String _encode(Map<String, Set<String>> map) => jsonEncode({
    'v': _schemaVersion,
    'activities': {
      for (final e in map.entries) e.key: (e.value.toList()..sort()),
    },
  });

  /// Null for anything that is not a well-formed current-version record.
  static MaterialTicks? _parse(String raw) {
    final Object? json;
    try {
      json = jsonDecode(raw);
    } on FormatException {
      return null;
    }
    if (json is! Map || json['v'] != _schemaVersion) return null;
    final activities = json['activities'];
    if (activities is! Map || activities.length > MaterialTicks.maxActivities) {
      return null;
    }
    final result = <String, Set<String>>{};
    for (final entry in activities.entries) {
      final id = entry.key;
      final materials = entry.value;
      if (id is! String || !_idPattern.hasMatch(id)) return null;
      if (materials is! List ||
          materials.length > MaterialTicks.maxMaterialsPerActivity) {
        return null;
      }
      final set = <String>{};
      for (final m in materials) {
        if (m is! String ||
            m.isEmpty ||
            m.length > MaterialTicks.maxMaterialText) {
          return null;
        }
        set.add(m);
      }
      if (set.isNotEmpty) result[id] = set;
    }
    return MaterialTicks(byActivity: result);
  }
}
