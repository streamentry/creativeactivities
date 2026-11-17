import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Units on the cards and hubs people print (L10N-014: "No printable reads 'inches' beside a metric quantity or the
 * reverse"). Today the cards use US customary measures only, so nothing is mixed; this keeps it so while the
 * conversion to the reader's own units (a decision for the maintainer and a reviewer) is not yet made.
 *
 * Cups and spoons are left out of the rule: they are everyday cooking measures that readers who use metric units use
 * loosely too, and they are not a number of inches or centimeters next to one another.
 */

/** A US customary length, weight, volume or temperature written with a number (or "inch", "Fahrenheit" on their own). */
const IMPERIAL = /\b\d[\d.,½¼¾/]*\s?-?\s?(?:inch(?:es)?|in\.|foot|feet|ft|yards?|yd|ounces?|oz|pounds?|lbs?|gallons?|quarts?|pints?)(?!\w)|°\s?F\b|\bFahrenheit\b|\binch(?:es)?\b/i;

/** A metric measure written with a number: 5 cm, 250g, 2 liters, 20 °C. */
const METRIC = /\b\d[\d.,]*\s?-?\s?(?:mm|cm|km|kg|ml|gsm|metres?|meters?|centimet(?:re|er)s?|millimet(?:re|er)s?|litres?|liters?|grams?|kilograms?|millilit(?:re|er)s?)\b|\b\d[\d.,]*\s?(?:m|g|l)\b|\b\d[\d.,]*\s?L\b|[°º]\s?C\b|\bCelsius\b/i;

/** The systems a piece of text uses. */
export function unitSystems(text: string): { imperial: string[]; metric: string[] } {
  const found = (re: RegExp) => [...text.matchAll(new RegExp(re.source, `${re.flags.replace('g', '')}g`))].map((m) => m[0].trim());
  return { imperial: found(IMPERIAL), metric: found(METRIC) };
}

describe('telling the unit systems apart', () => {
  it('reads inches and degrees Fahrenheit as US customary', () => {
    expect(unitSystems('Cut a strip 8 inches long.').imperial).toEqual(['8 inches']);
    expect(unitSystems('Warm water, about 100 °F.').imperial).toEqual(['°F']);
    expect(unitSystems('Use a 2-ounce cup and a 1 1/2 ft string').imperial).toEqual(['2-ounce', '1/2 ft']);
  });

  it('reads centimeters, grams, liters and degrees Celsius as metric', () => {
    expect(unitSystems('Cut a strip 20 cm long.').metric).toEqual(['20 cm']);
    expect(unitSystems('About 250g of flour and 1l of water').metric).toEqual(['250g', '1l']);
    expect(unitSystems('Warm water, about 40 °C.').metric).toEqual(['°C']);
  });

  it('does not take minutes, cups, spoons or everyday words for measures', () => {
    const text = 'Five minutes, a cup of tea, two teaspoons of glue, a foot massage, 12 or more pieces, 3 sheets.';
    expect(unitSystems(text)).toEqual({ imperial: [], metric: [] });
  });
});

describe('the cards and hubs on disk', () => {
  // Cards and hubs, folders within folders included (the occasion hubs are one level down).
  const walk = (dir: URL, prefix: string): { name: string; text: string }[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory()
        ? walk(new URL(`${e.name}/`, dir), `${prefix}${e.name}/`)
        : e.name.endsWith('.md')
          ? [{ name: `${prefix}${e.name}`, text: readFileSync(new URL(e.name, dir), 'utf8') }]
          : [],
    );
  const files = ['activity-cards', 'hubs'].flatMap((folder) => walk(new URL(`../content/${folder}/`, import.meta.url), `${folder}/`));

  it('reads the cards and every hub, the occasion hubs too', () => {
    expect(files.filter((f) => f.name.startsWith('activity-cards/')).length).toBeGreaterThanOrEqual(50);
    expect(files.some((f) => f.name.startsWith('hubs/occasions/'))).toBe(true);
    expect(files.length).toBeGreaterThanOrEqual(65);
  });

  it('never mixes the two systems in one card or hub', () => {
    const mixed = files
      .map(({ name, text }) => ({ name, ...unitSystems(text) }))
      .filter((f) => f.imperial.length > 0 && f.metric.length > 0)
      .map((f) => `${f.name}: ${f.imperial.join(', ')} beside ${f.metric.join(', ')}`);
    expect(mixed, 'pick one system for the card, or convert once by a rule').toEqual([]);
  });
});
