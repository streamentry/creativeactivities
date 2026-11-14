/**
 * Activity cards: startable, printable activities to do together
 * (VISION.md › Each activity page should answer the entire task).
 * English-first: translation waits for cultural and safety review.
 */

export type ActivityType = 'art' | 'craft' | 'nature' | 'music' | 'sensory' | 'conversation';
export type ActivitySetting = 'tabletop' | 'seated' | 'bedside' | 'standing' | 'outdoors';
export type ActivityGroup = 'one-to-one' | 'small-group' | 'intergenerational';

/** The fields the finder and the at-a-glance line need. */
export interface ActivityFacts {
  type: ActivityType;
  prepMinutes: number;
  activityMinutes: readonly [number, number];
  cost: 'free' | 'low' | 'some';
  mess: 'none' | 'low' | 'medium';
  energy: 'low' | 'medium';
  supervision: 'nearby' | 'hands-on';
  settings: readonly ActivitySetting[];
  groups: readonly ActivityGroup[];
}

export const TYPE_LABELS: Record<ActivityType, string> = {
  art: 'Painting and drawing',
  craft: 'Making and crafts',
  nature: 'Plants and nature',
  music: 'Music',
  sensory: 'Touch and texture',
  conversation: 'Stories and talk',
};

export const SETTING_LABELS: Record<ActivitySetting, string> = {
  tabletop: 'at a table',
  seated: 'seated-friendly',
  bedside: 'bedside',
  standing: 'standing',
  outdoors: 'outdoors',
};

export const GROUP_LABELS: Record<ActivityGroup, string> = {
  'one-to-one': 'Two of you',
  'small-group': 'A small group',
  intergenerational: 'With grandchildren',
};

export const VARIATION_LABELS: Record<string, string> = {
  easier: 'Make it easier',
  'less-sensory': 'Less to see, hear or touch',
  seated: 'Seated',
  bedside: 'In bed or an armchair',
  'more-collaborative': 'More of a shared effort',
  'for-a-group': 'For a group',
  'with-children': 'With children',
  'low-vision': 'For low vision',
  nonverbal: 'Without words',
};

const COST: Record<ActivityFacts['cost'], string> = { free: 'free', low: 'low cost', some: 'some cost' };
const MESS: Record<ActivityFacts['mess'], string> = { none: 'no mess', low: 'little mess', medium: 'some mess' };

/** "15–30 min", or "20 min" when both ends match. */
export function minutesRange([min, max]: readonly [number, number]): string {
  return min === max ? `${min} min` : `${min}–${max} min`;
}

/** The at-a-glance line under the title (DESIGN.md › Signature experience). */
export function glance(a: ActivityFacts): string[] {
  const prep = a.prepMinutes === 0 ? 'no setup' : `${a.prepMinutes} min setup`;
  const where = a.settings.includes('seated') ? SETTING_LABELS.seated : SETTING_LABELS[a.settings[0]];
  return [prep, `${minutesRange(a.activityMinutes)} activity`, where, COST[a.cost]];
}

