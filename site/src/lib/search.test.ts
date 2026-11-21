import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PHRASES, STOPWORDS, SYNONYM_GROUPS } from '../data/search-synonyms';
import { GAMES } from '../data/games';
import { TYPE_LABELS } from './activities';
import { isRetiredGuide } from './retired-guides';
import { alternatives, normalize, prepare, search, stem, words, type SearchEntry } from './search';
import { cardEntry, cardUrl, gameEntry, guideEntry, hubEntry, hubUrl, indexFile, linkGuides } from './search-index';
import { splitFrontmatter } from './yaml-subset';

const entry = (kind: SearchEntry['kind'], title: string, summary = '', text = ''): SearchEntry => ({
  kind,
  title,
  url: `/${title.toLowerCase().replace(/\W+/g, '-')}/`,
  summary,
  text,
});

describe('words, phrases and stems (WEB-003)', () => {
  it('lowercases, drops punctuation and folds phrases into one word', () => {
    expect(normalize('Sing-Along at the Care Home!')).toBe('singalong at the carehome');
    expect(normalize('Older adults, 5 minutes')).toBe('elderly fiveminutes');
    expect(normalize("Nan's  garden")).toBe('nans garden');
  });

  it('reduces plurals and endings to one stem', () => {
    expect(stem('painting')).toBe('paint');
    expect(stem('paints')).toBe('paint');
    expect(stem('brushes')).toBe('brush');
    expect(stem('stories')).toBe('story');
    expect(stem('glass')).toBe('glass');
    expect(stem('art')).toBe('art');
    expect(stem('sing')).toBe('sing');
  });

  it('leaves out filler and the words every page contains', () => {
    expect(words('Ideas for the activities to do with my gran')).toEqual(['gran']);
    for (const w of ['activity', 'activities', 'ideas', 'together']) expect(STOPWORDS.has(w)).toBe(true);
  });
});

describe('the synonym list (WEB-003)', () => {
  const all = SYNONYM_GROUPS.flat();

  it('has thirty or more groups of two or more words (proposal)', () => {
    expect(SYNONYM_GROUPS.length).toBeGreaterThanOrEqual(30);
    for (const group of SYNONYM_GROUPS) expect(group.length, group.join(',')).toBeGreaterThanOrEqual(2);
  });

  it('keeps every word lowercase, single and in one group only', () => {
    for (const w of all) expect(w, w).toMatch(/^[a-z]+$/);
    expect(new Set(all).size).toBe(all.length);
  });

  it('never maps an everyday word to a condition, a diagnosis or a treatment', () => {
    const forbidden =
      /dementia|alzheimer|autis|adhd|depress|anxi|ptsd|trauma|stroke|parkinson|disorder|syndrome|diagnos|therap|treat|cure|heal|medic|forget|confus|impair|disab|patient|sufferer|memoryloss/i;
    for (const w of all) expect(w, w).not.toMatch(forbidden);
  });

  it('folds each phrase to a word that exists in a group, and no phrase twice', () => {
    const stems = new Set(all.map(stem));
    for (const [phrase, word] of PHRASES) expect(stems.has(stem(word)), `${phrase} -> ${word}`).toBe(true);
    expect(new Set(PHRASES.map(([p]) => p)).size).toBe(PHRASES.length);
  });

  it('treats every word of a group as the others', () => {
    expect(alternatives(stem('nan'))).toContain(stem('grandmother'));
    expect(alternatives(stem('watercolour'))).toContain(stem('painting'));
    expect(alternatives('zzzqx')).toEqual(['zzzqx']);
  });
});

