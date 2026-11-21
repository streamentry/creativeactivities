import 'package:creative_activities/design_system.dart';
import 'package:creative_activities/l10n/l10n.dart';
import 'package:creative_activities/shared/links/activity_guide_link.dart';
import 'package:creative_activities/shared/sharing/activity_share_text.dart';
import 'package:creative_activities/shared/widgets/activity_guide_actions.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

const _activity = ActivityGuide(
  slug: 'make-a-greeting-card',
  name: 'Make a greeting card',
  summary: 'Fold paper and choose colors together.',
);
const _url = 'https://creativeactivities.org/activity/make-a-greeting-card/';

Widget _app({required OpenGuideFn open, required ShareTextFn share}) =>
    MaterialApp(
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      theme: gmBuildTheme(),
      home: Scaffold(
        body: SingleChildScrollView(
          child: ActivityGuideActions(
            activity: _activity,
            openGuide: open,
            shareText: share,
          ),
        ),
      ),
    );

Future<bool> _opens(Uri _) async => true;
Future<bool> _doesNotOpen(Uri _) async => false;
Future<bool> _throwsOpen(Uri _) async =>
    throw PlatformException(code: 'no-browser');
Future<GuideShareOutcome> _shared(String _) async => GuideShareOutcome.shared;
Future<GuideShareOutcome> _dismissed(String _) async =>
    GuideShareOutcome.dismissed;
Future<GuideShareOutcome> _failedShare(String _) async =>
    GuideShareOutcome.failed;
Future<GuideShareOutcome> _throwsShare(String _) async =>
    throw PlatformException(code: 'unavailable');

void main() {
  final guideButton = find.widgetWithText(
    FilledButton,
    'Full guide and printable card',
  );
  final shareButton = find.widgetWithText(OutlinedButton, 'Share as text');
  const couldNotOpen =
      'The guide did not open on this device. Type the address below into '
      'any web browser, or scan the code with a phone camera.';
  const shareFailed = 'Sharing did not work on this device. Nothing was sent.';

  testWidgets('shows both actions at the required size', (tester) async {
    await tester.pumpWidget(_app(open: _opens, share: _shared));
    expect(guideButton, findsOneWidget);
    expect(shareButton, findsOneWidget);
    expect(tester.getSize(guideButton).height, greaterThanOrEqualTo(56));
    expect(tester.getSize(shareButton).height, greaterThanOrEqualTo(48));
    expect(find.text(couldNotOpen), findsNothing);
    expect(find.text(shareFailed), findsNothing);
  });

  testWidgets('the guide action opens the exact canonical link', (
    tester,
  ) async {
    Uri? opened;
    await tester.pumpWidget(
      _app(
        open: (uri) async {
          opened = uri;
          return true;
        },
        share: _shared,
      ),
    );
    await tester.tap(guideButton);
    await tester.pumpAndSettle();
    expect(opened.toString(), _url);
    expect(opened!.hasQuery, isFalse);
    expect(find.text(couldNotOpen), findsNothing);
  });

  testWidgets('a browser that does not open shows the address and a QR code', (
    tester,
  ) async {
    await tester.pumpWidget(_app(open: _doesNotOpen, share: _shared));
    await tester.tap(guideButton);
    await tester.pumpAndSettle();

    expect(find.text(couldNotOpen), findsOneWidget);
    expect(find.text(_url), findsOneWidget);
    expect(
      find.bySemanticsLabel('QR code for the full guide address'),
      findsOneWidget,
    );
    expect(tester.takeException(), isNull);
    expect(guideButton, findsOneWidget);
  });

  testWidgets('a launch error is caught and shown calmly, never a crash', (
    tester,
  ) async {
    await tester.pumpWidget(_app(open: _throwsOpen, share: _shared));
    await tester.tap(guideButton);
    await tester.pumpAndSettle();

    expect(tester.takeException(), isNull);
    expect(find.text(couldNotOpen), findsOneWidget);
    expect(find.text(_url), findsOneWidget);
  });

  testWidgets('share sends exactly the activity text payload', (tester) async {
    String? sent;
    await tester.pumpWidget(
      _app(
        open: _opens,
        share: (text) async {
          sent = text;
          return GuideShareOutcome.shared;
        },
      ),
    );
    await tester.tap(shareButton);
    await tester.pumpAndSettle();
    expect(sent, activityShareText(_activity));
    expect(find.text(shareFailed), findsNothing);
  });

  testWidgets('cancelling the share sheet shows no message', (tester) async {
    await tester.pumpWidget(_app(open: _opens, share: _dismissed));
    await tester.tap(shareButton);
    await tester.pumpAndSettle();
    expect(find.text(shareFailed), findsNothing);
    expect(find.byType(SnackBar), findsNothing);
  });

  testWidgets('a share that fails shows a calm message', (tester) async {
    await tester.pumpWidget(_app(open: _opens, share: _failedShare));
    await tester.tap(shareButton);
    await tester.pumpAndSettle();
    expect(find.text(shareFailed), findsOneWidget);
  });

  testWidgets('a share error is caught and shown calmly', (tester) async {
    await tester.pumpWidget(_app(open: _opens, share: _throwsShare));
    await tester.tap(shareButton);
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);
    expect(find.text(shareFailed), findsOneWidget);
  });
}
