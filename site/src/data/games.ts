import type { FaqItem } from '../lib/schema';

export type GameSlug =
  | 'picture-pairs'
  | 'find-the-same'
  | 'shadow-match'
  | 'four-together'
  | 'odd-one-out'
  | 'color-match'
  | 'story-dice'
  | 'story-chain'
  | 'sort-together'
  | 'picture-puzzle'
  | 'finish-the-saying'
  | 'word-search'
  | 'coloring'
  | 'conversation-cards'
  | 'photo-pairs'
  | 'picture-bingo'
  | 'calm-breathing';

export type Stage = 'early' | 'middle' | 'late';

export interface GameInfo {
  slug: GameSlug;
  name: string;
  /** <title> without the brand suffix, <= 60 chars with suffix. */
  seoTitle: string;
  h1: string;
  description: string;
  /** One line for cards. */
  short: string;
  /** Two or three pictures shown on the card. */
  cardPictures: string[];
  stages: Stage[];
  players: string;
  /** Has a paper version; must agree with `GAME_PRINT` in `game-print.ts` (WEB-052). */
  printable: boolean;
  intro: string;
  howTo: string[];
  tips: string[];
  faq: FaqItem[];
  relatedGuides: string[];
  featured: boolean;
}

export const STAGE_LABEL: Record<Stage, string> = {
  early: 'Early stage',
  middle: 'Middle stage',
  late: 'Later stage',
};

/**
 * A suitability hint, never a promise: "Often suits early and middle stages".
 * People differ more than stages do.
 */
export function stageHint(stages: readonly Stage[]): string {
  const words = stages.map((s) => ({ early: 'early', middle: 'middle', late: 'later' })[s]);
  const list = words.length > 1 ? `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}` : words[0];
  return `Often suits ${list} stage${words.length > 1 ? 's' : ''}`;
}

const NO_PRESSURE_FAQ: FaqItem = {
  q: 'Is there a timer or a score?',
  a: 'No. There is no clock, score, move counter or losing. You can stop at any moment, and stopping halfway is a perfectly good way to finish.',
};

const FREE_FAQ: FaqItem = {
  q: 'Is it free, and do I need to sign up?',
  a: 'Yes, it is free, and there is no account, sign-up or download. It works in the web browser on a phone, tablet or computer.',
};

