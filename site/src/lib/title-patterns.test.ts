import { describe, expect, it } from 'vitest';
import {
  SITE_TITLE_SUFFIX,
  breadcrumbCurrent,
  normalisePatternText,
  pageTypeOf,
  patternCollisions,
  patternOf,
  stripSiteSuffix,
  type PageTypeContext,
  type PatternEntry,
} from './title-patterns';

const ctx: PageTypeContext = {
  guideSections: new Set(['activities', 'caregiving']),
  hubSlugs: new Set(['dementia-activities', 'bedside-activities']),
};

describe('pageTypeOf', () => {
  it('classifies an English activity card', () => {
    expect(pageTypeOf('/activity/draw-to-music/', 'en', ctx)).toBe('activity');
  });

  it('strips a non-English language prefix before classifying', () => {
    expect(pageTypeOf('/fr/activity/draw-to-music/', 'fr', ctx)).toBe('activity');
    expect(pageTypeOf('/fr/games/solo/', 'fr', ctx)).toBe('game');
  });

  it('classifies the large-print variant of an activity as printable', () => {
    expect(pageTypeOf('/activity/draw-to-music/large-print/', 'en', ctx)).toBe('printable');
  });

  it('classifies printables and games', () => {
    expect(pageTypeOf('/printables/what-i-have-checklist/', 'en', ctx)).toBe('printable');
    expect(pageTypeOf('/games/solo/', 'en', ctx)).toBe('game');
    expect(pageTypeOf('/games/', 'en', ctx)).toBe('hub');
  });

  it('classifies section indexes and held hubs as hub, and section articles as guide', () => {
    expect(pageTypeOf('/activities/', 'en', ctx)).toBe('hub');
    expect(pageTypeOf('/dementia-activities/', 'en', ctx)).toBe('hub');
    expect(pageTypeOf('/caregiving/some-guide/', 'en', ctx)).toBe('guide');
    expect(pageTypeOf('/paths/bedside/', 'en', ctx)).toBe('hub');
  });

  it('puts everything else, including the home page and packs, in other', () => {
    expect(pageTypeOf('/', 'en', ctx)).toBe('other');
    expect(pageTypeOf('/fr/', 'fr', ctx)).toBe('other');
    expect(pageTypeOf('/about/', 'en', ctx)).toBe('other');
    expect(pageTypeOf('/activity/packs/starter/', 'en', ctx)).toBe('other');
    expect(pageTypeOf('/activity/draw-to-music/extra/deep/', 'en', ctx)).toBe('other');
  });
});

describe('normalisePatternText', () => {
  it('lowercases and collapses whitespace, including non-breaking spaces', () => {
    expect(normalisePatternText('  Draw  To   Music ')).toBe('draw to music');
  });
});

describe('stripSiteSuffix', () => {
  it('removes the brand suffix only at the end', () => {
    expect(stripSiteSuffix(`Draw to music${SITE_TITLE_SUFFIX}`)).toBe('Draw to music');
    expect(stripSiteSuffix('Creative Activities guide')).toBe('Creative Activities guide');
  });
});

describe('breadcrumbCurrent', () => {
  it('returns the text of the current-page crumb', () => {
    const html =
      '<nav class="breadcrumbs container" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li>' +
      '<li><span aria-current="page">Draw <em>to</em> music</span></li></ol></nav>';
    expect(breadcrumbCurrent(html)).toBe('Draw to music');
  });

  it('returns undefined when the page has no breadcrumb', () => {
    expect(breadcrumbCurrent('<main><h1>Hi</h1></main>')).toBeUndefined();
  });
});

describe('patternOf', () => {
  it('replaces the subject with a placeholder in both title and H1', () => {
    expect(patternOf('Draw to music | Creative Activities', 'Draw to music')).toBe('{subject} | creative activities');
    expect(patternOf('Draw to music together', 'draw TO music')).toBe('{subject} together');
  });

  it('replaces every occurrence and leaves text unchanged when the subject is absent', () => {
    expect(patternOf('Music and music', 'music')).toBe('{subject} and {subject}');
    expect(patternOf('Guide to sitting', 'Draw to music')).toBe('guide to sitting');
  });

  it('only normalises when there is no subject', () => {
    expect(patternOf('  Some   Guide ', undefined)).toBe('some guide');
    expect(patternOf('Some Guide', '')).toBe('some guide');
  });
});

function entry(id: string, patch: Partial<PatternEntry> = {}): PatternEntry {
  return {
    id,
    lang: 'en',
    type: 'activity',
    title: 'Draw to music | Creative Activities',
    h1: 'Draw to music',
    subject: 'Draw to music',
    ...patch,
  };
}

describe('patternCollisions', () => {
  it('shares a template across different subjects without flagging it', () => {
    const groups = patternCollisions([
      entry('/activity/a/'),
      entry('/activity/b/', { title: 'Fold a boat | Creative Activities', h1: 'Fold a boat', subject: 'Fold a boat' }),
    ]);
    expect(groups).toEqual([]);
  });

  it('flags two pages of the same type with the same subject and the same title and H1 pattern', () => {
    const groups = patternCollisions([entry('/activity/a/'), entry('/activity/a-copy/', { subject: 'draw to MUSIC' })]);
    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({ lang: 'en', type: 'activity', subject: 'draw to music', ids: ['/activity/a/', '/activity/a-copy/'] });
  });

  it('does not flag pages of different types or languages', () => {
    expect(patternCollisions([entry('/activity/a/'), entry('/activity/a/large-print/', { type: 'printable' })])).toEqual([]);
    expect(patternCollisions([entry('/activity/a/'), entry('/fr/activity/a/', { lang: 'fr' })])).toEqual([]);
  });

  it('does not flag pages whose H1 pattern differs', () => {
    const groups = patternCollisions([entry('/activity/a/'), entry('/activity/a-2/', { h1: 'Draw to music, slowly' })]);
    expect(groups).toEqual([]);
  });

  it('flags same-pattern pages that share no detectable subject', () => {
    const groups = patternCollisions([
      entry('/activity/x/', { type: 'other', title: 'Guide | Creative Activities', h1: 'Guide', subject: undefined }),
      entry('/activity/y/', { type: 'other', title: 'Guide | Creative Activities', h1: 'Guide', subject: undefined }),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].ids).toHaveLength(2);
  });

  it('skips pages without a title or H1 and reports groups in a stable order', () => {
    const groups = patternCollisions([
      entry('/activity/z/', { title: '', h1: '' }),
      entry('/activity/z2/', { title: '', h1: '' }),
      entry('/activity/b/', { subject: 'B', title: 'B | Creative Activities', h1: 'B' }),
      entry('/activity/b2/', { subject: 'B', title: 'B | Creative Activities', h1: 'B' }),
      entry('/activity/a/'),
      entry('/activity/a2/', { subject: 'Draw to music' }),
    ]);
    expect(groups.map((g) => g.ids.join(','))).toEqual(['/activity/a/,/activity/a2/', '/activity/b/,/activity/b2/']);
  });
});
