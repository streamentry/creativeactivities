import 'dart:async';

import 'package:creative_activities/data/models/pack.dart';
import 'package:creative_activities/data/services/local_pack_service.dart';
import 'package:creative_activities/design_system.dart';
import 'package:creative_activities/features/plan/data/personal_plan.dart';
import 'package:creative_activities/l10n/l10n.dart';
import 'package:creative_activities/l10n/pack_text.dart';
import 'package:flutter/material.dart';

/// Loads the activities a plan can refer to. Injected in tests.
typedef LoadPacks = Future<List<Pack>> Function();

/// A short personal plan of up to five activities, kept on this device.
/// The person names it, chooses activities, and deletes it when they like.
/// A saved plan that cannot be read is shown as such and is not changed
/// unless the person starts a new plan.
class PersonalPlanPage extends StatefulWidget {
  const new({
    this.store = const PersonalPlanStore(),
    this.loadPacks,
    super.key,
  });

  final PersonalPlanStore store;
  final LoadPacks? loadPacks;

  @override
  State<PersonalPlanPage> createState() => _PersonalPlanPageState();
}

class _PersonalPlanPageState extends State<PersonalPlanPage> {
  PersonalPlanRead? _read;
  List<Pack> _packs = const [];
  bool _editing = false;
  bool _saveFailed = false;
  String? _nameError;

  final _name = TextEditingController();
  final _note = TextEditingController();

  @override
  void initState() {
    super.initState();
    unawaited(_load());
  }

  @override
  void dispose() {
    _name.dispose();
    _note.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    final read = await widget.store.load();
    final packs = await (widget.loadPacks ?? LocalPackService().getPacks)();
    if (!mounted) return;
    setState(() {
      _read = read;
      _packs = packs;
    });
  }

  PersonalPlan? get _plan => _read?.plan;

  void _startEditing() {
    final plan = _plan;
    _name.text = plan?.title ?? '';
    _note.text = plan?.note ?? '';
    setState(() {
      _editing = true;
      _nameError = null;
      _saveFailed = false;
    });
  }

  /// Writes [plan] and shows it, or shows that the device refused the write.
  Future<void> _write(PersonalPlan plan) async {
    final ok = await widget.store.save(plan);
    if (!mounted) return;
    setState(() {
      _saveFailed = !ok;
      if (ok) {
        _read = PersonalPlanRead(plan: plan);
        _editing = false;
      }
    });
  }

  Future<void> _saveDetails() async {
    final l10n = context.l10n;
    final title = _name.text.trim();
    if (title.isEmpty) {
      setState(() => _nameError = l10n.planNameRequired);
      return;
    }
    final current = _plan ?? const PersonalPlan(title: '');
    await _write(
      current.copyWith(
        title: _clip(title, PersonalPlan.maxTitle),
        note: _clip(_note.text.trim(), PersonalPlan.maxNote),
      ),
    );
  }

  static String _clip(String text, int max) =>
      text.length > max ? text.substring(0, max) : text;

  Future<void> _addActivity() async {
    final plan = _plan;
    if (plan == null) return;
    final id = await Navigator.of(context).push<String>(
      MaterialPageRoute(
        builder: (_) => _PickActivityPage(
          packs: _packs,
          alreadyIn: plan.activityIds.toSet(),
        ),
      ),
    );
    if (!mounted || id == null) return;
    final next = plan.withActivity(id);
    if (next != null) await _write(next);
  }

  Future<void> _removeActivity(String id) async {
    final plan = _plan;
    if (plan == null) return;
    await _write(plan.withoutActivity(id));
  }

