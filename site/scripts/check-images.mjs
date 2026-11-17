#!/usr/bin/env node
// Image check on the built site (PLAT-017). For every <img> on every built page: it has an alt attribute (empty is
// fine for decoration), it has width and height in the page, and a picture file is no more than twice as wide as it
// is shown (three times for the listed illustrations; see image-check-lib.mjs). Vector images are not measured.
// Not covered: images set in CSS, and the width a stylesheet finally gives an image (the width attribute is the
// width it is shown at).
// Usage: node scripts/check-images.mjs        (run `pnpm build` first)

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXCEPTIONS, MAX_DENSITY, imageProblems, imagesIn, sizeOfImage } from './image-check-lib.mjs';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const EXAMPLES = 5;

/** Every built page. */
function pagesIn(dir, found = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) pagesIn(path, found);
    else if (entry.name.endsWith('.html')) found.push(path);
  }
  return found;
}

function main() {
  if (!existsSync(join(DIST, 'index.html'))) {
    console.error('dist/ is missing. Run `pnpm build` first.');
    process.exit(1);
  }
  const pages = pagesIn(DIST);
  const sizes = new Map();
  const sizeOf = (src) => {
    if (!sizes.has(src)) {
      const file = join(DIST, src);
      sizes.set(src, existsSync(file) ? sizeOfImage(readFileSync(file), extname(src).toLowerCase()) : null);
    }
    return sizes.get(src);
  };

  let images = 0;
  let allowed = 0;
  const counts = new Map();
  const examples = new Map();
  for (const page of pages) {
    const html = readFileSync(page, 'utf8');
    const list = imagesIn(html);
    images += list.length;
    for (const problem of imageProblems(html, { sizeOf })) {
      counts.set(problem.kind, (counts.get(problem.kind) ?? 0) + 1);
      const seen = examples.get(problem.kind) ?? [];
      if (seen.length < EXAMPLES && !seen.some((e) => e.src === problem.src)) seen.push({ ...problem, page: page.slice(DIST.length - 1) });
      examples.set(problem.kind, seen);
    }
    for (const img of list) {
      const rule = EXCEPTIONS.find((e) => img.src?.startsWith(e.prefix));
      const natural = rule && img.width ? sizeOf(img.src.split('?')[0]) : null;
      if (natural && natural.width > MAX_DENSITY * img.width) allowed++;
    }
  }

  const labels = {
    'no-alt': 'no alt attribute',
    'no-size': 'no width or height',
    oversize: `a picture file more than ${MAX_DENSITY} times as wide as it is shown`,
    unreadable: 'a picture file that could not be read',
  };
  for (const [kind, label] of Object.entries(labels)) {
    const n = counts.get(kind) ?? 0;
    if (n === 0) continue;
    console.log(`FAIL ${n} images with ${label}. For example:`);
    for (const e of examples.get(kind) ?? []) {
      const detail = e.kind === 'oversize' ? ` (${e.natural} wide, shown at ${e.shown})` : e.kind === 'no-size' ? ` (missing ${e.missing})` : '';
      console.log(`  ${e.src}${detail} on ${e.page}`);
    }
  }
  const failing = [...counts.values()].reduce((a, b) => a + b, 0);
  const rule = EXCEPTIONS.map((e) => `${e.prefix} up to ${e.density} times`).join(', ');
  console.log(`Checked ${images.toLocaleString('en-US')} images on ${pages.length.toLocaleString('en-US')} pages: ${failing === 0 ? 'every image has alt text and a size, and no picture is sent at more than twice its width' : `${failing.toLocaleString('en-US')} problems`}${allowed ? ` (${allowed.toLocaleString('en-US')} uses allowed by the listed exception: ${rule})` : ''}.`);
  process.exit(failing === 0 ? 0 : 1);
}

main();
