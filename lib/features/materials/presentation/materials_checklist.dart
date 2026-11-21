import 'dart:async';

import 'package:creative_activities/design_system.dart';
import 'package:creative_activities/features/materials/data/material_ticks.dart';
import 'package:creative_activities/l10n/l10n.dart';
import 'package:flutter/material.dart';

/// "I have this" ticks for one activity's materials, saved on this device.
/// It contains no shopping or product links. When every material is ticked
/// it says so; it never recommends buying anything.
class MaterialsChecklist extends StatefulWidget {
  const new({
    required this.activityId,
    required this.materials,
    this.store = const MaterialTicksStore(),
    super.key,
  });

  final String activityId;

  /// The activity's materials, in the order the card lists them.
  final List<String> materials;
  final MaterialTicksStore store;

  @override
  State<MaterialsChecklist> createState() => _MaterialsChecklistState();
}

class _MaterialsChecklistState extends State<MaterialsChecklist> {
  Set<String>? _ticked;
  bool _readable = true;
  bool _writeFailed = false;

  @override
  void initState() {
    super.initState();
    unawaited(_load());
  }

  @override
  void didUpdateWidget(covariant MaterialsChecklist oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.activityId != widget.activityId) unawaited(_load());
  }

  Future<void> _load() async {
    final ticks = await widget.store.load();
    if (!mounted) return;
    setState(() {
      _readable = ticks.readable;
      _ticked = ticks.ticksFor(widget.activityId);
    });
  }

  Future<void> _set(String material, bool ticked) async {
    final ok = await widget.store.setTicked(
      activityId: widget.activityId,
      material: material,
      ticked: ticked,
    );
    if (!mounted) return;
    setState(() => _writeFailed = !ok);
    if (ok) await _load();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final theme = Theme.of(context);
    final ticked = _ticked;
    if (ticked == null) return const SizedBox.shrink();
    final allReady =
        widget.materials.isNotEmpty && widget.materials.every(ticked.contains);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(l10n.materialsHeading, style: theme.textTheme.titleMedium),
        const SizedBox(height: gmSpaceSm),
        if (!_readable) ...[
          Text(l10n.materialsUnreadable, style: theme.textTheme.bodyLarge),
          const SizedBox(height: gmSpaceSm),
        ],
        if (_writeFailed) ...[
          Text(l10n.materialsSaveFailed, style: theme.textTheme.bodyLarge),
          const SizedBox(height: gmSpaceSm),
        ],
        for (final material in widget.materials)
          CheckboxListTile(
            value: ticked.contains(material),
            // Ticks cannot change while the saved record is unreadable.
            onChanged: _readable
                ? (value) => unawaited(_set(material, value ?? false))
                : null,
            controlAffinity: ListTileControlAffinity.leading,
            title: Text(material, style: theme.textTheme.bodyLarge),
            subtitle: Text(
              ticked.contains(material)
                  ? l10n.materialsIHaveThis
                  : l10n.materialsNeedToGet,
            ),
          ),
        if (allReady) ...[
          const SizedBox(height: gmSpaceSm),
          DecoratedBox(
            decoration: BoxDecoration(
              color: gmTealPale,
              border: Border.all(color: gmTealOutline),
              borderRadius: BorderRadius.circular(gmRadiusMd),
            ),
            child: Padding(
              padding: const EdgeInsets.all(gmSpaceMd),
              child: Text(
                l10n.materialsAllReady,
                style: theme.textTheme.bodyLarge,
              ),
            ),
          ),
        ],
      ],
    );
  }
}
