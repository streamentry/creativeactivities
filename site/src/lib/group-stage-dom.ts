import { STAGE_TEXT, keyAction, move, slidesFor, spoken, view, type Slide, type StageCard, type StageView } from './group-stage';

/**
 * The dialog for group mode (WEB-046). It is loaded only when someone opens it, builds the screens from the text
 * already on the page, and leaves nothing behind: no storage, no request, no timer, no sound.
 */

function h<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

const squash = (text: string | null | undefined): string => (text ?? '').replace(/\s+/g, ' ').trim();

const STYLES = '/styles/group-stage.css';
let styles: Promise<void> | null = null;

/**
 * The styles load from the site's own address the first time the view opens, so a card page carries nothing for a view
 * nobody opened. (A style element made by script would be refused: the page's policy allows only hashed styles and
 * the site's own files.) If the file does not arrive the view still works, only plainer.
 */
function loadStyles(): Promise<void> {
  styles ??= new Promise((done) => {
    const link = h('link');
    link.rel = 'stylesheet';
    link.href = STYLES;
    link.addEventListener('load', () => done());
    link.addEventListener('error', () => {
      // Open without it this time, and try again the next time rather than staying plain for the rest of the visit.
      link.remove();
      styles = null;
      done();
    });
    document.head.append(link);
  });
  return styles;
}

/**
 * The card as the page shows it. The page marks its own text with `data-stage`, so the words are not sent twice.
 * Returns null when the page has no steps to show.
 */
export function readCard(root: ParentNode): StageCard | null {
  const one = (name: string) => root.querySelector(`[data-stage="${name}"]`);
  // A step's own words are its text, not the picture captions that may follow it.
  const ownText = (li: Element) => squash([...li.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent).join(' '));
  const items = (name: string, read: (li: Element) => string) => [...(one(name)?.children ?? [])].map(read).filter((s) => s !== '');
  const card: StageCard = {
    name: squash(one('title')?.textContent),
    summary: squash(one('summary')?.textContent),
    materials: items('materials', (li) => squash(li.textContent)),
    steps: items('steps', ownText),
    stopNote: squash(one('stop')?.textContent),
  };
  return card.name && card.steps.length > 0 ? card : null;
}

/** One screen, drawn from its parts. */
function slideNode(slide: Slide): HTMLElement {
  const section = h('section', `group-stage__slide group-stage__slide--${slide.kind}`);
  section.append(h('p', 'group-stage__label', slide.label));
  if (slide.kind === 'step') {
    section.append(h('p', 'group-stage__text', slide.text));
    return section;
  }
  section.append(h('h2', 'group-stage__title', slide.title));
  if (slide.kind === 'start') {
    section.append(h('p', 'group-stage__summary', slide.summary), h('h3', 'group-stage__subhead', STAGE_TEXT.materialsHeading));
    const list = h('ul', 'group-stage__list');
    for (const material of slide.materials) list.append(h('li', undefined, material));
    section.append(list, h('p', 'group-stage__note', slide.note));
  } else {
    section.append(h('p', 'group-stage__note', slide.text));
  }
  return section;
}

/** The pause screen: the step is hidden so the group is not drawn to it. */
function pausedNode(): HTMLElement {
  const section = h('section', 'group-stage__slide group-stage__slide--paused');
  section.append(h('h2', 'group-stage__title', STAGE_TEXT.pausedTitle));
  const text = h('p', 'group-stage__note', STAGE_TEXT.pausedText);
  text.id = 'group-stage-paused';
  section.append(text);
  return section;
}

