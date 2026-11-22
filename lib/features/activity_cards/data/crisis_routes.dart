/// The crisis routes shown on cards that invite talk about feelings or grief
/// (WEB-061). A copy of site/src/data/crisis-routes.ts; the site test
/// `src/lib/app-parity.test.ts` fails if the wording drifts.
///
/// The app shows no "Numbers checked on" date: no route has a recorded check
/// and source yet (decision 2026-11-22). Text is English only and is never
/// machine-translated, as on the website.
library;

class CrisisRoute {
  const new({
    required this.region,
    required this.lead,
    required this.tail,
    this.emphasis,
  });

  /// Where the route applies, as the reader sees it.
  final String region;

  /// Text shown before the bold part.
  final String lead;

  /// Bold text shown after [lead], or null when nothing is bold.
  final String? emphasis;

  /// Plain text shown after the bold part.
  final String tail;
}

const crisisIntro =
    'If you are thinking about ending your life, hurting yourself, or you '
    'feel unsafe right now, contact someone today. You do not need to '
    'explain why first.';

const crisisHeading = 'If you are in crisis';

const crisisRoutes = <CrisisRoute>[
  CrisisRoute(
    region: 'United States',
    lead: 'call or text',
    emphasis: '988',
    tail: ', 24 hours a day.',
  ),
  CrisisRoute(
    region: 'United Kingdom and Ireland',
    lead: 'call',
    emphasis: 'Samaritans on 116 123',
    tail: '. The call is free, day or night.',
  ),
  CrisisRoute(
    region: 'Anywhere else',
    lead: 'contact your local emergency services.',
    tail: '',
  ),
];
