import { BG, C, INK, S, SHADE, SHINE, type Picture } from './kit.ts';

/**
 * "What you need" pictures for activity cards (WEB-012, batch m2). Each one
 * lays out the card's most recognizable materials on a table, in the house
 * kit. One picture per card, matching the card's own materials list. No
 * people, no hands, no text inside the drawing.
 */

/** The table edge every materials picture sits on. Items rest on y = 96. */
const TABLE = `<rect x="6" y="96" width="108" height="16" rx="3" fill="${C.tan}" ${S}/><path d="M14 101h92" stroke="${C.paper}" stroke-opacity=".45" stroke-width="2" fill="none"/>`;

/** A paint brush standing on its tip at (x, y), leaning by rot degrees. */
const brush = (x: number, y: number, rot: number, handle: string) =>
  `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M-3.5 -12Q-4 -4 0 0Q4 -4 3.5 -12Z" fill="${C.paper}" ${S} stroke-width="2"/><rect x="-3.5" y="-18" width="7" height="7" fill="${C.silver}" ${S} stroke-width="2"/><rect x="-2.5" y="-42" width="5" height="25" rx="2.5" fill="${handle}" ${S} stroke-width="2"/></g>`;

/** A pencil lying flat, its wooden tip pointing right from (x, y). */
const pencilFlat = (x: number, y: number, rot: number, body: string) =>
  `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="0" y="-3.5" width="26" height="7" fill="${body}" ${S} stroke-width="2"/><path d="M26 -3.5L34 0L26 3.5Z" fill="${C.paper}" ${S} stroke-width="2"/></g>`;

/** A round paint tub with a coloured lid, its base at y. */
const paintPot = (x: number, y: number, lid: string) =>
  `<rect x="${x}" y="${y}" width="20" height="26" rx="4" fill="${C.paper}" ${S}/><rect x="${x - 1}" y="${y - 6}" width="22" height="7" rx="2" fill="${lid}" ${S} stroke-width="2.5"/>`;

/** A leaf centred on (x, y) with a pale midrib and three side veins. */
const leaf = (x: number, y: number, rot: number, fill: string, scale = 1) =>
  `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${scale})"><path d="M-14 0C-6-10 8-10 14 0C8 10-6 10-14 0Z" fill="${fill}" ${S} stroke-width="2"/><path d="M-11 0H11M-4 0l-4-5M0 0l-4 5M4 0l-2-5M4 0l2 5" stroke="${C.paper}" stroke-width="1.5" fill="none" stroke-linecap="round"/></g>`;

