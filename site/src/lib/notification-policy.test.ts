import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * WEB-070 notification policy: the website sends no push notifications, asks for no notification
 * permission, and never uses guilt or count-based reminder wording ("you missed", streaks).
 * MISSION: no guilt-driven notifications, no manufactured urgency, no streak shame.
 */
const SRC = fileURLToPath(new URL('../', import.meta.url));
const PUBLIC = fileURLToPath(new URL('../../public/', import.meta.url));

function files(dir: string, exts: readonly string[]): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === 'node_modules' ? [] : files(path, exts);
    return exts.some((e) => name.endsWith(e)) && !name.endsWith('.test.ts') ? [path] : [];
  });
}

const code = [...files(SRC, ['.ts', '.astro', '.tsx', '.js', '.mjs']), ...files(PUBLIC, ['.js'])];
const english = [
  ...files(join(SRC, 'content/activity-cards'), ['.md']),
  ...files(join(SRC, 'content/hubs'), ['.md']),
  ...readdirSync(join(SRC, 'content/guides')).flatMap((section) => files(join(SRC, 'content/guides', section), ['.md'])),
];

const API = /Notification\.requestPermission|new Notification\(|PushManager|pushManager\.subscribe|showNotification\(/;
const COPY = /\byou missed\b|\byou haven'?t\b[^.]{0,40}\b(in|for) (a while|days)|\bdon'?t break your\b|\b\d+[- ]day streak\b|\bkeep your streak\b|\bstreak is\b/i;

describe('notification policy (WEB-070)', () => {
  it('scans the site source', () => {
    expect(code.length).toBeGreaterThan(50);
    expect(english.length).toBeGreaterThan(50);
  });

  it('never asks for notification permission or subscribes to push', () => {
    const offenders = code.filter((f) => API.test(readFileSync(f, 'utf8')));
    expect(offenders.map((f) => f.replace(SRC, 'src/'))).toEqual([]);
  });

  it('uses no guilt or streak wording in English content', () => {
    const offenders = english.filter((f) => COPY.test(readFileSync(f, 'utf8')));
    expect(offenders.map((f) => f.replace(SRC, 'src/'))).toEqual([]);
  });

  it('the patterns catch what they are meant to catch', () => {
    expect(API.test('Notification.requestPermission()')).toBe(true);
    expect(COPY.test('You missed yesterday!')).toBe(true);
    expect(COPY.test('Keep your streak going')).toBe(true);
    expect(COPY.test('A 7-day streak')).toBe(true);
    expect(COPY.test('It is fine to stop and come back another day.')).toBe(false);
  });
});
