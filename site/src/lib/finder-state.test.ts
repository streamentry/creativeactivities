import { describe, expect, it } from 'vitest';
import {
  FINDER_SETTINGS,
  countFitFilters,
  parseFinderState,
  serializeFinderState,
  shouldNoindex,
} from './finder-state';

describe('finder state in the URL (WEB-005)', () => {
  it('writes only the choices that are not "any", in a fixed order', () => {
    expect(serializeFinderState({})).toBe('');
    expect(serializeFinderState({ time: 'any', materials: 'any', type: 'any' })).toBe('');
    expect(serializeFinderState({ setting: 'seated', time: '15' })).toBe('time=15&setting=seated');
  });

  it('round-trips every offered choice back to the same state', () => {
    const choice = {
      time: '30',
      materials: 'none',
      type: 'music',
      setting: 'bedside',
      group: 'intergenerational',
      mess: 'low',
      energy: 'low',
      sense: 'hearing',
      talking: 'none',
      supervision: 'nearby',
      avoid: ['heat', 'small-parts'],
    };
    const query = serializeFinderState(choice);
    expect(parseFinderState(`?${query}`)).toEqual({ ...choice, avoid: ['small-parts', 'heat'] });
  });

  it('writes avoided safety flags as repeated parameters in a fixed order, once each', () => {
    expect(serializeFinderState({ avoid: ['heat', 'heat', 'small-parts'] })).toBe('avoid=small-parts&avoid=heat');
    expect(serializeFinderState({ avoid: [] })).toBe('');
  });

  it('never writes free text or anything that is not a facet value', () => {
    // The search box is not a facet: its words must never reach the query string.
    const query = serializeFinderState({ type: 'art', sense: 'any' } as Parameters<typeof serializeFinderState>[0]);
    expect(query).toBe('type=art');
    expect(serializeFinderState({ type: '<script>' })).toBe('');
  });

  it('ignores unknown keys, unknown values and "any" when reading', () => {
    expect(parseFinderState('?time=99&setting=standing&type=nope&q=secret&words=garden')).toEqual({});
    expect(parseFinderState('?time=any&setting=any')).toEqual({});
    expect(parseFinderState('')).toEqual({});
    expect(parseFinderState('?avoid=sharp-tool&avoid=not-a-flag')).toEqual({ avoid: ['sharp-tool'] });
  });

  it('offers only the settings the finder shows', () => {
    expect([...FINDER_SETTINGS]).toEqual(['seated', 'bedside', 'outdoors']);
    expect(parseFinderState('?setting=tabletop')).toEqual({});
  });
});

describe('noindex for combinations of fit filters (WEB-005)', () => {
  it('counts only the optional fit filters, not the first three questions', () => {
    expect(countFitFilters({ time: '15', materials: 'none', type: 'art' })).toBe(0);
    expect(countFitFilters({ setting: 'seated', mess: 'low', energy: 'low' })).toBe(3);
    expect(countFitFilters({ avoid: ['heat'] })).toBe(1);
    expect(countFitFilters({ avoid: [] })).toBe(0);
  });

  it('is noindex from three fit filters, and indexable below that', () => {
    expect(shouldNoindex({ setting: 'seated', mess: 'low' })).toBe(false);
    expect(shouldNoindex({ setting: 'seated', mess: 'low', energy: 'low' })).toBe(true);
    expect(shouldNoindex({ time: '15', materials: 'none', type: 'art' })).toBe(false);
  });
});
