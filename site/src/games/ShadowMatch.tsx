import { useEffect, useState } from 'react';
import { pictureShadowUrl } from '../data/pictures';
import type { PlayProps } from '../i18n/play';
import { fill } from '../i18n/play/format';
import { createRng, randomSeed } from '../lib/games/random';
import { resizePicks } from '../lib/games/resize';
import { SHADOW_IDS, createShadowRound, type ShadowRound } from '../lib/games/shadow';
import { ChoiceChips } from './shared/ChoiceChips';
import { GameFrame } from './shared/GameFrame';
import { PictureTile, pictureNamer } from './shared/PictureTile';
import { sounds } from './shared/sound';

const COUNTS = [2, 3, 4] as const;

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** A list of distinct ids, each passing [ok]. Reads only: a bad saved value is refused, never repaired. */
const isIdList = (v: unknown, ok: (id: string) => boolean): v is string[] =>
  Array.isArray(v) && v.every((id) => typeof id === 'string' && ok(id)) && new Set(v).size === v.length;

const SHADOW_SET: ReadonlySet<string> = new Set(SHADOW_IDS);

/** The saved board, or null when this game cannot show it. */
function parseBoard(b: unknown): { count: number; round: ShadowRound; found: boolean } | null {
  if (!isRecord(b)) return null;
  const { count, round, found } = b;
  if (typeof count !== 'number' || !(COUNTS as readonly number[]).includes(count) || typeof found !== 'boolean') return null;
  if (!isRecord(round)) return null;
  const { target, options } = round;
  if (typeof target !== 'string' || !SHADOW_SET.has(target)) return null;
  if (!isIdList(options, (id) => SHADOW_SET.has(id)) || options.length !== count || !options.includes(target)) return null;
  return { count, round: { target, options: [...options] }, found };
}

const newRound = (count: number, previous?: string): ShadowRound => createShadowRound(count, createRng(randomSeed()), previous);

export default function ShadowMatch(props: PlayProps) {
  const { ui, lang } = props;
  const pictureName = pictureNamer(props);
  const [count, setCount] = useState<number>(2);
  const [round, setRound] = useState<ShadowRound | null>(null);
  const [found, setFound] = useState(false);
  const [tapped, setTapped] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setRound(newRound(count));
  }, []);

  // WEB-053: a different count keeps the same target and the pictures on the board.
  const changeCount = (n: number) => {
    setCount(n);
    if (!round) return;
    const options = resizePicks(round.options, round.target, n, SHADOW_IDS, createRng(randomSeed()));
    setRound({ ...round, options });
    if (tapped !== null && !options.includes(tapped)) setTapped(null);
    if (!found) setMessage('');
  };

  const next = () => {
    sounds.tap();
    setRound((r) => newRound(count, r?.target));
    setFound(false);
    setTapped(null);
    setMessage('');
  };

  if (!round) return null;
  const targetName = pictureName(round.target);
  const counts = COUNTS.map((n) => ({ value: n, label: fill(ui.choose.count, { n }) }));

  const tap = (id: string) => {
    if (found) return;
    setTapped(id);
    if (id === round.target) {
      sounds.match();
      setFound(true);
      setMessage(fill(ui.shadowMatch.yes, { name: targetName }, lang));
    } else {
      sounds.tap();
      setMessage(fill(ui.choose.thatOne, { name: pictureName(id) }, lang));
    }
  };

  return (
    <GameFrame
      ui={ui}
      lang={lang}
      guidance={ui.shadowMatch.guidance}
      readAloudText={found ? targetName : ui.shadowMatch.guidance}
      message={message}
      options={<ChoiceChips legend={ui.choose.countLegend} choices={counts} value={count} onChange={changeCount} />}
      footer={
        <div className="btn-row btn-row--center">
          <button type="button" className={found ? 'btn btn--primary btn--hero' : 'btn'} onClick={next}>
            {ui.shadowMatch.next}
          </button>
        </div>
      }
      place={{
        slug: 'shadow-match',
        save: () => ({ count, round, found }),
        check: (b) => parseBoard(b) !== null,
        restore: (b) => {
          const saved = parseBoard(b);
          if (!saved) return;
          setCount(saved.count);
          setRound(saved.round);
          setFound(saved.found);
          setTapped(null);
          setMessage('');
        },
      }}
    >
      <div className="target">
        <div className="target__print target__print--shadow">
          <img
            src={pictureShadowUrl(round.target)}
            alt={found ? fill(ui.shadowMatch.foundAlt, { name: targetName }, lang) : ui.shadowMatch.shadowAlt}
            width={196}
            height={196}
          />
        </div>
        {found && <span className="target__name">{targetName}</span>}
      </div>
      <div className="board" data-cols={2} data-width="small">
        {round.options.map((id, i) => (
          <PictureTile
            key={`${round.target}-${id}`}
            ui={ui}
            value={id}
            name={pictureName(id)}
            position={i + 1}
            state={found && id === round.target ? 'matched' : tapped === id ? 'selected' : 'resting'}
            onTap={() => tap(id)}
          />
        ))}
      </div>
    </GameFrame>
  );
}
