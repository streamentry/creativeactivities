import { GAME_PRINT } from './game-print';
import { PACKS } from './packs';
import { PATHS } from './paths';
import { latestDate } from '../lib/version-date';

/**
 * WEB-065: the navigation for `/printables/`. It links to printables that exist
 * elsewhere on the site; it does not copy their content. Each item shows the
 * version date its printable prints, where one exists.
 */
export interface PrintableItem {
  /** Site address with a trailing slash, such as `/paths/quiet-weeks-at-the-table/`. */
  readonly href: string;
  readonly label: string;
  /** One plain sentence on what the printable is. */
  readonly note: string;
  /** `YYYY-MM-DD`, when the printable prints a version date. */
  readonly version?: string;
}

export interface PrintableGroup {
  readonly id: string;
  readonly title: string;
  readonly items: readonly PrintableItem[];
}

export interface PrintableInput {
  /** Listed activity cards (withdrawn cards are not printed). */
  readonly cardCount: number;
  /** Each listed card's last change, by card id. */
  readonly cardUpdated: ReadonlyMap<string, string>;
}

/** A pack's version is the newest change among its cards, as its page prints it. */
export function packVersion(activityIds: readonly string[], cardUpdated: ReadonlyMap<string, string>): string | undefined {
  return latestDate(activityIds.map((id) => cardUpdated.get(id)));
}

/** Games with a paper version, from the same data the game pages read. */
export function paperGameCount(): number {
  return Object.values(GAME_PRINT).filter((print) => print.kind !== 'none').length;
}

export function printableGroups(input: PrintableInput): PrintableGroup[] {
  const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);
  return [
    {
      id: 'activity-cards',
      title: 'Activity cards',
      items: [
        {
          href: '/activity/',
          label: 'Activity cards to print',
          note: `${input.cardCount} ${plural(input.cardCount, 'card', 'cards')}, one sheet each, with an easier version and a large-print copy of each card.`,
        },
      ],
    },
    {
      id: 'games',
      title: 'Games to print',
      items: [
        {
          href: '/games/',
          label: 'Game sheets',
          note: `${paperGameCount()} games have a paper version. Each sheet shows its rules and its version date on the page.`,
        },
      ],
    },
    {
      id: 'plans',
      title: 'Plans and programs',
      items: [
        ...PACKS.map((pack) => ({
          href: `/activity/packs/${pack.id}/`,
          label: pack.title,
          note: 'A ready-made pack: one card per sheet, with a supply checklist.',
          version: packVersion(pack.activities, input.cardUpdated),
        })),
        {
          href: '/activity/weekly-program/',
          label: 'Weekly activity program',
          note: 'One sheet for a week, with a group version and a one-to-one version of each activity.',
        },
        ...PATHS.map((path) => ({
          href: `/paths/${path.id}/`,
          label: path.title,
          note: 'Four weeks of activities, with a place to start and a skip for any week.',
          version: path.updated,
        })),
        {
          href: '/activity/pack/',
          label: 'Build your own pack',
          note: 'Choose up to eight cards and print them as one pack with a supply list.',
        },
      ],
    },
    {
      id: 'groups',
      title: 'For groups and handouts',
      items: [
        {
          href: '/handout/',
          label: 'Games handout',
          note: 'A one-page handout about free picture games, for a support group or a care packet.',
        },
        {
          href: '/pictures/',
          label: 'Pictures to print',
          note: 'Single drawings to look at together or print for the table.',
        },
        {
          href: '/printables/what-i-have-checklist/',
          label: 'What I have checklist',
          note: 'One sheet of tick boxes for everyday items at home, to find activities you can start now.',
        },
        {
          href: '/for-organizations/library-programming/',
          label: 'Library programming sheet',
          note: 'One sheet for a 30-minute drop-in session at a library, with a materials checklist from three cards.',
        },
        {
          href: '/for-organizations/activity-director/',
          label: 'Activity director summary',
          note: 'One sheet for activity directors: what the site offers, the weekly program and the session plans.',
        },
        {
          href: '/for-organizations/facilitator-note/',
          label: 'Facilitator note',
          note: 'One sheet to read to the group at the start: what to expect, and that anyone may watch or stop.',
        },
        {
          href: '/printables/blank-activity-card/',
          label: 'Blank activity card',
          note: 'A two-sided card to write your own activity, with the same headings as the cards on this site.',
        },
        {
          href: '/printables/keepsake-card/',
          label: 'Keepsake card',
          note: 'A thank-you card to write after an activity together, with a space for a drawing or a signature.',
        },
        {
          href: '/printables/family-note/',
          label: 'Family note',
          note: 'A short note for another family member or a visiting helper: what was enjoyed today and what to try next time.',
        },
      ],
    },
  ];
}
