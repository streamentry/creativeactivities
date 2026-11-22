import 'package:creative_activities/design_system.dart';
import 'package:creative_activities/features/finder/data/finder_card.dart';
import 'package:creative_activities/features/finder/data/finder_filters.dart';
import 'package:creative_activities/l10n/l10n.dart';
import 'package:flutter/material.dart';

/// The offline finder (APP-005). It filters the cards it is given with the
/// website's rules and explains why each activity fits. It makes no network
/// call and keeps the choices in memory only.
class FinderPage extends StatefulWidget {
  const new({required this.cards, this.onOpen, super.key});

  final List<FinderCard> cards;

  /// Opens one result by its card id. When null, results are not tappable.
  final void Function(String id)? onOpen;

  @override
  State<FinderPage> createState() => _FinderPageState();
}

class _FinderPageState extends State<FinderPage> {
  /// One value per single-choice group, keyed as the website's address bar
  /// keys.
  Map<String, String> _chosen = const {};

  /// Safety flags the visitor leaves out.
  Set<String> _avoid = const {};

  FinderChoice get _choice => FinderChoice.fromQuery(_query());

  String _query() {
    final parts = [
      for (final entry in _chosen.entries)
        '${entry.key}=${Uri.encodeQueryComponent(entry.value)}',
      for (final flag in _avoid) 'avoid=${Uri.encodeQueryComponent(flag)}',
    ];
    return parts.join('&');
  }

  /// Selecting the chosen value again clears it, so "any" is always one
  /// tap away.
  void _choose(String key, String value) {
    final current = _chosen[key];
    setState(() {
      _chosen = {
        for (final entry in _chosen.entries)
          if (entry.key != key) entry.key: entry.value,
        if (current != value) key: value,
      };
    });
  }

  void _toggleAvoid(String flag) {
    setState(() {
      _avoid = _avoid.contains(flag)
          ? {
              for (final item in _avoid)
                if (item != flag) item,
            }
          : {..._avoid, flag};
    });
  }

  void _clearAll() {
    setState(() {
      _chosen = const {};
      _avoid = const {};
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final choice = _choice;
    final fits = choice.filter(widget.cards);
    final groups = _groups(l10n);

    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(gmSpaceLg),
          children: [
            GmTitle(l10n.finderTitle),
            const SizedBox(height: gmSpaceSm),
            Text(l10n.finderIntro),
            for (final group in groups) ...[
              const SizedBox(height: gmSpaceLg),
              _FilterGroup(
                title: group.title,
                children: [
                  for (final option in group.options)
                    FilterChip(
                      label: Text(option.label),
                      selected: _chosen[group.key] == option.value,
                      materialTapTargetSize: MaterialTapTargetSize.padded,
                      onSelected: (_) => _choose(group.key, option.value),
                    ),
                ],
              ),
            ],
            const SizedBox(height: gmSpaceLg),
            _FilterGroup(
              title: l10n.finderHeadingAvoid,
              children: [
                for (final option in _avoidOptions(l10n))
                  FilterChip(
                    label: Text(option.label),
                    selected: _avoid.contains(option.value),
                    materialTapTargetSize: MaterialTapTargetSize.padded,
                    onSelected: (_) => _toggleAvoid(option.value),
                  ),
              ],
            ),
            const SizedBox(height: gmSpaceLg),
            Text(
              l10n.finderResultsHeading,
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: gmSpaceSm),
            if (fits.isEmpty)
              _EmptyResults(onClear: _clearAll)
            else
              for (final card in fits)
                _ResultTile(
                  name: card.name,
                  reasons: [
                    for (final reason in choice.reasonsFor(card.facts))
                      _reasonText(l10n, reason),
                  ],
                  whyLabel: l10n.finderWhyFits,
                  onOpen: widget.onOpen == null
                      ? null
                      : () => widget.onOpen?.call(card.id),
                ),
            const SizedBox(height: gmSpaceLg),
            GmOutlineButton(
              label: l10n.commonDoneForNow,
              onTap: () => Navigator.of(context).maybePop(),
            ),
          ],
        ),
      ),
    );
  }
}

class _FilterGroup extends StatelessWidget {
  const new({required this.title, required this.children});

  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: gmSpaceSm),
        Wrap(spacing: gmSpaceSm, runSpacing: gmSpaceSm, children: children),
      ],
    );
  }
}

class _ResultTile extends StatelessWidget {
  const new({
    required this.name,
    required this.reasons,
    required this.whyLabel,
    this.onOpen,
  });

  final String name;
  final List<String> reasons;
  final String whyLabel;
  final VoidCallback? onOpen;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final tile = Container(
      margin: const EdgeInsets.only(bottom: gmSpaceSm),
      padding: const EdgeInsets.all(gmSpaceMd),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(gmRadiusMd),
        border: Border.all(color: scheme.outline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(name, style: Theme.of(context).textTheme.titleMedium),
          if (reasons.isNotEmpty) ...[
            const SizedBox(height: gmSpaceSm),
            Text(whyLabel, style: Theme.of(context).textTheme.labelLarge),
            Wrap(
              spacing: gmSpaceSm,
              runSpacing: gmSpaceSm,
              children: [
                for (final reason in reasons)
                  Chip(
                    label: Text(reason),
                    visualDensity: VisualDensity.standard,
                  ),
              ],
            ),
          ],
        ],
      ),
    );
    final open = onOpen;
    if (open == null) return tile;
    return Semantics(
      button: true,
      child: InkWell(
        onTap: open,
        borderRadius: BorderRadius.circular(gmRadiusMd),
        child: tile,
      ),
    );
  }
}

