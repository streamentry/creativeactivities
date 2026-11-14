# Games catalog (GAME-)

This file lists every game the website and app should offer, with the mechanic, who it suits, how people play it together, whether it has a printed twin, and what it needs before launch. It starts from the 12 browser games that exist today and the app's matching and puzzle games, then adds 46 new games (two of them app experiments) drawn from the concept list in the games research and from our own judgment. Games here are for enjoyment, conversation and doing something together. None is a treatment, a test or a brain exercise.

**Read with:** [app features](04-features-app.md) · [website features](03-features-web.md) · [content library](06-content-library.md) · [pillar: older adults and dementia](09-pillar-older-adults-dementia.md) · [pillar: parenting and kids](08-pillar-parenting-kids.md) · [research R4 (games and engagement)](research/04-games-engagement.md) · [product contract](../product.md)

## How to read the tables

- **Status**: `exists` means it is live in the website games list ([games.ts](../../../site/src/i18n/games.ts)) or in the app baseline. `partial` means it exists with a known gap. `new` means it needs building.
- **Offline**: "yes" means the game works without a network after first load. For web games this is a target that has not been verified in this pass. For app games it is part of the app's offline catalog. "Print" means a printed twin exists or is specified.
- **Languages**: what must be true before the game is offered in another language. Games with word or saying content are gated per language, as `games.ts` already does for word search and sayings.
- **Priority and phase** follow the [global conventions](README.md#priority-and-phase-use-both-on-every-item). Kids games are `S3` because [VISION](../../../VISION.md) earns expansion to child audiences through evidence.

## Catalog

### Picture and memory-free matching

Recognition, not recall. Pictures stay visible unless the person chooses otherwise.

| ID | Game | Mechanic | Who it suits | Co-play | Print | Offline | Languages | Priority | Phase | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| GAME-001 | Picture pairs | Tap two matching pictures; matches stay marked; 4 to 12 tiles | Adults, all stages | Side by side | No | Yes | Labels per language | P0 | S2 | exists |
| GAME-002 | Find the same | One picture at the top, match one of 2 to 4 below | Middle and later stages | Side by side | No | Yes | Labels | P0 | S2 | exists |
| GAME-003 | Shadow match | Match a shadow to its picture | Early and middle stages | Side by side | No | Yes | Labels | P1 | S2 | exists |
| GAME-013 | Visible picture matching (app) | Native version of GAME-001 with 4 to 12 tiles, offline | Adults, all stages | Solo or side by side | Yes (app) | Yes | App text per language | P0 | S2 | exists |
| GAME-014 | Hidden picture matching (app) | Face-down classic version, opt-in only, from the pack route | Adults who want the challenge | Solo or side by side | No | Yes | App text | P2 | S2 | exists. Recall needed, so never the default |
| GAME-018 | Odd one out | Tap the picture that does not belong in a set of 3 or 4 | Early and middle stages; children 4+ | Side by side | Yes | Yes | Labels; category review | P1 | S2 | new |
| GAME-020 | Color match | Match pictures by color: a red apple and a red cup | Early stages; children 3+; low vision with high contrast | Side by side | Yes | Yes | None | P2 | S2 | new |
| GAME-021 | Halves match | Tap the two halves of one picture that fit together | Early stages; children 3+ | Side by side | Yes | Yes | None | P2 | S2 | new |

### Words and language

| ID | Game | Mechanic | Who it suits | Co-play | Print | Offline | Languages | Priority | Phase | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| GAME-006 | Finish the saying | Complete a familiar saying from three choices, then talk | Early and middle stages; adults; groups | 1, 2 or group | No | Yes | Sayings reviewed per language; unavailable where none exist | P1 | S2 | exists |
| GAME-007 | Large-print word search | Few words, across or down, big grid; print a fresh puzzle | Early stage; adults | 1 or 2 | Yes | Yes | Word lists reviewed per language ([gating](../../../site/src/i18n/games.ts)) | P1 | S2 | exists |
| GAME-022 | Four together | Group four pictures by theme; no timer, no pass or fail | Adults, including people with reading difficulty | Side by side or group | Yes | Yes | Category words per language; name needs a trademark check | P1 | S2 | new |
| GAME-023 | Word and picture pairs | Match a written label to its picture; label can be read aloud | Adults learning or relearning a language; children 6+ | Side by side | Yes | Yes | Labels per language, reviewed | P2 | S3 | new |
| GAME-024 | Rhyme pictures | Match pictures that rhyme | Children 4 to 7 and early readers | Adult and child | Yes | Yes | Rhyme sets written per language, not translated | P3 | S3 | new |
| GAME-025 | Story dice | Roll picture dice; tell the story aloud; no right answer | Mixed reading levels; families; groups | Group, or adult and child | Yes | Yes | None (pictures) | P1 | S2 | new |

### Music and rhythm

| ID | Game | Mechanic | Who it suits | Co-play | Print | Offline | Languages | Priority | Phase | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| GAME-026 | Sound loop maker | Tap a grid to layer short sounds into a loop | Children; music lovers; all ages | Side by side | No | Yes | None | P2 | S2 | new |
| GAME-027 | Keep the beat | Tap along with a visible pulse; no score; one-switch friendly | Adults; children; people with limited motor control | Solo or group | No | Yes | None | P2 | S2 | new |
| GAME-028 | Music choices | Pick a familiar decade or style and tap to play; no quiz | Adults who enjoy music; families | Side by side | No | Yes | Licensed or public-domain audio per market | P2 | S3 | new |
| GAME-029 | Singing sheets | Large-type lyric sheets, chorus first | Group and one-to-one singing | Group | Yes | Yes | Public-domain or licensed lyrics per language | P1 | S2 | new |
| GAME-030 | Draw a sound | Draw a line; it becomes a sound | Musicians; children | Solo or side by side | No | Yes | None | P3 | S3 | new |

### Drawing, coloring and making

| ID | Game | Mechanic | Who it suits | Co-play | Print | Offline | Languages | Priority | Phase | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| GAME-008 | Coloring | Tap a color, then a part of the picture; print pages | All stages | Solo or side by side | Yes | Yes | None | P0 | S2 | exists |
| GAME-031 | Paint-by-number lite | Large, calm fill with an adjustable grid | Seated adults with fine-motor limits; bedside | Solo or side by side | Yes | Yes | None | P1 | S2 | new |
| GAME-032 | Two-hand drawing duet | Two people draw on one canvas in turns, with a color choice each | Grandparents and children; partners | Side by side | Yes (paper duet) | Yes | None | P1 | S2 | new |
| GAME-033 | Collage board | Place cut-outs on a shared board in turns | Couples, siblings, carers | Side by side | Yes | Yes | None | P2 | S2 | new |
| GAME-034 | Pattern maker | Tile-based drawing that exports to a print sheet | All ages | Solo or side by side | Yes | Yes | None | P2 | S2 | new |
| GAME-035 | Co-decorate a card | Two people decorate a printed card for an occasion | Intergenerational families; care settings | Side by side | Yes (print first) | Yes | None | P2 | S2 | new |
| GAME-036 | Stop-motion frame maker | Photograph paper cut-outs; play back a short clip, saved on the device | Families; classrooms | Side by side | No | Yes | None | P3 | S3 | new |
| GAME-037 | Scrapbook builder | Add photos and captions to a book the person pages through | Carers and families | Side by side | Yes | Yes | Captions written by the family | P2 | S2 | new |

### Calm and breathing

Described as relaxing or calm. Never as therapy, treatment or a health outcome ([claims rules](#claims-policy)).

| ID | Game | Mechanic | Who it suits | Co-play | Print | Offline | Languages | Priority | Phase | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| GAME-012 | Calm breathing | A slow circle to breathe along with; start and stop any time | All stages | Solo or side by side | No | Yes | None | P1 | S2 | exists. Re-check copy against claims rules |
| GAME-038 | Color wash | A soft brush paints across a page; there is no end point | Anyone; bedside use | Solo or side by side | No | Yes | None | P2 | S2 | new |
| GAME-039 | Quiet scene | A slow, still picture; soft sound is off by default; press to stop | Anyone; bedside; a group in the same room | Solo or group | No | Yes | None | P3 | S2 | new |

### Nature and seasons

| ID | Game | Mechanic | Who it suits | Co-play | Print | Offline | Languages | Priority | Phase | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| GAME-040 | Seasonal puzzle pack | A monthly theme (harvest, winter) of three small activities, with a rest-day option | All ages | Solo or side by side | Yes | Yes | Seasons and foods per hemisphere and culture | P1 | S2 | new |
| GAME-041 | Garden planner | Choose plants from pictures and lay out a plot | Adults who enjoyed gardening; seated use | Solo or side by side | Yes | Yes | Plant pictures per climate | P2 | S2 | new |
| GAME-042 | Garden bird spotter | Tick the pictured birds seen from a window; no timer | Anyone; bedside; care homes | Solo or group | Yes | Yes | Bird names per language and region | P2 | S2 | new |
| GAME-043 | Picnic planner | Pick food and activity pictures for an outing, then play a matching round | Care planning in a playful way; families | Side by side | Yes | Yes | Food pictures per culture | P2 | S2 | new |

### Reminiscence and conversation

Conversation is the goal. Nobody is quizzed, and no answer is wrong.

| ID | Game | Mechanic | Who it suits | Co-play | Print | Offline | Languages | Priority | Phase | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| GAME-009 | Conversation cards | Picture cards with open, gentle questions | All stages; families; groups | 2 people or group | Yes | Yes | Questions per language, reviewed | P0 | S2 | exists |
| GAME-010 | Photo pairs | Match the person's own photos; nothing uploaded | Families; middle and later stages | Side by side | No | Yes | Interface text | P0 | S2 | exists |
| GAME-044 | Reminiscence card match | Match family-photo cards; a gentle hint after a pause, never a miss count | Anyone at any stage; carers | Side by side | Yes | Yes | Interface text | P1 | S2 | new. Extends GAME-010 |
| GAME-045 | Photo timeline | Family photos placed on a year line with captions; consent needed | Families; carers; classrooms, with consent | Side by side | Yes | Yes | Captions written by the family | P3 | S3 | new |
| GAME-046 | Story chain | Each person adds a sentence or a picture in turn | Mixed-age pairs; groups | Side by side or group | Yes | Yes | None | P1 | S2 | new |

### Co-op and two-player

Shared control of one screen or one sheet. Turn markers, no timer, no winner.

| ID | Game | Mechanic | Who it suits | Co-play | Print | Offline | Languages | Priority | Phase | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| GAME-047 | Find together | Pairs found by two people working together; one shared tally, never shown as misses | Couples; carers and a child; babysitters and a child | Side by side, shared control | No | Yes | None | P2 | S2 | new |
| GAME-048 | Build-it-together grid | Two people build one pattern from alternating pieces | Siblings; carers and a child | Side by side | Yes | Yes | None | P2 | S2 | new |
| GAME-049 | Seated toss tally | Bean-bag toss into a large target; tally kept on paper | Limited mobility; two people at a table | Side by side | Yes (print first) | Yes | None | P2 | S2 | new. Safety line for small parts and supervision |

### Group, care home and classroom

Screen-cast or printed. The host sets the pace, not a timer.

| ID | Game | Mechanic | Who it suits | Co-play | Print | Offline | Languages | Priority | Phase | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| GAME-011 | Picture bingo | Printable bingo cards; a big-screen caller for the room | Groups of 2 to 30; care homes; classrooms | Group | Yes | Yes (cards) | Caller labels per language | P0 | S2 | exists |
| GAME-050 | Picture passing circle | A picture passes round the circle; each person says a word or a sentence | Groups; care homes; classrooms | Group | Yes (cards) | Yes | Prompts per language | P1 | S2 | new |
| GAME-051 | Big-screen picture talk | Large pictures with prompts on a TV or tablet; manual advance; no autoplay | Groups; families in the same room | Group, with a screen | Yes (prompt cards) | Yes | Prompts per language | P1 | S2 | new. Casting needs APP-008 approval |
| GAME-052 | Group coloring wall | One large printed sheet colored by many hands in sections | Classrooms; care homes; families | Group | Yes | Yes | None | P2 | S2 | new |

### Kids, early years

Children are a later audience ([VISION](../../../VISION.md), Stage 3). Each game has a grown-up present, collects no child data and has no child account ([R5 §5.1]).

| ID | Game | Mechanic | Who it suits | Co-play | Print | Offline | Languages | Priority | Phase | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| GAME-053 | Sticker scene builder | Tap or drag stickers onto a scene; no scoring | Children 2 to 6 with a grown-up | Side by side | Yes | Yes | None | P2 | S3 | new |
| GAME-054 | Big shapes and colors | Sort one large object at a time into two bins; toddler mode of GAME-004 | Children 2 to 5 | Side by side | Yes | Yes | None | P2 | S3 | new |
| GAME-055 | Lift-the-flap find | Find the picture behind a flap; no wrong answers | Children 2 to 5 | Side by side | Yes (print first) | Yes | None | P2 | S3 | new |
| GAME-056 | Weather and mood chart | Fill a month grid by weather or mood; no judgment | Early learners; parents | Solo or side by side | Yes | Yes | Labels per language | P2 | S3 | new |
| GAME-057 | Feed the animal | Match food pictures to the right animal | Children 3 to 6 | Side by side | Yes | Yes | None | P3 | S3 | new |

### Puzzles, jigsaws and sorting

| ID | Game | Mechanic | Who it suits | Co-play | Print | Offline | Languages | Priority | Phase | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| GAME-004 | Sort together | Tap a picture, then the basket it belongs in | Early and middle stages; adults; children 3+ | 1 or 2 people | No | Yes | Category review per language | P1 | S2 | exists |
| GAME-005 | Picture puzzle (web) | Four or nine large pieces; tap two to swap | Early and middle stages | 1 or 2 people | No | Yes | None | P1 | S2 | exists |
| GAME-015 | Picture puzzle (app) | Native jigsaw from a bundled pack | Adults | Solo or side by side | No | Yes | App text | P1 | S2 | partial. Input method to verify on device; the legacy timed mode must be removed |
| GAME-016 | Tap-to-place puzzle (app) | Two or four pieces; tap a piece, then its place; optional reference | Adults who like puzzles; limited motor control | Solo or side by side | No | Yes | App text | P2 | S2 | new. Experiment, GM-009 |
| GAME-017 | Picture sorting (app) | Tap a picture, then a group; undo | Adults; children | Solo or side by side | Yes | Yes | App text | P2 | S2 | new. Experiment, GM-010 |
| GAME-019 | Large-target sort | Two large bins; big targets; high-contrast option; no timer | Low vision, tremor, limited reach | Side by side | Yes | Yes | None | P1 | S2 | new. From R4 §8 #18 |
| GAME-058 | Jigsaw from your photo | Make a jigsaw from a photo on the device; never uploaded | Families; anyone | Solo or side by side | Yes (print pieces) | Yes | None | P2 | S2 | new |
| GAME-059 | Spot the difference | Two near-identical pictures; 3 to 5 differences; a hint after a pause | Adults; children 5+ | Side by side | Yes | Yes | None | P1 | S2 | new. Needs commissioned art |
| GAME-060 | Quiet shapes puzzle | Tangram-style shapes with a picture hint; no timer | Adults who like geometry | Solo | Yes | Yes | None | P3 | S2 | new |

### Daily shared card

| ID | Game | Mechanic | Who it suits | Co-play | Print | Offline | Languages | Priority | Phase | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| GAME-061 | Daily shared card | One picture puzzle each day, the same for everyone; archive kept; no missed-day penalty; spoiler-free result | Adults; families | Solo or family | Yes (print calendar) | Yes after first load | Card text per language | P1 | S2 | new |

## Totals

61 games in total: 14 `exists` (12 website games and 2 app games), 1 `partial` (GAME-015), and 46 `new` (including the two app experiments GAME-016 and GAME-017). Groups: matching 8, words 6, music 5, drawing 8, calm 3, nature 4, reminiscence 5, co-op 3, group 4, kids 5, puzzles 9, daily 1.

## Game design rules

These rules apply to every game in this file. A game that breaks one is not launched until it is fixed.

1. **No timers by default.** No countdown, no clock on screen. A host may set the pace of a group game. Any elapsed-time display is off, and any offered timer is the person's choice.
2. **No scores, lives or failure.** A mismatch names what was tapped and waits, as the current games do. No buzzer, red cross, shake or "try again". Shared tallies in co-op games are never shown as misses ([R4 §3 #4]).
3. **Adjustable difficulty with few knobs.** Only piece count, tile count, grid size and hint delay change difficulty. The game never raises difficulty on its own ([product](../product.md), "no automatic difficulty escalation").
4. **Hints after a pause, not after a miss.** A hint appears after a pause, and the person can ignore it.
5. **Visible exit on every screen.** One tap leaves the game from anywhere. Leaving never asks for confirmation.
6. **A rest button saves place.** Every game can pause to a calm screen that keeps the board and resumes on return ([R4 §8 #22]).
7. **Collections, not streaks.** Counts only go up, never reset, and never show a missed day. The daily card keeps an archive, so missing a day costs nothing ([R4 §3 #1, #3]).
8. **No ads, interstitials or paywalls inside games.** Every game in this file is free, consistent with the free core ([MISSION](../../../MISSION.md), free core value).
9. **No account to play.** Progress lives on the device. Sharing a result is an explicit action.
10. **Offline after first load.** Web games are a target until verified. Printed twins exist wherever a game is marked "Print: yes" ([R4 §3 #5]).
11. **Accessibility is the acceptance test.** Each game passes the basic list of the Game Accessibility Guidelines before launch, and the basics are an acceptance checklist, not a score ([R4 §3 #8]). Also meet XAG 108 (difficulty options) and 109 (clear objectives: what is left and what is done) ([R4 §5]), WCAG 2.2 AA, 48-unit targets, reduced motion, no color-only cues, and text for every sound. Audio is optional and off by default.
12. **Adult look for adult audiences.** Simple mechanics still use adult design, since reviews call "toddler-like" content a failure ([R4 §4]).
13. **Co-play with shared control.** One screen or one sheet, turn markers, no winners and no leaderboards ([R4 §5], co-play).
14. **No forced recall or naming.** No name quizzes, no "who is this?" questions and no required spoken answer ([product](../product.md), "no forced naming of relatives"; [GM-008](../senior-first/activities.md)).
15. **Culture and holidays are not assumed.** Pictures, sayings, seasons, foods and birds are reviewed per market, and a game is left out of a language where its content cannot be made fair ([MISSION](../../../MISSION.md), cultural openness).
16. **Rights.** No copyrighted lyrics, logos or trademarked game names. Audio is original, licensed or public domain. Original art is preferred ([VISION](../../../VISION.md), original media).
17. **Safety.** Any printed game with small parts, bean bags or scissors states its supervision need and a safety line ([R2 §7]).
18. **Privacy.** No game collects identity or health data. Family photos stay in the browser or on the device. No analytics beyond what is approved in [metrics](17-metrics-and-evidence.md). No child-facing data collection ([R5 §5.1]).
19. **Finishing is always a good ending.** A finish screen says what was done, never what was missed.

### Claims policy

- **Never say**: "improves memory", "keeps the brain sharp", "slows or prevents dementia", "reduces agitation", "trains the brain", "therapy", "treatment" or "healing", or any outcome.
- **Say instead**: "a calm, enjoyable activity", "a picture game to talk about", "a way to spend time together", "you can stop at any moment".
- **Why**: the FTC's 2016 settlement with Lumosity challenged claims that its games delayed age-related cognitive decline and protected against mild cognitive impairment. The settlement required competent and reliable scientific evidence for health claims ([R4 §5]). Research on brain-training transfer is mixed ([R4 §5], Simons et al. 2016). Activities are not therapy ([R3](research/03-art-therapy-wellbeing.md)).
- **Names**: avoid "memory" in game names and copy. Use "matching", "pairs" or "find together" instead.

## Top 10 new games: short specs

Each is `new`, sits in the first two phases, and is the next to build after the existing list is verified.

### GAME-044 · Reminiscence card match (P1, S2)

- **Why:** the R4 top-five list asks for family-photo matching with a gentle hint and no miss count ([R4 §8 #14]). It extends GAME-010 without adding a new data flow.
- **What:** two to six pairs of the person's own photos, face up. A hint highlights a pair after a pause. No miss count. Captions are optional and written by the family.
- **Acceptance:** photos never leave the device; the hint never fires on a tap; the board works with one switch; reduced motion removes the hint animation.
- **Depends on:** GAME-010, APP-018, APP-034 (app version), GM-018 and GM-019 for the app.
- **Risks:** photos of people who cannot consent. Use only the person's own family photos, and say so.

### GAME-061 · Daily shared card (P1, S2)

- **Why:** one shared daily item captures the habit pattern without guilt ([R4 §3 #1]; [R4 §8 #7]).
- **What:** one picture puzzle a day, the same for everyone. An archive of past days stays. Result is a spoiler-free card: "Made 4 pairs with my grandson" ([R4 §3 #2]). Nothing is sent anywhere.
- **Acceptance:** a missed day shows no message; the archive opens to any past day; the same date yields the same card for every user; no account and no notification.
- **Depends on:** APP-021 for the result card; a content calendar in [content library](06-content-library.md).
- **Risks:** pressure creep. Any "daily" reminder needs APP-012 approval and stays off by default.

### GAME-032 · Two-hand drawing duet (P1, S2)

- **Why:** co-play across generations, with turns and no winner ([R4 §8 #23]; [R4 §6] on intergenerational co-play gaps).
- **What:** one canvas, two people, alternating turns, a color choice for each. Save as an image on the device. Paper version: one sheet, two pens.
- **Acceptance:** turn markers always visible; either person can end the turn; no scoring; the paper version has rules on the same card.
- **Depends on:** GAME-034 canvas tools.
- **Risks:** an unwanted "best" drawing. Never rank or compare.

### GAME-026 · Sound loop maker (P2, S2)

- **Why:** a free, offline, no-account music toy for children and music-loving adults ([R4 §8 #3]; Chrome Music Lab shows the no-install model [R4 §2]).
- **What:** a grid of 8 by 8 cells, sixteen short built-in sounds, tap to layer into a loop. Play and stop, no score.
- **Acceptance:** all sounds are original or licensed; sound is off until tapped; stop is instant; works offline after first load.
- **Depends on:** a sound license review under GM-025.
- **Risks:** harsh sounds. Keep a gentle sound set and a volume control.

### GAME-019 · Large-target sort (P1, S1)

- **Why:** tremor, low vision and limited reach are common, and adjustable targets come from the Game Accessibility Guidelines basic list ([R4 §8 #18]; [R4 §3 #8]).
- **What:** two large bins, one picture at a time. Each target is at least the 64-unit tile size used for [DESIGN](../../../DESIGN.md) tiles. A high-contrast option. No timer.
- **Acceptance:** targets never shrink; a dropped tap changes nothing; the picture can be re-chosen before placing; the bins have text and a color-independent cue.
- **Depends on:** GAME-004 mechanic, GM-013.
- **Risks:** a too-large target that crowds the screen on small phones. Test at 320 width.

### GAME-059 · Spot the difference (P1, S2)

- **Why:** a calm visual-search puzzle with no timer, for adults and older children. Added on our judgment, not from the R4 list. It is a puzzle, not a training claim (see the claims policy).
- **What:** two near-identical pictures, three to five differences. Tap the difference to mark it. A hint appears after a pause, showing a region, not the answer.
- **Acceptance:** each difference has a text label for screen readers; no timer; hints never reveal more than one region at a time.
- **Depends on:** commissioned art with alt text; content library.
- **Risks:** art cost. Start with four originals.

### GAME-025 · Story dice (P1, S1)

- **Why:** a conversation game with no literacy requirement and mixed-age play ([R4 §8 #4]).
- **What:** three or four picture dice are rolled. Players tell a story using them, in any order. No right answer; a shuffle button rerolls.
- **Acceptance:** no text is needed to play; a reroll is one tap; a print sheet of the dice exists; any player can pass.
- **Depends on:** a rights-cleared picture set.
- **Risks:** none significant; keep the picture set culturally wide.

### GAME-050 · Picture passing circle (P1, S1)

- **Why:** a group game for care homes, classrooms and clubs, with no scoring. The closest product, Tovertafel, is hardware-based, so a printed and free version fills a gap ([R4 §5], co-play).
- **What:** a card with one picture passes round the circle. Each person says a word or a sentence about it, then passes it on. A set of cards is printed or shown on a screen.
- **Acceptance:** a person may pass without any explanation; the host can stop at any moment; no one is asked to name or recall.
- **Depends on:** printed picture set; GAME-051 for the screen version.
- **Risks:** pressure to speak. Passing is always allowed.

### GAME-051 · Big-screen picture talk (P1, S2)

- **Why:** group conversation on a large screen fits the TV-casting intent, without a feed. "Watch and talk" is one of three equal modes ([R3 §3 #5]); see also [R4 §5] on group play.
- **What:** one picture at a time, a prompt under it, manual Next and Previous. No autoplay, no music by default.
- **Acceptance:** the host controls every change; the screen can be cast or shown from the web or app; large text meets the tablet layout tests.
- **Depends on:** APP-008 approval for casting; GAME-052 for printed prompts.
- **Risks:** casting is a new use case. Do not claim it until tested on the device types named.

### GAME-022 · Four together (P1, S2)

- **Why:** a grouping game with pictures and words, adult in look, with no timer. It is R4's Connections-style concept, renamed to avoid a trademark ([R4 §8 #12]).
- **What:** four pictures; find the two or three that share a theme. Hints name the theme after a pause. A "show the group" button reveals the answer without penalty.
- **Acceptance:** each group has a theme any reader would accept; no pass or fail; per-language category review passes before launch.
- **Depends on:** per-language category review (L10N items in [localization](13-localization.md)).
- **Risks:** culturally specific categories. Reject any category that needs one culture's knowledge.

## Considered and not included

- **"Who is this?" photo recall** ([R4 §8 #15]): not included. It forces naming and recall, and [product](../product.md) forbids forced naming of relatives. The research's optional mode would still create the same pressure.
- **Variants folded into existing rows**: R4 #2 (toddler sort) is in GAME-054; R4 #6 (family photos for shadow match) is in GAME-010 and GAME-044; R4 #34 (community word lists) is a per-language review item in GAME-007; R4 #38 (calm breathing, reframed) is GAME-012 with new copy.
- **Cross-cutting, not games**: rest button (rule 6), low-bandwidth delivery (rule 10, [R4 §8 #30]), large-print theme (rule 11, [R4 §8 #31]), one-switch input (APP-028, [R4 §8 #32]), spoiler-free result card (APP-021, [R4 §8 #8]).

## Open questions

- **Offline for web games.** The web games' offline behavior has not been verified in this pass. Confirm before "yes" appears in any store or site claim.
- **Licenses.** GAME-026, GAME-028 and GAME-029 need a license review for sound and lyrics in each market before launch.
- **Name check.** "Four together" is a placeholder for R4's concept. A trademark search is needed before any final name.
- **Legacy timed mode.** GAME-015 must lose its timed mismatch and hint dismissal before the "no pressure" rule covers the app ([WORKBOARD](../../../WORKBOARD.md)).
- **Casting and kiosk approvals.** GAME-051 and the care-home use of GAME-011 depend on APP-007 and APP-008.
- **Kids timing.** GAME-053 to GAME-057 wait for the child-audience gate in [VISION](../../../VISION.md). Confirm whether design work can start earlier, with no launch.
- **Art budget.** GAME-059 and any new picture sets need commissioned art and alt text. Which budget line pays for it?
