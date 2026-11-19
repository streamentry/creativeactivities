import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { CardListen, StepListen, type ListenStrings } from './CardListen';
import {
  attachLeaveGuard,
  cardLines,
  createListenSession,
  type ListenEventTarget,
} from '../lib/listen-card';
import { createUtterance, speechOf, type SpeechLike, type UtteranceLike } from '../lib/games/readAloud';

interface FakeSynth extends SpeechLike {
  spoken: UtteranceLike[];
  cancelled: number;
  paused: number;
  resumed: number;
}

function fakeSynth(): FakeSynth {
  return {
    spoken: [],
    cancelled: 0,
    paused: 0,
    resumed: 0,
    speaking: false,
    speak(u) {
      this.spoken.push(u);
    },
    cancel() {
      this.cancelled++;
    },
    pause() {
      this.paused++;
    },
    resume() {
      this.resumed++;
    },
  } as FakeSynth;
}

/** Ends the last utterance of the most recent play, as a browser does when speech finishes. */
function finishSpeech(synth: FakeSynth): void {
  const last = synth.spoken[synth.spoken.length - 1];
  last.onend?.();
}

const UI: ListenStrings = {
  listenSteps: 'Listen to the steps',
  pause: 'Pause',
  resume: 'Resume',
  stop: 'Stop',
  speed: 'Speed',
  normal: 'Normal',
  slower: 'Slower',
  reading: 'Reading the steps aloud.',
  paused: 'Paused. Press Resume to carry on.',
  note: "Uses your device's own voice. Some devices send the text to their maker to speak it.",
  listen: 'Listen',
  stepLabel: 'Listen to step {n}',
  stopStep: 'Stop step {n}',
};

describe('before hydration', () => {
  it('server-renders no controls, so nothing can be a dead button', () => {
    const card = renderToStaticMarkup(
      createElement(CardListen, { title: 'Paper boat', steps: ['Fold the paper.'], ui: UI }),
    );
    const step = renderToStaticMarkup(
      createElement(StepListen, { n: 1, text: 'Fold the paper.', ui: UI }),
    );
    expect(card).toBe('');
    expect(step).toBe('');
  });

  it('finds no speech synthesis in an environment without it', () => {
    expect(speechOf({})).toBeNull();
    expect(createListenSession(() => null).play(['Hello'], 'card', 'en')).toBe(false);
  });
});

describe('cardLines', () => {
  it('reads the title, then every safety note, then each step in order', () => {
    expect(cardLines('Paper boat', ['Fold it.', 'Float it.'], ['Not for under 3: small parts'])).toEqual([
      'Paper boat',
      'Not for under 3: small parts',
      'Fold it.',
      'Float it.',
    ]);
  });

  it('starts with the title when there are no safety notes', () => {
    expect(cardLines('Paper boat', ['Fold it.'])).toEqual(['Paper boat', 'Fold it.']);
  });
});

describe('play, pause, resume and stop', () => {
  it('speaks the title, then the safety notes, then each step in order', () => {
    const synth = fakeSynth();
    const session = createListenSession(() => synth);
    const lines = cardLines('Paper boat', ['Fold it.', 'Float it.'], ['Small parts']);
    expect(session.play(lines, 'card', 'en')).toBe(true);
    expect(synth.spoken.map((u) => u.text)).toEqual(['Paper boat', 'Small parts', 'Fold it.', 'Float it.']);
    expect(session.snapshot()).toEqual({ state: 'speaking', owner: 'card', speed: 'normal' });
  });

  it('speaks only one step for a per-step Listen button', () => {
    const synth = fakeSynth();
    const session = createListenSession(() => synth);
    session.play(['Float it.'], 'step-2', 'en');
    expect(synth.spoken.map((u) => u.text)).toEqual(['Float it.']);
    expect(session.snapshot().owner).toBe('step-2');
  });

  it('skips blank lines', () => {
    const synth = fakeSynth();
    createListenSession(() => synth).play(['  ', 'Fold it.'], 'card', 'en');
    expect(synth.spoken.map((u) => u.text)).toEqual(['Fold it.']);
  });

  it('pauses and resumes through the browser, and tracks the state', () => {
    const synth = fakeSynth();
    const session = createListenSession(() => synth);
    session.play(['Fold it.'], 'card', 'en');
    session.pause();
    expect(synth.paused).toBe(1);
    expect(session.snapshot().state).toBe('paused');
    session.resume();
    expect(synth.resumed).toBe(1);
    expect(session.snapshot().state).toBe('speaking');
  });

  it('ignores pause when nothing is speaking', () => {
    const synth = fakeSynth();
    const session = createListenSession(() => synth);
    session.pause();
    expect(synth.paused).toBe(0);
  });

  it('stop cancels speech and returns to idle with no owner', () => {
    const synth = fakeSynth();
    const session = createListenSession(() => synth);
    session.play(['Fold it.'], 'card', 'en');
    session.stop();
    expect(synth.cancelled).toBeGreaterThanOrEqual(2);
    expect(session.snapshot()).toEqual({ state: 'idle', owner: null, speed: 'normal' });
  });

  it('returns to idle when speech finishes', () => {
    const synth = fakeSynth();
    const session = createListenSession(() => synth);
    session.play(['Fold it.', 'Float it.'], 'card', 'en');
    finishSpeech(synth);
    expect(session.snapshot().state).toBe('idle');
  });

  it('ignores a finish signal from speech that has since been replaced', () => {
    const synth = fakeSynth();
    const session = createListenSession(() => synth);
    session.play(['First.'], 'card', 'en');
    const stale = synth.spoken[0];
    session.play(['Second.'], 'step-1', 'en');
    stale.onend?.();
    expect(session.snapshot()).toEqual({ state: 'speaking', owner: 'step-1', speed: 'normal' });
  });

  it('reports a refused speech start as false and stays idle', () => {
    const synth = fakeSynth();
    synth.speak = vi.fn(() => {
      throw new Error('not allowed');
    });
    const session = createListenSession(() => synth);
    expect(session.play(['Hello'], 'card', 'en')).toBe(false);
    expect(session.snapshot().state).toBe('idle');
  });

  it('notifies subscribers on change and stops notifying after unsubscribe', () => {
    const synth = fakeSynth();
    const session = createListenSession(() => synth);
    const listener = vi.fn();
    const off = session.subscribe(listener);
    session.play(['Fold it.'], 'card', 'en');
    expect(listener).toHaveBeenCalled();
    off();
    listener.mockClear();
    session.stop();
    expect(listener).not.toHaveBeenCalled();
  });
});

