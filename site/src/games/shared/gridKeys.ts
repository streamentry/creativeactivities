import type { KeyboardEvent } from 'react';

/** Where each arrow key moves, as a change in row and column. */
const ARROWS: Record<string, readonly [number, number]> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
};

/**
 * Arrow keys, Home and End move between the square cells of a grid of buttons,
 * which are laid out row by row and each carry their position as `data-index`.
 * Every cell is still reachable with Tab; this only adds the shortcuts. Home and
 * End go to the start and end of the row, with Control to the first and last
 * cell. Call it from the grid's `onKeyDown`.
 */
export function moveInGrid(event: KeyboardEvent<HTMLElement>, grid: HTMLElement | null, size: number): void {
  const target = event.target as HTMLElement;
  const at = Number(target.dataset.index);
  if (!target.matches('button[data-index]') || Number.isNaN(at)) return;
  let to: number | undefined;
  const arrow = ARROWS[event.key];
  if (arrow) {
    const row = Math.floor(at / size) + arrow[0];
    const column = (at % size) + arrow[1];
    if (row >= 0 && row < size && column >= 0 && column < size) to = row * size + column;
  } else if (event.key === 'Home') {
    to = event.ctrlKey ? 0 : Math.floor(at / size) * size;
  } else if (event.key === 'End') {
    to = event.ctrlKey ? size * size - 1 : Math.floor(at / size) * size + size - 1;
  } else {
    return;
  }
  event.preventDefault();
  if (to !== undefined) grid?.querySelector<HTMLButtonElement>(`button[data-index="${to}"]`)?.focus();
}
