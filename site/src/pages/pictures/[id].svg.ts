import type { APIRoute, GetStaticPaths } from 'astro';
import { ALL_SERVED_PICTURES, PICTURE_BY_ID, pictureSvg } from '../../data/pictures';

export const getStaticPaths: GetStaticPaths = () => ALL_SERVED_PICTURES.map((p) => ({ params: { id: p.id } }));

export const GET: APIRoute = ({ params }) => {
  const picture = PICTURE_BY_ID.get(String(params.id));
  if (!picture) return new Response('Not found', { status: 404 });
  return new Response(pictureSvg(picture), {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
  });
};
