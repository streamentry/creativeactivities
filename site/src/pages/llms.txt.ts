import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { GAMES } from '../data/games';
import { PACKS } from '../data/packs';
import { APP } from '../lib/app';
import { SECTION_META, SITE } from '../lib/site';
import { SECTIONS } from '../content.config';
import { isIndexable } from '../i18n/locales';
import { PUBLISHED } from '../i18n/ui';
import { languageOverview } from '../lib/language-support';
import { languageSupport } from '../lib/language-support-data';

/** A plain-text map of the site for AI answer engines (llmstxt.org format). */
export const GET: APIRoute = async () => {
  const guides = (await getCollection('guides')).sort((a, b) => a.data.order - b.data.order);
  const languages = languageOverview(await languageSupport(guides.length));
  const activities = (await getCollection('activityCards')).sort((a, b) => a.data.name.localeCompare(b.data.name));
  const hubs = (await getCollection('hubs')).sort((a, b) => a.data.title.localeCompare(b.data.title));
  const lines: string[] = [
    `# ${SITE.name} (${SITE.domain})`,
    '',
    `> Free creative activities to do together, with printable cards, plus gentle browser games, a free mobile app and practical guides, first for families with older adults, including people living with dementia. No sign-up, no timers, no scores. Recreational and informational only: not medical advice, and no claims to diagnose, treat or prevent dementia.`,
    '',
    'Key facts:',
    '- All games are free, run in a web browser and need no account.',
    '- Games have no timer, score, levels or penalties; pictures stay visible by default.',
    '- Photos used in Photo pairs stay in the browser and are never uploaded.',
    '- Guides cite public sources such as the National Institute on Aging, the Alzheimer’s Association, Cochrane and The Lancet.',
    `- The Creative Activities app ("${APP.storeName}") is free for ${APP.platforms}: ${SITE.appStoreUrl} and ${SITE.playStoreUrl}`,
    `- Full text summaries: ${SITE.url}/llms-full.txt`,
    `- Languages: the website is available in ${PUBLISHED.filter((l) => isIndexable(l.code)).length} languages; English is the original and the rest are machine translations (details under Languages below).`,
    '',
    '## Creative Activities app',
    `- [About the app](${SITE.url}/app/): ${APP.summary}`,
    ...APP.features.map((f) => `- ${f}`),
    `- Requirements: ${APP.requirements}.`,
    `- App Store: ${SITE.appStoreUrl}`,
    `- Google Play: ${SITE.playStoreUrl}`,
    '',
    '## Activities by situation (English)',
    ...hubs.map((h) => `- [${h.data.title}](${SITE.url}/${h.id}/): ${h.data.description}`),
    '',
    '## Activity cards (English)',
    `- [Find an activity](${SITE.url}/activity/): filter by time, materials, type, setting and who is taking part.`,
    ...activities.map((a) => `- [${a.data.name}](${SITE.url}/activity/${a.id}/): ${a.data.description}`),
    ...PACKS.map((p) => `- [${p.title}](${SITE.url}/activity/packs/${p.id}/): ${p.description}`),
    '',
    '## Games',
    ...GAMES.map((g) => `- [${g.name}](${SITE.url}/games/${g.slug}/): ${g.description}`),
  ];
  for (const section of SECTIONS) {
    lines.push('', `## ${SECTION_META[section].title}`);
    for (const g of guides.filter((e) => e.data.section === section)) {
      lines.push(`- [${g.data.title}](${SITE.url}/${g.id}/): ${g.data.description}`);
    }
  }
  lines.push(
    '',
    '## About',
    `- [Our approach](${SITE.url}/about/): why the games avoid timers, scores and quizzing.`,
    `- [Editorial policy](${SITE.url}/editorial-policy/): sources, review and corrections.`,
    `- [For organizations](${SITE.url}/for-organizations/): free use in care homes, libraries and support groups, and text for resource lists.`,
    `- [Printable handout](${SITE.url}/handout/): one page for families and caregiver packets.`,
    `- [Health information notice](${SITE.url}/medical-disclaimer/)`,
    `- [Privacy](${SITE.url}/privacy/)`,
    `- [Creative Activities app](${SITE.url}/app/): iPhone, iPad and Android.`,
    `- [App help](${SITE.url}/help/): gentle games, family photos, offline play and removing copies.`,
    `- [App privacy policy](${SITE.url}/app-privacy/): family photos stay on the device; no account or photo upload.`,
    `- [Safety and intended use](${SITE.url}/safety/): recreation, not diagnosis, testing or treatment.`,
    `- [Legal and privacy information](${SITE.url}/legal/)`,
    `- [Support](${SITE.url}/support/)`,
    '',
    ...languages,
  );
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
