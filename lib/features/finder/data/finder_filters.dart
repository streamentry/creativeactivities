/// The finder's choices and the rules that match cards to them (APP-005).
///
/// A port of the website's `parseFinderState`, `matches` and `fitReasons`
/// (site/src/lib/finder-state.ts and site/src/lib/activities.ts). The shared
/// fixture in test/fixtures/finder checks both sides agree. Pure Dart.
///
/// "Any" and unset choices never filter. Unknown keys and values are dropped,
/// as on the website.
library;

import 'package:creative_activities/features/finder/data/finder_card.dart';

/// Why a card fits the choices made. [english] is the website's wording, used
/// by the fixture test. The screen shows localized text for each code.
enum FinderReason {
  startUnder15('can start in under 15 minutes'),
  startUnder30('can start in under 30 minutes'),
  nothingToBuy('nothing to buy'),
  needsLowCostThings('needs only low-cost things'),
  worksSeated('works seated'),
  worksBedside('works bedside'),
  worksOutdoors('works outdoors'),
  noMess('no mess'),
  littleOrNoMess('little or no mess'),
  mostlySittingStill('mostly sitting still'),
  goodToLook('good to look at'),
  somethingToHandle('something to handle'),
  usesSoundsOrMusic('uses sounds or music'),
  hasScents('has scents to enjoy'),
  involvesGentleMovement('involves gentle movement'),
  hasCalmerVersion('has a calmer version'),
  worksWithoutWords('works without words'),
  worksWithYouNearby('works with you nearby');

  new(this.english);
  final String english;
}

/// The choices the finder holds. Every field left null (or false, or empty)
/// means "any".
class FinderChoice {
  const new({
    this.maxStartMinutes,
    this.costs,
    this.type,
    this.setting,
    this.group,
    this.allowedMess,
    this.allowedEnergy,
    this.sense,
    this.calmOnly = false,
    this.withoutWords = false,
    this.nearbyOnly = false,
    this.avoid = const {},
  });

  /// Reads a choice from a query string, the way the website reads its
  /// address bar.
  factory fromQuery(String query) {
    final params = _parseQuery(query);
    String? first(String key) {
      final values = params[key];
      return values == null || values.isEmpty ? null : values.first;
    }

    final time = first('time');
    final materials = first('materials');
    final mess = first('mess');
    final energy = first('energy');
    final sense = first('sense');
    final avoid = <FinderSafetyFlag>{};
    for (final value in params['avoid'] ?? const <String>[]) {
      final flag = _byWire(FinderSafetyFlag.values, value);
      if (flag != null && _filterableFlags.contains(flag)) avoid.add(flag);
    }
    return FinderChoice(
      maxStartMinutes: switch (time) {
        '15' => 15,
        '30' => 30,
        _ => null,
      },
      costs: switch (materials) {
        'none' => const {FinderCost.free},
        'low' => const {FinderCost.free, FinderCost.low},
        _ => null,
      },
      type: _byWire(FinderType.values, first('type') ?? ''),
      setting: _settingFrom(first('setting')),
      group: _byWire(FinderGroup.values, first('group') ?? ''),
      allowedMess: switch (mess) {
        'none' => const {FinderMess.none},
        'low' => const {FinderMess.none, FinderMess.low},
        _ => null,
      },
      allowedEnergy: energy == 'low' ? const {FinderEnergy.low} : null,
      sense: sense == null || sense == 'calm'
          ? null
          : _byWire(FinderSense.values, sense),
      calmOnly: sense == 'calm',
      withoutWords: first('talking') == 'none',
      nearbyOnly: first('supervision') == 'nearby',
      avoid: avoid,
    );
  }

  /// Time: the card's shortest estimate must be at most this. Offered: 15
  /// or 30.
  final int? maxStartMinutes;

  /// Materials: the card's cost must be one of these.
  final Set<FinderCost>? costs;
  final FinderType? type;

  /// Offered settings: seated, bedside, outdoors.
  final FinderSetting? setting;
  final FinderGroup? group;

  /// Mess: the card's mess must be one of these.
  final Set<FinderMess>? allowedMess;

  /// Energy: the card's energy must be one of these.
  final Set<FinderEnergy>? allowedEnergy;

  /// A sense the activity uses. Ignored when [calmOnly] is set.
  final FinderSense? sense;

  /// A calmer version with less to see or hear has been written.
  final bool calmOnly;

  /// A version that works without words has been written.
  final bool withoutWords;

  /// The card needs only nearby supervision, not hands-on help.
  final bool nearbyOnly;

  /// Safety flags the visitor wants to leave out.
  final Set<FinderSafetyFlag> avoid;

