import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  LINE_LENGTH_KEY,
  SPACING_KEY,
  THEME_KEY,
  parseLineLength,
  parseSpacing,
  parseTheme,
  readLineLength,
  readSpacing,
  writeLineLength,
  writeSpacing,
  readTheme,
  writeTheme,
  type ThemeStorage,
} from './display-settings';

/** A Storage stand-in that can refuse every call, as private windows and blocked sites do. */
function fakeStorage(initial: Record<string, string> = {}, refuse = false): ThemeStorage & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial));
  const guard = () => {
    if (refuse) throw new DOMException('blocked', 'SecurityError');
  };
  return {
    data,
    getItem(key) {
      guard();
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      guard();
      data.set(key, value);
    },
    removeItem(key) {
      guard();
      data.delete(key);
    },
  };
}

describe('Colors choice (WEB-042)', () => {
  it('uses gm-theme as the key', () => {
    expect(THEME_KEY).toBe('gm-theme');
  });

  it('reads light and dark only; anything else means the device setting', () => {
    expect(parseTheme('light')).toBe('light');
    expect(parseTheme('dark')).toBe('dark');
    expect(parseTheme(null)).toBe('device');
    expect(parseTheme(undefined)).toBe('device');
    expect(parseTheme('')).toBe('device');
    expect(parseTheme('DARK')).toBe('device');
    expect(parseTheme('high')).toBe('device');
  });

  it('treats an absent key as the device setting and reads a saved choice', () => {
    expect(readTheme(fakeStorage())).toBe('device');
    expect(readTheme(fakeStorage({ 'gm-theme': 'dark' }))).toBe('dark');
    expect(readTheme(fakeStorage({ 'gm-theme': 'light' }))).toBe('light');
  });

  it('reads as the device setting when storage refuses', () => {
    expect(readTheme(fakeStorage({ 'gm-theme': 'dark' }, true))).toBe('device');
  });

  it('stores light or dark, and removes the key for the device setting', () => {
    const storage = fakeStorage({ 'gm-theme': 'dark' });
    writeTheme(storage, 'light');
    expect(storage.data.get('gm-theme')).toBe('light');
    writeTheme(storage, 'device');
    expect(storage.data.has('gm-theme')).toBe(false);
  });

  it('does not throw when storage refuses a write', () => {
    expect(() => writeTheme(fakeStorage({}, true), 'dark')).not.toThrow();
    expect(() => writeTheme(fakeStorage({}, true), 'device')).not.toThrow();
  });
});

/** Runs the before-paint script as the browser would; returns every attribute it set on <html>. */
function runEarly(storage: { getItem(key: string): string | null } | 'throws') {
  const source = readFileSync(new URL('../../public/theme-init.js', import.meta.url), 'utf8');
  const root = { attributes: new Map<string, string>() };
  const documentElement = {
    setAttribute(name: string, value: string) {
      root.attributes.set(name, value);
    },
  };
  const localStorage =
    storage === 'throws'
      ? {
          getItem() {
            throw new DOMException('blocked', 'SecurityError');
          },
        }
      : storage;
  new Function('document', 'localStorage', source)({ documentElement }, localStorage);
  return root.attributes;
}

/** Runs the before-paint script and returns only data-theme. */
function runEarlyScript(storage: { getItem(key: string): string | null } | 'throws') {
  return runEarly(storage).get('data-theme');
}

describe('theme-init.js (applied before paint)', () => {
  const store = (value: string | null) => ({ getItem: () => value });

  it('sets data-theme to the saved light or dark choice', () => {
    expect(runEarlyScript(store('dark'))).toBe('dark');
    expect(runEarlyScript(store('light'))).toBe('light');
  });

  it('sets nothing when the choice is absent or not light or dark', () => {
    expect(runEarlyScript(store(null))).toBeUndefined();
    expect(runEarlyScript(store('high'))).toBeUndefined();
  });

  it('sets nothing and does not throw when storage is blocked', () => {
    expect(runEarlyScript('throws')).toBeUndefined();
  });

  it('reads the same key as THEME_KEY', () => {
    const source = readFileSync(new URL('../../public/theme-init.js', import.meta.url), 'utf8');
    expect(source).toContain(`localStorage.getItem('${THEME_KEY}')`);
  });
});

