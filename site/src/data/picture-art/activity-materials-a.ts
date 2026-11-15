/**
 * "What you need" pictures for activity cards (WEB-012), one per card, drawn
 * in the shared kit. Each shows the three to five main materials from the
 * card's own list, laid out on a table. No text, no people and no faces.
 * These sit beside the checklist and are hidden in print (the list covers it).
 */
import { BG, C, INK, S, SHADE, SHINE, type Picture } from './kit.ts';

const TABLE_Y = 88;
const CARDBOARD = '#D9B07A';

/** The tabletop the items rest on. */
function table(color: string = C.sand): string {
  return (
    `<rect x="0" y="${TABLE_Y}" width="120" height="${120 - TABLE_Y}" fill="${color}"/>` +
    `<path d="M0 ${TABLE_Y}H120" fill="none" stroke="${INK}" stroke-opacity=".35" stroke-width="2"/>`
  );
}

/** Wrap inner shapes in a group turned by `rot` degrees about (cx, cy). */
function turned(cx: number, cy: number, rot: number, inner: string): string {
  return `<g transform="rotate(${rot} ${cx} ${cy})">${inner}</g>`;
}

/** A rounded rectangle with the ink edge. */
function box(x: number, y: number, w: number, h: number, fill: string, rx = 2, width = 2.2): string {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${S} stroke-width="${width}"/>`;
}

/** A sheet of paper, card or fabric, turned by `rot`. `inner` uses absolute coordinates. */
function sheet(x: number, y: number, w: number, h: number, rot: number, fill: string, inner = ''): string {
  return turned(x + w / 2, y + h / 2, rot, box(x, y, w, h, fill) + inner);
}

/** A long tool lying flat (crayon, marker, pen, glue stick): body on the left, coloured cap on the right. */
function stick(cx: number, cy: number, len: number, width: number, rot: number, body: string, cap: string): string {
  const capLen = len * 0.3;
  return turned(
    cx,
    cy,
    rot,
    box(cx - len / 2, cy - width / 2, len, width, body, width / 3, 2) +
      box(cx + len / 2 - capLen, cy - width / 2, capLen, width, cap, width / 3, 2),
  );
}

/** Scissors open at a V, with two ring handles. */
function scissors(cx: number, cy: number, rot: number): string {
  const blades = `M${cx - 8} ${cy - 3}L${cx + 16} ${cy - 8}M${cx - 8} ${cy + 3}L${cx + 16} ${cy + 8}`;
  return turned(
    cx,
    cy,
    rot,
    `<circle cx="${cx - 12}" cy="${cy - 5}" r="4.5" fill="none" ${S} stroke-width="2.4"/>` +
      `<circle cx="${cx - 12}" cy="${cy + 5}" r="4.5" fill="none" ${S} stroke-width="2.4"/>` +
      `<path d="${blades}" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>` +
      `<path d="${blades}" fill="none" stroke="${C.silver}" stroke-width="1.2" stroke-linecap="round"/>`,
  );
}

/** A printed photo with a white border. The scene is a sky, a sun and a hill. */
function photo(x: number, y: number, w: number, h: number, rot: number, hill: string): string {
  const ix = x + 4;
  const iy = y + 4;
  const iw = w - 8;
  const ih = h - 14;
  return turned(
    x + w / 2,
    y + h / 2,
    rot,
    box(x, y, w, h, C.paper, 2, 2) +
      `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="${BG.sky}"/>` +
      `<circle cx="${ix + iw * 0.7}" cy="${iy + ih * 0.3}" r="${ih * 0.14}" fill="${C.mustard}"/>` +
      `<path d="M${ix} ${iy + ih}V${iy + ih * 0.7}Q${ix + iw * 0.35} ${iy + ih * 0.4} ${ix + iw * 0.7} ${iy + ih * 0.7}T${ix + iw} ${iy + ih * 0.65}V${iy + ih}Z" fill="${hill}"/>`,
  );
}

/** A magazine or catalogue cover: a sheet with a few blocks of colour. */
function magazine(x: number, y: number, w: number, h: number, rot: number, blocks: string[]): string {
  return sheet(x, y, w, h, rot, C.paper, blocks.join(''));
}

/** A line of grey ticks for a ruler, from x0 along y, each `step` apart. */
function ticks(x0: number, y: number, count: number, step: number, long: number, short: number): string {
  let d = '';
  for (let i = 0; i < count; i++) {
    const len = i % 2 === 0 ? long : short;
    d += `M${x0 + i * step} ${y}V${y + len}`;
  }
  return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="1.2"/>`;
}