/** Opens the group view for the card on this page. The person leading moves on; nothing changes by itself. */
export async function openGroupStage(trigger: HTMLElement): Promise<void> {
  if (document.querySelector('dialog.group-stage')) return;
  const card = readCard(document);
  if (!card) return;
  // The button says it is working while the styles arrive, so a second press does not look like nothing happened.
  trigger.setAttribute('aria-busy', 'true');
  try {
    await loadStyles();
  } finally {
    trigger.removeAttribute('aria-busy');
  }
  if (document.querySelector('dialog.group-stage')) return;

  const slides = slidesFor(card);
  let index = 0;
  let paused = false;
  let primaryAction: StageView['primary'] = 'next';

  const dialog = h('dialog', 'group-stage');
  // A press on a blank part of the view keeps focus inside it, so the keys keep working.
  dialog.tabIndex = -1;
  dialog.setAttribute('aria-label', card.name);
  dialog.setAttribute('aria-describedby', 'group-stage-hint');
  const hint = h('p', 'visually-hidden', STAGE_TEXT.hint);
  hint.id = 'group-stage-hint';
  const body = h('div', 'group-stage__body');
  body.setAttribute('role', 'group');
  // The buttons keep focus when the screen changes, so the new screen is read out from here.
  const live = h('p', 'visually-hidden');
  live.setAttribute('role', 'status');
  const bar = h('div', 'group-stage__bar');

  const make = (label: string, onClick: () => void, filled = false): HTMLButtonElement => {
    const button = h('button', filled ? 'btn btn--primary' : 'btn', label);
    button.type = 'button';
    button.addEventListener('click', onClick);
    return button;
  };
  const previous = make(STAGE_TEXT.previous, () => go(-1));
  const pause = make(STAGE_TEXT.pause, () => {
    paused = true;
    render();
  });
  const done = make(STAGE_TEXT.done, () => dialog.close());
  const primary = make(
    '',
    () => {
      if (primaryAction === 'next') go(1);
      else if (primaryAction === 'done') dialog.close();
      else {
        paused = false;
        render();
      }
    },
    true,
  );
  primary.dataset.primary = '';
  bar.append(previous, pause, done, primary);
  dialog.append(hint, body, live, bar);

  const go = (direction: 1 | -1) => {
    index = move(index, slides.length, direction);
    render();
  };

  /**
   * A screen taller than the room for it scrolls, and a person using the keyboard can scroll it only if they can reach
   * it, so it is a stop in the Tab order exactly when it scrolls. It is named for what it shows.
   */
  const markScrollable = () => {
    body.tabIndex = body.scrollHeight > body.clientHeight + 1 ? 0 : -1;
  };

  /** Draws the screen and shows the buttons it needs. The buttons are the same ones each time, so focus stays put. */
  function render(): void {
    const v = view(index, slides.length, paused);
    body.replaceChildren(v.showSlide ? slideNode(slides[index]) : pausedNode());
    body.setAttribute('aria-label', v.showSlide ? slides[index].label : STAGE_TEXT.pausedTitle);
    previous.hidden = !v.secondary.includes('previous');
    previous.disabled = !v.previousEnabled;
    pause.hidden = !v.secondary.includes('pause');
    done.hidden = !v.secondary.includes('done');
    primaryAction = v.primary;
    primary.textContent = { next: STAGE_TEXT.next, done: STAGE_TEXT.done, carryOn: STAGE_TEXT.carryOn }[v.primary];
    if (paused) primary.setAttribute('aria-describedby', 'group-stage-paused');
    else primary.removeAttribute('aria-describedby');
    live.textContent = v.showSlide ? spoken(slides[index]) : `${STAGE_TEXT.pausedTitle}. ${STAGE_TEXT.pausedText}`;
    body.scrollTop = 0;
    markScrollable();
    // Focus stays on the button that was pressed, so Enter can be pressed again for the next step. If that button has
    // just gone or been switched off (Pause, or Previous on the first screen), the filled one takes focus.
    const at = document.activeElement;
    const lost = !(at instanceof HTMLElement) || !dialog.contains(at) || at === dialog || (at instanceof HTMLButtonElement && (at.hidden || at.disabled));
    if (lost) primary.focus();
  }

  /** Page Down and Page Up scroll a long step first and move on only at its end (and back only at its start). */
  const scrolledFirst = (direction: 1 | -1): boolean => {
    const room = body.scrollHeight - body.clientHeight;
    if (room <= 1) return false;
    if (direction === 1 && body.scrollTop < room - 1) {
      body.scrollBy({ top: body.clientHeight * 0.9 });
      return true;
    }
    if (direction === -1 && body.scrollTop > 0) {
      body.scrollBy({ top: -body.clientHeight * 0.9 });
      return true;
    }
    return false;
  };

  // On the page, not the dialog: after a press on a blank part of the page focus can rest on the body, and the keys
  // must still work. The page behind the view is out of reach while it is open, so nothing else hears them.
  const onKey = (event: KeyboardEvent) => {
    const action = keyAction(event.key);
    if (!action || paused || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    event.preventDefault();
    // A held key does not race through the steps.
    if (event.repeat) return;
    if ((event.key === 'PageDown' || event.key === 'PageUp') && scrolledFirst(event.key === 'PageDown' ? 1 : -1)) return;
    go(action === 'next' ? 1 : -1);
  };

  const cleanUp = () => {
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', markScrollable);
    dialog.remove();
    document.documentElement.classList.remove('group-stage-open');
  };
  // Escape, Done for now and the browser's own close all end here, and the person is back where they were on the card.
  dialog.addEventListener('close', () => {
    cleanUp();
    trigger.focus();
  });

  document.body.append(dialog);
  document.documentElement.classList.add('group-stage-open');
  try {
    dialog.showModal();
  } catch {
    // Leave the page as it was rather than locked behind a view that never opened.
    cleanUp();
    return;
  }
  document.addEventListener('keydown', onKey);
  window.addEventListener('resize', markScrollable);
  render();
}