describe('reading settings (WEB-042): line length and spacing', () => {
  it('uses gm-line-length and gm-spacing as the keys', () => {
    expect(LINE_LENGTH_KEY).toBe('gm-line-length');
    expect(SPACING_KEY).toBe('gm-spacing');
  });

  it('reads short and more only; anything else means standard', () => {
    expect(parseLineLength('short')).toBe('short');
    expect(parseLineLength(null)).toBe('standard');
    expect(parseLineLength('SHORT')).toBe('standard');
    expect(parseLineLength('more')).toBe('standard');
    expect(parseSpacing('more')).toBe('more');
    expect(parseSpacing(undefined)).toBe('standard');
    expect(parseSpacing('short')).toBe('standard');
  });

  it('treats an absent key as standard and reads a saved choice', () => {
    expect(readLineLength(fakeStorage())).toBe('standard');
    expect(readLineLength(fakeStorage({ 'gm-line-length': 'short' }))).toBe('short');
    expect(readSpacing(fakeStorage())).toBe('standard');
    expect(readSpacing(fakeStorage({ 'gm-spacing': 'more' }))).toBe('more');
  });

  it('reads as standard when storage refuses', () => {
    expect(readLineLength(fakeStorage({ 'gm-line-length': 'short' }, true))).toBe('standard');
    expect(readSpacing(fakeStorage({ 'gm-spacing': 'more' }, true))).toBe('standard');
  });

  it('stores the non-standard choice, and removes the key for standard', () => {
    const storage = fakeStorage();
    writeLineLength(storage, 'short');
    writeSpacing(storage, 'more');
    expect(storage.data.get('gm-line-length')).toBe('short');
    expect(storage.data.get('gm-spacing')).toBe('more');
    writeLineLength(storage, 'standard');
    writeSpacing(storage, 'standard');
    expect(storage.data.has('gm-line-length')).toBe(false);
    expect(storage.data.has('gm-spacing')).toBe(false);
  });

  it('does not throw when storage refuses a write', () => {
    expect(() => writeLineLength(fakeStorage({}, true), 'short')).not.toThrow();
    expect(() => writeSpacing(fakeStorage({}, true), 'more')).not.toThrow();
    expect(() => writeSpacing(fakeStorage({}, true), 'standard')).not.toThrow();
  });
});

describe('theme-init.js applies reading settings before paint', () => {
  const keyed = (values: Record<string, string>) => ({ getItem: (key: string) => values[key] ?? null });

  it('sets data-line and data-spacing from the saved choices', () => {
    const attrs = runEarly(keyed({ 'gm-line-length': 'short', 'gm-spacing': 'more' }));
    expect(attrs.get('data-line')).toBe('short');
    expect(attrs.get('data-spacing')).toBe('more');
  });

  it('sets nothing for absent or other values, and does not throw when storage is blocked', () => {
    const attrs = runEarly(keyed({ 'gm-line-length': 'long', 'gm-spacing': 'less' }));
    expect(attrs.has('data-line')).toBe(false);
    expect(attrs.has('data-spacing')).toBe(false);
    expect(runEarly('throws').size).toBe(0);
  });

  it('reads the same keys as LINE_LENGTH_KEY and SPACING_KEY', () => {
    const source = readFileSync(new URL('../../public/theme-init.js', import.meta.url), 'utf8');
    expect(source).toContain(`localStorage.getItem('${LINE_LENGTH_KEY}')`);
    expect(source).toContain(`localStorage.getItem('${SPACING_KEY}')`);
  });
});

describe('reading settings CSS (WEB-042)', () => {
  const tokens = readFileSync(new URL('../styles/tokens.css', import.meta.url), 'utf8');
  const start = tokens.indexOf('/* Reading settings (WEB-042)');
  const end = tokens.indexOf('@media (min-width: 600px)', start);
  const block = tokens.slice(start, end);
  const media = block.indexOf('@media screen {');
  const rules = block.slice(media).match(/[^{}]+(?=\{)/g)?.map((s) => s.trim()) ?? [];

  it('is present and wrapped in a single @media screen block', () => {
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    expect(media).toBeGreaterThan(-1);
    expect(block.match(/@media/g)).toHaveLength(1);
  });

  it('sets the line length and spacing overrides', () => {
    expect(rules).toContain(`html[data-line='short'] .prose`);
    expect(rules).toContain(`html[data-spacing='more'] .prose`);
    expect(rules).toContain(`html[data-spacing='more'] .activity-steps`);
  });

  it('does not target buttons, nav, game boards or tiles', () => {
    for (const rule of rules) {
      expect(rule, rule).not.toMatch(/\bbutton\b|\.btn\b|\.site-nav\b|\.board\b|\.tile\b/);
    }
  });
});