describe('search (WEB-003)', () => {
  const index = prepare([
    entry('activity', 'Paint with watercolors', 'Paint soft colors on thick paper', 'brush paper water'),
    entry('activity', 'Make a greeting card', 'Fold and decorate a card for someone', 'glue stick paper'),
    entry('activity', 'Hold a sing-along at home', 'Sing a few songs together', 'music'),
    entry('hub', 'Grandparent and grandchild activities', 'Things to make with a grandchild'),
    entry('hub', 'Rainy day activities', 'Indoor table crafts for a wet afternoon'),
    entry('guide', 'Crafts for kids on a rainy day', 'Ideas for indoors', 'paper paint'),
    entry('game', 'Picture pairs', 'Match two pictures', ''),
  ]);
  const titles = (q: string) => search(index, q).groups.flatMap((g) => g.hits.map((h) => h.entry.title));

  it('finds a page by a word in its title, a synonym, or another form of the word', () => {
    expect(titles('watercolor')).toContain('Paint with watercolors');
    expect(titles('painting')).toContain('Paint with watercolors');
    expect(titles('watercolour')).toContain('Paint with watercolors');
    expect(titles('nan')).toContain('Grandparent and grandchild activities');
    expect(titles('granny')).toContain('Grandparent and grandchild activities');
    expect(titles('sing along')).toContain('Hold a sing-along at home');
    expect(titles('inside')).toEqual([]);
  });

  it('reaches the same pages whichever words a person uses for the same thing', () => {
    expect(titles('rainy day')).toEqual(titles('indoors'));
    expect(titles('mom')).toEqual(titles('mum'));
  });

  it('wants every word, and says so when only some match', () => {
    const all = search(index, 'paint paper');
    expect(all.match).toBe('all');
    const some = search(index, 'paint elephant');
    expect(some.match).toBe('some');
    expect(some.groups.flatMap((g) => g.hits.map((h) => h.entry.title))).toContain('Paint with watercolors');
  });

  it('says nothing matched, rather than guessing, and for a question with no meaningful word', () => {
    expect(search(index, 'zzzqx').match).toBe('none');
    expect(search(index, 'the and for').match).toBe('none');
    expect(search(index, '   ').count).toBe(0);
    expect(search(index, 'zzzqx').groups).toEqual([]);
  });

  it('offers the activity finder whenever no card or situation is in the answer (WEB-003)', () => {
    expect(search(index, 'zzzqx').finder).toBe(true);
    expect(search(index, 'the and for').finder).toBe(true);
    expect(search(index, 'paint').finder).toBe(false);
    expect(search(index, 'pictures').finder).toBe(true);
  });

  it('lists activities first, then situations, games and guides', () => {
    const kinds = search(index, 'rainy paper').groups.map((g) => g.kind);
    const order = ['activity', 'hub', 'game', 'guide'];
    expect([...kinds].sort((a, b) => order.indexOf(a) - order.indexOf(b))).toEqual(kinds);
    expect(search(index, 'pictures').groups[0]?.kind).toBe('game');
  });

  it('ranks a word in the title above the same word in the summary or the hidden text', () => {
    const ranked = prepare([
      entry('activity', 'Plain card', 'about glue'),
      entry('activity', 'Glue pictures', 'about card'),
      entry('activity', 'Something else', 'no match', 'glue'),
    ]);
    const hits = search(ranked, 'glue').groups[0]?.hits.map((h) => h.entry.title);
    expect(hits).toEqual(['Glue pictures', 'Plain card', 'Something else']);
  });

  it('caps the results shown for each kind', () => {
    const many = prepare(Array.from({ length: 30 }, (_, i) => entry('activity', `Paint ${i}`, 'paint')));
    expect(search(many, 'paint', 12).groups[0]?.hits).toHaveLength(12);
  });

  it('gives the same results for the same question every time', () => {
    expect(search(index, 'paper')).toEqual(search(index, 'paper'));
  });
});

describe('the search index file (WEB-003)', () => {
  it('lists each address once, in a stable order', () => {
    const a = entry('guide', 'B guide');
    const b = entry('activity', 'A card');
    const file = indexFile([a, b, a]);
    expect(file.entries.map((e) => e.title)).toEqual(['A card', 'B guide']);
    expect(file.version).toBe(1);
  });

  it('caps the hidden text so the file stays small', () => {
    const long = 'word '.repeat(2000);
    const e = cardEntry('x', { name: 'N', summary: 'S', description: long, materials: [] }, 'Craft');
    expect(e.text.length).toBeLessThanOrEqual(900);
  });
});

// ---- The real pages ----

const CONTENT = new URL('../content/', import.meta.url);
const files = (dir: string) =>
  (readdirSync(new URL(dir, CONTENT), { recursive: true }) as string[]).filter((f) => f.endsWith('.md')).map((f) => f.split('\\').join('/'));
const data = (dir: string, f: string) => splitFrontmatter(readFileSync(new URL(`${dir}${f}`, CONTENT), 'utf8')).frontmatter;

