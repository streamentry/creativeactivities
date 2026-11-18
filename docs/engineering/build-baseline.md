# Build baseline (PLAT-013)

PLAT-013 asks for partitioned, incremental builds. This page is the first measured step: what the website build costs
today, whether two builds of the same inputs match, and what the installed Astro version can already do. It does not
change the build. The targets are not set yet, on purpose (see the end).

Measured on 2026-11-19 on a laptop. A laptop number is not the CI number. CI runs on `ubuntu-24.04` runners
(`.github/workflows/site.yaml`), with a different CPU, memory and disk. Set the CI targets from a CI run.

## Where and what

| Item | Value |
| --- | --- |
| Date | 2026-11-19 |
| Commit built | `ff1a26c7` (origin/main when measured; the baseline scripts were added on top of it) |
| Machine | Apple M4, 10 logical CPUs, arm64, macOS 27.2.1 (Darwin 27.2.0) |
| Node | v24.11.1 (pinned by `site/package.json` `devEngines`), pnpm 10.33.0 |
| Astro | 7.4.7 (`site/node_modules/astro/package.json`) |
| Build settings | `NODE_OPTIONS=--max-old-space-size=6144` (as in CI), `ASTRO_BUILD_CONCURRENCY` unset, so `build.concurrency` is 2 |
| Command | `pnpm build:baseline` (runs `astro build` once through `/usr/bin/time`) |

## Baseline numbers

Three full builds of the same commit, each after the previous one, with no source change in between. The second one is
the recorded baseline, as PLAT-013 asks ("record the baseline of the second, no-change build"). The first one follows a
fresh `pnpm install`; the other two are shown so the spread is visible.

| Build | Wall time | Peak resident memory | HTML pages | Files in `dist/` | Size of `dist/` |
| --- | --- | --- | --- | --- | --- |
| 1 (after fresh install) | 97.3 s | 9,119.7 MiB | 16,712 | 17,497 | 1,980.2 MiB |
| **2 (recorded baseline)** | **69.8 s** | **4,465.7 MiB** | **16,712** | **17,497** | **1,980.2 MiB** |
| 3 | 57.7 s | 5,003.6 MiB | 16,712 | 17,497 | 1,980.2 MiB |

The recorded JSON of build 2:

```json
{"date":"2026-11-19","commit":"ff1a26c7b5af5447981ec4b96e95c081bfa33dfa","machine":{"os":"darwin 27.2.0","arch":"arm64","cpu":"Apple M4","logicalCpus":10},"node":"v24.11.1","astro":"7.4.7","nodeOptions":"--max-old-space-size=6144","concurrency":2,"wallSeconds":69.8,"peakResidentMiB":4465.7,"peakResidentMeasure":"largest single process in the tree (time -l / -v maximum resident set size)","htmlPages":16712,"distFiles":17497,"distMiB":1980.2}
```

How the numbers are read:

- **Wall time** covers the whole `astro build` process, including Node start-up. The spread between builds (58 to 97 s)
  is larger than any change this page would measure. Use the median of several runs when setting a target.
- **Peak memory** is the `maximum resident set size` from `/usr/bin/time -l`. On Unix that value is the largest single
  process that the time command waited for, not the sum over the tree. Astro's build runs in one Node process, so the
  figure is the build's footprint. The heap cap of 6,144 MiB limits the JavaScript heap only; the resident size is
  higher than that cap because it also counts native memory.
- **Pages** is the number of `.html` files in `dist/`. PLAT-015 (2026-11-17) counted 16,532 pages and 17,254 files. The
  site has grown since then (recent batches merged to main), and the counting rule was not reconciled, so the two numbers are
  not compared directly.
- The PLAT-015 build took 51 s on Astro's own log (2026-11-17). This page's figures include Node start-up and the time
  wrapper, so they are not directly comparable with that log line.

Not measured: CI runner time and memory; the build with a 10× fixture (PLAT-015 still lists that as not done).

## Determinism

Two builds from the same commit were compared file by file with SHA-256 (`pnpm check:determinism`,
`site/scripts/check-determinism.mjs`).

**Result: not identical.** 17,496 of 17,497 files are identical. One file differs:

- `games/find-together/index.html`

The difference is a random starting board. `site/src/games/FindTogether.tsx` sets the first board with
`useState(() => newBoard(DEFAULT_CARD_COUNT))`, and `newBoard` calls `randomSeed()` (`Math.random`, in
`site/src/lib/games/random.ts`). The game is `client:load`, so Astro renders it during the build, and the card pictures
and labels in the static HTML come from that random draw. Two builds show different pictures (for example "Tree" in one
and "Butterfly" in the other). The island's `uid` is a hash of the rendered HTML and props
(`node_modules/astro/dist/runtime/server/render/component.js`, the `astroId` line), so it changes too.