describe('speed', () => {
  it('Normal speaks at the browser pace and Slower at about 0.8', () => {
    const synth = fakeSynth();
    const session = createListenSession(() => synth);
    session.play(['Fold it.'], 'card', 'en');
    expect(synth.spoken[0].rate).toBe(1);

    session.setSpeed('slower');
    session.play(['Float it.'], 'card', 'en');
    expect(synth.spoken[1].rate).toBeCloseTo(0.8);
    expect(session.snapshot().speed).toBe('slower');
  });

  it('applies a changed speed to the next thing that is played', () => {
    const synth = fakeSynth();
    const session = createListenSession(() => synth);
    session.setSpeed('slower');
    session.play(['Fold it.'], 'step-1', 'en');
    expect(synth.spoken[0].rate).toBeCloseTo(0.8);
  });
});

describe('leaving the page', () => {
  function fakeTargets() {
    const listeners = new Map<string, Set<() => void>>();
    const target: ListenEventTarget = {
      addEventListener(type, listener) {
        const set = listeners.get(type) ?? new Set<() => void>();
        set.add(listener);
        listeners.set(type, set);
      },
      removeEventListener(type, listener) {
        listeners.get(type)?.delete(listener);
      },
    };
    const fire = (type: string) => listeners.get(type)?.forEach((l) => l());
    const count = (type: string) => listeners.get(type)?.size ?? 0;
    return { target, fire, count };
  }

  it('pagehide cancels speech', () => {
    const synth = fakeSynth();
    const session = createListenSession(() => synth);
    const win = fakeTargets();
    const doc = fakeTargets();
    attachLeaveGuard(session, win.target, { ...doc.target, hidden: false });
    session.play(['Fold it.'], 'card', 'en');
    win.fire('pagehide');
    expect(session.snapshot().state).toBe('idle');
    expect(synth.cancelled).toBeGreaterThanOrEqual(2);
  });

  it('cancels speech when the tab becomes hidden, and not when it becomes visible', () => {
    const synth = fakeSynth();
    const session = createListenSession(() => synth);
    const win = fakeTargets();
    const docTargets = fakeTargets();
    const doc = { ...docTargets.target, hidden: false };
    attachLeaveGuard(session, win.target, doc);

    session.play(['Fold it.'], 'card', 'en');
    doc.hidden = false;
    docTargets.fire('visibilitychange');
    expect(session.snapshot().state).toBe('speaking');

    doc.hidden = true;
    docTargets.fire('visibilitychange');
    expect(session.snapshot().state).toBe('idle');
  });

  it('removes both listeners when detached', () => {
    const session = createListenSession(() => fakeSynth());
    const win = fakeTargets();
    const doc = fakeTargets();
    const detach = attachLeaveGuard(session, win.target, { ...doc.target, hidden: false });
    expect(win.count('pagehide')).toBe(1);
    expect(doc.count('visibilitychange')).toBe(1);
    detach();
    expect(win.count('pagehide')).toBe(0);
    expect(doc.count('visibilitychange')).toBe(0);
  });
});

describe('utterance helper', () => {
  it('builds the fallback utterance with the requested rate', () => {
    expect(createUtterance('Fold it.', 'en', 0.8)).toEqual({ text: 'Fold it.', lang: 'en', rate: 0.8 });
  });
});

describe('the main control', () => {
  it('changes its label rather than using aria-pressed, which screen readers announce confusingly with a changing label', () => {
    const source = readFileSync(new URL('./CardListen.tsx', import.meta.url), 'utf8');
    expect(source).not.toContain('aria-pressed');
  });
});
