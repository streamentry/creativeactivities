import { PAUSE_LINE } from './scope';

/**
 * Group mode for facilitators (WEB-046): a card shown one step at a time on a shared screen, with the person leading
 * moving on. This file holds the parts that can be checked without a browser: the screens, the buttons each screen
 * shows, and the keys. The dialog that draws them is `group-stage-dom.ts`.
 *
 * The rules it keeps: no clock, no score and no sound; the person leading decides every change; Pause and Done for now
 * are always within reach; nothing is saved or sent.
 */

/** What the view says, in one place so it can be read and checked as a whole. */
export const STAGE_TEXT = {
  open: 'Show steps to a group',
  startLabel: 'Before you start',
  materialsHeading: 'What you need',
  endLabel: 'After the steps',
  endTitle: 'It is fine to stop here',
  previous: 'Previous',
  next: 'Next',
  pause: 'Pause',
  carryOn: 'Carry on',
  done: 'Done for now',
  pausedTitle: 'Paused',
  pausedText: 'Take your time. Carry on when you are ready.',
  /** Read out when the view opens, for a person who cannot see the buttons. */
  hint: 'Move on with Next or the right arrow key. Go back with Previous or the left arrow key.',
  stepLabel: (n: number, of: number) => `Step ${n} of ${of}`,
} as const;

/** The parts of a card the group view needs, read from the page it is opened on. */
export interface StageCard {
  name: string;
  summary: string;
  materials: readonly string[];
  steps: readonly string[];
  /** The card's own note that it is fine to stop; shown on the last screen. */
  stopNote: string;
}

export type Slide =
  | { kind: 'start'; label: string; title: string; summary: string; materials: readonly string[]; note: string }
  | { kind: 'step'; label: string; text: string }
  | { kind: 'end'; label: string; title: string; text: string };

/** A start screen, one screen for each step in order, and an end screen. Never empty. */
export function slidesFor(card: StageCard): Slide[] {
  const of = card.steps.length;
  return [
    { kind: 'start', label: STAGE_TEXT.startLabel, title: card.name, summary: card.summary, materials: card.materials, note: PAUSE_LINE },
    ...card.steps.map((text, i): Slide => ({ kind: 'step', label: STAGE_TEXT.stepLabel(i + 1, of), text })),
    { kind: 'end', label: STAGE_TEXT.endLabel, title: STAGE_TEXT.endTitle, text: card.stopNote },
  ];
}

const sentence = (text: string): string => (/[.!?:;]$/.test(text.trim()) ? text.trim() : `${text.trim()}.`);

/**
 * What a screen reader says when the screen changes. The buttons keep focus (so Enter can be pressed again for the
 * next step), so the new screen is read out from here, whole: a start screen's materials and note too.
 */
export function spoken(slide: Slide): string {
  if (slide.kind === 'step') return `${slide.label}. ${slide.text}`;
  if (slide.kind === 'end') return [slide.label, slide.title, slide.text].map(sentence).join(' ');
  const materials = `${STAGE_TEXT.materialsHeading}: ${slide.materials.map(sentence).join(' ')}`;
  return [slide.label, slide.title, slide.summary, materials, slide.note].map(sentence).join(' ');
}

/** One screen forward or back; it stops at both ends instead of wrapping round. */
export function move(index: number, count: number, direction: 1 | -1): number {
  if (count <= 0) return 0;
  return Math.min(count - 1, Math.max(0, index + direction));
}

/**
 * Left and Right arrows move between screens, and so do Page Down and Page Up, which is what a presenter's clicker
 * sends. Up and Down stay free to scroll a long step on a small screen, and every other key keeps what a button or
 * the dialog already does with it.
 */
export function keyAction(key: string): 'next' | 'previous' | null {
  if (key === 'ArrowRight' || key === 'PageDown') return 'next';
  if (key === 'ArrowLeft' || key === 'PageUp') return 'previous';
  return null;
}

export type Control = 'previous' | 'pause' | 'done';

export interface StageView {
  /** The one filled button: Next, then Done for now on the last screen, and Carry on while paused. */
  primary: 'next' | 'done' | 'carryOn';
  /** The other buttons, in the order they appear. Done for now is among them unless it is the filled one. */
  secondary: Control[];
  /** Previous is drawn on every screen so the buttons do not move, but there is nothing before the first. */
  previousEnabled: boolean;
  /** While paused the step is hidden, so the group is not drawn to it. */
  showSlide: boolean;
}

/** Which buttons show on a screen. One is filled; Done for now is never more than one tap away. */
export function view(index: number, count: number, paused: boolean): StageView {
  if (paused) return { primary: 'carryOn', secondary: ['done'], previousEnabled: false, showSlide: false };
  const last = index >= count - 1;
  return {
    primary: last ? 'done' : 'next',
    secondary: last ? ['previous', 'pause'] : ['previous', 'pause', 'done'],
    previousEnabled: index > 0,
    showSlide: true,
  };
}