/** Full facts for the fact list: label and value pairs. */
export function factList(a: ActivityFacts): { label: string; value: string }[] {
  return [
    { label: 'Setup', value: a.prepMinutes === 0 ? 'None' : `About ${a.prepMinutes} minutes` },
    { label: 'Activity', value: minutesRange(a.activityMinutes).replace('min', 'minutes') },
    { label: 'Cost', value: capitalize(COST[a.cost]) },
    { label: 'Mess', value: capitalize(MESS[a.mess]) },
    { label: 'Energy', value: a.energy === 'low' ? 'Low, mostly sitting still' : 'Some moving about' },
    { label: 'Where', value: capitalize(a.settings.map((s) => SETTING_LABELS[s]).join(', ')) },
    { label: 'Help', value: a.supervision === 'nearby' ? 'Someone nearby' : 'Hands-on help' },
    { label: 'Who', value: capitalize(a.groups.map((g) => GROUP_LABELS[g].toLowerCase()).join(', ')) },
  ];
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Finder time choices: the activity's shortest run must fit. */
export const TIME_CHOICES = [
  { value: '15', label: 'About 15 minutes', max: 15 },
  { value: '30', label: 'Up to 30 minutes', max: 30 },
  { value: 'any', label: 'Any length', max: Infinity },
] as const;

export const MATERIAL_CHOICES = [
  { value: 'none', label: 'Nothing to buy', costs: ['free'] },
  { value: 'low', label: 'A few low-cost things', costs: ['free', 'low'] },
  { value: 'any', label: 'Any', costs: ['free', 'low', 'some'] },
] as const;

/** Optional fit filters (DESIGN.md › Finder filters: mess tolerance, energy). */
export const MESS_CHOICES = [
  { value: 'none', label: 'No mess at all', allows: ['none'] },
  { value: 'low', label: 'A little is fine', allows: ['none', 'low'] },
  { value: 'any', label: 'Any', allows: ['none', 'low', 'medium'] },
] as const;

export const ENERGY_CHOICES = [
  { value: 'low', label: 'Low: sitting still', allows: ['low'] },
  { value: 'any', label: 'Any', allows: ['low', 'medium'] },
] as const;

/** Optional fit filter (DESIGN.md › Finder filters: supervision). */
export const SUPERVISION_CHOICES = [
  { value: 'nearby', label: 'I can stay nearby, not help hands-on', allows: ['nearby'] },
  { value: 'any', label: 'Any', allows: ['nearby', 'hands-on'] },
] as const;

export interface FinderChoice {
  time?: string;
  materials?: string;
  type?: string;
  setting?: string;
  group?: string;
  mess?: string;
  energy?: string;
  supervision?: string;
}

const chosen = (value: string | undefined): value is string => value !== undefined && value !== 'any';

/** Whether an activity fits every choice made; "any" or unset never filters. */
export function matches(a: ActivityFacts, c: FinderChoice): boolean {
  const time = TIME_CHOICES.find((t) => t.value === c.time);
  if (time && a.activityMinutes[0] > time.max) return false;
  const materials = MATERIAL_CHOICES.find((m) => m.value === c.materials);
  if (materials && !(materials.costs as readonly string[]).includes(a.cost)) return false;
  if (chosen(c.type) && a.type !== c.type) return false;
  if (chosen(c.setting) && !a.settings.includes(c.setting as ActivitySetting)) return false;
  if (chosen(c.group) && !a.groups.includes(c.group as ActivityGroup)) return false;
  const mess = MESS_CHOICES.find((m) => m.value === c.mess);
  if (mess && !(mess.allows as readonly string[]).includes(a.mess)) return false;
  const energy = ENERGY_CHOICES.find((e) => e.value === c.energy);
  if (energy && !(energy.allows as readonly string[]).includes(a.energy)) return false;
  const supervision = SUPERVISION_CHOICES.find((s) => s.value === c.supervision);
  if (supervision && !(supervision.allows as readonly string[]).includes(a.supervision)) return false;
  return true;
}

/**
 * Why a shown activity fits the choices made, in plain words (DESIGN.md ›
 * results explain why this fits). Only choices other than "any" produce a reason.
 */
export function fitReasons(a: ActivityFacts, c: FinderChoice): string[] {
  const reasons: string[] = [];
  const time = TIME_CHOICES.find((t) => t.value === c.time);
  if (time && Number.isFinite(time.max)) reasons.push(`can start in under ${time.max} minutes`);
  if (chosen(c.materials)) reasons.push(a.cost === 'free' ? 'nothing to buy' : 'needs only low-cost things');
  if (chosen(c.setting)) {
    reasons.push(c.setting === 'seated' ? 'works seated' : `works ${SETTING_LABELS[c.setting as ActivitySetting]}`);
  }
  if (chosen(c.mess)) reasons.push(a.mess === 'none' ? 'no mess' : 'little or no mess');
  if (chosen(c.energy)) reasons.push('mostly sitting still');
  if (chosen(c.supervision)) reasons.push('works with you nearby');
  return reasons;
}
