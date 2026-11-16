import { BG, C, INK, S, SHADE, SHINE, type Picture } from './kit.ts';

/**
 * "What you need" pictures for activity cards (WEB-012, batch m3). Each one
 * lays out the card's most recognizable materials on a table, in the house
 * kit. One picture per card, matching the card's own materials list. No
 * people, no hands, no text inside the drawing.
 */

/** The table edge every materials picture sits on. Items rest on y = 96. */
const TABLE = `<rect x="6" y="96" width="108" height="16" rx="3" fill="${C.tan}" ${S}/><path d="M14 101h92" stroke="${C.paper}" stroke-opacity=".45" stroke-width="2" fill="none"/>`;

/** Wrap inner shapes in a group turned by `rot` degrees about (cx, cy). */
const turned = (cx: number, cy: number, rot: number, inner: string) =>
  `<g transform="rotate(${rot} ${cx} ${cy})">${inner}</g>`;

/** A pencil lying flat, its wooden tip pointing right from (x, y). */
const pencilFlat = (x: number, y: number, rot: number, body: string) =>
  `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="0" y="-3.5" width="26" height="7" fill="${body}" ${S} stroke-width="2"/><path d="M26 -3.5L34 0L26 3.5Z" fill="${C.paper}" ${S} stroke-width="2"/></g>`;

/** A leaf centred on (x, y) with a pale midrib and three side veins. */
const leaf = (x: number, y: number, rot: number, fill: string, scale = 1) =>
  `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${scale})"><path d="M-14 0C-6-10 8-10 14 0C8 10-6 10-14 0Z" fill="${fill}" ${S} stroke-width="2"/><path d="M-11 0H11M-4 0l-4-5M0 0l-4 5M4 0l-2-5M4 0l2 5" stroke="${C.paper}" stroke-width="1.5" fill="none" stroke-linecap="round"/></g>`;

/** Scissors open at a V, with two ring handles. */
const scissors = (cx: number, cy: number, rot: number) => {
  const blades = `M${cx - 8} ${cy - 3}L${cx + 18} ${cy - 9}M${cx - 8} ${cy + 3}L${cx + 18} ${cy + 9}`;
  return turned(
    cx,
    cy,
    rot,
    `<circle cx="${cx - 13}" cy="${cy - 5}" r="5" fill="${C.red}" ${S} stroke-width="2.5"/>` +
      `<circle cx="${cx - 13}" cy="${cy + 5}" r="5" fill="${C.red}" ${S} stroke-width="2.5"/>` +
      `<circle cx="${cx - 13}" cy="${cy - 5}" r="2" fill="${C.paper}"/><circle cx="${cx - 13}" cy="${cy + 5}" r="2" fill="${C.paper}"/>` +
      `<path d="${blades}" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>` +
      `<path d="${blades}" fill="none" stroke="${C.silver}" stroke-width="2" stroke-linecap="round"/>`,
  );
};

/** A roll of tape seen end on, centred on (cx, cy). */
const tapeRoll = (cx: number, cy: number, r: number, fill: string) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${S}/><circle cx="${cx}" cy="${cy}" r="${r * 0.5}" fill="${C.paper}" ${S} stroke-width="2"/>`;

/** A music note with its head at (x, y). */
const note = (x: number, y: number) =>
  `<circle cx="${x}" cy="${y}" r="4" fill="${INK}"/><path d="M${x + 3.5} ${y}V${y - 15}l6 3" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;

/** A phone standing on the table with a music note on its screen. Base at y = 96. */
const phone = (x: number, top: number, w = 26) => {
  const h = 96 - top;
  return (
    `<rect x="${x}" y="${top}" width="${w}" height="${h}" rx="5" fill="${C.paper}" ${S}/>` +
    `<rect x="${x + 4}" y="${top + 7}" width="${w - 8}" height="${h - 17}" rx="2" fill="${C.sky}" ${S} stroke-width="2"/>` +
    note(x + w / 2 - 2, top + h / 2 + 2) +
    `<circle cx="${x + w / 2}" cy="${top + h - 5}" r="2.2" fill="${INK}"/>`
  );
};

