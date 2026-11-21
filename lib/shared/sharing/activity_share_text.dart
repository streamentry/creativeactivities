import 'package:creative_activities/shared/links/activity_guide_link.dart';

/// The plain-text message for sharing one activity (APP-020): its name, a
/// short line and the website link, one per line.
///
/// Pure Dart. It takes only the three strings of [ActivityGuide], so no
/// photo, note, plan name, device identifier or query parameter can be added
/// to it. Returns null when the slug does not give a valid link, so a broken
/// link is never shared.
String? activityShareText(ActivityGuide activity) {
  final link = activityGuideUri(activity.slug);
  if (link == null) return null;
  return [activity.name, activity.summary, link.toString()].join('\n');
}
