#!/usr/bin/env node
// Validates all content records (PLAT-011). Usage: pnpm content:validate [--root <folder>]
//   --root  a folder with the same src/content layout; defaults to this site. Exits 1 on any invalid record.
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { formatReport, validateContent } from './content-validate-lib.mjs';

const { values } = parseArgs({ options: { root: { type: 'string' } }, strict: true });
const result = await validateContent({ root: values.root ? resolve(values.root) : undefined });
console.log(formatReport(result));
process.exitCode = result.failures.length > 0 ? 1 : 0;
