import 'dart:math';

import 'package:creative_activities/design_system.dart';
import 'package:creative_activities/features/gentle_activities/models/activity_picture.dart';
import 'package:creative_activities/features/gentle_activities/models/sort_board.dart';
import 'package:creative_activities/features/gentle_activities/presentation/picture_view.dart';
import 'package:creative_activities/l10n/l10n.dart';
import 'package:creative_activities/shared/widgets/gm_bottom_bar.dart';
import 'package:flutter/material.dart';

/// Experimental picture sorting (GM-010, GAME-017): choose a picture, then
/// tap the basket it belongs in. A wrong basket moves nothing and is named
/// gently; Undo takes back the last placement at any time. No clock, score,
/// penalty or automatic advance. The pictures are the bundled library only.
class PictureSortPage extends StatefulWidget {
  const new({required this.pictures, this.random, super.key});

  /// The bundled drawings the round may use. Family photos never reach here.
  final List<ActivityPicture> pictures;
  final Random? random;

  @override
  State<PictureSortPage> createState() => _PictureSortPageState();
}

/// The two groups, matching the website's Sort together theme of kitchen and
/// garden (site/src/data/pictures.ts). Basket 0 is the kitchen, 1 the garden.
const _kitchenIds = ['teacup', 'kettle', 'bread', 'frying-pan', 'cake'];
const _gardenIds = [
  'sunflower',
  'tulip',
  'watering-can',
  'potted-plant',
  'tree',
];

class _PictureSortPageState extends State<PictureSortPage> {
  late final Random _random = widget.random ?? Random();
  late SortBoard _board;
  String _message = '';
  final GmMoreBelow _moreBelow = GmMoreBelow();

  Map<String, ActivityPicture> get _byId => {
    for (final p in widget.pictures) p.id: p,
  };

  @override
  void initState() {
    super.initState();
    _start();
  }

  @override
  void dispose() {
    _moreBelow.dispose();
    super.dispose();
  }

  void _start() {
    final have = _byId.keys.toSet();
    _board = SortBoard.deal(
      first: _kitchenIds.where(have.contains).toList(),
      second: _gardenIds.where(have.contains).toList(),
      random: _random,
    );
    _message = '';
  }

  String _nameOf(String id) {
    final picture = _byId[id];
    return picture == null ? id : picture.localizedLabel(context.l10n);
  }

  String _basketName(int basket) => basket == 0
      ? context.l10n.sortBasketKitchen
      : context.l10n.sortBasketGarden;

  void _choose(String id) {
    final l10n = context.l10n;
    setState(() {
      _board.select(id);
      final chosen = _board.selected;
      _message = chosen == null ? '' : l10n.sortChosen(_nameOf(chosen));
    });
  }

  void _dropInto(int basket) {
    final l10n = context.l10n;
    final chosen = _board.selected;
    setState(() {
      final result = _board.drop(basket);
      _message = switch (result) {
        SortResult.placed =>
          _board.complete
              ? l10n.sortAllSorted
              : l10n.sortPlaced(_nameOf(chosen!), _basketName(basket)),
        SortResult.wrongBasket => l10n.sortNotThisBasket(
          _nameOf(chosen!),
          _basketName(_board.correctBasketOf(chosen)),
        ),
        SortResult.noneChosen => l10n.sortPickFirst,
      };
    });
  }

