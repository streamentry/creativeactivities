import 'dart:async';

import 'package:creative_activities/app/app.dart';
import 'package:creative_activities/bootstrap.dart';

void main() {
  unawaited(bootstrap(() => const App()));
}
