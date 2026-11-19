import { useId, useState } from 'react';
import { pictureUrl } from '../data/pictures';
import type { PlayProps } from '../i18n/play';
import { sceneAt, stepScene, type SceneEdge } from '../lib/games/quiet-scene';
import { GameFrame } from './shared/GameFrame';
import { Icon } from './shared/Icon';
import { pictureNamer } from './shared/PictureTile';
import { sounds } from './shared/sound';

/**
 * GAME-039 Quiet scene: one large still picture, with one gentle line under it.
 * A picture changes only when a person presses Next or Previous. Nothing moves,
 * fades, times out or plays on its own, and there is no sound.
 */
export default function QuietScene(props: PlayProps) {
  const { ui, lang } = props;
  const pictureName = pictureNamer(props);
  const [index, setIndex] = useState(0);
  const [edge, setEdge] = useState<SceneEdge>(null);
  const [big, setBig] = useState(false);
  const bigId = useId();

  const id = sceneAt(index);
  const name = pictureName(id);
  const lines: Readonly<Record<string, string>> = ui.quietScene.lines;
  const line = lines[id] ?? '';
  const edgeMessage = edge === 'last' ? ui.quietScene.last : edge === 'first' ? ui.quietScene.first : '';

  // A press is the only thing that changes the picture. It never repeats.
  const move = (direction: 1 | -1) => {
    sounds.tap();
    const step = stepScene(index, direction);
    setIndex(step.index);
    setEdge(step.edge);
  };

  return (
    <div className={big ? 'quiet-scene quiet-scene--big' : 'quiet-scene'}>
      <GameFrame
        ui={ui}
        lang={lang}
        guidance={ui.quietScene.guidance}
        options={
          big ? null : (
            <label className="chip quiet-scene__big-toggle" htmlFor={bigId}>
              <input
                id={bigId}
                type="checkbox"
                checked={big}
                onChange={(event) => {
                  sounds.tap();
                  setBig(event.currentTarget.checked);
                }}
              />
              <span>{ui.quietScene.bigPicture}</span>
            </label>
          )
        }
        footer={
          <div className="btn-row quiet-scene__nav">
            <button type="button" className="btn btn--primary btn--hero" onClick={() => move(1)}>
              {ui.quietScene.next}
              <Icon name="arrow" />
            </button>
            <button type="button" className="btn" onClick={() => move(-1)}>
              <Icon name="back" />
              {ui.quietScene.previous}
            </button>
          </div>
        }
      >
        <figure className="quiet-scene__figure">
          <img className="quiet-scene__picture" src={pictureUrl(id)} alt={name} width={600} height={600} />
          <figcaption className="quiet-scene__line">{line}</figcaption>
          <p className="quiet-scene__edge" role="status" aria-live="polite">
            {edgeMessage}
          </p>
          {big ? (
            <button type="button" className="btn quiet-scene__show-all" onClick={() => setBig(false)}>
              {ui.quietScene.showEverything}
            </button>
          ) : null}
        </figure>
      </GameFrame>
    </div>
  );
}