/** Small dots for a patterned sheet. */
function dots(points: [number, number][], color: string, r = 2.4): string {
  return points.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`).join('');
}

/** A pair of small leaves on a stem, lying flat. */
function sprig(x: number, y: number): string {
  return (
    `<path d="M${x} ${y + 6}Q${x + 12} ${y} ${x + 26} ${y + 4}" fill="none" stroke="${C.deepGreen}" stroke-width="2.6" stroke-linecap="round"/>` +
    `<ellipse cx="${x + 8}" cy="${y + 2}" rx="5" ry="2.6" transform="rotate(-30 ${x + 8} ${y + 2})" fill="${C.green}" ${S} stroke-width="1.4"/>` +
    `<ellipse cx="${x + 19}" cy="${y + 4}" rx="5" ry="2.6" transform="rotate(20 ${x + 19} ${y + 4})" fill="${C.leaf}" ${S} stroke-width="1.4"/>`
  );
}

/** A button with two holes, as in the button card. */
function button(cx: number, cy: number, r: number, fill: string): string {
  const hole = `fill="${INK}" fill-opacity=".7"`;
  return (
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${S} stroke-width="2"/>` +
    `<circle cx="${cx - r * 0.35}" cy="${cy}" r="${r * 0.16}" ${hole}/>` +
    `<circle cx="${cx + r * 0.35}" cy="${cy}" r="${r * 0.16}" ${hole}/>`
  );
}

/** Pine cone outline, pointing up, in a 60 x 60 cell at (x, y). */
function pineCone(x: number, y: number): string {
  const d = `M${x + 12} ${y}C${x + 26} ${y + 8} ${x + 32} ${y + 30} ${x + 24} ${y + 48}C${x + 20} ${y + 58} ${x + 6} ${y + 58} ${x + 2} ${y + 48}C${x - 6} ${y + 30} ${x - 2} ${y + 8} ${x + 12} ${y}Z`;
  const scales =
    `M${x + 4} ${y + 18}q4 3 8 0M${x} ${y + 30}q5 3 10 0M${x + 6} ${y + 42}q4 3 8 0` +
    `M${x + 14} ${y + 12}q4 3 8 0M${x + 16} ${y + 26}q3 3 6 0M${x + 14} ${y + 38}q3 3 7 0`;
  return (
    `<path d="${d}" fill="${C.brown}" ${S}/>` +
    `<path d="${scales}" fill="none" stroke="${INK}" stroke-width="1.6" stroke-opacity=".6" stroke-linecap="round"/>`
  );
}

