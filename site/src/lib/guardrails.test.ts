import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * MET-035, dark-pattern guardrails: the count of prompts that create urgency is zero, and it is a test and not a promise.
 * AGENTS.md and DESIGN.md ban a stopwatch, a move count, a streak, confetti, a countdown and an auto-closing dialog, and
 * every guilt, pressure or urgency prompt. This scans the site's own code and English copy for them. It is a floor: a
 * clean scan does not prove the experience is gentle, which is a person's judgment, and the complaints and the monthly
 * report that MET-035 also asks for are not here.
 */
const SRC = new URL('../', import.meta.url).pathname;

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

const CODE_DIRS = ['pages', 'views', 'components', 'tools', 'games', 'layouts', 'lib', 'data'];
const code = CODE_DIRS.flatMap((d) => walk(join(SRC, d))).filter((f) => /\.(astro|tsx?|mjs)$/.test(f) && !/\.test\.tsx?$/.test(f));
// The English words a visitor reads: cards, hubs and the interface. Guides explain these patterns, so they are not scanned.
const copy = [...walk(join(SRC, 'content/activity-cards')), ...walk(join(SRC, 'content/hubs')), join(SRC, 'i18n/ui/en.json')].filter((f) => /\.(md|json)$/.test(f));

const name = (file: string) => relative(SRC, file);

/** Files that hold the list of words a page must never use, so they contain those words. Their own tests scan the pages. */
const VOCABULARY = new Set(['lib/paths.ts']);
const hits = (files: string[], pattern: RegExp): string[] =>
  files.flatMap((file) =>
    readFileSync(file, 'utf8')
      .split('\n')
      .flatMap((line, i) => (pattern.test(line) ? [`${name(file)}:${i + 1}: ${line.trim().slice(0, 100)}`] : [])),
  );

