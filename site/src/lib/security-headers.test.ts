/**
 * Checks public/_headers (TSA-041). Cloudflare applies these rules to every
 * response, so a mistake here reaches every page. The post-build check in
 * scripts/check-site.mjs compares the script hashes below with the ones Astro
 * writes into each page's meta CSP.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const raw = readFileSync(new URL('../../public/_headers', import.meta.url), 'utf8');

/** Each rule: its route line, then its indented header lines (comments removed). */
function parseRules(text: string): Map<string, Map<string, string>> {
  const rules = new Map<string, Map<string, string>>();
  let current: Map<string, string> | undefined;
  for (const line of text.split('\n')) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      current = new Map();
      rules.set(line.trim(), current);
      continue;
    }
    const match = line.trim().match(/^([!]?[A-Za-z-]+):\s*(.*)$/);
    if (match && current) current.set(match[1] as string, match[2] as string);
  }
  return rules;
}

const rules = parseRules(raw);
const global = rules.get('/*');
const csp = (map: Map<string, string> | undefined): string => map?.get('Content-Security-Policy') ?? '';
const directive = (policy: string, name: string): string[] | undefined => {
  const found = policy.split(';').map((d) => d.trim()).find((d) => d.startsWith(`${name} `));
  return found?.split(/\s+/).slice(1);
};

describe('_headers global rule (TSA-041)', () => {
  it('exists and sets the transport and framing headers', () => {
    expect(global).toBeDefined();
    expect(global?.get('Strict-Transport-Security')).toMatch(/max-age=31536000/);
    expect(global?.get('Strict-Transport-Security')).toMatch(/includeSubDomains/);
    expect(global?.get('X-Content-Type-Options')).toBe('nosniff');
    expect(global?.get('X-Frame-Options')).toBe('DENY');
    expect(global?.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
  });

  it('denies camera, microphone and geolocation', () => {
    const policy = global?.get('Permissions-Policy') ?? '';
    for (const feature of ['camera', 'microphone', 'geolocation']) {
      expect(policy).toMatch(new RegExp(`${feature}=\\(\\)`));
    }
  });

  it('has a Content-Security-Policy with no unsafe-inline for scripts', () => {
    const policy = csp(global);
    const scripts = directive(policy, 'script-src') ?? [];
    expect(scripts).not.toContain("'unsafe-inline'");
    expect(scripts).not.toContain("'unsafe-eval'");
    expect(scripts).not.toContain('*');
    expect(scripts).toContain("'self'");
    expect(scripts).toContain('https://www.googletagmanager.com');
  });

  it('allows scripts only by hash for inline code, matching the meta CSP Astro writes', () => {
    const hashes = (directive(csp(global), 'script-src') ?? []).filter((s) => s.startsWith("'sha256-"));
    expect(hashes.length).toBeGreaterThan(0);
    for (const hash of hashes) expect(hash).toMatch(/^'sha256-[A-Za-z0-9+/]+=*'$/);
  });

  it('restricts the basics: no plugins, no framing, one base, same-origin forms', () => {
    const policy = csp(global);
    expect(directive(policy, 'default-src')).toEqual(["'self'"]);
    expect(directive(policy, 'object-src')).toEqual(["'none'"]);
    expect(directive(policy, 'base-uri')).toEqual(["'self'"]);
    expect(directive(policy, 'form-action')).toEqual(["'self'"]);
    expect(directive(policy, 'frame-ancestors')).toEqual(["'none'"]);
  });

  it('lists only the outside origins the site needs, with a reason in the file', () => {
    const policy = csp(global);
    const outside = new Set<string>();
    for (const name of ['script-src', 'img-src', 'connect-src', 'font-src', 'style-src', 'media-src', 'frame-src']) {
      for (const source of directive(policy, name) ?? []) {
        if (source.startsWith('http')) outside.add(`${name} ${source}`);
      }
    }
    expect([...outside].sort()).toEqual(
      [
        'connect-src https://*.analytics.google.com',
        'connect-src https://*.google-analytics.com',
        'connect-src https://*.googletagmanager.com',
        'img-src https://*.google-analytics.com',
        'img-src https://*.googletagmanager.com',
        'script-src https://www.googletagmanager.com',
      ].sort(),
    );
  });

  it('keeps every header line under the 2,000 character limit', () => {
    for (const line of raw.split('\n')) expect(line.length).toBeLessThan(2000);
  });
});

describe('_headers photo pairs rules (no third parties for family photos)', () => {
  const photoRoutes = ['/games/photo-pairs/', '/:lang/games/photo-pairs/'];

  it.each(photoRoutes)('%s has its own strict policy that allows only this site', (route) => {
    const rule = rules.get(route);
    expect(rule).toBeDefined();
    const policy = csp(rule);
    expect(directive(policy, 'default-src')).toEqual(["'self'"]);
    expect(directive(policy, 'connect-src')).toEqual(["'self'"]);
    expect(directive(policy, 'form-action')).toEqual(["'self'"]);
    expect(policy).not.toMatch(/https?:\/\/(?!\*)/);
  });

  it.each(photoRoutes)('%s does not allow inline scripts without a hash', (route) => {
    const scripts = directive(csp(rules.get(route)), 'script-src') ?? [];
    expect(scripts).not.toContain("'unsafe-inline'");
  });
});
