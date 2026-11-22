import 'package:creative_activities/design_system.dart';
import 'package:creative_activities/features/activity_cards/data/activity_card.dart';
import 'package:creative_activities/features/activity_cards/data/crisis_routes.dart';
import 'package:creative_activities/features/activity_cards/data/safety_flag_labels.dart';
import 'package:creative_activities/features/materials/presentation/materials_checklist.dart';
import 'package:creative_activities/features/plan/data/personal_plan.dart';
import 'package:creative_activities/l10n/l10n.dart';
import 'package:creative_activities/shared/links/activity_guide_link.dart';
import 'package:creative_activities/shared/widgets/activity_guide_actions.dart';
import 'package:flutter/material.dart';

/// One activity from the bundled cards (APP-001): what you need with the
/// "I have this" checklist, the steps, safety, the stop note, the website
/// link, share and "Add to my plan" (APP-003). Card text is English, as on
/// the website. Nothing here counts, times or closes by itself.
class ActivityCardPage extends StatelessWidget {
  const new({
    required this.card,
    this.planStore = const PersonalPlanStore(),
    super.key,
  });

  final ActivityCard card;

  /// The saved personal plan the card can be added to. Replaceable in tests.
  final PersonalPlanStore planStore;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final theme = Theme.of(context);
    final flagLabels = [
      for (final flag in card.facts.safetyFlags) ?safetyFlagLabels[flag.wire],
    ];
    return Scaffold(
      appBar: AppBar(
        toolbarHeight: gmToolbarHeight(context),
        title: GmTitle(card.name),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(gmSpaceLg),
          children: [
            Text(card.summary, style: theme.textTheme.bodyLarge),
            const SizedBox(height: gmSpaceSm),
            Text(
              l10n.activityCardVersion(card.version),
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            Text(
              card.reviewed
                  ? l10n.activityCardReviewed
                  : l10n.activityCardNotReviewed,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: gmSpaceLg),
            MaterialsChecklist(activityId: card.id, materials: card.materials),
            const SizedBox(height: gmSpaceLg),
            Text(l10n.activityCardWhatToDo, style: theme.textTheme.titleMedium),
            const SizedBox(height: gmSpaceSm),
            for (var i = 0; i < card.steps.length; i++)
              Padding(
                padding: const EdgeInsets.only(bottom: gmSpaceSm),
                child: Text(
                  '${i + 1}. ${card.steps[i]}',
                  style: theme.textTheme.bodyLarge,
                ),
              ),
            const SizedBox(height: gmSpaceLg),
            Text(l10n.activityCardSafety, style: theme.textTheme.titleMedium),
            const SizedBox(height: gmSpaceSm),
            if (flagLabels.isNotEmpty) ...[
              Wrap(
                spacing: gmSpaceSm,
                runSpacing: gmSpaceSm,
                children: [
                  for (final label in flagLabels) Chip(label: Text(label)),
                ],
              ),
              const SizedBox(height: gmSpaceSm),
            ],
            for (final note in card.safety)
              Padding(
                padding: const EdgeInsets.only(bottom: gmSpaceSm),
                child: Text(note, style: theme.textTheme.bodyLarge),
              ),
            const SizedBox(height: gmSpaceLg),
            DecoratedBox(
              decoration: BoxDecoration(
                border: Border.all(color: theme.colorScheme.outline),
                borderRadius: BorderRadius.circular(gmRadiusMd),
              ),
              child: Padding(
                padding: const EdgeInsets.all(gmSpaceMd),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      l10n.activityCardStopHeading,
                      style: theme.textTheme.titleMedium,
                    ),
                    const SizedBox(height: gmSpaceSm),
                    Text(card.stopNote, style: theme.textTheme.bodyLarge),
                  ],
                ),
              ),
            ),
            if (card.crisisRoute) ...[
              const SizedBox(height: gmSpaceLg),
              const _CrisisRoutes(),
            ],
            const SizedBox(height: gmSpaceLg),
            _AddToPlan(card: card, store: planStore),
            const SizedBox(height: gmSpaceLg),
            ActivityGuideActions(
              activity: ActivityGuide(
                slug: card.slug,
                name: card.name,
                summary: card.summary,
              ),
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

/// Adds this card to the saved plan (APP-003). The plan is read again when
/// the button is pressed, so a change made elsewhere is never overwritten.
/// Full, already listed, no plan and unreadable plans say so calmly and
/// leave the saved record as it is.
class _AddToPlan extends StatefulWidget {
  const new({required this.card, required this.store});

  final ActivityCard card;
  final PersonalPlanStore store;

  @override
  State<_AddToPlan> createState() => _AddToPlanState();
}

enum _PlanOutcome { added, alreadyIn, full, needsPlan, unreadable, saveFailed }

class _AddToPlanState extends State<_AddToPlan> {
  _PlanOutcome? _outcome;

  Future<void> _add() async {
    final outcome = await _attemptAdd();
    if (!mounted) return;
    setState(() => _outcome = outcome);
  }

  Future<_PlanOutcome> _attemptAdd() async {
    final entry = PersonalPlan.cardEntry(widget.card.id);
    final read = await widget.store.load();
    if (!read.readable) return _PlanOutcome.unreadable;
    final plan = read.plan;
    if (plan == null) return _PlanOutcome.needsPlan;
    if (plan.activityIds.contains(entry)) return _PlanOutcome.alreadyIn;
    final next = plan.withActivity(entry);
    if (next == null) return _PlanOutcome.full;
    return await widget.store.save(next)
        ? _PlanOutcome.added
        : _PlanOutcome.saveFailed;
  }

  static String _message(BuildContext context, _PlanOutcome outcome) {
    final l10n = context.l10n;
    return switch (outcome) {
      _PlanOutcome.added => l10n.cardAddedToPlan,
      _PlanOutcome.alreadyIn => l10n.cardAlreadyInPlan,
      _PlanOutcome.full => l10n.cardPlanFull,
      _PlanOutcome.needsPlan => l10n.cardPlanNeedsPlan,
      _PlanOutcome.unreadable => l10n.cardPlanUnreadable,
      _PlanOutcome.saveFailed => l10n.planSaveFailed,
    };
  }

  @override
  Widget build(BuildContext context) {
    final outcome = _outcome;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        GmOutlineButton(label: context.l10n.cardAddToPlan, onTap: _add),
        if (outcome != null) ...[
          const SizedBox(height: gmSpaceSm),
          Semantics(
            liveRegion: true,
            child: Text(
              _message(context, outcome),
              style: Theme.of(context).textTheme.bodyLarge,
            ),
          ),
        ],
      ],
    );
  }
}

/// The website's crisis routes (WEB-061), in English. No "numbers checked"
/// date: no route has a recorded check yet.
class _CrisisRoutes extends StatelessWidget {
  const new();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return DecoratedBox(
      decoration: BoxDecoration(
        border: Border.all(color: theme.colorScheme.outline, width: 2),
        borderRadius: BorderRadius.circular(gmRadiusMd),
      ),
      child: Padding(
        padding: const EdgeInsets.all(gmSpaceMd),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(crisisHeading, style: theme.textTheme.titleMedium),
            const SizedBox(height: gmSpaceSm),
            Text(crisisIntro, style: theme.textTheme.bodyLarge),
            const SizedBox(height: gmSpaceSm),
            for (final route in crisisRoutes)
              Padding(
                padding: const EdgeInsets.only(bottom: gmSpaceSm),
                child: Text.rich(
                  TextSpan(
                    style: theme.textTheme.bodyLarge,
                    children: [
                      TextSpan(text: '${route.region}: ${route.lead} '),
                      if (route.emphasis case final emphasis?)
                        TextSpan(
                          text: emphasis,
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                      TextSpan(text: route.tail),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
