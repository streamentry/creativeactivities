import { BG, C, INK, S, SHADE, SHINE, type Picture } from './kit.ts';

/**
 * Finished results of the activity cards added in batches m3 and later (WEB-012).
 * Like the materials drawings they are served at /pictures/<id>.svg for the
 * activity pages only, and kept out of PICTURES: not in the games, the printable
 * gallery or the app library. No people, no hands, no text inside the drawing.
 */

const note = (x: number, y: number) =>
  `<circle cx="${x}" cy="${y}" r="4" fill="${INK}"/><path d="M${x + 3.5} ${y}V${y - 15}l6 3" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;

/** A sheet of paper with a soft shade on its lower edge. */
const sheet = (x: number, y: number, w: number, h: number, fill: string = C.paper) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${fill}" ${S}/>`;

/** A leaf rubbing: the outline and veins only, in one wax color. */
const rubbing = (x: number, y: number, rot: number, color: string) =>
  `<g transform="translate(${x} ${y}) rotate(${rot}) scale(1.5)"><path d="M-14 0C-6-10 8-10 14 0C8 10-6 10-14 0Z" fill="${color}" fill-opacity=".3" stroke="${color}" stroke-width="1.6" stroke-linejoin="round"/><path d="M-11 0H11M-4 0l-4-5M0 0l-4 5M4 0l-2-5M4 0l2 5" stroke="${color}" stroke-width="1.3" fill="none" stroke-linecap="round"/></g>`;

