import { useState } from 'react';
import { COLORING_PAGES, type ColoringPage } from '../data/coloring';
import {
  DEFAULT_WALL_PICTURE,
  DEFAULT_WALL_SIZE,
  WALL_GRIDS,
  WALL_PICTURE_IDS,
  WALL_SIZES,
  WALL_VIEW,
  pageMm,
  wallPicture,
  wallSections,
  type WallSize,
  type WallSection,
} from '../data/coloring-wall';
import type { PlayProps } from '../i18n/play';
import { fill } from '../i18n/play/format';
import { PAUSE_LINE } from '../lib/scope';
import { GameFrame } from './shared/GameFrame';
import { Icon } from './shared/Icon';
import { sounds } from './shared/sound';

/** Line weight on paper, in mm; the picture's lines are drawn at this width whatever the page scale. */
const LINE_MM = 1.2;
/** Line weight on screen, in picture units (the preview is 400 units across). */
const SCREEN_LINE = 3;
/** Gap between the dashed edge line and the page edge, in mm. */
const EDGE_MM = 4;

/** The regions and detail lines of one picture, drawn in the same way on screen and on paper. */
function Picture({ page, lineWidth }: { page: ColoringPage; lineWidth?: number }) {
  return (
    <>
      {page.regions.map((r) => (
        <path key={r.id} className="cw-art__region" d={r.d} strokeWidth={lineWidth} />
      ))}
      {page.details ? <path className="cw-art__line" d={page.details} strokeWidth={lineWidth} /> : null}
    </>
  );
}

