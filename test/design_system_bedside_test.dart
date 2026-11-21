import 'dart:convert';
import 'dart:math' as math;

import 'package:creative_activities/design_system.dart';
import 'package:creative_activities/features/gentle_activities/data/gentle_preferences.dart';
import 'package:creative_activities/features/gentle_activities/models/activity_picture.dart';
import 'package:creative_activities/features/gentle_activities/presentation/gentle_game_page.dart';
import 'package:creative_activities/l10n/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

double _luminance(Color c) {
  double channel(double v) =>
      v <= 0.03928 ? v / 12.92 : math.pow((v + 0.055) / 1.055, 2.4).toDouble();
  return 0.2126 * channel(c.r) + 0.7152 * channel(c.g) + 0.0722 * channel(c.b);
}

double _contrast(Color a, Color b) {
  final la = _luminance(a);
  final lb = _luminance(b);
  return (math.max(la, lb) + 0.05) / (math.min(la, lb) + 0.05);
}

Widget _app(Widget home, {required bool bedside}) => MaterialApp(
  localizationsDelegates: AppLocalizations.localizationsDelegates,
  supportedLocales: AppLocalizations.supportedLocales,
  theme: gmBuildTheme(bedside: bedside),
  themeMode: ThemeMode.light,
  home: home,
);

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  group('bedside theme colors (APP-022)', () {
    final theme = gmBuildTheme(bedside: true);
    final scheme = theme.colorScheme;

    test('is a dark, low-light theme built from the bedside tokens', () {
      expect(theme.brightness, Brightness.dark);
      expect(theme.scaffoldBackgroundColor, gmBedsideCanvas);
      expect(scheme.surface, gmBedsidePaper);
      expect(scheme.onSurface, gmBedsideInk);
      expect(scheme.onSurfaceVariant, gmBedsideMuted);
      expect(scheme.outline, gmBedsideOutline);
    });

    test('text reaches 4.5:1 on every surface it is drawn on', () {
      final text = <String, (Color, Color)>{
        'ink on canvas': (scheme.onSurface, gmBedsideCanvas),
        'ink on paper': (scheme.onSurface, gmBedsidePaper),
        'ink on hidden tile': (scheme.onSurface, gmBedsideTile),
        'secondary on canvas': (scheme.onSurfaceVariant, gmBedsideCanvas),
        'secondary on paper': (scheme.onSurfaceVariant, gmBedsidePaper),
        'button label on sun': (scheme.onPrimary, scheme.primary),
        'failure text on canvas': (scheme.error, gmBedsideCanvas),
        'snackbar text': (scheme.onInverseSurface, scheme.inverseSurface),
      };
      for (final entry in text.entries) {
        final (fg, bg) = entry.value;
        expect(_contrast(fg, bg), greaterThanOrEqualTo(4.5), reason: entry.key);
      }
    });

    test('body text reaches AAA 7:1 on the page and cards', () {
      expect(_contrast(scheme.onSurface, gmBedsideCanvas), greaterThan(7));
      expect(_contrast(scheme.onSurface, gmBedsidePaper), greaterThan(7));
    });

    test('control edges and tile outlines reach 3:1', () {
      expect(_contrast(scheme.outline, gmBedsideCanvas), greaterThan(3));
      expect(_contrast(scheme.outline, gmBedsidePaper), greaterThan(3));
    });

    test('the default and high-contrast themes are unchanged', () {
      final normal = gmBuildTheme();
      expect(normal.brightness, Brightness.light);
      expect(normal.scaffoldBackgroundColor, gmCanvas);
      expect(normal.colorScheme.onSurfaceVariant, gmMuted);
      expect(
        gmBuildTheme(highContrast: true).scaffoldBackgroundColor,
        gmHighContrastSurface,
      );
    });
  });

  testWidgets('the bedside activity meets tap target and contrast guidelines', (
    tester,
  ) async {
    final handle = tester.ensureSemantics();
    await tester.binding.setSurfaceSize(const Size(390, 1600));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    SharedPreferences.setMockInitialValues({
      GentlePreferences.storageKey: jsonEncode(
        const GentlePreferences(bedside: true).toJson(),
      ),
    });
    await tester.pumpWidget(
      _app(
        const GentleGamePage(pictures: ActivityPicture.samples),
        bedside: true,
      ),
    );
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    await expectLater(tester, meetsGuideline(iOSTapTargetGuideline));
    await expectLater(tester, meetsGuideline(labeledTapTargetGuideline));
    await expectLater(tester, meetsGuideline(textContrastGuideline));
    handle.dispose();
  });
}
