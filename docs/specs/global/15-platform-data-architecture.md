# 15. Platform and data architecture

This file says what the website and the app need technically to hold tens of thousands of activities in dozens of languages without losing trust, speed, accessibility or privacy. It starts from what runs today and changes only what scale forces. Items are `PLAT-###`. An item is not built unless the baseline in the [README](README.md) says so or the repo shows it.

**Read with:** [README](README.md) · [content library](06-content-library.md) · [localization](13-localization.md) · [search, GEO and distribution](12-search-geo-distribution.md) · [community and UGC](11-community-ugc.md) · [trust, safety, accessibility and privacy](14-trust-safety-accessibility-privacy.md) · [business model](16-business-model.md) · [metrics](17-metrics-and-evidence.md) · [roadmap](18-roadmap.md) · `docs/specs/product.md`

Research notes are cited as [R1] craft platforms (research/01), [R2] parenting and kids (02), [R3] art therapy and wellbeing (03), [R4] games and engagement (04), [R5] search, scale and trust (05). Repo facts cite the file they come from.

---

## 1. Today, checked in the repo

- **Build and hosting.** Astro static output with `trailingSlash: 'always'` and directory format. Build concurrency comes from `ASTRO_BUILD_CONCURRENCY` (default 2). The config comment says the roughly 15k-page build "can be OOM-killed at 2" ([site/astro.config.mjs](../../../site/astro.config.mjs)). The site is served from `./dist` by Workers Static Assets, with `html_handling: auto-trailing-slash` and `not_found_handling: 404-page`. No Worker script runs ([site/wrangler.jsonc](../../../site/wrangler.jsonc)).
- **Content.** Four Zod-validated collections in [site/src/content.config.ts](../../../site/src/content.config.ts): `guides` (88 English), `guidesI18n` (translations matched to English by file path, recording only a `translatedFrom` date), `activityCards` (38 English; `reviewer` is nullable and defaults to `null`), and `hubs`. The baseline also holds 189 locale codes of unreviewed machine translation, most of them kept out of the search index ([README baseline](README.md#where-we-are-today-baseline-checked-2026-11-14-on-main-at-dab0f10)).
- **Checks.** `check-site.mjs` covers links, titles, descriptions, JSON-LD, alt text and claim wording. `pnpm verify` runs tests, build and checks. CI deploys on push to `main` only after they pass, then sends IndexNow ([site/README.md](../../../site/README.md)).
- **Security.** Two policies apply: an Astro hash-based meta CSP for scripts and styles, and a response policy in `public/_headers`. Inline `style` attributes fail the build.
- **Analytics.** Google Analytics 4 is the only analytics on the website, approved 2026-10-25 with ad personalization off. It is not loaded on Photo pairs. Activity events go through `site/src/lib/track.ts` ([site/README.md](../../../site/README.md); [docs/plan/measurement.md](../../../docs/plan/measurement.md)).
- **App.** Flutter, offline, no account, no analytics SDK. The maintainer decision of 2026-11-07 keeps it that way, and `tests/test_network_boundary.py` enforces it ([docs/plan/measurement.md](../../../docs/plan/measurement.md)).
- **Imagery.** Site pictures are drawn in `src/data/pictures.ts`. `site/scripts/make-images.py` needs macOS Quick Look and Pillow. No AVIF/WebP pipeline exists.
- **Finder.** `/activity/` filters the 38 cards in the browser.
- **One discrepancy to resolve.** `wrangler.jsonc` sets `workers_dev: true`, while `site/README.md` says the workers.dev address is turned off. Check the Cloudflare dashboard and fix whichever file is wrong (open question 6).

## 2. What scale forces

**Planning envelope (an assumption, not a forecast):** 20,000 canonical activities and 40 languages by stage S4, with native review on only a subset of pairs. Arithmetic: 20,000 × 40 = 800,000 possible activity pages, roughly 50 times today's build. Most pairs will never be reviewed, so most must not exist as indexable static files.

That arithmetic drives five decisions:

| # | Decision | Why | Items |
|---|---|---|---|
| D1 | Keep Astro static through S3. Add on-demand rendering only for the long tail, never for indexable pages. | Static pages are fast, cheap and easy to audit. | PLAT-013, PLAT-016 |
| D2 | Git stays the source of truth until the editorial gate in PLAT-010 is passed. | Pull-request review, diffs and history already give provenance. | PLAT-009, PLAT-010 |
| D3 | One content schema, generated for web and app. | Prevents the app and site from drifting apart. | PLAT-035 |
| D4 | Publishing state is set per (entity, locale), not per site. | Stops thin or unreviewed translations from being indexed ([R5 §2.3, §2.4]). | PLAT-004, PLAT-014 |
| D5 | No accounts, sync, uploads or server search until the roadmap gates pass and the maintainer decides. | Matches `product.md` and the day-90 gates in the plan. | PLAT-023, PLAT-028 to PLAT-032 |

## 3. Content model

Other files define the editorial content. This file defines the records that store it.

| Entity | What it holds | Key fields | Relates to |
|---|---|---|---|
| **Activity** | One canonical, startable thing | `id` (stable), `slug`, `name`, `type`, `settings`, `groups`, `materials`, `steps` (one action each), `safety`, `stopNote`, `state` | has Variations, Media, Sources, Reviews |
| **Variation** | An adaptation of one activity ([R5 §2.2]; VISION "adaptation graph") | `id`, `activity_id`, `kind`, changed steps, media | belongs to Activity |
| **Media asset** | Image, audio or video file | `id`, content hash, license, rights holder, consent flags, alt text, caption, approved surfaces | used by Activity steps and Variations |
| **Translation** | Localized text for one (entity, locale) | `source_hash` at translation time, `status`, translator, reviewer, date | mirrors one entity |
| **Review record** | A named or role-based check of one version | reviewer name or role, credential, scope (for example "seated adaptations"), date, version hash reviewed, outcome | belongs to one version of an entity |
| **Source** | A citation | title, publisher, URL, date accessed, date last checked, archived copy only where licensed | cited by an entity or a claim |

Fields describe the activity, never the person doing it ([DESIGN.md §5](../../../DESIGN.md)).

## 4. Items

Summary: 40 items. P0 17, P1 14, P2 7, P3 2. Blocks are used for P0 and P1 items; tables are used for the rest.

### Content model and records

### PLAT-001 · Stable entity IDs separate from slugs
Priority P0 · Phase S2 · Status partial · Pillars: all
Why: the slug is both the URL and the identity today. Translations and variations need IDs that survive a rename ([DESIGN.md §5] already shows `memory-collage-001`).
What: every Activity, Variation, Media asset, Translation and Review record gets an immutable ID. The slug can change; the ID does not.
Acceptance:
- IDs are unique across all record types and never reused.
- Renaming a slug keeps the ID and produces a 301 from the old URL (see PLAT-008).
- Translation and Variation records reference IDs, never slugs.
Depends on: PLAT-008.
Risks / not doing: one-time migration of the 38 cards. Do not add IDs to guides in S1 unless a guide needs to be referenced by ID.

### PLAT-002 · Variations as first-class records
Priority P1 · Phase S2 · Status new · Pillars: all
Why: the VISION "adaptation graph" is the moat it names. Variations are currently array items inside each card (`variations` in `content.config.ts`), so a hub cannot select one by its own ID or review it separately. The hub schema already has a `variation` field.
What: each variation has its own ID, a `kind` from the existing nine values, the steps it changes, optional media, and its own review record.
Acceptance:
- A hub can list cards by variation kind without copying text.
- A variation can be reviewed and retired without touching its parent activity.
- A variation that changes no step fails validation.
Depends on: PLAT-001, PLAT-005.
Risks / not doing: variation sprawl. Add a kind only when a tested need exists.

### PLAT-003 · Media asset records and rights log
Priority P0 · Phase S2 · Status new · Pillars: all
Why: DESIGN §2 and §10 require original or licensed images with correct alt text. [R5 §5.5] names image rights and consent as a live risk. The app's catalog photos are not cleared for the website ([site/README.md](../../../site/README.md)).
What: every image, audio or video file has a record with its hash, source, license, rights holder, consent status for any identifiable person (including a child-release flag), alt text, caption and the surfaces it may appear on.
Acceptance:
- The build fails if a referenced file has no record.
- No image of a child is published without `child_release: verified`.
- App catalog photos cannot be referenced from the website unless their record says cleared.
- A rights report can be generated for every image in one command.
Depends on: none.
Risks / not doing: record overhead. Store records as small sidecar files in the repo; do not build a DAM system in S1.

### PLAT-004 · Translation records with source hashes
Priority P0 · Phase S2 · Status partial · Pillars: all
Why: `guidesI18n` links to English by path and stores only a `translatedFrom` date. A changed English paragraph does not mark its translations as stale. [R5 §2.3] says machine text needs native review before it is shown.
What: each (entity, locale) pair has a record with the source content hash at translation time, a status (`machine-draft`, `human-translated`, `native-reviewed`, `published`, `stale`), translator, reviewer and dates.
Acceptance:
- When English changes in a way that alters meaning, every affected locale becomes `stale` automatically.
- Typo fixes do not mark translations stale; a semantic-change flag decides.
- A status report lists counts per locale and per status.
- Stale or draft translations are never indexed (see PLAT-014).
Depends on: PLAT-001, PLAT-005.
Risks / not doing: churn from hash-based staleness. Do not automate translation of safety or materials text without human review ([R5 §2.3]).

### PLAT-005 · Review records that cannot be faked
Priority P0 · Phase S2 · Status partial · Pillars: all
Why: `reviewer` is a nullable string today. [R3 §7] and DESIGN §5 say a "clinically reviewed" label needs a documented review. Healthline-style review dates are the trust model in [R5 §2.1–2.2].
What: a review record holds the reviewer's name (or role if they prefer), credential where one applies, scope, date, the version hash reviewed and the outcome. The page shows a reviewer only when a matching record exists.
Acceptance:
- A page whose content hash differs from the reviewed hash shows as "updated since review" in internal reports and never shows the old reviewer as current.
- A credential is recorded only after it has been checked.
- No review badge is rendered from a free-text field.
- Scope is shown when it is narrower than the page (for example "seated adaptations only").
Depends on: PLAT-011.
Risks / not doing: reviewers who cannot be named. Use a role ("occupational therapist, reviewed seated adaptations") only with the reviewer's written agreement. Do not invent reviewers.

### PLAT-006 · Source records and claim links
Priority P1 · Phase S2 · Status partial · Pillars: all
Why: `sources` arrays exist but carry no accessed date and no link to the claims they support. [R5 §5.6] asks for sources and dates on every page.
What: each source has an ID, the date accessed, the date last checked and, where the license allows, an archived copy. Factual sentences in health-adjacent content may reference source IDs.
Acceptance:
- A weekly job checks source URLs and records failures.
- The claim-wording check in `check-site.mjs` runs on every new page.
- Every health-adjacent page has at least one source with a date.
Depends on: PLAT-011.
Risks / not doing: link rot and licenses for archived copies. Archive only what the license allows; link otherwise.

### PLAT-007 · Versions, change log and corrections
Priority P1 · Phase S2 · Status new · Pillars: all
Why: DESIGN §4B requires a correction link. [R5 §4] says printed copies cannot be updated, so each print must carry a date and version.
What: each published entity has a version number and a change-log entry. Material changes (safety, materials, claims, steps) appear on a public correction log for 24 months.
Acceptance:
- The print footer shows the version and date.
- A material change creates a correction-log entry automatically from the diff.
- Typo-only changes do not appear.
Depends on: PLAT-001, PLAT-005.
Risks / not doing: log noise. Only material changes are logged.

### PLAT-008 · URL policy, redirects and canonical registry
Priority P1 · Phase S2 · Status partial · Pillars: all
Why: the site already uses trailing slashes and canonical tags. Tens of thousands of URLs need written rules and a redirect registry before the first slug changes.
What: rules for slug format, locale prefix and section. One redirect registry file that maps retired and renamed URLs to their replacements.
Acceptance:
- Every retired URL returns a 301 to a live page or a 410 with a reason.
- A test fails on slug collisions within a locale and on hreflang pairs that are not reciprocal.
- Retired slugs are not reused for 12 months.
Depends on: none.
Risks / not doing: Static Assets redirect limits. Verify the current limits for the redirect file before relying on it (open question 2); add a Worker only if the limit is hit.

### Editorial workflow

### PLAT-009 · Git-first editorial flow
Priority P0 · Phase S2 · Status exists · Pillars: all
Why: Markdown in Git with pull-request review and CI already gives diffs, authorship and rollback. [R5 §1] names the trust layer as the reason the largest sites win; a reviewable history is part of that layer.
What: every content change goes through a pull request. The template asks for author, reviewer, sources and safety fields. CI runs schema, check and build steps.
Acceptance:
- Nothing reaches `main` without review.
- The PR template fails when required fields are empty.
Depends on: PLAT-011.
Risks / not doing: non-developer reviewers blocked by Git. That is the trigger for PLAT-010, not a reason to skip review.

### PLAT-010 · Editorial states and review queue
Priority P1 · Phase S2 · Status new · Pillars: all
Why: a review queue becomes necessary once reviewers and translators are not developers.
What: states `draft`, `in-review`, `reviewer-approved`, `published`, `needs-review`, `retired`. Roles: author, reviewer, translator, native reviewer, maintainer. Implement with Git labels first; move to a Git-based or headless CMS with workflow only when the gate is met.
Acceptance:
- Each state change records who, when and why.
- Export to plain Markdown or JSON is always possible, so the CMS is replaceable.
- Retired entities return 410 or redirect (PLAT-008).
Depends on: PLAT-005, PLAT-007.
Risks / not doing: CMS lock-in. Gate proposal: move to a CMS when more than three people outside the maintainer team review content each week, or when more than 200 items wait for review at once. These thresholds are proposals to test, not measured limits.

### PLAT-011 · One validation command for every content type
Priority P0 · Phase S2 · Status partial · Pillars: all
Why: Zod checks frontmatter and `check-site.mjs` checks the built output, but no single step covers translations, variations, media and review records.
What: one validation command reads every content type, including records that do not exist yet, and reports file and field for each error.
Acceptance:
- A deliberately broken fixture fails for each record type.
- A published item missing a license, review or source field fails.
- Validation runs incrementally on changed files in pull requests.
Depends on: PLAT-003, PLAT-005.
Risks / not doing: slow validation at scale. Measure it at 10× the current content before the gate.

### PLAT-012 · Staleness and re-review queue
Priority P1 · Phase S2 · Status new · Pillars: all
Why: the VISION metric "updates overdue" needs a source. [R5 §5.6] asks for "last checked" dates. A date that is bumped without a review is dishonest.
What: each entity has `next_review_due`. Proposed defaults: 12 months for health-adjacent or care content, 24 months otherwise. A weekly report lists overdue items and their owners.
Acceptance:
- The report runs weekly and names owners.
- Only a completed review updates a "last checked" date. Editing does not.
- Overdue health-adjacent items are flagged on the internal dashboard ([metrics](17-metrics-and-evidence.md)).
Depends on: PLAT-005, PLAT-010.
Risks / not doing: automatic "still accurate" stamps. Do not build them.

### Build and rendering

### PLAT-013 · Partitioned, incremental builds
Priority P0 · Phase S2 · Status new · Pillars: all
Why: the current build is near the memory limit of a 2-concurrency CI run. A build of 100,000 or more pages in one process will not run.
What: split the build by section and locale into shards. Cache rendered HTML by content hash. Rebuild only what changed: an activity change rebuilds its pages and the indexes that list it.
Acceptance:
- A no-change build finishes within a target set after measurement (record the baseline first).
- A one-activity change rebuilds that activity's pages and affected index pages only.
- Peak memory stays under the CI limit for a 10× content fixture.
- Two builds from the same inputs produce identical output.
Depends on: PLAT-001, PLAT-011.
Risks / not doing: Astro's incremental support may be limited. Verify what the current Astro version supports before designing around it. A custom shard step may be needed.

### PLAT-014 · Publishing state per (entity, locale)
Priority P0 · Phase S2 · Status partial · Pillars: all
Why: the baseline holds 189 locale codes of unreviewed machine text, and the plan has 19 languages set to noindex. [R5 §2.3] and [R5 §2.4] say thin or unreviewed mirrors are the penalized pattern.
What: three states per pair. `not-built` is the default. `preview` is built with noindex and is reachable only by direct link. `indexed` is built and included in sitemaps, hreflang and the search index, and needs `native-reviewed` status.
Acceptance:
- The sitemap, hreflang and search index include only `indexed` pairs.
- A test fails if an `indexed` pair has a stale or draft translation.
- Removing a locale from the index is a one-line change.
Depends on: PLAT-004.
Risks / not doing: losing the appearance of language coverage. That loss is intended. Coverage counts only reviewed pairs ([metrics](17-metrics-and-evidence.md)).

### PLAT-015 · Hosting capacity check at 10× the page count
Priority P0 · Phase S2 · Status new · Pillars: all
Why: Workers Static Assets serve files from `dist`. A 10× build means well over 150,000 HTML files before images. Platform limits on file count, file size and deploy size must be checked, not assumed.
What: build a synthetic site at 10× the current page count and image count. Measure build time, upload size, deploy time and cache behavior. Record the current limits from Cloudflare's documentation.
Acceptance:
- A written result with numbers, stored with the decision record.
- A decision: shard deploys, move long-tail pages to on-demand rendering (PLAT-016), or accept the limit with a dated plan.
Depends on: PLAT-013.
Risks / not doing: learning the limit in production. Do the test before the first locale goes to `indexed` at scale.

### PLAT-016 · On-demand rendering for the long tail
Priority P2 · Phase S4 · Status new · Pillars: all
Why: some valid combinations (an activity, a variation and an unreviewed locale) are needed by a few visitors but do not justify a static file.
What: adopt a server-rendered adapter for Cloudflare only for routes flagged `on-demand`, such as preview locales and search result pages. Cache responses at the edge with stale-while-revalidate. Fall back to the static page when rendering fails.
Acceptance:
- Indexable pages remain static.
- Preview pages return `noindex` in both the meta tag and the response header.
- A p75 time-to-first-byte target is set after measurement.
Depends on: PLAT-015.
Risks / not doing: runtime cost and a larger attack surface. Verify current adapter support before adopting it.

### Images, print and video

### PLAT-017 · Image pipeline: masters to AVIF, WebP and fallback
Priority P0 · Phase S2 · Status new · Pillars: all
Why: DESIGN §2 requires actual process photos and tactile illustrations. The performance rules require explicit dimensions, AVIF or WebP with fallbacks, and no image much larger than its rendered size. Today nothing generates responsive derivatives.
What: masters are kept in the repo (small files) or in R2 (large files; decision). Build generates AVIF, WebP and JPEG derivatives at 320 to 1280 pixel widths, with `width` and `height` set and `loading` set per placement.
Acceptance:
- Build fails when an image has no dimensions or alt text.
- No delivered image is more than twice its rendered width.
- Derivatives are cached by content hash, so unchanged images are not reprocessed.
Depends on: PLAT-003.
Risks / not doing: build time with many images. Cache derivatives. Do not add a runtime image service in S1.

### PLAT-018 · Step photo and caption standard
Priority P1 · Phase S2 · Status new · Pillars: all
Why: DESIGN §2 says photos are never the only instruction, and §4B makes steps optional images. [R1 §4] names photo-per-step as the strongest format for low-vision and printed use.
What: a step may have one image, one caption of one sentence, and alt text that describes the action, not "image of". The text of the step is always present.
Acceptance:
- No step image appears without its text.
- Alt text is part of the review record (PLAT-005).
- The crop keeps hands and materials visible at phone width.
- The first 10 flagship activities have photo steps before the rest of the library.
Depends on: PLAT-003, PLAT-017.
Risks / not doing: photo production cost. Start with 10 flagship activities and measure use ([metrics](17-metrics-and-evidence.md)).

### PLAT-019 · Print-ready cards and generated PDFs
Priority P1 · Phase S2 · Status new · Pillars: all
Why: printing is a primary distribution path ([VISION.md]; [R5 §4]). DESIGN §4B says the print page must work with no internet and no color ink.
What: each activity and pack has a print stylesheet (one card) and a generated PDF in A4 and US Letter, black and white, plus a large-print variant. The footer shows version, date and a short link or QR code.
Acceptance:
- Each card fits one page in both sizes (PLAT-039).
- PDFs are generated at build time first. Use an on-demand browser renderer only if build-time generation cannot cover the need (verify the platform option before choosing it).
- PDFs stay under an agreed size budget and carry document metadata.
Depends on: PLAT-007, PLAT-017.
Risks / not doing: printed copies going out of date. The version footer is the control.

### PLAT-020 · Short video with captions and transcript
Priority P2 · Phase S3 · Status new · Pillars: all
Why: [R5 §4] describes short demonstrations for YouTube and Shorts as a distribution channel. DESIGN §2 and §6 rule out autoplay.
What: short MP4 and WebM files, click to play, poster image, WebVTT captions and a text transcript on the page. Hosting on a managed video service or R2 (decision).
Acceptance:
- No autoplay. No video in the hero position.
- Captions and transcript are present before publishing.
- People shown in a video have a recorded consent; children require a release (PLAT-003).
Depends on: PLAT-003.
Risks / not doing: bandwidth cost and rights. Video is not a launch requirement.

### Search and finder

### PLAT-021 · Finder index sharded by locale and facet
Priority P0 · Phase S2 · Status partial · Pillars: all
Why: the finder filters 38 cards in the browser. At 20,000 entries a single index file would be too large for low-bandwidth phones ([DESIGN.md §7]; [R4 §8], concept 30, on a low-bandwidth pack).
What: the index is split by locale and by facet group, loaded on first interaction, and kept small with short keys. Listing pages for each facet are plain HTML and remain the fallback.
Acceptance:
- The first shard is within an agreed budget (propose 100 KB compressed as a starting point).
- The finder works from the listing pages when JavaScript is off or fails.
- A throttled-network test (Playwright, mobile profile) completes a search.
Depends on: PLAT-014.
Risks / not doing: a single global index. Do not build one.

### PLAT-022 · Site-wide static search index
Priority P1 · Phase S2 · Status new · Pillars: all
Why: VISION makes the site search-first, and the catalog will outgrow navigation alone. [R5 §3] says search demand is spread across many small intents.
What: a build-time, locale-sharded index that loads only on the search page. Choose a static index tool after a test on the real content size. No third-party search service that receives queries.
Acceptance:
- Only `indexed` pairs (PLAT-014) are in the index.
- Search requests never leave the site origin.
- The combobox pattern passes an accessibility test with a screen reader.
- No query text is logged.
Depends on: PLAT-014, PLAT-021.
Risks / not doing: index size at 100k pages. Shard by section and test.

### PLAT-023 · Server-side search for 100k pages and more
Priority P3 · Phase S4 · Status new · Pillars: all
Why: static search may stop being enough at scale. Build it only when evidence shows it is needed, for example timeouts or unanswered queries in logs.
What: a Worker with a search index, rate-limited, cached and with queries not logged.
Acceptance:
- A p95 latency target is set after measurement.
- No personal data in logs.
- Any AI-written answer is labelled and reviewed; it is not presented as activity advice without review.
Depends on: PLAT-022.
Risks / not doing: privacy and cost. Do not add it for speed alone.

### Analytics, consent and privacy

### PLAT-024 · Website event dictionary and payload rules
Priority P0 · Phase S1 · Status partial · Pillars: all
Why: GA4 is live and the activity events exist, but the event list and payload rules are not written down in one place. The baseline reads "not read yet" ([plan measurement table](../../plan/README.md#8-measurement)).
What: one document lists every event, its parameters and allowed values. Rules: no free text, no health words, no diagnosis, no child data, no user IDs.
Acceptance:
- A test fails when an event sends a parameter outside the list.
- The list matches what `track.ts` sends.
- The GA4 data stream keeps Google signals and ad personalization off.
Depends on: none.
Risks / not doing: event creep. Each new event needs a metric in [metrics](17-metrics-and-evidence.md).

### PLAT-025 · App analytics stance (no SDK)
Priority P0 · Phase S2 · Status exists · Pillars: all
Why: the maintainer decided on 2026-11-07 that the app has no analytics SDK ([docs/plan/measurement.md]).
What: keep the app free of analytics SDKs. Measure it through App Store Connect, Play Console and consented pilot diaries. Any change needs a new maintainer decision, privacy label updates and fresh App Review.
Acceptance:
- `tests/test_network_boundary.py` runs in CI and passes.
- No analytics dependency appears in the app's dependency lock (verify).
Depends on: none.
Risks / not doing: blind spots (no in-app completion data). Use the pilot diaries and the metrics in [metrics](17-metrics-and-evidence.md).

### PLAT-026 · Consent, Global Privacy Control and retention
Priority P0 · Phase S2 · Status new · Pillars: all
Why: GA4 is the only analytics. If EEA or UK visitors are counted, consent rules apply (verify with counsel). [R5 §5.2] notes that health information is special-category data under GDPR, so the site must not collect it through analytics.
What: honor Global Privacy Control signals. Configure GA4 consent mode for the region rules counsel gives. Set data retention to the shortest option that still supports the review cadence. Update the privacy page with every change.
Acceptance:
- A browser sending GPC sends no analytics event (or sends only a denied-consent ping, as counsel decides).
- Retention setting is recorded in the decision log.
- The privacy page matches the configured behavior.
Depends on: PLAT-024.
Risks / not doing: a consent banner on every page by default. Add one only where counsel requires it.

### PLAT-027 · Aggregate "We tried this" counters
Priority P1 · Phase S2 · Status new · Pillars: all
Why: the north star is confirmed activity starts ([README](README.md#definition-of-1-how-we-will-know); [VISION.md]). GA4 cannot see an activity done away from the screen, so a self-report is needed.
What: a "We tried this" button on activity pages sends one increment per activity and locale per day to a minimal endpoint. The endpoint stores aggregate counts only, with no cookie and no identifier. Public reports suppress small cells.
Acceptance:
- No cookie is set and no identifier is stored or logged.
- Public reports suppress any cell below the minimum (proposal: 10).
- If the endpoint fails, the page still works.
- The client limits repeat clicks.
Depends on: PLAT-024, PLAT-026.
Risks / not doing: spam and fake counts. Rate limits and anomaly checks, not user accounts. This adds server code to a site that has none, so it needs a maintainer decision first.

### PLAT-028 · Optional account (gated)
Priority P3 · Phase S4 · Status new · Pillars: all
Why: `product.md` and the plan keep accounts out until the day-90 gates. The free core must never need a login ([MISSION.md] point 7).
What: if it is ever built: optional, passkey or email link, no child accounts, nothing needed to read or print, data limited to what the feature needs, and in-app export and deletion.
Acceptance:
- Every core flow passes when logged out.
- Deletion completes within a stated time and is tested.
- A data map lists every field and its purpose.
Depends on: a maintainer decision, legal review, and [roadmap](18-roadmap.md) gates.
Risks / not doing: pressure to log in. Do not build it to increase retention.

### PLAT-029 · Local-first sync of saved items (end-to-end)
Priority P2 · Phase S3 · Status new · Pillars: all
Why: saved activities live in one browser today ([README baseline]). A family using two devices loses them. [R4 §3.3] favors collections over streaks, so sync carries no progress pressure.
What: sync saved item IDs between a user's own devices using encryption keys the user holds (passphrase or device pairing). The server stores ciphertext only.
Acceptance:
- The server cannot read saved content (tested).
- Conflicts resolve per item.
- Everything works offline and syncs when back online.
- Key loss has a documented recovery path.
Depends on: PLAT-028 decision or a no-account pairing design.
Risks / not doing: key loss. Do not build sync without the recovery story.

### PLAT-030 · Family share links without personal data
Priority P2 · Phase S3 · Status new · Pillars: TOGETHER
Why: sharing one card is a distribution channel ([VISION.md]; [R5 §4]).
What: a share link points to one activity or one pack. An optional message typed by the sharer is not stored. Links expire after a chosen window and contain no tracking pixels.
Acceptance:
- Link previews reveal only the public title and a generic image.
- No sharer text is stored server-side.
- Abuse is rate-limited.
Depends on: PLAT-027.
Risks / not doing: sharing as a growth loop that pushes people. No prompts.

### Community and user content

### PLAT-031 · UGC storage and processing pipeline
Priority P2 · Phase S3 · Status new · Pillars: all
Why: [R5 §5.5] names consent, image rights and metadata risks. Photos carry location data. MISSION sets "no public child images".
What: uploads go to a private R2 bucket in quarantine. The server strips metadata and re-encodes images. Uploads are checked against known-bad hash lists through a provider (verify availability). The original is kept for moderation for a short, stated window.
Acceptance:
- No public URL exists until approval.
- A test confirms that location metadata is removed.
- Child faces are routed to human review and never auto-published.
- Deletion removes the file and every derivative within a stated time.
Depends on: [community](11-community-ugc.md) decisions; PLAT-003.
Risks / not doing: legal duties under the EU Digital Services Act and UK Online Safety Act ([R5 §5.5] flags both; verify with counsel). Do not launch uploads before counsel review.

### PLAT-032 · Moderation queue, SLA and audit log
Priority P2 · Phase S3 · Status new · Pillars: all
Why: [R5 §5.5] says a report path and a response standard are needed.
What: a queue with states, reviewer roles, response targets (proposed: same-day for safety reports), an audit log of every decision, and an appeal path.
Acceptance:
- Every state transition is logged with the reviewer and time.
- Response times feed the metrics ([metrics](17-metrics-and-evidence.md)).
- Reviewers see only the content they need.
Depends on: PLAT-031.
Risks / not doing: reviewer wellbeing. Limit exposure and rotate duties.

### Partners and open data

### PLAT-033 · Read-only open data feed
Priority P2 · Phase S3 · Status new · Pillars: all
Why: libraries, schools and care settings need stable data to print and share ([R5 §4]). Search and AI indexers read structured data.
What: a versioned JSON feed of `indexed` activities by locale, with stable IDs, schema version, ETag and a changelog. The license is a maintainer decision (for example a Creative Commons option, to be chosen with counsel).
Acceptance:
- The feed contains only `indexed` pairs.
- Reviewer data is limited to what the public page shows.
- A feed change is announced in the changelog before breaking changes.
Depends on: PLAT-001, PLAT-014; a license decision.
Risks / not doing: a license that blocks partner use. Do not publish a feed before the license is chosen.

### Offline and the web-app contract

### PLAT-034 · Website offline reading
Priority P1 · Phase S2 · Status new · Pillars: all
Why: MISSION requires low-bandwidth use. The app already works offline; the website does not. [R2 §5] (CBeebies Learn works offline) and [R1 §3] (printable templates) point to offline cards and printables as the shared pattern.
What: a service worker caches the activity card, print pages and the finder shell after a first visit. The cache is versioned by content hash. An update is shown as a quiet notice, not a modal.
Acceptance:
- A previously viewed card and its print view load offline (tested with Playwright offline mode).
- A new version replaces the cache without a stale-version trap.
- The service worker can be removed by a documented step.
- The CSP permits the worker and nothing wider.
Depends on: PLAT-015, PLAT-019.
Risks / not doing: printed copies that look current when they are not. The version footer covers that.

### PLAT-035 · One content contract for web and app
Priority P1 · Phase S2 · Status new · Pillars: all
Why: the app has its own picture packs and content. Two copies of an activity will drift. VISION says one activity can carry many adaptations.
What: one JSON schema generated from the same source as the site. The app receives a generated bundle per release with the same IDs, statuses and review data.
Acceptance:
- A content diff reports which surfaces change.
- The app bundle is built from the same IDs as the site.
- Translation status is shared.
Depends on: PLAT-001, PLAT-004.
Risks / not doing: app release cycles are slower than web. Keep the app bundle small and versioned.

### Performance, testing and operations

### PLAT-036 · Performance budgets gated in CI
Priority P0 · Phase S2 · Status partial · Pillars: all
Why: DESIGN §7 sets LCP ≤ 2.5 s, INP ≤ 200 ms and CLS ≤ 0.1 at the 75th percentile as engineering targets. The web performance rules (`rules/web/performance.md`) set JavaScript and CSS budgets by page type: landing 150 kB and 30 kB, app pages 300 kB and 50 kB, microsites 80 kB and 15 kB, all gzipped for JavaScript.
What: CI measures bundle and CSS size for each template (activity, hub, finder, games, print), and runs Lighthouse CI on representative pages at four widths. A regression past budget fails the build.
Acceptance:
- A budget table lives in the repo.
- A fixture page over budget fails.
- Real-user results (PLAT-040, [metrics](17-metrics-and-evidence.md)) are compared with these targets.
Depends on: none.
Risks / not doing: games exceeding budget. Set a budget per template, not one number for the site. Verify whether `check-site.mjs` already gates size.

### PLAT-037 · Visual regression at standard widths
Priority P0 · Phase S2 · Status new · Pillars: all
Why: the testing rules require screenshots at 320, 768, 1024 and 1440 pixels for key templates. The site is light-only today ([site/README.md]), so dark-theme snapshots are not needed yet.
What: Playwright snapshots of the activity, hub, finder, print and game templates, plus key states (filters open, error, empty results).
Acceptance:
- Diffs are reviewed in the pull request.
- Tests are deterministic: fonts pinned, animations off, no timers.
- The flake rate stays under a target set after the first month.
Depends on: none.
Risks / not doing: font rendering differences between machines. Run in one fixed container.

### PLAT-038 · Accessibility automation and assistive-technology gates
Priority P0 · Phase S2 · Status partial · Pillars: all
Why: DESIGN §6 and [R5 §5.4] set WCAG 2.2 AA as the minimum. The baseline says axe runs on key pages. Automation finds only part of the problem.
What: axe on every template and every new hub and activity in CI. Keyboard-path test for the finder. Reduced-motion test. Contrast check of every token pairing. A per-release manual check with VoiceOver, TalkBack and NVDA, run with users where possible.
Acceptance:
- No serious or critical axe violations on any template.
- The manual checklist is signed for each release, with the testers' tools and versions.
- Failures from testers become regression tests.
Depends on: PLAT-037.
Risks / not doing: treating a clean scan as proof. Say in reports that scans are necessary and insufficient ([metrics](17-metrics-and-evidence.md)).

### PLAT-039 · Print and i18n tests
Priority P1 · Phase S2 · Status new · Pillars: all
Why: print is a product path (DESIGN §4B). Multilingual pages can break through missing hreflang pairs, long strings or missing right-to-left support ([R5 §2.3]).
What: print emulation snapshots for each template, with no navigation and no color dependency. PDF page-count check (PLAT-019). Reciprocal hreflang check. Right-to-left layout check once an RTL language is `indexed`. A long-string test with translated samples.
Acceptance:
- A missing hreflang pair fails the build.
- An activity card prints to one page in A4 and US Letter.
- Long-string samples do not overflow.
Depends on: PLAT-014, PLAT-019.
Risks / not doing: RTL testing before any RTL language is reviewed. Gate it to S3.

### PLAT-040 · Observability, uptime, broken links and cost guardrails
Priority P1 · Phase S2 · Status partial · Pillars: all
Why: `wrangler.jsonc` disables observability, and `check:live` runs only after a deploy. Costs are not tracked against a budget.
What: uptime checks on key URLs. A scheduled broken-link check. Aggregate 404 and 5xx counts from platform analytics (no IP addresses kept by the team). A deploy log. A monthly cost review with an alert threshold set by the maintainer. Backups of the content repo and the R2 masters.
Acceptance:
- A drill confirms an alert reaches the maintainer.
- A dashboard shows uptime, 404 and 5xx counts, broken links and cost.
- Backups are restored once as a test.
Depends on: none.
Risks / not doing: alert fatigue. Alert only on thresholds that need action. Cost items to track: request volume, asset requests, R2 storage and operations, image processing, build minutes and any translation or review fees. No cost figures are set here; the cost model is written when real numbers exist.

---

## 5. Items at a glance

| ID | Item | P | Phase | Status |
|---|---|---|---|---|
| PLAT-001 | Stable entity IDs | P0 | S1 | partial |
| PLAT-002 | Variations as records | P1 | S2 | new |
| PLAT-003 | Media records and rights log | P0 | S1 | new |
| PLAT-004 | Translation records with hashes | P0 | S2 | partial |
| PLAT-005 | Review records | P0 | S1 | partial |
| PLAT-006 | Source records and claim links | P1 | S1 | partial |
| PLAT-007 | Versions and corrections | P1 | S2 | new |
| PLAT-008 | URL policy and redirects | P1 | S1 | partial |
| PLAT-009 | Git-first editorial flow | P0 | S1 | exists |
| PLAT-010 | Editorial states and queue | P1 | S2 | new |
| PLAT-011 | One validation command | P0 | S1 | partial |
| PLAT-012 | Staleness queue | P1 | S2 | new |
| PLAT-013 | Partitioned, incremental builds | P0 | S2 | new |
| PLAT-014 | Publishing state per pair | P0 | S1 | partial |
| PLAT-015 | Hosting capacity check at 10× | P0 | S2 | new |
| PLAT-016 | On-demand long tail | P2 | S4 | new |
| PLAT-017 | Image pipeline | P0 | S1 | new |
| PLAT-018 | Step photos and captions | P1 | S1 | new |
| PLAT-019 | Print cards and PDFs | P1 | S2 | new |
| PLAT-020 | Video with captions | P2 | S3 | new |
| PLAT-021 | Finder index shards | P0 | S1 | partial |
| PLAT-022 | Site-wide static search | P1 | S2 | new |
| PLAT-023 | Server search at scale | P3 | S4 | new |
| PLAT-024 | Event dictionary and payload rules | P0 | S1 | partial |
| PLAT-025 | App has no analytics SDK | P0 | S1 | exists |
| PLAT-026 | Consent, GPC and retention | P0 | S2 | new |
| PLAT-027 | Aggregate "We tried this" counters | P1 | S2 | new |
| PLAT-028 | Optional account (gated) | P3 | S4 | new |
| PLAT-029 | End-to-end sync of saved items | P2 | S3 | new |
| PLAT-030 | Share links without personal data | P2 | S3 | new |
| PLAT-031 | UGC storage and processing | P2 | S3 | new |
| PLAT-032 | Moderation queue | P2 | S3 | new |
| PLAT-033 | Read-only open data feed | P2 | S3 | new |
| PLAT-034 | Website offline reading | P1 | S2 | new |
| PLAT-035 | One content contract | P1 | S2 | new |
| PLAT-036 | Performance budgets in CI | P0 | S1 | partial |
| PLAT-037 | Visual regression | P0 | S1 | new |
| PLAT-038 | Accessibility gates | P0 | S1 | partial |
| PLAT-039 | Print and i18n tests | P1 | S1 | new |
| PLAT-040 | Observability and cost guardrails | P1 | S1 | partial |

Counts: 40 items. P0 17 (001, 003, 004, 005, 009, 011, 013, 014, 015, 017, 021, 024, 025, 026, 036, 037, 038). P1 14. P2 7 (016, 020, 029, 030, 031, 032, 033). P3 2 (023, 028).

## Open questions

1. **Editorial tool.** Which Git-based or headless CMS, if any, is chosen at the PLAT-010 gate? Evaluate after the first external reviewer joins.
2. **Platform limits.** What are the current Workers Static Assets limits for file count, file size, deploy size and redirect rules? PLAT-008 and PLAT-015 depend on them.
3. **Image masters.** Repo or R2 for masters (PLAT-017)? Repo keeps review simple; R2 keeps the repo small.
4. **Analytics beyond GA4.** Is a first-party aggregate counter (PLAT-027) worth a new server component? This needs a maintainer decision.
5. **Consent.** Does counsel require consent-mode configuration for EEA and UK visitors (PLAT-026), and does the answer change before any EU-targeted launch?
6. **Discrepancy.** Is `workers_dev` on or off? `wrangler.jsonc` and `site/README.md` disagree.
7. **Open data license.** Which license for the feed (PLAT-033)? Partners need to know before they build on it.
8. **Gated boundaries.** Accounts, sync, uploads and payments stay out of scope until the maintainer decides, as set in `product.md` and the plan. This file does not lift any of them.
