import { describe, expect, it } from 'vitest';
import { NAME_SIZE, PEOPLE_COUNT, RING_IDS, RING_RADII, TALLY_BOXES, TARGET_CENTER, TARGET_SIZE, ringMarks } from './seated-toss';
import en from '../i18n/play/en.json';

describe('Seated toss tally target (GAME-049)', () => {
  it('has three rings, named from the outside in, each smaller than the one before', () => {
    expect(RING_IDS).toEqual(['near', 'middle', 'far']);
    expect(RING_RADII).toHaveLength(RING_IDS.length);
    RING_RADII.forEach((r, i) => {
      if (i > 0) expect(r).toBeLessThan(RING_RADII[i - 1] as number);
    });
  });

  it('keeps the outer ring inside the drawing, with a margin for the line', () => {
    expect(TARGET_CENTER).toBe(TARGET_SIZE / 2);
    expect((RING_RADII[0] as number) + 4).toBeLessThanOrEqual(TARGET_CENTER);
  });

  it('writes each name inside its own band, so it never sits on a ring line', () => {
    const marks = ringMarks(en.ui.seatedToss.rings);
    expect(marks.map((m) => m.name)).toEqual(['Near', 'Middle', 'Far']);
    marks.forEach((m, i) => {
      const inner = RING_RADII[i + 1] ?? 0;
      const top = TARGET_CENTER - m.nameY + NAME_SIZE * 0.75; // top of the capital letters, as a distance from the centre
      const bottom = TARGET_CENTER - m.nameY; // the baseline, as a distance from the centre
      expect(top, m.name).toBeLessThan(m.radius);
      expect(bottom, m.name).toBeGreaterThanOrEqual(inner === 0 ? 0 : inner);
    });
  });

  it('gives every ring a name, and a column heading to each of the two people', () => {
    expect(en.ui.seatedToss.rings).toHaveLength(RING_IDS.length);
    expect(en.ui.seatedToss.people).toHaveLength(PEOPLE_COUNT);
    expect(TALLY_BOXES).toBeGreaterThanOrEqual(6);
  });

  it('does not invent a name when one is missing', () => {
    expect(ringMarks([]).map((m) => m.name)).toEqual(['', '', '']);
  });
});
