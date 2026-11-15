import { BG, C, INK, S, SHADE, SHINE, type Picture } from './kit.ts';

/**
 * Finished results of activity cards (WEB-012), drawn in the shared kit. One
 * drawing per card, showing what the card's result looks like. No faces and
 * no hands; no text inside the drawing, so the name and caption carry words.
 */

/** Deterministic pseudo-random number in [0, 1) for a seed pair. */
const rnd = (a: number, b: number) => {
  const x = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** A leaf centred on (x, y) with a pale midrib, for prints and pressed leaves. */
const leaf = (x: number, y: number, rot: number, fill: string, scale = 1) =>
  `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${scale})"><path d="M-14 0C-6-10 8-10 14 0C8 10-6 10-14 0Z" fill="${fill}" ${S} stroke-width="2"/><path d="M-10 0H10" stroke="${C.paper}" stroke-width="1.5" fill="none"/></g>`;

/** A small bird in flight, drawn as the classic two-stroke "m". */
const flyingBird = (x: number, y: number, s = 1) =>
  `<path d="M${x} ${y}q${5 * s} ${-5 * s} ${10 * s} 0q${5 * s} ${-5 * s} ${10 * s} 0" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`;

/** Torn paper flower: a fine grid of jittered pieces, with gaps of paper between. */
function tornFlower(): string {
  const petalCentres = [0, 72, 144, 216, 288].map((deg) => [
    60 + 25 * Math.cos(((deg - 90) * Math.PI) / 180),
    60 + 25 * Math.sin(((deg - 90) * Math.PI) / 180),
  ]);
  const pieces: string[] = [];
  for (let r = 0; r < 13; r++) {
    for (let c = 0; c < 13; c++) {
      const cx = 18 + c * 7;
      const cy = 18 + r * 7;
      const inCentre = Math.hypot(cx - 60, cy - 60) <= 12;
      const petal = petalCentres.some(([px, py]) => Math.hypot(cx - px, cy - py) <= 10.5);
      const stem = Math.abs(cx - 60) <= 3.5 && cy >= 86 && cy <= 108;
      if (!inCentre && !petal && !stem) continue;
      const palette = stem ? [C.green, C.deepGreen] : inCentre ? [C.mustard, C.yellow, C.orange] : [C.pink, C.red, C.peach];
      const fill = palette[Math.floor(rnd(r, c) * palette.length)];
      const corners = [
        [-3.2, -3.2],
        [3.2, -3.2],
        [3.2, 3.2],
        [-3.2, 3.2],
      ].map(([dx, dy], k) => {
        const jx = (rnd(r * 13 + c, k * 2 + 1) - 0.5) * 1.6;
        const jy = (rnd(r * 13 + c, k * 2 + 2) - 0.5) * 1.6;
        return `${(cx + dx + jx).toFixed(1)} ${(cy + dy + jy).toFixed(1)}`;
      });
      pieces.push(`<path d="M${corners.join('L')}Z" fill="${fill}" stroke="${INK}" stroke-opacity=".4" stroke-width=".8"/>`);
    }
  }
  return pieces.join('');
}

/** Woven paper mat: a basketweave of red and mustard across, blue and green up and down. */
function wovenMat(): string {
  const cells: string[] = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      const x = 24 + c * 12;
      const y = 24 + r * 12;
      const across = (r + c) % 2 === 0;
      const fill = across ? (r % 2 ? C.mustard : C.red) : c % 2 ? C.green : C.blue;
      const box = across ? `x="${x}" y="${y + 1}" width="12" height="10"` : `x="${x + 1}" y="${y}" width="10" height="12"`;
      cells.push(`<rect ${box} rx="1" fill="${fill}" stroke="${INK}" stroke-opacity=".5" stroke-width="1"/>`);
    }
  }
  return cells.join('');
}

/** Pieces of a drum's lacing: a zigzag from one side of the body to the other. */
const lacing = Array.from({ length: 9 }, (_, i) => `${28 + i * 8} ${i % 2 ? 70 : 78}`).join('L');

