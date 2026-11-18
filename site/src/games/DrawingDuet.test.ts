import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PATTERN_COLORS } from '../data/pattern-maker';
import { playProps } from '../i18n/play';
import DrawingDuet from './DrawingDuet';

const props = playProps('en', 'drawing-duet');
const render = () => renderToStaticMarkup(createElement(DrawingDuet, props));
const t = props.ui.drawingDuet;
const source = readFileSync(new URL('./DrawingDuet.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles/games.css', import.meta.url), 'utf8');

describe('DrawingDuet', () => {
  it('starts with the guidance, the two color pickers, the turn banner, the canvas and Done for now', () => {
    const html = render();

    // The page's style policy blocks style attributes, so nothing here may rely on one.
    expect(html).not.toContain(' style=');
    expect(html).toContain(t.guidance);
    expect(html.indexOf('dd__players')).toBeLessThan(html.indexOf('dd__turn'));
    expect(html.indexOf('dd__turn')).toBeLessThan(html.indexOf('dd__canvas'));
    expect(html).toContain('Done for now');
    expect(html).toContain('Start again');
  });

  it('says in the guidance line that nothing is sent anywhere, and uses no storage or network', () => {
    expect(t.guidance).toMatch(/Nothing is sent anywhere/);
    expect(source).not.toMatch(/localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest|navigator\.sendBeacon|document\.cookie/);
  });

  it('shows whose turn it is in words, with the color name and its shape', () => {
    const html = render();
    const turn = html.slice(html.indexOf('dd__turn'), html.indexOf('dd__board'));

    expect(turn).toContain("First person&#x27;s turn");
    expect(turn).toContain('Pen color: Orange.');
    expect(turn).toContain('data-shape="square"');
    expect(turn).toContain('data-tone="1"');
  });

  it('gives each person the four palette colors, each with its written name and its shape', () => {
    const html = render();
    const players = html.slice(html.indexOf('dd__players'), html.indexOf('dd__turn'));

    expect(players.match(/<fieldset/g)).toHaveLength(2);
    expect(players).toContain("First person&#x27;s color");
    expect(players).toContain("Second person&#x27;s color");
    expect(players.match(/type="radio"/g)).toHaveLength(8);
    for (const color of PATTERN_COLORS) {
      expect(players.match(new RegExp(`<span class="dd__name">${t.colors[color.index]}</span>`, 'g'))).toHaveLength(2);
      expect(players).toContain(`data-shape="${color.shape}"`);
    }
  });

  it('marks the turn on the first person at the start', () => {
    expect(render().match(/data-turn="yes"/g)).toHaveLength(1);
  });

  it('draws the canvas as a labelled image that can take focus, with a neutral description and the keys explained', () => {
    const html = render();
    const canvas = html.match(/<canvas[^>]*>/)?.[0] ?? '';

    expect(canvas).toContain('role="img"');
    expect(canvas).toContain('tabindex="0"');
    expect(canvas).toContain('aria-label="Shared drawing, 0 lines so far"');
    expect(canvas).toMatch(/aria-describedby="[^"]+"/);
    expect(html).toContain(t.keys);
  });

  it('never describes the drawing as good, best, better or a ranking', () => {
    expect(JSON.stringify(t)).not.toMatch(/\b(good|best|better|worse|worst|winner|win|won|lose|lost|score|points?|rank|top)\b/i);
  });

  it('has Pass the pen, Take back my last line, Save picture and Print the paper version from the start, with no Put it back and no download link', () => {
    const html = render();

    for (const label of ['Pass the pen', 'Take back my last line', 'Save picture', 'Print the paper version']) expect(html).toContain(label);
    expect(html).not.toContain('Put it back');
    expect(html).not.toContain('drawing-duet.png');
  });

  it('prints one page: the paper rules and a blank framed drawing area, hidden from the screen reader', () => {
    const html = render();
    const sheet = html.slice(html.indexOf('class="sheet dd-sheet"'));

    expect(sheet).toContain('aria-hidden="true"');
    expect(sheet).toContain('<h2>Drawing duet</h2>');
    expect(sheet).toContain(
      'Two people, one sheet, two pens. Take turns: one line or shape each, then pass the pen. Anyone may pass. There is no right picture.',
    );
    expect(sheet).toContain('dd-sheet__frame');
    expect(source).toContain('window.print()');
  });

  it('says nothing negative: no winner, score, timer, count or failure wording anywhere on the page or in its strings', () => {
    const text = JSON.stringify(t) + render();

    expect(text).not.toMatch(/score|timer|clock|streak|moves|miss|wrong|incorrect|fail|mistake|try again|remember|correct|recall/i);
    expect(text).not.toMatch(/\b(winner|wins|lose|loser|remaining|points?|best|better|faster|slow|hurry)\b/i);
  });

  it('keeps the drawing on a canvas, with no clock, no timeout and no counter in the source', () => {
    expect(source).not.toMatch(/setTimeout|setInterval|requestAnimationFrame|Date\.now|performance\.now|confetti/);
    expect(source).not.toMatch(/\bcount\b|\bwinner\b|\bscore\b|\battempts\b/);
  });

  it('starts every change from the latest game, so quick taps and key presses both land', () => {
    expect(source).toContain('const latest = useRef(game)');
    expect(source).not.toMatch(/(penDown|moveTo|passPen|takeBackLine|clearSheet|putBack|movePen|togglePen|chooseColor)\(game[,)]/);
  });

  it('draws from the data synchronously inside the handlers, and paints only the canvas and its own tokens', () => {
    expect(source).toContain('paint(canvas.current, next, focused.current)');
    expect(source).toContain("'image/png'");
    expect(source).toContain("download=\"drawing-duet.png\"");
    expect(source).not.toMatch(/#[0-9a-fA-F]{6}\b|rgb\(/);
  });

  it('answers the keyboard pen with Pen down and Pen up, and ignores other keys', () => {
    expect(source).toContain('ui.drawingDuet.penDown');
    expect(source).toContain('ui.drawingDuet.penUp');
    expect(source).toMatch(/e\.key === ' ' \|\| e\.key === 'Spacebar'/);
    expect(t.penDown).toBe('Pen down');
    expect(t.penUp).toBe('Pen up');
  });

  it('uses the English text until a locale has a reviewed translation', () => {
    expect(playProps('es', 'drawing-duet').ui.drawingDuet.pass).toBe('Pass the pen');
  });
});

describe('the stylesheet', () => {
  it('chooses each color by data-tone, with the hex values in the shared palette', () => {
    for (const color of PATTERN_COLORS) {
      const rule = css.match(new RegExp(`\\.dd \\[data-tone='${color.index}'\\] \\{([^}]*)\\}`));
      expect(rule, `a rule for color ${color.index}`).not.toBeNull();
      expect(rule?.[1]).toContain(`--dd-fill: ${color.hex.toLowerCase()};`);
      expect(rule?.[1]).toContain(`--dd-ink: ${color.ink.toLowerCase()};`);
    }
  });

  it('allows touch-action none on the canvas only', () => {
    const rule = css.match(/\.dd__canvas \{([^}]*)\}/);
    expect(rule?.[1]).toContain('touch-action: none;');
    const ddRules = css.slice(css.indexOf('.dd {'), css.indexOf('@media print', css.indexOf('.dd {')));
    expect(ddRules.match(/touch-action: none/g)).toHaveLength(1);
  });
});
