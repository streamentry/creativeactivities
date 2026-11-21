import { useEffect, useState } from 'react';
import type { PlayProps } from '../i18n/play';
import { fill } from '../i18n/play/format';
import { pictureUrl } from '../data/pictures';
import { createRng, randomSeed } from '../lib/games/random';
import { SHADOW_IDS } from '../lib/games/shadow';
import { STORY_MAX, addPicture, canTakeOff, isFull, removeLast, startChain, type StoryChain as Chain } from '../lib/games/story-chain';
import { GameFrame } from './shared/GameFrame';
import { pictureNamer } from './shared/PictureTile';
import { sounds } from './shared/sound';

/** The chain the page is built with, so the server and the browser agree; a random one replaces it on load. */
const FIRST_SEED = 20261117;

const isRecord = (b: unknown): b is Record<string, unknown> => typeof b === 'object' && b !== null && !Array.isArray(b);

/** A saved chain (WEB-054): one to eight different pictures from the shadow set. */
function checkBoard(b: unknown): boolean {
  if (!isRecord(b) || !Array.isArray(b.pictures)) return false;
  const pictures: unknown[] = b.pictures;
  return (
    pictures.length >= 1 &&
    pictures.length <= STORY_MAX &&
    new Set(pictures).size === pictures.length &&
    pictures.every((id) => typeof id === 'string' && SHADOW_IDS.includes(id))
  );
}

export default function StoryChain(props: PlayProps) {
  const { ui, lang } = props;
  const text = ui.storyChain;
  const pictureName = pictureNamer(props);
  const [chain, setChain] = useState<Chain>(() => startChain(createRng(FIRST_SEED)));
  const [message, setMessage] = useState('');

  useEffect(() => {
    setChain((current) => startChain(createRng(randomSeed()), current));
  }, []);

  const restoreBoard = (b: unknown) => {
    if (!checkBoard(b)) return;
    setChain({ pictures: [...(b as { pictures: string[] }).pictures] });
    setMessage('');
  };

  const full = isFull(chain);
  const last = chain.pictures[chain.pictures.length - 1] as string;

  const add = () => {
    sounds.tap();
    if (full) {
      newChain();
      return;
    }
    const next = addPicture(chain, createRng(randomSeed()));
    setChain(next);
    const newest = next.pictures[next.pictures.length - 1] as string;
    setMessage(isFull(next) ? text.full : fill(text.added, { name: pictureName(newest) }, lang));
  };

  const newChain = () => {
    const next = startChain(createRng(randomSeed()), chain);
    setChain(next);
    setMessage(fill(text.fresh, { name: pictureName(next.pictures[0] as string) }, lang));
  };

  const takeOff = () => {
    if (!canTakeOff(chain)) return;
    sounds.tap();
    setChain(removeLast(chain));
    setMessage(fill(text.removed, { name: pictureName(last) }, lang));
  };

  return (
    <GameFrame ui={ui} lang={lang} guidance={ui.storyChain.guidance} readAloudText={ui.storyChain.guidance} message={message} place={{ slug: 'story-chain', save: () => ({ pictures: chain.pictures }), check: checkBoard, restore: restoreBoard }}>
      <p className="together__note">{text.passNote}</p>
      <ol className="chain" aria-label={text.chainLabel} data-length={chain.pictures.length} data-max={STORY_MAX}>
        {chain.pictures.map((id, i) => (
          <li key={id} className="chain__item" data-newest={i === chain.pictures.length - 1 ? 'yes' : 'no'}>
            <img src={pictureUrl(id)} alt={fill(text.item, { n: i + 1, name: pictureName(id) }, lang)} width="120" height="120" draggable={false} />
          </li>
        ))}
      </ol>
      <div className="chain__actions">
        <button type="button" className="btn btn--primary btn--hero" onClick={add}>
          {full ? text.fullAdd : text.add}
        </button>
        <div className="btn-row btn-row--center">
          {full ? null : (
            <button type="button" className="btn" onClick={() => { sounds.tap(); newChain(); }}>
              {text.newChain}
            </button>
          )}
          <button type="button" className="btn" aria-disabled={!canTakeOff(chain)} onClick={takeOff}>
            {text.takeOff}
          </button>
        </div>
      </div>
    </GameFrame>
  );
}