const linkSources: { url: string; guides: string[] }[] = [];
const real = linkGuides(
  [
    ...files('activity-cards/').map((f) => {
      const id = f.replace(/\.md$/, '');
      const d = data('activity-cards/', f) as never as Parameters<typeof cardEntry>[1] & {
        type: keyof typeof TYPE_LABELS;
        withdrawn?: unknown;
        guides?: string[];
      };
      if (d.withdrawn) return null;
      linkSources.push({ url: cardUrl(id), guides: d.guides ?? [] });
      return cardEntry(id, d, TYPE_LABELS[d.type]);
    }),
    ...files('hubs/').map((f) => {
      const id = f.replace(/\.md$/, '');
      const d = data('hubs/', f) as never as { guides?: string[] };
      linkSources.push({ url: hubUrl(id), guides: d.guides ?? [] });
      return hubEntry(id, d as never);
    }),
    ...files('guides/')
      .filter((f) => !isRetiredGuide(f.replace(/\.md$/, '')))
      .map((f) => guideEntry(f.replace(/\.md$/, ''), data('guides/', f) as never)),
    ...GAMES.map((g) => gameEntry(g)),
  ].filter((e): e is SearchEntry => e !== null),
  linkSources,
);
const realIndex = prepare(indexFile(real).entries);
const found = (q: string) => search(realIndex, q).groups.flatMap((g) => g.hits.map((h) => h.entry.url));

describe('search over the real pages (WEB-003)', () => {
  it('covers activities, situations, games and guides', () => {
    const kinds = new Set(real.map((e) => e.kind));
    expect([...kinds].sort()).toEqual(['activity', 'game', 'guide', 'hub']);
    expect(real.filter((e) => e.kind === 'activity').length).toBeGreaterThanOrEqual(50);
  });

  it('leaves out the retired guides, which have no English page', () => {
    expect(real.some((e) => e.kind === 'guide' && isRetiredGuide(e.url.replace(/^\/|\/$/g, '')))).toBe(false);
  });

  it('points every result at an address the site builds', () => {
    const cards = new Set(files('activity-cards/').map((f) => `/activity/${f.replace(/\.md$/, '')}/`));
    for (const e of real.filter((x) => x.kind === 'activity')) expect(cards.has(e.url), e.url).toBe(true);
    for (const e of real) expect(e.url, e.title).toMatch(/^\/[a-z0-9/-]+\/$/);
  });

  it.each([
    ['rainy day', '/occasions/rainy-day/'],
    ['five minutes', '/occasions/short-break/'],
    ['gift', '/occasions/gift/'],
    ['visiting someone', '/occasions/visit/'],
    ['nan', '/grandparent-grandchild-activities/'],
    ['grandma', '/grandparent-grandchild-activities/'],
    ['bed rest', '/bedside-activities/'],
    ['sing along', '/activity/hold-a-sing-along-at-home/'],
    ['painting', '/activity/paint-with-watercolors/'],
    ['photos', '/activity/look-through-a-photo-album/'],
  ])('finds "%s" at %s', (q, url) => {
    expect(found(q)).toContain(url);
  });

  it('answers a made-up word with nothing, never a guess', () => {
    expect(search(realIndex, 'qzxvw').match).toBe('none');
  });
});

