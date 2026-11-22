import 'dart:async';
import 'dart:math';

import 'package:creative_activities/data/models/sound_setting.dart';
import 'package:creative_activities/data/services/sound_service.dart';
import 'package:creative_activities/design_system.dart';
import 'package:creative_activities/l10n/l10n.dart';
import 'package:creative_activities/shared/widgets/gm_bottom_bar.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

/// Experimental keep-the-beat game (GAME-027). A steady beat keeps going
/// and the person taps the one large circle along with it. Taps are never
/// counted, timed or graded, nothing can be failed, and nothing ends the
/// game on its own. The whole game is one target, so a single switch can
/// use it. Beat sounds follow the app's sound setting, quiet by default.
class KeepTheBeatPage extends StatefulWidget {
  const new({
    this.beat = const Duration(milliseconds: 1000),
    this.playBeat,
    super.key,
  });

  /// Time between beats. Slow enough for a steady tap, never faster.
  final Duration beat;

  /// Plays one beat sound. Null plays the app's tap sound through
  /// [SoundService]; tests pass their own.
  final Future<void> Function()? playBeat;

  @override
  State<KeepTheBeatPage> createState() => _KeepTheBeatPageState();
}

class _KeepTheBeatPageState extends State<KeepTheBeatPage>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pulse = AnimationController(
    vsync: this,
    duration: widget.beat,
  );
  Timer? _timer;
  bool _started = false;
  final GmMoreBelow _moreBelow = GmMoreBelow();

  bool get _running => _timer != null;

  @override
  void dispose() {
    _timer?.cancel();
    _pulse.dispose();
    _moreBelow.dispose();
    super.dispose();
  }

  void _start() {
    _started = true;
    _pulse.repeat();
    _timer = Timer.periodic(widget.beat, (_) => unawaited(_sound()));
    setState(() {});
  }

  void _pause() {
    _timer?.cancel();
    _timer = null;
    _pulse.stop();
    setState(() {});
  }

  /// The one target: starts the beat when it is still, and sounds a beat
  /// (if sound is on) each time it is tapped while the beat runs.
  void _tap() {
    if (_running) {
      unawaited(_sound());
    } else {
      _start();
    }
  }

  /// Sounds one beat, only when the app's sound setting is on. Nothing is
  /// played after the page has gone.
  Future<void> _sound() async {
    if (!mounted) return;
    final settings = context.read<SoundSettings?>();
    if (settings == null || !settings.isSoundOn) return;
    await (widget.playBeat ?? SoundService().playTap)();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final l10n = context.l10n;
    // With reduced motion the circle stays still; the beat still sounds.
    final still = MediaQuery.disableAnimationsOf(context);
    final status = _running
        ? l10n.beatRunning
        : (_started ? l10n.beatPaused : l10n.beatTapToStart);
    return Scaffold(
      appBar: AppBar(
        toolbarHeight: gmToolbarHeight(context),
        title: GmTitle(l10n.beatTitle),
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
                      l10n.beatInstructions,
                      style: theme.textTheme.bodyLarge,
                    ),
                    const SizedBox(height: gmSpaceLg),
                    Center(
                      child: LayoutBuilder(
                        builder: (context, constraints) {
                          final side = min<double>(
                            300,
                            max<double>(
                              gmTargetHero * 3,
                              constraints.maxWidth * 0.8,
                            ),
                          );
                          return _target(scheme, side, still);
                        },
                      ),
                    ),
                    const SizedBox(height: gmSpaceMd),
                    // Visible words for sighted players; the target above
                    // already says the same to a screen reader.
                    ExcludeSemantics(
                      child: Text(
                        status,
                        style: theme.textTheme.bodyLarge,
                        textAlign: TextAlign.center,
                      ),
                    ),
                    if (_running) ...[
                      const SizedBox(height: gmSpaceLg),
                      OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size.fromHeight(gmTargetHero),
                        ),
                        onPressed: _pause,
                        child: Text(l10n.beatPause),
                      ),
                    ],
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

  Widget _target(ColorScheme scheme, double side, bool still) {
    final l10n = context.l10n;
    return AnimatedBuilder(
      animation: _pulse,
      // The circle swells on each beat and settles back, so the pulse is
      // visible without any words.
      builder: (context, child) => Transform.scale(
        scale: still ? 1 : 1 + 0.12 * (1 - _pulse.value),
        child: child,
      ),
      child: Semantics(
        button: true,
        label: _running ? l10n.beatTapOnBeat : l10n.beatTapToStart,
        onTap: _tap,
        child: ExcludeSemantics(
          child: SizedBox.square(
            dimension: side,
            child: Material(
              color: _running ? gmSage : scheme.surface,
              shape: CircleBorder(
                side: BorderSide(color: scheme.primary, width: 4),
              ),
              clipBehavior: Clip.antiAlias,
              child: InkWell(
                onTap: _tap,
                child: Center(
                  child: Icon(
                    Icons.music_note,
                    size: side * 0.36,
                    color: scheme.primary,
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
