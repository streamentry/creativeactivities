import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * WEB-073 (image consent and rights log) and WEB-072 (child-facing pages rule),
 * checked at publish time: every picture a card page shows has a log entry, no
 * card shows a person or a child, and no page may be marked child-directed until
 * a privacy review record exists. This states the product rule, not legal advice.
 */
const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const CARDS = join(ROOT, 'site/src/content/activity-cards');
const REGISTER = JSON.parse(readFileSync(join(ROOT, 'docs/specs/asset-provenance.json'), 'utf8')) as {
  site_images: { url: string; people_depicted: boolean; child_depicted: boolean; rights_status: string }[];
};
const logged = new Map(REGISTER.site_images.map((i) => [i.url, i]));

const cardFiles = readdirSync(CARDS).filter((f) => f.endsWith('.md'));
const cards = cardFiles.map((f) => ({ file: f, text: readFileSync(join(CARDS, f), 'utf8') }));

/** Each `images:` entry's src and people value, read from the card's front matter. */
function cardImages(text: string): { src: string; people: string }[] {
  const fm = text.split('\n---')[0] ?? '';
  const blocks = fm.split(/\n  - src: /).slice(1);
  return blocks.map((b) => ({
    src: (b.split('\n')[0] ?? '').trim(),
    people: /\n\s+people: (\S+)/.exec(b)?.[1] ?? 'missing',
  }));
}

describe('card images and the rights log (WEB-073)', () => {
  it('reads every card', () => {
    expect(cards.length).toBeGreaterThan(40);
  });

  it('gives every picture on a card page a log entry', () => {
    const missing = cards.flatMap((c) => cardImages(c.text).filter((i) => !logged.has(i.src)).map((i) => `${c.file}: ${i.src}`));
    expect(missing).toEqual([]);
  });

  it('shows no person and no child in any card picture, and the log agrees', () => {
    const offenders = cards.flatMap((c) =>
      cardImages(c.text)
        .filter((i) => i.people !== 'none' || logged.get(i.src)?.people_depicted || logged.get(i.src)?.child_depicted)
        .map((i) => `${c.file}: ${i.src}`),
    );
    expect(offenders).toEqual([]);
  });

  it('uses only the register's two rights statuses', () => {
    const odd = REGISTER.site_images.filter((i) => !['unreviewed', 'reviewed'].includes(i.rights_status));
    expect(odd).toEqual([]);
  });
});

describe('child-directed pages need a privacy review first (WEB-072)', () => {
  const content = join(ROOT, 'site/src/content');
  const files = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(join(dir, e.name)) : e.name.endsWith('.md') ? [join(dir, e.name)] : []));
  const marked = files(content).filter((f) => /^childDirected:\s*true/m.test(readFileSync(f, 'utf8')));
  const reviewRecord = join(ROOT, 'docs/privacy/child-pages-review.md');

  it('has no page marked child-directed unless a review record exists', () => {
    if (marked.length > 0) expect(existsSync(reviewRecord), `${marked.length} child-directed page(s) and no ${reviewRecord}`).toBe(true);
  });

  it('keeps child-directed pages free of forms and third-party scripts', () => {
    for (const f of marked) {
      const text = readFileSync(f, 'utf8');
      expect(text, f).not.toMatch(/<form|<input|<script|<iframe/i);
    }
  });

  it('the front-matter marker is recognised', () => {
    expect(/^childDirected:\s*true/m.test('title: x\nchildDirected: true\n')).toBe(true);
  });
});
