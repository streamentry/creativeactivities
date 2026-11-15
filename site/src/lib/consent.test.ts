import { describe, expect, it } from 'vitest';
import {
  CONSENT_KEY,
  GTM_BLOCKLIST,
  consentDefaults,
  consentUpdate,
  gpcEnabled,
  readConsent,
  saveConsent,
  shouldLoadAnalytics,
  showConsentChoice,
  type StorageLike,
} from './consent';

function memory(initial: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k]! : null),
    setItem: (k, v) => {
      data[k] = v;
    },
    removeItem: (k) => {
      delete data[k];
    },
  };
}

describe('analytics consent', () => {
  it('is unanswered until someone chooses', () => {
    expect(readConsent(memory())).toBeNull();
    expect(readConsent(null)).toBeNull();
  });

  it('only accepts the two real answers', () => {
    expect(readConsent(memory({ [CONSENT_KEY]: 'granted' }))).toBe('granted');
    expect(readConsent(memory({ [CONSENT_KEY]: 'denied' }))).toBe('denied');
    expect(readConsent(memory({ [CONSENT_KEY]: 'yes' }))).toBeNull();
  });

  it('loads analytics only after an explicit yes', () => {
    expect(shouldLoadAnalytics(null)).toBe(false);
    expect(shouldLoadAnalytics('denied')).toBe(false);
    expect(shouldLoadAnalytics('granted')).toBe(true);
  });

  it('asks only while the question is unanswered', () => {
    expect(showConsentChoice(null)).toBe(true);
    expect(showConsentChoice('denied')).toBe(false);
    expect(showConsentChoice('granted')).toBe(false);
  });

  it('remembers the answer, and survives a storage that refuses', () => {
    const s = memory();
    expect(saveConsent(s, 'denied')).toBe(true);
    expect(s.data[CONSENT_KEY]).toBe('denied');
    const broken: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {},
    };
    expect(saveConsent(broken, 'granted')).toBe(false);
    expect(saveConsent(null, 'granted')).toBe(false);
  });
});

describe('Google consent mode', () => {
  it('starts with everything denied', () => {
    expect(Object.values(consentDefaults())).not.toContain('granted');
    expect(consentDefaults()).toMatchObject({ analytics_storage: 'denied', ad_storage: 'denied' });
  });

  it('a yes grants analytics storage only, never anything for ads', () => {
    const update = consentUpdate('granted');
    expect(update.analytics_storage).toBe('granted');
    expect(update.ad_storage).toBe('denied');
    expect(update.ad_user_data).toBe('denied');
    expect(update.ad_personalization).toBe('denied');
  });

  it('a no denies analytics storage again', () => {
    expect(consentUpdate('denied').analytics_storage).toBe('denied');
  });
});

describe('Tag Manager blocklist', () => {
  it('blocks the automatic click, link, form and other listeners, and custom HTML', () => {
    for (const id of ['cl', 'lcl', 'fsl', 'evl', 'sdl', 'tl', 'hl', 'jel', 'ytl', 'html']) {
      expect(GTM_BLOCKLIST).toContain(id);
    }
  });

  it('never blocks the GA4 tags themselves', () => {
    for (const id of ['gaawc', 'gaawe', 'googtag', 'google']) expect(GTM_BLOCKLIST).not.toContain(id);
  });
});

describe('Global Privacy Control (PLAT-026)', () => {
  it('reads the browser signal, and only a real true counts', () => {
    expect(gpcEnabled({ globalPrivacyControl: true })).toBe(true);
    expect(gpcEnabled({ globalPrivacyControl: false })).toBe(false);
    expect(gpcEnabled({})).toBe(false);
    expect(gpcEnabled({ globalPrivacyControl: 'true' as unknown as boolean })).toBe(false);
    expect(gpcEnabled(null)).toBe(false);
  });

  it('never loads analytics when the browser sends the signal, even after a yes', () => {
    expect(shouldLoadAnalytics('granted', true)).toBe(false);
    expect(shouldLoadAnalytics(null, true)).toBe(false);
    expect(shouldLoadAnalytics('granted', false)).toBe(true);
  });

  it('does not ask the question when the signal already answers it', () => {
    expect(showConsentChoice(null, true)).toBe(false);
    expect(showConsentChoice(null, false)).toBe(true);
  });
});
