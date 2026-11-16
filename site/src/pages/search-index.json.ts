import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { GAMES } from '../data/games';
import { TYPE_LABELS, listedActivities } from '../lib/activities';
import { isRetiredGuide } from '../lib/retired-guides';
import { cardEntry, gameEntry, guideEntry, hubEntry, indexFile } from '../lib/search-index';

/** WEB-003: the English pages site search looks through. Built once; the search page downloads it on first use. */
export const GET: APIRoute = async () => {
  const cards = listedActivities(await getCollection('activityCards')).map((a) => cardEntry(a.id, a.data, TYPE_LABELS[a.data.type]));
  const hubs = (await getCollection('hubs')).map((h) => hubEntry(h.id, h.data));
  // A retired guide has no English page (it redirects), so it is not searchable.
  const guides = (await getCollection('guides')).filter((g) => !isRetiredGuide(g.id)).map((g) => guideEntry(g.id, g.data));
  const games = GAMES.map((g) => gameEntry(g));
  return new Response(JSON.stringify(indexFile([...cards, ...hubs, ...guides, ...games])), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
