/**
 * TSA-043: no secrets in the repository. Scans every tracked file for common
 * key formats and fails on a match, and fails when signing material is tracked.
 * Test values that look like keys belong in a fixture with a clear name, and
 * must not work anywhere in production.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const REPO = new URL('../../../', import.meta.url).pathname;

const tracked = (): string[] =>
  execFileSync('git', ['ls-files', '-z'], { cwd: REPO, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    .split('\0')
    .filter(Boolean);

/** Known key formats, each with a name for the failure message. */
const PATTERNS: { name: string; re: RegExp }[] = [
  { name: 'AWS access key id', re: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/ },
  { name: 'private key block', re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY(?: BLOCK)?-----/ },
  { name: 'Google API key', re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { name: 'Stripe live key', re: /\b(?:sk|rk)_live_[0-9A-Za-z]{16,}\b/ },
  { name: 'GitHub token', re: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/ },
  { name: 'Slack token', re: /\bxox[baprs]-[0-9A-Za-z-]{10,}\b/ },
  {
    name: 'assigned secret',
    re: /\b(?:api[_-]?key|secret|client_secret|access_token|auth_token|password)\b\s*[:=]\s*['"][^'"\s]{16,}['"]/i,
  },
];

/** Signing material and key files that must never be in git. */
const FORBIDDEN_FILES = /(?:^|\/)(?:key\.properties|[^/]+\.(?:jks|keystore|p12|pfx|p8|mobileprovision))$/i;

/** Files that are about secrets, not secrets: documentation that names a pattern. */
const ALLOWED_FILES = new Set<string>([]);

function readText(path: string): string | null {
  const full = join(REPO, path);
  if (statSync(full).size > 2 * 1024 * 1024) return null;
  const buffer = readFileSync(full);
  if (buffer.includes(0)) return null; // binary
  return buffer.toString('utf8');
}

describe('secrets in the repository (TSA-043)', () => {
  const files = tracked();

  it('finds no known key format in any tracked text file', () => {
    const hits: string[] = [];
    for (const file of files) {
      if (ALLOWED_FILES.has(file)) continue;
      const text = readText(file);
      if (text === null) continue;
      for (const { name, re } of PATTERNS) if (re.test(text)) hits.push(`${file}: ${name}`);
    }
    expect(hits).toEqual([]);
    // Reads every tracked file, so it takes about five seconds when many tests run at once; the default limit is five.
  }, 60_000);

  it('tracks no signing keys or key files', () => {
    expect(files.filter((f) => FORBIDDEN_FILES.test(f))).toEqual([]);
  });
});
