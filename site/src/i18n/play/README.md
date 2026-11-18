# Game text and content, per language

The 27 browser games read their words from here. The mobile app's exporter also
reads the `illustrations` names from these files to build screen-reader labels
for its bundled pictures. `en.json` is the English source. A translation is
`<code>.json` in this folder, named with a code from `LOCALES` in
`../locales.ts` (for example `es.json`, `pt-BR.json`, `ar.json`, `vi.json`).

`../play.ts` merges a translation over English key by key, so a missing key shows
English rather than nothing. **Arrays are replaced whole**: if you give
`content.sayings`, give the complete list, never a partial one. The page passes
only one language to the browser, through `playProps(code, slug)`.

Start by copying `en.json`, keep every key and id exactly as it is, and change
only the text. Run `pnpm exec vitest run` afterwards: `play.test.ts` checks
every file in this folder against the rules below.

## Who it is for

Read `../../../CONTENT_GUIDE.md` (voice) and `../../../../DESIGN.md` first. In
short: the player is an adult living with dementia, playing with a family
member or carer. Write plain, warm, adult language.

- **Familiar, not clever.** Everyday words and sayings that older adults in
  that country grew up with. No slang, wordplay, regional rarities or
  anything that needs explaining.
- **No quizzing.** Never "Do you remember…?", "Who is this?", "What year…?" or
  anything with one right answer. Prompts are open invitations: "Tell me
  about…", "What do you like…?".
- **No scores or pressure.** No "correct", "wrong", "try harder", "well done!",
  levels, speed or counting what someone got right. Wrong choices are never
  called wrong ("That one is the pear. Take your time.").
- **No health claims.** Never say or imply the games train, improve, protect,
  test or treat memory, the brain or dementia. Avoid brain, memory, therapy,
  exercise for the mind, patients.
- **Dignity.** Not childish. No emoji, no exclamation marks in praise, no ALL
  CAPS (word search letters are the one exception), sentence case.

## What to produce for each language

| Key | How many | What it is |
| --- | --- | --- |
| `ui` | About 200 strings in 16 sections, not counting `ui.fourTogether`, `ui.oddOneOut`, `ui.colorMatch`, `ui.halvesMatch`, `ui.colorByNumber`, `ui.patternMaker`, `ui.buildTogether`, `ui.seatedToss`, `ui.decorateACard`, `ui.findTogether`, `ui.drawingDuet`, `ui.seasonalPack`, `ui.quietShapes`, `ui.storyChain` and `ui.storyDice` | Guidance, buttons, chips, live messages, labels, print headings |
| `pictures` | 83 names | One name per drawing id (list below) |
| `illustrations` | 100 names | One short spoken label per mobile-only raster illustration id, copied from `assets/images/illustrations/manifest.json` |
| `content.sayings` | at least 30; aim for 40–50 (English has 50) | Finish the saying |
| `content.wordSearch` | `fill` + at least 4 themes (English has 6) × at least 6 words (English has 9) | Word search |
| `content.conversation` | 9 theme labels + at least 2 cards per theme (English has 43 cards) | Conversation cards |
| `content.coloring` | 5 page names + 47 region names | Coloring |
| `content.sorting` | 3 themes × (label + 2 basket names) | Sort together |
| `ui.fourTogether`, `content.fourTogether` | 11 strings + 7 group names | Four together (English only for now; see below) |
| `ui.oddOneOut` | 10 strings (reuses `content.fourTogether`) | Odd one out (English only for now; see below) |
| `ui.colorMatch` | 10 strings + 5 color names | Color match (English only for now; see below) |
| `ui.halvesMatch` | 16 strings | Halves match (English only for now; see below) |
| `ui.colorByNumber` | 17 strings + 4 color names + 6 picture names | Color by number (English only for now; see below) |
| `ui.patternMaker` | 17 strings + 4 color names | Pattern maker (English only for now; see below) |
| `ui.buildTogether` | 27 strings + 2 names of the people + 4 color names | Build together (English only for now; see below) |
| `ui.quietShapes` | About 40 strings, 6 picture names, 5 piece names and 5 shape descriptions | Quiet shapes puzzle (English only for now; GAME-060) |
| `ui.seasonalPack` | 11 strings + 4 season names + 3 puzzles (title, how, describe) | Seasonal puzzle pack (English only for now; see below) |
| `ui.drawingDuet` | 24 strings + 2 names of the people + 4 color names | Drawing duet (English only for now; see below) |
| `ui.seatedToss` | 12 strings + 3 ring names + 2 names of the people + 2 safety labels + 4 safety lines + 5 steps | Seated toss tally (English only for now; see below) |
| `ui.decorateACard` | 9 strings + 5 occasions (label and front words) + 5 steps + 3 rules for two | Decorate a card together (English only for now; see below) |
| `ui.findTogether` | 22 strings | Find together (English only for now; see below) |
| `ui.storyChain` | 12 strings | Story chain (English only for now; see below) |
| `ui.storyDice` | 8 strings | Story dice (English only for now; see below) |

