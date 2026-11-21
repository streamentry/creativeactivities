import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { GAMES } from '../data/games';
import { TYPE_LABELS, listedActivities } from '../lib/activities';
import { isRetiredGuide } from '../lib/retired-guides';
import { cardEntry, cardUrl, gameEntry, guideEntry, hubEntry, hubUrl, indexFile, linkGuides } from '../lib/search-index';

/** WEB-003: the English pages site search looks through. Built once; the search page downloads it on first use. */
export const GET: APIRoute = async () => {
  const activities = listedActivities(await getCollection('activityCards'));
  const cards = activities.map((a) => cardEntry(a.id, a.data, TYPE_LABELS[a.data.type]));
  const hubRecords = await getCollection('hubs');
  const hubs = hubRecords.map((h) => hubEntry(h.id, h.data));
  // A retired guide has no English page (it redirects), so it is not searchable.
  const guides = (await getCollection('guides')).filter((g) => !isRetiredGuide(g.id)).map((g) => guideEntry(g.id, g.data));
  const games = GAMES.map((g) => gameEntry(g));
  const sources = [
    ...activities.map((a) => ({ url: cardUrl(a.id), guides: a.data.guides })),
    ...hubRecords.map((h) => ({ url: hubUrl(h.id), guides: h.data.guides ?? [] })),
  ];
  const entries = linkGuides([...cards, ...hubs, ...guides, ...games], sources);
  return new Response(JSON.stringify(indexFile(entries)), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
