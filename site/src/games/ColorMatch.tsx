import { useEffect, useState } from 'react';
import type { PlayProps } from '../i18n/play';
import { fill } from '../i18n/play/format';
import {
  COLOR_COUNTS,
  colorTapResult,
  createColorRound,
  isColorDone,
  pictureColor,
  resizeColorState,
  showColors,
  startColors,
  tapColor,
  matchSize,
  type ColorState,
} from '../lib/games/color-match';
import { MATCH_COLORS, type MatchColorId } from '../data/color-match';
import { boardColumns } from '../lib/games/pairs';
import { createRng, randomSeed } from '../lib/games/random';
import { ChoiceChips } from './shared/ChoiceChips';
import { GameFrame } from './shared/GameFrame';
import { PictureTile, pictureNamer } from './shared/PictureTile';
import { sounds } from './shared/sound';
import { useWide } from './shared/useWide';

const newState = (count: number, previous?: MatchColorId): ColorState =>
  startColors(createColorRound(count, createRng(randomSeed()), previous));

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** A list of distinct ids, each passing [ok]. Reads only: a bad saved value is refused, never repaired. */
const isIdList = (v: unknown, ok: (id: string) => boolean): v is string[] =>
  Array.isArray(v) && v.every((id) => typeof id === 'string' && ok(id)) && new Set(v).size === v.length;

/** The saved board, or null when this game cannot show it. */
function parseBoard(b: unknown): { count: number; state: ColorState } | null {
  if (!isRecord(b)) return null;
  const { count, round, found, shown } = b;
  if (typeof count !== 'number' || !(COLOR_COUNTS as readonly number[]).includes(count) || typeof shown !== 'boolean') return null;
  if (!isRecord(round)) return null;
  const { color, matches, pictures } = round;
  if (typeof color !== 'string' || !MATCH_COLORS.some((c) => c.id === color)) return null;
  const target = color as MatchColorId;
  if (!isIdList(pictures, (id) => pictureColor(id) !== undefined)) return null;
  if (!isIdList(matches, (id) => pictureColor(id) === target) || matches.length !== matchSize(count)) return null;
  if (!matches.every((id) => pictures.includes(id))) return null;
  if (!isIdList(found, (id) => matches.includes(id))) return null;
  return { count, state: { round: { color: target, matches: [...matches], pictures: [...pictures] }, found: [...found], shown } };
}

/**
 * Color match (GAME-020): a color with its name written beside it, and a board
 * of pictures. Tap every picture that is that color. Another picture is only
 * named ("The pear is green."). No score, clock, miss count or failure.
 */
export default function ColorMatch(props: PlayProps) {
  const { ui, lang } = props;
  const pictureName = pictureNamer(props);
  const wide = useWide();
  const [count, setCount] = useState<number>(COLOR_COUNTS[0]);
  const [state, setState] = useState<ColorState | null>(null);
  const [message, setMessage] = useState('');

  // The board is made after the page loads, so every visit starts with a new color.
  useEffect(() => {
    setState(newState(count));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // WEB-053: a different count keeps the color and the pictures already found.
  const changeCount = (n: number) => {
    setCount(n);
    if (!state) return;
    setState(resizeColorState(state, n, createRng(randomSeed())));
    setMessage('');
  };

  const counts = COLOR_COUNTS.map((n) => ({ value: n, label: fill(ui.colorMatch.count, { n }) }));
  const options = <ChoiceChips legend={ui.colorMatch.countLegend} choices={counts} value={count} onChange={changeCount} />;

  if (!state) {
    return <GameFrame ui={ui} lang={lang} guidance={ui.colorMatch.guidance} options={options}>{null}</GameFrame>;
  }

  const { round } = state;
  const done = isColorDone(state);
  const colorName = ui.colorMatch.names[round.color];
  const nameOf = (id: string) => {
    const color = pictureColor(id);
    return color ? ui.colorMatch.names[color] : '';
  };

  const tap = (id: string) => {
    const result = colorTapResult(state, id);
    if (result === 'found') {
      const after = tapColor(state, id);
      setState(after);
      if (isColorDone(after)) {
        sounds.done();
        setMessage(fill(ui.colorMatch.all, { color: colorName }, lang));
      } else {
        sounds.match();
        setMessage(fill(ui.colorMatch.found, { name: pictureName(id), color: colorName }, lang));
      }
      return;
    }
    // Any other tap only says what that picture is. Nothing changes and nothing is counted.
    sounds.tap();
    setMessage(fill(ui.colorMatch.named, { name: pictureName(id), color: nameOf(id) }, lang));
  };

  const show = () => {
    sounds.tap();
    setState(showColors(state));
    setMessage(fill(ui.colorMatch.shown, { color: colorName }, lang));
  };

  const next = () => {
    sounds.tap();
    setState(newState(count, round.color));
    setMessage('');
  };

  return (
    <GameFrame
      ui={ui}
      lang={lang}
      guidance={ui.colorMatch.guidance}
      readAloudText={fill(ui.colorMatch.target, { color: colorName }, lang)}
      message={message}
      options={options}
      footer={
        <div className="btn-row btn-row--center">
          {done ? null : (
            <button type="button" className="btn" onClick={show}>
              {ui.colorMatch.show}
            </button>
          )}
          <button type="button" className={done ? 'btn btn--primary btn--hero' : 'btn'} onClick={next}>
            {ui.colorMatch.next}
          </button>
        </div>
      }
      place={{
        slug: 'color-match',
        save: () => ({ count, state }),
        check: (b) => parseBoard(b) !== null,
        restore: (b) => {
          const saved = parseBoard(b);
          if (!saved) return;
          setCount(saved.count);
          setState(saved.state);
          setMessage('');
        },
      }}
    >
      <div className="color-match__target">
        <span className="color-match__swatch" data-color={round.color} aria-hidden="true" />
        <p className="color-match__name">{colorName}</p>
      </div>
      <div className="board" data-cols={boardColumns(round.pictures.length, wide)} data-width={round.pictures.length <= 4 ? 'small' : 'large'}>
        {round.pictures.map((id, i) => (
          <PictureTile
            key={`${round.color}-${id}`}
            ui={ui}
            value={id}
            name={pictureName(id)}
            position={i + 1}
            state={state.found.includes(id) ? 'matched' : 'resting'}
            onTap={() => tap(id)}
          />
        ))}
      </div>
    </GameFrame>
  );
}