The 20 low-confidence locales with incomplete `pictures` names keep their
existing English fallback, as recorded in `docs/improvements/TRACKING.md`.
The app-only `illustrations` map is translated in the 44 app locales that
already have all 83 drawing names; it is not used by the browser games.

### `ui`

- Keep every `{placeholder}` exactly as written; you may move it within the
  sentence. The test fails if a translation uses a placeholder English does
  not have.
- `{name|lower}` puts a picture or color name in lowercase inside a sentence
  ("Two pictures of the red apple"). Where your language does not lowercase
  nouns (German) or has no case, write `{name}` instead. These keys use it:
  `pairs.picturePair`, `choose.thatOne`, `findTheSame.yes`, `shadowMatch.yes`,
  `shadowMatch.foundAlt`, `sortTogether.hint`, `sortTogether.placed`,
  `picturePuzzle.whole`, `coloring.painted`, `coloring.partPainted`.
- Rephrase freely where English grammar does not carry over. "Two pictures of
  the {name}" can become "Two pictures: {name}" if articles or gender would
  otherwise be wrong.
- **Plurals.** These keys are objects of plural forms: `picturePairs.size`,
  `sortTogether.basket`, `picturePuzzle.size`, `picturePuzzle.swapped`,
  `wordSearch.size`, `photoPairs.skipped`, `pictureBingo.called`,
  `pictureBingo.cards`, `pictureBingo.print`. Give every form your language
  uses, named `zero`, `one`, `two`, `few`, `many` and `other`
  (Russian, Ukrainian and Polish need `one`, `few`, `many`, `other`; Arabic
  needs all six; Japanese, Korean, Chinese, Thai, Vietnamese and Indonesian
  need only `other`). The test checks this with `Intl.PluralRules`.
- `photoPairs.intro`: text between `**` is shown in bold. Keep one bold run.
- `photoPairs.setupHint` is an optional, point-of-use reminder to reduce
  distractions and make the viewing space comfortable. It is shown before
  photos are selected. Japanese copy is supplied but not native-speaker
  reviewed; other locales keep the English fallback.
- `photoPairs.atLeastOne` asks for a valid photo if none could be loaded;
  `atLeastTwo` explains that matching needs a second photo after one is chosen.
  Japanese copy matches the one-photo viewing flow; other locales keep the
  English fallback.
- `photoPairs.photoComfort` is a short reminder to follow the person's response
  to selected photos. `lookOnly`, `lookGuidance`, `photoPosition`,
  `previousPhoto` and `nextPhoto` label the optional one-at-a-time photo view.
  A single selected photo starts in that view; matching needs at least two.
  Japanese copy is supplied but not native-speaker reviewed; other locales keep
  the English fallback.
- `photoPairs.captionSummary`, `captionHelp` and `captionLabel` label optional,
  page-only photo captions. They remain English fallbacks on translated pages
  except in Japanese, where copy is supplied but not native-speaker reviewed;
  caption text is not stored or uploaded.
