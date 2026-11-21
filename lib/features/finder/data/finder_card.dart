/// Fit facts for one activity card, read the same way as the website finder
/// (APP-005). Pure Dart: no Flutter, no network, no personal data.
///
/// Every enum keeps the website's own word in `wire`, so the shared fixture in
/// test/fixtures/finder can be read without translation.
library;

/// The website's word for a value, as the shared fixture spells it.
abstract interface class FinderWire {
  String get wire;
}

enum FinderType implements FinderWire {
  art('art'),
  craft('craft'),
  nature('nature'),
  music('music'),
  sensory('sensory'),
  conversation('conversation');

  new(this.wire);
  @override
  final String wire;
}

/// Settings the finder offers. [tabletop] and [standing] exist on cards but
/// are not offered as filters, as on the website.
enum FinderSetting implements FinderWire {
  tabletop('tabletop'),
  seated('seated'),
  bedside('bedside'),
  standing('standing'),
  outdoors('outdoors');

  new(this.wire);
  @override
  final String wire;
}

enum FinderGroup implements FinderWire {
  oneToOne('one-to-one'),
  smallGroup('small-group'),
  intergenerational('intergenerational');

  new(this.wire);
  @override
  final String wire;
}

enum FinderSense implements FinderWire {
  sight('sight'),
  touch('touch'),
  smell('smell'),
  hearing('hearing'),
  movement('movement');

  new(this.wire);
  @override
  final String wire;
}

enum FinderCost implements FinderWire {
  free('free'),
  low('low'),
  some('some');

  new(this.wire);
  @override
  final String wire;
}

enum FinderMess implements FinderWire {
  none('none'),
  low('low'),
  medium('medium');

  new(this.wire);
  @override
  final String wire;
}

enum FinderEnergy implements FinderWire {
  low('low'),
  medium('medium');

  new(this.wire);
  @override
  final String wire;
}

enum FinderSupervision implements FinderWire {
  nearby('nearby'),
  handsOn('hands-on');

  new(this.wire);
  @override
  final String wire;
}

/// Safety flags a visitor may leave out. Other flags exist on cards but are
/// not offered as filters, as on the website.
enum FinderSafetyFlag implements FinderWire {
  smallParts('small-parts'),
  sharpTool('sharp-tool'),
  heat('heat'),
  adhesive('adhesive'),
  skinContact('skin-contact'),
  allergen('allergen'),
  ingestion('ingestion'),
  water('water'),
  fallRisk('fall-risk'),
  none('none');

  new(this.wire);
  @override
  final String wire;
}

/// The facts the finder and its "why this fits" lines read.
class FinderFacts {
  const new({
    required this.type,
    required this.prepMinutes,
    required this.minMinutes,
    required this.maxMinutes,
    required this.cost,
    required this.mess,
    required this.energy,
    required this.supervision,
    required this.settings,
    required this.groups,
    this.senses = const {},
    this.variationKinds = const {},
    this.safetyFlags = const {},
  });

  final FinderType type;
  final int prepMinutes;

  /// The card's activity estimate. The finder's time filter reads [minMinutes].
  final int minMinutes;
  final int maxMinutes;
  final FinderCost cost;
  final FinderMess mess;
  final FinderEnergy energy;
  final FinderSupervision supervision;
  final Set<FinderSetting> settings;
  final Set<FinderGroup> groups;
  final Set<FinderSense> senses;

  /// Kinds of written variation, such as `less-sensory` or `nonverbal`.
  final Set<String> variationKinds;
  final Set<FinderSafetyFlag> safetyFlags;
}

/// One activity the finder can list. [name] is for the results list only;
/// matching never reads it.
class FinderCard {
  const new({required this.id, required this.name, required this.facts});

  final String id;
  final String name;
  final FinderFacts facts;
}
