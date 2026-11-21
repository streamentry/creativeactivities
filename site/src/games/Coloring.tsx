import { useState, type KeyboardEvent } from 'react';
import { COLORING_PAGES, PAINTS, type Paint } from '../data/coloring';
import type { PlayProps } from '../i18n/play';
import { fill } from '../i18n/play/format';
import { ChoiceChips } from './shared/ChoiceChips';
import { GameFrame } from './shared/GameFrame';
import { Icon } from './shared/Icon';
import { sounds } from './shared/sound';

const INK = '#2b2b2b';

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** The saved board, or null unless it names a known page and paint and fills only its regions with known paints. */
function parseColoring(b: unknown): { page: string; paint: Paint; fills: Record<string, string> } | null {
  if (!isRecord(b) || !isRecord(b.fills)) return null;
  const page = COLORING_PAGES.find((p) => p.id === b.page);
  const paint = PAINTS.find((p) => p.id === b.paint);
  if (!page || !paint) return null;
  const regions = new Set(page.regions.map((r) => r.id));
  const values = new Set<string>(PAINTS.map((p) => p.value));
  const fills: Record<string, string> = {};
  for (const [id, value] of Object.entries(b.fills)) {
    if (!regions.has(id) || typeof value !== 'string' || !values.has(value)) return null;
    fills[id] = value;
  }
  return { page: page.id, paint, fills };
}

export default function Coloring(props: PlayProps) {
  const { ui, lang, content } = props;
  const [pageId, setPageId] = useState(COLORING_PAGES[0]!.id);
  const [paint, setPaint] = useState(PAINTS[2]!);
  const [fills, setFills] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const page = COLORING_PAGES.find((p) => p.id === pageId) ?? COLORING_PAGES[0]!;
  const pageText = (id: string) => content.coloring.pages[id] ?? { name: id, regions: {} };
  const pageName = pageText(page.id).name;
  const partName = (id: string) => pageText(page.id).regions[id] ?? id;
  const paintName = (p: Paint) => (ui.coloring.paints as Record<string, string>)[p.id] ?? p.id;
  const isCompleted = page.regions.length > 0 && page.regions.every((r) => Boolean(fills[r.id]));

  // A new page starts blank. This runs in the change handler, not an effect, so a restored board is not wiped.
  const changePage = (id: string) => {
    if (id === pageId) return;
    setPageId(id);
    setFills({});
    setMessage('');
  };

  const paintPart = (id: string) => {
    const nextFills = { ...fills, [id]: paint.value };
    setFills(nextFills);
    const isCompleted = page.regions.every((r) => Boolean(nextFills[r.id]));
    if (isCompleted) {
      sounds.done();
    } else {
      sounds.tap();
    }
    setMessage(fill(ui.coloring.painted, { part: partName(id), paint: paintName(paint) }, lang));
  };

  const onKey = (e: KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      paintPart(id);
    }
  };

  const partLabel = (id: string) => {
    const color = PAINTS.find((p) => p.value === fills[id]);
    return color
      ? fill(ui.coloring.partPainted, { part: partName(id), paint: paintName(color) }, lang)
      : fill(ui.coloring.partBlank, { part: partName(id) });
  };

  const art = (interactive: boolean) => (
    <svg
      viewBox="0 0 400 400"
      role={interactive ? 'group' : 'img'}
      aria-label={interactive ? fill(ui.coloring.artLabel, { page: pageName, count: page.regions.length }) : pageName}
    >
      {page.regions.map((r) => (
        <path
          key={r.id}
          d={r.d}
          data-region={interactive ? r.id : undefined}
          fill={interactive ? (fills[r.id] ?? '#FFFFFF') : '#FFFFFF'}
          stroke={INK}
          strokeWidth={4}
          strokeLinejoin="round"
          {...(interactive
            ? {
                role: 'button',
                tabIndex: 0,
                'aria-label': partLabel(r.id),
                onClick: () => paintPart(r.id),
                onKeyDown: (e: KeyboardEvent) => onKey(e, r.id),
              }
            : {})}
        />
      ))}
      {page.details ? <path d={page.details} fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" pointerEvents="none" /> : null}
    </svg>
  );

  return (
    <>
      <GameFrame
        ui={ui}
        lang={lang}
        guidance={ui.coloring.guidance}
        readAloudText={`${ui.coloring.guidance}: ${pageName}.`}
        message={message}
        onRestart={() => {
          sounds.tap();
          setFills({});
          setMessage(ui.coloring.cleared);
        }}
        restartLabel={ui.coloring.restart}
        options={
          <ChoiceChips
            legend={ui.coloring.pageLegend}
            choices={COLORING_PAGES.map((p) => ({ value: p.id, label: pageText(p.id).name }))}
            value={pageId}
            onChange={changePage}
          />
        }
        footer={
          <div className="btn-row">
            {isCompleted ? (
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  sounds.tap();
                  setFills({});
                  setMessage(ui.coloring.cleared);
                }}
              >
                {ui.coloring.restart}
              </button>
            ) : null}
            <button
              type="button"
              className={isCompleted ? 'btn' : 'btn btn--primary'}
              onClick={() => {
                sounds.tap();
                window.print();
              }}
            >
              <Icon name="print" />
              {ui.coloring.print}
            </button>
          </div>
        }
        place={{
          slug: 'coloring',
          save: () => ({ page: pageId, paint: paint.id, fills }),
          check: (b) => parseColoring(b) !== null,
          restore: (b) => {
            const saved = parseColoring(b);
            if (!saved) return;
            setPageId(saved.page);
            setPaint(saved.paint);
            setFills(saved.fills);
            setMessage('');
          },
        }}
      >
        <div className="palette" role="group" aria-label={ui.coloring.colorsLabel}>
          {PAINTS.map((p) => (
            <button
              key={p.value}
              type="button"
              className="swatch"
              aria-pressed={p.value === paint.value}
              onClick={() => {
                sounds.tap();
                setPaint(p);
                setMessage(fill(ui.coloring.paintChosen, { paint: paintName(p) }));
              }}
            >
              <span className="swatch__dot" data-paint={p.id} aria-hidden="true" />
              {paintName(p)}
            </button>
          ))}
        </div>
        <div className="color-page">{art(true)}</div>
      </GameFrame>
      <section className="sheet sheet-color" aria-hidden="true">
        <h2>{pageName}</h2>
        {art(false)}
      </section>
    </>
  );
}
