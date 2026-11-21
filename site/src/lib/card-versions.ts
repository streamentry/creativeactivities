/**
 * Card version rule (PLAT-007). Pure comparison logic: the caller passes each
 * card's frontmatter before and after a change, and gets back the problems.
 * scripts/check-card-versions.mjs reads the files from git; tests pass fixtures.
 *
 * Rules, per card id present in both sets:
 * - A content change (steps, materials, safety, stopNote or variations) needs a
 *   version above the base, and at least one `changes` entry that the base does not have.
 * - A version change with no content change is a problem.
 * - A base card with no `version` counts as version 1, the version every card starts at.
 * - Every current card must have a whole-number version of at least 1.
 */

/** The fields whose change requires a version bump. Other fields (pictures, plain steps, flags) are not listed. */
export const CONTENT_FIELDS = ['steps', 'materials', 'safety', 'stopNote', 'variations'] as const;

/** The version a card has when its base has none. Every card starts at 1 (PLAT-007). */
export const STARTING_VERSION = 1;

export interface ChangeEntry {
  date: unknown;
  safety?: unknown;
  note?: unknown;
}

/** The frontmatter fields this rule reads. Other fields are ignored. */
export interface VersionedCard {
  version?: unknown;
  steps?: unknown;
  materials?: unknown;
  safety?: unknown;
  stopNote?: unknown;
  variations?: unknown;
  changes?: unknown;
  [field: string]: unknown;
}

export interface VersionProblem {
  id: string;
  message: string;
}

export interface VersionReport {
  problems: VersionProblem[];
  /** Cards on both sides with a content change, and the number of those with a version bump. */
  contentChanges: number;
  bumps: number;
  /** Cards only on the current side. They need a valid version but have no base to compare. */
  added: string[];
  /** Cards only on the base side. They are not checked. */
  removed: string[];
}

/** JSON with object keys sorted at every level, so equal content always gives equal text. */
export function canonical(value: unknown): string {
  return JSON.stringify(value, (_key, item: unknown) => {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      return Object.fromEntries(Object.entries(item as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
    }
    return item;
  });
}

/** The content fields that differ between the base and the current card. */
export function changedContentFields(base: VersionedCard, current: VersionedCard): string[] {
  return CONTENT_FIELDS.filter((field) => canonical(base[field]) !== canonical(current[field]));
}

/** The card's version, or the starting version when the base has none. */
export function versionOf(card: VersionedCard): number {
  return card.version === undefined ? STARTING_VERSION : (card.version as number);
}

/** Whether the value is a whole number of at least 1. */
export function isValidVersion(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= STARTING_VERSION;
}

/** Entries in the current changes log that the base log does not have (compared as text). */
export function newChangeEntries(base: VersionedCard, current: VersionedCard): ChangeEntry[] {
  const before = new Set(asEntries(base.changes).map((entry) => canonical(entry)));
  return asEntries(current.changes).filter((entry) => !before.has(canonical(entry)));
}

function asEntries(value: unknown): ChangeEntry[] {
  return Array.isArray(value) ? (value as ChangeEntry[]) : [];
}

/** Checks every card against its base. `base` and `current` map card id to frontmatter. */
export function checkCardVersions(
  base: ReadonlyMap<string, VersionedCard>,
  current: ReadonlyMap<string, VersionedCard>,
): VersionReport {
  const problems: VersionProblem[] = [];
  let contentChanges = 0;
  let bumps = 0;
  const added: string[] = [];

  for (const [id, card] of [...current].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
    if (!isValidVersion(card.version)) {
      problems.push({ id, message: `version must be a whole number of at least ${STARTING_VERSION}, found ${canonical(card.version)}` });
    }
    const was = base.get(id);
    if (!was) {
      added.push(id);
      continue;
    }
    const baseVersion = versionOf(was);
    const currentVersion = versionOf(card);
    const fields = changedContentFields(was, card);
    if (fields.length > 0) {
      contentChanges += 1;
      if (currentVersion > baseVersion) bumps += 1;
      if (currentVersion <= baseVersion) {
        problems.push({
          id,
          message: `${fields.join(', ')} changed but version is ${currentVersion}, not above the base version ${baseVersion}`,
        });
      }
      if (newChangeEntries(was, card).length === 0) {
        problems.push({ id, message: `${fields.join(', ')} changed but the changes log has no new entry` });
      }
    } else if (currentVersion !== baseVersion) {
      problems.push({
        id,
        message: `version changed from ${baseVersion} to ${currentVersion} with no change to ${CONTENT_FIELDS.join(', ')}`,
      });
    }
  }

  const removed = [...base.keys()].filter((id) => !current.has(id)).sort();
  return { problems, contentChanges, bumps, added, removed };
}
