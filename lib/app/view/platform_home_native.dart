import 'dart:io';

import 'package:creative_activities/app/view/main_navigation.dart';
import 'package:creative_activities/features/gentle_activities/presentation/gentle_home_page.dart';
import 'package:flutter/widgets.dart';

/// The local-photo upgrade is initially supported on iOS and Android.
bool get usesGentleActivities => Platform.isIOS || Platform.isAndroid;

/// Preserve the existing desktop catalog until native photo flows are tested.
Widget buildPlatformHome() =>
    usesGentleActivities ? const GentleHomePage() : const MainNavigation();