export const ACTIVITY_MATERIALS_A: readonly Picture[] = [
  {
    id: 'arrange-flowers-materials',
    name: 'Jar, flowers and scissors',
    category: 'garden',
    bg: BG.blush,
    body: `
      ${table(C.sand)}
      <rect x="26" y="50" width="34" height="6" rx="2" fill="${C.paper}" ${S} stroke-width="2"/>
      <path d="M28 56H58V84Q58 90 52 90H34Q28 90 28 84Z" fill="${BG.sky}" ${S}/>
      <path d="M30 68H56V84Q56 88 52 88H34Q30 88 30 84Z" fill="${C.sky}" fill-opacity=".7"/>
      <path d="M34 62V76" ${SHINE} stroke-width="2"/>
      <path d="M72 96L100 80M76 98L92 74M84 100L108 96" fill="none" stroke="${C.green}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="101" cy="78" r="7" fill="${C.pink}" ${S} stroke-width="2"/>
      <circle cx="92" cy="72" r="6" fill="${C.mustard}" ${S} stroke-width="2"/>
      <circle cx="109" cy="96" r="5" fill="${C.red}" ${S} stroke-width="2"/>
      ${scissors(50, 104, -12)}`,
  },
  {
    id: 'keepsake-box-materials',
    name: 'Shoebox, paper, glue and scissors',
    category: 'home',
    bg: BG.cream,
    body: `
      ${table(C.sand)}
      ${sheet(72, 54, 36, 30, 10, C.pink, dots([[78, 62], [92, 60], [98, 76], [82, 78], [92, 86]], C.paper))}
      <rect x="10" y="50" width="62" height="12" rx="2" fill="${C.tan}" ${S}/>
      <rect x="14" y="62" width="54" height="26" rx="2" fill="${CARDBOARD}" ${S}/>
      <path d="M58 62h10v26H58z" ${SHADE}/>
      ${stick(102, 102, 28, 9, -18, C.paper, C.blue)}
      ${scissors(34, 102, -6)}`,
  },
  {
    id: 'plant-pot-materials',
    name: 'Plant pot, paint and brush',
    category: 'garden',
    bg: BG.sage,
    body: `
      ${table(C.sand)}
      <rect x="6" y="66" width="22" height="22" rx="2" fill="${C.blue}" ${S}/>
      <rect x="6" y="66" width="22" height="6" fill="${C.silver}" ${S} stroke-width="2"/>
      <path d="M48 54H94L88 96H54Z" fill="${C.wood}" ${S}/>
      <rect x="44" y="46" width="54" height="10" rx="3" fill="${C.wood}" ${S}/>
      <path d="M60 60L58 88" ${SHINE}/>
      ${stick(104, 100, 34, 6, -18, C.tan, C.red)}
      ${sprig(12, 96)}`,
  },
  {
    id: 'repeating-patterns-materials',
    name: 'Paper, pencil and ruler',
    category: 'home',
    bg: BG.cream,
    body: `
      ${table(C.sand)}
      ${sheet(12, 14, 66, 62, -4, C.paper, `<path d="M34 14V76M56 14V76M12 34H78M12 56H78" fill="none" stroke="${C.grey}" stroke-width="1.2"/>${dots([[23, 25], [45, 45], [67, 67], [67, 25], [23, 66]], C.red, 2.5)}`)}
      ${stick(102, 34, 36, 7, 62, C.mustard, C.pink)}
      ${stick(98, 78, 30, 8, 16, C.blue, C.paper)}
      ${turned(60, 100, -4, box(24, 96, 72, 10, C.yellow, 1) + ticks(30, 96, 11, 6, 5, 3))}`,
  },
  {
    id: 'music-drawing-materials',
    name: 'Paper, crayons and a music player',
    category: 'home',
    bg: BG.blush,
    body: `
      ${table(C.sand)}
      ${sheet(12, 30, 60, 50, -6, C.paper, `<path d="M20 62Q32 50 44 62T64 62" fill="none" stroke="${C.blue}" stroke-width="2.5" stroke-linecap="round"/>`)}
      ${stick(74, 98, 38, 8, -14, C.red, C.paper)}
      ${stick(88, 103, 38, 8, -2, C.blue, C.paper)}
      ${stick(102, 96, 36, 8, 12, C.mustard, C.paper)}
      <rect x="78" y="14" width="30" height="54" rx="6" fill="${INK}"/>
      <rect x="82" y="20" width="22" height="42" rx="2" fill="${BG.sky}"/>
      <path d="M92 34V50" stroke="${C.paper}" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="88" cy="50" r="3.5" fill="${C.paper}"/>
      <circle cx="30" cy="100" r="9" fill="${C.yellow}" ${S} stroke-width="2"/>
      <circle cx="30" cy="100" r="3.5" fill="${C.paper}" ${S} stroke-width="1.5"/>`,
  },
  {
    id: 'paper-boat-materials',
    name: 'Paper, a basin of water and a towel',
    category: 'travel',
    bg: BG.sky,
    body: `
      ${table(C.sand)}
      ${sheet(12, 20, 56, 40, -8, C.paper, `<path d="M28 20V60" fill="none" stroke="${C.grey}" stroke-width="1.4" stroke-dasharray="3 3"/>`)}
      <rect x="6" y="82" width="108" height="26" rx="6" fill="${C.paper}" ${S}/>
      <rect x="12" y="90" width="96" height="14" rx="4" fill="${C.blue}"/>
      <path d="M18 96q6-3 12 0t12 0t12 0t12 0t12 0t12 0" fill="none" stroke="${C.paper}" stroke-width="2" stroke-opacity=".8"/>
      ${sheet(74, 40, 36, 26, 10, C.green, `<path d="M76 52H108" stroke="${C.paper}" stroke-width="2.5"/>`)}`,
  },
  {
    id: 'towels-materials',
    name: 'Basket of towels',
    category: 'home',
    bg: BG.sage,
    body: `
      ${table(C.sand)}
      <rect x="20" y="40" width="18" height="22" rx="3" fill="${C.blue}" ${S}/>
      <rect x="38" y="36" width="20" height="26" rx="3" fill="${C.mustard}" ${S}/>
      <path d="M12 62H68L63 100H17Z" fill="${C.tan}" ${S}/>
      <path d="M18 74H62M20 86H60" stroke="${C.brown}" stroke-width="2.5" stroke-opacity=".6"/>
      <rect x="8" y="56" width="64" height="10" rx="3" fill="${C.brown}" ${S}/>
      ${sheet(74, 74, 38, 22, -6, C.red, `<path d="M78 85H108" stroke="${C.paper}" stroke-width="2.5"/>`)}`,
  },
  {
    id: 'hand-massage-materials',
    name: 'Lotion, towel and pillow',
    category: 'home',
    bg: BG.blush,
    body: `
      ${table(C.sand)}
      <rect x="66" y="58" width="44" height="26" rx="12" fill="${C.paper}" ${S}/>
      <path d="M96 62Q104 62 106 72V76Q104 82 96 82Z" ${SHADE}/>
      <rect x="10" y="94" width="56" height="12" rx="4" fill="${C.sky}" ${S}/>
      <rect x="20" y="54" width="24" height="34" rx="6" fill="${C.paper}" ${S}/>
      <rect x="20" y="66" width="24" height="12" fill="${C.green}" ${S} stroke-width="2"/>
      <rect x="28" y="46" width="8" height="8" fill="${INK}"/>
      <rect x="22" y="42" width="20" height="6" rx="2" fill="${INK}"/>
      <rect x="40" y="43" width="8" height="4" fill="${INK}"/>
      <path d="M26 58V64" ${SHINE} stroke-width="2"/>`,
  },
  {
    id: 'photo-album-materials',
    name: 'Photo album, prints and a glass of water',
    category: 'home',
    bg: BG.cream,
    body: `
      ${table(C.sand)}
      <rect x="12" y="30" width="56" height="54" rx="4" fill="${C.brown}" ${S}/>
      <rect x="20" y="40" width="36" height="26" rx="2" fill="${C.paper}" ${S} stroke-width="2"/>
      <path d="M16 36V80" stroke="${INK}" stroke-opacity=".25" stroke-width="2"/>
      ${photo(66, 14, 34, 40, 8, C.green)}
      ${photo(68, 34, 34, 40, -10, C.deepGreen)}
      <path d="M84 80H102L100 104H86Z" fill="${BG.sky}" ${S}/>
      <path d="M85 92H101L100 104H86Z" fill="${C.sky}" fill-opacity=".8"/>
      <rect x="8" y="92" width="26" height="14" rx="2" fill="${C.paper}" ${S}/>
      <rect x="8" y="92" width="26" height="4" fill="${C.pink}"/>`,
  },
  {
    id: 'button-picture-materials',
    name: 'Buttons, card and glue',
    category: 'home',
    bg: BG.blush,
    body: `
      ${table(C.sand)}
      ${sheet(16, 18, 56, 62, -6, C.paper, `<circle cx="42" cy="44" r="10" fill="none" stroke="${C.grey}" stroke-width="1.4" stroke-dasharray="3 3"/>`)}
      ${button(86, 44, 9, C.mustard)}
      ${button(104, 52, 8, C.blue)}
      ${button(96, 74, 8.5, C.red)}
      <rect x="8" y="92" width="14" height="22" rx="3" fill="${C.paper}" ${S}/>
      <rect x="10" y="86" width="10" height="7" rx="2" fill="${C.orange}" ${S} stroke-width="2"/>`,
  },
  {
    id: 'color-collage-materials',
    name: 'Magazine, colored paper and glue stick',
    category: 'home',
    bg: BG.cream,
    body: `
      ${table(C.sand)}
      ${magazine(10, 50, 52, 36, -6, [`<rect x="16" y="56" width="20" height="14" fill="${C.red}"/>`, `<rect x="40" y="58" width="16" height="22" fill="${C.blue}"/>`, `<rect x="16" y="74" width="20" height="8" fill="${C.mustard}"/>`])}
      ${sheet(60, 22, 40, 40, 8, C.mustard)}
      ${sheet(70, 34, 40, 40, -4, C.green)}
      ${stick(98, 102, 28, 9, -8, C.paper, C.blue)}
      ${scissors(36, 104, 14)}`,
  },
  {
    id: 'hands-tree-materials',
    name: 'Large paper and crayons',
    category: 'home',
    bg: BG.sage,
    body: `
      ${table(C.sand)}
      ${sheet(12, 16, 66, 60, -4, C.paper, `<path d="M28 62Q40 48 56 60" fill="none" stroke="${C.grey}" stroke-width="1.4" stroke-dasharray="3 3"/>`)}
      <rect x="60" y="12" width="20" height="8" fill="${C.yellow}" fill-opacity=".85" transform="rotate(-6 70 16)"/>
      ${stick(96, 36, 36, 8, -28, C.red, C.paper)}
      ${stick(102, 58, 36, 8, -6, C.blue, C.paper)}
      ${stick(98, 82, 36, 8, 18, C.green, C.paper)}
      <circle cx="22" cy="102" r="8" fill="${C.yellow}" ${S} stroke-width="2"/>
      <circle cx="22" cy="102" r="3" fill="${C.paper}" ${S} stroke-width="1.5"/>
      ${stick(50, 104, 34, 6, -4, C.mustard, C.pink)}`,
  },
  {
    id: 'greeting-card-materials',
    name: 'Folded card, clippings and a marker',
    category: 'home',
    bg: BG.sky,
    body: `
      ${table(C.sand)}
      <rect x="16" y="22" width="54" height="64" rx="3" fill="${C.red}" ${S}/>
      <path d="M58 24h10v60H58z" ${SHADE}/>
      <circle cx="43" cy="54" r="8" fill="${C.paper}" ${S} stroke-width="2"/>
      ${sheet(80, 24, 24, 20, 8, C.paper, `<rect x="84" y="28" width="16" height="10" fill="${BG.sky}"/><circle cx="92" cy="32" r="3" fill="${C.mustard}"/>`)}
      ${sheet(82, 54, 22, 20, -8, C.pink, `<circle cx="92" cy="61" r="4" fill="${C.paper}"/><path d="M84 72L90 66L96 72Z" fill="${C.green}"/>`)}
      ${stick(70, 102, 40, 8, -4, C.blue, C.paper)}
      ${stick(30, 104, 26, 9, 0, C.paper, C.blue)}`,
  },
  {
    id: 'lavender-sachet-materials',
    name: 'Fabric, dried lavender and ribbon',
    category: 'garden',
    bg: BG.cream,
    body: `
      ${table(C.sand)}
      ${sheet(14, 22, 52, 52, -8, BG.sky, dots([[26, 36], [44, 32], [36, 50], [56, 52], [24, 62], [50, 66]], C.paper, 2))}
      <path d="M76 100Q86 92 92 100M82 100Q90 94 98 100" fill="none" stroke="${C.deepGreen}" stroke-width="2" stroke-linecap="round"/>
      <g fill="${C.plum}" stroke="${INK}" stroke-width="1.2">
        <ellipse cx="80" cy="84" rx="3.5" ry="5"/><ellipse cx="86" cy="80" rx="3.5" ry="5"/>
        <ellipse cx="92" cy="84" rx="3.5" ry="5"/><ellipse cx="84" cy="88" rx="3.5" ry="5"/>
        <ellipse cx="90" cy="90" rx="3.5" ry="5"/><ellipse cx="96" cy="88" rx="3.5" ry="5"/>
        <ellipse cx="88" cy="76" rx="3.5" ry="5"/>
      </g>
      <path d="M10 104Q40 96 66 104T112 102" fill="none" stroke="${C.red}" stroke-width="4" stroke-linecap="round"/>`,
  },
  {
    id: 'photos-paper-and-glue-materials',
    name: 'Photos, paper and glue',
    category: 'home',
    bg: BG.cream,
    body: `
      ${table(C.sand)}
      ${photo(10, 16, 36, 44, -8, C.green)}
      ${photo(46, 26, 36, 44, 6, C.deepGreen)}
      ${magazine(74, 18, 34, 46, 8, [`<rect x="78" y="24" width="26" height="14" fill="${C.pink}"/>`, `<rect x="78" y="42" width="12" height="16" fill="${C.blue}"/>`, `<rect x="92" y="42" width="12" height="16" fill="${C.mustard}"/>`])}
      ${stick(30, 104, 26, 9, -4, C.paper, C.blue)}
      ${scissors(92, 104, -10)}`,
  },
  {
    id: 'paper-chain-materials',
    name: 'Strips of paper, a ruler and scissors',
    category: 'home',
    bg: BG.blush,
    body: `
      ${table(C.sand)}
      ${sheet(10, 26, 60, 13, -10, C.red)}
      ${sheet(24, 48, 60, 13, 6, C.mustard)}
      ${sheet(38, 70, 50, 13, -4, C.green)}
      ${sheet(96, 10, 12, 60, 14, C.yellow, ticks(96, 16, 10, 5, 5, 3))}
      ${scissors(90, 90, -30)}
      ${stick(24, 100, 26, 9, 0, C.paper, C.blue)}`,
  },
  {
    id: 'songbook-materials',
    name: 'Notebook, pen and music player',
    category: 'home',
    bg: BG.cream,
    body: `
      ${table(C.sand)}
      <rect x="12" y="24" width="54" height="62" rx="3" fill="${C.blue}" ${S}/>
      <path d="M18 26H24V84H18Z" ${SHADE}/>
      <rect x="28" y="36" width="30" height="14" rx="1" fill="${C.paper}"/>
      ${sheet(46, 56, 34, 26, 8, C.paper, `<path d="M52 64H74M52 70H72M52 76H70" stroke="${C.grey}" stroke-width="1.4"/>`)}
      ${stick(96, 100, 34, 7, -10, C.red, C.paper)}
      <rect x="78" y="12" width="28" height="48" rx="6" fill="${INK}"/>
      <rect x="82" y="18" width="20" height="36" rx="2" fill="${BG.sky}"/>
      <path d="M90 30V44" stroke="${C.paper}" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="86" cy="44" r="3.5" fill="${C.paper}"/>`,
  },
  {
    id: 'photo-postcard-materials',
    name: 'Photo, blank postcard and glue stick',
    category: 'travel',
    bg: BG.sage,
    body: `
      ${table(C.sand)}
      ${photo(12, 22, 46, 52, -6, C.green)}
      ${sheet(52, 52, 58, 36, 6, C.paper, `<path d="M84 54V88" stroke="${C.grey}" stroke-width="1.4" stroke-dasharray="3 3"/>`)}
      ${stick(26, 102, 26, 9, -4, C.paper, C.blue)}
      ${stick(92, 104, 34, 7, -8, C.blue, C.paper)}`,
  },
  {
    id: 'pine-cone-feeder-materials',
    name: 'Pine cone, peanut butter and birdseed',
    category: 'garden',
    bg: BG.sky,
    body: `
      ${table(C.sand)}
      ${pineCone(18, 22)}
      <rect x="58" y="62" width="40" height="26" rx="4" fill="${C.tan}" ${S}/>
      <rect x="58" y="54" width="40" height="10" rx="2" fill="${C.mustard}" ${S}/>
      <rect x="66" y="68" width="24" height="12" rx="2" fill="${C.paper}"/>
      <ellipse cx="92" cy="102" rx="22" ry="6" fill="${C.paper}" ${S}/>
      ${dots([[80, 100], [88, 98], [96, 100], [104, 99], [86, 103], [100, 103]], C.mustard, 2)}
      <path d="M6 104C14 96 20 110 30 102S44 96 50 104" fill="none" stroke="${C.tan}" stroke-width="3" stroke-linecap="round"/>`,
  },
];
