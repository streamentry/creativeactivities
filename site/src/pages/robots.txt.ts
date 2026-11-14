import type { APIRoute } from 'astro';
import { renderRobots } from '../lib/robots';

// Everyone, including AI answer engines, may read and cite the public pages.
export const GET: APIRoute = () =>
  new Response(renderRobots(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