  Future<bool> _confirm({
    required String title,
    required String body,
    required String confirm,
  }) async {
    final l10n = context.l10n;
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(body),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(l10n.commonCancel),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text(confirm),
          ),
        ],
      ),
    );
    return ok == true;
  }

  Future<void> _deletePlan() async {
    final l10n = context.l10n;
    final ok = await _confirm(
      title: l10n.planDeleteTitle,
      body: l10n.planDeleteBody,
      confirm: l10n.planDeleteConfirm,
    );
    if (!ok || !mounted) return;
    await widget.store.clear();
    if (!mounted) return;
    setState(() {
      _read = const PersonalPlanRead();
      _editing = false;
    });
  }

  Future<void> _startNew() async {
    final l10n = context.l10n;
    final ok = await _confirm(
      title: l10n.planStartNewTitle,
      body: l10n.planStartNewBody,
      confirm: l10n.planStartNewConfirm,
    );
    if (!ok || !mounted) return;
    await widget.store.clear();
    if (!mounted) return;
    setState(() => _read = const PersonalPlanRead());
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Scaffold(
      appBar: AppBar(
        toolbarHeight: gmToolbarHeight(context),
        title: GmTitle(l10n.planTitle),
      ),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: gmContentMaxWidth),
            child: _read == null
                ? const Center(child: CircularProgressIndicator())
                : ListView(
                    padding: const EdgeInsets.all(gmSpaceLg),
                    children: _children(context),
                  ),
          ),
        ),
      ),
    );
  }

  List<Widget> _children(BuildContext context) {
    final l10n = context.l10n;
    final read = _read!;
    if (!read.readable) {
      return [
        Text(l10n.planUnreadable, style: _body(context)),
        const SizedBox(height: gmSpaceLg),
        GmOutlineButton(label: l10n.planStartNew, onTap: _startNew),
        const SizedBox(height: gmSpaceLg),
        _doneForNow(context),
      ];
    }
    final plan = read.plan;
    if (_editing) return _form(context);
    if (plan == null) {
      return [
        Text(l10n.planIntro, style: _body(context)),
        const SizedBox(height: gmSpaceLg),
        GmPrimaryButton(label: l10n.planMake, onTap: _startEditing),
        const SizedBox(height: gmSpaceLg),
        _doneForNow(context),
      ];
    }
    return _planView(context, plan);
  }

  List<Widget> _form(BuildContext context) {
    final l10n = context.l10n;
    return [
      TextField(
        controller: _name,
        maxLength: PersonalPlan.maxTitle,
        buildCounter: _noCounter,
        decoration: InputDecoration(
          labelText: l10n.planNameLabel,
          errorText: _nameError,
        ),
      ),
      const SizedBox(height: gmSpaceMd),
      TextField(
        controller: _note,
        maxLength: PersonalPlan.maxNote,
        maxLines: 3,
        buildCounter: _noCounter,
        decoration: InputDecoration(labelText: l10n.planNoteLabel),
      ),
      const SizedBox(height: gmSpaceLg),
      GmPrimaryButton(label: l10n.planSave, onTap: _saveDetails),
      const SizedBox(height: gmSpaceSm),
      GmOutlineButton(
        label: l10n.commonCancel,
        onTap: () => setState(() {
          _editing = false;
          _nameError = null;
          _saveFailed = false;
        }),
      ),
      if (_saveFailed) ...[
        const SizedBox(height: gmSpaceMd),
        Text(l10n.planSaveFailed, style: _body(context)),
      ],
    ];
  }

  List<Widget> _planView(BuildContext context, PersonalPlan plan) {
    final l10n = context.l10n;
    final theme = Theme.of(context);
    final byId = {for (final p in _packs) p.id: p};
    return [
      if (_saveFailed) ...[
        Text(l10n.planSaveFailed, style: _body(context)),
        const SizedBox(height: gmSpaceMd),
      ],
      Text(plan.title, style: theme.textTheme.headlineSmall),
      if (plan.note.isNotEmpty) ...[
        const SizedBox(height: gmSpaceSm),
        Text(plan.note, style: _body(context)),
      ],
      const SizedBox(height: gmSpaceLg),
      if (plan.activityIds.isEmpty)
        Text(l10n.planNoActivities, style: _body(context))
      else
        for (final id in plan.activityIds)
          _ActivityRow(
            name: byId[id] == null
                ? null
                : context.packText.packTitle(byId[id]!),
            onRemove: () => _removeActivity(id),
          ),
      const SizedBox(height: gmSpaceLg),
      if (plan.isFull)
        Text(l10n.planFullMessage, style: _body(context))
      else
        GmPrimaryButton(label: l10n.planAddActivity, onTap: _addActivity),
      const SizedBox(height: gmSpaceSm),
      GmOutlineButton(label: l10n.planEditDetails, onTap: _startEditing),
      const SizedBox(height: gmSpaceSm),
      GmOutlineButton(label: l10n.planDelete, onTap: _deletePlan),
      const SizedBox(height: gmSpaceLg),
      Text(l10n.planPrivacy, style: _body(context)),
      const SizedBox(height: gmSpaceLg),
      _doneForNow(context),
    ];
  }

  Widget _doneForNow(BuildContext context) => GmOutlineButton(
    label: context.l10n.commonDoneForNow,
    onTap: () => Navigator.of(context).maybePop(),
  );

  TextStyle? _body(BuildContext context) =>
      Theme.of(context).textTheme.bodyLarge;

  static Widget? _noCounter(
    BuildContext context, {
    required int currentLength,
    required bool isFocused,
    required int? maxLength,
  }) => null;
}

/// One activity in the plan, with its own remove button.
class _ActivityRow extends StatelessWidget {
  const new({required this.name, required this.onRemove});

  /// Null when the activity is no longer in the app.
  final String? name;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final theme = Theme.of(context);
    final label = name ?? l10n.planActivityMissing;
    return Padding(
      padding: const EdgeInsets.only(bottom: gmSpaceSm),
      child: Row(
        children: [
          Expanded(child: Text(label, style: theme.textTheme.bodyLarge)),
          Semantics(
            label: name == null
                ? l10n.planRemoveActivity
                : l10n.planRemoveActivityNamed(name!),
            child: OutlinedButton(
              onPressed: onRemove,
              child: Text(l10n.planRemoveActivity),
            ),
          ),
        ],
      ),
    );
  }
}

/// Lists activities; the activities already in the plan cannot be chosen
/// again. Pops with the chosen activity id.
class _PickActivityPage extends StatelessWidget {
  const new({required this.packs, required this.alreadyIn});

  final List<Pack> packs;
  final Set<String> alreadyIn;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Scaffold(
      appBar: AppBar(
        toolbarHeight: gmToolbarHeight(context),
        title: GmTitle(l10n.planPickTitle),
      ),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: gmContentMaxWidth),
            child: ListView(
              padding: const EdgeInsets.all(gmSpaceLg),
              children: [
                for (final pack in packs)
                  ListTile(
                    title: Text(context.packText.packTitle(pack)),
                    subtitle: alreadyIn.contains(pack.id)
                        ? Text(l10n.planAlreadyAdded)
                        : null,
                    enabled: !alreadyIn.contains(pack.id),
                    minVerticalPadding: gmSpaceSm,
                    onTap: () => Navigator.of(context).pop(pack.id),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
