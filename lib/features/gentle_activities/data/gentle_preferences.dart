import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Comfort choices for the matching activity (GM-003).
///
/// Only concrete, adjustable preferences live here: how many tiles, whether
/// pictures stay visible, contrast, the bedside theme and tap vibration.
/// Nothing is derived from success, speed or mistakes, and resetting never
/// touches family photos or packs.
@immutable
class GentlePreferences {
  const new({
    this.pairs = defaultPairs,
    this.keepVisible = true,
    this.highContrast = false,
    this.bedside = false,
    this.haptics = false,
  });

  /// Reads each field on its own so one invalid value never discards the rest.
  /// Unknown newer versions and malformed data fall back to defaults.
  factory fromJson(Object? json) {
    if (json is! Map) return const GentlePreferences();
    final version = json['v'];
    if (version is! int || version < 1 || version > schemaVersion) {
      return const GentlePreferences();
    }
    final pairs = json['pairs'];
    final keepVisible = json['keepVisible'];
    // Older saved choices have no contrast field: they load with it off.
    final highContrast = json['highContrast'];
    // Saved choices from before the bedside theme or vibration existed have
    // neither field; both load off, the same as a fresh install.
    final bedside = json['bedside'];
    final haptics = json['haptics'];
    return GentlePreferences(
      pairs: pairs is int && pairChoices.contains(pairs) ? pairs : defaultPairs,
      keepVisible: keepVisible is! bool || keepVisible,
      highContrast: highContrast is bool && highContrast,
      bedside: bedside is bool && bedside,
      haptics: haptics is bool && haptics,
    );
  }

  static const int schemaVersion = 1;
  static const String storageKey = 'gm.gentle.preferences';
  static const int defaultPairs = 2;
  static const List<int> pairChoices = [2, 3, 4, 6];

  /// Number of picture pairs; the board has twice as many tiles.
  final int pairs;
  final bool keepVisible;

  /// Stronger contrast for older eyes (see gmBuildTheme). Off by default.
  final bool highContrast;

  /// Low-light bedside theme and no tap click sound (APP-022). Off by default.
  final bool bedside;

  /// A short vibration on each tile tap (APP-023). Off by default; nothing
  /// depends on it, since the picture always changes on screen.
  final bool haptics;

  GentlePreferences copyWith({
    int? pairs,
    bool? keepVisible,
    bool? highContrast,
    bool? bedside,
    bool? haptics,
  }) => GentlePreferences(
    pairs: pairs ?? this.pairs,
    keepVisible: keepVisible ?? this.keepVisible,
    highContrast: highContrast ?? this.highContrast,
    bedside: bedside ?? this.bedside,
    haptics: haptics ?? this.haptics,
  );

  Map<String, Object> toJson() => {
    'v': schemaVersion,
    'pairs': pairs,
    'keepVisible': keepVisible,
    'highContrast': highContrast,
    'bedside': bedside,
    'haptics': haptics,
  };

  @override
  bool operator ==(Object other) =>
      other is GentlePreferences &&
      other.pairs == pairs &&
      other.keepVisible == keepVisible &&
      other.highContrast == highContrast &&
      other.bedside == bedside &&
      other.haptics == haptics;

  @override
  int get hashCode =>
      Object.hash(pairs, keepVisible, highContrast, bedside, haptics);
}

/// Local-only persistence for [GentlePreferences]. Failures fall back to the
/// defaults so the activity always starts.
class GentlePreferencesStore {
  const new();

  Future<GentlePreferences> load() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(GentlePreferences.storageKey);
      if (raw == null) return const GentlePreferences();
      return GentlePreferences.fromJson(jsonDecode(raw));
    } on Object {
      return const GentlePreferences();
    }
  }

  /// Returns false when the choice could not be saved; it still applies to
  /// the current session.
  Future<bool> save(GentlePreferences value) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return await prefs.setString(
        GentlePreferences.storageKey,
        jsonEncode(value.toJson()),
      );
    } on Object {
      return false;
    }
  }

  /// Removes comfort choices only. Photos, packs and share state are separate.
  Future<bool> reset() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return await prefs.remove(GentlePreferences.storageKey);
    } on Object {
      return false;
    }
  }
}
