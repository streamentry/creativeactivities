/**
 * Finder choices in the query string (WEB-005). Only facet values are written:
 * never free text from the search box, never anything about the person. A
 * choice of "any" or nothing is left out, so the plain page keeps a plain address.
 */
import {
  ENERGY_CHOICES,
  FILTERABLE_FLAGS,
  GROUP_LABELS,
  MATERIAL_CHOICES,
  MESS_CHOICES,
  SENSE_CHOICES,
  SUPERVISION_CHOICES,
  TALKING_CHOICES,
  TIME_CHOICES,
  TYPE_LABELS,
  type ActivitySetting,
  type FinderChoice,
  type SafetyFlag,
} from './activities';

/** The settings the finder offers as radio buttons. */
export const FINDER_SETTINGS: readonly ActivitySetting[] = ['seated', 'bedside', 'outdoors'];

type ScalarKey = Exclude<keyof FinderChoice, 'avoid'>;

const notAny = (value: string) => value !== 'any';

/** The values each query key may carry, exactly the ones the form offers. */
const ALLOWED: Record<ScalarKey, readonly string[]> = {
  time: TIME_CHOICES.map((c) => c.value).filter(notAny),
  materials: MATERIAL_CHOICES.map((c) => c.value).filter(notAny),
  type: Object.keys(TYPE_LABELS),
  setting: FINDER_SETTINGS,
  group: Object.keys(GROUP_LABELS),
  mess: MESS_CHOICES.map((c) => c.value).filter(notAny),
  energy: ENERGY_CHOICES.map((c) => c.value).filter(notAny),
  sense: SENSE_CHOICES.map((c) => c.value).filter(notAny),
  talking: TALKING_CHOICES.map((c) => c.value).filter(notAny),
  supervision: SUPERVISION_CHOICES.map((c) => c.value).filter(notAny),
};

/** Query keys in the order they are written. The first three are the first-view questions. */
const SCALAR_KEYS = Object.keys(ALLOWED) as ScalarKey[];

/** The optional fit filters (WEB-001); three or more of them make a page noindex (WEB-005). */
const FIT_KEYS: readonly ScalarKey[] = ['setting', 'group', 'mess', 'energy', 'sense', 'talking', 'supervision'];

const keep = (values: readonly string[], allowed: readonly string[]): string[] =>
  allowed.filter((value) => values.includes(value));

/** The query string for a choice, without the leading "?". Empty when nothing is chosen. */
export function serializeFinderState(choice: FinderChoice): string {
  const params = new URLSearchParams();
  for (const key of SCALAR_KEYS) {
    const value = choice[key];
    if (value !== undefined && ALLOWED[key].includes(value)) params.set(key, value);
  }
  for (const flag of keep(choice.avoid ?? [], FILTERABLE_FLAGS)) params.append('avoid', flag);
  return params.toString();
}

/** A choice from a query string. Unknown keys, values and "any" are dropped. */
export function parseFinderState(search: string): FinderChoice {
  const params = new URLSearchParams(search);
  const choice: Record<string, string | string[]> = {};
  for (const key of SCALAR_KEYS) {
    const value = params.get(key);
    if (value !== null && ALLOWED[key].includes(value)) choice[key] = value;
  }
  const avoid = keep(params.getAll('avoid'), FILTERABLE_FLAGS as readonly SafetyFlag[]);
  if (avoid.length > 0) choice.avoid = avoid;
  return choice as FinderChoice;
}

/** How many optional fit filters are set. A safety-flag filter counts once. */
export function countFitFilters(choice: FinderChoice): number {
  const scalar = FIT_KEYS.filter((key) => {
    const value = choice[key];
    return value !== undefined && value !== 'any';
  }).length;
  return scalar + ((choice.avoid?.length ?? 0) > 0 ? 1 : 0);
}

/** Three or more fit filters at once are noindex; their canonical address is /activity/ (WEB-005). */
export function shouldNoindex(choice: FinderChoice): boolean {
  return countFitFilters(choice) >= 3;
}
