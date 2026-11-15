/**
 * Pictures of the finished result for activity cards (WEB-012), one per card,
 * drawn in the shared kit. Hands are the only body parts shown, and no face
 * appears in any picture. Each drawing needs to read at 120 px and in
 * grayscale, so the subject is large and the detail stays simple.
 */
import { BG, C, INK, S, SHADE, SHINE, type Picture } from './kit.ts';

/** A five-pointed star centred on (cx, cy). */
function star(cx: number, cy: number, outer: number, inner: number): string {
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    points.push(`${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return `M${points.join('L')}Z`;
}

/** A sewn button: a coloured disc with two holes. */
function button(cx: number, cy: number, r: number, fill: string): string {
  const hole = `fill="${INK}" fill-opacity=".7"`;
  return (
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${S} stroke-width="2"/>` +
    `<circle cx="${cx - r * 0.35}" cy="${cy}" r="${r * 0.16}" ${hole}/>` +
    `<circle cx="${cx + r * 0.35}" cy="${cy}" r="${r * 0.16}" ${hole}/>`
  );
}

/** A hand with its fingers up, drawn as strokes: an ink edge first, then the colour. */
function hand(x: number, y: number, scale: number, rotate: number, color: string): string {
  const shape = (fill: string, width: number) =>
    `<g transform="translate(${x} ${y}) rotate(${rotate}) scale(${scale})" fill="${fill}" stroke="${fill}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">` +
    `<path d="M-9 2H9V14Q9 20 3 20H-3Q-9 20 -9 14Z"/>` +
    `<path d="M-8 2V-10M-3 2V-14M2 2V-13M7 2V-8M-9 10L-17 2" fill="none"/>` +
    `</g>`;
  return shape(INK, 9) + shape(color, 5.5);
}