export const ACTIVITY_MATERIALS_B: readonly Picture[] = [
  {
    id: 'playlist-materials',
    name: 'Phone, song card and marker',
    category: 'home',
    bg: BG.blush,
    body: `${TABLE}
      <rect x="20" y="36" width="32" height="60" rx="6" fill="${C.paper}" ${S}/>
      <rect x="25" y="44" width="22" height="42" rx="2" fill="${C.sky}" ${S} stroke-width="2"/>
      <circle cx="34" cy="70" r="4" fill="${INK}"/>
      <path d="M38 70V55l6 3" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="36" cy="90" r="2.5" fill="${INK}"/>
      <g transform="rotate(-6 79 77)"><rect x="62" y="60" width="34" height="34" rx="2" fill="${C.paper}" ${S}/><path d="M68 70h22M68 78h22M68 86h14" stroke="${C.plum}" stroke-width="2.5" stroke-linecap="round"/></g>
      ${pencilFlat(64, 93, -8, C.red)}
      <path d="M26 42c2-2 5-3 8-3" ${SHINE}/>`,
  },
  {
    id: 'shaker-materials',
    name: 'Bottle, rice, funnel and tape',
    category: 'home',
    bg: BG.sage,
    body: `${TABLE}
      <rect x="44" y="18" width="16" height="10" rx="2" fill="${C.red}" ${S}/>
      <rect x="46" y="28" width="12" height="6" fill="${C.sky}" fill-opacity=".4" ${S} stroke-width="2"/>
      <path d="M38 34h28v56q0 6-6 6H44q-6 0-6-6z" fill="${C.sky}" fill-opacity=".35" ${S}/>
      <g fill="${C.tan}"><circle cx="46" cy="84" r="2.2"/><circle cx="54" cy="88" r="2.2"/><circle cx="60" cy="80" r="2.2"/><circle cx="50" cy="76" r="2.2"/><circle cx="58" cy="72" r="2.2"/></g>
      <rect x="38" y="60" width="28" height="10" fill="${C.mustard}" ${S} stroke-width="2"/>
      <path d="M74 96Q90 74 106 96Z" fill="${C.sand}" ${S}/>
      <g fill="${C.tan}"><circle cx="84" cy="90" r="1.8"/><circle cx="94" cy="88" r="1.8"/><circle cx="100" cy="92" r="1.8"/></g>
      <path d="M84 52h22l-7 14h-8z" fill="${C.silver}" ${S}/>
      <rect x="91" y="66" width="8" height="8" fill="${C.silver}" ${S}/>
      <circle cx="20" cy="84" r="11" fill="${C.mustard}" ${S}/>
      <circle cx="20" cy="84" r="4" fill="${C.paper}" ${S} stroke-width="2"/>
      <path d="M56 34h10v56q0 6-6 6h-4z" ${SHADE}/>
      <path d="M42 36c0-2 2-4 4-4" ${SHINE}/>`,
  },
  {
    id: 'texture-board-materials',
    name: 'Cardboard, fabric scraps, button and glue',
    category: 'home',
    bg: BG.cream,
    body: `${TABLE}
      <rect x="10" y="26" width="72" height="66" rx="2" fill="${C.sand}" ${S}/>
      <rect x="18" y="36" width="24" height="20" rx="2" fill="${C.blue}" ${S} stroke-width="2.5" transform="rotate(-4 30 46)"/>
      <rect x="48" y="34" width="26" height="22" rx="2" fill="${C.red}" ${S} stroke-width="2.5"/>
      <rect x="18" y="62" width="26" height="22" rx="2" fill="${C.mustard}" ${S} stroke-width="2.5"/>
      <path d="M22 66v14M27 66v14M32 66v14M37 66v14M42 66v14" stroke="${C.brown}" stroke-opacity=".5" stroke-width="1.5"/>
      <circle cx="62" cy="72" r="7" fill="${C.paper}" ${S} stroke-width="2.5"/>
      <g fill="${INK}"><circle cx="60" cy="70" r="1.2"/><circle cx="64" cy="70" r="1.2"/><circle cx="60" cy="74" r="1.2"/><circle cx="64" cy="74" r="1.2"/></g>
      <rect x="92" y="60" width="16" height="36" rx="4" fill="${C.paper}" ${S}/>
      <rect x="95" y="50" width="10" height="12" rx="2" fill="${C.blue}" ${S}/>
      <path d="M70 26h12v66H70z" ${SHADE}/>`,
  },
  {
    id: 'garden-stone-materials',
    name: 'Smooth stones, paint pot and brush',
    category: 'garden',
    bg: BG.sage,
    body: `${TABLE}
      <path d="M22 96C16 84 26 72 42 72c14 0 24 8 22 20-2 6-8 4-18 4-12 0-20 2-24 0z" fill="${C.silver}" ${S}/>
      <circle cx="36" cy="84" r="4" fill="${C.pink}" ${S} stroke-width="2"/>
      <path d="M68 96c-4-8 2-18 12-18 10 0 14 8 12 18z" fill="${C.grey}" ${S}/>
      ${paintPot(88, 70, C.blue)}
      ${brush(114, 96, -6, C.red)}
      <path d="M30 80c0-4 2-7 5-9" ${SHINE}/>`,
  },
  {
    id: 'shared-painting-materials',
    name: 'Large paper, paint tubes, sponge and brush',
    category: 'home',
    bg: BG.cream,
    body: `${TABLE}
      <rect x="10" y="22" width="70" height="60" rx="2" fill="${C.paper}" ${S}/>
      <circle cx="36" cy="44" r="7" fill="${C.yellow}"/>
      <circle cx="60" cy="62" r="6" fill="${C.green}"/>
      <path d="M22 66c8-4 16-4 24 0" fill="none" stroke="${C.blue}" stroke-width="3" stroke-linecap="round"/>
      <rect x="88" y="56" width="12" height="40" rx="3" fill="${C.blue}" ${S}/>
      <rect x="88" y="50" width="12" height="7" rx="1.5" fill="${C.paper}" ${S} stroke-width="2"/>
      <rect x="104" y="66" width="12" height="30" rx="3" fill="${C.red}" ${S}/>
      <rect x="104" y="60" width="12" height="7" rx="1.5" fill="${C.paper}" ${S} stroke-width="2"/>
      <rect x="20" y="82" width="22" height="13" rx="3" fill="${C.yellow}" ${S}/>
      <g fill="${C.mustard}"><circle cx="27" cy="88" r="1.5"/><circle cx="34" cy="90" r="1.5"/></g>
      ${brush(74, 96, -8, C.green)}
      <path d="M16 30c2-3 5-4 8-4" ${SHINE}/>`,
  },
  {
    id: 'watercolor-materials',
    name: 'Watercolor box, brushes and paper',
    category: 'home',
    bg: BG.sky,
    body: `${TABLE}
      <rect x="56" y="22" width="50" height="40" rx="2" fill="${C.paper}" ${S} transform="rotate(4 81 42)"/>
      <circle cx="76" cy="38" r="8" fill="${C.sky}" fill-opacity=".7"/>
      <circle cx="92" cy="46" r="6" fill="${C.pink}" fill-opacity=".7"/>
      <circle cx="66" cy="50" r="6" fill="${C.yellow}" fill-opacity=".7"/>
      <rect x="10" y="64" width="54" height="30" rx="4" fill="${C.silver}" ${S}/>
      <g stroke="${INK}" stroke-width="1.5">
        <circle cx="20" cy="72" r="4.5" fill="${C.red}"/><circle cx="33" cy="72" r="4.5" fill="${C.yellow}"/><circle cx="46" cy="72" r="4.5" fill="${C.blue}"/><circle cx="58" cy="72" r="4.5" fill="${C.green}"/>
        <circle cx="20" cy="86" r="4.5" fill="${C.pink}"/><circle cx="33" cy="86" r="4.5" fill="${C.plum}"/><circle cx="46" cy="86" r="4.5" fill="${C.orange}"/><circle cx="58" cy="86" r="4.5" fill="${C.sky}"/>
      </g>
      ${brush(84, 96, -6, C.red)}
      ${brush(100, 96, 8, C.mustard)}
      <path d="M14 66c0-2 1-3 3-4" ${SHINE}/>`,
  },
  {
    id: 'seed-pot-materials',
    name: 'Pot, potting mix and seeds',
    category: 'garden',
    bg: BG.sage,
    body: `${TABLE}
      <rect x="24" y="48" width="56" height="10" rx="2" fill="${C.orange}" ${S}/>
      <path d="M28 58h48l-6 36H34z" fill="${C.orange}" ${S}/>
      <path d="M62 58h14l-6 36H56z" ${SHADE}/>
      <rect x="20" y="92" width="64" height="5" rx="2" fill="${C.orange}" ${S} stroke-width="2"/>
      <path d="M84 96V50h26v46z" fill="${C.brown}" ${S}/>
      <path d="M84 50l4-6h18l4 6" fill="${C.brown}" ${S}/>
      <rect x="90" y="66" width="14" height="12" rx="1" fill="${C.paper}" ${S} stroke-width="2"/>
      <g fill="${C.tan}" ${S} stroke-width="1.5"><ellipse cx="14" cy="92" rx="4.5" ry="3"/><ellipse cx="25" cy="94" rx="4.5" ry="3"/><ellipse cx="19" cy="85" rx="4.5" ry="3"/></g>
      <path d="M36 62c2-2 4-2 6-2" ${SHINE}/>`,
  },
  {
    id: 'pressing-materials',
    name: 'Leaves, flower, book and brick',
    category: 'garden',
    bg: BG.sage,
    body: `${TABLE}
      ${leaf(20, 80, -30, C.orange, 1.4)}
      ${leaf(46, 86, 25, C.green, 1.3)}
      ${leaf(30, 58, 60, C.mustard, 1.2)}
      <g fill="${C.pink}" ${S} stroke-width="2"><circle cx="56" cy="50" r="6"/><circle cx="63" cy="56" r="6"/><circle cx="60" cy="65" r="6"/><circle cx="52" cy="65" r="6"/><circle cx="49" cy="56" r="6"/></g>
      <circle cx="56" cy="58" r="4" fill="${C.mustard}" ${S} stroke-width="2"/>
      <rect x="66" y="74" width="46" height="22" rx="2" fill="${C.blue}" ${S}/>
      <rect x="108" y="78" width="4" height="14" fill="${C.paper}" ${S} stroke-width="2"/>
      <path d="M72 74v22" stroke="${INK}" stroke-opacity=".3" stroke-width="2"/>
      <rect x="74" y="58" width="30" height="16" rx="2" fill="${C.red}" ${S}/>
      <path d="M74 66h30" stroke="${C.paper}" stroke-opacity=".6" stroke-width="1.5"/>`,
  },
  {
    id: 'leaf-print-materials',
    name: 'Leaves, paint pot and paper',
    category: 'garden',
    bg: BG.sage,
    body: `${TABLE}
      <rect x="8" y="22" width="58" height="66" rx="2" fill="${C.paper}" ${S} transform="rotate(-5 37 55)"/>
      ${leaf(62, 40, 30, C.orange, 1.5)}
      ${leaf(76, 72, -15, C.mustard, 1.4)}
      ${leaf(48, 80, 60, C.green, 1.2)}
      ${paintPot(92, 70, C.blue)}
      <path d="M16 32c2-2 4-3 7-3" ${SHINE}/>`,
  },
  {
    id: 'pinch-pot-materials',
    name: 'Clay, sponge and water bowl',
    category: 'home',
    bg: BG.cream,
    body: `${TABLE}
      <circle cx="44" cy="81" r="14" fill="${C.sand}" ${S}/>
      <path d="M52 72c6 4 8 12 4 20-2 4-6 5-9 5 5-4 7-13 5-25z" ${SHADE}/>
      <circle cx="68" cy="86" r="10" fill="${C.sand}" ${S}/>
      <path d="M82 60h36q-2 34-18 36q-16-2-18-36z" fill="${C.sky}" fill-opacity=".5" ${S}/>
      <ellipse cx="100" cy="60" rx="18" ry="4" fill="${C.sky}" ${S} stroke-width="2"/>
      <rect x="6" y="84" width="20" height="12" rx="3" fill="${C.yellow}" ${S}/>
      <g fill="${C.mustard}"><circle cx="12" cy="90" r="1.5"/><circle cx="19" cy="88" r="1.5"/></g>
      <path d="M36 74c1-3 3-5 6-6" ${SHINE}/>`,
  },
  {
    id: 'sketch-materials',
    name: 'Mug, paper and pencil',
    category: 'home',
    bg: BG.cream,
    body: `${TABLE}
      <rect x="8" y="24" width="54" height="66" rx="2" fill="${C.paper}" ${S} transform="rotate(-4 35 57)"/>
      <path d="M70 54h30v36q0 6-6 6H76q-6 0-6-6z" fill="${C.blue}" ${S}/>
      <path d="M100 62h6q8 0 8 10t-8 10h-6" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="85" cy="54" rx="15" ry="3" fill="${C.sky}" ${S} stroke-width="2"/>
      <path d="M92 58h8v34q0 4-4 4h-4z" ${SHADE}/>
      ${pencilFlat(14, 40, 25, C.yellow)}
      <path d="M76 66c-2 4-2 8 0 12" ${SHINE}/>`,
  },
  {
    id: 'sort-buttons-materials',
    name: 'Muffin tin and bowl of buttons',
    category: 'home',
    bg: BG.cream,
    body: `${TABLE}
      <rect x="8" y="58" width="64" height="38" rx="5" fill="${C.silver}" ${S}/>
      <g fill="${C.grey}" ${S} stroke-width="2"><circle cx="24" cy="72" r="6"/><circle cx="40" cy="72" r="6"/><circle cx="56" cy="72" r="6"/><circle cx="24" cy="86" r="6"/><circle cx="40" cy="86" r="6"/><circle cx="56" cy="86" r="6"/></g>
      <path d="M80 74h34q-2 22-17 22q-15 0-17-22z" fill="${C.paper}" ${S}/>
      <ellipse cx="97" cy="74" rx="17" ry="3.5" fill="${C.paper}" ${S} stroke-width="2"/>
      <g ${S} stroke-width="2"><circle cx="88" cy="68" r="5.5" fill="${C.red}"/><circle cx="98" cy="64" r="5.5" fill="${C.mustard}"/><circle cx="106" cy="69" r="5.5" fill="${C.blue}"/><circle cx="93" cy="60" r="5.5" fill="${C.green}"/></g>
      <g fill="${INK}"><circle cx="88" cy="68" r="1"/><circle cx="98" cy="64" r="1"/><circle cx="106" cy="69" r="1"/><circle cx="93" cy="60" r="1"/></g>
      <path d="M14 64c3-2 6-3 9-3" ${SHINE}/>`,
  },
  {
    id: 'recipe-book-materials',
    name: 'Notebook, recipe cards, folder and pen',
    category: 'home',
    bg: BG.cream,
    body: `${TABLE}
      <rect x="8" y="76" width="52" height="20" rx="2" fill="${C.mustard}" ${S}/>
      <rect x="22" y="22" width="44" height="56" rx="3" fill="${C.red}" ${S}/>
      <rect x="60" y="26" width="4" height="48" fill="${C.paper}" ${S} stroke-width="2"/>
      <rect x="68" y="54" width="38" height="28" rx="2" fill="${C.paper}" ${S} transform="rotate(6 87 68)"/>
      <path d="M74 62h26M74 70h26M74 78h18" stroke="${C.plum}" stroke-width="2.5" stroke-linecap="round" transform="rotate(6 87 68)"/>
      ${pencilFlat(72, 92, -10, C.blue)}
      <path d="M28 30c1-2 3-3 5-3" ${SHINE}/>`,
  },
  {
    id: 'rhythm-materials',
    name: 'Phone, hand drum, tambourine and wooden blocks',
    category: 'home',
    bg: BG.blush,
    body: `${TABLE}
      <rect x="14" y="36" width="28" height="60" rx="5" fill="${C.paper}" ${S}/>
      <rect x="19" y="44" width="18" height="42" rx="2" fill="${C.sky}" ${S} stroke-width="2"/>
      <circle cx="26" cy="72" r="3.5" fill="${INK}"/>
      <path d="M29 72V56l6 2" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
      <rect x="48" y="66" width="36" height="30" fill="${C.red}" ${S}/>
      <ellipse cx="66" cy="66" rx="18" ry="5" fill="${C.paper}" ${S}/>
      <path d="M50 76l6 8 6-8 6 8 6-8 6 8 6-8" fill="none" stroke="${C.paper}" stroke-width="2"/>
      <circle cx="100" cy="50" r="13" fill="${C.mustard}" ${S}/>
      <circle cx="100" cy="50" r="7.5" fill="${C.paper}" ${S} stroke-width="1.5"/>
      <rect x="92" y="78" width="11" height="18" rx="2" fill="${C.wood}" ${S}/>
      <rect x="106" y="80" width="11" height="16" rx="2" fill="${C.tan}" ${S}/>
      <path d="M18 42c1-2 3-3 5-3" ${SHINE}/>`,
  },
  {
    id: 'torn-paper-materials',
    name: 'Colored paper, magazine page and glue stick',
    category: 'home',
    bg: BG.blush,
    body: `${TABLE}
      <rect x="10" y="74" width="44" height="20" rx="2" fill="${C.blue}" ${S}/>
      <rect x="14" y="68" width="44" height="20" rx="2" fill="${C.mustard}" ${S}/>
      <rect x="18" y="62" width="44" height="20" rx="2" fill="${C.green}" ${S}/>
      <rect x="70" y="30" width="38" height="50" rx="2" fill="${C.paper}" ${S} transform="rotate(-6 89 55)"/>
      <rect x="75" y="36" width="28" height="18" fill="${C.sky}" transform="rotate(-6 89 55)"/>
      <path d="M75 62h26M75 68h22M75 74h26" stroke="${INK}" stroke-opacity=".35" stroke-width="2" stroke-linecap="round" transform="rotate(-6 89 55)"/>
      <rect x="66" y="84" width="26" height="10" rx="3" fill="${C.paper}" ${S} stroke-width="2"/>
      <rect x="66" y="84" width="8" height="10" rx="2" fill="${C.blue}" ${S} stroke-width="2"/>
      <path d="M22 66c2-2 4-3 6-3" ${SHINE}/>`,
  },
  {
    id: 'birds-window-materials',
    name: 'Blanket, binoculars, paper and pencils',
    category: 'animals',
    bg: BG.sage,
    body: `${TABLE}
      <rect x="8" y="72" width="54" height="24" rx="4" fill="${C.plum}" ${S}/>
      <path d="M14 80h42M14 88h42" stroke="${C.paper}" stroke-width="2.5" stroke-opacity=".7"/>
      <rect x="20" y="40" width="14" height="28" rx="4" fill="${C.brown}" ${S}/>
      <rect x="38" y="40" width="14" height="28" rx="4" fill="${C.brown}" ${S}/>
      <rect x="32" y="44" width="8" height="6" fill="${C.brown}" ${S} stroke-width="2"/>
      <circle cx="27" cy="69" r="5" fill="${C.sky}" ${S} stroke-width="2"/>
      <circle cx="45" cy="69" r="5" fill="${C.sky}" ${S} stroke-width="2"/>
      <rect x="70" y="34" width="40" height="52" rx="2" fill="${C.paper}" ${S} transform="rotate(4 90 60)"/>
      <path d="M80 50q4-4 8 0q4-4 8 0" fill="none" stroke="${C.plum}" stroke-width="2" stroke-linecap="round"/>
      ${pencilFlat(74, 92, -18, C.red)}
      ${pencilFlat(88, 96, -28, C.blue)}
      <path d="M24 46c0-2 1-3 3-4" ${SHINE}/>`,
  },
  {
    id: 'weaving-materials',
    name: 'Slitted card, paper strips and scissors',
    category: 'home',
    bg: BG.blush,
    body: `${TABLE}
      <rect x="10" y="22" width="56" height="66" rx="2" fill="${C.paper}" ${S}/>
      <path d="M20 30v50M28 30v50M36 30v50M44 30v50M52 30v50M60 30v50" stroke="${INK}" stroke-opacity=".55" stroke-width="2"/>
      <rect x="76" y="34" width="8" height="58" rx="1" fill="${C.red}" ${S} stroke-width="2"/>
      <rect x="88" y="30" width="8" height="62" rx="1" fill="${C.mustard}" ${S} stroke-width="2"/>
      <rect x="100" y="36" width="8" height="56" rx="1" fill="${C.blue}" ${S} stroke-width="2"/>
      <path d="M30 92L60 76" stroke="${C.grey}" stroke-width="5" stroke-linecap="round"/>
      <path d="M30 80L60 92" stroke="${C.grey}" stroke-width="5" stroke-linecap="round"/>
      <circle cx="24" cy="92" r="4.5" fill="${C.red}" ${S} stroke-width="2.5"/>
      <circle cx="24" cy="80" r="4.5" fill="${C.red}" ${S} stroke-width="2.5"/>
      <path d="M16 30c2-2 4-3 7-3" ${SHINE}/>`,
  },
  {
    id: 'yarn-materials',
    name: 'Skein of yarn and basket',
    category: 'home',
    bg: BG.cream,
    body: `${TABLE}
      <ellipse cx="44" cy="72" rx="32" ry="18" fill="${C.mustard}" ${S}/>
      <ellipse cx="44" cy="72" rx="26" ry="15" fill="none" stroke="${C.brown}" stroke-opacity=".5" stroke-width="2" transform="rotate(-8 44 72)"/>
      <ellipse cx="44" cy="72" rx="14" ry="8" fill="${BG.cream}" ${S}/>
      <path d="M76 70h36l-5 26H81z" fill="${C.tan}" ${S}/>
      <rect x="72" y="66" width="44" height="6" rx="2" fill="${C.brown}" ${S}/>
      <path d="M80 76h28M79 84h30" stroke="${C.brown}" stroke-opacity=".5" stroke-width="2"/>
      <path d="M22 66c3-4 7-6 11-6" ${SHINE}/>`,
  },
  {
    id: 'letter-materials',
    name: 'Notepaper, pen, envelope and stamp',
    category: 'home',
    bg: BG.sky,
    body: `${TABLE}
      <g transform="rotate(-4 38 57)">
        <rect x="10" y="22" width="56" height="70" rx="2" fill="${C.paper}" ${S}/>
        <path d="M18 36h40M18 46h40M18 56h40M18 66h40M18 76h30" stroke="${C.plum}" stroke-opacity=".4" stroke-width="2"/>
      </g>
      <rect x="62" y="60" width="50" height="36" rx="2" fill="${C.paper}" ${S}/>
      <path d="M62 60l25 18 25-18" fill="none" ${S}/>
      <rect x="96" y="64" width="11" height="13" rx="1" fill="${C.blue}" ${S} stroke-width="2"/>
      ${pencilFlat(14, 92, -6, C.blue)}
      `,
  },
];
