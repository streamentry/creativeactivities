/**
 * Decorate a card together (GAME-035): the shape of the printed card and of its on-screen preview.
 *
 * The card is one sheet folded in half. The right half is the front, with the occasion words and a simple
 * frame; the left half is the inside, with lines for a message and a line for From. Both halves are drawn
 * from the same numbers here, so the paper and the preview cannot drift apart. The words (occasion names,
 * steps, labels) are text, so they live in `ui.decorateACard` in `src/i18n/play/en.json`.
 */

/** The occasions to choose from. Each one has a label and front words in `ui.decorateACard.occasions`. */
export const OCCASIONS = ['birthday', 'thank-you', 'thinking-of-you', 'new-season', 'just-because'] as const;
export type Occasion = (typeof OCCASIONS)[number];

/** The occasion the printed sheet shows until a person chooses another one on screen. */
export const DEFAULT_OCCASION: Occasion = 'birthday';

/** The five how-to steps, in order. Each key is a string in `ui.decorateACard.steps`. */
export const STEP_KEYS = ['fold', 'front', 'inside', 'message', 'stop'] as const;
export type StepKey = (typeof STEP_KEYS)[number];

/** Each half of the card is drawn in a box this many units wide and tall (about 90 mm by 125 mm on paper). */
export const PANEL_WIDTH = 90;
export const PANEL_HEIGHT = 125;

/** Lines for the message on the inside half. */
export const MESSAGE_LINES = 5;

/** The y positions of the message lines on the inside half, top to bottom. */
export function messageLineYs(): number[] {
  return Array.from({ length: MESSAGE_LINES }, (_, i) => 24 + i * 13);
}

/** A mark drawn in outline with `stroke="currentColor"`: a circle, or a path (a star or a leaf). */
export type Mark = { kind: 'circle'; cx: number; cy: number; r: number } | { kind: 'path'; d: string };

/** Keeps the path strings short and the tests readable. */
function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/** A star with `points` points, centred on (cx, cy), as an SVG path. The top point comes first, then clockwise. */
export function starPath(cx: number, cy: number, outer: number, inner: number, points = 5): string {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (i * Math.PI) / points;
    pts.push(`${round(cx + radius * Math.cos(angle))} ${round(cy + radius * Math.sin(angle))}`);
  }
  return `M${pts.join(' L')} Z`;
}

/** A simple leaf: two curves from the base (x, y) to a tip `length` away at `angle` degrees, `width` across. */
export function leafPath(x: number, y: number, length: number, width: number, angle: number): string {
  const a = (angle * Math.PI) / 180;
  const tipX = x + length * Math.cos(a);
  const tipY = y + length * Math.sin(a);
  const midX = x + (length / 2) * Math.cos(a);
  const midY = y + (length / 2) * Math.sin(a);
  const sideX = -Math.sin(a) * width;
  const sideY = Math.cos(a) * width;
  const c1 = `${round(midX + sideX)} ${round(midY + sideY)}`;
  const c2 = `${round(midX - sideX)} ${round(midY - sideY)}`;
  return `M${round(x)} ${round(y)} Q${c1} ${round(tipX)} ${round(tipY)} Q${c2} ${round(x)} ${round(y)} Z`;
}

/** The frame's border on the front half, in the card's units (the front half is x 90 to 180). */
export const FRAME_BOX = { x: 96, y: 6, width: 78, height: 113, rx: 4 } as const;

/**
 * The decoration on the front half: leaves in the four corners pointing inward, a star at the middle of the top
 * and of the bottom, and small dots along the top and bottom edges and at the sides. Outline only, no fills.
 */
export function frameMarks(): Mark[] {
  const left = FRAME_BOX.x + 8;
  const right = FRAME_BOX.x + FRAME_BOX.width - 8;
  const top = FRAME_BOX.y + 8;
  const bottom = FRAME_BOX.y + FRAME_BOX.height - 8;
  const middleX = FRAME_BOX.x + FRAME_BOX.width / 2;
  const marks: Mark[] = [
    { kind: 'path', d: leafPath(left, top, 9, 3.5, 45) },
    { kind: 'path', d: leafPath(right, top, 9, 3.5, 135) },
    { kind: 'path', d: leafPath(left, bottom, 9, 3.5, -45) },
    { kind: 'path', d: leafPath(right, bottom, 9, 3.5, -135) },
    { kind: 'path', d: starPath(middleX, top, 4.5, 1.9) },
    { kind: 'path', d: starPath(middleX, bottom + 0, 4.5, 1.9) },
  ];
  for (const x of [middleX - 15, middleX + 15]) {
    marks.push({ kind: 'circle', cx: x, cy: top, r: 1.6 }, { kind: 'circle', cx: x, cy: bottom, r: 1.6 });
  }
  const middleY = PANEL_HEIGHT / 2;
  marks.push({ kind: 'circle', cx: FRAME_BOX.x + 8, cy: middleY, r: 2 }, { kind: 'circle', cx: FRAME_BOX.x + FRAME_BOX.width - 8, cy: middleY, r: 2 });
  return marks;
}

/** The front words for `occasion`, from the text, so the preview and the paper read the same. */
export function occasionWords(occasions: Record<Occasion, { words: string }>, occasion: Occasion): string {
  return occasions[occasion].words;
}
