/// The website page for one activity (APP-014). Pure Dart: no network, no
/// storage and no identifiers.
///
/// The website builds activity pages from card slugs: `/activity/<slug>/`
/// (site/src/pages/activity/`[slug]`.astro), with `trailingSlash: 'always'`.
library;

const _siteHost = 'creativeactivities.org';

/// Lowercase words joined by single hyphens, the same shape as card slugs.
final _slugPattern = RegExp(r'^[a-z0-9]+(?:-[a-z0-9]+)*$');

/// One activity as the app knows it: the website slug, the name and a short
/// line. Only these three plain strings leave the app, and only when the
/// person chooses to open or share the guide.
final class ActivityGuide {
  const new({required this.slug, required this.name, required this.summary});

  /// The card slug on the website, for example `make-a-greeting-card`.
  final String slug;

  /// The activity's title, as shown in the app.
  final String name;

  /// One short line describing the activity.
  final String summary;
}

/// The canonical HTTPS page for [slug], or null when the slug is not a plain
/// card slug. The result never has a query, fragment or user information.
Uri? activityGuideUri(String slug) {
  if (!_slugPattern.hasMatch(slug)) return null;
  return Uri(scheme: 'https', host: _siteHost, path: '/activity/$slug/');
}
