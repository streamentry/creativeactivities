import type { APIRoute } from 'astro';

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      name: 'Creative Activities: Dementia Activities',
      short_name: 'Creative Activities',
      description: 'Gentle games and activities for people living with dementia.',
      start_url: '/',
      display: 'standalone',
      background_color: '#FAF8F2',
      theme_color: '#FAF8F2',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    }),
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );
