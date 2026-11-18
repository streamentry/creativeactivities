import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { THEME_KEY, parseTheme, readTheme, writeTheme, type ThemeStorage } from './display-settings';

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

/** Runs the before-paint script as the browser would, against a stand-in document and storage. */
function runEarlyScript(storage: { getItem(key: string): string | null } | 'throws') {
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
  return root.attributes.get('data-theme');
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
