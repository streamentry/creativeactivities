import { describe, expect, it } from 'vitest';
import { ONE_IDEA_LIMIT, ideaAt, ideaEndText } from './one-idea';

describe('one idea right now (WEB-007)', () => {
  const slugs = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

  it('stops after a short run, never an endless feed', () => {
    expect(ONE_IDEA_LIMIT).toBeLessThanOrEqual(5);
    expect(ideaAt(slugs, ONE_IDEA_LIMIT - 1).more).toBe(false);
    expect(ideaAt(slugs, ONE_IDEA_LIMIT).slug).toBeNull();
  });

  it('follows the fit order of the list', () => {
    expect(ideaAt(slugs, 0)).toEqual({ slug: 'a', position: 1, more: true });
    expect(ideaAt(slugs, 1).slug).toBe('b');
  });

  it('ends early when fewer cards fit', () => {
    expect(ideaAt(['a', 'b'], 1)).toEqual({ slug: 'b', position: 2, more: false });
    expect(ideaAt([], 0)).toEqual({ slug: null, position: 1, more: false });
  });

  it('says plainly when the run is over', () => {
    expect(ideaEndText(5)).toBe('That was 5 ideas. Choose one to start, or look through the full list below.');
    expect(ideaEndText(1)).toContain('one idea');
    expect(ideaEndText(0)).toContain('Nothing fits');
  });
});
