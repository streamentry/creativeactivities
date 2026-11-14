import { SITE, absoluteUrl } from './site';
import { localePath } from '../i18n/locales';
import { ui } from '../i18n/ui';

type Node = Record<string, unknown>;

export interface Crumb {
  href: string;
  label: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

const ORG_ID = `${SITE.url}/#organization`;
const SITE_ID = `${SITE.url}/#website`;

/** Google resolves `@id` only within one page, so references also carry the name. */
const ORG_REF = { '@type': 'Organization', '@id': ORG_ID, name: SITE.name, url: SITE.url };

export function organization(): Node {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE.name,
    url: SITE.url,
    logo: absoluteUrl('/icons/icon-512.png'),
    email: SITE.supportEmail,
    publishingPrinciples: absoluteUrl('/editorial-policy/'),
    parentOrganization: { '@type': 'Organization', name: 'Cloudjet Solutions Pte. Ltd.' },
    sameAs: [SITE.appStoreUrl, SITE.playStoreUrl],
  };
}

/** The site as a whole; `languages` lists every language it is published in (BCP 47). */
export function website(languages: readonly string[] = []): Node {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    name: SITE.name,
    alternateName: 'Dementia Activities Games',
    url: SITE.url,
    inLanguage: languages.length > 1 ? [...languages] : 'en-US',
    publisher: ORG_REF,
  };
}

export function breadcrumbs(items: Crumb[], lang = 'en'): Node {
  const all = [{ href: localePath(lang, '/'), label: ui(lang).common.home }, ...items];
  return {
    '@type': 'BreadcrumbList',
    itemListElement: all.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      item: absoluteUrl(c.href),
    })),
  };
}

export function faqPage(items: readonly FaqItem[]): Node {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export interface ArticleInput {
  path: string;
  title: string;
  description: string;
  updated: Date;
  published?: Date;
  image: string;
  section: string;
  citations: { title: string; url: string }[];
  health: boolean;
  /** BCP 47 tag of the page language; English (US) when omitted. */
  lang?: string;
}

export function article(input: ArticleInput): Node {
  return {
    '@type': input.health ? 'MedicalWebPage' : 'Article',
    '@id': `${absoluteUrl(input.path)}#article`,
    headline: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    mainEntityOfPage: absoluteUrl(input.path),
    image: absoluteUrl(input.image),
    dateModified: input.updated.toISOString().slice(0, 10),
    datePublished: (input.published ?? input.updated).toISOString().slice(0, 10),
    inLanguage: input.lang ?? 'en-US',
    isAccessibleForFree: true,
    author: ORG_REF,
    publisher: ORG_REF,
    isPartOf: { '@id': SITE_ID },
    citation: input.citations.map((c) => ({ '@type': 'CreativeWork', name: c.title, url: c.url })),
    ...(input.health
      ? { audience: { '@type': 'Audience', audienceType: 'Caregivers and families' }, about: { '@type': 'Thing', name: input.section } }
      : { articleSection: input.section }),
  };
}

export interface GameInput {
  path: string;
  /** False for activities that are not games, such as a breathing pause. */
  isGame: boolean;
  name: string;
  description: string;
  image: string;
  /** BCP 47 tag of the page language; English (US) when omitted. */
  lang?: string;
}

export function game(input: GameInput): Node {
  return {
    '@type': input.isGame ? ['VideoGame', 'WebApplication'] : 'WebApplication',
    '@id': `${absoluteUrl(input.path)}#game`,
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    image: absoluteUrl(input.image),
    applicationCategory: input.isGame ? 'GameApplication' : 'LifestyleApplication',
    ...(input.isGame ? { genre: ['Casual', 'Puzzle'], gamePlatform: 'Web browser' } : {}),
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    inLanguage: input.lang ?? 'en-US',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: ORG_REF,
  };
}

export interface HowToInput {
  path: string;
  name: string;
  description: string;
  updated: Date;
  published: Date;
  totalMinutes: number;
  supplies: readonly string[];
  steps: readonly string[];
}

/** A hub's curated activities, in the order the page lists them. */
export function itemList(name: string, items: readonly { path: string; name: string }[]): Node {
  return {
    '@type': 'ItemList',
    name,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}

/** A startable activity: its supplies and steps exactly as the page shows them. */
export function howTo(input: HowToInput): Node {
  return {
    '@type': 'HowTo',
    '@id': `${absoluteUrl(input.path)}#activity`,
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    totalTime: `PT${input.totalMinutes}M`,
    dateModified: input.updated.toISOString().slice(0, 10),
    datePublished: input.published.toISOString().slice(0, 10),
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    author: ORG_REF,
    publisher: ORG_REF,
    isPartOf: { '@id': SITE_ID },
    supply: input.supplies.map((name) => ({ '@type': 'HowToSupply', name })),
    step: input.steps.map((text, i) => ({ '@type': 'HowToStep', position: i + 1, text })),
  };
}