/** A glue stick standing up, its base at y = by. */
const glueStick = (x: number, by: number, cap: string) =>
  `<rect x="${x}" y="${by - 30}" width="13" height="30" rx="3" fill="${C.paper}" ${S}/>` +
  `<rect x="${x}" y="${by - 40}" width="13" height="11" rx="3" fill="${cap}" ${S}/>` +
  `<rect x="${x}" y="${by - 20}" width="13" height="8" fill="${cap}" ${S} stroke-width="2"/>`;

/** A marker standing up on the table: white body, coloured cap and band. */
const marker = (x: number, top: number, cap: string) =>
  `<rect x="${x}" y="${top + 12}" width="11" height="${84 - top}" rx="3" fill="${C.paper}" ${S}/>` +
  `<rect x="${x}" y="${top}" width="11" height="14" rx="3" fill="${cap}" ${S}/>` +
  `<rect x="${x}" y="${top + 30}" width="11" height="7" fill="${cap}" ${S} stroke-width="2"/>`;

export const ACTIVITY_MATERIALS_C: readonly Picture[] = [
  {
    id: 'gift-wrap-materials',
    name: 'Book, wrapping paper, ribbon, tape and tag',
    category: 'home',
    bg: BG.blush,
    body: `${TABLE}
      <rect x="12" y="78" width="52" height="18" rx="2" fill="${C.blue}" ${S}/>
      <rect x="15" y="82" width="46" height="9" fill="${C.paper}" ${S} stroke-width="1.8"/>
      <path d="M19 85.5h38M19 88h38" stroke="${INK}" stroke-opacity=".3" stroke-width="1"/>
      <rect x="14" y="58" width="50" height="20" rx="3" fill="${C.red}" ${S}/>
      <ellipse cx="64" cy="68" rx="5" ry="10" fill="${C.red}" ${S}/>
      <ellipse cx="64" cy="68" rx="2" ry="4" fill="${C.paper}" ${S} stroke-width="1.5"/>
      <g fill="${C.paper}"><circle cx="22" cy="64" r="2"/><circle cx="32" cy="71" r="2"/><circle cx="42" cy="64" r="2"/><circle cx="52" cy="71" r="2"/></g>
      <path d="M86 88q14-10 4-22q-10-10 4-22" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
      <path d="M86 88q14-10 4-22q-10-10 4-22" fill="none" stroke="${C.mustard}" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="84" cy="86" r="10" fill="${C.mustard}" ${S}/>
      <circle cx="84" cy="86" r="3.5" fill="${C.paper}" ${S} stroke-width="2"/>
      ${tapeRoll(106, 88, 8, C.sky)}
      <path d="M94 30h18v20H94l-7-10z" fill="${C.paper}" ${S}/>
      <circle cx="93" cy="40" r="2" fill="${C.pink}" ${S} stroke-width="1.5"/>
      <path d="M99 36h9M99 44h7" stroke="${C.plum}" stroke-width="2" stroke-linecap="round"/>
      <path d="M20 62c3-2 6-2 9-2" ${SHINE}/>`,
  },
  {
    id: 'postcards-materials',
    name: 'Box of postcards and a plate with a pile',
    category: 'home',
    bg: BG.cream,
    body: `${TABLE}
      ${turned(26, 52, -8, `<rect x="14" y="40" width="24" height="24" rx="1" fill="${C.paper}" ${S} stroke-width="2"/><rect x="17" y="43" width="18" height="12" fill="${C.sky}"/><path d="M17 55l6-6 5 4 7-6v8z" fill="${C.green}"/>`)}
      ${turned(44, 48, 4, `<rect x="32" y="36" width="24" height="24" rx="1" fill="${C.paper}" ${S} stroke-width="2"/><rect x="35" y="39" width="18" height="12" fill="${C.pink}"/><circle cx="48" cy="44" r="3" fill="${C.mustard}"/>`)}
      ${turned(60, 52, 10, `<rect x="48" y="40" width="24" height="24" rx="1" fill="${C.paper}" ${S} stroke-width="2"/><rect x="51" y="43" width="18" height="12" fill="${C.blue}"/><path d="M51 55l9-8 9 8z" fill="${C.paper}" fill-opacity=".8"/>`)}
      <rect x="8" y="60" width="66" height="36" rx="2" fill="${C.tan}" ${S}/>
      <path d="M62 60h12v36H62z" ${SHADE}/>
      <path d="M8 66h66" stroke="${INK}" stroke-opacity=".3" stroke-width="2"/>
      ${turned(96, 44, 8, `<rect x="80" y="32" width="32" height="24" rx="1" fill="${C.paper}" ${S}/><rect x="84" y="36" width="24" height="14" fill="${BG.sky}"/><circle cx="102" cy="40" r="3" fill="${C.mustard}"/><path d="M84 50v-5q6-5 12 0t12-1v6z" fill="${C.green}"/>`)}
      <ellipse cx="96" cy="91" rx="18" ry="5" fill="${C.paper}" ${S}/>
      <rect x="85" y="81" width="22" height="7" rx="1" fill="${C.paper}" ${S} stroke-width="2"/>
      <rect x="87" y="75" width="22" height="7" rx="1" fill="${C.mustard}" ${S} stroke-width="2"/>
      <rect x="84" y="69" width="22" height="7" rx="1" fill="${C.sky}" ${S} stroke-width="2"/>
      <path d="M14 64h20" ${SHINE}/>`,
  },
  {
    id: 'sponge-print-materials',
    name: 'Sponge shapes, plate of paint and printed card',
    category: 'home',
    bg: BG.sage,
    body: `${TABLE}
      ${turned(36, 57, -4, `<rect x="8" y="24" width="56" height="66" rx="2" fill="${C.paper}" ${S}/><circle cx="24" cy="40" r="8" fill="${C.mustard}" fill-opacity=".85"/><rect x="38" y="32" width="16" height="16" fill="${C.blue}" fill-opacity=".85"/><rect x="16" y="58" width="16" height="16" fill="${C.red}" fill-opacity=".85"/><circle cx="46" cy="66" r="8" fill="${C.blue}" fill-opacity=".85"/>`)}
      <ellipse cx="90" cy="91" rx="23" ry="6" fill="${C.paper}" ${S}/>
      <ellipse cx="82" cy="90" rx="9" ry="2.6" fill="${C.blue}"/>
      <ellipse cx="99" cy="91" rx="8" ry="2.4" fill="${C.red}"/>
      <rect x="70" y="64" width="22" height="20" rx="3" fill="${C.yellow}" ${S}/>
      <rect x="70" y="80" width="22" height="4" fill="${C.blue}"/>
      <rect x="70" y="64" width="22" height="20" rx="3" fill="none" ${S}/>
      <circle cx="104" cy="74" r="10" fill="${C.yellow}" ${S}/>
      <g fill="${C.mustard}"><circle cx="76" cy="70" r="1.6"/><circle cx="84" cy="74" r="1.6"/><circle cx="80" cy="77" r="1.4"/><circle cx="87" cy="68" r="1.4"/><circle cx="100" cy="70" r="1.6"/><circle cx="107" cy="76" r="1.6"/><circle cx="103" cy="79" r="1.4"/></g>
      <path d="M14 30c2-2 4-3 7-3" ${SHINE}/>`,
  },
  {
    id: 'tissue-window-materials',
    name: 'Clear film with tissue paper, bowls and masking tape',
    category: 'home',
    bg: BG.sky,
    body: `${TABLE}
      <rect x="10" y="20" width="58" height="68" rx="2" fill="${C.paper}" fill-opacity=".55" ${S}/>
      <g stroke="${INK}" stroke-width="1.5" stroke-linejoin="round" fill-opacity=".8">
        <path d="M16 28l20-2 2 18-22 4z" fill="${C.pink}"/>
        <path d="M34 34l24-4 4 20-22 2z" fill="${C.yellow}"/>
        <path d="M14 50l22-2 4 20-24 2z" fill="${C.green}"/>
        <path d="M38 54l22-4 2 22-20 2z" fill="${C.orange}"/>
        <path d="M18 70l20 0 0 14-20 0z" fill="${C.plum}"/>
        <path d="M42 72l20-2 0 14-18 0z" fill="${C.sky}"/>
      </g>
      <rect x="6" y="16" width="16" height="7" fill="${C.sand}" ${S} stroke-width="2" transform="rotate(-30 14 19.5)"/>
      <rect x="56" y="16" width="16" height="7" fill="${C.sand}" ${S} stroke-width="2" transform="rotate(30 64 19.5)"/>
      <path d="M58 28L50 40M62 40L56 48" ${SHINE} stroke-width="2.5"/>
      <path d="M78 74l4-8 6 4zM86 72l6-8 3 8z" fill="${C.pink}" ${S} stroke-width="1.5"/>
      <path d="M74 78h22q-2 18-11 18t-11-18z" fill="${C.paper}" ${S}/>
      <path d="M100 74l4-8 6 5zM106 72l6-6 1 7z" fill="${C.green}" ${S} stroke-width="1.5"/>
      <path d="M96 78h20q-2 18-10 18t-10-18z" fill="${C.paper}" ${S}/>
      ${tapeRoll(98, 46, 11, C.sand)}`,
  },
  {
    id: 'comic-strip-materials',
    name: 'Paper with three panels, ruler, pencil and markers',
    category: 'home',
    bg: BG.cream,
    body: `${TABLE}
      ${turned(46, 50, -3, `<rect x="8" y="28" width="76" height="44" rx="2" fill="${C.paper}" ${S}/><g fill="none" stroke="${INK}" stroke-width="2"><rect x="12" y="33" width="21" height="34"/><rect x="36" y="33" width="21" height="34"/><rect x="60" y="33" width="20" height="34"/></g><circle cx="27" cy="42" r="4" fill="${C.mustard}"/><path d="M13 66v-8q10-8 19 0v8z" fill="${C.green}"/><rect x="40" y="50" width="13" height="12" fill="${C.paper}" ${S} stroke-width="1.8"/><path d="M38 51l8.5-9 8.5 9z" fill="${C.red}" ${S} stroke-width="1.8"/><rect x="68" y="52" width="4" height="12" fill="${C.brown}"/><circle cx="70" cy="46" r="7" fill="${C.green}" ${S} stroke-width="1.8"/>`)}
      <rect x="8" y="78" width="74" height="10" rx="1" fill="${C.yellow}" ${S} stroke-width="2.5"/>
      <path d="M14 78v4M20 78v3M26 78v4M32 78v3M38 78v4M44 78v3M50 78v4M56 78v3M62 78v4M68 78v3M74 78v4" stroke="${INK}" stroke-width="1.2"/>
      ${pencilFlat(14, 93, -3, C.mustard)}
      ${marker(88, 46, C.red)}
      ${marker(102, 52, C.blue)}
      <path d="M14 32c2-1 4-2 7-2" ${SHINE}/>`,
  },
  {
    id: 'oil-pastel-materials',
    name: 'Dark paper on a clipboard and a box of oil pastels',
    category: 'home',
    bg: BG.cream,
    body: `${TABLE}
      <rect x="6" y="18" width="62" height="78" rx="4" fill="${C.brown}" ${S}/>
      <rect x="10" y="26" width="54" height="64" rx="1" fill="${BG.night}" ${S} stroke-width="2"/>
      <rect x="26" y="13" width="22" height="11" rx="2" fill="${C.silver}" ${S}/>
      <path d="M18 44q6-12 12 0t12 0" fill="none" stroke="${C.yellow}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="48" cy="40" r="6" fill="none" stroke="${C.pink}" stroke-width="4"/>
      <path d="M16 70l6-8 6 8 6-8 6 8" fill="none" stroke="${C.orange}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M46 78c2-12 8-16 12-18" fill="none" stroke="${C.leaf}" stroke-width="4" stroke-linecap="round"/>
      <path d="M20 82h10" stroke="${C.sky}" stroke-width="4" stroke-linecap="round"/>
      <g ${S} stroke-width="2">
        <rect x="76" y="60" width="6" height="18" rx="2" fill="${C.red}"/>
        <rect x="83" y="56" width="6" height="22" rx="2" fill="${C.yellow}"/>
        <rect x="90" y="60" width="6" height="18" rx="2" fill="${C.green}"/>
        <rect x="97" y="57" width="6" height="21" rx="2" fill="${C.pink}"/>
        <rect x="104" y="61" width="6" height="17" rx="2" fill="${C.orange}"/>
      </g>
      <rect x="72" y="72" width="42" height="24" rx="2" fill="${C.blue}" ${S}/>
      <path d="M102 72h12v24h-12z" ${SHADE}/>
      <path d="M78 80h18" ${SHINE}/>`,
  },
  {
    id: 'sing-along-materials',
    name: 'Radio, phone and music notes',
    category: 'home',
    bg: BG.blush,
    body: `${TABLE}
      <path d="M62 52L78 26" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="78" cy="26" r="2.5" fill="${INK}"/>
      <path d="M22 52V42h36v10" fill="none" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <rect x="10" y="52" width="60" height="44" rx="6" fill="${C.red}" ${S}/>
      <circle cx="29" cy="74" r="13" fill="${C.paper}" ${S}/>
      <circle cx="29" cy="74" r="7" fill="none" stroke="${INK}" stroke-opacity=".5" stroke-width="2"/>
      <circle cx="29" cy="74" r="2" fill="${INK}" fill-opacity=".5"/>
      <rect x="46" y="60" width="18" height="10" rx="1.5" fill="${C.paper}" ${S} stroke-width="2"/>
      <path d="M55 61v8" stroke="${C.red}" stroke-width="2"/>
      <circle cx="50" cy="84" r="4.5" fill="${C.mustard}" ${S} stroke-width="2"/>
      <circle cx="61" cy="84" r="4.5" fill="${C.mustard}" ${S} stroke-width="2"/>
      <path d="M58 52h12v38q0 6-6 6h-6z" ${SHADE}/>
      ${phone(84, 48)}
      ${note(36, 30)}
      ${note(96, 30)}
      <path d="M16 58c2-2 4-3 7-3" ${SHINE}/>`,
  },
  {
    id: 'favorite-map-materials',
    name: 'Large paper with a drawn map, marker and crayon',
    category: 'home',
    bg: BG.sage,
    body: `${TABLE}
      <rect x="6" y="26" width="80" height="70" rx="3" fill="${C.wood}" ${S}/>
      <rect x="10" y="30" width="72" height="60" rx="1" fill="${C.paper}" ${S} stroke-width="2"/>
      <path d="M16 84Q30 74 38 62T66 46" fill="none" stroke="${INK}" stroke-width="2.5" stroke-dasharray="4 4" stroke-linecap="round"/>
      <rect x="64" y="38" width="12" height="10" fill="${C.paper}" ${S} stroke-width="2"/>
      <path d="M62 39l8-8 8 8z" fill="${C.red}" ${S} stroke-width="2"/>
      <rect x="23" y="46" width="4" height="8" fill="${C.brown}"/>
      <circle cx="25" cy="42" r="7" fill="${C.green}" ${S} stroke-width="2"/>
      <ellipse cx="56" cy="76" rx="11" ry="6" fill="${C.sky}" ${S} stroke-width="2"/>
      ${marker(92, 44, C.green)}
      <path d="M106 66l3.5-8 3.5 8z" fill="${C.blue}" ${S} stroke-width="2"/>
      <rect x="106" y="66" width="7" height="30" rx="1" fill="${C.blue}" ${S} stroke-width="2"/>
      <path d="M106 74h7M106 88h7" stroke="${C.paper}" stroke-width="1.5"/>
      <path d="M16 36c2-2 4-2 7-2" ${SHINE}/>`,
  },
  {
    id: 'slow-line-materials',
    name: 'Paper with traced circles, a cup and pencils',
    category: 'home',
    bg: BG.cream,
    body: `${TABLE}
      ${turned(38, 56, -3, `<rect x="8" y="22" width="60" height="68" rx="2" fill="${C.paper}" ${S}/><g fill="none" stroke="${C.blue}" stroke-width="2"><circle cx="38" cy="52" r="12"/><circle cx="50" cy="52" r="12"/><circle cx="26" cy="52" r="12"/><circle cx="44" cy="41.6" r="12"/><circle cx="32" cy="41.6" r="12"/><circle cx="44" cy="62.4" r="12"/><circle cx="32" cy="62.4" r="12"/></g><circle cx="38" cy="52" r="24" fill="none" stroke="${C.red}" stroke-width="2.5"/>`)}
      <path d="M76 62h30l-5 34H81z" fill="${C.mustard}" ${S}/>
      <ellipse cx="91" cy="62" rx="15" ry="3.5" fill="${C.sand}" ${S} stroke-width="2"/>
      <path d="M98 66h8l-5 30h-6z" ${SHADE}/>
      <path d="M80 70l2 18" ${SHINE}/>
      ${pencilFlat(12, 92, -4, C.green)}
      ${pencilFlat(78, 52, -18, C.red)}`,
  },
  {
    id: 'torn-landscape-materials',
    name: 'Card with a torn paper landscape, a stack of torn strips and a glue stick',
    category: 'home',
    bg: BG.sky,
    body: `${TABLE}
      <rect x="6" y="24" width="60" height="66" rx="2" fill="${C.paper}" ${S}/>
      <path d="M10 28h52v26l-5 2-4-3-6 3-5-2-6 3-5-2-6 3-5-2-6 2-4-2z" fill="${C.sky}" ${S} stroke-width="1.5"/>
      <path d="M10 66q10-14 22-8t20-8q8-2 10 4v16l-4 2-5-2-5 2-6-2-6 2-6-2-6 2-6-2-4 2z" fill="${C.green}" ${S} stroke-width="1.5"/>
      <path d="M10 76l6-2 5 2 6-2 6 2 6-2 6 2 6-2 5 2v12H10z" fill="${C.brown}" ${S} stroke-width="1.5"/>
      <circle cx="50" cy="38" r="6" fill="${C.yellow}" ${S} stroke-width="1.5"/>
      <g ${S} stroke-width="1.8">
        <path d="M72 96v-9l3-2 3 2 3-2 3 2 3-2 3 2 3-2 3 2v9z" fill="${C.brown}"/>
        <path d="M74 84v-8l3-2 3 2 3-2 3 2 3-2 3 2 3-2v10z" fill="${C.green}"/>
        <path d="M72 74v-8l3-2 3 2 3-2 3 2 3-2 3 2 3-2 3 2v10z" fill="${C.blue}"/>
      </g>
      ${glueStick(100, 96, C.red)}
      <path d="M78 90h12" ${SHINE}/>`,
  },
  {
    id: 'color-tune-materials',
    name: 'Phone, music notes and a row of colored paper squares',
    category: 'home',
    bg: BG.blush,
    body: `${TABLE}
      ${phone(10, 38, 30)}
      <g ${S}>
        <rect x="46" y="66" width="20" height="30" rx="2" fill="${C.red}" transform="rotate(-6 56 96)"/>
        <rect x="60" y="62" width="20" height="34" rx="2" fill="${C.yellow}" transform="rotate(-2 70 96)"/>
        <rect x="75" y="62" width="20" height="34" rx="2" fill="${C.blue}" transform="rotate(3 85 96)"/>
        <rect x="90" y="66" width="20" height="30" rx="2" fill="${C.green}" transform="rotate(7 100 96)"/>
      </g>
      ${note(52, 40)}
      ${note(82, 30)}
      <path d="M16 46c2-2 4-3 7-3" ${SHINE}/>`,
  },
  {
    id: 'leaf-rubbing-materials',
    name: 'Leaf rubbing on a clipboard, a leaf and bare crayons',
    category: 'garden',
    bg: BG.sage,
    body: `${TABLE}
      <rect x="6" y="18" width="62" height="78" rx="4" fill="${C.brown}" ${S}/>
      <rect x="10" y="26" width="54" height="64" rx="1" fill="${C.paper}" ${S} stroke-width="2"/>
      <rect x="26" y="13" width="22" height="11" rx="2" fill="${C.silver}" ${S}/>
      <rect x="8" y="80" width="14" height="6" fill="${C.sand}" ${S} stroke-width="1.5" transform="rotate(-30 15 83)"/>
      <rect x="52" y="80" width="14" height="6" fill="${C.sand}" ${S} stroke-width="1.5" transform="rotate(30 59 83)"/>
      <g transform="translate(37 56) rotate(-60) scale(2.2)">
        <path d="M-14 0C-6-10 8-10 14 0C8 10-6 10-14 0Z" fill="${C.orange}" fill-opacity=".35" stroke="${C.orange}" stroke-width="1.6" stroke-linejoin="round"/>
        <path d="M-11 0H11M-4 0l-4-5M0 0l-4 5M4 0l-2-5M4 0l2 5M-7 0l-3 4M7 0l2-4" stroke="${C.orange}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
      </g>
      ${leaf(94, 46, -40, C.green, 1.6)}
      <path d="M84 58l-6 8" stroke="${C.deepGreen}" stroke-width="2.5" stroke-linecap="round"/>
      <rect x="74" y="88" width="38" height="8" rx="4" fill="${C.orange}" ${S} stroke-width="2"/>
      <rect x="80" y="80" width="30" height="8" rx="4" fill="${C.blue}" ${S} stroke-width="2"/>
      <rect x="76" y="72" width="26" height="8" rx="4" fill="${C.red}" ${S} stroke-width="2"/>`,
  },
  {
    id: 'friendship-bracelet-materials',
    name: 'Three strands of yarn taped to a clipboard, plaited, with scissors and tape',
    category: 'home',
    bg: BG.blush,
    body: `${TABLE}
      <rect x="10" y="18" width="56" height="78" rx="4" fill="${C.brown}" ${S}/>
      <rect x="27" y="13" width="22" height="11" rx="2" fill="${C.silver}" ${S}/>
      <g fill="none" stroke-linecap="round">
        <path d="M32 34L37 44M38 34V44M44 34L39 44" stroke="${INK}" stroke-width="6"/>
        <path d="M32 34L37 44" stroke="${C.red}" stroke-width="3.5"/>
        <path d="M38 34V44" stroke="${C.yellow}" stroke-width="3.5"/>
        <path d="M44 34L39 44" stroke="${C.sky}" stroke-width="3.5"/>
      </g>
      <g ${S} stroke-width="2">
        <ellipse cx="35.5" cy="48" rx="6" ry="3.5" fill="${C.red}" transform="rotate(40 35.5 48)"/>
        <ellipse cx="40.5" cy="53" rx="6" ry="3.5" fill="${C.yellow}" transform="rotate(-40 40.5 53)"/>
        <ellipse cx="35.5" cy="58" rx="6" ry="3.5" fill="${C.sky}" transform="rotate(40 35.5 58)"/>
        <ellipse cx="40.5" cy="63" rx="6" ry="3.5" fill="${C.red}" transform="rotate(-40 40.5 63)"/>
        <ellipse cx="35.5" cy="68" rx="6" ry="3.5" fill="${C.yellow}" transform="rotate(40 35.5 68)"/>
        <ellipse cx="40.5" cy="73" rx="6" ry="3.5" fill="${C.sky}" transform="rotate(-40 40.5 73)"/>
      </g>
      <g fill="none" stroke-linecap="round">
        <path d="M37 77l-8 12M38 77v13M39 77l9 12" stroke="${INK}" stroke-width="6"/>
        <path d="M37 77l-8 12" stroke="${C.red}" stroke-width="3.5"/>
        <path d="M38 77v13" stroke="${C.yellow}" stroke-width="3.5"/>
        <path d="M39 77l9 12" stroke="${C.sky}" stroke-width="3.5"/>
      </g>
      <rect x="22" y="27" width="32" height="9" rx="1" fill="${C.sand}" ${S} stroke-width="2"/>
      ${tapeRoll(96, 40, 12, C.sand)}
      ${scissors(94, 82, -15)}
      <path d="M16 26c2-2 4-3 7-3" ${SHINE}/>`,
  },
  {
    id: 'chair-music-materials',
    name: 'Sturdy chair with a soft scarf over the seat and a phone playing music',
    category: 'home',
    bg: BG.sage,
    body: `${TABLE}
      <rect x="20" y="64" width="7" height="32" rx="2" fill="${C.wood}" ${S}/>
      <rect x="57" y="64" width="7" height="32" rx="2" fill="${C.wood}" ${S}/>
      <rect x="22" y="20" width="40" height="36" rx="5" fill="${C.wood}" ${S}/>
      <rect x="28" y="26" width="28" height="24" rx="3" fill="${C.tan}" ${S} stroke-width="2"/>
      <rect x="14" y="54" width="56" height="11" rx="3" fill="${C.wood}" ${S}/>
      <rect x="34" y="50" width="16" height="36" rx="3" fill="${C.plum}" ${S}/>
      <path d="M34 62h16M34 70h16" stroke="${C.paper}" stroke-opacity=".6" stroke-width="2.5"/>
      <path d="M37 86v5M42 86v6M47 86v5" stroke="${C.plum}" stroke-width="2.5" stroke-linecap="round"/>
      ${phone(84, 50)}
      ${note(80, 34)}
      ${note(102, 26)}
      <path d="M26 26c2-2 4-3 7-3" ${SHINE}/>`,
  },
  {
    id: 'festival-decoration-materials',
    name: 'Paper flags on a string, colored paper, glue stick and scissors',
    category: 'home',
    bg: BG.cream,
    body: `${TABLE}
      <path d="M6 22Q60 42 114 22" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
      <g ${S} stroke-width="2">
        <path d="M11 24.6L27 29.6L19 47z" fill="${C.red}"/>
        <path d="M30 30.4L46 32.8L38 50z" fill="${C.mustard}"/>
        <path d="M52 33.6L68 33.6L60 51z" fill="${C.blue}"/>
        <path d="M74 32.8L90 30.4L82 48z" fill="${C.green}"/>
        <path d="M93 29.6L109 24.6L101 45z" fill="${C.pink}"/>
      </g>
      <rect x="8" y="80" width="46" height="16" rx="2" fill="${C.blue}" ${S}/>
      <rect x="12" y="72" width="46" height="16" rx="2" fill="${C.pink}" ${S}/>
      <rect x="16" y="64" width="46" height="16" rx="2" fill="${C.mustard}" ${S}/>
      ${glueStick(68, 96, C.blue)}
      ${scissors(94, 86, -10)}
      <path d="M22 68h14" ${SHINE}/>`,
  },
];