class _EmptyResults extends StatelessWidget {
  const new({required this.onClear});

  final VoidCallback onClear;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          l10n.finderEmptyTitle,
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: gmSpaceSm),
        Text(l10n.finderEmptyBody),
        const SizedBox(height: gmSpaceMd),
        GmOutlineButton(label: l10n.finderClearAll, onTap: onClear),
      ],
    );
  }
}

typedef _Option = ({String value, String label});

typedef _Group = ({String key, String title, List<_Option> options});

List<_Group> _groups(AppLocalizations l10n) => [
  (
    key: 'time',
    title: l10n.finderHeadingTime,
    options: [
      (value: '15', label: l10n.finderTimeFifteen),
      (value: '30', label: l10n.finderTimeThirty),
    ],
  ),
  (
    key: 'materials',
    title: l10n.finderHeadingMaterials,
    options: [
      (value: 'none', label: l10n.finderMaterialsNone),
      (value: 'low', label: l10n.finderMaterialsLow),
    ],
  ),
  (
    key: 'type',
    title: l10n.finderHeadingType,
    options: [
      (value: 'art', label: l10n.finderTypeArt),
      (value: 'craft', label: l10n.finderTypeCraft),
      (value: 'nature', label: l10n.finderTypeNature),
      (value: 'music', label: l10n.finderTypeMusic),
      (value: 'sensory', label: l10n.finderTypeSensory),
      (value: 'conversation', label: l10n.finderTypeConversation),
    ],
  ),
  (
    key: 'setting',
    title: l10n.finderHeadingSetting,
    options: [
      (value: 'seated', label: l10n.finderSettingSeated),
      (value: 'bedside', label: l10n.finderSettingBedside),
      (value: 'outdoors', label: l10n.finderSettingOutdoors),
    ],
  ),
  (
    key: 'group',
    title: l10n.finderHeadingPeople,
    options: [
      (value: 'one-to-one', label: l10n.finderPeopleOneToOne),
      (value: 'small-group', label: l10n.finderPeopleSmallGroup),
      (value: 'intergenerational', label: l10n.finderPeopleIntergenerational),
    ],
  ),
  (
    key: 'mess',
    title: l10n.finderHeadingMess,
    options: [
      (value: 'none', label: l10n.finderMessNone),
      (value: 'low', label: l10n.finderMessLow),
    ],
  ),
  (
    key: 'energy',
    title: l10n.finderHeadingEnergy,
    options: [(value: 'low', label: l10n.finderEnergyLow)],
  ),
  (
    key: 'sense',
    title: l10n.finderHeadingSenses,
    options: [
      (value: 'sight', label: l10n.finderSenseSight),
      (value: 'touch', label: l10n.finderSenseTouch),
      (value: 'hearing', label: l10n.finderSenseHearing),
      (value: 'smell', label: l10n.finderSenseSmell),
      (value: 'movement', label: l10n.finderSenseMovement),
      (value: 'calm', label: l10n.finderSenseCalm),
    ],
  ),
  (
    key: 'talking',
    title: l10n.finderHeadingWords,
    options: [(value: 'none', label: l10n.finderWordsNone)],
  ),
  (
    key: 'supervision',
    title: l10n.finderHeadingHelp,
    options: [(value: 'nearby', label: l10n.finderHelpNearby)],
  ),
];

List<_Option> _avoidOptions(AppLocalizations l10n) => [
  (value: 'small-parts', label: l10n.finderAvoidSmallParts),
  (value: 'sharp-tool', label: l10n.finderAvoidSharpTool),
  (value: 'heat', label: l10n.finderAvoidHeat),
  (value: 'adhesive', label: l10n.finderAvoidAdhesive),
  (value: 'skin-contact', label: l10n.finderAvoidSkinContact),
];

String _reasonText(AppLocalizations l10n, FinderReason reason) =>
    switch (reason) {
      FinderReason.startUnder15 => l10n.finderReasonStartUnder15,
      FinderReason.startUnder30 => l10n.finderReasonStartUnder30,
      FinderReason.nothingToBuy => l10n.finderReasonNothingToBuy,
      FinderReason.needsLowCostThings => l10n.finderReasonNeedsLowCostThings,
      FinderReason.worksSeated => l10n.finderReasonWorksSeated,
      FinderReason.worksBedside => l10n.finderReasonWorksBedside,
      FinderReason.worksOutdoors => l10n.finderReasonWorksOutdoors,
      FinderReason.noMess => l10n.finderReasonNoMess,
      FinderReason.littleOrNoMess => l10n.finderReasonLittleOrNoMess,
      FinderReason.mostlySittingStill => l10n.finderReasonMostlySittingStill,
      FinderReason.goodToLook => l10n.finderReasonGoodToLook,
      FinderReason.somethingToHandle => l10n.finderReasonSomethingToHandle,
      FinderReason.usesSoundsOrMusic => l10n.finderReasonUsesSoundsOrMusic,
      FinderReason.hasScents => l10n.finderReasonHasScents,
      FinderReason.involvesGentleMovement =>
        l10n.finderReasonInvolvesGentleMovement,
      FinderReason.hasCalmerVersion => l10n.finderReasonHasCalmerVersion,
      FinderReason.worksWithoutWords => l10n.finderReasonWorksWithoutWords,
      FinderReason.worksWithYouNearby => l10n.finderReasonWorksWithYouNearby,
    };
