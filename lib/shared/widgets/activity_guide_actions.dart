import 'package:creative_activities/design_system.dart';
import 'package:creative_activities/l10n/l10n.dart';
import 'package:creative_activities/shared/links/activity_guide_link.dart';
import 'package:creative_activities/shared/sharing/activity_share_text.dart';
import 'package:flutter/material.dart';
import 'package:qr/qr.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

/// Opens [uri] in the system browser. Returns false when nothing opened.
typedef OpenGuideFn = Future<bool> Function(Uri uri);

/// Sends [text] through the system share sheet.
typedef ShareTextFn = Future<GuideShareOutcome> Function(String text);

/// What the share sheet reported. Cancelling is [dismissed] and is neutral.
enum GuideShareOutcome { shared, dismissed, failed }

/// The default browser launch: the system browser only, never an in-app view.
Future<bool> openActivityGuide(Uri uri) async {
  try {
    return await launchUrl(uri, mode: LaunchMode.externalApplication);
  } on Exception {
    return false;
  }
}

/// The default share: plain text through the system share sheet.
Future<GuideShareOutcome> shareActivityGuideText(String text) async {
  try {
    final result = await SharePlus.instance.share(ShareParams(text: text));
    return switch (result.status) {
      ShareResultStatus.success => GuideShareOutcome.shared,
      ShareResultStatus.dismissed => GuideShareOutcome.dismissed,
      ShareResultStatus.unavailable => GuideShareOutcome.failed,
    };
  } on Exception {
    return GuideShareOutcome.failed;
  }
}

/// Two quiet actions for one activity: the full guide on the website, and a
/// plain-text share. Nothing here counts, times or auto-closes.
///
/// If the browser does not open, the address and a QR code are shown on the
/// spot, so the page can still be reached without a network check.
class ActivityGuideActions extends StatefulWidget {
  const new({
    required this.activity,
    this.openGuide = openActivityGuide,
    this.shareText = shareActivityGuideText,
    super.key,
  });

  final ActivityGuide activity;
  final OpenGuideFn openGuide;
  final ShareTextFn shareText;

  @override
  State<ActivityGuideActions> createState() => _ActivityGuideActionsState();
}

class _ActivityGuideActionsState extends State<ActivityGuideActions> {
  bool _showAddress = false;
  bool _shareFailed = false;

  Future<void> _openGuide(Uri uri) async {
    var opened = false;
    try {
      opened = await widget.openGuide(uri);
    } on Exception {
      opened = false;
    }
    if (!mounted) return;
    setState(() => _showAddress = !opened);
  }

  Future<void> _share(String text) async {
    var outcome = GuideShareOutcome.failed;
    try {
      outcome = await widget.shareText(text);
    } on Exception {
      outcome = GuideShareOutcome.failed;
    }
    if (!mounted) return;
    setState(() => _shareFailed = outcome == GuideShareOutcome.failed);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final theme = Theme.of(context);
    final uri = activityGuideUri(widget.activity.slug);
    final text = activityShareText(widget.activity);
    if (uri == null || text == null) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        FilledButton(
          style: FilledButton.styleFrom(
            minimumSize: const Size.fromHeight(gmTargetPrimary),
          ),
          onPressed: () => _openGuide(uri),
          child: Text(l10n.activityGuideOpenFull),
        ),
        if (_showAddress) ...[
          const SizedBox(height: gmSpaceMd),
          Text(
            l10n.activityGuideCouldNotOpen,
            style: theme.textTheme.bodyLarge,
          ),
          const SizedBox(height: gmSpaceSm),
          _GuideAddress(uri: uri),
        ],
        const SizedBox(height: gmSpaceMd),
        OutlinedButton(
          style: OutlinedButton.styleFrom(
            minimumSize: const Size.fromHeight(gmTargetPrimary),
          ),
          onPressed: () => _share(text),
          child: Text(l10n.activityGuideShare),
        ),
        if (_shareFailed) ...[
          const SizedBox(height: gmSpaceSm),
          Text(l10n.activityGuideShareFailed, style: theme.textTheme.bodyLarge),
        ],
      ],
    );
  }
}

/// The address as selectable text, with its QR code drawn on this device.
class _GuideAddress extends StatelessWidget {
  const new({required this.uri});

  final Uri uri;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final theme = Theme.of(context);
    final address = uri.toString();
    final qr = _qrFor(address);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        SelectableText(address, style: theme.textTheme.bodyLarge),
        if (qr != null) ...[
          const SizedBox(height: gmSpaceSm),
          Center(
            child: Semantics(
              label: l10n.activityGuideQrSemantics,
              image: true,
              child: ExcludeSemantics(
                child: ColoredBox(
                  color: gmPaper,
                  child: Padding(
                    padding: const EdgeInsets.all(gmSpaceSm),
                    child: SizedBox.square(
                      dimension: 200,
                      child: CustomPaint(painter: _QrPainter(qr)),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ],
    );
  }
}

/// The QR image for [address], or null if it cannot be encoded.
QrImage? _qrFor(String address) {
  try {
    return QrImage(QrCode(payload: QrPayload.fromString(address)));
  } on InputTooLongException {
    return null;
  }
}

/// Paints dark modules on the paper colour. Light-on-dark codes scan poorly,
/// so the colours are fixed tokens in both themes.
class _QrPainter extends CustomPainter {
  const new(this.image);

  final QrImage image;

  @override
  void paint(Canvas canvas, Size size) {
    final count = image.moduleCount;
    final cell = size.width / count;
    final ink = Paint()..color = gmInk;
    for (var row = 0; row < count; row++) {
      for (var col = 0; col < count; col++) {
        if (image.isDark(row, col)) {
          canvas.drawRect(
            Rect.fromLTWH(col * cell, row * cell, cell, cell),
            ink,
          );
        }
      }
    }
  }

  @override
  bool shouldRepaint(_QrPainter oldDelegate) => oldDelegate.image != image;
}
