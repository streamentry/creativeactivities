# Hosting capacity

PLAT-015 asks how many files the site can grow to before the host stops accepting a deploy, and what to do before that.
This page is the written result so far, with numbers. It is a measurement and a set of options. The decision is the
maintainer's and has not been made.

## What was measured

Measured on 2026-11-17 from a full build on a 10-core machine with 16 GiB of memory.

| Measure | Value |
| --- | --- |
| Files in `site/dist` | 17,254, of which 16,532 are pages |
| Size of `site/dist` | 1,906 MiB |
| Language folders | 189, each holding 69 to 108 files (median 78), 16,504 files in all |
| Largest single file | 1.8 MiB (a language's sitemap) |
| Build time | 16,532 pages in 51 seconds (`astro build` log) |

Not measured: peak memory of the build, upload size, deploy time and cache behavior, because those need a deploy.
The files in a language folder are its pages, its games, its guides and its own sitemap, which is not a copy of the
others: each lists that language's pages with their alternates.

## The limits

The site is served by Workers Static Assets (`site/wrangler.jsonc`). Cloudflare documents these limits at
<https://developers.cloudflare.com/workers/platform/limits/>, read on 2026-11-17:

- Files in one Worker version: 20,000 on the Free plan and 100,000 on the Paid plan. A form for asking for a higher limit
  exists, and Wrangler 4.34.0 or later is needed to use the higher counts.
- Size of one file: 25 MiB on both plans.

The repository does not say which plan the account is on, so `pnpm check:capacity` assumes the Free limit (the safer
one) and takes `--plan=paid` to measure against the Paid limit. Check the page again before relying on the numbers.

## What it means

- The build is at **86% of the Free limit**: 2,746 files of headroom.
- Almost all files (16,504 of 17,254) are in the language folders. A page type that exists in every language adds about 189 files, so the
  headroom is about 12 such page types (counted to the point where the check fails, 98%). A page in English only adds one file (the four-week paths and the pack builder add
  a few).
- At ten times the pages, the planning multiple in PLAT-015, the build would hold about 166,000 files. That is over the
  Paid limit as well.
- Under the Paid limit the headroom is 82,746 files, or about 437 page types for every language.

`pnpm check:capacity` prints these numbers for the current build. It warns from 80% of the limit and fails from 98% or on
a file over 25 MiB, so a release that could not deploy is found by the build and not by the deploy. It runs in the website
workflow after the page weight budget. Today it passes with a warning, which the workflow log shows.

## Options, for the maintainer to choose

1. **Record the plan.** If the account is on the Free plan, the next language page type could fail a deploy. Moving to the
   Paid plan or asking for a higher limit buys room but not ten times.
2. **Shard the deploy.** Serve groups of languages from separate Workers behind the same domain. This needs routing and
   one deploy per group.
3. **Render the long tail on demand** (PLAT-016). Keep indexable pages static and render the rest at the edge. This
   needs a server adapter and a fallback.
4. **Choose which page types exist in every language.** Each one costs about 189 files, so a new page type can start in
   English only and be translated when it has earned its place.

## Not done

- A synthetic site at ten times the pages, built and deployed, to measure upload size, deploy time and cache behavior.
- The decision itself, with a dated plan.
- Anything that says the warning has been acted on: the check only reports.
