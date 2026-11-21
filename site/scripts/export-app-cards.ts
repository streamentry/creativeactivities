/**
 * Writes the activity cards the app bundles offline (APP-001).
 *
 * Run from the repository root:
 *   node --import ./site/scripts/ts-extension-hooks.mjs --experimental-strip-types site/scripts/export-app-cards.ts
 *
 * It writes assets/cards/cards.v1.json from the listed website cards. Re-run it
 * after any card changes; the vitest check in src/lib/app-cards.test.ts fails
 * until the committed file matches.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { APP_CARDS_REFRESH_COMMAND, buildAppCards, readCardRows, serializeAppCards } from './app-cards-lib.ts';

const cardsDir = new URL('../src/content/activity-cards/', import.meta.url);
const outDir = new URL('../../assets/cards/', import.meta.url);
const outFile = new URL('cards.v1.json', outDir);

const payload = buildAppCards(readCardRows(cardsDir));
mkdirSync(fileURLToPath(outDir), { recursive: true });
writeFileSync(fileURLToPath(outFile), serializeAppCards(payload));
console.log(`cards ${payload.cards.length}, generatedFrom ${payload.generatedFrom} (${APP_CARDS_REFRESH_COMMAND})`);