export const ACTIVITY_RESULTS_B: readonly Picture[] = [
  {
    id: 'playlist-phone-and-card',
    name: 'Phone playlist and song card',
    category: 'home',
    bg: BG.blush,
    ground: 102,
    body: `
      <rect x="26" y="12" width="46" height="90" rx="8" fill="${C.paper}" ${S}/>
      <rect x="32" y="22" width="34" height="68" rx="3" fill="${C.sky}" ${S} stroke-width="2.5"/>
      <circle cx="49" cy="52" r="10" fill="${C.paper}" ${S} stroke-width="2.5"/>
      <path d="M46 47l8 5-8 5z" fill="${INK}"/>
      <rect x="36" y="70" width="26" height="4" rx="2" fill="${C.paper}"/>
      <rect x="36" y="78" width="18" height="4" rx="2" fill="${C.paper}"/>
      <circle cx="49" cy="98" r="3" fill="${INK}"/>
      <path d="M89 34V16M107 26V10M89 16l18-6" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="84" cy="34" r="5" fill="${INK}"/>
      <circle cx="102" cy="26" r="5" fill="${INK}"/>
      <rect x="80" y="54" width="28" height="36" rx="3" fill="${C.paper}" ${S} stroke-width="2.5"/>
      <path d="M86 66h16M86 74h16M86 82h11" stroke="${C.plum}" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M64 14c6 0 8 4 8 8v72c0 4-2 8-8 8z" ${SHADE}/>
      <path d="M30 40v18" ${SHINE}/>`,
  },
  {
    id: 'sealed-rice-shaker',
    name: 'Sealed rice shaker',
    category: 'home',
    bg: BG.sage,
    ground: 100,
    body: `
      <path d="M46 30h28v8c10 6 16 16 16 30v26c0 6-4 10-10 10H40c-6 0-10-4-10-10V68c0-14 6-24 16-30z" fill="${C.sky}" fill-opacity=".35" ${S}/>
      <g fill="${C.tan}">${Array.from({ length: 15 }, (_, i) => `<circle cx="${44 + (i % 5) * 8 + (Math.floor(i / 5) % 2) * 4}" cy="${80 + Math.floor(i / 5) * 8}" r="2.6"/>`).join('')}</g>
      <rect x="44" y="20" width="32" height="12" rx="3" fill="${C.red}" ${S}/>
      <rect x="34" y="56" width="52" height="14" fill="${C.mustard}" ${S} stroke-width="2.5"/>
      <path d="M40 58l6 10M50 58l6 10M60 58l6 10M70 58l6 10M80 58l6 10" stroke="${C.paper}" stroke-width="3" stroke-linecap="round"/>
      <path d="M102 36V20M110 46V30M102 20l8-3" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="98" cy="36" r="4.5" fill="${INK}"/>
      <circle cx="106" cy="46" r="4.5" fill="${INK}"/>
      <path d="M76 36c10 8 14 22 14 38v20H78c4-10 6-20 6-34z" ${SHADE}/>
      <path d="M38 40c0-4 3-8 6-10" ${SHINE}/>`,
  },
  {
    id: 'texture-board-with-scraps',
    name: 'Texture board with scraps',
    category: 'home',
    bg: BG.cream,
    body: `
      <rect x="14" y="16" width="92" height="88" rx="6" fill="${C.tan}" ${S}/>
      <rect x="22" y="24" width="38" height="32" rx="2" fill="${C.blue}" ${S} stroke-width="2.5"/>
      <path d="M22 34h38M22 44h38M22 52h38" stroke="${C.paper}" stroke-width="2" stroke-opacity=".7"/>
      <rect x="66" y="24" width="32" height="32" rx="2" fill="${C.sand}" ${S} stroke-width="2.5"/>
      <path d="M66 32h32M66 40h32M66 48h32" stroke="${C.brown}" stroke-width="2" stroke-opacity=".6"/>
      <circle cx="30" cy="74" r="6.5" fill="${C.red}" ${S} stroke-width="2"/>
      <circle cx="48" cy="72" r="6.5" fill="${C.mustard}" ${S} stroke-width="2"/>
      <circle cx="38" cy="88" r="6.5" fill="${C.green}" ${S} stroke-width="2"/>
      <g fill="${INK}"><circle cx="28" cy="74" r="1.3"/><circle cx="32" cy="74" r="1.3"/><circle cx="46" cy="72" r="1.3"/><circle cx="50" cy="72" r="1.3"/></g>
      <g fill="${C.paper}" ${S} stroke-width="2"><circle cx="74" cy="84" r="6"/><circle cx="84" cy="80" r="8"/><circle cx="94" cy="84" r="6"/><circle cx="84" cy="88" r="6"/></g>
      <path d="M98 20h6c2 0 4 2 4 4v80c0 2-2 4-4 4h-6z" ${SHADE}/>
      <path d="M20 22c0-2 2-4 4-4" ${SHINE}/>`,
  },
  {
    id: 'painted-garden-stone',
    name: 'Painted garden stone',
    category: 'garden',
    bg: BG.sage,
    ground: 100,
    body: `
      <path d="M24 96C16 80 24 52 42 44c16-8 38-8 52 2 14 10 16 34 8 46-10 14-36 14-52 8-8-3-18-2-26-4z" fill="${C.silver}" ${S}/>
      <g fill="${C.pink}" ${S} stroke-width="2"><circle cx="62" cy="52" r="6"/><circle cx="72" cy="58" r="6"/><circle cx="68" cy="70" r="6"/><circle cx="56" cy="70" r="6"/><circle cx="52" cy="58" r="6"/></g>
      <circle cx="62" cy="62" r="4" fill="${C.mustard}" ${S} stroke-width="2"/>
      <g fill="${C.blue}"><circle cx="40" cy="78" r="2.5"/><circle cx="48" cy="86" r="2.5"/><circle cx="80" cy="80" r="2.5"/><circle cx="88" cy="72" r="2.5"/></g>
      <path d="M30 92q20-6 44 0" fill="none" stroke="${C.blue}" stroke-width="3" stroke-linecap="round"/>
      <path d="M14 102q4-8 8 0M100 104q4-8 8 0M108 100q3-6 6 0" fill="none" stroke="${C.green}" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M70 42c12 4 22 18 20 36-2 10-8 16-14 18 8-10 10-22 6-36-3-8-8-14-12-18z" ${SHADE}/>
      <path d="M34 66c0-8 4-14 10-18" ${SHINE}/>`,
  },
  {
    id: 'shared-painted-canvas',
    name: 'Shared painted canvas',
    category: 'home',
    bg: BG.sky,
    ground: 108,
    body: `
      <path d="M46 86L30 110M74 86L90 110M60 88V112" fill="none" stroke="${C.brown}" stroke-width="4" stroke-linecap="round"/>
      <rect x="20" y="14" width="80" height="66" rx="3" fill="${C.paper}" ${S}/>
      <path d="M24 80V64c14-10 28-10 40-2s26 6 36-2v18z" fill="${C.green}" ${S} stroke-width="2.5"/>
      <circle cx="42" cy="36" r="10" fill="${C.yellow}" ${S} stroke-width="2.5"/>
      <path d="M22 54c10 6 18-6 28 0s18 6 28 0 14-4 22 0" fill="none" stroke="${C.blue}" stroke-width="4" stroke-linecap="round"/>
      <path d="M60 40q10-8 20 0" fill="none" stroke="${C.orange}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="78" cy="26" r="5" fill="${C.red}"/>
      <circle cx="90" cy="40" r="4" fill="${C.plum}"/>
      <circle cx="66" cy="22" r="3.5" fill="${C.pink}"/>
      <rect x="16" y="80" width="88" height="6" rx="2" fill="${C.wood}" ${S} stroke-width="2"/>
      <path d="M24 20h10" ${SHINE}/>`,
  },
  {
    id: 'watercolor-washes-sheet',
    name: 'Watercolor washes on paper',
    category: 'home',
    bg: BG.cream,
    body: `
      <rect x="16" y="18" width="76" height="70" rx="2" fill="${C.paper}" ${S}/>
      <circle cx="42" cy="44" r="16" fill="${C.sky}" fill-opacity=".6" stroke="${C.blue}" stroke-opacity=".45" stroke-width="1.5"/>
      <ellipse cx="66" cy="52" rx="18" ry="12" fill="${C.pink}" fill-opacity=".55" stroke="${C.red}" stroke-opacity=".4" stroke-width="1.5"/>
      <ellipse cx="50" cy="68" rx="14" ry="9" fill="${C.mustard}" fill-opacity=".55" stroke="${C.orange}" stroke-opacity=".5" stroke-width="1.5"/>
      <circle cx="76" cy="30" r="9" fill="${C.leaf}" fill-opacity=".6" stroke="${C.green}" stroke-opacity=".45" stroke-width="1.5"/>
      <rect x="22" y="92" width="64" height="12" rx="4" fill="${C.silver}" ${S}/>
      <circle cx="34" cy="98" r="5" fill="${C.sky}" ${S} stroke-width="2"/>
      <circle cx="48" cy="98" r="5" fill="${C.pink}" ${S} stroke-width="2"/>
      <circle cx="62" cy="98" r="5" fill="${C.mustard}" ${S} stroke-width="2"/>
      <circle cx="76" cy="98" r="5" fill="${C.leaf}" ${S} stroke-width="2"/>
      <path d="M92 102L110 58" stroke="${C.wood}" stroke-width="5" stroke-linecap="round"/>
      <path d="M110 58c2-6 4-10 6-14 2 4 0 10-2 14z" fill="${C.blue}" ${S} stroke-width="2"/>
      <path d="M26 30c4-4 10-6 16-6" ${SHINE}/>`,
  },
  {
    id: 'seedling-in-pot',
    name: 'Seedlings in a pot',
    category: 'garden',
    bg: BG.sky,
    ground: 104,
    body: `
      <path d="M36 72h48l-6 30H42z" fill="#C9673A" ${S}/>
      <rect x="32" y="66" width="56" height="10" rx="3" fill="#B0552B" ${S}/>
      <ellipse cx="60" cy="68" rx="24" ry="4" fill="${C.brown}" ${S} stroke-width="2"/>
      <path d="M46 66V54M60 66V40M74 66V50" stroke="${C.green}" stroke-width="3" stroke-linecap="round"/>
      <path d="M46 56c-6-6-12-6-14-3 4 6 10 7 14 3z" fill="${C.leaf}" ${S} stroke-width="2"/>
      <path d="M46 54c6-6 12-6 14-3-4 6-10 7-14 3z" fill="${C.leaf}" ${S} stroke-width="2"/>
      <path d="M60 46c-8-10-18-8-20-4 6 8 14 8 20 4z" fill="${C.leaf}" ${S} stroke-width="2"/>
      <path d="M60 40c6-12 16-12 20-8-6 10-14 12-20 8z" fill="${C.leaf}" ${S} stroke-width="2"/>
      <path d="M74 50c-4-8-10-10-12-6 4 6 8 8 12 6z" fill="${C.leaf}" ${S} stroke-width="2"/>
      <path d="M74 50c4-8 10-10 12-6-4 6-8 8-12 6z" fill="${C.leaf}" ${S} stroke-width="2"/>
      <path d="M28 40c-3 4-4 6-4 8a4 4 0 0 0 8 0c0-2-1-4-4-8z" fill="${C.sky}" ${S} stroke-width="2"/>
      <path d="M96 30c-3 4-4 6-4 8a4 4 0 0 0 8 0c0-2-1-4-4-8z" fill="${C.sky}" ${S} stroke-width="2"/>
      <path d="M74 72h10l-5 30h-6z" ${SHADE}/>
      <path d="M42 78l-2 12" ${SHINE}/>`,
  },
  {
    id: 'pressed-leaves-in-book',
    name: 'Pressed leaves in a book',
    category: 'garden',
    bg: BG.blush,
    ground: 98,
    body: `
      <path d="M60 36C46 30 28 30 14 34v58c14-4 32-4 46 4z" fill="${C.paper}" ${S}/>
      <path d="M60 36c14-6 32-6 46-2v58c-14-4-32-4-46 4z" fill="${C.paper}" ${S}/>
      <path d="M60 92c14-8 32-8 46-4v4c-14-4-32-4-46 4z" ${SHADE}/>
      <path d="M60 36v62" stroke="${INK}" stroke-width="3"/>
      <g fill="${C.pink}" ${S} stroke-width="2"><circle cx="34" cy="38" r="4.5"/><circle cx="40" cy="44" r="4.5"/><circle cx="34" cy="50" r="4.5"/><circle cx="28" cy="44" r="4.5"/></g>
      <circle cx="34" cy="44" r="2.5" fill="${C.mustard}"/>
      ${leaf(30, 68, -20, C.green, 1.1)}
      ${leaf(86, 56, 25, C.mustard, 1.1)}
      ${leaf(80, 78, 62, C.orange, 0.9)}
      <rect x="20" y="82" width="14" height="8" fill="${C.paper}" ${S} stroke-width="2"/>
      <path d="M22 26c4-4 10-6 16-6" ${SHINE}/>`,
  },
  {
    id: 'printed-leaves-sheet',
    name: 'Sheet of leaf prints',
    category: 'garden',
    bg: BG.sky,
    body: `
      <rect x="14" y="22" width="92" height="76" rx="2" fill="${C.paper}" ${S}/>
      ${leaf(40, 46, -30, C.deepGreen, 1.3)}
      ${leaf(78, 44, 20, C.orange, 1.3)}
      ${leaf(48, 78, 70, C.plum, 1.2)}
      ${leaf(86, 80, -10, C.mustard, 1.2)}
      ${leaf(98, 12, 35, C.green, 1.1)}
      <path d="M92 20l6-6" stroke="${INK}" stroke-width="1.5" stroke-dasharray="2 3" stroke-linecap="round"/>
      <path d="M22 30c4-4 10-6 16-6" ${SHINE}/>`,
  },
  {
    id: 'pinch-pot-clay-bowl',
    name: 'Pinch pot',
    category: 'home',
    bg: BG.sage,
    ground: 100,
    body: `
      <rect x="12" y="96" width="96" height="8" rx="4" fill="${C.paper}" ${S}/>
      <path d="M28 56h64c-2 26-14 40-32 40S30 82 28 56z" fill="${C.tan}" ${S}/>
      <path d="M76 58h16c-2 26-14 40-30 40 10-8 14-22 14-40z" ${SHADE}/>
      <ellipse cx="60" cy="56" rx="32" ry="6" fill="${C.brown}" ${S}/>
      <ellipse cx="60" cy="57" rx="26" ry="3.5" fill="${INK}" fill-opacity=".35"/>
      <ellipse cx="42" cy="72" rx="7" ry="4" transform="rotate(-20 42 72)" fill="${INK}" fill-opacity=".14"/>
      <ellipse cx="64" cy="78" rx="7" ry="4" transform="rotate(10 64 78)" fill="${INK}" fill-opacity=".14"/>
      <path d="M40 86q20 6 40 0" fill="none" stroke="${INK}" stroke-opacity=".3" stroke-width="1.5"/>
      <circle cx="100" cy="88" r="8" fill="${C.tan}" ${S}/>
      <path d="M36 66c0-4 2-8 4-10" ${SHINE}/>`,
  },
  {
    id: 'table-sketch-pencil',
    name: 'Pencil sketch of a mug',
    category: 'home',
    bg: BG.sky,
    body: `
      <rect x="20" y="16" width="68" height="84" rx="2" fill="${C.paper}" ${S}/>
      <path d="M36 44h32v36c0 4-3 6-6 6H42c-3 0-6-2-6-6z" fill="none" stroke="${INK}" stroke-width="2"/>
      <ellipse cx="52" cy="44" rx="16" ry="3.5" fill="none" stroke="${INK}" stroke-width="2"/>
      <path d="M68 52c8 0 10 4 10 9s-2 9-10 9" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
      <path d="M42 56l4 22M47 56l4 22M52 56l4 22" stroke="${INK}" stroke-opacity=".4" stroke-width="1.2"/>
      <path d="M26 92h52" stroke="${INK}" stroke-opacity=".5" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M82 100l20-52" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
      <path d="M82 100l20-52" stroke="${C.mustard}" stroke-width="5"/>
      <path d="M79 103l3-8 5 3z" fill="${INK}"/>
      <path d="M30 30c4-4 10-6 16-6" ${SHINE}/>`,
  },
  {
    id: 'buttons-in-muffin-tin',
    name: 'Buttons sorted in a muffin tin',
    category: 'home',
    bg: BG.blush,
    ground: 102,
    body: `
      <rect x="12" y="40" width="96" height="54" rx="10" fill="${C.silver}" ${S}/>
      <g fill="${INK}" fill-opacity=".25">${[30, 60, 90].flatMap((x) => [58, 80].map((y) => `<circle cx="${x}" cy="${y}" r="12"/>`)).join('')}</g>
      ${[
        [30, 58, C.red], [60, 58, C.mustard], [90, 58, C.blue],
        [30, 80, C.green], [60, 80, C.plum], [90, 80, C.pink],
      ].map(([x, y, fill]) => `<g fill="${fill}" ${S} stroke-width="2"><circle cx="${x}" cy="${Number(y) - 4}" r="4.5"/><circle cx="${Number(x) - 4}" cy="${Number(y) + 3}" r="4.5"/><circle cx="${Number(x) + 4}" cy="${Number(y) + 3}" r="4.5"/></g>`).join('')}
      <g fill="${INK}" fill-opacity=".6">${[30, 60, 90].flatMap((x) => [58, 80].map((y) => `<circle cx="${x}" cy="${y - 4}" r="1"/>`)).join('')}</g>
      <circle cx="104" cy="104" r="5" fill="${C.mustard}" ${S} stroke-width="2"/>
      <path d="M32 46c4-2 8-2 12 0" ${SHINE}/>`,
  },
  {
    id: 'family-recipe-book',
    name: 'Family recipe book',
    category: 'kitchen',
    bg: BG.cream,
    ground: 102,
    body: `
      <rect x="24" y="30" width="56" height="68" rx="3" fill="${C.red}" ${S}/>
      <path d="M60 30h20v68H60z" ${SHADE}/>
      <rect x="32" y="30" width="6" height="68" fill="${C.deepRed}" ${S} stroke-width="2"/>
      <rect x="36" y="42" width="34" height="20" rx="2" fill="${C.paper}" ${S} stroke-width="2.5"/>
      <path d="M41 49h24M41 55h20M41 61h14" stroke="${INK}" stroke-opacity=".5" stroke-width="1.8"/>
      <path d="M80 32h6v64h-6z" fill="${C.paper}" ${S} stroke-width="2"/>
      <path d="M64 96v12l4-3 4 3V96z" fill="${C.blue}" ${S} stroke-width="2"/>
      <g transform="rotate(-8 84 76)"><rect x="66" y="60" width="38" height="32" rx="2" fill="${C.paper}" ${S} stroke-width="2.5"/><path d="M72 68h26M72 76h24M72 84h18" stroke="${C.brown}" stroke-width="1.8"/></g>
      <path d="M30 38v8" ${SHINE}/>`,
  },
  {
    id: 'drum-with-beat-marks',
    name: 'Table drum with sticks',
    category: 'home',
    bg: BG.sage,
    ground: 100,
    body: `
      <path d="M28 60v26c0 8 14 14 32 14s32-6 32-14V60z" fill="${C.red}" ${S}/>
      <path d="M78 66c6 6 6 26-2 38 8-4 16-8 16-14V66z" ${SHADE}/>
      <path d="M${lacing}" fill="none" stroke="${C.paper}" stroke-width="2.5" stroke-linejoin="miter"/>
      <ellipse cx="60" cy="60" rx="32" ry="8" fill="${C.paper}" ${S}/>
      <path d="M26 18l30 40M94 18L64 56" stroke="${C.brown}" stroke-width="5" stroke-linecap="round"/>
      <path d="M14 40q-6 10 0 20M106 40q6 10 0 20M6 34q-10 16 0 32M114 34q10 16 0 32" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round" stroke-opacity=".7"/>
      <path d="M36 74v12" ${SHINE}/>`,
  },
  {
    id: 'torn-paper-flower',
    name: 'Torn paper flower mosaic',
    category: 'home',
    bg: BG.sky,
    body: tornFlower(),
  },
  {
    id: 'window-with-birds',
    name: 'Window with birds',
    category: 'animals',
    bg: BG.sage,
    ground: 106,
    body: `
      <rect x="16" y="12" width="88" height="96" rx="4" fill="${C.brown}" ${S}/>
      <rect x="24" y="20" width="36" height="40" rx="1" fill="${C.sky}" ${S} stroke-width="2.5"/>
      <rect x="64" y="20" width="32" height="40" rx="1" fill="${C.sky}" ${S} stroke-width="2.5"/>
      <rect x="24" y="66" width="36" height="36" rx="1" fill="${C.sky}" ${S} stroke-width="2.5"/>
      <rect x="64" y="66" width="32" height="36" rx="1" fill="${C.sky}" ${S} stroke-width="2.5"/>
      ${flyingBird(30, 36)}
      ${flyingBird(70, 30, 1.2)}
      ${flyingBird(44, 80, 0.9)}
      <rect x="8" y="104" width="104" height="8" rx="3" fill="${C.tan}" ${S}/>
      <path d="M46 96l-8-4 2 8z" fill="${C.brown}" ${S} stroke-width="2"/>
      <ellipse cx="56" cy="98" rx="10" ry="7" fill="${C.orange}" ${S}/>
      <circle cx="66" cy="92" r="5.5" fill="${C.brown}" ${S} stroke-width="2"/>
      <circle cx="68" cy="91" r="1.3" fill="${INK}"/>
      <path d="M71 91l5 2-5 2z" fill="${C.mustard}" ${S} stroke-width="1.5"/>
      <path d="M94 16h6v88h-6z" ${SHADE}/>
      <path d="M28 26c2-2 6-4 10-4" ${SHINE}/>`,
  },
  {
    id: 'woven-paper-mat',
    name: 'Woven paper mat',
    category: 'home',
    bg: BG.blush,
    body: `
      <rect x="22" y="22" width="76" height="76" rx="2" fill="${C.paper}" ${S}/>
      ${wovenMat()}
      <rect x="88" y="10" width="10" height="34" rx="2" fill="${C.mustard}" ${S} stroke-width="2" transform="rotate(25 93 27)"/>
      <path d="M22 96h76" stroke="${INK}" stroke-opacity=".3" stroke-width="1.5"/>`,
  },
  {
    id: 'yarn-ball-with-thread',
    name: 'Ball of yarn',
    category: 'home',
    bg: BG.sage,
    ground: 88,
    body: `
      <path d="M34 84c-10 6-14 14-6 20 6 4 14 0 14-6" fill="none" stroke="${C.red}" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="56" cy="60" r="28" fill="${C.red}" ${S}/>
      <g fill="none" stroke="${C.deepRed}" stroke-width="2" stroke-opacity=".8">
        <ellipse cx="56" cy="60" rx="28" ry="10"/>
        <ellipse cx="56" cy="60" rx="28" ry="10" transform="rotate(36 56 60)"/>
        <ellipse cx="56" cy="60" rx="28" ry="10" transform="rotate(72 56 60)"/>
        <ellipse cx="56" cy="60" rx="28" ry="10" transform="rotate(108 56 60)"/>
        <ellipse cx="56" cy="60" rx="28" ry="10" transform="rotate(144 56 60)"/>
      </g>
      <path d="M80 46c8 8 8 24-2 36-6 6-14 9-20 9 14-8 22-24 22-45z" ${SHADE}/>
      <path d="M40 44c4-6 10-8 16-8" ${SHINE}/>`,
  },
  {
    id: 'letter-and-envelope',
    name: 'Letter in an envelope',
    category: 'home',
    bg: BG.cream,
    ground: 104,
    body: `
      <rect x="34" y="24" width="52" height="44" rx="2" fill="${C.paper}" ${S}/>
      <path d="M42 36h36M42 44h36M42 52h28M42 60h30" stroke="${INK}" stroke-opacity=".45" stroke-width="2"/>
      <rect x="16" y="56" width="88" height="50" rx="3" fill="${C.paper}" ${S}/>
      <path d="M82 58h18v46H82z" ${SHADE}/>
      <path d="M16 56l44 28 44-28" fill="${C.paper}" ${S}/>
      <path d="M16 106l34-24M104 106L70 82" fill="none" stroke="${INK}" stroke-opacity=".5" stroke-width="2"/>
      <rect x="84" y="64" width="16" height="18" rx="1" fill="${C.sky}" ${S} stroke-width="2"/>
      <rect x="88" y="68" width="8" height="10" fill="${C.paper}"/>
      <path d="M22 66c0-4 2-8 4-10" ${SHINE}/>`,
  },
];