- `finishTheSaying.gap` is what goes between the start of a saying and the
  blank: a space in English, `""` in Chinese, Japanese and Thai.
  `finishTheSaying.ending` is the revealed last word with its sentence mark
  (`"{end}."` in English, `"{end}。"` in Chinese and Japanese).
- `picturePuzzle.places4` (4 items) and `places9` (9 items) name the board
  positions in reading order: top row first, left to right. Keep the counts.
  The puzzle board itself stays left to right in every language, because the
  pieces are slices of a picture.
- `picturePuzzle.pictures` are short chip labels for six puzzle pictures; they
  may be shorter than the full picture names.
- `coloring.paints`: 12 color names. Keep them distinct and common
  ("Sky blue", not "Cerulean").
- `wordSearch.unavailable` is shown instead of the game where the word search
  is off (see below).

### `pictures`

A short, concrete name for each of the 83 hand-drawn pictures in
`site/src/data/pictures.ts`. The ids are the filenames under `/pictures/`.
Names are read aloud as tile labels ("Teacup, tile 3"), so use the everyday
noun people would say first.

### `illustrations`

Short labels for the 100 raster illustrations listed in
`assets/images/illustrations/manifest.json`. These are used by the mobile app's
screen-reader labels; the exporter combines them with the hand-drawn picture
names. Use one familiar, concrete name per id. Keep distinguishing details
such as "wooden", "old" or "with a lid" when they make the picture clearer.
These labels are machine-made until a native speaker reviews them.

### `content.sayings` (Finish the saying)

Each item is `{ "start", "end", "others": [two words], "prompt" }`.

- A **traditional, widely known saying or proverb in that language**, not a
  translation of an English one. Public domain only: no song lyrics, poems,
  slogans or advertising lines.
- `end` is the usual last word (or short phrase); the player picks it from
  three buttons, so it must be the natural ending and fit on a large button
  (1–2 words).
- `others`: two friendly alternatives that are plausible and gentle, never
  silly at the person's expense, never a trick. All three must differ.
- `prompt`: one open, everyday conversation starter linked to the saying.
  Never a memory question.
- Avoid sayings about illness, death, old age, losing your mind, money worries
  or anything that could sting.
- For languages written without spaces, set `ui.finishTheSaying.gap` to `""`.

### `content.wordSearch`

- `available`: use `true` only when a letter grid suits the script and every
  theme has at least six familiar 3–6 grapheme words; otherwise use `false`.
  It is already `false` for Chinese (both scripts), Japanese, Korean and Thai
  (`NO_LETTER_GRID` in `../play.ts`); delete `content.wordSearch` from those
  files, or copying `"available": true` from English would turn it back on.
- `fill`: at least 10 different letters used to fill empty squares. Pick
  letters that are easy to tell apart in large print (English leaves out Q, X,
  Z, J). For scripts with joined letters or vowel signs (Arabic, Hindi), each
  cell holds one letter as a reader sees it (a whole syllable with its vowel
  sign in Hindi).
- `themes`: each `{ "value", "label", "words" }`. Keep the English `value`
  ids (`fruit`, `garden`, `kitchen`, `weather`, `animals`, `home`) where the
  theme still fits; replace a theme only if it would feel foreign.
- `words`: common nouns of **3 to 6 letters** (as the reader counts them),
  no spaces or hyphens, at least 6 per theme. Words read in the language's
  direction: across means right to left in Arabic. Words are shown in
  capitals where the script has them.

### `content.conversation`

- `themes`: chip labels for `all`, `food`, `home`, `outdoors`, `animals`,
  `travel`, `work`, `music`, `seasons`.
- `cards`: each `{ "theme", "picture", "prompt" }`. Use a theme id and a
  picture id from the lists above. At least 2 cards per theme; matching the
  43 English cards is ideal. Adapt rather than translate: food, seasons,
  music and work should feel local. Open invitations only, no right answers.