  static const Set<FinderSetting> _settings = {
    FinderSetting.seated,
    FinderSetting.bedside,
    FinderSetting.outdoors,
  };

  static const Set<FinderSafetyFlag> _filterableFlags = {
    FinderSafetyFlag.smallParts,
    FinderSafetyFlag.sharpTool,
    FinderSafetyFlag.heat,
    FinderSafetyFlag.adhesive,
    FinderSafetyFlag.skinContact,
  };

  /// Whether the card fits every choice made.
  bool matches(FinderFacts card) {
    final max = maxStartMinutes;
    if (max != null && card.minMinutes > max) return false;
    final allowedCosts = costs;
    if (allowedCosts != null && !allowedCosts.contains(card.cost)) return false;
    if (type != null && card.type != type) return false;
    final wantedSetting = setting;
    if (wantedSetting != null && !card.settings.contains(wantedSetting)) {
      return false;
    }
    final wantedGroup = group;
    if (wantedGroup != null && !card.groups.contains(wantedGroup)) return false;
    final mess = allowedMess;
    if (mess != null && !mess.contains(card.mess)) return false;
    final energy = allowedEnergy;
    if (energy != null && !energy.contains(card.energy)) return false;
    if (calmOnly) {
      if (!card.variationKinds.contains('less-sensory')) return false;
    } else if (sense != null && !card.senses.contains(sense)) {
      return false;
    }
    if (withoutWords && !card.variationKinds.contains('nonverbal')) {
      return false;
    }
    if (nearbyOnly && card.supervision != FinderSupervision.nearby) {
      return false;
    }
    if (card.safetyFlags.any(avoid.contains)) return false;
    return true;
  }

  /// Why a matching card fits, in the website's order. Empty when nothing
  /// is chosen.
  List<FinderReason> reasonsFor(FinderFacts card) {
    final reasons = <FinderReason>[];
    final max = maxStartMinutes;
    if (max == 15) reasons.add(FinderReason.startUnder15);
    if (max == 30) reasons.add(FinderReason.startUnder30);
    final allowedCosts = costs;
    if (allowedCosts != null) {
      reasons.add(
        card.cost == FinderCost.free
            ? FinderReason.nothingToBuy
            : FinderReason.needsLowCostThings,
      );
    }
    switch (setting) {
      case FinderSetting.seated:
        reasons.add(FinderReason.worksSeated);
      case FinderSetting.bedside:
        reasons.add(FinderReason.worksBedside);
      case FinderSetting.outdoors:
        reasons.add(FinderReason.worksOutdoors);
      case _:
        break;
    }
    if (allowedMess != null) {
      reasons.add(
        card.mess == FinderMess.none
            ? FinderReason.noMess
            : FinderReason.littleOrNoMess,
      );
    }
    if (allowedEnergy != null) reasons.add(FinderReason.mostlySittingStill);
    if (calmOnly) {
      reasons.add(FinderReason.hasCalmerVersion);
    } else {
      final reason = switch (sense) {
        FinderSense.sight => FinderReason.goodToLook,
        FinderSense.touch => FinderReason.somethingToHandle,
        FinderSense.hearing => FinderReason.usesSoundsOrMusic,
        FinderSense.smell => FinderReason.hasScents,
        FinderSense.movement => FinderReason.involvesGentleMovement,
        null => null,
      };
      if (reason != null) reasons.add(reason);
    }
    if (withoutWords) reasons.add(FinderReason.worksWithoutWords);
    if (nearbyOnly) reasons.add(FinderReason.worksWithYouNearby);
    return reasons;
  }

  /// The cards that fit, in the order given.
  List<FinderCard> filter(Iterable<FinderCard> cards) => [
    for (final card in cards)
      if (matches(card.facts)) card,
  ];

  static FinderSetting? _settingFrom(String? value) {
    final setting = _byWire(FinderSetting.values, value ?? '');
    return setting != null && _settings.contains(setting) ? setting : null;
  }
}

T? _byWire<T extends FinderWire>(Iterable<T> values, String wire) {
  for (final value in values) {
    if (value.wire == wire) return value;
  }
  return null;
}

/// Repeated keys keep every value in order, as URLSearchParams does with
/// getAll.
Map<String, List<String>> _parseQuery(String query) {
  final params = <String, List<String>>{};
  final text = query.startsWith('?') ? query.substring(1) : query;
  for (final part in text.split('&')) {
    if (part.isEmpty) continue;
    final at = part.indexOf('=');
    final key = Uri.decodeQueryComponent(at < 0 ? part : part.substring(0, at));
    final value = at < 0
        ? ''
        : Uri.decodeQueryComponent(part.substring(at + 1));
    (params[key] ??= <String>[]).add(value);
  }
  return params;
}
