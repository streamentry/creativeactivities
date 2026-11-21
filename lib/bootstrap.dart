import 'dart:async';
import 'dart:developer';

import 'package:bloc/bloc.dart';
import 'package:creative_activities/app/view/platform_home.dart';
import 'package:creative_activities/data/models/sound_setting.dart';
import 'package:creative_activities/data/services/sound_service.dart';
import 'package:creative_activities/features/gentle_activities/data/bedside_setting.dart';
import 'package:creative_activities/features/gentle_activities/data/gentle_preferences.dart';
import 'package:creative_activities/features/gentle_activities/data/high_contrast_setting.dart';
import 'package:creative_activities/l10n/app_language.dart';
import 'package:creative_activities/l10n/l10n.dart';
import 'package:flutter/widgets.dart';
import 'package:provider/provider.dart';

class AppBlocObserver extends BlocObserver {
  const new();

  @override
  void onError(BlocBase<dynamic> bloc, Object error, StackTrace stackTrace) {
    // Avoid state dumps and user-provided photo paths or identifiers.
    log('State error in ${bloc.runtimeType}', stackTrace: stackTrace);
    super.onError(bloc, error, stackTrace);
  }
}

Future<void> bootstrap(FutureOr<Widget> Function() builder) async {
  WidgetsFlutterBinding.ensureInitialized();
  FlutterError.onError = FlutterError.presentError;
  Bloc.observer = const AppBlocObserver();

  final soundSettings = SoundSettings();
  try {
    await soundSettings.load();
  } on Object {
    log('Using default local sound settings.');
  }

  // Sound uses bundled files and is optional. No CDN request
  // or pack download may gate the first frame of the bundled catalog.
  if (!usesGentleActivities) {
    try {
      await SoundService().initialize(soundSettings);
    } on Object {
      log('Optional sound initialization unavailable.');
    }
  }

  // The saved language choice, if any, is in effect from the first frame.
  // A preference that cannot be read means following the device.
  Locale? savedLanguage;
  try {
    savedLanguage = await const AppLanguageStore().load(
      AppLocalizations.supportedLocales,
    );
  } on Object {
    log('Using the device language.');
  }

  // The saved comfort choices that the theme reads: higher contrast and the
  // bedside theme. A preference that cannot be read means the defaults.
  final savedComfort = await const GentlePreferencesStore().load();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => soundSettings),
        ChangeNotifierProvider(
          create: (_) => AppLanguage(initial: savedLanguage),
        ),
        ChangeNotifierProvider(
          create: (_) =>
              HighContrastSetting(initial: savedComfort.highContrast),
        ),
        ChangeNotifierProvider(
          create: (_) => BedsideSetting(initial: savedComfort.bedside),
        ),
      ],
      child: await builder(),
    ),
  );
}
