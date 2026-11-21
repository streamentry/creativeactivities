import 'package:creative_activities/design_system.dart';
import 'package:creative_activities/features/activity_cards/data/activity_catalog.dart';
import 'package:creative_activities/features/activity_cards/presentation/activity_card_page.dart';
import 'package:creative_activities/features/finder/presentation/finder_page.dart';
import 'package:creative_activities/l10n/l10n.dart';
import 'package:flutter/material.dart';

/// Find an activity (APP-005) over the cards bundled in the app (APP-001).
/// Reads the bundled file once. If the file is unreadable, it says so calmly
/// and the rest of the app keeps working.
class FindActivityPage extends StatefulWidget {
  const new({this.store = const ActivityCatalogStore(), super.key});

  final ActivityCatalogStore store;

  @override
  State<FindActivityPage> createState() => _FindActivityPageState();
}

class _FindActivityPageState extends State<FindActivityPage> {
  late final Future<ActivityCatalogResult> _loaded = widget.store.load();

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return FutureBuilder<ActivityCatalogResult>(
      future: _loaded,
      builder: (context, snapshot) {
        final result = snapshot.data;
        if (result case CatalogLoaded(:final catalog)) {
          return FinderPage(
            cards: catalog.finderCards,
            onOpen: (id) {
              final card = catalog.byId(id);
              if (card == null) return;
              Navigator.of(context).push(
                MaterialPageRoute<void>(
                  builder: (_) => ActivityCardPage(card: card),
                ),
              );
            },
          );
        }
        return Scaffold(
          appBar: AppBar(
            toolbarHeight: gmToolbarHeight(context),
            title: GmTitle(l10n.menuFindActivity),
          ),
          body: result is CatalogUnavailable
              ? SafeArea(
                  child: ListView(
                    padding: const EdgeInsets.all(gmSpaceLg),
                    children: [
                      Text(
                        l10n.activityCardsUnavailable,
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                      const SizedBox(height: gmSpaceLg),
                      GmOutlineButton(
                        label: l10n.commonDoneForNow,
                        onTap: () => Navigator.of(context).maybePop(),
                      ),
                    ],
                  ),
                )
              : const SizedBox.shrink(),
        );
      },
    );
  }
}
