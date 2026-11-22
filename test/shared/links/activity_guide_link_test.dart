import 'package:creative_activities/shared/links/activity_guide_link.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('activityGuideUri', () {
    test('is the canonical website page for the activity, exactly', () {
      final uri = activityGuideUri('make-a-greeting-card');
      expect(
        uri?.toString(),
        'https://creativeactivities.org/activity/make-a-greeting-card/',
      );
    });

    test('carries no query, fragment, user info or port', () {
      final uri = activityGuideUri('draw-to-music');
      expect(uri, isNotNull);
      expect(uri!.hasQuery, isFalse);
      expect(uri.hasFragment, isFalse);
      expect(uri.query, isEmpty);
      expect(uri.userInfo, isEmpty);
      expect(uri.hasPort, isFalse);
      expect(uri.scheme, 'https');
      expect(uri.host, 'creativeactivities.org');
    });

    test('refuses a slug that could change the path or add parameters', () {
      for (final slug in [
        '',
        'Make-a-card',
        'make a card',
        'make-a-card?utm=x',
        'make-a-card#top',
        '../etc',
        'make/card',
        '-leading',
        'trailing-',
        'double--dash',
      ]) {
        expect(activityGuideUri(slug), isNull, reason: slug);
      }
    });
  });
}
