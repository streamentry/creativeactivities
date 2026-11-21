import { describe, expect, it } from 'vitest';
import { PRESSURE_WORDS } from './paths';
import { PLAN_LINES, PLAN_TEXT, planLines, type PlanItem } from './weekly-plan';

const item = (id: string): PlanItem => ({ id, name: `Name ${id}`, time: '15–25 min' });

describe('weekly plan lines (WEB-031)', () => {
  it('pads every sheet to five lines, with the planned activities first', () => {
    const lines = planLines([item('a'), item('b')]);
    expect(lines).toHaveLength(PLAN_LINES);
    expect(lines.slice(0, 2)).toEqual([item('a'), item('b')]);
    expect(lines.slice(2)).toEqual([null, null, null]);
  });

  it('a blank week is five empty lines to write on', () => {
    expect(planLines([])).toEqual([null, null, null, null, null]);
  });

  it('a full sheet is exactly five planned lines', () => {
    const items = ['a', 'b', 'c', 'd', 'e'].map(item);
    expect(planLines(items)).toEqual(items);
  });

  it('refuses a sixth line rather than dropping an activity from the paper', () => {
    const six = ['a', 'b', 'c', 'd', 'e', 'f'].map(item);
    expect(() => planLines(six)).toThrow(/room for 5 lines, not 6/);
  });

  it('keeps the printed words free of streak, schedule and debt language', () => {
    for (const text of Object.values(PLAN_TEXT)) expect(text).not.toMatch(PRESSURE_WORDS);
  });
});
