import 'package:creative_activities/features/home/cubit/home_cubit.dart';
import 'package:creative_activities/features/home/cubit/home_state.dart';
import 'package:creative_activities/features/home/presentation/screens/home_page.dart';
import 'package:creative_activities/l10n/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';

class _LoadedHome extends HomeCubit {
  new() {
    emit(const HomeState(status: HomeStatus.loaded, preferencesReady: true));
  }
}

void main() {
  testWidgets('home renders the game catalog sections', (tester) async {
    final cubit = _LoadedHome();
    addTearDown(cubit.close);
    await tester.pumpWidget(
      MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        home: BlocProvider<HomeCubit>.value(
          value: cubit,
          child: const HomeView(),
        ),
      ),
    );
    expect(find.text('Creative Activities'), findsOneWidget);
    expect(find.text('Suggested packs'), findsOneWidget);
    expect(find.text('Browse by topic'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
