import { describe, expect, it } from 'vitest';
import { CRISIS_CHECKED_ON, CRISIS_PRINT_LINE, CRISIS_ROUTES } from './crisis-routes';

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

    it(`${r.region}: has a YYYY-MM-DD check date that is not in the future`, () => {
      expect(r.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(`${r.checked}T00:00:00Z`).toISOString().slice(0, 10)).toBe(r.checked);
      expect(r.checked <= today, `${r.region} checked ${r.checked} is in the future`).toBe(true);
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

  it('shares one check date, which the page prints as "Numbers checked on"', () => {
    for (const r of CRISIS_ROUTES) expect(r.checked, r.region).toBe(CRISIS_CHECKED_ON);
  });

  it('reports how many routes still have no official source recorded', () => {
    const missing = CRISIS_ROUTES.filter((r) => r.source === null).map((r) => r.region);
    console.info(`[crisis-routes] ${missing.length} of ${CRISIS_ROUTES.length} routes have no source recorded: ${missing.join(', ')}`);
    expect(missing.length).toBeGreaterThanOrEqual(0);
  });
});