### `content.coloring`

Five pages keyed by id (`flower`, `house`, `teacup`, `butterfly`,
`sailboat`), each with a `name` and a `regions` map giving every region a
plain name that is read aloud ("Left window"). Keep all region ids:
flower 16, house 10, teacup 6, butterfly 8, sailboat 7.

### `content.sorting`

`kitchen-garden`, `fruit-animals`, `home-travel`: a chip `label` and two
`baskets` names, in that order (the pictures sorted into each basket are
fixed).

### Four together (`ui.fourTogether`, `content.fourTogether`)

Four together is offered in English only. Its group names (`fruit`,
`animals`, `travel`, `flowers`, `hot-drinks`, `weather`, `baked`) must pass a
per-language category review before the game appears in another language
(GAME-022): a native speaker checks that each name is plain and that every
picture in a group still reads as belonging to it, and only to it. After that
review, add the translated strings here and the language code to
`FOUR_TOGETHER_REVIEWED` in `../games.ts`. Do not machine-translate them.

### Odd one out (`ui.oddOneOut`)

Odd one out reuses the Four together group names and is also English only
(GAME-018). Its category review also checks that, in the language, the odd
picture plainly sits outside every group. After that review, add the
`ui.oddOneOut` strings and the language code to `ODD_ONE_OUT_REVIEWED` in
`../games.ts`.

### Color match (`ui.colorMatch`)

Color match is English only for now (GAME-020). It has 10 strings and the names
of its five colors (`red`, `orange`, `yellow`, `green`, `blue` under
`ui.colorMatch.names`). The guidance line is also the line printed on its paper
version, so it has no placeholders. `{color|lower}` is the color name and
`{name|lower}` the picture name; a wrong tap is never called wrong, the picture
is only named with its color ("The pear is green."). The pictures in each color
are a hand-picked table (`src/data/color-match.ts`) checked against the picture
drawings. Colors are named differently across languages and cultures (some
languages have one word for blue and green), so a native speaker must confirm
that each name describes the same five colors before the language code is added
to `COLOR_MATCH_REVIEWED` in `../games.ts`. Do not machine-translate them.

### Halves match (`ui.halvesMatch`)

Halves match is English only for now (GAME-021). It has 16 strings: one guidance
line (which is also the line printed on its paper version, so it has no
placeholders), the two column labels, the spoken name of each half, the live
messages and three buttons. `{name|lower}` is the picture name. Two halves that
do not fit are never called wrong: the message only says they do not fit
together and invites another try. The spoken names of the halves
(`left`, `right`) name the picture, as every picture tile does, because that is
how a screen reader user can play at all. The pictures are a hand-picked list
(`src/data/halves-match.ts`). After a native speaker checks the strings, add the
translated `ui.halvesMatch` strings and the language code to
`HALVES_MATCH_REVIEWED` in `../games.ts`. Do not machine-translate them.

### Color by number (`ui.colorByNumber`)

Color by number is English only for now (GAME-031). It has one guidance line
(also printed on its paper version, so it has no placeholders), the grid size
labels, the four color names, six picture names, the spoken name of each cell
and the live messages. `colors` is a list of four names in the order of the
numbers 1 to 4 (Yellow, Orange, Green, Purple) and, as a list, is replaced whole.
`cell` is the accessible name of every cell: its number, its row and column, and
the name of the color it holds (or `empty`). A cell filled with a color other
than the number is never called wrong; only the picture on the sheet is named,
when every cell matches. The four fills are fixed in `src/data/color-by-number.ts`,
chosen and tested to stay apart for red-green and blue-yellow color-vision
differences; a translator must give four plain, common names that name those
four fills (Orange is a pure orange, Green a bluish green, Purple a red-blue
purple), because a person reads the name beside the number. A native speaker
should check the names, then add the translated strings and the language code to
`COLOR_BY_NUMBER_REVIEWED` in `../games.ts`. Do not machine-translate them.

