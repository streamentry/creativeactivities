import 'dart:convert';

import 'package:creative_activities/design_system.dart';
import 'package:creative_activities/features/gentle_activities/data/gentle_preferences.dart';
import 'package:creative_activities/features/gentle_activities/models/activity_picture.dart';
import 'package:creative_activities/features/gentle_activities/presentation/gentle_game_page.dart';
import 'package:creative_activities/l10n/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _vibrate = 'HapticFeedback.vibrate';

void main() {
  late List<MethodCall> platformCalls;

  setUp(() {
    platformCalls = [];
    SharedPreferences.setMockInitialValues({});
  });

  /// Records vibration requests; [refuse] makes the device refuse them.
  void mockPlatform({bool refuse = false}) {
    TestWidgetsFlutterBinding.ensureInitialized().defaultBinaryMessenger
        .setMockMethodCallHandler(SystemChannels.platform, (call) async {
          platformCalls.add(call);
          if (refuse && call.method == _vibrate) {
            throw PlatformException(code: 'unavailable');
          }
          return null;
        });
  }

  Future<void> pumpGame(WidgetTester tester, {required bool haptics}) async {
    await tester.binding.setSurfaceSize(const Size(800, 1000));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    SharedPreferences.setMockInitialValues({
      GentlePreferences.storageKey: jsonEncode(
        GentlePreferences(haptics: haptics).toJson(),
      ),
    });
    await tester.pumpWidget(
      MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        theme: gmBuildTheme(),
        home: const GentleGamePage(pictures: ActivityPicture.samples),
      ),
    );
    await tester.pumpAndSettle();
  }

  Finder tiles() => find.bySemanticsLabel(RegExp(r', tile \d+$'));

  /// Whether a tile reports it is selected (its semantic value is set).
  bool isSelected(WidgetTester tester, Finder tile) =>
      tester.getSemantics(tile).value.isNotEmpty;

  List<MethodCall> vibrations() =>
      platformCalls.where((c) => c.method == _vibrate).toList();

  testWidgets('vibration is off by default: a tap makes no vibration call', (
    tester,
  ) async {
    mockPlatform();
    await pumpGame(tester, haptics: false);
    await tester.tap(tiles().first);
    await tester.pumpAndSettle();
    expect(vibrations(), isEmpty);
  });

  testWidgets(
    'with vibration on, each tap asks for one short selection click',
    (tester) async {
      mockPlatform();
      await pumpGame(tester, haptics: true);
      await tester.tap(tiles().first);
      await tester.pumpAndSettle();
      expect(vibrations(), hasLength(1));
      expect(
        vibrations().single.arguments,
        'HapticFeedbackType.selectionClick',
      );
    },
  );

  testWidgets(
    'no action depends on vibration: a refused buzz still selects the tile',
    (tester) async {
      mockPlatform(refuse: true);
      await pumpGame(tester, haptics: true);
      final first = tiles().first;
      expect(isSelected(tester, first), isFalse);
      await tester.tap(first);
      await tester.pumpAndSettle();
      // The vibration was refused, yet the tap still did its work on screen.
      expect(vibrations(), hasLength(1));
      expect(isSelected(tester, tiles().first), isTrue);
    },
  );

  testWidgets('the picture changes on screen with vibration off too', (
    tester,
  ) async {
    mockPlatform();
    await pumpGame(tester, haptics: false);
    await tester.tap(tiles().first);
    await tester.pumpAndSettle();
    expect(isSelected(tester, tiles().first), isTrue);
  });
}