/** A small grid of the wall with each page's label in its place. Used on screen and on the printed first page. */
function WallMap({ size, label }: { size: WallSize; label: string }) {
  const { columns, rows } = WALL_GRIDS[size];
  const cell = 40;
  const sections = wallSections(size);
  return (
    <svg className="cw-map" viewBox={`0 0 ${columns * cell} ${rows * cell}`} role="img" aria-label={label} focusable="false">
      {sections.map((s: WallSection) => (
        <g key={s.label}>
          <rect className="cw-map__cell" x={s.column * cell + 1} y={s.row * cell + 1} width={cell - 2} height={cell - 2} />
          <text className="cw-map__label" x={s.column * cell + cell / 2} y={s.row * cell + cell / 2 + 6} textAnchor="middle">
            {s.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** The saved picture and wall size, or null unless both are ones the wall offers. */
function parseWall(b: unknown): { picture: string; size: WallSize } | null {
  if (typeof b !== 'object' || b === null || Array.isArray(b)) return null;
  const { picture, size } = b as { picture?: unknown; size?: unknown };
  if (typeof picture !== 'string' || !WALL_PICTURE_IDS.includes(picture)) return null;
  if (typeof size !== 'string' || !(WALL_SIZES as readonly string[]).includes(size)) return null;
  return { picture, size: size as WallSize };
}

/**
 * Group coloring wall (GAME-052): one Coloring picture printed across 4, 6 or 9 pages, so many people can color
 * one big picture. The screen shows the choices, the page grid laid over the picture, and the steps; the printed
 * sheet is the first page of steps and the map, then one page for each section. Nothing is timed, scored or saved.
 */
export default function ColoringWall(props: PlayProps) {
  const { ui, lang, content } = props;
  const text = ui.coloringWall;
  const [pictureId, setPictureId] = useState(DEFAULT_WALL_PICTURE);
  const [size, setSize] = useState<WallSize>(DEFAULT_WALL_SIZE);
  const page = wallPicture(pictureId) ?? COLORING_PAGES[0]!;
  const pictureName = content.coloring.pages[page.id]?.name ?? page.id;
  const { columns, rows } = WALL_GRIDS[size];
  const sections = wallSections(size);
  const paper = pageMm(size);
  const last = sections[sections.length - 1]!.label;
  const values = { picture: pictureName, n: sections.length, across: columns, down: rows, last };
  const previewText = fill(text.previewLabel, values, lang);
  const mapText = fill(text.mapLabel, values, lang);
  const pictureLine = fill(text.pictureLine, values, lang);
  const steps: readonly string[] = text.steps;

  const print = () => {
    sounds.tap();
    window.print();
  };

  return (
    <>
      <GameFrame
        ui={ui}
        lang={lang}
        guidance={ui.coloringWall.guidance}
        readAloudText={ui.coloringWall.guidance}
        footer={
          <div className="btn-row btn-row--center">
            <button type="button" className="btn btn--primary btn--hero" onClick={print}>
              <Icon name="print" />
              {text.print}
            </button>
          </div>
        }
        place={{
          slug: 'coloring-wall',
          save: () => ({ picture: pictureId, size }),
          check: (b) => parseWall(b) !== null,
          restore: (b) => {
            const saved = parseWall(b);
            if (!saved) return;
            setPictureId(saved.picture);
            setSize(saved.size);
          },
        }}
      >
        <div className="cw-game">
          <fieldset className="cw__choices">
            <legend>{text.pictureLegend}</legend>
            {COLORING_PAGES.map((p) => (
              <label key={p.id} className="cw__choice">
                <input type="radio" name="wall-picture" value={p.id} checked={pictureId === p.id} onChange={() => setPictureId(p.id)} />
                <span>{content.coloring.pages[p.id]?.name ?? p.id}</span>
              </label>
            ))}
          </fieldset>

          <fieldset className="cw__choices">
            <legend>{text.sizeLegend}</legend>
            {WALL_SIZES.map((s) => (
              <label key={s} className="cw__choice">
                <input type="radio" name="wall-size" value={s} checked={size === s} onChange={() => setSize(s)} />
                <span>{text.sizes[s]}</span>
              </label>
            ))}
          </fieldset>

          <figure className="cw__preview">
            <svg className="cw__art" viewBox={`0 0 ${WALL_VIEW} ${WALL_VIEW}`} role="img" aria-label={previewText} focusable="false">
              <Picture page={page} lineWidth={SCREEN_LINE} />
              {sections.map((s) => (
                <rect key={`cut-${s.label}`} className="cw__cut" x={s.x0} y={s.y0} width={s.x1 - s.x0} height={s.y1 - s.y0} />
              ))}
              {sections.map((s) => (
                <g key={`tag-${s.label}`}>
                  <rect className="cw__chip" x={s.x0 + 6} y={s.y0 + 6} width={38} height={28} rx={4} />
                  <text className="cw__chip-label" x={s.x0 + 12} y={s.y0 + 27}>
                    {s.label}
                  </text>
                </g>
              ))}
            </svg>
            <figcaption>{text.previewCaption}</figcaption>
          </figure>
          <p className="cw__note">{text.labelsNote}</p>

          <section aria-labelledby="cw-steps">
            <h2 id="cw-steps">{text.wallHeading}</h2>
            <WallMap size={size} label={mapText} />
            <ol className="cw__steps">
              {steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className="cw__pause">{PAUSE_LINE}</p>
          </section>
        </div>
      </GameFrame>

      <section className="sheet cw-sheet" aria-hidden="true">
        <section className="cw-howto">
          <h2>{text.wallHeading}</h2>
          <p className="cw-howto__line">{pictureLine}</p>
          <WallMap size={size} label={mapText} />
          <ol className="cw-howto__steps">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="cw-howto__edge">{text.edgeNote}</p>
        </section>
        {sections.map((s) => {
          const unitsWide = s.x1 - s.x0;
          const unitsHigh = s.y1 - s.y0;
          const inset = EDGE_MM / paper.scale;
          return (
            <figure key={s.label} className="cw-page" data-section={s.label}>
              <svg
                className="cw-page__art"
                width={`${(unitsWide * paper.scale).toFixed(2)}mm`}
                height={`${(unitsHigh * paper.scale).toFixed(2)}mm`}
                viewBox={`${s.x0} ${s.y0} ${unitsWide} ${unitsHigh}`}
                focusable="false"
              >
                <Picture page={page} lineWidth={LINE_MM / paper.scale} />
                <rect
                  className="cw-page__edge"
                  x={s.x0 + inset}
                  y={s.y0 + inset}
                  width={unitsWide - 2 * inset}
                  height={unitsHigh - 2 * inset}
                  strokeWidth={0.6 / paper.scale}
                  strokeDasharray={`${3 / paper.scale} ${2 / paper.scale}`}
                />
              </svg>
              <span className="cw-page__label">{s.label}</span>
            </figure>
          );
        })}
      </section>
    </>
  );
}
