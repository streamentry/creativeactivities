import 'package:creative_activities/shared/links/activity_guide_link.dart';
import 'package:creative_activities/shared/sharing/activity_share_text.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  const activity = ActivityGuide(
    slug: 'make-a-greeting-card',
    name: 'Make a greeting card',
    summary: 'Fold paper and choose colors together.',
  );

  test('payload is the name, a short line and the canonical link only', () {
    final text = activityShareText(activity);
    expect(
      text,
      [
        'Make a greeting card',
        'Fold paper and choose colors together.',
        'https://creativeactivities.org/activity/make-a-greeting-card/',
      ].join('\n'),
    );
  });

  test('the link in the payload has no tracking parameters', () {
    final lines = activityShareText(activity)!.split('\n');
    final link = Uri.parse(lines.last);
    expect(link.hasQuery, isFalse);
    expect(link.hasFragment, isFalse);
    expect(link.path, '/activity/make-a-greeting-card/');
  });

  test('a payload for an invalid slug is null, never a broken link', () {
    const bad = ActivityGuide(slug: 'Bad Slug', name: 'x', summary: 'y');
    expect(activityShareText(bad), isNull);
  });

  test('the payload never includes photos, notes or other personal text', () {
    final text = activityShareText(activity)!;
    expect(text, isNot(contains('.jpg')));
    expect(text, isNot(contains('.png')));
    expect(text, isNot(contains('content://')));
    expect(text, isNot(contains('file://')));
    expect(text, isNot(contains('?')));
  });
}
