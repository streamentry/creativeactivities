import { useCreateStore, useSelector } from '@tanstack/react-store';
import { useEffect, useRef, useState } from 'react';
import { picturesIn, pictureUrl, type PictureCategory } from '../data/pictures';
import type { PlayProps } from '../i18n/play';
import { fill, plural } from '../i18n/play/format';
import { LARGE_PICTURE_PX, needsNewRound, visibleBaskets } from '../lib/games/large-targets';
import { createRng, randomSeed } from '../lib/games/random';
import { createSort, dropInBasket, isSorted, selectItem, type SortState } from '../lib/games/sorting';
import { ChoiceChips } from './shared/ChoiceChips';
import { GameFrame } from './shared/GameFrame';
import { PictureTile, pictureNamer } from './shared/PictureTile';
import { sounds } from './shared/sound';

interface Theme {
  /** Key for the chip label and basket names in `content.sorting.themes`. */
  value: string;
  categories: [PictureCategory, PictureCategory];
}

const THEMES: readonly Theme[] = [
  { value: 'kitchen-garden', categories: ['kitchen', 'garden'] },
  { value: 'fruit-animals', categories: ['fruit', 'animals'] },
  { value: 'home-travel', categories: ['home', 'travel'] },
];

const ids = (c: PictureCategory) => picturesIn(c).map((p) => p.id);

const isRecord = (b: unknown): b is Record<string, unknown> => typeof b === 'object' && b !== null && !Array.isArray(b);
const isBasket = (v: unknown): v is 0 | 1 => v === 0 || v === 1;

/** A saved sort (WEB-054): the theme, the pictures with their baskets, the ones placed, and the one picked up. */
interface SavedSort {
  theme: string;
  items: SortState['items'];
  placed: SortState['placed'];
  selected: string | null;
}

/**
 * A saved sort is kept only when its theme is one of the three, every picture is in a basket of that theme,
 * and every placed picture sits in its own basket.
 */
function checkBoard(b: unknown): boolean {
  if (!isRecord(b)) return false;
  const themeKey = b.theme;
  const items = b.items;
  const placed = b.placed;
  const selected = b.selected;
  const theme = THEMES.find((t) => t.value === themeKey);
  if (!theme || !Array.isArray(items) || !isRecord(placed) || items.length < 1 || items.length > 12) return false;
  const baskets = [ids(theme.categories[0]), ids(theme.categories[1])] as const;
  const seen = new Set<string>();
  for (const item of items) {
    if (!isRecord(item) || typeof item.id !== 'string' || !isBasket(item.basket)) return false;
    if (seen.has(item.id) || !baskets[item.basket].includes(item.id)) return false;
    seen.add(item.id);
  }
  for (const [id, basket] of Object.entries(placed)) {
    if (!isBasket(basket) || !items.some((i) => isRecord(i) && i.id === id && i.basket === basket)) return false;
  }
  if (selected === null) return true;
  return typeof selected === 'string' && seen.has(selected) && placed[selected] === undefined;
}

