import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { changeSchema } from './activity-schema';
import { recentChanges, type CardChange } from './activity-changes';
import { PAUSE_LINE, SCOPE_LINE } from './scope';
import { checkClaims } from './claims';

/**
 * Card changelog (WEB-027), scope line (WEB-023, TSA-026) and pause note (TSA-025).
 * The changes on disk must come from real editorial history; see the seed note in
 * docs/specs/global/03-features-web.md (WEB-027).
 */
const dir = new URL('../content/activity-cards/', import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith('.md'));
const frontmatter = (text: string) => text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';

/** Reads the `changes:` block (oldest first, as written on disk). */
function changesOnDisk(fm: string): CardChange[] {
  const lines = fm.split('\n');
  const start = lines.findIndex((l) => l === 'changes:');
  if (start < 0) return [];
  const out: CardChange[] = [];
  for (const line of lines.slice(start + 1)) {
    if (/^\S/.test(line)) break;
    const date = line.match(/^\s+- date: (\d{4}-\d{2}-\d{2})$/);
    if (date) out.push({ date: new Date(`${date[1]}T00:00:00Z`), safety: false, note: '' });
    const last = out[out.length - 1];
    if (!last) continue;
    if (/^\s+safety: true$/.test(line)) last.safety = true;
    const note = line.match(/^\s+note: "(.*)"$/);
    if (note) last.note = note[1];
  }
  return out;
}

const updatedOnDisk = (fm: string) => fm.match(/^updated: (\d{4}-\d{2}-\d{2})$/m)?.[1];

describe('change entries (WEB-027)', () => {
  it('accepts a dated entry with a plain reason', () => {
    const ok = changeSchema.safeParse({ date: '2026-11-15', safety: true, note: 'Added labelled safety flags above the steps.' });
    expect(ok.success).toBe(true);
  });

  it('requires a date and a reason of real length', () => {
    expect(changeSchema.safeParse({ note: 'Added labelled safety flags above the steps.' }).success).toBe(false);
    expect(changeSchema.safeParse({ date: '2026-11-15', note: 'Fixed.' }).success).toBe(false);
  });

  it('defaults safety to false, so only labelled entries are safety changes', () => {
    const parsed = changeSchema.parse({ date: '2026-11-15', note: 'Added a drawing of the finished result.' });
    expect(parsed.safety).toBe(false);
  });
});

describe('recent changes', () => {
  const entry = (date: string, note = 'A change that really happened.'): CardChange => ({
    date: new Date(`${date}T00:00:00Z`),
    safety: false,
    note,
  });

  it('lists the newest first and keeps only the last three', () => {
    const list = recentChanges([entry('2026-11-01'), entry('2026-11-02'), entry('2026-11-03'), entry('2026-11-04')]);
    expect(list.map((c) => c.date.toISOString().slice(0, 10))).toEqual(['2026-11-04', '2026-11-03', '2026-11-02']);
  });

  it('returns nothing for a card with no changes', () => {
    expect(recentChanges([])).toEqual([]);
  });
});

describe('changes on the 53 cards', () => {
  it('lists every card with changes in date order', () => {
    for (const file of files) {
      const changes = changesOnDisk(frontmatter(readFileSync(new URL(file, dir), 'utf8')));
      const dates = changes.map((c) => c.date.getTime());
      expect(dates, file).toEqual([...dates].sort((a, b) => a - b));
    }
  });

  it('never dates a change after the version date the card shows', () => {
    for (const file of files) {
      const fm = frontmatter(readFileSync(new URL(file, dir), 'utf8'));
      const updated = updatedOnDisk(fm);
      expect(updated, file).toBeDefined();
      for (const change of changesOnDisk(fm)) {
        expect(change.date.getTime(), file).toBeLessThanOrEqual(new Date(`${updated}T00:00:00Z`).getTime());
      }
    }
  });

  it('has a non-empty reason on every entry', () => {
    for (const file of files) {
      for (const change of changesOnDisk(frontmatter(readFileSync(new URL(file, dir), 'utf8')))) {
        expect(change.note.length, file).toBeGreaterThanOrEqual(20);
      }
    }
  });
});

describe('scope and pause wording (WEB-023, TSA-025, TSA-026)', () => {
  it('uses the approved "not medical advice" wording and sends health questions to a doctor or care team', () => {
    expect(SCOPE_LINE).toMatch(/for enjoyment and time together/i);
    expect(SCOPE_LINE).toContain('not medical advice');
    expect(SCOPE_LINE).toContain('a doctor or care team');
  });

  it('passes the claims lint', () => {
    expect(checkClaims(SCOPE_LINE, 'scope.ts')).toEqual([]);
    expect(checkClaims(PAUSE_LINE, 'scope.ts')).toEqual([]);
  });

  it('names the signs that suggest pausing in plain words', () => {
    expect(PAUSE_LINE).toMatch(/pain/);
    expect(PAUSE_LINE).toMatch(/distress/);
    expect(PAUSE_LINE).toMatch(/tired/);
  });
});
