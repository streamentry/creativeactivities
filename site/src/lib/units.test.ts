import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Units on the cards, hubs and guides people print or read (L10N-014: "No printable reads 'inches' beside a metric quantity or the
 * reverse"). Today the cards use US customary measures only, so nothing is mixed; this keeps it so while the
 * conversion to the reader's own units (a decision for the maintainer and a reviewer) is not yet made.
 *
 * Cups and spoons are left out of the rule: they are everyday cooking measures that readers who use metric units use
 * loosely too, and they are not a number of inches or centimeters next to one another.
 */

/** A US customary length, weight, volume or temperature written with a number (or "inch", "Fahrenheit" on their own). */
const IMPERIAL = /\b\d[\d.,½¼¾/]*\s?-?\s?(?:inch(?:es)?|in\.|foot|feet|ft|yards?|yd|ounces?|oz|pounds?|lbs?|gallons?|quarts?|pints?)\b|°\s?F\b|\bFahrenheit\b|\binch(?:es)?\b/i;

/** A metric measure written with a number: 5 cm, 250g, 2 liters, 20 °C. */
const METRIC = /\b\d[\d.,]*\s?(?:mm|cm|km|kg|ml|metres?|meters?|centimet(?:re|er)s?|millimet(?:re|er)s?|litres?|liters?|grams?|kilograms?|millilit(?:re|er)s?)\b|\b\d[\d.,]*(?:m|g|l)\b|°\s?C\b|\bCelsius\b/i;

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
  const folders = ['activity-cards', 'hubs', 'guides'];
  const files = folders.flatMap((folder) => {
    const dir = new URL(`../content/${folder}/`, import.meta.url);
    return readdirSync(dir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => ({ name: `${folder}/${f}`, text: readFileSync(new URL(f, dir), 'utf8') }));
  });

  it('reads the cards, the hubs and the English guides', () => {
    expect(files.filter((f) => f.name.startsWith('activity-cards/')).length).toBeGreaterThanOrEqual(50);
    expect(files.length).toBeGreaterThanOrEqual(60);
  });

  it('never mixes the two systems in one card, hub or guide', () => {
    const mixed = files
      .map(({ name, text }) => ({ name, ...unitSystems(text) }))
      .filter((f) => f.imperial.length > 0 && f.metric.length > 0)
      .map((f) => `${f.name}: ${f.imperial.join(', ')} beside ${f.metric.join(', ')}`);
    expect(mixed, 'pick one system for the card, or convert once by a rule').toEqual([]);
  });
});
