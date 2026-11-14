import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { GAMES } from '../data/games';
import { APP, APP_FAQ, appFaqFor } from '../lib/app';
import { VARIATION_LABELS, factList } from '../lib/activities';
import { SITE } from '../lib/site';
import { isIndexable } from '../i18n/locales';
import { PUBLISHED } from '../i18n/ui';

/** Self-contained answers from every page, for AI answer engines to quote accurately. */
export const GET: APIRoute = async () => {
  const guides = (await getCollection('guides')).sort((a, b) => a.id.localeCompare(b.id));
  const activities = (await getCollection('activityCards')).sort((a, b) => a.id.localeCompare(b.id));
  const languages = PUBLISHED.filter((l) => isIndexable(l.code)).length;
  const out: string[] = [`# ${SITE.name}: summaries of every page`, '', `Source: ${SITE.url}`, ''];
  out.push(
    `Language: these summaries are the English originals. The site is also published in ${languages - 1} other languages as unreviewed machine translations under a language prefix (for example ${SITE.url}/es/); see ${SITE.url}/llms.txt for every language and what each one contains.`,
    '',
  );
  out.push('## The Creative Activities app', `URL: ${SITE.url}/app/`, '', APP.summary, '', ...APP.features.map((x) => `- ${x}`), '');
  out.push(`App Store: ${SITE.appStoreUrl}`, `Google Play: ${SITE.playStoreUrl}`, '');
  for (const q of APP_FAQ) out.push(`Q: ${q.q}`, `A: ${q.a}`, '');
  for (const g of GAMES) {
    out.push(`## ${g.h1}`, `URL: ${SITE.url}/games/${g.slug}/`, '', g.intro, '', 'How to play:', ...g.howTo.map((s) => `- ${s}`), '');
    for (const f of [...g.faq, appFaqFor(g.slug)]) out.push(`Q: ${f.q}`, `A: ${f.a}`, '');
  }
  // Activity cards in full, so an answer can be followed without opening the page.
  for (const a of activities) {
    const d = a.data;
    out.push(`## Activity: ${d.name}`, `URL: ${SITE.url}/activity/${a.id}/`, `Updated: ${d.updated.toISOString().slice(0, 10)}`, '', d.summary, '');
    out.push(...factList(d).map((f) => `- ${f.label}: ${f.value}`), '');
    out.push('What you need:', ...d.materials.map((m) => `- ${m}`), '');
    out.push('What to do:', ...d.steps.map((s, i) => `${i + 1}. ${s}`), '');
    out.push('Ways to adapt it:', ...d.variations.map((v) => `- ${VARIATION_LABELS[v.kind]}: ${v.text}`), '');
    out.push('Safety:', ...d.safety.map((s) => `- ${s}`), '');
    out.push(`It is okay to stop: ${d.stopNote}`, '');
  }
  for (const e of guides) {
    const d = e.data;
    out.push(`## ${d.title}`, `URL: ${SITE.url}/${e.id}/`, `Updated: ${d.updated.toISOString().slice(0, 10)}`, '', d.summary, '');
    out.push(...d.keyPoints.map((k) => `- ${k}`), '');
    for (const f of d.faq) out.push(`Q: ${f.q}`, `A: ${f.a}`, '');
    out.push('Sources:', ...d.sources.map((s) => `- ${s.title} (${s.publisher}): ${s.url}`), '');
    if (d.health) out.push('Note: general information, not medical advice. Talk with a doctor.', '');
  }
  return new Response(out.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
