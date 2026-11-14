import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { languageSection } from '../lib/language-support';
import { languageSupport } from '../lib/language-support-data';

/** The full per-language list, kept out of /llms.txt so that file stays short. */
export const GET: APIRoute = async () => {
  const guides = await getCollection('guides');
  const lines = ['# Creative Activities: languages', '', ...languageSection(await languageSupport(guides.length))];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
