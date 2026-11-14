import 'package:creative_activities/design_system.dart';
import 'package:flutter/services.dart';

/// Loads the bundled family (DESIGN.md › Type), so headline and label widths
/// in a test are the shipped ones rather than the square test font's, which
/// makes every word far wider.
Future<void> loadShippedFonts() async {
  final family = FontLoader(gmFontFamily);
  for (final weight in ['Regular', 'Medium', 'Bold']) {
    family.addFont(
      rootBundle.load('assets/fonts/AtkinsonHyperlegibleNext-$weight.ttf'),
    );
  }
  await family.load();
}
