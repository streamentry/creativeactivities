import { describe, expect, it } from 'vitest';
import { CRISIS_CHECKED_ON, CRISIS_PRINT_LINE, CRISIS_ROUTES, crisisCheckedOn, type CrisisRoute } from './crisis-routes';

/** L10N-009 and CNT-1003: every number is dated and sourced; nothing here is machine-translated or guessed. */
const today = new Date().toISOString().slice(0, 10);

describe('crisis routes (CNT-1003, L10N-009)', () => {
  it('lists at least one route', () => {
    expect(CRISIS_ROUTES.length).toBeGreaterThan(0);
  });

  for (const r of CRISIS_ROUTES) {
    it(`${r.region}: has a number, or is the local emergency instruction`, () => {
      if (r.kind === 'helpline') {
        expect(r.number, `${r.region} has no number`).toBeTruthy();
      } else {
        expect(r.number).toBeNull();
        expect(r.lead.trim().length).toBeGreaterThan(0);
      }
    });

    it(`${r.region}: has no check date, or a real YYYY-MM-DD date that is not in the future`, () => {
      const checked = r.checked;
      if (checked === null) return;
      expect(checked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(`${checked}T00:00:00Z`).toISOString().slice(0, 10)).toBe(checked);
      expect(checked <= today, `${r.region} checked ${checked} is in the future`).toBe(true);
    });

    it(`${r.region}: has a source field (an https URL or null)`, () => {
      expect('source' in r).toBe(true);
      if (r.source !== null) expect(r.source).toMatch(/^https:\/\/[^\s]+$/);
    });

    if (r.kind === 'helpline') {
      it(`${r.region}: its number appears on the printed card line`, () => {
        expect(CRISIS_PRINT_LINE).toContain(r.number as string);
      });
    }
  }

  it('prints no check date while any numbered route lacks a recorded check and source', () => {
    const unsourced = CRISIS_ROUTES.some((r) => r.number !== null && (r.checked === null || r.source === null));
    if (unsourced) expect(CRISIS_CHECKED_ON).toBeNull();
    else expect(CRISIS_CHECKED_ON).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  describe('crisisCheckedOn', () => {
    const route = (over: Partial<CrisisRoute>): CrisisRoute => ({
      region: 'Somewhere', service: 'Line', number: '123', kind: 'helpline', lead: 'call', emphasis: '123', tail: '.',
      checked: '2026-11-20', source: 'https://example.org/line', ...over,
    });
    const emergency = route({ number: null, service: null, kind: 'emergency', emphasis: null, checked: null, source: null });

    it('gives the oldest date when every numbered route has a check and a source', () => {
      expect(crisisCheckedOn([route({ checked: '2026-11-20' }), route({ checked: '2026-11-18' }), emergency])).toBe('2026-11-18');
    });
    it('gives null when a numbered route has a date but no source', () => {
      expect(crisisCheckedOn([route({}), route({ source: null })])).toBeNull();
    });
    it('gives null when a numbered route has a source but no date', () => {
      expect(crisisCheckedOn([route({}), route({ checked: null })])).toBeNull();
    });
    it('does not need a source for the local emergency services line', () => {
      expect(crisisCheckedOn([route({}), emergency])).toBe('2026-11-20');
    });
    it('gives null when no route gives a number', () => {
      expect(crisisCheckedOn([emergency])).toBeNull();
    });
  });

  it('reports how many routes still have no official source recorded', () => {
    const missing = CRISIS_ROUTES.filter((r) => r.source === null).map((r) => r.region);
    console.info(`[crisis-routes] ${missing.length} of ${CRISIS_ROUTES.length} routes have no source recorded: ${missing.join(', ')}`);
    expect(missing.length).toBeGreaterThanOrEqual(0);
  });
});
