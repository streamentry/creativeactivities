/** Site-wide facts. Change them here, never inline in pages. */
export const SITE = {
  url: 'https://creativeactivities.org',
  domain: 'creativeactivities.org',
  name: 'Creative Activities',
  titleSuffix: ' | Creative Activities',
  homeTitle: 'Dementia Activities to Do Together | Creative Activities',
  description:
    'Free creative activities and gentle picture games for older adults and people living with dementia. Start in a minute, adapt as you go, print a card.',
  locale: 'en_US',
  /** Live US listing, read back from App Store Connect on 2026-10-21. */
  appStoreUrl: 'https://apps.apple.com/us/app/dementia-games-golden-moments/id6749312459',
  /** Production listing for the Android package com.mindfulness.golden_moments. */
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.mindfulness.golden_moments',
  /** Public contact for the website, chosen by the maintainer on 2026-10-25. */
  supportEmail: 'web@creativeactivities.org',
  /** Google Analytics 4 web stream, added by the maintainer on 2026-10-25. */
  gtmContainerId: 'GTM-5ZSV72WC',
  /** Last sitewide change (the move to creativeactivities.org); pages with their own date use it instead. */
  updated: '2026-11-14',
} as const;

export interface NavItem {
  href: string;
  /** Key in the `common.nav` dictionary. */
  /** English-only pages keep their English path in every language. */
  englishOnly?: boolean;
  key: 'home' | 'find' | 'crafts' | 'kids' | 'together' | 'creativeCalm' | 'games';
}

export const NAV: readonly NavItem[] = [
  // A word, not only the logo, leads home (Alzheimer's Society checklist 2.3).
  { href: '/', key: 'home' },
  // The primary path (DESIGN.md › Information architecture).
  { href: '/activity/', key: 'find', englishOnly: true },
  // The page groups of the mission (MISSION.md, 2026-11-15): crafts, children, generations, calm.
  { href: '/crafts/', key: 'crafts' },
  { href: '/kids/', key: 'kids' },
  { href: '/together/', key: 'together' },
  { href: '/creative-calm/', key: 'creativeCalm' },
  { href: '/games/', key: 'games' },
];

export const SECTION_META = {
  activities: {
    label: 'Activity guides',
    href: '/activities/',
    title: 'Activity Guides',
  },
  crafts: {
    label: 'Crafts',
    href: '/crafts/',
    title: 'Crafts for All Ages',
  },
  kids: {
    label: 'Kids',
    href: '/kids/',
    title: 'Creative Activities for Kids',
  },
  together: {
    label: 'Together',
    href: '/together/',
    title: 'Activities to Do Together',
  },
  'creative-calm': {
    label: 'Creative calm',
    href: '/creative-calm/',
    title: 'Creative Calm',
  },
  caregiving: {
    label: 'Dementia care',
    href: '/caregiving/',
    title: 'Caring for Someone with Dementia',
  },
  'brain-health': {
    label: 'Brain health',
    href: '/brain-health/',
    title: 'Brain Health: What the Research Says',
  },
} as const;

export type SectionKey = keyof typeof SECTION_META;

export function absoluteUrl(path: string): string {
  return new URL(path, SITE.url).toString();
}
