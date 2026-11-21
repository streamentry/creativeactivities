import 'package:creative_activities/data/models/sound_setting.dart';
import 'package:creative_activities/design_system.dart';
import 'package:creative_activities/features/gentle_activities/presentation/keep_the_beat_page.dart';
import 'package:creative_activities/l10n/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _beat = Duration(milliseconds: 1000);

/// Counts the beat sounds the page asks for, instead of playing them.
class _Sounds {
  int count = 0;
  Future<void> play() async => count++;
}

Widget _app({
  required _Sounds sounds,
  SoundSettings? settings,
  double textScale = 1,
}) {
  final page = KeepTheBeatPage(playBeat: sounds.play);
  return MaterialApp(
    localizationsDelegates: AppLocalizations.localizationsDelegates,
    supportedLocales: AppLocalizations.supportedLocales,
    theme: gmBuildTheme(),
    builder: (context, child) => MediaQuery(
      data: MediaQuery.of(context)
          .copyWith(textScaler: TextScaler.linear(textScale)),
      child: child!,
    ),
    home: settings == null
        ? page
        : ChangeNotifierProvider<SoundSettings>.value(
            value: settings,
            child: page,
          ),
  );
}

final Finder _start = find.bySemanticsLabel(
  'Tap the circle to start the beat.',
);
final Finder _onBeat = find.bySemanticsLabel('Tap on the beat');

/// Settings with sound switched on, as a person would leave them.
Future<SoundSettings> _soundOn() async {
  final settings = SoundSettings()..toggleSound();
  return settings;
}

/// Leaves the page, so its timer and animation are released before the test
/// ends.
Future<void> _leave(WidgetTester tester) async {
  await tester.pumpWidget(const SizedBox());
}

Future<void> _pumpPage(
  WidgetTester tester, {
  required _Sounds sounds,
  SoundSettings? settings,
  double textScale = 1,
  Size size = const Size(390, 844),
}) async {
  await tester.binding.setSurfaceSize(size);
  addTearDown(() => tester.binding.setSurfaceSize(null));
  await tester.pumpWidget(
    _app(sounds: sounds, settings: settings, textScale: textScale),
  );
  await tester.pump();
}

