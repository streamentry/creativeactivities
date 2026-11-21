import { readFileSync, readdirSync } from 'node:fs';
import type { FacetCard, FacetHub } from './facets.ts';
import { splitFrontmatter } from './yaml-subset.ts';

/** Reads card and hub frontmatter into the plain shapes facets.ts evaluates. Throws on a missing or mistyped field. */

function fail(file: string, field: string): never {
  throw new Error(`facet-inputs: ${file} has no usable "${field}"`);
}

function text(fm: Record<string, unknown>, field: string, file: string): string {
  const value = fm[field];
  return typeof value === 'string' ? value : fail(file, field);
}

function num(fm: Record<string, unknown>, field: string, file: string): number {
  const value = fm[field];
  return typeof value === 'number' ? value : fail(file, field);
}

function strings(fm: Record<string, unknown>, field: string, file: string): string[] {
  const value = fm[field];
  if (Array.isArray(value) && value.every((item): item is string => typeof item === 'string')) return value;
  return fail(file, field);
}

function minutes(fm: Record<string, unknown>, file: string): [number, number] {
  const value = fm.activityMinutes;
  if (Array.isArray(value) && value.length === 2 && value.every((n): n is number => typeof n === 'number')) {
    return [value[0], value[1]];
  }
  return fail(file, 'activityMinutes');
}

/** One card from its parsed frontmatter. `withdrawn` is set when the block is present. */
export function cardFromFrontmatter(id: string, fm: Record<string, unknown>): FacetCard {
  const file = `${id}.md`;
  return {
    id,
    withdrawn: fm.withdrawn !== undefined,
    settings: strings(fm, 'settings', file),
    groups: strings(fm, 'groups', file),
    activityMinutes: minutes(fm, file),
    prepMinutes: num(fm, 'prepMinutes', file),
    mess: text(fm, 'mess', file),
    cost: text(fm, 'cost', file),
    energy: text(fm, 'energy', file),
    supervision: text(fm, 'supervision', file),
  };
}

/** Every card file in a folder, sorted by key. */
export function loadFacetCards(dir: URL): FacetCard[] {
  return readdirSync(dir)
    .filter((file) => file.endsWith('.md'))
    .sort()
    .map((file) => {
      const id = file.replace(/\.md$/, '');
      return cardFromFrontmatter(id, splitFrontmatter(readFileSync(new URL(file, dir), 'utf8')).frontmatter);
    });
}

/** Every hub file, including the occasion hubs in subfolders, sorted by id. */
export function loadFacetHubs(dir: URL): FacetHub[] {
  return (readdirSync(dir, { recursive: true }) as string[])
    .map((file) => file.split('\\').join('/'))
    .filter((file) => file.endsWith('.md'))
    .sort()
    .map((file) => {
      const fm = splitFrontmatter(readFileSync(new URL(file, dir), 'utf8')).frontmatter;
      return {
        id: file.replace(/\.md$/, ''),
        cards: strings(fm, 'activities', file),
        indexable: fm.indexable !== false,
      };
    });
}