export const ACTIVITY_RESULTS_C: readonly Picture[] = [
  {
    id: 'wrapped-small-gift',
    name: 'Small wrapped gift with ribbon, a bow and a tag',
    category: 'home',
    bg: BG.blush,
    body: `<rect x="26" y="46" width="68" height="52" rx="3" fill="${C.blue}" ${S}/>
      <path d="M26 46h68v10H26z" ${SHADE}/>
      <rect x="54" y="46" width="12" height="52" fill="${C.yellow}" ${S} stroke-width="2"/>
      <rect x="26" y="66" width="68" height="11" fill="${C.yellow}" ${S} stroke-width="2"/>
      <path d="M60 46C48 28 32 36 46 46zM60 46C72 28 88 36 74 46z" fill="${C.yellow}" ${S}/>
      <circle cx="60" cy="46" r="5" fill="${C.mustard}" ${S}/>
      <path d="M94 66q10 6 12 18" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
      <rect x="98" y="82" width="14" height="18" rx="2" fill="${C.paper}" ${S} stroke-width="2" transform="rotate(-8 105 91)"/>
      <path d="M32 54c3-3 6-4 10-4" ${SHINE}/>`,
  },
  {
    id: 'sorted-postcards',
    name: 'Three neat piles of postcards',
    category: 'home',
    bg: BG.cream,
    body: `<g ${S} stroke-width="2.5">
        <rect x="10" y="62" width="30" height="22" rx="2" fill="${C.sky}" transform="rotate(-4 25 73)"/>
        <rect x="12" y="56" width="30" height="22" rx="2" fill="${C.leaf}" transform="rotate(3 27 67)"/>
        <rect x="11" y="50" width="30" height="22" rx="2" fill="${C.paper}" transform="rotate(-2 26 61)"/>
        <rect x="45" y="70" width="30" height="22" rx="2" fill="${C.peach}" transform="rotate(5 60 81)"/>
        <rect x="45" y="64" width="30" height="22" rx="2" fill="${C.yellow}" transform="rotate(-3 60 75)"/>
        <rect x="46" y="58" width="30" height="22" rx="2" fill="${C.paper}" transform="rotate(2 61 69)"/>
        <rect x="80" y="64" width="30" height="22" rx="2" fill="${C.pink}" transform="rotate(-5 95 75)"/>
        <rect x="80" y="58" width="30" height="22" rx="2" fill="${C.sky}" transform="rotate(4 95 69)"/>
        <rect x="80" y="52" width="30" height="22" rx="2" fill="${C.paper}" transform="rotate(-1 95 63)"/>
      </g>
      <path d="M18 56h16M52 64h16M86 58h16" stroke="${C.red}" stroke-width="2.5" stroke-linecap="round"/>`,
  },
  {
    id: 'sponge-printed-shapes',
    name: 'Sheet printed with sponge circles, squares and triangles',
    category: 'home',
    bg: BG.sky,
    body: `${sheet(14, 16, 92, 88)}
      <circle cx="36" cy="38" r="11" fill="${C.red}" fill-opacity=".85" ${S} stroke-width="1.5"/>
      <rect x="62" y="28" width="22" height="22" rx="2" fill="${C.blue}" fill-opacity=".85" ${S} stroke-width="1.5" transform="rotate(8 73 39)"/>
      <path d="M30 86l12-22 12 22z" fill="${C.mustard}" fill-opacity=".9" ${S} stroke-width="1.5"/>
      <circle cx="78" cy="76" r="10" fill="${C.green}" fill-opacity=".85" ${S} stroke-width="1.5"/>
      <rect x="86" y="54" width="14" height="14" rx="2" fill="${C.pink}" fill-opacity=".9" ${S} stroke-width="1.5" transform="rotate(-10 93 61)"/>
      <path d="M22 24c2-2 4-3 7-3" ${SHINE}/>`,
  },
  {
    id: 'tissue-paper-window-picture',
    name: 'Window picture of colored tissue paper with a sun',
    category: 'home',
    bg: BG.sky,
    body: `<rect x="18" y="14" width="84" height="92" rx="3" fill="${C.wood}" ${S}/>
      <rect x="25" y="21" width="70" height="78" rx="1" fill="${C.sky}" ${S} stroke-width="2"/>
      <circle cx="48" cy="44" r="12" fill="${C.yellow}" ${S} stroke-width="2"/>
      <path d="M25 99V72q14-10 24-2t26-4q10-2 20 4v29z" fill="${C.green}" fill-opacity=".85" ${S} stroke-width="2"/>
      <path d="M70 34l10-8 8 10-10 8z" fill="${C.pink}" fill-opacity=".85" ${S} stroke-width="2"/>
      <rect x="25" y="58" width="70" height="3" ${SHADE}/>
      <path d="M60 21v78M25 60h70" stroke="${C.wood}" stroke-width="4"/>`,
  },
  {
    id: 'comic-strip-three-panels',
    name: 'Comic strip of three drawn panels: sun, house and tree',
    category: 'home',
    bg: BG.cream,
    body: `${sheet(8, 28, 104, 64)}
      <g ${S} stroke-width="2">
        <rect x="14" y="34" width="29" height="52" fill="${C.sky}"/>
        <rect x="46" y="34" width="29" height="52" fill="${BG.cream}"/>
        <rect x="78" y="34" width="29" height="52" fill="${C.leaf}"/>
        <circle cx="28" cy="52" r="8" fill="${C.yellow}"/>
        <path d="M50 72l11-12 11 12v12H50z" fill="${C.red}"/>
        <rect x="58" y="74" width="7" height="10" fill="${C.paper}"/>
        <rect x="90" y="66" width="6" height="20" fill="${C.brown}"/>
        <circle cx="93" cy="58" r="12" fill="${C.green}"/>
      </g>`,
  },
  {
    id: 'oil-pastel-drawing-dark-paper',
    name: 'Oil pastel drawing of a sun and flowers on dark paper',
    category: 'home',
    bg: BG.night,
    body: `${sheet(12, 14, 96, 92, '#2c3a4d')}
      <circle cx="42" cy="44" r="13" fill="${C.yellow}" ${S} stroke-width="2"/>
      <path d="M42 24v-6M42 64v6M22 44h-6M62 44h6M28 30l-4-4M56 58l4 4M56 30l4-4M28 58l-4 4" stroke="${C.mustard}" stroke-width="3" stroke-linecap="round"/>
      <path d="M78 98V72M96 98V80" stroke="${C.leaf}" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="78" cy="66" r="8" fill="${C.pink}" ${S} stroke-width="2"/>
      <circle cx="96" cy="74" r="7" fill="${C.orange}" ${S} stroke-width="2"/>
      <path d="M20 88q14-12 28 0t26 0" fill="none" stroke="${C.sky}" stroke-width="4" stroke-linecap="round"/>`,
  },
  {
    id: 'sing-along-song-sheet',
    name: 'Large-print song sheet with lines and music notes',
    category: 'home',
    bg: BG.sage,
    body: `${sheet(24, 12, 72, 96)}
      <path d="M34 34h52M34 48h46M34 62h52M34 76h40" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-opacity=".75"/>
      <path d="M34 90h30" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-opacity=".75"/>
      ${note(88, 96)}
      <path d="M30 20h16" ${SHINE}/>
      <g transform="translate(78 24) scale(.8)">${note(0, 0)}</g>`,
  },
  {
    id: 'drawn-map-of-a-place',
    name: 'Hand-drawn map with a winding path, a house, a tree and a pond',
    category: 'travel',
    bg: BG.sage,
    body: `${sheet(10, 14, 100, 92, BG.cream)}
      <path d="M22 98C30 80 52 82 56 66S78 50 96 38" fill="none" stroke="${C.tan}" stroke-width="9" stroke-linecap="round"/>
      <path d="M22 98C30 80 52 82 56 66S78 50 96 38" fill="none" stroke="${C.sand}" stroke-width="4" stroke-linecap="round" stroke-dasharray="1 8"/>
      <path d="M18 34l12-12 12 12v14H18z" fill="${C.red}" ${S} stroke-width="2"/>
      <rect x="27" y="38" width="7" height="10" fill="${C.paper}" ${S} stroke-width="1.5"/>
      <rect x="82" y="72" width="6" height="16" fill="${C.brown}" ${S} stroke-width="2"/>
      <circle cx="85" cy="64" r="12" fill="${C.green}" ${S} stroke-width="2"/>
      <ellipse cx="44" cy="62" rx="14" ry="8" fill="${C.sky}" ${S} stroke-width="2"/>
      <path d="M38 62q6-3 12 0" ${SHINE}/>`,
  },
  {
    id: 'slow-line-pattern',
    name: 'Sheet of slow wavy lines in several colors',
    category: 'home',
    bg: BG.cream,
    body: `${sheet(14, 14, 92, 92)}
      <g fill="none" stroke-width="4" stroke-linecap="round">
        <path d="M22 30q10-10 20 0t20 0 20 0 14 0" stroke="${C.blue}"/>
        <path d="M22 44q10-10 20 0t20 0 20 0 14 0" stroke="${C.red}"/>
        <path d="M22 58q10-10 20 0t20 0 20 0 14 0" stroke="${C.mustard}"/>
        <path d="M22 72q10-10 20 0t20 0 20 0 14 0" stroke="${C.green}"/>
        <path d="M22 86q10-10 20 0t20 0 20 0 14 0" stroke="${C.plum}"/>
      </g>`,
  },
  {
    id: 'torn-paper-landscape',
    name: 'Finished torn paper landscape with hills, a sun and a river',
    category: 'home',
    bg: BG.sky,
    body: `<rect x="14" y="14" width="92" height="92" rx="2" fill="${C.paper}" ${S}/>
      <path d="M20 20h80v46l-5 2-5-3-7 3-6-2-7 3-6-2-7 3-6-2-7 3-6-2-7 2-5-2z" fill="${C.sky}" ${S} stroke-width="1.5"/>
      <circle cx="82" cy="36" r="10" fill="${C.yellow}" ${S} stroke-width="1.5"/>
      <path d="M20 74q14-24 32-10t26-8q12-6 22 6v30H20z" fill="${C.green}" ${S} stroke-width="1.5"/>
      <path d="M20 84l8-3 7 3 8-3 7 3 8-3 7 3 8-3 7 3 12-3v18H20z" fill="${C.brown}" ${S} stroke-width="1.5"/>
      <path d="M52 100q10-8 6-16" fill="none" stroke="${C.sky}" stroke-width="5" stroke-linecap="round"/>`,
  },
  {
    id: 'colors-for-a-tune-row',
    name: 'A row of colored paper squares chosen for a tune, with music notes',
    category: 'home',
    bg: BG.blush,
    body: `${sheet(10, 46, 100, 44)}
      <g ${S} stroke-width="2">
        <rect x="16" y="54" width="20" height="28" rx="2" fill="${C.blue}"/>
        <rect x="40" y="54" width="20" height="28" rx="2" fill="${C.sky}"/>
        <rect x="64" y="54" width="20" height="28" rx="2" fill="${C.pink}"/>
        <rect x="88" y="54" width="16" height="28" rx="2" fill="${C.yellow}"/>
      </g>
      ${note(28, 36)}
      ${note(56, 28)}
      ${note(84, 34)}`,
  },
  {
    id: 'leaf-rubbing-sheet',
    name: 'Sheet with three leaf rubbings in orange, red and green wax',
    category: 'garden',
    bg: BG.sage,
    body: `${sheet(12, 14, 96, 92)}
      ${rubbing(36, 40, -50, C.orange)}
      ${rubbing(78, 46, 30, C.red)}
      ${rubbing(56, 84, -10, C.green)}`,
  },
  {
    id: 'friendship-bracelet',
    name: 'Braided friendship bracelet of red, yellow and blue threads, tied in a loop',
    category: 'home',
    bg: BG.cream,
    body: `<circle cx="60" cy="62" r="34" fill="none" stroke="${INK}" stroke-width="17" stroke-linecap="round"/>
      <circle cx="60" cy="62" r="34" fill="none" stroke="${C.red}" stroke-width="11" stroke-dasharray="20 40"/>
      <circle cx="60" cy="62" r="34" fill="none" stroke="${C.yellow}" stroke-width="11" stroke-dasharray="20 40" stroke-dashoffset="-20"/>
      <circle cx="60" cy="62" r="34" fill="none" stroke="${C.blue}" stroke-width="11" stroke-dasharray="20 40" stroke-dashoffset="-40"/>
      <path d="M60 24l-8-12M60 24l2-14M60 24l8-12" stroke="${C.red}" stroke-width="3" stroke-linecap="round"/>`,
  },
  {
    id: 'scarf-swirl-music',
    name: 'A soft scarf swirling in the air above a chair, with music notes',
    category: 'home',
    bg: BG.sage,
    body: `<rect x="24" y="64" width="6" height="32" rx="2" fill="${C.wood}" ${S}/>
      <rect x="68" y="64" width="6" height="32" rx="2" fill="${C.wood}" ${S}/>
      <rect x="22" y="54" width="54" height="11" rx="3" fill="${C.wood}" ${S}/>
      <rect x="24" y="30" width="6" height="26" rx="2" fill="${C.wood}" ${S}/>
      <path d="M30 50C44 18 66 54 82 26S104 18 108 34" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>
      <path d="M30 50C44 18 66 54 82 26S104 18 108 34" fill="none" stroke="${C.plum}" stroke-width="7" stroke-linecap="round"/>
      ${note(92, 66)}
      ${note(104, 52)}`,
  },
  {
    id: 'festival-paper-decoration',
    name: 'Hanging paper star decoration with colored paper tassels',
    category: 'home',
    bg: BG.night,
    body: `<path d="M60 8v22" stroke="${C.paper}" stroke-width="3" stroke-linecap="round"/>
      <path d="M60 28l9 18 20 3-14 14 4 20-19-10-19 10 4-20-14-14 20-3z" fill="${C.yellow}" ${S}/>
      <path d="M60 60l9-14 20 3-14 14z" ${SHADE}/>
      <circle cx="60" cy="56" r="6" fill="${C.red}" ${S} stroke-width="2"/>
      <g stroke-width="4" stroke-linecap="round" fill="none">
        <path d="M44 84v14" stroke="${C.pink}"/>
        <path d="M54 86v18" stroke="${C.mustard}"/>
        <path d="M66 86v18" stroke="${C.sky}"/>
        <path d="M76 84v14" stroke="${C.leaf}"/>
      </g>`,
  },
];