/** An open-ended stroke in one colour, used for patterns and wavy lines. */
function line(d: string, color: string, width = 2): string {
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/** A photo print with a white border, tilted by `rot` degrees about its centre. */
function print(
  x: number,
  y: number,
  w: number,
  h: number,
  rot: number,
  scene: (ix: number, iy: number, iw: number, ih: number) => string,
): string {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const ix = x + 4;
  const iy = y + 4;
  const iw = w - 8;
  const ih = h - 14;
  return (
    `<g transform="rotate(${rot} ${cx} ${cy})">` +
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${C.paper}" ${S} stroke-width="2"/>` +
    `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="${BG.sky}"/>` +
    scene(ix, iy, iw, ih) +
    `</g>`
  );
}

function hillsScene(ix: number, iy: number, iw: number, ih: number): string {
  return (
    `<circle cx="${ix + iw * 0.72}" cy="${iy + ih * 0.3}" r="${ih * 0.14}" fill="${C.mustard}"/>` +
    `<path d="M${ix} ${iy + ih * 0.7}Q${ix + iw * 0.3} ${iy + ih * 0.35} ${ix + iw * 0.55} ${iy + ih * 0.65}T${ix + iw} ${iy + ih * 0.6}V${iy + ih}H${ix}Z" fill="${C.green}"/>`
  );
}

function treeScene(ix: number, iy: number, iw: number, ih: number): string {
  return (
    `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="${BG.blush}"/>` +
    `<rect x="${ix + iw / 2 - 1.5}" y="${iy + ih * 0.55}" width="3" height="${ih * 0.45}" fill="${C.brown}"/>` +
    `<circle cx="${ix + iw / 2}" cy="${iy + ih * 0.42}" r="${iw * 0.3}" fill="${C.green}" ${S} stroke-width="1.5"/>` +
    `<circle cx="${ix + iw / 2 + 4}" cy="${iy + ih * 0.36}" r="2" fill="${C.red}"/>`
  );
}

function seaScene(ix: number, iy: number, iw: number, ih: number): string {
  return (
    `<rect x="${ix}" y="${iy + ih * 0.6}" width="${iw}" height="${ih * 0.4}" fill="${C.blue}"/>` +
    `<path d="M${ix + iw * 0.4} ${iy + ih * 0.58}L${ix + iw * 0.4} ${iy + ih * 0.12}L${ix + iw * 0.8} ${iy + ih * 0.56}Z" fill="${C.red}" ${S} stroke-width="1.5"/>` +
    `<path d="M${ix + iw * 0.36} ${iy + ih * 0.6}H${ix + iw * 0.84}L${ix + iw * 0.76} ${iy + ih * 0.72}H${ix + iw * 0.44}Z" fill="${C.paper}" ${S} stroke-width="1.5"/>`
  );
}

/** Three drawn lines and a dot each, arranged like a repeat on a grid cell. */
const PATTERNS: readonly ((x: number, y: number) => string)[] = [
  (x, y) =>
    line(
      [4, 8, 12, 16, 20].map((k) => `M${x + k} ${y + 3}V${y + 20}`).join(''),
      C.blue,
      2,
    ),
  (x, y) =>
    line(`M${x + 2} ${y + 8}q2.5 -4 5 0t5 0t5 0t5 0`, C.red, 2.2) +
    line(`M${x + 2} ${y + 16}q2.5 -4 5 0t5 0t5 0t5 0`, C.red, 2.2),
  (x, y) =>
    [5, 11, 17]
      .flatMap((dy) => [5, 11, 17].map((dx) => `<circle cx="${x + dx}" cy="${y + dy}" r="2" fill="${C.mustard}"/>`))
      .join(''),
  (x, y) =>
    [2, 9, 16].map((a) => line(`M${x + a} ${y + 20}l6 -6M${x + a} ${y + 12}l6 -6`, C.green, 2)).join(''),
  (x, y) => line(`M${x + 2} ${y + 8}l4 8l4 -8l4 8l4 -8l4 8`, C.orange, 2.2),
  (x, y) =>
    [2, 9, 16]
      .map((a) => `<path d="M${x + a} ${y + 20}l3 -8l3 8z" fill="${C.pink}" ${S} stroke-width="1.4"/>`)
      .join(''),
  (x, y) =>
    line(`M${x + 2} ${y + 8}q2.5 -4 5 0t5 0t5 0t5 0`, C.deepGreen, 2) +
    line(`M${x + 2} ${y + 16}q2.5 -4 5 0t5 0t5 0t5 0`, C.deepGreen, 2),
  (x, y) =>
    line(`M${x + 3} ${y + 20}a8 8 0 0 1 16 0M${x + 7} ${y + 20}a4 4 0 0 1 8 0`, C.plum, 2),
  (x, y) =>
    [
      [3, 3],
      [13, 3],
      [8, 10],
      [3, 17],
      [13, 17],
    ]
      .map(([dx, dy]) => `<rect x="${x + dx}" y="${y + dy}" width="5" height="5" fill="${C.red}"/>`)
      .join(''),
];

function repeatingPatternSheet(): string {
  const cols = [17, 44, 71];
  const rows = [15, 42, 69];
  let cells = '';
  let index = 0;
  for (const y of rows) {
    for (const x of cols) {
      cells += `<rect x="${x}" y="${y}" width="23" height="23" fill="none" stroke="${C.grey}" stroke-width="1.2"/>`;
      cells += PATTERNS[index](x, y);
      index += 1;
    }
  }
  return (
    `<rect x="12" y="10" width="86" height="86" rx="3" fill="${C.paper}" ${S}/>` +
    cells +
    `<g transform="rotate(-30 96 104)">` +
    `<rect x="66" y="99" width="6" height="8" fill="${C.pink}" ${S} stroke-width="2"/>` +
    `<rect x="72" y="99" width="32" height="8" fill="${C.mustard}" ${S} stroke-width="2"/>` +
    `<path d="M104 99L114 103L104 107Z" fill="${C.tan}" ${S} stroke-width="2"/>` +
    `</g>`
  );
}

/** A paper chain: links alternate between lying flat and standing on edge along a swag. */
function paperChain(): string {
  const p0 = [8, 30];
  const ctl = [60, 96];
  const p2 = [112, 30];
  const at = (t: number) => [0, 1].map((i) => (1 - t) * (1 - t) * p0[i] + 2 * (1 - t) * t * ctl[i] + t * t * p2[i]);
  const dir = (t: number) => [0, 1].map((i) => 2 * (1 - t) * (ctl[i] - p0[i]) + 2 * t * (p2[i] - ctl[i]));
  const colors = [C.red, C.mustard, C.green, C.pink, C.blue, C.orange];
  const count = 11;
  let out = `<path d="M8 30Q60 96 112 30" fill="none" stroke="${INK}" stroke-width="1.2" stroke-opacity=".5"/>`;
  for (let i = 0; i < count; i++) {
    const t = 0.06 + (0.88 * i) / (count - 1);
    const [x, y] = at(t);
    const [dx, dy] = dir(t);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    const link =
      i % 2 === 0
        ? '<rect x="-10" y="-4.5" width="20" height="9" rx="4.5"'
        : '<rect x="-4.5" y="-10" width="9" height="20" rx="4.5"';
    out += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(1)})">${link} fill="${colors[i % colors.length]}" ${S} stroke-width="1.5"/></g>`;
  }
  out += `<circle cx="8" cy="30" r="3" fill="${INK}"/><circle cx="112" cy="30" r="3" fill="${INK}"/>`;
  return out;
}

