import 'package:creative_activities/features/finder/data/finder_card.dart';

/// One bundled activity card (APP-001): the website's card facts that the
/// app shows or filters on. Pure Dart. Card text is English, as on the
/// website; no author, reviewer name, image or source link is held here.
class ActivityCard {
  const new({
    required this.id,
    required this.slug,
    required this.name,
    required this.summary,
    required this.facts,
    required this.materials,
    required this.steps,
    required this.safety,
    required this.stopNote,
    required this.crisisRoute,
    required this.version,
    required this.reviewed,
  });

  /// The stable card id, for example `ca-0022`. Also keys the materials ticks.
  final String id;

  /// The website slug, which is the page address: `/activity/<slug>/`.
  final String slug;
  final String name;
  final String summary;

  /// The fit facts the finder reads, shared with the website finder rules.
  final FinderFacts facts;
  final List<String> materials;
  final List<String> steps;
  final List<String> safety;
  final String stopNote;

  /// True when the card invites talk about feelings or grief, so the crisis
  /// routes are shown on it (as on the website).
  final bool crisisRoute;

  /// The card's content version, as the website prints it.
  final int version;

  /// True once a named, credentialed reviewer has checked the card.
  final bool reviewed;

  FinderCard get finderCard => FinderCard(id: id, name: name, facts: facts);
}