describe('what a person types is never kept (WEB-003, PLAT-022)', () => {
  const source = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
  const code = ['../tools/Search.tsx', './search.ts', './search-index.ts', '../data/search-synonyms.ts'].map((p) => [p, source(p)] as const);

  it('stores, sends and counts nothing the visitor types', () => {
    for (const [file, text] of code) {
      expect(text, file).not.toMatch(/localStorage|sessionStorage|indexedDB|document\.cookie|sendBeacon|gtag|dataLayer|\btrack\(/);
    }
  });

  it('keeps the question out of the address, so page-view reports cannot see it', () => {
    for (const [file, text] of code) {
      expect(text, file).not.toMatch(/history\.(?:push|replace)State|location\.(?:search|hash|href|assign|replace)|URLSearchParams/);
    }
  });

  it('makes one request only, for the index on this site', () => {
    const [, island] = code[0] as readonly [string, string];
    const requests = island.match(/fetch\(([^)]*)\)/g) ?? [];
    expect(requests).toEqual(["fetch('/search-index.json')"]);
    expect(island).not.toMatch(/\bXMLHttpRequest\b|\bWebSocket\b|new Image\(/);
  });

  it('fires no analytics event for a search', async () => {
    const { EVENT_DICTIONARY } = await import('./track');
    expect(Object.keys(EVENT_DICTIONARY).some((name) => /search/i.test(name))).toBe(false);
  });
});

describe('a guide-only match (WEB-003)', () => {
  const card = { ...entry('activity', 'Paint with watercolors', 'Paint soft colors'), url: '/activity/paint-with-watercolors/' };
  const linkedGuide = {
    ...entry('guide', 'Crafts for kids on a rainy day', 'Ideas for indoors'),
    url: '/crafts/rainy-day/',
    linked: ['/activity/paint-with-watercolors/'],
  };
  const orphanGuide = { ...entry('guide', 'Notes on rainy weather', 'Ideas for a wet day'), url: '/notes/rainy/' };
  const hitsOf = (r: ReturnType<typeof search>) => r.groups.flatMap((g) => g.hits.map((h) => h.entry));

  it('still returns the card or situation that the matched guide links to', () => {
    const shown = hitsOf(search(prepare([card, linkedGuide]), 'rainy'));
    expect(shown.some((e) => e.kind === 'activity' || e.kind === 'hub')).toBe(true);
    expect(shown.map((e) => e.url)).toContain('/activity/paint-with-watercolors/');
  });

  // WEB-003: a guide that no card or situation links to does not appear alone as a result.
  it('does not show a guide that no card or situation links to when it would be the only answer', () => {
    const r = search(prepare([card, orphanGuide]), 'rainy');
    expect(hitsOf(r)).toEqual([]);
    expect(r.match).toBe('none');
    expect(r.finder).toBe(true);
  });

  it('leaves the results alone when a card or situation already matches', () => {
    const r = search(prepare([card, linkedGuide]), 'paint');
    expect(hitsOf(r).map((e) => e.url)).toEqual(['/activity/paint-with-watercolors/']);
  });

  // WEB-003: no guide is shown without a card or situation beside it. Guides that no page links to
  // (14 English guides on 2026-11-21) are left out when they would be alone; they do not count as answers.
  it('never shows a guide alone, on the real pages', () => {
    for (const guide of real.filter((e) => e.kind === 'guide')) {
      const shown = hitsOf(search(realIndex, guide.title));
      if (shown.some((e) => e.kind === 'guide')) {
        expect(shown.some((e) => e.kind === 'activity' || e.kind === 'hub'), guide.title).toBe(true);
      }
    }
  });
});

describe('a game-only match (WEB-003)', () => {
  const game = { ...entry('game', 'Picture pairs', 'Match two pictures'), url: '/games/picture-pairs/' };
  const paint = { ...entry('activity', 'Paint with watercolors', 'Paint soft colors'), url: '/activity/paint-with-watercolors/' };
  const album = { ...entry('activity', 'Look through a photo album', 'Share old snapshots'), url: '/activity/look-through-a-photo-album/' };
  const hitsOf = (r: ReturnType<typeof search>) => r.groups.flatMap((g) => g.hits.map((h) => h.entry));

  it('leads to a card that shares a word with the question, under the game', () => {
    const r = search(prepare([paint, album, game]), 'picture pairs');
    expect(hitsOf(r).map((e) => e.url)).toContain('/games/picture-pairs/');
    expect(hitsOf(r).map((e) => e.url)).toContain('/activity/look-through-a-photo-album/');
    expect(r.finder).toBe(false);
  });

  it('offers the activity finder when no card or situation shares a word with it', () => {
    const r = search(prepare([paint, game]), 'pictures');
    expect(hitsOf(r).map((e) => e.url)).toEqual(['/games/picture-pairs/']);
    expect(r.finder).toBe(true);
  });

  it('gives every real game a card or situation when its name is typed', () => {
    const withoutCard = GAMES.filter((g) => {
      const kinds = search(realIndex, g.name).groups.flatMap((x) => x.hits.map((h) => h.entry.kind));
      return !kinds.some((k) => k === 'activity' || k === 'hub');
    }).map((g) => g.name);
    expect(withoutCard, withoutCard.join('; ')).toEqual([]);
  });
});
