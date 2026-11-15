/**
 * WEB-045: the materials line on the weekly sheet scales with the group size staff enter.
 * Cards list materials for two people, so a group needs one set per pair plus one spare.
 * Returns '' for an empty or out-of-range entry, so nothing misleading is printed.
 */
export function programMaterialsLine(value: string): string {
  const people = Number.parseInt(value, 10);
  if (!Number.isInteger(people) || people < 2 || people > 40) return '';
  const sets = Math.ceil(people / 2) + 1;
  return `For ${people} people: prepare about ${sets} sets of each card's materials (one per pair, plus a spare), and seat everyone where they can reach them.`;
}
