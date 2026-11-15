// Writes public/_redirects from src/lib/retired-guides.ts.
import { writeFileSync } from 'node:fs';
import { redirectsFile } from '../src/lib/retired-guides.ts';

writeFileSync(new URL('../public/_redirects', import.meta.url), redirectsFile());
console.log('public/_redirects written');