  void _undo() {
    final l10n = context.l10n;
    setState(() {
      _message = _board.undo() ? l10n.sortUndone : l10n.sortNothingToUndo;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = context.l10n;
    final complete = _board.complete;
    return Scaffold(
      appBar: AppBar(
        toolbarHeight: gmToolbarHeight(context),
        title: GmTitle(l10n.sortTitle),
      ),
      body: _moreBelow.watch(
        SafeArea(
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: gmContentMaxWidth),
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(gmSpaceLg),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      l10n.sortInstructions,
                      style: theme.textTheme.bodyLarge,
                    ),
                    const SizedBox(height: gmSpaceMd),
                    Semantics(
                      liveRegion: true,
                      child: Text(_message, style: theme.textTheme.bodyLarge),
                    ),
                    const SizedBox(height: gmSpaceLg),
                    Row(
                      children: [
                        Expanded(child: _basket(0)),
                        const SizedBox(width: gmTileGap),
                        Expanded(child: _basket(1)),
                      ],
                    ),
                    if (!complete) ...[
                      const SizedBox(height: gmSpaceLg),
                      Semantics(
                        header: true,
                        child: Text(
                          l10n.sortTray,
                          style: theme.textTheme.titleMedium,
                        ),
                      ),
                      const SizedBox(height: gmSpaceSm),
                      Wrap(
                        spacing: gmTileGap,
                        runSpacing: gmTileGap,
                        children: [for (final id in _board.tray) _trayTile(id)],
                      ),
                    ],
                    const SizedBox(height: gmSpaceLg),
                    OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size.fromHeight(gmTargetHero),
                      ),
                      onPressed: _undo,
                      icon: const Icon(Icons.undo),
                      label: Text(l10n.sortUndo),
                    ),
                    const SizedBox(height: gmSpaceSm),
                    // One filled button, only when the round is finished.
                    if (complete)
                      FilledButton(
                        style: FilledButton.styleFrom(
                          minimumSize: const Size.fromHeight(gmTargetHero),
                        ),
                        onPressed: () => setState(_start),
                        child: Text(l10n.sortNewPictures),
                      )
                    else
                      OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size.fromHeight(gmTargetHero),
                        ),
                        onPressed: () => setState(_start),
                        child: Text(l10n.sortNewPictures),
                      ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
      bottomNavigationBar: GmBottomBar(
        moreBelow: _moreBelow,
        child: OutlinedButton(
          style: OutlinedButton.styleFrom(
            minimumSize: const Size.fromHeight(gmTargetHero),
          ),
          onPressed: () => Navigator.of(context).pop(),
          child: Text(l10n.commonDoneForNow),
        ),
      ),
    );
  }

  Widget _basket(int basket) {
    final scheme = Theme.of(context).colorScheme;
    final l10n = context.l10n;
    final name = _basketName(basket);
    final inside = _board.basket(basket);
    return Semantics(
      button: true,
      label: name,
      value: l10n.sortBasketCount(inside.length),
      onTap: () => _dropInto(basket),
      child: ExcludeSemantics(
        child: Material(
          color: scheme.surface,
          shape: gmTileShape(scheme, emphasized: _board.selected != null),
          clipBehavior: Clip.antiAlias,
          child: InkWell(
            onTap: () => _dropInto(basket),
            child: ConstrainedBox(
              constraints: const BoxConstraints(minHeight: gmTargetHero * 2),
              child: Padding(
                padding: const EdgeInsets.all(gmSpaceMd),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      name,
                      style: Theme.of(context).textTheme.titleMedium,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: gmSpaceSm),
                    Wrap(
                      alignment: WrapAlignment.center,
                      spacing: gmSpaceXs,
                      runSpacing: gmSpaceXs,
                      children: [
                        for (final id in inside)
                          if (_byId[id] != null)
                            SizedBox.square(
                              dimension: gmTileMin,
                              child: PictureView(picture: _byId[id]!),
                            ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _trayTile(String id) {
    final scheme = Theme.of(context).colorScheme;
    final picture = _byId[id];
    if (picture == null) return const SizedBox.shrink();
    final chosen = _board.selected == id;
    final name = _nameOf(id);
    return Semantics(
      button: true,
      label: context.l10n.sortPictureInTray(name),
      value: chosen ? context.l10n.commonSelected : '',
      onTap: () => _choose(id),
      child: ExcludeSemantics(
        child: SizedBox.square(
          dimension: gmTileMin * 1.5,
          child: Material(
            color: scheme.surface,
            shape: gmTileShape(scheme, emphasized: chosen),
            clipBehavior: Clip.antiAlias,
            child: InkWell(
              onTap: () => _choose(id),
              child: PictureView(picture: picture),
            ),
          ),
        ),
      ),
    );
  }
}