/** Phrases that push a person to act now or hold them to a run. */
const URGENCY = /\b(?:act now|last chance|don.?t miss|limited time|only \d+ (?:left|spots|seats)|expires? (?:soon|today|in \d)|before it.s too late|while supplies last|hurry up|offer ends|sale ends)\b/i;
/** Phrases that count a person's days, or tell them they fell short. Saying a page has no streak is not one of these. */
const GUILT = /\b(?:days?|weeks?) in a row\b|\bkeep it up\b|\byou(?:['’]ve| have)? missed\b|\bbreak the chain\b|\bdon.?t lose your\b|\b\d+[- ]day streak\b|\bcurrent streak\b|\bstreak (?:count|counter|bonus)\b/i;
/** A stopwatch, a countdown, a score table, a move count, lives, confetti. */
const SCORE_AND_CLOCK = /confetti|fireworks|countdown|stopwatch|\bhigh ?score\b|\bleaderboard\b|\bscoreboard\b|\bmoveCount\b|\bmovesMade\b|\btriesLeft\b|\blives(?:Left|Remaining)\b/i;
/** The browser asking to interrupt a person: a notification, a push message, a buzz, a badge on the icon. */
const INTERRUPT = /Notification\.requestPermission|serviceWorker\.register|pushManager|navigator\.vibrate|setAppBadge/;
/** Emoji used as praise (party popper, trophy, star, fire, clapping hands, glowing star), written out or as an escape. */
const EMOJI_PRAISE = /[\u{1F389}\u{1F3C6}\u{2B50}\u{1F525}\u{1F44F}\u{1F31F}]|\\u\{?(?:1F389|1F3C6|2B50|1F525|1F44F|1F31F)\}?/iu;

describe('no urgency, guilt, score or clock in what the site shows (MET-035)', () => {
  const scanned = code.filter((f) => !VOCABULARY.has(name(f)));

  it('scans the whole interface and its English copy', () => {
    expect(code.length).toBeGreaterThan(150);
    expect(copy.length).toBeGreaterThan(60);
    expect(code.some((f) => name(f).startsWith('games/'))).toBe(true);
    expect(copy.some((f) => name(f).endsWith('i18n/ui/en.json'))).toBe(true);
  });

  it('has no prompt that creates urgency', () => {
    expect(hits([...scanned, ...copy], URGENCY)).toEqual([]);
  });

  it('counts no one’s days and tells no one they fell short', () => {
    expect(hits([...scanned, ...copy], GUILT)).toEqual([]);
  });

  it('has no stopwatch, countdown, score table, move count, lives or confetti in its code', () => {
    expect(hits(scanned, SCORE_AND_CLOCK)).toEqual([]);
  });

  it('never asks the browser to interrupt a person', () => {
    expect(hits(scanned, INTERRUPT)).toEqual([]);
  });

  it('uses no emoji as praise', () => {
    expect(hits([...scanned, ...copy], EMOJI_PRAISE)).toEqual([]);
  });
});

/**
 * Every timer in the interface, and why it is not pressure. A new timer fails this test until someone has looked at what it
 * shows and listed it here. None of these shows a person a clock or ends anything on its own.
 */
const TIMERS: Record<string, { calls: number; why: string }> = {
  'games/CalmBreathing.tsx': { calls: 1, why: 'paces the breathing animation (in, hold, out); it shows no count of time and ends only with a kind message' },
  'games/FourTogether.tsx': { calls: 1, why: 'offers a hint after a 20 second pause, only when hints are on; Rest stops it, and it never ends or scores the game' },
  'games/OddOneOut.tsx': { calls: 1, why: 'offers a hint after a 20 second pause, only when hints are on; Rest stops it, and it never ends or scores the game' },
  'lib/games/photo-hint.ts': { calls: 3, why: 'the Photo pairs hint wait: one pause of 20 seconds after the last tap, cleared and started again on every tap, and cancelled when Rest, hints off or a finished board stops it' },
  'games/shared/ReadAloud.tsx': { calls: 1, why: 'asks the speech engine every 0.4 seconds whether it has finished, so the button can change back' },
  'pages/your-data.astro': { calls: 1, why: 'releases the file made for a download right after it starts' },
  // Listed here for the describe-your-situation box, which is a separate change: the entry stays true once that file exists.
  'tools/DescribeSituation.tsx': { calls: 2, why: 'two waits of 350 milliseconds after typing stops: one before the finder is updated, so the page is not redrawn on every letter, and one before the reading is announced, so a screen reader is not spoken to on every letter; neither shows a clock or ends anything' },
};

describe('every timer in the interface is accounted for (MET-035)', () => {
  const found = new Map<string, number>();
  for (const file of code) {
    const calls = (readFileSync(file, 'utf8').match(/\b(?:setTimeout|setInterval)\(/g) ?? []).length;
    if (calls > 0) found.set(name(file), calls);
  }

  it('has no timer that is not listed with its reason', () => {
    const unlisted = [...found].filter(([file, calls]) => (TIMERS[file]?.calls ?? 0) < calls).map(([file, calls]) => `${file} has ${calls}`);
    expect(unlisted, 'look at what the timer shows, then list it in TIMERS').toEqual([]);
  });

  it('lists no timer that has gone, so the list stays true', () => {
    // A listed file that is not in this build yet (its change has not landed) is allowed; a file that is here must match.
    const gone = Object.entries(TIMERS)
      .filter(([file, { calls }]) => existsSync(join(SRC, file)) && (found.get(file) ?? 0) !== calls)
      .map(([file]) => file);
    expect(gone).toEqual([]);
  });

  it('gives every timer a reason of its own', () => {
    for (const [file, { why }] of Object.entries(TIMERS)) expect(why.length, file).toBeGreaterThan(30);
  });
});

describe('each pattern matches what it names (so a rotted pattern cannot pass the scan)', () => {
  it('urgency, guilt, clock and score, interruption and emoji praise', () => {
    expect('Last chance to join').toMatch(URGENCY);
    expect('You’ve missed a day').toMatch(GUILT);
    expect('You\'ve missed a day').toMatch(GUILT);
    expect('a 5 day streak').toMatch(GUILT);
    expect('show the countdown').toMatch(SCORE_AND_CLOCK);
    expect('Notification.requestPermission()').toMatch(INTERRUPT);
    expect('Well done! 🎉').toMatch(EMOJI_PRAISE);
  });
});