### Pattern maker (`ui.patternMaker`)

Pattern maker is English only for now (GAME-034). It has one guidance line (also
printed on its paper version, and it says that nothing the person makes is saved
or sent), the tile size labels, the four color names, the labels of the tile and
of "your pattern", the spoken name of each square and the live messages. `colors`
is a list of four names in the order a tap changes a square (Yellow, Orange,
Green, Purple) and, as a list, is replaced whole. `square` is the accessible name
of every square: its row, its column and the name of the color it holds. Nothing
is called wrong; there is no right pattern. Start again and Surprise me replace the
whole tile, so a Put it back button brings the old tile back once. The four fills
are the ones Color by number uses, fixed in `src/data/pattern-maker.ts`, chosen and
tested to stay apart for red-green and blue-yellow color-vision differences; a
translator must give four plain, common names that name those four fills (Orange
is a pure orange, Green a bluish green, Purple a red-blue purple), because a
person reads the name beside the shape. A native speaker should check the names,
then add the translated strings and the language code to `PATTERN_MAKER_REVIEWED`
in `../games.ts`. Do not machine-translate them.

### Build together (`ui.buildTogether`)

Build together is English only for now (GAME-048). Two people fill one shared grid,
taking turns. It has one guidance line (also printed on its paper version, and it
says that nothing the people make is saved or sent), the grid size labels, the
names of the two people (`people`, a list of two, replaced whole), the four color
names, the line that says whose turn it is, the spoken name of each place and the
live messages. `colors` is a list of four names in the order of the palette
(Yellow, Orange, Green, Purple). `turn` always names the person in words, as in
"Your turn, first person", and `{person|lower}` puts the name in lowercase inside the
sentence; where your language does not lowercase names, write `{person}`.
`cellEmpty` and `cellFilled` are the accessible names of every place: its row, its
column and either "empty" or the color and the person who put the piece there. A
place that already has a piece is never called wrong; the message only asks for an
empty place. `inUse` is shown on the color the other person has, because two people
may not hold the same color. When the grid is full the page says it is built
together; nobody wins, and there is no count, score or timer, so keep every string
free of those ideas. The four fills are the ones Pattern maker uses, fixed in
`src/data/pattern-maker.ts`; a translator must give four plain, common names that
name those four fills (Orange is a pure orange, Green a bluish green, Purple a
red-blue purple). A native speaker should check the names, then add the translated
strings and the language code to `BUILD_TOGETHER_REVIEWED` in `../games.ts`. Do
not machine-translate them.

### Seated toss tally (`ui.seatedToss`)

Seated toss tally is English only for now (GAME-049). Two people sit at a table and
toss a soft bag onto a printed target; the tally is ticked on paper, so the page
counts nothing. `guidance` is also the line printed on the paper version, so it has
no placeholders. `safetyLine` is the one-line safety statement: it is shown at the top
of the page and printed on the sheet. `safetyHeading` is printed in front of it.
`flags` are the two labels the activity cards use for small parts and for mouths
(`SAFETY_FLAG_LABELS` in `../../lib/activities.ts`), and a test checks that they are
the same words, so change them there and here together. `safety` and `steps` are lists
and, as lists, are replaced whole. The page also shows the site's pause line from
`../../lib/scope.ts` after the safety lines. `rings` names the three rings from the outside in
(Near, Middle, Far) and is written on the target, so the printed sheet does not rely
on color. `people` names the two columns of the tally, and `ringHeading` heads the
first column. `previewLabel` describes the small picture of the sheet for a screen reader.
Keep every string free of score, timer, winner and miss ideas. Nobody is asked to recall
or name anything. The safety wording needs a native speaker and a safety reviewer to
check it, then add the translated strings and the language code to
`SEATED_TOSS_REVIEWED` in `../games.ts`. Do not machine-translate them.

### Decorate a card together (`ui.decorateACard`)