export const GAMES: readonly GameInfo[] = [
  {
    slug: 'picture-pairs',
    name: 'Picture pairs',
    seoTitle: 'Matching Game for Adults: Picture Pairs',
    h1: 'Picture Pairs: a Gentle Matching Game',
    description:
      'A free, gentle matching game for adults and older adults, including people living with dementia. Pictures can stay showing. No timer or score.',
    short: 'Find the two pictures that are the same. Pictures can stay showing.',
    cardPictures: ['teacup', 'sunflower', 'teacup'],
    stages: ['early', 'middle', 'late'],
    players: '1 or 2 people, side by side',
    printable: true,
    intro:
      'Tap a picture, then tap the one that matches it. Pictures stay showing by default, so nothing has to be remembered. When two pictures go together they get a gold border and a check mark.',
    howTo: [
      'Choose how many tiles to use. Four tiles is a calm place to start.',
      'Tap any picture. It gets a gold border.',
      'Tap the picture that looks the same. The pair stays together with a check mark.',
      'If the two pictures are different, nothing bad happens. Tap again whenever you are ready.',
      'Turn on "Hidden pictures" only if you both enjoy the classic face-down version.',
    ],
    tips: [
      'Name the pictures out loud together and chat about them: "A red teacup. Do you take milk in your tea?"',
      'Let the person you care for do the tapping, even if it takes a while. Point rather than tap for them.',
      'Stay with four tiles for as long as it feels good. More tiles are a choice, never a level to reach.',
      'Finish while it is still enjoyable. One game is a complete activity.',
    ],
    faq: [
      NO_PRESSURE_FAQ,
      {
        q: 'Why do the pictures stay face up?',
        a: 'Keeping pictures visible turns the game into looking and matching rather than remembering. Many people find this calmer. You can switch to hidden pictures in one tap if you prefer.',
      },
      FREE_FAQ,
      {
        q: 'Can we use our own family photos?',
        a: 'Yes. Try Photo pairs, which lets you choose photos from your device. The photos stay in your browser and are not uploaded.',
      },
    ],
    relatedGuides: ['caregiving/how-to-play-together', 'together/puzzles-and-table-games', 'activities/ideas'],
    featured: true,
  },
  {
    slug: 'find-the-same',
    name: 'Find the same',
    seoTitle: 'Find the Same Picture: Simple Picture Game',
    h1: 'Find the Same Picture',
    description:
      'One picture at the top, two to four below. Tap the one that is the same. A calm, free picture game for adults, older adults and families, with no timer.',
    short: 'Look at the picture at the top and tap the same one below.',
    cardPictures: ['apple', 'pear', 'apple'],
    stages: ['middle', 'late'],
    players: '1 or 2 people',
    printable: true,
    intro:
      'A single picture sits at the top of the screen. Below it are two, three or four pictures. Tap the one that is the same. It is one simple choice at a time, with plenty of room to talk.',
    howTo: [
      'Choose two, three or four pictures to pick from. Two is the simplest.',
      'Look at the picture at the top together.',
      'Tap the same picture below. It is marked with a check and a few warm words.',
      'If a different picture is tapped, the game simply names it and waits. Take your time.',
      'Tap "Next picture" when you are ready for another.',
    ],
    tips: [
      'Talk about each picture before choosing: colors, shapes, where you might see it.',
      'Two choices are not "too easy". The goal is a pleasant moment, not a challenge.',
      'If tapping is hard, the person can point and you can tap for them.',
    ],
    faq: [
      NO_PRESSURE_FAQ,
      {
        q: 'What happens if the wrong picture is tapped?',
        a: 'Nothing unpleasant. There is no buzzer, red cross or shaking. The game names the picture that was tapped and waits for the next tap.',
      },
      FREE_FAQ,
    ],
    relatedGuides: ['activities/late-stage', 'activities/ideas', 'caregiving/after-dementia-diagnosis'],
    featured: true,
  },
  {
    slug: 'shadow-match',
    name: 'Shadow match',
    seoTitle: 'Shadow Matching Game: Free Online for Adults',
    h1: 'Shadow Match: a Gentle Picture Game',
    description:
      'A dark shadow at the top, two to four pictures below. Tap the picture that makes the shadow. A free, calm shadow matching game with no timer.',
    short: 'Look at the shadow and tap the picture that makes it.',
    cardPictures: ['teacup', 'umbrella', 'bicycle'],
    stages: ['early', 'middle'],
    players: '1 or 2 people',
    printable: true,
    intro:
      'Shadow matching is a familiar activity from printed worksheets, here with large pictures and nothing to print. A soft shadow sits at the top of the screen and two, three or four pictures wait below. Tap the one that makes the shadow. Shapes like a bicycle, an umbrella or a teacup are easy to talk about too.',
    howTo: [
      'Choose two, three or four pictures to pick from. Two is the simplest.',
      'Look at the shadow together. What shape is it? Is it tall or round?',
      'Tap the picture that makes the shadow. Its name appears under the shadow.',
      'If a different picture is tapped, the game simply names it and waits. Take your time.',
      'Tap "Next shadow" when you are ready for another.',
    ],
    tips: [
      'Trace the outline of the shadow with a finger and talk about the shape.',
      'If shadows feel hard today, switch to Find the same, where the pictures look alike.',
      'Talk about the picture once it is found: "We had an umbrella like that."',
    ],
    faq: [
      NO_PRESSURE_FAQ,
      {
        q: 'Can people living with dementia enjoy shadow matching?',
        a: 'Many adults enjoy it, including some people living with dementia, often in the earlier stages. Shapes are easier to recognize than words. It is for enjoyment and conversation, not a test, and it does not treat or slow dementia. If it causes frustration, try Find the same or simply look at pictures together.',
      },
      {
        q: 'What happens if the wrong picture is tapped?',
        a: 'Nothing unpleasant. There is no buzzer, red cross or shaking. The game names the picture that was tapped and waits for the next tap.',
      },
      FREE_FAQ,
    ],
    relatedGuides: ['together/puzzles-and-table-games', 'activities/ideas', 'caregiving/how-to-play-together'],
    featured: false,
  },
  {
    slug: 'four-together',
    name: 'Four together',
    seoTitle: 'Picture Grouping Game for Adults: Four Together',
    h1: 'Four Together: a Calm Picture Grouping Game',
    description:
      'Some of the pictures share a theme, such as fruit or weather. Tap the ones that go together. A free, calm grouping game with no timer and no score.',
    short: 'Find the pictures that go together, like fruit or weather.',
    cardPictures: ['pear', 'cherries', 'lemon'],
    stages: ['early', 'middle'],
    players: '1 or 2 people',
    printable: true,
    intro:
      'A small set of pictures, and some of them belong together: four kinds of fruit, perhaps, or four ways to travel. Tap the ones that share a theme. If a picture goes with something else, the game simply names it and waits. After a quiet pause a hint names the theme, and "Show the group" reveals the answer at any time.',
    howTo: [
      'Choose four, six or eight pictures. Four is the simplest, with three that go together.',
      'Look at the pictures together and talk about what they have in common.',
      'Tap each picture that belongs in the group. It gets a gold border and a check mark.',
      'If a picture goes with something else, the game names it and waits. Take your time.',
      'Tap "Show the group" whenever you like, then "Another set" for new pictures.',
    ],
    tips: [
      'Say what you notice out loud: "These two are both things to eat."',
      'There is no rush. A hint naming the theme appears after a pause, and you can ignore it.',
      'Talk about the group once it is found: a favorite fruit, a train journey, the weather today.',
    ],
    faq: [
      NO_PRESSURE_FAQ,
      {
        q: 'What happens if a picture from outside the group is tapped?',
        a: 'Nothing unpleasant. There is no buzzer, red cross or shaking. The game names the picture, says it goes with something else, and waits for the next tap.',
      },
      {
        q: 'What are the groups?',
        a: 'Everyday themes that need no special knowledge: fruit, animals, flowers, weather, ways to travel, things for a hot drink and things baked in an oven. Each picture belongs to just one group.',
      },
      FREE_FAQ,
    ],
    relatedGuides: ['together/puzzles-and-table-games', 'activities/ideas', 'caregiving/how-to-play-together'],
    featured: false,
  },
  {
    slug: 'odd-one-out',
    name: 'Odd one out',
    seoTitle: 'Odd One Out Picture Game for Adults',
    h1: 'Odd One Out: a Relaxed Picture Game',
    description:
      'Three or four pictures, and all but one share a theme, such as fruit or weather. Tap the one that does not belong. Free, calm, no timer and no score.',
    short: 'Spot the picture that does not belong with the others.',
    cardPictures: ['apple', 'pear', 'bus'],
    stages: ['early', 'middle'],
    players: '1 or 2 people',
    printable: true,
    intro:
      'Three or four pictures, and all but one go together: fruit, perhaps, or ways to travel. Tap the picture that does not belong. If a picture does go with the others, the game simply says so and waits. After a quiet pause a hint names what the others share, and "Show me" points out the odd one at any time.',
    howTo: [
      'Choose three or four pictures. Three is the simplest.',
      'Look at the pictures together and talk about what most of them have in common.',
      'Tap the picture that does not belong. It gets a gold border and a check mark.',
      'If a picture goes with the others, the game says so and waits. Take your time.',
      'Tap "Show me" whenever you like, then "Another set" for new pictures.',
    ],
    tips: [
      'Talk it through out loud: "The apple and the pear are both fruit. What about the bus?"',
      'There is no rush. A hint naming the theme appears after a pause, and you can ignore it.',
      'Any picture is a good start for a chat: a favorite fruit, a bus ride, a rainy day.',
    ],
    faq: [
      NO_PRESSURE_FAQ,
      {
        q: 'What happens if a picture that belongs is tapped?',
        a: 'Nothing unpleasant. There is no buzzer, red cross or shaking. The game names the picture, says it goes with the others, and waits for the next tap.',
      },
      {
        q: 'How is the odd picture chosen?',
        a: 'The pictures come from everyday themes that need no special knowledge: fruit, animals, flowers, weather, ways to travel, things for a hot drink and things baked in an oven. Each picture belongs to just one theme, and the odd one always comes from a different theme.',
      },
      FREE_FAQ,
    ],
    relatedGuides: ['together/puzzles-and-table-games', 'activities/ideas', 'caregiving/how-to-play-together'],
    featured: false,
  },
  {
    slug: 'color-match',
    name: 'Color match',
    seoTitle: 'Color Match: a Gentle Picture Game',
    h1: 'Color Match: Find the Pictures of One Color',
    description:
      'A large color with its name, and four or six pictures. Tap every picture that is that color. No timer, no score, and another color is simply named. Free to play and print.',
    short: 'Find every picture that is the same color as the one shown.',
    cardPictures: ['apple', 'banana', 'pear'],
    stages: ['early', 'middle'],
    players: '1 or 2 people, or an adult and a child',
    printable: true,
    intro:
      'A large patch of color is shown with its name written beside it, and below it are four or six pictures. Tap every picture that is that color: a red apple and a red cup, for example. If a picture is another color, the game simply names it ("The pear is green.") and waits. "Show them" points out the pictures that match at any time, and "Another color" moves on.',
    howTo: [
      'Choose four or six pictures. Four is the simplest.',
      'Look at the color and read its name together.',
      'Tap every picture that is that color. Each one gets a thick border and a check mark.',
      'If a picture is another color, the game says what color it is and waits. Take your time.',
      'Tap "Show them" whenever you like, then "Another color" for a new color.',
    ],
    tips: [
      'Say the color out loud, then look around the room: what else is that color?',
      'Use your own words if you like. "Tomato" or "sky" is as good as "red" or "blue".',
      'Pointing works as well as tapping. Sit side by side so you can both see the screen.',
    ],
    faq: [
      NO_PRESSURE_FAQ,
      {
        q: 'What happens if a picture of another color is tapped?',
        a: 'Nothing unpleasant. There is no buzzer, red cross or shaking. The game names the picture and its color, such as "The pear is green.", and waits for the next tap.',
      },
      {
        q: 'Is color the only clue?',
        a: 'No. The color is shown as a large patch and also written as a word, and every picture is named when it is tapped. Someone who finds a color hard to see can still play by reading the name.',
      },
      {
        q: 'Is every picture really that color?',
        a: 'The pictures are chosen by hand, and only ones where the main object is plainly one color. Pictures with several colors, such as a kite or a bee, are left out.',
      },
      {
        q: 'Is there a paper version?',
        a: 'Yes. A one-page sheet has four rows. Each row names a color and shows four pictures to point to or circle.',
      },
      FREE_FAQ,
    ],
    relatedGuides: ['together/puzzles-and-table-games', 'activities/ideas', 'caregiving/how-to-play-together'],
    featured: false,
  },
  {
    slug: 'story-dice',
    name: 'Story dice',
    seoTitle: 'Story Dice: a Picture Storytelling Game',
    h1: 'Story Dice: Tell a Story with Pictures',
    description:
      'Three or four picture dice to tell a story with, in any order. No reading, no right answer, no timer and no score. Roll again, or pass. Free to play and print.',
    short: 'Roll picture dice and tell a story together, in any order.',
    cardPictures: ['lighthouse', 'umbrella', 'cat'],
    stages: ['early', 'middle', 'late'],
    players: '2 or more people, or an adult and a child',
    printable: true,
    intro:
      'Three or four pictures are shown, like dice. Together, make up a story that uses them, in any order. A story can be one sentence or a few, and it can be silly or true to life. There is no right story, and nobody has to name or remember anything. Tap "Roll again" for new pictures, and anyone may pass.',
    howTo: [
      'Choose three or four dice. Three is the simplest.',
      'Look at the pictures together. Tap one if you would like to begin with it.',
      'Take turns telling a story that uses the pictures, in any order. One sentence each is plenty.',
      'Anyone may pass. Tap "Pass" and the next person can start.',
      'Tap "Roll again" for new pictures whenever you like, or tap Rest to stop.',
    ],
    tips: [
      'Ask a question rather than waiting for an answer: "Where might the umbrella be going?"',
      'Add to what the last person said instead of correcting it. Any story works.',
      'A story can be about a real memory. A picture is a good start for one.',
    ],
    faq: [
      NO_PRESSURE_FAQ,
      {
        q: 'Do I need to read or name the pictures?',
        a: 'No. The game works with the pictures alone. Players can point, describe or simply say what the picture reminds them of. Nobody is asked to name or recall anything.',
      },
      {
        q: 'What if someone does not want to take a turn?',
        a: 'They can pass at any time with no explanation. The game just waits, and the next person can start or you can roll again.',
      },
      {
        q: 'Is there a paper version?',
        a: 'Yes. A one-page sheet has sixteen different pictures in four rows. Pick a row, or cut the pictures out and draw some from a pile.',
      },
      FREE_FAQ,
    ],
    relatedGuides: ['together/conversation-games-for-all-ages', 'activities/ideas', 'caregiving/how-to-play-together'],
    featured: false,
  },
  {
    slug: 'story-chain',
    name: 'Story chain',
    seoTitle: 'Story Chain: a Shared Picture Story Game',
    h1: 'Story Chain: Tell a Story One Picture at a Time',
    description:
      'A row of pictures grows one at a time, and each person says a sentence about it aloud. Nothing to type, no right answer. Free, calm, no timer and no score.',
    short: 'Add a picture, then say a sentence each, taking turns.',
    cardPictures: ['teapot', 'rainbow', 'sailboat'],
    stages: ['early', 'middle'],
    players: '2 or more people',
    printable: true,
    intro:
      'The game starts with one picture and grows the chain one picture at a time. Each person says one sentence about the chain so far, out loud, in turn. A sentence can be about what you see, a place it brings to mind, or something silly. Nothing is typed, recorded or kept, there is no right answer, and anyone may pass. The chain stops at eight pictures, and then you can start a new one.',
    howTo: [
      'Look at the first picture together.',
      'Take turns: each person says one sentence about the chain so far. Anyone may pass.',
      'Tap "Add a picture" to put the next picture at the end of the chain.',
      'Tap "Take the last one off" if you would rather go back a picture.',
      'When the chain has eight pictures, tap "Start a new chain" for a fresh one, or simply stop.',
    ],
    tips: [
      'Short is fine: "Someone put the kettle on." The next person carries on, or passes.',
      'Let the pictures lead. There is no story you are meant to arrive at.',
      'Stop whenever you like. Stopping halfway is a perfectly good way to finish.',
    ],
    faq: [
      NO_PRESSURE_FAQ,
      {
        q: 'Is anything typed or recorded?',
        a: 'No. The sentences are spoken aloud and are not typed, recorded or sent anywhere. The game only shows the pictures.',
      },
      {
        q: 'What if someone does not want to say anything?',
        a: 'Anyone may pass, and the next person goes on. Nobody has to name or remember a picture.',
      },
      FREE_FAQ,
    ],
    relatedGuides: ['together/puzzles-and-table-games', 'activities/ideas', 'caregiving/how-to-play-together'],
    featured: false,
  },
  {
    slug: 'sort-together',
    name: 'Sort together',
    seoTitle: 'Sorting Game: Sort Together for Adults',
    h1: 'Sort Together: a Picture Sorting Activity',
    description:
      'Tap a picture, then the basket it belongs in: kitchen or garden, fruit or animals. A calm, free sorting game for adults and families.',
    short: 'Put each picture in its basket: kitchen or garden, and more.',
    cardPictures: ['kettle', 'watering-can', 'bread'],
    stages: ['early', 'middle'],
    players: '1 or 2 people',
    printable: true,
    intro:
      'Sorting is a familiar, satisfying everyday task, like putting away groceries or pairing socks. Tap a picture, then tap the basket where it belongs. There is no rush and no wrong turn.',
    howTo: [
      'Pick a theme: kitchen and garden, fruit and animals, or home and travel.',
      'Tap a picture. It gets a gold border.',
      'Tap the basket it belongs in. The picture moves into that basket.',
      'If it belongs in the other basket, the game says so gently and waits.',
      'When every picture is sorted, look through the baskets together.',
    ],
    tips: [
      'There are often no wrong answers in real life. If someone says a watering can belongs in the kitchen, ask why. You may get a good story.',
      'Use the pictures as a prompt: "What did you grow in your garden?"',
      'Sorting real objects, like spoons and forks or buttons by color, is a great follow-up away from the screen.',
    ],
    faq: [
      NO_PRESSURE_FAQ,
      {
        q: 'Why sorting?',
        a: 'Many people enjoy sorting because it feels like useful, familiar work. It is also easy to talk about the pictures as you go.',
      },
      FREE_FAQ,
    ],
    relatedGuides: ['activities/ideas'],
    featured: false,
  },
  {
    slug: 'picture-puzzle',
    name: 'Picture puzzle',
    seoTitle: 'Easy Online Jigsaw: 4 or 9 Large Pieces',
    h1: 'Picture Puzzle: an Easy Jigsaw',
    description:
      'An easy online jigsaw for adults: 4 or 9 large pieces, the whole picture stays visible, and you tap two pieces to swap them. Free, no timer.',
    short: 'Tap two pieces to swap them until the picture is whole.',
    cardPictures: ['sailboat', 'house', 'balloon'],
    stages: ['early', 'middle'],
    players: '1 or 2 people',
    printable: true,
    intro:
      'A friendly picture is cut into four or nine large pieces and mixed up. The whole picture stays visible as a guide. Tap one piece, then another, and they swap places. No dragging is needed.',
    howTo: [
      'Choose a picture and 4 or 9 pieces. Four is a gentle start.',
      'Look at the whole picture at the top.',
      'Tap a piece, then tap the place where it should go. The two pieces swap.',
      'Pieces in the right place get a small check mark.',
      'When the picture is whole, enjoy it together, then choose another.',
    ],
    tips: [
      'Tapping two pieces to swap them is much easier than dragging for many people.',
      'Talk about the picture as it comes together: "There is the red roof."',
      'A real wooden jigsaw with 12 to 24 large pieces is a lovely table activity too.',
    ],
    faq: [
      NO_PRESSURE_FAQ,
      {
        q: 'Do I need to drag the pieces?',
        a: 'No. Tap one piece, then tap another, and they swap places. This is easier with a shaky hand or on a small screen.',
      },
      FREE_FAQ,
    ],
    relatedGuides: ['together/puzzles-and-table-games', 'activities/ideas'],
    featured: true,
  },
  {
    slug: 'finish-the-saying',
    name: 'Finish the saying',
    seoTitle: 'Finish the Saying: Familiar Sayings Game',
    h1: 'Finish the Saying',
    description:
      'Familiar American sayings with the last word missing, like "A penny saved is a penny ___". Tap a choice or show the ending, then talk about it.',
    short: 'Complete familiar sayings together, then talk about them.',
    cardPictures: ['key', 'umbrella', 'lamp'],
    stages: ['early', 'middle'],
    players: '1, 2 or a group',
    printable: false,
    intro:
      'Old sayings are often well known for a lifetime. Each card shows a familiar saying with the last word missing, three choices, and a "Show the ending" button. After the ending, a gentle question invites conversation.',
    howTo: [
      'Read the saying out loud together.',
      'Tap the word that finishes it, or tap "Show the ending".',
      'Read the whole saying again and talk about it using the prompt.',
      'Tap "Next saying" when you are ready.',
    ],
    tips: [
      'Read slowly and leave a pause before the last word. Often people say it before you finish.',
      'If someone gives a different ending, enjoy it. Some versions of sayings vary by family or region.',
      'In a group, one person reads and everyone joins in on the ending.',
    ],
    faq: [
      NO_PRESSURE_FAQ,
      {
        q: 'What if we choose a different word?',
        a: 'The game shows the usual ending and moves on to conversation. There is no score, and a different answer is fine.',
      },
      FREE_FAQ,
    ],
    relatedGuides: ['crafts/craft-group-sessions', 'together/conversation-games-for-all-ages', 'activities/reminiscence'],
    featured: true,
  },
  {
    slug: 'word-search',
    name: 'Large-print word search',
    seoTitle: 'Large Print Word Search, Free and Printable',
    h1: 'Large-Print Word Search',
    description:
      'A free large-print word search for older adults and families. Few words, big letters, words across and down only. Play online or print.',
    short: 'Big letters, a few words, across and down only. Print it too.',
    cardPictures: ['strawberry', 'cherries', 'lemon'],
    stages: ['early'],
    players: '1 or 2 people',
    printable: true,
    intro:
      'A small grid with large letters and just a handful of words, all reading across or down. Tap the first letter of a word, then its last letter. Prefer paper? Print a fresh puzzle in one tap.',
    howTo: [
      'Choose a theme and a grid size.',
      'Look at the word list. Words read across (left to right) or down (top to bottom).',
      'Tap the first letter of a word, then tap its last letter.',
      'A found word is highlighted and crossed off the list.',
      'Tap "Print this puzzle" to play on paper with a pencil or marker.',
    ],
    tips: [
      'Point to a word in the list and look for its first letter together.',
      'On paper, a highlighter is easier to hold than a pencil.',
      'Talk about the theme words. Fruit words are a natural way into memories of picking, baking or markets.',
    ],
    faq: [
      NO_PRESSURE_FAQ,
      {
        q: 'Can I print the word search?',
        a: 'Yes. Tap "Print this puzzle" to print the current grid in large type, with the word list underneath. Every new puzzle is different.',
      },
      FREE_FAQ,
    ],
    relatedGuides: ['activities/ideas', 'together/puzzles-and-table-games'],
    featured: false,
  },
  {
    slug: 'coloring',
    name: 'Coloring pages',
    seoTitle: 'Free Adult Coloring Pages, Large and Simple',
    h1: 'Coloring Pages',
    description:
      'Simple, adult coloring pages with big areas: tap a color, then tap the picture. No mess, no wrong colors, and every page can be printed for free.',
    short: 'Tap a color, then a part of the picture. Print pages too.',
    cardPictures: ['tulip', 'butterfly', 'house'],
    stages: ['early', 'middle', 'late'],
    players: '1 or 2 people',
    printable: true,
    intro:
      'Pages with large, simple shapes: a flower in a pot, a house, a teacup, a butterfly and a sailboat. Tap a color, then tap a part of the picture to fill it. There are no wrong colors.',
    howTo: [
      'Choose a page.',
      'Tap a color. Each color has its name written on it.',
      'Tap a part of the picture to fill it with that color.',
      'Change your mind any time by filling it again.',
      'Tap "Print this page" for a blank page to color with pencils or markers.',
    ],
    tips: [
      'Offer two colors to choose from rather than the whole set if choosing feels like too much.',
      'Purple trees and blue suns are welcome. This is about enjoying color, not accuracy.',
      'Printed pages work well with thick markers or crayons, which are easier to grip.',
    ],
    faq: [
      NO_PRESSURE_FAQ,
      {
        q: 'Are these pages too childish?',
        a: 'We drew calm, simple objects rather than cartoons, so the pages suit adults. Large shapes keep coloring easy without making it babyish.',
      },
      FREE_FAQ,
    ],
    relatedGuides: ['crafts/easy-crafts-for-adults', 'activities/ideas'],
    featured: true,
  },
  {
    slug: 'conversation-cards',
    name: 'Conversation cards',
    seoTitle: 'Conversation Starters: Picture Cards for Families',
    h1: 'Conversation Cards',
    description:
      'Picture cards with gentle conversation starters for families, friends and older adults, including people living with dementia. No quizzing, no right answers.',
    short: 'Picture cards with open, gentle questions. No quizzing.',
    cardPictures: ['dog', 'bread', 'car'],
    stages: ['early', 'middle', 'late'],
    players: '2 people or a group',
    printable: true,
    intro:
      'Each card pairs a familiar picture with an open invitation to talk, like "What is your favorite kind of weather?" There are no right answers and nothing to remember. Choose a theme or shuffle them all.',
    howTo: [
      'Choose a theme, or keep "All cards".',
      'Read the question out loud and look at the picture together.',
      'Listen, share your own answer, and let the talk wander.',
      'Tap "Next card" when you are ready, or stay with one card as long as you like.',
      'Tap "Print all cards" to cut out a paper set.',
    ],
    tips: [
      'Answer the question yourself too. It feels like a conversation, not an interview.',
      'Follow the story, not the facts. If details change, that is fine.',
      'If a card touches something sad, acknowledge the feeling and gently move to another card.',
    ],
    faq: [
      {
        q: 'Why are there no "Do you remember…?" questions?',
        a: 'Questions that test memory can feel like an exam and cause embarrassment. Open invitations such as "Tell me about…" let anyone join in, whatever they recall.',
      },
      {
        q: 'Can I print the cards?',
        a: 'Yes. "Print all cards" prints the full set in large type, several cards per page, ready to cut out.',
      },
      FREE_FAQ,
    ],
    relatedGuides: ['activities/reminiscence', 'caregiving/after-dementia-diagnosis'],
    featured: true,
  },
  {
    slug: 'photo-pairs',
    name: 'Photo pairs',
    seoTitle: 'Make a Matching Game from Family Photos',
    h1: 'Photo Pairs: Match Your Own Photos',
    description:
      'Turn your own family photos into a gentle matching game. Choose 2 to 6 photos on your device; they stay in your browser and are never uploaded.',
    short: 'Choose your own photos and match them. Nothing is uploaded.',
    cardPictures: ['house', 'dog', 'car'],
    stages: ['early', 'middle', 'late'],
    players: '2 people, side by side',
    printable: false,
    intro:
      'Choose two to six photos from your phone, tablet or computer, and they become a matching game with large, visible pictures. The photos are shown only inside this page. They are not uploaded, saved or shared, and they disappear when you close the page.',
    howTo: [
      'Tap "Choose photos" and pick two to six photos.',
      'Each photo appears twice. Tap one, then tap its pair.',
      'Talk about each photo as you find it.',
      'When you are done, close the page or tap "Clear photos". Nothing is kept.',
    ],
    tips: [
      'Choose clear photos of happy, familiar things: a pet, a garden, a favorite place, a wedding day.',
      'Pictures of places and objects can be easier than faces, and they avoid any pressure to name people.',
      'Leave out photos of people who have died if they might bring sudden grief, unless you know they bring comfort.',
    ],
    faq: [
      {
        q: 'Are my photos uploaded anywhere?',
        a: 'No. The page reads the photos you choose directly in your browser and shows them on your screen. They are not sent to us or to anyone else, and they are gone when you close or reload the page.',
      },
      NO_PRESSURE_FAQ,
      {
        q: 'Can I save the game for next time?',
        a: 'Not in the browser, by design, so nothing private is stored. The free Creative Activities app for iPhone and iPad can keep selected photo copies on your device.',
      },
    ],
    relatedGuides: ['activities/reminiscence', 'together/staying-connected-from-afar'],
    featured: true,
  },
  {
    slug: 'picture-bingo',
    name: 'Picture bingo',
    seoTitle: 'Printable Picture Bingo for Groups',
    h1: 'Picture Bingo for Groups',
    description:
      'Free printable picture bingo for families, senior groups and care homes. Big pictures with words, 9 or 16 squares, and a large on-screen caller.',
    short: 'Printable picture bingo cards and a big-screen caller for groups.',
    cardPictures: ['sun', 'fish', 'cake'],
    stages: ['early', 'middle'],
    players: 'A group of 2 to 30',
    printable: true,
    intro:
      'Classic bingo with pictures instead of numbers, so no one needs to read small print. Print a set of unique cards, then use the on-screen caller to show each picture large on a TV, laptop or tablet.',
    howTo: [
      'Choose 9 or 16 squares per card and how many players.',
      'Tap "Print cards". Each card is different.',
      'Open the caller on a large screen. Tap "Next picture" to show each picture with its name.',
      'Players cover the matching picture on their card with a coin, button or marker.',
      'Everyone who fills a row, or the whole card, gets a cheer. There are no losers in this version: keep playing until everyone has a line.',
    ],
    tips: [
      'Use large tokens such as checkers or bottle caps. Small buttons can be hard to pick up.',
      'Name the picture and say something about it: "A sailboat. Who has been out on a boat?"',
      'Sit people with difficulty seeing closest to the screen, and pair helpers with players who need them.',
      'Nine squares is plenty for most groups. Keep the session around 20 to 30 minutes.',
    ],
    faq: [
      {
        q: 'How do I run picture bingo in a care home?',
        a: 'Print one card per player, put the caller on the biggest screen you have, and call pictures slowly, naming each one. Play until everyone has a line, so no one is left out.',
      },
      {
        q: 'Is it free to print?',
        a: 'Yes. Print as many cards as you need, as often as you like, for personal or group use.',
      },
      {
        q: 'Can people play without reading?',
        a: 'Yes. Every square is a large picture, with its name underneath for those who like words.',
      },
    ],
    relatedGuides: ['crafts/craft-group-sessions', 'activities/ideas'],
    featured: true,
  },
  {
    slug: 'calm-breathing',
    name: 'Calm breathing',
    seoTitle: 'A Calm Breathing Pause to Share',
    h1: 'A Calm Breathing Pause',
    description:
      'A slow, quiet breathing pause to share: a gentle circle grows and shrinks for six breaths. You start it, and you can stop any time.',
    short: 'A slow circle to breathe along with. Start and stop when you like.',
    cardPictures: ['moon', 'sun', 'potted-plant'],
    stages: ['early', 'middle', 'late'],
    players: '1 or 2 people',
    printable: false,
    intro:
      'Sometimes the best activity is a quiet pause. Tap "Start", then breathe in as the circle grows and out as it shrinks. Choose a slower or faster pace. It is not a treatment, just a peaceful moment to share.',
    howTo: [
      'Sit comfortably side by side.',
      'Choose a pace: slow or gentle.',
      'Tap "Start". Breathe in while the circle grows, and out while it shrinks.',
      'It stops by itself after six breaths, or tap "Stop" whenever you like.',
    ],
    tips: [
      'Hold hands or rest a hand on the person\'s arm if that is welcome.',
      'Never insist. If they would rather watch, that is fine.',
      'If someone has breathing problems, breathe normally and simply watch the circle. Ask a doctor about any breathing concerns.',
    ],
    faq: [
      {
        q: 'Is this a medical breathing exercise?',
        a: 'No. It is a simple, optional pause for calm and company. It is not a treatment for anxiety or any condition. Talk with a doctor about health concerns.',
      },
      {
        q: 'Does the circle move without me starting it?',
        a: 'No. Nothing moves until you tap Start, and it stops after six breaths or when you tap Stop. If your device is set to reduce motion, the words change without the circle growing.',
      },
      FREE_FAQ,
    ],
    relatedGuides: ['creative-calm/calm-afternoon-activities', 'creative-calm/creative-self-care-for-caregivers'],
    featured: false,
  },
];

export const GAME_BY_SLUG: ReadonlyMap<GameSlug, GameInfo> = new Map(GAMES.map((g) => [g.slug, g]));
