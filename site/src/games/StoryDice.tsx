import { useEffect, useState } from 'react';
import type { PlayProps } from '../i18n/play';
import { fill } from '../i18n/play/format';
import { boardColumns } from '../lib/games/pairs';
import { createRng, randomSeed } from '../lib/games/random';
import { DICE_COUNTS, DICE_POOL, resizeDice, rollDice, type DiceRoll } from '../lib/games/story-dice';
import { ChoiceChips } from './shared/ChoiceChips';
import { GameFrame } from './shared/GameFrame';
import { Icon } from './shared/Icon';
import { PictureTile, pictureNamer } from './shared/PictureTile';
import { sounds } from './shared/sound';
import { useWide } from './shared/useWide';

const isRecord = (b: unknown): b is Record<string, unknown> => typeof b === 'object' && b !== null && !Array.isArray(b);

/** A saved roll: a dice count, that many different pictures from the pool, and the die chosen to start (or none). */
function checkBoard(b: unknown): boolean {
  if (!isRecord(b) || !Array.isArray(b.pictures)) return false;
  const pictures: unknown[] = b.pictures;
  if (!(DICE_COUNTS as readonly unknown[]).includes(b.count) || pictures.length !== b.count) return false;
  if (!pictures.every((id) => typeof id === 'string' && DICE_POOL.includes(id))) return false;
  if (new Set(pictures).size !== pictures.length) return false;
  return b.start === null || (typeof b.start === 'string' && pictures.includes(b.start));
}

/** Story dice (GAME-025): pictures to tell a story with. No score, no right answer, nothing ends. */
export default function StoryDice(props: PlayProps) {
  const { ui, lang } = props;
  const pictureName = pictureNamer(props);
  const wide = useWide();
  const [count, setCount] = useState<number>(DICE_COUNTS[0]);
  const [roll, setRoll] = useState<DiceRoll | null>(null);
  // The die a person chose to begin with; any order is fine, so this is only a marker.
  const [start, setStart] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setRoll(rollDice(count, createRng(randomSeed())));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // WEB-053: a different count keeps the dice already shown.
  const changeCount = (n: number) => {
    setCount(n);
    if (!roll) return;
    const next = resizeDice(roll, n, createRng(randomSeed()));
    setRoll(next);
    if (start && !next.pictures.includes(start)) setStart(null);
  };

  const restoreBoard = (b: unknown) => {
    if (!checkBoard(b)) return;
    const saved = b as { count: number; pictures: string[]; start: string | null };
    setCount(saved.count);
    setRoll({ pictures: [...saved.pictures] });
    setStart(saved.start);
    setMessage('');
  };

  if (!roll) return null;
  const choices = DICE_COUNTS.map((n) => ({ value: n, label: fill(ui.storyDice.count, { n }) }));
  const columns = boardColumns(roll.pictures.length, wide);

  const again = () => {
    sounds.tap();
    const next = rollDice(count, createRng(randomSeed()), roll);
    setRoll(next);
    setStart(null);
    setMessage(fill(ui.storyDice.rolled, { names: next.pictures.map(pictureName).join(', ') }, lang));
  };

  const pass = () => {
    sounds.tap();
    setMessage(ui.storyDice.passed);
  };

  const choose = (id: string) => {
    sounds.tap();
    setStart(id);
    setMessage(fill(ui.storyDice.tapped, { name: pictureName(id) }, lang));
  };

  return (
    <GameFrame
      ui={ui}
      lang={lang}
      guidance={ui.storyDice.guidance}
      place={{ slug: 'story-dice', save: () => ({ count, pictures: roll.pictures, start }), check: checkBoard, restore: restoreBoard }}
      message={message}
      options={<ChoiceChips legend={ui.storyDice.countLegend} choices={choices} value={count} onChange={changeCount} />}
      footer={
        <div className="btn-row btn-row--center">
          <button type="button" className="btn" onClick={pass}>
            {ui.storyDice.pass}
          </button>
          <button type="button" className="btn btn--primary btn--hero" onClick={again}>
            <Icon name="refresh" />
            {ui.storyDice.roll}
          </button>
        </div>
      }
    >
      <div className="board" data-cols={columns} data-width="small">
        {roll.pictures.map((id, i) => (
          <PictureTile
            key={id}
            ui={ui}
            value={id}
            name={pictureName(id)}
            position={i + 1}
            state={id === start ? 'selected' : 'resting'}
            onTap={() => choose(id)}
          />
        ))}
      </div>
    </GameFrame>
  );
}
