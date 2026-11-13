import 'package:creative_activities/design_system.dart';
import 'package:creative_activities/l10n/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('primary action honors disabled and enabled states', (
    tester,
  ) async {
    var taps = 0;
    Widget button({bool disabled = false}) => MaterialApp(
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      home: Scaffold(
        body: GmPrimaryButton(
          label: 'Play',
          disabled: disabled,
          onTap: () => taps++,
        ),
      ),
    );
    await tester.pumpWidget(button(disabled: true));
    await tester.tap(find.text('Play'));
    expect(taps, 0);
    await tester.pumpWidget(button());
    await tester.tap(find.text('Play'));
    expect(taps, 1);
  });
}
