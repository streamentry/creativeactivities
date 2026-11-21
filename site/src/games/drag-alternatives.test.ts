import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

// TSA-004: every drag action has a keyboard path. A game file that handles a pointer drag must also handle keys.
// The scan is static, so it proves a keyboard handler exists in the same file, and the table in
// docs/specs/global/14-trust-safety-accessibility-privacy.md names the test that exercises each one.

const GAMES_DIR = join(__dirname);

/** Handlers that make a drag: a press or move with a pointer or mouse, or a native drag. */
const DRAG_HANDLERS = /\b(onPointerDown|onPointerMove|onMouseDown|onDragStart)\b/;
/** A native drag: the bare attribute or draggable="true" / draggable={true}. draggable={false} is not a drag. */
const NATIVE_DRAG = /\bdraggable(?=[\s/>]|=\{true\}|=["']true["'])/;
/** The keyboard path: a key handler on the same element or the same file. */
const KEYBOARD_PATH = /\bonKeyDown\b/;

function tsxFiles(dir: string): string[] {
  return readdirSync(dir)
    .flatMap((name) => {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) return tsxFiles(full);
      return name.endsWith('.tsx') ? [full] : [];
    })
    .sort();
}

/** Files that handle a drag, with whether each has a keyboard path. Pure over the source text. */
function scanDrags(files: { path: string; source: string }[]) {
  const drags = files.filter((f) => DRAG_HANDLERS.test(f.source) || NATIVE_DRAG.test(f.source));
  return {
    drags: drags.map((f) => f.path),
    missingKeyboard: drags.filter((f) => !KEYBOARD_PATH.test(f.source)).map((f) => f.path),
  };
}

const files = tsxFiles(GAMES_DIR).map((full) => ({
  path: relative(GAMES_DIR, full),
  source: readFileSync(full, 'utf8'),
}));
const { drags, missingKeyboard } = scanDrags(files);

describe('drag actions have a keyboard path (TSA-004)', () => {
  it('the scan finds the known pointer-drag games, so it is not passing on an empty search', () => {
    expect(drags).toEqual(expect.arrayContaining(['ColorWash.tsx', 'DrawingDuet.tsx']));
  });

  it(`every game that handles a drag also handles keys (drag files: ${drags.join(', ')})`, () => {
    expect(missingKeyboard).toEqual([]);
  });

  it('the scan rejects a pointer drag with no key handler, and accepts draggable={false} images', () => {
    expect(scanDrags([{ path: 'X.tsx', source: '<canvas onPointerDown={d} onPointerMove={m} />' }]).missingKeyboard).toEqual([
      'X.tsx',
    ]);
    expect(scanDrags([{ path: 'Y.tsx', source: '<img draggable={false} alt="" />' }]).drags).toEqual([]);
    expect(scanDrags([{ path: 'Z.tsx', source: '<li draggable onDragStart={s} onKeyDown={k} />' }]).missingKeyboard).toEqual([]);
  });
});
