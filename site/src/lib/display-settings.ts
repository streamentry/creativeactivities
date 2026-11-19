/**
 * Keys for per-viewer display and play choices. They live here, not in the
 * components that write them, so the "Your data on this device" page
 * (your-data.ts) names exactly the keys the site uses.
 */
export const TEXT_SIZE_KEY = 'gm-text-size';
export const CONTRAST_KEY = 'gm-contrast';
/** The Colors choice (WEB-042): `light` or `dark`; absent means follow the device. */
export const THEME_KEY = 'gm-theme';
/** Reading settings (WEB-042): `short` for shorter lines; absent means standard. */
export const LINE_LENGTH_KEY = 'gm-line-length';
/** Reading settings (WEB-042): `more` for more space between lines; absent means standard. */
export const SPACING_KEY = 'gm-spacing';
/** Whether activity cards show short steps (WEB-039); `1` or `0`. */
export const PLAIN_STEPS_KEY = 'ca-plain-steps';
export const PLAY_SETTINGS_KEY = 'gm-play-settings';

export type ThemeChoice = 'light' | 'dark' | 'device';

/** Any value other than `light` or `dark` (including absent) means the device setting. */
export function parseTheme(raw: string | null | undefined): ThemeChoice {
  return raw === 'light' || raw === 'dark' ? raw : 'device';
}

/** The subset of Storage the choice uses, so tests can pass a stand-in. */
export type ThemeStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/** Reads the saved choice; blocked storage reads as "follow the device". */
export function readTheme(storage: ThemeStorage): ThemeChoice {
  try {
    return parseTheme(storage.getItem(THEME_KEY));
  } catch {
    return 'device';
  }
}

/** Saves a choice; "device" removes the key. Blocked storage is ignored: the choice lasts for this page. */
export function writeTheme(storage: ThemeStorage, choice: ThemeChoice): void {
  try {
    if (choice === 'device') storage.removeItem(THEME_KEY);
    else storage.setItem(THEME_KEY, choice);
  } catch {
    /* storage blocked */
  }
}

export type LineLength = 'standard' | 'short';
export type Spacing = 'standard' | 'more';

/** Any value other than `short` (including absent) means standard lines. */
export function parseLineLength(raw: string | null | undefined): LineLength {
  return raw === 'short' ? 'short' : 'standard';
}

/** Any value other than `more` (including absent) means standard spacing. */
export function parseSpacing(raw: string | null | undefined): Spacing {
  return raw === 'more' ? 'more' : 'standard';
}

/** Reads the saved line length; blocked storage reads as standard. */
export function readLineLength(storage: ThemeStorage): LineLength {
  try {
    return parseLineLength(storage.getItem(LINE_LENGTH_KEY));
  } catch {
    return 'standard';
  }
}

/** Reads the saved spacing; blocked storage reads as standard. */
export function readSpacing(storage: ThemeStorage): Spacing {
  try {
    return parseSpacing(storage.getItem(SPACING_KEY));
  } catch {
    return 'standard';
  }
}

/** Saves a line length; standard removes the key. Blocked storage is ignored. */
export function writeLineLength(storage: ThemeStorage, choice: LineLength): void {
  try {
    if (choice === 'standard') storage.removeItem(LINE_LENGTH_KEY);
    else storage.setItem(LINE_LENGTH_KEY, choice);
  } catch {
    /* storage blocked */
  }
}

/** Saves a spacing; standard removes the key. Blocked storage is ignored. */
export function writeSpacing(storage: ThemeStorage, choice: Spacing): void {
  try {
    if (choice === 'standard') storage.removeItem(SPACING_KEY);
    else storage.setItem(SPACING_KEY, choice);
  } catch {
    /* storage blocked */
  }
}
