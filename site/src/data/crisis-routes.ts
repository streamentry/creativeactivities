/*
 * Crisis routes shown on the site (WEB-061, CNT-1003, L10N-009).
 *
 * A person checks each number against the service's own page (`source`) and then
 * updates `checked` to the date of that check. Numbers are never machine-translated
 * or guessed, and a route with no verified number is not added. Where a country has
 * no verified route, the text says "your local emergency services" and nothing more.
 *
 * `source: null` means no official page has been recorded yet for that route.
 * Each route is shown as: `region:` `lead` `emphasis` `tail`, so the emphasized
 * number or service is bold and the rest is plain text. Keep the wording as it is.
 */

export interface CrisisRoute {
  /** Where the route applies, as the reader sees it. */
  region: string;
  /** Service name, or null for the local emergency services line. */
  service: string | null;
  /** The number a reader calls or texts, or null when the route is an instruction. */
  number: string | null;
  kind: 'helpline' | 'emergency';
  /** Text shown before the bold part. */
  lead: string;
  /** Bold text shown after `lead`, or null when nothing is bold. */
  emphasis: string | null;
  /** Plain text shown after the bold part. */
  tail: string;
  /** Date (YYYY-MM-DD) a person last checked the number against `source`. */
  checked: string;
  /** The service's own page, or null when it is not recorded yet. */
  source: string | null;
}

export const CRISIS_ROUTES: readonly CrisisRoute[] = [
  {
    region: 'United States',
    service: '988 Suicide & Crisis Lifeline',
    number: '988',
    kind: 'helpline',
    lead: 'call or text',
    emphasis: '988',
    tail: ', 24 hours a day.',
    checked: '2026-11-15',
    // Cited in the page comment history as 988lifeline.org. Not recorded here yet:
    // every outside origin must first be listed in docs/specs/global/data-inventory.md (TSA-011).
    source: null,
  },
  {
    region: 'United Kingdom and Ireland',
    service: 'Samaritans',
    number: '116 123',
    kind: 'helpline',
    lead: 'call',
    emphasis: 'Samaritans on 116 123',
    tail: '. The call is free, day or night.',
    checked: '2026-11-15',
    // Cited as samaritans.org; not recorded here until data-inventory.md lists the origin.
    source: null,
  },
  {
    region: 'Anywhere else',
    service: null,
    number: null,
    kind: 'emergency',
    lead: 'contact your local emergency services.',
    emphasis: null,
    tail: '',
    checked: '2026-11-15',
    source: null,
  },
];

/** The date every route was last checked, as printed on the page ("Numbers checked on ..."). */
export const CRISIS_CHECKED_ON = CRISIS_ROUTES[0].checked;

/** The same routes in one line for printed cards (TSA-027). */
export const CRISIS_PRINT_LINE =
  'United States: call or text 988, 24 hours a day. United Kingdom and Ireland: Samaritans on 116 123, free, day or night. Anywhere else: local emergency services.';