export const ACTIVITY_RESULTS_A: readonly Picture[] = [
  {
    id: 'decorated-keepsake-box',
    name: 'Decorated keepsake box',
    category: 'home',
    bg: BG.cream,
    ground: 104,
    body: `
      <rect x="22" y="66" width="58" height="36" rx="2" fill="${C.leaf}" ${S}/>
      <rect x="16" y="54" width="70" height="14" rx="3" fill="${C.pink}" ${S}/>
      <g fill="${C.red}"><circle cx="30" cy="76" r="2.4"/><circle cx="44" cy="76" r="2.4"/><circle cx="58" cy="76" r="2.4"/><circle cx="72" cy="76" r="2.4"/><circle cx="37" cy="88" r="2.4"/><circle cx="51" cy="88" r="2.4"/><circle cx="65" cy="88" r="2.4"/></g>
      <g fill="${C.paper}"><circle cx="24" cy="61" r="2.2"/><circle cx="34" cy="61" r="2.2"/><circle cx="64" cy="61" r="2.2"/><circle cx="74" cy="61" r="2.2"/></g>
      <rect x="48" y="54" width="8" height="48" fill="${C.mustard}"/>
      <ellipse cx="41" cy="44" rx="8" ry="5" transform="rotate(-30 41 44)" fill="${C.mustard}" ${S} stroke-width="2.5"/>
      <ellipse cx="63" cy="44" rx="8" ry="5" transform="rotate(30 63 44)" fill="${C.mustard}" ${S} stroke-width="2.5"/>
      <circle cx="52" cy="50" r="3.5" fill="${C.mustard}" ${S} stroke-width="2.5"/>
      <path d="M74 54h12v14H74z" ${SHADE}/>
      <path d="M70 66h10v36H70z" ${SHADE}/>
      <path d="${star(100, 84, 10, 4.5)}" fill="${C.orange}" ${S} stroke-width="2.2"/>
      <circle cx="100" cy="106" r="6" fill="${C.blue}" ${S} stroke-width="2"/>
      <path d="M26 74v14" ${SHINE}/>`,
  },
  {
    id: 'painted-plant-pot',
    name: 'Painted plant pot with herbs',
    category: 'garden',
    bg: BG.sage,
    ground: 108,
    body: `
      <path d="M60 60C48 54 36 44 36 30C48 34 58 46 60 60Z" fill="${C.green}" ${S}/>
      <path d="M60 60C66 50 76 40 88 36C86 48 76 58 60 60Z" fill="${C.leaf}" ${S}/>
      <path d="M60 60C56 46 58 32 64 22C68 36 66 48 60 60Z" fill="${C.green}" ${S}/>
      <path d="M34 68H86L80 104H40Z" fill="${C.blue}" ${S}/>
      <path d="M36 72L42 77L48 72L54 77L60 72L66 77L72 72L78 77L84 72" fill="none" stroke="${C.mustard}" stroke-width="3" stroke-linejoin="round"/>
      <g fill="${C.paper}"><circle cx="44" cy="86" r="2.6"/><circle cx="60" cy="86" r="2.6"/><circle cx="76" cy="86" r="2.6"/><circle cx="52" cy="97" r="2.6"/><circle cx="68" cy="97" r="2.6"/></g>
      <rect x="30" y="58" width="60" height="10" rx="3" fill="${C.wood}" ${S}/>
      <path d="M76 68H86L80 104H72Z" ${SHADE}/>
      <path d="M40 76l-2 14" ${SHINE}/>`,
  },
  {
    id: 'repeating-pattern-sheet',
    name: 'Sheet of repeating patterns',
    category: 'home',
    bg: BG.cream,
    body: repeatingPatternSheet(),
  },
  {
    id: 'music-drawn-lines',
    name: 'Lines drawn to music',
    category: 'home',
    bg: BG.blush,
    body: `
      <rect x="12" y="46" width="96" height="56" rx="4" fill="${C.paper}" ${S}/>
      ${line('M20 78C30 62 38 92 50 78S70 62 80 78S96 92 104 76', C.blue, 3.5)}
      ${line('M20 92C28 86 34 100 44 94S62 86 70 94S92 102 104 92', C.red, 3)}
      <circle cx="60" cy="62" r="5" fill="none" stroke="${C.mustard}" stroke-width="3"/>
      <circle cx="90" cy="66" r="3" fill="${C.green}"/>
      <path d="M39 40V14M83 32V6" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M39 14L83 6" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="34" cy="40" rx="6" ry="4.5" transform="rotate(-20 34 40)" fill="${INK}"/>
      <ellipse cx="78" cy="32" rx="6" ry="4.5" transform="rotate(-20 78 32)" fill="${INK}"/>
      <path d="M26 58q4-4 8 0" ${SHINE} stroke-width="2"/>`,
  },
  {
    id: 'paper-boat-afloat',
    name: 'Paper boat afloat on water',
    category: 'travel',
    bg: BG.cream,
    body: `
      <path d="M0 92H120V120H0Z" fill="${C.blue}"/>
      ${line('M10 102q7-5 14 0t14 0M66 110q7-5 14 0t14 0M32 114q7-5 14 0', C.paper, 2.5)}
      <path d="M32 74L42 56H78L88 74Z" fill="${C.red}" ${S}/>
      <path d="M22 74H98L86 92H34Z" fill="${C.paper}" ${S}/>
      <path d="M78 74H98L86 92H72Z" ${SHADE}/>
      <path d="M40 66l6-2" ${SHINE}/>`,
  },
  {
    id: 'folded-towel-stack',
    name: 'Stack of folded towels',
    category: 'home',
    bg: BG.sage,
    ground: 104,
    body: `
      <rect x="18" y="84" width="84" height="18" rx="4" fill="${C.blue}" ${S}/>
      <rect x="24" y="66" width="72" height="18" rx="4" fill="${C.mustard}" ${S}/>
      <rect x="30" y="48" width="60" height="18" rx="4" fill="${C.red}" ${S}/>
      ${line('M26 90H96', C.paper, 3)}
      ${line('M30 72H92', C.paper, 3)}
      ${line('M36 54H84', C.paper, 3)}
      <path d="M90 84h12v18H90z" ${SHADE}/>
      <path d="M82 66h12v18H82z" ${SHADE}/>
      <path d="M74 48h12v18H74z" ${SHADE}/>
      <path d="M26 88v8" ${SHINE}/>`,
  },
  {
    id: 'hand-massage-with-lotion',
    name: 'Hand resting on a towel, with lotion',
    category: 'home',
    bg: BG.blush,
    ground: 108,
    body: `
      <path d="M8 86Q60 78 112 88V106Q60 98 8 106Z" fill="${C.sky}" ${S}/>
      ${line('M14 98Q60 92 106 99', C.paper, 2.5)}
      <path d="M96 74H120V92H96Z" fill="${C.sand}" ${S}/>
      ${[
        'M78 68H34',
        'M80 75H28',
        'M80 82H30',
        'M80 89H38',
        'M92 80Q84 60 66 62',
      ]
        .map(
          (d) =>
            `<path d="${d}" fill="none" stroke="${INK}" stroke-width="10.5" stroke-linecap="round"/>` +
            `<path d="${d}" fill="none" stroke="${C.sand}" stroke-width="7" stroke-linecap="round"/>`,
        )
        .join('')}
      <ellipse cx="86" cy="80" rx="16" ry="12" fill="${C.sand}" ${S}/>
      <path d="M76 88Q86 92 96 86" fill="none" stroke="${INK}" stroke-width="1.8" stroke-opacity=".5" stroke-linecap="round"/>
      <rect x="4" y="38" width="20" height="40" rx="6" fill="${C.paper}" ${S}/>
      <rect x="4" y="56" width="20" height="12" fill="${C.green}" ${S}/>
      <rect x="10" y="30" width="8" height="8" fill="${INK}"/>
      <rect x="6" y="26" width="16" height="5" rx="2" fill="${INK}"/>
      <path d="M16 44h4v28h-4z" ${SHADE}/>
      <path d="M58 56c3 4 5 7 5 10a5 5 0 0 1-10 0c0-3 2-6 5-10z" fill="${C.paper}" ${S} stroke-width="2"/>`,
  },
  {
    id: 'open-photo-album',
    name: 'Open photo album',
    category: 'home',
    bg: BG.cream,
    ground: 106,
    body: `
      <rect x="8" y="22" width="104" height="80" rx="5" fill="${C.brown}" ${S}/>
      <rect x="14" y="28" width="46" height="68" rx="2" fill="${C.paper}" ${S} stroke-width="2.5"/>
      <rect x="60" y="28" width="46" height="68" rx="2" fill="${C.paper}" ${S} stroke-width="2.5"/>
      <rect x="20" y="34" width="34" height="26" fill="${BG.sky}" ${S} stroke-width="2"/>
      <circle cx="40" cy="43" r="5" fill="${C.mustard}"/>
      <path d="M20 60V53Q30 45 40 51T54 52V60Z" fill="${C.green}"/>
      <rect x="20" y="66" width="34" height="22" fill="${BG.blush}" ${S} stroke-width="2"/>
      <circle cx="37" cy="75" r="7" fill="${C.green}" ${S} stroke-width="2"/>
      <rect x="35" y="82" width="4" height="6" fill="${C.brown}"/>
      <rect x="66" y="34" width="34" height="22" fill="${BG.sage}" ${S} stroke-width="2"/>
      <path d="M66 56L76 42L84 50L90 44L100 56Z" fill="${C.blue}" ${S} stroke-width="2"/>
      <rect x="66" y="62" width="34" height="26" fill="${BG.cream}" ${S} stroke-width="2"/>
      <path d="M76 76v12M88 74v14" stroke="${C.green}" stroke-width="2"/>
      <g fill="${C.pink}" ${S} stroke-width="1.8"><circle cx="76" cy="72" r="4"/><circle cx="88" cy="70" r="4"/><circle cx="92" cy="80" r="4"/></g>
      ${line('M20 93H52', C.grey, 2)}
      ${line('M66 93H94', C.grey, 2)}
      <path d="M60 28V96" stroke="${INK}" stroke-width="2.5"/>
      <path d="M22 36v8" ${SHINE} stroke-width="2"/>`,
  },
  {
    id: 'button-flower-card',
    name: 'Button flower on a card',
    category: 'home',
    bg: BG.blush,
    body: `
      <rect x="18" y="16" width="84" height="90" rx="4" fill="${C.paper}" ${S}/>
      <path d="M58 70V100" stroke="${C.deepGreen}" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="46" cy="88" rx="9" ry="4" transform="rotate(-30 46 88)" fill="${C.green}" ${S} stroke-width="2"/>
      <ellipse cx="70" cy="84" rx="9" ry="4" transform="rotate(30 70 84)" fill="${C.leaf}" ${S} stroke-width="2"/>
      ${button(75, 46, 8.5, C.red)}
      ${button(66.5, 60.7, 8.5, C.blue)}
      ${button(49.5, 60.7, 8.5, C.mustard)}
      ${button(41, 46, 8.5, C.red)}
      ${button(49.5, 31.3, 8.5, C.blue)}
      ${button(66.5, 31.3, 8.5, C.mustard)}
      ${button(58, 46, 7, C.orange)}
      <path d="M30 26q4-4 8-4" ${SHINE} stroke-width="2"/>`,
  },
  {
    id: 'blue-torn-paper-collage',
    name: 'Blue torn-paper collage',
    category: 'home',
    bg: BG.cream,
    body: `
      <rect x="14" y="14" width="92" height="92" rx="2" fill="${C.paper}" ${S}/>
      <path d="M22 26L36 21L50 27L64 22L68 38L60 46L66 56L48 52L34 58L24 50Z" fill="${C.blue}"/>
      <path d="M56 36L76 30L96 34L98 52L88 62L92 74L76 68L62 72L60 56Z" fill="${C.sky}"/>
      <path d="M26 66L40 62L52 70L50 84L58 96L40 100L30 90L24 78Z" fill="#24527A"/>
      <path d="M66 80L80 74L92 82L96 96L84 102L70 98L62 90Z" fill="#B9D7EA"/>
      <path d="M30 40L36 38L34 46Z" fill="${C.sky}"/>
      <path d="M76 46L82 44L80 52Z" fill="${C.blue}"/>
      <path d="M100 66L104 64L103 74Z" fill="#24527A"/>
      <path d="M46 40L52 38L50 44Z" fill="#24527A"/>`,
  },
  {
    id: 'family-tree-of-hands',
    name: 'Family tree drawn with hands',
    category: 'garden',
    bg: BG.sage,
    body: `
      <path d="M50 106L54 66Q60 60 66 66L70 106Z" fill="${C.brown}" ${S}/>
      ${line('M56 64Q44 56 34 48M62 62Q74 54 84 46M60 60V44', C.brown, 4)}
      ${hand(60, 20, 1, 0, C.blue)}
      ${hand(32, 40, 0.85, -22, C.mustard)}
      ${hand(88, 38, 0.85, 22, C.pink)}
      ${hand(46, 60, 0.65, -10, C.orange)}
      ${hand(76, 62, 0.65, 12, C.plum)}`,
  },
  {
    id: 'open-greeting-card',
    name: 'Open greeting card with a heart',
    category: 'home',
    bg: BG.sky,
    body: `
      <rect x="62" y="18" width="46" height="84" rx="3" fill="${C.paper}" ${S}/>
      <rect x="16" y="18" width="46" height="84" rx="3" fill="${C.red}" ${S}/>
      <path d="M52 22h8v76h-8z" ${SHADE}/>
      <path d="M62 18V102" stroke="${INK}" stroke-width="2" stroke-dasharray="4 4"/>
      <path d="M39 74C26 65 22 56 27 48C31 42 37 44 39 50C41 44 47 42 51 48C56 56 52 65 39 74Z" fill="${C.paper}" ${S} stroke-width="2.5"/>
      <path d="M31 52q1-4 4-5" ${SHINE} stroke-width="2"/>
      ${line('M70 34q4-4 8 0t8 0t8 0t4 0', C.blue, 2.2)}
      ${line('M70 46q4-4 8 0t8 0t8 0t4 0', C.blue, 2.2)}
      ${line('M70 58q4-4 8 0t8 0t8 0', C.blue, 2.2)}
      ${line('M70 70q4-4 8 0t8 0', C.blue, 2.2)}`,
  },
  {
    id: 'lavender-sachet',
    name: 'Lavender sachet tied with ribbon',
    category: 'garden',
    bg: BG.sage,
    ground: 106,
    body: `
      ${line('M12 106Q10 70 16 40M20 106Q20 70 22 34M28 106Q30 74 26 46', C.deepGreen, 2.5)}
      <g fill="${C.plum}" stroke="${INK}" stroke-width="1.2">
        <ellipse cx="14" cy="48" rx="3" ry="4.5"/><ellipse cx="15" cy="53" rx="3" ry="4.5"/><ellipse cx="16" cy="58" rx="3" ry="4.5"/><ellipse cx="16" cy="63" rx="3" ry="4.5"/>
        <ellipse cx="20" cy="44" rx="3" ry="4.5"/><ellipse cx="21" cy="49" rx="3" ry="4.5"/><ellipse cx="21" cy="54" rx="3" ry="4.5"/><ellipse cx="22" cy="59" rx="3" ry="4.5"/>
        <ellipse cx="27" cy="52" rx="3" ry="4.5"/><ellipse cx="27" cy="57" rx="3" ry="4.5"/><ellipse cx="28" cy="62" rx="3" ry="4.5"/>
      </g>
      <path d="M34 56Q62 48 90 56Q96 84 86 100Q62 110 38 100Q28 84 34 56Z" fill="${C.sky}" ${S}/>
      <g fill="${C.paper}"><circle cx="44" cy="72" r="2.5"/><circle cx="60" cy="70" r="2.5"/><circle cx="76" cy="72" r="2.5"/><circle cx="52" cy="86" r="2.5"/><circle cx="68" cy="86" r="2.5"/></g>
      <path d="M76 60Q90 70 86 100Q82 104 74 104Q82 84 76 60Z" ${SHADE}/>
      <rect x="34" y="54" width="56" height="9" rx="4" fill="${C.red}" ${S}/>
      <ellipse cx="54" cy="46" rx="9" ry="5" transform="rotate(-25 54 46)" fill="${C.red}" ${S} stroke-width="2.5"/>
      <ellipse cx="72" cy="46" rx="9" ry="5" transform="rotate(25 72 46)" fill="${C.red}" ${S} stroke-width="2.5"/>
      <circle cx="63" cy="50" r="3.5" fill="${C.red}" ${S} stroke-width="2.5"/>
      <path d="M60 54L56 68M66 54L70 68" stroke="${C.red}" stroke-width="3" stroke-linecap="round"/>`,
  },
  {
    id: 'memory-collage-of-photos',
    name: 'Memory collage of photos',
    category: 'home',
    bg: BG.cream,
    body: `
      <rect x="6" y="6" width="108" height="108" rx="4" fill="${C.sand}" ${S}/>
      ${print(36, 24, 46, 56, -5, hillsScene)}
      ${print(10, 14, 34, 42, 7, treeScene)}
      ${print(76, 60, 34, 42, -8, seaScene)}
      <g transform="rotate(12 25 80)">
        <rect x="14" y="70" width="24" height="22" fill="${C.mustard}" ${S} stroke-width="2"/>
        <path d="M14 78H38M14 86H38" stroke="${C.paper}" stroke-width="2.5"/>
      </g>
      <path d="M46 92l8-3 4 6-9 4-5-3z" fill="${C.red}" ${S} stroke-width="2"/>
      <rect x="44" y="20" width="14" height="6" fill="${C.paper}" fill-opacity=".75" transform="rotate(-12 51 23)"/>
      <rect x="70" y="56" width="12" height="6" fill="${C.paper}" fill-opacity=".75" transform="rotate(20 76 59)"/>`,
  },
  {
    id: 'paper-chain-garland',
    name: 'Paper chain garland',
    category: 'home',
    bg: BG.sky,
    body: paperChain(),
  },
  {
    id: 'open-songbook-with-notes',
    name: 'Open songbook with music notes',
    category: 'home',
    bg: BG.cream,
    body: `
      <path d="M12 34Q34 26 58 36V100Q34 90 12 98Z" fill="${C.paper}" ${S}/>
      <path d="M62 36Q86 26 108 34V98Q86 90 62 100Z" fill="${C.paper}" ${S}/>
      ${[48, 54, 60, 66, 72].map((y) => `<path d="M20 ${y}H50" stroke="${C.grey}" stroke-width="1.4"/>`).join('')}
      ${[48, 54, 60, 66, 72].map((y) => `<path d="M70 ${y}H100" stroke="${C.grey}" stroke-width="1.4"/>`).join('')}
      <ellipse cx="30" cy="66" rx="3.6" ry="2.8" transform="rotate(-20 30 66)" fill="${INK}"/>
      <path d="M33 66V40" stroke="${INK}" stroke-width="2"/>
      <ellipse cx="44" cy="54" rx="3.6" ry="2.8" transform="rotate(-20 44 54)" fill="${INK}"/>
      <path d="M47 54V28" stroke="${INK}" stroke-width="2"/>
      <path d="M33 40L47 28" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
      <ellipse cx="78" cy="66" rx="3.6" ry="2.8" transform="rotate(-20 78 66)" fill="${INK}"/>
      <path d="M81 66V40" stroke="${INK}" stroke-width="2"/>
      <ellipse cx="94" cy="60" rx="3.6" ry="2.8" transform="rotate(-20 94 60)" fill="${INK}"/>
      <path d="M97 60V34" stroke="${INK}" stroke-width="2"/>
      <path d="M81 40L97 34" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
      ${line('M20 86q4-3 8 0t8 0t8 0t8 0', C.grey, 2)}
      ${line('M70 88q4-3 8 0t8 0t8 0', C.grey, 2)}
      <path d="M56 96V112L59 108L62 112V96Z" fill="${C.red}" ${S} stroke-width="2"/>`,
  },
  {
    id: 'photo-postcard-with-stamp',
    name: 'Photo postcard with a stamp',
    category: 'travel',
    bg: BG.sky,
    body: `
      <rect x="10" y="24" width="100" height="72" rx="3" fill="${C.paper}" ${S}/>
      <g transform="rotate(-4 44 58)">
        <rect x="18" y="34" width="52" height="46" rx="2" fill="${C.paper}" ${S} stroke-width="2"/>
        <rect x="22" y="38" width="44" height="36" fill="${BG.sky}"/>
        <circle cx="54" cy="46" r="5" fill="${C.mustard}"/>
        <path d="M22 66Q36 50 46 60T66 58V74H22Z" fill="${C.green}"/>
        <path d="M22 74V70Q34 62 44 70T66 70V74Z" fill="${C.deepGreen}"/>
      </g>
      <rect x="86" y="30" width="18" height="20" fill="${C.mustard}" ${S} stroke-width="2"/>
      <circle cx="95" cy="40" r="4.5" fill="${C.paper}"/>
      ${line('M78 68H102M78 76H102M78 84H96', C.grey, 2.2)}
      <path d="M74 30V92" stroke="${C.grey}" stroke-width="1.4" stroke-dasharray="3 3"/>`,
  },
  {
    id: 'pine-cone-bird-feeder',
    name: 'Pine cone bird feeder hanging from a branch',
    category: 'garden',
    bg: BG.sage,
    body: `
      <path d="M4 16Q60 8 116 18" fill="none" stroke="${C.brown}" stroke-width="6" stroke-linecap="round"/>
      <path d="M52 20L56 42M70 19L62 42" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M60 40C74 48 80 70 70 88C66 96 54 96 50 88C40 70 46 48 60 40Z" fill="${C.brown}" ${S}/>
      <path d="M52 52q4 3 8 0M64 52q4 3 8 0M48 62q4 3 8 0M60 62q4 3 8 0M70 62q2 2 4 0M56 72q4 3 8 0" fill="none" stroke="${INK}" stroke-width="1.6" stroke-opacity=".6" stroke-linecap="round"/>
      <path d="M50 70C56 74 64 74 70 70C68 80 66 90 60 92C54 90 52 80 50 70Z" fill="${C.paper}" fill-opacity=".9" ${S} stroke-width="1.5"/>
      <g fill="${C.mustard}"><ellipse cx="56" cy="78" rx="2" ry="1.5"/><ellipse cx="64" cy="80" rx="2" ry="1.5"/><ellipse cx="60" cy="86" rx="2" ry="1.5"/></g>
      <g fill="${C.green}"><ellipse cx="54" cy="84" rx="2" ry="1.5"/><ellipse cx="66" cy="86" rx="2" ry="1.5"/></g>
      <path d="M70 58C78 66 76 80 66 90C72 80 74 68 70 58Z" ${SHADE}/>
      <path d="M88 10L80 14L88 13Z" fill="${C.blue}" ${S} stroke-width="1.5"/>
      <ellipse cx="96" cy="8" rx="9" ry="6" fill="${C.blue}" ${S} stroke-width="2"/>
      <circle cx="105" cy="4" r="5" fill="${C.blue}" ${S} stroke-width="2"/>
      <path d="M109 3L115 5L109 7Z" fill="${C.mustard}" ${S} stroke-width="1.4"/>
      <circle cx="107" cy="3" r="1.1" fill="${INK}"/>`,
  },
];
