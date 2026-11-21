import 'dart:convert';

import 'package:creative_activities/data/models/sound_setting.dart';
import 'package:creative_activities/design_system.dart';
import 'package:creative_activities/features/gentle_activities/data/bedside_setting.dart';
import 'package:creative_activities/features/gentle_activities/data/gentle_preferences.dart';
import 'package:creative_activities/features/gentle_activities/models/activity_picture.dart';
import 'package:creative_activities/features/gentle_activities/presentation/gentle_game_page.dart';
import 'package:creative_activities/l10n/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  const store = GentlePreferencesStore();

  setUp(() => SharedPreferences.setMockInitialValues({}));

  group('defaults stay quiet and off (APP-022, APP-023)', () {
    test('bedside theme and vibration are off on a fresh install', () {
      const prefs = GentlePreferences();
      expect(prefs.bedside, isFalse);
      expect(prefs.haptics, isFalse);
    });

    test('sound is off by default, as the app has always shipped', () {
      expect(SoundSettings.quietByDefault, isFalse);
      final sound = SoundSettings();
      expect(sound.isSoundOn, isFalse);
      expect(sound.isMusicOn, isFalse);
    });

    test('a fresh save and load keeps both off', () async {
      final loaded = await store.load();
      expect(loaded.bedside, isFalse);
      expect(loaded.haptics, isFalse);
    });
  });

  test('both choices survive a save and reload as versioned fields', () async {
    const on = GentlePreferences(bedside: true, haptics: true, pairs: 3);
    expect(await store.save(on), isTrue);
    final raw = (await SharedPreferences.getInstance()).getString(
      GentlePreferences.storageKey,
    );
    expect(
      jsonDecode(raw!),
      containsPair('v', GentlePreferences.schemaVersion),
    );
    expect(await store.load(), on);
  });

  test('saved data from before these choices loads with both off', () {
    // An older record: only the fields that existed when it was written.
    final old = GentlePreferences.fromJson(const {
      'v': 1,
      'pairs': 4,
      'keepVisible': false,
      'highContrast': true,
    });
    expect(old.bedside, isFalse);
    expect(old.haptics, isFalse);
    expect(old.pairs, 4);
    expect(old.keepVisible, isFalse);
    expect(old.highContrast, isTrue);
  });

  test('damaged values for the new choices are treated as off', () {
    final bad = GentlePreferences.fromJson(const {
      'v': 1,
      'bedside': 'yes',
      'haptics': 1,
    });
    expect(bad.bedside, isFalse);
    expect(bad.haptics, isFalse);
  });

  test('a reset returns both to off without touching other choices', () {
    final on = const GentlePreferences(
      bedside: true,
      haptics: true,
      pairs: 6,
    ).copyWith(bedside: false, haptics: false);
    expect(on.bedside, isFalse);
    expect(on.haptics, isFalse);
    expect(on.pairs, 6);
  });

  test('the app-wide bedside setting notifies only on a real change', () {
    final setting = BedsideSetting();
    var calls = 0;
    setting
      ..addListener(() => calls++)
      ..set(enabled: true)
      ..set(enabled: true)
      ..set(enabled: false);
    expect(calls, 2);
    expect(setting.enabled, isFalse);
    expect(BedsideSetting(initial: true).enabled, isTrue);
  });

  group('tap sound in the game (APP-022)', () {
    Future<void> pumpGame(WidgetTester tester, {required bool bedside}) async {
      await tester.binding.setSurfaceSize(const Size(800, 1000));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      SharedPreferences.setMockInitialValues({
        GentlePreferences.storageKey: jsonEncode(
          GentlePreferences(bedside: bedside).toJson(),
        ),
      });
      await tester.pumpWidget(
        MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          theme: gmBuildTheme(bedside: bedside),
          home: const GentleGamePage(pictures: ActivityPicture.samples),
        ),
      );
      await tester.pumpAndSettle();
    }

    testWidgets('the default keeps the platform tap feedback', (tester) async {
      await pumpGame(tester, bedside: false);
      final tile = find.descendant(
        of: find.byType(GmFocusRing).first,
        matching: find.byType(InkWell),
      );
      expect(tester.widget<InkWell>(tile).enableFeedback, isTrue);
    });

    testWidgets('the bedside theme makes taps silent', (tester) async {
      await pumpGame(tester, bedside: true);
      final tile = find.descendant(
        of: find.byType(GmFocusRing).first,
        matching: find.byType(InkWell),
      );
      expect(tester.widget<InkWell>(tile).enableFeedback, isFalse);
    });
  });
}