Consequences: each deploy shows a different starting board in the static page, and the browser then creates its own
random board when it starts. Whether that produces a hydration warning was not checked in a browser. This is a real
output difference, not build time, so the checker has no allowlist entry for it. Fixing it is a product and game
decision (for example a fixed seed at build time, with the random board only after the page loads); it is not done here.

Other files: the other 17,496 files, including all other game pages, the sitemaps and every `_astro` asset, are
byte-identical across the two builds. The check found no build-time stamps.

The checker's own behaviour was tested on small folders: identical folders pass, and a one-line change fails and is shown
with its line.

## What the installed Astro supports for incremental builds

Source read from `site/node_modules/astro` (version 7.4.7). The package does not ship a CHANGELOG, so the statements
below rest on the code and the type comments, not on release notes.

- **`experimental.incrementalBuild`** exists, default `false`, marked `@version 7.2`
  (`dist/types/public/config.d.ts`, around line 3470; schema in `dist/core/config/schemas/base.js` line 303 and
  `defaults.js`). It is off in `site/astro.config.mjs`.
- **How it works.** Pages whose `getStaticPaths()` returns a `cacheKey` can be skipped if the key and a dependency hash
  both match the last build (`dist/core/build/incremental.js`, `canSkip`). The dependency hash is a SHA-256 over the
  transitive module graph of each route component (`dist/core/build/plugins/plugin-incremental.js`, around lines 190 to
  246). Content-collection entries are tracked separately (`contentHashes`).
- **Where the cache lives.** The manifest is `incremental-build.json` and the copied output is under `dist/` inside
  `cacheDir`, which defaults to `./node_modules/.astro` (`dist/core/config/schemas/defaults.js`; `cacheDir` in
  `dist/types/public/config.d.ts`).
- **Global invalidation.** A change to any output-affecting config value (`dist/core/build/config-hash/input.js`) or to
  the lockfile hash (`dist/core/build/lockfile/index.js`) discards the whole cache.
- **Site status.** Not used. `site/astro.config.mjs` does not set `incrementalBuild`, and no file under `site/src`
  returns a `cacheKey` (checked by search). Turning it on would do nothing until every dynamic route returns one.
- **Risk for this site.** Because the dependency hash covers a route's whole module graph, a shared data module that
  many pages import would mark all of them dirty on any change. Whether the site's data modules are shared this way was
  not measured; a one-activity change needs a test before any claim.
- **Other experimental flags that touch the build.** `experimental.parallelPrerender` (with `workers`) and
  `experimental.collectionStorage` (`single-file` or `chunked`) exist in the same schema. They change how pages are
  rendered or how collection data is stored; they are not caches, and they were not tried.
- **Warm state between runs.** Astro's `cacheDir` (`node_modules/.astro`) also holds state that other builds reuse,
  such as the content data store (`dist/content/data-store.js` in the package). The three runs above shared it and it
  was not cleared, so build 1 was not a fully cold start either; this was not verified file by file.

## Targets PLAT-013 asks for

| Target | Status |
| --- | --- |
| No-change build finishes within a target | Not set yet: set from this baseline in CI, not on a laptop. Laptop median here is about 70 s. |
| One-activity change rebuilds only that activity's pages and affected indexes | Not measured. Needs incremental support or a shard step first. |
| Peak memory under the CI limit for a 10× fixture | Not set yet: set from this baseline in CI. The CI memory limit is not written in the repository. The 6,144 MiB heap cap is the only limit recorded. |
| Two builds from the same inputs produce identical output | Fails today: one file (`games/find-together/index.html`). See Determinism. |

## Next steps (not done here)

1. Fix the random starting board in FindTogether, or decide that the static page shows a fixed layout. Then the
   determinism check can run in CI.
2. Run `pnpm build:baseline` on a CI runner (a temporary branch or the workflow's build job, not this change) and set
   the targets from its numbers.
3. Decide whether to test `experimental.incrementalBuild` on one dynamic route family, with `cacheKey` set and a
   measured one-activity change.

The scripts `site/scripts/build-baseline.mjs` and `site/scripts/check-determinism.mjs` are run by hand (`pnpm build:baseline`,
`pnpm check:determinism <dist-a> <dist-b>`). They are not in `.github/workflows/site.yaml`.