export default function SortTogether(props: PlayProps) {
  const { ui, lang, content } = props;
  const pictureName = pictureNamer(props);
  const [themeKey, setThemeKey] = useState(THEMES[0]!.value);
  const [round, setRound] = useState(0);
  // Larger targets is a choice for tremor, low vision or limited reach: off at the start.
  const [larger, setLarger] = useState(false);
  const [message, setMessage] = useState('');
  // WEB-054: a board carried back by Carry on is put back by the effect below, not dealt anew.
  const pending = useRef<SavedSort | null>(null);
  const theme = THEMES.find((t) => t.value === themeKey) ?? THEMES[0]!;
  const text = (t: Theme) => content.sorting.themes[t.value] ?? { label: t.value, baskets: t.categories };
  const allBaskets = text(theme).baskets;
  const baskets = visibleBaskets(allBaskets, larger);

  const store = useCreateStore<SortState, { select: (id: string) => void; drop: (b: 0 | 1) => void; reset: (t: Theme) => void; restore: (s: SortState) => void }>(
    { items: [], placed: {}, selected: null, hint: null },
    ({ setState }) => ({
      select: (id) => setState((s) => selectItem(s, id)),
      drop: (b) => setState((s) => dropInBasket(s, b)),
      reset: (t) => setState(() => createSort(ids(t.categories[0]), ids(t.categories[1]), 3, createRng(randomSeed()))),
      restore: (s) => setState(() => s),
    }),
  );
  const state = useSelector(store);

  useEffect(() => {
    const saved = pending.current;
    pending.current = null;
    if (saved) store.actions.restore({ items: saved.items, placed: saved.placed, selected: saved.selected, hint: null });
    else store.actions.reset(theme);
    setMessage('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeKey, round]);

  const restoreBoard = (b: unknown) => {
    if (!checkBoard(b)) return;
    const saved = b as SavedSort;
    pending.current = saved;
    setThemeKey(saved.theme);
    setRound((r) => r + 1);
    setMessage('');
  };

  const select = (id: string) => {
    store.actions.select(id);
    sounds.tap();
    const sel = store.state.selected;
    setMessage(sel ? fill(ui.sortTogether.selected, { name: pictureName(sel) }) : '');
  };

  const drop = (b: 0 | 1) => {
    const id = store.state.selected;
    if (!id) {
      setMessage(ui.sortTogether.pickFirst);
      return;
    }
    store.actions.drop(b);
    const after = store.state;
    if (after.hint) {
      setMessage(fill(ui.sortTogether.hint, { name: pictureName(id), basket: baskets[after.hint.basket] }, lang));
    } else if (isSorted(after)) {
      sounds.done();
      setMessage(ui.sortTogether.sorted);
    } else {
      sounds.match();
      setMessage(fill(ui.sortTogether.placed, { name: pictureName(id), basket: baskets[b] }, lang));
    }
  };

  const changeLarger = (on: boolean) => {
    sounds.tap();
    // Only a basket that would be hidden can strand a picture; then, and only then, the round starts again.
    const again = needsNewRound(allBaskets.length, on);
    setLarger(on);
    if (again) store.actions.reset(theme);
    setMessage(on ? (again ? ui.sortTogether.largerOnNewRound : ui.sortTogether.largerOn) : ui.sortTogether.largerOff);
  };

  const choices = THEMES.map((t) => ({ value: t.value, label: text(t).label }));
  const waiting = state.items.filter((i) => state.placed[i.id] === undefined);
  const done = state.items.length > 0 && waiting.length === 0;
  return (
    <GameFrame
      ui={ui}
      lang={lang}
      guidance={ui.sortTogether.guidance}
      place={{ slug: 'sort-together', save: () => ({ theme: themeKey, items: state.items, placed: state.placed, selected: state.selected }), check: checkBoard, restore: restoreBoard }}
      readAloudText={done ? ui.sortTogether.sorted : `${ui.sortTogether.guidance}: ${baskets[0]}, ${baskets[1]}.`}
      message={message}
      onRestart={() => {
        sounds.tap();
        setRound((r) => r + 1);
      }}
      restartLabel={ui.sortTogether.restart}
      options={
        <>
          <ChoiceChips legend={ui.sortTogether.themeLegend} choices={choices} value={themeKey} onChange={setThemeKey} />
          <label className="chip sort-together__larger-toggle">
            <input type="checkbox" checked={larger} onChange={(event) => changeLarger(event.currentTarget.checked)} />
            <span>{ui.sortTogether.largerTargets}</span>
          </label>
        </>
      }
      footer={
        done ? (
          <div className="game__done">
            <p>{ui.sortTogether.sorted}</p>
            <div className="btn-row btn-row--center">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  sounds.tap();
                  setRound((r) => r + 1);
                }}
              >
                {ui.sortTogether.restart}
              </button>
            </div>
          </div>
        ) : null
      }
    >
      {waiting.length > 0 ? (
        <div className={larger ? 'board board--large' : 'board'} data-cols={larger ? 2 : 3} data-width="medium">
          {waiting.map((item, i) => (
            <PictureTile
              key={item.id}
              ui={ui}
              value={item.id}
              name={pictureName(item.id)}
              position={i + 1}
              state={state.selected === item.id ? 'selected' : 'resting'}
              onTap={() => select(item.id)}
            />
          ))}
        </div>
      ) : null}
      <div className={larger ? 'baskets baskets--large' : 'baskets'}>
        {baskets.map((name, b) => {
          const inside = state.items.filter((i) => state.placed[i.id] === b);
          return (
            <button
              key={`${theme.value}-${b}`}
              type="button"
              className={`basket${larger ? ' basket--large' : ''}${state.selected ? ' basket--ready' : ''}`}
              onClick={() => drop(b as 0 | 1)}
              aria-label={fill(plural(ui.sortTogether.basket, inside.length, lang), { basket: name, count: inside.length })}
            >
              <span className="basket__title">{name}</span>
              <span className="basket__items">
                {inside.map((i) => {
                  const label = pictureName(i.id);
                  return <img key={i.id} src={pictureUrl(i.id)} alt={label} title={label} width={larger ? LARGE_PICTURE_PX : 48} height={larger ? LARGE_PICTURE_PX : 48} />;
                })}
              </span>
            </button>
          );
        })}
      </div>
    </GameFrame>
  );
}