Decorate a card together is English only for now (GAME-035). Two people decorate a
printed card that folds in half. `guidance` is also the line printed on the paper
version, so it has no placeholders. `occasions` holds one `label` (the radio button) and
one `words` (the front of the card) for each occasion in `../../data/decorate-a-card.ts`.
`steps` is keyed by the names in `STEP_KEYS` there, and a test checks every key. `sheetRules`
are the three rules for two people, printed at the bottom of the sheet and shown on the
page. `previewLabel` describes the card for a screen reader and takes `{words}`. Nothing
here may mention score, timer, winner, ranking or a religious or health occasion. The
occasion names need a native speaker's check, then add the translated strings and the
language code to `DECORATE_A_CARD_REVIEWED` in `../games.ts`. Do not machine-translate them.

### Find together (`ui.findTogether`)

Find together is English only for now (GAME-047). Two people share one screen and take
turns turning over two cards to find a pair. It has the guidance line, the card counts,
the two ways to play, the names of the two people (`people`, a list of two, replaced
whole), the turn and tally lines, the spoken name of each card (`cardNamed` and
`cardFaceDown`) and the live messages. Keep every string free of score, timer, miss and
winner ideas: the tally only counts pairs found together. A native speaker should check
the strings, then add the translated strings and the language code to
`FIND_TOGETHER_REVIEWED` in `../games.ts`. Do not machine-translate them.

### Drawing duet (`ui.drawingDuet`)

Drawing duet is English only for now (GAME-032). Two people draw lines on one
shared canvas, taking turns, each with a color of their own. Its guidance line
says that nothing is sent anywhere. `paperRules` is the rules text printed on the
paper version; `people` and `colors` are replaced whole, as in Build together.
`turn` and `penColor` name the person and the color in words, and `canvasLabel`
and `canvasLabelOne` describe the drawing neutrally for screen readers (never a
word that ranks it). `penDown` and `penUp` are announced for the keyboard pen.
Keep every string free of scores, timers, winners and comparisons. Add the
translated strings and the language code to `DRAWING_DUET_REVIEWED` in `../games.ts`
only after a native speaker has checked them. Do not machine-translate them.

### Seasonal puzzle pack (`ui.seasonalPack`)

Seasonal puzzle pack is English only for now (GAME-040). A person chooses a season and
prints one page of three small paper puzzles drawn from the shared pictures: Match the
pairs, Which one is different?, and Color it in. The screen never shows or checks an answer.
`seasons` names the four seasons, and the months under each come from the season pages
(`../../data/seasons.ts`), so both halves of the world are covered there, not here. `restDay`
and `restLine` are the rest-day choice and its one calm line; keep them free of guilt,
streak or reminder ideas. `puzzles` holds a `title`, a `how` (printed) and a `describe` (for
a screen reader) for each puzzle. `printFooter` is printed at the bottom of the sheet. Do not
name festivals or foods tied to one culture. A native speaker should check the strings, then
add the translated strings and the language code to `SEASONAL_PACK_REVIEWED` in `../games.ts`.
Do not machine-translate them.

### Story chain (`ui.storyChain`)

Story chain is English only for now (GAME-046). It has 12 strings: one guidance
line (which is also the line printed on its paper version), a note that
anyone may pass, button labels and short live messages. Nothing is typed or
recorded and nothing is counted. After a native speaker checks them, add the
translated `ui.storyChain` strings and the language code to
`STORY_CHAIN_REVIEWED` in `../games.ts`. Do not machine-translate them.
### Story dice (`ui.storyDice`)

Story dice is English only (GAME-025). It needs no picture names to play, but
its guidance, button and message text have not been reviewed in other
languages. After a native speaker reviews the `ui.storyDice` strings, add them
here and add the language code to `STORY_DICE_REVIEWED` in `../games.ts`.

## Right-to-left languages

`ar` pages get `<html dir="rtl">`. The games use logical CSS properties, so
the layout mirrors; the picture puzzle stays left to right on purpose. Write
Arabic text normally; do not add direction marks unless a mixed-direction
string displays wrongly.
