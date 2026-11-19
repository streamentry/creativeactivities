#!/usr/bin/env node
// Prints the WEB-010 facet report as Markdown: each facet with its rule, card count,
// H3 result, largest hub overlap and verdict. Node 24 strips the TypeScript types on import.
// Run from site/: $HOME/.nvm/versions/node/v24.11.1/bin/node scripts/facet-report.mjs
import { loadFacetCards, loadFacetHubs } from '../src/lib/facet-inputs.ts';
import { MIN_CARDS, MIN_DIFFERENT, OVERLAP_LIMIT, buildFacets, evaluateFacets } from '../src/lib/facets.ts';

const cards = loadFacetCards(new URL('../src/content/activity-cards/', import.meta.url));
const hubs = loadFacetHubs(new URL('../src/content/hubs/', import.meta.url));
const results = evaluateFacets(cards, hubs, buildFacets());

const pct = (share) => `${Math.round(share * 100)}%`;
const hubPath = (id) => `/${id}/`;
const cell = (text) => text.replace(/\|/g, '/');

const live = cards.filter((c) => !c.withdrawn).length;
console.log(`Live cards: ${live}. Hubs read: ${hubs.length} (${hubs.filter((h) => !h.indexable).length} held from search).`);
console.log(`H3 uses MIN_CARDS = ${MIN_CARDS} and MIN_DIFFERENT = ${MIN_DIFFERENT}; H1 uses OVERLAP_LIMIT = ${OVERLAP_LIMIT} (strictly more than).`);
console.log('');
console.log('| Facet | Rule | Cards | H3 pass | Largest hub overlap | Verdict |');
console.log('|---|---|---:|---|---|---|');
for (const r of results) {
  const h3 = `${r.passesH3 ? 'yes' : 'no'} (${r.cards.length} cards, ${r.differ} profiles)`;
  const hub = r.largestHub ? `${cell(hubPath(r.largestHub.other))} ${pct(r.largestHub.share)}` : 'none';
  const verdict = r.routeTo ? `${r.verdict} to ${r.routeTo === r.largestHub?.other ? hubPath(r.routeTo) : r.routeTo}` : r.verdict;
  console.log(`| ${cell(r.label)} | ${cell(r.rule)} | ${r.cards.length} | ${h3} | ${hub} | ${verdict} |`);
}
console.log('');
console.log('Largest facet overlap (share of the facet cards that the other facet also holds):');
console.log('');
console.log('| Facet | Largest facet overlap |');
console.log('|---|---|');
for (const r of results) {
  const other = r.largestFacet ? `${r.largestFacet.other} ${pct(r.largestFacet.share)}` : 'none';
  console.log(`| ${cell(r.label)} | ${other} |`);
}