void main() {
  testWidgets('one large target, the title, and Done for now are in view', (
    tester,
  ) async {
    final handle = tester.ensureSemantics();
    final sounds = _Sounds();
    await _pumpPage(tester, sounds: sounds);
    expect(find.text('Keep the beat'), findsWidgets);
    expect(_start, findsOneWidget);
    expect(find.text('Done for now'), findsOneWidget);
    expect(
      find.text('The beat is paused. Tap the circle to start it again.'),
      findsNothing,
    );
    expect(
      find.textContaining(
        RegExp(r'score|streak|timer|seconds|clock|\d', caseSensitive: false),
      ),
      findsNothing,
    );
    // Nothing is playing until the person starts it.
    await tester.pump(_beat * 3);
    expect(sounds.count, 0);
    handle.dispose();
    await _leave(tester);
  });

  testWidgets('the one target is a single button with a tap action', (
    tester,
  ) async {
    final handle = tester.ensureSemantics();
    await _pumpPage(tester, sounds: _Sounds());
    final node = tester.getSemantics(_start);
    expect(node.getSemanticsData().hasAction(SemanticsAction.tap), isTrue);
    expect(node.getSemanticsData().flagsCollection.isButton, isTrue);
    handle.dispose();
    await _leave(tester);
  });

  testWidgets('a tap starts the beat; the beat keeps going, without counting', (
    tester,
  ) async {
    SharedPreferences.setMockInitialValues({});
    final handle = tester.ensureSemantics();
    final sounds = _Sounds();
    await _pumpPage(tester, sounds: sounds, settings: await _soundOn());
    await tester.tap(_start);
    await tester.pump();
    expect(find.text('The beat is going. Take your time.'), findsOneWidget);
    expect(find.text('Pause the beat'), findsOneWidget);
    expect(_onBeat, findsOneWidget);
    await tester.pump(_beat * 3 + const Duration(milliseconds: 10));
    expect(sounds.count, 3);
    // Taps on the beat change nothing on the screen: no count, no grade.
    final before = _allText(tester);
    for (var i = 0; i < 5; i++) {
      await tester.tap(_onBeat);
      await tester.pump(const Duration(milliseconds: 40));
    }
    expect(_allText(tester), before);
    expect(
      find.textContaining(
        RegExp(
          r'score|early|late|on time|good|great|perfect|miss|wrong|\d',
          caseSensitive: false,
        ),
      ),
      findsNothing,
    );
    handle.dispose();
    await _leave(tester);
  });

  testWidgets('Pause the beat stops the beat; a tap starts it again', (
    tester,
  ) async {
    final handle = tester.ensureSemantics();
    final sounds = _Sounds();
    await _pumpPage(tester, sounds: sounds, settings: await _soundOn());
    await tester.tap(_start);
    await tester.pump(_beat);
    await _tapText(tester, 'Pause the beat');
    final paused = sounds.count;
    expect(
      find.text('The beat is paused. Tap the circle to start it again.'),
      findsOneWidget,
    );
    await tester.pump(_beat * 3);
    expect(sounds.count, paused, reason: 'no beats while paused');
    await tester.tap(_start);
    await tester.pump(_beat * 2 + const Duration(milliseconds: 10));
    expect(sounds.count, greaterThan(paused));
    handle.dispose();
    await _leave(tester);
  });

  testWidgets('beat sounds follow the app sound setting: quiet by default', (
    tester,
  ) async {
    SharedPreferences.setMockInitialValues({});
    final handle = tester.ensureSemantics();
    final sounds = _Sounds();
    final settings = SoundSettings();
    await _pumpPage(tester, sounds: sounds, settings: settings);
    await tester.tap(_start);
    await tester.pump(_beat * 3 + const Duration(milliseconds: 10));
    expect(sounds.count, 0);
    handle.dispose();
    await _leave(tester);
  });

  testWidgets('with sound on, each beat is sounded', (tester) async {
    SharedPreferences.setMockInitialValues({});
    final handle = tester.ensureSemantics();
    final sounds = _Sounds();
    await _pumpPage(tester, sounds: sounds, settings: await _soundOn());
    await tester.tap(_start);
    await tester.pump(_beat * 3 + const Duration(milliseconds: 10));
    expect(sounds.count, 3);
    handle.dispose();
    await _leave(tester);
  });

  for (final scenario in {
    'phone, 200% text': (const Size(390, 844), 2.0),
    'small phone, 200% text': (const Size(320, 568), 2.0),
    'landscape phone': (const Size(844, 390), 1.0),
    'iPad portrait': (const Size(820, 1180), 1.0),
  }.entries) {
    testWidgets('holds on ${scenario.key} with a large target', (tester) async {
      final handle = tester.ensureSemantics();
      await _pumpPage(
        tester,
        sounds: _Sounds(),
        size: scenario.value.$1,
        textScale: scenario.value.$2,
      );
      expect(tester.takeException(), isNull);
      expect(_start, findsOneWidget);
      expect(
        tester.getSize(_start).shortestSide,
        greaterThanOrEqualTo(gmTargetHero),
      );
      expect(find.text('Done for now'), findsOneWidget);
      handle.dispose();
      await _leave(tester);
    });
  }
}

/// Every piece of text on the page, in order, for "nothing changed" checks.
List<String> _allText(WidgetTester tester) => [
  for (final w in tester.widgetList<Text>(find.byType(Text))) w.data ?? '',
];

Future<void> _tapText(WidgetTester tester, String text) async {
  await tester.ensureVisible(find.text(text));
  await tester.tap(find.text(text));
  await tester.pump();
}
